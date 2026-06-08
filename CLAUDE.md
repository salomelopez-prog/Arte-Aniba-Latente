# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Arte Aniba Latente is a full-stack e-commerce web application for a handcrafted wood art shop (San Rafael, Antioquia). The site sells artisanal pieces carved from "comino crespo" wood and includes an admin panel for inventory/order management.

## Commands

### Frontend (project root)
```powershell
npm run dev       # Start Vite dev server (port 5173, proxies /api → localhost:3001)
npm run build     # Production build to dist/
npm run preview   # Preview production build
```

### Backend (server/ directory)
```powershell
cd server
npm run dev       # Start Express with --watch (auto-restart, port 3001)
npm start         # Production start
```

Both servers must run simultaneously during development.

### Database Setup
```powershell
psql -U postgres -d arte_aniba -f database/001_create_tables.sql
psql -U postgres -d arte_aniba -f database/002_seed_products.sql
psql -U postgres -d arte_aniba -f database/003_seed_admin.sql
```

See [database/README.md](database/README.md) for full setup instructions. Default admin password is `ArteAniba2026!`.

## Architecture

### Frontend (React + Vite)

**State management** uses three React Context providers nested in [src/main.jsx](src/main.jsx):
- `AuthContext` — admin login state and JWT tokens
- `ProductContext` — product catalog data
- `CartContext` — shopping cart state

**Routing and page transitions** are defined in [src/app.jsx](src/app.jsx) with Framer Motion animations between routes.

**API calls** all go through [src/api/client.js](src/api/client.js), which handles auth token attachment and refresh logic. Never use `fetch` directly — use this client.

**Pages:** Home, Catalog, About, Contact, Login (admin), Admin (dashboard)

**UI components** live in `src/components/` organized by domain:
- `cart/` — CartDrawer and CartItem
- `layout/` — Navbar and Footer
- `ui/` — ChatBot, PaymentModal, ProductCard, WhatsAppButton

**Styling** uses TailwindCSS v4 (Vite plugin). Custom CSS variables and utility classes (grain overlay, topographic background) are in [src/index.css](src/index.css). Fonts are Afacad (UI) and Fraunces (headings), loaded from Google Fonts in [index.html](index.html).

### Backend (Express + PostgreSQL)

**Entry point:** [server/index.js](server/index.js)

**Request flow:** `index.js` → security middleware → routes → controllers → services/db

**Database** connection pool is in [server/config/db.js](server/config/db.js). Uses the `pg` library with a connection pool. All queries use parameterized statements.

**Auth middleware** at [server/middleware/auth.js](server/middleware/auth.js) validates JWT tokens. Protected admin routes require this middleware.

**Controllers** contain business logic; **routes** only wire HTTP methods to controllers.

**Services:**
- [server/services/bold.js](server/services/bold.js) — Bold Colombia payment gateway integration
- [server/services/email.js](server/services/email.js) — Nodemailer SMTP (Gmail) for order/contact notifications

**File uploads** handled by Multer in [server/middleware/upload.js](server/middleware/upload.js); files stored in `server/uploads/` (gitignored except `.gitkeep`).

### Database Schema (12 tables)

Key tables: `products`, `categories`, `orders`, `order_items`, `customers`, `contact_messages`, `admin_users`, `sessions`, `audit_log`, `email_log`, `inventory_movements`, `site_settings`.

All schema and seed SQL is in `database/`.

## Environment Variables

**Frontend** (project root `.env`):
- `VITE_API_URL` — backend API base URL

**Backend** (`server/.env`, see `server/.env.example` for all keys):
- PostgreSQL connection (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`)
- JWT secrets and expiration (`JWT_SECRET`, `JWT_REFRESH_SECRET` — 8h access, 7d refresh)
- Bold Colombia payment credentials
- SMTP email config (Gmail)
- `PORT` (default 3001), `NODE_ENV`, `CORS_ORIGIN`
- Upload limits (`UPLOAD_DIR`, `MAX_FILE_SIZE` — 5MB default)

## Key Conventions

- Both `package.json` files use `"type": "module"` — ES module syntax (`import`/`export`) everywhere, no CommonJS.
- The Vite dev server proxies all `/api/*` requests to `http://localhost:3001`, so frontend code always calls `/api/...` without hardcoding the backend port.
- Admin authentication uses JWT with a separate refresh token flow; tokens are managed in `AuthContext` and attached by the API client.
- Product images are stored in `server/uploads/` and served as static files from the Express server.
