-- ============================================================
-- Script para poblar base de datos con datos de prueba
-- 23 Bautizos, 12 Confirmaciones, 13 Matrimonios
-- y algunas constancias externas
-- ============================================================

BEGIN;

-- ============================================================
-- 1. CREAR FELIGRESES ADICIONALES
-- ============================================================

-- Feligreses para bautizos (niños)
INSERT INTO feligres (primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, fecha_nacimiento, sexo, nombre_padre, nombre_madre, id_comunidad, activo) VALUES
('María', 'José', 'García', 'López', '2020-03-15', 'F', 'Juan García', 'María López', 6, true),
('Carlos', 'Alberto', 'Martínez', 'Rodríguez', '2019-11-22', 'M', 'Pedro Martínez', 'Ana Rodríguez', 7, true),
('Ana', 'Sofía', 'Hernández', 'González', '2021-05-08', 'F', 'Luis Hernández', 'Carmen González', 8, true),
('José', 'Luis', 'Pérez', 'Morales', '2020-08-12', 'M', 'Miguel Pérez', 'Rosa Morales', 9, true),
('Lucía', 'Esperanza', 'Ramírez', 'Torres', '2021-01-30', 'F', 'Francisco Ramírez', 'Esperanza Torres', 10, true),
('Diego', 'Fernando', 'Sánchez', 'Vásquez', '2019-12-05', 'M', 'Roberto Sánchez', 'Patricia Vásquez', 6, true),
('Valentina', 'Isabel', 'Castro', 'Mendoza', '2020-07-18', 'F', 'Carlos Castro', 'Isabel Mendoza', 7, true),
('Santiago', 'Antonio', 'Flores', 'Jiménez', '2021-02-14', 'M', 'Antonio Flores', 'María Jiménez', 8, true),
('Isabella', 'María', 'Gutiérrez', 'Ruiz', '2020-09-25', 'F', 'Manuel Gutiérrez', 'Laura Ruiz', 9, true),
('Sebastián', 'Alejandro', 'Díaz', 'Moreno', '2019-10-03', 'M', 'Alejandro Díaz', 'Sofía Moreno', 10, true),
('Camila', 'Beatriz', 'Ortega', 'Silva', '2021-04-11', 'F', 'Jorge Ortega', 'Beatriz Silva', 6, true),
('Mateo', 'David', 'Vargas', 'Cruz', '2020-06-20', 'M', 'David Vargas', 'Elena Cruz', 7, true),
('Sofía', 'Alejandra', 'Mendoza', 'Ramos', '2021-03-09', 'F', 'Fernando Mendoza', 'Alejandra Ramos', 8, true),
('Nicolás', 'Eduardo', 'Ramos', 'Aguilar', '2020-11-17', 'M', 'Eduardo Ramos', 'Carmen Aguilar', 9, true),
('Emma', 'Victoria', 'Torres', 'Medina', '2021-08-22', 'F', 'Ricardo Torres', 'Victoria Medina', 10, true),
('Daniel', 'Esteban', 'Morales', 'Guerrero', '2019-09-28', 'M', 'Esteban Morales', 'Guadalupe Guerrero', 6, true),
('Olivia', 'Patricia', 'Jiménez', 'Reyes', '2020-12-10', 'F', 'Patricio Jiménez', 'Patricia Reyes', 7, true),
('Emilio', 'José', 'Ruiz', 'Navarro', '2021-06-05', 'M', 'José Ruiz', 'Dolores Navarro', 8, true),
('Mía', 'Gabriela', 'Moreno', 'Delgado', '2020-02-19', 'F', 'Gabriel Moreno', 'Gabriela Delgado', 9, true),
('Lucas', 'Manuel', 'Silva', 'Herrera', '2019-07-31', 'M', 'Manuel Silva', 'Rosa Herrera', 10, true),
('Amelia', 'Rosa', 'Cruz', 'Vega', '2021-10-15', 'F', 'Rafael Cruz', 'Rosa Vega', 6, true),
('Adrián', 'Francisco', 'Aguilar', 'Fuentes', '2020-04-26', 'M', 'Francisco Aguilar', 'María Fuentes', 7, true),
('Elena', 'Carmen', 'Medina', 'Soto', '2021-09-08', 'F', 'Carmelo Medina', 'Carmen Soto', 8, true);

