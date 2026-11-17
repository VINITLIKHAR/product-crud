import axiosInstance from '../api/axiosInstance.js'

// GET /products?limit=&sort=
export const getAllProducts = async (limit, sort) => {
  const { data } = await axiosInstance.get('/products', { params: { limit, sort } })
  return data
}

// GET /products/:id   (returns empty/null if the id does not exist)
export const getProductById = async (id) => {
  const { data } = await axiosInstance.get(`/products/${id}`)
  return data
}

// GET /products/categories
export const getCategories = async () => {
  const { data } = await axiosInstance.get('/products/categories')
  return data
}

// GET /products/category/:name?limit=&sort=
// encodeURIComponent makes "men's clothing" safe inside a URL.
export const getProductsByCategory = async (category, limit, sort) => {
  const { data } = await axiosInstance.get(
    `/products/category/${encodeURIComponent(category)}`,
    { params: { limit, sort } }
  )
  return data
}

// POST /products   → CREATE
export const createProduct = async (product) => {
  const { data } = await axiosInstance.post('/products', product)
  return data
}

// PUT /products/:id   → UPDATE (replace whole product / पूरा product बदलना)
export const updateProduct = async (id, product) => {
  const { data } = await axiosInstance.put(`/products/${id}`, product)
  return data
}

// PATCH /products/:id   → UPDATE (only some fields / सिर्फ़ कुछ fields)
export const patchProduct = async (id, changes) => {
  const { data } = await axiosInstance.patch(`/products/${id}`, changes)
  return data
}

// DELETE /products/:id   → DELETE
export const deleteProduct = async (id) => {
  const { data } = await axiosInstance.delete(`/products/${id}`)
  return data
}
