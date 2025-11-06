-- ============================================================
-- Insertar permisos del rol ADMINISTRADOR con todos los accesos
-- ============================================================

BEGIN;

-- JSON de permisos para ADMINISTRADOR (todos los permisos en true)
INSERT INTO rol_permisos_menu (rol_id, permisos_menu, activo)
VALUES (
  1, -- ID del rol ADMINISTRADOR
  '{
    "dashboard": true,
    "feligreses": true,
    "sacramentos_asignacion": true,
    "calendario_sacramentos": true,
    "actividades_religiosas": true,
    "caja_parroquial": true,
    "reportes": true,
    "usuarios": true,
    "mantenimiento": true
  }'::jsonb,
  true
)
ON CONFLICT (rol_id) 
DO UPDATE SET 
  permisos_menu = EXCLUDED.permisos_menu,
  activo = true,
  updated_at = NOW();

COMMIT;

