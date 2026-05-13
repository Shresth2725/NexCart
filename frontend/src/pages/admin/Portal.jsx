import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import adminApi from '../../api/admin.api';
import { 
  LogOut, 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  Package, 
  ShieldCheck, 
  ShieldAlert,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronRight,
  Loader2,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  RefreshCw,
  MoreVertical,
  Filter,
  Star,
  MessageSquare,
  ArrowLeft,
  MapPin,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';

// --- Shared Components ---

const StatCard = ({ icon, label, value, color, trend }) => (
  <div className="bg-white dark:bg-stone-800 p-6 rounded-xl shadow-sm border border-stone-100 dark:border-stone-700 hover:border-indigo-500/50 transition-all group">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
      color === 'indigo' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600' :
      color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' :
      color === 'blue' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600' :
      'bg-amber-50 dark:bg-amber-500/10 text-amber-600'
    }`}>
      {React.cloneElement(icon, { className: 'h-6 w-6' })}
    </div>
    <div>
      <p className="text-xs font-bold text-stone-500  mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-bold dark:text-white">{value}</p>
        {trend && (
          <span className="text-[10px] font-bold text-emerald-500">+{trend}%</span>
        )}
      </div>
    </div>
  </div>
);

// --- Detail Views ---

const UserDetailModal = ({ user, onClose }) => {
    if (!user) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-stone-900 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="p-10">
                    <div className="flex justify-between items-start mb-8">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-xl bg-blue-600 text-white flex items-center justify-center text-3xl font-bold ">
                                {user.name?.[0] || 'U'}
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold dark:text-white ">{user.name}</h2>
                                <p className="text-blue-600 font-bold  text-xs mt-1">{user.role}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-3 bg-stone-100 dark:bg-stone-800 rounded-full text-stone-500 hover:bg-red-50 hover:text-red-600 transition-colors">
                            <XCircle className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Mail className="h-5 w-5 text-stone-400" />
                                <div>
                                    <p className="text-[10px] font-bold text-stone-400 ">Email Address</p>
                                    <p className="font-bold dark:text-white">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Phone className="h-5 w-5 text-stone-400" />
                                <div>
                                    <p className="text-[10px] font-bold text-stone-400 ">Phone Number</p>
                                    <p className="font-bold dark:text-white">{user.phone || 'Not provided'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Calendar className="h-5 w-5 text-stone-400" />
                                <div>
                                    <p className="text-[10px] font-bold text-stone-400 ">Joined On</p>
                                    <p className="font-bold dark:text-white">{new Date(user.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <ShieldCheck className="h-5 w-5 text-stone-400" />
                                <div>
                                    <p className="text-[10px] font-bold text-stone-400 ">Account Status</p>
                                    <p className="font-bold text-emerald-500">Verified & Active</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {user.role === 'seller' && user.sellerInfo && (
                        <div className="mt-10 p-8 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-100 dark:border-stone-700">
                            <div className="flex items-center gap-3 mb-4">
                                <ShoppingBag className="h-5 w-5 text-blue-600" />
                                <h3 className="font-bold text-stone-900 dark:text-white  text-sm">Store Information</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-stone-500">Store Name</p>
                                    <p className="font-bold dark:text-white">{user.sellerInfo.storeName}</p>
                                </div>
                                <div>
                                    <p className="text-stone-500">Verification</p>
                                    <p className={`font-bold ${user.sellerInfo.isApproved ? 'text-emerald-500' : 'text-amber-500'}`}>
                                        {user.sellerInfo.isApproved ? 'Approved' : 'Pending Review'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Sub-Views ---

const OverviewView = ({ stats, setActiveTab }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Users />} label="Total Users" value={stats.users} color="indigo" trend="12" />
        <StatCard icon={<ShieldCheck />} label="Verified Sellers" value={stats.sellers} color="emerald" trend="8" />
        <StatCard icon={<Package />} label="Total Products" value={stats.products} color="blue" trend="24" />
        <StatCard icon={<ShoppingBag />} label="Total Orders" value={stats.orders} color="amber" trend="18" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-stone-800 p-6 rounded-xl shadow-sm border border-stone-100 dark:border-stone-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold dark:text-white text-emerald-400">System Activity</h3>
            <div className="flex gap-2">
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Services Online
                </span>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-stone-100 dark:border-stone-700 rounded-xl">
             <p className="text-stone-400 text-sm italic">Activity Visualization Placeholder</p>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-800 p-6 rounded-xl shadow-sm border border-stone-100 dark:border-stone-700">
          <h3 className="text-lg font-bold mb-6 dark:text-white">Admin Quick Actions</h3>
          <div className="space-y-3">
            <button onClick={() => setActiveTab('sellers')} className="w-full flex items-center justify-between p-4 rounded-xl bg-stone-50 dark:bg-stone-900/50 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors group">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 text-amber-500" />
                <span className="text-sm font-semibold dark:text-white">Pending Approvals</span>
              </div>
              <ChevronRight className="h-4 w-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => setActiveTab('reviews')} className="w-full flex items-center justify-between p-4 rounded-xl bg-stone-50 dark:bg-stone-900/50 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors group">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-purple-500" />
                <span className="text-sm font-semibold dark:text-white">Review Moderation</span>
              </div>
              <ChevronRight className="h-4 w-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => setActiveTab('orders')} className="w-full flex items-center justify-between p-4 rounded-xl bg-stone-50 dark:bg-stone-900/50 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors group">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-semibold dark:text-white">Recent Orders</span>
              </div>
              <ChevronRight className="h-4 w-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserManagementView = ({ users, loading, onViewDetail }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
          <input 
            type="text" 
            placeholder="Search users by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-stone-800 rounded-xl shadow-sm border border-stone-100 dark:border-stone-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-stone-50 dark:bg-stone-900/50 border-b border-stone-100 dark:border-stone-700">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 ">User</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 ">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 ">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 ">Joined</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500  text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-700">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-stone-50 dark:hover:bg-stone-900/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 font-bold">
                        {user.name?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-sm dark:text-white">{user.name}</p>
                        <p className="text-xs text-stone-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 
                      user.role === 'seller' ? 'bg-blue-100 text-blue-600' : 'bg-stone-100 text-stone-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-xs font-medium dark:text-stone-300">Active</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-500 dark:text-stone-400">
                    {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => onViewDetail(user)} className="p-2 text-stone-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SellerManagementView = ({ sellers, onApprove, onReject, onViewDetail }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-stone-800 rounded-xl shadow-sm border border-stone-100 dark:border-stone-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-stone-50 dark:bg-stone-900/50 border-b border-stone-100 dark:border-stone-700">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 ">Store / Seller</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 ">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 ">Joined</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500  text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-700">
              {sellers.map((seller) => (
                <tr key={seller._id} className="hover:bg-stone-50 dark:hover:bg-stone-900/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600">
                        <ShoppingBag className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm dark:text-white">{seller.sellerInfo?.storeName || 'Unnamed Store'}</p>
                        <p className="text-xs text-stone-500">{seller.name} • {seller.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      seller.sellerInfo?.isApproved ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {seller.sellerInfo?.isApproved ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-500 dark:text-stone-400">
                    {new Date(seller.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {!seller.sellerInfo?.isApproved && (
                        <>
                          <button 
                            onClick={() => onApprove(seller._id)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors"
                            title="Approve Seller"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => onReject(seller._id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Reject Seller"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button onClick={() => onViewDetail(seller)} className="p-2 text-stone-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ProductManagementView = ({ products, onToggleStatus, onDelete }) => {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white dark:bg-stone-800 rounded-xl shadow-sm border border-stone-100 dark:border-stone-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-stone-50 dark:bg-stone-900/50 border-b border-stone-100 dark:border-stone-700">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-stone-500 ">Product</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-500 ">Price</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-500 ">Stock</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-500 ">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-500  text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-700">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-stone-50 dark:hover:bg-stone-900/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={product.images?.[0] || 'https://via.placeholder.com/40'} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-stone-100" />
                        <div>
                          <p className="font-semibold text-sm dark:text-white">{product.name}</p>
                          <p className="text-xs text-stone-500">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-sm dark:text-white">₹{product.price}</td>
                    <td className="px-6 py-4 text-sm dark:text-white">{product.stock} units</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => onToggleStatus(product._id)}
                        className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase transition-colors ${
                          product.isActive !== false ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' : 'bg-red-100 text-red-600 hover:bg-red-200'
                        }`}
                      >
                        {product.isActive !== false ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => onDelete(product._id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
};

const ReviewManagementView = ({ reviews, onDelete }) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white dark:bg-stone-800 rounded-xl shadow-sm border border-stone-100 dark:border-stone-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-stone-50 dark:bg-stone-900/50 border-b border-stone-100 dark:border-stone-700">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-stone-500 ">Product</th>
                                <th className="px-6 py-4 text-xs font-bold text-stone-500 ">Rating</th>
                                <th className="px-6 py-4 text-xs font-bold text-stone-500 ">Review</th>
                                <th className="px-6 py-4 text-xs font-bold text-stone-500 ">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-stone-500  text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-stone-700">
                            {reviews.map((review) => (
                                <tr key={review._id} className="hover:bg-stone-50 dark:hover:bg-stone-900/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-sm dark:text-white uppercase er">#{String(review.productId?._id || review.productId).slice(-6)}</p>
                                        <p className="text-[10px] text-stone-500 truncate max-w-[150px]">{review.productId?.name || 'Unknown Product'}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                                            <Star className="h-3.5 w-3.5 fill-current" />
                                            {review.rating}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm dark:text-stone-300 italic line-clamp-1 max-w-[300px]">"{review.comment}"</p>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-stone-500">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => onDelete(review._id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const OrderManagementView = ({ orders, onUpdateStatus, onViewDetail }) => {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white dark:bg-stone-800 rounded-xl shadow-sm border border-stone-100 dark:border-stone-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-stone-50 dark:bg-stone-900/50 border-b border-stone-100 dark:border-stone-700">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-stone-500 ">Order ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-500 ">Customer</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-500 ">Amount</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-500 ">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-500  text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-700">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-stone-50 dark:hover:bg-stone-900/30 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono text-stone-500 dark:text-stone-400">#{order._id.slice(-8).toUpperCase()}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm dark:text-white">{order.shippingAddress?.fullName || 'Customer'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-sm dark:text-white">₹{order.totalAmount}</td>
                    <td className="px-6 py-4">
                      <select 
                        value={order.status}
                        onChange={(e) => onUpdateStatus(order._id, e.target.value)}
                        className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase border-none focus:ring-0 cursor-pointer ${
                          order.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' : 
                          order.status === 'processing' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => onViewDetail(order)} className="p-2 text-stone-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
};

const OrderDetailModal = ({ order, onClose }) => {
    if (!order) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-stone-900 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="p-10">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <p className="text-[10px] font-bold text-stone-400  mb-1">Detailed Order Summary</p>
                            <h2 className="text-3xl font-bold dark:text-white ">#{order._id.toUpperCase()}</h2>
                        </div>
                        <button onClick={onClose} className="p-3 bg-stone-100 dark:bg-stone-800 rounded-full text-stone-500 hover:bg-red-50 hover:text-red-600 transition-colors">
                            <XCircle className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-10 mb-10">
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-stone-50 dark:bg-stone-800 flex items-center justify-center text-stone-400">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-stone-400 ">Customer Details</p>
                                    <p className="font-bold dark:text-white">{order.shippingAddress?.fullName}</p>
                                    <p className="text-xs text-stone-500">{order.shippingAddress?.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-stone-50 dark:bg-stone-800 flex items-center justify-center text-stone-400">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-stone-400 ">Shipping Address</p>
                                    <p className="text-xs font-bold dark:text-white leading-relaxed">
                                        {order.shippingAddress?.street}, {order.shippingAddress?.city}<br/>
                                        {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <p className="text-[10px] font-bold text-stone-400  mb-2">Order Timeline</p>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                        <p className="text-xs font-bold dark:text-white">Created: {new Date(order.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${order.status === 'delivered' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                                        <p className="text-xs font-bold text-blue-600 ">Status: {order.status}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-100 dark:border-stone-700">
                        <h3 className="font-bold text-stone-900 dark:text-white  text-xs mb-4">Items Ordered</h3>
                        <div className="space-y-3">
                            {order.items?.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-stone-900 flex items-center justify-center text-[10px] font-bold text-stone-400">
                                            #{String(item.productId || item.product).slice(-4)}
                                        </div>
                                        <p className="font-bold dark:text-white">Quantity: {item.quantity}</p>
                                    </div>
                                    <p className="font-bold text-blue-600">₹{item.price * item.quantity}</p>
                                </div>
                            ))}
                            <div className="pt-4 mt-4 border-t border-stone-200 dark:border-stone-700 flex justify-between items-baseline">
                                <p className="font-bold text-stone-900 dark:text-white  text-xs">Total Amount Paid</p>
                                <p className="text-3xl font-bold text-blue-600">₹{order.totalAmount}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Admin Portal Component ---

const AdminPortal = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [users, setUsers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ users: 0, sellers: 0, products: 0, orders: 0 });

  // Detail Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [usersRes, sellersRes, productsRes, ordersRes, reviewsRes] = await Promise.all([
        adminApi.getAllUsers(),
        adminApi.getAllSellers(),
        adminApi.getAllProducts(),
        adminApi.getAllOrders(),
        adminApi.getAllReviews()
      ]);

      setUsers(usersRes.data.users || []);
      setSellers(sellersRes.data.users || []);
      setProducts(productsRes.data.data || []);
      setOrders(ordersRes.data.orders || []);
      setReviews(reviewsRes.data.data || []);
      
      setStats({
        users: usersRes.data.users?.length || 0,
        sellers: sellersRes.data.users?.length || 0,
        products: productsRes.data.data?.length || 0,
        orders: ordersRes.data.orders?.length || 0
      });
    } catch (error) {
      console.error('Failed to fetch admin data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSeller = async (id) => {
    try {
      await adminApi.approveSeller(id);
      fetchAllData();
    } catch (err) { console.error(err); }
  };

  const handleRejectSeller = async (id) => {
    if (window.confirm('Are you sure you want to reject this seller?')) {
      try {
        await adminApi.rejectSeller(id);
        fetchAllData();
      } catch (err) { console.error(err); }
    }
  };

  const handleToggleProduct = async (id) => {
    try {
      await adminApi.toggleProductStatus(id);
      fetchAllData();
    } catch (err) { console.error(err); }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await adminApi.deleteProduct(id);
        fetchAllData();
      } catch (err) { console.error(err); }
    }
  };

  const handleDeleteReview = async (id) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
        try {
            await adminApi.deleteReview(id);
            fetchAllData();
        } catch (err) { console.error(err); }
    }
  };

  const handleUpdateOrderStatus = async (id, status) => {
    try {
      await adminApi.updateOrderStatus(id, status);
      fetchAllData();
    } catch (err) { console.error(err); }
  };

  if (loading && stats.users === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-900">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex font-sans">
      {/* Sidebar */}
      <aside className="w-60 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 flex flex-col hidden lg:flex fixed h-full z-20">
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold text-stone-800 dark:text-white tracking-tight">Admin</span>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          <SidebarLink active={activeTab === 'overview'} icon={<LayoutDashboard />} label="Overview" onClick={() => setActiveTab('overview')} />
          <SidebarLink active={activeTab === 'users'} icon={<Users />} label="Users" onClick={() => setActiveTab('users')} />
          <SidebarLink active={activeTab === 'sellers'} icon={<ShieldCheck />} label="Sellers" onClick={() => setActiveTab('sellers')} />
          <SidebarLink active={activeTab === 'products'} icon={<Package />} label="Products" onClick={() => setActiveTab('products')} />
          <SidebarLink active={activeTab === 'reviews'} icon={<MessageSquare />} label="Reviews" onClick={() => setActiveTab('reviews')} />
          <SidebarLink active={activeTab === 'orders'} icon={<ShoppingBag />} label="Orders" onClick={() => setActiveTab('orders')} />
        </nav>

        <div className="p-3 mt-auto">
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center text-blue-600 text-sm font-semibold">
                A
              </div>
              <div className="overflow-hidden flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-stone-800 dark:text-white">Admin</p>
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

      {/* Main Content */}
      <main className="flex-1 lg:ml-60 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-100 dark:border-stone-800 px-8 py-4 flex items-center justify-between z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold dark:text-white capitalize">{activeTab.replace('-', ' ')}</h2>
            <span className="text-stone-300 dark:text-stone-700">|</span>
            <p className="text-sm text-stone-500 hidden md:block font-medium">Network Status: <span className="text-emerald-500 font-bold uppercase er">Live</span></p>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-all text-stone-500">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <div className="relative cursor-pointer p-2.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-all">
                <Bell className="h-5 w-5 text-stone-500" />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-blue-500 border-2 border-white dark:border-stone-900 rounded-full"></span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-stone-50 dark:bg-stone-950">
          {activeTab === 'overview' && <OverviewView stats={stats} setActiveTab={setActiveTab} />}
          {activeTab === 'users' && <UserManagementView users={users} loading={loading} onViewDetail={setSelectedUser} />}
          {activeTab === 'sellers' && <SellerManagementView sellers={sellers} onApprove={handleApproveSeller} onReject={handleRejectSeller} onViewDetail={setSelectedUser} />}
          {activeTab === 'products' && <ProductManagementView products={products} onToggleStatus={handleToggleProduct} onDelete={handleDeleteProduct} />}
          {activeTab === 'reviews' && <ReviewManagementView reviews={reviews} onDelete={handleDeleteReview} />}
          {activeTab === 'orders' && <OrderManagementView orders={orders} onUpdateStatus={handleUpdateOrderStatus} onViewDetail={setSelectedOrder} />}
        </div>
      </main>

      {/* Modals */}
      {selectedUser && <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
      {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </div>
  );
};

const SidebarLink = ({ active, icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium text-sm ${
      active 
      ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' 
      : 'text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-700'
    }`}
  >
    {React.cloneElement(icon, { className: 'h-[18px] w-[18px]' })}
    {label}
  </button>
);

export default AdminPortal;
