import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { api } from '../api/client'
import type { Order } from '../types'
import { formatDate, formatPrice } from '../utils/format'

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const location = useLocation()
  const confirmedOrderId = (location.state as { confirmedOrderId?: number })?.confirmedOrderId

  useEffect(() => {
    api
      .get<Order[]>('/orders')
      .then(setOrders)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-slate-500">Chargement…</div>
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-slate-500">
        Vous n'avez pas encore passé de commande.
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Mes commandes</h1>

      {confirmedOrderId && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-md p-3 mb-6 text-sm font-medium">
          Commande #{confirmedOrderId} confirmée, merci pour votre achat !
        </div>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">Commande #{order.id}</p>
                <p className="text-sm text-slate-500">{formatDate(order.createdAt)}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-picard-blue">{formatPrice(order.totalCents)}</p>
                <p className="text-xs text-slate-400">carte •••• {order.cardLast4}</p>
              </div>
            </div>

            <ul className="mt-3 divide-y divide-slate-100 border-t border-slate-100">
              {order.items.map((item, idx) => (
                <li key={idx} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-slate-600">
                    {item.quantity} × {item.productName}
                  </span>
                  <span className="text-slate-700 font-medium">
                    {formatPrice(item.unitPriceCents * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <p className="text-xs text-picard-blue font-medium mt-2">+{order.pointsEarned} points fidélité</p>
          </div>
        ))}
      </div>
    </div>
  )
}
