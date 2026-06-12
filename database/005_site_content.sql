-- ============================================================
-- ARTE ANIBA — Contenido editable de Inicio y Nosotros
-- 005_site_content.sql
-- Crea dos claves en site_settings que la dueña edita desde el admin:
--   home_gallery  -> JSON array de URLs de imágenes del Inicio
--   about_content -> JSON con todo el contenido de la página Nosotros
-- Valores iniciales vacíos: el frontend usa su contenido por defecto como respaldo.
-- ============================================================

INSERT INTO site_settings (key, value, description) VALUES
  ('home_gallery', '[]', 'Galería de imágenes del Inicio (JSON de URLs)'),
  ('about_content', '', 'Contenido editable de la página Nosotros (JSON)')
ON CONFLICT (key) DO NOTHING;
