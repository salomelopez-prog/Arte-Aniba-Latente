-- ============================================================
-- ARTE ANIBA — Agrupar variantes de tamaño de un mismo producto
-- 004_add_grupo.sql
-- Agrega una columna OPCIONAL 'grupo'. Los productos con el mismo
-- valor de 'grupo' se muestran como una sola tarjeta con selector
-- de tamaño. Los que tienen grupo NULL se muestran individualmente.
-- Es un cambio aditivo y no rompe nada existente.
-- ============================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS grupo VARCHAR(120);

CREATE INDEX IF NOT EXISTS idx_products_grupo ON products(grupo) WHERE grupo IS NOT NULL;
