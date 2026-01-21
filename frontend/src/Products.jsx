import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Filter, X, ChevronDown, ChevronUp, Search as SearchIcon, Star, ShoppingCart, MapPin, Tag, TrendingUp, Sun, CheckCircle, SlidersHorizontal, CalendarIcon } from 'lucide-react';
import FloatingLeavesBackground from './FloatingLeavesBackground';
import Navbar from './Components/Navbar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Backend API endpoint for browsing products
const API_URL = 'http://localhost:8000/api/browse-products/';
const CART_ITEMS_URL = 'http://localhost:8000/api/cart/items/';

const categories = [
  { name: 'Vegetables', icon: <Sun className="w-5 h-5" /> },
  { name: 'Fruits', icon: <Tag className="w-5 h-5" /> },
  { name: 'Grains', icon: <TrendingUp className="w-5 h-5" /> },
  { name: 'Dairy', icon: <CheckCircle className="w-5 h-5" /> },
  { name: 'Herbs', icon: <Sun className="w-5 h-5" /> },
  { name: 'Seeds', icon: <Tag className="w-5 h-5" /> },
];
const provinces = ['Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim'];

const sortOptions = [
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating-desc', label: 'Rating: High to Low' },
  { value: 'newest', label: 'Newest' },
];

const subcategories = {
  Vegetables: ['Potato', 'Onion', 'Tomato', 'Lettuce', 'Spinach', 'Carrot'],
  Fruits: ['Apple', 'Banana', 'Orange', 'Blueberry', 'Grape'],
  Grains: ['Rice', 'Wheat', 'Corn', 'Barley'],
  Dairy: ['Milk', 'Cheese', 'Yogurt', 'Eggs'],
  Herbs: ['Mint', 'Basil', 'Coriander', 'Parsley'],
  Seeds: ['Pumpkin Seed', 'Almond', 'Sunflower Seed'],
};

const token = localStorage.getItem('token');

function FilterChips({ filters, setFilters, onClearAll, minPrice, maxPrice }) {
  const chips = [];
  if (filters.category) chips.push({ label: filters.category, onRemove: () => setFilters(f => ({ ...f, category: '', subcategory: '' })) });
  if (filters.subcategory) chips.push({ label: filters.subcategory, onRemove: () => setFilters(f => ({ ...f, subcategory: '' })) });
  if (filters.province) chips.push({ label: filters.province, onRemove: () => setFilters(f => ({ ...f, province: '' })) });
  if (filters.rating) chips.push({ label: `${filters.rating}★ & up`, onRemove: () => setFilters(f => ({ ...f, rating: 0 })) });
  if (filters.inStock) chips.push({ label: 'In Stock', onRemove: () => setFilters(f => ({ ...f, inStock: false })) });
  if (filters.badge) chips.push({ label: filters.badge, onRemove: () => setFilters(f => ({ ...f, badge: '' })) });
  if ((filters.price[0] !== minPrice || filters.price[1] !== maxPrice)) chips.push({ label: `Price: रु${filters.price[0]}-रु${filters.price[1]}`, onRemove: () => setFilters(f => ({ ...f, price: [minPrice, maxPrice] })) });
  if (filters.dateFrom) chips.push({ label: `Uploaded from ${filters.dateFrom}`, onRemove: () => setFilters(f => ({ ...f, dateFrom: '' })) });
  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mb-6 animate-fade-in-up items-center">
      <span className="text-gray-500 dark:text-gray-400 font-medium mr-2">Active Filters:</span>
      {chips.map((chip, i) => (
        <button key={i} onClick={chip.onRemove} className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold hover:bg-emerald-200 dark:hover:bg-emerald-800/50 focus:bg-emerald-200 dark:focus:bg-emerald-800/50 focus:outline-none transition-all text-sm shadow">
          {chip.label} <X className="w-4 h-4" />
        </button>
      ))}
      <button onClick={onClearAll} className="ml-2 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 font-semibold hover:bg-rose-200 dark:hover:bg-rose-800/50 focus:bg-rose-200 dark:focus:bg-rose-800/50 focus:outline-none transition-all text-sm shadow border border-rose-200 dark:border-rose-700">Clear All</button>
    </div>
  );
}

