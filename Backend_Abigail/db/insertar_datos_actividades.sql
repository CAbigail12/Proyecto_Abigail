-- ============================================================
-- DATOS DE PRUEBA PARA ACTIVIDADES RELIGIOSAS
-- ============================================================

BEGIN;

-- Insertar tipos de actividad
INSERT INTO cat_tipo_actividad (nombre, descripcion) VALUES
('Misa', 'Celebración eucarística'),
('Bendición', 'Ceremonia de bendición de objetos o personas'),
('Recaudación', 'Actividad para recaudar fondos'),
('Catequesis', 'Enseñanza de la doctrina católica'),
('Retiro Espiritual', 'Actividad de reflexión y oración'),
('Procesión', 'Desfile religioso'),
('Vigilia', 'Oración nocturna'),
('Bautizo', 'Sacramento del bautismo'),
('Matrimonio', 'Sacramento del matrimonio'),
('Confirmación', 'Sacramento de la confirmación')
ON CONFLICT (nombre) DO NOTHING;

-- Insertar actividades religiosas de prueba
INSERT INTO actividad_religiosa (id_tipo_actividad, nombre, descripcion, fecha_actividad, hora_actividad, lugar) VALUES
(1, 'Misa Dominical', 'Misa dominical para toda la comunidad', '2024-12-22', '10:00', 'Nave Principal'),
(1, 'Misa de Navidad', 'Celebración especial de Navidad', '2024-12-25', '18:00', 'Nave Principal'),
(2, 'Bendición de Vehículos', 'Bendición de vehículos de la comunidad', '2024-12-28', '09:00', 'Estacionamiento'),
(3, 'Bazar Navideño', 'Venta de artículos para recaudar fondos', '2024-12-20', '14:00', 'Salón Parroquial'),
(4, 'Catequesis de Primera Comunión', 'Clase para niños de primera comunión', '2024-12-23', '16:00', 'Aula de Catequesis'),
(5, 'Retiro de Adviento', 'Retiro espiritual para preparar la Navidad', '2024-12-21', '08:00', 'Capilla'),
(6, 'Procesión de la Virgen', 'Procesión en honor a la Virgen María', '2024-12-24', '19:00', 'Alrededores de la Iglesia'),
(7, 'Vigilia de Navidad', 'Vigilia de oración antes de la Navidad', '2024-12-24', '22:00', 'Nave Principal'),
(1, 'Misa de Año Nuevo', 'Celebración de Año Nuevo', '2025-01-01', '10:00', 'Nave Principal'),
(2, 'Bendición de Casas', 'Bendición de hogares de la comunidad', '2025-01-05', '15:00', 'Domicilios');

COMMIT;
