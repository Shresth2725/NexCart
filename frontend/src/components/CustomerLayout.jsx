import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  ShoppingBag, 
  LayoutDashboard, 
  Clock, 
  Settings as SettingsIcon, 
  Heart, 
  LogOut, 
  Search, 
  Sun, 
  Moon, 
  ShoppingCart, 
  Bell,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

import { useSelector, useDispatch } from 'react-redux';
import { fetchCart } from '../store/slices/cartSlice';

const SidebarLink = ({ active, icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
      active 
      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-[1.02]' 
      : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-indigo-600'
    }`}
  >
    {React.cloneElement(icon, { className: 'h-5 w-5' })}
    {label}
    {active && <ChevronRight className="ml-auto h-4 w-4" />}
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex font-sans">
      {/* ... (Sidebar remains the same) ... */}
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col hidden lg:flex fixed h-full z-20">
        <div className="p-6">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-500 cursor-pointer" onClick={() => navigate('/home')}>
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="text-xl font-black tracking-tight uppercase">NexCart-Devops</span>
          </div>
        </div>

        <nav className="px-4 space-y-1 mb-4">
          <SidebarLink active={isActive('/home')} icon={<LayoutDashboard />} label="Explore Feed" onClick={() => navigate('/home')} />
          <SidebarLink active={isActive('/orders')} icon={<Clock />} label="My Orders" onClick={() => navigate('/orders')} />
          <SidebarLink active={isActive('/settings')} icon={<SettingsIcon />} label="Settings" onClick={() => navigate('/settings')} />
          <SidebarLink active={false} icon={<Heart />} label="Wishlist" onClick={() => {}} />
        </nav>

        {/* Dynamic Sidebar Content (Filters) */}
        {sidebarContent && (
            <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
                {sidebarContent}
            </div>
        )}

        <div className="p-4 mt-auto">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 font-bold uppercase">
                {user?.name?.[0] || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate dark:text-white">{user?.name || 'Customer'}</p>
                <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all text-sm font-bold"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar - Mobile */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 z-50 transform transition-transform duration-300 lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Same content as desktop sidebar */}
        <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-600">
                <ShoppingBag className="h-6 w-6" />
                <span className="text-xl font-black">NEXCART</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)}>
                <X className="h-6 w-6 text-gray-500" />
            </button>
        </div>
        <nav className="px-4 space-y-1">
          <SidebarLink active={isActive('/home')} icon={<LayoutDashboard />} label="Explore Feed" onClick={() => { navigate('/home'); setIsMobileMenuOpen(false); }} />
          <SidebarLink active={isActive('/orders')} icon={<Clock />} label="My Orders" onClick={() => { navigate('/orders'); setIsMobileMenuOpen(false); }} />
          <SidebarLink active={isActive('/settings')} icon={<SettingsIcon />} label="Settings" onClick={() => { navigate('/settings'); setIsMobileMenuOpen(false); }} />
        </nav>
        {sidebarContent && <div className="px-4 mt-6">{sidebarContent}</div>}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 lg:px-8 py-4 flex items-center justify-between z-10 sticky top-0">
          <button className="lg:hidden p-2 -ml-2 text-gray-500" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1 max-w-xl relative mx-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search premium products..." 
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery?.(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSearch?.()}
              className="w-full pl-12 pr-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2 lg:gap-6">
            <div className="flex items-center gap-2 lg:gap-4 border-r border-gray-100 dark:border-gray-800 pr-2 lg:pr-6">
                <button onClick={toggleTheme} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all text-gray-500">
                    {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
                <div className="relative cursor-pointer group p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all" onClick={() => navigate('/cart')}>
                    <ShoppingCart className="h-5 w-5 text-gray-500 group-hover:text-indigo-600" />
                    {items.length > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900">
                          {items.length}
                      </span>
                    )}
                </div>
            </div>
            <div className="relative cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all hidden sm:block">
                <Bell className="h-5 w-5 text-gray-500" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-gray-950">
            {children}
        </div>
      </main>
    </div>
  );
};

export default CustomerLayout;
