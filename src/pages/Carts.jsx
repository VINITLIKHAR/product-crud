import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import {
  FiShoppingCart,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiArrowLeft,
  FiShoppingBag,
  FiCheckCircle,
  FiRefreshCw,
  FiShield,
  FiTruck,
  FiTag,
  FiArrowRight,
} from 'react-icons/fi'
import {
  fetchUserCart,
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
  clearCart,
  checkoutCart,
  resetCartToApi,
  clearOrderPlaced,
} from '../redux/cartSlice'

function Carts() {
  const dispatch = useDispatch()
  const { items, loading, updating, updatingItemId, error, orderPlaced, cartId, isInitialized } = useSelector(
    (state) => state.carts
  )
  const myUserId = useSelector((state) => state.auth.userId)

  // Promo Code State
  const [promoInput, setPromoInput] = useState('')
  const [discountPercent, setDiscountPercent] = useState(0)
  const [appliedPromo, setAppliedPromo] = useState('')

  useEffect(() => {
    // Only fetch if cart has never been initialized
    if (!isInitialized && !orderPlaced) {
      dispatch(fetchUserCart(myUserId || 2))
    }
  }, [dispatch, myUserId, isInitialized, orderPlaced])

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const freeShippingThreshold = 50
  const isFreeShipping = subtotal >= freeShippingThreshold || appliedPromo === 'FREESHIP'
  const shippingFee = subtotal === 0 ? 0 : isFreeShipping ? 0 : 9.99
  const discountAmount = (subtotal * discountPercent) / 100
  const estimatedTax = (subtotal - discountAmount) > 0 ? (subtotal - discountAmount) * 0.08 : 0
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee + estimatedTax)

  // Handlers
  const handleIncrement = async (item) => {
    try {
      await dispatch(incrementQuantity(item.productId)).unwrap()
    } catch (err) {
      toast.error(err || 'Failed to increase quantity')
    }
  }

  const handleDecrement = async (item) => {
    try {
      if (item.quantity === 1) {
        if (window.confirm(`Remove "${item.title}" from your cart?`)) {
          await dispatch(removeFromCart(item.productId)).unwrap()
          toast.success('Item removed')
        }
      } else {
        await dispatch(decrementQuantity(item.productId)).unwrap()
      }
    } catch (err) {
      toast.error(err || 'Failed to update quantity')
    }
  }

  const handleRemove = async (item) => {
    if (window.confirm(`Remove "${item.title}" from your cart?`)) {
      try {
        await dispatch(removeFromCart(item.productId)).unwrap()
        toast.success('Item removed from cart')
      } catch (err) {
        toast.error(err || 'Failed to remove item')
      }
    }
  }

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      try {
        await dispatch(clearCart()).unwrap()
        toast.success('Cart cleared')
      } catch (err) {
        toast.error(err || 'Failed to clear cart')
      }
    }
  }

  const handleApplyPromo = (e) => {
    e.preventDefault()
    const code = promoInput.trim().toUpperCase()
    if (!code) return

    if (code === 'SAVE10') {
      setDiscountPercent(10)
      setAppliedPromo('SAVE10')
      toast.success('Promo code SAVE10 applied: 10% OFF!')
    } else if (code === 'SAVE20') {
      setDiscountPercent(20)
      setAppliedPromo('SAVE20')
      toast.success('Promo code SAVE20 applied: 20% OFF!')
    } else if (code === 'FREESHIP') {
      setDiscountPercent(0)
      setAppliedPromo('FREESHIP')
      toast.success('Promo code FREESHIP applied: Free Shipping!')
    } else {
      toast.error('Invalid promo code. Try SAVE10 or SAVE20')
    }
    setPromoInput('')
  }

  const handleCheckout = async () => {
    try {
      await dispatch(checkoutCart()).unwrap()
      toast.success('Order placed successfully!')
    } catch (err) {
      toast.error(err || 'Checkout failed')
    }
  }

  const handleResetToApi = async () => {
    try {
      await dispatch(resetCartToApi()).unwrap()
      toast.success('Reloaded default cart from FakeStoreAPI')
    } catch (err) {
      toast.error(err || 'Failed to reload cart')
    }
  }

  // Loading State
  if (loading && items.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-700 border-t-transparent" />
        <p className="mt-4 text-sm font-medium text-stone-600">Fetching your cart from FakeStoreAPI...</p>
      </div>
    )
  }

  // Error State
  if (error && items.length === 0) {
    return (
      <div className="mx-auto max-w-lg rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="font-semibold text-red-800">Unable to load cart</p>
        <p className="mt-1 text-sm text-red-600">{error}</p>
        <div className="mt-4 flex justify-center gap-3">
          <button
            onClick={() => dispatch(fetchUserCart(myUserId || 2))}
            className="rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
          >
            Try Again
          </button>
          <Link
            to="/products"
            className="rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
          >
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
            <FiShoppingCart className="text-teal-700" />
            Shopping Cart
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            {totalItemCount > 0
              ? `You have ${totalItemCount} ${totalItemCount === 1 ? 'item' : 'items'} in your cart (FakeStore API Cart #${cartId || 1})`
              : 'Your cart is currently empty'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetToApi}
            disabled={loading || updating}
            title="Reload initial cart products from FakeStore API"
            className="flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50 disabled:opacity-50"
          >
            <FiRefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sync FakeStore API
          </button>

          <Link
            to="/products"
            className="flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-xs hover:bg-stone-50"
          >
            <FiArrowLeft className="h-3.5 w-3.5" />
            Continue Shopping
          </Link>
        </div>
      </div>

      {/* Main Cart Content or Empty State */}
      {items.length === 0 ? (
        <div className="my-12 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/50 p-12 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-50 text-teal-700">
            <FiShoppingBag className="h-10 w-10" />
          </div>
          <h2 className="mt-5 text-xl font-bold text-stone-800">Your Cart is Empty</h2>
          <p className="mt-2 max-w-sm text-sm text-stone-500">
            Looks like you haven't added any products to your cart yet. Explore our store or reload the default cart from the API!
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/products"
              className="flex items-center gap-2 rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-medium text-white shadow-xs hover:bg-teal-800"
            >
              Explore Products
              <FiArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={handleResetToApi}
              disabled={loading}
              className="rounded-lg border border-teal-700 bg-white px-4 py-2.5 text-sm font-medium text-teal-800 hover:bg-teal-50"
            >
              Load Sample Cart from API
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Cart Items List */}
          <div className="space-y-4 lg:col-span-8">
            {/* Free shipping bar */}
            <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-4 text-sm text-teal-900">
              <div className="flex items-center justify-between font-medium">
                <span className="flex items-center gap-2">
                  <FiTruck className="text-teal-700" />
                  {isFreeShipping
                    ? '🎉 You unlocked Free Shipping!'
                    : `Add $${(freeShippingThreshold - subtotal).toFixed(2)} more to qualify for Free Shipping!`}
                </span>
                <span className="text-xs text-teal-700 font-semibold">
                  {isFreeShipping ? 'FREE' : '$9.99'}
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-teal-200/60">
                <div
                  className="h-full bg-teal-700 transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Items Container */}
            <div className="divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white shadow-xs">
              {items.map((item) => {
                const isItemUpdating = updating && updatingItemId === item.productId
                const lineTotal = item.price * item.quantity

                return (
                  <article
                    key={item.productId}
                    className="flex flex-col gap-4 p-4 transition-colors hover:bg-stone-50/40 sm:flex-row sm:items-center"
                  >
                    {/* Product Image */}
                    <Link
                      to={`/products/${item.productId}`}
                      className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg border border-stone-100 bg-white p-2"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="max-h-full max-w-full object-contain"
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <span className="inline-block rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-600">
                        {item.category}
                      </span>
                      <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-stone-900 hover:text-teal-800">
                        <Link to={`/products/${item.productId}`}>{item.title}</Link>
                      </h3>
                      <p className="mt-1 text-sm font-medium text-stone-600">
                        ${Number(item.price).toFixed(2)}{' '}
                        <span className="text-xs text-stone-400">each</span>
                      </p>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-3 sm:justify-center">
                      <div className="flex items-center rounded-lg border border-stone-300 bg-white shadow-2xs">
                        <button
                          type="button"
                          onClick={() => handleDecrement(item)}
                          disabled={isItemUpdating}
                          title={item.quantity === 1 ? 'Remove item' : 'Decrease quantity'}
                          className="flex h-8 w-8 items-center justify-center text-stone-600 hover:bg-stone-100 hover:text-stone-900 disabled:opacity-40"
                        >
                          {item.quantity === 1 ? (
                            <FiTrash2 className="h-3.5 w-3.5 text-red-500" />
                          ) : (
                            <FiMinus className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <span className="w-9 text-center text-sm font-semibold text-stone-800">
                          {isItemUpdating ? (
                            <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-teal-700 border-t-transparent" />
                          ) : (
                            item.quantity
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleIncrement(item)}
                          disabled={isItemUpdating}
                          title="Increase quantity"
                          className="flex h-8 w-8 items-center justify-center text-stone-600 hover:bg-stone-100 hover:text-stone-900 disabled:opacity-40"
                        >
                          <FiPlus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Total & Remove */}
                    <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center">
                      <span className="text-base font-bold text-teal-800 sm:text-right">
                        ${lineTotal.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemove(item)}
                        disabled={isItemUpdating}
                        className="mt-1 flex items-center gap-1 text-xs text-stone-400 hover:text-red-600 disabled:opacity-40"
                      >
                        <FiTrash2 className="h-3.5 w-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <Link
                to="/products"
                className="flex items-center gap-2 text-sm font-medium text-teal-800 hover:text-teal-900 hover:underline"
              >
                <FiArrowLeft className="h-4 w-4" />
                Back to catalog
              </Link>

              <button
                type="button"
                onClick={handleClearCart}
                disabled={updating}
                className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3.5 py-2 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                <FiTrash2 className="h-3.5 w-3.5" />
                Clear Shopping Cart
              </button>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="space-y-6 lg:col-span-4">
            <div className="sticky top-6 rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
              <h2 className="text-lg font-bold text-stone-900">Order Summary</h2>

              <dl className="mt-4 space-y-3 border-b border-stone-200 pb-4 text-sm">
                <div className="flex justify-between text-stone-600">
                  <dt>Subtotal ({totalItemCount} items)</dt>
                  <dd className="font-medium text-stone-900">${subtotal.toFixed(2)}</dd>
                </div>

                {discountPercent > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <dt className="flex items-center gap-1">
                      <FiTag className="h-3.5 w-3.5" />
                      Promo ({appliedPromo}) -{discountPercent}%
                    </dt>
                    <dd className="font-medium">-${discountAmount.toFixed(2)}</dd>
                  </div>
                )}

                <div className="flex justify-between text-stone-600">
                  <dt>Estimated Shipping</dt>
                  <dd className="font-medium text-stone-900">
                    {shippingFee === 0 ? (
                      <span className="font-semibold text-emerald-700">FREE</span>
                    ) : (
                      `$${shippingFee.toFixed(2)}`
                    )}
                  </dd>
                </div>

                <div className="flex justify-between text-stone-600">
                  <dt>Estimated Sales Tax (8%)</dt>
                  <dd className="font-medium text-stone-900">${estimatedTax.toFixed(2)}</dd>
                </div>
              </dl>

              {/* Promo Code Input */}
              <form onSubmit={handleApplyPromo} className="mt-4">
                <label className="block text-xs font-medium text-stone-700">
                  Have a Promo Code?
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="e.g. SAVE10, SAVE20"
                    className="flex-1 rounded-md border border-stone-300 px-3 py-1.5 text-xs uppercase placeholder:normal-case focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                  <button
                    type="submit"
                    className="rounded-md bg-stone-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-stone-900"
                  >
                    Apply
                  </button>
                </div>
                {appliedPromo && (
                  <p className="mt-1 text-[11px] text-emerald-700">
                    ✓ Code <b>{appliedPromo}</b> active
                  </p>
                )}
              </form>

              {/* Total */}
              <div className="mt-5 border-t border-stone-200 pt-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-base font-bold text-stone-900">Total</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold tracking-tight text-teal-800">
                      ${grandTotal.toFixed(2)}
                    </span>
                    <span className="block text-[11px] text-stone-400">USD, incl. all taxes</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                type="button"
                onClick={handleCheckout}
                disabled={updating || items.length === 0}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-teal-700 py-3 text-sm font-semibold text-white shadow-xs hover:bg-teal-800 disabled:opacity-50"
              >
                {updating ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Processing...
                  </>
                ) : (
                  <>
                    Proceed to Checkout
                    <FiArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              {/* Trust Badges */}
              <div className="mt-5 space-y-2 border-t border-stone-100 pt-4 text-xs text-stone-500">
                <div className="flex items-center gap-2">
                  <FiShield className="h-4 w-4 text-teal-700 shrink-0" />
                  <span>Secure 256-bit encrypted checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiTruck className="h-4 w-4 text-teal-700 shrink-0" />
                  <span>Free shipping on all orders over $50</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Success Modal */}
      {orderPlaced && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <FiCheckCircle className="h-10 w-10" />
            </div>

            <h3 className="mt-4 text-2xl font-bold text-stone-900">Order Placed Successfully!</h3>
            <p className="mt-1 text-sm text-stone-500">
              Thank you for your purchase. We have received your order.
            </p>

            <div className="my-5 rounded-lg border border-stone-200 bg-stone-50 p-4 text-left text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-stone-500">Order ID:</span>
                <span className="font-semibold text-stone-800">{orderPlaced.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Date:</span>
                <span className="font-medium text-stone-800">{orderPlaced.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Items:</span>
                <span className="font-medium text-stone-800">{orderPlaced.itemsCount} items</span>
              </div>
              <div className="flex justify-between border-t border-stone-200 pt-2 font-bold">
                <span className="text-stone-800">Total Paid:</span>
                <span className="text-teal-800">${orderPlaced.total}</span>
              </div>
            </div>

            <p className="text-xs text-stone-400">
              Synced with FakeStore API (DELETE /carts/:id performed)
            </p>

            <div className="mt-6 flex gap-3">
              <Link
                to="/products"
                onClick={() => dispatch(clearOrderPlaced())}
                className="flex-1 rounded-lg bg-teal-700 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-teal-800"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Carts
