import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Trash2, Minus, Plus, ShoppingBag, Package, Loader2, ArrowRight, MapPin, CreditCard, ShieldCheck } from 'lucide-react';
import CustomerLayout from '../../components/CustomerLayout';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCart } from '../../store/slices/cartSlice';

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const { items, totalPrice, loading: cartLoading } = useSelector(state => state.cart);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingItem, setUpdatingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Checkout
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderMsg, setOrderMsg] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    dispatch(fetchCart()).finally(() => setLoading(false));
    fetchAddresses();
  }, [dispatch]);

  const cart = { items, totalPrice }; // Mocking original cart structure for minimal refactor

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/auth/auth/getAddresses');
      const addrs = res.data.addresses || [];
      setAddresses(addrs);
      const defaultAddr = addrs.find(a => a.isDefault);
      if (defaultAddr) setSelectedAddress(defaultAddr._id);
      else if (addrs.length > 0) setSelectedAddress(addrs[0]._id);
    } catch {}
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setUpdatingItem(productId);
    try {
      await api.put('/cart/cart/update', { productId, quantity: newQuantity });
      await dispatch(fetchCart());
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update quantity');
    }
    setUpdatingItem(null);
  };

  const handleRemoveItem = async (productId) => {
    setUpdatingItem(productId);
    try {
      await api.delete('/cart/cart/delete', { data: { productId } });
      await dispatch(fetchCart());
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove item');
    }
    setUpdatingItem(null);
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/auth/addAddress', newAddress);
      setShowAddressForm(false);
      setNewAddress({ fullName: '', phone: '', street: '', city: '', state: '', pincode: '', country: 'India' });
      await fetchAddresses();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add address');
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setOrderMsg('Please select a delivery address');
      return;
    }
    setPlacingOrder(true);
    setOrderMsg('');
    try {
      const items = cart.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      }));

      const orderRes = await api.post('/order/user/', {
        items,
        totalAmount: cart.totalPrice,
        addressId: selectedAddress,
      });

      const orderId = orderRes.data.order._id;
      const amount = cart.totalPrice;

      const paymentRes = await api.post('/payment/payment/create', { orderId, amount });
      const razorpayOrder = paymentRes.data.razorpayOrder;

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setOrderMsg('Failed to load payment gateway');
        setPlacingOrder(false);
        return;
      }

      const options = {
        key: 'rzp_test_Sg6XtFyuas05jM',
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'NexCart',
        description: `Order #${orderId}`,
        order_id: razorpayOrder.id,
        handler: async function (response) {
          try {
            await api.post('/payment/payment/verify-client', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
            });
            await api.delete('/cart/cart/clear');
          } catch (e) {}
          setOrderMsg('🎉 Payment successful! Order placed.');
          setCart(null);
          setTimeout(() => navigate('/orders'), 2000);
        },
        prefill: { name: user?.name || '', email: user?.email || '' },
        theme: { color: '#4f46e5' },
        modal: { ondismiss: () => setPlacingOrder(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setOrderMsg(err.response?.data?.message || 'Failed to place order');
      setPlacingOrder(false);
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
                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Shopping Bag</h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Review your items and complete your purchase.</p>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                </div>
            ) : error ? (
                <div className="p-8 bg-red-50 dark:bg-red-500/10 rounded-3xl border border-red-100 dark:border-red-500/20 text-center">
                    <p className="text-red-600 dark:text-red-400 font-bold">{error}</p>
                </div>
            ) : (!cart || !cart.items || cart.items.length === 0) && !orderMsg ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm max-w-2xl mx-auto">
                    <ShoppingBag className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold dark:text-white">Your bag is empty</h3>
                    <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
                    <button onClick={() => navigate('/home')} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all">
                        Go Shopping
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {orderMsg && (
                            <div className={`p-4 rounded-2xl text-center text-sm font-bold shadow-sm ${orderMsg.includes('success') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                {orderMsg}
                            </div>
                        )}
                        {cart?.items.map((item) => (
                            <div key={item.productId} className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-6 flex gap-6 hover:shadow-md transition-shadow group">
                                <div className="w-28 h-28 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden border border-gray-100 dark:border-gray-700">
                                    <Package className="h-10 w-10 text-gray-300" />
                                </div>
                                <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-gray-900 dark:text-white truncate uppercase tracking-tight">Product #{String(item.productId).slice(-8).toUpperCase()}</h4>
                                            <button onClick={() => handleRemoveItem(item.productId)} className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                        <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">₹{item.price}</p>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center bg-gray-50 dark:bg-gray-900 rounded-xl p-1 border border-gray-100 dark:border-gray-700">
                                            <button
                                                onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                                                disabled={updatingItem === item.productId || item.quantity <= 1}
                                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all disabled:opacity-30"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </button>
                                            <span className="w-10 text-center text-sm font-black dark:text-white">
                                                {updatingItem === item.productId ? <Loader2 className="h-3 w-3 animate-spin mx-auto" /> : item.quantity}
                                            </span>
                                            <button
                                                onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                                                disabled={updatingItem === item.productId}
                                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all disabled:opacity-30"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Subtotal: <span className="text-gray-900 dark:text-white font-black">₹{item.price * item.quantity}</span></p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-8 sticky top-24 shadow-sm">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight">Order Summary</h2>
                            
                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-bold uppercase tracking-widest">Subtotal</span>
                                    <span className="font-black dark:text-white text-lg">₹{cart.totalPrice}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-bold uppercase tracking-widest">Shipping</span>
                                    <span className="text-emerald-600 font-black tracking-widest">FREE</span>
                                </div>
                                <div className="pt-4 border-t border-gray-50 dark:border-gray-700 flex justify-between items-baseline">
                                    <span className="text-gray-900 dark:text-white font-black text-lg uppercase tracking-tight">Total</span>
                                    <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">₹{cart.totalPrice}</span>
                                </div>
                            </div>

                            {!showCheckout ? (
                                <button
                                    onClick={() => setShowCheckout(true)}
                                    className="w-full py-4 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 group active:scale-95"
                                >
                                    Proceed to Checkout
                                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            ) : (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-black text-gray-800 dark:text-white text-xs uppercase tracking-widest">Delivery Address</h3>
                                        {!showAddressForm && (
                                            <button onClick={() => setShowAddressForm(true)} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">+ New</button>
                                        )}
                                    </div>

                                    <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                                        {addresses.map((addr) => (
                                            <label key={addr._id} className={`block p-4 rounded-2xl cursor-pointer transition-all border-2 ${selectedAddress === addr._id ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-500/5' : 'border-gray-50 dark:border-gray-900 bg-gray-50 dark:bg-gray-900/50'}`}>
                                                <div className="flex items-start gap-3">
                                                    <input type="radio" name="address" checked={selectedAddress === addr._id} onChange={() => setSelectedAddress(addr._id)} className="mt-1 accent-indigo-600" />
                                                    <div>
                                                        <p className="text-sm font-black dark:text-white">{addr.fullName}</p>
                                                        <p className="text-[11px] text-gray-500 leading-relaxed mt-1">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>

                                    {showAddressForm && (
                                        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 space-y-3">
                                            <input type="text" placeholder="Full Name" value={newAddress.fullName} onChange={e => setNewAddress({...newAddress, fullName: e.target.value})} className="w-full p-2 bg-white dark:bg-gray-800 rounded-xl text-xs border-none outline-none dark:text-white" />
                                            <input type="text" placeholder="Street" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className="w-full p-2 bg-white dark:bg-gray-800 rounded-xl text-xs border-none outline-none dark:text-white" />
                                            <div className="flex gap-2">
                                                <input type="text" placeholder="City" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="w-full p-2 bg-white dark:bg-gray-800 rounded-xl text-xs border-none outline-none dark:text-white" />
                                                <input type="text" placeholder="PIN" value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} className="w-full p-2 bg-white dark:bg-gray-800 rounded-xl text-xs border-none outline-none dark:text-white" />
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={handleAddAddress} className="flex-1 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-lg">Save</button>
                                                <button onClick={() => setShowAddressForm(false)} className="flex-1 py-2 bg-gray-200 text-gray-700 text-[10px] font-black uppercase rounded-lg">Cancel</button>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={handlePlaceOrder}
                                        disabled={placingOrder || !selectedAddress}
                                        className="w-full py-4 bg-emerald-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-95"
                                    >
                                        {placingOrder ? <Loader2 className="animate-spin h-5 w-5" /> : <><ShieldCheck className="h-5 w-5" /> Pay Now</>}
                                    </button>
                                    
                                    <div className="flex items-center justify-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-tighter">
                                        <CreditCard className="h-3 w-3" />
                                        Secure Payment via Razorpay
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    </CustomerLayout>
  );
};

export default Cart;
