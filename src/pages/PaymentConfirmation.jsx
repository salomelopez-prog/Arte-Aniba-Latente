import { motion } from 'framer-motion'
import { CheckCircle2, Home, ShoppingBag } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'

const PaymentConfirmation = ({ simulated = false }) => {
  const [params] = useSearchParams()
  const { clearCart } = useCart()
  const orderNumber = params.get('order') || params.get('order_number')

  // El carrito ya se vacía al crear el pedido, pero lo aseguramos al volver de la pasarela.
  useEffect(() => {
    clearCart()
  }, [clearCart])

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center px-4 py-16">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full rounded-[2.5rem] border border-carbon/10 bg-clay-bg p-8 text-center shadow-xl shadow-night/10 md:p-12"
      >
        <CheckCircle2 className="mx-auto h-20 w-20 text-moss" />
        <h1 className="mt-6 font-display text-6xl font-semibold tracking-tight text-carbon">
          ¡Gracias por tu compra!
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg leading-7 text-carbon/66">
          {orderNumber ? (
            <>
              Tu pedido <strong>{orderNumber}</strong> fue registrado.{' '}
            </>
          ) : (
            'Tu pedido fue registrado. '
          )}
          {simulated
            ? 'Este es un pago simulado de prueba. En producción llegarías a la pasarela real de Bold.'
            : 'Te enviaremos un correo con la confirmación y el seguimiento de tu envío.'}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/catalogo"
            className="focus-visible-outline inline-flex items-center gap-2 rounded-full bg-clay px-6 py-3 font-bold text-clay-bg transition hover:bg-clay-dark"
          >
            <ShoppingBag className="h-4 w-4" /> Seguir comprando
          </Link>
          <Link
            to="/"
            className="focus-visible-outline inline-flex items-center gap-2 rounded-full border border-carbon/10 px-6 py-3 font-bold text-carbon transition hover:bg-clay-surface"
          >
            <Home className="h-4 w-4" /> Ir al inicio
          </Link>
        </div>
      </motion.section>
    </div>
  )
}

export default PaymentConfirmation
