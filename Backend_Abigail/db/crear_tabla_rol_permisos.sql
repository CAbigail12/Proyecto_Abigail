-- ============================================================
-- Tabla para almacenar permisos de menú por rol
-- ============================================================

BEGIN;

-- Crear tabla rol_permisos_menu
CREATE TABLE IF NOT EXISTS rol_permisos_menu (
  id_permiso BIGSERIAL PRIMARY KEY,
  rol_id BIGINT NOT NULL,
  permisos_menu JSONB NOT NULL DEFAULT '{}'::jsonb,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_rol_permisos_menu_rol FOREIGN KEY (rol_id) REFERENCES roles(id_rol) ON DELETE CASCADE,
  CONSTRAINT uq_rol_permisos_menu_rol UNIQUE (rol_id)
);

-- Índice para búsquedas por rol
CREATE INDEX IF NOT EXISTS ix_rol_permisos_menu_rol_id ON rol_permisos_menu (rol_id);
CREATE INDEX IF NOT EXISTS ix_rol_permisos_menu_activo ON rol_permisos_menu (activo);

-- Trigger para actualizar updated_at
CREATE TRIGGER tr_rol_permisos_menu__u
BEFORE UPDATE ON rol_permisos_menu
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;

