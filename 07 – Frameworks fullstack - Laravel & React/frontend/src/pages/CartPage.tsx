import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/format'

export function CartPage() {
  const { lines, updateQuantity, removeFromCart, totalCents } = useCart()
  const navigate = useNavigate()

  if (lines.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Votre panier est vide</h1>
        <p className="text-slate-500 mb-6">Direction le distributeur pour choisir vos produits.</p>
        <Link to="/" className="px-4 py-2 rounded-md bg-picard-blue text-white font-medium hover:bg-blue-900">
          Voir les produits
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Votre panier</h1>

      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        {lines.map((line) => (
          <div key={line.product.id} className="flex items-center gap-4 p-4">
            <img src={line.product.imageUrl} alt={line.product.name} className="w-16 h-16 object-cover rounded-lg" />
            <div className="flex-1">
              <p className="font-medium text-slate-800">{line.product.name}</p>
              <p className="text-sm text-slate-500">{formatPrice(line.product.priceCents)} / unité</p>
            </div>
            <input
              type="number"
              min={1}
              max={line.product.stock}
              value={line.quantity}
              onChange={(e) => updateQuantity(line.product.id, Number(e.target.value))}
              className="w-16 border border-slate-200 rounded-md px-2 py-1 text-center"
            />
            <span className="w-24 text-right font-semibold text-slate-800">
              {formatPrice(line.product.priceCents * line.quantity)}
            </span>
            <button
              onClick={() => removeFromCart(line.product.id)}
              className="text-slate-400 hover:text-picard-red text-sm font-medium"
            >
              Retirer
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-6 bg-white rounded-xl border border-slate-200 p-4">
        <span className="text-lg font-semibold text-slate-800">Total</span>
        <span className="text-2xl font-bold text-picard-blue">{formatPrice(totalCents)}</span>
      </div>

      <button
        onClick={() => navigate('/paiement')}
        className="mt-6 w-full py-3 rounded-md bg-picard-red text-white font-semibold hover:bg-red-700 transition-colors"
      >
        Passer commande
      </button>
    </div>
  )
}
