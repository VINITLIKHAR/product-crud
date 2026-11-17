import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  getAllProducts, getProductById, getCategories, getProductsByCategory,
  createProduct, updateProduct, patchProduct, deleteProduct,
} from '../services/productService'
import getErrorMessage from '../utils/getErrorMessage'

// READ: list. filters = { category, limit, sort }
export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async ({ category, limit, sort } = {}, { rejectWithValue }) => {
    try {
      if (category && category !== 'all') return await getProductsByCategory(category, limit, sort)
      return await getAllProducts(limit, sort)
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not load products'))
    }
  }
)

export const fetchCategories = createAsyncThunk('products/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    return await getCategories()
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Could not load categories'))
  }
})


export const fetchProductById = createAsyncThunk(
  'products/fetchOne',
  async (id, { getState, rejectWithValue }) => {
    const found = getState().products.items.find((p) => p.id === Number(id))
    if (found) return found
    try {
      const data = await getProductById(id)
      if (!data) return rejectWithValue('Product not found')
      return data
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not load product'))
    }
  }
)

// CREATE (POST). The API always answers id 21, so we make our own next id.
// API हमेशा id 21 देती है, इसलिए हम अपनी अगली id बनाते हैं।
export const addProduct = createAsyncThunk(
  'products/add',
  async (product, { getState, rejectWithValue }) => {
    try {
      const result = await createProduct(product)
      const ids = getState().products.items.map((p) => p.id)
      const nextId = ids.length ? Math.max(...ids) + 1 : result.id
      return { ...product, ...result, id: nextId }
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not create product'))
    }
  }
)

// UPDATE (PUT) — whole product
export const editProduct = createAsyncThunk(
  'products/edit',
  async ({ id, product }, { rejectWithValue }) => {
    try {
      const result = await updateProduct(id, product)
      return { ...product, ...result, id: Number(id) }
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not update product'))
    }
  }
)

// UPDATE (PATCH) — only some fields
export const quickPatchProduct = createAsyncThunk(
  'products/patch',
  async ({ id, changes }, { rejectWithValue }) => {
    try {
      const result = await patchProduct(id, changes)
      return { ...changes, ...result, id: Number(id) }
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not update product'))
    }
  }
)

// DELETE
export const removeProduct = createAsyncThunk('products/remove', async (id, { rejectWithValue }) => {
  try {
    await deleteProduct(id)
    return Number(id)
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Could not delete product'))
  }
})

const initialState = {
  items: [],       // the list shown on Products page
  categories: [],  // ["electronics", ...]
  current: null,   // the single product shown on detail/edit page
  loading: false,  // true while LOADING data
  saving: false,   // true while create/update/delete is running
  error: null,
}

// English: small helper — replace one product inside a list.
// हिंदी: छोटा helper — list में एक product को बदलता है।
const replaceInList = (state, updated) => {
  state.items = state.items.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
  if (state.current?.id === updated.id) state.current = { ...state.current, ...updated }
}

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ── list ──
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchProducts.fulfilled, (state, action) => { state.loading = false; state.items = action.payload })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      // ── categories ──
      .addCase(fetchCategories.fulfilled, (state, action) => { state.categories = action.payload })
            // ── one ──
      .addCase(fetchProductById.pending, (state) => { state.error = null })
      .addCase(fetchProductById.fulfilled, (state, action) => { state.current = action.payload })
      .addCase(fetchProductById.rejected, (state, action) => { state.error = action.payload })
      // ── create ──
      .addCase(addProduct.pending, (state) => { state.saving = true })
      .addCase(addProduct.fulfilled, (state, action) => { state.saving = false; state.items.unshift(action.payload) })
      .addCase(addProduct.rejected, (state) => { state.saving = false })
      // ── update (PUT and PATCH share the same reaction) ──
      .addCase(editProduct.pending, (state) => { state.saving = true })
      .addCase(editProduct.fulfilled, (state, action) => { state.saving = false; replaceInList(state, action.payload) })
      .addCase(editProduct.rejected, (state) => { state.saving = false })
      .addCase(quickPatchProduct.pending, (state) => { state.saving = true })
      .addCase(quickPatchProduct.fulfilled, (state, action) => { state.saving = false; replaceInList(state, action.payload) })
      .addCase(quickPatchProduct.rejected, (state) => { state.saving = false })
      // ── delete ──
      .addCase(removeProduct.pending, (state) => { state.saving = true })
      .addCase(removeProduct.fulfilled, (state, action) => {
        state.saving = false
        state.items = state.items.filter((p) => p.id !== action.payload)
        if (state.current?.id === action.payload) state.current = null
      })
      .addCase(removeProduct.rejected, (state) => { state.saving = false })
  },
})

export default productSlice.reducer
