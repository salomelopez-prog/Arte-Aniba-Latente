import { query } from '../config/db.js';
import { validateOrder, sanitizeString, sanitizeEmail, sanitizePhone } from '../utils/validators.js';
import { createPaymentLink } from '../services/bold.js';
import { sendOrderConfirmationToCustomer, sendNewOrderNotificationToAdmin, sendShippingUpdate } from '../services/email.js';

const list = async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    let sql = `
      SELECT o.*, c.first_name, c.last_name, c.email, c.phone, c.whatsapp
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (status) {
      sql += ` AND o.status = $${paramIndex++}`;
      params.push(status);
    }

    sql += ' ORDER BY o.created_at DESC LIMIT $' + (paramIndex++) + ' OFFSET $' + (paramIndex++);
    params.push(limit, offset);

    const result = await query(sql, params);

    const countResult = await query('SELECT COUNT(*) FROM orders' + (status ? ' WHERE status = $1' : ''), status ? [status] : []);

    return res.json({
      orders: result.rows,
      total: parseInt(countResult.rows[0].count, 10),
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });
  } catch (error) {
    console.error('[Orders] Error al listar:', error.message);
    return res.status(500).json({ error: 'Error al obtener pedidos' });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const orderResult = await query(
      `SELECT o.*, c.first_name, c.last_name, c.email, c.phone, c.whatsapp, c.address, c.city, c.department
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       WHERE o.id = $1`,
      [id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    const itemsResult = await query(
      'SELECT * FROM order_items WHERE order_id = $1 ORDER BY product_name ASC',
      [id]
    );

    return res.json({
      order: orderResult.rows[0],
      items: itemsResult.rows,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener pedido' });
  }
};

const create = async (req, res) => {
  try {
    const data = req.body;
    const errors = validateOrder(data);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const customerData = data.customer;
    let customerId = customerData.id;

    if (!customerId) {
      const existingCustomer = await query(
        'SELECT id FROM customers WHERE email = $1 OR phone = $2',
        [sanitizeEmail(customerData.email), sanitizePhone(customerData.phone)]
      );

      if (existingCustomer.rows.length > 0) {
        customerId = existingCustomer.rows[0].id;
        await query(
          `UPDATE customers SET first_name = $1, last_name = $2, phone = $3, whatsapp = $4,
           city = $5, department = $6, address = $7
           WHERE id = $8`,
          [
            sanitizeString(customerData.first_name, 100),
            sanitizeString(customerData.last_name, 100),
            sanitizePhone(customerData.phone),
            sanitizePhone(customerData.whatsapp),
            sanitizeString(customerData.city, 100),
            sanitizeString(customerData.department, 100),
            sanitizeString(customerData.address, 500),
            customerId,
          ]
        );
      } else {
        const newCustomer = await query(
          `INSERT INTO customers (first_name, last_name, email, phone, whatsapp, city, department, address, customer_type, company_name)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           RETURNING id`,
          [
            sanitizeString(customerData.first_name, 100),
            sanitizeString(customerData.last_name || '', 100),
            sanitizeEmail(customerData.email),
            sanitizePhone(customerData.phone),
            sanitizePhone(customerData.whatsapp),
            sanitizeString(customerData.city, 100),
            sanitizeString(customerData.department, 100),
            sanitizeString(customerData.address, 500),
            customerData.customer_type || 'individual',
            sanitizeString(customerData.company_name, 200),
          ]
        );
        customerId = newCustomer.rows[0].id;
      }
    }

    let subtotal = 0;
    const itemsData = [];

    for (const item of data.items) {
      const productResult = await query('SELECT id, name, reference, price, stock_quantity FROM products WHERE id = $1', [item.product_id]);
      if (productResult.rows.length === 0) {
        return res.status(400).json({ error: `Producto no encontrado: ${item.product_id}` });
      }

      const product = productResult.rows[0];
      if (product.stock_quantity < item.quantity) {
        return res.status(400).json({ error: `Stock insuficiente para ${product.name}. Disponible: ${product.stock_quantity}` });
      }

      const lineSubtotal = product.price * item.quantity;
      subtotal += lineSubtotal;

      itemsData.push({
        product_id: product.id,
        product_name: product.name,
        product_reference: product.reference,
        quantity: item.quantity,
        unit_price: product.price,
        subtotal: lineSubtotal,
      });
    }

    const shippingCost = data.shipping_cost || 0;
    const total = subtotal + shippingCost;

    const orderResult = await query(
      `INSERT INTO orders (customer_id, subtotal, shipping_cost, total, shipping_address, shipping_city, shipping_department, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        customerId, subtotal, shippingCost, total,
        sanitizeString(data.shipping_address, 500),
        sanitizeString(data.shipping_city, 100),
        sanitizeString(data.shipping_department, 100),
        sanitizeString(data.notes, 500),
      ]
    );

    const order = orderResult.rows[0];

    for (const item of itemsData) {
      await query(
        `INSERT INTO order_items (order_id, product_id, product_name, product_reference, quantity, unit_price, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [order.id, item.product_id, item.product_name, item.product_reference, item.quantity, item.unit_price, item.subtotal]
      );

      await query(
        'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );

      await query(
        `INSERT INTO inventory_movements (product_id, movement_type, quantity, previous_stock, new_stock, reason, reference_order_id)
         VALUES ($1, 'out', $2, (SELECT stock_quantity + $2 FROM products WHERE id = $1), (SELECT stock_quantity FROM products WHERE id = $1), $3, $4)`,
        [item.product_id, item.quantity, `Pedido ${order.order_number}`, order.id]
      );
    }

    const customerResult = await query('SELECT * FROM customers WHERE id = $1', [customerId]);
    const customer = customerResult.rows[0];

    await query(
      'UPDATE customers SET order_count = order_count + 1, total_spent = total_spent + $1, last_purchase_at = NOW() WHERE id = $2',
      [total, customerId]
    );

    if (customer.first_purchase_at === null) {
      await query('UPDATE customers SET first_purchase_at = NOW() WHERE id = $1', [customerId]);
    }

    const paymentResult = await createPaymentLink({
      orderNumber: order.order_number,
      total,
      customerName: `${customer.first_name} ${customer.last_name || ''}`,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      description: `Pedido ${order.order_number} - Arte Aniba`,
    });

    if (paymentResult.success && paymentResult.paymentId) {
      await query('UPDATE orders SET bold_payment_id = $1 WHERE id = $2', [paymentResult.paymentId, order.id]);
    }

    sendOrderConfirmationToCustomer(order, customer, itemsData);
    sendNewOrderNotificationToAdmin(order, customer);

    return res.status(201).json({
      order,
      items: itemsData,
      customer,
      paymentUrl: paymentResult.paymentUrl,
      simulated: paymentResult.simulated || false,
    });
  } catch (error) {
    console.error('[Orders] Error al crear:', error.message);
    return res.status(500).json({ error: 'Error al crear pedido' });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, tracking_number, shipping_carrier } = req.body;

    const validStatuses = ['pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const existing = await query('SELECT * FROM orders WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    let updateFields = 'status = $1';
    const params = [status];
    let paramIndex = 2;

    if (status === 'paid') {
      updateFields += ', paid_at = NOW()';
    } else if (status === 'shipped') {
      updateFields += ', shipped_at = NOW()';
      if (tracking_number) {
        updateFields += `, tracking_number = $${paramIndex++}`;
        params.push(tracking_number);
      }
      if (shipping_carrier) {
        updateFields += `, shipping_carrier = $${paramIndex++}`;
        params.push(shipping_carrier);
      }
    } else if (status === 'delivered') {
      updateFields += ', delivered_at = NOW()';
    }

    params.push(id);
    const result = await query(`UPDATE orders SET ${updateFields} WHERE id = $${paramIndex} RETURNING *`, params);
    const order = result.rows[0];

    const customerResult = await query('SELECT * FROM customers WHERE id = $1', [order.customer_id]);
    const customer = customerResult.rows[0];

    if (status === 'shipped' && customer.email) {
      sendShippingUpdate(order, customer);
    }

    await logAudit(req, 'UPDATE_STATUS', 'orders', id, existing.rows[0], order);

    return res.json({ order });
  } catch (error) {
    console.error('[Orders] Error al actualizar estado:', error.message);
    return res.status(500).json({ error: 'Error al actualizar estado' });
  }
};

const logAudit = async (req, action, entityType, entityId, oldValues, newValues) => {
  try {
    await query(
      `INSERT INTO audit_log (admin_user_id, action, entity_type, entity_id, old_values, new_values, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [req.admin?.id || null, action, entityType, entityId, oldValues ? JSON.stringify(oldValues) : null, newValues ? JSON.stringify(newValues) : null, req.ip || null]
    );
  } catch (err) {
    console.error('[Audit] Error:', err.message);
  }
};

export { list, getById, create, updateStatus };
