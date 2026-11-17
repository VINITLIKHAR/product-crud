import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { FiShoppingCart, FiMinus, FiPlus, FiArrowRight } from 'react-icons/fi'
import { fetchProductById, quickPatchProduct, removeProduct } from '../redux/productSlice'
import { addToCart } from '../redux/cartSlice'

function ProductDetail() {
  const { id } = useParams()
  const location = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { current, items, saving, error } = useSelector((state) => state.products)
  const cartUpdating = useSelector((state) => state.carts.updating)
  const updatingItemId = useSelector((state) => state.carts.updatingItemId)
  const cartItems = useSelector((state) => state.carts.items)

  const [customPrice, setCustomPrice] = useState(null)
  const [quantity, setQuantity] = useState(1)

  // Find the product instantly: store current -> list -> link state
  const passed = location.state?.product
  const product =
    (current && String(current.id) === String(id) && current) ||
    items.find((p) => String(p.id) === String(id)) ||
    (passed && String(passed.id) === String(id) && passed) ||
    null

  const inCartItem = cartItems.find((item) => String(item.productId) === String(id))
  const isAdding = cartUpdating && updatingItemId === Number(id)
  const displayPrice = customPrice !== null ? customPrice : (product?.price != null ? String(product.price) : '')

  useEffect(() => {
    dispatch(fetchProductById(id))
    window.scrollTo(0, 0)
  }, [dispatch, id])

  const handleAddToCart = async () => {
    if (!product) return
    try {
      await dispatch(addToCart({ product, quantity })).unwrap()
      toast.success(`Added ${quantity} × "${product.title.slice(0, 20)}..." to cart!`)
    } catch (err) {
      toast.error(err || 'Failed to add product to cart')
    }
  }

  const handlePatchPrice = async (e) => {
    e.preventDefault()
    if (!(Number(displayPrice) > 0)) return toast.error('Enter a valid price')
    try {
      await dispatch(quickPatchProduct({ id, changes: { price: Number(displayPrice) } })).unwrap()
      toast.success('Price updated (PATCH)')
    } catch (message) {
      toast.error(message)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${product.title}"?`)) return
    try {
      await dispatch(removeProduct(product.id)).unwrap()
      toast.success('Product deleted')
      navigate('/products')
    } catch (message) {
      toast.error(message)
    }
  }

  if (!product && error)
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}{' '}
        <Link to="/products" className="underline">
          Back to products
        </Link>
      </div>
    )
  if (!product) return <p className="text-stone-500">Loading product...</p>

  return (
    <div className="grid gap-8 rounded-xl border border-stone-200 bg-white p-6 shadow-xs md:grid-cols-2">
      <div className="flex items-center justify-center rounded-lg bg-stone-50/50 p-6">
        <img
          src={product.image}
          alt={product.title}
          className="max-h-96 max-w-full object-contain"
        />
      </div>

      <div className="flex flex-col justify-between">
        <div>
          <span className="inline-block rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-stone-600">
            {product.category}
          </span>
          <h1 className="mt-2 text-2xl font-bold text-stone-900 sm:text-3xl">{product.title}</h1>
          <p className="mt-3 text-3xl font-extrabold text-teal-800">
            ${Number(product.price).toFixed(2)}
          </p>
          {product.rating && (
            <p className="mt-1 text-sm text-stone-500">
              ★ {product.rating.rate} · {product.rating.count} customer reviews
            </p>
          )}
          <p className="mt-4 leading-relaxed text-stone-600">{product.description}</p>

          {/* Add to Cart Section */}
          <div className="mt-6 rounded-xl border border-teal-100 bg-teal-50/40 p-4">
            <label className="block text-xs font-semibold text-stone-700 mb-2">Quantity</label>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-lg border border-stone-300 bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isAdding}
                  className="flex h-10 w-10 items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-40"
                >
                  <FiMinus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center text-sm font-bold text-stone-800">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  disabled={isAdding}
                  className="flex h-10 w-10 items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-40"
                >
                  <FiPlus className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-teal-800 disabled:opacity-50"
              >
                <FiShoppingCart className="h-4 w-4" />
                {isAdding ? 'Adding to Cart...' : 'Add to Cart'}
              </button>
            </div>

            {inCartItem && (
              <div className="mt-3 flex items-center justify-between border-t border-teal-100/60 pt-2 text-xs text-teal-800 font-medium">
                <span>Already in your cart: {inCartItem.quantity} unit(s)</span>
                <Link to="/cart" className="flex items-center gap-1 hover:underline">
                  View in Cart <FiArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Quick Price Change (CRUD Demo) */}
          <form onSubmit={handlePatchPrice} className="mt-6 flex items-end gap-2 border-t border-stone-100 pt-4">
            <label className="text-xs font-medium text-stone-600">
              <span className="mb-1 block">Quick price change (FakeStore API PATCH)</span>
              <input
                type="number"
                step="0.01"
                value={displayPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                className="w-32 rounded-md border border-stone-300 px-3 py-1.5 text-sm focus:border-teal-700 focus:outline-none"
              />
            </label>
            <button
              disabled={saving}
              className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-50"
            >
              Update price
            </button>
          </form>
        </div>

        {/* Action buttons */}
        <div className="mt-8 flex gap-2 border-t border-stone-200 pt-4 text-sm">
          <Link
            to={`/products/${product.id}/edit`}
            className="rounded-md bg-stone-800 px-4 py-2 font-medium text-white hover:bg-stone-900"
          >
            Edit Product
          </Link>
          <button
            onClick={handleDelete}
            disabled={saving}
            className="rounded-md border border-red-300 px-4 py-2 font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            Delete Product
          </button>
          <Link
            to="/products"
            className="rounded-md border border-stone-300 px-4 py-2 font-medium text-stone-700 hover:bg-stone-100"
          >
            Back to Products
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
