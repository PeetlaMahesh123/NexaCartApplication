import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Eye, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../store/useCartStore';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  rating?: number;
  reviews_count?: number;
}

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addItem } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="glass-card overflow-hidden group h-full flex flex-col"
    >
      <Link to={`/products/${product.id}`} className="block flex-grow">
        <div className="relative aspect-square overflow-hidden bg-slate-800">
          <img 
            src={product.image_url || 'https://picsum.photos/seed/product/400/400'} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
            <button className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-primary transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
              <Heart className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-secondary transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 delay-75">
              <Eye className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5 flex flex-col flex-grow">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest bg-accent/10 px-2 py-0.5 rounded">
              New Arrival
            </span>
            <div className="flex items-center text-yellow-400 text-xs">
              <Star className="w-3 h-3 fill-current mr-1" />
              <span>{product.rating || '4.5'}</span>
            </div>
          </div>
          
          <h3 className="text-lg font-display font-bold text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-slate-400 mb-4 line-clamp-2 italic">
            {product.description}
          </p>
          
          <div className="mt-auto flex items-center justify-between">
            <span className="text-xl font-bold gradient-text">${product.price.toFixed(2)}</span>
            <button 
              onClick={handleAddToCart}
              className="p-3 bg-white/5 hover:bg-primary text-white rounded-xl transition-all duration-300 group/btn"
            >
              <ShoppingCart className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
