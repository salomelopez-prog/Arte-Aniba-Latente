import { AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import ProductCard from '../components/ui/ProductCard.jsx'
import ProductDetailModal from '../components/ui/ProductDetailModal.jsx'
import { useProducts } from '../context/ProductContext.jsx'

const Catalog = () => {
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedVariants, setSelectedVariants] = useState(null)
  const { categories, products } = useProducts()

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory
      const matchesSearch = `${product.name} ${product.reference} ${product.description}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())

      return matchesCategory && matchesSearch
    })
  }, [products, searchTerm, selectedCategory])

  // Agrupa por 'grupo': productos con el mismo grupo se muestran como una sola tarjeta.
  // Los que no tienen grupo quedan individuales (clave única por id).
  const groups = useMemo(() => {
    const map = new Map()
    filteredProducts.forEach((p) => {
      const key = p.grupo && p.grupo.trim() ? `g:${p.grupo.trim().toLowerCase()}` : `p:${p.id}`
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(p)
    })
    // Ordena las variantes de cada grupo por precio ascendente
    return Array.from(map.entries()).map(([key, variants]) => ({
      key,
      variants: [...variants].sort((a, b) => a.price - b.price),
    }))
  }, [filteredProducts])

  return (
    <div className="px-4 py-10 md:px-8 md:py-16">
      <section className="mx-auto max-w-7xl">
        <div className="dark-shell relative overflow-hidden rounded-[3rem] p-7 text-clay-bg md:p-10 lg:p-12">
          <div className="absolute inset-0 grain-layer opacity-30" />
          <div className="relative grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-clay-soft/80">Catalogo vivo</p>
            <h1 className="mt-4 font-display text-6xl font-semibold leading-[0.95] tracking-[-0.05em] text-clay-bg md:text-8xl">
              Elige una pieza con historia.
            </h1>
          </div>
          <p className="text-xl leading-8 text-clay-bg/70">
            Cada producto corresponde a una referencia real del taller. Las medidas, vetas y grietas pueden variar porque ninguna raiz se comporta igual.
          </p>
          </div>
        </div>

        <div className="glass-shell sticky top-24 z-20 mt-8 grid gap-4 rounded-[2rem] p-3 lg:grid-cols-[1fr_340px]">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={[
                  'focus-visible-outline rounded-full px-5 py-3 text-sm font-bold transition',
                  selectedCategory === category
                    ? 'bg-carbon text-clay-bg shadow-lg shadow-carbon/10'
                    : 'bg-clay-bg/68 text-carbon/68 hover:bg-clay-soft hover:text-carbon',
                ].join(' ')}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
          <label className="relative block">
            <span className="sr-only">Buscar producto</span>
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-walnut" />
            <input
              className="focus-visible-outline w-full rounded-full border border-carbon/10 bg-clay-bg/74 py-3 pl-12 pr-5 font-semibold text-carbon placeholder:text-carbon/38"
              placeholder="Buscar por nombre o referencia"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {groups.map((g) => (
              <ProductCard key={g.key} product={g.variants[0]} variants={g.variants} onSelect={setSelectedVariants} />
            ))}
          </AnimatePresence>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="mt-10 rounded-[2rem] border border-dashed border-carbon/18 bg-clay-surface p-10 text-center">
            <p className="font-display text-4xl font-semibold text-carbon">No encontramos piezas</p>
            <p className="mt-2 text-carbon/62">Prueba con otra categoria o referencia.</p>
          </div>
        ) : null}
      </section>

      <ProductDetailModal variants={selectedVariants} onClose={() => setSelectedVariants(null)} />
    </div>
  )
}

export default Catalog
