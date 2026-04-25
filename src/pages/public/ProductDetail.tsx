import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Heart, 
  ArrowLeft, 
  Star, 
  ShieldCheck, 
  Truck, 
  RefreshCw,
  Zap,
  Share2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useCartStore } from '../../store/useCartStore';
import toast from 'react-hot-toast';
import ProductCard from '../../components/products/ProductCard';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (data) setProduct(data);
      else {
        // Mock fallback
        setProduct({
          id,
          name: 'Nexa Pro Laptop v2',
          description: 'The pinnacle of mobile computing. The Nexa Pro Laptop features a titanium-grade chassis, 120Hz OLED display, and a neuro-processing unit designed for the speed of thought. Perfect for creators, developers, and visionaries.',
          price: 1499.99,
          image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=2071&auto=format&fit=crop',
          rating: 4.9,
          stock: 12,
          category: 'Electronics'
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    toast.success(`Added ${quantity} ${product.name} to cart`);
  };

  if (loading) return (
    <div className="h-[80vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 font-sans">
      <Link to="/products" className="flex items-center space-x-2 text-slate-500 hover:text-white mb-8 group transition-colors italic text-sm">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Collection</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
        {/* Product Image */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative"
        >
          <div className="sticky top-28">
            <div className="glass-card p-4 aspect-square rounded-[2rem] overflow-hidden">
               <img 
                 src={product.image_url} 
                 alt={product.name}
                 className="w-full h-full object-cover rounded-2xl"
                 referrerPolicy="no-referrer"
               />
            </div>
            {/* Gallery Thumbnails */}
            <div className="flex gap-4 mt-6">
               {[1, 2, 3].map((i) => (
                 <div key={i} className="w-20 h-20 glass-card p-1 rounded-xl cursor-pointer hover:border-primary transition-all">
                    <img src={product.image_url} alt="" className="w-full h-full object-cover rounded-lg" />
                 </div>
               ))}
            </div>
          </div>
        </motion.div>

        {/* Product Info */}
        <motion.div
           initial={{ opacity: 0, x: 50 }}
           animate={{ opacity: 1, x: 0 }}
           className="space-y-8"
        >
          <div>
            <div className="flex items-center space-x-4 mb-4">
               <span className="bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-primary/20">
                 {product.category || 'Premium'}
               </span>
               <div className="flex items-center text-yellow-400">
                  <Star className="w-4 h-4 fill-current mr-1" />
                  <span className="text-sm font-bold">{product.rating}</span>
                  <span className="text-slate-500 text-xs ml-2">(124 Customer Reviews)</span>
               </div>
            </div>
            <h1 className="text-5xl font-display font-black text-white leading-tight mb-4">{product.name}</h1>
            <p className="text-4xl font-black gradient-text">${product.price.toLocaleString()}</p>
          </div>

          <p className="text-lg text-slate-400 leading-relaxed italic">
            {product.description}
          </p>

          {/* Configuration */}
          <div className="space-y-6 pt-6 border-t border-white/5">
             <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Quantity Selector</label>
                <div className="flex items-center space-x-6">
                   <div className="flex items-center bg-slate-900 border border-white/10 rounded-2xl p-2 h-14">
                      <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-full flex items-center justify-center text-slate-400 hover:text-white transition-colors">-</button>
                      <span className="w-12 text-center font-black text-white text-lg">{quantity}</span>
                      <button onClick={() => setQuantity(q => q + 1)} className="w-10 h-full flex items-center justify-center text-slate-400 hover:text-white transition-colors">+</button>
                   </div>
                   <div className="text-sm">
                      <p className="text-white font-bold">{product.stock} items remaining</p>
                      <p className="text-slate-500">Fast restocking in 2 days</p>
                   </div>
                </div>
             </div>

             <div className="flex gap-4">
                <button 
                  onClick={handleAddToCart}
                  className="flex-grow gradient-button h-16 rounded-3xl flex items-center justify-center space-x-3 text-lg font-black tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all"
                >
                  <ShoppingCart className="w-6 h-6" />
                  <span>ADD TO HAUL</span>
                </button>
                <button className="w-16 h-16 flex items-center justify-center glass-card border-none hover:bg-white/10 transition-colors">
                   <Heart className="w-6 h-6 text-slate-400" />
                </button>
                <button className="w-16 h-16 flex items-center justify-center glass-card border-none hover:bg-white/10 transition-colors">
                   <Share2 className="w-6 h-6 text-slate-400" />
                </button>
             </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 gap-4 pt-8">
             <div className="flex items-center space-x-3 p-4 glass-card border-none bg-white/5">
                <Truck className="text-cyan-400 w-6 h-6" />
                <div>
                   <p className="text-white font-bold text-sm">Global Nexus</p>
                   <p className="text-[10px] text-slate-500 uppercase">Worldwide Shipping</p>
                </div>
             </div>
             <div className="flex items-center space-x-3 p-4 glass-card border-none bg-white/5">
                <ShieldCheck className="text-emerald-400 w-6 h-6" />
                <div>
                   <p className="text-white font-bold text-sm">Ironclad Secure</p>
                   <p className="text-[10px] text-slate-500 uppercase">Encrypted Payments</p>
                </div>
             </div>
          </div>
        </motion.div>
      </div>

      {/* AI Recommendations Section */}
      <section className="pt-24 border-t border-white/5">
         <div className="flex items-center justify-between mb-12">
            <div>
               <div className="flex items-center space-x-2 text-primary font-bold tracking-widest uppercase text-[10px] mb-2 font-display">
                  <Zap className="w-3 h-3 fill-current" />
                  <span>Powered by Gemini AI</span>
               </div>
               <h2 className="text-3xl font-display font-black text-white italic">Smart Recommendations</h2>
            </div>
         </div>
         
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
               <ProductCard key={i} product={{
                  id: `rec-${i}`,
                  name: `AI Pick: Tech Series ${i}`,
                  description: 'Chosen for you based on the Nexa Pro Laptop.',
                  price: 49.99 * i,
                  image_url: `https://picsum.photos/seed/rec-${i}/400/400`,
                  rating: 4.8
               } as any} />
            ))}
         </div>
      </section>
    </div>
  );
};

export default ProductDetail;
