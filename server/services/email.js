import nodemailer from 'nodemailer';
import { query } from '../config/db.js';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const useSMTP = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

  if (useSMTP) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: parseInt(process.env.SMTP_PORT, 10) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      jsonTransport: true,
    });
  }

  return transporter;
};

const logEmail = async (recipient, subject, templateType, orderId, status, errorMsg) => {
  try {
    await query(
      `INSERT INTO email_log (recipient_email, subject, template_type, related_order_id, status, error_message)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [recipient, subject, templateType, orderId, status, errorMsg || null]
    );
  } catch (err) {
    console.error('[Email] Error al registrar en log:', err.message);
  }
};

const sendEmail = async ({ to, subject, html, templateType, orderId }) => {
  try {
    const transport = getTransporter();
    const from = process.env.EMAIL_FROM || 'Arte Aniba <arteaniba@gmail.com>';

    const info = await transport.sendMail({ from, to, subject, html });

    await logEmail(to, subject, templateType, orderId, 'sent', null);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Email] Error al enviar:', error.message);
    await logEmail(to, subject, templateType, orderId, 'failed', error.message);
    return { success: false, error: error.message };
  }
};

const sendContactNotification = async (contactData) => {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER;
  const subject = `Nuevo mensaje de contacto: ${contactData.name}`;
  const html = `
    <h2>Nuevo mensaje de contacto</h2>
    <p><strong>Nombre:</strong> ${contactData.name}</p>
    <p><strong>Email:</strong> ${contactData.email}</p>
    <p><strong>Teléfono:</strong> ${contactData.phone || 'No proporcionado'}</p>
    <p><strong>Mensaje:</strong></p>
    <blockquote>${contactData.message}</blockquote>
  `;

  return sendEmail({ to: adminEmail, subject, html, templateType: 'contact_notification' });
};

const sendOrderConfirmationToCustomer = async (order, customer, items) => {
  const itemsHtml = items.map(item =>
    `<tr><td>${item.product_name}</td><td>${item.quantity}</td><td>$${item.unit_price.toLocaleString('es-CO')}</td><td>$${item.subtotal.toLocaleString('es-CO')}</td></tr>`
  ).join('');

  const html = `
    <h2>¡Gracias por tu compra en Arte Aniba!</h2>
    <p>Hola ${customer.first_name}, hemos recibido tu pedido <strong>${order.order_number}</strong>.</p>
    <p>Te notificaremos cuando esté en camino.</p>
    <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%">
      <tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr>
      ${itemsHtml}
    </table>
    <p><strong>Total:</strong> $${order.total.toLocaleString('es-CO')}</p>
    <hr/>
    <p>Arte Aniba — Madera recuperada, piezas únicas.</p>
  `;

  return sendEmail({
    to: customer.email,
    subject: `Pedido ${order.order_number} confirmado - Arte Aniba`,
    html,
    templateType: 'order_confirmation_customer',
    orderId: order.id,
  });
};

const sendNewOrderNotificationToAdmin = async (order, customer) => {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER;
  const subject = `Nuevo pedido: ${order.order_number} - ${customer.first_name} ${customer.last_name || ''}`;
  const html = `
    <h2>Nuevo pedido recibido</h2>
    <p><strong>Pedido:</strong> ${order.order_number}</p>
    <p><strong>Cliente:</strong> ${customer.first_name} ${customer.last_name || ''}</p>
    <p><strong>Email:</strong> ${customer.email}</p>
    <p><strong>Total:</strong> $${order.total.toLocaleString('es-CO')}</p>
    <p><strong>Método de pago:</strong> ${order.payment_method || 'Pendiente'}</p>
    <p><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/admin">Ver en el panel</a></p>
  `;

  return sendEmail({ to: adminEmail, subject, html, templateType: 'new_order_admin', orderId: order.id });
};

const sendShippingUpdate = async (order, customer) => {
  const html = `
    <h2>Tu pedido ${order.order_number} está en camino</h2>
    <p>Hola ${customer.first_name}, tu pedido ha sido enviado.</p>
    <p><strong>Transportadora:</strong> ${order.shipping_carrier || 'Interrapidísimo'}</p>
    <p><strong>Número de guía:</strong> ${order.tracking_number || 'Pendiente'}</p>
    <p>Recibirás actualizaciones pronto.</p>
    <hr/>
    <p>Arte Aniba — Madera recuperada, piezas únicas.</p>
  `;

  return sendEmail({
    to: customer.email,
    subject: `Pedido ${order.order_number} enviado - Arte Aniba`,
    html,
    templateType: 'shipping_update',
    orderId: order.id,
  });
};

export { sendContactNotification, sendOrderConfirmationToCustomer, sendNewOrderNotificationToAdmin, sendShippingUpdate };