-- Feligreses adultos para confirmaciones (algunos de los bautizados y otros nuevos)
INSERT INTO feligres (primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, fecha_nacimiento, sexo, nombre_padre, nombre_madre, id_comunidad, activo) VALUES
('Rosa', 'María', 'Guerrero', 'Méndez', '2005-03-20', 'F', 'Juan Guerrero', 'María Méndez', 6, true),
('Miguel', 'Ángel', 'Reyes', 'Castro', '2004-07-15', 'M', 'Ángel Reyes', 'Lucía Castro', 7, true),
('Patricia', 'Esperanza', 'Navarro', 'López', '2006-11-08', 'F', 'Pedro Navarro', 'Esperanza López', 8, true),
('Fernando', 'José', 'Delgado', 'García', '2005-09-22', 'M', 'José Delgado', 'Carmen García', 9, true),
('Carmen', 'Rosa', 'Herrera', 'Martínez', '2004-12-30', 'F', 'Luis Herrera', 'Rosa Martínez', 10, true),
('Roberto', 'Carlos', 'Vega', 'Rodríguez', '2006-05-14', 'M', 'Carlos Vega', 'Ana Rodríguez', 6, true),
('Laura', 'Isabel', 'Fuentes', 'Hernández', '2005-08-03', 'F', 'Miguel Fuentes', 'Isabel Hernández', 7, true),
('Francisco', 'Antonio', 'Soto', 'Pérez', '2004-10-18', 'M', 'Antonio Soto', 'Rosa Pérez', 8, true),
('Dolores', 'María', 'Méndez', 'Ramírez', '2006-01-25', 'F', 'Francisco Méndez', 'María Ramírez', 9, true),
('Ricardo', 'Luis', 'Castro', 'Sánchez', '2005-06-11', 'M', 'Luis Castro', 'Patricia Sánchez', 10, true),
('Guadalupe', 'Esperanza', 'López', 'Flores', '2004-04-07', 'F', 'Roberto López', 'Esperanza Flores', 6, true),
('Eduardo', 'Manuel', 'García', 'Gutiérrez', '2006-09-19', 'M', 'Manuel García', 'Laura Gutiérrez', 7, true);

