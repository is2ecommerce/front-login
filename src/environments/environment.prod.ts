// Ambiente de producción
export const environment = {
  production: true,
  apiUrl: 'https://api-is2ecommerce.com/api', // 🔄 Actualizar con tu URL de producción real
  appName: 'Front Login Profile',
  enableDebug: false,
  version: '1.0.0',
  
  // Configuración de Keycloak para producción
  keycloak: {
    url: 'https://auth.your-domain.com',
    realm: 'ecommerce',
    clientId: 'frontend-client'
  },
  
  // URLs de redirección después del login
  catalogUrl: 'https://catalog.your-domain.com'
};