function DualRangeSlider({ min, max, value, onChange }) {
  // value: [min, max]
  const trackRef = useRef();
  const percent = v => ((v - min) / (max - min)) * 100;
  return (
    <div className="w-full">
      <div className="relative w-full h-8 flex items-center">
        <input type="range" min={min} max={max} value={value[0]} onChange={e => onChange([+e.target.value, value[1]])} className="absolute w-full h-2 opacity-0 z-10 cursor-pointer" style={{ pointerEvents: 'auto' }} />
        <input type="range" min={min} max={max} value={value[1]} onChange={e => onChange([value[0], +e.target.value])} className="absolute w-full h-2 opacity-0 z-10 cursor-pointer" style={{ pointerEvents: 'auto' }} />
        <div ref={trackRef} className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full relative">
          <div className="absolute h-2 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full" style={{ left: `${percent(value[0])}%`, width: `${percent(value[1]) - percent(value[0])}%` }} />
          <div className="absolute" style={{ left: `calc(${percent(value[0])}% - 10px)` }}>
            <div className="w-5 h-5 bg-white dark:bg-gray-800 border-2 border-emerald-400 rounded-full shadow flex items-center justify-center cursor-pointer" />
          </div>
          <div className="absolute" style={{ left: `calc(${percent(value[1])}% - 10px)` }}>
            <div className="w-5 h-5 bg-white dark:bg-gray-800 border-2 border-emerald-400 rounded-full shadow flex items-center justify-center cursor-pointer" />
          </div>
        </div>
      </div>
      <div className="flex justify-between mt-2 px-1">
        <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">रु{min}</span>
        <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">रु{max}</span>
      </div>
    </div>
  );
}

function BadgeWithTooltip({ badge }) {
  const badgeInfo = {
    'Top Selling': 'This product is among the most popular and frequently purchased.',
    'Seasonal': 'Available only during certain seasons for peak freshness.',
    'Newly Added': 'This product was recently added to our marketplace.',
  };
  return (
    <span className="relative group">
      <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold animate-fade-in-up animate-delay-200 cursor-help">
        {badge}
      </span>
      {badgeInfo[badge] && (
        <span className="absolute left-1/2 -translate-x-1/2 top-7 z-50 w-48 bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 text-xs rounded-lg shadow-lg px-3 py-2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 pointer-events-none transition-opacity duration-200">
          {badgeInfo[badge]}
        </span>
      )}
    </span>
  );
}

function SpecialFilterBar({ filters, setFilters, sort, setSort }) {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-8 bg-transparent backdrop-blur rounded-xl px-4 py-3  animate-fade-in-up">
      <div className="hidden lg:flex items-center gap-2">
        <span className="font-semibold text-gray-700 dark:text-gray-300">Sort:</span>
        <select value={sort} onChange={e => setSort(e.target.value)} className="rounded-lg border border-gray-200 dark:border-gray-600 px-3 py-1 bg-white/80 dark:bg-gray-700/80 focus:ring-emerald-400 text-gray-900 dark:text-gray-100">
          {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
      
        {['', 'Top Selling', 'Seasonal', 'Newly Added', 'Featured', 'Recommended'].map(b => (
          <button key={b} onClick={() => setFilters(f => ({ ...f, badge: b }))} className={`px-3 py-1 rounded-full border text-sm font-semibold flex items-center gap-1 ${filters.badge === b ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white/80 dark:bg-gray-700/80 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-600'} transition-all shadow-sm hover:bg-emerald-100 dark:hover:bg-emerald-800/50`}>
            {b || 'All'}
          </button>
        ))}
      </div>
    </div>
  );
}

