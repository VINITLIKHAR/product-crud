import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import ProductForm from '../components/ProductForm'
import { editProduct, fetchProductById } from '../redux/productSlice'

function EditProduct() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { current: product, loading, error } = useSelector((state) => state.products)

  useEffect(() => {
    dispatch(fetchProductById(id))
  }, [dispatch, id])

  const handleUpdate = async (data) => {
    try {
      await dispatch(editProduct({ id, product: data })).unwrap()
      toast.success('Product updated')
      navigate(`/products/${id}`)
    } catch (message) {
      toast.error(message)
    }
  }

  if (loading) return <p className="text-stone-500">Loading product...</p>
  if (error) return (
    <p className="text-red-700">{error} <Link to="/products" className="underline">Back</Link></p>
  )
  if (!product) return null

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-4 text-2xl font-bold">Edit product #{id}</h1>
      {/* key={product.id} makes the form restart with the right values for each product */}
      <ProductForm key={product.id} initialValues={product} onSubmit={handleUpdate} submitLabel="Save changes" />
    </div>
  )
}

export default EditProduct
