import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, CheckSquare, Square, Eye, Trash2, ChevronRight, Package, Truck, CheckCircle, Check, ShoppingBag, Calendar, MapPin, Phone, DollarSign, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { apiUrl } from '../../api/baseUrl';

const statusOptions = ['All', 'Pending', 'Accepted', 'Shipped', 'Delivered', 'Cancelled'];
const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'amount-high', label: 'Amount: High to Low' },
  { value: 'amount-low', label: 'Amount: Low to High' },
];

// Toast helper
function showToast(msg, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg font-semibold text-lg transition-all duration-300 ${type === 'error' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`;
  toast.innerText = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

function AcceptConfirmationModal({ open, onClose, onConfirm, order }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in-up">
      <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-200 dark:border-gray-600 w-full max-w-md p-8 animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-emerald-100 dark:hover:bg-gray-700 transition-colors">
          <ChevronRight className="w-6 h-6 text-emerald-500 dark:text-emerald-400 rotate-180" />
        </button>
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mb-2">Accept Order</h2>
          <div className="text-gray-700 dark:text-gray-300 mb-6">
            Are you sure you want to accept order <span className="font-semibold text-emerald-600 dark:text-emerald-400">#{order?.id}</span> for <span className="font-semibold">{order?.product?.name || order?.inventory_product?.name || 'Product'}</span>?
          </div>
          <div className="flex gap-4 justify-center">
            <button onClick={onClose} className="px-6 py-3 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300">
              Cancel
            </button>
            <button onClick={onConfirm} className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2">
              <Check className="w-5 h-5" /> Accept Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderDetailsModal({ open, onClose, order }) {
  if (!open || !order) return null;
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700';
      case 'Shipped': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700';
      case 'Accepted': return 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-700';
      case 'Pending': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700';
      case 'Cancelled': return 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-700';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in-up">
      <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-200 dark:border-gray-600 w-full max-w-2xl p-8 animate-fade-in-up max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-emerald-100 dark:hover:bg-gray-700 transition-colors">
          <ChevronRight className="w-6 h-6 text-emerald-500 dark:text-emerald-400 rotate-180" />
        </button>
        
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mb-2">Order Details</h2>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <ShoppingBag className="w-4 h-4" />
                <span>Order #{order.id}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{order.date}</span>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <img src={order.product?.image || order.inventory_product?.image} alt={order.product?.name || order.inventory_product?.name || 'Product'} className="w-16 h-16 object-cover rounded-xl border border-emerald-200 dark:border-gray-600 shadow-lg" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-200">{order.product?.name || order.inventory_product?.name || 'Product'}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>Quantity: {order.qty || order.quantity}</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">रु{order.amount || order.total_price}</span>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
                <div className="mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(order.priority)}`}>
                    {order.priority} priority
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/80 dark:bg-gray-700/80 rounded-2xl p-6 border border-emerald-100 dark:border-gray-600">
              <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Customer Information
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Customer Name</div>
                  <div className="font-semibold text-emerald-900 dark:text-emerald-200">{order.buyer_first_name} {order.buyer_last_name}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{order.phone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-emerald-500 dark:text-emerald-400 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{order.address}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-gray-700/80 rounded-2xl p-6 border border-emerald-100 dark:border-gray-600">
              <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Order Summary
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">रु{order.amount || order.total_price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">रु2.99</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">रु1.80</span>
                </div>
                <div className="border-t border-emerald-100 dark:border-gray-600 pt-2 flex justify-between">
                  <span className="font-semibold text-emerald-800 dark:text-emerald-300">Total:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">रु{(order.amount || order.total_price + 2.99 + 1.80).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [sort, setSort] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState([]);
  const [viewOrder, setViewOrder] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, order: null, bulk: false });
  const [acceptModal, setAcceptModal] = useState({ open: false, order: null });
  const getDefaultViewMode = () => (window.innerWidth < 1024 ? 'card' : 'table');
  const [viewMode, setViewMode] = useState(getDefaultViewMode()); // 'table' or 'card'

  // --- Analytics state ---
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setViewMode(prev => {
        if (window.innerWidth < 1024 && prev !== 'card') return 'card';
        if (window.innerWidth >= 1024 && prev !== 'table') return 'table';
        return prev;
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch analytics for stats cards
  useEffect(() => {
    const fetchAnalytics = async () => {
      setAnalyticsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(apiUrl('/api/farmer-analytics/'), {
          headers: { 'Authorization': `Token ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch analytics');
        const json = await res.json();
        setAnalytics(json);
      } catch (err) {
        setAnalytics(null); // fallback to local calculation
      } finally {
        setAnalyticsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  // Fetch real order items for this farmer
  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(apiUrl('/api/farmer-order-items/'), {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      // Use new customer field from backend
      const mapped = data.map(item => ({
        id: item.id,
        product: item.product?.name || item.inventory_product?.name || '',
        qty: item.quantity,
        buyer: item.customer?.username || '',
        phone: item.customer?.phone || '',
        address: item.customer?.address || '',
        status: (item.order_status === 'cancelled') ? 'Cancelled' : (item.status.charAt(0).toUpperCase() + item.status.slice(1)),
        date: item.created_at ? new Date(item.created_at).toLocaleDateString() : '',
        amount: parseFloat(item.total_price),
        priority: 'medium',
        image: item.product?.image || item.inventory_product?.image || '',
        order_status: item.order_status,
        buyer_first_name: item.customer?.first_name || '',
        buyer_last_name: item.customer?.last_name || '',
      }));
      setOrders(mapped);
    } catch (err) {
      showToast(err.message || 'Failed to load orders', 'error');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filtering and sorting
  let filteredOrders = orders.filter(o =>
    (status === 'All' || o.status === status) &&
    (o.product.toLowerCase().includes(search.toLowerCase()) || o.buyer.toLowerCase().includes(search.toLowerCase()) || o.date.includes(search))
  );
  
  switch (sort) {
    case 'amount-high':
      filteredOrders = [...filteredOrders].sort((a, b) => b.amount - a.amount);
      break;
    case 'amount-low':
      filteredOrders = [...filteredOrders].sort((a, b) => a.amount - b.amount);
      break;
    case 'oldest':
      filteredOrders = [...filteredOrders].sort((a, b) => new Date(a.date) - new Date(b.date));
      break;
    case 'newest':
    default:
      filteredOrders = [...filteredOrders].sort((a, b) => new Date(b.date) - new Date(a.date));
      break;
  }

  // Bulk select logic
  const allSelected = selected.length === filteredOrders.length && filteredOrders.length > 0;
  const toggleSelectAll = () => {
    if (allSelected) setSelected([]);
    else setSelected(filteredOrders.map(o => o.id));
  };
  const toggleSelect = id => {
    setSelected(sel => sel.includes(id) ? sel.filter(i => i !== id) : [...sel, id]);
  };

  // Status update
  const handleStatusUpdate = (id, newStatus) => {
    setOrders(os => os.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };
  const handleBulkStatus = newStatus => {
    setOrders(os => os.map(o => selected.includes(o.id) ? { ...o, status: newStatus } : o));
    setSelected([]);
  };
  
  // Accept order
  const handleAccept = id => {
    setAcceptModal({ open: true, order: orders.find(o => o.id === id) });
  };
  const handleConfirmAccept = async () => {
    const token = localStorage.getItem('token');
    const id = acceptModal.order.id;
    try {
      const res = await fetch(apiUrl(`/api/farmer-order-items/${id}/`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ status: 'accepted' })
      });
      if (!res.ok) throw new Error('Failed to accept order');
      showToast('Order accepted!', 'success');
      await fetchOrders();
    } catch (err) {
      showToast(err.message || 'Failed to accept order', 'error');
    }
    setAcceptModal({ open: false, order: null });
  };
  
  // Delete
  const handleDelete = id => {
    console.log('Delete clicked for order id:', id);
    setDeleteModal({ open: true, order: orders.find(o => o.id === id), bulk: false });
  };
  const handleBulkDelete = () => {
    setDeleteModal({ open: true, order: null, bulk: true });
  };
  const handleConfirmDelete = async () => {
    const token = localStorage.getItem('token');
    if (deleteModal.bulk) {
      await Promise.all(selected.map(async id => {
        await fetch(apiUrl(`/api/farmer-order-items/${id}/`), {
          method: 'DELETE',
          headers: { 'Authorization': `Token ${token}` }
        });
      }));
      setSelected([]);
    } else if (deleteModal.order) {
      await fetch(apiUrl(`/api/farmer-order-items/${deleteModal.order.id}/`), {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });
      setSelected(sel => sel.filter(id => id !== deleteModal.order.id));
    }
    await fetchOrders();
    setDeleteModal({ open: false, order: null, bulk: false });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700';
      case 'Shipped': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700';
      case 'Accepted': return 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-700';
      case 'Pending': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700';
      case 'Cancelled': return 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-700';
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

  // Calculate stats
  const totalOrders = analytics ? analytics.total_orders : orders.length;
  const pendingOrders = analytics ? (analytics.pending_orders ?? orders.filter(o => o.status === 'Pending').length) : orders.filter(o => o.status === 'Pending').length;
  const totalRevenue = analytics ? analytics.total_revenue : orders.reduce((sum, o) => sum + o.amount, 0);

  return (
    <div className="space-y-8 animate-fade-in-up mt-[2rem]">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/80 to-emerald-50/80 dark:from-gray-800/80 dark:to-gray-700/80 backdrop-blur-xl border border-emerald-100/50 dark:border-gray-600/50 shadow-2xl shadow-emerald-500/10 dark:shadow-gray-900/20 p-8 ">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 dark:from-emerald-400/10 dark:to-teal-400/10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                  Orders Management
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
                Track and manage all your customer orders efficiently
              </p>
            </div>
            <div className="flex gap-3 flex-wrap items-center">
              {selected.length > 0 && (
                <>
                  <button onClick={() => handleBulkStatus('Shipped')} className="group flex items-center gap-2 px-4 py-3 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold shadow-lg border border-blue-200 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-800/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <Truck className="w-5 h-5" /> Mark as Shipped
                  </button>
                  <button onClick={() => handleBulkStatus('Delivered')} className="group flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold shadow-lg border border-emerald-200 dark:border-emerald-700 hover:bg-emerald-200 dark:hover:bg-emerald-800/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <CheckCircle className="w-5 h-5" /> Mark as Delivered
                  </button>
                  <button onClick={handleBulkDelete} className="group flex items-center gap-2 px-4 py-3 rounded-2xl bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 font-semibold shadow-lg border border-rose-200 dark:border-rose-700 hover:bg-rose-200 dark:hover:bg-rose-800/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <Trash2 className="w-5 h-5" /> Delete Selected ({selected.length})
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-emerald-100/50 dark:border-gray-600/50 p-6 hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{totalOrders}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Orders</div>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
              <ShoppingBag className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-yellow-100/50 dark:border-yellow-700/50 p-6 hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{pendingOrders}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending Orders</div>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-blue-100/50 dark:border-blue-700/50 p-6 hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">रु{totalRevenue.toFixed(2)}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</div>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filter Bar */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-100/50 dark:border-gray-600/50 p-6">
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          {/* Search */}
          <div className="relative w-full max-w-md">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by product, buyer, date..."
              className="w-full py-3 pl-12 pr-4 rounded-2xl bg-white/90 dark:bg-gray-700/90 shadow-lg border border-emerald-100 dark:border-gray-600 focus:ring-2 focus:ring-emerald-400 focus:outline-none text-base placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300 hover:shadow-xl text-gray-900 dark:text-gray-100"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none">
              <Search className="w-5 h-5" />
            </span>
          </div>

          {/* Filters */}
          <div className="flex gap-3 items-center">
            <button 
              onClick={() => setShowFilters(f => !f)} 
              className="group flex items-center gap-2 px-4 py-3 rounded-2xl border border-emerald-200 dark:border-gray-600 bg-white/80 dark:bg-gray-700/80 text-emerald-700 dark:text-emerald-400 font-semibold shadow-lg hover:bg-emerald-100 dark:hover:bg-gray-600 hover:shadow-xl transition-all duration-300"
            >
              <Filter className="w-5 h-5" /> 
              Filters 
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showFilters && (
              <div className="flex gap-3 items-center">
                <select 
                  value={status} 
                  onChange={e => setStatus(e.target.value)} 
                  className="rounded-xl border border-emerald-200 dark:border-gray-600 px-4 py-3 bg-white/80 dark:bg-gray-700/80 focus:ring-emerald-400 shadow-lg hover:shadow-xl transition-all duration-300 text-gray-900 dark:text-gray-100"
                >
                  {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Sort and View Mode */}
          <div className="flex items-center gap-3 ml-auto">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700 dark:text-gray-300">Sort:</span>
              <select 
                value={sort} 
                onChange={e => setSort(e.target.value)} 
                className="rounded-xl border border-emerald-200 dark:border-gray-600 px-4 py-3 bg-white/80 dark:bg-gray-700/80 focus:ring-emerald-400 shadow-lg hover:shadow-xl transition-all duration-300 text-gray-900 dark:text-gray-100"
              >
                {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-700/80 rounded-xl p-1 shadow-lg">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'table' ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-600 dark:text-gray-400 hover:bg-emerald-100 dark:hover:bg-gray-600'}`}
              >
                <div className="w-4 h-4 space-y-0.5">
                  <div className="w-full h-1 bg-current rounded-sm"></div>
                  <div className="w-full h-1 bg-current rounded-sm"></div>
                  <div className="w-full h-1 bg-current rounded-sm"></div>
                </div>
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'card' ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-600 dark:text-gray-400 hover:bg-emerald-100 dark:hover:bg-gray-600'}`}
              >
                <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                  <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Orders Display */}
      <div>
        {/* Card View */}
        {viewMode === 'card' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredOrders.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white/80 dark:bg-gray-800/80 rounded-3xl shadow-inner animate-fade-in-up">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                      <ShoppingBag className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No orders found</h3>
                  <p className="text-gray-500 dark:text-gray-500">Try adjusting your search or filters</p>
              </div>
            ) : filteredOrders.map(order => (
            <OrderCard 
              key={order.id} 
              order={order} 
              selected={selected.includes(order.id)}
              onToggleSelect={() => toggleSelect(order.id)}
              onView={() => setViewOrder(order)}
              onAccept={() => handleAccept(order.id)}
              onDelete={() => handleDelete(order.id)}
              getStatusColor={getStatusColor}
              getPriorityColor={getPriorityColor}
            />
          ))}
        </div>
        )}
        {/* Table View (desktop style, but now toggleable) */}
        {viewMode === 'table' && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-100/50 dark:border-gray-600/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                  {/* ... (table head remains the same) */}
                   <thead>
                  <tr className="bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-gray-700/50 dark:to-gray-600/50 border-b border-emerald-100/50 dark:border-gray-600/50">
                    <th className="py-4 px-6 text-left">
                      <button onClick={toggleSelectAll} className="focus:outline-none">
                        {allSelected ? <CheckSquare className="w-5 h-5 text-emerald-500 dark:text-emerald-400" /> : <Square className="w-5 h-5 text-gray-400 dark:text-gray-500" />}
                      </button>
                    </th>
                    <th className="py-4 px-6 text-left font-semibold text-emerald-800 dark:text-emerald-300">Order ID</th>
                    <th className="py-4 px-6 text-left font-semibold text-emerald-800 dark:text-emerald-300">Product</th>
                    <th className="py-4 px-6 text-left font-semibold text-emerald-800 dark:text-emerald-300">Qty</th>
                    <th className="py-4 px-6 text-left font-semibold text-emerald-800 dark:text-emerald-300">Buyer</th>
                    <th className="py-4 px-6 text-left font-semibold text-emerald-800 dark:text-emerald-300">Amount</th>
                    <th className="py-4 px-6 text-left font-semibold text-emerald-800 dark:text-emerald-300">Status</th>
                    <th className="py-4 px-6 text-left font-semibold text-emerald-800 dark:text-emerald-300">Date</th>
                    <th className="py-4 px-6 text-left font-semibold text-emerald-800 dark:text-emerald-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="border-b border-emerald-50/50 dark:border-gray-700/50 hover:bg-emerald-50/30 dark:hover:bg-gray-700/30 transition-all duration-300">
                      <td className="py-4 px-6">
                        <button onClick={() => toggleSelect(order.id)} className="focus:outline-none">
                          {selected.includes(order.id) ? <CheckSquare className="w-5 h-5 text-emerald-500 dark:text-emerald-400" /> : <Square className="w-5 h-5 text-gray-400 dark:text-gray-500" />}
                        </button>
                      </td>
                      <td className="py-4 px-6 font-medium text-emerald-900 dark:text-emerald-200">#{order.id}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img src={order.image} alt={order.product?.name || order.inventory_product?.name || 'Product'} className="w-10 h-10 object-cover rounded-lg border border-emerald-100 dark:border-gray-600 shadow" />
                          <span className="font-medium text-gray-900 dark:text-gray-100">{order.product?.name || order.inventory_product?.name || 'Product'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-900 dark:text-gray-100">{order.qty || order.quantity}</td>
                      <td className="py-4 px-6 text-gray-900 dark:text-gray-100">{order.buyer_first_name} {order.buyer_last_name}</td>
                      <td className="py-4 px-6 font-semibold text-emerald-700 dark:text-emerald-400">रु{order.amount || order.total_price}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-500 dark:text-gray-400">{order.date}</td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <button onClick={() => setViewOrder(order)} className="p-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-gray-700 transition-colors" title="View Details">
                            <Eye className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                          </button>
                          {order.status === 'Pending' && (
                            <button onClick={() => handleAccept(order.id)} className="p-2 rounded-lg hover:bg-teal-100 dark:hover:bg-gray-700 transition-colors" title="Accept Order">
                              <Check className="w-4 h-4 text-teal-500 dark:text-teal-400" />
                            </button>
                          )}
                          <button onClick={() => handleDelete(order.id)} className="p-2 rounded-lg hover:bg-rose-100 dark:hover:bg-gray-700 transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {deleteModal.open && console.log('Delete modal should be open')}
      <AcceptConfirmationModal
        open={acceptModal.open}
        onClose={() => setAcceptModal({ open: false, order: null })}
        onConfirm={handleConfirmAccept}
        order={acceptModal.order}
      />
      <OrderDetailsModal
        open={!!viewOrder}
        onClose={() => setViewOrder(null)}
        order={viewOrder}
      />
      {deleteModal.open && (
        <DeleteConfirmationModal
          open={true}
          product={deleteModal.order}
          bulk={deleteModal.bulk}
          count={selected.length}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteModal({ open: false, order: null, bulk: false })}
        />
      )}
    </div>
  );
}

function OrderCard({ order, selected, onToggleSelect, onView, onAccept, onDelete, getStatusColor, getPriorityColor }) {
  const isCancelled = order.order_status === 'cancelled' || order.status === 'Cancelled';
  return (
    <div className={`group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl border border-emerald-100/50 dark:border-gray-600/50 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 ${isCancelled ? 'opacity-70 grayscale pointer-events-none' : ''}`}>
      {/* Cancelled Overlay */}
      {isCancelled && (
        <div className="absolute inset-0 bg-rose-100/80 dark:bg-rose-900/60 flex items-center justify-center z-20">
          <span className="text-rose-700 dark:text-rose-300 font-bold text-lg">Order Cancelled</span>
        </div>
      )}
      {/* Selection Checkbox */}
      <div className="absolute top-4 left-4 z-10">
        <button onClick={onToggleSelect} className="focus:outline-none" disabled={isCancelled}>
          {selected ? <CheckSquare className="w-5 h-5 text-emerald-500 dark:text-emerald-400" /> : <Square className="w-5 h-5 text-gray-400 dark:text-gray-500" />}
        </button>
      </div>
      {/* Order Header */}
      <div className="p-6 border-b border-emerald-100/50 dark:border-gray-600/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-semibold text-emerald-900 dark:text-emerald-200">#{order.id}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{order.date}</div>
            </div>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>{order.status}</span>
            <div className="mt-2">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(order.priority)}`}>{order.priority} priority</span>
            </div>
          </div>
        </div>
        {/* Product Info */}
        <div className="flex items-center gap-4">
          <img src={order.image} alt={order.product?.name || order.inventory_product?.name || 'Product'} className="w-16 h-16 object-cover rounded-xl border border-emerald-100 dark:border-gray-600 shadow-lg" />
          <div className="flex-1">
            <h3 className="font-semibold text-emerald-900 dark:text-emerald-200">{order.product?.name || order.inventory_product?.name || 'Product'}</h3>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
              <span>Qty: {order.qty || order.quantity}</span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">रु{order.amount || order.total_price}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Customer Info */}
      <div className="p-6 space-y-3">
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Customer</div>
          <div className="font-semibold text-emerald-900 dark:text-emerald-200">{order.buyer_first_name} {order.buyer_last_name}</div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Phone className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          <span>{order.phone}</span>
        </div>
        <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
          <MapPin className="w-4 h-4 text-emerald-500 dark:text-emerald-400 mt-0.5" />
          <span className="line-clamp-2">{order.address}</span>
        </div>
      </div>
      {/* Actions */}
      <div className="p-6 border-t border-emerald-100/50 dark:border-gray-600/50">
        <div className="flex gap-2">
          <button onClick={onView} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold hover:bg-emerald-200 dark:hover:bg-emerald-800/50 transition-all duration-300" disabled={isCancelled}>
            <Eye className="w-4 h-4" />
            View
          </button>
          {order.status === 'Pending' && !isCancelled && (
            <button onClick={onAccept} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 font-semibold hover:bg-teal-200 dark:hover:bg-teal-800/50 transition-all duration-300">
              <Check className="w-4 h-4" />
              Accept
            </button>
          )}
          <button onClick={onDelete} className="px-4 py-2 rounded-xl bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 font-semibold hover:bg-rose-200 dark:hover:bg-rose-800/50 transition-all duration-300" disabled={isCancelled}>
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
} 