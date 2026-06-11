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

// Verifica la firma del webhook de Bold.
// Esquema oficial: HMAC-SHA256( base64(rawBody) , llaveSecreta ) en hexadecimal,
// comparado con el header x-bold-signature. En modo de PRUEBAS Bold firma con
// llave vacía, por eso se prueban varias llaves candidatas.
const verifyWebhookSignature = (rawBody, signature) => {
  if (!signature) return false;
  const encoded = Buffer.from(rawBody, 'utf8').toString('base64');
  const secrets = [process.env.BOLD_WEBHOOK_SECRET, process.env.BOLD_SECRET_KEY, ''].filter(
    (s) => s !== undefined && s !== null,
  );
  return secrets.some((secret) => {
    try {
      const expected = crypto.createHmac('sha256', secret).update(encoded).digest('hex');
      return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    } catch {
      return false;
    }
  });
};

export { buildCheckout, verifyWebhookSignature };
