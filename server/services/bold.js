import crypto from 'crypto';

const BOLD_API_URL = process.env.BOLD_API_URL || 'https://api.bold.co';
const BOLD_API_KEY = process.env.BOLD_API_KEY;
const BOLD_SECRET_KEY = process.env.BOLD_SECRET_KEY;

const createPaymentLink = async ({ orderNumber, total, customerName, customerEmail, customerPhone, description, redirectUrl }) => {
  try {
    if (!BOLD_API_KEY || !BOLD_SECRET_KEY) {
      console.warn('[Bold] Credenciales no configuradas. Usando modo simulado.');
      return {
        success: true,
        simulated: true,
        paymentUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/pago/simulado?order=${orderNumber}`,
        paymentId: `sim_${Date.now()}`,
      };
    }

    const payload = {
      amount: total,
      currency: 'COP',
      reference: orderNumber,
      description: description || `Pedido ${orderNumber} - Arte Aniba`,
      redirectUrl: redirectUrl || process.env.BOLD_REDIRECT_URL,
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
      },
    };

    const response = await fetch(`${BOLD_API_URL}/v1/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BOLD_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Bold API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();

    return {
      success: true,
      simulated: false,
      paymentUrl: data.checkout_url || data.url,
      paymentId: data.id || data.payment_id,
    };
  } catch (error) {
    console.error('[Bold] Error al crear link de pago:', error.message);
    return { success: false, error: error.message };
  }
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

export { createPaymentLink, verifyWebhookSignature };
