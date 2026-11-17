import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  getAllCarts,
  getCartsByUser,
  createCart,
  updateCart,
  patchCart,
  deleteCart,
  fetchActiveUserCart,
  addToCartApi,
  incrementItemApi,
  decrementItemApi,
  removeItemApi,
  clearCartApi,
} from '../services/cartService'
import getErrorMessage from '../utils/getErrorMessage'

// Local storage helpers
const getStorageKey = (userId) => `fakestore_cart_${userId || 'default'}`

const saveCartToStorage = (userId, data) => {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(data))
  } catch (err) {
    console.warn('Storage write failed', err)
  }
}

const loadCartFromStorage = (userId) => {
  try {
    const stored = localStorage.getItem(getStorageKey(userId))
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

const removeCartFromStorage = (userId) => {
  try {
    localStorage.removeItem(getStorageKey(userId))
  } catch {
    // no-op
  }
}

// ==========================================
// THUNKS FOR MODERN CART FLOW
// ==========================================

// 1. FETCH active user cart from API
export const fetchUserCart = createAsyncThunk(
  'cart/fetchUserCart',
  async (targetUserId, { getState, rejectWithValue }) => {
    try {
      const stateUserId = getState().auth.userId
      const userId = targetUserId || stateUserId || 2

      // Check local cached modifications first
      const cached = loadCartFromStorage(userId)
      if (cached && Array.isArray(cached.items) && cached.items.length > 0) {
        return cached
      }

      // Fetch fresh from FakeStoreAPI
      const cartData = await fetchActiveUserCart(userId)
      saveCartToStorage(userId, cartData)
      return cartData
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not load your shopping cart'))
    }
  }
)

// 2. ADD PRODUCT to Cart (API POST/PUT)
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ product, quantity = 1 }, { getState, rejectWithValue }) => {
    try {
      const state = getState().carts
      const auth = getState().auth
      const userId = auth.userId || state.userId || 2

      const result = await addToCartApi({
        cartId: state.cartId,
        userId,
        product,
        quantity,
        currentItems: state.items,
      })

      const fullCart = {
        cartId: result.cartId,
        userId,
        date: new Date().toISOString(),
        items: result.items,
      }
      saveCartToStorage(userId, fullCart)
      return fullCart
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not add product to cart'))
    }
  }
)

// 3. INCREMENT quantity (API PUT /carts/:id)
export const incrementQuantity = createAsyncThunk(
  'cart/incrementQuantity',
  async (productId, { getState, rejectWithValue }) => {
    try {
      const state = getState().carts
      const auth = getState().auth
      const userId = auth.userId || state.userId || 2

      const result = await incrementItemApi({
        cartId: state.cartId,
        userId,
        productId,
        currentItems: state.items,
      })

      const fullCart = {
        cartId: result.cartId,
        userId,
        date: new Date().toISOString(),
        items: result.items,
      }
      saveCartToStorage(userId, fullCart)
      return fullCart
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not update quantity'))
    }
  }
)

// 4. DECREMENT quantity (API PUT /carts/:id)
export const decrementQuantity = createAsyncThunk(
  'cart/decrementQuantity',
  async (productId, { getState, rejectWithValue }) => {
    try {
      const state = getState().carts
      const auth = getState().auth
      const userId = auth.userId || state.userId || 2

      const result = await decrementItemApi({
        cartId: state.cartId,
        userId,
        productId,
        currentItems: state.items,
      })

      const fullCart = {
        cartId: result.cartId,
        userId,
        date: new Date().toISOString(),
        items: result.items,
      }
      saveCartToStorage(userId, fullCart)
      return fullCart
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not update quantity'))
    }
  }
)

// 5. REMOVE item (API PUT /carts/:id)
export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (productId, { getState, rejectWithValue }) => {
    try {
      const state = getState().carts
      const auth = getState().auth
      const userId = auth.userId || state.userId || 2

      const result = await removeItemApi({
        cartId: state.cartId,
        userId,
        productId,
        currentItems: state.items,
      })

      const fullCart = {
        cartId: result.cartId,
        userId,
        date: new Date().toISOString(),
        items: result.items,
      }
      saveCartToStorage(userId, fullCart)
      return fullCart
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not remove product from cart'))
    }
  }
)