-- Feligreses para matrimonios (parejas)
INSERT INTO feligres (primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, fecha_nacimiento, sexo, nombre_padre, nombre_madre, id_comunidad, activo) VALUES
('Juan', 'Carlos', 'Morales', 'Torres', '1995-02-14', 'M', 'Carlos Morales', 'María Torres', 6, true),
('María', 'Elena', 'Torres', 'Morales', '1997-05-20', 'F', 'Pedro Torres', 'Elena Morales', 6, true),
('Luis', 'Fernando', 'González', 'Vásquez', '1994-08-10', 'M', 'Fernando González', 'Carmen Vásquez', 7, true),
('Ana', 'Patricia', 'Vásquez', 'González', '1996-11-25', 'F', 'Luis Vásquez', 'Patricia González', 7, true),
('Pedro', 'Antonio', 'Rodríguez', 'Mendoza', '1993-12-05', 'M', 'Antonio Rodríguez', 'Rosa Mendoza', 8, true),
('Carmen', 'Rosa', 'Mendoza', 'Rodríguez', '1995-03-18', 'F', 'Pedro Mendoza', 'Rosa Rodríguez', 8, true),
('Carlos', 'Alberto', 'Hernández', 'Jiménez', '1994-07-22', 'M', 'Alberto Hernández', 'María Jiménez', 9, true),
('Laura', 'Isabel', 'Jiménez', 'Hernández', '1996-10-08', 'F', 'Carlos Jiménez', 'Isabel Hernández', 9, true),
('Miguel', 'Ángel', 'Pérez', 'Ruiz', '1993-09-15', 'M', 'Ángel Pérez', 'Carmen Ruiz', 10, true),
('Sofía', 'Alejandra', 'Ruiz', 'Pérez', '1995-01-30', 'F', 'Miguel Ruiz', 'Alejandra Pérez', 10, true),
('Francisco', 'José', 'Ramírez', 'Moreno', '1994-04-12', 'M', 'José Ramírez', 'Patricia Moreno', 6, true),
('Patricia', 'Esperanza', 'Moreno', 'Ramírez', '1996-08-25', 'F', 'Francisco Moreno', 'Esperanza Ramírez', 6, true),
('Roberto', 'Luis', 'Sánchez', 'Silva', '1993-11-18', 'M', 'Luis Sánchez', 'Rosa Silva', 7, true),
('Isabel', 'María', 'Silva', 'Sánchez', '1995-06-03', 'F', 'Roberto Silva', 'María Sánchez', 7, true),
('Antonio', 'Manuel', 'Flores', 'Cruz', '1994-09-20', 'M', 'Manuel Flores', 'Carmen Cruz', 8, true),
('Elena', 'Carmen', 'Cruz', 'Flores', '1996-12-14', 'F', 'Antonio Cruz', 'Carmen Flores', 8, true),
('David', 'Esteban', 'Gutiérrez', 'Aguilar', '1993-05-28', 'M', 'Esteban Gutiérrez', 'Laura Aguilar', 9, true),
('María', 'Dolores', 'Aguilar', 'Gutiérrez', '1995-10-11', 'F', 'David Aguilar', 'Dolores Gutiérrez', 9, true),
('Jorge', 'Ricardo', 'Díaz', 'Medina', '1994-01-24', 'M', 'Ricardo Díaz', 'Sofía Medina', 10, true),
('Beatriz', 'Victoria', 'Medina', 'Díaz', '1996-07-07', 'F', 'Jorge Medina', 'Victoria Díaz', 10, true),
('Fernando', 'Carlos', 'Ortega', 'Ramos', '1993-08-19', 'M', 'Carlos Ortega', 'Patricia Ramos', 6, true),
('Carmen', 'Rosa', 'Ramos', 'Ortega', '1995-02-02', 'F', 'Fernando Ramos', 'Rosa Ortega', 6, true),
('Eduardo', 'Francisco', 'Vargas', 'Torres', '1994-06-16', 'M', 'Francisco Vargas', 'Elena Torres', 7, true),
('Dolores', 'Esperanza', 'Torres', 'Vargas', '1996-11-29', 'F', 'Eduardo Torres', 'Esperanza Vargas', 7, true),
('Ricardo', 'Antonio', 'Mendoza', 'Guerrero', '1993-03-13', 'M', 'Antonio Mendoza', 'María Guerrero', 8, true),
('Guadalupe', 'Isabel', 'Guerrero', 'Mendoza', '1995-09-26', 'F', 'Ricardo Guerrero', 'Isabel Mendoza', 8, true);

-- Padrinos/Testigos adicionales
INSERT INTO feligres (primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, fecha_nacimiento, sexo, nombre_padre, nombre_madre, id_comunidad, activo) VALUES
('Andrés', 'Felipe', 'Castro', 'Morales', '1985-04-10', 'M', 'Felipe Castro', 'María Morales', 6, true),
('Mónica', 'Patricia', 'Morales', 'Castro', '1987-08-22', 'F', 'Andrés Morales', 'Patricia Castro', 6, true),
('Javier', 'Luis', 'González', 'Vega', '1986-11-15', 'M', 'Luis González', 'Carmen Vega', 7, true),
('Sandra', 'María', 'Vega', 'González', '1988-02-28', 'F', 'Javier Vega', 'María González', 7, true),
('Alejandro', 'Roberto', 'Martínez', 'Fuentes', '1985-07-05', 'M', 'Roberto Martínez', 'Ana Fuentes', 8, true),
('Verónica', 'Esperanza', 'Fuentes', 'Martínez', '1987-10-18', 'F', 'Alejandro Fuentes', 'Esperanza Martínez', 8, true),
('Óscar', 'Manuel', 'Rodríguez', 'Soto', '1986-01-30', 'M', 'Manuel Rodríguez', 'Rosa Soto', 9, true),
('Natalia', 'Isabel', 'Soto', 'Rodríguez', '1988-05-12', 'F', 'Óscar Soto', 'Isabel Rodríguez', 9, true),
('Héctor', 'Carlos', 'Hernández', 'Méndez', '1985-09-25', 'M', 'Carlos Hernández', 'Laura Méndez', 10, true),
('Gabriela', 'Rosa', 'Méndez', 'Hernández', '1987-12-08', 'F', 'Héctor Méndez', 'Rosa Hernández', 10, true);

-- ============================================================
-- 2. CREAR BAUTIZOS (23 bautizos)
-- ============================================================

