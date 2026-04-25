import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuthStore } from '../../store/useAuthStore';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, profile } = useAuthStore();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/admin' },
    { icon: Package, label: 'Inventory', path: '/admin/inventory' },
    { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
    { icon: TrendingUp, label: 'Analytics', path: '/admin/analytics' },
    { icon: Users, label: 'Authority', path: '/admin/users' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="sleek-sidebar fixed inset-y-0 shadow-lg z-20">
        <div className="mb-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="sleek-logo-icon flex items-center justify-center">
              <Package className="text-white w-5 h-5 shadow-sm" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">NexaCart</span>
          </Link>
        </div>

        <nav className="flex-grow space-y-1">
          <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-4 px-4">Management</p>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "sleek-nav-item",
                  isActive && "active"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted group-hover:text-white")} />
                <span className="font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-border">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-9 h-9 rounded-full bg-slate-800 border-2 border-primary flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <Users className="w-5 h-5 text-muted" />
              )}
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-sm font-bold text-white truncate">{profile?.full_name || 'Alex Sterling'}</p>
              <p className="text-[11px] text-muted truncate">{profile?.role || 'Administrator'}</p>
            </div>
          </div>
          <button 
            onClick={() => signOut().then(() => navigate('/'))}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-muted hover:text-error hover:bg-error/10 rounded-xl transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-semibold">Log out</span>
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-grow ml-[240px] flex flex-col">
        <header className="h-20 px-10 flex items-center justify-between border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="relative group">
            <input 
              type="text" 
              className="bg-background border border-border rounded-xl px-4 py-2.5 w-80 text-sm text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" 
              placeholder="Search anything..." 
            />
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden sm:block text-right mr-2">
                <p className="text-sm font-bold text-white">{profile?.full_name || 'Alex Sterling'}</p>
                <p className="text-[11px] text-muted">{profile?.role || 'Administrator'}</p>
             </div>
             <div className="w-9 h-9 rounded-full bg-slate-800 border-2 border-primary overflow-hidden">
                {profile?.avatar_url && <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />}
             </div>
          </div>
        </header>
        <div className="p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
