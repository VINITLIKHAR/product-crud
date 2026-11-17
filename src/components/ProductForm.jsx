
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCategories } from '../redux/productSlice'

const emptyForm = { title: '', price: '', description: '', image: '', category: '' }
const inputClass = 'w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700'

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  )
}

function ProductForm({ initialValues = emptyForm, onSubmit, submitLabel = 'Save' }) {
  const dispatch = useDispatch()
  const { categories, saving } = useSelector((state) => state.products)

  const [form, setForm] = useState({ ...emptyForm, ...initialValues })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (categories.length === 0) dispatch(fetchCategories())
  }, [dispatch, categories.length])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const validate = () => {
    const next = {}
    if (form.title.trim().length < 3) next.title = 'Title must be at least 3 characters'
    if (!(Number(form.price) > 0)) next.price = 'Price must be greater than 0'
    if (!form.category) next.category = 'Please choose a category'
    if (!/^https?:\/\//.test(form.image)) next.image = 'Image must be a valid http(s) URL'
    if (form.description.trim().length < 10) next.description = 'Description must be at least 10 characters'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault() // stop browser page reload / browser का page reload रोको
    if (!validate()) return
    onSubmit({ ...form, title: form.title.trim(), price: Number(form.price) })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-stone-200 bg-white p-6">
      <Field label="Title" error={errors.title}>
        <input name="title" value={form.title} onChange={handleChange} className={inputClass} />
      </Field>
      <Field label="Price (USD)" error={errors.price}>
        <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} className={inputClass} />
      </Field>
      <Field label="Category" error={errors.category}>
        <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
          <option value="">Select category</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Image URL" error={errors.image}>
        <input name="image" value={form.image} onChange={handleChange} className={inputClass} placeholder="https://..." />
      </Field>
      <Field label="Description" error={errors.description}>
        <textarea name="description" rows={4} value={form.description} onChange={handleChange} className={inputClass} />
      </Field>

      <button type="submit" disabled={saving} className="rounded-md bg-teal-700 px-5 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50">
        {saving ? 'Saving...' : submitLabel}
      </button>
    </form>
  )
}

export default ProductForm