// 6. CLEAR Cart (API DELETE /carts/:id)
export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState().carts
      const auth = getState().auth
      const userId = auth.userId || state.userId || 2

      await clearCartApi(state.cartId || 1)
      removeCartFromStorage(userId)

      return {
        cartId: state.cartId || 1,
        items: [],
      }
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not clear cart'))
    }
  }
)

// 7. CHECKOUT (API DELETE /carts/:id and place order)
export const checkoutCart = createAsyncThunk(
  'cart/checkoutCart',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState().carts
      const auth = getState().auth
      const userId = auth.userId || state.userId || 2

      await clearCartApi(state.cartId || 1)
      removeCartFromStorage(userId)

      const total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const count = state.items.reduce((sum, item) => sum + item.quantity, 0)

      return {
        orderId: `FS-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        total: (total * 1.08).toFixed(2),
        itemsCount: count,
      }
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not process checkout'))
    }
  }
)

// 8. RESET to FakeStoreAPI defaults
export const resetCartToApi = createAsyncThunk(
  'cart/resetToApi',
  async (_, { getState, rejectWithValue }) => {
    try {
      const stateUserId = getState().auth.userId
      const userId = stateUserId || 2
      removeCartFromStorage(userId)
      const cartData = await fetchActiveUserCart(userId)
      saveCartToStorage(userId, cartData)
      return cartData
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not reload default cart from API'))
    }
  }
)

// ==========================================
// LEGACY THUNKS (for backwards compatibility)
// ==========================================
export const fetchCarts = createAsyncThunk('carts/fetchAll', async (filters = {}, { rejectWithValue }) => {
  try {
    const { userId, ...params } = filters
    Object.keys(params).forEach((k) => { if (params[k] === '' || params[k] == null) delete params[k] })
    return userId ? await getCartsByUser(userId, params) : await getAllCarts(params)
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Could not load carts'))
  }
})

export const addCart = createAsyncThunk('carts/add', async (cart, { getState, rejectWithValue }) => {
  try {
    const result = await createCart(cart)
    const ids = (getState().carts.allCarts || []).map((c) => c.id)
    const nextId = ids.length ? Math.max(...ids) + 1 : result.id
    return { ...cart, ...result, id: nextId }
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Could not create cart'))
  }
})

export const editCart = createAsyncThunk('carts/edit', async ({ id, cart }, { rejectWithValue }) => {
  try {
    const result = await updateCart(id, cart)
    return { ...cart, ...result, id: Number(id) }
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Could not update cart'))
  }
})

export const patchCartThunk = createAsyncThunk('carts/patch', async ({ id, changes }, { rejectWithValue }) => {
  try {
    const result = await patchCart(id, changes)
    return { ...changes, ...result, id: Number(id) }
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Could not update cart'))
  }
})

export const removeCart = createAsyncThunk('carts/remove', async (id, { rejectWithValue }) => {
  try {
    await deleteCart(id)
    return Number(id)
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Could not delete cart'))
  }
})

// ==========================================
// SLICE DEFINITION
// ==========================================
const cartSlice = createSlice({
  name: 'carts',
  initialState: {
    cartId: null,
    userId: null,
    date: null,
    items: [], // Array of { productId, quantity, title, price, image, category }
    loading: false, // initial cart fetch
    updating: false, // any mutation thunk is executing
    updatingItemId: null, // specific item id being updated
    error: null,
    orderPlaced: null, // { orderId, date, total, itemsCount }
    allCarts: [], // legacy list
    saving: false, // legacy saving flag
  },
  reducers: {
    clearOrderPlaced: (state) => {
      state.orderPlaced = null
    },
    clearCartError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUserCart
      .addCase(fetchUserCart.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserCart.fulfilled, (state, action) => {
        state.loading = false
        state.cartId = action.payload.cartId
        state.userId = action.payload.userId
        state.date = action.payload.date
        state.items = action.payload.items || []
      })
      .addCase(fetchUserCart.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // addToCart
      .addCase(addToCart.pending, (state, action) => {
        state.updating = true
        state.updatingItemId = action.meta.arg.product?.id || null
        state.error = null
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.updating = false
        state.updatingItemId = null
        state.cartId = action.payload.cartId
        state.items = action.payload.items
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.updating = false
        state.updatingItemId = null
        state.error = action.payload
      })

      // incrementQuantity
      .addCase(incrementQuantity.pending, (state, action) => {
        state.updating = true
        state.updatingItemId = action.meta.arg
        state.error = null
      })
      .addCase(incrementQuantity.fulfilled, (state, action) => {
        state.updating = false
        state.updatingItemId = null
        state.items = action.payload.items
      })
      .addCase(incrementQuantity.rejected, (state, action) => {
        state.updating = false
        state.updatingItemId = null
        state.error = action.payload
      })

      // decrementQuantity
      .addCase(decrementQuantity.pending, (state, action) => {
        state.updating = true
        state.updatingItemId = action.meta.arg
        state.error = null
      })
      .addCase(decrementQuantity.fulfilled, (state, action) => {
        state.updating = false
        state.updatingItemId = null
        state.items = action.payload.items
      })
      .addCase(decrementQuantity.rejected, (state, action) => {
        state.updating = false
        state.updatingItemId = null
        state.error = action.payload
      })

      // removeFromCart
      .addCase(removeFromCart.pending, (state, action) => {
        state.updating = true
        state.updatingItemId = action.meta.arg
        state.error = null
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.updating = false
        state.updatingItemId = null
        state.items = action.payload.items
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.updating = false
        state.updatingItemId = null
        state.error = action.payload
      })

      // clearCart
      .addCase(clearCart.pending, (state) => {
        state.updating = true
        state.error = null
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.updating = false
        state.items = []
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.updating = false
        state.error = action.payload
      })

      // checkoutCart
      .addCase(checkoutCart.pending, (state) => {
        state.updating = true
        state.error = null
      })
      .addCase(checkoutCart.fulfilled, (state, action) => {
        state.updating = false
        state.items = []
        state.orderPlaced = action.payload
      })
      .addCase(checkoutCart.rejected, (state, action) => {
        state.updating = false
        state.error = action.payload
      })

      // resetCartToApi
      .addCase(resetCartToApi.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(resetCartToApi.fulfilled, (state, action) => {
        state.loading = false
        state.cartId = action.payload.cartId
        state.userId = action.payload.userId
        state.date = action.payload.date
        state.items = action.payload.items || []
      })
      .addCase(resetCartToApi.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Legacy reducers
      .addCase(fetchCarts.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchCarts.fulfilled, (state, action) => { state.loading = false; state.allCarts = action.payload })
      .addCase(fetchCarts.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(addCart.pending, (state) => { state.saving = true })
      .addCase(addCart.fulfilled, (state, action) => {
        state.saving = false
        state.allCarts.unshift(action.payload)
      })
      .addCase(addCart.rejected, (state) => { state.saving = false })
      .addCase(editCart.pending, (state) => { state.saving = true })
      .addCase(editCart.fulfilled, (state, action) => {
        state.saving = false
        state.allCarts = state.allCarts.map((c) => (c.id === action.payload.id ? { ...c, ...action.payload } : c))
      })
      .addCase(editCart.rejected, (state) => { state.saving = false })
      .addCase(patchCartThunk.pending, (state) => { state.saving = true })
      .addCase(patchCartThunk.fulfilled, (state, action) => {
        state.saving = false
        state.allCarts = state.allCarts.map((c) => (c.id === action.payload.id ? { ...c, ...action.payload } : c))
      })
      .addCase(patchCartThunk.rejected, (state) => { state.saving = false })
      .addCase(removeCart.pending, (state) => { state.saving = true })
      .addCase(removeCart.fulfilled, (state, action) => {
        state.saving = false
        state.allCarts = state.allCarts.filter((c) => c.id !== action.payload)
      })
      .addCase(removeCart.rejected, (state) => { state.saving = false })
  },
})

export const { clearOrderPlaced, clearCartError } = cartSlice.actions
export default cartSlice.reducer
