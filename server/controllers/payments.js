import { query } from '../config/db.js';
import { verifyWebhookSignature } from '../services/bold.js';

const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-bold-signature'] || req.headers['x-signature'];
    const payload = req.body;

    if (!verifyWebhookSignature(JSON.stringify(payload), signature)) {
      return res.status(401).json({ error: 'Firma inválida' });
    }

    const eventType = payload.event || payload.type;
    const paymentId = payload.payment?.id || payload.data?.id || payload.id;
    const reference = payload.payment?.reference || payload.data?.reference || payload.reference;
    const paymentStatus = payload.payment?.status || payload.data?.status || payload.status;

    console.log(`[Bold Webhook] Evento: ${eventType}, Referencia: ${reference}, Estado: ${paymentStatus}`);

    if (paymentStatus === 'approved' || paymentStatus === 'successful' || paymentStatus === 'completed') {
      const orderResult = await query(
        'UPDATE orders SET status = $1, paid_at = NOW(), bold_payment_id = $2, payment_method = $3 WHERE order_number = $4 AND status = $5 RETURNING *',
        ['paid', paymentId, 'Bold - Tarjeta crédito/débito', reference, 'pending']
      );

      if (orderResult.rows.length > 0) {
        console.log(`[Bold Webhook] Pedido ${reference} marcado como pagado`);
      }
    }

    if (paymentStatus === 'failed' || paymentStatus === 'declined') {
      await query(
        'UPDATE orders SET notes = COALESCE(notes || E\'\\n\', \'\') || $1 WHERE order_number = $2',
        [`Pago rechazado por Bold (ID: ${paymentId})`, reference]
      );
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('[Bold Webhook] Error:', error.message);
    return res.status(500).json({ error: 'Error al procesar webhook' });
  }
};

const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const result = await query(
      'SELECT id, order_number, status, payment_method, payment_reference, bold_payment_id, paid_at FROM orders WHERE id = $1',
      [orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    return res.json({ payment: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener estado del pago' });
  }
};

export { handleWebhook, getPaymentStatus };
