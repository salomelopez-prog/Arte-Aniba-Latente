const sanitizeString = (value, maxLength = 500) => {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/<[^>]*>/g, '').substring(0, maxLength);
};

const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return '';
  const cleaned = email.trim().toLowerCase().replace(/<[^>]*>/g, '');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(cleaned) ? cleaned : '';
};

const sanitizePhone = (phone) => {
  if (typeof phone !== 'string') return '';
  return phone.trim().replace(/[^\d+]/g, '').substring(0, 20);
};

const validateProduct = (data) => {
  const errors = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push('El nombre del producto es requerido (mín. 2 caracteres)');
  }
  if (!data.reference || typeof data.reference !== 'string' || data.reference.trim().length < 1) {
    errors.push('La referencia del producto es requerida');
  }
  if (!data.price || isNaN(data.price) || parseInt(data.price, 10) <= 0) {
    errors.push('El precio debe ser un número mayor a 0');
  }
  if (!data.category_id || isNaN(data.category_id)) {
    errors.push('La categoría es requerida');
  }
  if (data.stock_quantity !== undefined && (isNaN(data.stock_quantity) || parseInt(data.stock_quantity, 10) < 0)) {
    errors.push('El stock no puede ser negativo');
  }

  return errors;
};

const validateContactMessage = (data) => {
  const errors = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push('El nombre es requerido (mín. 2 caracteres)');
  }
  if (!data.email || !sanitizeEmail(data.email)) {
    errors.push('Email inválido');
  }
  if (!data.message || typeof data.message !== 'string' || data.message.trim().length < 10) {
    errors.push('El mensaje debe tener al menos 10 caracteres');
  }

  return errors;
};

const validateOrder = (data) => {
  const errors = [];

  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    errors.push('El pedido debe contener al menos un producto');
  }
  if (!data.customer || !data.customer.first_name) {
    errors.push('Los datos del cliente son requeridos');
  }
  if (!data.customer.email && !data.customer.phone) {
    errors.push('Email o teléfono del cliente son requeridos');
  }

  if (data.items) {
    data.items.forEach((item, index) => {
      if (!item.product_id) errors.push(`Item ${index + 1}: product_id requerido`);
      if (!item.quantity || item.quantity < 1) errors.push(`Item ${index + 1}: cantidad inválida`);
    });
  }

  return errors;
};

export { sanitizeString, sanitizeEmail, sanitizePhone, validateProduct, validateContactMessage, validateOrder };
