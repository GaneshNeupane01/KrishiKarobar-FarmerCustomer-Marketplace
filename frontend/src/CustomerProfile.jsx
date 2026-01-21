import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, ShoppingCart, Calendar, Award, TrendingUp,
  Edit3, Camera, Star, Leaf, Sun, Building, BarChart3, Package, Heart, Clock, CreditCard, LogOut, Home, MessageCircle
} from 'lucide-react';
import FloatingLeavesBackground from './FloatingLeavesBackground'; // Import the background component
import Navbar from './Components/Navbar';
import { getUserInitials } from './utils';
import { useAuth } from './context/AuthContext';

const CustomerProfile = () => {
  const navigate = useNavigate();
  const { userType, isAuthenticated, logout, profile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    businessName: '',
    businessType: '',
    profilePicture: null,
    joinDate: '',
    rating: 0,
    totalOrders: 0,
    favoriteItems: 0,
    totalSpent: 0
  });
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Fetch on mount
  useEffect(() => {
    if (!isAuthenticated) return navigate('/login');

    (async () => {
      try {
        const res = await fetch('http://localhost:8000/api/profile/', {
          headers: { 'Authorization': 'Token ' + localStorage.getItem('token') }
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (data.userType !== 'customer') return navigate('/farmer-profile');
        const p = data.profile;
        setProfileData(prev => ({
          ...prev,
          username:        p.user.username,
          email:           p.user.email,
          firstName:       p.user.first_name,
          lastName:        p.user.last_name,
          phone:           p.phone,
          address:         p.address,
          businessName:    p.business_name || '',
          businessType:    p.business_type || '',
          profilePicture:  p.profile_picture,
          joinDate:        p.join_date,
        }));
        // Fetch orders after profile
        fetchOrders();
      } catch {
        navigate('/login');
      }
    })();
  }, [navigate]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/orders/?ordering=-created_at', {
        headers: { 'Authorization': 'Token ' + localStorage.getItem('token') }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOrders(data);
      // Calculate stats
      setProfileData(prev => ({
        ...prev,
        totalOrders: data.length,
        totalSpent: data.reduce((sum, o) => sum + Number(o.total_price), 0),
      }));
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Save changes
  const handleSave = async () => {
    const token = localStorage.getItem('token');
    // Use FormData for all profile updates
    const form = new FormData();
    form.append('first_name', profileData.firstName);
    form.append('last_name', profileData.lastName);
    form.append('email', profileData.email);
    form.append('phone', profileData.phone);
    form.append('address', profileData.address);
    form.append('business_name', profileData.businessName);
    form.append('business_type', profileData.businessType);
    try {
      const res = await fetch('http://localhost:8000/api/profile/', {
        method: 'PUT',
        headers: { 'Authorization': 'Token ' + token }, // DO NOT set Content-Type
        body: form
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const p = data.profile;
      setProfileData(prev => ({
        ...prev,
        firstName:    p.user.first_name,
        lastName:     p.user.last_name,
        email:        p.user.email,
        phone:        p.phone,
        address:      p.address,
        businessName: p.business_name,
        businessType: p.business_type
      }));
      setIsEditing(false);
    } catch {
      alert('Failed to save changes.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    logout();
    navigate('/login');
  };

  const handleProfilePictureChange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    const token = localStorage.getItem('token');
    const form = new FormData();
    form.append('profile_picture', file);
    try {
      const res = await fetch('http://localhost:8000/api/profile/', {
        method: 'PUT',
        headers: { 'Authorization': 'Token ' + token },
        body: form
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProfileData(prev => ({
        ...prev,
        profilePicture: data.profile.profile_picture
      }));
    } catch {
      alert('Failed to update picture.');
    }
  };

  const toggleEdit = () => {
    if (isEditing) handleSave();
    else setIsEditing(true);
  };

  const stats = [
    { icon: ShoppingCart, label: 'Total Orders',    value: profileData.totalOrders,    color: 'text-blue-600' },

    { icon: CreditCard,   label: 'Total Spent',     value: `रु${Number(profileData.totalSpent).toLocaleString()}`, color: 'text-green-600' },

  ];

  // Get 3 most recent orders (ensure newest first)
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3);

  // Status color logic (copied from CustomerOrders.jsx)
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    accepted: 'bg-teal-100 text-teal-800 border-teal-300',
    shipped: 'bg-blue-100 text-blue-800 border-blue-300',
    delivered: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    cancelled: 'bg-rose-100 text-rose-800 border-rose-300',
  };
  const statusLabels = {
    pending: 'Pending',
    accepted: 'Accepted',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };

  const InfoCard = ({ icon: Icon, label, fieldKey, isEditable = false }) => (
    <div className="group">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 transition-colors">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
        {isEditable && isEditing ? (
          <input
            type="text"
            value={profileData[fieldKey] || ''}
            onChange={e => setProfileData(prev => ({ ...prev, [fieldKey]: e.target.value }))}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-all duration-300 bg-white/50 dark:bg-gray-800/70 backdrop-blur-sm hover:shadow-md text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          />
        ) : (
          <div className="w-full pl-10 pr-4 py-3 text-gray-600 dark:text-gray-400">
            {profileData[fieldKey] || 'Not provided'}
          </div>
        )}
      </div>
    </div>
  );

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-white/30 dark:border-gray-700/40 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.05] group">
      <div className="flex items-center justify-between mb-4">
        <Icon size={24} className={color + ' dark:text-inherit' + 'dark:bg-white/70'} />
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
        </div>
      </div>
    </div>
  );

  // Replace OrderCard for recent orders with a detailed card for each order and its items
  const RecentOrderCard = ({ order }) => (
    <div className="border border-emerald-200 dark:border-gray-700 rounded-2xl p-4 sm:p-6 bg-emerald-50/30 dark:bg-gray-900/30 shadow-md transition-all duration-300 hover:shadow-xl animate-fade-in-up mb-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-semibold text-emerald-800 dark:text-emerald-200 text-lg">Order #{order.id}</span>
          <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${statusColors[order.status]}`}>{statusLabels[order.status] || order.status}</span>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
        <div className="text-sm text-gray-700 dark:text-gray-200">Placed: <span className="font-semibold">{new Date(order.created_at).toLocaleString()}</span></div>
        <div className="text-sm text-gray-700 dark:text-gray-200">Total: <span className="font-semibold text-emerald-700 dark:text-emerald-300">रु{Number(order.total_price).toLocaleString()}</span></div>
      </div>
      <div className="text-sm text-gray-700 dark:text-gray-200 mb-1">Shipping: <span className="font-semibold">{order.shipping_address}</span></div>
      <div className="mt-3">
        <div className="font-semibold text-emerald-700 dark:text-emerald-300 mb-2">Items:</div>
        <ul className="space-y-2">
          {order.items.map(item => (
            <li key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-white/80 dark:bg-gray-800/80 rounded-xl px-3 py-2 border border-emerald-100 dark:border-gray-700 shadow-sm animate-fade-in-up">
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {item.quantity} {item.product?.unit || item.inventory_product?.unit} {item.product?.name || item.inventory_product?.name || 'Product'}
                </span>
                <span className="text-xs text-gray-500">{item.product?.category || item.inventory_product?.category}</span>
                <span className={`text-xs px-2 py-1 rounded-full border font-semibold ${statusColors[order.status]}`}>{statusLabels[order.status] || order.status}</span>
                <span className="text-xs text-gray-500">रु{Number(item.total_price).toLocaleString()}</span>
              </div>
              {/* Farmer Info: name and profile image only */}
              {item.farmer_details && (
                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-gray-900 rounded-lg px-2 py-1">
                  {item.farmer_details.profile_picture && (
                    <img src={item.farmer_details.profile_picture} alt="Farmer" className="w-8 h-8 rounded-full object-cover border border-emerald-200 dark:border-gray-700" />
                  )}
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{item.farmer_details.full_name || item.farmer_details.username}</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <>
      <Navbar  showLogout={true} onLogout={handleLogout} />
      <div className="min-h-screen mt-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 p-4 relative overflow-hidden">
         <FloatingLeavesBackground 
          leafCount={20}
          opacity={0.2}
          speed="slow"
          colors={['blue', 'sky', 'indigo']}
        />
        {/* …your background animations… */}
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header */}
       

          {/* Profile Header Card */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 dark:border-gray-700/40 p-8 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full -translate-y-16 translate-x-16" />
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Profile Picture */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-200 dark:border-blue-700 group-hover:border-blue-400 dark:group-hover:border-blue-500 transition-colors duration-300 relative">
                  {profileData.profilePicture
                    ? <img src={`http://localhost:8000${profileData.profilePicture}`}
                           alt="Profile"
                           className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    : <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-4xl font-bold">
                        {getUserInitials(profileData)}
                      </div>
                  }
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <label className="cursor-pointer">
                        <input type="file" accept="image/*" onChange={handleProfilePictureChange} className="hidden" />
                        <Camera className="text-white" size={24} />
                      </label>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-500 dark:bg-blue-700 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <ShoppingCart size={20} className="text-white" />
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                    {profileData.firstName} {profileData.lastName}
                  </h2>
                  <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full">
                    <Star size={16} className="text-yellow-500" />
                    <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">
                      {profileData.rating}
                    </span>
                  </div>
                </div>
                <p className="text-xl text-blue-600 dark:text-blue-400 font-semibold mb-2">
                  {profileData.businessName || 'Not provided'}
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{profileData.address}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
                  <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                    <Calendar size={14} className="text-blue-600 dark:text-blue-400" />
                    <span className="text-gray-700 dark:text-gray-200">
                      Joined {new Date(profileData.joinDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
                    <Building size={14} className="text-indigo-600 dark:text-indigo-400" />
                    <span className="text-gray-700 dark:text-gray-200">{profileData.businessType}</span>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={toggleEdit}
                className={`px-6 py-3 rounded-xl font-semibold transition transform hover:scale-105 flex items-center gap-2 ${
                  isEditing ? 'bg-green-500 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-800 text-white' : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800 text-white'
                }`}
              >
                <Edit3 size={18} />
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((s,i) => (
              <div key={i} style={{animationDelay:`${i*0.1}s`}} className="animate-fade-in">
                <StatCard {...s} />
              </div>
            ))}
          </div>

          {/* Profile Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Personal Info */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/30 dark:border-gray-700/40 p-8">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-3">
                <User className="text-blue-600 dark:text-blue-400" size={24} /> Personal Information
              </h3>
              <div className="space-y-4">
                <InfoCard icon={User}  label="Username"    fieldKey="username"    />
                <InfoCard icon={Mail}  label="Email"       fieldKey="email"       />
                <InfoCard icon={Phone} label="Phone"       fieldKey="phone"       isEditable />
                <InfoCard icon={MapPin}label="Address"     fieldKey="address"     isEditable />
              </div>
            </div>

            {/* Business Info */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/30 dark:border-gray-700/40 p-8">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-3">
                <Building className="text-blue-600 dark:text-blue-400" size={24} /> Business Information
              </h3>
              <div className="space-y-4">
                <InfoCard icon={Building}  label="Business Name" fieldKey="businessName" isEditable />
                <InfoCard icon={BarChart3}  label="Business Type" fieldKey="businessType" isEditable />
                <InfoCard icon={Calendar}  label="Member Since"  fieldKey="joinDate"    />
                <InfoCard icon={Award}     label="Rating"        fieldKey="rating"      />
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/30 dark:border-gray-700/40 p-8">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-3">
              <Package className="text-blue-600 dark:text-blue-400" size={24} /> Recent Orders
            </h3>
            <div className="space-y-4">
              {ordersLoading ? (
                <div className="h-20 bg-blue-50/30 dark:bg-gray-900/30 rounded-xl animate-pulse" />
              ) : recentOrders.length === 0 ? (
                <div className="text-gray-500 text-center">No recent orders found.</div>
              ) : recentOrders.map((o,i) => (
                <div key={o.id} style={{animationDelay:`${i*0.1}s`}} className="animate-fade-in">
                  <RecentOrderCard order={o} />
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <div className="flex gap-4 justify-center">
                <button
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800 text-white rounded-xl font-semibold transition transform hover:scale-105 flex items-center gap-2"
                  onClick={() => navigate('/my-orders')}
                >
                  <Package size={18} />
                  View All Orders
                </button>
                <button
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-700 dark:hover:bg-emerald-800 text-white rounded-xl font-semibold transition transform hover:scale-105 flex items-center gap-2"
                  onClick={() => navigate('/messages')}
                >
                  <MessageCircle size={18} />
                  Messages
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerProfile;
