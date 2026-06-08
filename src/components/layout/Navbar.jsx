import { AnimatePresence, motion } from 'framer-motion'
import { Menu, ShoppingBag, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useCart } from '../../context/CartContext.jsx'

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/catalogo', label: 'Catalogo' },
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/contacto', label: 'Contacto' },
]

const navLinkClassName = ({ isActive }) =>
  [
    'focus-visible-outline rounded-full px-4 py-2 text-sm font-semibold tracking-wide transition',
    isActive ? 'bg-carbon text-clay-bg' : 'text-carbon/72 hover:bg-clay-soft/70 hover:text-carbon',
  ].join(' ')

const Navbar = ({ onOpenCart }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { cartCount } = useCart()

  const handleToggleMenu = () => setIsMenuOpen((isOpen) => !isOpen)
  const handleCloseMenu = () => setIsMenuOpen(false)

  return (
    <header className="relative z-40 px-4 pt-4 md:px-8">
      <nav className="glass-shell mx-auto flex max-w-7xl items-center justify-between rounded-[2rem] px-4 py-3 md:px-5">
        <NavLink to="/" className="focus-visible-outline group flex items-center gap-3 rounded-full" onClick={handleCloseMenu}>
          <span className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-carbon text-lg font-bold text-clay-bg shadow-lg shadow-carbon/10">
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_35%_22%,rgba(184,107,66,0.9),transparent_34%)]" />
            <span className="relative">
            A
            </span>
          </span>
          <span className="leading-none">
            <span className="block font-display text-xl font-semibold tracking-tight text-carbon">Arte Aniba</span>
            <span className="block text-xs font-semibold uppercase tracking-[0.24em] text-walnut">Tienda taller</span>
          </span>
        </NavLink>

        <div className="hidden items-center gap-1 rounded-full bg-clay-bg/58 p-1 shadow-inner shadow-carbon/5 md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={navLinkClassName}>
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="focus-visible-outline relative rounded-full bg-carbon px-4 py-3 text-clay-bg shadow-lg shadow-carbon/12 transition hover:-translate-y-0.5 hover:bg-clay-dark"
            aria-label={`Abrir carrito con ${cartCount} productos`}
            onClick={onOpenCart}
          >
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-clay px-1.5 text-xs font-bold text-clay-bg ring-2 ring-clay-bg">
                {cartCount}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            className="focus-visible-outline rounded-full border border-carbon/10 bg-clay-bg/70 p-3 text-carbon md:hidden"
            aria-label={isMenuOpen ? 'Cerrar menu' : 'Abrir menu'}
            aria-expanded={isMenuOpen}
            onClick={handleToggleMenu}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="glass-shell mx-auto mt-3 max-w-7xl rounded-[1.5rem] p-3 md:hidden"
          >
            <div className="grid gap-2">
              {links.map((link) => (
                <NavLink key={link.to} to={link.to} className={navLinkClassName} onClick={handleCloseMenu}>
                  {link.label}
                </NavLink>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}

export default Navbar
