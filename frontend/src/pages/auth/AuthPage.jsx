import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, UserPlus, KeyRound, ArrowRight, Eye, EyeOff } from 'lucide-react';

const AuthPage = () => {
  const [mode, setMode] = useState('login'); // 'login', 'signup', 'otp'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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

  const inputClass = "w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-800 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all duration-200";
  const labelClass = "block text-sm font-medium text-stone-600 dark:text-stone-400 mb-1.5";

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex">
      {/* Left decorative panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-8">
            <span className="text-2xl font-bold tracking-tight">NexCart</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Shopping made<br />simple and fast.
          </h1>
          <p className="text-blue-200 text-base max-w-sm leading-relaxed">
            Join thousands of happy customers. Browse curated products, checkout in seconds, and get doorstep delivery.
          </p>
          <div className="mt-12 flex items-center gap-6 text-sm text-blue-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-xs">✦</span>
              </div>
              <span>Free shipping</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-xs">✦</span>
              </div>
              <span>Secure payment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-16">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <span className="text-xl font-bold text-stone-800 dark:text-white">NexCart</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-stone-900 dark:text-white">
              {mode === 'login' ? 'Welcome back' : 
               mode === 'signup' ? 'Create your account' : 
               'Verify your email'}
            </h2>
            <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
              {mode === 'login' ? 'Enter your credentials to access your account.' : 
               mode === 'signup' ? 'Fill in your details to get started.' : 
               `We sent a code to ${email}`}
            </p>
          </div>
          
          {error && (
            <div className="mb-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 rounded-xl">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-4 py-3 rounded-xl">
              <p className="text-sm text-emerald-700 dark:text-emerald-400">{successMsg}</p>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form className="space-y-4" onSubmit={handleLoginSubmit}>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className={labelClass}>Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass + ' pr-11'}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 mt-2"
              >
                {loading ? 'Signing in…' : 'Sign in'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          )}

          {/* SIGNUP FORM */}
          {mode === 'signup' && (
            <form className="space-y-4" onSubmit={handleSignupSubmit}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className={labelClass}>Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className={inputClass}
                  >
                    <option value="customer">Customer</option>
                    <option value="seller">Seller</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className={labelClass}>Phone Number</label>
                <input
                  type="tel"
                  pattern="[0-9]{10}"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className={inputClass}
                  placeholder="10 digit number"
                />
              </div>

              {/* Dynamic Seller Fields */}
              {role === 'seller' && (
                <div className="bg-stone-100 dark:bg-stone-800/50 p-4 rounded-xl space-y-3 border border-stone-200 dark:border-stone-700">
                  <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">Seller details</p>
                  <div>
                    <label className={labelClass}>Store Name</label>
                    <input
                      type="text"
                      required
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className={inputClass}
                      placeholder="My Awesome Store"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Store Description</label>
                    <textarea
                      required
                      value={storeDescription}
                      onChange={(e) => setStoreDescription(e.target.value)}
                      className={inputClass + ' resize-none'}
                      placeholder="Brief description of what you sell"
                      rows="2"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className={labelClass}>Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  placeholder="Min 6 characters"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 mt-2"
              >
                {loading ? 'Creating account…' : 'Create Account'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          )}

          {/* OTP FORM */}
          {mode === 'otp' && (
            <form className="space-y-5" onSubmit={handleOtpSubmit}>
              <div>
                <label className={labelClass + ' text-center'}>
                  Enter the 6-digit code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className={inputClass + ' text-center text-2xl tracking-[0.5em] font-mono'}
                  placeholder="000000"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? 'Verifying…' : 'Verify & Sign in'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          )}

          {/* Toggle links */}
          <div className="mt-8 text-center">
            <span className="text-sm text-stone-500 dark:text-stone-400">
              {mode === 'login' ? "Don't have an account? " : mode === 'signup' ? 'Already have an account? ' : 'Need to change email? '}
            </span>
            {mode !== 'signup' && (
              <button
                onClick={() => { setMode('signup'); setError(''); setSuccessMsg(''); }}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors"
              >
                Sign up
              </button>
            )}
            {mode !== 'login' && mode !== 'otp' && (
              <button
                onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors"
              >
                Sign in
              </button>
            )}
            {mode === 'otp' && (
              <button
                onClick={() => { setMode('signup'); setError(''); setSuccessMsg(''); }}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors"
              >
                Go back
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
