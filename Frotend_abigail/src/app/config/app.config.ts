import { BACKEND_CONFIG } from './backend.config';

export const AppConfig = {
  // Configuración del backend
  backend: {
    baseUrl: BACKEND_CONFIG.BASE_URL,
    apiUrl: BACKEND_CONFIG.API_URL,
    auth: {
      login: BACKEND_CONFIG.ENDPOINTS.AUTH.LOGIN,
      logout: BACKEND_CONFIG.ENDPOINTS.AUTH.LOGOUT,
      refresh: BACKEND_CONFIG.ENDPOINTS.AUTH.REFRESH
    },
    endpoints: {
      usuarios: BACKEND_CONFIG.ENDPOINTS.USUARIOS,
      productos: BACKEND_CONFIG.ENDPOINTS.PRODUCTOS,
      clientes: BACKEND_CONFIG.ENDPOINTS.CLIENTES,
      ventas: BACKEND_CONFIG.ENDPOINTS.VENTAS,
      inventario: BACKEND_CONFIG.ENDPOINTS.INVENTARIO,
      reportes: BACKEND_CONFIG.ENDPOINTS.REPORTES,
      caja: BACKEND_CONFIG.ENDPOINTS.CAJA,
      pedidos: BACKEND_CONFIG.ENDPOINTS.PEDIDOS,
      configuracion: BACKEND_CONFIG.ENDPOINTS.CONFIGURACION
    }
  },
  
  // Configuración de la aplicación
  app: {
    name: 'TodoFarma',
    version: '1.0.0',
    timeout: 30000 // 30 segundos
  }
};
