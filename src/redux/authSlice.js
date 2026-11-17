import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  loginUser, saveSession, clearSession, getUserIdFromToken,
} from '../services/authService'
import getErrorMessage from '../utils/getErrorMessage'


export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { token } = await loginUser(credentials)
    saveSession(token, credentials.username) // side effect lives here, not in reducer
    return { token, username: credentials.username }
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Invalid username or password'))
  }
})

export const logout = createAsyncThunk('auth/logout', async () => {
  clearSession()
})

const savedToken = localStorage.getItem('token')

const initialState = {
  token: savedToken,
  username: localStorage.getItem('username'),
  userId: savedToken ? getUserIdFromToken(savedToken) : null,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.token = action.payload.token
        state.username = action.payload.username
        state.userId = getUserIdFromToken(action.payload.token)
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(logout.fulfilled, (state) => {
        state.token = null
        state.username = null
        state.userId = null
      })
  },
})

export default authSlice.reducer
