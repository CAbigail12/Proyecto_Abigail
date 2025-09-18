# Implementación del Módulo de Caja Parroquial

## Resumen Ejecutivo

La implementación del módulo de Caja Parroquial constituye un sistema integral de gestión financiera diseñado específicamente para el control de ingresos y egresos de una parroquia. Este módulo proporciona una interfaz unificada que permite el registro, consulta, filtrado y exportación de movimientos financieros, manteniendo un balance actualizado en tiempo real.

## Arquitectura del Sistema

### Backend (Node.js + Express + PostgreSQL)

El backend implementa una arquitectura RESTful con las siguientes características:

- **Framework**: Express.js con middleware de seguridad
- **Base de Datos**: PostgreSQL con conexión por pool
- **Autenticación**: JWT (JSON Web Tokens) con roles
- **Validación**: Joi para validación de esquemas
- **Estructura**: Patrón MVC (Model-View-Controller)

### Frontend (Angular 17)

El frontend utiliza una arquitectura de componentes standalone con:

- **Framework**: Angular 17 con componentes standalone
- **UI**: Angular Material Design
- **Estilos**: Tailwind CSS
- **Formularios**: Reactive Forms
- **Estado**: RxJS con observables
- **Exportación**: Librería XLSX para archivos Excel

## Estructura de Base de Datos

### Tabla Principal: caja_mov

La tabla `caja_mov` es el núcleo del sistema y contiene la siguiente estructura:

```sql
CREATE TABLE public.caja_mov (
    id_mov BIGSERIAL PRIMARY KEY,
    fecha_hora TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    naturaleza naturaleza_mov_enum NOT NULL,
    monto NUMERIC(14,2) NOT NULL CHECK (monto >= 0),
    monto_signed NUMERIC(14,2) GENERATED ALWAYS AS (
        CASE 
            WHEN naturaleza='ingreso' THEN monto 
            WHEN naturaleza='egreso' THEN -monto 
            ELSE NULL 
        END
    ) STORED,
    cuenta VARCHAR(100) NOT NULL,
    medio_pago VARCHAR(60) NOT NULL,
    concepto VARCHAR(120) NOT NULL,
    referencia VARCHAR(120),
    descripcion VARCHAR(500),
    id_feligres BIGINT REFERENCES public.feligres(id_feligres),
    creado_por INT REFERENCES public.usuarios(id_usuario),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### Características Técnicas:

- **Tipo Enum**: `naturaleza_mov_enum` con valores 'ingreso' y 'egreso'
- **Columna Calculada**: `monto_signed` para cálculos contables automáticos
- **Claves Foráneas**: Referencias a `feligres` y `usuarios`
- **Auditoría**: Campos `created_at` y `updated_at` con trigger automático
- **Índices**: Optimizados para consultas por fecha, naturaleza y cuenta

### Vistas de Apoyo

#### 1. vw_caja_balance_global
Vista que proporciona el balance financiero total de la parroquia:

```sql
CREATE VIEW public.vw_caja_balance_global AS
SELECT 
    COALESCE(SUM(CASE WHEN naturaleza='ingreso' THEN monto END), 0) AS total_ingresos,
    COALESCE(SUM(CASE WHEN naturaleza='egreso' THEN monto END), 0) AS total_egresos,
    COALESCE(SUM(monto_signed), 0) AS saldo_actual
FROM public.caja_mov;
```

#### 2. vw_caja_balance_por_cuenta
Vista que desglosa el balance por cada cuenta contable:

```sql
CREATE VIEW public.vw_caja_balance_por_cuenta AS
SELECT 
    cuenta,
    COALESCE(SUM(CASE WHEN naturaleza='ingreso' THEN monto END), 0) AS total_ingresos,
    COALESCE(SUM(CASE WHEN naturaleza='egreso' THEN monto END), 0) AS total_egresos,
    COALESCE(SUM(monto_signed), 0) AS saldo_actual
FROM public.caja_mov
GROUP BY cuenta
ORDER BY cuenta;
```

#### 3. vw_caja_resumen_diario
Vista para análisis de movimientos por día y cuenta:

```sql
CREATE VIEW public.vw_caja_resumen_diario AS
SELECT 
    cuenta,
    CAST(fecha_hora AT TIME ZONE 'UTC' AS DATE) AS fecha_utc,
    naturaleza,
    SUM(monto) AS total
