# Integración de Login Personalizado con Keycloak

Esta guía explica cómo configurar Keycloak para usar **front-login** como interfaz de autenticación personalizada en lugar de la interfaz estándar de Keycloak.

## 🎯 Objetivo

- Usar **front-login** (Angular) como interfaz de login personalizada
- Validar credenciales contra la **base de datos interna de Keycloak**
- Redirigir al **catálogo** después del login exitoso
- **NO** usar la interfaz UI de Keycloak

## 🏗️ Arquitectura

```
┌─────────────────┐
│   Usuario       │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│  front-login        │ (Interfaz de Login Personalizada)
│  Angular - :3000    │
└────────┬────────────┘
         │ POST /token (username + password)
         ▼
┌─────────────────────┐
│   KEYCLOAK          │ (Validación de Credenciales)
│   Puerto: 8080      │
│   Realm: ecommerce  │
└────────┬────────────┘
         │ JWT Token
         ▼
┌─────────────────────┐
│   Catálogo          │ (Aplicación Principal)
│   front-catalog     │
│   Puerto: 4200      │
└─────────────────────┘
```

## ⚙️ Configuración de Keycloak

### 1. Levantar Keycloak

```powershell
cd c:\Github\identity-server
docker-compose up -d
```

**Verificar que esté corriendo**:
```powershell
curl http://localhost:8080
```

### 2. Acceder a Keycloak Admin Console

- URL: http://localhost:8080/admin
- Usuario: `admin`
- Password: `admin`

### 3. Crear Realm "ecommerce"

1. Click en el dropdown del realm (arriba izquierda)
2. Click en "Create Realm"
3. Nombre: `ecommerce`
4. Click "Create"

### 4. Crear Cliente para Frontend

1. Ir a **Clients** → **Create client**

2. **General Settings**:
   - Client type: `OpenID Connect`
   - Client ID: `frontend-client`
   - Click "Next"

3. **Capability config**:
   - Client authentication: `OFF` (público)
   - Authorization: `OFF`
   - Authentication flow:
     - ✅ **Direct access grants** (IMPORTANTE - permite Resource Owner Password Credentials)
     - ✅ Standard flow
     - ❌ Implicit flow
     - ❌ Service accounts roles
   - Click "Next"

4. **Login settings**:
   - Valid redirect URIs: 
     - `http://localhost:3000/*` (front-login)
     - `http://localhost:4200/*` (catálogo)
   - Valid post logout redirect URIs:
     - `http://localhost:3000/*`
     - `http://localhost:4200/*`
   - Web origins: 
     - `http://localhost:3000`
     - `http://localhost:4200`
   - Click "Save"

### 5. Crear Usuario de Prueba

1. Ir a **Users** → **Create new user**

2. **Datos del usuario**:
   - Username: `testuser`
   - Email: `test@example.com`
   - First name: `Test`
   - Last name: `User`
   - Email verified: `ON`
   - Enabled: `ON`
   - Click "Create"

3. **Configurar contraseña**:
   - Ir a la pestaña **Credentials**
   - Click "Set password"
   - Password: `password123`
   - Temporary: `OFF`
   - Click "Save"

## 🚀 Configuración del Frontend

### 1. Configurar Variables de Entorno

**front-login** (`src/environments/environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  keycloak: {
    url: 'http://localhost:8080',
    realm: 'ecommerce',
    clientId: 'frontend-client'
  },
  catalogUrl: 'http://localhost:4200'  // URL del catálogo
};
```

### 2. Instalar Dependencias

```powershell
cd c:\Github\front-login
npm install
```

### 3. Levantar el Frontend de Login

```powershell
npm start
```

El frontend estará disponible en: http://localhost:3000

## 🔐 Flujo de Autenticación

### 1. Login con Credenciales

El usuario ingresa sus credenciales en **front-login**:

```typescript
// Componente de Login
onSubmit() {
  this.authService.login(this.email(), this.password()).subscribe({
    next: (authState) => {
      // Redirigir al catálogo
      window.location.href = environment.catalogUrl;
    },
    error: (error) => {
      this.errorMessage.set(error.message);
    }
  });
}
```

### 2. Validación en Keycloak (Direct Access Grant)

El `AuthService` hace una petición POST a Keycloak:

```http
POST http://localhost:8080/realms/ecommerce/protocol/openid-connect/token
Content-Type: application/x-www-form-urlencoded

grant_type=password
&client_id=frontend-client
&username=testuser
&password=password123
```

**Respuesta exitosa**:
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI...",
  "expires_in": 300,
  "refresh_expires_in": 1800,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI...",
  "token_type": "Bearer",
  "session_state": "abc123...",
  "scope": "email profile"
}
```

### 3. Almacenamiento del Token

```typescript
// AuthService guarda los tokens en localStorage
localStorage.setItem('access_token', response.access_token);
localStorage.setItem('refresh_token', response.refresh_token);
localStorage.setItem('token_expiry', Date.now() + (response.expires_in * 1000));
```

### 4. Redirección al Catálogo

Después del login exitoso, el usuario es redirigido a la aplicación de catálogo con el token JWT almacenado.

### 5. Peticiones Autenticadas

El **interceptor HTTP** inyecta automáticamente el token en todas las peticiones:

```typescript
// Interceptor HTTP
const clonedReq = req.clone({
  setHeaders: {
    Authorization: `Bearer ${token}`
  }
});
```

## 🧪 Probar la Integración

### 1. Verificar Keycloak

```powershell
# Obtener configuración del realm
curl http://localhost:8080/realms/ecommerce/.well-known/openid-configuration
```

### 2. Probar Login con cURL

```powershell
curl -X POST http://localhost:8080/realms/ecommerce/protocol/openid-connect/token `
  -H "Content-Type: application/x-www-form-urlencoded" `
  -d "grant_type=password&client_id=frontend-client&username=testuser&password=password123"
```

