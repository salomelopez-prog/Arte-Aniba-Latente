-- ============================================================
-- ARTE ANIBA — Base de datos PostgreSQL
-- 001_create_tables.sql
-- Ejecutar primero. Crea todas las tablas, índices y constraints.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. ADMIN_USERS
-- ============================================================
CREATE TABLE admin_users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    name            VARCHAR(150) NOT NULL,
    role            VARCHAR(20) NOT NULL DEFAULT 'editor'
                        CHECK (role IN ('superadmin', 'editor')),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    failed_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until    TIMESTAMPTZ,
    last_login      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. SESSIONS
-- ============================================================
CREATE TABLE sessions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id   UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    token_hash      VARCHAR(255) NOT NULL,
    ip_address      INET,
    user_agent      TEXT,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_admin_user   ON sessions(admin_user_id);
CREATE INDEX idx_sessions_token_hash   ON sessions(token_hash);
CREATE INDEX idx_sessions_expires      ON sessions(expires_at);

-- ============================================================
-- 3. CATEGORIES
-- ============================================================
CREATE TABLE categories (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL UNIQUE,
    slug            VARCHAR(120) NOT NULL UNIQUE,
    description     TEXT,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. PRODUCTS
-- ============================================================
CREATE TABLE products (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference               VARCHAR(20) NOT NULL UNIQUE,
    name                    VARCHAR(200) NOT NULL,
    slug                    VARCHAR(220) NOT NULL UNIQUE,
    category_id             INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    price                   INTEGER NOT NULL CHECK (price > 0),
    compare_price           INTEGER CHECK (compare_price IS NULL OR compare_price > 0),
    description             TEXT NOT NULL,
    short_description       VARCHAR(300),
    material                TEXT,
    size                    VARCHAR(100),
    dimensions              VARCHAR(100),
    weight_grams            INTEGER,
    tone                    VARCHAR(60),
    image_url               TEXT,
    gallery_images          JSONB DEFAULT '[]'::jsonb,
    stock_quantity           INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    stock_alert_threshold   INTEGER NOT NULL DEFAULT 3,
    is_active               BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured             BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order              INTEGER NOT NULL DEFAULT 0,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category     ON products(category_id);
CREATE INDEX idx_products_reference    ON products(reference);
CREATE INDEX idx_products_slug         ON products(slug);
CREATE INDEX idx_products_active       ON products(is_active);
CREATE INDEX idx_products_featured     ON products(is_featured);
CREATE INDEX idx_products_stock_low    ON products(stock_quantity, stock_alert_threshold)
    WHERE is_active = TRUE;

-- ============================================================
-- 5. CUSTOMERS
-- ============================================================
CREATE TABLE customers (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name          VARCHAR(100) NOT NULL,
    last_name           VARCHAR(100),
    email               VARCHAR(255) UNIQUE,
    phone               VARCHAR(30),
    whatsapp            VARCHAR(30),
    city                VARCHAR(100),
    department          VARCHAR(100),
    address             TEXT,
    customer_type       VARCHAR(20) NOT NULL DEFAULT 'individual'
                            CHECK (customer_type IN ('individual', 'empresarial')),
    company_name        VARCHAR(200),
    notes               TEXT,
    total_spent         INTEGER NOT NULL DEFAULT 0,
    order_count         INTEGER NOT NULL DEFAULT 0,
    first_purchase_at   TIMESTAMPTZ,
    last_purchase_at    TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_email       ON customers(email);
CREATE INDEX idx_customers_phone       ON customers(phone);
CREATE INDEX idx_customers_type        ON customers(customer_type);
CREATE INDEX idx_customers_city        ON customers(city);

-- ============================================================
-- 6. ORDERS
-- ============================================================
CREATE SEQUENCE order_number_seq START WITH 1;

CREATE TABLE orders (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number        VARCHAR(20) NOT NULL UNIQUE
                            DEFAULT 'AA-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0'),
    customer_id         UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    status              VARCHAR(20) NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled')),
    subtotal            INTEGER NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    shipping_cost       INTEGER NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
    total               INTEGER NOT NULL DEFAULT 0 CHECK (total >= 0),
    payment_method      VARCHAR(50),
    payment_reference   VARCHAR(200),
    bold_payment_id     VARCHAR(200),
    shipping_carrier    VARCHAR(100),
    tracking_number     VARCHAR(100),
    shipping_address    TEXT,
    shipping_city       VARCHAR(100),
    shipping_department VARCHAR(100),
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    paid_at             TIMESTAMPTZ,
    shipped_at          TIMESTAMPTZ,
    delivered_at        TIMESTAMPTZ
);

CREATE INDEX idx_orders_customer       ON orders(customer_id);
CREATE INDEX idx_orders_number         ON orders(order_number);
CREATE INDEX idx_orders_status         ON orders(status);
CREATE INDEX idx_orders_created        ON orders(created_at DESC);
CREATE INDEX idx_orders_bold_payment   ON orders(bold_payment_id) WHERE bold_payment_id IS NOT NULL;

-- ============================================================
-- 7. ORDER_ITEMS
-- ============================================================
CREATE TABLE order_items (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id            UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id          UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name        VARCHAR(200) NOT NULL,
    product_reference   VARCHAR(20) NOT NULL,
    quantity            INTEGER NOT NULL CHECK (quantity > 0),
    unit_price          INTEGER NOT NULL CHECK (unit_price > 0),
    subtotal            INTEGER NOT NULL CHECK (subtotal > 0)
);

CREATE INDEX idx_order_items_order     ON order_items(order_id);
CREATE INDEX idx_order_items_product   ON order_items(product_id);

-- ============================================================
-- 8. CONTACT_MESSAGES
-- ============================================================
CREATE TABLE contact_messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(150) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    phone           VARCHAR(30),
    message         TEXT NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'new'
                        CHECK (status IN ('new', 'read', 'replied')),
    admin_notes     TEXT,
    replied_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contact_status        ON contact_messages(status);
CREATE INDEX idx_contact_created       ON contact_messages(created_at DESC);

-- ============================================================
-- 9. INVENTORY_MOVEMENTS
-- ============================================================
CREATE TABLE inventory_movements (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id          UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    movement_type       VARCHAR(20) NOT NULL
                            CHECK (movement_type IN ('in', 'out', 'adjustment')),
    quantity            INTEGER NOT NULL,
    previous_stock      INTEGER NOT NULL,
    new_stock           INTEGER NOT NULL,
    reason              VARCHAR(300),
    reference_order_id  UUID REFERENCES orders(id) ON DELETE SET NULL,
    created_by          UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inventory_product     ON inventory_movements(product_id);
CREATE INDEX idx_inventory_type        ON inventory_movements(movement_type);
CREATE INDEX idx_inventory_created     ON inventory_movements(created_at DESC);

-- ============================================================
-- 10. EMAIL_LOG
-- ============================================================
CREATE TABLE email_log (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_email     VARCHAR(255) NOT NULL,
    subject             VARCHAR(500) NOT NULL,
    template_type       VARCHAR(50) NOT NULL,
    related_order_id    UUID REFERENCES orders(id) ON DELETE SET NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'sent'
                            CHECK (status IN ('sent', 'failed')),
    error_message       TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_email_log_order       ON email_log(related_order_id);
CREATE INDEX idx_email_log_status      ON email_log(status);
CREATE INDEX idx_email_log_created     ON email_log(created_at DESC);

-- ============================================================
-- 11. AUDIT_LOG
-- ============================================================
CREATE TABLE audit_log (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id   UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    action          VARCHAR(50) NOT NULL,
    entity_type     VARCHAR(50) NOT NULL,
    entity_id       VARCHAR(100),
    old_values      JSONB,
    new_values      JSONB,
    ip_address      INET,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_admin           ON audit_log(admin_user_id);
CREATE INDEX idx_audit_entity          ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_action          ON audit_log(action);
CREATE INDEX idx_audit_created         ON audit_log(created_at DESC);

-- ============================================================
-- 12. SITE_SETTINGS
-- ============================================================
CREATE TABLE site_settings (
    id              SERIAL PRIMARY KEY,
    key             VARCHAR(100) NOT NULL UNIQUE,
    value           TEXT NOT NULL,
    description     VARCHAR(300),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by      UUID REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE INDEX idx_settings_key          ON site_settings(key);

-- ============================================================
-- FUNCIÓN: Actualizar updated_at automáticamente
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_admin_users_updated   BEFORE UPDATE ON admin_users   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_products_updated      BEFORE UPDATE ON products      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_customers_updated     BEFORE UPDATE ON customers     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_orders_updated        BEFORE UPDATE ON orders        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_settings_updated      BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
