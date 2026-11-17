import { useState } from 'react'
import { useSelector } from 'react-redux'

const inputClass = 'rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700'
const today = () => new Date().toISOString().slice(0, 10) // "2026-11-16"

function CartForm({ initialCart, defaultUserId, onSubmit, onCancel, submitLabel }) {
  const saving = useSelector((state) => state.carts.saving)
  const products = useSelector((state) => state.products.items)

  const [userId, setUserId] = useState(initialCart?.userId ?? defaultUserId ?? '')
  const [date, setDate] = useState(initialCart?.date?.slice(0, 10) ?? today())
  const [lines, setLines] = useState(initialCart?.products ?? [{ productId: 1, quantity: 1 }])
  const [error, setError] = useState('')

  const changeLine = (index, field, value) =>
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, [field]: Number(value) } : l)))
  const addLine = () => setLines((prev) => [...prev, { productId: 1, quantity: 1 }])
  const removeLine = (index) => setLines((prev) => prev.filter((_, i) => i !== index))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!(Number(userId) > 0)) return setError('User id is required')
    if (lines.length === 0) return setError('Add at least one product')
    if (lines.some((l) => !(l.productId > 0) || !(l.quantity > 0))) return setError('Product id and quantity must be above 0')
    setError('')
    onSubmit({ userId: Number(userId), date, products: lines })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-teal-200 bg-white p-5">
      <div className="flex flex-wrap gap-4">
        <label className="text-sm">
          <span className="mb-1 block font-medium">User id</span>
          <input type="number" value={userId} onChange={(e) => setUserId(e.target.value)} className={`${inputClass} w-28`} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Date</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
        </label>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Products in this cart</p>
        {lines.map((line, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2">
            {products.length > 0 ? (
              <select value={line.productId} onChange={(e) => changeLine(i, 'productId', e.target.value)} className={`${inputClass} max-w-xs`}>
                {products.map((p) => <option key={p.id} value={p.id}>#{p.id} {p.title.slice(0, 30)}</option>)}
              </select>
            ) : (
              <input type="number" value={line.productId} onChange={(e) => changeLine(i, 'productId', e.target.value)} className={`${inputClass} w-28`} placeholder="Product id" />
            )}
            <input type="number" min="1" value={line.quantity} onChange={(e) => changeLine(i, 'quantity', e.target.value)} className={`${inputClass} w-20`} />
            <button type="button" onClick={() => removeLine(i)} className="text-sm text-red-700 hover:underline">Remove</button>
          </div>
        ))}
        <button type="button" onClick={addLine} className="text-sm text-teal-800 hover:underline">+ Add another product</button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="rounded-md bg-teal-700 px-4 py-2 text-sm text-white hover:bg-teal-800 disabled:opacity-50">
          {saving ? 'Saving...' : submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="rounded-md border border-stone-300 px-4 py-2 text-sm hover:bg-stone-100">Cancel</button>
      </div>
    </form>
  )
}

export default CartForm
