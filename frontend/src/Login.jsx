import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, Sprout, ArrowRight, Leaf, Sun } from 'lucide-react';
import FloatingLeavesBackground from './FloatingLeavesBackground'; // Import the background component
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// ✅ FIX: These components are now outside the Login component
const InputField = ({ icon: Icon, label, type = 'text', name, placeholder, required = true, value, onChange, error }) => (
  <div className="group">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 transition-colors duration-300">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <Icon
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-emerald-500 dark:group-focus-within:text-emerald-400 transition-colors duration-300"
        size={18}
      />
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full pl-10 pr-4 py-3 border ${error ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'} rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all duration-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:shadow-md focus:shadow-lg dark:text-gray-100 dark:placeholder-gray-400`}
      />
    </div>
  </div>
);

const PasswordField = ({ label, name, show, value, onChange, onToggle }) => (
  <div className="group">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 transition-colors duration-300">
      {label} <span className="text-red-500">*</span>
    </label>
    <div className="relative">
      <Lock
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-emerald-500 dark:group-focus-within:text-emerald-400 transition-colors duration-300"
        size={18}
      />
      <input
        type={show ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        placeholder="Enter your password"
        required
        className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all duration-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:shadow-md focus:shadow-lg dark:text-gray-100 dark:placeholder-gray-400"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors duration-300"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  </div>
);

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, userType, isAuthenticated, loading } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prevData => ({
      ...prevData,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        await login(data.token);
        // Redirect based on userType from context (no verification check)
        if (data.userType === 'farmer') {
          navigate('/farmer-profile');
        } else {
          navigate('/customer-profile');
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* 🌿 NEW: Floating Leaves Background Component */}
      <FloatingLeavesBackground 
        leafCount={20}
        opacity={0.2}
        speed="slow"
        colors={['emerald', 'teal', 'green']}
      />
      
      {/* Keep existing background elements but reduce their opacity since we have animated leaves */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-300 dark:bg-emerald-600 rounded-full opacity-10 dark:opacity-5 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-300 dark:bg-teal-600 rounded-full opacity-10 dark:opacity-5 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-cyan-300 dark:bg-cyan-600 rounded-full opacity-5 dark:opacity-3 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative w-full max-w-md z-10">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-2xl dark:shadow-gray-900/50 border border-white/20 dark:border-gray-700/30 overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
          <div className="text-center py-10 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-700 dark:to-teal-700 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-white/20 dark:bg-white/30 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm animate-bounce">
                <Sprout size={36} className="animate-pulse" />
              </div>
              <h1 className="text-3xl font-bold mb-2 animate-fade-in">Welcome Back</h1>
              <p className="text-emerald-100 dark:text-emerald-200 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                Sign in to AgriConnect
              </p>
            </div>
            <div className="absolute top-4 right-4 text-white/20 animate-spin-slow"><Sun size={24} /></div>
            <div className="absolute bottom-4 left-4 text-white/20 animate-bounce" style={{ animationDelay: '1s' }}><Leaf size={20} /></div>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-4">
                <InputField
                  icon={User}
                  label="Username"
                  name="username"
                  placeholder="Enter your username"
                  value={form.username}
                  onChange={handleInputChange}
                  error={error}
                />
                <PasswordField
                  label="Password"
                  name="password"
                  show={showPassword}
                  value={form.password}
                  onChange={handleInputChange}
                  onToggle={() => setShowPassword(!showPassword)}
                />
              </div>

              <div className="flex items-center justify-between text-sm">
             
                <a href="/forgot-password" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors hover:underline">Forgot password?</a>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform transition-all duration-300 focus:ring-4 focus:ring-emerald-200 dark:focus:ring-emerald-800 relative overflow-hidden group ${
                  loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] hover:from-emerald-600 hover:to-teal-600 dark:hover:from-emerald-700 dark:hover:to-teal-700'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </div>
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">New to AgriConnect?</span>
                </div>
              </div>

              <div className="text-center">
                <a href="/register" className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold transition-all duration-300 hover:gap-3 group">
                  <span>Create an account</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-600 dark:text-gray-400">
          <p className="text-sm mb-4">Join thousands of farmers and customers</p>
          <div className="flex justify-center items-center gap-8 text-xs">
            <div className="flex items-center gap-1"><Sprout size={16} className="text-emerald-500 dark:text-emerald-400" /><span>Direct Trading</span></div>
            <div className="flex items-center gap-1"><Sun size={16} className="text-emerald-500 dark:text-emerald-400" /><span>Fresh Products</span></div>
            <div className="flex items-center gap-1"><Leaf size={16} className="text-emerald-500 dark:text-emerald-400" /><span>Sustainable</span></div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;