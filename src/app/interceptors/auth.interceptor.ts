import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

/**
 * Interceptor HTTP que inyecta automáticamente el token JWT de Keycloak
 * en todas las peticiones salientes.
 * 
 * También maneja el refresh del token si está por expirar.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // No interceptar peticiones a Keycloak (para evitar loops infinitos)
  if (req.url.includes('/realms/') || req.url.includes('/protocol/openid-connect')) {
    return next(req);
  }
  
  const token = authService.getToken();
  
  // Si no hay token, continuar sin modificar la petición
  if (!token) {
    return next(req);
  }
  
  // Verificar si el token está por expirar y refrescarlo si es necesario
  if (authService.isTokenExpiringSoon()) {
    return authService.refreshAccessToken().pipe(
      switchMap(() => {
        // Después de refrescar, obtener el nuevo token y clonar la petición
        const newToken = authService.getToken();
        const clonedReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${newToken}`
          }
        });
        return next(clonedReq);
      }),
      catchError(error => {
        // Si falla el refresh, logout y continuar con la petición original
        console.error('Failed to refresh token:', error);
        authService.logout();
        return next(req);
      })
    );
  }
  
  // Token válido - clonar petición y agregar header Authorization
  const clonedReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return next(clonedReq);
};
