import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, Star, Truck, Shield, MapPin, Phone, Mail, Leaf, Sprout, Apple, Wheat, 
  CheckCircle, ArrowRight, Globe, Sun, Award, Heart, Target, Zap, BookOpen,
  ChevronRight, ChevronDown, ChevronUp, User, Clock, TrendingUp, Award as AwardIcon
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

// Helper: FadeInOnView component for fade-up animation
function FadeInOnView({ children, className = '' }) {
  const [ref, inView] = useInView(0.2);
  return (
    <div ref={ref} className={`${className} transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      {children}
    </div>
  );
}

const teamMembers = [
  {
    name: 'Update soon/demo',
    role: 'Founder & CEO',
    photo: 'https://randomuser.me/api/portraits/men/32.jpg',
    bio: 'Agricultural expert with 15+ years in sustainable farming and digital agriculture.',
    expertise: ['Sustainable Farming', 'Digital Agriculture', 'Business Strategy'],
    social: { linkedin: '#', twitter: '#', email: 'rajesh@krishikarobar.com' }
  },
  {
    name: 'Update soon/demo',
    role: 'Head of Operations',
    photo: 'https://randomuser.me/api/portraits/women/44.jpg',
    bio: 'Operations specialist focused on streamlining farm-to-table logistics and quality control.',
    expertise: ['Supply Chain', 'Quality Control', 'Logistics'],
    social: { linkedin: '#', twitter: '#', email: 'sita@krishikarobar.com' }
  },
  {
    name: 'Update soon/demo',
    role: 'Technology Lead',
    photo: 'https://randomuser.me/api/portraits/men/45.jpg',
    bio: 'Tech enthusiast building innovative solutions for agricultural digital transformation.',
    expertise: ['Full Stack Development', 'AI/ML', 'Mobile Apps'],
    social: { linkedin: '#', twitter: '#', email: 'bikash@krishikarobar.com' }
  },
  {
    name: 'Update soon/demo',
    role: 'Head of Marketing',
    photo: 'https://randomuser.me/api/portraits/women/68.jpg',
    bio: 'Marketing strategist passionate about connecting farmers with consumers through digital platforms.',
    expertise: ['Digital Marketing', 'Brand Strategy', 'Customer Experience'],
    social: { linkedin: '#', twitter: '#', email: 'mina@krishikarobar.com' }
  }
];

const milestones = [
  {
    year: '2023',
    title: 'Platform Launch',
    description: 'KrishiKarobar officially launched.',
    icon: <Sprout className="w-6 h-6" />
  },
  {
    year: '2024',
    title: 'Expansion Phase',
    description: 'Yet to be updated.',
    icon: <TrendingUp className="w-6 h-6" />
  },
  {
    year: '2024',
    title: 'Mobile App Launch',
    description: 'Soon',
    icon: <Zap className="w-6 h-6" />
  },
  {
    year: '2025',
    title: 'Quality Certification',
    description: 'Yet to be updated.',
    icon: <Award className="w-6 h-6" />
  },
  {
    year: '2026',
    title: 'National Recognition',
    description: 'Yet to be updated.',
    icon: <Star className="w-6 h-6" />
  }
];

const values = [
  {
    icon: <Heart className="w-8 h-8" />,
    title: 'Sustainability',
    description: 'We believe in sustainable farming practices that protect our environment for future generations.',
    color: 'from-green-500 to-emerald-600'
  },
  {
    icon: <Target className="w-8 h-8" />,
    title: 'Quality First',
    description: 'Every product on our platform meets the highest quality standards and is carefully curated.',
    color: 'from-emerald-500 to-teal-600'
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: 'Community',
    description: 'We foster strong relationships between farmers and consumers, building a supportive community.',
    color: 'from-teal-500 to-cyan-600'
  },
  {
    icon: <Globe className="w-8 h-8" />,
    title: 'Innovation',
    description: 'We continuously innovate to provide the best digital solutions for agricultural commerce.',
    color: 'from-cyan-500 to-blue-600'
  }
];

const faqs = [
  {
    q: 'What is KrishiKarobar?',
    a: 'KrishiKarobar is Nepal\'s leading agricultural e-commerce platform that connects local farmers directly with consumers, ensuring fresh, quality produce while supporting sustainable farming practices.'
  },
  {
    q: 'How do you ensure product quality?',
    a: 'We have a rigorous quality control process that includes farm inspections, product testing, and continuous monitoring. All our farmers follow sustainable practices and meet our quality standards.'
  },
  {
    q: 'Can anyone become a farmer on your platform?',
    a: 'Yes! We welcome all farmers who are committed to sustainable practices and quality standards. Our team provides training and support to help farmers succeed on our platform.'
  },
  {
    q: 'What makes KrishiKarobar different?',
    a: 'We focus on direct farm-to-table connections, sustainable practices, and supporting local farmers. Our platform is designed specifically for Nepal\'s agricultural landscape.'
  },
  {
    q: 'How do you support farmers?',
    a: 'We provide farmers with digital tools, market access, fair pricing, and educational resources. Our platform helps farmers reach more customers and earn better incomes.'
  }
];

export default function About() {
  const [openFaq, setOpenFaq] = useState(null);
  const [activeTab, setActiveTab] = useState('mission');

  // Aggregate stats from backend
  const [farmerCount, setFarmerCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);

  // Progressive section loading (Intersection Observer)
  const [heroRef, heroInView] = useInView(0.2);
  const [statsRef, statsInView] = useInView(0.2);
  const [missionRef, missionInView] = useInView(0.2);
  const [teamRef, teamInView] = useInView(0.2);
  const [milestonesRef, milestonesInView] = useInView(0.2);
  const [valuesRef, valuesInView] = useInView(0.2);
  const [faqRef, faqInView] = useInView(0.2);

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
                About
                <span className="block bg-gradient-to-r from-green-600 to-emerald-700 dark:from-green-400 dark:to-emerald-500 bg-clip-text text-transparent">
                  KrishiKarobar
                </span>
              </h1>
            </FadeInOnView>
            <FadeInOnView>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-4xl mx-auto leading-relaxed">
                Connecting Nepal's farmers with consumers through innovative technology, 
                sustainable practices, and a commitment to quality that benefits everyone.
              </p>
            </FadeInOnView>
            <FadeInOnView>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/products" className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center">
                  Explore Products <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link to="/contact" className="border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 px-8 py-4 rounded-full text-lg font-semibold hover:bg-emerald-600 hover:text-white transition-all">
                  Get in Touch
                </Link>
              </div>
            </FadeInOnView>
          </div>
        </div>
      </section>

      {/* Stats Section */}
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

      {/* Mission & Vision Section */}
      <section ref={missionRef} className={`py-20 bg-white dark:bg-gray-900 transition-opacity duration-700 ${missionInView ? 'opacity-100' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">Our Mission & Vision</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Building a sustainable future for Nepal's agriculture through technology and community
            </p>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-1">
              <button
                onClick={() => setActiveTab('mission')}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  activeTab === 'mission'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                Our Mission
              </button>
              <button
                onClick={() => setActiveTab('vision')}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  activeTab === 'vision'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                Our Vision
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="max-w-4xl mx-auto">
            {activeTab === 'mission' && (
              <FadeInOnView>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 md:p-12 shadow-xl">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mr-4">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Our Mission</h3>
                  </div>
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                    To revolutionize Nepal's agricultural sector by creating a direct bridge between farmers and consumers. 
                    We empower local farmers with digital tools and market access while providing consumers with fresh, 
                    quality produce at fair prices.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Support Local Farmers</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Provide fair pricing and market access</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Ensure Quality</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Maintain highest quality standards</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Promote Sustainability</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Encourage eco-friendly farming practices</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Build Community</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Create strong farmer-consumer relationships</p>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeInOnView>
            )}

            {activeTab === 'vision' && (
              <FadeInOnView>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 md:p-12 shadow-xl">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mr-4">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Our Vision</h3>
                  </div>
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                    To become Nepal's most trusted agricultural platform, leading the digital transformation of farming 
                    while preserving traditional values and promoting sustainable practices that benefit our environment 
                    and future generations.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Digital Leadership</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Lead agricultural digital transformation</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">National Impact</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Serve farmers across all of Nepal</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Environmental Stewardship</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Promote sustainable farming practices</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Community Growth</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Build thriving agricultural communities</p>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeInOnView>
            )}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section ref={valuesRef} className={`py-20 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 transition-opacity duration-700 ${valuesInView ? 'opacity-100' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              The principles that guide everything we do at KrishiKarobar
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <FadeInOnView key={value.title}>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center hover:shadow-xl transition-all group hover:-translate-y-2">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${value.color} rounded-full mb-6 group-hover:scale-110 transition-transform`}>
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">{value.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{value.description}</p>
                </div>
              </FadeInOnView>
            ))}
          </div>
        </div>
      </section>

      {/* Our Journey */}
      <section ref={milestonesRef} className={`py-20 bg-white dark:bg-gray-900 transition-opacity duration-700 ${milestonesInView ? 'opacity-100' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Key milestones in our mission to transform Nepal's agricultural landscape
            </p>
          </div>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-green-500 to-emerald-600 hidden md:block"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <FadeInOnView key={milestone.year}>
                  <div className={`flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} flex-col`}>
                    <div className="w-full md:w-1/2 p-6">
                      <div className={`bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 shadow-lg ${index % 2 === 0 ? 'md:mr-8' : 'md:ml-8'}`}>
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mr-4">
                            {milestone.icon}
                          </div>
                          <div>
                            <span className="text-2xl font-bold text-green-600 dark:text-green-400">{milestone.year}</span>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{milestone.title}</h3>
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{milestone.description}</p>
                      </div>
                    </div>
                    
                    {/* Timeline dot */}
                    <div className="relative z-10 w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full border-4 border-white dark:border-gray-800 shadow-lg hidden md:block"></div>
                    
                    <div className="w-full md:w-1/2"></div>
                  </div>
                </FadeInOnView>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section ref={teamRef} className={`py-20 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 transition-opacity duration-700 ${teamInView ? 'opacity-100' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">Meet Our Team (Update soon)</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              The passionate individuals behind KrishiKarobar's mission to transform agriculture
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <FadeInOnView key={member.name}>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center hover:shadow-xl transition-all group hover:-translate-y-2">
                  <img 
                    src={member.photo} 
                    alt={member.name} 
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-6 border-4 border-emerald-200 dark:border-emerald-600 shadow-lg group-hover:scale-105 transition-transform"
                  />
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">{member.name}</h3>
                  <p className="text-emerald-600 dark:text-emerald-400 font-semibold mb-4">{member.role}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">{member.bio}</p>
                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                    {member.expertise.map((skill) => (
                      <span key={skill} className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs px-3 py-1 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-center space-x-3">
                    <a href={member.social.linkedin} className="text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                      </svg>
                    </a>
                    <a href={member.social.twitter} className="text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </a>
                    <a href={`mailto:${member.social.email}`} className="text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                      <Mail className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </FadeInOnView>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section ref={faqRef} className={`py-20 bg-white dark:bg-gray-900 transition-opacity duration-700 ${faqInView ? 'opacity-100' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Everything you need to know about KrishiKarobar
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-emerald-100 dark:border-gray-600 rounded-xl overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)} 
                  className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 font-semibold text-lg text-left text-gray-800 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-gray-700 transition-all"
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
          <h2 className="text-4xl font-bold mb-6">Ready to Join Our Mission?</h2>
          <p className="text-xl mb-8 text-emerald-100">
            Whether you're a farmer looking to reach more customers or a consumer seeking fresh, quality produce, 
            we're here to help you succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-emerald-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105">
              Join as Farmer
            </Link>
            <Link to="/products" className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-emerald-600 transition-all">
              Shop Now
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