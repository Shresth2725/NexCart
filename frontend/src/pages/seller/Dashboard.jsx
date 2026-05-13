import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/axios';
import ProductModal from '../../components/seller/ProductModal';
import { 
  LogOut, 
  LayoutGrid, 
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
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={<DollarSign />} label="Revenue" value={`$${totalRevenue.toLocaleString()}`} color="emerald" />
        <StatCard icon={<ShoppingBag />} label="Orders" value={orders.length} color="blue" />
        <StatCard icon={<Package />} label="Products" value={products.length} color="purple" />
        <StatCard icon={<TrendingUp />} label="Out of stock" value={outOfStock} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-100 dark:border-stone-800">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-base font-bold text-stone-800 dark:text-white">Recent orders</h3>
            <button onClick={() => setActiveTab('orders')} className="text-emerald-600 text-xs font-medium hover:underline">View all</button>
          </div>
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div key={order._id} className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-transparent hover:border-stone-200 dark:hover:border-stone-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                    <Users className="h-4.5 w-4.5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-stone-700 dark:text-stone-200">{order.shippingAddress?.name || 'Customer'}</p>
                    <p className="text-xs text-stone-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-stone-800 dark:text-white">${order.totalAmount}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-blue-50 text-blue-600 dark:bg-blue-500/10'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="text-center text-stone-400 py-4 text-sm">No recent orders</p>}
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800">
          <h3 className="text-base font-bold mb-5 text-stone-800 dark:text-white">Your store</h3>
          <div className="space-y-5">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
              <p className="text-emerald-100 text-xs font-medium mb-1">Store name</p>
              <h4 className="text-2xl font-bold mb-2">{user?.sellerInfo?.storeName || "My Store"}</h4>
              <p className="text-emerald-50/80 text-sm leading-relaxed">{user?.sellerInfo?.storeDescription || "No description provided."}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-stone-100 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50">
                <p className="text-xs text-stone-400 mb-0.5">Inventory</p>
                <p className="text-xl font-bold text-stone-800 dark:text-white">{totalStock}</p>
              </div>
              <div className="p-4 rounded-xl border border-stone-100 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50">
                <p className="text-xs text-stone-400 mb-0.5">Avg. price</p>
                <p className="text-xl font-bold text-stone-800 dark:text-white">${avgPrice}</p>
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
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input 
            type="text" 
            placeholder="Search products…" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-100 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-700 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
          />
        </div>
        <button 
          onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20"
        >
          <Plus className="h-4 w-4" /> Add product
        </button>
      </div>

      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-stone-50/50 dark:bg-stone-800/50 border-b border-stone-100 dark:border-stone-800">
              <tr>
                <th className="px-6 py-3.5 text-xs font-semibold text-stone-500">Product</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-stone-500">Category</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-stone-500">Price</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-stone-500">Stock</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-stone-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50 dark:divide-stone-800">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={(product.images && product.images[0]) || 'https://via.placeholder.com/40'} alt={product.name} className="w-10 h-10 rounded-xl object-cover bg-stone-100" />
                      <span className="font-semibold text-sm text-stone-700 dark:text-stone-200">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-2 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 rounded-md font-medium">{product.category}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-sm text-stone-700 dark:text-white">${product.price}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${(product.stock || 0) > 10 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <span className="text-sm font-medium text-stone-600 dark:text-stone-300">{product.stock || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEditModal(product)} className="p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeleteProduct(product._id)} className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="p-12 text-center">
              <Box className="h-10 w-10 text-stone-300 mx-auto mb-2" />
              <p className="text-stone-400 text-sm">No products found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const OrdersView = ({ orders }) => (
  <div className="space-y-4 animate-fade-in-up">
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-stone-50/50 dark:bg-stone-800/50 border-b border-stone-100 dark:border-stone-800">
            <tr>
              <th className="px-6 py-3.5 text-xs font-semibold text-stone-500">Order ID</th>
              <th className="px-6 py-3.5 text-xs font-semibold text-stone-500">Customer</th>
              <th className="px-6 py-3.5 text-xs font-semibold text-stone-500">Date</th>
              <th className="px-6 py-3.5 text-xs font-semibold text-stone-500">Amount</th>
              <th className="px-6 py-3.5 text-xs font-semibold text-stone-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50 dark:divide-stone-800">
            {(orders || []).map((order) => (
              <tr key={order._id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors">
                <td className="px-6 py-4 text-sm font-mono text-stone-500">#{order._id.slice(-6).toUpperCase()}</td>
                <td className="px-6 py-4">
                  <span className="font-semibold text-sm text-stone-700 dark:text-stone-200">{order.shippingAddress?.name || 'Customer'}</span>
                </td>
                <td className="px-6 py-4 text-sm text-stone-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 font-bold text-sm text-stone-700 dark:text-white">${order.totalAmount}</td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-blue-50 text-blue-600 dark:bg-blue-500/10'
                  }`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(orders || []).length === 0 && (
          <div className="p-12 text-center">
            <ShoppingBag className="h-10 w-10 text-stone-300 mx-auto mb-2" />
            <p className="text-stone-400 text-sm">No orders yet.</p>
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

  const inputClass = "w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm text-stone-700 dark:text-stone-200 transition-all placeholder-stone-400";

  return (
    <div className="max-w-xl animate-fade-in-up">
      <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800">
        <h3 className="text-lg font-bold mb-5 text-stone-900 dark:text-white">Store settings</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-stone-500 mb-1.5 block">Store name</label>
            <input 
              type="text" 
              value={storeData.storeName}
              onChange={(e) => setStoreData({...storeData, storeName: e.target.value})}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-stone-500 mb-1.5 block">Description</label>
            <textarea 
              rows="3"
              value={storeData.storeDescription}
              onChange={(e) => setStoreData({...storeData, storeDescription: e.target.value})}
              className={inputClass + ' resize-none'}
            />
          </div>
          <button 
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 active:scale-[0.98]"
          >
            {saving ? 'Saving…' : 'Save changes'}
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
      try {
        const productsRes = await api.get('/products/seller/products');
        setProducts(productsRes.data.products || []);
      } catch (err) {
        console.error("Products fetch error:", err);
      }

      try {
        const ordersRes = await api.get('/order/seller/');
        setOrders(ordersRes.data.orders || []);
      } catch (err) {
        console.error("Orders fetch error:", err);
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
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex font-sans">
      {/* Sidebar */}
      <aside className="w-60 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 flex flex-col hidden lg:flex fixed h-full z-20">
        <div className="px-6 pt-7 pb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
              <Package className="h-4.5 w-4.5" />
            </div>
            <span className="text-xl font-bold text-stone-800 dark:text-white tracking-tight">NexCart</span>
          </div>
        </div>

        <nav className="flex-1 px-3.5 space-y-1">
          <SidebarLink active={activeTab === 'overview'} icon={<LayoutGrid />} label="Overview" onClick={() => setActiveTab('overview')} />
          <SidebarLink active={activeTab === 'products'} icon={<Box />} label="Products" onClick={() => setActiveTab('products')} />
          <SidebarLink active={activeTab === 'orders'} icon={<ShoppingBag />} label="Orders" onClick={() => setActiveTab('orders')} />
          <SidebarLink active={activeTab === 'settings'} icon={<SettingsIcon />} label="Settings" onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="p-4 mt-auto">
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-700">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center text-emerald-600 font-bold">
                {user?.name?.[0] || 'S'}
              </div>
              <div className="overflow-hidden flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-stone-800 dark:text-white">{user?.name || 'Seller'}</p>
                <p className="text-xs text-stone-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-2 text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-700 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors text-sm font-medium border border-stone-200 dark:border-stone-700"
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
          {activeTab === 'overview' && <OverviewView products={products} orders={orders} user={user} setActiveTab={setActiveTab} />}
          {activeTab === 'products' && <ProductsView products={products} searchTerm={searchTerm} setSearchTerm={setSearchTerm} openEditModal={openEditModal} handleDeleteProduct={handleDeleteProduct} setIsModalOpen={setIsModalOpen} setEditingProduct={setEditingProduct} />}
          {activeTab === 'orders' && <OrdersView orders={orders} />}
          {activeTab === 'settings' && <SettingsView user={user} />}
        </div>
      </main>

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
    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-sm font-medium ${
      active 
      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
      : 'text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/50 hover:text-stone-700'
    }`}
  >
    {React.cloneElement(icon, { className: 'h-[18px] w-[18px]' })}
    {label}
  </button>
);

export default SellerDashboard;
