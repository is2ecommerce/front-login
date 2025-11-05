# Quick Start - Front Login Profile

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm start
# o
npm run dev
```

**URL:** http://localhost:4200

## Producción

### Build

```bash
npm run build:prod
```

### Servir el build (SSR)

```bash
npm run serve:ssr:front-login-profile
```

**URL:** http://localhost:4000

## Configuración de Variables

### Desarrollo

Edita `.env`:

```env
API_URL=http://localhost:8080/api
PORT=4000
```

### Producción

Edita `src/environments/environment.prod.ts`:

```typescript
apiUrl: 'https://tu-api-produccion.com/api'
```

## Verificar Configuración

En la consola del navegador (F12):

```typescript
// Los logs de desarrollo aparecerán automáticamente
// Busca mensajes como:
// "Login attempt with: {...}"
// "Cargando usuario desde: http://localhost:8080/api/usuarios/1"
```

## Rutas Disponibles

- `/` - Página de inicio → Redirige a `/login`
- `/login` - Página de inicio de sesión
- `/register` - Página de registro
- `/profile` - Perfil de usuario

## Estructura de Variables de Entorno

```
.env                          → Variables locales (no subir a Git)
src/environments/
  ├── environment.ts          → Desarrollo (ng serve)
  └── environment.prod.ts     → Producción (ng build --configuration=production)
```

## Documentación Completa

- `PASOS_COMPLETADOS.md` - Resumen de todos los cambios realizados
- `CONFIGURACION_VARIABLES.md` - Guía detallada de configuración
- `README.md` - Documentación general del proyecto

## Troubleshooting

### Backend no responde

Verifica que tu backend esté corriendo en el puerto configurado (8080 por defecto).

### Cambios no se reflejan

```bash
# Detén el servidor (Ctrl+C)
# Limpia la caché
rm -rf .angular/cache
# Reinicia
npm start
```

### Error de política de ejecución (PowerShell)

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

## Docker

### Desarrollo

```bash
docker build -f Dockerfile.dev -t front-login:dev .
docker run -p 4200:4200 front-login:dev
```

### Producción

```bash
docker build -t front-login:prod .
docker run -p 4000:4000 front-login:prod
```

---

**Listo para empezar**
