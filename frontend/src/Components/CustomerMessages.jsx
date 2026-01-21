import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  User, 
  Users, 
  CircleDot, 
  Phone, 
  PhoneCall, 
  MessageCircle, 
  Bell, 
  Search,
  MoreVertical,
  Image as ImageIcon,
  Paperclip,
  Smile,
  Mic,
  Video,
  Info,
  Trash2,
  Archive,
  Star,
  Clock,
  Check,
  CheckCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';

const CustomerMessages = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const chatRef = useRef(null);
  const fileInputRef = useRef(null);

  const { userType, isAuthenticated, profile } = useAuth();

  // Check if user is customer and implement polling
  useEffect(() => {
    if (userType !== 'customer') {
      navigate('/farmer-profile');
      return;
    }
    
    let isMounted = true;
    const fetchAndSet = () => {
      if (isMounted) {
        fetchConversations();
      }
    };
    
    fetchAndSet();
    const interval = setInterval(fetchAndSet, 1000); // Poll every 1 second
    
    return () => { 
      isMounted = false; 
      clearInterval(interval); 
    };
  }, [userType, navigate]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/conversations/with_farmer/', {
        headers: { 'Authorization': 'Token ' + localStorage.getItem('token') }
      });
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
        if (data.length > 0 && !selectedConversation) {
          setSelectedConversation(data[0]);
          fetchMessages(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/messages/conversation_messages/?conversation_id=${conversationId}`, {
        headers: { 'Authorization': 'Token ' + localStorage.getItem('token') }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Send message
  const handleSend = async () => {
    if (!input.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const otherUser = selectedConversation.other_participant;
      const response = await fetch('http://localhost:8000/api/messages/send_message/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + localStorage.getItem('token')
        },
        body: JSON.stringify({
          receiver_id: otherUser.id,
          content: input.trim(),
          subject: `Message from ${profile?.user?.username}`,
          product_id: selectedConversation.product?.id || null
        })
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages(prev => [...prev, newMessage]);
        setInput('');
        // Update conversation list
        fetchConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  // Handle conversation selection
  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
  };

  // Handle phone call
  const handlePhoneCall = (phoneNumber) => {
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`, '_self');
    }
  };

  // Handle video call (placeholder for future implementation)
  const handleVideoCall = () => {
    alert('Video call feature coming soon!');
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Handle file upload logic here
      console.log('File selected:', file.name);
    }
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv => 
    conv.other_participant?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.other_participant?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.other_participant?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get user initials
  const getUserInitials = (user) => {
    if (!user) return '?';
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || user.username?.charAt(0).toUpperCase() || '?';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
   
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      {/* Sidebar - Conversations List */}
      <Navbar  />
      <div className="w-1/3 bg-white/80 dark:bg-gray-800/80 mt-16 backdrop-blur-sm border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Messages</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <MessageCircle className="w-12 h-12 mb-4" />
              <p>No conversations yet</p>
              <p className="text-sm">Start messaging farmers about their products!</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleSelectConversation(conversation)}
                className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors ${
                  selectedConversation?.id === conversation.id
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {conversation.other_participant?.profile_picture ? (
                      <img src={conversation.other_participant.profile_picture} alt={conversation.other_participant.username} className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-semibold border-2 border-emerald-400">
                        {getUserInitials(conversation.other_participant)}
                      </div>
                    )}
                    {conversation.other_participant?.online && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {conversation.other_participant?.first_name} {conversation.other_participant?.last_name}
                      </h3>
                      {conversation.unread_count > 0 && (
                        <span className="bg-emerald-500 text-white text-xs rounded-full px-2 py-1">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {conversation.last_message?.content || 'No messages yet'}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {conversation.last_message ? formatTime(conversation.last_message.created_at) : ''}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col mt-16">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                  {selectedConversation.other_participant?.profile_picture ? (
                      <img src={selectedConversation.other_participant.profile_picture} alt={selectedConversation.other_participant.username} className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-semibold border-2 border-emerald-400">
                        {getUserInitials(selectedConversation.other_participant)}
                      </div>
                    )}
                    {selectedConversation.other_participant?.online && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                      {selectedConversation.other_participant?.first_name} {selectedConversation.other_participant?.last_name}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedConversation.other_participant?.online ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePhoneCall(selectedConversation.other_participant?.phone)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Call"
                  >
                    <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </button>
                  <button
                    onClick={handleVideoCall}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Video Call"
                  >
                    <Video className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <Info className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div 
              ref={chatRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50"
            >
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <MessageCircle className="w-12 h-12 mb-4" />
                  <p>No messages yet</p>
                  <p className="text-sm">Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const senderId = msg.sender?.id || msg.user?.id;
                  const myId = profile?.user?.id || profile?.id;
                  const isOwn = parseInt(senderId) === parseInt(myId);
                  console.log('msg.sender.id:', msg.sender?.id, 'msg.user.id:', msg.user?.id, 'profile.user.id:', myId, 'isOwn:', isOwn);
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-2xl shadow transition-all duration-200
                          ${isOwn
                            ? 'bg-emerald-500 text-white rounded-br-none border border-emerald-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none border border-gray-200 dark:border-gray-600'
                          }`
                        }
                        style={{ wordBreak: 'break-word' }}
                      >
                        {msg.content}
                        <div className={`text-xs mt-1 text-right opacity-70 ${isOwn ? 'text-white' : 'text-gray-500 dark:text-gray-300'}`}>{formatTime(msg.created_at)}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Area */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Paperclip className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <ImageIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                />
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-gray-100"
                />
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Smile className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Mic className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={handleSend}
                  disabled={sending || !input.trim()}
                  className="p-2 rounded-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 transition-colors"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Select a conversation</h2>
              <p>Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="absolute top-16 right-4 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <Bell className="w-8 h-8 mx-auto mb-2" />
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((notification, index) => (
                <div key={index} className="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <p className="text-sm text-gray-900 dark:text-gray-100">{notification.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatTime(notification.timestamp)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerMessages; 