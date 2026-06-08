import { Instagram, Mail, MapPin, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="dark-shell relative z-10 mt-20 px-4 py-12 text-clay-bg md:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <p className="font-display text-4xl font-semibold tracking-tight">Arte Aniba</p>
          <p className="mt-4 max-w-md text-base leading-7 text-clay-bg/68">
            Raices que vuelven a tener forma. Piezas talladas a mano en San Rafael, Antioquia, usando raices recuperadas de comino crespo.
          </p>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-clay-soft">Menu</p>
          <div className="mt-4 grid gap-3 text-clay-bg/74">
            <Link className="hover:text-clay-soft" to="/">Inicio</Link>
            <Link className="hover:text-clay-soft" to="/catalogo">Catalogo</Link>
            <Link className="hover:text-clay-soft" to="/nosotros">Nosotros</Link>
            <Link className="hover:text-clay-soft" to="/contacto">Contacto</Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-clay-soft">Contacto</p>
          <div className="mt-4 grid gap-3 text-clay-bg/74">
            <a className="flex items-center gap-2 hover:text-clay-soft" href="https://wa.me/573137975713">
              <MessageCircle className="h-4 w-4" /> +57 313 7975713
            </a>
            <a className="flex items-center gap-2 hover:text-clay-soft" href="mailto:arteaniba@gmail.com">
              <Mail className="h-4 w-4" /> arteaniba@gmail.com
            </a>
            <a className="flex items-center gap-2 hover:text-clay-soft" href="https://instagram.com/arteaniba">
              <Instagram className="h-4 w-4" /> @arteaniba
            </a>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> San Rafael, Antioquia
            </span>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-clay-bg/10 pt-6 text-sm text-clay-bg/48">
        © {new Date().getFullYear()} Arte Aniba. Todos los derechos reservados. Madera recuperada, piezas únicas.
      </div>
    </footer>
  )
}

export default Footer
