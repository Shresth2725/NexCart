import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/axios';
import { 
  Users, 
  ShieldCheck, 
  Package, 
  MessageSquare, 
  ShoppingBag, 
  LayoutDashboard,
  LogOut,
  Moon,
  Sun,
  Bell,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Box,
  Truck,
  ArrowRight
} from 'lucide-react';

// --- Sub-views ---

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-100 dark:border-stone-800 hover:border-stone-200 dark:hover:border-stone-700 transition-all group hover:shadow-lg hover:shadow-stone-100/50 dark:hover:shadow-stone-900/50">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${
      color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' :
      color === 'blue' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600' :
      color === 'purple' ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-600' :
      'bg-amber-50 dark:bg-amber-500/10 text-amber-600'
    }`}>
      {React.cloneElement(icon, { className: 'h-5 w-5' })}
    </div>
    <p className="text-xs text-stone-400 font-medium mb-0.5">{label}</p>
    <p className="text-2xl font-bold text-stone-900 dark:text-white tracking-tight">{value}</p>
  </div>
);

const OverviewView = ({ stats }) => (
  <div className="space-y-6 animate-fade-in-up">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      <StatCard icon={<Users />} label="Total Users" value={stats.users || 0} color="blue" />
      <StatCard icon={<ShieldCheck />} label="Active Sellers" value={stats.sellers || 0} color="emerald" />
      <StatCard icon={<Package />} label="Products" value={stats.products || 0} color="purple" />
      <StatCard icon={<ShoppingBag />} label="Total Orders" value={stats.orders || 0} color="orange" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Activity or Charts would go here */}
      <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-100 dark:border-stone-800">
        <h3 className="text-base font-bold text-stone-800 dark:text-white mb-4">System Status</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/50">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-medium text-stone-700 dark:text-stone-200">Auth Service</span>
            </div>
            <span className="text-xs text-emerald-600 font-semibold">Operational</span>
          </div>
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/50">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-medium text-stone-700 dark:text-stone-200">Product Service</span>
            </div>
            <span className="text-xs text-emerald-600 font-semibold">Operational</span>
          </div>
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/50">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-medium text-stone-700 dark:text-stone-200">Order Service</span>
            </div>
            <span className="text-xs text-emerald-600 font-semibold">Operational</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-100 dark:border-stone-800">
        <h3 className="text-base font-bold text-stone-800 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button className="p-4 rounded-xl border border-stone-100 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors text-left">
            <Users className="h-5 w-5 text-blue-600 mb-2" />
            <p className="text-sm font-semibold text-stone-700 dark:text-white">Manage Users</p>
            <p className="text-xs text-stone-400">Review accounts</p>
          </button>
          <button className="p-4 rounded-xl border border-stone-100 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors text-left">
            <ShieldCheck className="h-5 w-5 text-emerald-600 mb-2" />
            <p className="text-sm font-semibold text-stone-700 dark:text-white">Verify Sellers</p>
            <p className="text-xs text-stone-400">Pending approvals</p>
          </button>
        </div>
      </div>
    </div>
  </div>
);

const UsersView = ({ users, handleDeleteUser }) => (
  <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 overflow-hidden animate-fade-in-up">
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-stone-50/50 dark:bg-stone-800/50 border-b border-stone-100 dark:border-stone-800">
          <tr>
            <th className="px-6 py-3.5 text-xs font-semibold text-stone-500">User</th>
            <th className="px-6 py-3.5 text-xs font-semibold text-stone-500">Email</th>
            <th className="px-6 py-3.5 text-xs font-semibold text-stone-500">Role</th>
            <th className="px-6 py-3.5 text-xs font-semibold text-stone-500 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-50 dark:divide-stone-800">
          {users.map((user) => (
            <tr key={user._id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-300 font-semibold text-sm">
                    {user.name?.[0] || 'U'}
                  </div>
                  <span className="font-semibold text-sm text-stone-700 dark:text-stone-200">{user.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-stone-500">{user.email}</td>
              <td className="px-6 py-4">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  user.role === 'admin' ? 'bg-violet-50 text-violet-600 dark:bg-violet-500/10' :
                  user.role === 'seller' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' :
                  'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                }`}>
                  {user.role}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button onClick={() => handleDeleteUser(user._id)} className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const SellersView = ({ sellers, handleVerifySeller }) => (
  <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 overflow-hidden animate-fade-in-up">
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-stone-50/50 dark:bg-stone-800/50 border-b border-stone-100 dark:border-stone-800">
          <tr>
            <th className="px-6 py-3.5 text-xs font-semibold text-stone-500">Store</th>
            <th className="px-6 py-3.5 text-xs font-semibold text-stone-500">Owner</th>
            <th className="px-6 py-3.5 text-xs font-semibold text-stone-500">Status</th>
            <th className="px-6 py-3.5 text-xs font-semibold text-stone-500 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-50 dark:divide-stone-800">
          {sellers.map((seller) => (
            <tr key={seller._id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-semibold text-sm">
                    {seller.sellerInfo?.storeName?.[0] || 'S'}
                  </div>
                  <span className="font-semibold text-sm text-stone-700 dark:text-stone-200">{seller.sellerInfo?.storeName || 'N/A'}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-stone-500">{seller.name}</td>
              <td className="px-6 py-4">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  seller.isVerified ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10'
                }`}>
                  {seller.isVerified ? 'Verified' : 'Pending'}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                {!seller.isVerified && (
                  <button onClick={() => handleVerifySeller(seller._id)} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors">
                    Verify
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// --- Main Component ---

const AdminPortal = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ users: 0, sellers: 0, products: 0, orders: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const usersRes = await api.get('/auth/admin/users');
      const allUsers = usersRes.data.users || [];
      setUsers(allUsers);
      setSellers(allUsers.filter(u => u.role === 'seller'));
      
      // Mock stats for now based on data
      setStats({
        users: allUsers.length,
        sellers: allUsers.filter(u => u.role === 'seller').length,
        products: 45, // mock
        orders: 120 // mock
      });
    } catch (error) {
      console.error('Failed to fetch admin data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/auth/admin/user/${id}`);
        fetchData();
      } catch (error) {
        console.error('Failed to delete user', error);
      }
    }
  };

  const handleVerifySeller = async (id) => {
    try {
      await api.post(`/auth/admin/verify-seller/${id}`);
      fetchData();
    } catch (error) {
      console.error('Failed to verify seller', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <Loader2 className="h-8 w-8 text-violet-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex font-sans">
      {/* Sidebar */}
      <aside className="w-60 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 flex flex-col hidden lg:flex fixed h-full z-20">
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold text-stone-800 dark:text-white tracking-tight">Admin</span>
          </div>
        </div>

        <nav className="flex-1 px-3.5 space-y-0.5">
          <SidebarLink active={activeTab === 'overview'} icon={<LayoutDashboard />} label="Overview" onClick={() => setActiveTab('overview')} />
          <SidebarLink active={activeTab === 'users'} icon={<Users />} label="Users" onClick={() => setActiveTab('users')} />
          <SidebarLink active={activeTab === 'sellers'} icon={<ShieldCheck />} label="Sellers" onClick={() => setActiveTab('sellers')} />
        </nav>

        <div className="p-3 mt-auto">
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-500/15 flex items-center justify-center text-violet-600 text-sm font-semibold">
                A
              </div>
              <div className="overflow-hidden flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-stone-800 dark:text-white">Admin</p>
                <p className="text-xs text-stone-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-2 text-red-600 dark:text-red-400 hover:bg-white dark:hover:bg-stone-700 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors text-sm font-medium border border-stone-200 dark:border-stone-700"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-60 flex flex-col h-screen overflow-hidden">
        <header className="glass border-b border-stone-200 dark:border-stone-800 px-6 py-3.5 flex items-center justify-between z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-stone-800 dark:text-white capitalize">{activeTab}</h2>
            <span className="text-stone-300 dark:text-stone-700">·</span>
            <p className="text-sm text-stone-400 hidden md:block">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
          </div>

          <div className="flex items-center gap-1.5">
            <button onClick={toggleTheme} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors text-stone-500">
              {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </button>
            <div className="relative p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer">
                <Bell className="h-[18px] w-[18px] text-stone-500" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white dark:border-stone-900 rounded-full"></span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar bg-stone-50/50 dark:bg-stone-950/50">
          {activeTab === 'overview' && <OverviewView stats={stats} />}
          {activeTab === 'users' && <UsersView users={users} handleDeleteUser={handleDeleteUser} />}
          {activeTab === 'sellers' && <SellersView sellers={sellers} handleVerifySeller={handleVerifySeller} />}
        </div>
      </main>
    </div>
  );
};

const SidebarLink = ({ active, icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-sm font-medium ${
      active 
      ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400' 
      : 'text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/50 hover:text-stone-700'
    }`}
  >
    {React.cloneElement(icon, { className: 'h-[18px] w-[18px]' })}
    {label}
  </button>
);

export default AdminPortal;
