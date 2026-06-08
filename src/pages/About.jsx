import { motion } from 'framer-motion'
import { Award, Hammer, HeartHandshake, Leaf, Trees, Users } from 'lucide-react'

const steps = [
  {
    icon: Trees,
    title: 'Recepción de madera',
    text: 'Proveedores locales y arrieros entregan raíces de comino crespo de talas de 70-100 años recuperadas de bosques de San Rafael, Antioquia.',
    detail: 'Comino crespo: árbol de crecimiento lento (~250 años para madurar)',
  },
  {
    icon: Hammer,
    title: 'Despiece y selección',
    text: 'Troncos grandes se destinan a piezas mayores como lámparas y esculturas. Los restos se aprovechan para crear hongos pequeños, corazones y hojas, evitando desperdicios.',
    detail: 'Economía circular: aprovechamiento total de la madera disponible',
  },
  {
    icon: Leaf,
    title: 'Fabricación artesanal',
    text: 'Sin moldes, sin lacas, sin colorantes artificiales. Cada pieza conserva grietas, vetas y colores propios de la madera. La forma final nace de leer la veta y la grieta natural de cada raíz.',
    detail: 'También usamos mataratón y cedro recuperado sosteniblemente',
  },
  {
    icon: HeartHandshake,
    title: 'Control de calidad',
    text: 'Se eligen piezas con terminaciones especiales. Coordinamos disponibilidad, empaque y envío para que la pieza llegue lista para habitar el espacio.',
    detail: 'Proyecto empresarial destacado: 136 lámparas + raíces para hotel en Santa Fe de Antioquia',
  },
]

const About = () => {
  return (
    <div className="px-4 py-10 md:px-8 md:py-16">
      <section className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          className="dark-shell relative overflow-hidden rounded-[3rem] p-7 text-clay-bg shadow-2xl shadow-night/20 md:p-10"
        >
          <div className="absolute inset-0 grain-layer opacity-30" />
          <div className="relative">
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-clay-soft">Nuestra historia</p>
            <h1 className="mt-5 font-display text-6xl font-semibold leading-[0.9] tracking-[-0.05em] md:text-8xl">
              La raíz manda.
            </h1>
            <p className="mt-8 text-xl leading-8 text-clay-bg/70">
              Arte Aniba es un taller familiar de San Rafael, Antioquia. Transformamos raíces recuperadas de comino crespo en objetos decorativos con carácter: hongos, lámparas, corazones, raíces, árboles, candelabros, cuadros y dijes.
            </p>
            <p className="mt-4 text-lg leading-7 text-clay-bg/58">
              Detrás de cada pieza está Doña Luz (33 años), nuestro puente con clientes, redes sociales y distribuidores; su esposo (42 años), quien lidera la adquisición de madera y las operaciones del taller; y un equipo directo de 3 personas administrativas más 1 operario permanente, apoyados por una red indirecta de ~6 personas entre proveedores de madera, arrieros, transportistas y etiquetadores.
            </p>
          </div>
        </motion.div>

        <div className="grid gap-5">
          <p className="text-xl leading-8 text-carbon/68">
            El <strong className="text-carbon">comino crespo (Aniba)</strong> puede tardar hasta <strong className="text-carbon">250 años</strong> en madurar. Por eso cada pieza exige respeto: no buscamos borrar su pasado, sino revelar la forma que ya trae escondida. Trabajamos con raíces de talas de <strong className="text-carbon">70 a 100 años</strong> (a veces más), recuperadas de bosques locales.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="artisan-card rounded-[2rem] p-6">
              <p className="font-display text-5xl font-semibold text-clay">250+</p>
              <p className="mt-2 font-bold text-carbon">años de maduración</p>
              <p className="mt-2 text-carbon/62">El comino crespo es un árbol de crecimiento excepcionalmente lento.</p>
            </div>
            <div className="artisan-card rounded-[2rem] p-6">
              <p className="font-display text-5xl font-semibold text-clay">1/1</p>
              <p className="mt-2 font-bold text-carbon">pieza irrepetible</p>
              <p className="mt-2 text-carbon/62">Aunque dos referencias compartan nombre, ninguna sale igual. Grietas, vetas y tonos son únicos.</p>
            </div>
            <div className="artisan-card rounded-[2rem] p-6">
              <p className="font-display text-5xl font-semibold text-clay">2023</p>
              <p className="mt-2 font-bold text-carbon">Expo Artesano</p>
              <p className="mt-2 text-carbon/62">Participamos en la feria artesanal más importante de Colombia (Medellín/Bogotá).</p>
            </div>
            <div className="artisan-card rounded-[2rem] p-6">
              <p className="font-display text-5xl font-semibold text-clay">136</p>
              <p className="mt-2 font-bold text-carbon">lámparas empresariales</p>
              <p className="mt-2 text-carbon/62">Proyecto con hotel en Santa Fe de Antioquia: 136 lámparas + raíces decorativas.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-walnut">Proceso productivo</p>
            <h2 className="mt-3 font-display text-5xl font-semibold tracking-tight text-carbon md:text-6xl">De la raíz al objeto.</h2>
          </div>
          <div className="flex items-center gap-3 text-carbon/62">
            <Users className="h-5 w-5" />
            <span className="text-sm font-bold">Equipo: 3 administrativos + 1 operario + 6 indirectos</span>
          </div>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-4">
          {steps.map((step, index) => (
            <motion.article
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.08 }}
              className="artisan-card rounded-[2rem] p-6 transition hover:-translate-y-1"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-clay text-clay-bg">
                <step.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-6 font-display text-3xl font-semibold text-carbon">{step.title}</h3>
              <p className="mt-3 leading-7 text-carbon/64">{step.text}</p>
              <p className="mt-3 text-sm font-bold text-clay">{step.detail}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-7xl">
        <div className="artisan-card rounded-[3rem] p-8 md:p-12">
          <div className="flex items-center gap-4">
            <Award className="h-8 w-8 text-clay" />
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-walnut">Propuesta de valor</p>
          </div>
          <h2 className="mt-4 max-w-3xl font-display text-4xl font-semibold tracking-tight text-carbon md:text-5xl">
            Conexión entre la naturaleza, el arte, la libertad, la decoración y el ser.
          </h2>
          <p className="mt-5 max-w-3xl text-xl leading-8 text-carbon/66">
            Arte Aniba es un proyecto familiar que gira en torno a recuperar raíces de árboles que fueron talados o mutilados. No nos limitamos a estándares o moldes — cada pieza logra ser única, reflejando la esencia de la madera y las infinitas posibilidades que surgen cuando se permite que el material guíe el proceso creativo.
          </p>
          <p className="mt-4 max-w-3xl text-lg leading-7 text-carbon/54">
            <strong className="text-carbon">Marca registrada</strong> ante la Superintendencia de Industria y Comercio.
            En trámite de inscripción en Cámara de Comercio.
            Convocatorias activas a través de Artesanías de Colombia (programas Exportesan y Exportesanía).
          </p>
        </div>
      </section>
    </div>
  )
}

export default About
