import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) throw error;
      
      toast.success('Registration successful! Please check your email.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] -mr-32 -mt-32"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-md p-8 relative z-10"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-display font-black text-white mb-2 italic">Initiate Protocol</h2>
          <p className="text-slate-400">Join the NexaCart ecosystem today.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Identity Signal (Full Name)</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-secondary transition-colors" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-12 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all font-sans"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Global Address (Email)</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-primary transition-colors" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-12 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-sans"
                placeholder="email@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Crypto Key (Password)</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-accent transition-colors" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-12 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all font-sans"
                placeholder="Min. 8 characters"
                required
              />
            </div>
          </div>

          <div className="bg-white/5 p-4 rounded-xl text-xs text-slate-500 italic leading-relaxed border border-white/5">
            By initializing your node, you agree to our System Terms and Protocol Privacy Guidelines. 
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-button py-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-primary/20 disabled:opacity-50 font-display font-black tracking-widest"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              <>
                <span>REGISTER NODE</span>
                <UserPlus className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-400 font-sans">
          Already verified?{' '}
          <Link to="/login" className="text-secondary font-bold hover:underline italic">
            Access Port
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
