const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('aa_admin_token')

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  }

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body)
  }

  if (config.body instanceof FormData) {
    delete config.headers['Content-Type']
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config)
  const data = await response.json()

  if (!response.ok) {
    const error = new Error(data.error || 'Error de conexión')
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

export const productsApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/products${query ? `?${query}` : ''}`)
  },
  getById: (id) => request(`/products/${id}`),
  getBySlug: (slug) => request(`/products/slug/${slug}`),
  getCategories: () => request('/products/categories'),
  create: (data) => request('/products', { method: 'POST', body: data }),
  update: (id, data) => request(`/products/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/products/${id}`, { method: 'DELETE' }),
}

export const ordersApi = {
  create: (data) => request('/orders', { method: 'POST', body: data }),
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/orders${query ? `?${query}` : ''}`)
  },
  getById: (id) => request(`/orders/${id}`),
  updateStatus: (id, data) => request(`/orders/${id}/status`, { method: 'PATCH', body: data }),
}

export const customersApi = {
  register: (data) => request('/customers/register', { method: 'POST', body: data }),
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/customers${query ? `?${query}` : ''}`)
  },
  getById: (id) => request(`/customers/${id}`),
  update: (id, data) => request(`/customers/${id}`, { method: 'PUT', body: data }),
}

export const contactsApi = {
  send: (data) => request('/contacts', { method: 'POST', body: data }),
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/contacts${query ? `?${query}` : ''}`)
  },
  getById: (id) => request(`/contacts/${id}`),
  markReplied: (id, data) => request(`/contacts/${id}/replied`, { method: 'PATCH', body: data }),
}

export const authApi = {
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
  refresh: (refreshToken) => request('/auth/refresh', { method: 'POST', body: { refreshToken } }),
  me: () => request('/auth/me'),
  logout: (refreshToken) => request('/auth/logout', { method: 'POST', body: { refreshToken } }),
  listUsers: () => request('/auth/users'),
  createUser: (data) => request('/auth/users', { method: 'POST', body: data }),
}

export const adminApi = {
  dashboard: () => request('/admin/dashboard'),
}

export const settingsApi = {
  getAll: () => request('/settings'),
  getByKey: (key) => request(`/settings/${key}`),
  update: (key, value) => request(`/settings/${key}`, { method: 'PUT', body: { value } }),
  updateBulk: (settings) => request('/settings/bulk', { method: 'PATCH', body: { settings } }),
}

export const paymentsApi = {
  getStatus: (orderId) => request(`/payments/status/${orderId}`),
}

export default request
