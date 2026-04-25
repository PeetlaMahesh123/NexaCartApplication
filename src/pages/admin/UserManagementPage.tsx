import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Shield, 
  UserCircle,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const ROLES = ['user', 'admin', 'editor', 'viewer'];

const UserManagementPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) throw error;
      setUsers(data || []);
    } catch (err: any) {
      toast.error('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole as any })
        .eq('id', userId);

      if (error) throw error;
      
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success(`Role updated to ${newRole}`);
    } catch (err: any) {
      toast.error('Failed to update role');
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-white italic underline decoration-primary decoration-4 underline-offset-8 uppercase tracking-widest">Authority Matrix</h1>
          <p className="text-slate-500 mt-2">Manage user hierarchical status and ecosystem permissions.</p>
        </div>
      </div>

      <div className="sleek-container p-0">
        <div className="px-8 py-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-2.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <Users className="w-4 h-4" />
            <span>Total Nodes: {users.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/50 text-[10px] items-center uppercase tracking-widest text-slate-500">
                <th className="px-8 py-4 font-black text-center w-20">Identity</th>
                <th className="px-8 py-4 font-black">Entity Details</th>
                <th className="px-8 py-4 font-black">Designated Role</th>
                <th className="px-8 py-4 font-black text-right">Protocol Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-slate-500">
                    <div className="animate-pulse flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-slate-500 italic">
                    No nodes detected in the search radius.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-white/5 flex items-center justify-center overflow-hidden">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <UserCircle className="w-6 h-6 text-slate-600" />
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white leading-none mb-1">{user.full_name || 'Anonymous Node'}</span>
                        <span className="text-[11px] text-slate-500 font-mono">{user.email || 'No email synchronized'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-2">
                        <select
                          className={`bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white focus:outline-none focus:border-primary transition-all cursor-pointer ${
                            updatingId === user.id ? 'opacity-50 pointer-events-none' : ''
                          }`}
                          value={user.role}
                          onChange={(e) => updateRole(user.id, e.target.value)}
                        >
                          {ROLES.map(role => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                        <Shield className={`w-3 h-3 ${user.role === 'admin' ? 'text-primary' : user.role === 'editor' ? 'text-secondary' : user.role === 'viewer' ? 'text-accent' : 'text-slate-600'}`} />
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          className="p-2 bg-slate-900 border border-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
                          title="Revoke and Reset"
                          onClick={() => updateRole(user.id, 'user')}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="sleek-container border-primary/20 bg-primary/5">
          <div className="flex items-center space-x-2 mb-4 text-primary">
            <Shield className="w-5 h-5" />
            <h3 className="font-bold text-sm uppercase tracking-widest">Admin Control</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed italic">
            Full synchronization authority. Can modify all artifacts, roles, and ecosystem parameters.
          </p>
        </div>
        <div className="sleek-container border-secondary/20 bg-secondary/5">
          <div className="flex items-center space-x-2 mb-4 text-secondary">
            <Package className="w-5 h-5" />
            <h3 className="font-bold text-sm uppercase tracking-widest">Editor Access</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed italic">
            Authorized to modify inventory, artifacts, and order statuses. Cannot modify authority levels.
          </p>
        </div>
        <div className="sleek-container border-accent/20 bg-accent/5">
          <div className="flex items-center space-x-2 mb-4 text-accent">
            <Users className="w-5 h-5" />
            <h3 className="font-bold text-sm uppercase tracking-widest">Viewer Only</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed italic">
            Read-only access to analytics and inventory. Authorized to observe but not modify signals.
          </p>
        </div>
      </div>
    </div>
  );
};

import { Package } from 'lucide-react';
export default UserManagementPage;
