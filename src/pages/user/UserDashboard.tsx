import React from 'react';
import { 
  Package, 
  MapPin, 
  User, 
  Settings, 
  Heart, 
  Star,
  Clock,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';

const UserDashboard = () => {
  const { profile } = useAuthStore();

  const recentOrders = [
    { id: '1024', date: 'Oct 12, 2023', total: 1299.99, status: 'delivered' },
    { id: '1025', date: 'Oct 15, 2023', total: 299.99, status: 'shipped' },
    { id: '1026', date: 'Oct 20, 2023', total: 349.99, status: 'processing' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Profile Sidebar */}
        <div className="lg:col-span-1 space-y-8">
           <div className="glass-card p-8 text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full blur-3xl -mr-12 -mt-12"></div>
             <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-primary mx-auto mb-6 p-1 overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <User className="w-full h-full text-slate-600 p-4" />
                )}
             </div>
             <h2 className="text-xl font-bold text-white mb-1">{profile?.full_name || 'Protocol User'}</h2>
             <p className="text-xs text-slate-500 uppercase tracking-widest font-mono mb-2">User Node ID: {profile?.id?.slice(0, 8) || '000000'}</p>
             
             <div className="flex items-center justify-center mb-6">
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter border ${
                  profile?.email_verified 
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                }`}>
                  {profile?.email_verified ? 'Identity Verified' : 'Verification Pending'}
                </span>
             </div>

             <Link to="/profile/edit" className="block w-full bg-white/5 hover:bg-white/10 p-3 rounded-xl text-sm font-bold text-slate-300 transition-colors border border-white/5">
                Modify Profile
             </Link>
           </div>

           <nav className="glass-card p-4 space-y-1">
              {[
                { icon: Package, label: 'Order History', active: true },
                { icon: MapPin, label: 'Saved Locations', active: false },
                { icon: Heart, label: 'Digital Wishlist', active: false },
                { icon: Star, label: 'My Reviews', active: false },
                { icon: Settings, label: 'Nexus Settings', active: false },
              ].map((item, idx) => (
                <button 
                  key={idx}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors group ${item.active ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-5 h-5" />
                    <span className="font-bold text-sm">{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
           </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-8">
           <div className="glass-card p-10 bg-gradient-to-br from-primary/10 to-transparent">
              <h1 className="text-4xl font-display font-black text-white italic mb-2">Welcome Back, {profile?.full_name?.split(' ')[0] || 'User'}!</h1>
              <p className="text-slate-400">Your nexus node is operational. 3 orders are currently in transit.</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card p-6 border-b-2 border-primary">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Hauls</p>
                 <p className="text-3xl font-black text-white">42</p>
              </div>
              <div className="glass-card p-6 border-b-2 border-secondary">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Nexus Points</p>
                 <p className="text-3xl font-black text-white">8,420</p>
              </div>
              <div className="glass-card p-6 border-b-2 border-accent">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Active Nodes</p>
                 <p className="text-3xl font-black text-white">03</p>
              </div>
           </div>

           <div className="glass-card p-8">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                    <Clock className="w-6 h-6 text-primary" />
                    <span>Recent Transitions</span>
                 </h2>
                 <button className="text-primary text-sm font-bold hover:underline italic">All history</button>
              </div>

              <div className="space-y-4">
                 {recentOrders.map(order => (
                    <div key={order.id} className="flex items-center justify-between p-6 bg-slate-900 rounded-2xl border border-white/5 group hover:border-primary/30 transition-all cursor-pointer">
                       <div className="flex items-center space-x-6 text-sm">
                          <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center font-mono font-bold text-slate-500">
                             #{order.id}
                          </div>
                          <div>
                             <p className="text-white font-bold mb-1">Standard Shipment Protocol</p>
                             <p className="text-slate-500 text-xs italic">{order.date}</p>
                          </div>
                       </div>
                       <div className="flex items-center space-x-12">
                          <div className="text-right">
                             <p className="text-white font-black">${order.total}</p>
                             <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Debit Logged</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                            order.status === 'shipped' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                            'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                          }`}>
                            {order.status}
                          </span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

import { Link } from 'react-router-dom';
export default UserDashboard;
