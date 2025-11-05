import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvironmentService } from './environment.service';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  constructor(
    private http: HttpClient,
    private env: EnvironmentService
  ) {}

  // Ejemplo de uso de las variables de entorno
  login(credentials: LoginRequest): Observable<LoginResponse> {
    const url = this.env.getApiEndpoint('/auth/login');
    this.env.log('Login request to:', url);
    
    return this.http.post<LoginResponse>(url, credentials);
  }

  register(userData: any): Observable<any> {
    const url = this.env.getApiEndpoint('/auth/register');
    this.env.log('Register request to:', url);
    
    return this.http.post(url, userData);
  }

  getUserProfile(): Observable<any> {
    const url = this.env.getApiEndpoint('/user/profile');
    this.env.log('Get profile request to:', url);
    
    return this.http.get(url);
  }
}
