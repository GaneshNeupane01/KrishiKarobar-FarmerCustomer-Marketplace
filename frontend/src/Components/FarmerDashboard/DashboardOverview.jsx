import React, { useState, useEffect } from 'react';
import { BarChart2, ShoppingBag, Package, DollarSign, Users, Plus, Bell, ChevronRight, TrendingUp, TrendingDown, Calendar, Star, Activity, Target, Award, Zap, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchNotifications, markNotificationRead, clearNotification } from '../../api/notifications';

const demoStats = [];
const demoOrders = [];
const demoNotifications = [];

const quickActions = [
  { label: 'Add Product', icon: <Plus className="w-5 h-5" />, color: 'emerald', action: 'addproducts' },
  { label: 'View Orders', icon: <ShoppingBag className="w-5 h-5" />, color: 'emerald', action: 'orders' },
  { label: 'Check Analytics', icon: <BarChart2 className="w-5 h-5" />, color: 'emerald', action: 'analytics' },
  { label: 'Send Message', icon: <Bell className="w-5 h-5" />, color: 'emerald', action: 'messages' },
];

export default function DashboardOverview({ onViewAllOrders, onSectionChange }) {
  const [stats, setStats] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    // Fetch first and last name for greeting
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/api/profile/', {
        headers: token ? { 'Authorization': 'Token ' + token } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setFirstName(data.profile.user.first_name);
        setLastName(data.profile.user.last_name);
      }
    };
    fetchProfile();
    const fetchAnalytics = async () => {
      setAnalyticsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8000/api/farmer-analytics/', {
          headers: { 'Authorization': `Token ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch analytics');
        const data = await res.json();
        setStats([
          {
            label: 'Active Listings',
            value: data.active_listings,
            icon: <Package className="w-6 h-6 text-emerald-500" />, trend: '+0%', trendDirection: 'up', color: 'emerald', bgGradient: 'from-emerald-500/20 to-teal-500/20', borderColor: 'border-emerald-200', shadowColor: 'shadow-emerald-500/10'
          },
          {
            label: 'Total Orders',
            value: data.total_orders,
            icon: <ShoppingBag className="w-6 h-6 text-yellow-500" />, trend: '+0%', trendDirection: 'up', color: 'yellow', bgGradient: 'from-yellow-500/20 to-orange-500/20', borderColor: 'border-yellow-200', shadowColor: 'shadow-yellow-500/10'
          },
          {
            label: 'Earnings',
            value: `रु${Number(data.total_revenue).toLocaleString()}`,
            icon: <DollarSign className="w-6 h-6 text-blue-500" />, trend: '+0%', trendDirection: 'up', color: 'blue', bgGradient: 'from-blue-500/20 to-indigo-500/20', borderColor: 'border-blue-200', shadowColor: 'shadow-blue-500/10'
          },
          {
            label: 'Pending Orders',
            value: data.pending_orders,
            icon: <Users className="w-6 h-6 text-rose-500" />, trend: '+0%', trendDirection: 'down', color: 'rose', bgGradient: 'from-rose-500/20 to-pink-500/20', borderColor: 'border-rose-200', shadowColor: 'shadow-rose-500/10'
          },
        ]);
        setRecentOrders(data.recent_orders || []);
        setAvgRating(data.avg_rating || 0);
      } catch (err) {
        setStats([]);
        setRecentOrders([]);
        setAvgRating(0);
      } finally {
        setAnalyticsLoading(false);
      }
    };
    fetchAnalytics();
    // Fetch 5 most recent notifications
    fetchNotifications().then(n => setRecentNotifications(n.slice(0, 5))).catch(() => setRecentNotifications([]));
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700';
      case 'Shipped': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700';
      case 'Pending': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'low': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  // Handler for marking a notification as read
  const handleMarkRead = async id => {
    await markNotificationRead(id);
    setRecentNotifications(notifications => notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
  };
  // Handler for clearing (dismissing) a notification
  const handleDismiss = async id => {
    await clearNotification(id);
    setRecentNotifications(notifications => notifications.filter(n => n.id !== id));
  };

  return (
    <div className="space-y-8 animate-fade-in-up mt-[2rem]">
      {/* Welcome Section with Enhanced Styling */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/80 to-emerald-50/80 dark:from-gray-800/80 dark:to-gray-700/80 backdrop-blur-xl border border-emerald-100/50 dark:border-gray-600/50 shadow-2xl shadow-emerald-500/10 dark:shadow-gray-900/20 p-8">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 dark:from-emerald-400/10 dark:to-teal-400/10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                  Welcome back, {firstName} {lastName}!
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-lg font-medium max-w-2xl">
                Here's your farm at a glance. Manage your products, track orders, and grow your business with FarmDirect.
              </p>
              <div className="flex items-center gap-4 text-sm text-emerald-600 dark:text-emerald-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Last updated: {new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span>System Status: Online</span>
                </div>
              </div>
            </div>
            <button className="group flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-xl hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105" onClick={() => onSectionChange('addproducts')} type="button">
              <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
              <span>Quick Add Product</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-lg border border-emerald-100 dark:border-gray-600 p-6 flex flex-col items-center text-center animate-pulse h-32" />
          ))
        ) : stats.map((stat, index) => (
          <div 
            key={index}
            className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.bgGradient} dark:from-gray-800/50 dark:to-gray-700/50 backdrop-blur-xl border ${stat.borderColor} dark:border-gray-600 shadow-xl ${stat.shadowColor} dark:shadow-gray-900/20 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-gray-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/80 dark:bg-gray-700/80 rounded-xl shadow-lg">
                  {stat.icon}
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${stat.trendDirection === 'up' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'}`}>
                  {stat.trendDirection === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {stat.trend}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <button
            key={index}
            className={`group p-4 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-emerald-100 dark:border-gray-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1`}
            onClick={() => onSectionChange(action.action)}
            type="button"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${action.color}-500 to-${action.color}-600 flex items-center justify-center mb-3 mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300`}>
              <div className="text-white group-hover:scale-110 transition-transform duration-300">
                {action.icon}
              </div>
            </div>
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-center">{action.label}</div>
          </button>
        ))}
      </div>

      {/* Main Grid: Recent Orders, Notifications, Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enhanced Recent Orders */}
        <section className="lg:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-100/50 dark:border-gray-600/50 overflow-hidden">
          <div className="p-6 border-b border-emerald-100/50 dark:border-gray-600/50 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-gray-700/50 dark:to-gray-600/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-300">Recent Orders</h2>
              </div>
              <button 
                onClick={onViewAllOrders} 
                className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold hover:bg-emerald-200 dark:hover:bg-emerald-800/50 transition-all duration-300"
              >
                View All 
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analyticsLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-20 bg-emerald-50/30 dark:bg-gray-900/30 rounded-xl animate-pulse" />
                ))
              ) : recentOrders.length === 0 ? (
                <div className="text-gray-500 text-center">No recent orders found.</div>
              ) : recentOrders.map((order, index) => (
                <div 
                  key={order.id}
                  className="group p-4 rounded-2xl bg-gradient-to-r from-white to-emerald-50/30 dark:from-gray-700 dark:to-gray-600/30 border border-emerald-100 dark:border-gray-600 hover:border-emerald-200 dark:hover:border-gray-500 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-emerald-900 dark:text-emerald-200">{order.product}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">by {order.buyer.first_name} {order.buyer.last_name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Qty: {order.qty}</span>
                          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">रु{order.amount}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </div>
                      <div className={`mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(order.priority)}`}>
                        {order.priority} priority
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{order.date}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Notifications */}
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-100/50 dark:border-gray-600/50 overflow-hidden">
          <div className="p-6 border-b border-emerald-100/50 dark:border-gray-600/50 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-gray-700/50 dark:to-gray-600/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-300">Notifications</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analyticsLoading ? (
                <div className="h-20 bg-emerald-50/30 dark:bg-gray-900/30 rounded-xl animate-pulse" />
              ) : recentNotifications.length === 0 ? (
                <div className="text-gray-500 text-center">No notifications found.</div>
              ) : recentNotifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={`flex items-center bg-white/80 dark:bg-gray-800/80 border border-emerald-100 dark:border-gray-600 rounded-2xl shadow-md p-4 gap-4 animate-fade-in-up cursor-pointer transition-all ${notification.is_read ? 'opacity-60' : 'opacity-100 hover:bg-emerald-50 dark:hover:bg-gray-700'}`}
                  onClick={() => handleMarkRead(notification.id)}
                  title={notification.is_read ? 'Mark as unread' : 'Mark as read'}
                >
                  <div><Bell className="w-6 h-6 text-emerald-500 dark:text-emerald-400" /></div>
                  <div className="flex-1">
                    <div className={`font-semibold ${notification.is_read ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-emerald-800 dark:text-emerald-300'}`}>{notification.text}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{new Date(notification.created_at).toLocaleString()}</div>
                  </div>
                  {!notification.is_read && <span className="w-3 h-3 bg-emerald-400 dark:bg-emerald-500 rounded-full mr-2 animate-pulse" />}
                  <button
                    className="ml-2 p-1 rounded-full hover:bg-emerald-100 dark:hover:bg-gray-700 transition-all"
                    onClick={e => { e.stopPropagation(); handleDismiss(notification.id); }}
                    aria-label="Dismiss notification"
                  >
                    <X className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Enhanced Analytics Preview */}
      <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-100/50 dark:border-gray-600/50 overflow-hidden">
        <div className="p-6 border-b border-emerald-100/50 dark:border-gray-600/50 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-gray-700/50 dark:to-gray-600/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                <BarChart2 className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-300">Performance Overview</h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
              <Star className="w-4 h-4" />
              <span>{analyticsLoading ? '--' : avgRating}/5 Rating</span>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-700 dark:to-gray-600 border border-emerald-200 dark:border-emerald-700">
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">{analyticsLoading ? '--' : `${Math.round((avgRating/5)*100)}%`}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Customer Satisfaction</div>
            </div>
            <div className="text-center p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 border border-blue-200 dark:border-blue-700">
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-2">24h</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Response Time</div>
            </div>
            <div className="text-center p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 border border-purple-200 dark:border-purple-700">
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-400 mb-2">{analyticsLoading ? '--' : stats.find(s => s.label === 'Total Orders')?.value || 0}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Orders</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 