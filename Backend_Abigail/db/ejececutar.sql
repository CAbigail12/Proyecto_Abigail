admin@dominio.com
Admin123!

-- ============================================================
-- Catálogos (CRUD) + relación de requisitos por sacramento
-- PostgreSQL 14+ recomendado
-- ============================================================

BEGIN;  -- Inicia transacción atómica

-- -----------------------------------------------------------------
-- 1) Utilitarios
-- -----------------------------------------------------------------

-- Función para mantener updated_at actualizada en UPDATE
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------
-- 2) Catálogo de Sacramentos
--    Contiene los sacramentos que administra la parroquia.
--    Contenido típico: Bautizo, Primera Comunión, Confirmación,
--    Matrimonio, Reconciliación, Unción de Enfermos.
-- -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cat_sacramento (
  id_sacramento   BIGSERIAL PRIMARY KEY,                       -- PK
  nombre          VARCHAR(60) NOT NULL UNIQUE,                 -- Nombre único del sacramento
  descripcion     VARCHAR(255),                                -- Descripción / notas
  activo          BOOLEAN NOT NULL DEFAULT TRUE,               -- Soft delete funcional
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),          -- Fecha de creación (server)
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),          -- Fecha última actualización
  CONSTRAINT chk_cat_sacramento__nombre CHECK (btrim(nombre) <> '')
);
CREATE TRIGGER tr_cat_sacramento__u
BEFORE UPDATE ON cat_sacramento
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Índices auxiliares (búsquedas por estado/nombre)
CREATE INDEX IF NOT EXISTS ix_cat_sacramento__activo ON cat_sacramento (activo);
CREATE INDEX IF NOT EXISTS ix_cat_sacramento__nombre_pattern ON cat_sacramento (nombre text_pattern_ops);

-- -----------------------------------------------------------------
-- 3) Catálogo de Tipos de Documento
--    Tipos de documentos aceptados para adjuntar en solicitudes.
--    Ejemplos: Partida de nacimiento, Fe de bautismo, DPI,
--    Constancia de catequesis, Certificado médico.
-- -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cat_tipo_documento (
  id_tipo_documento BIGSERIAL PRIMARY KEY,                     -- PK
  nombre            VARCHAR(80) NOT NULL UNIQUE,               -- Tipo documental
  descripcion       VARCHAR(255),                              -- Notas/uso/vigencia
  activo            BOOLEAN NOT NULL DEFAULT TRUE,             -- Soft delete funcional
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_cat_tipo_documento__nombre CHECK (btrim(nombre) <> '')
);
CREATE TRIGGER tr_cat_tipo_documento__u
BEFORE UPDATE ON cat_tipo_documento
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS ix_cat_tipo_documento__activo ON cat_tipo_documento (activo);
CREATE INDEX IF NOT EXISTS ix_cat_tipo_documento__nombre_pattern ON cat_tipo_documento (nombre text_pattern_ops);

-- -----------------------------------------------------------------
-- 4) Catálogo de Requisitos
--    Requisitos generales (documentales o de preparación) que podrían
--    exigirse según el sacramento.
--    Ejemplos: Constancia de catequesis, Fe de bautismo del solicitante,
--    Fotocopia de DPI, Acta de matrimonio civil, Certificado médico.
-- -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cat_requisito (
  id_requisito   BIGSERIAL PRIMARY KEY,                        -- PK
  nombre         VARCHAR(120) NOT NULL UNIQUE,                 -- Nombre de requisito
  descripcion    VARCHAR(255),                                 -- Detalle/condiciones (vigencia, emisor)
  activo         BOOLEAN NOT NULL DEFAULT TRUE,                -- Soft delete funcional
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_cat_requisito__nombre CHECK (btrim(nombre) <> '')
);
CREATE TRIGGER tr_cat_requisito__u
BEFORE UPDATE ON cat_requisito
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS ix_cat_requisito__activo ON cat_requisito (activo);
CREATE INDEX IF NOT EXISTS ix_cat_requisito__nombre_pattern ON cat_requisito (nombre text_pattern_ops);

