import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { CartLine, Product } from '../types'

interface CartContextValue {
  lines: CartLine[]
  addToCart: (product: Product, quantity?: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  removeFromCart: (productId: number) => void
  clearCart: () => void
  totalCents: number
  itemCount: number
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])

  const addToCart = (product: Product, quantity = 1) => {
    setLines((prev) => {
      const existing = prev.find((line) => line.product.id === product.id)
      if (existing) {
        return prev.map((line) =>
          line.product.id === product.id
            ? { ...line, quantity: Math.min(line.quantity + quantity, product.stock) }
            : line,
        )
      }
      return [...prev, { product, quantity: Math.min(quantity, product.stock) }]
    })
  }

  const updateQuantity = (productId: number, quantity: number) => {
    setLines((prev) =>
      prev
        .map((line) => (line.product.id === productId ? { ...line, quantity } : line))
        .filter((line) => line.quantity > 0),
    )
  }

  const removeFromCart = (productId: number) => {
    setLines((prev) => prev.filter((line) => line.product.id !== productId))
  }

  const clearCart = () => setLines([])

  const totalCents = useMemo(
    () => lines.reduce((sum, line) => sum + line.product.priceCents * line.quantity, 0),
    [lines],
  )

  const itemCount = useMemo(() => lines.reduce((sum, line) => sum + line.quantity, 0), [lines])

  return (
    <CartContext.Provider
      value={{ lines, addToCart, updateQuantity, removeFromCart, clearCart, totalCents, itemCount }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart doit être utilisé dans un CartProvider')
  }
  return ctx
}
