import React, { useState, useEffect } from 'react';
import { Menu, X, Search, ShoppingCart, Heart, LogOut, User as UserIcon, Bell, Mail, BarChart2, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle';
import { fetchNotifications } from '../api/notifications';
import { useAuth } from '../context/AuthContext';

const CART_API_URL = 'http://localhost:8000/api/cart/';
const MESSAGES_API_URL = 'http://localhost:8000/api/conversations/with_farmer/';

export default function Navbar({ showSearch = true, showLogout = false, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNavSearch, setShowNavSearch] = useState(false);
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const [notifCount, setNotifCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);

  const { isAuthenticated, userType } = useAuth();
  const isCustomer = isAuthenticated && userType === 'customer';

  useEffect(() => {
    let isMounted = true;
    const fetchAndSet = () => {
      if (isAuthenticated) {
        fetchNotifications()
          .then(n => { if (isMounted) setNotifCount((n || []).filter(notif => !notif.is_read).length); })
          .catch(() => { if (isMounted) setNotifCount(0); });
        // Fetch cart count for customers (unique products)
        if (isCustomer) {
          fetch(CART_API_URL, {
            headers: { 'Authorization': `Token ${localStorage.getItem('token')}` }
          })
            .then(res => res.ok ? res.json() : { items: [] })
            .then(data => {
              if (isMounted) setCartCount((data.items || []).length);
            })
            .catch(() => { if (isMounted) setCartCount(0); });
          // Fetch unread message count for customers
          fetch(MESSAGES_API_URL, {
            headers: { 'Authorization': `Token ${localStorage.getItem('token')}` }
          })
            .then(res => res.ok ? res.json() : [])
            .then(data => {
              if (isMounted) setMessageCount(data.reduce((sum, conv) => sum + (conv.unread_count || 0), 0));
            })
            .catch(() => { if (isMounted) setMessageCount(0); });
        }
      }
    };
    fetchAndSet();
    const interval = setInterval(fetchAndSet, 20000); // Poll every 20 seconds
    return () => { isMounted = false; clearInterval(interval); };
  }, [isAuthenticated, isCustomer]);

  // Handle profile icon click
  const handleProfileClick = () => {
    if (userType === 'customer') {
      navigate('/customer-profile');
    } else if (userType === 'farmer') {
      navigate('/farmer-profile');
    } else {
      navigate('/login');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.more-dropdown')) {
        setShowMoreDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-40 bg-white/60 dark:bg-gray-900/90 backdrop-blur-lg shadow-sm border-b border-emerald-100 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">🌱</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 dark:from-green-400 dark:to-emerald-500 bg-clip-text text-transparent select-none">
            KrishiKarobar
          </span>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <Link to="/home" className="text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium">Home</Link>
          <Link to="/products" className="text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium">Products</Link>
          <Link to="/inventory" className="text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium">Our Inventory</Link>
          {/* Show Farmers only for customers */}
          {isCustomer && (
            <Link to="/farmers" className="text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium">Farmers</Link>
          )}
          {/* Show Dashboard only for farmers */}
          {isAuthenticated && userType === 'farmer' && (
            <a href="/dashboard" className="text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium">Dashboard</a>
          )}
          {/* Show Messages only for customers */}
          {isCustomer && (
            <Link to="/messages" className="relative text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium">
              Messages
              {messageCount > 0 && (
                <span className="absolute -top-2 -right-4 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">{messageCount}</span>
              )}
            </Link>
          )}
          
          {isCustomer && (
            <Link to="/my-orders" className="text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium">My Orders</Link>
          )}
          
          {/* More Dropdown */}
          <div className="relative more-dropdown">
            <button
              onClick={() => setShowMoreDropdown(!showMoreDropdown)}
              className="flex items-center gap-1 text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium"
            >
              More
              <ChevronDown className={`w-4 h-4 transition-transform ${showMoreDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown Menu */}
            {showMoreDropdown && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                <Link 
                  to="/about" 
                  className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-gray-700 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  onClick={() => setShowMoreDropdown(false)}
                >
                  About
                </Link>
                <Link 
                  to="/contact" 
                  className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-gray-700 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  onClick={() => setShowMoreDropdown(false)}
                >
                  Contact
                </Link>
              </div>
            )}
          </div>
        </div>
        {/* Desktop icons */}
        <div className="hidden md:flex items-center space-x-4">
          {showSearch && (
            <button className="text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors relative" onClick={() => setShowNavSearch((v) => !v)}>
              <Search className="w-5 h-5" />
            </button>
          )}
          {isCustomer && (
          <Link to="/cart" className="relative text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>
            )}
          </Link>  )}
          <ThemeToggle />
          {/* Notifications Icon for all logged-in users */}
          {isAuthenticated && (
            <button
              className="relative text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center justify-center"
              onClick={() => navigate('/notifications')}
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {notifCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">{notifCount}</span>
              )}
            </button>
          )}
          <button
              className="text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center justify-center"
              onClick={handleProfileClick}
              title="Profile"
            >
              <UserIcon className="w-5 h-5" />
            </button>
            
          {!showLogout && !isAuthenticated && (
            <button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1 rounded-full hover:shadow-lg transition-all transform hover:scale-105">
              <Link to="/register">Sign Up</Link>
            </button>
          )}
          {showLogout && (
            <button
              className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-1 rounded-full hover:shadow-lg transition-all flex items-center gap-2"
              onClick={onLogout}
            >
              <LogOut className="w-5 h-5" /> Logout
            </button>
          )}
        </div>
        {/* Mobile icons and menu */}
        <div className="flex md:hidden items-center space-x-2">
          {showSearch && (
            <button className="text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors relative" onClick={() => setShowNavSearch((v) => !v)}>
              <Search className="w-5 h-5" />
            </button>
          )}
          {/* Cart icon for customers only */}
          {isCustomer && (
            <Link to="/cart" className="relative text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>
              )}
            </Link>
          )}
          {/* Messages icon for customers only */}
          {isCustomer && (
            <Link to="/messages" className="relative text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              <Mail className="w-5 h-5" />
              {messageCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">{messageCount}</span>
              )}
            </Link>
          )}
          {/* Dashboard icon for farmers only */}
          {isAuthenticated && userType === 'farmer' && (
            <Link to="/dashboard" className="relative text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              <BarChart2 className="w-5 h-5" />
            </Link>
          )}
          <ThemeToggle />
          {/* Notifications Icon for mobile */}
          {isAuthenticated && (
            <button
              className="relative text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center justify-center"
              onClick={() => navigate('/notifications')}
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {notifCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">{notifCount}</span>
              )}
            </button>
          )}
          {isAuthenticated && (
            <button
              className="text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center justify-center"
              onClick={handleProfileClick}
              title="Profile"
            >
              <UserIcon className="w-5 h-5" />
            </button>
          )}
          {/* Mobile menu button */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors ml-1">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      {/* NAVBAR SEARCH DROPDOWN */}
      {showSearch && showNavSearch && (
        <div className="absolute left-1/2 top-20 z-50 -translate-x-1/2 flex justify-center pointer-events-none w-[90%]">
          <div className="max-w-md w-full pointer-events-auto animate-fade-in-up">
            <div className="flex items-center bg-white/75 dark:bg-gray-800/75 backdrop-blur-sm rounded-full p-2 pl-4 pr-4 shadow-lg border border-emerald-100 dark:border-gray-600 gap-1">
              <input
                type="text"
                placeholder="Search for fresh produce..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-50/80 to-green-50/80 dark:from-gray-700/80 dark:to-gray-600/80 backdrop-blur-sm border border-emerald-200/50 dark:border-gray-500/50 rounded-full outline-none text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 font-medium shadow-inner transition-all duration-300 focus:border-emerald-400 dark:focus:border-emerald-400 focus:shadow-lg focus:shadow-emerald-100/50 dark:focus:shadow-emerald-900/50 focus:bg-white/90 dark:focus:bg-gray-700/90 hover:border-emerald-300 dark:hover:border-gray-400 hover:bg-white/85 dark:hover:bg-gray-700/85"
                autoFocus
              />
              <button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-3 rounded-full hover:shadow-xl hover:shadow-emerald-200/50 dark:hover:shadow-emerald-900/50 transition-all duration-300 transform hover:scale-105 flex items-center justify-center min-w-[44px] min-h-[44px]">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link to="/home" className="block px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-gray-700 rounded-md">Home</Link>
            <Link to="/products" className="block px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-gray-700 rounded-md">Products</Link>
            <Link to="/inventory" className="block px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-gray-700 rounded-md">Our Inventory</Link>
            {/* Show Farmers only for customers */}
            {isCustomer && (
              <Link to="/farmers" className="block px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-gray-700 rounded-md">Farmers</Link>
            )}
            {/* Show Dashboard only for farmers */}
            {isAuthenticated && userType === 'farmer' && (
              <a href="/dashboard" className="block px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-gray-700 rounded-md">Dashboard</a>
            )}
            {/* Show Messages, Cart, My Orders only for customers */}
            {isCustomer && (
              <Link to="/messages" className="relative block px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-gray-700 rounded-md">
                Messages
                {messageCount > 0 && (
                  <span className="absolute top-1 right-2 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">{messageCount}</span>
                )}
              </Link>
            )}
            {isCustomer && (
              <Link to="/my-orders" className="block px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-gray-700 rounded-md">My Orders</Link>
            )}
            {isCustomer && (
              <Link to="/cart" className="relative block px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-gray-700 rounded-md">
                Cart
                {cartCount > 0 && (
                  <span className="absolute top-1 right-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>
                )}
              </Link>
            )}
            <Link to="/about" className="block px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-gray-700 rounded-md">Demo About</Link>
            <Link to="/contact" className="block px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-gray-700 rounded-md">Demo Contact</Link>
            {/* Notifications for mobile menu */}
            {isAuthenticated && (
              <button
                className="relative block w-full text-left px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-gray-700 rounded-md"
                onClick={() => { setMenuOpen(false); navigate('/notifications'); }}
                title="Notifications"
              >
                Notifications
                {notifCount > 0 && (
                  <span className="absolute top-1 right-2 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">{notifCount}</span>
                )}
              </button>
            )}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
              {!showLogout && !isAuthenticated && (
                <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-full">Sign Up</button>
              )}
              {showLogout && (
                <button
                  className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-2 rounded-full flex items-center justify-center gap-2"
                  onClick={onLogout}
                >
                  <LogOut className="w-5 h-5" /> Logout
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}