import { createContext, useContext, useMemo, useState } from 'react'
import { customersApi } from '../api/client.js'

const CustomerContext = createContext(null)

const STORAGE_KEY = 'aa_customer'

const loadInitialCustomer = () => {
  if (typeof window === 'undefined') return null
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export const CustomerProvider = ({ children }) => {
  const [customer, setCustomer] = useState(loadInitialCustomer)

  const persist = (value) => {
    try {
      if (value) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      else window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // almacenamiento no disponible; ignorar
    }
  }

  // Registra al cliente en la BD (tabla customers) y lo recuerda en el navegador.
  const registerCustomer = async (data) => {
    const result = await customersApi.register(data)
    const saved = { ...data, ...result.customer }
    setCustomer(saved)
    persist(saved)
    return saved
  }

  const clearCustomer = () => {
    setCustomer(null)
    persist(null)
  }

  const value = useMemo(
    () => ({
      customer,
      isRegistered: Boolean(customer),
      registerCustomer,
      clearCustomer,
    }),
    [customer],
  )

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>
}

export const useCustomer = () => {
  const context = useContext(CustomerContext)

  if (!context) {
    throw new Error('useCustomer debe usarse dentro de CustomerProvider')
  }

  return context
}
