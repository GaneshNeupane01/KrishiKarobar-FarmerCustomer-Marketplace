import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  Share2, 
  MapPin, 
  Star, 
  ShoppingCart, 
  MessageCircle, 
  User, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Check,
  Truck,
  Shield,
  Award,
  Phone,
  Mail,
  Calendar,
  Package,
  Leaf,
  ThumbsUp,
  ThumbsDown,
  Info,
  AlertCircle
} from 'lucide-react';
import Navbar from './Navbar';
import FloatingLeavesBackground from '../FloatingLeavesBackground';
import { useTheme } from '../context/ThemeContext';
import { useParams, useNavigate } from 'react-router-dom';
import MessageButton from './MessageButton';
import { getUserInitials } from '../utils';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:8000/api/browse-products/';
const REVIEWS_URL = 'http://localhost:8000/api/product-reviews/';
const CART_ITEMS_URL = 'http://localhost:8000/api/cart/items/';

const ProductDetails = ({ isInventory = false }) => {
  const { id } = useParams();
  const { isDark } = useTheme();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [reviewFilter, setReviewFilter] = useState('all');
  const [reviewSort, setReviewSort] = useState('newest');
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [reviewImage, setReviewImage] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewStars, setReviewStars] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [userIsVerified, setUserIsVerified] = useState(true); // mock: user is verified
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewList, setReviewList] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewError, setReviewError] = useState('');
  const fileInputRef = useRef();
  const [reviewSubmitError, setReviewSubmitError] = useState('');
  const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [editText, setEditText] = useState('');
  const [editStars, setEditStars] = useState(0);
  const [editImage, setEditImage] = useState(null);
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(true);
  const [similarError, setSimilarError] = useState('');
  const navigate = useNavigate();
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const { userType, isAuthenticated, profile } = useAuth();
  const isCustomer = userType === 'customer';
  const isFarmer = userType === 'farmer';

  // Get token for authentication
  const token = localStorage.getItem('token');

  // Fetch product details from backend
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const url = isInventory
          ? `http://localhost:8000/api/inventory/${id}/`
          : `http://localhost:8000/api/browse-products/${id}/`;
        const res = await fetch(url, {
          headers: token ? { 'Authorization': 'Token ' + token } : {},
        });
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        setError(err.message || 'Failed to load product.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, token, isInventory]);

  // Fetch reviews from backend
  useEffect(() => {
    if (!id) return;
    const fetchReviews = async () => {
      setLoadingReviews(true);
      setReviewError('');
      try {
        const url = isInventory
          ? `http://localhost:8000/api/inventory-reviews/?product=${id}`
          : `${REVIEWS_URL}?product=${id}`;
        const res = await fetch(url, {
          headers: token ? { 'Authorization': 'Token ' + token } : {},
        });
        if (!res.ok) {
          if (res.status === 403) {
            throw new Error('Access denied. Please log in.');
          }
          throw new Error('Failed to fetch reviews');
        }
        const data = await res.json();
        setReviewList(data);
      } catch (err) {
        setReviewError(err.message || 'Failed to load reviews.');
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [id, token, isInventory]);

  // Fetch rating distribution for the current product
  const [ratingDistribution, setRatingDistribution] = useState({});
  const [distributionLoading, setDistributionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchRatingDistribution = async () => {
      setDistributionLoading(true);
      try {
        const url = isInventory
          ? `http://localhost:8000/api/inventory-reviews/rating_distribution/?product=${id}`
          : `${REVIEWS_URL}rating_distribution/?product=${id}`;
        const res = await fetch(url, {
          headers: token ? { 'Authorization': 'Token ' + token } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setRatingDistribution(data);
        } else {
          console.error('Failed to fetch rating distribution:', res.status);
        }
      } catch (err) {
        console.error('Failed to fetch rating distribution:', err);
      } finally {
        setDistributionLoading(false);
      }
    };
    fetchRatingDistribution();
  }, [id, token, isInventory]);

  // Fetch similar products from backend
  useEffect(() => {
    if (!id) return;
    setLoadingSimilar(true);
    setSimilarError('');
    if (isInventory) {
      // Fetch similar inventory products
      const cat = product?.category || '';
      const subcat = product?.subcategory || '';
      if (!cat) { setLoadingSimilar(false); setSimilarProducts([]); return; }
      fetch(`http://localhost:8000/api/inventory/?category=${encodeURIComponent(cat)}&subcategory=${encodeURIComponent(subcat)}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch similar products');
          return res.json();
        })
        .then(data => {
          // Exclude current product
          setSimilarProducts((data.results || data).filter(p => p.id !== Number(id)));
        })
        .catch(err => setSimilarError(err.message || 'Failed to load similar products.'))
        .finally(() => setLoadingSimilar(false));
    } else {
      // Existing logic for normal products
      fetch(`http://localhost:8000/api/browse-products/${id}/similar/`, {
        headers: token ? { 'Authorization': 'Token ' + token } : {},
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch similar products');
          return res.json();
        })
        .then(data => setSimilarProducts(data))
        .catch(err => setSimilarError(err.message || 'Failed to load similar products.'))
        .finally(() => setLoadingSimilar(false));
    }
  }, [id, token, isInventory, product]);

  // Defensive: fallback for images
  const images = product?.image ? (Array.isArray(product.image) ? product.image : [product.image]) : [];

  // Defensive: features/specifications fallback
  const features = Array.isArray(product?.features) ? product.features : [];
  const specifications = product?.specifications && typeof product.specifications === 'object' ? product.specifications : {};

  // Defensive: farmer info
  const farmer = product?.farmer || {};
  const minOrder = typeof product?.min_order === 'number' ? product.min_order : 1;
  const stock = typeof product?.stock === 'number' ? product.stock : 0;
  const status = product?.status || (stock > 0 ? 'Active' : 'Out of Stock');
  const unit = product?.unit || '';
  const category = product?.category || '';
  const subcategory = product?.subcategory || '';

  // Defensive: quantity logic
  useEffect(() => {
    setQuantity(minOrder);
  }, [minOrder, stock]);
  const handleQuantityChange = (delta) => {
    setQuantity(q => {
      let next = q + delta;
      if (next < minOrder) next = minOrder;
      if (next > stock) next = stock;
      return next;
    });
  };

  // Order Now logic
  const [ordering, setOrdering] = useState(false);
  const handleOrderNow = async () => {
    if (!product || (!isCustomer && !isFarmer && !isInventory)) return;
    if (quantity > stock) {
      setToast({ show: true, message: `Cannot order more than available stock (${stock} ${unit}).`, type: 'error' });
      return;
    }
    setOrdering(true);
    try {
      // Fetch profile for address
      const profileRes = await fetch('http://localhost:8000/api/profile/', {
        headers: token ? { 'Authorization': 'Token ' + token } : {},
      });
      if (!profileRes.ok) throw new Error('Failed to fetch profile');
      const profileData = await profileRes.json();
      const shipping_address = profileData.profile.address || '';
      // Build order payload
      const items = isInventory
        ? [{ inventory_product_id: product.id, quantity, note: '' }]
        : [{
            product_id: product.id,
            farmer_id: product.farmer?.id,
            quantity,
            note: ''
          }];
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
          ...(token ? { 'Authorization': 'Token ' + token } : {}),
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Failed to place order');
      }
      setToast({ show: true, message: 'Order placed successfully!', type: 'success' });
    } catch (err) {
      setToast({ show: true, message: err.message || 'Failed to place order.', type: 'error' });
    } finally {
      setOrdering(false);
    }
  };

  const renderStars = (rating, size = 16) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star}
            size={size}
            className={`${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const filteredReviews = reviewList
    .filter(review => reviewFilter === 'all' ? true : review.rating === parseInt(reviewFilter))
    .sort((a, b) => {
      if (reviewSort === 'newest') return new Date(b.date) - new Date(a.date);
      if (reviewSort === 'oldest') return new Date(a.date) - new Date(b.date);
      if (reviewSort === 'highest') return b.rating - a.rating;
      if (reviewSort === 'lowest') return a.rating - b.rating;
      return 0;
    });

  // Review submission handler
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewStars || !reviewText) {
      setReviewSubmitError('Please provide a rating and review text.');
      return;
    }
    if (!token) {
      setReviewSubmitError('You must be logged in to post a review.');
      return;
    }
    if (!isCustomer && !(isInventory && isFarmer)) {
      setReviewSubmitError('Only customers and farmers can post reviews for inventory.');
      return;
    }
    setSubmittingReview(true);
    setReviewSubmitError('');
    try {
      const formData = new FormData();
      formData.append('product', id);
      formData.append('rating', reviewStars);
      formData.append('review', reviewText);
      if (reviewImage) formData.append('image', reviewImage);
      const url = isInventory ? 'http://localhost:8000/api/inventory-reviews/' : REVIEWS_URL;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': 'Token ' + token },
        body: formData,
      });
      if (!res.ok) {
        const errorText = await res.text();
        let errorMessage;
        try {
          const data = JSON.parse(errorText);
          errorMessage = data.detail || Object.values(data).join(' ');
        } catch {
          errorMessage = errorText || 'Failed to submit review';
        }
        if (res.status === 403) {
          errorMessage = 'Access denied. Only customers and farmers can post reviews for inventory.';
        }
        throw new Error(errorMessage);
      }
      const result = await res.json();
      setReviewSubmitSuccess(true);
      setReviewText('');
      setReviewStars(0);
      setReviewImage(null);
      setTimeout(() => setReviewSubmitSuccess(false), 2000);
      // Refresh reviews
      const reviewRes = await fetch(`${isInventory ? 'http://localhost:8000/api/inventory-reviews/?product=' + id : REVIEWS_URL + '?product=' + id}`, {
        headers: { 'Authorization': 'Token ' + token }
      });
      if (reviewRes.ok) {
        const reviewData = await reviewRes.json();
        setReviewList(reviewData);
      }
    } catch (err) {
      setReviewSubmitError(err.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Helpful/Report feedback
  const handleHelpful = (id) => {
    setReviewList(prev => prev.map(r => r.id === id ? { ...r, helpful: r.helpful + 1 } : r));
  };
  const handleReport = (id) => {
    setReviewList(prev => prev.map(r => r.id === id ? { ...r, reported: true } : r));
  };

  // Like/dislike/unlike handlers with better error handling
  const handleLike = async (reviewId) => {
    try {
      const url = isInventory
        ? `http://localhost:8000/api/inventory-reviews/${reviewId}/like/`
        : `${REVIEWS_URL}${reviewId}/like/`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': 'Token ' + token },
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error('Failed to like review');
      }
      const data = await res.json();
      setReviewList(list => list.map(r => r.id === reviewId ? { ...r, ...data } : r));
    } catch (err) {
      console.error('Like error:', err);
    }
  };
  
  const handleDislike = async (reviewId) => {
    try {
      const url = isInventory
        ? `http://localhost:8000/api/inventory-reviews/${reviewId}/dislike/`
        : `${REVIEWS_URL}${reviewId}/dislike/`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': 'Token ' + token },
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error('Failed to dislike review');
      }
      const data = await res.json();
      setReviewList(list => list.map(r => r.id === reviewId ? { ...r, ...data } : r));
    } catch (err) {
      console.error('Dislike error:', err);
    }
  };
  
  const handleUnlike = async (reviewId) => {
    try {
      const url = isInventory
        ? `http://localhost:8000/api/inventory-reviews/${reviewId}/unlike/`
        : `${REVIEWS_URL}${reviewId}/unlike/`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': 'Token ' + token },
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error('Failed to unlike review');
      }
      const data = await res.json();
      setReviewList(list => list.map(r => r.id === reviewId ? { ...r, ...data } : r));
    } catch (err) {
      console.error('Unlike error:', err);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setEditText(review.review);
    setEditStars(review.rating);
    setEditImage(null);
    setEditError('');
  };
  const handleDeleteReview = async (review) => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    setEditLoading(true);
    try {
      const res = await fetch(`${REVIEWS_URL}${review.id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Token ' + token },
      });
      if (!res.ok) throw new Error('Failed to delete review');
      setReviewList(list => list.filter(r => r.id !== review.id));
      setEditingReview(null);
    } catch (err) {
      setEditError(err.message || 'Failed to delete review.');
    } finally {
      setEditLoading(false);
    }
  };
  const handleEditReviewSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    try {
      const formData = new FormData();
      formData.append('review', editText);
      formData.append('rating', editStars);
      if (editImage) formData.append('image', editImage);
      const res = await fetch(`${REVIEWS_URL}${editingReview.id}/`, {
        method: 'PATCH',
        headers: { 'Authorization': 'Token ' + token },
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to update review');
      const updated = await res.json();
      setReviewList(list => list.map(r => r.id === editingReview.id ? { ...r, ...updated } : r));
      setEditingReview(null);
    } catch (err) {
      setEditError(err.message || 'Failed to update review.');
    } finally {
      setEditLoading(false);
    }
  };

  // Toast auto-hide
  useEffect(() => {
    if (toast.show) {
      const t = setTimeout(() => setToast({ ...toast, show: false }), 2500);
      return () => clearTimeout(t);
    }
  }, [toast.show]);

  // Loading and error states
  if (loading) return <div className="min-h-screen flex items-center justify-center text-emerald-600 text-xl">Loading product...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-rose-600 text-xl">{error}</div>;
  if (!product) return null;

  return (
    <div className={
      `relative min-h-screen transition-colors duration-300 bg-gradient-to-br from-emerald-50 to-green-100 dark:from-gray-900 dark:to-gray-800`
    }>
      <FloatingLeavesBackground leafCount={8} opacity={0.13} speed="slow" />
      <Navbar />
      <div className="pt-24 pb-10 px-4 md:px-16 max-w-7xl mx-auto">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* Product Images */}
            <div className="space-y-4 animate-fade-in-up">
              <div className="relative group">
                <div className="aspect-square bg-white/90 dark:bg-gray-800/90 rounded-3xl shadow-2xl border border-emerald-100/50 dark:border-gray-700 overflow-hidden">
                  <img 
                    src={images[selectedImage]} 
                    alt={product?.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="absolute top-4 right-4 flex space-x-2">
             
                  <button
                    className="p-3 bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-300 rounded-full shadow-lg hover:bg-emerald-50 dark:hover:bg-gray-800 transition-colors"
                    onClick={async () => {
                      const url = window.location.href;
                      if (navigator.share) {
                        try {
                          await navigator.share({
                            title: product?.name || 'Product',
                            text: 'Check out this product on KrishiKarobar',
                            url,
                          });
                        } catch (err) {
                          if (err && err.name === 'AbortError') return;
                          setToast({ show: true, message: 'Unable to share right now.', type: 'error' });
                        }
                      } else if (navigator.clipboard && navigator.clipboard.writeText) {
                        try {
                          await navigator.clipboard.writeText(url);
                          setToast({ show: true, message: 'Link copied to clipboard!', type: 'success' });
                        } catch {
                          setToast({ show: true, message: 'Failed to copy link.', type: 'error' });
                        }
                      } else {
                        window.prompt('Copy this link:', url);
                      }
                    }}
                  >
                    <Share2 size={20} />
                  </button>
                </div>
              </div>
              <div className="flex space-x-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 ${selectedImage === index ? 'border-emerald-500 shadow-lg' : 'border-emerald-100 dark:border-gray-700 hover:shadow-md'} transition-all duration-300 animate-fade-in-up`}
                  >
                    <img src={image} alt={`${product?.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6 animate-fade-in-up">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent mb-2 dark:from-emerald-400 dark:to-teal-400">
                  {product?.name}
                </h1>
                <div className="flex items-center space-x-4 mb-4 gap-2">
               
                  <span className="text-2xl md:text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent mb-2 dark:from-emerald-400 dark:to-teal-400">
                   {category} - {subcategory}
                     </span>
                     {renderStars(product?.rating, 20)}
                  <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    {product?.rating} <span className="text-gray-400 dark:text-gray-400">({product?.reviewCount} reviews)</span>
                  </span>
                </div>
                
               
              </div>

              {/* Farmer Info */}
              <div className="flex items-center justify-between mt-6 gap-4">
                <div className="flex items-center gap-3">
                  {farmer.profile_picture ? (
                    <img
                      src={farmer.profile_picture}
                      alt={(farmer.user?.first_name || farmer.first_name || '') + ' ' + (farmer.user?.last_name || farmer.last_name || '')}
                      className="w-12 h-12 rounded-full object-cover border-2 border-emerald-100 dark:border-gray-700"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xl font-bold border-2 border-emerald-100 dark:border-gray-700">
                      {getUserInitials({first_name: farmer.user?.first_name || farmer.first_name, last_name: farmer.user?.last_name || farmer.last_name})}
                    </div>
                  )}
                  <span className="font-semibold text-emerald-900 dark:text-emerald-200 text-lg">{(farmer.user?.first_name || farmer.first_name || '') + ' ' + (farmer.user?.last_name || farmer.last_name || '')}</span>
                </div>
                
                {isCustomer && product?.farmer && (
                  <div className="flex gap-3 mt-4">
                    <MessageButton product={product} farmer={product.farmer} />
                  </div>
                )}
              </div>

              {/* Price and Status */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">रु{product?.price}</span>
                    <span className="text-lg text-gray-400 dark:text-gray-500 line-through">रु{product?.originalPrice}</span>
                    <span className="bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 px-2 py-1 rounded-full text-sm font-medium animate-fade-in-up">
                      {product?.discount}% OFF
                    </span>
                  </div>
                  <span className="text-gray-600 dark:text-gray-300">per {product?.unit}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-400 dark:text-emerald-300" />
                    <span className="text-gray-600 dark:text-gray-300">Status:</span>
                    <span className={stock > 0 ? 'font-medium text-emerald-700 dark:text-white' : 'font-medium text-red-500 dark:text-red-400'}>{stock > 0 ? 'Active' : 'Out of Stock'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400 dark:text-emerald-300" />
                    <span className="text-gray-600 dark:text-gray-300">Location:</span>
                    <span className="font-medium dark:text-white">{product?.province || ''} , {product?.product_address || ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-400 dark:text-emerald-300" />
                    <span className="text-gray-600 dark:text-gray-300">Available:</span>
                    <span className="font-medium dark:text-white">{stock} {unit}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-emerald-400 dark:text-emerald-300" />
                    <span className="text-gray-600 dark:text-gray-300">Min Order:</span>
                    <span className="font-medium dark:text-white">{minOrder} {unit}</span>
                  </div>
                </div>
              </div>

              {/* Quantity and Actions */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-gray-700 dark:text-gray-200 font-medium">Quantity:</span>
                  <div className="flex items-center border border-emerald-200 dark:border-emerald-700 rounded-lg bg-white/80 dark:bg-gray-800/80">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="px-3 py-2 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors rounded-l-lg dark:text-white"
                      disabled={quantity <= minOrder}
                      title={`Minimum order is ${minOrder} ${unit}`}
                    >-</button>
                    <span className="px-4 py-2 border-x border-emerald-100 dark:border-emerald-700 dark:text-white">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="px-3 py-2 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors rounded-r-lg dark:text-white"
                      disabled={quantity >= stock}
                      title={`Maximum available is ${stock} ${unit}`}
                    >+</button>
                  </div>
                  <span className="text-gray-600 dark:text-gray-300">{unit}</span>
                  <span className="text-xs text-gray-400 ml-2">(Min: {minOrder}, Max: {stock})</span>
                </div>
                { /*  <div className="flex items-center gap-4 mt-6">
                   Order Now button ye
              {isCustomer && stock > 0 && (
                    <button
                      onClick={handleOrderNow}
                      disabled={ordering}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all text-lg"
                    >
                      {ordering ? 'Ordering...' : 'Order Now'}
                    </button>
                  )}
               
                 
                   </div> */}
                <div className="flex gap-4">
                  <button
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-2xl font-semibold shadow-xl hover:shadow-emerald-500/25 hover:scale-105 transition-all duration-300"
                    disabled={stock === 0 || ordering}
                    onClick={e => {
                      if (!isCustomer) {
                        e.preventDefault();
                        setToast({ show: true, message: 'You have to be logged in as a customer to perform this action.', type: 'error' });
                        return;
                      }
                      else{
                        handleOrderNow();
                      }
                      // ... existing order logic (if any)
                    }}
                  >
                     {ordering ? 'Ordering...' : 'Order Now'}
                  </button>
                  <button
                    className="flex-1 bg-white dark:bg-gray-900 border-2 border-emerald-500 text-emerald-700 dark:text-emerald-300 px-6 py-3 rounded-2xl font-semibold hover:bg-emerald-50 dark:hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2 shadow"
                    onClick={async e => {
                      if (!isCustomer) {
                        e.preventDefault();
                        setToast({ show: true, message: 'You have to be logged in as a customer to perform this action.', type: 'error' });
                        return;
                      }
                      try {
                        const res = await fetch(CART_ITEMS_URL, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            ...(token ? { 'Authorization': 'Token ' + token } : {}),
                          },
                          body: JSON.stringify(isInventory ? { inventory_product_id: product.id, quantity } : { product_id: product.id, quantity })
                        });
                        if (!res.ok) {
                          const data = await res.json().catch(() => ({}));
                          throw new Error(data.detail || 'Failed to add to cart');
                        }
                        setToast({ show: true, message: 'Added to cart!', type: 'success' });
                      } catch (err) {
                        setToast({ show: true, message: err.message || 'Failed to add to cart.', type: 'error' });
                      }
                    }}
                  >
                    <ShoppingCart size={20} />
                    <span>Add to Cart</span>
                  </button>
                </div>
                
                {/* Message and Call Buttons */}
            
              </div>

              {/* Trust Badges */}
              <div className="flex items-center justify-between bg-white/80 dark:bg-gray-800/80 rounded-xl p-4 border border-emerald-100 dark:border-gray-700 animate-fade-in-up">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-5 h-5 text-emerald-500 dark:text-emerald-300" />
                  <span className="text-gray-700 dark:text-gray-200">Secure Payment</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Truck className="w-5 h-5 text-blue-500 dark:text-blue-300" />
                  <span className="text-gray-700 dark:text-gray-200">Fast Delivery</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Award className="w-5 h-5 text-yellow-500 dark:text-yellow-300" />
                  <span className="text-gray-700 dark:text-gray-200">Quality Assured</span>
                </div>
              </div>
            </div>

          </div>

          {/* Product Details Tabs */}
          <div className="bg-white/80 dark:bg-gray-800/80 rounded-3xl shadow-xl border border-emerald-100/50 dark:border-gray-700 overflow-hidden mb-12 animate-fade-in-up">
            <div className="border-b border-emerald-100/50 dark:border-gray-700">
              <div className="flex gap-8 px-6">
                {['description', 'specifications', 'reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-2 border-b-2 font-medium capitalize transition-colors ${activeTab === tab ? 'border-emerald-500 text-emerald-600 dark:text-emerald-300' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-emerald-700 dark:hover:text-emerald-300'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-6">
              {activeTab === 'description' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Product Description</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {showFullDescription ? product?.description : `${product?.description.substring(0, 200)}...`}
                    </p>
                    <button 
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="text-emerald-600 dark:text-emerald-300 hover:text-emerald-700 dark:hover:text-emerald-400 font-medium mt-2"
                    >
                      {showFullDescription ? 'Show Less' : 'Read More'}
                    </button>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Key Features</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
                          <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div>
                  <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Product Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <span className="font-medium text-gray-700 dark:text-gray-200">{key}:</span>
                        <span className="text-gray-900 dark:text-gray-100">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Review Submission Form */}
                  {token && isCustomer && (
                    <form onSubmit={handleReviewSubmit} className="bg-emerald-50/60 dark:bg-gray-900/60 border border-emerald-100 dark:border-gray-700 rounded-2xl p-6 mb-6 animate-fade-in-up">
                      <div className="flex items-center gap-4 mb-4">
                        <span className="font-semibold text-emerald-700 dark:text-emerald-300">Your Rating:</span>
                        <div className="flex items-center">
                          {[1,2,3,4,5].map(star => (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setReviewStars(star)}
                              onMouseEnter={() => setReviewHover(star)}
                              onMouseLeave={() => setReviewHover(0)}
                              className="focus:outline-none"
                            >
                              <Star
                                size={28}
                                className={`transition-all duration-200 cursor-pointer ${star <= (reviewHover || reviewStars) ? 'text-yellow-400 fill-current scale-110' : 'text-gray-300 dark:text-gray-700'} ${star === (reviewHover || reviewStars) ? 'animate-bounce' : ''}`}
                              />
                            </button>
                          ))}
                        </div>
                        {userIsVerified && (
                          <span className="ml-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full animate-pulse flex items-center gap-1"><Check size={14}/> Verified Buyer</span>
                        )}
                      </div>
                      <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <textarea
                          className="flex-1 border border-emerald-200 dark:border-emerald-700 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                          rows={2}
                          placeholder="Share your experience..."
                          value={reviewText}
                          onChange={e => setReviewText(e.target.value)}
                          required
                        />
                        <div className="flex flex-col items-center gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={e => setReviewImage(e.target.files[0])}
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                            className="bg-white dark:bg-gray-900 border border-emerald-200 dark:border-emerald-700 px-4 py-2 rounded-lg text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-gray-800 transition-all"
                          >
                            {reviewImage ? 'Change Image' : 'Upload Image'}
                          </button>
                          {reviewImage && (
                            <img src={URL.createObjectURL(reviewImage)} alt="Review" className="w-16 h-16 object-cover rounded-lg border border-emerald-200 dark:border-emerald-700" />
                          )}
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={submittingReview || !reviewStars || !reviewText}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-2xl font-semibold shadow-xl hover:shadow-emerald-500/25 hover:scale-105 transition-all duration-300 disabled:opacity-50"
                      >
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </button>
                      {reviewSubmitError && (
                        <div className="mt-3 text-red-600 dark:text-red-400 text-sm">{reviewSubmitError}</div>
                      )}
                      {reviewSubmitSuccess && (
                        <div className="mt-3 text-emerald-600 dark:text-emerald-400 text-sm">Review submitted successfully!</div>
                      )}
                    </form>
                  )}
                  {token && !isCustomer && (
                    <div className="bg-blue-50/60 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-6 mb-6 animate-fade-in-up">
                      <div className="flex items-center gap-3">
                        <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        <div>
                          <h4 className="font-semibold text-blue-800 dark:text-blue-300">Review Access</h4>
                          <p className="text-blue-700 dark:text-blue-400 text-sm">Only customers can post reviews. Farmers can view reviews but cannot post them.</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {!token && (
                    <div className="bg-gray-50/60 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 mb-6 animate-fade-in-up">
                      <div className="flex items-center gap-3">
                        <Info className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-gray-300">Login Required</h4>
                          <p className="text-gray-700 dark:text-gray-400 text-sm">Please log in as a customer to post reviews.</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Review filter/sort dropdowns */}
                  <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                    <div className="flex space-x-4">
                      <select 
                        value={reviewFilter}
                        onChange={e => setReviewFilter(e.target.value)}
                        className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      >
                        <option value="all">All Stars</option>
                        <option value="5">5 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="2">2 Stars</option>
                        <option value="1">1 Star</option>
                      </select>
                      <select 
                        value={reviewSort}
                        onChange={e => setReviewSort(e.target.value)}
                        className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="highest">Highest Rating</option>
                        <option value="lowest">Lowest Rating</option>
                      </select>
                    </div>
                  </div>
                  {/* Review distribution bar graph */}
                  <div className="flex items-center gap-4 my-4">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-300">Rating Distribution:</span>
                    <div className="flex-1 flex flex-col gap-1">
                      {[5,4,3,2,1].map(star => {
                        const count = ratingDistribution.distribution?.[star] || 0;
                        const percentage = ratingDistribution.percentages?.[star] || 0;
                        return (
                          <div key={star} className="flex items-center gap-2">
                            <span className="w-8 text-sm text-gray-600 dark:text-gray-300">{star}★</span>
                            <div className="flex-1 bg-gray-100 dark:bg-gray-900 rounded h-2 overflow-hidden">
                              <div className="bg-emerald-400 h-2 rounded transition-all duration-300" style={{ width: `${percentage}%` }}></div>
                            </div>
                            <span className="w-8 text-sm text-gray-600 dark:text-gray-300">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {/* Reviews List or Empty State */}
                  {filteredReviews.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Info className="w-12 h-12 text-emerald-400 mb-2" />
                      <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">No reviews yet.</p>
                      <button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-2xl font-semibold shadow-xl hover:shadow-emerald-500/25 hover:scale-105 transition-all duration-300">Write the first review</button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredReviews.map((review) => (
                        <div key={review.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-fade-in-up transition-all duration-300 bg-white dark:bg-gray-900">
                          <div className="flex items-start space-x-3">
                            {review.user_profile_image ? (
                              <img 
                                src={review.user_profile_image}
                                alt={review.first_name + ' ' + review.last_name}
                                className="w-10 h-10 rounded-full object-cover" loading="lazy" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white text-lg font-bold">
                                {getUserInitials({first_name: review.first_name, last_name: review.last_name})}
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-gray-900 dark:text-gray-100">{review.first_name} {review.last_name}</span>
                                {review.verified && (
                                  <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full animate-pulse flex items-center gap-1"><Check size={14}/> Verified Purchase</span>
                                )}
                                {token && review.user === profile.user.username && (
                                  <>
                                    <button onClick={() => handleEditReview(review)} className="ml-2 text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-200 text-xs font-semibold">Edit</button>
                                    <button onClick={() => handleDeleteReview(review)} className="ml-2 text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-200 text-xs font-semibold">Delete</button>
                                  </>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 mb-2">
                                {renderStars(review.rating)}
                                <span className="text-sm text-gray-500 dark:text-gray-400">{new Date(review.date).toLocaleDateString()}</span>
                              </div>
                              <p className="text-gray-700 dark:text-gray-300 mb-3">{review.review}</p>
                              {review.image && (
                                <img src={review.image} alt="Review" className="w-24 h-24 object-cover rounded-lg border border-emerald-200 dark:border-emerald-700 mb-2" />
                              )}
                              <div className="flex items-center space-x-4 text-sm">
                                <button type="button" onClick={() => review.user_liked ? handleUnlike(review.id) : handleLike(review.id)} className={`flex items-center space-x-1 ${review.user_liked ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-300'} active:scale-95 transition-transform`}>
                                  <ThumbsUp size={14} />
                                  <span>Like ({review.likes || 0})</span>
                                </button>
                                <button type="button" onClick={() => review.user_disliked ? handleUnlike(review.id) : handleDislike(review.id)} className={`flex items-center space-x-1 ${review.user_disliked ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'} active:scale-95 transition-transform`}>
                                  <ThumbsDown size={14} />
                                  <span>Dislike ({review.dislikes || 0})</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Similar Products */}
          <div className="bg-white/80 dark:bg-gray-800/80 rounded-3xl shadow-xl border border-emerald-100/50 dark:border-gray-700 p-6 animate-fade-in-up">
            <h3 className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mb-6">Similar Products</h3>
            {loadingSimilar ? (
              <div className="text-emerald-600 dark:text-emerald-300">Loading similar products...</div>
            ) : similarError ? (
              <div className="text-red-600 dark:text-red-400">{similarError}</div>
            ) : similarProducts.length === 0 ? (
              <div className="text-gray-600 dark:text-gray-300">No similar products found.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {similarProducts.map((product) => {
                  const productImages = Array.isArray(product.image) ? product.image : [product.image];
                  return (
                    <div
                      key={product.id}
                      className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl shadow-xl border border-emerald-200 dark:border-emerald-700 flex flex-col group overflow-hidden hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 animate-fade-in-up cursor-pointer"
                      onClick={() => navigate(`/products/${product.id}`)}
                      tabIndex={0}
                      role="button"
                      onKeyDown={e => { if (e.key === 'Enter') navigate(`/products/${product.id}`); }}
                    >
                      <div className="relative">
                        <img src={productImages[0]} alt={product.name} className="w-full h-44 object-cover rounded-t-2xl border-b-2 border-emerald-100 dark:border-emerald-700 shadow-md group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 rounded-t-2xl bg-gradient-to-t from-emerald-900/30 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 items-end">
                          <button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full p-2 shadow-lg hover:scale-110 transition-transform">
                            <ShoppingCart className="w-5 h-5" />
                          </button>
                          {product.badges && product.badges.length > 0 && (
                            <div className="flex flex-col gap-1 items-end">
                              {product.badges.map((badge, i) => (
                                <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold animate-fade-in-up animate-delay-200 shadow">{badge}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        {product.in_stock === false && (
                          <span className="absolute bottom-2 left-2 bg-rose-600 text-white text-xs px-2 py-1 rounded-full font-semibold shadow">Out of Stock</span>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col px-4 pt-3 pb-4">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-lg font-bold text-emerald-800 dark:text-emerald-300 drop-shadow-sm">{product.name}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                          <span>{product.category}</span>
                          {product.province && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{product.province}</span>}
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} className={`w-4 h-4 ${i <= Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
                          ))}
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{Number(product.rating).toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-auto">
                          <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">रु{Number(product.price).toFixed(2)}</span>
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">by {product.farmer?.user?.username || product.farmer_username || 'Farmer'}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Toast notification */}
      {toast.show && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg font-semibold text-lg transition-all duration-300 ${toast.type === 'error' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>{toast.message}</div>
      )}
    </div>
  );
};

export default ProductDetails;
