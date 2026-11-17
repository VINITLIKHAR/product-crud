import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { FiShoppingCart } from 'react-icons/fi'
import { removeProduct } from '../redux/productSlice'
import { addToCart } from '../redux/cartSlice'

function ProductCard({ product }) {
  const dispatch = useDispatch()
  const saving = useSelector((state) => state.products.saving)
  const cartUpdating = useSelector((state) => state.carts.updating)
  const updatingItemId = useSelector((state) => state.carts.updatingItemId)
  const cartItems = useSelector((state) => state.carts.items)

  const cartItem = cartItems.find((item) => item.productId === product.id)
  const inCartCount = cartItem?.quantity || 0
  const isAdding = cartUpdating && updatingItemId === product.id

  const handleAddToCart = async () => {
    try {
      await dispatch(addToCart({ product, quantity: 1 })).unwrap()
      toast.success(`Added "${product.title.slice(0, 25)}..." to cart!`)
    } catch (err) {
      toast.error(err || 'Failed to add to cart')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${product.title}"?`)) return

    try {
      await dispatch(removeProduct(product.id)).unwrap()
      toast.success('Product deleted')
    } catch (message) {
      toast.error(message)
    }
  }

  return (
    <article className="flex flex-col justify-between rounded-lg border border-stone-200 bg-white p-4 shadow-2xs transition hover:shadow-md">
      <div>
        <Link
          to={`/products/${product.id}`}
          reloadDocument
          className="flex h-44 items-center justify-center p-2 bg-stone-50/50 rounded-md"
        >
          <img
            src={product.image}
            alt={product.title}
            className="max-h-full max-w-full object-contain transition-transform duration-200 hover:scale-105"
          />
        </Link>
        <p className="mt-3 text-xs uppercase tracking-wider font-semibold text-stone-400">
          {product.category}
        </p>
        <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-semibold text-stone-900 hover:text-teal-800">
          <Link to={`/products/${product.id}`} reloadDocument>
            {product.title}
          </Link>
        </h3>
        <p className="mt-2 text-lg font-bold text-teal-800">${Number(product.price).toFixed(2)}</p>
      </div>

      <div className="mt-4 space-y-2">
        {/* Add to Cart button */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isAdding}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-teal-700 py-2 text-xs font-semibold text-white shadow-2xs transition hover:bg-teal-800 disabled:opacity-50"
        >
          <FiShoppingCart className="h-3.5 w-3.5" />
          {isAdding
            ? 'Adding...'
            : inCartCount > 0
            ? `In Cart (${inCartCount}) + Add More`
            : 'Add to Cart'}
        </button>

        {/* Management CRUD actions */}
        <div className="flex gap-1.5 text-xs">
          <Link
            to={`/products/${product.id}`}
            reloadDocument
            className="flex-1 rounded-md border border-stone-300 py-1.5 text-center font-medium text-stone-700 hover:bg-stone-100"
          >
            View
          </Link>
          <Link
            to={`/products/${product.id}/edit`}
            className="flex-1 rounded-md border border-stone-300 py-1.5 text-center font-medium text-stone-700 hover:bg-stone-100"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={saving}
            className="flex-1 rounded-md border border-red-200 py-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50 font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  )
}

export default ProductCard
