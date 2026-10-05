import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import { useCart } from '../context/CartContext'
import type { Order } from '../types'
import { formatPrice } from '../utils/format'

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 10 }, (_, i) => currentYear + i)

export function CheckoutPage() {
  const { lines, totalCents, clearCart } = useCart()
  const navigate = useNavigate()
  const orderPlaced = useRef(false)

  const [cardNumber, setCardNumber] = useState('')
  const [expiryMonth, setExpiryMonth] = useState('01')
  const [expiryYear, setExpiryYear] = useState(String(currentYear))
  const [cvv, setCvv] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [details, setDetails] = useState<string[]>([])

  useEffect(() => {
    if (lines.length === 0 && !orderPlaced.current) {
      navigate('/panier')
    }
  }, [lines.length, navigate])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    setDetails([])

    try {
      const order = await api.post<Order>('/orders', {
        items: lines.map((line) => ({ productId: line.product.id, quantity: line.quantity })),
        card: { number: cardNumber, expiryMonth, expiryYear, cvv },
      })
      orderPlaced.current = true
      clearCart()
      navigate('/commandes', { state: { confirmedOrderId: order.id } })
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
        setDetails(err.details ?? [])
      } else {
        setError('Une erreur est survenue.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Paiement</h1>

      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex items-center justify-between">
        <span className="text-slate-600">Total à payer</span>
        <span className="text-xl font-bold text-picard-blue">{formatPrice(totalCents)}</span>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Numéro de carte</label>
          <input
            required
            inputMode="numeric"
            placeholder="4111 1111 1111 1111"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            className="w-full border border-slate-200 rounded-md px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mois</label>
            <select
              value={expiryMonth}
              onChange={(e) => setExpiryMonth(e.target.value)}
              className="w-full border border-slate-200 rounded-md px-3 py-2"
            >
              {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Année</label>
            <select
              value={expiryYear}
              onChange={(e) => setExpiryYear(e.target.value)}
              className="w-full border border-slate-200 rounded-md px-3 py-2"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">CVV</label>
            <input
              required
              inputMode="numeric"
              maxLength={4}
              placeholder="123"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              className="w-full border border-slate-200 rounded-md px-3 py-2"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3">
            <p className="font-medium">{error}</p>
            {details.length > 0 && (
              <ul className="list-disc list-inside mt-1">
                {details.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-md bg-picard-red text-white font-semibold hover:bg-red-700 disabled:bg-slate-300 transition-colors"
        >
          {submitting ? 'Paiement en cours…' : `Payer ${formatPrice(totalCents)}`}
        </button>

        <p className="text-xs text-slate-400 text-center">
          Aucun débit réel n'est effectué. Les informations de carte sont vérifiées (format, numéro, date
          d'expiration) mais ne transitent par aucun établissement bancaire.
        </p>
      </form>
    </div>
  )
}
