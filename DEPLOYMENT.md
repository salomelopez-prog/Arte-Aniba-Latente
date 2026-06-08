# Deployment en Render — Arte Aniba Latente

Guía paso a paso para publicar el proyecto (frontend React + backend Express + PostgreSQL)
en [Render.com](https://render.com) y conectar un dominio.

Arquitectura en producción:

```
┌─────────────────────┐      HTTPS       ┌──────────────────────┐
│  Static Site (Vite) │ ───────────────► │  Web Service (Express)│
│  arteaniba.com      │   /api/* fetch   │  api.arteaniba.com    │
└─────────────────────┘                  └───────────┬──────────┘
                                                      │
                                          ┌───────────▼──────────┐
                                          │  PostgreSQL (Render)  │
                                          └───────────────────────┘
   Imágenes de productos ──► Cloudinary (almacenamiento externo gratuito)
```

> ⚠️ **Importante**: el disco de Render es **efímero**; se borra en cada deploy. Por eso las
> imágenes de productos se suben a **Cloudinary** (ya integrado en el código), no al disco local.

---

## 0. Requisitos previos

1. Cuenta en [Render.com](https://render.com) (gratis).
2. Cuenta gratuita en [Cloudinary](https://cloudinary.com) → del **Dashboard** copia
   `Cloud name`, `API Key` y `API Secret`.
3. El proyecto subido a un repositorio de **GitHub** (Render despliega desde GitHub).
   - Si aún no tienes commits:
     ```powershell
     git add .
     git commit -m "Proyecto Arte Aniba listo para deploy"
     git branch -M main
     git remote add origin https://github.com/TU_USUARIO/arte-aniba.git
     git push -u origin main
     ```
4. (Opcional) Credenciales reales de **Bold Colombia** y **SMTP Gmail**. Si no las pones,
   el sistema funciona en **modo simulado** para pagos y registra los emails sin enviarlos.

---

## 1. Crear la base de datos PostgreSQL

1. En Render: **New + → PostgreSQL**.
2. Nombre: `arte-aniba-db`. Región: la más cercana (ej. Oregon / Ohio). Plan: **Free**.
3. Crear y esperar a que esté *Available*.
4. Copia la **Internal Database URL** (para el backend en Render) y la **External Database URL**
   (para correr las migraciones desde tu PC).

---

## 2. Ejecutar las migraciones SQL

Con la **External Database URL** y `psql` instalado localmente, corre los 3 scripts en orden:

```powershell
psql "EXTERNAL_DATABASE_URL_AQUI" -f database/001_create_tables.sql
psql "EXTERNAL_DATABASE_URL_AQUI" -f database/002_seed_products.sql
psql "EXTERNAL_DATABASE_URL_AQUI" -f database/003_seed_admin.sql
```

> Si no tienes `psql`, usa la pestaña **Connect → PSQL Command** del dashboard de Render, o
> pega el contenido de cada `.sql` en un cliente como [DBeaver](https://dbeaver.io) / pgAdmin.

**Regenerar el hash del admin** (el seed trae un placeholder). Genera un hash bcrypt para tu
contraseña y actualízalo:

```powershell
cd server
node -e "import('bcrypt').then(b=>b.hash('TU_PASSWORD_SEGURA',10).then(h=>console.log(h)))"
```

```sql
UPDATE admin_users SET password_hash = 'EL_HASH_GENERADO' WHERE email = 'admin@arteaniba.com';
```

---

## 3. Crear el Web Service (backend)

1. **New + → Web Service** → conecta tu repo de GitHub.
2. Configuración:
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
3. **Environment Variables** (pestaña *Environment*):

   | Variable | Valor |
   |---|---|
   | `DATABASE_URL` | *Internal Database URL* del paso 1 |
   | `NODE_ENV` | `production` |
   | `PORT` | `3001` (Render lo inyecta solo; el código respeta `process.env.PORT`) |
   | `JWT_SECRET` | una cadena larga aleatoria |
   | `JWT_REFRESH_SECRET` | otra cadena larga aleatoria |
   | `JWT_EXPIRATION` | `8h` |
   | `JWT_REFRESH_EXPIRATION` | `7d` |
   | `CORS_ORIGINS` | URL del frontend, ej. `https://arte-aniba.onrender.com` |
   | `CLIENT_URL` | igual que arriba |
   | `CLOUDINARY_CLOUD_NAME` | de tu dashboard Cloudinary |
   | `CLOUDINARY_API_KEY` | de tu dashboard Cloudinary |
   | `CLOUDINARY_API_SECRET` | de tu dashboard Cloudinary |
   | `BOLD_API_KEY` / `BOLD_SECRET_KEY` / `BOLD_WEBHOOK_SECRET` | de Bold (o vacío = simulado) |
   | `BOLD_API_URL` | `https://api.bold.co` |
   | `BOLD_REDIRECT_URL` | `https://arte-aniba.onrender.com/pago/confirmacion` |
   | `SMTP_HOST` `SMTP_PORT` `SMTP_USER` `SMTP_PASS` | datos Gmail (o vacío) |
   | `EMAIL_FROM` `ADMIN_NOTIFICATION_EMAIL` | tu correo |

4. Deploy. Verifica `https://TU-BACKEND.onrender.com/api/health` → debe responder `{ "status": "ok" }`.

> Generar secretos JWT rápido: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

---

## 4. Crear el Static Site (frontend)

1. **New + → Static Site** → mismo repo.
2. Configuración:
   - **Root Directory**: *(vacío / raíz del repo)*
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
3. **Environment Variables**:

   | Variable | Valor |
   |---|---|
   | `VITE_API_URL` | `https://TU-BACKEND.onrender.com/api` |

4. **Redirect/Rewrite Rules** (pestaña *Redirects/Rewrites*) — necesario para React Router:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`

5. Deploy. La URL queda como `https://arte-aniba.onrender.com`.

> Después de saber la URL final del frontend, vuelve al backend y confirma que `CORS_ORIGINS`,
> `CLIENT_URL` y `BOLD_REDIRECT_URL` apunten a ella. Cambiar env vars redeploya el servicio.

---

## 5. Cambios de código para producción

El código ya está preparado; estos puntos quedan cubiertos:

- **CORS por entorno**: [server/middleware/security.js](server/middleware/security.js) lee
  `CORS_ORIGINS`. (Se corrigió `app.use(cors(corsOptions))` en
  [server/index.js](server/index.js).)
- **API URL del frontend**: [src/api/client.js](src/api/client.js) usa `import.meta.env.VITE_API_URL`.
- **Pagos Bold**: `BOLD_REDIRECT_URL` y `CLIENT_URL` deben ser URLs de producción (ver tabla).
- **Imágenes**: se suben a Cloudinary vía [server/services/cloudinary.js](server/services/cloudinary.js).
- **Webhook Bold** (si usas pagos reales): en el panel de Bold registra
  `https://TU-BACKEND.onrender.com/api/payments/webhook`.

No se requieren más cambios de código.

---

## 6. Comprar y conectar un dominio (opcional)

**Registradores recomendados (económicos y confiables para Colombia):**
- [Porkbun](https://porkbun.com) — de los más baratos, buena interfaz (`.com` ~ USD 9-11/año).
- [Namecheap](https://namecheap.com) — popular, soporte sólido.
- Dominios `.co` (Colombia): se consiguen en [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) o GoDaddy.

> Google Domains **ya no existe**: migró a Squarespace Domains. Mejor usa Porkbun o Namecheap.

**Conectar el dominio a Render:**
1. En el Static Site → **Settings → Custom Domains → Add Custom Domain** (ej. `arteaniba.com`).
2. Render te muestra los registros DNS a crear. En tu registrador agrega:
   - `A` o `ALIAS`/`CNAME` para la raíz `arteaniba.com` → apuntando al valor que indica Render.
   - `CNAME` para `www` → `arte-aniba.onrender.com`.
3. (Opcional) Para el backend con subdominio `api.arteaniba.com`: añádelo como Custom Domain del
   Web Service y un `CNAME api → TU-BACKEND.onrender.com`. Luego actualiza `VITE_API_URL` y
   `CORS_ORIGINS` a los dominios propios.
4. Espera la propagación DNS (minutos a 48h). Render emite el certificado HTTPS automáticamente.

**Si no quieres comprar dominio:** usa directamente las URLs gratuitas `*.onrender.com`. Funcionan
con HTTPS sin configuración extra.

---

## 7. Notas del plan gratuito de Render

- El Web Service Free **se duerme** tras 15 min de inactividad; la primera petición tras dormir
  tarda ~30-50 s en responder. Para producción real, sube al plan **Starter**.
- La base de datos Free **expira a los 90 días**. Haz backup (`pg_dump`) o sube de plan antes.
- Cloudinary Free cubre de sobra el catálogo de una tienda pequeña.
