# Base de datos — Arte Aniba

## Requisitos

- PostgreSQL 15+
- Node.js 20+ (para generar el hash de contraseña)

## Configuración paso a paso

### 1. Crear usuario y base de datos

Abre una terminal y ejecuta:

```bash
sudo -u postgres psql
```

Dentro de psql:

```sql
CREATE USER arteaniba_admin WITH PASSWORD 'tu_password_seguro';
CREATE DATABASE arteaniba OWNER arteaniba_admin;
GRANT ALL PRIVILEGES ON DATABASE arteaniba TO arteaniba_admin;
\c arteaniba
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
\q
```

### 2. Ejecutar scripts SQL en orden

```bash
psql -U arteaniba_admin -d arteaniba -f database/001_create_tables.sql
psql -U arteaniba_admin -d arteaniba -f database/002_seed_products.sql
psql -U arteaniba_admin -d arteaniba -f database/003_seed_admin.sql
```

### 3. Generar el hash real del password del admin

El password por defecto es `ArteAniba2026!`. El hash en `003_seed_admin.sql` es un placeholder. Genera el hash real:

```bash
cd server
npm install bcrypt
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('ArteAniba2026!', 12).then(h => console.log(h));"
```

Luego actualiza en la base de datos:

```bash
psql -U arteaniba_admin -d arteaniba
UPDATE admin_users SET password_hash = 'EL_HASH_GENERADO' WHERE email = 'admin@arteaniba.com';
```

### 4. Verificar instalación

```bash
psql -U arteaniba_admin -d arteaniba
SELECT COUNT(*) AS total_tablas FROM information_schema.tables WHERE table_schema = 'public';
-- Debe dar 12

SELECT COUNT(*) AS total_productos FROM products;
-- Debe dar 28

SELECT COUNT(*) AS total_categorias FROM categories;
-- Debe dar 10

SELECT email, role FROM admin_users;
-- Debe mostrar admin@arteaniba.com / superadmin
```

### 5. Configurar .env del servidor

Copia `server/.env.example` a `server/.env` y actualiza las credenciales:

```
DATABASE_URL=postgresql://arteaniba_admin:tu_password_seguro@localhost:5432/arteaniba
```

## Estructura de la base de datos (12 tablas)

| Tabla | Propósito |
|-------|-----------|
| `admin_users` | Usuarios del panel de administración |
| `sessions` | Sesiones activas (JWT) |
| `categories` | Categorías de productos |
| `products` | Catálogo de productos |
| `customers` | CRM de clientes |
| `orders` | Pedidos |
| `order_items` | Productos dentro de cada pedido |
| `contact_messages` | Mensajes del formulario de contacto |
| `inventory_movements` | Historial de movimientos de inventario |
| `email_log` | Registro de emails enviados |
| `audit_log` | Auditoría de acciones del admin |
| `site_settings` | Configuración editable del sitio |