DO $$
DECLARE
    v_id_asignacion BIGINT;
    v_feligres_id BIGINT;
    v_padrino1_id BIGINT;
    v_padrino2_id BIGINT;
    v_fecha DATE;
    v_fechas_bautizo DATE[] := ARRAY[
        '2023-01-15', '2023-02-20', '2023-03-10', '2023-04-05', '2023-05-12',
        '2023-06-18', '2023-07-22', '2023-08-14', '2023-09-08', '2023-10-25',
        '2023-11-30', '2024-01-10', '2024-02-15', '2024-03-20', '2024-04-25',
        '2024-05-30', '2024-06-12', '2024-07-18', '2024-08-22', '2024-09-28',
        '2024-10-15', '2024-11-20', '2024-12-10'
    ];
    v_bautizados_ids BIGINT[];
    v_padrinos_m_ids BIGINT[];
    v_padrinos_f_ids BIGINT[];
    i INTEGER;
BEGIN
    -- Obtener todos los niños para bautizar (nacidos después de 2019)
    SELECT ARRAY_AGG(id_feligres ORDER BY id_feligres) INTO v_bautizados_ids
    FROM (
        SELECT id_feligres
        FROM feligres 
        WHERE activo = true AND fecha_nacimiento >= '2019-01-01'
        ORDER BY id_feligres
        LIMIT 23
    ) subq;
    
    -- Obtener padrinos hombres
    SELECT ARRAY_AGG(id_feligres ORDER BY id_feligres) INTO v_padrinos_m_ids
    FROM (
        SELECT id_feligres
        FROM feligres 
        WHERE activo = true AND sexo = 'M' AND fecha_nacimiento < '2010-01-01'
        ORDER BY id_feligres
        LIMIT 10
    ) subq;
    
    -- Obtener padrinos mujeres
    SELECT ARRAY_AGG(id_feligres ORDER BY id_feligres) INTO v_padrinos_f_ids
    FROM (
        SELECT id_feligres
        FROM feligres 
        WHERE activo = true AND sexo = 'F' AND fecha_nacimiento < '2010-01-01'
        ORDER BY id_feligres
        LIMIT 10
    ) subq;
    
    FOR i IN 1..LEAST(23, array_length(v_bautizados_ids, 1)) LOOP
        v_feligres_id := v_bautizados_ids[i];
        
        -- Obtener padrinos rotando entre los disponibles
        IF array_length(v_padrinos_m_ids, 1) > 0 THEN
            v_padrino1_id := v_padrinos_m_ids[((i - 1) % array_length(v_padrinos_m_ids, 1)) + 1];
        ELSE
            v_padrino1_id := NULL;
        END IF;
        
        IF array_length(v_padrinos_f_ids, 1) > 0 THEN
            v_padrino2_id := v_padrinos_f_ids[((i - 1) % array_length(v_padrinos_f_ids, 1)) + 1];
        ELSE
            v_padrino2_id := NULL;
        END IF;
        
        v_fecha := v_fechas_bautizo[i];
        
        -- Validar que tenemos un feligrés para bautizar
        IF v_feligres_id IS NOT NULL THEN
            -- Insertar asignación de bautizo
            INSERT INTO sacramento_asignacion (id_sacramento, fecha_celebracion, pagado, monto_pagado, comentarios, activo)
            VALUES (1, v_fecha, (i % 3 = 0), CASE WHEN i % 3 = 0 THEN 150.00 ELSE NULL END, 'Bautizo registrado', true)
            RETURNING id_asignacion INTO v_id_asignacion;
            
            -- Insertar participante (bautizado)
            INSERT INTO sacramento_participante (id_asignacion, id_feligres, id_rol_participante)
            VALUES (v_id_asignacion, v_feligres_id, 1);
            
            -- Insertar padrinos
            IF v_padrino1_id IS NOT NULL THEN
                INSERT INTO testigos_padrinos (id_asignacion, id_feligres, id_tipo_testigo_padrino, numero_orden, activo)
                VALUES (v_id_asignacion, v_padrino1_id, 1, 1, true);
            END IF;
            
            IF v_padrino2_id IS NOT NULL THEN
                INSERT INTO testigos_padrinos (id_asignacion, id_feligres, id_tipo_testigo_padrino, numero_orden, activo)
                VALUES (v_id_asignacion, v_padrino2_id, 1, 2, true);
            END IF;
        END IF;
    END LOOP;
END $$;

