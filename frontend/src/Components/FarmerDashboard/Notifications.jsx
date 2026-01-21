import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle, AlertTriangle, ShoppingBag, X, Check, MessageCircle } from 'lucide-react';
import { fetchNotifications, markNotificationRead, clearNotification } from '../../api/notifications';

const typeIcon = {
  order: <ShoppingBag className="w-6 h-6 text-yellow-500" />,
  order_status: <CheckCircle className="w-6 h-6 text-blue-500" />,
  review: <CheckCircle className="w-6 h-6 text-green-500" />,
  stock: <AlertTriangle className="w-6 h-6 text-rose-500" />,
  message: <MessageCircle className="w-6 h-6 text-emerald-500" />,
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchAndSet = () => {
      fetchNotifications()
        .then(data => { if (isMounted) setNotifications(data); })
        .catch(() => { if (isMounted) setNotifications([]); })
        .finally(() => { if (isMounted) setLoading(false); });
    };
    fetchAndSet();
    const interval = setInterval(fetchAndSet, 30000); // Poll every 30 seconds  
    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  const handleDismiss = async id => {
    await clearNotification(id);
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const handleMarkRead = async id => {
    await markNotificationRead(id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleClearAll = async () => {
    for (const n of notifications) await clearNotification(n.id);
    setNotifications([]);
  };

  const handleMarkAllRead = async () => {
    for (const n of notifications) await markNotificationRead(n.id);
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-xl mx-auto w-full animate-fade-in-up mt-[2rem]">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
        <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-300 drop-shadow flex-1">Notifications</h1>
        {notifications.length > 0 && (
          <>
            <button
              className="text-xs px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold hover:bg-emerald-200 dark:hover:bg-emerald-800/50 transition-all mr-2"
              onClick={handleMarkAllRead}
            >
              <Check className="inline w-4 h-4 mr-1" />Mark All Read
            </button>
            <button
              className="text-xs px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 font-semibold hover:bg-rose-200 dark:hover:bg-rose-800/50 transition-all"
              onClick={handleClearAll}
            >
              <X className="inline w-4 h-4 mr-1" />Clear All
            </button>
          </>
        )}
      </div>
      <div className="space-y-4">
        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-inner animate-fade-in-up">
            <CheckCircle className="w-12 h-12 text-emerald-400 dark:text-emerald-500 mb-4 animate-bounce" />
            <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400 mb-1">No notifications</div>
            <div className="text-gray-400 dark:text-gray-500">You're all caught up! 🎉</div>
          </div>
        )}
        {notifications.map(n => (
          <div
            key={n.id}
            className={`flex items-center bg-white/80 dark:bg-gray-800/80 border border-emerald-100 dark:border-gray-600 rounded-2xl shadow-md p-4 gap-4 animate-fade-in-up cursor-pointer transition-all ${n.is_read ? 'opacity-60' : 'opacity-100 hover:bg-emerald-50 dark:hover:bg-gray-700'}`}
            onClick={() => handleMarkRead(n.id)}
            title={n.is_read ? 'Mark as unread' : 'Mark as read'}
          >
            <div>{typeIcon[n.type]}</div>
            <div className="flex-1">
              <div className={`font-semibold ${n.is_read ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-emerald-800 dark:text-emerald-300'}`}>{n.text}</div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{new Date(n.created_at).toLocaleString()}</div>
            </div>
            {!n.is_read && <span className="w-3 h-3 bg-emerald-400 dark:bg-emerald-500 rounded-full mr-2 animate-pulse" />}
            <button
              className="ml-2 p-1 rounded-full hover:bg-emerald-100 dark:hover:bg-gray-700 transition-all"
              onClick={e => { e.stopPropagation(); handleDismiss(n.id); }}
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 