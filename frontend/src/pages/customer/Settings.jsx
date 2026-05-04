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
    { id: 'profile', label: 'Profile Settings', icon: User },
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
        <div className="p-8">
            <div className="flex gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                    <User className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Account Hub</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Manage your profile, security, and preferences.</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Tab Sidebar */}
                <div className="lg:w-64 flex-shrink-0">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-3 space-y-1">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-bold transition-all
                                        ${isActive
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                            : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-400'
                                        }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tab Content */}
                <div key={activeTab} className="flex-1 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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

// --- Tab Components (Keep as is but update styles) ---

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
    <form onSubmit={handleUpdate} className="space-y-6 max-w-xl">
      <h2 className="text-xl font-black dark:text-white">Profile Information</h2>
      <div className="space-y-4">
        <div>
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Full Name</label>
            <input
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white"
            />
        </div>
        <div>
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Email Address</label>
            <input value={formData.email} disabled className="w-full p-3 rounded-2xl bg-gray-100 dark:bg-gray-900/50 border-none text-gray-500 cursor-not-allowed" />
        </div>
        <div>
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Phone Number</label>
            <input
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white"
            />
        </div>
      </div>

      {msg && <p className={`text-sm font-bold ${msg.includes('success') ? 'text-emerald-600' : 'text-red-600'}`}>{msg}</p>}

      <button className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center gap-2">
        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Save Changes'}
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
      <form onSubmit={handleUpdate} className="space-y-6 max-w-md">
        <h2 className="text-xl font-black dark:text-white">Security</h2>
        <div className="space-y-4">
            <input type="password" placeholder="Current Password"
                onChange={e => setFormData({ ...formData, oldPassword: e.target.value })}
                className="w-full p-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white"
            />
            <input type="password" placeholder="New Password"
                onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                className="w-full p-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white"
            />
        </div>
        <button className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-600/20">
          {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Update Password'}
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

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-10 w-10 text-indigo-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black dark:text-white">Your Addresses</h2>
        {!showAddForm && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="text-sm font-black text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            + Add New
          </button>
        )}
      </div>

      {showAddForm ? (
        <form onSubmit={handleAddAddress} className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 space-y-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Street Address</label>
              <input
                required
                value={newAddress.street}
                onChange={e => setNewAddress({...newAddress, street: e.target.value})}
                placeholder="e.g. 123 Luxury Lane"
                className="w-full p-3 rounded-2xl bg-white dark:bg-gray-800 border-none outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">City</label>
                <input
                  required
                  value={newAddress.city}
                  onChange={e => setNewAddress({...newAddress, city: e.target.value})}
                  className="w-full p-3 rounded-2xl bg-white dark:bg-gray-800 border-none outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">State</label>
                <input
                  required
                  value={newAddress.state}
                  onChange={e => setNewAddress({...newAddress, state: e.target.value})}
                  className="w-full p-3 rounded-2xl bg-white dark:bg-gray-800 border-none outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Pincode</label>
                <input
                  required
                  value={newAddress.pincode}
                  onChange={e => setNewAddress({...newAddress, pincode: e.target.value})}
                  className="w-full p-3 rounded-2xl bg-white dark:bg-gray-800 border-none outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Country</label>
                <input
                  required
                  value={newAddress.country}
                  onChange={e => setNewAddress({...newAddress, country: e.target.value})}
                  className="w-full p-3 rounded-2xl bg-white dark:bg-gray-800 border-none outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button 
              type="submit"
              disabled={submitLoading}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex justify-center items-center gap-2"
            >
              {submitLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Save Address'}
            </button>
            <button 
              type="button"
              onClick={() => setShowAddForm(false)}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white py-3 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          {addresses.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
              <MapPin className="mx-auto text-gray-300 h-12 w-12 mb-3" />
              <p className="text-gray-500 font-medium">No saved addresses yet.</p>
              <button 
                onClick={() => setShowAddForm(true)}
                className="mt-4 text-indigo-600 font-bold hover:underline"
              >
                Add your first address
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {addresses.map(addr => (
                <div key={addr._id} className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 flex justify-between items-center group hover:border-indigo-500 hover:shadow-md transition-all duration-300">
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-indigo-600 shadow-sm">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{addr.street}</p>
                      <p className="text-sm text-gray-500 font-medium">{addr.city}, {addr.state} - {addr.pincode}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteAddress(addr._id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={20} />
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
        <div className="text-center py-10">
            <Package className="mx-auto h-12 w-12 text-indigo-600 mb-4" />
            <h3 className="text-xl font-black dark:text-white">View Full History</h3>
            <p className="text-gray-500 mb-6">Manage all your past purchases in one dedicated place.</p>
            <button 
                onClick={() => navigate('/orders')}
                className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all"
            >
                Open Orders Hub
            </button>
        </div>
    );
};

const PreferencesTab = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-6">
        <h2 className="text-xl font-black dark:text-white">Preferences</h2>
        <div className="flex justify-between items-center p-5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
            <div>
                <p className="font-bold dark:text-white">Dark Appearance</p>
                <p className="text-xs text-gray-500">Toggle between light and dark themes.</p>
            </div>
            <button 
                onClick={toggleTheme} 
                className={`w-14 h-8 rounded-full p-1 transition-all ${theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-300'}`}
            >
                <div className={`w-6 h-6 rounded-full bg-white shadow-sm transform transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
        </div>
    </div>
  );
};