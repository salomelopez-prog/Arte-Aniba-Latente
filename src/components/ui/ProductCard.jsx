import { motion } from 'framer-motion'
import { Minus, Plus } from 'lucide-react'
import { useCart } from '../../context/CartContext.jsx'
import { formatCurrency } from '../../data/products.js'

const toneClasses = {
  'from-clay to-walnut': 'from-clay to-walnut',
  'from-night to-clay': 'from-night to-clay',
  'from-moss to-walnut': 'from-moss to-walnut',
  'from-walnut to-clay': 'from-walnut to-clay',
  'from-clay-dark to-clay': 'from-clay-dark to-clay',
  'from-night to-walnut': 'from-night to-walnut',
  'from-clay to-clay-soft': 'from-clay to-clay-soft',
  'from-moss to-clay': 'from-moss to-clay',
  'from-walnut to-night': 'from-walnut to-night',
  'from-clay-dark to-moss': 'from-clay-dark to-moss',
  'from-clay to-night': 'from-clay to-night',
  'from-night to-moss': 'from-night to-moss',
  'from-moss to-clay-soft': 'from-moss to-clay-soft',
}

const ProductCard = ({ product }) => {
  const { addToCart } = useCart()
  const isOutOfStock = product.stock !== undefined && product.stock <= 0

  const handleAddToCart = () => {
    if (!isOutOfStock) addToCart(product)
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 18 }}
      whileHover={{ y: -10, rotate: -0.4 }}
      transition={{ duration: 0.28 }}
      className={`group artisan-card relative overflow-hidden rounded-[2.25rem] ${isOutOfStock ? 'opacity-70' : ''}`}
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-clay/10 blur-2xl transition duration-500 group-hover:bg-clay/20" />
      <div className="diagonal-cut relative m-3 flex aspect-[1.08] items-center justify-center overflow-hidden rounded-[1.75rem] bg-clay-surface">
        {product.imageUrl ? (
          <img className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" src={product.imageUrl} alt={product.name} />
        ) : (
          <>
            <div className={`absolute inset-0 bg-gradient-to-br ${toneClasses[product.tone] || toneClasses['from-clay to-walnut']} opacity-95`} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_18%,rgba(253,251,247,0.86),transparent_20%),radial-gradient(circle_at_72%_78%,rgba(31,27,24,0.28),transparent_34%),linear-gradient(120deg,rgba(255,255,255,0.08),transparent_38%)]" />
            <div className="absolute -left-16 top-10 h-36 w-36 rounded-full border border-clay-bg/18" />
            <div className="absolute -right-10 bottom-4 h-28 w-28 rounded-full border border-clay-bg/16" />
            <div className="relative flex h-36 w-36 items-center justify-center rounded-[2.25rem] border border-clay-bg/35 bg-clay-bg/18 text-center text-clay-bg shadow-2xl shadow-night/20 backdrop-blur-sm transition duration-500 group-hover:scale-105 group-hover:rotate-3 md:h-44 md:w-44">
              <div>
                <p className="font-display text-5xl font-semibold">{product.reference}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.24em] opacity-80">Ref.</p>
              </div>
            </div>
          </>
        )}
        {product.imageUrl ? (
          <div className="absolute bottom-4 right-4 rounded-2xl border border-clay-bg/35 bg-night/45 px-4 py-2 text-center text-clay-bg shadow-xl shadow-night/20 backdrop-blur-md">
            <p className="font-display text-3xl font-semibold">{product.reference}</p>
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.22em] opacity-80">Ref.</p>
          </div>
        ) : null}
        <span className="absolute left-4 top-4 rounded-full bg-clay-bg/90 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-carbon shadow-lg shadow-night/10 backdrop-blur-md">
          {product.category}
        </span>
      </div>
      <div className="relative p-5 pt-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl font-semibold tracking-tight text-carbon">{product.name}</h3>
            <p className="mt-1 text-sm font-semibold text-walnut">{product.size}</p>
          </div>
          <p className="whitespace-nowrap rounded-full bg-carbon px-3 py-1 text-sm font-bold text-clay-bg">
            {formatCurrency(product.price)}
          </p>
        </div>
        <p className="mt-4 min-h-16 text-base leading-6 text-carbon/68">{product.description}</p>
        <div className="mt-3 flex items-center gap-2">
          {product.stock !== undefined && (
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${isOutOfStock ? 'bg-red-100 text-red-600' : product.stock <= 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-moss/20 text-moss'}`}>
              {isOutOfStock ? 'Agotado' : `${product.stock} en stock`}
            </span>
          )}
        </div>
        <button
          type="button"
          disabled={isOutOfStock}
          className={`focus-visible-outline mt-4 flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 font-bold shadow-xl transition ${isOutOfStock ? 'cursor-not-allowed bg-carbon/20 text-carbon/40' : 'bg-clay text-clay-bg shadow-clay/18 hover:-translate-y-0.5 hover:bg-clay-dark'}`}
          onClick={handleAddToCart}
        >
          {isOutOfStock ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {isOutOfStock ? 'Agotado' : 'Agregar al carrito'}
        </button>
      </div>
    </motion.article>
  )
}

export default ProductCard
