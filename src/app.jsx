import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import CartDrawer from './components/cart/CartDrawer.jsx'
import Footer from './components/layout/Footer.jsx'
import Navbar from './components/layout/Navbar.jsx'
import ChatBot from './components/ui/ChatBot.jsx'
import PaymentModal from './components/ui/PaymentModal.jsx'
import RegisterModal from './components/ui/RegisterModal.jsx'
import WhatsAppButton from './components/ui/WhatsAppButton.jsx'
import { useCustomer } from './context/CustomerContext.jsx'
import Admin from './pages/Admin.jsx'
import About from './pages/About.jsx'
import Catalog from './pages/Catalog.jsx'
import Contact from './pages/Contact.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import PaymentConfirmation from './pages/PaymentConfirmation.jsx'

const pageVariants = {
  initial: { opacity: 0, y: 18, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -14, filter: 'blur(8px)' },
}

const AnimatedRoutes = () => {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalog />} />
          <Route path="/nosotros" element={<About />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/pago/confirmacion" element={<PaymentConfirmation />} />
          <Route path="/pago/simulado" element={<PaymentConfirmation simulated />} />
        </Routes>
      </motion.main>
    </AnimatePresence>
  )
}

const App = () => {
  const { isRegistered } = useCustomer()
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)

  const handleOpenCart = () => setIsCartOpen(true)
  const handleCloseCart = () => setIsCartOpen(false)
  // Gate de checkout: si el cliente no está registrado, pedir registro antes de pagar.
  const handleOpenPayment = () => {
    setIsCartOpen(false)
    if (isRegistered) {
      setIsPaymentOpen(true)
    } else {
      setIsRegisterOpen(true)
    }
  }
  const handleClosePayment = () => setIsPaymentOpen(false)
  const handleCloseRegister = () => setIsRegisterOpen(false)
  const handleRegistered = () => {
    setIsRegisterOpen(false)
    setIsPaymentOpen(true)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-clay-bg text-carbon">
      <div className="grain-layer pointer-events-none fixed inset-0 z-0 opacity-50" />
      <div className="topographic-layer pointer-events-none fixed inset-0 z-0 opacity-70" />
      <div className="pointer-events-none fixed -left-40 top-32 z-0 h-96 w-96 rounded-full bg-clay/20 blur-3xl" />
      <div className="pointer-events-none fixed -right-40 bottom-20 z-0 h-[28rem] w-[28rem] rounded-full bg-moss/16 blur-3xl" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar onOpenCart={handleOpenCart} />
        <AnimatedRoutes />
        <Footer />
      </div>
      <WhatsAppButton />
      <ChatBot />
      <CartDrawer isOpen={isCartOpen} onClose={handleCloseCart} onCheckout={handleOpenPayment} />
      <RegisterModal isOpen={isRegisterOpen} onClose={handleCloseRegister} onRegistered={handleRegistered} />
      <PaymentModal isOpen={isPaymentOpen} onClose={handleClosePayment} />
    </div>
  )
}

export default App
