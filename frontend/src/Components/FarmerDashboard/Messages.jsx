import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Users, CircleDot, Phone, PhoneCall, MessageCircle, Bell, Search, MoreVertical, Image as ImageIcon, Paperclip, Smile, Mic, Video, Info, Trash2, Archive, Star, Clock, Check, CheckCheck, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiUrl } from '../../api/baseUrl';

const Messages = () => {
  const { userType, isAuthenticated, profile } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const chatRef = useRef(null);

  const token = localStorage.getItem('token');

  // Fetch conversations on mount and implement polling
  useEffect(() => {
    let isMounted = true;
    
    // Initial fetch
    const initialFetch = async () => {
      if (isMounted) {
        await fetchConversations();
      }
    };
    
    // Polling function
    const fetchAndSet = () => {
      if (isMounted && !refreshing) {
        fetchConversations();
      }
    };
    
    initialFetch();
    const interval = setInterval(fetchAndSet, 60000); // Poll every 60 seconds
    
    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    return () => { 
      isMounted = false; 
      clearInterval(interval); 
    };
  }, [refreshing]);

  // Show notification when new messages arrive
  useEffect(() => {
    if (unreadCount > 0 && !loading) {
      // Show browser notification if permission is granted
      if (Notification.permission === 'granted') {
        new Notification('New Messages', {
          body: `You have ${unreadCount} unread message${unreadCount > 1 ? 's' : ''}`,
          icon: '/favicon.ico'
        });
      }
    }
  }, [unreadCount, loading]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Fetch conversations
  const fetchConversations = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    }
    
    try {
      console.log('Fetching conversations for farmer...');
      let response = await fetch(apiUrl('/api/conversations/with_customer/'), {
        headers: { 'Authorization': `Token ${token}` }
      });
      
      console.log('Response status:', response.status);
      
      // If the specific endpoint fails, try the general conversations endpoint
      if (!response.ok) {
        console.log('Trying general conversations endpoint...');
        response = await fetch(apiUrl('/api/conversations/all_conversations/'), {
          headers: { 'Authorization': `Token ${token}` }
        });
        console.log('General endpoint response status:', response.status);
      }
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched conversations:', data);
        setConversations(data);
        
        if (data.length > 0 && !selectedConversation) {
          setSelectedConversation(data[0]);
          fetchMessages(data[0].id);
        }
        
        // Calculate total unread count
        const totalUnread = data.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);
        setUnreadCount(totalUnread);
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId) => {
    try {
      const response = await fetch(apiUrl(`/api/messages/conversation_messages/?conversation_id=${conversationId}`), {
        headers: { 'Authorization': `Token ${token}` }
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
      const response = await fetch(apiUrl('/api/messages/send_message/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
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

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv => 
    conv.other_participant?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.other_participant?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.other_participant?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Manual refresh function
  const handleRefresh = () => {
    fetchConversations(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="flex mt-[2rem] flex-col md:flex-row gap-6 max-w-4xl mx-auto w-full animate-fade-in-up">
      {/* Conversation List */}
      <div className="md:w-1/3 w-full bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-xl border border-emerald-100 dark:border-gray-600 p-4 flex flex-col mb-2">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
          <h2 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">Conversations</h2>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
              {unreadCount}
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="ml-auto p-2 rounded-full hover:bg-emerald-100 dark:hover:bg-gray-700 transition-colors"
            title="Refresh conversations"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-500 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-200 dark:scrollbar-thumb-gray-600">
          {filteredConversations.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-2" />
              <p>No conversations yet</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleSelectConversation(conversation)}
                className={`p-3 rounded-xl cursor-pointer transition-colors ${
                  selectedConversation?.id === conversation.id
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {conversation.other_participant?.profile_picture ? (
                      <img src={conversation.other_participant.profile_picture} alt={conversation.other_participant.username} className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-semibold border-2 border-emerald-400">
                        {getUserInitials(conversation.other_participant)}
                      </div>
                    )}
                    {conversation.unread_count > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {conversation.unread_count}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {conversation.other_participant?.first_name} {conversation.other_participant?.last_name}
                      </h3>
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

      {/* Chat Area */}
      <div className="md:w-2/3 w-full bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-xl border border-emerald-100 dark:border-gray-600 flex flex-col h-[500px]">
        {selectedConversation ? (
          <>
            <div className="flex items-center gap-3 p-4 border-b border-emerald-100 dark:border-gray-600">
            {selectedConversation.other_participant?.profile_picture ? (
                      <img src={selectedConversation.other_participant.profile_picture} alt={selectedConversation.other_participant.username} className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-semibold border-2 border-emerald-400">
                        {getUserInitials(selectedConversation.other_participant)}
                      </div>
                    )}

              <div className="flex-1">
                <div className="font-semibold text-emerald-900 dark:text-emerald-200">
                  {selectedConversation.other_participant?.first_name} {selectedConversation.other_participant?.last_name}
                </div>
                <div className="text-xs text-emerald-500 dark:text-emerald-400">Customer</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePhoneCall(selectedConversation.other_participant?.phone)}
                  className="p-2 rounded-full hover:bg-emerald-100 dark:hover:bg-gray-700 transition-colors"
                  title="Call"
                >
                  <Phone className="w-4 h-4 text-emerald-500" />
                </button>
                <button className="p-2 rounded-full hover:bg-emerald-100 dark:hover:bg-gray-700 transition-colors">
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
            
            {/* Chat messages */}
            <div ref={chatRef} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-emerald-200 dark:scrollbar-thumb-gray-600">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2" />
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
            
            {/* Input area */}
            <div className="flex items-center gap-2 p-4 border-t border-emerald-100 dark:border-gray-600 bg-white/70 dark:bg-gray-700/70 rounded-b-2xl">
              <input
                className="flex-1 px-4 py-2 rounded-full border border-emerald-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:focus:ring-emerald-400 bg-white/80 dark:bg-gray-700/80 text-emerald-900 dark:text-gray-100 placeholder:text-emerald-300 dark:placeholder:text-gray-500 transition-all"
                placeholder="Type your message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <button
                className="bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-full p-2 shadow transition-all"
                onClick={handleSend}
                disabled={sending || !input.trim()}
                aria-label="Send message"
              >
                {sending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
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
    </div>
  );
};

export default Messages; 