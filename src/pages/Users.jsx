import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import UserForm from '../components/UserForm'
import { addUser, editUser, fetchUsers, patchUserThunk, removeUser } from '../redux/userSlice'

const selectClass = 'rounded-md border border-stone-300 bg-white px-3 py-2 text-sm'

const toNestedChanges = (flat) => {
  const out = {}
  const { firstname, lastname, city, ...rest } = flat
  Object.assign(out, rest)
  if (firstname !== undefined || lastname !== undefined) {
    out.name = {}
    if (firstname !== undefined) out.name.firstname = firstname
    if (lastname !== undefined) out.name.lastname = lastname
  }
  if (city !== undefined) out.address = { city }
  return out
}

function Users() {
  const dispatch = useDispatch()
  const { items: users, loading, saving, error } = useSelector((state) => state.users)
  const [sort, setSort] = useState('')
  const [limit, setLimit] = useState('')
  const [formMode, setFormMode] = useState(null) // null | 'new' | a user object (editing)

  useEffect(() => {
    dispatch(fetchUsers({ sort: sort || undefined, limit: limit ? Number(limit) : undefined }))
  }, [dispatch, sort, limit])

  const run = async (action, successMessage) => {
    try {
      await dispatch(action).unwrap()
      toast.success(successMessage)
      return true
    } catch (message) {
      toast.error(message)
      return false
    }
  }

  const handleSubmitForm = async ({ mode, user, changes }) => {
    let ok
    if (mode === 'post') {
      ok = await run(addUser(user), 'User created (POST)')
    } else if (mode === 'put') {
      ok = await run(editUser({ id: formMode.id, user }), 'User replaced (PUT)')
    } else {
      if (Object.keys(changes).length === 0) return toast('Nothing changed')
      ok = await run(
        patchUserThunk({ id: formMode.id, changes: toNestedChanges(changes), merged: user }),
        'User updated (PATCH)'
      )
    }
    if (ok) setFormMode(null)
  }

  const handleDelete = (user) => {
    if (window.confirm(`Delete user "${user.username}"?`)) run(removeUser(user.id), 'User deleted')
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-2xl font-bold">Users</h1>
        <select className={selectClass} value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">Default order</option><option value="asc">Asc</option><option value="desc">Desc</option>
        </select>
        <select className={selectClass} value={limit} onChange={(e) => setLimit(e.target.value)}>
          <option value="">All</option><option value="3">3</option><option value="5">5</option>
        </select>
        <button onClick={() => setFormMode('new')} className="rounded-md bg-teal-700 px-4 py-2 text-sm text-white hover:bg-teal-800">New user</button>
      </div>

      {formMode && (
        <div className="mb-6">
          <UserForm
            key={formMode === 'new' ? 'new' : formMode.id}
            initialUser={formMode === 'new' ? null : formMode}
            onSubmit={handleSubmitForm}
            onCancel={() => setFormMode(null)}
          />
        </div>
      )}

      {loading && <p className="text-stone-500">Loading users...</p>}
      {error && !loading && <p className="text-red-700">{error}</p>}
      {!loading && !error && users.length === 0 && <p className="text-stone-500">No users found.</p>}

      {!loading && users.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-100 text-stone-600">
              <tr>
                <th className="px-4 py-2">ID</th><th className="px-4 py-2">Name</th><th className="px-4 py-2">Username</th>
                <th className="px-4 py-2">Email</th><th className="px-4 py-2">City</th><th className="px-4 py-2">Phone</th><th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-stone-100">
                  <td className="px-4 py-2">{u.id}</td>
                  <td className="px-4 py-2">{u.name?.firstname} {u.name?.lastname}</td>
                  <td className="px-4 py-2">{u.username}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">{u.address?.city}</td>
                  <td className="px-4 py-2">{u.phone}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-right">
                    <button onClick={() => setFormMode(u)} className="mr-3 text-teal-800 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(u)} disabled={saving} className="text-red-700 hover:underline disabled:opacity-50">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Users
