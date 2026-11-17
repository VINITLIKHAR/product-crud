import axiosInstance from '../api/axiosInstance'

// POST /auth/login  → { token: "..." }
export const loginUser = async (credentials) => {
  const { data } = await axiosInstance.post('/auth/login', credentials)
  return data
}


export const saveSession = (token, username) => {
  localStorage.setItem('token', token)
  localStorage.setItem('username', username)
}

export const clearSession = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
}

export const getUserIdFromToken = (token) => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64)).sub
  } catch {
    return null
  }
}
