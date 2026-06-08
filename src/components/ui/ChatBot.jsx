import { AnimatePresence, motion } from 'framer-motion'
import { Bot, Send, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import { getBotAnswer, quickQuestions } from '../../data/chatbot.js'

const initialMessages = [
  {
    id: 'welcome',
    sender: 'bot',
    text: 'Hola. Soy el asistente de Arte Aniba. Preguntame por precios, envios, materiales o pagos.',
  },
]

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState(initialMessages)

  const handleToggle = () => setIsOpen((currentValue) => !currentValue)

  const handleSendMessage = (text) => {
    const trimmedText = text.trim()

    if (!trimmedText) {
      return
    }

    const userMessage = { id: `user-${Date.now()}`, sender: 'user', text: trimmedText }
    const botMessage = { id: `bot-${Date.now()}`, sender: 'bot', text: getBotAnswer(trimmedText) }

    setMessages((currentMessages) => [...currentMessages, userMessage, botMessage])
    setMessage('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    handleSendMessage(message)
  }

  return (
    <div className="fixed bottom-24 right-5 z-40 md:bottom-24 md:right-6">
      <AnimatePresence>
        {isOpen ? (
          <motion.section
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            className="mb-4 flex h-[520px] w-[calc(100vw-2.5rem)] max-w-[390px] flex-col overflow-hidden rounded-[2rem] border border-carbon/10 bg-clay-bg shadow-2xl shadow-night/18"
            aria-label="Chatbot de Arte Aniba"
          >
            <div className="dark-shell flex items-center justify-between p-4 text-clay-bg">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-clay text-clay-bg">
                  <Bot className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display text-xl font-semibold">Asistente Aniba</p>
                  <p className="text-xs text-clay-bg/62">Respuestas rapidas</p>
                </div>
              </div>
              <button
                type="button"
                className="focus-visible-outline rounded-full p-2 text-clay-bg/70 transition hover:bg-clay-bg/10 hover:text-clay-bg"
                aria-label="Cerrar chatbot"
                onClick={handleToggle}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((item) => (
                <div key={item.id} className={item.sender === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                  <p
                    className={[
                      'max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-5',
                      item.sender === 'user'
                        ? 'bg-carbon text-clay-bg'
                        : 'bg-clay-surface text-carbon shadow-sm shadow-carbon/5',
                    ].join(' ')}
                  >
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-carbon/10 p-3">
              <div className="mb-3 flex flex-wrap gap-2">
                {quickQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    className="focus-visible-outline rounded-full bg-clay-surface px-3 py-1.5 text-xs font-bold text-carbon transition hover:bg-clay-soft"
                    onClick={() => handleSendMessage(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>
              <form className="flex gap-2" onSubmit={handleSubmit}>
                <input
                  className="focus-visible-outline min-w-0 flex-1 rounded-full border border-carbon/10 bg-clay-surface px-4 py-3 text-sm text-carbon"
                  value={message}
                  placeholder="Escribe tu pregunta"
                  aria-label="Mensaje para chatbot"
                  onChange={(event) => setMessage(event.target.value)}
                />
                <button
                  type="submit"
                  className="focus-visible-outline rounded-full bg-clay p-3 text-clay-bg transition hover:bg-clay-dark"
                  aria-label="Enviar mensaje"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>

      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        className="focus-visible-outline flex h-14 w-14 items-center justify-center rounded-full bg-carbon text-clay-bg shadow-2xl shadow-carbon/20 ring-1 ring-clay-bg/60"
        aria-label={isOpen ? 'Cerrar chatbot' : 'Abrir chatbot'}
        onClick={handleToggle}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
      </motion.button>
    </div>
  )
}

export default ChatBot
