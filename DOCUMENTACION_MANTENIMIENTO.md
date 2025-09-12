# DOCUMENTACIÓN TÉCNICA - MÓDULOS DE MANTENIMIENTO
## Sistema de Gestión Parroquial - Proyecto Abigail

---

## 1. ARQUITECTURA GENERAL DEL SISTEMA DE MANTENIMIENTO

El sistema de mantenimiento está estructurado en tres controladores principales que gestionan diferentes entidades del sistema parroquial:

- **MantenimientoController**: Gestiona Sacramentos y Tipos de Documento
- **MantenimientoController2**: Gestiona Requisitos y Relaciones Requisito-Sacramento
- **MantenimientoController3**: Gestiona Roles de Participante, Comunidades y Tipos de Espacio

### 1.1 Patrón de Diseño Implementado

El sistema implementa el patrón **MVC (Model-View-Controller)** con las siguientes características:

- **Modelos**: Encapsulan la lógica de acceso a datos y validaciones de negocio
- **Controladores**: Manejan la lógica de aplicación y coordinación entre modelos
- **Rutas**: Definen los endpoints de la API REST
- **Middleware**: Proporciona autenticación y validación de datos

### 1.2 Estructura de Respuesta Estándar

Todas las operaciones del sistema siguen un formato de respuesta consistente:

```json
{
  "ok": boolean,
  "mensaje": string,
  "datos": object | array,
  "error": string (solo en caso de error)
}
```

---

## 2. MANTENIMIENTO CONTROLLER - SACRAMENTOS Y TIPOS DE DOCUMENTO

### 2.1 Gestión de Sacramentos

#### 2.1.1 Lógica de Obtención de Sacramentos

**Función**: `obtenerSacramentos`

**Parámetros de entrada**:
- `pagina`: Número de página para paginación (default: 1)
- `limite`: Cantidad de registros por página (default: 10)
- `busqueda`: Término de búsqueda para filtrar por nombre
- `activo`: Filtro por estado activo/inactivo

**Lógica implementada**:
1. Extracción y validación de parámetros de consulta
2. Construcción del objeto de filtros
3. Ejecución paralela de consultas para datos y conteo total
4. Cálculo de metadatos de paginación
5. Retorno de respuesta estructurada con datos y paginación

**Características técnicas**:
- Uso de `Promise.all()` para optimización de consultas paralelas
- Cálculo automático de total de páginas
- Manejo de errores con try-catch
- Logging de errores para debugging

#### 2.1.2 Lógica de Creación de Sacramentos

**Función**: `crearSacramento`

**Validaciones implementadas**:
1. **Validación de campos obligatorios**: Verificación de que el nombre no esté vacío
2. **Validación de unicidad**: Verificación de que no exista otro sacramento con el mismo nombre
3. **Sanitización de datos**: Limpieza de espacios en blanco en campos de texto

**Flujo de ejecución**:
1. Extracción de datos del cuerpo de la petición
2. Validación de campos requeridos
3. Verificación de existencia previa
4. Creación del registro en la base de datos
5. Retorno de respuesta con código 201 (Created)

#### 2.1.3 Lógica de Actualización de Sacramentos

**Función**: `actualizarSacramento`

**Validaciones específicas**:
1. **Verificación de existencia**: Confirmación de que el registro existe
2. **Validación de unicidad**: Verificación de que el nuevo nombre no coincida con otros registros
3. **Exclusión del registro actual**: En la validación de unicidad se excluye el registro que se está actualizando

**Características de seguridad**:
- Validación de parámetros de ruta
- Sanitización de entrada de datos
- Manejo de valores nulos en campos opcionales

#### 2.1.4 Lógica de Eliminación de Sacramentos

**Función**: `eliminarSacramento`

**Proceso de eliminación**:
1. Verificación de existencia del registro
2. Eliminación física del registro
3. Retorno de confirmación de eliminación

**Consideraciones de diseño**:
- Eliminación física (no lógica) de registros
- No se implementan validaciones de integridad referencial en el controlador

### 2.2 Gestión de Tipos de Documento

La lógica para Tipos de Documento sigue exactamente el mismo patrón que los Sacramentos, implementando las mismas validaciones y flujos de trabajo:

- Misma estructura de validaciones
- Mismo manejo de errores
- Misma lógica de paginación y búsqueda
- Misma sanitización de datos

---

## 3. MANTENIMIENTO CONTROLLER 2 - REQUISITOS Y RELACIONES

### 3.1 Gestión de Requisitos

#### 3.1.1 Lógica de Obtención de Requisitos

**Función**: `obtenerRequisitos`

Implementa la misma lógica que los sacramentos con:
- Paginación estándar
- Filtros de búsqueda
- Filtros por estado activo
- Manejo de errores consistente

#### 3.1.2 Lógica de Creación y Actualización de Requisitos

Sigue el mismo patrón de validaciones que los sacramentos:
- Validación de campos obligatorios
- Verificación de unicidad por nombre
- Sanitización de datos de entrada

### 3.2 Gestión de Relaciones Requisito-Sacramento

#### 3.2.1 Lógica de Creación de Relaciones

**Función**: `crearRequisitoPorSacramento`

**Validaciones específicas**:
1. **Validación de IDs**: Verificación de que ambos IDs (sacramento y requisito) sean proporcionados
2. **Validación de unicidad**: Verificación de que no exista la relación previamente
3. **Gestión de orden**: Asignación automática de orden si no se proporciona

