import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const linkClasses = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive ? 'bg-picard-blue text-white' : 'text-slate-600 hover:bg-slate-100'
  }`

export function Navbar() {
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-bold text-picard-blue text-xl">
          Picard
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink to="/" className={linkClasses} end>
            Produits
          </NavLink>
          <NavLink to="/panier" className={linkClasses}>
            Panier {itemCount > 0 && `(${itemCount})`}
          </NavLink>
          {user && (
            <>
              <NavLink to="/fidelite" className={linkClasses}>
                Fidélité
              </NavLink>
              <NavLink to="/commandes" className={linkClasses}>
                Mes commandes
              </NavLink>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-slate-500 hidden sm:inline">Bonjour {user.firstName}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-md text-sm font-medium text-picard-red hover:bg-red-50"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/connexion" className="px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100">
                Connexion
              </Link>
              <Link
                to="/inscription"
                className="px-3 py-2 rounded-md text-sm font-medium bg-picard-blue text-white hover:bg-blue-900"
              >
                Créer un compte
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
