import React, { useState } from 'react';
import { MessageCircle, Phone, Send, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../api/baseUrl';

const MessageButton = ({ product, farmer }) => {
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const { userType, isAuthenticated, profile } = useAuth();

  // Helper function to get farmer name safely
  const getFarmerName = () => {
    if (!farmer) return 'Farmer';
    
    // Handle different farmer object structures
    if (farmer.user && farmer.user.first_name) {
      return `${farmer.user.first_name} ${farmer.user.last_name || ''}`.trim();
    } else if (farmer.first_name) {
      return `${farmer.first_name} ${farmer.last_name || ''}`.trim();
    } else if (farmer.username) {
      return farmer.username;
    } else if (farmer.farmer_username) {
      return farmer.farmer_username;
    }
    
    return 'Farmer';
  };

  // Helper function to get farmer ID safely
  const getFarmerId = () => {
    if (!farmer) return null;
    
    if (farmer.user && farmer.user.id) {
      return farmer.user.id;
    } else if (farmer.id) {
      return farmer.id;
    }
    
    return null;
  };

  // Helper function to get farmer phone safely
  const getFarmerPhone = () => {
    if (!farmer) return null;
    
    if (farmer.phone) {
      return farmer.phone;
    } else if (farmer.user && farmer.user.phone) {
      return farmer.user.phone;
    }
    
    return null;
  };

  const handleMessageClick = () => {
    if (!isAuthenticated) {
      alert('Please log in to send messages');
      navigate('/login');
      return;
    }
    
    if (userType !== 'customer') {
      alert('Only customers can message farmers');
      return;
    }
    
    setShowMessageModal(true);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const farmerId = getFarmerId();
    if (!farmerId) {
      setError('Unable to identify farmer. Please try again.');
      return;
    }

    setSending(true);
    setError('');
    
    try {
      const response = await fetch(apiUrl('/api/messages/send_message/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          receiver_id: farmerId,
          content: message.trim(),
          subject: `Question about ${product.name}`,
          product_id: product.id
        })
      });

      if (response.ok) {
        setSuccess(true);
        setMessage('');
        setTimeout(() => {
          setShowMessageModal(false);
          setSuccess(false);
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to send message');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handlePhoneCall = () => {
    const phoneNumber = getFarmerPhone();
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`, '_self');
    } else {
      alert('Phone number not available');
    }
  };

  return (
    <>
      {/* Message Button */}
      <button
        onClick={handleMessageClick}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
      >
        <MessageCircle className="w-5 h-5" />
        <span>Message Farmer</span>
      </button>

      {/* Phone Call Button */}
      <button
        onClick={handlePhoneCall}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
      >
        <Phone className="w-5 h-5" />
        <span>Call</span>
      </button>

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Message {getFarmerName()}
              </h3>
              <button
                onClick={() => setShowMessageModal(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Product Info */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">About:</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">{product.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">रु{product.price} per {product.unit}</p>
            </div>

            {/* Message Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about availability, pricing, delivery, or any other questions..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                rows="4"
              />
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg">
                <p className="text-green-700 dark:text-green-400 text-sm">Message sent successfully!</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowMessageModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={sending || !message.trim()}
                className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>
            </div>

            {/* Quick Message Suggestions */}
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Quick messages:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Is this still available?",
                  "What's the minimum order quantity?",
                  "Do you offer delivery?",
                  "Can I get a bulk discount?",
                  "What's the best time to pick up?"
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setMessage(suggestion)}
                    className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MessageButton; 