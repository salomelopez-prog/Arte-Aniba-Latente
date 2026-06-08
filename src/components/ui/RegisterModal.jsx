import { AnimatePresence, motion } from 'framer-motion'
import { Loader, UserCheck, X } from 'lucide-react'
import { useState } from 'react'
import { useCustomer } from '../../context/CustomerContext.jsx'

const FIELDS = [
  { name: 'first_name', label: 'Nombre *', type: 'text', required: true },
  { name: 'last_name', label: 'Apellido *', type: 'text', required: true },
  { name: 'email', label: 'Email *', type: 'email', required: true },
  { name: 'phone', label: 'Teléfono *', type: 'tel', required: true, placeholder: '+57 300 000 0000' },
  { name: 'whatsapp', label: 'WhatsApp *', type: 'tel', required: true, placeholder: '+57 300 000 0000' },
  { name: 'city', label: 'Ciudad *', type: 'text', required: true },
  { name: 'department', label: 'Departamento *', type: 'text', required: true },
]

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

const RegisterModal = ({ isOpen, onClose, onRegistered }) => {
  const { registerCustomer } = useCustomer()
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const customer = await registerCustomer(form)
      onRegistered?.(customer)
    } catch (err) {
      setError(err.data?.error || err.message || 'No pudimos registrar tus datos')
    } finally {
      setLoading(false)
    }
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
            onClick={onClose}
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
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>

            <div className="pr-12">
              <div className="inline-flex items-center gap-2 rounded-full bg-moss/15 px-3 py-1 text-sm font-bold text-moss">
                <UserCheck className="h-4 w-4" /> Antes de pagar
              </div>
              <h2 className="mt-3 font-display text-5xl font-semibold tracking-tight text-carbon">
                Regístrate
              </h2>
              <p className="mt-3 text-carbon/64">
                Necesitamos tus datos para coordinar el envío. Solo lo haces una vez: la próxima vez
                continuarás directo al pago.
              </p>
            </div>

            <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                {FIELDS.map((field) => (
                  <label key={field.name} className="grid gap-1 text-sm font-bold text-carbon">
                    {field.label}
                    <input
                      className="focus-visible-outline rounded-2xl border border-carbon/10 bg-clay-surface px-4 py-3 font-medium"
                      type={field.type}
                      name={field.name}
                      value={form[field.name]}
                      onChange={handleChange}
                      required={field.required}
                      placeholder={field.placeholder}
                    />
                  </label>
                ))}
              </div>

              <label className="grid gap-1 text-sm font-bold text-carbon">
                Dirección de envío *
                <input
                  className="focus-visible-outline rounded-2xl border border-carbon/10 bg-clay-surface px-4 py-3 font-medium"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  placeholder="Calle, número, barrio, indicaciones"
                />
              </label>

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
                    Registrando...
                  </>
                ) : (
                  'Registrarme y continuar al pago'
                )}
              </button>
            </form>
          </motion.section>
        </div>
      ) : null}
    </AnimatePresence>
  )
}

export default RegisterModal
