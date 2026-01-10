import React, { useState, useEffect } from 'react';
import api from '../../services/api'; // Your axios instance
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

const TherapyManagement = () => {
  // Initialize AOS
  useEffect(() => {
    AOS.init({ duration: 800 });
  }, []);

  // State variables
  const [therapies, setTherapies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState(null);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Form states
  const [newTherapy, setNewTherapy] = useState({
    name: '',
    description: '',
    category: 'panchakarma',
    duration: 60,
    cost: 0,
    requiredEquipment: [],
    requiredTherapists: 1,
    precautions: [],
    benefits: [],
    contraindications: [],
    preparationInstructions: '',
    aftercareInstructions: '',
    isActive: true
  });
  
  const [selectedTherapy, setSelectedTherapy] = useState(null);
  const [equipmentInput, setEquipmentInput] = useState('');
  const [precautionInput, setPrecautionInput] = useState('');
  const [benefitInput, setBenefitInput] = useState('');

  const [therapyCategories, setTherapyCategories] = useState([]);
  
    useEffect(() => {
      const fetchMeta = async () => {
        try {
          const res = await api.get('/doctors/meta');
          setTherapyCategories(res.data.therapyCategories);
        } catch (err) {
          console.error('Failed to fetch meta:', err);
        }
      };
      fetchMeta();
    }, []);


  // Appointment types for stats
  const appointmentTypes = ['consultation', 'therapy', 'follow-up', 'emergency'];

  // Fetch therapies
  const fetchTherapies = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        search: searchTerm,
        category: categoryFilter,
        isActive: activeFilter === 'active' ? 'true' : activeFilter === 'inactive' ? 'false' : undefined
      };
      
      const response = await api.get('/therapies', { params });
      setTherapies(response.data.therapies);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
    } catch (error) {
      toast.error('Failed to fetch therapies');
      console.error('Error fetching therapies:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await api.get('/therapies/stats/popular');
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to fetch therapy statistics');
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchTherapies();
    fetchStats();
  }, []);

  // Handle search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchTherapies(1);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, categoryFilter, activeFilter]);

  // Create new therapy
  const handleCreateTherapy = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/therapies', newTherapy);
      toast.success(response.data.message);
      setShowAddModal(false);
      setNewTherapy({
        name: '',
        description: '',
        category: 'panchakarma',
        duration: 60,
        cost: 0,
        requiredEquipment: [],
        requiredTherapists: 1,
        precautions: [],
        benefits: [],
        contraindications: [],
        preparationInstructions: '',
        aftercareInstructions: '',
        isActive: true
      });
      fetchTherapies();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create therapy');
    }
  };

  // Update therapy
  const handleUpdateTherapy = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/therapies/${selectedTherapy._id}`, selectedTherapy);
      toast.success(response.data.message);
      setShowEditModal(false);
      fetchTherapies();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update therapy');
    }
  };

  // Delete therapy
  const handleDeleteTherapy = async () => {
    try {
      await api.delete(`/therapies/${selectedTherapy._id}`);
      toast.success('Therapy deleted successfully');
      setShowDeleteModal(false);
      fetchTherapies();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete therapy');
    }
  };

  // Add item to array fields
  const addArrayItem = (field, value, setInput, inputValue) => {
    if (inputValue.trim()) {
      const updated = { ...newTherapy, [field]: [...newTherapy[field], inputValue.trim()] };
      setNewTherapy(updated);
      setInput('');
    }
  };

  // Remove item from array fields
  const removeArrayItem = (field, index) => {
    const updated = { ...newTherapy, [field]: newTherapy[field].filter((_, i) => i !== index) };
    setNewTherapy(updated);
  };

  // Pagination
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchTherapies(page);
    }
  };

  // Modal handlers
  const openEditModal = (therapy) => {
    setSelectedTherapy({ ...therapy });
    setShowEditModal(true);
  };

  const openDeleteModal = (therapy) => {
    setSelectedTherapy(therapy);
    setShowDeleteModal(true);
  };

  const openDetailModal = (therapy) => {
    setSelectedTherapy(therapy);
    setShowDetailModal(true);
  };

  // Format duration to hours and minutes
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50 p-4 md:p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header */}
      <div className="mb-8" data-aos="fade-down">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Therapy Management</h1>
            </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 md:mt-0 px-6 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl flex items-center gap-2"
            data-aos="fade-left"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Therapy
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div 
          className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1 border-l-4 border-indigo-500"
          onClick={() => setShowStatsModal(true)}
          data-aos="fade-up"
          data-aos-delay="100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Therapies</p>
              <p className="text-2xl font-bold text-gray-800">{therapies.length}</p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-xl">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>

        <div 
          className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1 border-l-4 border-green-500"
          onClick={() => setShowStatsModal(true)}
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Therapies</p>
              <p className="text-2xl font-bold text-green-600">
                {therapies.filter(t => t.isActive).length}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500" data-aos="fade-up" data-aos-delay="300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Categories</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats?.categoryDistribution?.length || 0}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-xl">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500" data-aos="fade-up" data-aos-delay="400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg. Cost</p>
              <p className="text-2xl font-bold text-purple-600">
                ${therapies.length > 0 
                  ? (therapies.reduce((sum, t) => sum + t.cost, 0) / therapies.length).toFixed(2)
                  : '0.00'
                }
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6" data-aos="fade-up">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search therapies by name, description, or ID..."
                className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {therapyCategories.map(dep => (
                <option key={dep} value={dep}>
                  {dep.charAt(0).toUpperCase() + dep.slice(1)}
                </option>
              ))}
            </select>
            
            <select
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
            
            <button
              onClick={() => setShowStatsModal(true)}
              className="px-4 py-3 bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Therapies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {loading ? (
          [...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse" data-aos="fade-up">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          ))
        ) : therapies.length === 0 ? (
          <div className="col-span-full text-center py-12" data-aos="fade-up">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-600 text-lg">No therapies found. Add your first therapy!</p>
          </div>
        ) : (
          therapies.map((therapy, index) => (
            <div 
              key={therapy._id} 
              className={`bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 border-2 ${therapy.isActive ? 'border-green-200 hover:border-green-300' : 'border-red-200 hover:border-red-300'}`}
              data-aos="fade-up"
              data-aos-delay={index % 3 * 100}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 mb-2">
                    {therapy.therapyId}
                  </span>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{therapy.name}</h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{therapy.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${therapy.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {therapy.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm">Category</span>
                  <span className="font-medium text-gray-800 capitalize">
                    {therapy.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm">Duration</span>
                  <span className="font-medium text-gray-800">{formatDuration(therapy.duration)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm">Cost</span>
                  <span className="font-bold text-lg text-purple-600">${therapy.cost}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm">Therapists Required</span>
                  <span className="font-medium text-gray-800">{therapy.requiredTherapists}</span>
                </div>
              </div>

              {therapy.benefits.length > 0 && (
                <div className="mb-4">
                  <p className="text-gray-500 text-sm mb-2">Key Benefits:</p>
                  <div className="flex flex-wrap gap-1">
                    {therapy.benefits.slice(0, 2).map((benefit, idx) => (
                      <span key={idx} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded">
                        {benefit}
                      </span>
                    ))}
                    {therapy.benefits.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{therapy.benefits.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  onClick={() => openDetailModal(therapy)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium hover:underline"
                >
                  View Details
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(therapy)}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => openDeleteModal(therapy)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {therapies.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6" data-aos="fade-up">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page <span className="font-semibold">{currentPage}</span> of{' '}
              <span className="font-semibold">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                        currentPage === pageNum
                          ? 'bg-linear-to-r from-indigo-600 to-purple-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Therapy Modal - Horizontal Layout */}
{showAddModal && (
  <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
    <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full my-8 border-2 border-gray-100" data-aos="zoom-in">
      <div className="sticky top-0 mb-5 bg-white rounded-t-3xl border-b border-gray-100 px-8 py-6 z-10 flex items-center">
          <h3 className="text-xl font-bold text-gray-800">
            Add New Therapy
          </h3>

          <button
            onClick={() => setShowAddModal(false)}
            className="ml-auto p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

      
      <div className="p-8">
        <form onSubmit={handleCreateTherapy} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Information */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-gray-800 border-l-4 border-indigo-500 pl-4">Basic Information</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Therapy Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={newTherapy.name}
                    onChange={(e) => setNewTherapy({...newTherapy, name: e.target.value})}
                    placeholder="e.g., Shirodhara, Abhyanga"
                  />
                </div>
                
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>

                <select
                  required
                  value={newTherapy.category}
                  onChange={(e) =>
                    setNewTherapy(prev => ({
                      ...prev,
                      category: e.target.value
                    }))
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl
                            focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                            transition-all"
                >
                  <option value="">Select Therapy Category</option>

                  {therapyCategories?.map(cat => (
                    <option key={cat} value={cat}>
                      {cat
                        .split('-')
                        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(' ')}
                    </option>
                  ))}
                </select>
              </div>

                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (min) *</label>
                    <input
                      type="number"
                      required
                      min="15"
                      step="15"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      value={newTherapy.duration}
                      onChange={(e) => setNewTherapy({...newTherapy, duration: parseInt(e.target.value) || 60})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cost ($) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      value={newTherapy.cost}
                      onChange={(e) => setNewTherapy({...newTherapy, cost: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Therapists Required *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      value={newTherapy.requiredTherapists}
                      onChange={(e) => setNewTherapy({...newTherapy, requiredTherapists: parseInt(e.target.value) || 1})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <div className="mt-2">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={newTherapy.isActive}
                          onChange={(e) => setNewTherapy({...newTherapy, isActive: e.target.checked})}
                          className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-gray-700">Active</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    rows="4"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={newTherapy.description}
                    onChange={(e) => setNewTherapy({...newTherapy, description: e.target.value})}
                    placeholder="Brief description of the therapy..."
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Therapy Details */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-gray-800 border-l-4 border-green-500 pl-4">Therapy Details</h4>
              
              <div className="space-y-4">
                {/* Benefits */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Benefits</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={benefitInput}
                      onChange={(e) => setBenefitInput(e.target.value)}
                      placeholder="Add a benefit..."
                      onKeyPress={(e) => e.key === 'Enter' && addArrayItem('benefits', benefitInput, setBenefitInput, benefitInput)}
                    />
                    <button
                      type="button"
                      onClick={() => addArrayItem('benefits', benefitInput, setBenefitInput, benefitInput)}
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-1">
                    {newTherapy.benefits.map((benefit, index) => (
                      <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                        {benefit}
                        <button
                          type="button"
                          onClick={() => removeArrayItem('benefits', index)}
                          className="text-green-500 hover:text-green-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Equipment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Required Equipment</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={equipmentInput}
                      onChange={(e) => setEquipmentInput(e.target.value)}
                      placeholder="Add equipment..."
                      onKeyPress={(e) => e.key === 'Enter' && addArrayItem('requiredEquipment', equipmentInput, setEquipmentInput, equipmentInput)}
                    />
                    <button
                      type="button"
                      onClick={() => addArrayItem('requiredEquipment', equipmentInput, setEquipmentInput, equipmentInput)}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-1">
                    {newTherapy.requiredEquipment.map((equipment, index) => (
                      <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                        {equipment}
                        <button
                          type="button"
                          onClick={() => removeArrayItem('requiredEquipment', index)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Precautions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Precautions</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      value={precautionInput}
                      onChange={(e) => setPrecautionInput(e.target.value)}
                      placeholder="Add a precaution..."
                      onKeyPress={(e) => e.key === 'Enter' && addArrayItem('precautions', precautionInput, setPrecautionInput, precautionInput)}
                    />
                    <button
                      type="button"
                      onClick={() => addArrayItem('precautions', precautionInput, setPrecautionInput, precautionInput)}
                      className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-xl hover:bg-yellow-200 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-1">
                    {newTherapy.precautions.map((precaution, index) => (
                      <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm">
                        {precaution}
                        <button
                          type="button"
                          onClick={() => removeArrayItem('precautions', index)}
                          className="text-yellow-500 hover:text-yellow-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Instructions Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preparation Instructions</label>
                  <textarea
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={newTherapy.preparationInstructions}
                    onChange={(e) => setNewTherapy({...newTherapy, preparationInstructions: e.target.value})}
                    placeholder="Patient preparation..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Aftercare Instructions</label>
                  <textarea
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={newTherapy.aftercareInstructions}
                    onChange={(e) => setNewTherapy({...newTherapy, aftercareInstructions: e.target.value})}
                    placeholder="Post-therapy care..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              Create Therapy
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}

{/* Edit Therapy Modal - Horizontal Layout */}
{showEditModal && selectedTherapy && (
  <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
    <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full my-8 border-2 border-gray-100" data-aos="zoom-in">
      <div className="sticky top-0 bg-white rounded-t-3xl border-b border-gray-100 px-8 py-6 z-10">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Edit Therapy</h3>
            <p className="text-gray-600 mt-1">Therapy ID: {selectedTherapy.therapyId}</p>
          </div>
          <button
            onClick={() => setShowEditModal(false)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="p-8">
        <form onSubmit={handleUpdateTherapy} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Info */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800 border-l-4 border-indigo-500 pl-4">Basic Information</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Therapy Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={selectedTherapy.name}
                    onChange={(e) => setSelectedTherapy({...selectedTherapy, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={selectedTherapy.category}
                    onChange={(e) => setSelectedTherapy({...selectedTherapy, category: e.target.value})}
                  >
                    {therapyCategories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (min) *</label>
                    <input
                      type="number"
                      required
                      min="15"
                      step="15"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      value={selectedTherapy.duration}
                      onChange={(e) => setSelectedTherapy({...selectedTherapy, duration: parseInt(e.target.value) || 60})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cost ($) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      value={selectedTherapy.cost}
                      onChange={(e) => setSelectedTherapy({...selectedTherapy, cost: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <div className="mt-2">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedTherapy.isActive}
                        onChange={(e) => setSelectedTherapy({...selectedTherapy, isActive: e.target.checked})}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-gray-700">Active</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Additional Details */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800 border-l-4 border-green-500 pl-4">Additional Details</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    rows="4"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={selectedTherapy.description}
                    onChange={(e) => setSelectedTherapy({...selectedTherapy, description: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Therapists Required *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      value={selectedTherapy.requiredTherapists}
                      onChange={(e) => setSelectedTherapy({...selectedTherapy, requiredTherapists: parseInt(e.target.value) || 1})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
                    <input
                      type="text"
                      disabled
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50"
                      value={selectedTherapy.updatedAt || 'N/A'}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Created At</label>
                    <input
                      type="text"
                      disabled
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50"
                      value={selectedTherapy.createdAt}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Sessions</label>
                    <input
                      type="text"
                      disabled
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50"
                      value={selectedTherapy.totalSessions || '0'}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all"
            >
              Update Therapy
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedTherapy && (
        <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border-2 border-gray-100" data-aos="zoom-in">
            <div className="p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-50 mb-6">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Delete Therapy</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-semibold text-gray-800">{selectedTherapy.name}</span>? 
                This action cannot be undone and will affect any appointments using this therapy.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTherapy}
                  className="px-6 py-3 bg-linear-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition-all"
                >
                  Delete Therapy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {showStatsModal && stats && (
        <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full my-8 border-2 border-gray-100" data-aos="zoom-in">
            <div className="sticky top-0 bg-white rounded-t-3xl border-b border-gray-100 px-8 py-6 z-10">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-800">Therapy Analytics</h3>
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 mt-2">Analytics and insights about therapy usage and performance</p>
            </div>
            
            <div className="p-8 space-y-8">
              {/* Popular Therapies */}
              <div className="bg-linear-to-r from-indigo-50 to-purple-50 rounded-2xl p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-6">Most Popular Therapies</h4>
                <div className="space-y-4">
                  {stats.popularTherapies?.length > 0 ? (
                    stats.popularTherapies.map((therapy, index) => (
                      <div key={index} className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-800 rounded-lg font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <h5 className="font-semibold text-gray-800">{therapy.therapy}</h5>
                              <p className="text-sm text-gray-500">{therapy.therapyId}</p>
                            </div>
                          </div>
                          <span className="font-bold text-lg text-purple-600">${therapy.estimatedRevenue}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{therapy.appointments} appointments</span>
                          <div className="w-48 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-linear-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                              style={{ width: `${(therapy.appointments / Math.max(...stats.popularTherapies.map(t => t.appointments))) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No therapy usage data available
                    </div>
                  )}
                </div>
              </div>

              {/* Category Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
                  <h4 className="text-lg font-semibold text-gray-800 mb-6">Category Distribution</h4>
                  <div className="space-y-4">
                    {stats.categoryDistribution?.map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-gray-700 capitalize">
                          {category._id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-gray-100 rounded-full h-2">
                            <div 
                              className="bg-linear-to-r from-green-500 to-teal-500 h-2 rounded-full"
                              style={{ width: `${(category.count / stats.categoryDistribution.reduce((sum, c) => sum + c.count, 0)) * 100}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-gray-800">{category.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-linear-to-br from-blue-50 to-cyan-50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-6">Quick Stats</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-4 text-center">
                      <p className="text-sm text-gray-500 mb-1">Total Categories</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.categoryDistribution?.length || 0}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center">
                      <p className="text-sm text-gray-500 mb-1">Total Therapies</p>
                      <p className="text-2xl font-bold text-purple-600">{therapies.length}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center">
                      <p className="text-sm text-gray-500 mb-1">Active Therapies</p>
                      <p className="text-2xl font-bold text-green-600">{therapies.filter(t => t.isActive).length}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center">
                      <p className="text-sm text-gray-500 mb-1">Avg. Cost</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        ${therapies.length > 0 
                          ? (therapies.reduce((sum, t) => sum + t.cost, 0) / therapies.length).toFixed(2)
                          : '0.00'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedTherapy && (
        <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full my-8 border-2 border-gray-100" data-aos="zoom-in">
            <div className="sticky top-0 bg-white rounded-t-3xl border-b border-gray-100 px-8 py-6 z-10">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{selectedTherapy.name}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-semibold">
                      {selectedTherapy.therapyId}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${selectedTherapy.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {selectedTherapy.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold capitalize">
                      {selectedTherapy.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-8 space-y-8">
              {/* Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-blue-600 mb-1">Duration</p>
                  <p className="text-xl font-bold text-gray-800">{formatDuration(selectedTherapy.duration)}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-purple-600 mb-1">Cost</p>
                  <p className="text-xl font-bold text-gray-800">${selectedTherapy.cost}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-green-600 mb-1">Therapists</p>
                  <p className="text-xl font-bold text-gray-800">{selectedTherapy.requiredTherapists}</p>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-yellow-600 mb-1">Equipment Items</p>
                  <p className="text-xl font-bold text-gray-800">{selectedTherapy.requiredEquipment?.length || 0}</p>
                </div>
              </div>

              {/* Description */}
              {selectedTherapy.description && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Description</h4>
                  <p className="text-gray-700 leading-relaxed">{selectedTherapy.description}</p>
                </div>
              )}

              {/* Benefits */}
              {selectedTherapy.benefits?.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Benefits</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedTherapy.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-green-500 mt-0.5 flex shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Equipment & Precautions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {selectedTherapy.requiredEquipment?.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Required Equipment</h4>
                    <div className="space-y-2">
                      {selectedTherapy.requiredEquipment.map((equipment, index) => (
                        <div key={index} className="flex items-center gap-3 bg-blue-50 rounded-lg p-3">
                          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          <span className="text-gray-700">{equipment}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTherapy.precautions?.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Precautions</h4>
                    <div className="space-y-2">
                      {selectedTherapy.precautions.map((precaution, index) => (
                        <div key={index} className="flex items-center gap-3 bg-yellow-50 rounded-lg p-3">
                          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.698-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <span className="text-gray-700">{precaution}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {selectedTherapy.preparationInstructions && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Preparation Instructions</h4>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-gray-700 whitespace-pre-line">{selectedTherapy.preparationInstructions}</p>
                    </div>
                  </div>
                )}

                {selectedTherapy.aftercareInstructions && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Aftercare Instructions</h4>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-gray-700 whitespace-pre-line">{selectedTherapy.aftercareInstructions}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    openEditModal(selectedTherapy);
                  }}
                  className="px-6 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all"
                >
                  Edit Therapy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapyManagement;