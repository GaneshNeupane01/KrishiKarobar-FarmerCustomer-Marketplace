import React, { useState, useRef, useEffect } from 'react';
import { 
  MapPin, Phone, Mail, Clock, MessageCircle, Send, CheckCircle, 
  User, Building, Globe, Award, Heart, Target, Users, Star,
  ChevronRight, ArrowRight, Loader2, ChevronUp, ChevronDown
} from 'lucide-react';
import FloatingLeavesBackground from './FloatingLeavesBackground';
import { Link } from 'react-router-dom';
import Navbar from './Components/Navbar';

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

// Helper: FadeInOnView component for fade-up animation
function FadeInOnView({ children, className = '' }) {
  const [ref, inView] = useInView(0.2);
  return (
    <div ref={ref} className={`${className} transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      {children}
    </div>
  );
}

const contactMethods = [
  {
    icon: <Phone className="w-6 h-6" />,
    title: 'Call Us',
    details: ['+977-XXXXXXX', '+977-XXXXXXX'],
    description: 'Speak directly with our support team',
    color: 'from-blue-500 to-cyan-600',
    action: 'tel:+977-XXXXXXX'
  },
  {
    icon: <Mail className="w-6 h-6" />,
    title: 'Email Us',
    details: ['Will be updated soon'],
    description: 'Send us an email anytime',
    color: 'from-green-500 to-emerald-600',
    action: 'mailto:'
  },
  {
    icon: <MessageCircle className="w-6 h-6" />,
    title: 'Live Chat Available Soon',
    details: ['Available 24/7', 'Instant Response'],
    description: 'Chat with our support team',
    color: 'from-purple-500 to-pink-600',
    action: '#'
  },
  {
    icon: <MapPin className="w-6 h-6" />,
    title: 'Visit Us',
    details: ['Not Available'],
    description: 'Drop by our office anytime',
    color: 'from-orange-500 to-red-600',
    action: '#'
  }
];

const officeLocations = [
  {
    city: 'Not Available',
    address: 'No office yet',
    phone: '+977-XXXXXXX',
    email: 'Will be updated soon',
    hours: 'Mon-Fri: 9:00 AM - 6:00 PM',
    coordinates: { lat: 27.7172, lng: 85.3240 }
  },
  {
    city: 'No office yet',
    address: 'No office yet',
    phone: '+977-XXXXXXX',
    email: 'Will be updated soon',
    hours: 'Mon-Fri: 9:00 AM - 6:00 PM',
    coordinates: { lat: 27.6667, lng: 85.3333 }
  }
];

const departments = [
  {
    name: 'Customer Support',
    email: 'Will be updated soon',
    phone: '+977-XXXXXXX',
    description: 'Help with orders, returns, and general inquiries',
    icon: <Users className="w-5 h-5" />
  },
  {
    name: 'Farmer Relations',
    email: 'Will be updated soon',
    phone: '+977-XXXXXXX',
    description: 'Support for farmers joining our platform',
    icon: <Heart className="w-5 h-5" />
  },
  {
    name: 'Business Development',
    email: 'Will be updated soon',
    phone: '+977-XXXXXXX',
    description: 'Partnerships and business opportunities',
    icon: <Building className="w-5 h-5" />
  },
  {
    name: 'Technical Support',
    email: 'Will be updated soon',
    phone: '+977-XXXXXXX',
    description: 'Platform and app-related technical issues',
    icon: <Globe className="w-5 h-5" />
  }
];

const faqs = [
  {
    q: 'How can I become a farmer on your platform?',
    a: 'To become a farmer, simply register on our platform, complete your profile, and submit required documentation. Our team will review and approve your application within 2-3 business days.'
  },
  {
    q: 'What are your delivery areas?',
    a: 'We currently deliver to major cities across Nepal including Kathmandu, Lalitpur, Bhaktapur, Pokhara, and Chitwan. We\'re expanding to more areas regularly.'
  },
  {
    q: 'How do I track my order?',
    a: 'Once your order is confirmed, you\'ll receive tracking updates via SMS and email. You can also track your order in real-time through our mobile app or website.'
  },
  {
    q: 'What is your return policy?',
    a: 'We offer a 24-hour return policy for fresh produce and a 7-day return policy for packaged goods. If you\'re not satisfied with your order, contact our support team immediately.'
  },
  {
    q: 'Do you offer bulk ordering for businesses?',
    a: 'Yes! We have special programs for restaurants, hotels, and other businesses. Contact our business development team for custom pricing and delivery schedules.'
  }
];

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    userType: 'customer'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  // Progressive section loading (Intersection Observer)
  const [heroRef, heroInView] = useInView(0.2);
  const [contactRef, contactInView] = useInView(0.2);
  const [locationsRef, locationsInView] = useInView(0.2);
  const [departmentsRef, departmentsInView] = useInView(0.2);
  const [faqRef, faqInView] = useInView(0.2);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        userType: 'customer'
      });
    }, 3000);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 dark:from-gray-900 dark:to-gray-800 font-sans text-gray-800 dark:text-gray-200">
      {/* Floating Leaves Background */}
      <FloatingLeavesBackground leafCount={6} opacity={0.1} speed="slow" />
      
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-20 pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FadeInOnView>
              <h1 className="text-5xl md:text-7xl font-bold text-gray-800 dark:text-gray-200 mb-6 leading-tight">
                Get in
                <span className="block bg-gradient-to-r from-green-600 to-emerald-700 dark:from-green-400 dark:to-emerald-500 bg-clip-text text-transparent">
                  Touch
                </span>
              </h1>
            </FadeInOnView>
            <FadeInOnView>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-4xl mx-auto leading-relaxed">
                Have questions, feedback, or want to join our farming community? 
                We'd love to hear from you. Our team is here to help!
              </p>
            </FadeInOnView>
            <FadeInOnView>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="tel:+977-1-4XXXXXXX" className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center">
                  <Phone className="mr-2 w-5 h-5" /> Call Now
                </a>
                <a href="mailto:hello@krishikarobar.com" className="border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 px-8 py-4 rounded-full text-lg font-semibold hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center">
                  <Mail className="mr-2 w-5 h-5" /> Send Email
                </a>
              </div>
            </FadeInOnView>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section ref={contactRef} className={`py-16 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 transition-opacity duration-700 ${contactInView ? 'opacity-100' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">How Can We Help?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Choose the best way to reach us based on your needs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactMethods.map((method) => (
              <FadeInOnView key={method.title}>
                <a 
                  href={method.action}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center hover:shadow-xl transition-all group hover:-translate-y-2 block"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${method.color} rounded-full mb-6 group-hover:scale-110 transition-transform`}>
                    {method.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">{method.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{method.description}</p>
                  <div className="space-y-2">
                    {method.details.map((detail, index) => (
                      <p key={index} className="text-sm font-medium text-gray-700 dark:text-gray-300">{detail}</p>
                    ))}
                  </div>
                </a>
              </FadeInOnView>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">Send Us a Message (Feature Coming Soon) </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </div>
              
              {isSubmitted ? (
                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-2xl p-8 text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">Message Sent!</h3>
                  <p className="text-green-700 dark:text-green-300">
                    Thank you for reaching out. We'll get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="+977-98XXXXXXX"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      I am a *
                    </label>
                    <select
                      name="userType"
                      value={formData.userType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="customer">Customer</option>
                      <option value="farmer">Farmer</option>
                      <option value="business">Business Partner</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject *
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="farmer">Become a Farmer</option>
                      <option value="support">Customer Support</option>
                      <option value="partnership">Partnership</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Contact Information */}
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">Contact Information</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Get in touch with us through any of these channels.
                </p>
              </div>
              
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mr-4">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Main Office</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Thamel, Kathmandu, Nepal<br />
                      Lalitpur, Nepal
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mr-4">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Phone Numbers</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      +977-1-4XXXXXXX<br />
                      +977-98XXXXXXX<br />
                      Mon-Fri 9AM-6PM NPT
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mr-4">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Email Addresses</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      hello@krishikarobar.com<br />
                      support@krishikarobar.com<br />
                      farmers@krishikarobar.com
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mr-4">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Business Hours</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Monday - Friday: 9:00 AM - 6:00 PM<br />
                      Saturday: 9:00 AM - 4:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Office Locations */}
      <section ref={locationsRef} className={`py-20 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 transition-opacity duration-700 ${locationsInView ? 'opacity-100' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">Our Office Locations</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Visit us at any of our office locations across Nepal
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {officeLocations.map((office) => (
              <FadeInOnView key={office.city}>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mr-4">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{office.city} Office</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 text-emerald-500 mt-1 mr-3 flex-shrink-0" />
                      <p className="text-gray-600 dark:text-gray-400">{office.address}</p>
                    </div>
                    <div className="flex items-start">
                      <Phone className="w-5 h-5 text-emerald-500 mt-1 mr-3 flex-shrink-0" />
                      <p className="text-gray-600 dark:text-gray-400">{office.phone}</p>
                    </div>
                    <div className="flex items-start">
                      <Mail className="w-5 h-5 text-emerald-500 mt-1 mr-3 flex-shrink-0" />
                      <p className="text-gray-600 dark:text-gray-400">{office.email}</p>
                    </div>
                    <div className="flex items-start">
                      <Clock className="w-5 h-5 text-emerald-500 mt-1 mr-3 flex-shrink-0" />
                      <p className="text-gray-600 dark:text-gray-400">{office.hours}</p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Get Directions
                    </button>
                  </div>
                </div>
              </FadeInOnView>
            ))}
          </div>
        </div>
      </section>

      {/* Departments */}
      <section ref={departmentsRef} className={`py-20 bg-white dark:bg-gray-900 transition-opacity duration-700 ${departmentsInView ? 'opacity-100' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">Contact by Department</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Reach out to the right team for faster assistance
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {departments.map((dept) => (
              <FadeInOnView key={dept.name}>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 hover:shadow-xl transition-all group hover:-translate-y-2">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mr-4">
                      {dept.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{dept.name}</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{dept.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-emerald-500 mr-2" />
                      <a href={`mailto:${dept.email}`} className="text-emerald-600 dark:text-emerald-400 hover:underline">
                        {dept.email}
                      </a>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-emerald-500 mr-2" />
                      <a href={`tel:${dept.phone}`} className="text-emerald-600 dark:text-emerald-400 hover:underline">
                        {dept.phone}
                      </a>
                    </div>
                  </div>
                </div>
              </FadeInOnView>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section ref={faqRef} className={`py-20 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 transition-opacity duration-700 ${faqInView ? 'opacity-100' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Quick answers to common questions
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border border-emerald-100 dark:border-gray-600 rounded-xl overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)} 
                  className="w-full flex items-center justify-between px-6 py-4 font-semibold text-lg text-left text-gray-800 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-gray-700 transition-all"
                >
                  {faq.q}
                  {openFaq === i ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                <div className={`px-6 pb-4 text-gray-700 dark:text-gray-300 text-base transition-all duration-300 ${openFaq === i ? 'block' : 'hidden'}`}>
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-emerald-100">
            Join thousands of farmers and customers who trust KrishiKarobar for their agricultural needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-emerald-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center">
              <User className="mr-2 w-5 h-5" /> Join as Farmer
            </Link>
            <Link to="/products" className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-emerald-600 transition-all flex items-center justify-center">
              <Star className="mr-2 w-5 h-5" /> Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Custom Animations */}
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.7s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(32px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(32px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
} 