-- ============================================================
-- 3. CREAR CONFIRMACIONES (12 confirmaciones)
-- ============================================================

DO $$
DECLARE
    v_id_asignacion BIGINT;
    v_feligres_id BIGINT;
    v_padrino1_id BIGINT;
    v_padrino2_id BIGINT;
    v_fecha DATE;
    v_fechas_confirmacion DATE[] := ARRAY[
        '2023-05-20', '2023-06-15', '2023-07-10', '2023-08-25',
        '2023-09-18', '2023-10-12', '2023-11-05', '2024-01-20',
        '2024-02-15', '2024-03-10', '2024-04-25', '2024-05-18'
    ];
    v_confirmados_ids BIGINT[];
    v_padrinos_m_ids BIGINT[];
    v_padrinos_f_ids BIGINT[];
    i INTEGER;
BEGIN
    -- Obtener jóvenes para confirmar (nacidos entre 2004-2006, que no tengan confirmación ya)
    SELECT ARRAY_AGG(id_feligres ORDER BY id_feligres) INTO v_confirmados_ids
    FROM (
        SELECT f.id_feligres
        FROM feligres f
        WHERE f.activo = true 
          AND f.fecha_nacimiento BETWEEN '2004-01-01' AND '2006-12-31'
          AND NOT EXISTS (
              SELECT 1 FROM sacramento_participante sp
              INNER JOIN sacramento_asignacion sa ON sp.id_asignacion = sa.id_asignacion
              WHERE sp.id_feligres = f.id_feligres 
                AND sa.id_sacramento = 3
                AND sa.activo = true
          )
        ORDER BY f.id_feligres
        LIMIT 12
    ) subq;
    
    -- Obtener padrinos hombres
    SELECT ARRAY_AGG(id_feligres ORDER BY id_feligres) INTO v_padrinos_m_ids
    FROM (
        SELECT id_feligres
        FROM feligres 
        WHERE activo = true AND sexo = 'M' AND fecha_nacimiento < '2000-01-01'
        ORDER BY id_feligres
        LIMIT 10
    ) subq;
    
    -- Obtener padrinos mujeres
    SELECT ARRAY_AGG(id_feligres ORDER BY id_feligres) INTO v_padrinos_f_ids
    FROM (
        SELECT id_feligres
        FROM feligres 
        WHERE activo = true AND sexo = 'F' AND fecha_nacimiento < '2000-01-01'
        ORDER BY id_feligres
        LIMIT 10
    ) subq;
    
    FOR i IN 1..LEAST(12, array_length(v_confirmados_ids, 1)) LOOP
        v_feligres_id := v_confirmados_ids[i];
        
        -- Obtener padrinos rotando entre los disponibles
        IF array_length(v_padrinos_m_ids, 1) > 0 THEN
            v_padrino1_id := v_padrinos_m_ids[((i - 1) % array_length(v_padrinos_m_ids, 1)) + 1];
        ELSE
            v_padrino1_id := NULL;
        END IF;
        
        IF array_length(v_padrinos_f_ids, 1) > 0 THEN
            v_padrino2_id := v_padrinos_f_ids[((i - 1) % array_length(v_padrinos_f_ids, 1)) + 1];
        ELSE
            v_padrino2_id := NULL;
        END IF;
        
        v_fecha := v_fechas_confirmacion[i];
        
        -- Validar que tenemos un feligrés para confirmar
        IF v_feligres_id IS NOT NULL THEN
            -- Insertar asignación de confirmación
            INSERT INTO sacramento_asignacion (id_sacramento, fecha_celebracion, pagado, monto_pagado, comentarios, activo)
            VALUES (3, v_fecha, (i % 2 = 0), CASE WHEN i % 2 = 0 THEN 200.00 ELSE NULL END, 'Confirmación registrada', true)
            RETURNING id_asignacion INTO v_id_asignacion;
            
            -- Insertar participante (confirmando)
            INSERT INTO sacramento_participante (id_asignacion, id_feligres, id_rol_participante)
            VALUES (v_id_asignacion, v_feligres_id, 2);
            
            -- Insertar padrinos
            IF v_padrino1_id IS NOT NULL THEN
                INSERT INTO testigos_padrinos (id_asignacion, id_feligres, id_tipo_testigo_padrino, numero_orden, activo)
                VALUES (v_id_asignacion, v_padrino1_id, 2, 1, true);
            END IF;
            
            IF v_padrino2_id IS NOT NULL THEN
                INSERT INTO testigos_padrinos (id_asignacion, id_feligres, id_tipo_testigo_padrino, numero_orden, activo)
                VALUES (v_id_asignacion, v_padrino2_id, 2, 2, true);
            END IF;
        END IF;
    END LOOP;
