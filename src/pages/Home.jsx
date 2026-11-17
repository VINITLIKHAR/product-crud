import { Link } from 'react-router-dom'

const cards = [
  { to: '/products', title: 'Products', text: 'List, filter by category, sort, view, edit and delete products.' },
  { to: '/products/new', title: 'Add product', text: 'Create a new product with a validated form.' },
  { to: '/cart', title: 'Shopping Cart', text: 'Manage cart items, increment/decrement quantities, and checkout.' },
  // { to: '/users', title: 'Users', text: 'Manage users with create, PUT, PATCH and delete.' },
]

function Home() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Product CRUD</h1>
      <p className="mt-2 max-w-xl text-stone-600">
        Every FakeStoreAPI endpoint, wired through service files and Redux slices.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link key={c.to} to={c.to} className="rounded-lg border border-stone-200 bg-white p-5 hover:border-teal-700">
            <h2 className="font-semibold text-teal-800">{c.title}</h2>
            <p className="mt-1 text-sm text-stone-600">{c.text}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Home
