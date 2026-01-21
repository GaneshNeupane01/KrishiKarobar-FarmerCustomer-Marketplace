import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import { getUserInitials } from '../utils';

import { apiUrl } from '../api/baseUrl';

const API_URL = apiUrl('/api/orders/');

const statusColors = {
  all: 'bg-gray-100 text-gray-700 border-gray-300',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  accepted: 'bg-teal-100 text-teal-800 border-teal-300',
  shipped: 'bg-blue-100 text-blue-800 border-blue-300',
  delivered: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  cancelled: 'bg-rose-100 text-rose-800 border-rose-300',
};

const statusLabels = {
  all: 'All',
  pending: 'Pending',
  accepted: 'Accepted',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [canceling, setCanceling] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [statusFilter, setStatusFilter] = useState('all');
  const token = localStorage.getItem('token');

  // Fetch orders with optional status filter
  const fetchOrders = async (status = 'all') => {
    setLoading(true);
    setError('');
    try {
      let url = API_URL;
      if (status && status !== 'all') {
        url += `?status=${status}`;
      }
      const res = await fetch(url, {
        headers: token ? { 'Authorization': 'Token ' + token } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError(err.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(statusFilter);
    // eslint-disable-next-line
  }, [token, statusFilter]);

  const handleCancel = async (orderId) => {
    setCanceling(orderId);
    try {
      const res = await fetch(`${API_URL}${orderId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': 'Token ' + token } : {}),
        },
        body: JSON.stringify({ status: 'cancelled' })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Failed to cancel order');
      }
      // Refetch orders after cancelling
      fetchOrders(statusFilter);
      setToast({ show: true, message: 'Order cancelled.', type: 'success' });
    } catch (err) {
      setToast({ show: true, message: err.message || 'Failed to cancel order.', type: 'error' });
    } finally {
      setCanceling(null);
    }
  };

  return (
    <>
      <Navbar />
      <div className="  pt-28 max-w-3xl mx-auto mt-20 p-4  sm:p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg animate-fade-in-up min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4 text-emerald-700 dark:text-emerald-300">My Orders</h2>
        {/* Status Filter Badges */}
        <div className="flex flex-wrap gap-2 mb-6 text-xs">
          {Object.entries(statusLabels).map(([key, label]) => (
            <button
              key={key}
              className={`px-2 py-1 rounded-full border font-semibold focus:outline-none transition-all duration-200 ${statusColors[key]} ${statusFilter === key ? 'ring-2 ring-emerald-400 scale-105' : 'hover:ring-2 hover:ring-emerald-200'}`}
              onClick={() => setStatusFilter(key)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
        {loading && <div className="text-center text-gray-500 animate-pulse">Loading orders...</div>}
        {error && <div className="text-center text-rose-500 animate-fade-in-up">{error}</div>}
        {!loading && !error && orders.length === 0 && (
          <div className="text-center text-gray-500 animate-fade-in-up">No orders found for this status.</div>
        )}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-8">
            {orders.map(order => (
              <div key={order.id} className="border border-emerald-200 dark:border-gray-700 rounded-2xl p-4 sm:p-6 bg-emerald-50/30 dark:bg-gray-900/30 shadow-md transition-all duration-300 hover:shadow-xl animate-fade-in-up">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-semibold text-emerald-800 dark:text-emerald-200 text-lg">Order #{order.id}</span>
                    <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${statusColors[order.status]}`}>{statusLabels[order.status] || order.status}</span>
                  </div>
                  {order.status === 'pending' && (
                    <button
                      className="px-4 py-2 rounded-full bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-all duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2"
                      onClick={() => handleCancel(order.id)}
                      disabled={canceling === order.id}
                    >
                      {canceling === order.id ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <div className="text-sm text-gray-700 dark:text-gray-200">Placed: <span className="font-semibold">{new Date(order.created_at).toLocaleString()}</span></div>
                  <div className="text-sm text-gray-700 dark:text-gray-200">Total: <span className="font-semibold text-emerald-700 dark:text-emerald-300">रु{Number(order.total_price).toFixed(2)}</span></div>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-200 mb-1">Shipping: <span className="font-semibold">{order.shipping_address}</span></div>
                <div className="mt-3">
                  <div className="font-semibold text-emerald-700 dark:text-emerald-300 mb-2">Items:</div>
                  <ul className="space-y-2">
                    {order.items.map(item => (
                      <li key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-white/80 dark:bg-gray-800/80 rounded-xl px-3 py-2 border border-emerald-100 dark:border-gray-700 shadow-sm animate-fade-in-up">
                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-gray-100">{item.quantity} {item.product?.unit || item.inventory_product?.unit} {item.product?.name || item.inventory_product?.name || 'Product'}</span>
                          <span className={`text-xs px-2 py-1 rounded-full border font-semibold ${statusColors[order.status]}`}>{statusLabels[order.status] || order.status}</span>
                          <span className="ml-2 text-xs text-gray-500">{item.product ? 'Farmer Product' : 'Inventory'}</span>
                        </div>
                        {/* Farmer Info */}
                        {item.farmer_details && (
                          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-gray-900 rounded-lg px-2 py-1">
                            {item.farmer_details.profile_picture ? (
                              <img src={item.farmer_details.profile_picture} alt={(item.farmer_details.first_name || '') + ' ' + (item.farmer_details.last_name || '')} className="w-8 h-8 rounded-full object-cover border border-emerald-200 dark:border-gray-700" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold border border-emerald-200 dark:border-gray-700">
                                {getUserInitials({first_name: item.farmer_details.first_name, last_name: item.farmer_details.last_name})}
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{(item.farmer_details.first_name || '') + ' ' + (item.farmer_details.last_name || '')}</span>
                              {item.farmer_details.farm_name && <span className="text-xs text-gray-500">{item.farmer_details.farm_name}</span>}
                            </div>
                          </div>
                        )}
                        <div className="text-xs text-gray-500">{item.note}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
        {toast.show && (
          <div className={`fixed bottom-6 right-6 px-4 py-2 rounded-xl shadow-lg z-50 animate-fade-in-up ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>{toast.message}</div>
        )}
        <style>{`
          @keyframes fade-in-up {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.6s cubic-bezier(0.4,0,0.2,1);
          }
        `}</style>
      </div>
    </>
  );
} 