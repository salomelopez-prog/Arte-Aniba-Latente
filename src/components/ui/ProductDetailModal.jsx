import { AnimatePresence, motion } from 'framer-motion'
import { Check, Minus, Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useCart } from '../../context/CartContext.jsx'
import { formatCurrency } from '../../data/products.js'

const toneClasses = {
  'from-clay to-walnut': 'from-clay to-walnut',
  'from-night to-clay': 'from-night to-clay',
  'from-moss to-walnut': 'from-moss to-walnut',
}

// Modal de detalle. Recibe 'variants' = array de tamaños del mismo producto
// (un solo elemento si el producto no está agrupado).
const ProductDetailModal = ({ variants, onClose }) => {
  const { addToCart } = useCart()
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [added, setAdded] = useState(false)

  // Al abrir un producto distinto, reinicia la selección.
  useEffect(() => {
    setSelectedIdx(0)
    setAdded(false)
  }, [variants])

  if (!variants || variants.length === 0) return null

  const isGroup = variants.length > 1
  const selected = variants[selectedIdx] || variants[0]
  const baseName = isGroup ? selected.grupo : selected.name
  const isOutOfStock = selected.stock !== undefined && selected.stock <= 0

  const handleAdd = () => {
    if (isOutOfStock) return
    addToCart(selected) // agrega la VARIANTE seleccionada (product_id real)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  // Portal a document.body: evita que el filter/transform de la animación de página
  // rompa el position:fixed (si no, el modal queda centrado en la página, no en la pantalla).
  return createPortal(
    <AnimatePresence>
      {variants && variants.length ? (
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
            className="relative grid max-h-[88vh] w-full max-w-3xl gap-0 overflow-hidden rounded-[2rem] bg-clay-bg shadow-2xl shadow-night/35 md:grid-cols-2"
          >
            <button
              type="button"
              className="focus-visible-outline absolute right-4 top-4 z-10 rounded-full bg-clay-bg/80 p-2.5 text-carbon transition hover:bg-clay-surface"
              aria-label="Cerrar"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>

            {/* Imagen de la variante seleccionada (o placeholder) */}
            <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-clay-surface md:aspect-auto">
              {selected.imageUrl ? (
                <img className="absolute inset-0 h-full w-full object-cover" src={selected.imageUrl} alt={baseName} />
              ) : (
                <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${toneClasses[selected.tone] || toneClasses['from-clay to-walnut']}`}>
                  <p className="font-display text-6xl font-semibold text-clay-bg">{selected.reference}</p>
                </div>
              )}
            </div>

            {/* Información */}
            <div className="flex flex-col gap-4 overflow-y-auto p-6 md:p-7">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-clay-surface px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-carbon/70">
                    {selected.category}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-carbon/40">Ref. {selected.reference}</span>
                </div>
                <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-carbon">{baseName}</h2>
              </div>

              <p className="whitespace-pre-line text-base leading-7 text-carbon/72">{selected.description}</p>

              {/* Selector de tamaño (solo si hay varias variantes) */}
              {isGroup && (
                <div>
                  <p className="mb-2 text-sm font-bold uppercase tracking-[0.12em] text-carbon/60">Selecciona tu tamaño</p>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((v, i) => {
                      const agotado = v.stock !== undefined && v.stock <= 0
                      return (
                        <button
                          key={v.id}
                          type="button"
                          disabled={agotado}
                          onClick={() => setSelectedIdx(i)}
                          className={`rounded-2xl border px-4 py-2 text-sm font-bold transition ${
                            i === selectedIdx
                              ? 'border-clay bg-clay text-clay-bg'
                              : agotado
                                ? 'cursor-not-allowed border-carbon/10 bg-clay-surface text-carbon/30 line-through'
                                : 'border-carbon/15 bg-clay-surface text-carbon hover:border-clay/50'
                          }`}
                        >
                          {v.size || v.name}
                          <span className="ml-2 opacity-70">{formatCurrency(v.price)}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {!isGroup && selected.size ? (
                <p className="text-base font-semibold text-walnut">Tamaño: {selected.size}</p>
              ) : null}

              <div className="flex items-center gap-3">
                <span className="font-display text-3xl font-semibold text-carbon">{formatCurrency(selected.price)}</span>
                {selected.stock !== undefined && (
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${isOutOfStock ? 'bg-red-100 text-red-600' : selected.stock <= 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-moss/20 text-moss'}`}>
                    {isOutOfStock ? 'Agotado' : `${selected.stock} en stock`}
                  </span>
                )}
              </div>

              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAdd}
                className={`focus-visible-outline mt-auto inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 font-bold transition ${isOutOfStock ? 'cursor-not-allowed bg-carbon/20 text-carbon/40' : added ? 'bg-moss text-clay-bg' : 'bg-clay text-clay-bg hover:bg-clay-dark'}`}
              >
                {isOutOfStock ? (
                  <><Minus className="h-5 w-5" /> Agotado</>
                ) : added ? (
                  <><Check className="h-5 w-5" /> Agregado al carrito</>
                ) : (
                  <><Plus className="h-5 w-5" /> Agregar al carrito</>
                )}
              </button>
            </div>
          </motion.section>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}

export default ProductDetailModal
