// Ambiente de desarrollo
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  appName: 'Front Login Profile - Dev',
  enableDebug: true,
  version: '1.0.0',
  
  // Configuración de Keycloak
  keycloak: {
    url: 'http://localhost:8080',
    realm: 'ecommerce',
    clientId: 'frontend-client'
  },
  
  // URLs de redirección después del login
  catalogUrl: 'http://localhost:4201'  // URL del frontend de shopping cart (catálogo)
};