FROM public.caja_mov
GROUP BY cuenta, CAST(fecha_hora AT TIME ZONE 'UTC' AS DATE), naturaleza
ORDER BY fecha_utc, cuenta, naturaleza;
```

#### 4. vw_caja_kardex
Vista que proporciona un kardex con saldo acumulado por cuenta:

```sql
CREATE VIEW public.vw_caja_kardex AS
SELECT 
    id_mov,
    fecha_hora,
    cuenta,
    concepto,
    naturaleza,
    monto,
    monto_signed,
    SUM(monto_signed) OVER (
        PARTITION BY cuenta 
        ORDER BY fecha_hora, id_mov 
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS saldo_acumulado_cuenta
FROM public.caja_mov
ORDER BY cuenta, fecha_hora, id_mov;
```

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/logout` - Cierre de sesión

### Movimientos de Caja
- `GET /api/caja/movimientos` - Obtener movimientos con filtros
- `GET /api/caja/movimientos/:id` - Obtener movimiento específico
- `POST /api/caja/movimientos` - Crear nuevo movimiento
- `PUT /api/caja/movimientos/:id` - Actualizar movimiento
- `DELETE /api/caja/movimientos/:id` - Eliminar movimiento

### Balances y Reportes
- `GET /api/caja/balance/global` - Balance global
- `GET /api/caja/balance/por-cuenta` - Balance por cuenta
- `GET /api/caja/resumen/diario` - Resumen diario
- `GET /api/caja/kardex` - Kardex de movimientos

### Catálogos
- `GET /api/caja/cuentas` - Lista de cuentas
- `GET /api/caja/conceptos` - Lista de conceptos
- `GET /api/caja/medios-pago` - Lista de medios de pago

## Funcionalidades del Frontend

### Interfaz de Usuario

#### Pestañas Principales:
1. **Ingresos**: Registro y consulta de movimientos de entrada
2. **Egresos**: Registro y consulta de movimientos de salida
3. **Balance**: Visualización de balances y movimientos recientes

#### Formularios de Registro:
- **Campos Obligatorios**: Monto, Cuenta, Medio de Pago, Concepto
- **Campos Opcionales**: Referencia, Descripción, Feligrés asociado
- **Validación**: Monto positivo, campos requeridos
- **Cuentas Predefinidas**: Caja Parroquial, Banco Corriente, Fondo de Emergencia

#### Sistema de Filtros:
- **Por Concepto**: Búsqueda de texto libre
- **Por Cuenta**: Selector con cuentas predefinidas
- **Por Medio de Pago**: Selector con opciones dinámicas
- **Por Fecha**: Rango de fechas personalizable
- **Por Feligrés**: Búsqueda por nombre de feligrés
- **Por Naturaleza**: Ingreso, Egreso o ambos

#### Funcionalidades de Exportación:
- **Formato Excel**: Archivos .xlsx con formato profesional
- **Tipos de Exportación**:
  - Movimientos de Ingresos
  - Movimientos de Egresos
  - Movimientos Generales (Balance)
  - Balance Global y por Cuenta
- **Nomenclatura**: Archivos con fecha de exportación

### Gestión de Estado

#### Servicios Angular:
- **CajaService**: Comunicación con API de caja
- **FeligresService**: Gestión de feligreses
- **AuthService**: Autenticación y autorización

#### Interceptores:
- **AuthInterceptor**: Inyección automática de tokens JWT
- **Error Handling**: Manejo centralizado de errores HTTP

## Seguridad y Autenticación

### Autenticación JWT:
- **Token de Acceso**: Válido por 24 horas
- **Refresh Token**: Renovación automática
- **Almacenamiento**: LocalStorage del navegador

### Autorización por Roles:
- **ADMINISTRADOR**: Acceso completo al módulo
- **USUARIO**: Acceso de solo lectura
- **Middleware**: Verificación en cada endpoint

### Validación de Datos:
- **Backend**: Joi schemas para validación
- **Frontend**: Reactive Forms con validadores
- **Sanitización**: Limpieza de entradas maliciosas

## Integración con Otros Módulos

### Módulo de Feligreses:
- **Relación**: Movimientos pueden asociarse a feligreses
- **Dropdown**: Selección de feligreses activos
- **Búsqueda**: Filtrado por feligrés específico

### Módulo de Usuarios:
- **Auditoría**: Registro de usuario que crea/modifica movimientos
- **Permisos**: Control de acceso basado en roles

## Consideraciones Técnicas

### Rendimiento:
- **Paginación**: Límite de 100 registros por consulta
- **Índices**: Optimización de consultas frecuentes
- **Caché**: Balance global en memoria

### Escalabilidad:
- **Pool de Conexiones**: Máximo 20 conexiones simultáneas
- **Lazy Loading**: Carga diferida de componentes
- **Tree Shaking**: Optimización de bundle

### Mantenibilidad:
- **Código Modular**: Separación de responsabilidades
- **Documentación**: Comentarios en código crítico
- **Testing**: Estructura preparada para pruebas unitarias

## Datos de Prueba

El sistema incluye datos de prueba para validación:

### Movimientos de Ejemplo:
- **Ingreso**: Ofrenda dominical - $500.00
- **Ingreso**: Arancel Bautizo - $800.00
- **Egreso**: Mantenimiento - $300.00
- **Egreso**: Servicios básicos - $150.00

### Usuario Administrador:
- **Email**: admin@dominio.com
- **Password**: Admin123!
- **Rol**: ADMINISTRADOR

## Conclusión

La implementación del módulo de Caja Parroquial proporciona una solución completa y robusta para la gestión financiera de una parroquia. El sistema combina una arquitectura moderna con funcionalidades específicas del dominio, ofreciendo flexibilidad, seguridad y facilidad de uso.

La integración entre backend y frontend asegura una experiencia de usuario fluida, mientras que la estructura de base de datos optimizada garantiza el rendimiento y la integridad de los datos financieros.

Este módulo constituye la base para futuras expansiones del sistema parroquial, proporcionando una plataforma sólida para la gestión integral de recursos eclesiásticos.