END $$;

-- ============================================================
-- 4. CREAR MATRIMONIOS (13 matrimonios)
-- ============================================================

DO $$
DECLARE
    v_id_asignacion BIGINT;
    v_novio_id BIGINT;
    v_novia_id BIGINT;
    v_testigo1_id BIGINT;
    v_testigo2_id BIGINT;
    v_fecha DATE;
    v_fechas_matrimonio DATE[] := ARRAY[
        '2023-06-10', '2023-07-15', '2023-08-20', '2023-09-25',
        '2023-10-30', '2023-11-12', '2024-01-18', '2024-02-22',
        '2024-03-28', '2024-04-10', '2024-05-15', '2024-06-20',
        '2024-07-25'
    ];
    v_novios_ids BIGINT[];
    v_novias_ids BIGINT[];
    v_testigos_ids BIGINT[];
    i INTEGER;
BEGIN
    -- Obtener todos los novios (hombres adultos para matrimonio)
    SELECT ARRAY_AGG(id_feligres ORDER BY id_feligres) INTO v_novios_ids
    FROM (
        SELECT id_feligres
        FROM feligres 
        WHERE activo = true AND sexo = 'M' AND fecha_nacimiento < '2000-01-01'
        ORDER BY id_feligres
        LIMIT 13
    ) subq;
    
    -- Obtener todas las novias (mujeres adultas para matrimonio)
    SELECT ARRAY_AGG(id_feligres ORDER BY id_feligres) INTO v_novias_ids
    FROM (
        SELECT id_feligres
        FROM feligres 
        WHERE activo = true AND sexo = 'F' AND fecha_nacimiento < '2000-01-01'
        ORDER BY id_feligres
        LIMIT 13
    ) subq;
    
    -- Obtener testigos (hombres adultos)
    SELECT ARRAY_AGG(id_feligres ORDER BY id_feligres) INTO v_testigos_ids
    FROM (
        SELECT id_feligres
        FROM feligres 
        WHERE activo = true AND sexo = 'M' AND fecha_nacimiento < '1990-01-01'
        ORDER BY id_feligres
        LIMIT 10
    ) subq;
    
    FOR i IN 1..LEAST(13, array_length(v_novios_ids, 1), array_length(v_novias_ids, 1)) LOOP
        v_novio_id := v_novios_ids[i];
        v_novia_id := v_novias_ids[i];
        
        -- Obtener testigos rotando entre los disponibles
        IF array_length(v_testigos_ids, 1) >= 2 THEN
            v_testigo1_id := v_testigos_ids[((i - 1) % array_length(v_testigos_ids, 1)) + 1];
            v_testigo2_id := v_testigos_ids[((i) % array_length(v_testigos_ids, 1)) + 1];
        ELSE
            v_testigo1_id := NULL;
            v_testigo2_id := NULL;
        END IF;
        
        v_fecha := v_fechas_matrimonio[i];
        
        -- Validar que tenemos novio y novia
        IF v_novio_id IS NOT NULL AND v_novia_id IS NOT NULL THEN
            -- Insertar asignación de matrimonio
            INSERT INTO sacramento_asignacion (id_sacramento, fecha_celebracion, pagado, monto_pagado, comentarios, activo)
            VALUES (4, v_fecha, (i % 2 = 0), CASE WHEN i % 2 = 0 THEN 500.00 ELSE NULL END, 'Matrimonio registrado', true)
            RETURNING id_asignacion INTO v_id_asignacion;
            
            -- Insertar participantes (novio y novia)
            INSERT INTO sacramento_participante (id_asignacion, id_feligres, id_rol_participante)
            VALUES (v_id_asignacion, v_novio_id, 4);
            
            INSERT INTO sacramento_participante (id_asignacion, id_feligres, id_rol_participante)
            VALUES (v_id_asignacion, v_novia_id, 4);
            
            -- Insertar testigos
            IF v_testigo1_id IS NOT NULL THEN
                INSERT INTO testigos_padrinos (id_asignacion, id_feligres, id_tipo_testigo_padrino, numero_orden, activo)
                VALUES (v_id_asignacion, v_testigo1_id, 3, 1, true);
            END IF;
            
            IF v_testigo2_id IS NOT NULL THEN
                INSERT INTO testigos_padrinos (id_asignacion, id_feligres, id_tipo_testigo_padrino, numero_orden, activo)
                VALUES (v_id_asignacion, v_testigo2_id, 3, 2, true);
            END IF;
        END IF;
    END LOOP;
