import { useState } from 'react'
import { useCart } from '../context/CartContext'
import type { Product } from '../types'
import { formatPrice } from '../utils/format'

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addToCart(product, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  const outOfStock = product.stock <= 0

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
      <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover" />
      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs font-medium text-picard-blue uppercase tracking-wide">{product.category}</span>
        <h3 className="font-semibold text-slate-800 mt-1">{product.name}</h3>
        <p className="text-sm text-slate-500 mt-1 flex-1">{product.description}</p>
        <div className="flex items-center justify-between mt-4">
          <span className="font-bold text-lg text-slate-900">{formatPrice(product.priceCents)}</span>
          <button
            onClick={handleAdd}
            disabled={outOfStock}
            className="px-3 py-2 rounded-md text-sm font-medium bg-picard-blue text-white hover:bg-blue-900 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            {outOfStock ? 'Épuisé' : added ? 'Ajouté ✓' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  )
}
