import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/axios';
import { User, KeyRound, MapPin, Package, Palette, Loader2, Trash2, Star, Search, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CustomerLayout from '../../components/CustomerLayout';

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'orders', label: 'Order History', icon: Package },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'password', label: 'Security', icon: KeyRound },
    { id: 'preferences', label: 'Preferences', icon: Palette },
  ];

  return (
    <CustomerLayout 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={() => navigate(`/home?search=${encodeURIComponent(searchQuery)}`)}
    >
        <div className="p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-stone-900 dark:text-white tracking-tight">Settings</h1>
                <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">Manage your profile, security, and preferences.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Tab Sidebar */}
                <div className="lg:w-56 flex-shrink-0">
                    <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-2 space-y-0.5">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                                        ${isActive
                                            ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                            : 'text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                                        }`}
                                >
                                    <Icon className="h-[18px] w-[18px]" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tab Content */}
                <div key={activeTab} className="flex-1 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 animate-fade-in">
                    {activeTab === 'profile' && <ProfileTab />}
                    {activeTab === 'orders' && <OrdersTab />}
                    {activeTab === 'addresses' && <AddressesTab />}
                    {activeTab === 'password' && <PasswordTab />}
                    {activeTab === 'preferences' && <PreferencesTab />}
                </div>
            </div>
        </div>
    </CustomerLayout>
  );
};

export default Settings;

// --- Tab Components ---

const inputClass = "w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm text-stone-700 dark:text-stone-200 transition-all";

const ProfileTab = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      await api.post('/auth/updateUser', formData);
      setUser({ ...user, ...formData });
      setMsg('Profile updated successfully!');
    } catch (err) {
      setMsg('Update failed');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleUpdate} className="space-y-5 max-w-lg">
      <h2 className="text-lg font-bold text-stone-900 dark:text-white">Profile</h2>
      <div className="space-y-4">
        <div>
            <label className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-1.5 block">Full Name</label>
            <input
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className={inputClass}
            />
        </div>
        <div>
            <label className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-1.5 block">Email</label>
            <input value={formData.email} disabled className={inputClass + ' opacity-50 cursor-not-allowed'} />
        </div>
        <div>
            <label className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-1.5 block">Phone</label>
            <input
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className={inputClass}
            />
        </div>
      </div>

      {msg && <p className={`text-sm font-medium ${msg.includes('success') ? 'text-emerald-600' : 'text-red-600'}`}>{msg}</p>}

      <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors active:scale-[0.98] flex items-center gap-2">
        {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Save changes'}
      </button>
    </form>
  );
};

const PasswordTab = () => {
    const [formData, setFormData] = useState({ oldPassword: '', newPassword: '' });
    const [loading, setLoading] = useState(false);
  
    const handleUpdate = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        await api.post('/auth/updatePassword', formData);
        alert('Password updated successfully');
      } catch {
        alert('Update failed');
      }
      setLoading(false);
    };
  
    return (
      <form onSubmit={handleUpdate} className="space-y-5 max-w-md">
        <h2 className="text-lg font-bold text-stone-900 dark:text-white">Security</h2>
        <div className="space-y-4">
            <input type="password" placeholder="Current password"
                onChange={e => setFormData({ ...formData, oldPassword: e.target.value })}
                className={inputClass}
            />
            <input type="password" placeholder="New password"
                onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                className={inputClass}
            />
        </div>
        <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors active:scale-[0.98]">
          {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Update password'}
        </button>
      </form>
    );
};

const AddressesTab = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/auth/auth/getAddresses');
      setAddresses(res.data.addresses || []);
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAddresses(); }, []);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      await api.post('/auth/auth/addAddress', newAddress);
      await fetchAddresses();
      setShowAddForm(false);
      setNewAddress({ street: '', city: '', state: '', pincode: '', country: 'India' });
    } catch (err) {
      alert('Failed to add address');
    }
    setSubmitLoading(false);
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await api.post(`/authauth/removeAddress/${addressId}`);
      await fetchAddresses();
    } catch (err) {
      alert('Failed to delete address');
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-stone-900 dark:text-white">Addresses</h2>
        {!showAddForm && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            + Add new
          </button>
        )}
      </div>

      {showAddForm ? (
        <form onSubmit={handleAddAddress} className="bg-stone-50 dark:bg-stone-800/50 p-5 rounded-xl border border-stone-200 dark:border-stone-700 space-y-3 animate-fade-in">
          <div>
            <label className="text-sm font-medium text-stone-500 mb-1.5 block">Street</label>
            <input
              required
              value={newAddress.street}
              onChange={e => setNewAddress({...newAddress, street: e.target.value})}
              placeholder="123 Main Street"
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-stone-500 mb-1.5 block">City</label>
              <input required value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-500 mb-1.5 block">State</label>
              <input required value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-stone-500 mb-1.5 block">Pincode</label>
              <input required value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-500 mb-1.5 block">Country</label>
              <input required value={newAddress.country} onChange={e => setNewAddress({...newAddress, country: e.target.value})} className={inputClass} />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={submitLoading} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors flex justify-center items-center gap-2">
              {submitLoading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Save address'}
            </button>
            <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 py-2.5 rounded-xl text-sm font-medium hover:bg-stone-300 dark:hover:bg-stone-600 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          {addresses.length === 0 ? (
            <div className="text-center py-10 bg-stone-50 dark:bg-stone-800/30 rounded-xl border border-dashed border-stone-300 dark:border-stone-700">
              <MapPin className="mx-auto text-stone-300 dark:text-stone-600 h-10 w-10 mb-2" />
              <p className="text-stone-400 text-sm">No saved addresses.</p>
              <button 
                onClick={() => setShowAddForm(true)}
                className="mt-3 text-blue-600 text-sm font-medium hover:underline"
              >
                Add your first address
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map(addr => (
                <div key={addr._id} className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 flex justify-between items-center group hover:border-stone-300 dark:hover:border-stone-600 transition-colors">
                  <div className="flex gap-3 items-center">
                    <div className="w-9 h-9 rounded-lg bg-white dark:bg-stone-800 flex items-center justify-center text-blue-600 border border-stone-200 dark:border-stone-700">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-stone-800 dark:text-stone-100 text-sm">{addr.street}</p>
                      <p className="text-xs text-stone-400">{addr.city}, {addr.state} — {addr.pincode}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteAddress(addr._id)}
                    className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const OrdersTab = () => {
    const navigate = useNavigate();
    return (
        <div className="text-center py-8">
            <Package className="mx-auto h-10 w-10 text-blue-600 mb-3" />
            <h3 className="text-lg font-bold text-stone-800 dark:text-white">Order history</h3>
            <p className="text-stone-400 text-sm mb-5">View and manage all your past purchases.</p>
            <button 
                onClick={() => navigate('/orders')}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
                View orders
            </button>
        </div>
    );
};

const PreferencesTab = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-5">
        <h2 className="text-lg font-bold text-stone-900 dark:text-white">Preferences</h2>
        <div className="flex justify-between items-center p-4 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
            <div>
                <p className="font-medium text-stone-800 dark:text-stone-100 text-sm">Dark mode</p>
                <p className="text-xs text-stone-400 mt-0.5">Switch between light and dark theme.</p>
            </div>
            <button 
                onClick={toggleTheme} 
                className={`w-12 h-7 rounded-full p-0.5 transition-colors ${theme === 'dark' ? 'bg-blue-600' : 'bg-stone-300'}`}
            >
                <div className={`w-6 h-6 rounded-full bg-white shadow-sm transform transition-transform ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
        </div>
    </div>
  );
};