END $$;

-- ============================================================
-- 5. CREAR CONSTANCIAS EXTERNAS
-- ============================================================

-- Crear algunas constancias externas de bautismo y confirmación
-- para feligreses que no tienen estos sacramentos registrados internamente

DO $$
DECLARE
    v_feligres_id BIGINT;
    v_fechas_constancia DATE[] := ARRAY[
        '2020-05-15', '2021-03-20', '2019-08-10', '2022-01-25',
        '2020-11-30', '2021-07-18', '2019-12-05', '2022-04-12'
    ];
    i INTEGER;
BEGIN
    -- Constancias externas de bautismo (4)
    FOR i IN 1..4 LOOP
        -- Seleccionar un feligrés que no tenga bautismo registrado
        SELECT f.id_feligres INTO v_feligres_id
        FROM feligres f
        WHERE f.activo = true
          AND NOT EXISTS (
              SELECT 1 FROM sacramento_participante sp
              INNER JOIN sacramento_asignacion sa ON sp.id_asignacion = sa.id_asignacion
              WHERE sp.id_feligres = f.id_feligres 
                AND sa.id_sacramento = 1
                AND sa.activo = true
          )
        ORDER BY f.id_feligres
        LIMIT 1 OFFSET (i - 1);
        
        IF v_feligres_id IS NOT NULL THEN
            INSERT INTO constancias_externas_sacramentos 
                (id_feligres, id_sacramento, libro, folio, descripcion, activo)
            VALUES 
                (v_feligres_id, 1, 
                 CASE i WHEN 1 THEN '15' WHEN 2 THEN '16' WHEN 3 THEN '17' ELSE '18' END,
                 CASE i WHEN 1 THEN '120' WHEN 2 THEN '125' WHEN 3 THEN '130' ELSE '135' END,
                 'Constancia externa de bautismo', true);
        END IF;
    END LOOP;
    
    -- Constancias externas de confirmación (4)
    FOR i IN 1..4 LOOP
        -- Seleccionar un feligrés que no tenga confirmación registrada
        SELECT f.id_feligres INTO v_feligres_id
        FROM feligres f
        WHERE f.activo = true
          AND NOT EXISTS (
              SELECT 1 FROM sacramento_participante sp
              INNER JOIN sacramento_asignacion sa ON sp.id_asignacion = sa.id_asignacion
              WHERE sp.id_feligres = f.id_feligres 
                AND sa.id_sacramento = 3
                AND sa.activo = true
          )
        ORDER BY f.id_feligres
        LIMIT 1 OFFSET (i + 3);
        
        IF v_feligres_id IS NOT NULL THEN
            INSERT INTO constancias_externas_sacramentos 
                (id_feligres, id_sacramento, libro, folio, descripcion, activo)
            VALUES 
                (v_feligres_id, 3, 
                 CASE i WHEN 1 THEN '8' WHEN 2 THEN '9' WHEN 3 THEN '10' ELSE '11' END,
                 CASE i WHEN 1 THEN '45' WHEN 2 THEN '50' WHEN 3 THEN '55' ELSE '60' END,
                 'Constancia externa de confirmación', true);
        END IF;
    END LOOP;
END $$;

COMMIT;

-- Verificar datos insertados
SELECT 'Bautizos creados:' as tipo, COUNT(*) as total
FROM sacramento_asignacion 
WHERE id_sacramento = 1 AND activo = true
UNION ALL
SELECT 'Confirmaciones creadas:', COUNT(*)
FROM sacramento_asignacion 
WHERE id_sacramento = 3 AND activo = true
UNION ALL
SELECT 'Matrimonios creados:', COUNT(*)
FROM sacramento_asignacion 
WHERE id_sacramento = 4 AND activo = true
UNION ALL
SELECT 'Constancias externas:', COUNT(*)
FROM constancias_externas_sacramentos 
WHERE activo = true;

