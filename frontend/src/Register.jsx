import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from './api/baseUrl';
import { useAuth } from './context/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, MapPin, Phone, Briefcase, Sprout, ShoppingCart, Image as ImageIcon } from 'lucide-react';
import FloatingLeavesBackground from './FloatingLeavesBackground'; // Import the background component
import AddressAutocomplete from './Components/AddressAutocomplete';
// Move component definitions outside of Signup component
const TabButton = ({ tab, icon: Icon, label, isActive, onClick }) => (
  <button
  type="button"
  onClick={onClick}
  className={`flex-1 flex items-center justify-center 
    rounded-xl border border-gray-300 dark:border-gray-700 
    shadow-md hover:shadow-lg 
   
    gap-3 py-3 px-5 mt-2 mx-4 
    font-semibold text-sm 
    transition-all duration-300 ease-in-out 
    relative overflow-hidden group
    ${
      isActive
        ? 'bg-emerald-600 text-white'
        : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:text-white dark:hover:text-white'
    }`}
>


    <Icon size={20} className="z-10 relative" />
    <span className="z-10 relative">{label}</span>
    {isActive && (
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-600 animate-pulse" />
    )}
    <div
      className={`absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-600 transition-transform duration-300 ${
        isActive ? 'translate-x-0' : 'translate-x-full group-hover:translate-x-0'
      }`}
    />
  </button>
);

const InputField = ({ icon: Icon, label, type = 'text', name, placeholder, required = true, formData, handleInputChange, errors }) => (
  <div className="group">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 transition-colors">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-emerald-500 dark:group-focus-within:text-emerald-400 transition-colors" size={18} />
      {type === 'file' ? (
        <input
          type={type}
          name={name}
          onChange={handleInputChange}
          accept="image/*"
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all duration-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:shadow-md dark:text-gray-100"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={formData[name] || ''}
          onChange={handleInputChange}
          placeholder={placeholder}
          required={required}
          className={`w-full pl-10 pr-4 py-3 border ${errors[name] ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'} rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all duration-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:shadow-md dark:text-gray-100 dark:placeholder-gray-400`}
        />
      )}
      {errors[name] && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors[name]}</p>
      )}
    </div>
  </div>
);

const PasswordField = ({ label, name, show, onToggle, formData, handleInputChange }) => (
  <div className="group">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 transition-colors">
      {label} <span className="text-red-500">*</span>
    </label>
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-emerald-500 dark:group-focus-within:text-emerald-400 transition-colors" size={18} />
      <input
        type={show ? 'text' : 'password'}
        name={name}
        value={formData[name]}
        onChange={handleInputChange}
        placeholder={`Enter your ${label.toLowerCase()}`}
        required
        className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all duration-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:shadow-md dark:text-gray-100 dark:placeholder-gray-400"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  </div>
);

const SelectField = ({ icon: Icon, label, name, options, placeholder, formData, handleInputChange }) => (
  <div className="group">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 transition-colors">
      {label}
    </label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-emerald-500 dark:group-focus-within:text-emerald-400 transition-colors" size={18} />
      <select
        name={name}
        value={formData[name]}
        onChange={handleInputChange}
        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all duration-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:shadow-md appearance-none dark:text-gray-100"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  </div>
);

