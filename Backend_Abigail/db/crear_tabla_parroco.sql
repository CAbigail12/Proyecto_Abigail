-- ============================================================
-- Catálogo de Párrocos
-- ============================================================

CREATE TABLE IF NOT EXISTS cat_parroco (
  id_parroco BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_cat_parroco__nombre CHECK (btrim(nombre) <> ''),
  CONSTRAINT chk_cat_parroco__apellido CHECK (btrim(apellido) <> '')
);

CREATE TRIGGER tr_cat_parroco__u
BEFORE UPDATE ON cat_parroco
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS ix_cat_parroco__activo ON cat_parroco (activo);
CREATE INDEX IF NOT EXISTS ix_cat_parroco__nombre_apellido ON cat_parroco (nombre, apellido);

COMMENT ON TABLE cat_parroco IS 'Catálogo de párrocos de la parroquia';

