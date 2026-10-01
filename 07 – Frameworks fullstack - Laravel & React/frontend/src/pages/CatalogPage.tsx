import { useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'
import { ProductCard } from '../components/ProductCard'
import type { Product } from '../types'

export function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [category, setCategory] = useState<string>('Tous')

  useEffect(() => {
    api
      .get<Product[]>('/products')
      .then(setProducts)
      .catch(() => setError('Impossible de charger les produits pour le moment.'))
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(
    () => ['Tous', ...Array.from(new Set(products.map((p) => p.category)))],
    [products],
  )

  const filtered = category === 'Tous' ? products : products.filter((p) => p.category === category)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Le distributeur Picard</h1>
        <p className="text-slate-500 mt-1">
          Des produits surgelés de qualité, disponibles 24h/24 sur votre campus.
        </p>
      </div>

      {loading && <p className="text-slate-500">Chargement des produits…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <>
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  category === c
                    ? 'bg-picard-blue text-white border-picard-blue'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-picard-blue'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
