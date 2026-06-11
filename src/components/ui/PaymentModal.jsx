import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, ExternalLink, Loader, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ordersApi } from '../../api/client.js'
import { useCart } from '../../context/CartContext.jsx'
import { useCustomer } from '../../context/CustomerContext.jsx'
import { formatCurrency } from '../../data/products.js'

const emptyForm = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  whatsapp: '',
  city: '',
  department: '',
  address: '',
}

const PaymentModal = ({ isOpen, onClose }) => {
  const { cartTotal, items, clearCart } = useCart()
  const { customer, clearCustomer } = useCustomer()
  const [loading, setLoading] = useState(false)
  const [paymentUrl, setPaymentUrl] = useState(null)
  const [orderNumber, setOrderNumber] = useState(null)
  const [error, setError] = useState('')
  const [customerForm, setCustomerForm] = useState(emptyForm)

  // Precargar el formulario con los datos del cliente registrado cada vez que se abre.
  useEffect(() => {
    if (isOpen && customer) {
      setCustomerForm({
        first_name: customer.first_name || '',
        last_name: customer.last_name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        whatsapp: customer.whatsapp || customer.phone || '',
        city: customer.city || '',
        department: customer.department || '',
        address: customer.address || '',
      })
    }
  }, [isOpen, customer])

  const handleCustomerChange = (e) => {
    const { name, value } = e.target
    setCustomerForm((f) => ({ ...f, [name]: value }))
    setError('')
  }

  // Abre la pasarela de Bold con la configuración (firma) generada por el servidor.
  const openBoldCheckout = (bold) => {
    const launch = () => {
      const checkout = new window.BoldCheckout({
        orderId: bold.orderId,
        currency: bold.currency,
        amount: bold.amount,
        apiKey: bold.apiKey,
        integritySignature: bold.integritySignature,
        description: bold.description,
        redirectionUrl: bold.redirectionUrl,
        customerData: JSON.stringify({
          email: customerForm.email,
          fullName: `${customerForm.first_name} ${customerForm.last_name || ''}`.trim(),
          phone: customerForm.phone,
        }),
      })
      checkout.open()
    }

    if (window.BoldCheckout) {
      launch()
    } else {
      // El script de Bold aún no terminó de cargar: esperar el evento.
      window.addEventListener('boldCheckoutLoaded', launch, { once: true })
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload = {
        customer: {
          first_name: customerForm.first_name,
          last_name: customerForm.last_name,
          email: customerForm.email,
          phone: customerForm.phone,
          whatsapp: customerForm.whatsapp || customerForm.phone,
          city: customerForm.city,
          department: customerForm.department,
          address: customerForm.address,
        },
        items: items.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
        shipping_address: customerForm.address,
        shipping_city: customerForm.city,
        shipping_department: customerForm.department,
        notes: `Pedido desde la tienda web`,
      }

      const result = await ordersApi.create(payload)
      clearCart()

      if (result.bold) {
        // Pasarela real de Bold: abrir el Botón de Pagos con la firma del servidor.
        openBoldCheckout(result.bold)
        return
      }

      // Modo simulado (sin llaves de Bold configuradas)
      setOrderNumber(result.order.order_number)
      setPaymentUrl(result.paymentUrl)
    } catch (err) {
      setError(err.data?.error || err.message || 'Error al procesar el pedido')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setPaymentUrl(null)
    setOrderNumber(null)
    setError('')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label="Cerrar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-night/55 backdrop-blur-md"
            onClick={handleClose}
          />
          <motion.section
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ duration: 0.28 }}
            className="relative w-full max-w-xl overflow-hidden rounded-[2rem] bg-clay-bg p-5 shadow-2xl shadow-night/35 md:p-7"
          >
            <button
              type="button"
              className="focus-visible-outline absolute right-4 top-4 rounded-full bg-clay-surface p-3 text-carbon transition hover:bg-clay-soft"
              aria-label="Cerrar"
              onClick={handleClose}
            >
              <X className="h-5 w-5" />
            </button>

            {paymentUrl ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="mx-auto h-16 w-16 text-moss" />
                <h2 className="mt-5 font-display text-5xl font-semibold tracking-tight text-carbon">
                  Pedido creado
                </h2>
                <p className="mx-auto mt-3 max-w-md text-lg leading-7 text-carbon/66">
                  Tu pedido <strong>{orderNumber}</strong> está listo. Haz clic en el botón para ir a la
                  pasarela de pago segura de Bold Colombia.
                </p>
                <a
                  href={paymentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="focus-visible-outline mt-7 inline-flex items-center gap-2 rounded-full bg-clay px-6 py-3 font-bold text-clay-bg transition hover:bg-clay-dark"
                >
                  Ir a pagar <ExternalLink className="h-4 w-4" />
                </a>
                <p className="mt-4 text-sm text-carbon/48">
                  ¿No se abrió la pasarela?{' '}
                  <a href={paymentUrl} target="_blank" rel="noreferrer" className="underline">
                    Abrir enlace
                  </a>
                </p>
              </div>
            ) : (
              <>
                <div className="pr-12">
                  <h2 className="font-display text-5xl font-semibold tracking-tight text-carbon">
                    Finalizar pedido
                  </h2>
                  <p className="mt-3 text-carbon/64">
                    Confirma tus datos para generar el enlace de pago seguro con Bold Colombia.
                  </p>
                  {customer ? (
                    <p className="mt-2 text-sm text-carbon/52">
                      Registrado como <strong>{customer.first_name} {customer.last_name || ''}</strong>.{' '}
                      <button
                        type="button"
                        className="font-bold text-clay underline"
                        onClick={clearCustomer}
                      >
                        Cambiar datos
                      </button>
                    </p>
                  ) : null}
                </div>

                <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-1 text-sm font-bold text-carbon">
                      Nombre *
                      <input
                        className="focus-visible-outline rounded-2xl border border-carbon/10 bg-clay-surface px-4 py-3 font-medium"
                        name="first_name"
                        value={customerForm.first_name}
                        onChange={handleCustomerChange}
                        required
                      />
                    </label>
                    <label className="grid gap-1 text-sm font-bold text-carbon">
                      Apellido
                      <input
                        className="focus-visible-outline rounded-2xl border border-carbon/10 bg-clay-surface px-4 py-3 font-medium"
                        name="last_name"
                        value={customerForm.last_name}
                        onChange={handleCustomerChange}
                      />
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-1 text-sm font-bold text-carbon">
                      Email *
                      <input
                        className="focus-visible-outline rounded-2xl border border-carbon/10 bg-clay-surface px-4 py-3 font-medium"
                        type="email"
                        name="email"
                        value={customerForm.email}
                        onChange={handleCustomerChange}
                        required
                      />
                    </label>
                    <label className="grid gap-1 text-sm font-bold text-carbon">
                      Teléfono *
                      <input
                        className="focus-visible-outline rounded-2xl border border-carbon/10 bg-clay-surface px-4 py-3 font-medium"
                        type="tel"
                        name="phone"
                        value={customerForm.phone}
                        onChange={handleCustomerChange}
                        required
                        placeholder="+57 300 000 0000"
                      />
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-1 text-sm font-bold text-carbon">
                      WhatsApp
                      <input
                        className="focus-visible-outline rounded-2xl border border-carbon/10 bg-clay-surface px-4 py-3 font-medium"
                        type="tel"
                        name="whatsapp"
                        value={customerForm.whatsapp}
                        onChange={handleCustomerChange}
                        placeholder="+57 300 000 0000"
                      />
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-1 text-sm font-bold text-carbon">
                      Ciudad
                      <input
                        className="focus-visible-outline rounded-2xl border border-carbon/10 bg-clay-surface px-4 py-3 font-medium"
                        name="city"
                        value={customerForm.city}
                        onChange={handleCustomerChange}
                      />
                    </label>
                    <label className="grid gap-1 text-sm font-bold text-carbon">
                      Departamento
                      <input
                        className="focus-visible-outline rounded-2xl border border-carbon/10 bg-clay-surface px-4 py-3 font-medium"
                        name="department"
                        value={customerForm.department}
                        onChange={handleCustomerChange}
                      />
                    </label>
                  </div>

                  <label className="grid gap-1 text-sm font-bold text-carbon">
                    Dirección de envío
                    <input
                      className="focus-visible-outline rounded-2xl border border-carbon/10 bg-clay-surface px-4 py-3 font-medium"
                      name="address"
                      value={customerForm.address}
                      onChange={handleCustomerChange}
                    />
                  </label>

                  <div className="mt-2 flex items-center justify-between rounded-[1.5rem] bg-night p-4 text-clay-bg">
                    <span className="text-clay-bg/62">Total a pagar</span>
                    <span className="font-display text-3xl font-semibold">
                      {formatCurrency(cartTotal)}
                    </span>
                  </div>

                  {error ? (
                    <div className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-bold text-red-600">
                      {error}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={loading}
                    className="focus-visible-outline inline-flex items-center justify-center gap-2 rounded-full bg-clay px-6 py-4 font-bold text-clay-bg transition hover:bg-clay-dark disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin" />
                        Generando enlace...
                      </>
                    ) : (
                      'Generar enlace de pago seguro'
                    )}
                  </button>

                  <p className="text-center text-xs text-carbon/40">
                    Pago procesado por Bold Colombia. Tus datos están protegidos.
                  </p>
                </form>
              </>
            )}
          </motion.section>
        </div>
      ) : null}
    </AnimatePresence>
  )
}

export default PaymentModal