function ProductCard({ product }) {
  const navigate = useNavigate();
  const { userType, isAuthenticated, profile } = useAuth();
  const isCustomer = userType === 'customer';
  const [adding, setAdding] = React.useState(false);
  const [toast, setToast] = React.useState({ show: false, message: '', type: 'info' });

  React.useEffect(() => {
    if (toast.show) {
      const t = setTimeout(() => setToast({ ...toast, show: false }), 2000);
      return () => clearTimeout(t);
    }
  }, [toast.show]);

  return (
    <div
      className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-3xl shadow-xl border border-emerald-200 dark:border-emerald-700 p-0 flex flex-col group overflow-hidden hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 animate-fade-in-up cursor-pointer"
      onClick={() => navigate(`/products/${product.id}`)}
    >
      <div className="relative">
        <img src={product.image} alt={product.name} className="w-full h-44 object-cover rounded-t-3xl border-b-2 border-emerald-100 dark:border-emerald-700 shadow-md group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute inset-0 rounded-t-3xl bg-gradient-to-t from-emerald-900/30 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-3 right-3 z-10">
          <button
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full p-2 shadow-lg hover:scale-110 transition-transform"
            disabled={!isCustomer || !product.in_stock || adding}
            onClick={async e => {
              e.stopPropagation();
              if (!isCustomer) {
                setToast({ show: true, message: 'You have to be logged in as a customer to perform this action.', type: 'error' });
                return;
              }
              if (!product.in_stock) {
                setToast({ show: true, message: 'Out of stock.', type: 'error' });
                return;
              }
              setAdding(true);
              try {
                const res = await fetch(CART_ITEMS_URL, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                  },
                  body: JSON.stringify({ product_id: product.id, quantity: 1 })
                });
                if (!res.ok) {
                  const data = await res.json().catch(() => ({}));
                  throw new Error(data.detail || 'Failed to add to cart');
                }
                setToast({ show: true, message: 'Added to cart!', type: 'success' });
              } catch (err) {
                setToast({ show: true, message: err.message || 'Failed to add to cart.', type: 'error' });
              } finally {
                setAdding(false);
              }
            }}
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
        {toast.show && (
          <div className={`absolute top-2 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl shadow-lg font-semibold text-sm transition-all duration-300 ${toast.type === 'error' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>{toast.message}</div>
        )}
        {product.badge && (
          <BadgeWithTooltip badge={product.badge} />
        )}
      </div>
      <div className="flex-1 flex flex-col px-4 pt-3 pb-4">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-lg font-bold text-emerald-800 dark:text-emerald-300 drop-shadow-sm">{product.name}</span>
        </div>
        <div className="flex items-center gap-2 mb-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
          <span>{product.category}</span>
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{product.province}</span>
        </div>
        <div className="flex items-center gap-1 mb-2">
          {[1,2,3,4,5].map(i => (
            <Star key={i} className={`w-4 h-4 ${i <= Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
          ))}
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{product.rating.toFixed(1)}</span>
        </div>
        <div className="flex items-center gap-2 mt-auto">
          <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">रु{product.price.toFixed(2)}</span>
          {!product.in_stock && <span className="ml-2 text-xs text-red-500 dark:text-red-400 font-semibold">Out of Stock</span>}
        </div>
      </div>
    </div>
  );
}

