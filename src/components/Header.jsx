import { useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { FiShoppingCart } from 'react-icons/fi'
import { logout } from '../redux/authSlice'
import { fetchUserCart } from '../redux/cartSlice'

const links = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/products/new', label: 'Add Product' },
  { to: '/cart', label: 'Cart' },
]

function Header() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const username = useSelector((state) => state.auth.username)
  const userId = useSelector((state) => state.auth.userId)
  const cartItems = useSelector((state) => state.carts.items)
  const isInitialized = useSelector((state) => state.carts.isInitialized)

  const totalItemsCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0)

  useEffect(() => {
    if (!isInitialized) {
      dispatch(fetchUserCart(userId || 2))
    }
  }, [dispatch, userId, isInitialized])

  const handleLogout = async () => {
    await dispatch(logout())
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <header className="border-b border-stone-200 bg-white sticky top-0 z-40 shadow-2xs">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3">
        <Link to="/" className="text-lg font-bold text-teal-800 flex items-center gap-2">
          <span>Product CRUD</span>
        </Link>

        <nav className="flex flex-1 flex-wrap gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-teal-700 text-white' : 'text-stone-700 hover:bg-stone-100'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Cart Icon Quick Link */}
        <Link
          to="/cart"
          className="relative flex items-center gap-2 rounded-full border border-stone-300 bg-stone-50 px-3 py-1.5 text-stone-700 transition hover:bg-teal-50 hover:text-teal-800 hover:border-teal-300"
          title="View Shopping Cart"
        >
          <FiShoppingCart className="h-4 w-4" />
          <span className="text-xs font-semibold">Cart</span>
          {totalItemsCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-700 px-1 text-[11px] font-bold text-white">
              {totalItemsCount}
            </span>
          )}
        </Link>

        <span className="text-sm text-stone-500">{username}</span>
        <button
          onClick={handleLogout}
          className="rounded-md border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-100"
        >
          Logout
        </button>
      </div>
    </header>
  )
}

export default Header
