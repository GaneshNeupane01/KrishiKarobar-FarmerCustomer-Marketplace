import React, { useState, useRef, useEffect } from 'react';
import {
  Menu, X, Search, ShoppingCart, Heart, ChevronRight, Users, Star, Truck, Shield, MapPin, Phone, Mail, Leaf, Sprout, Apple, Wheat, MessageCircle, Info, BadgeCheck, Loader2, ChevronDown, ChevronUp, User, BookOpen, CheckCircle, ArrowRight, ArrowUpRight, Smile, Check, Clock, Globe, Sun, Image as ImageIcon
} from 'lucide-react';
import FloatingLeavesBackground from './FloatingLeavesBackground';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from './Components/Navbar';
import { useAuth } from './context/AuthContext';
import MessageButton from './Components/MessageButton';

// Helper: Intersection Observer hook for scroll animations
function useInView(threshold = 0.2) {
  const ref = useRef();
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
}

// Helper: Animated Counter
function AnimatedCounter({ to, duration = 1500, className }) {
  const [ref, inView] = useInView(0.5);
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(to / (duration / 16));
    const interval = setInterval(() => {
      start += step;
      if (start >= to) {
        setCount(to);
        clearInterval(interval);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(interval);
  }, [inView, to, duration]);
  return <span ref={ref} className={className}>{count.toLocaleString()}</span>;
}

// Helper: Skeleton Loader
function Skeleton({ className }) {
  return <div className={`animate-pulse bg-gray-200/60 rounded ${className}`} />;
}

// Demo autocomplete suggestions
const demoSuggestions = [
  'Tomatoes',
  'Organic Cauliflower',
  'Fresh Rice',
  'Buffalo Milk',
  'Local Honey',
];

const categories = [
  { name: 'Vegetables', icon: <Sprout className="w-7 h-7" />, desc: 'Fresh, local greens and roots.' },
  { name: 'Fruits', icon: <Apple className="w-7 h-7" />, desc: 'Seasonal, juicy, and sweet.' },
  { name: 'Grains', icon: <Wheat className="w-7 h-7" />, desc: 'Whole grains and cereals.' },
  { name: 'Herbs', icon: <Leaf className="w-7 h-7" />, desc: 'Aromatic and medicinal herbs.' },
  { name: 'Seeds', icon: <Sprout className="w-7 h-7" />, desc: 'High-quality seeds for planting.' },
  { name: 'Dairy', icon: <Apple className="w-7 h-7" />, desc: 'Fresh milk, cheese, and more.' },
];

const featuredProducts = [
  {
    id: 1,
    name: 'Organic Cauliflower',
    price: 3.5,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
    rating: 4.7,
    badges: ['Organic', 'Local'],
    inventory: 10,
    farmer: 'Shrestha Agro Farm',
    location: 'Kavrepalanchok',
    isNew: true,
  },
  {
    id: 2,
    name: 'Himalayan Rice',
    price: 2.2,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80',
    rating: 4.8,
    badges: ['Non-GMO'],
    inventory: 20,
    farmer: 'Pokhara Rice Mill',
    location: 'Kaski',
    isNew: false,
  },
  {
    id: 3,
    name: 'Buffalo Milk',
    price: 1.5,
    unit: 'liter',
    image: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80',
    rating: 4.9,
    badges: ['Fresh'],
    inventory: 15,
    farmer: 'Lumbini Dairy',
    location: 'Lumbini',
    isNew: true,
  },
  {
    id: 4,
    name: 'Organic Spinach',
    price: 2.0,
    unit: 'bunch',
    image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80',
    rating: 4.6,
    badges: ['Local'],
    inventory: 0,
    farmer: 'Green Valley Farm',
    location: 'Chitwan',
    isNew: false,
  },
  {
    id: 5,
    name: 'Red Lentils',
    price: 3.0,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
    rating: 4.7,
    badges: ['Organic'],
    inventory: 8,
    farmer: 'Janakpur Pulses',
    location: 'Janakpur',
    isNew: false,
  },
  {
    id: 6,
    name: 'Local Honey',
    price: 5.0,
    unit: '500g',
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    rating: 4.8,
    badges: ['Natural'],
    inventory: 12,
    farmer: 'Himalayan Honey Farm',
    location: 'Syangja',
    isNew: true,
  },
];



const blogs = [
  {
    title: '5 Tips for Sustainable Farming',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    excerpt: 'Learn how to make your farm more sustainable and eco-friendly with these practical tips.',
  },
  {
    title: 'The Benefits of Eating Local',
    image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80',
    excerpt: 'Discover why eating local produce is better for your health and the environment.',
  },
  {
    title: 'How to Start Your Own Herb Garden',
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    excerpt: "A beginner's guide to growing fresh herbs at home, indoors or outdoors.",
  },
  {
    title: 'Understanding Organic Labels',
    image: 'https://images.unsplash.com/photo-1506089676908-3592f7389d4d?auto=format&fit=crop&w=400&q=80',
    excerpt: 'What do all those organic certifications really mean? We break it down for you.',
  },
];

const faqs = [
  {
    q: 'How do I place an order?',
    a: 'Simply browse products, add to cart, and checkout securely. You\'ll receive updates at every step!',
  },
  {
    q: 'Are all products organic?',
    a: 'We highlight certified organic products with badges. Look for the "Organic" label on product cards.',
  },
  {
    q: 'How fast is delivery?',
    a: 'Most orders are delivered within 24-48 hours, depending on your location.',
  },
  {
    q: 'Can I return or exchange products?',
    a: 'Yes! We offer hassle-free returns and exchanges for any unsatisfactory products.',
  },
  {
    q: 'How do I contact customer support?',
    a: 'You can reach us via the contact form, email, or our support hotline listed in the footer.',
  },
];

// Cart API for adding items
const CART_ITEMS_URL = 'http://localhost:8000/api/cart/items/';
const token = localStorage.getItem('token');

// 1. HERO IMAGE SLIDER SETUP
const heroImages = [
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    
];

// Helper: FadeInOnView component for fade-up animation
function FadeInOnView({ children, className = '' }) {
  const [ref, inView] = useInView(0.2);
  return (
    <div ref={ref} className={`${className} transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      {children}
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, userType } = useAuth();
  const isCustomer = userType === 'customer';
  // Navbar state
  const [menuOpen, setMenuOpen] = useState(false);
  // Search state
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);
  // Quick view modal
  const [quickView, setQuickView] = useState(null);
  // FAQ accordion
  const [openFaq, setOpenFaq] = useState(null);
  // Newsletter
  const [newsletter, setNewsletter] = useState('');
  const [newsletterSent, setNewsletterSent] = useState(false);
  // Scroll progress
  const [scroll, setScroll] = useState(0);
  // HERO SLIDER STATE
  const [currentSlide, setCurrentSlide] = useState(0);
  // NAVBAR SEARCH
  const [showNavSearch, setShowNavSearch] = useState(false);

  // --- Real data states ---
  // Products & farmers from backend
  const [products, setProducts] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [freshProducts, setFreshProducts] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [farmerCount, setFarmerCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  // Loading states
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingFarmers, setLoadingFarmers] = useState(true);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  // Past farmers from customer's order history
  const [pastFarmers, setPastFarmers] = useState([]);
  const [loadingPastFarmers, setLoadingPastFarmers] = useState(false);
  // Simple toast for feedback (cart/favorite errors)
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  useEffect(() => {
    if (toast.show) {
      const t = setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2000);
      return () => clearTimeout(t);
    }
  }, [toast.show]);

  const handleAddToCart = async (product, quantity = 1) => {
    if (!isCustomer || !isAuthenticated) {
      setToast({ show: true, message: 'You have to be logged in as a customer to perform this action.', type: 'error' });
      return;
    }
    if (!product || !product.id) {
      setToast({ show: true, message: 'Invalid product.', type: 'error' });
      return;
    }
    try {
      const res = await fetch(CART_ITEMS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': 'Token ' + token } : {}),
        },
        body: JSON.stringify({ product_id: product.id, quantity })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Failed to add to cart');
      }
      setToast({ show: true, message: 'Added to cart!', type: 'success' });
    } catch (err) {
      setToast({ show: true, message: err.message || 'Failed to add to cart.', type: 'error' });
    }
  };

  // Scroll progress indicator
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      setScroll((h.scrollTop || h.scrollY || window.scrollY) / (h.scrollHeight - h.clientHeight));
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fetch aggregate user stats for animated counters
  useEffect(() => {
    fetch('http://localhost:8000/api/users/stats/')
      .then(res => (res.ok ? res.json() : Promise.reject(res)))
      .then(data => {
        setFarmerCount(typeof data.farmers === 'number' ? data.farmers : 0);
        setCustomerCount(typeof data.customers === 'number' ? data.customers : 0);
      })
      .catch(() => {
        setFarmerCount(0);
        setCustomerCount(0);
      });
  }, []);

  // Fetch products (all, fresh, top-selling)
  useEffect(() => {
    setLoadingProducts(true);
    // Fresh products: recently added
    fetch('http://localhost:8000/api/browse-products/?ordering=-date_added&page_size=8')
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        const list = Array.isArray(data) ? data : (data.results || []);
        setFreshProducts(list);
      })
      .catch(() => {
        setFreshProducts([]);
      });
    // Top selling: approximate by highest review_count ("most popular")
    fetch('http://localhost:8000/api/browse-products/?ordering=-review_count&page_size=8')
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        const list = Array.isArray(data) ? data : (data.results || []);
        setTopProducts(list);
      })
      .catch(() => {
        setTopProducts([]);
      });
    // Featured: random selection from backend products
    fetch('http://localhost:8000/api/browse-products/?page_size=24')
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        const list = Array.isArray(data) ? data : (data.results || []);
        list.sort(() => 0.5 - Math.random());
        setProducts(list);
      })
      .catch(() => {
        setProducts([]);
      })
      .finally(() => setLoadingProducts(false));
  }, []);

  // Fetch farmers (recently joined)
  useEffect(() => {
    setLoadingFarmers(true);
    fetch('http://localhost:8000/api/users/farmers/')
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        setFarmers(data);
      })
      .catch(() => {
        setFarmers([]);
      })
      .finally(() => setLoadingFarmers(false));
  }, []);

  // Fetch testimonials (reviews)
  useEffect(() => {
    setLoadingTestimonials(true);
    fetch('http://localhost:8000/api/inventory-reviews/?ordering=-date&page_size=6')
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        const list = Array.isArray(data) ? data : (data.results || []);
        setTestimonials(list);
      })
      .catch(() => {
        setTestimonials([]);
      })
      .finally(() => setLoadingTestimonials(false));
  }, []);

  // Fetch past farmers for authenticated customers from order history
  useEffect(() => {
    if (!isAuthenticated || userType !== 'customer') {
      setPastFarmers([]);
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoadingPastFarmers(true);
    fetch('http://localhost:8000/api/orders/', {
      headers: { Authorization: 'Token ' + token },
    })
      .then(res => res.json())
      .then(data => {
        const farmersMap = new Map();
        (data || []).forEach(order => {
          (order.items || []).forEach(item => {
            const fd = item.farmer_details;
            if (fd) {
              const key = fd.id || `${fd.first_name || ''}-${fd.last_name || ''}-${fd.farm_name || ''}`;
              if (!farmersMap.has(key)) {
                farmersMap.set(key, fd);
              }
            }
          });
        });
        setPastFarmers(Array.from(farmersMap.values()));
      })
      .catch(() => {
        setPastFarmers([]);
      })
      .finally(() => setLoadingPastFarmers(false));
  }, [isAuthenticated, userType]);

  // Autocomplete logic (demo)
  useEffect(() => {
    if (search.length > 0) {
      setSuggestions(demoSuggestions.filter(s => s.toLowerCase().includes(search.toLowerCase())));
    } else {
      setSuggestions([]);
    }
  }, [search]);

  // Newsletter animation
  useEffect(() => {
    if (newsletterSent) {
      const t = setTimeout(() => setNewsletterSent(false), 2000);
      return () => clearTimeout(t);
    }
  }, [newsletterSent]);

  // Progressive section loading (Intersection Observer)
  const [heroRef, heroInView] = useInView(0.2);
  const [statsRef, statsInView] = useInView(0.2);
  const [catRef, catInView] = useInView(0.2);
  const [prodRef, prodInView] = useInView(0.2);
  const [testRef, testInView] = useInView(0.2);
  const [farmerRef, farmerInView] = useInView(0.2);
  const [blogRef, blogInView] = useInView(0.2);
  const [faqRef, faqInView] = useInView(0.2);
  const [aboutRef, aboutInView] = useInView(0.2);
  const [contactRef, contactInView] = useInView(0.2);
  const [newsletterRef, newsletterInView] = useInView(0.2);

  // Parallax effect for hero
  const [parallax, setParallax] = useState(0);
  useEffect(() => {
    const onScroll = () => setParallax(window.scrollY * 0.3);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // HERO SLIDER AUTOPLAY
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 dark:from-gray-900 dark:to-gray-800 font-sans text-gray-800 dark:text-gray-200">
      {/* Floating Leaves Background */}
      <FloatingLeavesBackground leafCount={8} opacity={0.13} speed="slow" />
      {/* Navbar */}
      <Navbar />

      {/* HERO SECTION WITH IMAGE SLIDER */}
      <section id="home" ref={heroRef} className="relative h-[93vh] flex items-center overflow-hidden" style={{ marginTop: 64 }}>
        {/* Image Slider Background */}
        <div className="absolute inset-0 z-0 bg-gray-200 dark:bg-gray-800">
          {heroImages.map((img, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`}
              style={{ transitionProperty: 'opacity' }}
            >
              <img
                src={img}
                alt={`Hero ${idx + 1}`}
                className="w-full h-full object-cover object-center"
                loading={idx === 0 ? 'eager' : 'lazy'}
                style={{ backgroundColor: '#e5e7eb' }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
            </div>
          ))}
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <FadeInOnView>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
              Fresh From
              <span className="block bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Farm to Table</span>
            </h1>
          </FadeInOnView>
          <FadeInOnView>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed drop-shadow">
              Connect directly with local farmers and get the freshest produce delivered to your doorstep.
            </p>
          </FadeInOnView>
          <div className="flex flex-col sm:flex-row gap-4  animate-fade-in-up">
            {isAuthenticated && userType === 'farmer' ? (
              <button
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center"
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard <ChevronRight className="ml-2 w-5 h-5" />
              </button>
            ) : (
              <>
                <button
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center"
                  onClick={() => navigate('/inventory')}
                >
                  Shop Now <ChevronRight className="ml-2 w-5 h-5" />
                </button>
                <button
                  className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-gray-800 transition-all"
                  onClick={() => navigate('/register')}
                >
                  Become a Farmer
                </button>
              </>
            )}
          </div>
        </div>
        {/* Slide Indicators */}
       
      </section>

      {/* Animated Stats Section */}
      <section ref={statsRef} className={`py-16 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 transition-opacity duration-700 ${statsInView ? 'opacity-100' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                <AnimatedCounter to={farmerCount} />+
              </div>
              <div className="text-gray-600 dark:text-gray-400">Active Farmers</div>
            </div>
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <Star className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                <AnimatedCounter to={customerCount} />+
              </div>
              <div className="text-gray-600 dark:text-gray-400">Happy Customers</div>
            </div>
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                <AnimatedCounter to={0} />+
              </div>
              <div className="text-gray-600 dark:text-gray-400">Daily Deliveries</div>
            </div>
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                99%
              </div>
              <div className="text-gray-600 dark:text-gray-400">Quality Guarantee</div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section ref={catRef} className={`py-20 bg-white dark:bg-gray-900 transition-opacity duration-700 ${catInView ? 'opacity-100' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">Shop by Category</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Discover fresh produce and farming essentials from trusted local farmers
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((cat, i) => (
              <div key={cat.name} className="group cursor-pointer relative">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 text-center hover:shadow-xl transition-all group-hover:-translate-y-2 border border-green-100 dark:border-gray-600">
                  <div className="text-4xl mb-4 flex justify-center text-gray-700 dark:text-gray-300">{cat.icon}</div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{cat.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute left-0 right-0 mx-auto bottom-4 bg-white/90 dark:bg-gray-800/90 rounded-xl px-2 py-1 pointer-events-none z-10 shadow-lg w-40">{cat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fresh Product of This Season */}
      <section className="py-16 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 animate-fade-in-up">Fresh Product of This Season</h2>
  
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {loadingProducts ? <Skeleton className="h-40" /> : freshProducts.slice(0, 4).map(product => (
              <FadeInOnView key={product.id}>
                <div
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 flex flex-col md:flex-row items-center gap-8 transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <img src={product.image} alt={product.name} className="w-40 h-40 object-cover rounded-xl shadow" />
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">{product.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-yellow-400" /> <span className="text-gray-700 dark:text-gray-300">{product.rating}</span>
                    </div>
                    <div className="mb-2 text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {product.farmer?.farm_name || `${product.farmer?.first_name || ''} ${product.farmer?.last_name || ''}`.trim() || product.farmer?.username || 'Farmer'}
                        {product.province ? `, ${product.province}` : ''}
                      </span>
                    </div>
                    <div className="mb-4 text-2xl font-bold text-green-600 dark:text-green-400">रु{product.price}/{product.unit}</div>
                    <button
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2 justify-center"
                      onClick={e => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                    >
                      <ShoppingCart className="w-5 h-5" /> Add to Cart
                    </button>
                  </div>
                </div>
              </FadeInOnView>
            ))}
          </div>
        </div>
      </section>

      {/* Top Selling This Week */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 animate-fade-in-up">Top Selling This Week</h2>
          
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loadingProducts ? <Skeleton className="h-24" /> : topProducts.slice(0, 3).map(product => (
              <FadeInOnView key={product.id}>
                <div
                  className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg p-8 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <img src={product.image} alt={product.name} className="w-24 h-24 object-cover rounded-xl shadow mb-4" />
                  <div className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-1">{product.name}</div>
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-yellow-400" /> <span className="text-gray-700 dark:text-gray-300">{product.rating}</span>
                  </div>
                  <div className="mb-2 text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {product.farmer?.farm_name || `${product.farmer?.first_name || ''} ${product.farmer?.last_name || ''}`.trim() || product.farmer?.username || 'Farmer'}
                      {product.province ? `, ${product.province}` : ''}
                    </span>
                  </div>
                  <div className="mb-4 text-2xl font-bold text-green-600 dark:text-green-400">रु{product.price}/{product.unit}</div>
                  <button
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2 justify-center"
                    onClick={e => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                  >
                    <ShoppingCart className="w-5 h-5" /> Add to Cart
                  </button>
                </div>
              </FadeInOnView>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="products" ref={prodRef} className={`py-20 bg-gray-50 dark:bg-gray-800 transition-opacity duration-700 ${prodInView ? 'opacity-100' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-16">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">Featured Products</h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">Fresh picks from our best farmers</p>
            </div>
      
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loadingProducts ? <Skeleton className="h-64" /> : products.map(product => (
              <div
                key={product.id}
                className="bg-white dark:bg-gray-700 rounded-2xl shadow-sm hover:shadow-xl transition-all group overflow-hidden relative cursor-pointer"
                onClick={() => navigate(`/products/${product.id}`)}
              >
                {/* Product Image with Lazy Loading and Zoom */}
                <div className="relative overflow-hidden group">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500 blur-sm group-hover:blur-0"
                    loading="lazy"
                  />
                  {/* Quick View Button */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setQuickView(product);
                    }}
                    className="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-2 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors shadow"
                  >
                    <ImageIcon className="w-5 h-5 text-emerald-500" />
                  </button>
                  {/* Wishlist Button */}
              
                  {/* Inventory Indicator */}
                  <div className="absolute bottom-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow ${product.inventory < 5 ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>{product.inventory < 5 ? 'Low Stock' : 'In Stock'}</span>
                  </div>
                  {/* Badges */}
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    {product.badges && product.badges.map(badge => (
                      <span key={badge} className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-semibold shadow flex items-center gap-1"><BadgeCheck className="w-3 h-3" />{badge}</span>
                    ))}
                  </div>
                  {/* New Product Ribbon */}
                  {product.isNew && (
                    <span className="absolute top-0 left-0 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs px-3 py-1 rounded-br-2xl font-bold shadow">New</span>
                  )}
                </div>
                {/* Product Info */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{product.name}</h3>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">{product.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400 mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">
                      {product.farmer?.farm_name || `${product.farmer?.first_name || ''} ${product.farmer?.last_name || ''}`.trim() || product.farmer?.username || 'Farmer'}
                      {product.province ? `, ${product.province}` : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">रु{product.price}/{product.unit}</span>
                    <button
                      className="px-6 py-2 rounded-full font-semibold transition-all bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
                      onClick={e => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                    >
                      <ShoppingCart className="w-4 h-4" /> Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Quick View Modal */}
        {quickView && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-8 relative">
              <button onClick={() => setQuickView(null)} className="absolute top-4 right-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full p-2"><X className="w-5 h-5 text-gray-600 dark:text-gray-400" /></button>
              <img src={quickView.image} alt={quickView.name} className="w-full h-64 object-cover rounded-xl mb-4" />
              <h3 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-200">{quickView.name}</h3>
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-yellow-400" /> <span className="text-gray-700 dark:text-gray-300">{quickView.rating}</span>
              </div>
              <div className="mb-2 text-gray-600 dark:text-gray-400 flex items-center gap-2"><MapPin className="w-4 h-4" /> {quickView.farmer}, {quickView.location}</div>
              <div className="mb-4 text-2xl font-bold text-green-600 dark:text-green-400">रु{quickView.price}/{quickView.unit}</div>
              <button
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2 justify-center"
                onClick={() => handleAddToCart(quickView)}
              >
                <ShoppingCart className="w-5 h-5" /> Add to Cart
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Recently Joined Farmers */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 animate-fade-in-up">Recently Joined Farmers</h2>
          
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loadingFarmers ? <Skeleton className="h-24" /> : farmers.slice(0, 3).map(farmer => (
              <FadeInOnView key={farmer.id || farmer.name}>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg p-8 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                  <img
                    src={farmer.profile_picture || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                    alt={`${farmer.user?.first_name || ''} ${farmer.user?.last_name || ''}`.trim() || farmer.user?.username || 'Farmer'}
                    className="w-24 h-24 rounded-full object-cover border-4 border-emerald-200 dark:border-emerald-600 shadow mb-4"
                  />
                  <div className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-1">
                    {`${farmer.user?.first_name || ''} ${farmer.user?.last_name || ''}`.trim() || farmer.user?.username || 'Farmer'}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> {farmer.province || farmer.address}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mb-2">Joined {farmer.joined || ''}</div>
                  <div className="text-gray-700 dark:text-gray-300 text-center">{farmer.bio || ''}</div>
                  {farmer.phone && (
                    <div className="mt-4 flex gap-3">
                      <MessageButton
                        product={{ id: farmer.id || farmer.user?.id || 0, name: `Farmer ${farmer.user?.first_name || ''} ${farmer.user?.last_name || ''}`.trim() || 'Farmer', price: '', unit: '' }}
                        farmer={farmer}
                      />
                    </div>
                  )}
                </div>
              </FadeInOnView>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Your Farmers - only for authenticated customers with past orders */}
      {isAuthenticated && userType === 'customer' && (
        <section id="farmers" ref={farmerRef} className={`py-20 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 transition-opacity duration-700 ${farmerInView ? 'opacity-100' : 'opacity-0 translate-y-8'}`}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-200">Meet Your Farmers</h2>
            </div>
            {loadingPastFarmers ? (
              <Skeleton className="h-24" />
            ) : pastFarmers.length === 0 ? (
              <p className="text-gray-700 dark:text-gray-300">You haven't ordered from any farmers yet. Start shopping to meet your farmers!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {pastFarmers.slice(0, 4).map(farmer => (
                  <FadeInOnView key={farmer.id || farmer.farm_name || farmer.first_name}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 flex items-center gap-6 hover:scale-105 transition-transform">
                      <img
                        src={farmer.profile_picture || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                        alt={`${farmer.first_name || ''} ${farmer.last_name || ''}`.trim() || 'Farmer'}
                        className="w-24 h-24 rounded-full object-cover border-4 border-emerald-200 dark:border-emerald-600 shadow"
                      />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-5 h-5 text-emerald-500" />
                          <span className="font-bold text-lg text-gray-800 dark:text-gray-200">{`${farmer.first_name || ''} ${farmer.last_name || ''}`.trim() || farmer.farm_name || 'Farmer'}</span>
                        </div>
                        {farmer.farm_name && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{farmer.farm_name}</div>
                        )}
                        {farmer.location && (
                          <div className="text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
                            <MapPin className="w-4 h-4" /> {farmer.location}
                          </div>
                        )}
                        {farmer.phone && (
                          <div className="mt-3 flex gap-3">
                            <MessageButton
                              product={{ id: farmer.id || 0, name: farmer.farm_name || `${farmer.first_name || ''} ${farmer.last_name || ''}`.trim() || 'Farmer', price: '', unit: '' }}
                              farmer={{
                                id: farmer.id,
                                first_name: farmer.first_name,
                                last_name: farmer.last_name,
                                phone: farmer.phone,
                                farm_name: farmer.farm_name,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </FadeInOnView>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Recipe of the Week 
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">Recipe of the Week</h2>
          <FadeInOnView>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg p-8 flex flex-col md:flex-row items-center gap-8 transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80" alt="Recipe" className="w-40 h-40 object-cover rounded-xl shadow" />
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">Fresh Tomato Salad</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">A simple, healthy salad using organic tomatoes, fresh herbs, and a zesty dressing.</p>
                <button className="mt-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all flex items-center gap-2">View Recipe <BookOpen className="w-4 h-4" /></button>
              </div>
            </div>
          </FadeInOnView>
        </div>
      </section>
      */}

      {/* Agro & Food Blogs 
      <section ref={blogRef} className={`py-20 bg-white dark:bg-gray-900 transition-opacity duration-700 ${blogInView ? 'opacity-100' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Agro & Food Blogs</h2>
            <a href="#" className="hidden md:flex items-center text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-semibold">
              View All <ChevronRight className="ml-1 w-5 h-5" />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {blogs.map(blog => (
              <FadeInOnView key={blog.title}>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg p-8 flex flex-col md:flex-row items-center gap-8 hover:scale-105 transition-transform">
                  <img src={blog.image} alt={blog.title} className="w-40 h-40 object-cover rounded-xl shadow" />
  
                <div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">{blog.title}</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">{blog.excerpt}</p>
                    <button className="mt-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all flex items-center gap-2">Read More <BookOpen className="w-4 h-4" /></button>
                  </div>
                </div>
              </FadeInOnView>
            ))}
          </div>
        </div>
      </section>
      */}

      {/* Why Choose Us & How It Works */}
      <section className="py-20 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">Why Choose FarmDirect?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <FadeInOnView>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 flex flex-col items-center text-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                <Smile className="w-10 h-10 text-emerald-500 mb-4" />
                <h4 className="font-semibold text-lg mb-2 text-gray-800 dark:text-gray-200">Direct from Farmers</h4>
                <p className="text-gray-600 dark:text-gray-300">No middlemen, just fresh produce straight from the source.</p>
              </div>
            </FadeInOnView>
            <FadeInOnView>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 flex flex-col items-center text-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                <Globe className="w-10 h-10 text-emerald-500 mb-4" />
                <h4 className="font-semibold text-lg mb-2 text-gray-800 dark:text-gray-200">Sustainable Practices</h4>
                <p className="text-gray-600 dark:text-gray-300">We support eco-friendly and sustainable farming methods.</p>
              </div>
            </FadeInOnView>
            <FadeInOnView>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 flex flex-col items-center text-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                <Sun className="w-10 h-10 text-emerald-500 mb-4" />
                <h4 className="font-semibold text-lg mb-2 text-gray-800 dark:text-gray-200">Premium Quality</h4>
                <p className="text-gray-600 dark:text-gray-300">Only the best, hand-picked products make it to your table.</p>
              </div>
            </FadeInOnView>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-12">How It Works</h2>
          {/* Infographic Timeline Style - Green Themed */}
          <FadeInOnView>
            <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row items-stretch justify-between md:space-x-0 space-y-16 md:space-y-0">
              {/* Section subtle background pattern/gradient */}
              <div className="absolute inset-0 pointer-events-none z-0">
                <div className="w-full h-full bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 opacity-80" />
              </div>
              {/* Horizontal line at the bottom */}
              <div className="hidden md:block absolute bottom-0 left-0 right-0 h-1 bg-emerald-100 dark:bg-gray-600 z-10" style={{top: 'calc(100% - 32px)'}} />
              {/* Steps */}
              {[
                {
                  icon: <Search className="w-8 h-8 md:w-10 md:h-10 text-emerald-500" />, 
                  arc: 'from-emerald-400 via-green-400 to-emerald-200',
                  number: '01',
                  numColor: 'bg-emerald-400',
                  title: 'Browse',
                  desc: 'Explore a wide range of fresh products and categories.'
                },
                {
                  icon: <ShoppingCart className="w-8 h-8 md:w-10 md:h-10 text-green-600" />, 
                  arc: 'from-green-500 via-emerald-400 to-green-200',
                  number: '02',
                  numColor: 'bg-green-500',
                  title: 'Order',
                  desc: 'Add your favorites to cart and checkout securely.'
                },
                {
                  icon: <Truck className="w-8 h-8 md:w-10 md:h-10 text-lime-500" />, 
                  arc: 'from-lime-400 via-emerald-400 to-lime-200',
                  number: '03',
                  numColor: 'bg-lime-400',
                  title: 'Delivered',
                  desc: 'Get your order delivered fresh to your doorstep.'
                }
              ].map((step, idx) => (
                <div key={step.title} className="relative flex flex-col items-center flex-1 group z-20">
                  {/* Colored Arc + White Circle Icon */}
                  <div className="relative flex flex-col items-center">
                    {/* Arc */}
                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 md:w-36 md:h-20 z-10 pointer-events-none`}>
                      <div className={`w-full h-full bg-gradient-to-r ${step.arc} rounded-t-full shadow-lg`} />
                    </div>
                    {/* White Circle with Icon and green glow */}
                    <div className="relative z-20 w-20 h-20 md:w-28 md:h-28 rounded-full bg-white dark:bg-gray-800 shadow-2xl flex items-center justify-center border-4 border-white dark:border-gray-700 group-hover:scale-110 group-hover:shadow-emerald-200 dark:group-hover:shadow-emerald-800 transition-transform duration-300" style={{boxShadow: '0 8px 32px 0 rgba(16,185,129,0.12)'}}>
                      {step.icon}
                    </div>
                  </div>
                  {/* Card */}
                  <div className="relative z-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl px-8 py-10 mt-10 w-full max-w-xs text-center border border-emerald-100 dark:border-gray-600 group-hover:shadow-2xl transition-all duration-300">
                    <h4 className="font-semibold text-xl md:text-2xl text-gray-800 dark:text-gray-200 mb-2">{step.title}</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg">{step.desc}</p>
                  </div>
                  {/* Numbered Circle on Timeline */}
                  <div className={`absolute left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-0 md:translate-y-0 bottom-[-32px] md:bottom-[-32px] w-14 h-14 rounded-full ${step.numColor} flex items-center justify-center text-white text-2xl font-bold shadow-lg border-4 border-white dark:border-gray-700 z-20`}>{step.number}</div>
                  {/* Connector for mobile (vertical) */}
                  {idx !== 2 && (
                    <div className="block md:hidden absolute bottom-[-26px] left-1/2 w-1 h-16 bg-emerald-100 dark:bg-gray-600 z-0" style={{transform: 'translateX(-50%)'}} />
                  )}
                </div>
              ))}
              {/* Horizontal line for mobile (behind numbered circles) */}
              <div className="md:hidden absolute left-0 right-0 bottom-0 h-1 bg-emerald-100 dark:bg-gray-600 z-10" style={{top: 'calc(100% - 24px)'}} />
            </div>
          </FadeInOnView>
        </div>
      </section>

      {/* Our Quality Promise */}
      <section className="py-20 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">Our Quality Promise</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FadeInOnView>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 flex flex-col items-center text-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                <CheckCircle className="w-10 h-10 text-emerald-500 mb-4" />
                <h4 className="font-semibold text-lg mb-2 text-gray-800 dark:text-gray-200">Freshness Guarantee</h4>
                <p className="text-gray-600 dark:text-gray-300">We promise only the freshest, hand-picked produce delivered to your door.</p>
              </div>
            </FadeInOnView>
            <FadeInOnView>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 flex flex-col items-center text-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                <Shield className="w-10 h-10 text-emerald-500 mb-4" />
                <h4 className="font-semibold text-lg mb-2 text-gray-800 dark:text-gray-200">Quality Control</h4>
                <p className="text-gray-600 dark:text-gray-300">Every product is inspected and certified by our quality team.</p>
              </div>
            </FadeInOnView>
            <FadeInOnView>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 flex flex-col items-center text-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                <ArrowUpRight className="w-10 h-10 text-emerald-500 mb-4" />
                <h4 className="font-semibold text-lg mb-2 text-gray-800 dark:text-gray-200">Easy Returns</h4>
                <p className="text-gray-600 dark:text-gray-300">Not satisfied? Hassle-free returns and refunds for your peace of mind.</p>
              </div>
            </FadeInOnView>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section ref={testRef} className={`py-20 bg-white dark:bg-gray-900 transition-opacity duration-700 ${testInView ? 'opacity-100' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-10 text-gray-800 dark:text-gray-200">What Our Customers Say</h2>
          <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
            {loadingTestimonials ? <Skeleton className="h-20" /> : testimonials.map((t, i) => (
              <div key={i} className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg p-8 flex flex-col items-center w-full md:w-1/2 group hover:scale-105 transition-transform">
                <img
                  src={t.user_profile_image || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                  alt={`${t.first_name || ''} ${t.last_name || ''}`.trim() || t.user || 'User'}
                  className="w-20 h-20 rounded-full object-cover border-4 border-emerald-200 dark:border-emerald-600 mb-4 shadow"
                />
                <div className="flex gap-1 mb-2">{Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />)}</div>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 italic">"{t.review}"</p>
                <div className="font-semibold text-emerald-700 dark:text-emerald-400">
                  {`${t.first_name || ''} ${t.last_name || ''}`.trim() || t.user || 'Customer'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global toast for Home page actions */}
      {toast.show && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl shadow-lg font-semibold text-sm ${toast.type === 'error' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
          {toast.message}
        </div>
      )}

      {/* FAQ */}
      <section ref={faqRef} className={`py-20 bg-white dark:bg-gray-900 transition-opacity duration-700 ${faqInView ? 'opacity-100' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">Frequently Asked Questions</h2>
            <a href="#faq" className="hidden md:flex items-center text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-semibold">
              View All <ChevronRight className="ml-1 w-5 h-5" />
            </a>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-emerald-100 dark:border-gray-600 rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 font-semibold text-lg text-left text-gray-800 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-gray-700 transition-all">
                  {faq.q}
                  {openFaq === i ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                <div className={`px-6 pb-4 text-gray-700 dark:text-gray-300 text-base transition-all duration-300 ${openFaq === i ? 'block' : 'hidden'}`}>{faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" ref={contactRef} className={`py-20 bg-white dark:bg-gray-900 transition-opacity duration-700 ${contactInView ? 'opacity-100' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">Get in Touch</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Have questions or want to join our farming community? We'd love to hear from you.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mr-4">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Visit Our Office</h4>
                    <p className="text-gray-600 dark:text-gray-400">No office yet<br /></p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mr-4">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Call Us</h4>
                    <p className="text-gray-600 dark:text-gray-400">No official contact yet<br /></p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mr-4">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Email Us</h4>
                    <p className="text-gray-600 dark:text-gray-400">No official email yet<br /></p>
                  </div>
                </div>
              </div>
            </div>
            {/* Contact Form */}
           
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
     

      {/* Floating Action Buttons */}
    
      {/* Custom Animations */}
    

      {/* Footer */}
      <footer className="bg-gradient-to-r from-green-600 to-emerald-700 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">FarmDirect</h3>
            <p className="text-emerald-100 mb-4">Connecting farmers and consumers for a better tomorrow. Premium, fresh, and direct from the source.</p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="hover:text-yellow-300"><svg width="24" height="24" fill="currentColor"><circle cx="12" cy="12" r="10" /></svg></a>
              <a href="#" className="hover:text-yellow-300"><svg width="24" height="24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="4" /></svg></a>
              <a href="#" className="hover:text-yellow-300"><svg width="24" height="24" fill="currentColor"><polygon points="12,2 22,22 2,22" /></svg></a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#home" className="hover:underline">Home</a></li>
              <li><a href="#products" className="hover:underline">Products</a></li>
              <li><a href="#farmers" className="hover:underline">Farmers</a></li>

              <li><a href="#contact" className="hover:underline">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Contact Us</h4>
            <p>Email: <a href="mailto:hello@farmdirect.com" className="underline">Will be updated soon </a></p>
            <p>Phone: Will be updated soon</p>
            <p className="mt-4">Location: Will be updated soon</p>
          </div>
        </div>
        <div className="bg-emerald-900 text-emerald-200 text-center py-4 text-sm">&copy; {new Date().getFullYear()} FarmDirect. All rights reserved.</div>
      </footer>
    </div>
  );
}