function FilterSidebar({ filters, setFilters, sort, setSort, show, onClose, isMobile, minPrice, maxPrice }) {
  // Helper for price input
  const [priceInput, setPriceInput] = React.useState([filters.price[0], filters.price[1]]);
  React.useEffect(() => {
    setPriceInput([filters.price[0], filters.price[1]]);
  }, [filters.price]);
  const handlePriceInput = (idx, val) => {
    const newVals = [...priceInput];
    newVals[idx] = val;
    setPriceInput(newVals);
  };
  const applyPriceFilter = () => {
    let min = parseFloat(priceInput[0]) || minPrice;
    let max = parseFloat(priceInput[1]) || maxPrice;
    if (min > max) [min, max] = [max, min];
    setFilters(f => ({ ...f, price: [min, max] }));
  };
  const [subcategories, setSubcategories] = useState({});
  const [availableSubcategories, setAvailableSubcategories] = useState([]);

  // Fetch subcategories for selected category
  useEffect(() => {
    if (!filters.category) {
      setAvailableSubcategories([]);
      return;
    }
    const fetchSubcategories = async () => {
      try {
        const res = await fetch(`${API_URL}subcategories/?category=${encodeURIComponent(filters.category)}`,
          { headers: token ? { 'Authorization': 'Token ' + token } : {} });
        if (!res.ok) throw new Error('Failed to fetch subcategories');
        const data = await res.json();
        setAvailableSubcategories(data.subcategories || []);
      } catch {
        setAvailableSubcategories([]);
      }
    };
    fetchSubcategories();
  }, [filters.category]);

  const filterContent = (
    <div className="flex flex-col gap-6 p-6 min-w-[220px] w-full max-w-xs">
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2"><Filter className="w-5 h-5" /> Filters</span>
        {isMobile && (
          <button onClick={onClose} className="p-2 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-800/50 transition-colors"><X className="w-5 h-5" /></button>
        )}
      </div>
      {/* Category */}
      <div>
        <div className="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2"><Tag className="w-4 h-4" /> Category</div>
        <div className="flex flex-wrap gap-2 mb-2">
          <button onClick={() => setFilters(f => ({ ...f, category: '', subcategory: '' }))} className={`px-3 py-1 rounded-full border ${!filters.category ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'} transition-all`}>All</button>
          {categories.map(cat => (
            <button key={cat.name} onClick={() => setFilters(f => ({ ...f, category: cat.name, subcategory: '' }))} className={`px-3 py-1 rounded-full border flex items-center gap-1 ${filters.category === cat.name ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'} transition-all`}>
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
        {/* Subcategories */}
        {filters.category && availableSubcategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 animate-fade-in-up">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium mr-2">Subcategory:</span>
            <button onClick={() => setFilters(f => ({ ...f, subcategory: '' }))} className={`px-2 py-1 rounded-full border ${!filters.subcategory ? 'bg-emerald-400 text-white border-emerald-400' : 'bg-white/80 dark:bg-gray-700/80 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-600'} hover:bg-emerald-500 focus:bg-emerald-500 focus:outline-none transition-all text-xs`}>All</button>
            {availableSubcategories.map(sub => (
              <button key={sub} onClick={() => setFilters(f => ({ ...f, subcategory: sub }))} className={`px-2 py-1 rounded-full border text-xs ${filters.subcategory === sub ? 'bg-emerald-400 text-white border-emerald-400' : 'bg-white/80 dark:bg-gray-700/80 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-600'} hover:bg-emerald-500 focus:bg-emerald-500 focus:outline-none transition-all`}>
                {sub}
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Province */}
      <div>
        <div className="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2"><MapPin className="w-4 h-4" /> Province</div>
        <select value={filters.province} onChange={e => setFilters(f => ({ ...f, province: e.target.value }))} className="w-full rounded-lg border border-gray-200 dark:border-gray-600 px-3 py-2 bg-white/80 dark:bg-gray-700/80 focus:ring-emerald-400 text-gray-900 dark:text-gray-100">
          <option value="">All</option>
          {provinces.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      {/* Price Range */}
      <div>
        <div className="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2"><SlidersHorizontal className="w-4 h-4" /> Price Range</div>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            min={minPrice}
            max={maxPrice}
            value={priceInput[0]}
            onChange={e => handlePriceInput(0, e.target.value)}
            className="w-20 rounded-lg border border-gray-200 dark:border-gray-600 px-2 py-1 bg-white/80 dark:bg-gray-700/80 focus:ring-emerald-400 text-sm text-gray-900 dark:text-gray-100"
            placeholder={`Min (${minPrice})`}
          />
          <span className="mx-1">-</span>
          <input
            type="number"
            min={minPrice}
            max={maxPrice}
            value={priceInput[1]}
            onChange={e => handlePriceInput(1, e.target.value)}
            className="w-20 rounded-lg border border-gray-200 dark:border-gray-600 px-2 py-1 bg-white/80 dark:bg-gray-700/80 focus:ring-emerald-400 text-sm text-gray-900 dark:text-gray-100"
            placeholder={`Max (${maxPrice})`}
          />
          <button onClick={applyPriceFilter} className="ml-2 px-3 py-1 rounded-full bg-emerald-500 text-white font-semibold text-xs shadow hover:bg-emerald-600 transition-all">Apply</button>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Enter min and max price to filter.</div>
      </div>
      {/* Rating */}
      <div>
        <div className="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2"><Star className="w-4 h-4" /> Rating</div>
        <div className="flex gap-2">
          {[0,4,4.5,5].map(r => (
            <button key={r} onClick={() => setFilters(f => ({ ...f, rating: r }))} className={`px-3 py-1 rounded-full border flex items-center gap-1 ${filters.rating === r ? 'bg-yellow-400 text-white border-yellow-400' : 'bg-white/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'} transition-all`}>
              <Star className="w-4 h-4" />{r === 0 ? 'All' : r}
            </button>
          ))}
        </div>
      </div>
      {/* Availability */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={filters.inStock} onChange={e => setFilters(f => ({ ...f, inStock: e.target.checked }))} className="accent-emerald-500" />
          <span className="font-semibold text-gray-700 dark:text-gray-300">In Stock Only</span>
        </label>
      </div>
      {/* Badges */}
      <div>
        <div className="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Special</div>
        <div className="flex gap-2 flex-wrap">
          {['', 'Top Selling', 'Seasonal', 'Newly Added', 'Featured', 'Recommended'].map(b => (
            <button key={b} onClick={() => setFilters(f => ({ ...f, badge: b }))} className={`px-3 py-1 rounded-full border ${filters.badge === b ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'} transition-all`}>{b || 'All'}</button>
          ))}
        </div>
      </div>
      {/* Date Uploaded */}
      <div>
        <div className="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2"><CalendarIcon className="w-4 h-4" /> Date Uploaded From</div>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
          className="rounded-lg border border-gray-200 dark:border-gray-600 px-2 py-1 bg-white/80 dark:bg-gray-700/80 focus:ring-emerald-400 text-sm text-gray-900 dark:text-gray-100"
          placeholder="From"
          max={new Date().toISOString().slice(0, 10)}
        />
      </div>
      {/* Sort */}
      <div>
        <div className="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2"><ChevronDown className="w-4 h-4" /> Sort By</div>
        <select value={sort} onChange={e => setSort(e.target.value)} className="w-full rounded-lg border border-gray-200 dark:border-gray-600 px-3 py-2 bg-white/80 dark:bg-gray-700/80 focus:ring-emerald-400 text-gray-900 dark:text-gray-100">
          {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>
    </div>
  );
  // Sidebar for desktop, drawer for mobile
  if (isMobile) {
    return (
      <div className={`fixed inset-0 z-50 bg-black/30 transition-opacity ${show ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        aria-hidden={!show}
        onClick={onClose}
      >
        <div className={`absolute left-0 top-0 h-full w-80 max-w-full bg-white/90 dark:bg-gray-900/90 shadow-2xl transition-transform duration-300 ${show ? 'translate-x-0' : '-translate-x-full'}`} onClick={e => e.stopPropagation()}>
          {/* Make filter content scrollable on mobile */}
          <div className="h-full flex flex-col">
            <div className="flex-1 min-h-0 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 32px)' }}>
              {filterContent}
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <aside className="hidden lg:block sticky top-20  z-20 animate-fade-in-left ">
      <div className="bg-emerald-50/80 dark:bg-gray-800/80 rounded-2xl shadow-lg border border-emerald-100 dark:border-gray-600 mt-4 mb-4 overflow-y-auto scroll-smooth">
        {filterContent}
      </div>
    </aside>
  );
}

export default function Products() {
  const { userType, isAuthenticated, profile } = useAuth();
  // Filter state
  const [filters, setFilters] = useState({
    category: '',
    subcategory: '',
    province: '',
    price: [0, 10000],
    rating: 0,
    inStock: false,
    badge: '',
    dateFrom: '',
  });
  const [sort, setSort] = useState('newest');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  // Price range state (dynamic from backend)
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);

  // Fetch min/max price from backend on mount
  useEffect(() => {
    const fetchPriceRange = async () => {
      try {
        const res = await fetch(`${API_URL}?ordering=price`, {
          headers: token ? { 'Authorization': 'Token ' + token } : {},
        });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const prices = data.map(p => typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0);
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          setMinPrice(min);
          setMaxPrice(max);
          setFilters(f => ({ ...f, price: [min, max] }));
        }
      } catch {}
    };
    fetchPriceRange();
  }, []);

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        let params = [];
        if (filters.category) params.push(`category=${encodeURIComponent(filters.category)}`);
        if (filters.subcategory) params.push(`subcategory=${encodeURIComponent(filters.subcategory)}`);
        if (filters.province) params.push(`province=${encodeURIComponent(filters.province)}`);
        if (filters.rating) params.push(`rating__gte=${filters.rating}`);
        if (filters.inStock) params.push('in_stock=true');
        if (filters.badge) params.push(`badge=${encodeURIComponent(filters.badge)}`);
        if (filters.price[0] !== minPrice) params.push(`price__gte=${filters.price[0]}`);
        if (filters.price[1] !== maxPrice) params.push(`price__lte=${filters.price[1]}`);
        if (filters.dateFrom) params.push(`date_added__gte=${encodeURIComponent(filters.dateFrom)}`);
        if (search) params.push(`search=${encodeURIComponent(search)}`);
        // Sort
        if (sort && sort !== 'newest') {
          if (sort === 'price-asc') params.push('ordering=price');
          else if (sort === 'price-desc') params.push('ordering=-price');
          else if (sort === 'rating-desc') params.push('ordering=-rating');
        } else {
          params.push('ordering=-date_added');
        }
        const url = `${API_URL}?${params.join('&')}`;
        const res = await fetch(url, {
          headers: token ? { 'Authorization': 'Token ' + token } : {},
        });
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError(err.message || 'Failed to load products.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [filters, sort, search]);

  // All filtering/sorting is now server-side
  const filteredProducts = products;

  // Animation helpers
  function FadeInOnView({ children, className = '' }) {
    // Intersection Observer for fade-in
    const [ref, setRef] = useState(null);
    const [inView, setInView] = useState(false);
    React.useEffect(() => {
      if (!ref) return;
      const observer = new window.IntersectionObserver(
        ([entry]) => setInView(entry.isIntersecting),
        { threshold: 0.2 }
      );
      observer.observe(ref);
      return () => observer.disconnect();
    }, [ref]);
    return (
      <div ref={setRef} className={`${className} transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {children}
      </div>
    );
  }

  // Clear all filters handler
  const handleClearAll = () => setFilters({
    category: '',
    subcategory: '',
    province: '',
    price: [minPrice, maxPrice],
    rating: 0,
    inStock: false,
    badge: '',
    dateFrom: '',
  });

  // Defensive: parse price/rating for display
  function safePrice(p) { return typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0; }
  function safeRating(p) { return typeof p.rating === 'number' ? p.rating : parseFloat(p.rating) || 0; }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 dark:from-gray-900 dark:to-gray-800 font-sans text-gray-800 dark:text-gray-200">
      <FloatingLeavesBackground leafCount={8} opacity={0.13} speed="slow" />
      <Navbar  />
      {/* Mobile filter bar - always at the top */}
      <div className="lg:hidden sticky top-16 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-emerald-100 dark:border-gray-700 flex items-center justify-between px-4 py-2 shadow-sm animate-fade-in-down">
        <button onClick={() => setShowMobileFilters(true)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow hover:scale-105 transition-all">
          <Filter className="w-5 h-5" /> Filters
        </button>
        <select value={sort} onChange={e => setSort(e.target.value)} className="rounded-lg border border-gray-200 dark:border-gray-600 px-3 py-2 bg-white/80 dark:bg-gray-700/80 focus:ring-emerald-400 text-gray-900 dark:text-gray-100">
          {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>
      {/* Main content */}
      <div className="max-w-7xl mx-auto flex gap-8 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        {/* Desktop sidebar */}
        <FilterSidebar
          filters={filters}
          setFilters={setFilters}
          sort={sort}
          setSort={setSort}
          show={true}
          isMobile={false}
          minPrice={minPrice}
          maxPrice={maxPrice}
        />
        {/* Product grid and filters */}
        <main className="flex-1">
          <FadeInOnView>
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-emerald-800 dark:text-emerald-400 drop-shadow">Browse Products</h1>
          </FadeInOnView>
          {/* Search bar */}
          <div className="mb-6 flex justify-center">
            <div className="relative w-full max-w-4xl">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search for products, e.g. Tomato, Rice, Eggs..."
                className="w-full py-4 pl-5 pr-12 rounded-2xl bg-white/90 dark:bg-gray-700/90 shadow-lg border border-emerald-100 dark:border-gray-600 focus:ring-2 focus:ring-emerald-400 focus:outline-none text-lg placeholder-gray-400 dark:placeholder-gray-500 transition-all text-gray-900 dark:text-gray-100"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none">
                <SearchIcon className="w-6 h-6" />
              </span>
            </div>
          </div>
          <SpecialFilterBar filters={filters} setFilters={setFilters} sort={sort} setSort={setSort} />
          <FilterChips filters={filters} setFilters={setFilters} onClearAll={handleClearAll} minPrice={minPrice} maxPrice={maxPrice} />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white/60 dark:bg-gray-800/60 rounded-3xl shadow-xl border border-emerald-100 dark:border-gray-600 p-0 flex flex-col animate-pulse h-72">
                  <div className="h-44 bg-emerald-100 dark:bg-gray-600 rounded-t-3xl mb-2" />
                  <div className="flex-1 flex flex-col px-4 pt-3 pb-4 gap-2">
                    <div className="h-5 w-2/3 bg-emerald-100 dark:bg-gray-600 rounded" />
                    <div className="h-4 w-1/2 bg-emerald-100 dark:bg-gray-600 rounded" />
                    <div className="h-4 w-1/3 bg-emerald-100 dark:bg-gray-600 rounded" />
                    <div className="h-6 w-1/4 bg-emerald-100 dark:bg-gray-600 rounded mt-auto" />
                  </div>
                </div>
              ))
            ) : error ? (
              <div className="col-span-full text-center text-red-500 dark:text-red-400 py-16 animate-fade-in-up">
                <SearchIcon className="w-8 h-8 mx-auto mb-2 text-rose-400" />
                <div className="text-lg font-semibold mb-4">{error}</div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-16 animate-fade-in-up">
                <SearchIcon className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                <div className="text-lg font-semibold mb-4">No products found for your filters.</div>
                <button onClick={handleClearAll} className="px-4 py-2 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 font-semibold hover:bg-rose-200 dark:hover:bg-rose-800/50 focus:bg-rose-200 dark:focus:bg-rose-800/50 focus:outline-none transition-all shadow border border-rose-200 dark:border-rose-700">Clear All Filters</button>
              </div>
            ) : (
              filteredProducts.map(product => (
                <FadeInOnView key={product.id}>
                  <ProductCard product={{ ...product, price: safePrice(product), rating: safeRating(product) }} />
                </FadeInOnView>
              ))
            )}
          </div>
        </main>
      </div>
      {/* Floating filter button for mobile */}
      <button
        className="fixed bottom-6 right-6 z-40 lg:hidden bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4 rounded-full shadow-lg flex items-center gap-2 hover:scale-110 transition-all"
        onClick={() => setShowMobileFilters(true)}
        aria-label="Open filters"
      >
        <Filter className="w-6 h-6" />
      </button>
      {/* Mobile filter drawer */}
      <FilterSidebar
        filters={filters}
        setFilters={setFilters}
        sort={sort}
        setSort={setSort}
        show={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        isMobile={true}
        minPrice={minPrice}
        maxPrice={maxPrice}
      />
    </div>
  );
} 