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

const ProductCard = ({ product, variants, onSelect }) => {
  const { addToCart } = useCart()

  // 'list' = todas las variantes (tamaños) del mismo grupo. Si no se pasa, es un solo producto.
  const list = variants && variants.length ? variants : [product]
  const rep = list[0]
  const isGroup = list.length > 1
  const minPrice = Math.min(...list.map((v) => v.price))
  const groupStock = list.reduce((sum, v) => sum + (v.stock ?? 0), 0)
  const isOutOfStock = isGroup ? groupStock <= 0 : rep.stock !== undefined && rep.stock <= 0
  const displayName = isGroup ? rep.grupo : rep.name

  const handleAddToCart = () => {
    // Producto simple: agrega directo. Grupo: abre el detalle para elegir tamaño.
    if (isOutOfStock) return
    if (isGroup) onSelect?.(list)
    else addToCart(rep)
  }

  const handleSelect = () => onSelect?.(list)

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
      {/* Contenedor de imagen: ahora es clickeable (abre el detalle) y SIN overlays encima de la foto */}
      <div
        onClick={handleSelect}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelect()}
        aria-label={`Ver detalles de ${displayName}`}
        className="diagonal-cut relative m-3 flex aspect-[1.08] cursor-pointer items-center justify-center overflow-hidden rounded-[1.75rem] bg-clay-surface"
      >
        {rep.imageUrl ? (
          // Imagen limpia: solo la foto, sin recuadro de referencia ni badge encima
          <img className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" src={rep.imageUrl} alt={displayName} />
        ) : (
          // Placeholder SOLO cuando el producto no tiene foto (no es una imagen real)
          <>
            <div className={`absolute inset-0 bg-gradient-to-br ${toneClasses[rep.tone] || toneClasses['from-clay to-walnut']} opacity-95`} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_18%,rgba(253,251,247,0.86),transparent_20%),radial-gradient(circle_at_72%_78%,rgba(31,27,24,0.28),transparent_34%),linear-gradient(120deg,rgba(255,255,255,0.08),transparent_38%)]" />
            <div className="absolute -left-16 top-10 h-36 w-36 rounded-full border border-clay-bg/18" />
            <div className="absolute -right-10 bottom-4 h-28 w-28 rounded-full border border-clay-bg/16" />
            <div className="relative flex h-36 w-36 items-center justify-center rounded-[2.25rem] border border-clay-bg/35 bg-clay-bg/18 text-center text-clay-bg shadow-2xl shadow-night/20 backdrop-blur-sm transition duration-500 group-hover:scale-105 group-hover:rotate-3 md:h-44 md:w-44">
              <div>
                <p className="font-display text-5xl font-semibold">{rep.reference}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.24em] opacity-80">Ref.</p>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="relative p-5 pt-3">
        {/* Categoría y referencia ahora van DEBAJO de la imagen, nunca encima */}
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-clay-surface px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-carbon/70">
            {rep.category}
          </span>
          {!isGroup && <span className="text-xs font-bold uppercase tracking-[0.16em] text-carbon/40">Ref. {rep.reference}</span>}
        </div>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h3
              onClick={handleSelect}
              className="cursor-pointer font-display text-2xl font-semibold tracking-tight text-carbon transition hover:text-clay"
            >
              {displayName}
            </h3>
            {/* Si es grupo, muestra cuántos tamaños hay; si no, el tamaño único */}
            <p className="mt-1 text-sm font-semibold text-walnut">{isGroup ? `${list.length} tamaños disponibles` : rep.size}</p>
          </div>
          <p className="whitespace-nowrap rounded-full bg-carbon px-3 py-1 text-sm font-bold text-clay-bg">
            {isGroup ? `Desde ${formatCurrency(minPrice)}` : formatCurrency(rep.price)}
          </p>
        </div>
        <p className="mt-4 min-h-16 text-base leading-6 text-carbon/68">{rep.description}</p>
        <div className="mt-3 flex items-center gap-2">
          {!isGroup && rep.stock !== undefined && (
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${isOutOfStock ? 'bg-red-100 text-red-600' : rep.stock <= 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-moss/20 text-moss'}`}>
              {isOutOfStock ? 'Agotado' : `${rep.stock} en stock`}
            </span>
          )}
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            className="focus-visible-outline flex items-center justify-center gap-2 rounded-full border border-carbon/15 px-4 py-3 text-sm font-bold text-carbon transition hover:bg-clay-surface"
            onClick={handleSelect}
          >
            Ver detalles
          </button>
          <button
            type="button"
            disabled={isOutOfStock}
            className={`focus-visible-outline flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-3 font-bold shadow-xl transition ${isOutOfStock ? 'cursor-not-allowed bg-carbon/20 text-carbon/40' : 'bg-clay text-clay-bg shadow-clay/18 hover:-translate-y-0.5 hover:bg-clay-dark'}`}
            onClick={handleAddToCart}
          >
            {isOutOfStock ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isOutOfStock ? 'Agotado' : isGroup ? 'Elegir tamaño' : 'Agregar'}
          </button>
        </div>
      </div>
    </motion.article>
  )
}

export default ProductCard
