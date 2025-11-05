# Configuración de Variables de Entorno

## Resumen

Este proyecto usa un sistema de configuración de entornos para Angular que te permite manejar diferentes configuraciones para desarrollo y producción.

## Archivos Creados

```
front-login/
├── .env                          # Variables de entorno locales (NO subir a git)
├── .env.example                  # Plantilla de variables de entorno
├── src/
│   ├── environments/
│   │   ├── environment.ts        # Configuración de desarrollo
│   │   └── environment.prod.ts   # Configuración de producción
│   └── app/
│       └── services/
│           ├── environment.service.ts  # Servicio para acceder a variables
│           └── auth.service.ts         # Ejemplo de uso con HTTP
```

## Inicio Rápido

### 1. Configurar variables locales

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar con tus valores
notepad .env  # En Windows
# o
nano .env     # En Linux/Mac
```

### 2. Variables disponibles

Edita `.env` con tus configuraciones:

```env
# URL del API Backend (cambia según tu backend)
API_URL=http://localhost:3000/api

# Puerto para el servidor SSR
PORT=4000

# Nombre de la aplicación
APP_NAME="Front Login Profile - Dev"

# Entorno
NODE_ENV=development
```

## Configuración por Entorno

### Desarrollo (`environment.ts`)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  appName: 'Front Login Profile - Dev',
  enableDebug: true,
  version: '1.0.0'
};
```

### Producción (`environment.prod.ts`)

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.tudominio.com/api',  // Cambiar por tu API real
  appName: 'Front Login Profile',
  enableDebug: false,
  version: '1.0.0'
};
```

## Uso en el Código

### Importar el servicio

```typescript
import { EnvironmentService } from './services/environment.service';

export class MiComponente {
  constructor(private env: EnvironmentService) {}
  
  obtenerDatos() {
    // Obtener URL del API
    const apiUrl = this.env.apiUrl;
    
    // Obtener endpoint completo
    const endpoint = this.env.getApiEndpoint('/users');
    // Resultado: http://localhost:3000/api/users
    
    // Logging condicional (solo en desarrollo)
    this.env.log('Este mensaje solo aparece en desarrollo');
    
    // Verificar si estamos en producción
    if (this.env.production) {
      console.log('Modo producción activado');
    }
  }
}
```

### Ejemplo con HTTP (AuthService)

```typescript
import { AuthService } from './services/auth.service';

export class LoginComponent {
  constructor(private authService: AuthService) {}
  
  login() {
    this.authService.login({
      email: 'user@example.com',
      password: '12345'
    }).subscribe({
      next: (response) => console.log('Login exitoso', response),
      error: (error) => console.error('Error en login', error)
    });
  }
}
```

## Comandos de Build

### Desarrollo

```bash
# Servidor de desarrollo (usa environment.ts)
ng serve

# Build de desarrollo
ng build
```

### Producción

```bash
# Build de producción (usa environment.prod.ts)
ng build --configuration=production

# El build resultante estará en dist/
```

## Docker

### Variables de entorno en Docker

Para pasar variables en Docker, usa el flag `-e`:

```bash
# Desarrollo
docker run -e API_URL=http://api.dev.com/api -p 4200:4200 front-login-profile:dev

# Producción
docker run -e PORT=8080 -e API_URL=https://api.prod.com/api -p 8080:8080 front-login-profile:latest
```

### Archivo docker-compose.yml (ejemplo)

```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "4000:4000"
    environment:
      - API_URL=http://backend:3000/api
      - PORT=4000
      - NODE_ENV=production
```

## Variables Configurables

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `API_URL` | URL base del backend | `http://localhost:3000/api` |
| `PORT` | Puerto del servidor SSR | `4000` |
| `APP_NAME` | Nombre de la aplicación | `"Front Login Profile"` |
| `NODE_ENV` | Entorno de ejecución | `development` / `production` |

## Importante

### Seguridad

- **NUNCA** subas el archivo `.env` a Git
- El archivo `.env` ya está en `.gitignore`
- Comparte `.env.example` con tu equipo
- No pongas tokens o secretos en `environment.ts` o `environment.prod.ts`

### Para producción

1. **Actualiza `environment.prod.ts`** con tu URL de producción:
   ```typescript
   apiUrl: 'https://api.tudominio.com/api'  // Cambiar esto
   ```

2. **Usa variables de entorno del servidor** para valores sensibles

3. **Verifica el build de producción**:
   ```bash
   ng build --configuration=production
   ```

## Troubleshooting

### El API no responde

Verifica que la URL del API esté correcta:
```typescript
console.log(this.env.apiUrl);  // Debe mostrar la URL correcta
```

### Variables no se actualizan

1. Detén el servidor (`Ctrl+C`)
2. Elimina caché: `rm -rf .angular/cache`
3. Reinicia: `ng serve`

### Error de CORS

Si ves errores de CORS, configura un proxy en `angular.json` o ajusta el backend para permitir el origen del frontend.

## Recursos

- [Angular Environments](https://angular.dev/tools/cli/environments)
- [Angular HttpClient](https://angular.dev/guide/http)
- [Variables de Entorno en Node.js](https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs)

## Contribuir

Al agregar nuevas variables de entorno:

1. Agrégalas a `.env.example`
2. Actualiza `environment.ts` y `environment.prod.ts`
3. Documenta su uso en este archivo
4. Actualiza el `EnvironmentService` si es necesario
