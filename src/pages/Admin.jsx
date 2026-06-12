import { AnimatePresence, motion } from 'framer-motion'
import {
  BarChart3, Bell, CreditCard, DollarSign, Edit3, FileText, Image, Inbox,
  LogOut, Menu, MessageSquare, Package, Plus, RefreshCw, Search,
  Settings, ShoppingBag, Trash2, Truck, Upload, Users, X
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import api, { adminApi, authApi, contactsApi, customersApi, ordersApi, productsApi, settingsApi, uploadApi } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { formatCurrency } from '../data/products.js'
import { DEFAULT_ABOUT, mergeAbout, safeParse } from '../data/siteContent.js'

// ─── Tab Navigation ───
const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'products', label: 'Productos', icon: Package },
  { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
  { id: 'customers', label: 'Clientes', icon: Users },
  { id: 'messages', label: 'Mensajes', icon: MessageSquare },
  { id: 'inventory', label: 'Inventario', icon: Truck },
  { id: 'content', label: 'Contenido', icon: Image },
  { id: 'settings', label: 'Configuración', icon: Settings },
  { id: 'emails', label: 'Emails', icon: FileText },
  { id: 'admins', label: 'Usuarios', icon: Users },
]

// ─── Empty State ───
const EmptyState = ({ icon: Icon, title, text }) => (
  <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-carbon/15 bg-clay-bg p-10 text-center">
    <Icon className="h-12 w-12 text-walnut/50" />
    <p className="mt-4 font-display text-3xl font-semibold text-carbon">{title}</p>
    <p className="mt-2 text-carbon/62">{text}</p>
  </div>
)

