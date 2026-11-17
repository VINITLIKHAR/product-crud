import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCategories, fetchProducts } from '../redux/productSlice'
import ProductCard from '../components/ProductCard'

const selectClass = 'rounded-md border border-stone-300 bg-white px-3 py-2 text-sm'

function Products() {
  const dispatch = useDispatch()
  const { items, categories, loading, error } = useSelector((state) => state.products)

  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('')   // '' | 'asc' | 'desc'
  const [limit, setLimit] = useState('')  // '' = all

  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  useEffect(() => {
    dispatch(fetchProducts({
      category,
      sort: sort || undefined,           // undefined = Axios skips it / Axios इसे छोड़ देता है
      limit: limit ? Number(limit) : undefined,
    }))
  }, [dispatch, category, sort, limit])

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-2xl font-bold">Products</h1>
        <select className={selectClass} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className={selectClass} value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">Default order</option>
          <option value="asc">Oldest first</option>
          <option value="desc">Newest first</option>
        </select>
        <select className={selectClass} value={limit} onChange={(e) => setLimit(e.target.value)}>
          <option value="">All</option>
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="15">15</option>
        </select>
        <Link to="/products/new" className="rounded-md bg-teal-700 px-4 py-2 text-sm text-white hover:bg-teal-800">Add product</Link>
      </div>

      {loading && <p className="text-stone-500">Loading products...</p>}

      {error && !loading && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}{' '}
          <button className="underline" onClick={() => dispatch(fetchProducts({ category }))}>Try again</button>
        </div>
      )}

      {!loading && !error && items.length === 0 && <p className="text-stone-500">No products found.</p>}

      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      )}
    </div>
  )
}

export default Products
