import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  ShoppingBag, 
  LayoutGrid, 
  Clock, 
  Settings as SettingsIcon, 
  Heart, 
  LogOut, 
  Search, 
  Sun, 
  Moon, 
  ShoppingCart, 
  Bell,
  Menu,
  X
} from 'lucide-react';

import { useSelector, useDispatch } from 'react-redux';
import { fetchCart } from '../store/slices/cartSlice';

const SidebarLink = ({ active, icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
      active 
      ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' 
      : 'text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-700 dark:hover:text-stone-300'
    }`}
  >
    {React.cloneElement(icon, { className: 'h-[18px] w-[18px]' })}
    {label}
  </button>
);

const CustomerLayout = ({ children, sidebarContent, onSearch, searchQuery, setSearchQuery }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { items } = useSelector(state => state.cart);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  React.useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex">
      {/* Desktop Sidebar */}
      <aside className="w-60 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 flex flex-col hidden lg:flex fixed h-full z-20">
        <div className="px-5 pt-6 pb-4">
          <button 
            className="flex items-center gap-2 group" 
            onClick={() => navigate('/home')}
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold text-stone-800 dark:text-white tracking-tight">NexCart</span>
          </button>
        </div>

        <nav className="px-3 space-y-0.5 mb-4">
          <SidebarLink active={isActive('/home')} icon={<LayoutGrid />} label="Browse" onClick={() => navigate('/home')} />
          <SidebarLink active={isActive('/orders')} icon={<Clock />} label="Orders" onClick={() => navigate('/orders')} />
          <SidebarLink active={isActive('/settings')} icon={<SettingsIcon />} label="Settings" onClick={() => navigate('/settings')} />
          <SidebarLink active={false} icon={<Heart />} label="Wishlist" onClick={() => {}} />
        </nav>

        {/* Dynamic Sidebar Content (Filters) */}
        {sidebarContent && (
            <div className="flex-1 overflow-y-auto px-3 custom-scrollbar">
                {sidebarContent}
            </div>
        )}

        <div className="p-3 mt-auto">
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center text-blue-600 text-sm font-semibold">
                {user?.name?.[0] || 'U'}
              </div>
              <div className="overflow-hidden flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-stone-800 dark:text-white">{user?.name || 'Customer'}</p>
                <p className="text-xs text-stone-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors text-sm font-medium"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar - Mobile */}
      <aside className={`fixed inset-y-0 left-0 w-60 bg-white dark:bg-stone-900 z-50 transform transition-transform duration-200 lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-600">
                <ShoppingBag className="h-5 w-5" />
                <span className="text-lg font-bold">NexCart</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                <X className="h-5 w-5 text-stone-500" />
            </button>
        </div>
        <nav className="px-3 space-y-0.5">
          <SidebarLink active={isActive('/home')} icon={<LayoutGrid />} label="Browse" onClick={() => { navigate('/home'); setIsMobileMenuOpen(false); }} />
          <SidebarLink active={isActive('/orders')} icon={<Clock />} label="Orders" onClick={() => { navigate('/orders'); setIsMobileMenuOpen(false); }} />
          <SidebarLink active={isActive('/settings')} icon={<SettingsIcon />} label="Settings" onClick={() => { navigate('/settings'); setIsMobileMenuOpen(false); }} />
        </nav>
        {sidebarContent && <div className="px-3 mt-4">{sidebarContent}</div>}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-60 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 px-4 lg:px-6 py-3 flex items-center justify-between z-10 sticky top-0">
          <button className="lg:hidden p-2 -ml-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1 max-w-lg relative mx-3">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input 
              type="text" 
              placeholder="Search products…" 
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery?.(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch?.()}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-transparent focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm text-stone-700 dark:text-stone-200 placeholder-stone-400"
            />
          </div>

          <div className="flex items-center gap-1">
            <button onClick={toggleTheme} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors text-stone-500">
                {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </button>
            <div className="relative cursor-pointer group p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors" onClick={() => navigate('/cart')}>
                <ShoppingCart className="h-[18px] w-[18px] text-stone-500 group-hover:text-blue-600 transition-colors" />
                {items.length > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-blue-600 text-white text-[10px] font-semibold flex items-center justify-center rounded-full px-1 border-2 border-white dark:border-stone-900">
                      {items.length}
                  </span>
                )}
            </div>
            <div className="relative cursor-pointer p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors hidden sm:block">
                <Bell className="h-[18px] w-[18px] text-stone-500" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-stone-900"></span>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-stone-50 dark:bg-stone-950">
            {children}
        </div>
      </main>
    </div>
  );
};

export default CustomerLayout;
