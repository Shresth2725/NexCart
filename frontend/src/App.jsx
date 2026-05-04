import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import AuthPage from './pages/auth/AuthPage';
import CustomerHome from './pages/customer/Home';
import ProductDetail from './pages/customer/ProductDetail';
import Cart from './pages/customer/Cart';
import Settings from './pages/customer/Settings';
import Orders from './pages/customer/Orders';
import SellerDashboard from './pages/seller/Dashboard';
import AdminPortal from './pages/admin/Portal';

const RootRedirect = () => {
  const { user, role, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  
  if (role === 'admin') return <Navigate to="/admin" replace />;
  if (role === 'seller') return <Navigate to="/seller" replace />;
  return <Navigate to="/home" replace />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Root Redirect Route */}
          <Route path="/" element={<RootRedirect />} />

          {/* Customer Routes */}
          <Route 
            path="/home" 
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerHome />
              </ProtectedRoute>
            } 
          />

          {/* Product Detail */}
          <Route 
            path="/product/:id" 
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <ProductDetail />
              </ProtectedRoute>
            } 
          />

          {/* Cart */}
          <Route 
            path="/cart" 
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <Cart />
              </ProtectedRoute>
            } 
          />

          {/* Settings */}
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <Settings />
              </ProtectedRoute>
            } 
          />

          {/* Orders */}
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <Orders />
              </ProtectedRoute>
            } 
          />

          {/* Seller Routes */}
          <Route 
            path="/seller" 
            element={
              <ProtectedRoute allowedRoles={['seller']}>
                <SellerDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPortal />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
