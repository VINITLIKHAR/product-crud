import axiosInstance from '../api/axiosInstance.js'
import { getAllProducts, getProductById } from './productService.js'

// ==========================================
// Base FakeStoreAPI Cart Endpoints
// ==========================================

// GET /carts?limit=&sort=&startdate=&enddate=
export const getAllCarts = async (params = {}) => {
  const { data } = await axiosInstance.get('/carts', { params })
  return data
}

// GET /carts/:id
export const getCartById = async (id) => {
  const { data } = await axiosInstance.get(`/carts/${id}`)
  return data
}

// GET /carts/user/:userId
export const getCartsByUser = async (userId, params = {}) => {
  const { data } = await axiosInstance.get(`/carts/user/${userId}`, { params })
  return data
}

// POST /carts   → CREATE
export const createCart = async (cart) => {
  const { data } = await axiosInstance.post('/carts', cart)
  return data
}

// PUT /carts/:id   → UPDATE (replace whole cart)
export const updateCart = async (id, cart) => {
  const { data } = await axiosInstance.put(`/carts/${id}`, cart)
  return data
}

// PATCH /carts/:id   → UPDATE (only some fields)
export const patchCart = async (id, changes) => {
  const { data } = await axiosInstance.patch(`/carts/${id}`, changes)
  return data
}

// DELETE /carts/:id   → DELETE
export const deleteCart = async (id) => {
  const { data } = await axiosInstance.delete(`/carts/${id}`)
  return data
}

// ==========================================
// Product Hydration Helper
// ==========================================
export const enrichCartItems = async (rawProducts = []) => {
  const allProductsMap = {}
  try {
    const allProducts = await getAllProducts()
    if (Array.isArray(allProducts)) {
      allProducts.forEach((p) => {
        allProductsMap[p.id] = p
      })
    }
  } catch (err) {
    console.warn('Could not fetch all products for hydration, will fetch individually', err)
  }

  const enriched = await Promise.all(
    rawProducts.map(async (item) => {
      let product = allProductsMap[item.productId]
      if (!product) {
        try {
          product = await getProductById(item.productId)
        } catch {
          product = null
        }
      }

      return {
        productId: item.productId,
        quantity: Number(item.quantity) || 1,
        title: product?.title || `Product #${item.productId}`,
        price: Number(product?.price) || 0,
        image: product?.image || '',
        category: product?.category || 'General',
        description: product?.description || '',
      }
    })
  )

  return enriched
}

// ==========================================
// Dedicated Shopping Cart Flow APIs
// ==========================================

// 1. FETCH active cart from FakeStoreAPI and hydrate with product details
export const fetchActiveUserCart = async (userId = 2) => {
  let cartData = null

  if (userId) {
    try {
      const userCarts = await getCartsByUser(userId)
      if (Array.isArray(userCarts) && userCarts.length > 0) {
        cartData = userCarts[userCarts.length - 1]
      }
    } catch (error) {
      console.warn('Error fetching carts by user:', error)
    }
  }

  if (!cartData) {
    try {
      cartData = await getCartById(1)
    } catch {
      cartData = {
        id: 1,
        userId: userId || 2,
        date: new Date().toISOString(),
        products: [],
      }
    }
  }

  const enrichedItems = await enrichCartItems(cartData.products || [])

  return {
    cartId: cartData.id || 1,
    userId: cartData.userId || userId || 2,
    date: cartData.date || new Date().toISOString(),
    items: enrichedItems,
  }
}

// 2. ADD PRODUCT to Cart via FakeStore API (POST /carts or PUT /carts/:id)
export const addToCartApi = async ({ cartId, userId, product, quantity = 1, currentItems = [] }) => {
  const existingIndex = currentItems.findIndex((item) => item.productId === product.id)
  let updatedItems

  if (existingIndex >= 0) {
    updatedItems = currentItems.map((item, index) =>
      index === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
    )
  } else {
    updatedItems = [
      ...currentItems,
      {
        productId: product.id,
        quantity,
        title: product.title,
        price: Number(product.price) || 0,
        image: product.image || '',
        category: product.category || 'General',
        description: product.description || '',
      },
    ]
  }

  const payload = {
    userId: userId || 2,
    date: new Date().toISOString().slice(0, 10),
    products: updatedItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
  }

  let apiResult
  if (cartId) {
    apiResult = await updateCart(cartId, payload)
  } else {
    apiResult = await createCart(payload)
  }

  return {
    cartId: apiResult?.id || cartId || 1,
    items: updatedItems,
  }
}

// 3. INCREMENT item quantity via FakeStore API (PUT /carts/:id)
export const incrementItemApi = async ({ cartId, userId, productId, currentItems = [] }) => {
  const updatedItems = currentItems.map((item) =>
    item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
  )

  const payload = {
    userId: userId || 2,
    date: new Date().toISOString().slice(0, 10),
    products: updatedItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
  }

  const apiResult = await updateCart(cartId || 1, payload)

  return {
    cartId: apiResult?.id || cartId || 1,
    items: updatedItems,
  }
}

// 4. DECREMENT item quantity via FakeStore API (PUT /carts/:id)
export const decrementItemApi = async ({ cartId, userId, productId, currentItems = [] }) => {
  const updatedItems = currentItems
    .map((item) => (item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item))
    .filter((item) => item.quantity > 0)

  const payload = {
    userId: userId || 2,
    date: new Date().toISOString().slice(0, 10),
    products: updatedItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
  }

  const apiResult = await updateCart(cartId || 1, payload)

  return {
    cartId: apiResult?.id || cartId || 1,
    items: updatedItems,
  }
}

// 5. REMOVE item from Cart via FakeStore API (PUT /carts/:id)
export const removeItemApi = async ({ cartId, userId, productId, currentItems = [] }) => {
  const updatedItems = currentItems.filter((item) => item.productId !== productId)

  const payload = {
    userId: userId || 2,
    date: new Date().toISOString().slice(0, 10),
    products: updatedItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
  }

  const apiResult = await updateCart(cartId || 1, payload)

  return {
    cartId: apiResult?.id || cartId || 1,
    items: updatedItems,
  }
}

// 6. CLEAR Cart via FakeStore API (DELETE /carts/:id)
export const clearCartApi = async (cartId = 1) => {
  try {
    await deleteCart(cartId)
  } catch (err) {
    console.warn('API cart delete note:', err)
  }

  return {
    cartId,
    items: [],
  }
}
