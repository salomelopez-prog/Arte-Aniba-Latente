import { AnimatePresence, motion } from 'framer-motion'
import { ShoppingBag, X } from 'lucide-react'
import { useCart } from '../../context/CartContext.jsx'
import { formatCurrency } from '../../data/products.js'
import CartItem from './CartItem.jsx'

const CartDrawer = ({ isOpen, onClose, onCheckout }) => {
  const { items, cartCount, cartTotal } = useCart()

  const handleCheckout = () => {
    if (cartCount > 0) {
      onCheckout()
    }
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.button
            type="button"
            aria-label="Cerrar carrito"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-night/45 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 270, damping: 31 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[460px] flex-col bg-clay-surface p-4 shadow-2xl shadow-night/30 sm:p-6"
            aria-label="Carrito de compras"
          >
            <div className="glass-shell -m-1 flex items-center justify-between rounded-[2rem] p-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-walnut">Tu seleccion</p>
                <h2 className="font-display text-4xl font-semibold tracking-tight text-carbon">Carrito</h2>
              </div>
              <button
                type="button"
                className="focus-visible-outline rounded-full bg-clay-bg/80 p-3 text-carbon transition hover:bg-clay-soft"
                aria-label="Cerrar carrito"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 flex-1 overflow-y-auto pr-1">
              {items.length > 0 ? (
                <div className="grid gap-3">
                  {items.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="flex h-full min-h-80 flex-col items-center justify-center rounded-[2rem] border border-dashed border-carbon/18 bg-clay-bg p-8 text-center">
                  <ShoppingBag className="h-12 w-12 text-walnut" />
                  <p className="mt-4 font-display text-3xl font-semibold text-carbon">Aun no hay piezas</p>
                  <p className="mt-2 text-carbon/62">Agrega una pieza del catalogo para iniciar tu pedido.</p>
                </div>
              )}
            </div>

            <div className="dark-shell mt-6 rounded-[1.75rem] p-5 text-clay-bg shadow-2xl shadow-night/20">
              <div className="flex items-center justify-between text-sm text-clay-bg/70">
                <span>{cartCount} productos</span>
                <span>Subtotal</span>
              </div>
              <div className="mt-2 flex items-end justify-between gap-4">
                <p className="text-sm text-clay-bg/62">Envio y disponibilidad se confirman despues de la compra.</p>
                <p className="font-display text-3xl font-semibold">{formatCurrency(cartTotal)}</p>
              </div>
              <button
                type="button"
                className="focus-visible-outline mt-5 w-full rounded-full bg-clay px-5 py-3 font-bold text-clay-bg transition enabled:hover:bg-clay-dark disabled:cursor-not-allowed disabled:opacity-45"
                disabled={cartCount === 0}
                onClick={handleCheckout}
              >
                Pagar ahora
              </button>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  )
}

export default CartDrawer
