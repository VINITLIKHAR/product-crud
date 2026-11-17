import { useState } from 'react'
import { useSelector } from 'react-redux'

const inputClass = 'w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700'

const toForm = (u) => ({
  email: u?.email ?? '',
  username: u?.username ?? '',
  password: u?.password ?? '',
  firstname: u?.name?.firstname ?? '',
  lastname: u?.name?.lastname ?? '',
  phone: u?.phone ?? '',
  city: u?.address?.city ?? '',
})

function UserForm({ initialUser, onSubmit, onCancel }) {
  const saving = useSelector((state) => state.users.saving)
  const isEdit = Boolean(initialUser)
  const original = toForm(initialUser)
  const [form, setForm] = useState(original)
  const [error, setError] = useState('')

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const buildUser = (values) => ({
    ...(initialUser ?? {}),
    email: values.email,
    username: values.username,
    password: values.password,
    phone: values.phone,
    name: { ...(initialUser?.name ?? {}), firstname: values.firstname, lastname: values.lastname },
    address: { ...(initialUser?.address ?? {}), city: values.city },
  })

  const submit = (mode) => (e) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError('Enter a valid email')
    if (form.username.trim().length < 3) return setError('Username must be at least 3 characters')
    if (form.password.length < 4) return setError('Password must be at least 4 characters')
    setError('')

    const changes = {}
    Object.keys(form).forEach((key) => { if (form[key] !== original[key]) changes[key] = form[key] })

    onSubmit({ mode, user: buildUser(form), changes })
  }

  const fields = [
    ['email', 'Email'], ['username', 'Username'], ['password', 'Password'],
    ['firstname', 'First name'], ['lastname', 'Last name'], ['phone', 'Phone'], ['city', 'City'],
  ]

  return (
    <form className="space-y-4 rounded-lg border border-teal-200 bg-white p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map(([name, label]) => (
          <label key={name} className="text-sm">
            <span className="mb-1 block font-medium">{label}</span>
            <input name={name} value={form[name]} onChange={handleChange} className={inputClass} />
          </label>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap gap-2">
        {isEdit ? (
          <>
            <button onClick={submit('patch')} disabled={saving} className="rounded-md bg-teal-700 px-4 py-2 text-sm text-white hover:bg-teal-800 disabled:opacity-50">
              Save changes (PATCH)
            </button>
            <button onClick={submit('put')} disabled={saving} className="rounded-md border border-teal-700 px-4 py-2 text-sm text-teal-800 hover:bg-teal-50 disabled:opacity-50">
              Replace all (PUT)
            </button>
          </>
        ) : (
          <button onClick={submit('post')} disabled={saving} className="rounded-md bg-teal-700 px-4 py-2 text-sm text-white hover:bg-teal-800 disabled:opacity-50">
            {saving ? 'Saving...' : 'Create user'}
          </button>
        )}
        <button type="button" onClick={onCancel} className="rounded-md border border-stone-300 px-4 py-2 text-sm hover:bg-stone-100">Cancel</button>
      </div>
    </form>
  )
}

export default UserForm
