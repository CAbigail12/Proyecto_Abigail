/**
 * Configuración del Backend TodoFarma
 * 
 * Para cambiar la URL del backend, modifica únicamente esta variable:
 */
export const BACKEND_CONFIG = {
  // Cambia esta URL cuando sea necesario
  BASE_URL: 'https://gspa-api.com',
  
  // La URL completa de la API se construye automáticamente
  get API_URL() {
    return `${this.BASE_URL}/api`;
  },
  
  // Endpoints específicos
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      PERFIL: '/auth/perfil',
      CAMBIAR_PASSWORD: '/auth/cambiar-contrasena'
    },
    USUARIOS: '/usuarios',
    PRODUCTOS: '/productos',
    CLIENTES: '/clientes',
    VENTAS: '/ventas',
    INVENTARIO: '/inventario',
    REPORTES: '/reportes',
    CAJA: '/caja',
    PEDIDOS: '/pedidos',
    CONFIGURACION: '/configuracion'
  }
};

// Función helper para construir URLs completas
export function buildApiUrl(endpoint: string): string {
  return `${BACKEND_CONFIG.API_URL}${endpoint}`;
}

// Función helper para construir URLs del backend base
export function buildBackendUrl(endpoint: string): string {
  return `${BACKEND_CONFIG.BASE_URL}${endpoint}`;
}