// ─── Stat Card ───
const StatCard = ({ label, value, icon: Icon, accent }) => (
  <div className="rounded-[1.75rem] border border-carbon/10 bg-clay-bg p-5">
    <div className="flex items-center justify-between">
      <p className="text-sm font-bold uppercase tracking-[0.12em] text-carbon/52">{label}</p>
      <div className={`rounded-full ${accent || 'bg-clay'} p-2.5 text-clay-bg`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
    <p className="mt-3 font-display text-4xl font-semibold text-carbon">{value}</p>
  </div>
)

// ─── Dashboard ───
const DashboardTab = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.dashboard()
      .then((d) => setStats(d.stats))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-10 text-carbon/48">Cargando estadísticas...</div>
  if (!stats) return <EmptyState icon={BarChart3} title="Sin datos" text="Aún no hay suficientes datos para mostrar." />

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Ventas del mes" value={formatCurrency(stats.monthSales)} icon={DollarSign} accent="bg-moss" />
        <StatCard label="Pedidos del mes" value={stats.monthOrders} icon={ShoppingBag} />
        <StatCard label="Pendientes" value={stats.pendingOrders} icon={Bell} accent="bg-clay-dark" />
        <StatCard label="Productos sin stock" value={stats.lowStockProducts} icon={Package} accent="bg-night" />
        <StatCard label="Mensajes sin leer" value={stats.unreadMessages} icon={Inbox} accent="bg-walnut" />
        <StatCard label="Clientes nuevos" value={stats.newCustomers} icon={Users} accent="bg-moss" />
      </div>

      {stats.recentOrders?.length > 0 && (
        <div className="rounded-[1.75rem] border border-carbon/10 bg-clay-bg p-5">
          <h3 className="font-display text-2xl font-semibold text-carbon">Pedidos recientes</h3>
          <div className="mt-4 grid gap-2">
            {stats.recentOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-xl bg-clay-surface px-4 py-3 text-sm">
                <span className="font-bold">{o.order_number}</span>
                <span className="text-carbon/62">{o.first_name} {o.last_name || ''}</span>
                <span className="font-bold text-clay">{formatCurrency(o.total)}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${statusColor(o.status)}`}>{o.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const statusColor = (s) => ({
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  preparing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-moss/20 text-moss',
  cancelled: 'bg-red-100 text-red-600',
}[s] || 'bg-carbon/10 text-carbon/60')

// ─── Products Tab ───
const emptyProductForm = { reference: '', name: '', category_id: '', price: '', size: '', description: '', stock_quantity: '0', image_url: '', is_active: true, grupo: '' }

const ProductsTab = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyProductForm)
  const [imageFile, setImageFile] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const [pd, cd] = await Promise.all([productsApi.list({ active: 'false' }), productsApi.getCategories()])
    setProducts(pd.products)
    setCategories(cd.categories)
  }
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return products
    const q = search.toLowerCase()
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.reference.toLowerCase().includes(q))
  }, [products, search])

  const resetForm = () => {
    setEditing(null)
    setForm(emptyProductForm)
    setImageFile(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      // FormData soporta tanto los campos de texto como el archivo de imagen opcional.
      const fd = new FormData()
      fd.append('reference', form.reference)
      fd.append('name', form.name)
      fd.append('category_id', String(Number(form.category_id)))
      fd.append('price', String(Number(form.price)))
      fd.append('size', form.size)
      fd.append('description', form.description)
      fd.append('stock_quantity', String(Number(form.stock_quantity)))
      fd.append('is_active', String(form.is_active))
      fd.append('grupo', form.grupo) // siempre se envía: vacío = desagrupar
      if (form.image_url) fd.append('image_url', form.image_url)
      if (imageFile) fd.append('image', imageFile)

      if (editing) {
        await productsApi.update(editing, fd)
      } else {
        fd.append('slug', form.reference.toLowerCase().replace(/[^a-z0-9-]/g, '-'))
        await productsApi.create(fd)
      }
      resetForm()
      await load()
    } catch (err) {
      window.alert(err.data?.error || err.data?.errors?.join(', ') || 'Error al guardar el producto')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (p) => {
    setEditing(p.id)
    setImageFile(null)
    setForm({ reference: p.reference, name: p.name, category_id: String(p.category_id), price: String(p.price), size: p.size || '', description: p.description, stock_quantity: String(p.stock_quantity), image_url: p.image_url || '', is_active: p.is_active, grupo: p.grupo || '' })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return
    await productsApi.delete(id)
    if (editing === id) resetForm()
    await load()
  }

  const handleToggleActive = async (p) => {
    const fd = new FormData()
    fd.append('is_active', String(!p.is_active))
    await productsApi.update(p.id, fd)
    await load()
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <div className="rounded-[2rem] border border-carbon/10 bg-clay-bg p-5">
        <h3 className="font-display text-3xl font-semibold text-carbon">{editing ? 'Editar producto' : 'Nuevo producto'}</h3>
        <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1 text-sm font-bold text-carbon">Referencia<input className="rounded-xl border border-carbon/10 bg-clay-surface px-4 py-2.5 font-medium" name="reference" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} required /></label>
            <label className="grid gap-1 text-sm font-bold text-carbon">Nombre<input className="rounded-xl border border-carbon/10 bg-clay-surface px-4 py-2.5 font-medium" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1 text-sm font-bold text-carbon">Categoría<select className="rounded-xl border border-carbon/10 bg-clay-surface px-4 py-2.5 font-medium" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} required>
              <option value="">Seleccionar</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select></label>
            <label className="grid gap-1 text-sm font-bold text-carbon">Precio COP<input className="rounded-xl border border-carbon/10 bg-clay-surface px-4 py-2.5 font-medium" type="number" name="price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1 text-sm font-bold text-carbon">Tamaño<input className="rounded-xl border border-carbon/10 bg-clay-surface px-4 py-2.5 font-medium" name="size" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} /></label>
            <label className="grid gap-1 text-sm font-bold text-carbon">Stock<input className="rounded-xl border border-carbon/10 bg-clay-surface px-4 py-2.5 font-medium" type="number" min="0" name="stock_quantity" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} /></label>
          </div>
          <label className="grid gap-1 text-sm font-bold text-carbon">Grupo (para juntar tamaños del mismo producto)
            <input className="rounded-xl border border-carbon/10 bg-clay-surface px-4 py-2.5 font-medium" placeholder="Ej. Hongo (déjalo vacío si es único)" name="grupo" value={form.grupo} onChange={(e) => setForm({ ...form, grupo: e.target.value })} />
          </label>
          <label className="grid gap-1 text-sm font-bold text-carbon">Imagen (subir archivo)
            <input type="file" accept="image/jpeg,image/png,image/webp" className="rounded-xl border border-carbon/10 bg-clay-surface px-4 py-2.5 text-sm font-medium file:mr-3 file:rounded-full file:border-0 file:bg-clay file:px-3 file:py-1 file:text-clay-bg" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
          </label>
          <label className="grid gap-1 text-sm font-bold text-carbon">o URL de imagen<input className="rounded-xl border border-carbon/10 bg-clay-surface px-4 py-2.5 font-medium" placeholder="https://" name="image_url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></label>
          {(imageFile || form.image_url) && (
            <img src={imageFile ? URL.createObjectURL(imageFile) : form.image_url} alt="Vista previa" className="h-28 w-28 rounded-xl border border-carbon/10 object-cover" />
          )}
          <label className="grid gap-1 text-sm font-bold text-carbon">Descripción<textarea className="min-h-20 rounded-xl border border-carbon/10 bg-clay-surface px-4 py-2.5 font-medium" name="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></label>
          <label className="flex items-center gap-2 text-sm font-bold text-carbon">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4 rounded" />
            Producto activo (visible en la tienda)
          </label>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="rounded-full bg-clay px-6 py-3 font-bold text-clay-bg hover:bg-clay-dark transition disabled:opacity-50">{saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear producto'}</button>
            {editing && <button type="button" className="rounded-full border border-carbon/10 px-6 py-3 font-bold hover:bg-clay-surface transition" onClick={resetForm}>Cancelar</button>}
          </div>
        </form>
      </div>
      <div className="rounded-[2rem] border border-carbon/10 bg-clay-bg p-5">
        <div className="flex items-center gap-3">
          <h3 className="font-display text-3xl font-semibold text-carbon">{products.length} productos</h3>
          <button onClick={load} className="ml-auto rounded-full bg-clay-surface p-2 hover:bg-clay-soft"><RefreshCw className="h-4 w-4" /></button>
        </div>
        <label className="mt-4 block relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-carbon/38" />
          <input className="w-full rounded-full border border-carbon/10 bg-clay-surface py-2.5 pl-10 pr-4 text-sm font-medium" placeholder="Buscar producto..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
        <div className="mt-4 grid max-h-[600px] gap-2 overflow-y-auto">
          {filtered.map((p) => (
            <div key={p.id} className={`flex items-center gap-3 rounded-xl border border-carbon/8 bg-clay-surface p-3 ${!p.is_active ? 'opacity-60' : ''}`}>
              {p.image_url ? (
                <img src={p.image_url} alt={p.name} className="h-12 w-12 shrink-0 rounded-xl object-cover" />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-clay to-walnut text-xs font-bold text-clay-bg">{p.reference}</div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-bold text-carbon">{p.name} {!p.is_active && <span className="ml-1 rounded-full bg-carbon/10 px-2 py-0.5 text-[10px] font-bold uppercase text-carbon/60">inactivo</span>}</p>
                <p className="text-xs text-carbon/52">{p.category_name} · {formatCurrency(p.price)} · Stock: {p.stock_quantity}</p>
              </div>
              <button onClick={() => handleToggleActive(p)} title={p.is_active ? 'Desactivar' : 'Activar'} className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${p.is_active ? 'bg-moss/15 text-moss hover:bg-moss/25' : 'bg-carbon/10 text-carbon/60 hover:bg-carbon/20'}`}>{p.is_active ? 'Activo' : 'Inactivo'}</button>
              <button onClick={() => handleEdit(p)} className="rounded-full p-2 hover:bg-clay-soft"><Edit3 className="h-4 w-4" /></button>
              <button onClick={() => handleDelete(p.id)} className="rounded-full p-2 hover:bg-clay-soft text-red-500"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Orders Tab ───
const ORDER_STATUSES = ['pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled']

const OrdersTab = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [shipFor, setShipFor] = useState(null) // pedido al que se le va a poner guía
  const [shipForm, setShipForm] = useState({ tracking_number: '', shipping_carrier: '' })

  const load = async () => {
    try {
      const d = await ordersApi.list({ limit: 100 })
      setOrders(d.orders)
    } catch {} finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const handleStatus = async (order, status) => {
    // "shipped" requiere guía + transportadora: abrir formulario.
    if (status === 'shipped') {
      setShipForm({ tracking_number: order.tracking_number || '', shipping_carrier: order.shipping_carrier || '' })
      setShipFor(order)
      return
    }
    await ordersApi.updateStatus(order.id, { status })
    await load()
  }

  const confirmShip = async (e) => {
    e.preventDefault()
    await ordersApi.updateStatus(shipFor.id, { status: 'shipped', ...shipForm })
    setShipFor(null)
    await load()
  }

  const openDetail = async (id) => {
    setDetailLoading(true)
    setDetail({ loading: true })
    try {
      setDetail(await ordersApi.getById(id))
    } catch {
      setDetail(null)
    } finally {
      setDetailLoading(false)
    }
  }

  if (loading) return <div className="py-10 text-center text-carbon/48">Cargando pedidos...</div>
  if (!orders.length) return <EmptyState icon={ShoppingBag} title="Sin pedidos" text="No hay pedidos registrados aún." />

  return (
    <div className="grid gap-3">
      {orders.map((o) => (
        <div key={o.id} className="rounded-[1.75rem] border border-carbon/10 bg-clay-bg p-4">
          <button onClick={() => openDetail(o.id)} className="flex w-full flex-wrap items-center gap-3 text-left">
            <p className="font-display text-xl font-semibold text-carbon underline-offset-4 hover:underline">{o.order_number}</p>
            <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${statusColor(o.status)}`}>{o.status}</span>
            <span className="text-sm font-bold text-clay">{formatCurrency(o.total)}</span>
            <span className="text-sm text-carbon/52">{o.first_name} {o.last_name}</span>
            {o.tracking_number && <span className="text-xs text-carbon/40">Guía: {o.tracking_number}</span>}
            <span className="ml-auto text-xs text-carbon/40">{new Date(o.created_at).toLocaleDateString('es-CO')}</span>
          </button>
          <div className="mt-3 flex flex-wrap gap-2">
            {ORDER_STATUSES.map((s) => (
              <button key={s} disabled={o.status === s} onClick={() => handleStatus(o, s)} className={`rounded-full px-3 py-1 text-xs font-bold transition ${o.status === s ? 'bg-carbon text-clay-bg' : 'bg-clay-surface hover:bg-clay-soft text-carbon/60'}`}>{s}</button>
            ))}
          </div>
        </div>
      ))}

      {/* Formulario de envío (guía + transportadora) */}
      <AnimatePresence>
        {shipFor && (
          <Modal title={`Enviar ${shipFor.order_number}`} onClose={() => setShipFor(null)}>
            <form className="grid gap-4" onSubmit={confirmShip}>
              <label className="grid gap-1 text-sm font-bold text-carbon">Transportadora
                <input className="rounded-xl border border-carbon/10 bg-clay-surface px-4 py-2.5 font-medium" placeholder="Interrapidísimo, Servientrega..." value={shipForm.shipping_carrier} onChange={(e) => setShipForm({ ...shipForm, shipping_carrier: e.target.value })} required />
              </label>
              <label className="grid gap-1 text-sm font-bold text-carbon">Número de guía
                <input className="rounded-xl border border-carbon/10 bg-clay-surface px-4 py-2.5 font-medium" placeholder="Ej. 240012345678" value={shipForm.tracking_number} onChange={(e) => setShipForm({ ...shipForm, tracking_number: e.target.value })} required />
              </label>
              <button type="submit" className="rounded-full bg-clay px-6 py-3 font-bold text-clay-bg transition hover:bg-clay-dark">Marcar como enviado</button>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* Detalle del pedido */}
      <AnimatePresence>
        {detail && (
          <Modal title="Detalle del pedido" onClose={() => setDetail(null)}>
            {detailLoading || detail.loading ? (
              <div className="py-8 text-center text-carbon/48">Cargando...</div>
            ) : (
              <div className="grid gap-5">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-display text-2xl font-semibold text-carbon">{detail.order.order_number}</p>
                  <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${statusColor(detail.order.status)}`}>{detail.order.status}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Field label="Cliente" value={`${detail.order.first_name} ${detail.order.last_name || ''}`} />
                  <Field label="Email" value={detail.order.email} />
                  <Field label="Teléfono" value={detail.order.phone} />
                  <Field label="Ciudad" value={`${detail.order.shipping_city || detail.order.city || ''} ${detail.order.shipping_department || detail.order.department || ''}`.trim()} />
                  <Field label="Dirección de envío" value={detail.order.shipping_address || detail.order.address} />
                  {detail.order.shipping_carrier && <Field label="Transportadora" value={detail.order.shipping_carrier} />}
                  {detail.order.tracking_number && <Field label="Guía" value={detail.order.tracking_number} />}
                </div>
                <div>
                  <p className="mb-2 font-bold text-carbon">Productos</p>
                  <div className="grid gap-2">
                    {detail.items?.map((it) => (
                      <div key={it.id} className="flex items-center justify-between rounded-xl bg-clay-surface px-4 py-2.5 text-sm">
                        <span className="font-medium text-carbon">{it.product_name} <span className="text-carbon/48">({it.product_reference})</span></span>
                        <span className="text-carbon/60">{it.quantity} × {formatCurrency(it.unit_price)}</span>
                        <span className="font-bold text-clay">{formatCurrency(it.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-night px-5 py-4 text-clay-bg">
                  <span className="text-clay-bg/62">Total</span>
                  <span className="font-display text-2xl font-semibold">{formatCurrency(detail.order.total)}</span>
                </div>
              </div>
            )}
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Modal genérico ───
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
    <button type="button" aria-label="Cerrar" className="absolute inset-0 bg-night/55 backdrop-blur-md" onClick={onClose} />
    <motion.section
      initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
      className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-clay-bg p-6 shadow-2xl shadow-night/35"
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="font-display text-3xl font-semibold text-carbon">{title}</h3>
        <button type="button" onClick={onClose} className="rounded-full bg-clay-surface p-2.5 hover:bg-clay-soft"><X className="h-5 w-5" /></button>
      </div>
      {children}
    </motion.section>
  </div>
)

const formatDate = (d) => (d ? new Date(d).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' }) : '—')

// ─── Customers Tab ───
const CustomersTab = () => {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const load = () => customersApi.list({ limit: 100 }).then((d) => setCustomers(d.customers)).catch(() => {})

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  const handleDelete = async (customer) => {
    if (!window.confirm(`¿Seguro que quieres eliminar a ${customer.first_name} ${customer.last_name || ''}? Esta acción no se puede deshacer.`)) return
    try {
      await customersApi.delete(customer.id)
      setDetail(null)
      await load()
    } catch (err) {
      window.alert(err.data?.error || err.message || 'No se pudo eliminar el cliente')
    }
  }

  const openDetail = async (id) => {
    setDetailLoading(true)
    setDetail({ loading: true })
    try {
      const d = await customersApi.getById(id)
      setDetail(d)
    } catch {
      setDetail(null)
    } finally {
      setDetailLoading(false)
    }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return customers
    const q = search.toLowerCase()
    return customers.filter((c) => c.first_name.toLowerCase().includes(q) || c.last_name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.phone?.includes(q))
  }, [customers, search])

  if (loading) return <div className="py-10 text-center text-carbon/48">Cargando clientes...</div>
  if (!customers.length) return <EmptyState icon={Users} title="Sin clientes" text="Aún no hay clientes registrados." />

  return (
    <div>
      <label className="relative mb-4 block max-w-sm">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-carbon/38" />
        <input className="w-full rounded-full border border-carbon/10 bg-clay-surface py-2.5 pl-10 pr-4 text-sm font-medium" placeholder="Buscar cliente..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </label>
      <div className="grid gap-2">
        {filtered.map((c) => (
          <button key={c.id} onClick={() => openDetail(c.id)} className="rounded-[1.5rem] border border-carbon/10 bg-clay-bg p-4 text-left transition hover:border-clay/40 hover:bg-clay-surface">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-clay text-clay-bg font-bold">{c.first_name[0]}{c.last_name?.[0]}</div>
              <div className="flex-1">
                <p className="font-bold text-carbon">{c.first_name} {c.last_name || ''}</p>
                <p className="text-sm text-carbon/52">{c.email || c.phone} · {c.city || ''} {c.department || ''}</p>
                <p className="text-xs text-carbon/40">{c.customer_type} · {c.order_count} pedidos · {formatCurrency(c.total_spent)}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {detail && (
          <Modal title="Detalle del cliente" onClose={() => setDetail(null)}>
            {detailLoading || detail.loading ? (
              <div className="py-8 text-center text-carbon/48">Cargando...</div>
            ) : (
              <div className="grid gap-5">
                <div>
                  <p className="font-display text-2xl font-semibold text-carbon">{detail.customer.first_name} {detail.customer.last_name || ''}</p>
                  <p className="text-sm text-carbon/56">{detail.customer.customer_type}{detail.customer.company_name ? ` · ${detail.customer.company_name}` : ''}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Field label="Email" value={detail.customer.email} />
                  <Field label="Teléfono" value={detail.customer.phone} />
                  <Field label="WhatsApp" value={detail.customer.whatsapp} />
                  <Field label="Ciudad" value={`${detail.customer.city || ''} ${detail.customer.department || ''}`.trim()} />
                  <Field label="Dirección" value={detail.customer.address} />
                  <Field label="Registrado" value={formatDate(detail.customer.created_at)} />
                  <Field label="Último pedido" value={formatDate(detail.customer.last_purchase_at)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-clay-surface p-4 text-center"><p className="font-display text-3xl font-semibold text-carbon">{detail.customer.order_count}</p><p className="text-xs text-carbon/52">Pedidos</p></div>
                  <div className="rounded-2xl bg-clay-surface p-4 text-center"><p className="font-display text-3xl font-semibold text-clay">{formatCurrency(detail.customer.total_spent)}</p><p className="text-xs text-carbon/52">Total gastado</p></div>
                </div>
                <div>
                  <p className="mb-2 font-bold text-carbon">Historial de compras</p>
                  {detail.recentOrders?.length ? (
                    <div className="grid gap-2">
                      {detail.recentOrders.map((o) => (
                        <div key={o.id} className="flex items-center justify-between rounded-xl bg-clay-surface px-4 py-2.5 text-sm">
                          <span className="font-bold text-carbon">{o.order_number}</span>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${statusColor(o.status)}`}>{o.status}</span>
                          <span className="font-bold text-clay">{formatCurrency(o.total)}</span>
                          <span className="text-xs text-carbon/40">{formatDate(o.created_at)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-carbon/48">Sin compras registradas.</p>
                  )}
                </div>
                <div className="border-t border-carbon/10 pt-4">
                  {detail.customer.order_count > 0 ? (
                    <p className="text-sm text-carbon/52">Este cliente tiene pedidos, por eso no se puede eliminar (se conserva el historial de ventas).</p>
                  ) : (
                    <button
                      onClick={() => handleDelete(detail.customer)}
                      className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-5 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" /> Eliminar cliente
                    </button>
                  )}
                </div>
              </div>
            )}
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs font-bold uppercase tracking-[0.1em] text-carbon/48">{label}</p>
    <p className="font-medium text-carbon">{value || '—'}</p>
  </div>
)

// ─── Messages Tab ───
const MessagesTab = () => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const d = await contactsApi.list({ limit: 100 })
      setMessages(d.messages)
    } catch {} finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const handleMarkReplied = async (id) => {
    await contactsApi.markReplied(id, {})
    await load()
  }

  if (loading) return <div className="py-10 text-center text-carbon/48">Cargando mensajes...</div>
  if (!messages.length) return <EmptyState icon={Inbox} title="Sin mensajes" text="No hay mensajes de contacto." />

  return (
    <div className="grid gap-3">
      {messages.map((m) => (
        <div key={m.id} className={`rounded-[1.75rem] border p-4 ${m.status === 'new' ? 'border-clay/30 bg-clay/5' : 'border-carbon/10 bg-clay-bg'}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-bold text-carbon">{m.name}</p>
              <p className="text-sm text-carbon/52">{m.email} {m.phone ? `· ${m.phone}` : ''}</p>
            </div>
            {m.status === 'new' && <button onClick={() => handleMarkReplied(m.id)} className="rounded-full bg-clay px-4 py-1.5 text-xs font-bold text-clay-bg hover:bg-clay-dark transition">Marcar respondido</button>}
          </div>
          <p className="mt-3 text-sm leading-6 text-carbon/72">{m.message}</p>
          <p className="mt-2 text-xs text-carbon/38">{new Date(m.created_at).toLocaleString('es-CO')} · {m.status}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Inventory Tab ───
const InventoryTab = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    productsApi.list({ active: 'false' }).then((d) => setProducts(d.products)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="py-10 text-center text-carbon/48">Cargando inventario...</div>
  if (!products.length) return <EmptyState icon={Package} title="Sin productos" text="No hay productos en el catálogo." />

  const lowStock = products.filter((p) => p.stock_quantity <= p.stock_alert_threshold)

  return (
    <div className="grid gap-6">
      {lowStock.length > 0 && (
        <div className="rounded-[1.75rem] border border-yellow-300 bg-yellow-50 p-4">
          <p className="font-bold text-yellow-700">{lowStock.length} productos con stock bajo</p>
        </div>
      )}
      <div className="grid gap-2">
        {products.map((p) => (
          <div key={p.id} className="flex items-center gap-4 rounded-[1.5rem] border border-carbon/10 bg-clay-bg p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-clay to-walnut text-xs font-bold text-clay-bg">{p.reference}</div>
            <div className="flex-1">
              <p className="font-bold text-carbon">{p.name}</p>
              <p className="text-xs text-carbon/52">{p.category_name}</p>
            </div>
            <div className={`text-right ${p.stock_quantity <= p.stock_alert_threshold ? 'text-red-500 font-bold' : 'text-carbon'}`}>
              <p className="font-display text-2xl font-semibold">{p.stock_quantity}</p>
              <p className="text-xs">stock</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Settings Tab ───
const SettingsTab = () => {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const d = await settingsApi.getAll()
      setSettings(d.settings)
    } catch {} finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const handleUpdate = async (key, value) => {
    try {
      await settingsApi.update(key, value)
      setSettings((prev) => ({ ...prev, [key]: value }))
    } catch {}
  }

  if (loading) return <div className="py-10 text-center text-carbon/48">Cargando configuración...</div>

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Object.entries(settings).map(([key, value]) => (
        <div key={key} className="rounded-[1.5rem] border border-carbon/10 bg-clay-bg p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-carbon/52">{key.replace(/_/g, ' ')}</p>
          <input
            className="mt-2 w-full rounded-xl border border-carbon/10 bg-clay-surface px-4 py-2 text-sm font-medium"
            defaultValue={value}
            onBlur={(e) => handleUpdate(key, e.target.value)}
          />
        </div>
      ))}
    </div>
  )
}

// ─── Emails Tab ───
const EmailsTab = () => {
  const [log, setLog] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/email-log').then((d) => setLog(d.logs || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="py-10 text-center text-carbon/48">Cargando historial...</div>
  if (!log.length) return <EmptyState icon={FileText} title="Sin registros" text="No hay emails enviados aún." />

  return (
    <div className="grid gap-2">
      {log.map((e) => (
        <div key={e.id} className="rounded-[1.5rem] border border-carbon/10 bg-clay-bg p-4">
          <div className="flex items-center justify-between">
            <p className="font-bold text-carbon">{e.subject}</p>
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${e.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{e.status}</span>
          </div>
          <p className="text-sm text-carbon/52">{e.recipient_email}</p>
          <p className="text-xs text-carbon/38">{new Date(e.created_at).toLocaleString('es-CO')}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Admin Users Tab ───
const emptyAdminForm = { name: '', email: '', password: '', role: 'editor' }

const AdminsTab = () => {
  const { user } = useAuth()
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyAdminForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [okMsg, setOkMsg] = useState('')

  const isSuperadmin = user?.role === 'superadmin'

  const load = () => authApi.listUsers().then((d) => setAdmins(d.users || [])).catch(() => {})

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setOkMsg('')
    try {
      await authApi.createUser(form)
      setOkMsg(`Usuario ${form.email} creado correctamente`)
      setForm(emptyAdminForm)
      await load()
    } catch (err) {
      setError(err.data?.error || err.message || 'No se pudo crear el usuario')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (a) => {
    try {
      await authApi.setUserActive(a.id, !a.is_active)
      await load()
    } catch (err) {
      window.alert(err.data?.error || err.message || 'No se pudo actualizar el usuario')
    }
  }

  if (loading) return <div className="py-10 text-center text-carbon/48">Cargando usuarios...</div>

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <div className="rounded-[2rem] border border-carbon/10 bg-clay-bg p-5">
        <h3 className="font-display text-3xl font-semibold text-carbon">Nuevo administrador</h3>
        {isSuperadmin ? (
          <form className="mt-5 grid gap-4" onSubmit={handleCreate}>
            <label className="grid gap-1 text-sm font-bold text-carbon">Nombre
              <input className="rounded-xl border border-carbon/10 bg-clay-surface px-4 py-2.5 font-medium" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label className="grid gap-1 text-sm font-bold text-carbon">Email
              <input type="email" className="rounded-xl border border-carbon/10 bg-clay-surface px-4 py-2.5 font-medium" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </label>
            <label className="grid gap-1 text-sm font-bold text-carbon">Contraseña (mín. 8 caracteres)
              <input type="text" className="rounded-xl border border-carbon/10 bg-clay-surface px-4 py-2.5 font-medium" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={8} required />
            </label>
            <label className="grid gap-1 text-sm font-bold text-carbon">Rol
              <select className="rounded-xl border border-carbon/10 bg-clay-surface px-4 py-2.5 font-medium" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="editor">Editor (gestiona productos y pedidos)</option>
                <option value="superadmin">Superadmin (control total + crear usuarios)</option>
              </select>
            </label>
            {error && <div className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-600">{error}</div>}
            {okMsg && <div className="rounded-xl bg-moss/15 px-4 py-2.5 text-sm font-bold text-moss">{okMsg}</div>}
            <button type="submit" disabled={saving} className="rounded-full bg-clay px-6 py-3 font-bold text-clay-bg transition hover:bg-clay-dark disabled:opacity-50">{saving ? 'Creando...' : 'Crear usuario'}</button>
          </form>
        ) : (
          <p className="mt-4 rounded-xl bg-clay-surface px-4 py-3 text-sm text-carbon/62">Solo un <strong>superadmin</strong> puede crear nuevos usuarios.</p>
        )}
      </div>

      <div className="grid gap-3">
      {admins.map((a) => (
        <div key={a.id} className="flex items-center gap-4 rounded-[1.5rem] border border-carbon/10 bg-clay-bg p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-night text-clay-bg font-bold">{a.name[0]}</div>
          <div>
            <p className="font-bold text-carbon">{a.name}</p>
            <p className="text-sm text-carbon/52">{a.email} · {a.role}</p>
          </div>
          <span className={`ml-auto rounded-full px-3 py-0.5 text-xs font-bold ${a.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{a.is_active ? 'Activo' : 'Inactivo'}</span>
          {isSuperadmin && a.id !== user?.id && (
            <button
              onClick={() => handleToggleActive(a)}
              className={`rounded-full px-3 py-1 text-xs font-bold transition ${a.is_active ? 'bg-carbon/10 text-carbon/70 hover:bg-carbon/20' : 'bg-moss/15 text-moss hover:bg-moss/25'}`}
            >
              {a.is_active ? 'Desactivar' : 'Activar'}
            </button>
          )}
        </div>
      ))}
      </div>
    </div>
  )
}

// ─── Content Tab (Inicio: galería · Nosotros: textos) ───
const inp = 'w-full rounded-xl border border-carbon/10 bg-clay-surface px-4 py-2.5 text-sm font-medium'

const ContentTab = () => {
  const [gallery, setGallery] = useState([])
  const [about, setAbout] = useState(DEFAULT_ABOUT)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [savingAbout, setSavingAbout] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    settingsApi.getAll()
      .then((d) => {
        setGallery(safeParse(d.settings?.home_gallery, []) || [])
        setAbout(mergeAbout(safeParse(d.settings?.about_content, null)))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const saveGallery = async (next) => {
    setGallery(next)
    await settingsApi.update('home_gallery', JSON.stringify(next))
  }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { url } = await uploadApi.image(file)
      await saveGallery([...gallery, url])
    } catch (err) {
      window.alert(err.data?.error || 'Error al subir la imagen')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const removeImage = async (url) => {
    if (!window.confirm('¿Quitar esta imagen de la galería?')) return
    await saveGallery(gallery.filter((u) => u !== url))
  }

  const saveAbout = async () => {
    setSavingAbout(true)
    setMsg('')
    try {
      await settingsApi.update('about_content', JSON.stringify(about))
      setMsg('Contenido de "Nosotros" guardado ✓')
    } catch (err) {
      window.alert(err.data?.error || 'Error al guardar')
    } finally {
      setSavingAbout(false)
    }
  }

  const setField = (key, value) => setAbout((a) => ({ ...a, [key]: value }))
  const setArr = (key, idx, value) => setAbout((a) => ({ ...a, [key]: a[key].map((v, i) => (i === idx ? value : v)) }))
  const setObjArr = (key, idx, field, value) =>
    setAbout((a) => ({ ...a, [key]: a[key].map((v, i) => (i === idx ? { ...v, [field]: value } : v)) }))

  if (loading) return <div className="py-10 text-center text-carbon/48">Cargando contenido...</div>

  return (
    <div className="grid gap-6">
      {/* ── Galería del Inicio ── */}
      <div className="rounded-[2rem] border border-carbon/10 bg-clay-bg p-5">
        <h3 className="font-display text-3xl font-semibold text-carbon">Galería del Inicio</h3>
        <p className="mt-1 text-sm text-carbon/56">Sube fotos del taller, la familia o las piezas. Se muestran en la página de inicio (rotan automáticamente). Si no hay ninguna, se ve el diseño por defecto.</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {gallery.map((url) => (
            <div key={url} className="group relative overflow-hidden rounded-2xl border border-carbon/10">
              <img src={url} alt="" className="h-32 w-full object-cover" />
              <button onClick={() => removeImage(url)} className="absolute right-2 top-2 rounded-full bg-red-500/90 p-1.5 text-clay-bg opacity-0 transition group-hover:opacity-100" title="Quitar"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-carbon/20 text-carbon/52 transition hover:border-clay hover:text-clay">
            <Upload className="h-6 w-6" />
            <span className="text-xs font-bold">{uploading ? 'Subiendo...' : 'Subir foto'}</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      {/* ── Página Nosotros ── */}
      <div className="rounded-[2rem] border border-carbon/10 bg-clay-bg p-5">
        <h3 className="font-display text-3xl font-semibold text-carbon">Página "Nosotros"</h3>
        <p className="mt-1 text-sm text-carbon/56">Edita todos los textos de la página Nosotros. Guarda al final.</p>

        <div className="mt-5 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1 text-sm font-bold text-carbon">Etiqueta superior<input className={inp} value={about.eyebrow} onChange={(e) => setField('eyebrow', e.target.value)} /></label>
            <label className="grid gap-1 text-sm font-bold text-carbon">Título principal<input className={inp} value={about.title} onChange={(e) => setField('title', e.target.value)} /></label>
          </div>
          <label className="grid gap-1 text-sm font-bold text-carbon">Historia — párrafo 1<textarea className={`${inp} min-h-24`} value={about.history[0] || ''} onChange={(e) => setArr('history', 0, e.target.value)} /></label>
          <label className="grid gap-1 text-sm font-bold text-carbon">Historia — párrafo 2<textarea className={`${inp} min-h-24`} value={about.history[1] || ''} onChange={(e) => setArr('history', 1, e.target.value)} /></label>
          <label className="grid gap-1 text-sm font-bold text-carbon">Texto introductorio (derecha)<textarea className={`${inp} min-h-24`} value={about.lead} onChange={(e) => setField('lead', e.target.value)} /></label>

          <p className="mt-2 text-sm font-bold uppercase tracking-[0.12em] text-carbon/52">Cifras (4 tarjetas)</p>
          {about.stats.map((s, i) => (
            <div key={i} className="grid gap-2 rounded-2xl border border-carbon/8 bg-clay-surface p-3 sm:grid-cols-[100px_1fr]">
              <input className={inp} placeholder="Cifra" value={s.value} onChange={(e) => setObjArr('stats', i, 'value', e.target.value)} />
              <input className={inp} placeholder="Etiqueta" value={s.label} onChange={(e) => setObjArr('stats', i, 'label', e.target.value)} />
              <textarea className={`${inp} sm:col-span-2`} placeholder="Descripción" value={s.text} onChange={(e) => setObjArr('stats', i, 'text', e.target.value)} />
            </div>
          ))}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1 text-sm font-bold text-carbon">Proceso — etiqueta<input className={inp} value={about.processEyebrow} onChange={(e) => setField('processEyebrow', e.target.value)} /></label>
            <label className="grid gap-1 text-sm font-bold text-carbon">Proceso — título<input className={inp} value={about.processTitle} onChange={(e) => setField('processTitle', e.target.value)} /></label>
          </div>
          <p className="mt-2 text-sm font-bold uppercase tracking-[0.12em] text-carbon/52">Pasos del proceso (4)</p>
          {about.steps.map((s, i) => (
            <div key={i} className="grid gap-2 rounded-2xl border border-carbon/8 bg-clay-surface p-3">
              <input className={inp} placeholder="Título del paso" value={s.title} onChange={(e) => setObjArr('steps', i, 'title', e.target.value)} />
              <textarea className={`${inp} min-h-20`} placeholder="Descripción" value={s.text} onChange={(e) => setObjArr('steps', i, 'text', e.target.value)} />
              <input className={inp} placeholder="Detalle (línea destacada)" value={s.detail} onChange={(e) => setObjArr('steps', i, 'detail', e.target.value)} />
            </div>
          ))}

          <label className="grid gap-1 text-sm font-bold text-carbon">Propuesta de valor — título<textarea className={`${inp} min-h-20`} value={about.valueTitle} onChange={(e) => setField('valueTitle', e.target.value)} /></label>
          <label className="grid gap-1 text-sm font-bold text-carbon">Propuesta de valor — párrafo 1<textarea className={`${inp} min-h-24`} value={about.value[0] || ''} onChange={(e) => setArr('value', 0, e.target.value)} /></label>
          <label className="grid gap-1 text-sm font-bold text-carbon">Propuesta de valor — párrafo 2<textarea className={`${inp} min-h-24`} value={about.value[1] || ''} onChange={(e) => setArr('value', 1, e.target.value)} /></label>

          {msg && <div className="rounded-xl bg-moss/15 px-4 py-2.5 text-sm font-bold text-moss">{msg}</div>}
          <button onClick={saveAbout} disabled={savingAbout} className="justify-self-start rounded-full bg-clay px-6 py-3 font-bold text-clay-bg transition hover:bg-clay-dark disabled:opacity-50">{savingAbout ? 'Guardando...' : 'Guardar Nosotros'}</button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Admin Component ───
const Admin = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [mobileMenu, setMobileMenu] = useState(false)

  if (!isAuthenticated) return <Navigate to="/login" replace />

  const handleLogout = async () => {
    await logout()
  }

  const ActiveComponent = {
    dashboard: DashboardTab,
    products: ProductsTab,
    orders: OrdersTab,
    customers: CustomersTab,
    messages: MessagesTab,
    inventory: InventoryTab,
    content: ContentTab,
    settings: SettingsTab,
    emails: EmailsTab,
    admins: AdminsTab,
  }[activeTab]

  return (
    <div className="min-h-screen bg-clay-surface">
      <div className="sticky top-0 z-30 border-b border-carbon/10 bg-clay-bg/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button className="lg:hidden rounded-full p-2 hover:bg-clay-surface" onClick={() => setMobileMenu(!mobileMenu)}>
              {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <p className="font-display text-2xl font-semibold text-carbon">Admin</p>
            <p className="hidden text-sm text-carbon/48 md:block">Bienvenido, {user?.name}</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 rounded-full bg-carbon px-4 py-2 text-sm font-bold text-clay-bg hover:bg-clay-dark transition">
            <LogOut className="h-4 w-4" /> Salir
          </button>
        </div>
        <nav className="mx-auto hidden max-w-7xl gap-1 px-4 pb-2 lg:flex">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${activeTab === tab.id ? 'bg-carbon text-clay-bg' : 'text-carbon/52 hover:bg-clay-surface hover:text-carbon'}`}>
              <tab.icon className="h-4 w-4" /> {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <AnimatePresence>
        {mobileMenu && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="fixed inset-0 z-20 pt-20 lg:hidden">
            <div className="glass-shell mx-4 grid gap-1 rounded-[2rem] p-4">
              {TABS.map((tab) => (
                <button key={tab.id} onClick={() => { setActiveTab(tab.id); setMobileMenu(false) }}
                  className={`flex items-center gap-3 rounded-full px-4 py-3 text-sm font-bold transition ${activeTab === tab.id ? 'bg-carbon text-clay-bg' : 'text-carbon/60 hover:bg-clay-surface'}`}>
                  <tab.icon className="h-5 w-5" /> {tab.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {ActiveComponent && <ActiveComponent />}
      </main>
    </div>
  )
}

export default Admin
