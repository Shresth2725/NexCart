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

  const cart = { items, totalPrice };

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
        key: import.meta.env.VITE_RAZORPAY_KEY,
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
          setOrderMsg('Payment successful! Your order has been placed.');
          setCart(null);
          setTimeout(() => navigate('/orders'), 2000);
        },
        prefill: { name: user?.name || '', email: user?.email || '' },
        theme: { color: '#2563eb' },
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
        <div className="p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-stone-900 dark:text-white tracking-tight">Shopping bag</h1>
                <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">Review your items and complete your purchase.</p>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                </div>
            ) : error ? (
                <div className="p-6 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-200 dark:border-red-800 text-center">
                    <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
                </div>
            ) : (!cart || !cart.items || cart.items.length === 0) && !orderMsg ? (
                <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 max-w-xl mx-auto">
                    <ShoppingBag className="h-12 w-12 text-stone-300 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-stone-700 dark:text-stone-200">Your bag is empty</h3>
                    <p className="text-stone-400 text-sm mb-5">Start shopping to add items here.</p>
                    <button onClick={() => navigate('/home')} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                        Browse products
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-3">
                        {orderMsg && (
                            <div className={`p-4 rounded-xl text-center text-sm font-medium ${orderMsg.includes('successful') ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-500/10 text-red-600 border border-red-200 dark:border-red-800'}`}>
                                {orderMsg}
                            </div>
                        )}
                        {cart?.items.map((item) => (
                            <div key={item.productId} className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 flex gap-5 group hover:border-stone-300 dark:hover:border-stone-700 transition-colors">
                                <div className="w-24 h-24 bg-stone-100 dark:bg-stone-800 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                                    <Package className="h-8 w-8 text-stone-300" />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-semibold text-stone-800 dark:text-stone-100 text-sm truncate">Product #{String(item.productId).slice(-8).toUpperCase()}</h4>
                                            <button onClick={() => handleRemoveItem(item.productId)} className="text-stone-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <p className="text-xl font-bold text-stone-900 dark:text-white mt-1">₹{item.price}</p>
                                    </div>

                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-lg p-0.5 border border-stone-200 dark:border-stone-700">
                                            <button
                                                onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                                                disabled={updatingItem === item.productId || item.quantity <= 1}
                                                className="w-8 h-8 flex items-center justify-center text-stone-500 hover:bg-white dark:hover:bg-stone-700 rounded-md transition-colors disabled:opacity-30"
                                            >
                                                <Minus className="h-3.5 w-3.5" />
                                            </button>
                                            <span className="w-9 text-center text-sm font-semibold text-stone-700 dark:text-white">
                                                {updatingItem === item.productId ? <Loader2 className="h-3 w-3 animate-spin mx-auto" /> : item.quantity}
                                            </span>
                                            <button
                                                onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                                                disabled={updatingItem === item.productId}
                                                className="w-8 h-8 flex items-center justify-center text-stone-500 hover:bg-white dark:hover:bg-stone-700 rounded-md transition-colors disabled:opacity-30"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                        <p className="text-sm text-stone-500">Subtotal: <span className="font-semibold text-stone-800 dark:text-white">₹{item.price * item.quantity}</span></p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 sticky top-24">
                            <h2 className="text-lg font-bold text-stone-900 dark:text-white mb-5">Order summary</h2>
                            
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-stone-500">Subtotal</span>
                                    <span className="font-semibold text-stone-800 dark:text-white">₹{cart.totalPrice}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-stone-500">Shipping</span>
                                    <span className="text-emerald-600 font-medium">Free</span>
                                </div>
                                <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex justify-between items-baseline">
                                    <span className="text-stone-900 dark:text-white font-semibold">Total</span>
                                    <span className="text-2xl font-bold text-stone-900 dark:text-white">₹{cart.totalPrice}</span>
                                </div>
                            </div>

                            {!showCheckout ? (
                                <button
                                    onClick={() => setShowCheckout(true)}
                                    className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm active:scale-[0.98]"
                                >
                                    Checkout
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            ) : (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-stone-700 dark:text-stone-200 text-sm">Delivery address</h3>
                                        {!showAddressForm && (
                                            <button onClick={() => setShowAddressForm(true)} className="text-xs font-medium text-blue-600 hover:underline">+ New</button>
                                        )}
                                    </div>

                                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                                        {addresses.map((addr) => (
                                            <label key={addr._id} className={`block p-3 rounded-xl cursor-pointer transition-all border ${selectedAddress === addr._id ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/5' : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800'}`}>
                                                <div className="flex items-start gap-2.5">
                                                    <input type="radio" name="address" checked={selectedAddress === addr._id} onChange={() => setSelectedAddress(addr._id)} className="mt-0.5 accent-blue-600" />
                                                    <div>
                                                        <p className="text-sm font-semibold text-stone-800 dark:text-white">{addr.fullName}</p>
                                                        <p className="text-xs text-stone-500 mt-0.5">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>

                                    {showAddressForm && (
                                        <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-2">
                                            <input type="text" placeholder="Full Name" value={newAddress.fullName} onChange={e => setNewAddress({...newAddress, fullName: e.target.value})} className="w-full p-2 bg-white dark:bg-stone-900 rounded-lg text-xs border border-stone-200 dark:border-stone-700 outline-none text-stone-700 dark:text-white" />
                                            <input type="text" placeholder="Street" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className="w-full p-2 bg-white dark:bg-stone-900 rounded-lg text-xs border border-stone-200 dark:border-stone-700 outline-none text-stone-700 dark:text-white" />
                                            <div className="flex gap-2">
                                                <input type="text" placeholder="City" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="w-full p-2 bg-white dark:bg-stone-900 rounded-lg text-xs border border-stone-200 dark:border-stone-700 outline-none text-stone-700 dark:text-white" />
                                                <input type="text" placeholder="PIN" value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} className="w-full p-2 bg-white dark:bg-stone-900 rounded-lg text-xs border border-stone-200 dark:border-stone-700 outline-none text-stone-700 dark:text-white" />
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={handleAddAddress} className="flex-1 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg">Save</button>
                                                <button onClick={() => setShowAddressForm(false)} className="flex-1 py-2 bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-medium rounded-lg">Cancel</button>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={handlePlaceOrder}
                                        disabled={placingOrder || !selectedAddress}
                                        className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-sm active:scale-[0.98]"
                                    >
                                        {placingOrder ? <Loader2 className="animate-spin h-4 w-4" /> : <><ShieldCheck className="h-4 w-4" /> Pay now</>}
                                    </button>
                                    
                                    <div className="flex items-center justify-center gap-1.5 text-stone-400 text-xs">
                                        <CreditCard className="h-3 w-3" />
                                        Secured by Razorpay
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
