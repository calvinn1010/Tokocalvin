import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Instruments from './pages/Instruments';
import Rentals from './pages/Rentals';
import Users from './pages/Users';
import Fines from './pages/Fines';
import Cart from './pages/Cart';

// Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/instruments"
            element={
              <ProtectedRoute>
                <Instruments />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/rentals"
            element={
              <ProtectedRoute>
                <Rentals />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/users"
            element={
              <ProtectedRoute roles={['admin']}>
                <Users />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/fines"
            element={
              <ProtectedRoute roles={['admin', 'petugas']}>
                <Fines />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/cart"
            element={<Cart />}
          />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