**Respuesta esperada**: JSON con `access_token` y `refresh_token`.

### 3. Probar en el Navegador

1. Abrir http://localhost:3000/login
2. Ingresar:
   - Email/Username: `testuser`
   - Password: `password123`
3. Click "Iniciar sesión"
4. Debe redirigir a http://localhost:4200 (catálogo)
5. Verificar en DevTools → Application → Local Storage:
   - `access_token`
   - `refresh_token`
   - `token_expiry`

## 🔄 Refresh de Tokens

El AuthService refresca automáticamente los tokens cuando están por expirar:

```typescript
// Verifica si el token expira en menos de 5 minutos
if (authService.isTokenExpiringSoon()) {
  authService.refreshAccessToken().subscribe();
}
```

**Petición de refresh**:
```http
POST http://localhost:8080/realms/ecommerce/protocol/openid-connect/token
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token
&client_id=frontend-client
&refresh_token=eyJhbGciOiJIUzI1NiIsInR5cCI...
```

## 🔐 Integración con Backend (Shopping Cart)

El backend de Spring Boot valida automáticamente el JWT de Keycloak:

**application.yml**:
```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:8080/realms/ecommerce
```

**Extracción del userId**:
```java
UUID userId = Tools.extractUserId(jwt);  // Extrae 'sub' claim del JWT
```

## 📋 Checklist de Verificación

- [ ] Keycloak corriendo en puerto 8080
- [ ] Realm `ecommerce` creado
- [ ] Cliente `frontend-client` configurado con Direct Access Grants
- [ ] Usuario de prueba creado y con contraseña configurada
- [ ] front-login configurado con variables de entorno correctas
- [ ] front-login corriendo en puerto 3000
- [ ] Login exitoso redirige a catálogo (puerto 4200)
- [ ] Token JWT almacenado en localStorage
- [ ] Peticiones al backend incluyen header `Authorization`

## 🛠️ Troubleshooting

### Error: "Invalid user credentials"
**Solución**: 
- Verificar que el usuario existe en Keycloak
- Confirmar que la contraseña no sea temporal
- Revisar que el usuario esté habilitado

### Error: "unauthorized_client"
**Solución**:
- Verificar que Direct Access Grants esté habilitado en el cliente
- Confirmar que el `client_id` sea correcto

### Error: "CORS policy"
**Solución**:
- Agregar `http://localhost:3000` en "Web Origins" del cliente Keycloak

### Error: No redirige al catálogo
**Solución**:
- Verificar `environment.catalogUrl` en `environment.ts`
- Confirmar que el catálogo esté corriendo en el puerto configurado

### Token no se inyecta en peticiones
**Solución**:
- Verificar que el interceptor esté registrado en `app.config.ts`
- Revisar que `provideHttpClient()` esté configurado con `withInterceptors([authInterceptor])`

## 📚 Archivos Clave

```
front-login/
├── src/
│   ├── app/
│   │   ├── services/
│   │   │   └── auth.service.ts          ✨ Maneja login con Keycloak
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts      ✨ Inyecta JWT automáticamente
│   │   ├── pages/
│   │   │   └── login/
│   │   │       ├── login.ts             ✅ Integrado con AuthService
│   │   │       ├── login.html           ✅ Muestra errores
│   │   │       └── login.css            ✅ Estilos para errores
│   │   └── app.config.ts                ✅ Registra interceptor
│   └── environments/
│       ├── environment.ts               ✨ Config Keycloak desarrollo
│       └── environment.prod.ts          ✨ Config Keycloak producción

identity-server/
└── docker-compose.yml                   🐳 Levanta Keycloak + PostgreSQL
```

## 🎉 Siguiente Paso

Una vez que el login funcione correctamente:

1. **Configurar Guards de Ruta** para proteger rutas en el catálogo
2. **Agregar Logout** en el header de la aplicación
3. **Implementar Registro** conectado a Keycloak Admin API
4. **Configurar Roles** en Keycloak para permisos granulares

## 📖 Referencias

- [Keycloak Documentation - Resource Owner Password Credentials](https://www.keycloak.org/docs/latest/securing_apps/#_resource_owner_password_credentials_flow)
- [OAuth 2.0 Password Grant](https://oauth.net/2/grant-types/password/)
- [Keycloak REST API](https://www.keycloak.org/docs-api/latest/rest-api/index.html)
