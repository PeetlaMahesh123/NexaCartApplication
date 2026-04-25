import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabase';
import { Users, Package, ShoppingCart, TrendingUp, DollarSign, Activity, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*');

        if (error) throw error;
        setUsers(data || []);
      } catch (err) {
        console.error(err);
        setUsers([]); // Ensure empty array on error
      }
    };

    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*');

        if (error) throw error;
        setOrders(data || []);
      } catch (err) {
        console.error(err);
        setOrders([]); // Ensure empty array on error
      }
    };

    const fetchTopProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('order_items')
          .select(`quantity, products(name)`);

        if (error) throw error;

        const stats: Record<string, number> = {};
        
        // Add null check for data
        if (data && Array.isArray(data)) {
          data.forEach((item: any) => {
            const name = item.products?.name || 'Unknown';
            stats[name] = (stats[name] || 0) + item.quantity;
          });
        }

        const sorted = Object.entries(stats)
          .map(([name, total]) => ({ name, total }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 5);

        setTopProducts(sorted);
      } catch (err) {
        console.error(err);
        // Set empty array on error to prevent map errors
        setTopProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
    fetchOrders();
    fetchTopProducts();
  }, []);

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-6">
        <div className="sleek-stat-card flex justify-between">
          <div>
            <Users className="text-primary" />
            <p>{users.length} Users</p>
          </div>
          <div>
            <ShoppingCart className="text-primary" />
            <p>{orders.length} Orders</p>
          </div>
        </div>

        <div className="sleek-stat-card">
          <DollarSign className="text-accent" />
          <p>
            $
            {orders
              .reduce((sum, o) => sum + (o.total_price || 0), 0)
              .toLocaleString()}
          </p>
        </div>
      </div>

      {/* Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="sleek-container">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="text-primary" />
            Top Products
          </h2>

          <div className="h-[280px] flex flex-col space-y-2">
            {topProducts && topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div
                  key={index}
                  className="flex justify-between p-2 bg-slate-900/50 rounded"
                >
                  <span>{product.name}</span>
                  <span className="text-primary">{product.total}</span>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-slate-400">No products sold yet</div>
              </div>
            )}

            {topProducts && topProducts.length > 0 && (
              <button className="text-primary text-sm hover:underline mt-2">
                View all
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-xs uppercase">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Product</th>
                <th className="px-4 py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((i) => (
                <tr key={i}>
                  <td className="px-4 py-2">#{i}</td>
                  <td className="px-4 py-2">Customer {i}</td>
                  <td className="px-4 py-2">Product {i}</td>
                  <td className="px-4 py-2">$100</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;