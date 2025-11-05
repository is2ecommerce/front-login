# Guía de Despliegue - Front Login Profile

## Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Despliegue en Desarrollo](#despliegue-en-desarrollo)
3. [Despliegue en Producción](#despliegue-en-producción)
4. [Despliegue con Docker](#despliegue-con-docker)
5. [Despliegue en Servicios en la Nube](#despliegue-en-servicios-en-la-nube)
6. [Variables de Entorno](#variables-de-entorno)
7. [Verificación Post-Despliegue](#verificación-post-despliegue)
8. [Troubleshooting](#troubleshooting)

---

## Requisitos Previos

### Software Necesario

- **Node.js**: v18.x o superior
- **npm**: v9.x o superior
- **Angular CLI**: v20.3.1 o superior
- **Git**: Para control de versiones

### Verificar Instalaciones

```bash
node --version
npm --version
ng version
```

### Clonar el Repositorio

```bash
git clone https://github.com/is2ecommerce/front-login.git
cd front-login
```

---

## Despliegue en Desarrollo

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

Copia el archivo de ejemplo y configura tus valores:

```bash
cp .env.example .env
```

Edita `.env`:

```env
API_URL=http://localhost:8080/api
PORT=4000
APP_NAME="Front Login Profile - Dev"
NODE_ENV=development
```

### 3. Verificar Configuración de Entorno

Edita `src/environments/environment.ts` si es necesario:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  appName: 'Front Login Profile - Dev',
  enableDebug: true,
  version: '1.0.0'
};
```

### 4. Iniciar Servidor de Desarrollo

```bash
npm start
```

La aplicación estará disponible en: `http://localhost:4200/`

### 5. Verificar Funcionamiento

- Abre `http://localhost:4200/` en tu navegador
- Verifica que la consola no muestre errores
- Prueba las rutas: `/login`, `/register`, `/profile`

---

## Despliegue en Producción

### 1. Configurar Variables de Producción

Edita `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.tudominio.com/api',  // URL de tu backend en producción
  appName: 'Front Login Profile',
  enableDebug: false,
  version: '1.0.0'
};
```

### 2. Ejecutar Build de Producción

```bash
npm run build:prod
```

Esto generará los archivos optimizados en `dist/front-login-profile/`

### 3. Verificar el Build

```bash
# Verificar que se generaron los archivos
ls -la dist/front-login-profile/browser/
```

### 4. Servir la Aplicación (SSR)

Si usas Server-Side Rendering:

```bash
npm run serve:ssr:front-login-profile
```

La aplicación estará disponible en: `http://localhost:4000/`

### 5. Servidor Web Estático (Sin SSR)

Si no necesitas SSR, puedes servir solo los archivos estáticos con:

**Usando Node.js y http-server:**

```bash
# Instalar http-server globalmente
npm install -g http-server

# Servir la aplicación
cd dist/front-login-profile/browser
http-server -p 8080
```

**Usando Nginx:**

Configuración en `/etc/nginx/sites-available/front-login`:

```nginx
server {
    listen 80;
    server_name tudominio.com;
    root /var/www/front-login/dist/front-login-profile/browser;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache estático
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Usando Apache:**

Configuración en `.htaccess`:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
```

---

## Despliegue con Docker

### 1. Build de Imagen Docker para Producción

```bash
docker build -t front-login-profile:latest .
```

### 2. Ejecutar Contenedor

```bash
docker run -d \
  --name front-login \
  -p 4000:4000 \
  -e API_URL=https://api.tudominio.com/api \
  -e PORT=4000 \
  front-login-profile:latest
```

### 3. Verificar Logs

```bash
docker logs front-login
```

### 4. Detener y Eliminar Contenedor

```bash
docker stop front-login
docker rm front-login
```

### Docker Compose

Crea un archivo `docker-compose.yml`:

```yaml
version: '3.8'

services:
  frontend:
    build: .
    container_name: front-login
    ports:
      - "4000:4000"
    environment:
      - API_URL=https://api.tudominio.com/api
      - PORT=4000
      - NODE_ENV=production
    restart: unless-stopped
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

Ejecutar:

```bash
docker-compose up -d
```

### Desarrollo con Docker

```bash
# Build imagen de desarrollo
docker build -f Dockerfile.dev -t front-login:dev .

# Ejecutar con live-reload
docker run -p 4200:4200 \
  -v "$(pwd)":/app \
  -v /app/node_modules \
  front-login:dev
```

---

## Despliegue en Servicios en la Nube

### Netlify

1. **Configurar netlify.toml:**

```toml
[build]
  command = "npm run build:prod"
  publish = "dist/front-login-profile/browser"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

2. **Desplegar:**

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

### Vercel

1. **Instalar Vercel CLI:**

```bash
npm install -g vercel
```

2. **Configurar vercel.json:**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist/front-login-profile/browser"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

3. **Desplegar:**

```bash
vercel --prod
```

### AWS S3 + CloudFront

1. **Build la aplicación:**

```bash
npm run build:prod
```

2. **Subir a S3:**

```bash
aws s3 sync dist/front-login-profile/browser/ s3://tu-bucket-name/ --delete
```

3. **Configurar S3 Bucket:**
   - Habilitar Static Website Hosting
   - Configurar index.html como documento de índice y error

4. **Configurar CloudFront:**
   - Crear distribución apuntando al bucket S3
   - Configurar error pages (404 → index.html)

### Azure Static Web Apps

1. **Crear archivo de workflow `.github/workflows/azure-static-web-apps.yml`:**

```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main

jobs:
  build_and_deploy_job:
    runs_on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          api_location: ""
          output_location: "dist/front-login-profile/browser"
```

### Google Cloud Platform (Firebase Hosting)

1. **Instalar Firebase CLI:**

```bash
npm install -g firebase-tools
```

2. **Inicializar Firebase:**

```bash
firebase login
firebase init hosting
```

3. **Configurar firebase.json:**

```json
{
  "hosting": {
    "public": "dist/front-login-profile/browser",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

4. **Desplegar:**

```bash
npm run build:prod
firebase deploy
```

---

## Variables de Entorno

### Variables Requeridas

| Variable | Desarrollo | Producción | Descripción |
|----------|-----------|------------|-------------|
| `API_URL` | `http://localhost:8080/api` | `https://api.tudominio.com/api` | URL del backend |
| `PORT` | `4000` | `4000` o según servidor | Puerto del servidor SSR |
| `NODE_ENV` | `development` | `production` | Entorno de ejecución |
| `APP_NAME` | `Front Login Profile - Dev` | `Front Login Profile` | Nombre de la aplicación |

### Configurar en Diferentes Plataformas

**Heroku:**
```bash
heroku config:set API_URL=https://api.tudominio.com/api
heroku config:set PORT=4000
```

**Netlify:**
- Site settings → Environment variables → Add variable

**Vercel:**
```bash
vercel env add API_URL
```

**Docker:**
```bash
docker run -e API_URL=https://api.tudominio.com/api -e PORT=4000 ...
```

---

## Verificación Post-Despliegue

### Checklist de Verificación

- [ ] La aplicación carga correctamente
- [ ] No hay errores en la consola del navegador
- [ ] Las rutas funcionan correctamente (`/login`, `/register`, `/profile`)
- [ ] La conexión con el backend funciona
- [ ] Los logs de producción están deshabilitados
- [ ] Los archivos estáticos se cargan correctamente
- [ ] El sitio es accesible desde diferentes navegadores
- [ ] El sitio funciona en dispositivos móviles
- [ ] Los certificados SSL están configurados (HTTPS)
- [ ] Las variables de entorno están correctamente configuradas

### Comandos de Verificación

```bash
# Verificar que el sitio responde
curl -I https://tudominio.com

# Verificar rutas de API
curl https://tudominio.com/api/health

# Verificar archivos estáticos
curl https://tudominio.com/assets/

# Probar con diferentes navegadores
# Chrome, Firefox, Safari, Edge
```

### Monitoreo

**Logs del Servidor:**
```bash
# Docker
docker logs -f front-login

# PM2
pm2 logs front-login

# Systemd
journalctl -u front-login -f
```

**Métricas:**
- Tiempo de carga de página
- Errores JavaScript
- Peticiones al API
- Tasa de conversión en formularios

---

## Troubleshooting

### Problema: Build falla con error de memoria

**Solución:**
```bash
# Aumentar memoria de Node.js
NODE_OPTIONS=--max_old_space_size=4096 npm run build:prod
```

### Problema: Error 404 en rutas al recargar

**Solución:**
Configurar el servidor para redirigir todas las rutas a `index.html`

**Nginx:**
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### Problema: Variables de entorno no se cargan

**Solución:**
- Verificar que el archivo `.env` existe (solo para desarrollo)
- En producción, usar `environment.prod.ts`
- Verificar que Angular CLI use la configuración correcta

### Problema: CORS errors

**Solución:**
Configurar el backend para permitir el origen del frontend:

```javascript
// Backend
app.use(cors({
  origin: 'https://tudominio.com'
}));
```

### Problema: Contenedor Docker no inicia

**Solución:**
```bash
# Verificar logs
docker logs front-login

# Verificar variables de entorno
docker inspect front-login | grep -A 10 Env

# Reconstruir imagen
docker build --no-cache -t front-login-profile:latest .
```

### Problema: Sitio lento en producción

**Solución:**
- Verificar que el build es de producción (`--configuration=production`)
- Habilitar compresión gzip en el servidor
- Configurar cache de archivos estáticos
- Usar CDN para assets

### Problema: SSR no funciona

**Solución:**
```bash
# Verificar que se generó correctamente
ls -la dist/front-login-profile/server/

# Ejecutar con logs
node dist/front-login-profile/server/server.mjs

# Verificar puerto
netstat -tulpn | grep 4000
```

---

## Mejores Prácticas

1. **Usar variables de entorno** para configuraciones específicas del entorno
2. **Ejecutar builds de producción** con optimizaciones habilitadas
3. **Implementar CI/CD** para automatizar despliegues
4. **Monitorear** la aplicación en producción
5. **Mantener logs** para debugging
6. **Hacer backups** antes de despliegues importantes
7. **Probar en staging** antes de producción
8. **Usar HTTPS** siempre en producción
9. **Configurar caching** adecuadamente
10. **Documentar cambios** en cada despliegue

---

## Scripts de Despliegue Automatizado

### Script de Despliegue Básico

Crea `deploy.sh`:

```bash
#!/bin/bash

echo "=== Iniciando despliegue ==="

# Verificar que estamos en la rama correcta
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ]; then
  echo "Error: Debes estar en la rama main"
  exit 1
fi

# Pull de cambios
echo "Actualizando código..."
git pull origin main

# Instalar dependencias
echo "Instalando dependencias..."
npm install

# Build de producción
echo "Generando build de producción..."
npm run build:prod

# Verificar que el build fue exitoso
if [ ! -d "dist/front-login-profile/browser" ]; then
  echo "Error: Build falló"
  exit 1
fi

echo "=== Despliegue completado exitosamente ==="
```

Hacer ejecutable:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## Contacto y Soporte

Para problemas o dudas sobre el despliegue:

1. Revisar esta documentación completa
2. Consultar `QUICKSTART.md` para comandos básicos
3. Revisar `CONFIGURACION_VARIABLES.md` para variables de entorno
4. Contactar al equipo de desarrollo

---

**Última actualización:** 5 de noviembre de 2025
