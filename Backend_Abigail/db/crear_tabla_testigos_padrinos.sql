-- ============================================================
-- Catálogo de Tipos de Testigos/Padrinos
-- ============================================================

CREATE TABLE IF NOT EXISTS cat_tipo_testigo_padrino (
  id_tipo_testigo_padrino BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(60) NOT NULL UNIQUE,
  descripcion VARCHAR(255),
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_cat_tipo_testigo_padrino__nombre CHECK (btrim(nombre) <> '')
);

CREATE TRIGGER tr_cat_tipo_testigo_padrino__u
BEFORE UPDATE ON cat_tipo_testigo_padrino
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS ix_cat_tipo_testigo_padrino__activo ON cat_tipo_testigo_padrino (activo);
CREATE INDEX IF NOT EXISTS ix_cat_tipo_testigo_padrino__nombre_pattern ON cat_tipo_testigo_padrino (nombre text_pattern_ops);

-- Insertar tipos por defecto
INSERT INTO cat_tipo_testigo_padrino (nombre, descripcion, activo) VALUES
  ('Padrino Bautizo', 'Padrino para el sacramento de bautizo', true),
  ('Padrino Confirmación', 'Padrino para el sacramento de confirmación', true),
  ('Testigo Matrimonio', 'Testigo para el sacramento de matrimonio', true)
ON CONFLICT (nombre) DO NOTHING;

-- ============================================================
-- Tabla de Testigos y Padrinos
-- ============================================================

CREATE TABLE IF NOT EXISTS testigos_padrinos (
  id_testigo_padrino BIGSERIAL PRIMARY KEY,
  id_asignacion BIGINT NOT NULL,
  id_feligres BIGINT NOT NULL,
  id_tipo_testigo_padrino BIGINT NOT NULL,
  numero_orden INTEGER NOT NULL DEFAULT 1, -- 1 para primer padrino/testigo, 2 para segundo
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Foreign Keys
  CONSTRAINT fk_testigos_padrinos__asignacion 
    FOREIGN KEY (id_asignacion) 
    REFERENCES sacramento_asignacion(id_asignacion) 
    ON DELETE CASCADE,
    
  CONSTRAINT fk_testigos_padrinos__feligres 
    FOREIGN KEY (id_feligres) 
    REFERENCES feligres(id_feligres) 
    ON DELETE RESTRICT,
    
  CONSTRAINT fk_testigos_padrinos__tipo 
    FOREIGN KEY (id_tipo_testigo_padrino) 
    REFERENCES cat_tipo_testigo_padrino(id_tipo_testigo_padrino) 
    ON DELETE RESTRICT,
  
  -- Constraints
  CONSTRAINT chk_testigos_padrinos__numero_orden CHECK (numero_orden IN (1, 2)),
  CONSTRAINT uk_testigos_padrinos__asignacion_tipo_orden 
    UNIQUE (id_asignacion, id_tipo_testigo_padrino, numero_orden)
);

CREATE TRIGGER tr_testigos_padrinos__u
BEFORE UPDATE ON testigos_padrinos
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS ix_testigos_padrinos__asignacion ON testigos_padrinos (id_asignacion);
CREATE INDEX IF NOT EXISTS ix_testigos_padrinos__feligres ON testigos_padrinos (id_feligres);
CREATE INDEX IF NOT EXISTS ix_testigos_padrinos__tipo ON testigos_padrinos (id_tipo_testigo_padrino);
CREATE INDEX IF NOT EXISTS ix_testigos_padrinos__activo ON testigos_padrinos (activo);

COMMENT ON TABLE cat_tipo_testigo_padrino IS 'Catálogo de tipos de testigos y padrinos (Padrino Bautizo, Padrino Confirmación, Testigo Matrimonio)';
COMMENT ON TABLE testigos_padrinos IS 'Relación entre asignaciones de sacramentos y sus testigos/padrinos';

