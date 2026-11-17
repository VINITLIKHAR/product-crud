import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  getAllUsers, createUser, updateUser, patchUser, deleteUser,
} from '../services/userService'
import getErrorMessage from '../utils/getErrorMessage'

// READ: filters = { limit, sort }
export const fetchUsers = createAsyncThunk('users/fetchAll', async ({ limit, sort } = {}, { rejectWithValue }) => {
  try {
    return await getAllUsers(limit, sort)
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Could not load users'))
  }
})

// CREATE
export const addUser = createAsyncThunk('users/add', async (user, { getState, rejectWithValue }) => {
  try {
    const result = await createUser(user)
    const ids = getState().users.items.map((u) => u.id)
    const nextId = ids.length ? Math.max(...ids) + 1 : result.id
    return { ...user, ...result, id: nextId }
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Could not create user'))
  }
})

// UPDATE (PUT) — whole user
export const editUser = createAsyncThunk('users/edit', async ({ id, user }, { rejectWithValue }) => {
  try {
    const result = await updateUser(id, user)
    return { ...user, ...result, id: Number(id) }
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Could not update user'))
  }
})

// UPDATE (PATCH) — only the fields that changed.
// `merged` is the full updated user we keep in our list (API does not save it).
export const patchUserThunk = createAsyncThunk('users/patch', async ({ id, changes, merged }, { rejectWithValue }) => {
  try {
    await patchUser(id, changes)
    return { ...merged, id: Number(id) }
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Could not update user'))
  }
})

// DELETE
export const removeUser = createAsyncThunk('users/remove', async (id, { rejectWithValue }) => {
  try {
    await deleteUser(id)
    return Number(id)
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Could not delete user'))
  }
})

const replaceInList = (state, updated) => {
  state.items = state.items.map((u) => (u.id === updated.id ? { ...u, ...updated } : u))
}

const userSlice = createSlice({
  name: 'users',
  initialState: { items: [], loading: false, saving: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchUsers.fulfilled, (state, action) => { state.loading = false; state.items = action.payload })
      .addCase(fetchUsers.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(addUser.pending, (state) => { state.saving = true })
      .addCase(addUser.fulfilled, (state, action) => { state.saving = false; state.items.unshift(action.payload) })
      .addCase(addUser.rejected, (state) => { state.saving = false })
      .addCase(editUser.pending, (state) => { state.saving = true })
      .addCase(editUser.fulfilled, (state, action) => { state.saving = false; replaceInList(state, action.payload) })
      .addCase(editUser.rejected, (state) => { state.saving = false })
      .addCase(patchUserThunk.pending, (state) => { state.saving = true })
      .addCase(patchUserThunk.fulfilled, (state, action) => { state.saving = false; replaceInList(state, action.payload) })
      .addCase(patchUserThunk.rejected, (state) => { state.saving = false })
      .addCase(removeUser.pending, (state) => { state.saving = true })
      .addCase(removeUser.fulfilled, (state, action) => {
        state.saving = false
        state.items = state.items.filter((u) => u.id !== action.payload)
      })
      .addCase(removeUser.rejected, (state) => { state.saving = false })
  },
})

export default userSlice.reducer
