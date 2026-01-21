import React, { useState, useEffect } from 'react';
import { BarChart2, ShoppingBag, Package, DollarSign, Users, Plus, Edit, Trash2, Mail, Bell, User, ChevronRight, Home as HomeIcon, Settings, LogOut, TrendingUp, Calendar, Star, Activity } from 'lucide-react';
import Navbar from './Components/Navbar';
import DashboardOverview from './Components/FarmerDashboard/DashboardOverview';
import ProductsGallery from './Components/FarmerDashboard/ProductsGallery';
import AddProduct from './Components/FarmerDashboard/AddProduct';
import Orders from './Components/FarmerDashboard/Orders';
import Analytics from './Components/FarmerDashboard/Analytics';
import Messages from './Components/FarmerDashboard/Messages';
import Notifications from './Components/FarmerDashboard/Notifications';
import { useNavigate } from 'react-router-dom';
import FloatingLeavesBackground from './FloatingLeavesBackground';
import { fetchNotifications } from './api/notifications';
import { useAuth } from './context/AuthContext';
import { apiUrl } from './api/baseUrl';



const PRODUCTS_API_URL = apiUrl('/api/products/');
const ORDERS_API_URL = apiUrl('/api/farmer-order-items/');
const MESSAGES_API_URL = apiUrl('/api/conversations/with_customer/');

