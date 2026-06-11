import crypto from 'crypto';

// Llave de IDENTIDAD (pública, identifica el comercio) y llave SECRETA (privada, firma).
const BOLD_IDENTITY_KEY = process.env.BOLD_API_KEY;
const BOLD_SECRET_KEY = process.env.BOLD_SECRET_KEY;

// Construye la configuración del Botón de Pagos de Bold para un pedido.
// La firma de integridad es SHA256("{orderId}{amount}{currency}{secretKey}")
// y se calcula en el servidor para no exponer la llave secreta.
// Si no hay llaves configuradas, devuelve modo simulado (como antes).
const buildCheckout = ({ orderNumber, total }) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  if (!BOLD_IDENTITY_KEY || !BOLD_SECRET_KEY) {
    console.warn('[Bold] Llaves no configuradas. Usando modo simulado.');
    return {
      simulated: true,
      paymentUrl: `${clientUrl}/pago/simulado?order=${orderNumber}`,
    };
  }

  const amount = String(total); // COP sin decimales
  const currency = 'COP';
  const integritySignature = crypto
    .createHash('sha256')
    .update(`${orderNumber}${amount}${currency}${BOLD_SECRET_KEY}`)
    .digest('hex');

  return {
    simulated: false,
    bold: {
      apiKey: BOLD_IDENTITY_KEY,
      orderId: orderNumber,
      amount,
      currency,
      integritySignature,
      description: `Pedido ${orderNumber} - Arte Aniba`,
      redirectionUrl: `${clientUrl}/pago/confirmacion`,
    },
  };
};

const verifyWebhookSignature = (payload, signature, secret) => {
  try {
    const webhookSecret = secret || process.env.BOLD_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn('[Bold] Webhook secret no configurado. Saltando verificación.');
      return true;
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(typeof payload === 'string' ? payload : JSON.stringify(payload))
      .digest('hex');

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch (error) {
    console.error('[Bold] Error al verificar webhook:', error.message);
    return false;
  }
};

export { buildCheckout, verifyWebhookSignature };
