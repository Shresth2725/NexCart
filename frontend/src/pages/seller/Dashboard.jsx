import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/axios';
import ProductModal from '../../components/seller/ProductModal';
import { 
  LogOut, 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Settings as SettingsIcon, 
  Plus, 
  Edit3, 
  Trash2, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Box,
  Moon,
  Sun,
  Search,
  Bell,
  ChevronRight,
  Loader2
} from 'lucide-react';

// --- Sub-views (Defined outside for stability) ---

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-emerald-500/50 transition-all group">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
      color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-500/10' :
      color === 'blue' ? 'bg-blue-50 dark:bg-blue-500/10' :
      color === 'purple' ? 'bg-purple-50 dark:bg-purple-500/10' :
      'bg-orange-50 dark:bg-orange-500/10'
    }`}>
      {React.cloneElement(icon, { className: 'h-6 w-6' })}
    </div>
    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
    <p className="text-2xl font-black dark:text-white">{value}</p>
  </div>
);

const OverviewView = ({ products, orders, user, setActiveTab }) => {
  const totalRevenue = (orders || []).reduce((acc, order) => {
    const sellerRevenue = (order.items || [])
      .filter(item => item.sellerId === user?.id || item.sellerId === user?._id)
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return acc + sellerRevenue;
  }, 0);

  const totalStock = (products || []).reduce((acc, p) => acc + (p.stock || 0), 0);
  const outOfStock = (products || []).filter(p => (p.stock || 0) === 0).length;
  const avgPrice = products.length > 0 
    ? Math.round(products.reduce((acc, p) => acc + p.price, 0) / products.length) 
    : 0;

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<DollarSign className="text-emerald-500" />} label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} color="emerald" />
        <StatCard icon={<ShoppingBag className="text-blue-500" />} label="Total Orders" value={orders.length} color="blue" />
        <StatCard icon={<Package className="text-purple-500" />} label="Live Products" value={products.length} color="purple" />
        <StatCard icon={<TrendingUp className="text-orange-500" />} label="Out of Stock" value={outOfStock} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold dark:text-white">Recent Orders</h3>
            <button onClick={() => setActiveTab('orders')} className="text-emerald-600 text-sm font-medium hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {orders.slice(0, 5).map((order) => (
              <div key={order._id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm dark:text-white">{order.shippingAddress?.name || 'Customer'}</p>
                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm dark:text-white">${order.totalAmount}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    order.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="text-center text-gray-500 py-4">No recent orders</p>}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-6 dark:text-white">Your Store</h3>
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
              <p className="text-emerald-100 text-sm font-medium mb-1">Store Name</p>
              <h4 className="text-2xl font-bold mb-4">{user?.sellerInfo?.storeName || "My Store"}</h4>
              <p className="text-emerald-500/10 text-sm italic">{user?.sellerInfo?.storeDescription || "No description provided."}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 dark:bg-gray-900/50">
                <p className="text-xs text-gray-500 mb-1">Total Inventory</p>
                <p className="text-xl font-bold dark:text-white">{totalStock}</p>
              </div>
              <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 dark:bg-gray-900/50">
                <p className="text-xs text-gray-500 mb-1">Avg. Item Price</p>
                <p className="text-xl font-bold dark:text-white">${avgPrice}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductsView = ({ products, searchTerm, setSearchTerm, openEditModal, handleDeleteProduct, setIsModalOpen, setEditingProduct }) => {
  const filteredProducts = (products || []).filter(p => 
    (p?.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
    (p?.category?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>
        <button 
          onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
        >
          <Plus className="h-5 w-5" /> Add Product
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={(product.images && product.images[0]) || 'https://via.placeholder.com/40'} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                      <span className="font-semibold text-sm dark:text-white">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-lg font-medium">{product.category}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-sm dark:text-white">${product.price}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${(product.stock || 0) > 10 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <span className="text-sm dark:text-white">{product.stock || 0} units</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEditModal(product)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeleteProduct(product._id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="p-12 text-center space-y-3">
              <Box className="h-12 w-12 text-gray-300 mx-auto" />
              <p className="text-gray-500">No products found. Start by adding one!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const OrdersView = ({ orders }) => (
  <div className="space-y-6 animate-fade-in-up">
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {(orders || []).map((order) => (
              <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                <td className="px-6 py-4 text-sm font-mono text-gray-500 dark:text-gray-400">#{order._id.slice(-6).toUpperCase()}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm dark:text-white">{order.shippingAddress?.name || 'Customer'}</span>
                    <span className="text-xs text-gray-500">{order.shippingAddress?.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm dark:text-white">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 font-bold text-sm dark:text-white">${order.totalAmount}</td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                    order.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(orders || []).length === 0 && (
          <div className="p-12 text-center space-y-3">
            <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto" />
            <p className="text-gray-500">No orders yet. They will appear here when customers buy your products.</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

const SettingsView = ({ user }) => {
  const [storeData, setStoreData] = useState({
    storeName: user?.sellerInfo?.storeName || '',
    storeDescription: user?.sellerInfo?.storeDescription || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/auth/auth/updateSellerInfo', storeData);
      alert('Store info updated successfully! Please re-login to see changes in your profile.');
    } catch (error) {
      console.error('Failed to update store info', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl animate-fade-in-up">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-xl font-bold mb-6 dark:text-white">Store Settings</h3>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Store Name</label>
            <input 
              type="text" 
              value={storeData.storeName}
              onChange={(e) => setStoreData({...storeData, storeName: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Store Description</label>
            <textarea 
              rows="4"
              value={storeData.storeDescription}
              onChange={(e) => setStoreData({...storeData, storeDescription: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
            />
          </div>
          <button 
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Store Details'}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Main Component ---

const SellerDashboard = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch Products
      try {
        const productsRes = await api.get('/products/seller/products');
        console.log("Dashboard - Products Fetched:", productsRes.data.products);
        setProducts(productsRes.data.products || []);
      } catch (err) {
        console.error("Dashboard - Products Fetch Error:", err);
      }

      // Fetch Orders
      try {
        const ordersRes = await api.get('/order/seller/');
        console.log("Dashboard - Orders Fetched:", ordersRes.data.orders);
        setOrders(ordersRes.data.orders || []);
      } catch (err) {
        console.error("Dashboard - Orders Fetch Error:", err);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (formData) => {
    try {
      await api.post('/products/seller/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setIsModalOpen(false);
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to create product', error);
    }
  };

  const handleUpdateProduct = async (formData) => {
    try {
      await api.post(`/products/seller/update-product/${editingProduct._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setIsModalOpen(false);
      setEditingProduct(null);
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to update product', error);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.post(`/products/seller/delete-product/${id}`);
        fetchDashboardData();
      } catch (error) {
        console.error('Failed to delete product', error);
      }
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  if (loading && products.length === 0 && orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col hidden lg:flex">
        <div className="p-6">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Package className="h-5 w-5" />
            </div>
            <span className="text-xl font-black tracking-tight">NEXCART</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <SidebarLink active={activeTab === 'overview'} icon={<LayoutDashboard />} label="Overview" onClick={() => setActiveTab('overview')} />
          <SidebarLink active={activeTab === 'products'} icon={<Box />} label="My Products" onClick={() => setActiveTab('products')} />
          <SidebarLink active={activeTab === 'orders'} icon={<ShoppingBag />} label="Orders" onClick={() => setActiveTab('orders')} />
          <SidebarLink active={activeTab === 'settings'} icon={<SettingsIcon />} label="Store Settings" onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="p-4 mt-auto">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 font-bold">
                {user?.name?.[0] || 'S'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate dark:text-white">{user?.name || 'Seller'}</p>
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-8 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold dark:text-white capitalize">{activeTab}</h2>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <p className="text-sm text-gray-500 hidden md:block">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all text-gray-500">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <div className="relative">
                <Bell className="h-5 w-5 text-gray-500" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {activeTab === 'overview' && <OverviewView products={products} orders={orders} user={user} setActiveTab={setActiveTab} />}
          {activeTab === 'products' && <ProductsView products={products} searchTerm={searchTerm} setSearchTerm={setSearchTerm} openEditModal={openEditModal} handleDeleteProduct={handleDeleteProduct} setIsModalOpen={setIsModalOpen} setEditingProduct={setEditingProduct} />}
          {activeTab === 'orders' && <OrdersView orders={orders} />}
          {activeTab === 'settings' && <SettingsView user={user} />}
        </div>
      </main>

      {/* Modals */}
      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
        product={editingProduct}
      />
    </div>
  );
};

const SidebarLink = ({ active, icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
      active 
      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 scale-[1.02]' 
      : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-emerald-600'
    }`}
  >
    {React.cloneElement(icon, { className: 'h-5 w-5' })}
    {label}
    {active && <ChevronRight className="ml-auto h-4 w-4" />}
  </button>
);

export default SellerDashboard;
