import React from 'react';
import { ShoppingCart, ExternalLink, Clock, PackageCheck } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

const AdminOrdersPage = () => {
  const { profile } = useAuthStore();
  const canManage = profile?.role === 'admin' || profile?.role === 'editor';

  const adminOrders = [
    { id: 'TX-90241', user: 'Chris Miller', items: 2, total: 1599.98, status: 'shipped', date: '2 mins ago' },
    { id: 'TX-90242', user: 'Sarah Connor', items: 1, total: 349.99, status: 'processing', date: '15 mins ago' },
    { id: 'TX-90243', user: 'James Bond', items: 5, total: 5499.00, status: 'pending', date: '1 hour ago' },
  ];

  return (
    <div className="space-y-8 font-sans">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-black text-white italic underline decoration-accent decoration-4 underline-offset-8 uppercase tracking-widest">Global Order Traffic</h1>
        <div className="flex items-center bg-slate-900 border border-white/5 rounded-xl overflow-hidden p-1">
          <button className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-lg">Active Flow</button>
          <button className="px-4 py-2 text-slate-500 text-xs font-bold hover:text-white transition-colors">Archived</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {adminOrders.map(order => (
          <div key={order.id} className="glass-card hover:border-primary/20 transition-all p-6 flex flex-col md:flex-row items-center justify-between group">
             <div className="flex items-center space-x-6">
                <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center border border-white/5">
                   <ShoppingCart className="text-primary w-6 h-6" />
                </div>
                <div>
                   <div className="flex items-center space-x-3 mb-1">
                      <span className="text-sm font-mono font-bold text-slate-500">#{order.id}</span>
                      <h3 className="text-lg font-bold text-white">{order.user}</h3>
                   </div>
                   <div className="flex items-center space-x-4 text-xs text-slate-500 italic">
                      <div className="flex items-center space-x-1">
                         <Clock className="w-3 h-3" />
                         <span>Logged {order.date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                         <PackageCheck className="w-3 h-3" />
                         <span>{order.items} Items Encrypted</span>
                      </div>
                   </div>
                </div>
             </div>

             <div className="flex items-center space-x-12 mt-6 md:mt-0">
                <div className="text-right">
                   <p className="text-sm text-slate-500 uppercase tracking-widest font-black mb-1">Nexus Credit</p>
                   <p className="text-2xl font-black gradient-text">${order.total}</p>
                </div>
                <div className="flex flex-col items-end space-y-3">
                   <select 
                     disabled={!canManage}
                     className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border focus:outline-none cursor-pointer transition-all ${
                       !canManage ? 'opacity-50 cursor-not-allowed' : ''
                     } ${
                       order.status === 'shipped' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                       order.status === 'processing' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                       'bg-slate-800 text-slate-400 border-white/5'
                     }`}
                     defaultValue={order.status}
                   >
                     <option value="pending">Pending Auth</option>
                     <option value="processing">Processing</option>
                     <option value="shipped">In Transit</option>
                     <option value="delivered">Liquidated</option>
                   </select>
                   <button className="flex items-center space-x-1 text-slate-500 hover:text-white transition-colors text-[10px] uppercase font-bold tracking-widest">
                      <span>View Payload</span>
                      <ExternalLink className="w-3 h-3" />
                   </button>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOrdersPage;
