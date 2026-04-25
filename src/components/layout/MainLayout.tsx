import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LogOut, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';

const Navbar = () => {
  const { user, profile, signOut } = useAuthStore();
  const { items } = useCartStore();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const navigate = useNavigate();

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
            <Package className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-display font-bold gradient-text">NexaCart</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/products" className="text-slate-300 hover:text-white transition-colors">Products</Link>
          {profile?.role === 'admin' && (
            <Link to="/admin" className="text-accent hover:text-emerald-400 font-medium transition-colors">Admin Dashboard</Link>
          )}
          <Link to="/cart" className="relative group">
            <ShoppingCart className="text-slate-300 group-hover:text-white transition-colors w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-background">
                {cartCount}
              </span>
            )}
          </Link>
          
          {user ? (
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
                <span className="text-sm font-medium">{profile?.full_name || 'My Profile'}</span>
              </Link>
              <button 
                onClick={handleSignOut}
                className="p-2 text-slate-400 hover:text-error transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="gradient-button px-6 py-2 rounded-full text-sm">
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button 
          className="md:hidden text-slate-300"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-slate-900 border-b border-white/10 p-6 md:hidden"
          >
            <div className="flex flex-col space-y-4">
              <Link to="/products" className="text-slate-300 py-2" onClick={() => setIsMenuOpen(false)}>Products</Link>
              <Link to="/cart" className="text-slate-300 py-2 flex items-center" onClick={() => setIsMenuOpen(false)}>
                Cart ({cartCount})
              </Link>
              {user ? (
                <>
                  <Link to="/dashboard" className="text-slate-300 py-2" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                  {profile?.role === 'admin' && (
                    <Link to="/admin" className="text-accent py-2" onClick={() => setIsMenuOpen(false)}>Admin Panel</Link>
                  )}
                  <button onClick={handleSignOut} className="text-error text-left py-2">Sign Out</button>
                </>
              ) : (
                <Link to="/login" className="gradient-button px-6 py-2 rounded-full text-center" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-slate-950 border-t border-white/5 py-12 px-6">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
      <div className="col-span-1 md:col-span-2">
        <Link to="/" className="flex items-center space-x-2 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
            <Package className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-display font-bold gradient-text">NexaCart</span>
        </Link>
        <p className="text-slate-400 max-w-sm mb-6">
          The ultimate platform for modern e-commerce and business management. Scaling your business has never been this smooth.
        </p>
      </div>
      <div>
        <h4 className="text-white font-bold mb-6">Shop</h4>
        <ul className="space-y-4 text-slate-400">
          <li><Link to="/products" className="hover:text-primary transition-colors">All Products</Link></li>
          <li><Link to="/products?category=electronics" className="hover:text-primary transition-colors">Electronics</Link></li>
          <li><Link to="/products?category=fashion" className="hover:text-primary transition-colors">Fashion</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-bold mb-6">Company</h4>
        <ul className="space-y-4 text-slate-400">
          <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
          <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
          <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 text-center text-slate-500 text-sm">
      © {new Date().getFullYear()} NexaCart. All rights reserved.
    </div>
  </footer>
);

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col pt-20">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
