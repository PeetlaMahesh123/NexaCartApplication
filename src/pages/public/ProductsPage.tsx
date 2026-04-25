import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Grid, 
  List as ListIcon, 
  ChevronDown,
  Star,
  Banknote,
  Box,
  X as CloseIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import ProductCard from '../../components/products/ProductCard';

const ProductsPage = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>(['All']);
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  
  // Advanced Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('categories').select('name');
      if (data) {
        setCategories(['All', ...data.map(c => c.name)]);
      }
    } catch (err) {
      console.error('Error fetching categories');
      setCategories(['All', 'Electronics', 'Fashion', 'Home', 'Accessories']);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Use join to get category name
      let query = supabase.from('products').select('*, categories(name)');
      
      const { data, error } = await query;
      if (data) {
        // Flatten the data to match expected structure
        const flattenedData = data.map(p => ({
          ...p,
          category: p.categories?.name || 'Uncategorized'
        }));
        setProducts(flattenedData);
      } else {
        // No fallback data - show empty state if DB is empty
        console.log('No products found in database');
        setProducts([]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || p.category === category;
    const matchesPrice = p.price >= minPrice && p.price <= maxPrice;
    const matchesStock = !onlyInStock || p.stock > 0;
    const matchesRating = p.rating >= minRating;
    
    return matchesSearch && matchesCategory && matchesPrice && matchesStock && matchesRating;
  });

  const resetFilters = () => {
    setSearch('');
    setCategory('All');
    setMinPrice(0);
    setMaxPrice(5000);
    setOnlyInStock(false);
    setMinRating(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col mb-12">
        <h1 className="text-4xl font-display font-black text-white italic mb-8">Our Library</h1>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Search and Main Filters */}
          <div className="flex-grow flex flex-col md:flex-row gap-4">
            <div className="relative group flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search products by name or tag..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-sans"
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative group min-w-[160px]">
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="appearance-none w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 pr-12 text-white font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-hover:text-primary transition-colors" />
              </div>

              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-6 py-4 rounded-2xl border transition-all font-bold ${
                  showFilters 
                  ? 'bg-primary border-primary text-white' 
                  : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <Filter className="w-5 h-5" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4 ml-auto">
            <div className="bg-slate-900 border border-white/10 rounded-2xl flex p-1 h-full items-center">
              <button 
                onClick={() => setViewType('grid')}
                className={`p-3 rounded-xl transition-all ${viewType === 'grid' ? 'bg-primary text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setViewType('list')}
                className={`p-3 rounded-xl transition-all ${viewType === 'list' ? 'bg-primary text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <ListIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-6 p-8 bg-slate-900/50 border border-white/5 rounded-3xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Price Filter */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Banknote className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-widest">Price Spectrum</span>
                  </div>
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-grow">
                        <label className="text-[10px] text-slate-500 uppercase mb-1 block">Min</label>
                        <input 
                          type="number" 
                          value={minPrice}
                          onChange={(e) => setMinPrice(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                        />
                      </div>
                      <div className="flex-grow">
                        <label className="text-[10px] text-slate-500 uppercase mb-1 block">Max</label>
                        <input 
                          type="number" 
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                        />
                      </div>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="5000" 
                      step="100"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full accent-primary h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Rating Filter */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Star className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-widest">Rating Tier</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[0, 2, 3, 4, 4.5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setMinRating(rating)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                          minRating === rating 
                          ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                          : 'bg-slate-950 border-white/5 text-slate-500 hover:text-white'
                        }`}
                      >
                        {rating === 0 ? 'All Ratings' : `${rating}+ Stars`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stock Filter */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Box className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-widest">Availability</span>
                  </div>
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <div 
                      onClick={() => setOnlyInStock(!onlyInStock)}
                      className={`w-12 h-6 rounded-full transition-all relative ${onlyInStock ? 'bg-primary' : 'bg-slate-800'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${onlyInStock ? 'left-7' : 'left-1'}`} />
                    </div>
                    <span className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors italic">In Stock Only</span>
                  </label>
                </div>

                {/* Reset Filter Component */}
                <div className="flex items-end justify-end">
                   <button 
                     onClick={resetFilters}
                     className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-error hover:text-red-400 transition-colors py-2"
                   >
                     <CloseIcon className="w-4 h-4" />
                     <span>Clear Matrix</span>
                   </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
             <div key={i} className="glass-card aspect-[4/5] animate-pulse bg-slate-800/50 rounded-2xl"></div>
          ))}
        </div>
      ) : (
        <>
          {filteredProducts.length > 0 ? (
            <div className={viewType === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              : "flex flex-col space-y-4"
            }>
              <AnimatePresence>
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-24 glass-card">
               <SlidersHorizontal className="w-16 h-16 text-slate-700 mx-auto mb-6" />
               <h3 className="text-2xl font-bold text-white mb-2">No matching products found</h3>
               <p className="text-slate-500">Try adjusting your filters or search keywords.</p>
               <button 
                 onClick={resetFilters}
                 className="mt-6 text-primary hover:underline font-bold"
               >
                 Reset all filters
               </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductsPage;
