/**
 * Configuración del Backend TodoFarma
 * 
 * URLs del backend:
 * - Desarrollo: http://localhost:3001
 * - Producción: Configurar en environment.prod.ts
 */
export const BACKEND_CONFIG = {
  // URL para desarrollo (localhost)
  BASE_URL_DEV: 'http://localhost:3001',
  
  // URL para producción
  BASE_URL_PROD: 'https://gspa-api.com',
  
  // La URL base se determina según el entorno
  get BASE_URL() {
    // Si estamos en el navegador y no es localhost, asumimos producción
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      // Si no es localhost, 127.0.0.1, o una IP local, usar producción
      if (hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.match(/^192\.168\.|^10\.|^172\.(1[6-9]|2[0-9]|3[0-1])\./)) {
        return this.BASE_URL_PROD;
      }
    }
    return this.BASE_URL_DEV;
  },
  
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
