import { MessageCircle } from 'lucide-react'

const WhatsAppButton = () => {
  return (
    <a
      className="focus-visible-outline fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl shadow-[#25D366]/30 transition hover:scale-105 md:bottom-6 md:right-6"
      href="https://wa.me/573137975713?text=Hola%20Arte%20Aniba%2C%20vengo%20de%20la%20tienda%20web%20y%20quiero%20mas%20informacion."
      target="_blank"
      rel="noreferrer"
      aria-label="Abrir WhatsApp de Arte Aniba"
    >
      <MessageCircle className="h-7 w-7" aria-hidden="true" />
    </a>
  )
}

export default WhatsAppButton
