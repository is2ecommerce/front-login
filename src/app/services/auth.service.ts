import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { EnvironmentService } from './environment.service';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface KeycloakTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
  'not-before-policy': number;
  session_state: string;
  scope: string;
}

export interface UserInfo {
  sub: string;              // User ID
  email_verified: boolean;
  name?: string;
  preferred_username: string;
  given_name?: string;
  family_name?: string;
  email: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserInfo | null;
  token: string | null;
  refreshToken: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http: HttpClient;
  private env: EnvironmentService;
  
  // URLs de Keycloak
  private keycloakUrl = environment.keycloak.url;
  private realm = environment.keycloak.realm;
  private clientId = environment.keycloak.clientId;
  
  // Estado de autenticación reactivo
  private authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    refreshToken: null
  });
  
  public authState$ = this.authStateSubject.asObservable();

  constructor(http: HttpClient, env: EnvironmentService) {
    this.http = http;
    this.env = env;
    // Restaurar sesión si existe token en localStorage
    this.restoreSession();
  }

  /**
   * Login usando Direct Access Grant de Keycloak
   * Valida credenciales contra la base de datos interna de Keycloak
   */
  login(username: string, password: string): Observable<AuthState> {
    const tokenUrl = `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/token`;
    
    // Keycloak espera application/x-www-form-urlencoded
    const body = new URLSearchParams();
    body.set('grant_type', 'password');
    body.set('client_id', this.clientId);
    body.set('username', username);
    body.set('password', password);
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    this.env.log('Authenticating with Keycloak:', { username, tokenUrl });

    return this.http.post<KeycloakTokenResponse>(tokenUrl, body.toString(), { headers }).pipe(
      tap(response => {
        this.env.log('Keycloak login successful:', response);
        
        // Guardar tokens en localStorage
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
        localStorage.setItem('token_expiry', String(Date.now() + (response.expires_in * 1000)));
      }),
      // Obtener información del usuario después de login exitoso
      map(response => this.getUserInfoFromToken(response.access_token)),
      catchError(error => {
        this.env.log('Keycloak login error:', error);
        return throwError(() => new Error(this.parseKeycloakError(error)));
      })
    );
  }

  /**
   * Obtiene la información del usuario desde Keycloak
   */
  getUserInfo(): Observable<UserInfo> {
    const userInfoUrl = `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/userinfo`;
    const token = this.getToken();
    
    if (!token) {
      return throwError(() => new Error('No authentication token found'));
    }
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<UserInfo>(userInfoUrl, { headers }).pipe(
      tap(userInfo => {
        this.env.log('User info retrieved:', userInfo);
        
        // Actualizar estado de autenticación
        this.authStateSubject.next({
          isAuthenticated: true,
          user: userInfo,
          token: token,
          refreshToken: this.getRefreshToken()
        });
      }),
      catchError(error => {
        this.env.log('Error getting user info:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Decodifica el JWT y extrae información básica del usuario
   * (método alternativo sin llamar al endpoint userinfo)
   */
  private getUserInfoFromToken(token: string): AuthState {
    try {
      // Decodificar el JWT (payload está en base64)
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      
      const userInfo: UserInfo = {
        sub: decodedPayload.sub,
        email_verified: decodedPayload.email_verified || false,
        name: decodedPayload.name,
        preferred_username: decodedPayload.preferred_username,
        given_name: decodedPayload.given_name,
        family_name: decodedPayload.family_name,
        email: decodedPayload.email || decodedPayload.preferred_username
      };
      
      const newState: AuthState = {
        isAuthenticated: true,
        user: userInfo,
        token: token,
        refreshToken: this.getRefreshToken()
      };
      
      this.authStateSubject.next(newState);
      return newState;
      
    } catch (error) {
      this.env.log('Error decoding token:', error);
      throw new Error('Invalid token format');
    }
  }

  /**
   * Refresca el access token usando el refresh token
   */
  refreshAccessToken(): Observable<KeycloakTokenResponse> {
    const tokenUrl = `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/token`;
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }
    
    const body = new URLSearchParams();
    body.set('grant_type', 'refresh_token');
    body.set('client_id', this.clientId);
    body.set('refresh_token', refreshToken);
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post<KeycloakTokenResponse>(tokenUrl, body.toString(), { headers }).pipe(
      tap(response => {
        this.env.log('Token refreshed successfully');
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
        localStorage.setItem('token_expiry', String(Date.now() + (response.expires_in * 1000)));
        
        // Actualizar estado con nuevo token
        this.getUserInfoFromToken(response.access_token);
      }),
      catchError(error => {
        this.env.log('Error refreshing token:', error);
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * Cierra sesión del usuario
   */
  logout(): void {
    this.env.log('Logging out user');
    
    // Limpiar localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expiry');
    
    // Resetear estado de autenticación
    this.authStateSubject.next({
      isAuthenticated: false,
      user: null,
      token: null,
      refreshToken: null
    });
    
    // Opcionalmente, llamar al endpoint de logout de Keycloak
    // this.logoutFromKeycloak();
  }

  /**
   * Logout en Keycloak (opcional - invalida el token en el servidor)
   */
  private logoutFromKeycloak(): void {
    const logoutUrl = `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/logout`;
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) return;
    
    const body = new URLSearchParams();
    body.set('client_id', this.clientId);
    body.set('refresh_token', refreshToken);
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    this.http.post(logoutUrl, body.toString(), { headers }).subscribe({
      next: () => this.env.log('Logged out from Keycloak'),
      error: (err) => this.env.log('Error logging out from Keycloak:', err)
    });
  }

  /**
   * Restaura la sesión si hay un token válido en localStorage
   */
  private restoreSession(): void {
    const token = this.getToken();
    const expiry = localStorage.getItem('token_expiry');
    
    if (token && expiry) {
      const expiryTime = parseInt(expiry, 10);
      
      // Verificar si el token no ha expirado
      if (Date.now() < expiryTime) {
        this.env.log('Restoring session from localStorage');
        this.getUserInfoFromToken(token);
      } else {
        this.env.log('Token expired, attempting refresh');
        // Intentar refrescar el token
        this.refreshAccessToken().subscribe({
          error: () => this.logout()
        });
      }
    }
  }

  /**
   * Verifica si el token está por expirar (dentro de 5 minutos)
   */
  isTokenExpiringSoon(): boolean {
    const expiry = localStorage.getItem('token_expiry');
    if (!expiry) return true;
    
    const expiryTime = parseInt(expiry, 10);
    const fiveMinutes = 5 * 60 * 1000;
    
    return Date.now() > (expiryTime - fiveMinutes);
  }

  /**
   * Obtiene el access token del localStorage
   */
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Obtiene el refresh token del localStorage
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated && !!this.getToken();
  }

  /**
   * Obtiene el usuario actual
   */
  getCurrentUser(): UserInfo | null {
    return this.authStateSubject.value.user;
  }

  /**
   * Parsea errores de Keycloak para mostrar mensajes amigables
   */
  private parseKeycloakError(error: any): string {
    if (error.error?.error_description) {
      return error.error.error_description;
    }
    
    if (error.status === 401) {
      return 'Usuario o contraseña incorrectos';
    }
    
    if (error.status === 400) {
      return 'Credenciales inválidas';
    }
    
    if (error.status === 0) {
      return 'No se puede conectar con el servidor de autenticación';
    }
    
    return 'Error al iniciar sesión. Intenta nuevamente.';
  }

  // Métodos legacy para compatibilidad con código existente
  register(userData: any): Observable<any> {
    const url = this.env.getApiEndpoint('/auth/register');
    this.env.log('Register request to:', url);
    return this.http.post(url, userData);
  }

  getUserProfile(): Observable<any> {
    return this.getUserInfo();
  }
}
