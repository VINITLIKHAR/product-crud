import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import ProductForm from '../components/ProductForm'
import { addProduct } from '../redux/productSlice'

function AddProduct() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleCreate = async (data) => {
    try {
      const created = await dispatch(addProduct(data)).unwrap()
      toast.success('Product created')
      navigate(`/products/${created.id}`)
    } catch (message) {
      toast.error(message)
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-4 text-2xl font-bold">Add product</h1>
      <ProductForm onSubmit={handleCreate} submitLabel="Create product" />
    </div>
  )
}

export default AddProduct
