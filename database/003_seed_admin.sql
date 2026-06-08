-- ============================================================
-- ARTE ANIBA — Usuario admin y configuración inicial
-- 003_seed_admin.sql
-- Ejecutar después de 001 y 002.
-- ============================================================

INSERT INTO admin_users (email, password_hash, name, role, is_active) VALUES
    (
        'admin@arteaniba.com',
        '$2b$12$LJ3m5ZQxNBk8Pf4Y1vK7wOzHX9R2gN6dM8eA3cF5hJ7kL0pQ2rS4u',
        'Administrador Arte Aniba',
        'superadmin',
        TRUE
    );

INSERT INTO site_settings (key, value, description) VALUES

    ('site_name',
     'Arte Aniba',
     'Nombre del sitio web'),

    ('site_tagline',
     'Raíces que vuelven a tener forma',
     'Eslogan principal del sitio'),

    ('site_description',
     'Piezas talladas a mano en comino crespo recuperado. Cada veta, grieta y curva se conserva como parte de la historia natural de la madera.',
     'Descripción para SEO y meta tags'),

    ('contact_phone',
     '+57 313 7975713',
     'Teléfono/WhatsApp de contacto principal'),

    ('contact_email',
     'arteaniba@gmail.com',
     'Email de contacto público'),

    ('contact_instagram',
     '@arteaniba',
     'Handle de Instagram'),

    ('contact_address',
     'Vereda El Arenal, San Rafael, Antioquia, Colombia',
     'Dirección física del taller'),

    ('whatsapp_number',
     '573137975713',
     'Número de WhatsApp sin + ni espacios'),

    ('shipping_national_carrier',
     'Interrapidísimo',
     'Transportadora principal nacional'),

    ('shipping_national_days',
     '3-4 días hábiles',
     'Tiempo estimado de envío nacional'),

    ('shipping_local_info',
     'Medellín y alrededores: servicio de mensajería local con entregas más rápidas según disponibilidad.',
     'Información de envío local'),

    ('payment_methods_info',
     'Tarjetas de crédito y débito (Bold), Nequi, DaviPlata, BanColombia, Nubank, transferencias bancarias.',
     'Métodos de pago aceptados'),

    ('payment_commission_note',
     'La comisión del medio de pago se cobra al cliente.',
     'Nota sobre comisiones'),

    ('stock_low_threshold_default',
     '3',
     'Umbral por defecto de stock bajo'),

    ('hero_title',
     'Raíces que vuelven a tener forma.',
     'Título principal del hero en Home'),

    ('hero_subtitle',
     'Piezas talladas a mano en comino crespo recuperado. Cada veta, grieta y curva se conserva como parte de la historia natural de la madera.',
     'Subtítulo del hero en Home'),

    ('about_main_text',
     'Arte Aniba es un taller familiar de San Rafael, Antioquia. Transformamos raíces recuperadas de comino crespo en objetos decorativos con carácter: hongos, lámparas, corazones y composiciones orgánicas.',
     'Texto principal de la página Nosotros'),

    ('footer_copyright',
     '© 2026 Arte Aniba. Todos los derechos reservados. Madera recuperada, piezas únicas.',
     'Texto de copyright del footer');
