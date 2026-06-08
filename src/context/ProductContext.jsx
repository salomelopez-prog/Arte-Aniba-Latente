import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { productsApi } from '../api/client.js'
import { products as fallbackProducts, categories as fallbackCategories } from '../data/products.js'

const ProductContext = createContext(null)

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([])
  const [dbCategories, setDbCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const [productData, categoryData] = await Promise.all([
          productsApi.list({ active: 'true' }),
          productsApi.getCategories(),
        ])
        const mapped = productData.products.map((p) => ({
          id: p.id,
          reference: p.reference,
          name: p.name,
          category: p.category_name || p.category_slug,
          price: p.price,
          size: p.size,
          tone: p.tone || 'from-clay to-walnut',
          imageUrl: p.image_url || '',
          description: p.short_description || p.description,
          slug: p.slug,
          stock: p.stock_quantity,
          isActive: p.is_active,
        }))
        setProducts(mapped)
        setDbCategories(categoryData.categories || [])
      } catch {
        // Fallback: datos locales
        setProducts(fallbackProducts)
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  const categories = useMemo(() => {
    if (dbCategories.length > 0) {
      return ['Todos', ...dbCategories.map((c) => c.name)]
    }
    return fallbackCategories
  }, [dbCategories])

  const value = useMemo(
    () => ({ products, categories, loading, error }),
    [products, categories, loading, error],
  )

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
}

export const useProducts = () => {
  const context = useContext(ProductContext)
  if (!context) {
    throw new Error('useProducts debe usarse dentro de ProductProvider')
  }
  return context
}
