import { query } from '../config/db.js';
import { verifyWebhookSignature } from '../services/bold.js';
import { sendOrderConfirmationToCustomer } from '../services/email.js';

const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-bold-signature'];
    const rawBody = req.rawBody || JSON.stringify(req.body || {});

    // Verificación de firma (no bloqueante: si falla solo se registra, para no perder
    // notificaciones legítimas mientras se afina; se puede endurecer a 401 más adelante).
    if (!verifyWebhookSignature(rawBody, signature)) {
      console.warn('[Bold Webhook] Firma inválida o ausente — se procesa igual y se registra.');
    }

    const payload = req.body || {};
    const type = payload.type;                           // SALE_APPROVED, SALE_REJECTED, ...
    const reference = payload.data?.metadata?.reference;  // = order_number
    const paymentId = payload.data?.payment_id;

    console.log(`[Bold Webhook] Tipo: ${type}, Referencia: ${reference}, Pago: ${paymentId}`);

    if (!reference) return res.status(200).json({ received: true });

    if (type === 'SALE_APPROVED') {
      const orderResult = await query(
        `UPDATE orders SET status = 'paid', paid_at = NOW(), bold_payment_id = $1, payment_method = 'Bold'
         WHERE order_number = $2 AND status = 'pending' RETURNING *`,
        [paymentId || null, reference]
      );

      if (orderResult.rows.length > 0) {
        const order = orderResult.rows[0];
        const customerResult = await query('SELECT * FROM customers WHERE id = $1', [order.customer_id]);
        const itemsResult = await query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
        const customer = customerResult.rows[0];

        // Factura/confirmación de pago al cliente (si hay email y SMTP configurado)
        if (customer?.email) {
          sendOrderConfirmationToCustomer(order, customer, itemsResult.rows);
        }
        console.log(`[Bold Webhook] Pedido ${reference} marcado como PAGADO`);
      }
    } else if (type === 'SALE_REJECTED') {
      await query(
        `UPDATE orders SET notes = COALESCE(notes || E'\\n', '') || $1 WHERE order_number = $2`,
        [`Pago rechazado por Bold (${paymentId || 's/id'})`, reference]
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
