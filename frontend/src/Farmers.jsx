import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, User, Calendar, Sprout, Navigation, MessageCircle } from 'lucide-react';
import FloatingLeavesBackground from './FloatingLeavesBackground';
import { getUserInitials } from './utils';
import MessageButton from './Components/MessageButton';
import Navbar from './Components/Navbar';
import { apiUrl } from './api/baseUrl';

const Farmers = () => {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [sortBy, setSortBy] = useState('distance'); // 'distance', 'name', 'join_date'

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
          fetchFarmers(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Fallback: fetch farmers without location
          fetchFarmers();
        }
      );
    } else {
      // Browser doesn't support geolocation
      fetchFarmers();
    }
  }, []);

  const fetchFarmers = async (lat = null, lon = null) => {
    try {
      setLoading(true);
      let url = apiUrl('/api/users/farmers/');
      if (lat && lon) {
        url += `?lat=${lat}&lon=${lon}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch farmers');
      }
      
      const data = await response.json();
      setFarmers(data);
    } catch (err) {
      console.error('Error fetching farmers:', err);
      setError('Failed to load farmers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const sortFarmers = (farmersList) => {
    const sorted = [...farmersList];
    switch (sortBy) {
      case 'distance':
        return sorted.sort((a, b) => {
          if (a.distance === null && b.distance === null) return 0;
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });
      case 'name':
        return sorted.sort((a, b) => {
          // Sort by first name first, then by last name
          const firstNameComparison = a.user.first_name.localeCompare(b.user.first_name);
          if (firstNameComparison !== 0) return firstNameComparison;
          return (a.user.last_name || '').localeCompare(b.user.last_name || '');
        });
      case 'join_date':
        return sorted.sort((a, b) => 
          new Date(b.join_date) - new Date(a.join_date)
        );
      default:
        return sorted;
    }
  };

  const formatDistance = (distance) => {
    if (distance === null || distance === undefined) return 'Distance unavailable';
    const d = typeof distance === 'number' ? distance : parseFloat(distance);
    if (!Number.isFinite(d)) return 'Distance unavailable';
    if (d < 1) {
      return `${(d * 1000).toFixed(0)}m away`;
    }
    return `${d.toFixed(1)}km away`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePhoneCall = (phoneNumber) => {
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`, '_self');
    } else {
      alert('Phone number not available');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <FloatingLeavesBackground leafCount={15} opacity={0.1} speed="slow" colors={['emerald', 'teal', 'green']} />
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading farmers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <FloatingLeavesBackground leafCount={15} opacity={0.1} speed="slow" colors={['emerald', 'teal', 'green']} />
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => fetchFarmers(userLocation?.lat, userLocation?.lon)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const sortedFarmers = sortFarmers(farmers);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <FloatingLeavesBackground leafCount={20} opacity={0.2} speed="slow" colors={['emerald', 'teal', 'green']} />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sprout className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Our Farmers
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Connect with local farmers and discover fresh produce
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex justify-center mb-6">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg border border-white/30 dark:border-gray-700/40 p-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-3">
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block px-3 py-2"
            >
              <option value="distance">Distance</option>
              <option value="name">Name</option>
              <option value="join_date">Join Date</option>
            </select>
          </div>
        </div>

        {/* Farmers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedFarmers.map((farmer, index) => (
            <div
              key={farmer.user.id}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-white/30 dark:border-gray-700/40 transform hover:scale-105"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Profile Picture */}
              <div className="h-48 bg-gradient-to-br from-emerald-400 to-teal-500 relative overflow-hidden">
                {farmer.profile_picture ? (
                  <img
                    src={farmer.profile_picture}
                    alt={`${farmer.user.first_name} ${farmer.user.last_name}`}
                    className="w-full h-full object-cover transition-transform hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600">
                    <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-white text-3xl font-bold">
                      {getUserInitials(farmer.user)}
                    </div>
                  </div>
                )}
                {farmer.distance !== null && farmer.distance !== undefined && Number.isFinite(typeof farmer.distance === 'number' ? farmer.distance : parseFloat(farmer.distance)) && (
                  <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1 shadow-lg">
                    <Navigation className="w-3 h-3" />
                    {formatDistance(farmer.distance)}
                  </div>
                )}
              </div>

              {/* Farmer Info */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {farmer.user.first_name} {farmer.user.last_name}
                </h3>
                
                {farmer.farm_name && (
                  <p className="text-emerald-600 dark:text-emerald-400 font-medium mb-3">
                    {farmer.farm_name}
                  </p>
                )}

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{farmer.address}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{farmer.phone}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {formatDate(farmer.join_date)}</span>
                  </div>
                </div>

                {/* Farming Details */}
                {(farmer.farm_size || farmer.farming_experience || farmer.crop_types) && (
                  <div className="mb-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Farming Details
                    </h4>
                    <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                      {farmer.farm_size && (
                        <p>Farm Size: {farmer.farm_size}</p>
                      )}
                      {farmer.farming_experience && (
                        <p>Experience: {farmer.farming_experience}</p>
                      )}
                      {farmer.crop_types && (
                        <p>Crops: {farmer.crop_types}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <MessageButton 
                    product={{ name: 'General Inquiry', price: 0, unit: 'inquiry' }} 
                    farmer={farmer} 
                  />
                  
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Farmers Message */}
        {sortedFarmers.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sprout className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Farmers Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              There are currently no farmers registered in your area.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Farmers; 