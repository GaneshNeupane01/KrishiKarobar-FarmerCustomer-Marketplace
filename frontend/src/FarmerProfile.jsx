import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Sprout, 
  Calendar, 
  Award, 
  TrendingUp,
  Edit3,
  Camera,
  Star,
  Leaf,
  Sun,
  Tractor,
  BarChart3,
  Users,
  Package,
  LogOut,
  Home,
  ShoppingBag,
  DollarSign,
  Plus,
  Activity
} from 'lucide-react';
import FloatingLeavesBackground from './FloatingLeavesBackground'; // Import the background component
import Navbar from './Components/Navbar';
import { getUserInitials } from './utils';
import { useAuth } from './context/AuthContext';

const FarmerProfile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    farmName: '',
    farmSize: '',
    farmingExperience: '',
    cropTypes: '',
    profilePicture: null,
    joinDate: '',
    rating: 0,
    totalSales: 0,
    activeListings: 0
  });
  const [stats, setStats] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [error, setError] = useState('');

  const { userType: authUserType, isAuthenticated, logout, profile } = useAuth();
  const isLoggedIn = isAuthenticated;
  const isCustomer = isLoggedIn && authUserType === 'customer';
  const isFarmer = isLoggedIn && authUserType === 'farmer';

  // ——— Load real data on mount ———
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/profile/', {
          headers: token ? { 'Authorization': 'Token ' + token } : {},
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        if (data.userType !== 'farmer') {
          navigate('/customer-profile');
          return;
        }

        const profile = data.profile;
        setProfileData(prev => ({
          ...prev,
          username: profile.user.username,
          email: profile.user.email,
          firstName: profile.user.first_name,
          lastName: profile.user.last_name,
          phone: profile.phone,
          address: profile.address,
          farmName: profile.farm_name || '',
          farmSize: profile.farm_size || '',
          farmingExperience: profile.farming_experience || '',
          cropTypes: profile.crop_types || '',
          profilePicture: profile.profile_picture || null,
          joinDate: profile.join_date,
        }));
        // Fetch analytics after profile to get username
        fetchAnalytics(profile.user.username);
        fetchRecentProducts(profile.user.username);
        fetchRecentReviews(profile.user.username);
      } catch (err) {
        setError('Profile fetch error');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    const fetchAnalytics = async (username) => {
      setAnalyticsLoading(true);
      try {
        const res = await fetch('http://localhost:8000/api/farmer-analytics/', {
          headers: token ? { 'Authorization': 'Token ' + token } : {},
        });
        if (!res.ok) throw new Error('Failed to fetch analytics');
        const data = await res.json();
        setStats([
          { icon: Package,    label: 'Active Listings', value: data.active_listings, color: 'text-emerald-600' },
          { icon: ShoppingBag, label: 'Total Orders',   value: data.total_orders,    color: 'text-blue-600'    },
          { icon: DollarSign,  label: 'Earnings',       value: `रु${Number(data.total_revenue).toLocaleString()}`, color: 'text-blue-600' },
          { icon: Star,        label: 'Rating',         value: data.avg_rating,      color: 'text-yellow-600'  },
        ]);
        setProfileData(prev => ({ ...prev, rating: data.avg_rating, totalSales: data.total_sales_quantity, activeListings: data.active_listings }));
        setRecentOrders(data.recent_orders || []);
      } catch (err) {
        setStats([]);
        setRecentOrders([]);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    const fetchRecentProducts = async (username) => {
      try {
        const res = await fetch(`http://localhost:8000/api/products/?ordering=-date_added&limit=3&farmer_username=${username}`,
          { headers: token ? { 'Authorization': 'Token ' + token } : {} });
        if (!res.ok) throw new Error('Failed to fetch recent products');
        const data = await res.json();
        setRecentProducts(data.results || data);
      } catch (err) {
        setRecentProducts([]);
      }
    };

    const fetchRecentReviews = async (username) => {
      try {
        const res = await fetch(`http://localhost:8000/api/product-reviews/?ordering=-date&farmer_username=${username}&limit=3`, {
          headers: token ? { 'Authorization': 'Token ' + token } : {},
        });
        if (!res.ok) throw new Error('Failed to fetch recent reviews');
        const data = await res.json();
        setRecentReviews(data.results || data);
      } catch (err) {
        setRecentReviews([]);
      }
    };

    fetchProfile();
  }, [navigate]);

  // Fixed input change handlers
  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const InfoCard = ({ icon: Icon, label, value, isEditable = false, field }) => (
    <div className="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-gray-700/40 hover:shadow-lg hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-300 transform hover:scale-[1.02]">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/50 transition-colors duration-300">
          <Icon size={20} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
          {isEditing && isEditable ? (
            <input
              type="text"
              value={value}
              onChange={e => handleInputChange(field, e.target.value)}
              className="w-full mt-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
          ) : (
            <p className="font-semibold text-gray-800 dark:text-gray-100">{value}</p>
          )}
        </div>
      </div>
    </div>
  );

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-white/30 dark:border-gray-700/40 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.05] group">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-white/50 to-white/20 dark:from-gray-700/50 dark:to-gray-800/20 group-hover:scale-110 transition-transform duration-300">
          <Icon size={24} className={color + ' dark:text-inherit'+'dark:bg-white/70'} />
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
        </div>
      </div>
    </div>
  );

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    // Use FormData for all profile updates
    const form = new FormData();
    form.append('first_name', profileData.firstName);
    form.append('last_name', profileData.lastName);
    form.append('email', profileData.email);
    form.append('phone', profileData.phone);
    form.append('address', profileData.address);
    form.append('farm_name', profileData.farmName);
    form.append('farm_size', profileData.farmSize);
    form.append('farming_experience', profileData.farmingExperience);
    form.append('crop_types', profileData.cropTypes);
    try {
      const response = await fetch('http://localhost:8000/api/profile/', {
        method: 'PUT',
        headers: token ? { 'Authorization': 'Token ' + token } : {}, // DO NOT set Content-Type
        body: form
      });
      if (!response.ok) {
        throw new Error('Failed to save profile');
      }
      const data = await response.json();
      setProfileData(prev => ({
        ...prev,
        firstName: data.profile.user.first_name,
        lastName: data.profile.user.last_name,
        email: data.profile.user.email,
        phone: data.profile.phone,
        address: data.profile.address,
        farmName: data.profile.farm_name,
        farmSize: data.profile.farm_size,
        farmingExperience: data.profile.farming_experience,
        cropTypes: data.profile.crop_types
      }));
      setIsEditing(false);
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save changes. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    navigate('/login');
  };

  const toggleEdit = () => {
    if (isEditing) handleSave();
    setIsEditing(!isEditing);
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('profile_picture', file);

    try {
      const response = await fetch('http://localhost:8000/api/profile/', {
        method: 'PUT',
        headers: token ? { 'Authorization': 'Token ' + token } : {},
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to update profile picture');
      }

      const data = await response.json();
      setProfileData(prev => ({
        ...prev,
        profilePicture: data.profile.profile_picture
      }));
    } catch (err) {
      console.error('Profile picture update error:', err);
      alert('Failed to update profile picture. Please try again.');
    }
  };

  return (
    <>
      <Navbar  showLogout={true} onLogout={handleLogout} />
      <div className="min-h-screen mt-16 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 p-4 relative overflow-hidden">
         <FloatingLeavesBackground 
          leafCount={12}
          opacity={0.1}
          speed="slow"
          colors={['emerald', 'teal', 'green']}
        />
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-300 rounded-full opacity-10 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-300 rounded-full opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          {/* Floating elements */}
          <div className="absolute top-20 left-20 text-emerald-300 opacity-20 animate-bounce" style={{ animationDelay: '0.5s' }}>
            <Leaf size={32} />
          </div>
          <div className="absolute top-40 right-32 text-teal-300 opacity-20 animate-bounce" style={{ animationDelay: '1.5s' }}>
            <Sun size={28} />
          </div>
          <div className="absolute bottom-32 left-32 text-emerald-400 opacity-20 animate-bounce" style={{ animationDelay: '2.5s' }}>
            <Tractor size={36} />
          </div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header */}
  
          {/* Profile Header Card */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 dark:border-gray-700/40 p-8 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full -translate-y-16 translate-x-16"></div>
            
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Profile Picture */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-200 dark:border-emerald-700 group-hover:border-emerald-400 dark:group-hover:border-emerald-500 transition-colors duration-300 relative">
                  {profileData.profilePicture ? (
                    <img 
                      src={`http://localhost:8000${profileData.profilePicture}`} 
                      alt="Profile" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-emerald-500 flex items-center justify-center text-white text-4xl font-bold">
                      {getUserInitials(profileData)}
                    </div>
                  )}
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <label className="cursor-pointer">
                        <input type="file" accept="image/*" onChange={handleProfilePictureChange} className="hidden" />
                        <Camera className="text-white" size={24} />
                      </label>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 dark:bg-emerald-700 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <Sprout size={20} className="text-white" />
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                    {profileData.firstName} {profileData.lastName}
                  </h2>
                  <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full">
                    <Star size={16} className="text-yellow-500 fill-current" />
                    <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">{profileData.rating}</span>
                  </div>
                </div>
                <p className="text-xl text-emerald-600 dark:text-emerald-400 font-semibold mb-2">{profileData.farmName}</p>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{profileData.address}</p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
                  <div className="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-full">
                    <Calendar size={14} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="text-gray-700 dark:text-gray-200">Joined {new Date(profileData.joinDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                    <Award size={14} className="text-blue-600 dark:text-blue-400" />
                    <span className="text-gray-700 dark:text-gray-200">{profileData.farmingExperience} Experience</span>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
          {isFarmer && (  <button
                onClick={toggleEdit}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${
                  isEditing 
                    ? 'bg-green-500 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-800 text-white' 
                    : 'bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-700 dark:hover:bg-emerald-800 text-white'
                }`}
              >
                <Edit3 size={18} />
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </button>

              )}

{isCustomer && (  <button
                onClick={''}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${
                  isEditing 
                    ? 'bg-green-500 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-800 text-white' 
                    : 'bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-700 dark:hover:bg-emerald-800 text-white'
                }`}
              >
                <Edit3 size={18} />
                Message
              </button>

              )}

            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {analyticsLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-white/70 dark:bg-gray-800/70 rounded-2xl p-6 border border-white/30 dark:border-gray-700/40 animate-pulse h-32" />
              ))
            ) : stats.map((stat, index) => (
              <div key={index} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fade-in">
                <StatCard {...stat} />
              </div>
            ))}
          </div>

          {/* Profile Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/30 dark:border-gray-700/40 p-8">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-3">
                <User className="text-emerald-600 dark:text-emerald-400" size={24} />
                Personal Information
              </h3>
              <div className="space-y-4">
                <InfoCard icon={User} label="Username" value={profileData.username} isEditable={false} />
                <InfoCard icon={Mail} label="Email" value={profileData.email} isEditable={false} />
                <InfoCard icon={Phone} label="Phone" value={profileData.phone} isEditable={true} field="phone" />
                <InfoCard icon={MapPin} label="Address" value={profileData.address} isEditable={true} field="address" />
              </div>
            </div>

            {/* Farm Information */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/30 dark:border-gray-700/40 p-8">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-3">
                <Sprout className="text-emerald-600 dark:text-emerald-400" size={24} />
                Farm Information
              </h3>
              <div className="space-y-4">
                <InfoCard icon={Tractor} label="Farm Name" value={profileData.farmName} isEditable={true} field="farmName" />
                <InfoCard icon={BarChart3} label="Farm Size" value={profileData.farmSize} isEditable={true} field="farmSize" />
                <InfoCard icon={Award} label="Experience" value={profileData.farmingExperience} isEditable={true} field="farmingExperience" />
                <InfoCard icon={Leaf} label="Crop Types" value={profileData.cropTypes} isEditable={true} field="cropTypes" />
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="mt-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/30 dark:border-gray-700/40 p-8">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-3">
              <Activity className="text-emerald-600 dark:text-emerald-400" size={24} />
              Recent Activity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Recent Orders */}
              <div>
                <h4 className="text-lg font-semibold text-emerald-700 dark:text-emerald-300 mb-4 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" /> Recent Orders
                </h4>
                {analyticsLoading ? (
                  <div className="h-20 bg-emerald-50/30 dark:bg-gray-900/30 rounded-xl animate-pulse" />
                ) : recentOrders.length === 0 ? (
                  <div className="text-gray-500 text-center">No recent orders found.</div>
                ) : recentOrders.map((order, i) => (
                  <div key={order.id} className="mb-4 p-4 rounded-xl bg-emerald-50/60 dark:bg-gray-900/40 border border-emerald-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-emerald-900 dark:text-emerald-200">{order.product?.name || order.inventory_product?.name || order.product || order.inventory_product || 'Product'}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">by {order.buyer?.first_name || ''} {order.buyer?.last_name || ''}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Qty: {order.quantity || order.qty}</span>
                          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">रु{order.amount || order.total_price}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                          {order.status}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{order.date || order.created_at}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Recent Products */}
              <div>
                <h4 className="text-lg font-semibold text-emerald-700 dark:text-emerald-300 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" /> Recently Added Products
                </h4>
                {loading ? (
                  <div className="h-20 bg-emerald-50/30 dark:bg-gray-900/30 rounded-xl animate-pulse" />
                ) : recentProducts.length === 0 ? (
                  <div className="text-gray-500 text-center">No recent products found.</div>
                ) : recentProducts.map((product, i) => (
                  <div key={product.id} className="mb-4 p-4 rounded-xl bg-emerald-50/60 dark:bg-gray-900/40 border border-emerald-100 dark:border-gray-700 flex items-center gap-4">
                    <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-lg border border-emerald-100 dark:border-gray-700" />
                    <div>
                      <div className="font-semibold text-emerald-900 dark:text-emerald-200">{product.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{product.category}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Added: {new Date(product.date_added).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Recent Reviews */}
              <div>
                <h4 className="text-lg font-semibold text-emerald-700 dark:text-emerald-300 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5" /> Recent Reviews
                </h4>
                {loading ? (
                  <div className="h-20 bg-emerald-50/30 dark:bg-gray-900/30 rounded-xl animate-pulse" />
                ) : recentReviews.length === 0 ? (
                  <div className="text-gray-500 text-center">No recent reviews found.</div>
                ) : recentReviews.map((review, i) => (
                  <div key={review.id} className="mb-4 p-4 rounded-xl bg-yellow-50/60 dark:bg-gray-900/40 border border-yellow-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-semibold text-yellow-700 dark:text-yellow-400">{review.rating}/5</span>
                      <span className="text-xs text-gray-500 ml-2">{new Date(review.date).toLocaleDateString()}</span>
                    </div>
                    <div className="font-semibold text-emerald-900 dark:text-emerald-200">{review.product}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">by {review.first_name} {review.last_name}</div>
                    <div className="text-xs text-gray-700 dark:text-gray-300 mt-1 line-clamp-2">{review.review}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <style >{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .animate-fade-in {
            animation: fade-in 0.6s ease-out forwards;
          }
        `}</style>
      </div>
    </>
  );
};

export default FarmerProfile;