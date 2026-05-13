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
      case 'delivered': return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
      case 'cancelled': return <XCircle className="h-3.5 w-3.5 text-red-500" />;
      case 'shipped': return <Truck className="h-3.5 w-3.5 text-blue-500" />;
      default: return <Clock className="h-3.5 w-3.5 text-amber-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400';
      case 'cancelled': return 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400';
      case 'shipped': return 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400';
      default: return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';
    }
  };

  return (
    <CustomerLayout 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={() => navigate(`/home?search=${encodeURIComponent(searchQuery)}`)}
    >
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-stone-900 dark:text-white tracking-tight">Orders</h1>
            <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">Track and manage your recent purchases.</p>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
          ) : (
            <div className="max-w-3xl space-y-4">
              {orders.map((order) => (
                <div 
                  key={order._id}
                  className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden hover:border-stone-300 dark:hover:border-stone-700 transition-colors"
                >
                  <div className="p-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600">
                          <Box className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs text-stone-400">Order ID</p>
                          <p className="text-sm font-semibold text-stone-800 dark:text-white font-mono">#{order._id.slice(-8).toUpperCase()}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-stone-400">Placed</p>
                          <p className="text-xs font-medium text-stone-600 dark:text-stone-300">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {order.items?.map((item, idx) => (
                        <div key={item._id || idx} className="flex items-center justify-between p-3 rounded-lg bg-stone-50 dark:bg-stone-800/50">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-md bg-white dark:bg-stone-800 flex items-center justify-center border border-stone-200 dark:border-stone-700">
                                <Package className="h-4 w-4 text-stone-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-stone-700 dark:text-stone-200">Product #{String(item.productId || item.product).slice(-6).toUpperCase()}</p>
                                <p className="text-xs text-stone-400">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          {item.price && (
                            <p className="font-semibold text-sm text-stone-800 dark:text-white">₹{item.price * item.quantity}</p>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-stone-400">Total</p>
                        <p className="text-xl font-bold text-stone-900 dark:text-white">₹{order.totalAmount}</p>
                      </div>
                      
                      <div className="flex gap-2">
                         <button className="px-4 py-2 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-lg text-xs font-medium hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">
                            Details
                         </button>
                         {order.status === 'pending' && (
                            <button className="px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-xs font-medium hover:bg-red-100 dark:hover:bg-red-500/15 transition-colors">
                                Cancel
                            </button>
                         )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {orders.length === 0 && (
                <div className="py-16 text-center space-y-3">
                  <div className="w-14 h-14 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto">
                    <ShoppingBag className="h-6 w-6 text-stone-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-stone-700 dark:text-stone-200">No orders yet</h3>
                  <button onClick={() => navigate('/home')} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Start shopping</button>
                </div>
              )}
            </div>
          )}
        </div>
    </CustomerLayout>
  );
};

export default Orders;
