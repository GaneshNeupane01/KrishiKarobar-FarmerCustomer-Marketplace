import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './Login.jsx';
import Register from './Register.jsx';
import FarmerProfile from './FarmerProfile.jsx';
import CustomerProfile from './CustomerProfile.jsx';
import Products from './Products.jsx';
import FarmerDashboard from './FarmerDashboard.jsx';
import ProductDetails from './Components/ProductDetails.jsx';
import Cart from './Components/Cart.jsx';
import CustomerOrders from './Components/CustomerOrders.jsx';
import CustomerMessages from './Components/CustomerMessages.jsx';
import Notifications from './Components/FarmerDashboard/Notifications.jsx';
import Home from './Home.jsx';
import OurInventory from './OurInventory.jsx';
import About from './About.jsx';
import Contact from './Contact.jsx';
import Farmers from './Farmers.jsx';

function AppRoutes() {
  const { isAuthenticated, userType, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen text-emerald-700">Loading...</div>;
  return (
    <Routes>
      <Route 
        path="/farmer-profile" 
        element={isAuthenticated ? <FarmerProfile /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/customer-profile" 
        element={isAuthenticated ? <CustomerProfile /> : <Navigate to="/login" replace />} 
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Home />} />
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetails />} />
      <Route path='/dashboard' element={isAuthenticated && userType === 'farmer' ? <FarmerDashboard/> : <Navigate to="/customer-profile" replace />}/>
      <Route path="/cart" element={<Cart />} />
      <Route path="/my-orders" element={isAuthenticated ? <CustomerOrders /> : <Navigate to="/login" replace />} />
      <Route path="/messages" element={isAuthenticated ? <CustomerMessages /> : <Navigate to="/login" replace />} />
      {/* Email verification route removed */}
      <Route path="/notifications" element={isAuthenticated ? <Notifications /> : <Navigate to="/login" replace />} />
      <Route path="/inventory" element={<OurInventory />} />
      <Route path="/inventory/:id" element={<ProductDetails isInventory={true} />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/farmers" element={isAuthenticated && userType === 'customer' ? <Farmers /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppRoutes />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;