-- -----------------------------------------------------------------
-- 5) Relación Requisito por Sacramento (plantilla/checklist)
--    Define qué requisitos aplican a cada sacramento y si son
--    obligatorios u opcionales, además de su orden sugerido.
-- -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS requisito_por_sacramento (
  id_sacramento   BIGINT NOT NULL REFERENCES cat_sacramento(id_sacramento)
                  ON UPDATE RESTRICT ON DELETE RESTRICT,       -- FK a sacramento
  id_requisito    BIGINT NOT NULL REFERENCES cat_requisito(id_requisito)
                  ON UPDATE RESTRICT ON DELETE RESTRICT,       -- FK a requisito
  obligatorio     BOOLEAN NOT NULL DEFAULT TRUE,               -- TRUE = requerido
  orden           INT,                                         -- Orden visual/validación
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id_sacramento, id_requisito)                    -- Evita duplicados
);
CREATE TRIGGER tr_requisito_por_sacramento__u
BEFORE UPDATE ON requisito_por_sacramento
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS ix_rqsac__sacramento ON requisito_por_sacramento (id_sacramento);
CREATE INDEX IF NOT EXISTS ix_rqsac__requisito  ON requisito_por_sacramento (id_requisito);

-- -----------------------------------------------------------------
-- 6) Catálogo de Rol de Participante en Ceremonia
--    Lista los roles posibles dentro de una ceremonia.
--    Ejemplos: Bautizado, Confirmando, Comulgante, Novio/Novia,
--    Padrino, Madrina, Testigo.
-- -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cat_rol_participante (
  id_rol_participante BIGSERIAL PRIMARY KEY,                   -- PK
  nombre              VARCHAR(60) NOT NULL UNIQUE,             -- Rol (Padrino, Testigo, etc.)
  descripcion         VARCHAR(255),                            -- Notas de aplicación litúrgica/pastoral
  activo              BOOLEAN NOT NULL DEFAULT TRUE,           -- Soft delete funcional
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_cat_rol_participante__nombre CHECK (btrim(nombre) <> '')
);
CREATE TRIGGER tr_cat_rol_participante__u
BEFORE UPDATE ON cat_rol_participante
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS ix_cat_rol_participante__activo ON cat_rol_participante (activo);
CREATE INDEX IF NOT EXISTS ix_cat_rol_participante__nombre_pattern ON cat_rol_participante (nombre text_pattern_ops);

-- -----------------------------------------------------------------
-- 7) Catálogo de Comunidades
--    Comunidades/parroquias/zonas atendidas. El documento menciona
--    ~16 comunidades. Se referencian desde FELIGRÉS.
-- -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cat_comunidad (
  id_comunidad  BIGSERIAL PRIMARY KEY,                          -- PK
  nombre        VARCHAR(100) NOT NULL UNIQUE,                   -- Nombre oficial/uso interno
  descripcion   VARCHAR(255),                                   -- Dirección/observaciones
  activo        BOOLEAN NOT NULL DEFAULT TRUE,                  -- Soft delete funcional
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_cat_comunidad__nombre CHECK (btrim(nombre) <> '')
);
CREATE TRIGGER tr_cat_comunidad__u
BEFORE UPDATE ON cat_comunidad
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS ix_cat_comunidad__activo ON cat_comunidad (activo);
CREATE INDEX IF NOT EXISTS ix_cat_comunidad__nombre_pattern ON cat_comunidad (nombre text_pattern_ops);

-- -----------------------------------------------------------------
-- 8) Catálogo de Tipos de Espacio
--    Tipos genéricos de espacios donde se realizan ceremonias.
--    Ejemplos: Nave principal, Capilla, Salón de catequesis,
--    Oficina parroquial. (Las instancias físicas van en "espacio".)
-- -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cat_tipo_espacio (
  id_tipo_espacio BIGSERIAL PRIMARY KEY,                        -- PK
  nombre          VARCHAR(60) NOT NULL UNIQUE,                  -- Tipo de espacio
  descripcion     VARCHAR(255),                                 -- Notas (aforo típico, condiciones)
  activo          BOOLEAN NOT NULL DEFAULT TRUE,                -- Soft delete funcional
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_cat_tipo_espacio__nombre CHECK (btrim(nombre) <> '')
);
CREATE TRIGGER tr_cat_tipo_espacio__u
BEFORE UPDATE ON cat_tipo_espacio
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS ix_cat_tipo_espacio__activo ON cat_tipo_espacio (activo);
CREATE INDEX IF NOT EXISTS ix_cat_tipo_espacio__nombre_pattern ON cat_tipo_espacio (nombre text_pattern_ops);

