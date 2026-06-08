import { motion } from 'framer-motion'
import { ArrowRight, Leaf, ShieldCheck, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ui/ProductCard.jsx'
import { useProducts } from '../context/ProductContext.jsx'

const Home = () => {
  const { products } = useProducts()
  const featuredProducts = products.filter((product) => ['1107', '1156', '1141'].includes(product.reference))
  const visibleProducts = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 3)

  return (
    <div className="px-4 py-10 md:px-8 md:py-16">
      <section className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex rounded-full border border-carbon/10 bg-clay-bg/70 px-4 py-2 text-sm font-bold uppercase tracking-[0.24em] text-walnut shadow-lg shadow-carbon/5 backdrop-blur-xl"
          >
            Taller familiar en Antioquia
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mt-6 max-w-4xl font-display text-6xl font-semibold leading-[0.88] tracking-[-0.06em] text-carbon md:text-8xl xl:text-9xl"
          >
            Raices que vuelven a tener forma.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="mt-6 max-w-2xl text-xl leading-8 text-carbon/68"
          >
            Piezas talladas a mano en comino crespo recuperado. Cada veta, grieta y curva se conserva como parte de la historia natural de la madera.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              to="/catalogo"
              className="focus-visible-outline inline-flex items-center justify-center gap-2 rounded-full bg-carbon px-7 py-4 font-bold text-clay-bg shadow-2xl shadow-carbon/18 transition hover:-translate-y-0.5 hover:bg-clay-dark"
            >
              Explorar catalogo <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/nosotros"
              className="focus-visible-outline inline-flex items-center justify-center rounded-full border border-carbon/12 bg-clay-bg/68 px-7 py-4 font-bold text-carbon shadow-lg shadow-carbon/5 backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-clay-surface"
            >
              Conocer el proceso
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, rotate: 2, scale: 0.96 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
          className="dark-shell relative min-h-[540px] overflow-hidden rounded-[3rem] p-6 text-clay-bg shadow-2xl shadow-night/24"
        >
          <div className="absolute inset-0 opacity-40 grain-layer" />
          <div className="absolute -right-16 top-14 h-72 w-72 rounded-full border border-clay-bg/10" />
          <div className="absolute -bottom-20 -left-14 h-80 w-80 rounded-full bg-clay/20 blur-3xl" />
          <div className="absolute right-7 top-7 rounded-full border border-clay-bg/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-clay-bg/58">
            Edicion natural
          </div>
          <div className="relative flex h-full min-h-[470px] flex-col justify-between">
            <div className="flex justify-between gap-6">
              <p className="max-w-48 text-sm uppercase tracking-[0.28em] text-clay-bg/60">Sin moldes, sin tintes, sin piezas repetidas.</p>
              <p className="font-display text-7xl font-semibold text-clay-soft">14</p>
            </div>
            <div>
              <div className="hero-specimen mx-auto h-72 w-72 rounded-[42%_58%_48%_52%/58%_42%_58%_42%] border border-clay-bg/20 shadow-2xl shadow-night/50" />
              <div className="mt-8 rounded-[2rem] border border-clay-bg/10 bg-clay-bg/10 p-5 backdrop-blur-md">
                <p className="font-display text-4xl font-semibold">Comino crespo</p>
                <p className="mt-2 text-clay-bg/68">Raices recuperadas transformadas en esculturas, lamparas y objetos para espacios con alma.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto mt-16 grid max-w-7xl gap-4 md:grid-cols-3">
        {[
          { icon: Leaf, title: 'Material recuperado', text: 'No talamos arboles nuevos. Usamos raices existentes y recuperadas.' },
          { icon: ShieldCheck, title: 'Pieza unica', text: 'Cada veta, grieta y tono cambia segun la raiz original.' },
          { icon: Truck, title: 'Envios Colombia', text: 'Despachos nacionales y coordinacion directa por WhatsApp.' },
        ].map((item) => (
          <article key={item.title} className="artisan-card rounded-[2rem] p-6 transition hover:-translate-y-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-carbon text-clay-bg">
              <item.icon className="h-6 w-6" />
            </div>
            <h2 className="mt-5 font-display text-3xl font-semibold text-carbon">{item.title}</h2>
            <p className="mt-2 leading-7 text-carbon/64">{item.text}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto mt-20 max-w-7xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-walnut">Seleccion curada</p>
            <h2 className="mt-3 font-display text-5xl font-semibold tracking-tight text-carbon md:text-6xl">Piezas destacadas</h2>
          </div>
          <Link className="focus-visible-outline inline-flex items-center gap-2 rounded-full bg-clay px-5 py-3 font-bold text-clay-bg shadow-xl shadow-clay/18 transition hover:-translate-y-0.5 hover:bg-clay-dark" to="/catalogo">
            Ver todo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home
