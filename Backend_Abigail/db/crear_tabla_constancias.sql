-- ============================================================
-- Tabla de Constancias de Sacramentos
-- ============================================================

CREATE TABLE IF NOT EXISTS constancias_sacramentos (
  id_constancia BIGSERIAL PRIMARY KEY,
  id_asignacion BIGINT NOT NULL,
  tipo_sacramento VARCHAR(20) NOT NULL CHECK (tipo_sacramento IN ('bautizo', 'confirmacion', 'matrimonio')),
  id_parroco BIGINT NOT NULL,
  libro VARCHAR(50),
  folio VARCHAR(50),
  acta VARCHAR(50),
  fecha_constancia DATE NOT NULL DEFAULT CURRENT_DATE,
  datos_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Foreign Keys
  CONSTRAINT fk_constancias__asignacion 
    FOREIGN KEY (id_asignacion) 
    REFERENCES sacramento_asignacion(id_asignacion) 
    ON DELETE CASCADE,
    
  CONSTRAINT fk_constancias__parroco 
    FOREIGN KEY (id_parroco) 
    REFERENCES cat_parroco(id_parroco) 
    ON DELETE RESTRICT,
  
  -- Constraints
  CONSTRAINT uk_constancias__asignacion UNIQUE (id_asignacion)
);

CREATE TRIGGER tr_constancias_sacramentos__u
BEFORE UPDATE ON constancias_sacramentos
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS ix_constancias__asignacion ON constancias_sacramentos (id_asignacion);
CREATE INDEX IF NOT EXISTS ix_constancias__parroco ON constancias_sacramentos (id_parroco);
CREATE INDEX IF NOT EXISTS ix_constancias__tipo_sacramento ON constancias_sacramentos (tipo_sacramento);

COMMENT ON TABLE constancias_sacramentos IS 'Constancias generadas para sacramentos (bautizo, confirmación, matrimonio)';


