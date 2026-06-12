import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { securityHeaders, corsOptions, apiLimiter } from './middleware/security.js';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import customerRoutes from './routes/customers.js';
import contactRoutes from './routes/contacts.js';
import paymentRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';
import settingRoutes from './routes/settings.js';
import emailLogRoutes from './routes/emailLog.js';
import uploadRoutes from './routes/upload.js';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3001;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(securityHeaders);
app.use(cors(corsOptions));

// Guarda el cuerpo crudo (raw) para poder verificar la firma del webhook de Bold.
app.use(express.json({ limit: '10mb', verify: (req, res, buf) => { req.rawBody = buf.toString('utf8'); } }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/', apiLimiter);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/email-log', emailLogRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

app.use((err, req, res, next) => {
  console.error('[Server] Error no manejado:', err.message);
  console.error(err.stack);
  res.status(500).json({
    error: 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { details: err.message }),
  });
});

app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

app.listen(PORT, () => {
  console.log(`\n  🏪  Arte Aniba — Backend`);
  console.log(`  ─────────────────────────`);
  console.log(`  Servidor: http://localhost:${PORT}`);
  console.log(`  API:      http://localhost:${PORT}/api`);
  console.log(`  Salud:    http://localhost:${PORT}/api/health`);
  console.log(`  Entorno:  ${process.env.NODE_ENV || 'development'}\n`);
});
