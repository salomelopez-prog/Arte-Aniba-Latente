import { CheckCircle2, Instagram, Loader, Mail, MapPin, MessageCircle, Send } from 'lucide-react'
import { useState } from 'react'
import { contactsApi } from '../api/client.js'

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [sent, setSent] = useState(false)
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
      await contactsApi.send(form)
      setSent(true)
      setForm({ name: '', email: '', phone: '', message: '' })
    } catch (err) {
      setError(err.data?.error || err.message || 'Error al enviar mensaje')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-10 md:px-8 md:py-16">
      <section className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-walnut">Hablemos</p>
          <h1 className="mt-4 font-display text-6xl font-semibold leading-[0.92] tracking-[-0.05em] text-carbon md:text-8xl">
            Una pieza empieza con una conversación.
          </h1>
          <p className="mt-6 max-w-xl text-xl leading-8 text-carbon/66">
            Pregunta por disponibilidad, medidas, proyectos especiales o envíos. También puedes escribirnos directo por WhatsApp.
          </p>

          <div className="mt-8 grid gap-3">
            <a className="focus-visible-outline flex items-center gap-4 rounded-[1.5rem] bg-clay-surface p-4 font-bold text-carbon transition hover:bg-clay-soft" href="https://wa.me/573137975713" target="_blank" rel="noreferrer">
              <MessageCircle className="h-6 w-6 text-clay" /> +57 313 7975713
            </a>
            <a className="focus-visible-outline flex items-center gap-4 rounded-[1.5rem] bg-clay-surface p-4 font-bold text-carbon transition hover:bg-clay-soft" href="mailto:arteaniba@gmail.com">
              <Mail className="h-6 w-6 text-clay" /> arteaniba@gmail.com
            </a>
            <a className="focus-visible-outline flex items-center gap-4 rounded-[1.5rem] bg-clay-surface p-4 font-bold text-carbon transition hover:bg-clay-soft" href="https://instagram.com/arteaniba" target="_blank" rel="noreferrer">
              <Instagram className="h-6 w-6 text-clay" /> @arteaniba
            </a>
            <div className="flex items-center gap-4 rounded-[1.5rem] bg-clay-surface p-4 font-bold text-carbon">
              <MapPin className="h-6 w-6 text-clay" /> Vereda El Arenal, San Rafael, Antioquia
            </div>
          </div>
        </div>

        <div className="glass-shell rounded-[3rem] p-5 md:p-8">
          {sent ? (
            <div className="dark-shell flex min-h-[520px] flex-col items-center justify-center rounded-[2.25rem] p-8 text-center text-clay-bg">
              <CheckCircle2 className="h-14 w-14 text-clay" />
              <h2 className="mt-6 font-display text-5xl font-semibold">Mensaje enviado</h2>
              <p className="mt-4 max-w-md text-clay-bg/68">
                Gracias por escribirnos. Te responderemos a la brevedad posible.
              </p>
              <button
                type="button"
                className="focus-visible-outline mt-8 rounded-full bg-clay px-6 py-3 font-bold text-clay-bg transition hover:bg-clay-dark"
                onClick={() => setSent(false)}
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form className="grid gap-5" onSubmit={handleSubmit}>
              <div>
                <h2 className="font-display text-5xl font-semibold tracking-tight text-carbon">Cuéntanos qué buscas</h2>
              </div>
              <label className="grid gap-2 font-bold text-carbon">
                Nombre *
                <input
                  className="focus-visible-outline rounded-2xl border border-carbon/10 bg-clay-surface px-4 py-4 font-medium"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </label>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 font-bold text-carbon">
                  Correo *
                  <input
                    className="focus-visible-outline rounded-2xl border border-carbon/10 bg-clay-surface px-4 py-4 font-medium"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label className="grid gap-2 font-bold text-carbon">
                  Teléfono
                  <input
                    className="focus-visible-outline rounded-2xl border border-carbon/10 bg-clay-surface px-4 py-4 font-medium"
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+57 300 000 0000"
                  />
                </label>
              </div>
              <label className="grid gap-2 font-bold text-carbon">
                Mensaje *
                <textarea
                  className="focus-visible-outline min-h-40 rounded-2xl border border-carbon/10 bg-clay-surface px-4 py-4 font-medium"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
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
                className="focus-visible-outline inline-flex items-center justify-center gap-2 rounded-full bg-carbon px-6 py-4 font-bold text-clay-bg transition hover:bg-clay-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? <Loader className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                {loading ? 'Enviando...' : 'Enviar mensaje'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}

export default Contact