const Signup = () => {
  const [activeTab, setActiveTab] = useState('farmer');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  // Remove registrationSuccess and successMessage, not needed
  const [isSubmitting, setIsSubmitting] = useState(false);
  const provinceOptions = [
    'Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim'
  ];
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    province: '',
    address: '',
    latitude: '',
    longitude: '',
    farmName: '',
    farmSize: '',
    farmingExperience: '',
    cropTypes: '',
    businessName: '',
    businessType: '',
    profilePicture: null,
  });
  const [addressInput, setAddressInput] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm password is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.province) newErrors.province = 'Province is required';
    if (!formData.address) newErrors.address = 'Address is required';

    // Email format validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    // Password match validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Nepali phone number validation
    if (formData.phone && !/^\+977-9[78][0-9]{8}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid Nepali phone number (e.g. +977-98XXXXXXXX)';
    }

    // Role-specific validations
    if (activeTab === 'farmer') {
      if (!formData.farmName) newErrors.farmName = 'Farm name is required';
   
    } 

    

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'file' ? files[0] : value
    }));
    // Clear error for the field being changed
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAddressInputChange = (e) => {
    setAddressInput(e.target.value);
    // Optionally clear lat/lon if user starts typing again
    setFormData(prev => ({
      ...prev,
      latitude: '',
      longitude: ''
    }));
    if (errors.address) {
      setErrors(prev => ({ ...prev, address: '' }));
    }
  };

  const handleAddressSelect = ({ address, lat, lon }) => {
    setAddressInput(address);
    setFormData(prev => ({
      ...prev,
      address,
      latitude: lat,
      longitude: lon,
    }));
    if (errors.address) {
      setErrors(prev => ({ ...prev, address: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    setErrors({});

    const data = new FormData();
    // Add user type
    data.append('userType', activeTab);
    // Add user fields
    data.append('username', formData.username);
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('first_name', formData.firstName);
    data.append('last_name', formData.lastName);
    // Add common profile fields
    data.append('phone', formData.phone);
    data.append('province', formData.province);
    data.append('address', formData.address);
    if (formData.latitude) {
      data.append('latitude', formData.latitude);
    }
    if (formData.longitude) {
      data.append('longitude', formData.longitude);
    }
    if (formData.profilePicture) {
      data.append('profile_picture', formData.profilePicture);
    }
    // Add role-specific fields
    if (activeTab === 'farmer') {
      data.append('farm_name', formData.farmName);
      data.append('farm_size', formData.farmSize);
      data.append('farming_experience', formData.farmingExperience);
      data.append('crop_types', formData.cropTypes);
    } else {
      data.append('business_name', formData.businessName);
      data.append('business_type', formData.businessType);
    }
    
    try {
      console.log('Submitting registration data:', {
        userType: activeTab,
        username: formData.username,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        province: formData.province,
        address: formData.address,
        farmName: formData.farmName,
        businessName: formData.businessName,
      });
      
      const res = await fetch(apiUrl('/api/register/'), {
        method: 'POST',
        body: data,
      });
      
      console.log('Response status:', res.status);
      const responseData = await res.json();
      console.log('Response data:', responseData);
      
      if (res.ok) {
        // Registration successful
        // Redirect to profile page based on userType
        if (activeTab === 'farmer') {
          navigate('/farmer-profile');
        } else {
          navigate('/customer-profile');
        }
      } else {
        // Handle validation errors from backend
        if (responseData.error) {
          setErrors({ general: responseData.error });
        } else if (typeof responseData === 'object') {
          // Convert backend field errors to frontend format
          const fieldErrors = {};
          Object.keys(responseData).forEach(key => {
            if (Array.isArray(responseData[key])) {
              fieldErrors[key] = responseData[key][0];
            } else {
              fieldErrors[key] = responseData[key];
            }
          });
          setErrors(fieldErrors);
        } else {
          setErrors({ general: 'Registration failed. Please try again.' });
        }
        console.error('Registration failed:', responseData);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setErrors({ general: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      {/* Background animation bubbles */}
      <FloatingLeavesBackground 
        leafCount={20}
        opacity={0.2}
        speed="slow"
        colors={['emerald', 'teal', 'green']}
      />

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-300 dark:bg-emerald-600 rounded-full opacity-20 dark:opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-300 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }} ></div>
       
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-cyan-300 dark:bg-cyan-600 rounded-full opacity-10 dark:opacity-5 animate-pulse" style={{ animationDelay: '2s' }}></div>
       
      </div>

      <div className="relative w-full max-w-2xl">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-2xl dark:shadow-gray-900/50 border border-white/20 dark:border-gray-700/30 overflow-hidden flex flex-col" style={{height: '90vh', minHeight: '600px'}}>
          {/* Header */}
          <div className="text-center py-8 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-700 dark:to-teal-700 text-white relative overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 dark:bg-white/30 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm animate-bounce">
                <Sprout size={32} />
              </div>
              <h1 className="text-3xl font-bold mb-2">Join KrishiKarobar</h1>
              <p className="text-emerald-100 dark:text-emerald-200">Connect directly with farmers and customers</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-transparent dark:bg-transparent relative flex-shrink-0">
            <TabButton tab="farmer" icon={Sprout} label="Register as Farmer" isActive={activeTab === 'farmer'} onClick={() => setActiveTab('farmer')} />
            <TabButton tab="customer" icon={ShoppingCart} label="Register as Customer" isActive={activeTab === 'customer'} onClick={() => setActiveTab('customer')} />
          </div>

          {/* Form - scrollable area */}
          <form id="register-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar pb-40">
            {/* Registration success message removed. User is redirected to profile after registration. */}
                {errors.general && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.general}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField icon={User} label="Username" name="username" placeholder="Choose a username" formData={formData} handleInputChange={handleInputChange} errors={errors} />
                  <InputField icon={Mail} label="Email" type="email" name="email" placeholder="example@mail.com" formData={formData} handleInputChange={handleInputChange} errors={errors} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField icon={User} label="First Name" name="firstName" placeholder="Your first name" formData={formData} handleInputChange={handleInputChange} errors={errors} />
                  <InputField icon={User} label="Last Name" name="lastName" placeholder="Your last name" formData={formData} handleInputChange={handleInputChange} errors={errors} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <PasswordField label="Password" name="password" show={showPassword} onToggle={() => setShowPassword(!showPassword)} formData={formData} handleInputChange={handleInputChange} />
                  <PasswordField label="Confirm Password" name="confirmPassword" show={showConfirmPassword} onToggle={() => setShowConfirmPassword(!showConfirmPassword)} formData={formData} handleInputChange={handleInputChange} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField icon={Phone} label="Phone Number" type="tel" name="phone" placeholder="+977-98XXXXXXXX" formData={formData} handleInputChange={handleInputChange} errors={errors} />
                  <SelectField icon={MapPin} label="Province" name="province" options={provinceOptions} placeholder="Select province" formData={formData} handleInputChange={handleInputChange} />
                </div>

                                 <div className="group">
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 transition-colors">
                     Address <span className="text-red-500">*</span>
                   </label>
                   <AddressAutocomplete 
                     onSelect={handleAddressSelect}
                     onChange={handleAddressInputChange}
                     placeholder="e.g. Gajuri-2, Dhading"
                     value={addressInput}
                   />
                   {errors.address && (
                     <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.address}</p>
                   )}
                 </div>

                <InputField icon={ImageIcon} label="Profile Picture" name="profilePicture" type="file" required={false} formData={formData} handleInputChange={handleInputChange} errors={errors} />

                {/* Role-specific fields */}
                {activeTab === 'farmer' && (
                  <>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                      <Sprout className="text-emerald-600 dark:text-emerald-400" size={20} />
                      Farming Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField icon={Briefcase} label="Farm Name" name="farmName" placeholder="Your farm's name" required={true} formData={formData} handleInputChange={handleInputChange} errors={errors} />
                      <SelectField icon={MapPin} label="Farm Size" name="farmSize" placeholder="Select farm size" options={['Less than 1 acre', '1-5 acres', '5-10 acres', '10-50 acres', 'More than 50 acres']} formData={formData} handleInputChange={handleInputChange} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <SelectField icon={User} label="Farming Experience" name="farmingExperience" placeholder="Years of experience" options={['Less than 1 year', '1-3 years', '3-5 years', '5-10 years', 'More than 10 years']} formData={formData} handleInputChange={handleInputChange} />
                      <InputField icon={Sprout} label="Crop Types" name="cropTypes" placeholder="e.g. Rice, Wheat, Vegetables" required={false} formData={formData} handleInputChange={handleInputChange} errors={errors} />
                    </div>
                  </>
                )}

                {activeTab === 'customer' && (
                  <>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                      <ShoppingCart className="text-emerald-600 dark:text-emerald-400" size={20} />
                      Business Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField icon={Briefcase} label="Business Name" name="businessName" placeholder="Your business name" required={false} formData={formData} handleInputChange={handleInputChange} errors={errors} />
                      <SelectField icon={Briefcase} label="Business Type" name="businessType" placeholder="Select business type" options={['Restaurant', 'Grocery Store', 'Food Distributor', 'Individual Consumer', 'Other']} formData={formData} handleInputChange={handleInputChange} />
                    </div>
                  </>
                )}
          </form>
          {/* Overlapping bottom actions */}
          <div className="absolute bottom-0 left-0 w-full px-8 py-6 flex flex-col gap-3 items-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-md z-10 rounded-t-[12px]">
            <button
              type="submit"
              form="register-form"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 hover:from-emerald-600 hover:to-teal-600 dark:hover:from-emerald-700 dark:hover:to-teal-700 focus:ring-4 focus:ring-emerald-200 dark:focus:ring-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
            <div className="text-center text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <a href="/login" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold transition-colors">
                Sign in here
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;