# Configuración del Backend TodoFarma

## 📍 Cambiar URL del Backend

Para cambiar la URL del backend, **solo necesitas modificar un archivo**:

### 1. Archivo Principal: `backend.config.ts`

```typescript
export const BACKEND_CONFIG = {
  // Cambia esta URL cuando sea necesario
  BASE_URL: 'http://localhost:3001', // ← MODIFICA AQUÍ
  
  // El resto se actualiza automáticamente
  get API_URL() {
    return `${this.BASE_URL}/api`;
  },
  // ...
};
```

### 2. Ejemplos de Cambios

#### Cambiar a otro puerto local:
```typescript
BASE_URL: 'http://localhost:3002'
```

#### Cambiar a servidor de desarrollo:
```typescript
BASE_URL: 'http://dev.todofarma.com'
```

#### Cambiar a servidor de producción:
```typescript
BASE_URL: 'https://api.todofarma.com'
```

#### Cambiar a IP específica:
```typescript
BASE_URL: 'http://192.168.1.100:3001'
```

## 🔄 Archivos que se Actualizan Automáticamente

Una vez que cambies `BASE_URL` en `backend.config.ts`, todos estos archivos se actualizarán automáticamente:

- ✅ `environment.ts`
- ✅ `environment.prod.ts`
- ✅ `app.config.ts`
- ✅ Todos los servicios que usen la configuración

## 🚀 Beneficios de esta Configuración

1. **Un solo lugar para cambiar**: Solo modifica `backend.config.ts`
2. **Actualización automática**: Todos los archivos se actualizan
3. **Consistencia**: No hay riesgo de URLs diferentes entre archivos
4. **Mantenimiento fácil**: Cambios centralizados y organizados
5. **Funciones helper**: `buildApiUrl()` y `buildBackendUrl()` para construir URLs

## 📝 Uso en Servicios

```typescript
import { buildApiUrl } from '../config/backend.config';

// En lugar de concatenar strings manualmente
const url = buildApiUrl('/usuarios'); // → http://localhost:3001/api/usuarios

// O usar la configuración directamente
import { BACKEND_CONFIG } from '../config/backend.config';
const url = `${BACKEND_CONFIG.API_URL}/usuarios`;
```

## ⚠️ Importante

- **Nunca** modifiques directamente `environment.ts` o `environment.prod.ts`
- **Siempre** usa `backend.config.ts` como fuente única de verdad
- Después de cambiar la configuración, **reinicia** la aplicación Angular
