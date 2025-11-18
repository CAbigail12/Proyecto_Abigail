import { AppConfig } from '../app/config/app.config';

/**
 * Configuración para PRODUCCIÓN
 * 
 * URL del backend en producción: gspa-api.com
 */
const PRODUCTION_API_URL = 'https://gspa-api.com/api';

export const environment = {
  production: true,
  // Usar la URL de producción configurada arriba
  apiUrl: PRODUCTION_API_URL
};
