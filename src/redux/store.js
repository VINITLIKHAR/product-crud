import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import productReducer from './productSlice'
import cartReducer from './cartSlice'
import userReducer from './userSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,         // state.auth
    products: productReducer,  // state.products
    carts: cartReducer,        // state.carts
    users: userReducer,        // state.users
  },
})
