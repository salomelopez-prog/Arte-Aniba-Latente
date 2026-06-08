import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '../../context/CartContext.jsx'
import { formatCurrency } from '../../data/products.js'

const CartItem = ({ item }) => {
  const { decreaseQuantity, increaseQuantity, removeFromCart } = useCart()

  const handleDecrease = () => decreaseQuantity(item.id)
  const handleIncrease = () => increaseQuantity(item.id)
  const handleRemove = () => removeFromCart(item.id)

  return (
    <article className="rounded-[1.5rem] border border-carbon/10 bg-clay-bg p-4">
      <div className="flex gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-clay to-walnut text-clay-bg">
          <span className="font-display text-2xl font-semibold">{item.reference}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-xl font-semibold text-carbon">{item.name}</h3>
              <p className="text-sm font-semibold text-walnut">{formatCurrency(item.price)}</p>
            </div>
            <button
              type="button"
              className="focus-visible-outline rounded-full p-2 text-carbon/45 transition hover:bg-clay-surface hover:text-carbon"
              aria-label={`Eliminar ${item.name}`}
              onClick={handleRemove}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 rounded-full bg-clay-surface p-1">
              <button
                type="button"
                className="focus-visible-outline rounded-full bg-clay-bg p-2 text-carbon transition hover:bg-clay-soft"
                aria-label={`Disminuir cantidad de ${item.name}`}
                onClick={handleDecrease}
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-8 text-center text-sm font-bold">{item.quantity}</span>
              <button
                type="button"
                className="focus-visible-outline rounded-full bg-clay-bg p-2 text-carbon transition hover:bg-clay-soft"
                aria-label={`Aumentar cantidad de ${item.name}`}
                onClick={handleIncrease}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-sm font-bold text-carbon">{formatCurrency(item.price * item.quantity)}</p>
          </div>
        </div>
      </div>
    </article>
  )
}

export default CartItem
