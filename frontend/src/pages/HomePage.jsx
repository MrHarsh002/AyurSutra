import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Brain, 
  Users, 
  Calendar, 
  Shield, 
  TrendingUp, 
  BarChart,
  FileText,
  MessageSquare,
  Bell,
  Search,
  Menu,
  X,
  User,
  Clock,
  Star,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  LogIn,
  Sparkles
} from 'lucide-react';

const AyurSutraHomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Hero section slides
  const slides = [
    {
      id: 1,
      title: "AI-Powered Panchakarma Therapy Management",
      description: "Revolutionary Ayurvedic patient care with intelligent scheduling and predictive analytics",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
      linear: "from-green-600 to-emerald-800",
      buttonText: "Explore AI Features",
      buttonColor: "bg-white text-green-700 hover:bg-gray-100"
    },
    {
      id: 2,
      title: "Intelligent Therapy Scheduling with ML",
      description: "Optimize treatment plans using machine learning algorithms for maximum patient recovery",
      image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
      linear: "from-amber-600 to-orange-800",
      buttonText: "View Scheduling Demo",
      buttonColor: "bg-white text-amber-700 hover:bg-gray-100"
    },
    {
      id: 3,
      title: "Comprehensive Patient Management System",
      description: "End-to-end patient tracking from consultation to post-therapy follow-up",
      image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
      linear: "from-blue-600 to-indigo-800",
      buttonText: "Start Free Trial",
      buttonColor: "bg-white text-blue-700 hover:bg-gray-100"
    }
  ];

  // Auto slide rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Navigate slides
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Key features
  const features = [
    {
      icon: <Brain className="h-12 w-12" />,
      title: "AI-Powered Diagnostics",
      description: "Machine learning algorithms analyze patient data for accurate Ayurvedic diagnosis",
      linear: "from-purple-500 to-pink-500"
    },
    {
      icon: <Activity className="h-12 w-12" />,
      title: "Smart Therapy Scheduling",
      description: "Intelligent scheduling system optimizes therapy sessions based on multiple parameters",
      linear: "from-green-500 to-emerald-500"
    },
    {
      icon: <TrendingUp className="h-12 w-12" />,
      title: "Predictive Analytics",
      description: "Forecast patient recovery patterns and optimize treatment plans",
      linear: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Users className="h-12 w-12" />,
      title: "Patient Management",
      description: "Comprehensive patient profiles with treatment history and progress tracking",
      linear: "from-amber-500 to-orange-500"
    }
  ];

  // AI/ML Features
  const aiFeatures = [
    {
      title: "Machine Learning Models",
      items: ["Predictive therapy outcomes", "Patient risk assessment", "Optimal scheduling algorithms"]
    },
    {
      title: "Intelligent Analytics",
      items: ["Real-time progress tracking", "Pattern recognition", "Recovery prediction models"]
    },
    {
      title: "Automated Systems",
      items: ["Smart appointment scheduling", "Therapy room allocation", "Resource optimization"]
    }
  ];

  // Doctors for booking
  const doctors = [
    {
      id: 1,
      name: "Dr. Anjali Sharma",
      specialization: "Panchakarma Specialist",
      experience: "15+ years",
      rating: 4.9,
      availability: "Available Today",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
    },
    {
      id: 2,
      name: "Dr. Rajesh Patel",
      specialization: "Ayurvedic Diagnosis",
      experience: "12+ years",
      rating: 4.8,
      availability: "Tomorrow",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
    },
    {
      id: 3,
      name: "Dr. Priya Desai",
      specialization: "Therapy Planning",
      experience: "10+ years",
      rating: 4.7,
      availability: "Available Now",
      image: "https://images.unsplash.com/photo-1594824434340-7e7dfc37cabb?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
    }
  ];

  // Statistics
  const stats = [
    { value: "5000+", label: "Patients Treated", icon: <Users className="h-6 w-6" /> },
    { value: "98%", label: "Success Rate", icon: <TrendingUp className="h-6 w-6" /> },
    { value: "50+", label: "Expert Doctors", icon: <Shield className="h-6 w-6" /> },
    { value: "24/7", label: "AI Support", icon: <Brain className="h-6 w-6" /> }
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      {/* Navigation Bar */}
      <nav className="fixed w-full bg-white/90 backdrop-blur-md z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="h-12 w-12 bg-linear-to-r from-green-600 to-emerald-700 rounded-xl flex items-center justify-center">
                  <Activity className="h-7 w-7 text-white" />
                  <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-linear-to-r from-green-700 to-emerald-800 bg-clip-text text-transparent">
                  AyurSutra
                </h1>
                <p className="text-xs text-gray-500">AI-Powered Panchakarma Management</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <a href="#" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Home</a>
              <a href="#" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Features</a>
              <a href="#" className="text-gray-700 hover:text-green-600 font-medium transition-colors">AI/ML</a>
              <a href="#" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Doctors</a>
              <a href="#" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Pricing</a>
              <a href="#" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Contact</a>
              
              {/* Login Button */}
              <button 
                onClick={() => setIsLoggedIn(!isLoggedIn)}
                className="flex items-center space-x-2 bg-linear-to-r from-green-600 to-emerald-700 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <LogIn className="h-5 w-5" />
                <span>{isLoggedIn ? "Logout" : "/login"}</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t">
            <div className="container mx-auto px-4 py-6 space-y-4">
              <a href="#" className="block text-gray-700 hover:text-green-600 font-medium">Home</a>
              <a href="#" className="block text-gray-700 hover:text-green-600 font-medium">Features</a>
              <a href="#" className="block text-gray-700 hover:text-green-600 font-medium">AI/ML</a>
              <a href="#" className="block text-gray-700 hover:text-green-600 font-medium">Doctors</a>
              <a href="#" className="block text-gray-700 hover:text-green-600 font-medium">Pricing</a>
              <a href="#" className="block text-gray-700 hover:text-green-600 font-medium">Contact</a>
              <button 
                onClick={() => setIsLoggedIn(!isLoggedIn)}
                className="w-full flex items-center justify-center space-x-2 bg-linear-to-r from-green-600 to-emerald-700 text-white px-6 py-3 rounded-lg font-medium"
              >
                <LogIn className="h-5 w-5" />
                <span>{isLoggedIn ? "Logout" : "Login"}</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-20">
        <div className="relative overflow-hidden">
          {/* Slide Container */}
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((slide, index) => (
              <div key={slide.id} className="w-full flex-shrink-0 relative">
                <div className={`bg-linear-to-r ${slide.linear}`}>
                  <div className="container mx-auto px-4">
                    <div className="min-h-[600px] flex flex-col lg:flex-row items-center">
                      {/* Content */}
                      <div className="lg:w-1/2 text-white py-12 lg:py-0">
                        <div className="max-w-lg">
                          <div className="flex items-center space-x-2 mb-4">
                            <Sparkles className="h-5 w-5 text-yellow-300" />
                            <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                              AI-Powered Platform
                            </span>
                          </div>
                          <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                            {slide.title}
                          </h1>
                          <p className="text-lg mb-8 text-white/90">
                            {slide.description}
                          </p>
                          <div className="flex flex-wrap gap-4">
                            <button className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${slide.buttonColor}`}>
                              {slide.buttonText}
                            </button>
                            <button className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors">
                              Watch Demo
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Image */}
                      <div className="lg:w-1/2 relative">
                        <div className="relative lg:absolute lg:right-0 lg:top-1/2 lg:transform lg:-translate-y-1/2">
                          <div className="relative">
                            <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent rounded-2xl"></div>
                            <img 
                              src={slide.image} 
                              alt={slide.title}
                              className="w-full h-[300px] lg:h-[400px] object-cover rounded-2xl shadow-2xl"
                            />
                          </div>
                          
                          {/* Floating Stats Card */}
                          <div className="absolute -bottom-6 left-6 bg-white rounded-xl shadow-2xl p-4 max-w-xs">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <Brain className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">AI Accuracy</p>
                                <p className="text-xl font-bold text-gray-800">94.7%</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Slide Controls */}
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg z-10"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg z-10"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 w-8 rounded-full transition-all ${currentSlide === index ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-center h-12 w-12 bg-linear-to-r from-green-100 to-emerald-100 rounded-lg mb-4 mx-auto">
                  <div className="text-green-600">
                    {stat.icon}
                  </div>
                </div>
                <p className="text-3xl font-bold text-center text-gray-800 mb-2">{stat.value}</p>
                <p className="text-center text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-linear-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Key Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive Panchakarma management powered by artificial intelligence and machine learning
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <div className={`h-16 w-16 bg-linear-to-r ${feature.linear} rounded-xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 mb-6">{feature.description}</p>
                  <button className="text-green-600 font-medium flex items-center group-hover:text-green-700">
                    Learn more
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI/ML Section */}
      <section className="py-16 bg-linear-to-r from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-12 lg:mb-0">
              <div className="max-w-lg">
                <div className="flex items-center space-x-2 mb-4">
                  <Sparkles className="h-5 w-5 text-yellow-300" />
                  <span className="text-sm font-medium bg-white/10 px-3 py-1 rounded-full">
                    Advanced AI Integration
                  </span>
                </div>
                <h2 className="text-4xl font-bold mb-6">Intelligent Therapy Management with AI/ML</h2>
                <p className="text-gray-300 mb-8">
                  Our platform uses cutting-edge machine learning algorithms to optimize every aspect of Panchakarma therapy management, from patient diagnosis to treatment scheduling.
                </p>
                <button className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Explore AI Features
                </button>
              </div>
            </div>
            
            <div className="lg:w-1/2">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {aiFeatures.map((section, index) => (
                    <div key={index} className="bg-white/5 rounded-xl p-6">
                      <h3 className="font-bold text-lg mb-4">{section.title}</h3>
                      <ul className="space-y-3">
                        {section.items.map((item, idx) => (
                          <li key={idx} className="flex items-center">
                            <div className="h-2 w-2 bg-green-400 rounded-full mr-3"></div>
                            <span className="text-gray-300">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                
                {/* AI Visualization SVG */}
                <div className="mt-8 relative">
                  <svg viewBox="0 0 400 200" className="w-full">
                    {/* Neural Network Visualization */}
                    <path d="M50,100 Q150,50 250,100 T450,100" stroke="url(#linear)" strokeWidth="2" fill="none" opacity="0.3"/>
                    <path d="M50,80 Q150,30 250,80 T450,80" stroke="url(#linear)" strokeWidth="2" fill="none" opacity="0.3"/>
                    <path d="M50,120 Q150,170 250,120 T450,120" stroke="url(#linear)" strokeWidth="2" fill="none" opacity="0.3"/>
                    
                    {/* Nodes */}
                    <circle cx="50" cy="100" r="8" fill="url(#linear)"/>
                    <circle cx="150" cy="50" r="8" fill="url(#linear)"/>
                    <circle cx="250" cy="100" r="8" fill="url(#linear)"/>
                    <circle cx="350" cy="100" r="8" fill="url(#linear)"/>
                    
                    <defs>
                      <linearGradient id="linear" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Doctor Booking Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Book Expert Doctors</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Connect with certified Panchakarma specialists and Ayurvedic doctors for personalized consultations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="bg-linear-to-br from-white to-gray-50 rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-shadow">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={doctor.image} 
                    alt={doctor.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-green-600 font-medium">{doctor.availability}</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{doctor.name}</h3>
                  <p className="text-gray-600 mb-4">{doctor.specialization}</p>
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">{doctor.experience}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      <span className="font-bold">{doctor.rating}</span>
                      <span className="text-gray-500">/5</span>
                    </div>
                  </div>
                  
                  <button className="w-full bg-linear-to-r from-green-600 to-emerald-700 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                    Book Consultation
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="text-green-600 font-semibold hover:text-green-700 flex items-center justify-center mx-auto">
              View All Doctors
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer with Map */}
      <footer className="bg-linear-to-b from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4">
          <div className="py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="h-12 w-12 bg-linear-to-r from-green-600 to-emerald-700 rounded-xl flex items-center justify-center">
                    <Activity className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">AyurSutra</h2>
                    <p className="text-gray-400">AI-Powered Panchakarma Management</p>
                  </div>
                </div>
                
                <p className="text-gray-300 mb-8">
                  Transforming traditional Ayurvedic therapies with cutting-edge artificial intelligence and machine learning for optimal patient care and management.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-green-400" />
                    <span className="text-gray-300">123 Ayurveda Street, Wellness City, India</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-green-400" />
                    <span className="text-gray-300">+91 98765 43210</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-green-400" />
                    <span className="text-gray-300">info@ayursutra.com</span>
                  </div>
                </div>
              </div>

              {/* Map Section */}
              <div>
                <h3 className="text-xl font-bold mb-6">Find Our Centers</h3>
                <div className="bg-linear-to-r from-green-500/20 to-emerald-500/20 rounded-2xl p-8">
                  <div className="relative h-64 rounded-xl overflow-hidden">
                    {/* Map Placeholder with Interactive Elements */}
                    <div className="absolute inset-0 bg-linear-to-br from-green-400/30 to-emerald-600/30 flex items-center justify-center">
                      <div className="text-center">
                        <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                          <MapPin className="h-8 w-8 text-white" />
                        </div>
                        <p className="font-bold text-lg">AyurSutra Headquarters</p>
                        <p className="text-gray-300">Panchakarma Therapy Centers Nationwide</p>
                      </div>
                      
                      {/* Map Markers */}
                      <div className="absolute top-1/4 left-1/4 h-4 w-4 bg-green-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                      <div className="absolute top-1/3 right-1/3 h-4 w-4 bg-green-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                      <div className="absolute bottom-1/4 left-1/3 h-4 w-4 bg-green-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                      <div className="absolute bottom-1/3 right-1/4 h-4 w-4 bg-green-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button className="w-full bg-white text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                      View All Centers
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Footer */}
          <div className="border-t border-gray-800 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 mb-4 md:mb-0">
                © 2024 AyurSutra. All rights reserved.
              </p>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">AI Ethics</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AyurSutraHomePage;