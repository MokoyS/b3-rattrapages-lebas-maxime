import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { LoyaltyAccount } from '../types'
import { formatDay } from '../utils/format'

export function LoyaltyPage() {
  const [account, setAccount] = useState<LoyaltyAccount | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<LoyaltyAccount>('/loyalty')
      .then(setAccount)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-slate-500">Chargement…</div>
  }

  if (!account) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-slate-500">Compte introuvable.</div>
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Mon compte de fidélité</h1>

      <div className="bg-gradient-to-br from-picard-blue to-blue-800 rounded-xl p-6 text-white shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-blue-200 text-sm uppercase tracking-wide">Carte de fidélité</span>
          <span className="text-blue-200 text-sm">Picard Distrib</span>
        </div>
        <p className="text-2xl font-mono tracking-widest mt-6">{account.loyaltyCardNumber}</p>
        <p className="text-blue-200 text-sm mt-2">Membre depuis le {formatDay(account.memberSince)}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 text-center">
          <p className="text-3xl font-bold text-picard-blue">{account.loyaltyPoints}</p>
          <p className="text-sm text-slate-500 mt-1">points cumulés</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 text-center">
          <p className="text-3xl font-bold text-picard-blue">{account.ordersCount}</p>
          <p className="text-sm text-slate-500 mt-1">commandes passées</p>
        </div>
      </div>

      <p className="text-sm text-slate-400 mt-6 text-center">
        1 point est crédité par euro dépensé à chaque commande.
      </p>
    </div>
  )
}
