import axiosInstance from '../api/axiosInstance'

// GET /users?limit=&sort=
export const getAllUsers = async (limit, sort) => {
  const { data } = await axiosInstance.get('/users', { params: { limit, sort } })
  return data
}

// GET /users/:id
export const getUserById = async (id) => {
  const { data } = await axiosInstance.get(`/users/${id}`)
  return data
}

// POST /users   → CREATE
export const createUser = async (user) => {
  const { data } = await axiosInstance.post('/users', user)
  return data
}

// PUT /users/:id   → UPDATE (replace whole user)
export const updateUser = async (id, user) => {
  const { data } = await axiosInstance.put(`/users/${id}`, user)
  return data
}

// PATCH /users/:id   → UPDATE (only some fields)
export const patchUser = async (id, changes) => {
  const { data } = await axiosInstance.patch(`/users/${id}`, changes)
  return data
}

// DELETE /users/:id   → DELETE
export const deleteUser = async (id) => {
  const { data } = await axiosInstance.delete(`/users/${id}`)
  return data
}
