// AppointmentsPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AppointmentsPage = () => {
  // State management
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);
  const [stats, setStats] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  // Filters and search
  const [filters, setFilters] = useState({
    status: '',
    date: '',
    startDate: '',
    endDate: '',
    doctorId: '',
    patientId: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const itemsPerPage = 10;
  
  // New appointment form
  const [newAppointment, setNewAppointment] = useState({
    patient: '',
    doctor: '',
    date: '',
    time: '',
    duration: 30,
    type: 'consultation',
    purpose: '',
    priority: 'medium',
    notes: ''
  });

  useEffect(() => {
    setFadeIn(true);
    fetchAppointments();
    fetchPatients();
    fetchDoctors();
    fetchStats();
  }, [currentPage, filters]);

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'checked-in': return 'bg-purple-100 text-purple-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getMinDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    return date.toISOString().split('T')[0];
  };

  // Fixed: Fetch appointments with pagination and filters
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        ...filters
      });
      
      // Add search query if exists
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      const response = await api.get(`/appointments?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = response.data;
      
      if (data) {
        // Handle different response structures
        if (Array.isArray(data)) {
          setAppointments(data);
          setTotalAppointments(data.length);
          setTotalPages(Math.ceil(data.length / itemsPerPage));
        } else if (data.appointments || data.data) {
          const appointmentsData = data.appointments || data.data || [];
          setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
          
          // Handle pagination data
          if (data.pagination) {
            setTotalAppointments(data.pagination.total || appointmentsData.length);
            setTotalPages(data.pagination.pages || 1);
          } else {
            setTotalAppointments(appointmentsData.length);
            setTotalPages(Math.ceil(appointmentsData.length / itemsPerPage));
          }
        } else {
          setAppointments([]);
          setTotalAppointments(0);
          setTotalPages(1);
        }
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setAppointments([]);
      alert('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fixed: Fetch doctors function
  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Try multiple endpoints
      const endpoints = ['/doctors', '/doctors/all', '/users/doctors'];
      
      for (const endpoint of endpoints) {
        try {
          const response = await api.get(endpoint, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data) {
            const data = response.data;
            const doctorsData = data.doctors || data.data || data;
            
            if (Array.isArray(doctorsData)) {
              const formattedDoctors = doctorsData.map(doc => ({
                _id: doc.user?._id || doc._id || doc.id,
                doctorProfileId: doc._id || doc.id,
                name: doc.user?.name || doc.name || 'Unknown Doctor',
                email: doc.user?.email || doc.email || '',
                phone: doc.user?.phone || doc.phone || '',
                department: doc.department || 'General',
                specialization: Array.isArray(doc.specialization) ? doc.specialization : [],
                isAvailable: doc.isAvailable !== false,
                consultationFee: doc.consultationFee || 0
              }));
              
              setDoctors(formattedDoctors);
              return;
            }
          }
        } catch (err) {
          continue; // Try next endpoint
        }
      }
      
      // Fallback: Create empty doctors array
      setDoctors([]);
      console.warn('No doctors endpoint found');
      
    } catch (error) {
      console.error("Error fetching doctors:", error);
      setDoctors([]);
    }
  };

  // Fixed: Fetch patients function
  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Try multiple endpoints
      const endpoints = ['/patients', '/patients/all', '/users/patients'];
      
      for (const endpoint of endpoints) {
        try {
          const response = await api.get(endpoint, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data) {
            const data = response.data;
            const patientsData = data.patients || data.data || data;
            
            if (Array.isArray(patientsData)) {
              setPatients(patientsData);
              return;
            }
          }
        } catch (err) {
          continue; // Try next endpoint
        }
      }
      
      // Fallback: Create empty patients array
      setPatients([]);
      console.warn('No patients endpoint found');
      
    } catch (error) {
      console.error("Error fetching patients:", error);
      setPatients([]);
    }
  };

  // Fixed: Fetch stats function
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Try multiple stats endpoints
      const endpoints = [
        '/appointments/stats/dashboard',
        '/appointments/stats',
        '/appointments/dashboard/stats'
      ];
      

      for (const endpoint of endpoints) {
        try {
          const response = await api.get(endpoint, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data) {
            setStats(response.data);
            return;
          }
        } catch (err) {
          continue; // Try next endpoint
        }
      }
      
      // Fallback: Create default stats
      setStats({
        today: [
          { _id: 'scheduled', count: 0 },
          { _id: 'confirmed', count: 0 },
          { _id: 'completed', count: 0 },
          { _id: 'cancelled', count: 0 }
        ]
      });
      
    } catch (error) {
      console.warn("Stats endpoint not found, using default stats");
      setStats({
        today: [
          { _id: 'scheduled', count: 0 },
          { _id: 'confirmed', count: 0 },
          { _id: 'completed', count: 0 },
          { _id: 'cancelled', count: 0 }
        ]
      });
    }
  };

  // Fixed: Get doctor details
  const getDoctorDetails = (doctorId) => {
    if (!doctorId) return null;
    
    // Try to find doctor by _id
    let doctor = doctors.find(d => d._id === doctorId);
    
    // If not found by _id, try by doctorProfileId
    if (!doctor) {
      doctor = doctors.find(d => d.doctorProfileId === doctorId);
    }
    
    // If still not found, check if doctorId is a doctor object
    if (!doctor && doctorId && typeof doctorId === 'object') {
      return {
        _id: doctorId._id || doctorId.user?._id,
        name: doctorId.user?.name || doctorId.name,
        email: doctorId.user?.email || doctorId.email
      };
    }
    
    return doctor || null;
  };

const handleCreateAppointment = async (e) => {
  e.preventDefault();

  if (
    !newAppointment.patient ||
    !newAppointment.doctor ||
    !newAppointment.date ||
    !newAppointment.time
  ) {
    alert('Please fill all required fields');
    return;
  }

  try {
    const token = localStorage.getItem("token");

    // ✅ MATCH BACKEND FIELD NAMES
    const appointmentData = {
      patient: newAppointment.patient,   // 🔥 FIX
      doctor: newAppointment.doctor,     // 🔥 FIX
      date: newAppointment.date,
      time: newAppointment.time,
      duration: newAppointment.duration || 30,
      type: newAppointment.type || 'consultation',
      purpose: newAppointment.purpose || '',
      priority: newAppointment.priority || 'medium',
      notes: newAppointment.notes || ''
    };

    const response = await api.post(
      '/appointments',
      appointmentData,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (response.data?.success) {
      alert('Appointment created successfully!');
      setShowCreateModal(false);
      resetNewAppointmentForm();
      fetchAppointments();
      fetchStats();
    }

  } catch (error) {
    console.error(error);
    alert(
      error.response?.data?.message ||
      'Failed to create appointment'
    );
  }
};



  const resetNewAppointmentForm = () => {
    setNewAppointment({
      patient: '',
      doctor: '',
      date: '',
      time: '',
      duration: 30,
      type: 'consultation',
      purpose: '',
      priority: 'medium',
      notes: ''
    });
  };

  // Fixed: Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const applySearch = () => {
    fetchAppointments();
  };

  const applyFilters = () => {
    fetchAppointments();
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      date: '',
      startDate: '',
      endDate: '',
      doctorId: '',
      patientId: ''
    });
    setSearchQuery('');
    setCurrentPage(1);
  };

  const updateStatus = async (appointmentId, status) => {
  if (!appointmentId) {
    alert('Invalid appointment ID');
    return;
  }

  try {
    const token = localStorage.getItem("token");

    const response = await api.put(
      `/appointments/${appointmentId}/status`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data) {
      setAppointments(prev =>
        prev.map(app =>
          app._id === appointmentId
            ? { ...app, status }
            : app
        )
      );

      fetchStats();
      alert('Status updated successfully!');
    }

  } catch (error) {
    console.error(error);
    alert(
      error.response?.data?.message ||
      'Failed to update status'
    );
  }
};


  const handlePatientSelect = (patientId) => {
    setNewAppointment(prev => ({
      ...prev,
      patient: patientId
    }));
  };

  // Pagination functions
  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const renderPagination = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`px-3 py-1 rounded-lg ${currentPage === i 
            ? 'bg-blue-600 text-white' 
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }
    
    return (
      <div className="flex items-center justify-center gap-2 mt-6">
        <button
          onClick={() => goToPage(1)}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          «
        </button>
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ‹
        </button>
        
        {startPage > 1 && (
          <>
            <button
              onClick={() => goToPage(1)}
              className="px-3 py-1 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              1
            </button>
            {startPage > 2 && <span className="px-2">...</span>}
          </>
        )}
        
        {pages}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2">...</span>}
            <button
              onClick={() => goToPage(totalPages)}
              className="px-3 py-1 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {totalPages}
            </button>
          </>
        )}
        
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ›
        </button>
        <button
          onClick={() => goToPage(totalPages)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          »
        </button>
      </div>
    );
  };

  // Filter appointments locally for display
  const filteredAppointments = appointments.filter(appointment => {
    // Apply status filter
    if (filters.status && appointment.status !== filters.status) {
      return false;
    }
    
    // Apply date filter
    if (filters.date && appointment.date !== filters.date) {
      return false;
    }
    
    // Apply doctor filter
    if (filters.doctorId) {
      const doctor = getDoctorDetails(appointment.doctor);
      if (!doctor || doctor._id !== filters.doctorId) {
        return false;
      }
    }
    
    // Apply patient filter
    if (filters.patientId && appointment.patient?._id !== filters.patientId) {
      return false;
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const patientName = appointment.patient?.fullName?.toLowerCase() || 
                         `${appointment.patient?.firstName || ''} ${appointment.patient?.lastName || ''}`.toLowerCase();
      const doctor = getDoctorDetails(appointment.doctor);
      const doctorName = doctor?.name?.toLowerCase() || '';
      const purpose = appointment.purpose?.toLowerCase() || '';
      const type = appointment.type?.toLowerCase() || '';
      
      if (!patientName.includes(query) && 
          !doctorName.includes(query) && 
          !purpose.includes(query) && 
          !type.includes(query) &&
          !appointment.appointmentId?.toLowerCase().includes(query)) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <div className={`container mx-auto px-4 py-8 ${fadeIn ? 'fade-in' : ''}`}>
      {/* Header */}
      <div className="mb-8 fade-in-up">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Appointments</h1>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowStatsModal(true)}
              className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-all duration-300"
            >
              📊 View Stats
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              + New Appointment
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 fade-in-up">
        <div className="relative">
          <input
            type="text"
            placeholder="Search appointments by patient name, doctor, purpose, or ID..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            🔍
          </div>
          <button
            onClick={applySearch}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
          >
            Search
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && stats.today && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 fade-in-up">
          {stats.today.map((stat, index) => (
            <div 
              key={stat._id || index} 
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wide">{stat._id || 'Unknown'}</p>
                  <p className="text-3xl font-bold mt-2 text-gray-800">{stat.count || 0}</p>
                </div>
                <div className={`p-3 rounded-full ${getStatusColor(stat._id)}`}>
                  <span className="text-lg">📅</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8 fade-in-up">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
            >
              <option value="">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked-in">Checked In</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No Show</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
              min={getMinDate()}
              max={getTodayDate()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Doctor</label>
            <select
              name="doctorId"
              value={filters.doctorId}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
            >
              <option value="">All Doctors</option>
              {doctors.map((doc, index) => (
                <option key={doc._id || index} value={doc._id}>
                  {doc.name || `Doctor ${index + 1}`} 
                  {doc.specialization && doc.specialization.length > 0 
                    ? ` (${doc.specialization[0]})` 
                    : ''}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end gap-4">
            <button
              onClick={applyFilters}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Date Range Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
            <select
              name="patientId"
              value={filters.patientId}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
            >
              <option value="">All Patients</option>
              {Array.isArray(patients) && patients.map(patient => (
                <option key={patient._id} value={patient._id}>
                  {patient.fullName || `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || `Patient ${patient._id?.slice(-4)}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4 flex justify-between items-center">
        <div className="text-gray-600">
          Showing <span className="font-semibold">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
          <span className="font-semibold">{Math.min(currentPage * itemsPerPage, filteredAppointments.length)}</span> of{" "}
          <span className="font-semibold">{filteredAppointments.length}</span> appointments
          {searchQuery && ` for "${searchQuery}"`}
        </div>
        <div className="text-sm text-gray-500">
          Page {currentPage} of {totalPages}
        </div>
      </div>

      {/* Appointment List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden fade-in-up">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Loading appointments...</p>
          </div>
        ) : !filteredAppointments || filteredAppointments.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-lg">No appointments found</p>
            <button 
              onClick={clearFilters}
              className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors duration-300"
            >
              Clear filters to see all appointments
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Appointment ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((appointment, index) => {
                  const doc = getDoctorDetails(appointment.doctor);
                  const patient = appointment.patient || {};
                  
                  return (
                    <tr
                      key={appointment._id || index}
                      className="hover:bg-gray-50 transition-all duration-300"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Appointment ID & Type */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.appointmentId || `APT-${appointment._id?.slice(-6) || 'N/A'}`}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {appointment.type || 'consultation'}
                        </div>
                      </td>

                      {/* Patient Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex shrink-0 h-10 w-10 bg-blue-100 rounded-full items-center justify-center">
                            <span className="text-blue-600 font-bold">
                              {patient.fullName?.charAt(0) ||
                               patient.firstName?.charAt(0) ||
                               appointment.patient?.charAt(0) || 
                               'P'}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {patient.fullName ||
                               (patient.firstName && patient.lastName
                                 ? `${patient.firstName} ${patient.lastName}`
                                 : appointment.patient || 'N/A')}
                            </div>
                            <div className="text-sm text-gray-500">
                              {patient.phone || ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Doctor Info */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {doc?.name || `Dr. ${appointment.doctor?.slice(-4) || 'Unknown'}`}
                        </div>
                        <div className="text-xs text-gray-500">
                          {doc?.email || ''}
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatDate(appointment.date)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatTime(appointment.time)}
                          {appointment.duration && ` (${appointment.duration} min)`}
                        </div>
                      </td>

                      {/* Status & Priority */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status || 'scheduled'}
                        </span>
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${getPriorityColor(appointment.priority)}`}>
                            {appointment.priority || 'medium'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setShowDetailsModal(true);
                            }}
                            className="px-3 py-1 text-blue-600 hover:text-blue-900 transition-colors duration-300 bg-blue-50 hover:bg-blue-100 rounded"
                          >
                            View
                          </button>
                          <select
                            value={appointment.status || 'scheduled'}
                            onChange={(e) => updateStatus(appointment._id, e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                          >
                            <option value="scheduled">Scheduled</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="checked-in">Check In</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Complete</option>
                            <option value="cancelled">Cancel</option>
                            <option value="no-show">No Show</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {/* Pagination */}
            {renderPagination()}
          </div>
        )}
      </div>

      {/* Create Appointment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">Create New Appointment</h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetNewAppointmentForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-300 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <form onSubmit={handleCreateAppointment}>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Patient Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient <span className="text-red-500">*</span>
                    </label>
                    {patients.length > 0 ? (
                      <select
                        required
                        value={newAppointment.patient}
                        onChange={(e) => handlePatientSelect(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      >
                        <option value="">Select Patient</option>
                        {patients.map(patient => (
                          <option key={patient._id} value={patient._id}>
                            {patient.fullName || `${patient.firstName || ''} ${patient.lastName || ''}`.trim()}
                            {patient.patientId ? ` (${patient.patientId})` : ''}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-red-500 text-sm">
                        No patients found. Please add patients first.
                      </div>
                    )}
                  </div>
                  
                  {/* Doctor Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Doctor <span className="text-red-500">*</span>
                    </label>

                    {doctors.length > 0 ? (
                      <select
                        required
                        value={newAppointment.doctor}
                        onChange={(e) =>
                          setNewAppointment(prev => ({
                            ...prev,
                            doctor: e.target.value
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                                  transition-all duration-300"
                      >
                        <option value="">Select Doctor</option>
                        {doctors.map((doctor) => (
                          <option key={doctor._id} value={doctor._id}>
                            Dr. {doctor.name}
                            {doctor.specialization && doctor.specialization.length > 0 
                              ? ` - ${doctor.specialization[0]}` 
                              : ''}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-red-500 text-sm">
                        No doctors found. Please add doctors first.
                      </div>
                    )}
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={newAppointment.date}
                      onChange={(e) => setNewAppointment(prev => ({...prev, date: e.target.value}))}
                      min={getTodayDate()}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    />
                  </div>
                  
                  {/* Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      required
                      value={newAppointment.time}
                      onChange={(e) => setNewAppointment(prev => ({...prev, time: e.target.value}))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    />
                  </div>
                  
                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={newAppointment.type}
                      onChange={(e) => setNewAppointment(prev => ({...prev, type: e.target.value}))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    >
                      <option value="consultation">Consultation</option>
                      <option value="follow-up">Follow-up</option>
                      <option value="therapy">Therapy</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>
                  
                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      value={newAppointment.priority}
                      onChange={(e) => setNewAppointment(prev => ({...prev, priority: e.target.value}))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>
                  
                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                    <select
                      value={newAppointment.duration}
                      onChange={(e) => setNewAppointment(prev => ({...prev, duration: parseInt(e.target.value)}))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="90">90 minutes</option>
                    </select>
                  </div>
                  
                  {/* Purpose */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Purpose</label>
                    <input
                      type="text"
                      value={newAppointment.purpose}
                      onChange={(e) => setNewAppointment(prev => ({...prev, purpose: e.target.value}))}
                      placeholder="Brief description of appointment purpose"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    />
                  </div>
                  
                  {/* Notes */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      value={newAppointment.notes}
                      onChange={(e) => setNewAppointment(prev => ({...prev, notes: e.target.value}))}
                      placeholder="Additional notes..."
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 flex justify-end gap-4 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetNewAppointmentForm();
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={patients.length === 0 || doctors.length === 0}
                  className={`px-6 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg ${
                    patients.length === 0 || doctors.length === 0
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {patients.length === 0 || doctors.length === 0 
                    ? 'Add Data First' 
                    : 'Create Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">Appointment Statistics</h3>
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-300 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Weekly Overview</h4>
                <div className="bg-gray-50 p-4 rounded-xl">
                  {stats && stats.weekly && stats.weekly.length > 0 ? (
                    <div className="flex items-end h-32 gap-2">
                      {stats.weekly.map((day, index) => (
                        <div key={day._id || index} className="flex-1 flex flex-col items-center">
                          <div 
                            className="w-full bg-blue-500 rounded-t-lg transition-all duration-500 hover:bg-blue-600"
                            style={{ 
                              height: stats.weekly.length > 0 
                                ? `${Math.min(100, (day.count / Math.max(...stats.weekly.map(d => d.count))) * 100)}%` 
                                : '0%'
                            }}
                          ></div>
                          <div className="mt-2 text-xs text-gray-600">
                            {day._id ? day._id.split('-')[2] : `Day ${index + 1}`}
                          </div>
                          <div className="text-xs font-semibold">{day.count || 0}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No weekly data available</p>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Top Doctors</h4>
                <div className="space-y-4">
                  {stats && stats.topDoctors && stats.topDoctors.length > 0 ? (
                    stats.topDoctors.map((doctor, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                            <span className="text-blue-600 font-bold">D</span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">{doctor.doctor || `Doctor ${index + 1}`}</div>
                            <div className="text-sm text-gray-600">
                              Completion Rate: {doctor.totalAppointments && doctor.completedAppointments 
                                ? `${((doctor.completedAppointments / doctor.totalAppointments) * 100).toFixed(1)}%`
                                : '0%'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-800">{doctor.totalAppointments || 0} total</div>
                          <div className="text-sm text-green-600">{doctor.completedAppointments || 0} completed</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No doctor statistics available</p>
                  )}
                </div>
              </div>

              {/* Today's Stats */}
              {stats && stats.today && stats.today.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Today's Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.today.map((stat, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-2 ${getStatusColor(stat._id)}`}>
                          {stat._id || 'Unknown'}
                        </div>
                        <div className="text-2xl font-bold text-gray-800">{stat.count || 0}</div>
                        <div className="text-sm text-gray-600">appointments</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Appointment Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    Appointment #{selectedAppointment.appointmentId || `APT-${selectedAppointment._id?.slice(-6)}`}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedAppointment.createdAt 
                      ? `Created on ${formatDate(selectedAppointment.createdAt)}`
                      : 'Appointment details'}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-300 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Patient Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-blue-600 font-bold text-lg">
                          {selectedAppointment.patient?.fullName?.charAt(0) || 
                           selectedAppointment.patient?.firstName?.charAt(0) || 
                           'P'}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">
                          {selectedAppointment.patient?.fullName || 
                           (selectedAppointment.patient?.firstName && selectedAppointment.patient?.lastName
                            ? `${selectedAppointment.patient.firstName} ${selectedAppointment.patient.lastName}`
                            : 'Unknown Patient')}
                        </div>
                        <div className="text-sm text-gray-600">
                          ID: {selectedAppointment.patient?.patientId || 'N/A'}
                        </div>
                      </div>
                    </div>
                    {selectedAppointment.patient?.phone && (
                      <div className="text-sm text-gray-600 mb-1">
                        📞 {selectedAppointment.patient.phone}
                      </div>
                    )}
                    {selectedAppointment.patient?.email && (
                      <div className="text-sm text-gray-600">
                        ✉️ {selectedAppointment.patient.email}
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Doctor Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="font-semibold text-gray-800 mb-2">
                      {selectedAppointment.doctor?.name 
                        ? `Dr. ${selectedAppointment.doctor.name}`
                        : 'Unknown Doctor'}
                    </div>
                    {selectedAppointment.doctor?.email && (
                      <div className="text-sm text-gray-600 mb-1">
                        ✉️ {selectedAppointment.doctor.email}
                      </div>
                    )}
                    {selectedAppointment.doctor?.phone && (
                      <div className="text-sm text-gray-600">
                        📞 {selectedAppointment.doctor.phone}
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Appointment Details</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{formatDate(selectedAppointment.date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">{formatTime(selectedAppointment.time)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{selectedAppointment.duration || 30} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium capitalize">{selectedAppointment.type || 'consultation'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Status & Priority</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAppointment.status)}`}>
                        {selectedAppointment.status || 'scheduled'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Priority:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedAppointment.priority)}`}>
                        {selectedAppointment.priority || 'medium'}
                      </span>
                    </div>
                    {selectedAppointment.cancellationReason && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-sm text-gray-600 mb-1">Cancellation Reason:</div>
                        <div className="text-sm text-gray-800">{selectedAppointment.cancellationReason}</div>
                      </div>
                    )}
                  </div>
                </div>
                
                {selectedAppointment.purpose && (
                  <div className="md:col-span-2">
                    <h4 className="font-medium text-gray-700 mb-2">Purpose</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-800">{selectedAppointment.purpose}</p>
                    </div>
                  </div>
                )}
                
                {selectedAppointment.notes && (
                  <div className="md:col-span-2">
                    <h4 className="font-medium text-gray-700 mb-2">Notes</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-800">{selectedAppointment.notes}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Action buttons */}
              <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end gap-4">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    if (selectedAppointment._id) {
                      updateStatus(selectedAppointment._id, 'completed');
                      setShowDetailsModal(false);
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300"
                >
                  Mark as Completed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;