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

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/auth/getAddresses');
      setAddresses(res.data.addresses || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchAddresses(); }, []);

  if (loading) return <Loader2 className="animate-spin mx-auto h-10 w-10 text-indigo-600" />;

  return (
    <div className="space-y-6">
        <h2 className="text-xl font-black dark:text-white">Saved Addresses</h2>
        {addresses.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                <MapPin className="mx-auto text-gray-300 h-10 w-10 mb-2" />
                <p className="text-gray-500">No saved addresses found.</p>
            </div>
        ) : (
            <div className="grid gap-4">
            {addresses.map(addr => (
                <div key={addr._id} className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 flex justify-between items-center group hover:border-indigo-500 transition-all">
                    <div>
                        <p className="font-bold dark:text-white">{addr.street}</p>
                        <p className="text-sm text-gray-500">{addr.city}, {addr.state} - {addr.pincode}</p>
                    </div>
                    <button className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 size={18} />
                    </button>
                </div>
            ))}
            </div>
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