export default function FarmerDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [section, setSection] = useState('home');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [sidebarCounts, setSidebarCounts] = useState({ products: 0, orders: 0, messages: 0, notifications: 0 });
  const { isAuthenticated, userType, profile } = useAuth();

  // Simulate loading state for section changes
  const handleSectionChange = (newSection) => {
    setIsLoading(true);
    setTimeout(() => {
      setSection(newSection);
      setIsLoading(false);
    }, 300);
  };

  // Add scroll animation on mount
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchCounts = async () => {
      const token = localStorage.getItem('token');
      let counts = { products: 0, orders: 0, messages: 0, notifications: 0 };
      try {
        // Products count
        const profileRes = await fetch(apiUrl('/api/profile/'), { headers: { 'Authorization': `Token ${token}` } });
        const profileData = await profileRes.json();
        const farmerName = profileData.profile.user.username;
        const prodRes = await fetch(`${PRODUCTS_API_URL}?farmer_username=${encodeURIComponent(farmerName)}`, { headers: { 'Authorization': `Token ${token}` } });
        const prodData = await prodRes.json();
        counts.products = prodData.length;
        // Orders count
        const orderRes = await fetch(ORDERS_API_URL, { headers: { 'Authorization': `Token ${token}` } });
        const orderData = await orderRes.json();
        counts.orders = orderData.length;
        // Messages count (unread)
        const msgRes = await fetch(MESSAGES_API_URL, { headers: { 'Authorization': `Token ${token}` } });
        const msgData = await msgRes.json();
        counts.messages = msgData.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);
        // Notifications count (unread)
        const notifRes = await fetchNotifications();
        counts.notifications = notifRes.filter(n => !n.is_read).length;
      } catch (e) {}
      if (isMounted) setSidebarCounts(counts);
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 1000); // Poll every 20 seconds
    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  useEffect(() => {
    // Fetch first and last name for sidebar
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(apiUrl('/api/profile/'), {
        headers: token ? { 'Authorization': 'Token ' + token } : {}
      });
      if (res.ok) {
        const data = await res.json();
        profile.firstName = data.profile.user.first_name;
        profile.lastName = data.profile.user.last_name;
      }
    };
    fetchProfile();
  }, []);

  const sidebarItems = [
    { id: 'home', label: 'Overview', icon: <HomeIcon className="w-5 h-5" />, badge: null },
    { id: 'products', label: 'Products Gallery', icon: <Package className="w-5 h-5" />, badge: sidebarCounts.products > 0 ? sidebarCounts.products : null },
    { id: 'addproducts', label: 'Add Products', icon: <Plus className="w-5 h-5" />, badge: null },
    { id: 'orders', label: 'Orders', icon: <ShoppingBag className="w-5 h-5" />, badge: sidebarCounts.orders > 0 ? sidebarCounts.orders : null },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-5 h-5" />, badge: null },
    { id: 'messages', label: 'Messages', icon: <Mail className="w-5 h-5" />, badge: sidebarCounts.messages > 0 ? sidebarCounts.messages : null },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" />, badge: sidebarCounts.notifications > 0 ? sidebarCounts.notifications : null },
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" />, badge: null },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex font-sans relative ">
      {/* Animated background elements */}
      <FloatingLeavesBackground leafCount={12} opacity={0.13} speed="slow" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200 dark:bg-emerald-800 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-teal-200 dark:bg-teal-800 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-green-200 dark:bg-green-800 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Enhanced Sidebar - adjusted positioning */}
      <aside className={`fixed z-50 left-0 w-72 bg-emerald-50/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg border border-emerald-100 dark:border-gray-600 rounded-2xl flex flex-col transition-all duration-500 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} top-0 bottom-0 lg:top-16 m-4`}>
        {/* Sidebar Header */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-emerald-100/50 dark:border-gray-600/50">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
            <BarChart2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">Farmer Dashboard</span>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">KrishiKarobar</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-2 px-4 py-6 overflow-y-auto ">
          {sidebarItems.map((item) => (
            <SidebarLink 
              key={item.id}
              id={item.id}
              icon={item.icon} 
              label={item.label} 
              badge={item.badge}
              active={section === item.id} 
              onClick={() => {
                if (item.id === 'profile') {
                  navigate('/farmer-profile');
                } else {
                  handleSectionChange(item.id);
                }
              }} 
            />
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="px-4 py-4 border-t border-emerald-100/50 dark:border-gray-600/50">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-1 mb-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-semibold text-emerald-800 dark:text-emerald-200">
                  {(profile?.first_name || profile?.user?.first_name || '') + ' ' + (profile?.last_name || profile?.user?.last_name || '')}
                </div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400">Premium Member</div>
              </div>
            </div>
            <div className="flex gap-2">
              {/*
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/80 dark:bg-gray-700/80 text-emerald-700 dark:text-emerald-300 text-sm font-medium hover:bg-emerald-100 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm">
                <Settings className="w-4 h-4" />
                Settings
              </button>
              */}
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-sm font-medium hover:bg-rose-100 dark:hover:bg-rose-800/50 transition-all duration-200 shadow-sm">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
          
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-72">
        <Navbar  />
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-emerald-200 dark:border-gray-600 border-t-emerald-500 dark:border-t-emerald-400 rounded-full animate-spin"></div>
              <div className="text-emerald-700 dark:text-emerald-300 font-medium">Loading...</div>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto pt-16 ">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 pb-12 ">
            <div className={`transition-all duration-500 ${isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
              {section === 'home' && (
                <DashboardOverview onViewAllOrders={() => handleSectionChange('orders')} onSectionChange={handleSectionChange} />
              )}
              {section === 'products' && (
                <ProductsGallery />
              )}
              {section === 'addproducts' && (
                <AddProduct />
              )}
              {section === 'orders' && (
                <Orders />
              )}
              {section === 'analytics' && (
                <Analytics />
              )}
              {section === 'messages' && (
                <Messages />
              )}
              {section === 'notifications' && (
                <Notifications />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Enhanced Mobile Toggle */}
     
      {/* Floating Mobile Sidebar Toggle (bottom right) */}
      <button
        className="fixed bottom-6 right-6 z-[60] bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4 rounded-full shadow-lg flex items-center gap-2 hover:scale-110 transition-all lg:hidden"
        onClick={() => setSidebarOpen(v => !v)}
        aria-label="Open sidebar"
      >
        <BarChart2 className="w-6 h-6" />
      </button>
    </div>
  );
}

function SidebarLink({ id,icon, label, badge, active, onClick }) {
  return (
    <button 
      onClick={onClick} 
      className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 w-full text-left ${
        active 
          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25' 
          : 'text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100/80 dark:hover:bg-gray-700/80 hover:shadow-md'
      }`}
    >
      {/* Active indicator */}
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 dark:bg-black/80 bg-white rounded-r-full shadow-sm"></div>
      )}
      
      {/* Icon with animation */}
      <div className={`relative z-10 transition-all duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
      </div>
      
      {/* Label */}
      <span className="relative z-10 flex-1">{label}</span>
      
      {/* Badge */}
      {badge && (id === 'notifications' || id === 'messages') && (
        <div className={`relative z-10 px-2 py-1 rounded-full text-xs font-bold ${
          active 
            ? 'bg-rose-500 text-white' 
            : '!bg-rose-500 dark:bg-rose-500 text-white'
        }`}>
          {badge}
        </div>
      )}
      {badge && id !== 'notifications' && id !== 'messages' && (
        <div className={`relative z-10 px-2 py-1 rounded-full text-xs font-bold ${
          active 
            ? 'bg-white/20 text-white' 
            : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
        }`}>
          {badge}
        </div>
      )}
      
      {/* Hover effect */}
      <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
        active 
          ? '' 
          : 'bg-emerald-100/50 dark:bg-gray-700/50 opacity-0 group-hover:opacity-100'
      }`}></div>
    </button>
  );
} 