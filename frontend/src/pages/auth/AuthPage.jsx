import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, UserPlus, KeyRound } from 'lucide-react';

const AuthPage = () => {
  const [mode, setMode] = useState('login'); // 'login', 'signup', 'otp'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Core Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // Default role
  const [phone, setPhone] = useState('');

  // Seller specific states
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');

  // OTP
  const [otp, setOtp] = useState('');

  const { login, register, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const handleRedirect = (userRole) => {
    if (userRole === 'admin') navigate('/admin');
    else if (userRole === 'seller') navigate('/seller');
    else navigate('/home');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await login(email, password);
    if (result.success) {
      handleRedirect(result.role);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Construct payload
    let userData = { name, email, password, role };
    if (phone) userData.phone = phone;
    
    // Add seller info if applicable
    if (role === 'seller') {
      if (!storeName || !storeDescription) {
        setError("Store Name and Description are required for Sellers.");
        setLoading(false);
        return;
      }
      userData.sellerInfo = { storeName, storeDescription };
    }

    const result = await register(userData);
    if (result.success) {
      setSuccessMsg('Registration successful! Please check your email for the OTP.');
      setMode('otp'); // Switch to OTP mode
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    
    const verifyResult = await verifyOtp(email, Number(otp));
    if (verifyResult.success) {
      // Auto-login after successful verification
      const loginResult = await login(email, password);
      if (loginResult.success) {
        handleRedirect(loginResult.role);
      } else {
        setError('OTP Verified, but auto-login failed. Please sign in manually.');
      }
    } else {
      setError(verifyResult.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="rounded-full bg-blue-100 p-4 shadow-sm">
            {mode === 'login' && <LogIn className="h-8 w-8 text-blue-600" />}
            {mode === 'signup' && <UserPlus className="h-8 w-8 text-blue-600" />}
            {mode === 'otp' && <KeyRound className="h-8 w-8 text-blue-600" />}
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          {mode === 'login' ? 'Sign in to your account' : 
           mode === 'signup' ? 'Create a new account' : 
           'Verify your email'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border border-gray-100">
          
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-md">
              <p className="text-sm text-green-700 font-medium">{successMsg}</p>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form className="space-y-5" onSubmit={handleLoginSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition duration-150"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition duration-150"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 mt-6"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          )}

          {/* SIGNUP FORM */}
          {mode === 'signup' && (
            <form className="space-y-5" onSubmit={handleSignupSubmit}>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition duration-150"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="block w-full px-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg border bg-white shadow-sm transition duration-150"
                  >
                    <option value="customer">Customer</option>
                    <option value="seller">Seller</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition duration-150"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  pattern="[0-9]{10}"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition duration-150"
                  placeholder="1234567890"
                />
                <p className="mt-1 text-xs text-gray-500">Must be exactly 10 digits.</p>
              </div>

              {/* Dynamic Seller Fields */}
              {role === 'seller' && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4 mt-2">
                  <h4 className="font-semibold text-gray-700 text-sm">Seller Information</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                    <input
                      type="text"
                      required
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent sm:text-sm"
                      placeholder="My Awesome Store"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Store Description</label>
                    <textarea
                      required
                      value={storeDescription}
                      onChange={(e) => setStoreDescription(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent sm:text-sm"
                      placeholder="We sell the best..."
                      rows="2"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition duration-150"
                  placeholder="••••••••"
                />
                <p className="mt-1 text-xs text-gray-500">Minimum 6 characters.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 mt-6"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* OTP FORM */}
          {mode === 'otp' && (
            <form className="space-y-5" onSubmit={handleOtpSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
                  Enter the 6-digit OTP sent to <br/><span className="font-bold text-blue-600">{email}</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)} // need string
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-2xl text-center tracking-widest transition duration-150"
                  placeholder="000000"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 mt-6"
              >
                {loading ? 'Verifying...' : 'Verify OTP & Login'}
              </button>
            </form>
          )}

          {/* Toggles */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {mode === 'login' ? 'New here?' : mode === 'signup' ? 'Already have an account?' : 'Need to change email?'}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              {mode !== 'signup' && (
                <button
                  onClick={() => { setMode('signup'); setError(''); setSuccessMsg(''); }}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 transition duration-150"
                >
                  Create an account
                </button>
              )}
              {mode !== 'login' && mode !== 'otp' && (
                <button
                  onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 transition duration-150"
                >
                  Sign in instead
                </button>
              )}
              {mode === 'otp' && (
                <button
                  onClick={() => { setMode('signup'); setError(''); setSuccessMsg(''); }}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 transition duration-150"
                >
                  Go back to sign up
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthPage;
