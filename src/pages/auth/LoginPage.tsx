import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowRight, Github } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, loading } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log('Starting login process...');
      await signIn(email, password);
      toast.success('Logged in successfully!');
      
      console.log('Login successful, navigating to dashboard...');
      
      // Get the intended destination from location state or default to dashboard
      const from = (location.state as any)?.from || '/dashboard';
      
      // Force a small delay to ensure auth state is fully updated
      setTimeout(() => {
        console.log('Navigating to:', from);
        navigate(from, { replace: true });
      }, 300);
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // For now, just show a message since OAuth requires more setup
      toast.error('Google login not available in demo mode');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Bg elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-md p-8 relative z-10"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-display font-black text-white mb-2">Welcome Back</h2>
          <p className="text-slate-400">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-12 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="email@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-12 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="********"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <label className="flex items-center space-x-2 text-sm text-slate-400 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-slate-950 accent-primary" />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" name="forgot-password" className="text-sm text-primary hover:text-white transition-colors">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-button py-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              <>
                <span className="font-bold">Sign In</span>
                <LogIn className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-900 px-2 text-slate-500 font-bold">Or continue with</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleGoogleLogin}
              className="flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl transition-colors"
            >
              {/* Note: In real app you might use an SVG Google icon */}
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100" />
              <span className="text-sm font-medium">Google</span>
            </button>
            <button className="flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl transition-colors">
              <Github className="w-5 h-5" />
              <span className="text-sm font-medium">GitHub</span>
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-bold hover:underline">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
