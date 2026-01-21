import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { FaTrash, FaMinus, FaPlus, FaShoppingCart, FaArrowLeft, FaTag } from 'react-icons/fa';
import tomatoesImg from '../assets/tomatoes.jpg';
import Navbar from './Navbar';
import FloatingLeavesBackground from '../FloatingLeavesBackground';

const API_URL = 'http://localhost:8000/api/cart/';
const API_ITEMS_URL = 'http://localhost:8000/api/cart/items/';

const badgeColors = [
  'bg-green-500 text-white',
  'bg-blue-500 text-white',
  'bg-yellow-500 text-white',
  'bg-purple-500 text-white',
  'bg-pink-500 text-white',
];

const Cart = () => {
  const { isDark } = useTheme();
  const [cart, setCart] = useState([]);
  const [removingId, setRemovingId] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [uniqueCount, setUniqueCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const controls = useAnimation();
  const summaryControls = useAnimation();
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const token = localStorage.getItem('token');

  // Fetch cart from backend
  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(API_URL, {
          headers: token ? { 'Authorization': `Token ${token}` } : {}
        });
        if (!res.ok) throw new Error('Failed to fetch cart');
        const data = await res.json();
        setCart(data.items || []);
        setCartCount((data.items || []).reduce((sum, item) => sum + item.quantity, 0));
        setUniqueCount((data.items || []).length);
        setSelectedIds((data.items || []).map(item => item.id));
      } catch (err) {
        setError(err.message || 'Failed to load cart.');
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  // Animate cart count when cart changes
  useEffect(() => {
    controls.start({ scale: [1, 1.2, 1], transition: { duration: 0.4 } });
    summaryControls.start({ scale: [1, 1.03, 1], transition: { duration: 0.4 } });
  }, [cartCount]);

  const handleQuantity = async (id, delta) => {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    const minOrder = item.product?.min_order || 1;
    const newQuantity = Math.max(minOrder, item.quantity + delta);
    try {
      const res = await fetch(`${API_ITEMS_URL}${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ quantity: newQuantity })
      });
      if (!res.ok) throw new Error('Failed to update quantity');
      const updated = await res.json();
      setCart(prev => Array.isArray(prev) ? prev.map(i => i.id === id ? { ...i, ...updated } : i) : []);
      setCartCount(prev => Array.isArray(cart) ? cart.map(i => i.id === id ? { ...i, ...updated } : i).reduce((sum, i) => sum + i.quantity, 0) : 0);
      setUniqueCount(prev => Array.isArray(cart) ? cart.length : 0);
      setToast({ show: true, message: 'Quantity updated!', type: 'success' });
    } catch (err) {
      setError(err.message || 'Failed to update quantity.');
      setToast({ show: true, message: err.message || 'Failed to update quantity.', type: 'error' });
    }
  };

  const handleRemove = async id => {
    setRemovingId(id);
    try {
      const res = await fetch(`${API_ITEMS_URL}${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });
      if (!res.ok) throw new Error('Failed to remove item');
      setCart(prev => Array.isArray(prev) ? prev.filter(item => item.id !== id) : []);
      setCartCount(prev => Array.isArray(cart) ? cart.filter(item => item.id !== id).reduce((sum, i) => sum + i.quantity, 0) : 0);
      setUniqueCount(prev => Array.isArray(cart) ? cart.filter(item => item.id !== id).length : 0);
      setSelectedIds(prev => prev.filter(cid => cid !== id));
      setToast({ show: true, message: 'Item removed from cart.', type: 'success' });
    } catch (err) {
      setError(err.message || 'Failed to remove item.');
      setToast({ show: true, message: err.message || 'Failed to remove item.', type: 'error' });
    } finally {
      setRemovingId(null);
    }
  };

  const handleNoteChange = async (id, value) => {
    try {
      const res = await fetch(`${API_ITEMS_URL}${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ note: value })
      });
      if (!res.ok) throw new Error('Failed to update note');
      const updated = await res.json();
      setCart(cart => cart.map(i => i.id === id ? { ...i, ...updated } : i));
    } catch (err) {
      setError(err.message || 'Failed to update note.');
    }
  };

  // Calculate subtotal for both product types
  const subtotal = cart.reduce((sum, item) => sum + ((item.product?.price || item.inventory_product?.price || 0) * item.quantity), 0);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;

  // Selection handlers
  const handleSelect = id => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]);
  };
  const handleSelectAll = () => {
    if (selectedIds.length === cart.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cart.map(item => item.id));
    }
  };

  // Only selected items for summary/order
  const selectedItems = cart.filter(item => selectedIds.includes(item.id));
  const selectedSubtotal = selectedItems.reduce((sum, item) => sum + ((item.product?.price || item.inventory_product?.price || 0) * item.quantity), 0);
  const selectedTax = Math.round(selectedSubtotal * 0.05);
  const selectedTotal = selectedSubtotal + selectedTax;

  // Place order for selected items
  const handleOrder = async () => {
    if (selectedItems.length === 0) {
      setToast({ show: true, message: 'Please select at least one item to order.', type: 'error' });
      return;
    }
    // Check for stock issues before placing order
    const overstocked = selectedItems.find(item => item.quantity > ((item.product?.stock ?? item.inventory_product?.stock) || 0));
    if (overstocked) {
      setToast({ show: true, message: `Cannot order more than available stock for "${overstocked.product?.name || overstocked.inventory_product?.name}" (max: ${overstocked.product?.stock || overstocked.inventory_product?.stock}).`, type: 'error' });
      return;
    }
    setLoading(true);
    try {
      // Fetch customer profile for address
      const profileRes = await fetch('http://localhost:8000/api/profile/', {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (!profileRes.ok) throw new Error('Failed to fetch profile');
      const profileData = await profileRes.json();
      const shipping_address = profileData.profile.address || '';

      // Build order payload (CORRECTED)
      const items = selectedItems.map(item => {
        // Farmer product
        if (item.product && item.product.id) {
          const farmerId = item.product.farmer?.id;
          return {
            product_id: item.product.id,
            ...(farmerId ? { farmer_id: farmerId } : {}),
            quantity: item.quantity,
            note: item.note || ''
          };
        }
        // Inventory product
        if (item.inventory_product && item.inventory_product.id) {
          return {
            inventory_product_id: item.inventory_product.id,
            quantity: item.quantity,
            note: item.note || ''
          };
        }
        // Defensive: skip any invalid items
        return null;
      }).filter(Boolean);
      const payload = {
        items,
        shipping_address,
        note: ''
      };

      // Place order
      const res = await fetch('http://localhost:8000/api/orders/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to place order');
      setToast({ show: true, message: 'Order placed successfully!', type: 'success' });
      // Optionally, clear cart or refetch
    } catch (err) {
      setError(err.message || 'Failed to place order.');
      setToast({ show: true, message: err.message || 'Failed to place order.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Toast auto-hide
  useEffect(() => {
    if (toast.show) {
      const t = setTimeout(() => setToast({ ...toast, show: false }), 2500);
      return () => clearTimeout(t);
    }
  }, [toast.show]);

  return (
    <div className="relative min-h-screen transition-colors duration-300 bg-gradient-to-br from-emerald-50 to-green-100 dark:from-gray-900 dark:to-gray-800">
      <FloatingLeavesBackground leafCount={8} opacity={0.13} speed="slow" />
      <Navbar />
      <div
        className={`pt-24 pb-10 px-4 md:px-16 max-w-5xl mx-auto ${
          isDark ? 'bg-transparent text-gray-100' : 'bg-transparent text-gray-900'
        }`}
      >
        {/* Cart header with animated count */}
        <div className="flex items-center gap-4 mb-8">
          <motion.div animate={controls} className="relative">
            <FaShoppingCart className="text-green-500 text-3xl md:text-4xl" />
            <motion.span
              animate={controls}
              className="absolute -top-2 -right-3 bg-green-500 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow-lg border-2 border-white dark:border-gray-900"
              style={{ minWidth: 24, textAlign: 'center' }}
            >
              {uniqueCount}
            </motion.span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold flex items-center gap-3"
          >
            Cart
          </motion.h1>
          <span className="ml-2 text-lg text-gray-400 font-medium">({uniqueCount} product{uniqueCount !== 1 ? 's' : ''}, {cartCount} total)</span>
        </div>
        {loading ? (
          <div className="text-emerald-600 dark:text-emerald-300 text-lg">Loading cart...</div>
        ) : error ? (
          <div className="text-red-600 dark:text-red-400 text-lg">{error}</div>
        ) : cart.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24"
          >
            <img
              src="https://assets10.lottiefiles.com/packages/lf20_jzv1zqtk.json"
              alt="Empty Cart"
              className="w-40 h-40 mb-6 opacity-80"
              style={{ filter: isDark ? 'invert(1)' : 'none' }}
            />
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty!</h2>
            <p className="mb-6 text-gray-400">Looks like you haven't added anything yet.</p>
            <button
              className="px-6 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold shadow-lg transition"
              onClick={() => window.location.href = '/products'}
            >
              <FaArrowLeft className="inline mr-2" /> Continue Shopping
            </button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="md:col-span-2 space-y-6">
              <AnimatePresence>
                {cart.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.4 }}
                    className={`flex items-center gap-6 p-4 rounded-xl shadow-lg border transition-all duration-300 ${
                      isDark
                        ? 'bg-gray-800 border-gray-700'
                        : 'bg-white border-gray-200'
                    } ${removingId === item.id ? 'opacity-50 scale-95' : ''}`}
                  >
                    <input
                      type="checkbox"
                      className="form-checkbox w-5 h-5 accent-emerald-500 mr-2 mt-1"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => handleSelect(item.id)}
                      aria-label={`Select ${item.product?.name || item.inventory_product?.name}`}
                    />
                    <motion.img
                      src={
                        item.product?.image
                          ? (item.product.image.startsWith('http') ? item.product.image : `${window.location.origin}${item.product.image}`)
                          : item.inventory_product?.image
                            ? (item.inventory_product.image.startsWith('http') ? item.inventory_product.image : `${window.location.origin}${item.inventory_product.image}`)
                            : '/default-product.png'
                      }
                      alt={item.product?.name || item.inventory_product?.name}
                      className="w-20 h-20 object-cover rounded-lg border shadow-md"
                      layoutId={`cart-img-${item.id}`}
                      whileHover={{ scale: 1.07 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold">{item.product?.name || item.inventory_product?.name}</h3>
                        {((item.product?.badge || item.inventory_product?.badge) && (item.product?.badge || item.inventory_product?.badge) !== '') && (
                          <span className={`ml-1 px-2 py-0.5 text-xs rounded-full font-semibold shadow bg-blue-500 text-white`}>
                            {item.product?.badge || item.inventory_product?.badge}
                          </span>
                        )}
                        {((item.product && item.product.stock === 0) || (item.inventory_product && item.inventory_product.stock === 0)) && (
                          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-rose-600 text-white font-semibold shadow">Out of Stock</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        <FaTag className="inline mr-1" />
                        <span>{item.product ? 'Farmer Product' : 'Inventory'}</span>
                        <span className="ml-2 text-xs text-gray-500">Stock: {item.product?.stock ?? item.inventory_product?.stock}</span>
                        <span className="ml-2 text-xs text-gray-500">Min order: {item.product?.min_order ?? item.inventory_product?.min_order ?? 1}</span>
                      </div>
                      <div className="text-gray-500 text-xs mb-2 italic">{item.product?.description || item.inventory_product?.description}</div>
                      <div className="flex items-center gap-3 mb-2">
                        <motion.button
                          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-green-500 hover:text-white transition"
                          onClick={() => handleQuantity(item.id, -1)}
                          disabled={item.quantity <= (item.product?.min_order ?? item.inventory_product?.min_order ?? 1)}
                          whileTap={{ scale: 0.85 }}
                        >
                          <FaMinus />
                        </motion.button>
                        <motion.span
                          className="font-semibold text-lg w-8 text-center"
                          key={item.quantity}
                          initial={{ scale: 1.1, color: '#22c55e' }}
                          animate={{ scale: 1, color: isDark ? '#fff' : '#000' }}
                          transition={{ duration: 0.3 }}
                        >
                          {item.quantity}
                        </motion.span>
                        <motion.button
                          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-green-500 hover:text-white transition"
                          onClick={() => handleQuantity(item.id, 1)}
                          disabled={item.quantity >= (item.product?.stock ?? item.inventory_product?.stock ?? 1) || ((item.product && item.product.stock === 0) || (item.inventory_product && item.inventory_product.stock === 0))}
                          whileTap={{ scale: 0.85 }}
                        >
                          <FaPlus />
                        </motion.button>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <label htmlFor={`note-${item.id}`} className="text-xs text-gray-400">Note:</label>
                        <input
                          id={`note-${item.id}`}
                          type="text"
                          value={item.note}
                          onChange={e => handleNoteChange(item.id, e.target.value)}
                          placeholder="Add instructions (optional)"
                          className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-xs w-56 focus:ring-2 focus:ring-green-400 outline-none transition"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 min-w-[90px]">
                      <span className="font-bold text-xl">रु{(item.product?.price || item.inventory_product?.price || 0) * item.quantity}</span>
                      <motion.button
                        className="p-2 rounded-full bg-red-100 dark:bg-red-900 hover:bg-red-500 hover:text-white transition"
                        onClick={() => handleRemove(item.id)}
                        title="Remove"
                        whileTap={{ scale: 0.85 }}
                      >
                        <FaTrash />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Cart Summary */}
            <motion.div
              animate={summaryControls}
              initial={{ scale: 1 }}
              className={`rounded-xl shadow-xl p-6 sticky top-24 h-fit transition-all duration-300 ${
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              }`}
            >
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  className="form-checkbox w-5 h-5 accent-emerald-500 mr-2"
                  checked={selectedIds.length === cart.length && cart.length > 0}
                  onChange={handleSelectAll}
                  aria-label="Select all items"
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">Select All</span>
              </div>
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
              <div className="flex justify-between mb-2 text-lg">
                <span>Subtotal</span>
                <span>रु{selectedSubtotal}</span>
              </div>
              <div className="flex justify-between mb-2 text-gray-400">
                <span>Tax (5%)</span>
                <span>रु{selectedTax}</span>
              </div>
              <div className="flex justify-between mb-6 text-xl font-semibold">
                <span>Total</span>
                <span>रु{selectedTotal}</span>
              </div>
              <button
                className="w-full py-3 rounded-lg bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold text-lg shadow-lg transition-all duration-300 mb-3"
                onClick={handleOrder}
                disabled={loading}
              >
                {loading ? 'Placing Order...' : 'Order Selected'}
              </button>
              <button
                className="w-full py-2 rounded-lg border border-green-500 text-green-500 hover:bg-green-50 dark:hover:bg-gray-900 font-semibold transition"
                onClick={() => window.location.href = '/products'}
              >
                <FaArrowLeft className="inline mr-2" /> Continue Shopping
              </button>
            </motion.div>
          </div>
        )}
        {/* Toast notification */}
        {toast.show && (
          <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg font-semibold text-lg transition-all duration-300 ${toast.type === 'error' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>{toast.message}</div>
        )}
      </div>
    </div>
  );
};

export default Cart; 