-- -----------------------------------------------------------------
-- 9) SEMILLAS (valores iniciales recomendados)
--    ON CONFLICT DO NOTHING evita error si ya existen.
-- -----------------------------------------------------------------

-- Sacramentos típicos
INSERT INTO cat_sacramento (nombre, descripcion) VALUES
  ('Bautizo', 'Sacramento de iniciación'),
  ('Primera Comunión', 'Recepción de la Eucaristía por primera vez'),
  ('Confirmación', 'Fortalece la gracia bautismal'),
  ('Matrimonio', 'Unión sacramental'),
  ('Reconciliación', 'Confesión y absolución'),
  ('Unción de Enfermos', 'Atención en enfermedad')
ON CONFLICT (nombre) DO NOTHING;

-- Tipos de documento típicos
INSERT INTO cat_tipo_documento (nombre, descripcion) VALUES
  ('Partida de nacimiento', 'Documento registral'),
  ('Fe de bautismo', 'Certificación eclesiástica'),
  ('DPI', 'Documento Personal de Identificación'),
  ('Constancia de catequesis', 'Comprobante de preparación'),
  ('Certificado médico', 'Respaldo por tema de salud')
ON CONFLICT (nombre) DO NOTHING;

-- Requisitos típicos
INSERT INTO cat_requisito (nombre, descripcion) VALUES
  ('Acta/Partida de nacimiento', 'Original o copia certificada'),
  ('Fe de bautismo del solicitante', 'Emitida por parroquia de origen'),
  ('Constancia de catequesis', 'Emitida por catequesis parroquial'),
  ('Fotocopia de DPI', 'De solicitante/padres/padrinos según aplique'),
  ('Acta de matrimonio civil', 'Para convalidación/registro'),
  ('Certificado médico', 'Cuando aplique por salud')
ON CONFLICT (nombre) DO NOTHING;

-- Plantilla de requisitos por sacramento (ejemplo para Bautizo)
WITH s AS (
  SELECT id_sacramento FROM cat_sacramento WHERE nombre = 'Bautizo'
),
r AS (
  SELECT id_requisito, nombre FROM cat_requisito
  WHERE nombre IN ('Acta/Partida de nacimiento','Fotocopia de DPI','Constancia de catequesis')
)
INSERT INTO requisito_por_sacramento (id_sacramento, id_requisito, obligatorio, orden)
SELECT s.id_sacramento,
       r.id_requisito,
       CASE WHEN r.nombre IN ('Acta/Partida de nacimiento','Fotocopia de DPI') THEN TRUE ELSE FALSE END,
       CASE r.nombre
         WHEN 'Acta/Partida de nacimiento' THEN 1       -- Requisito prioritario
         WHEN 'Fotocopia de DPI'           THEN 2
         WHEN 'Constancia de catequesis'   THEN 3
         ELSE 99
       END
FROM s CROSS JOIN r
ON CONFLICT DO NOTHING;

-- Roles de participante típicos
INSERT INTO cat_rol_participante (nombre, descripcion) VALUES
  ('Bautizado', 'Receptor del sacramento de Bautizo'),
  ('Confirmando', 'Receptor del sacramento de Confirmación'),
  ('Comulgante', 'Receptor de Primera Comunión'),
  ('Novio/Novia', 'Participante del sacramento de Matrimonio'),
  ('Padrino', 'Acompañante/custodio espiritual'),
  ('Madrina', 'Acompañante/custodia espiritual'),
  ('Testigo', 'Da fe del acto')
ON CONFLICT (nombre) DO NOTHING;

-- Comunidades (ejemplos, reemplazar por las 16 reales del documento)
INSERT INTO cat_comunidad (nombre, descripcion) VALUES
  ('Comunidad 1', 'Zona pastoral 1'),
  ('Comunidad 2', 'Zona pastoral 2'),
  ('Comunidad 3', 'Zona pastoral 3')
ON CONFLICT (nombre) DO NOTHING;

-- Tipos de espacio típicos
INSERT INTO cat_tipo_espacio (nombre, descripcion) VALUES
  ('Nave principal', 'Aforo amplio'),
  ('Capilla', 'Espacio íntimo'),
  ('Salón de catequesis', 'Aula/Salón de formación'),
  ('Oficina parroquial', 'Atención administrativa')
ON CONFLICT (nombre) DO NOTHING;

COMMIT;  -- Finaliza transacción (aplica todos los cambios)
-- Si algo falla: ROLLBACK;  -- (se revierte todo)
