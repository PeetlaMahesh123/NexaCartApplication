import React, { useState, useEffect } from 'react';
import { Package, MoreVertical, Edit2, Trash2, Plus, Search, Filter, X, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  stock: number;
  price: number;
  category: string;
  image_url?: string;
  description?: string;
  is_featured: boolean;
}

const InventoryPage = () => {
  const { profile } = useAuthStore();
  const canManage = profile?.role === 'admin' || profile?.role === 'editor';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    description: '',
    image_url: '',
    is_featured: false
  });

  const categories = ['Electronics', 'Audio', 'Wearables', 'Gaming', 'Accessories', 'Other'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category,
        description: formData.description,
        image_url: formData.image_url || null,
        is_featured: formData.is_featured
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        
        if (error) throw error;
        toast.success('Product updated successfully!');
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);
        
        if (error) throw error;
        toast.success('Product added successfully!');
      }

      fetchProducts();
      resetForm();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Product deleted successfully!');
      fetchProducts();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      stock: '',
      category: '',
      description: '',
      image_url: '',
      is_featured: false
    });
    setEditingProduct(null);
    setShowAddModal(false);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category,
      description: product.description || '',
      image_url: product.image_url || '',
      is_featured: product.is_featured
    });
    setShowAddModal(true);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return 'Out of Stock';
    if (stock <= 5) return 'Low Stock';
    return 'In Stock';
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-black text-white italic underline decoration-secondary decoration-4 underline-offset-8 uppercase tracking-widest">Vault Inventory</h1>
        {canManage && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="gradient-button px-6 py-3 rounded-xl flex items-center space-x-2 font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Product</span>
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900 p-4 rounded-2xl border border-white/5">
        <div className="relative flex-grow max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search products by name or category..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-white/5 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-primary/40" 
          />
        </div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 text-sm transition-colors">
            <Filter className="w-4 h-4" />
            <span>Categories</span>
          </button>
          <div className="text-sm font-bold text-slate-500">
            Showing {filteredProducts.length} Products
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-900/80 text-[10px] uppercase font-black tracking-[0.2em] text-slate-500">
              <th className="px-8 py-5">Artifact Node</th>
              <th className="px-8 py-5">Classification</th>
              <th className="px-8 py-5">Credit Value</th>
              <th className="px-8 py-5">Current Depth (Stock)</th>
              <th className="px-8 py-5">Condition</th>
              <th className="px-8 py-5">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center space-x-4">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                        <Package className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <span className="text-sm font-bold text-white uppercase tracking-tight">{product.name}</span>
                      {product.is_featured && (
                        <span className="ml-2 px-2 py-0.5 bg-primary/20 text-primary text-[8px] rounded-full font-black">FEATURED</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-sm text-slate-400 italic">{product.category}</td>
                <td className="px-8 py-6 text-sm font-black text-white">${product.price}</td>
                <td className="px-8 py-6">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-mono text-white">{product.stock}</span>
                    <div className="flex-grow max-w-[80px] h-1.5 bg-slate-800 rounded-full overflow-hidden">
                       <div 
                         className={`h-full ${product.stock > 10 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-yellow-500' : 'bg-error'}`} 
                         style={{ width: `${Math.min(100, (product.stock / 20) * 100)}%` }}
                       ></div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                   <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                     getStockStatus(product.stock) === 'In Stock' ? 'bg-emerald-500/10 text-emerald-500' :
                     getStockStatus(product.stock) === 'Low Stock' ? 'bg-yellow-500/10 text-yellow-500' :
                     'bg-error/10 text-error'
                   }`}>
                     {getStockStatus(product.stock)}
                   </span>
                </td>
                <td className="px-8 py-6 text-right">
                   <div className="flex items-center space-x-2">
                      {canManage && (
                        <>
                          <button 
                            onClick={() => openEditModal(product)}
                            className="p-2 hover:bg-primary/20 hover:text-primary rounded-lg transition-colors text-slate-500"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(product.id)}
                            className="p-2 hover:bg-error/20 hover:text-error rounded-lg transition-colors text-slate-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-500">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button 
                  onClick={resetForm}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Product Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Stock Quantity</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                      placeholder="0"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/40 h-24 resize-none"
                    placeholder="Enter product description"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Image URL</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 rounded border-white/10 bg-slate-950 accent-primary"
                  />
                  <label htmlFor="featured" className="text-sm text-slate-400">
                    Mark as featured product
                  </label>
                </div>
                <div className="flex items-center space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 gradient-button py-3 rounded-xl flex items-center justify-center space-x-2 font-bold shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>{editingProduct ? 'Update Product' : 'Add Product'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
