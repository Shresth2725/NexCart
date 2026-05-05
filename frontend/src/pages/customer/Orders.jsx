import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  Loader2, 
  Package, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  Box,
  ShoppingBag,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CustomerLayout from '../../components/CustomerLayout';

import { useSelector, useDispatch } from 'react-redux';
import { fetchOrders } from '../../store/slices/ordersSlice';

const Orders = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { list: orders, loading } = useSelector(state => state.orders);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'shipped': return <Truck className="h-4 w-4 text-blue-500" />;
      default: return <Clock className="h-4 w-4 text-amber-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400';
      case 'cancelled': return 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400';
      case 'shipped': return 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400';
      default: return 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400';
    }
  };

  return (
    <CustomerLayout 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={() => navigate(`/home?search=${encodeURIComponent(searchQuery)}`)}
    >
        <div className="p-8">
          <div className="mb-10">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">My Purchases</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Track and manage your recent orders.</p>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
            </div>
          ) : (
            <div className="max-w-4xl space-y-6">
              {orders.map((order) => (
                <div 
                  key={order._id}
                  className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                          <Box className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order ID</p>
                          <p className="text-sm font-black dark:text-white font-mono">#{order._id.slice(-8).toUpperCase()}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Placed On</p>
                          <p className="text-xs font-bold dark:text-white">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {order.items?.map((item, idx) => (
                        <div key={item._id || idx} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                                <Package className="h-5 w-5 text-gray-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold dark:text-white">Product #{String(item.productId || item.product).slice(-6).toUpperCase()}</p>
                                <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                            </div>
                          </div>
                          {item.price && (
                            <p className="font-bold dark:text-white">₹{item.price * item.quantity}</p>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-50 dark:border-gray-700/50 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Amount</p>
                        <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">₹{order.totalAmount}</p>
                      </div>
                      
                      <div className="flex gap-3">
                         <button className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-2xl text-xs font-bold hover:bg-gray-200 transition-all">
                            View Details
                         </button>
                         {order.status === 'pending' && (
                            <button className="px-6 py-2.5 bg-red-50 text-red-600 rounded-2xl text-xs font-bold hover:bg-red-100 transition-all">
                                Cancel Order
                            </button>
                         )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {orders.length === 0 && (
                <div className="py-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                    <ShoppingBag className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold dark:text-white">No orders yet</h3>
                  <button onClick={() => navigate('/home')} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">Start Shopping</button>
                </div>
              )}
            </div>
          )}
        </div>
    </CustomerLayout>
  );
};

export default Orders;