**Lógica de ordenamiento**:
- Si no se proporciona orden, se obtiene automáticamente el siguiente número disponible
- Permite especificar orden manualmente
- Mantiene consistencia en la secuencia de orden

#### 3.2.2 Lógica de Actualización de Relaciones

**Función**: `actualizarRequisitoPorSacramento`

**Características**:
- Actualización por clave compuesta (ID Sacramento + ID Requisito)
- Validación de existencia de la relación
- Actualización de campos obligatorio y orden

#### 3.2.3 Lógica de Consulta de Relaciones

**Función**: `obtenerRequisitosDeSacramento`

**Propósito**: Obtener todos los requisitos asociados a un sacramento específico
- Consulta optimizada por ID de sacramento
- Retorna información completa de requisitos y sus propiedades de relación

---

## 4. MANTENIMIENTO CONTROLLER 3 - ROLES, COMUNIDADES Y TIPOS DE ESPACIO

### 4.1 Gestión de Roles de Participante

#### 4.1.1 Lógica de Obtención de Roles

**Función**: `obtenerRolesParticipante`

Implementa el patrón estándar de:
- Paginación con metadatos
- Filtros de búsqueda por nombre
- Filtros por estado activo
- Manejo de errores consistente

#### 4.1.2 Lógica de CRUD para Roles

Sigue el mismo patrón de validaciones que las entidades anteriores:
- Validación de campos obligatorios
- Verificación de unicidad por nombre
- Sanitización de datos
- Manejo de estados activo/inactivo

### 4.2 Gestión de Comunidades

#### 4.2.1 Características de la Lógica

La gestión de comunidades implementa:
- Misma estructura de validaciones que otras entidades
- Paginación estándar
- Filtros de búsqueda
- Gestión de estados activo/inactivo

### 4.3 Gestión de Tipos de Espacio

#### 4.3.1 Implementación

Sigue el patrón establecido con:
- Validaciones consistentes
- Manejo de errores estándar
- Paginación y filtros
- Operaciones CRUD completas

---

## 5. CARACTERÍSTICAS TÉCNICAS COMUNES

### 5.1 Manejo de Errores

**Estrategia implementada**:
- Try-catch en todas las operaciones
- Logging de errores en consola
- Respuestas de error estructuradas
- Códigos de estado HTTP apropiados

**Códigos de estado utilizados**:
- 200: Operación exitosa
- 201: Recurso creado exitosamente
- 400: Error de validación
- 404: Recurso no encontrado
- 500: Error interno del servidor

### 5.2 Validaciones de Datos

**Tipos de validación implementados**:
1. **Validación de campos obligatorios**: Verificación de presencia y no vacío
2. **Validación de unicidad**: Verificación de que no existan duplicados
3. **Sanitización**: Limpieza de espacios en blanco y caracteres especiales
4. **Validación de tipos**: Conversión y validación de tipos de datos

### 5.3 Paginación

**Implementación estándar**:
- Parámetros: `pagina` y `limite`
- Cálculo automático de total de páginas
- Metadatos de paginación en respuesta
- Valores por defecto configurables

### 5.4 Filtros y Búsqueda

**Funcionalidades implementadas**:
- Búsqueda por nombre (búsqueda parcial)
- Filtro por estado activo/inactivo
- Combinación de múltiples filtros
- Parámetros opcionales en consultas

---

## 6. SEGURIDAD Y AUTENTICACIÓN

### 6.1 Middleware de Autenticación

**Implementación**:
- Middleware aplicado a todas las rutas de mantenimiento
- Verificación de token JWT
- Protección de endpoints sensibles

### 6.2 Validación de Entrada

**Medidas de seguridad**:
- Sanitización de datos de entrada
- Validación de tipos de datos
- Prevención de inyección SQL a través de modelos
- Validación de parámetros de ruta

---

## 7. OPTIMIZACIONES DE RENDIMIENTO

### 7.1 Consultas Paralelas

**Implementación**:
- Uso de `Promise.all()` para consultas de datos y conteo
- Reducción de tiempo de respuesta
- Optimización de recursos del servidor

### 7.2 Paginación Eficiente

**Características**:
- Consultas limitadas por página
- Cálculo eficiente de totales
- Metadatos de paginación para navegación

---

## 8. CONSIDERACIONES DE DISEÑO

### 8.1 Consistencia de API

**Principios aplicados**:
- Estructura de respuesta uniforme
- Nomenclatura consistente de endpoints
- Manejo de errores estandarizado
- Códigos de estado HTTP apropiados

### 8.2 Mantenibilidad

**Características del código**:
- Separación clara de responsabilidades
- Reutilización de patrones
- Documentación en código
- Estructura modular

### 8.3 Escalabilidad

**Consideraciones implementadas**:
- Paginación para grandes volúmenes de datos
- Filtros eficientes
- Consultas optimizadas
- Estructura preparada para crecimiento

---

## 9. CONCLUSIONES TÉCNICAS

El sistema de mantenimiento implementa un patrón de diseño robusto y escalable que proporciona:

1. **Consistencia**: Todas las entidades siguen el mismo patrón de implementación
2. **Seguridad**: Validaciones exhaustivas y autenticación obligatoria
3. **Rendimiento**: Optimizaciones en consultas y paginación
4. **Mantenibilidad**: Código estructurado y bien documentado
5. **Escalabilidad**: Arquitectura preparada para crecimiento futuro

La implementación demuestra buenas prácticas de desarrollo de APIs REST, con manejo adecuado de errores, validaciones de datos y optimizaciones de rendimiento que garantizan la estabilidad y eficiencia del sistema.


