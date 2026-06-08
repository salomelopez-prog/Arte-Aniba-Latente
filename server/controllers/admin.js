import { query } from '../config/db.js';

const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats = {};

    const salesResult = await query(
      `SELECT COUNT(*) as order_count, COALESCE(SUM(total), 0) as total_sales
       FROM orders WHERE status != 'cancelled' AND created_at >= $1`,
      [firstOfMonth]
    );
    stats.monthSales = parseInt(salesResult.rows[0].total_sales, 10);
    stats.monthOrders = parseInt(salesResult.rows[0].order_count, 10);

    const pendingResult = await query("SELECT COUNT(*) FROM orders WHERE status = 'pending'");
    stats.pendingOrders = parseInt(pendingResult.rows[0].count, 10);

    const preparingResult = await query("SELECT COUNT(*) FROM orders WHERE status = 'preparing'");
    stats.preparingOrders = parseInt(preparingResult.rows[0].count, 10);

    const lowStockResult = await query(
      'SELECT COUNT(*) FROM products WHERE is_active = TRUE AND stock_quantity <= stock_alert_threshold'
    );
    stats.lowStockProducts = parseInt(lowStockResult.rows[0].count, 10);

    const unreadMessagesResult = await query("SELECT COUNT(*) FROM contact_messages WHERE status = 'new'");
    stats.unreadMessages = parseInt(unreadMessagesResult.rows[0].count, 10);

    const newCustomersResult = await query(
      'SELECT COUNT(*) FROM customers WHERE created_at >= $1',
      [firstOfMonth]
    );
    stats.newCustomers = parseInt(newCustomersResult.rows[0].count, 10);

    const totalCustomersResult = await query('SELECT COUNT(*) FROM customers');
    stats.totalCustomers = parseInt(totalCustomersResult.rows[0].count, 10);

    const totalProductsResult = await query('SELECT COUNT(*) FROM products WHERE is_active = TRUE');
    stats.activeProducts = parseInt(totalProductsResult.rows[0].count, 10);

    const totalSalesAllTime = await query("SELECT COALESCE(SUM(total), 0) FROM orders WHERE status != 'cancelled'");
    stats.totalSalesAllTime = parseInt(totalSalesAllTime.rows[0].coalesce, 10);

    const recentOrders = await query(
      `SELECT o.id, o.order_number, o.status, o.total, o.created_at,
              c.first_name, c.last_name
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       ORDER BY o.created_at DESC LIMIT 5`
    );
    stats.recentOrders = recentOrders.rows;

    const salesByCategory = await query(
      `SELECT c.name, COUNT(oi.id) as items_sold, COALESCE(SUM(oi.subtotal), 0) as revenue
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       JOIN categories c ON p.category_id = c.id
       JOIN orders o ON oi.order_id = o.id
       WHERE o.status NOT IN ('cancelled', 'pending')
         AND o.created_at >= $1
       GROUP BY c.name
       ORDER BY revenue DESC`,
      [firstOfMonth]
    );
    stats.salesByCategory = salesByCategory.rows;

    return res.json({ stats });
  } catch (error) {
    console.error('[Admin] Error al obtener stats:', error.message);
    return res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

export { getDashboardStats };
