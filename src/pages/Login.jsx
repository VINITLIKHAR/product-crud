import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { login } from '../redux/authSlice'

const inputClass = 'w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700'

function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { token, loading, error } = useSelector((state) => state.auth)
  const [form, setForm] = useState({ username: '', password: '' })

  const goTo = location.state?.from?.pathname || '/'

  if (token) return <Navigate to={goTo} replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) return toast.error('Enter username and password')
    try {
      await dispatch(login(form)).unwrap()
      toast.success('Welcome!')
      navigate(goTo, { replace: true })
    } catch {
      // error message is already saved in state.auth.error and shown below
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-lg border border-stone-200 bg-white p-6">
        <h1 className="text-xl font-bold text-teal-800">Login</h1>
        <p className="rounded-md bg-stone-100 p-3 text-xs text-stone-600">
          Demo account: <b>mor_2314</b> / <b>83r5^_</b>
        </p>
        <input className={inputClass} placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <input className={inputClass} type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="w-full rounded-md bg-teal-700 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50">
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  )
}

export default Login
