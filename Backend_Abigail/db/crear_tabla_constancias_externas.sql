-- ============================================================
-- Tabla de Constancias Externas de Sacramentos
-- ============================================================
-- Esta tabla almacena constancias de sacramentos (bautismo y confirmación)
-- realizados en otras iglesias, asociadas a feligreses del sistema.

CREATE TABLE IF NOT EXISTS constancias_externas_sacramentos (
  id_constancia_externa BIGSERIAL PRIMARY KEY,
  id_feligres BIGINT NOT NULL,
  id_sacramento BIGINT NOT NULL,
  libro VARCHAR(50) NOT NULL,
  folio VARCHAR(50) NOT NULL,
  descripcion VARCHAR(255),
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Foreign Keys
  CONSTRAINT fk_constancias_externas__feligres 
    FOREIGN KEY (id_feligres) 
    REFERENCES feligres(id_feligres) 
    ON DELETE RESTRICT,
    
  CONSTRAINT fk_constancias_externas__sacramento 
    FOREIGN KEY (id_sacramento) 
    REFERENCES cat_sacramento(id_sacramento) 
    ON DELETE RESTRICT,
  
  -- Constraints
  -- Solo se permiten constancias de Bautismo (1) y Confirmación (3)
  CONSTRAINT chk_constancias_externas__sacramento 
    CHECK (id_sacramento IN (1, 3)),
  
  CONSTRAINT chk_constancias_externas__libro 
    CHECK (btrim(libro) <> ''),
  
  CONSTRAINT chk_constancias_externas__folio 
    CHECK (btrim(folio) <> '')
);

CREATE TRIGGER tr_constancias_externas_sacramentos__u
BEFORE UPDATE ON constancias_externas_sacramentos
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS ix_constancias_externas__feligres 
  ON constancias_externas_sacramentos (id_feligres);
  
CREATE INDEX IF NOT EXISTS ix_constancias_externas__sacramento 
  ON constancias_externas_sacramentos (id_sacramento);
  
CREATE INDEX IF NOT EXISTS ix_constancias_externas__activo 
  ON constancias_externas_sacramentos (activo);
  
CREATE INDEX IF NOT EXISTS ix_constancias_externas__feligres_sacramento 
  ON constancias_externas_sacramentos (id_feligres, id_sacramento);

COMMENT ON TABLE constancias_externas_sacramentos IS 'Constancias de sacramentos (bautismo y confirmación) realizados en otras iglesias';
COMMENT ON COLUMN constancias_externas_sacramentos.id_sacramento IS 'Solo se permiten Bautismo (1) y Confirmación (3)';

