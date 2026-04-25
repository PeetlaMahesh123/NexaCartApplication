import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ShoppingBag, 
  Zap, 
  ShieldCheck, 
  RefreshCw, 
  Star,
  Users,
  Package
} from 'lucide-react';
import ProductCard from '../../components/products/ProductCard';
import { supabase } from '../../lib/supabase';

const LandingPage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const features = [
    { icon: Zap, title: 'Speedy Delivery', desc: 'Get your orders in record time with our optimized logistics.', color: 'text-blue-400' },
    { icon: ShieldCheck, title: 'Secure Payment', desc: 'Bank-grade security ensures your transactions are always safe.', color: 'text-emerald-400' },
    { icon: RefreshCw, title: 'Easy Returns', desc: 'No questions asked 30-day return policy for ultimate peace of mind.', color: 'text-cyan-400' },
  ];

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(8);
      
      if (error) throw error;
      setFeaturedProducts(data || []);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center px-6 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -mr-64 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] -ml-48 -mb-24"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-secondary font-bold tracking-[0.3em] uppercase mb-4 block">Future of Shopping</span>
            <h1 className="text-5xl md:text-7xl font-display font-black text-white mb-6 leading-tight">
              Elevate Your <br />
              <span className="gradient-text">Lifestyle</span> in One Click.
            </h1>
            <p className="text-lg text-slate-400 mb-8 max-w-lg leading-relaxed">
              Experience a premium, fast, and secure e-commerce platform designed for the modern world. Shop excellence, delivered.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="gradient-button px-8 py-4 rounded-2xl flex items-center space-x-2 text-lg shadow-lg shadow-primary/20">
                <span>Start Shopping</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-4 rounded-2xl text-lg backdrop-blur-md transition-all duration-300">
                Join NexaCart
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="glass-card p-4 rotate-3 transform relative z-10 aspect-square max-w-md mx-auto">
               <img 
                 src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop" 
                 alt="Hero" 
                 className="w-full h-full object-cover rounded-xl"
                 referrerPolicy="no-referrer"
               />
               <div className="absolute -bottom-6 -left-6 glass px-6 py-4 rounded-2xl flex items-center space-x-3 shadow-xl">
                 <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                   <ShoppingBag className="text-white w-6 h-6" />
                 </div>
                 <div>
                   <p className="text-xs text-slate-400 capitalize">Real-time Sales</p>
                   <p className="font-bold text-white">+1,240 Today</p>
                 </div>
               </div>
            </div>
            {/* Shapes */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/30 rounded-2xl rotate-45 blur-xl"></div>
          </motion.div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-24 px-6 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="glass-card p-8 group hover:bg-slate-800 transition-colors"
              >
                <div className={`p-4 rounded-2xl bg-slate-800 w-fit mb-6 group-hover:bg-primary transition-colors ${f.color} group-hover:text-white`}>
                  <f.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-primary font-bold tracking-widest uppercase text-xs mb-2 block font-display">Admin Selection</span>
              <h2 className="text-4xl font-display font-black text-white italic">Featured Products</h2>
            </div>
            <Link to="/products" className="text-slate-400 hover:text-white flex items-center space-x-2 group">
              <span>View all products</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Featured Products Yet</h3>
              <p className="text-slate-400 mb-6">Admin hasn't added any featured products to the store.</p>
              <Link to="/products" className="text-primary hover:text-white transition-colors">
                Browse All Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 font-sans">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto glass-card p-12 md:p-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 relative z-10 text-center">
            <div>
              <p className="text-4xl md:text-5xl font-black text-white mb-2">500K+</p>
              <p className="text-slate-500 font-medium">Happy Customers</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-black text-white mb-2">24/7</p>
              <p className="text-slate-500 font-medium">Customer Support</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-black text-white mb-2">120+</p>
              <p className="text-slate-500 font-medium">Countries Reached</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-black text-white mb-2">4.9/5</p>
              <p className="text-slate-500 font-medium">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 mb-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-display font-black text-white mb-6">Ready to upgrade?</h2>
          <p className="text-xl text-slate-400 mb-10">Join thousands of businesses and individuals who trust NexaCart.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/register" className="gradient-button px-12 py-5 rounded-3xl text-xl w-full sm:w-auto text-center font-display shadow-xl shadow-primary/30 active:scale-95 transition-transform">
              Join Now
            </Link>
            <Link to="/products" className="bg-white/5 hover:bg-white/10 border border-white/10 px-12 py-5 rounded-3xl text-xl w-full sm:w-auto backdrop-blur-md transition-all duration-300">
              Browse Collection
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
