import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import MainLayout from '../components/MainLayout'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Products from '../pages/Products'
import ProductDetail from '../pages/ProductDetail'
import AddProduct from '../pages/AddProduct'
import EditProduct from '../pages/EditProduct'
import Carts from '../pages/Carts'
import Users from '../pages/Users'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/new" element={<AddProduct />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/products/:id/edit" element={<EditProduct />} />
          <Route path="/cart" element={<Carts />} />
          <Route path="/carts" element={<Carts />} />
          <Route path="/users" element={<Users />} />
        </Route>
      </Route>

      <Route path="*" element={<p className="p-10 text-center">404 – Page not found</p>} />
    </Routes>
  )
}

export default AppRoutes
