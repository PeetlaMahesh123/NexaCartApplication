import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { useAuthStore } from './store/useAuthStore';
import { useCartStore } from './store/useCartStore';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { AlertTriangle, ExternalLink, X, RefreshCw } from 'lucide-react';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import ProductsPage from './pages/public/ProductsPage';
import ProductDetail from './pages/public/ProductDetail';
import CartPage from './pages/public/CartPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import CheckoutPage from './pages/user/CheckoutPage';
import OrdersPage from './pages/user/OrdersPage';
import PaymentSuccess from './pages/user/PaymentSuccess';
import ProfileEditPage from './pages/user/ProfileEditPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import InventoryPage from './pages/admin/InventoryPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import UserManagementPage from './pages/admin/UserManagementPage';

const ProtectedRoute = ({ children, adminOnly = false, requireVerification = false }: { children: React.ReactNode, adminOnly?: boolean, requireVerification?: boolean }) => {
  const { user, profile, loading, lastUpdated } = useAuthStore();
  const location = useLocation();
  
  console.log('ProtectedRoute - Auth state:', { 
    user: !!user, 
    profile: !!profile, 
    loading, 
    lastUpdated,
    currentPath: location.pathname
  });
  
  // Show loading while auth is being initialized
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If no user, redirect to login with return URL
  if (!user) {
    console.log('No user found, redirecting to login');
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // Check admin role if required
  if (adminOnly && profile?.role !== 'admin') {
    console.log('Admin access required but user is not admin');
    return <Navigate to="/" replace />;
  }

  // Check email verification if required
  if (requireVerification && !profile?.email_verified) {
    console.log('Email verification required but not verified');
    return <Navigate to="/dashboard" replace />;
  }
  
  console.log('User authenticated, rendering protected content');
  return <>{children}</>;
};

function App() {
  const { user, profile, loading, initialize, signOut } = useAuthStore();
  const { clearCartStorage } = useCartStore();
  const [showConfigBanner, setShowConfigBanner] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    // Clear any existing cart with invalid IDs on app start
    clearCartStorage();
    
    // Initialize auth state
    initialize();

    // Check Supabase configuration and set up auth listener
    const checkConfig = async () => {
      try {
        const configured = isSupabaseConfigured;
        if (!configured) {
          setConfigError('Supabase environment variables are not configured');
          setShowConfigBanner(true);
        }
      } catch (error) {
        setConfigError('Failed to check Supabase configuration');
        setShowConfigBanner(true);
      }
    };

    checkConfig();

    // Listen for auth state changes only if supabase is configured
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (event === 'SIGNED_OUT') {
            clearCartStorage();
          }
        }
      );

      return () => subscription.unsubscribe();
    }
  }, [initialize, clearCartStorage]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155',
            },
          }}
        />

        {/* Configuration Banner */}
        {showConfigBanner && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-500">Configuration Required</h3>
                  <p className="text-sm text-yellow-600">{configError}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.location.reload()}
                  className="text-yellow-500 hover:text-yellow-400"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowConfigBanner(false)}
                  className="text-yellow-500 hover:text-yellow-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        <Routes>
          {/* Public Routes with MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* User Protected Routes */}
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
            <Route path="/profile/edit" element={<ProtectedRoute><ProfileEditPage /></ProtectedRoute>} />
          </Route>

          {/* Admin Routes with AdminLayout */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="users" element={<UserManagementPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
