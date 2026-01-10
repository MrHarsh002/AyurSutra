// TreatmentsPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TreatmentsPage = () => {
  // State management
  const [treatments, setTreatments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [therapies, setTherapies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);
  const [stats, setStats] = useState(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    patientId: '',
    doctorId: '',
    status: '',
    startDate: '',
    endDate: ''
  });
  
  // New treatment form
  const [newTreatment, setNewTreatment] = useState({
    patient: '',
    diagnosis: '',
    chiefComplaints: [''],
    symptoms: [''],
    pulse: { vata: '', pitta: '', kapha: '' },
    tongueExamination: '',
    prakriti: '',
    doshaImbalance: [''],
    prescribedTherapies: [],
    medicines: [{
      name: '',
      dosage: '250mg',
      frequency: 'once daily',
      duration: '3 days',
      beforeMeal: false,
      instructions: 'before meals'
    }],
    dietRecommendations: [''],
    lifestyleChanges: [''],
    yogaRecommendations: [''],
    followUpDate: '',
    notes: ''
  });
  
  // Form errors
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFadeIn(true);
    fetchTreatments();
    fetchPatients();
    fetchDoctors();
    fetchTherapies();
    fetchStats();
  }, [pagination.page, filters]);

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

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ongoing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'follow-up': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!newTreatment.patient) newErrors.patient = 'Patient is required';
    if (!newTreatment.diagnosis?.trim()) newErrors.diagnosis = 'Diagnosis is required';
    
    // Validate medicines
    newTreatment.medicines.forEach((med, index) => {
      if (!med.name?.trim()) {
        newErrors[`medicines_${index}_name`] = 'Medicine name is required';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Data fetching functions
  const fetchTreatments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      
      const response = await api.get("/treatments", {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const treatmentsData = response.data?.treatments || response.data?.data || [];
      setTreatments(Array.isArray(treatmentsData) ? treatmentsData : []);
      
      if (response.data) {
        setPagination(prev => ({
          ...prev,
          total: response.data.total || 0,
          totalPages: response.data.totalPages || 1,
          currentPage: response.data.currentPage || 1
        }));
      }
    } catch (error) {
      console.error("Error fetching treatments:", error);
      toast.error('Failed to load treatments');
      setTreatments([]);
    } finally {
      setLoading(false);
    }
  };

//................Fetch all data patients........................
  const fetchPatients = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get("/patients", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const patientsData =
      response.data?.patients ||
      response.data?.data ||
      response.data ||
      [];

    const normalized = Array.isArray(patientsData)
      ? patientsData.map(p => ({
          _id: p._id,
          patientId: p.patientId,
          firstName:
            p.firstName ||
            p.user?.firstName ||
            p.fullName?.split(" ")[0] ||
            "",
          lastName:
            p.lastName ||
            p.user?.lastName ||
            p.fullName?.split(" ")[1] ||
            "",
          fullName:
            p.fullName ||
            `${p.firstName || ""} ${p.lastName || ""}`.trim(),
        }))
      : [];

    setPatients(normalized);
  } catch (error) {
    console.error("Error fetching patients:", error);
    toast.error("Failed to load patients");
    setPatients([]);
  }
};

  // FIXED: fetchDoctors function
  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // First try to fetch from /doctors endpoint
      try {
        const response = await api.get("/doctors", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Check response structure
        const doctorsData = response.data?.doctors || response.data?.data || response.data;
        
        const formattedDoctors = Array.isArray(doctorsData) ? doctorsData.map(doc => ({
          _id: doc.user?._id || doc._id, // Use user._id if available, otherwise doctor._id
          doctorProfileId: doc._id,
          name: doc.user?.name || doc.name || 'Unknown Doctor',
          email: doc.user?.email || doc.email || '',
          phone: doc.user?.phone || doc.phone || '',
          department: doc.department || 'General',
          specialization: doc.specialization || [],
          isAvailable: doc.isAvailable !== false,
          consultationFee: doc.consultationFee || 0
        })) : [];
        
        setDoctors(formattedDoctors);
        return;
      } catch (error) {
        console.log("Primary doctors fetch failed, trying alternative...");
      }
      
      // Fallback: fetch users and filter doctors
      const usersResponse = await api.get("/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const users = usersResponse.data?.data || usersResponse.data || [];
      const doctorUsers = users.filter(user => user.role === 'doctor') || [];
      
      const doctorsWithProfiles = await Promise.all(
        doctorUsers.map(async (user) => {
          try {
            const doctorProfile = await api.get(`/doctors/user/${user._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            return {
              _id: user._id,
              doctorProfileId: doctorProfile.data?._id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              department: doctorProfile.data?.department || 'General',
              specialization: doctorProfile.data?.specialization || [],
              isAvailable: doctorProfile.data?.isAvailable !== false,
              consultationFee: doctorProfile.data?.consultationFee || 0
            };
          } catch (error) {
            return {
              _id: user._id,
              doctorProfileId: user._id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              department: 'General',
              specialization: [],
              isAvailable: true,
              consultationFee: 0
            };
          }
        })
      );
      
      setDoctors(doctorsWithProfiles);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      setDoctors([]);
    }
  };


  const fetchTherapies = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/therapies", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const therapiesData = response.data?.therapies || response.data?.data || response.data || [];
      setTherapies(Array.isArray(therapiesData) ? therapiesData : []);
    } catch (error) {
      console.error("Error fetching therapies:", error);
      toast.error('Failed to load therapies');
      setTherapies([]);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/treatments/stats/overview", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Form handlers
  const handleCreateTreatment = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix form errors');
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      
      // Filter out empty array values
      const treatmentData = {
        ...newTreatment,
        chiefComplaints: newTreatment.chiefComplaints.filter(c => c.trim()),
        symptoms: newTreatment.symptoms.filter(s => s.trim()),
        doshaImbalance: newTreatment.doshaImbalance.filter(d => d.trim()),
        dietRecommendations: newTreatment.dietRecommendations.filter(d => d.trim()),
        lifestyleChanges: newTreatment.lifestyleChanges.filter(l => l.trim()),
        yogaRecommendations: newTreatment.yogaRecommendations.filter(y => y.trim()),
        medicines: newTreatment.medicines.filter(m => m.name.trim())
      };
      
      const response = await api.post('/treatments', treatmentData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        toast.success('Treatment created successfully!');
        setShowCreateModal(false);
        resetNewTreatmentForm();
        fetchTreatments();
        fetchStats();
      } else {
        toast.error(response.data.message || 'Failed to create treatment');
      }
    } catch (error) {
      console.error('Error creating treatment:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to create treatment';
      toast.error(errorMessage);
    }
  };

  const handleUpdateTreatment = async (e) => {
    e.preventDefault();
    
    if (!selectedTreatment?._id) {
      toast.error('No treatment selected for update');
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      const response = await api.put(`/treatments/${selectedTreatment._id}`, selectedTreatment, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        toast.success('Treatment updated successfully!');
        setShowEditModal(false);
        setSelectedTreatment(null);
        fetchTreatments();
        fetchStats();
      } else {
        toast.error(response.data.message || 'Failed to update treatment');
      }
    } catch (error) {
      console.error('Error updating treatment:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to update treatment';
      toast.error(errorMessage);
    }
  };

  const handleUpdateStatus = async (treatmentId, status, followUpDate) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.put(`/treatments/${treatmentId}/status`, 
        { status, followUpDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success('Treatment status updated!');
        fetchTreatments();
        fetchStats();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const resetNewTreatmentForm = () => {
    setNewTreatment({
      patient: '',
      diagnosis: '',
      chiefComplaints: [''],
      symptoms: [''],
      pulse: { vata: '', pitta: '', kapha: '' },
      tongueExamination: '',
      prakriti: '',
      doshaImbalance: [''],
      prescribedTherapies: [],
      medicines: [{
        name: '',
        dosage: '250mg',
        frequency: 'once daily',
        duration: '3 days',
        beforeMeal: false,
        instructions: 'before meals'
      }],
      dietRecommendations: [''],
      lifestyleChanges: [''],
      yogaRecommendations: [''],
      followUpDate: '',
      notes: ''
    });
    setErrors({});
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const applyFilters = () => {
    fetchTreatments();
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      patientId: '',
      doctorId: '',
      status: '',
      startDate: '',
      endDate: ''
    });
    fetchTreatments();
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  // Array field handlers
  const addArrayField = (fieldName, defaultValue = '') => {
    setNewTreatment(prev => ({
      ...prev,
      [fieldName]: [...prev[fieldName], defaultValue]
    }));
  };

  const updateArrayField = (fieldName, index, value) => {
    setNewTreatment(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].map((item, i) => i === index ? value : item)
    }));
  };

  const removeArrayField = (fieldName, index) => {
    setNewTreatment(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index)
    }));
  };

  // Medicine handlers
  const addMedicine = () => {
    setNewTreatment(prev => ({
      ...prev,
      medicines: [...prev.medicines, {
        name: '',
        dosage: '250mg',
        frequency: 'once daily',
        duration: '3 days',
        beforeMeal: false,
        instructions: 'before meals'
      }]
    }));
  };

  const updateMedicine = (index, field, value) => {
    setNewTreatment(prev => ({
      ...prev,
      medicines: prev.medicines.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const removeMedicine = (index) => {
    setNewTreatment(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }));
  };

  // Therapy handlers
  const addTherapy = () => {
    setNewTreatment(prev => ({
      ...prev,
      prescribedTherapies: [...prev.prescribedTherapies, {
        therapy: '',
        sessions: 1,
        duration: 30,
        instructions: ''
      }]
    }));
  };

  const updateTherapy = (index, field, value) => {
    setNewTreatment(prev => ({
      ...prev,
      prescribedTherapies: prev.prescribedTherapies.map((therapy, i) => 
        i === index ? { ...therapy, [field]: value } : therapy
      )
    }));
  };

  const removeTherapy = (index) => {
    setNewTreatment(prev => ({
      ...prev,
      prescribedTherapies: prev.prescribedTherapies.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className={`container mx-auto px-4 py-8 ${fadeIn ? 'fade-in' : ''}`}>
      {/* Header */}
      <div className="mb-8 fade-in-up">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Ayurvedic Treatments</h1>
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
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              + New Treatment
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && stats.statusDistribution && stats.statusDistribution.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 fade-in-up">
          {stats.statusDistribution.map((stat, index) => (
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
                  <span className="text-lg">💊</span>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by diagnosis or treatment ID"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
            >
              <option value="">All Status</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="follow-up">Follow-up</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
            <select
              name="patientId"
              value={filters.patientId}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
            >
              <option value="">All Patients</option>
              {patients.map(patient => (
                <option key={patient._id} value={patient._id}>
                  {patient.fullName} ({patient.patientId || 'N/A'})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Doctor</label>
            <select
              name="doctorId"
              value={filters.doctorId}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
            >
              <option value="">All Doctors</option>
              {doctors.map(doc => (
                <option key={doc._id} value={doc._id}>
                  Dr. {doc.name}
                </option>
              ))}
            </select>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
            />
          </div>
          <div className="flex items-end gap-4">
            <button
              onClick={applyFilters}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300"
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
      </div>

      {/* Treatments List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden fade-in-up mb-8">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            <p className="mt-4 text-gray-600">Loading treatments...</p>
          </div>
        ) : !treatments || treatments.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-lg">No treatments found</p>
            <button 
              onClick={clearFilters}
              className="mt-4 px-4 py-2 text-green-600 hover:text-green-800 transition-colors duration-300"
            >
              Clear filters to see all treatments
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Treatment ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diagnosis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {treatments.map((treatment, index) => {
                  const patient = treatment.patient || {};
                  const doctor = treatment.doctor || {};
                  
                  return (
                    <tr
                      key={treatment._id || index}
                      className="hover:bg-gray-50 transition-all duration-300"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Treatment ID */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {treatment.treatmentId || `TRT-${treatment._id?.slice(-6) || 'N/A'}`}
                        </div>
                      </td>

                      {/* Patient Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex shrink-0 h-10 w-10 bg-green-100 rounded-full items-center justify-center">
                            <span className="text-green-600 font-bold">
                              {patient.firstName?.charAt(0) || 'P'}
                            </span>
                          </div>

                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {patient.firstName || 'Unknown Patient'}
                            </div>

                            <div className="text-xs text-gray-500">
                              {patient.patientId || ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Doctor Info */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {doctor.name ? `Dr. ${doctor.name}` : 'Unknown Doctor'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {doctor.specialization || ''}
                        </div>
                      </td>

                      {/* Diagnosis */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {treatment.diagnosis || 'No diagnosis'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {treatment.prakriti && `Prakriti: ${treatment.prakriti}`}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(treatment.status)}`}>
                          {treatment.status || 'ongoing'}
                        </span>
                        {treatment.followUpDate && (
                          <div className="text-xs text-gray-500 mt-1">
                            Follow-up: {formatDate(treatment.followUpDate)}
                          </div>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatDate(treatment.createdAt)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedTreatment(treatment);
                              setShowViewModal(true);
                            }}
                            className="px-3 py-1 text-green-600 hover:text-green-900 transition-colors duration-300 bg-green-50 hover:bg-green-100 rounded"
                            title="View Details"
                          >
                            👁️ View
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTreatment(treatment);
                              setShowEditModal(true);
                            }}
                            className="px-3 py-1 text-blue-600 hover:text-blue-900 transition-colors duration-300 bg-blue-50 hover:bg-blue-100 rounded"
                            title="Edit Treatment"
                          >
                            ✏️ Edit
                          </button>
                          <select
                            value={treatment.status || 'ongoing'}
                            onChange={(e) => handleUpdateStatus(treatment._id, e.target.value, treatment.followUpDate)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                          >
                            <option value="ongoing">Ongoing</option>
                            <option value="completed">Complete</option>
                            <option value="follow-up">Follow-up</option>
                            <option value="cancelled">Cancel</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {treatments.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{" "}
                of <span className="font-medium">{pagination.total}</span> results
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`px-3 py-1 rounded-md ${
                    pagination.page === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                  }`}
                >
                  Previous
                </button>
                {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded-md ${
                        pagination.page === pageNum
                          ? "bg-green-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className={`px-3 py-1 rounded-md ${
                    pagination.page === pagination.totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Treatment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">Create New Treatment</h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetNewTreatmentForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-300 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <form onSubmit={handleCreateTreatment}>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Patient Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient <span className="text-red-500">*</span>
                    </label>
                    {patients.length > 0 ? (
                      <select
                        required
                        value={newTreatment.patient}
                        onChange={(e) => setNewTreatment(prev => ({ ...prev, patient: e.target.value }))}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 ${
                          errors.patient ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select Patient</option>
                        {patients.map(patient => (
                          <option key={patient._id} value={patient._id}>
                            {patient.firstName} 
                            {patient.patientId ? ` (${patient.patientId})` : ''}
                            {patient.age ? `, ${patient.age} years` : ''}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-red-500 text-sm">
                        No patients found. Please add patients first.
                      </div>
                    )}
                    {errors.patient && (
                      <p className="mt-1 text-sm text-red-600">{errors.patient}</p>
                    )}
                  </div>
                  
                  {/* Diagnosis */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Diagnosis <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newTreatment.diagnosis}
                      onChange={(e) => setNewTreatment(prev => ({ ...prev, diagnosis: e.target.value }))}
                      placeholder="Enter diagnosis"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 ${
                        errors.diagnosis ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.diagnosis && (
                      <p className="mt-1 text-sm text-red-600">{errors.diagnosis}</p>
                    )}
                  </div>
                </div>

                {/* Chief Complaints */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700">Chief Complaints</label>
                    <button
                      type="button"
                      onClick={() => addArrayField('chiefComplaints')}
                      className="text-sm text-green-600 hover:text-green-800 transition-colors duration-300"
                    >
                      + Add Complaint
                    </button>
                  </div>
                  <div className="space-y-3">
                    {newTreatment.chiefComplaints.map((complaint, index) => (
                      <div key={index} className="flex gap-3">
                        <input
                          type="text"
                          value={complaint}
                          onChange={(e) => updateArrayField('chiefComplaints', index, e.target.value)}
                          placeholder="Enter chief complaint"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                        />
                        {newTreatment.chiefComplaints.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayField('chiefComplaints', index)}
                            className="px-3 py-2 text-red-600 hover:text-red-800 transition-colors duration-300"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Symptoms */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700">Symptoms</label>
                    <button
                      type="button"
                      onClick={() => addArrayField('symptoms')}
                      className="text-sm text-green-600 hover:text-green-800 transition-colors duration-300"
                    >
                      + Add Symptom
                    </button>
                  </div>
                  <div className="space-y-3">
                    {newTreatment.symptoms.map((symptom, index) => (
                      <div key={index} className="flex gap-3">
                        <input
                          type="text"
                          value={symptom}
                          onChange={(e) => updateArrayField('symptoms', index, e.target.value)}
                          placeholder="Enter symptom"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                        />
                        {newTreatment.symptoms.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayField('symptoms', index)}
                            className="px-3 py-2 text-red-600 hover:text-red-800 transition-colors duration-300"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ayurvedic Examination */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Ayurvedic Examination</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Vata Pulse</label>
                      <input
                        type="text"
                        value={newTreatment.pulse.vata}
                        onChange={(e) => setNewTreatment(prev => ({ 
                          ...prev, 
                          pulse: { ...prev.pulse, vata: e.target.value } 
                        }))}
                        placeholder="Vata"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pitta Pulse</label>
                      <input
                        type="text"
                        value={newTreatment.pulse.pitta}
                        onChange={(e) => setNewTreatment(prev => ({ 
                          ...prev, 
                          pulse: { ...prev.pulse, pitta: e.target.value } 
                        }))}
                        placeholder="Pitta"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Kapha Pulse</label>
                      <input
                        type="text"
                        value={newTreatment.pulse.kapha}
                        onChange={(e) => setNewTreatment(prev => ({ 
                          ...prev, 
                          pulse: { ...prev.pulse, kapha: e.target.value } 
                        }))}
                        placeholder="Kapha"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tongue Examination</label>
                      <textarea
                        value={newTreatment.tongueExamination}
                        onChange={(e) => setNewTreatment(prev => ({ ...prev, tongueExamination: e.target.value }))}
                        placeholder="Tongue coating, color, etc."
                        rows="2"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Prakriti</label>
                      <select
                        value={newTreatment.prakriti}
                        onChange={(e) => setNewTreatment(prev => ({ ...prev, prakriti: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                      >
                        <option value="">Select Prakriti</option>
                        <option value="vata">Vata</option>
                        <option value="pitta">Pitta</option>
                        <option value="kapha">Kapha</option>
                        <option value="vata-pitta">Vata-Pitta</option>
                        <option value="vata-kapha">Vata-Kapha</option>
                        <option value="pitta-kapha">Pitta-Kapha</option>
                        <option value="sama">Sama</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Dosha Imbalance */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700">Dosha Imbalance</label>
                    <button
                      type="button"
                      onClick={() => addArrayField('doshaImbalance')}
                      className="text-sm text-green-600 hover:text-green-800 transition-colors duration-300"
                    >
                      + Add Dosha Imbalance
                    </button>
                  </div>
                  <div className="space-y-3">
                    {newTreatment.doshaImbalance.map((dosha, index) => (
                      <div key={index} className="flex gap-3">
                        <input
                          type="text"
                          value={dosha}
                          onChange={(e) => updateArrayField('doshaImbalance', index, e.target.value)}
                          placeholder="Enter dosha imbalance"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                        />
                        {newTreatment.doshaImbalance.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayField('doshaImbalance', index)}
                            className="px-3 py-2 text-red-600 hover:text-red-800 transition-colors duration-300"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prescribed Therapies */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-gray-800">Prescribed Therapies</h4>
                    <button
                      type="button"
                      onClick={addTherapy}
                      className="text-sm text-green-600 hover:text-green-800 transition-colors duration-300"
                    >
                      + Add Therapy
                    </button>
                  </div>
                  <div className="space-y-4">
                    {newTreatment.prescribedTherapies.map((therapy, index) => (
                      <div key={index} className="p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-3">
                          <h5 className="font-medium text-gray-700">Therapy #{index + 1}</h5>
                          <button
                            type="button"
                            onClick={() => removeTherapy(index)}
                            className="text-red-600 hover:text-red-800 transition-colors duration-300"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Therapy</label>
                            <select
                              value={therapy.therapy}
                              onChange={(e) => updateTherapy(index, 'therapy', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                            >
                              <option value="">Select Therapy</option>
                              {therapies.map(th => (
                                <option key={th._id} value={th._id}>
                                  {th.name} ({th.duration} min)
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sessions</label>
                            <input
                              type="number"
                              min="1"
                              value={therapy.sessions}
                              onChange={(e) => updateTherapy(index, 'sessions', parseInt(e.target.value))}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                            <input
                              type="number"
                              min="15"
                              step="15"
                              value={therapy.duration}
                              onChange={(e) => updateTherapy(index, 'duration', parseInt(e.target.value))}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
                            <input
                              type="text"
                              value={therapy.instructions}
                              onChange={(e) => updateTherapy(index, 'instructions', e.target.value)}
                              placeholder="Special instructions"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Medicines */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-gray-800">Medicines</h4>
                    <button
                      type="button"
                      onClick={addMedicine}
                      className="text-sm text-green-600 hover:text-green-800 transition-colors duration-300"
                    >
                      + Add Medicine
                    </button>
                  </div>
                  <div className="space-y-4">
                    {newTreatment.medicines.map((medicine, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                          <h5 className="font-medium text-gray-700">Medicine #{index + 1}</h5>
                          {newTreatment.medicines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeMedicine(index)}
                              className="text-red-600 hover:text-red-800 transition-colors duration-300"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={medicine.name}
                              onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                              placeholder="Medicine name"
                              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 ${
                                errors[`medicines_${index}_name`] ? 'border-red-500' : 'border-gray-300'
                              }`}
                            />
                            {errors[`medicines_${index}_name`] && (
                              <p className="mt-1 text-sm text-red-600">{errors[`medicines_${index}_name`]}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Dosage</label>
                            <select
                              value={medicine.dosage}
                              onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                            >
                              <option value="250mg">250mg</option>
                              <option value="500mg">500mg</option>
                              <option value="1g">1g</option>
                              <option value="5ml">5ml</option>
                              <option value="10ml">10ml</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                            <select
                              value={medicine.frequency}
                              onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                            >
                              <option value="once daily">Once Daily</option>
                              <option value="twice daily">Twice Daily</option>
                              <option value="thrice daily">Thrice Daily</option>
                              <option value="as needed">As Needed</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                            <select
                              value={medicine.duration}
                              onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                            >
                              <option value="3 days">3 Days</option>
                              <option value="5 days">5 Days</option>
                              <option value="7 days">7 Days</option>
                              <option value="10 days">10 Days</option>
                              <option value="15 days">15 Days</option>
                              <option value="1 month">1 Month</option>
                            </select>
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
                            <select
                              value={medicine.instructions}
                              onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                            >
                              <option value="before meals">Before Meals</option>
                              <option value="after meals">After Meals</option>
                              <option value="with warm water">With Warm Water</option>
                              <option value="with milk">With Milk</option>
                              <option value="at bedtime">At Bedtime</option>
                            </select>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`beforeMeal-${index}`}
                              checked={medicine.beforeMeal}
                              onChange={(e) => updateMedicine(index, 'beforeMeal', e.target.checked)}
                              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`beforeMeal-${index}`} className="ml-2 text-sm text-gray-700">
                              Before Meal
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Diet Recommendations */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <label className="block text-sm font-medium text-gray-700">Diet Recommendations</label>
                        <button
                          type="button"
                          onClick={() => addArrayField('dietRecommendations')}
                          className="text-sm text-green-600 hover:text-green-800 transition-colors duration-300"
                        >
                          + Add
                        </button>
                      </div>
                      <div className="space-y-3">
                        {newTreatment.dietRecommendations.map((recommendation, index) => (
                          <div key={index} className="flex gap-3">
                            <input
                              type="text"
                              value={recommendation}
                              onChange={(e) => updateArrayField('dietRecommendations', index, e.target.value)}
                              placeholder="Diet recommendation"
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                            />
                            {newTreatment.dietRecommendations.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeArrayField('dietRecommendations', index)}
                                className="px-3 py-2 text-red-600 hover:text-red-800 transition-colors duration-300"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Lifestyle Changes */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <label className="block text-sm font-medium text-gray-700">Lifestyle Changes</label>
                        <button
                          type="button"
                          onClick={() => addArrayField('lifestyleChanges')}
                          className="text-sm text-green-600 hover:text-green-800 transition-colors duration-300"
                        >
                          + Add
                        </button>
                      </div>
                      <div className="space-y-3">
                        {newTreatment.lifestyleChanges.map((change, index) => (
                          <div key={index} className="flex gap-3">
                            <input
                              type="text"
                              value={change}
                              onChange={(e) => updateArrayField('lifestyleChanges', index, e.target.value)}
                              placeholder="Lifestyle change"
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                            />
                            {newTreatment.lifestyleChanges.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeArrayField('lifestyleChanges', index)}
                                className="px-3 py-2 text-red-600 hover:text-red-800 transition-colors duration-300"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Yoga Recommendations */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700">Yoga Recommendations</label>
                    <button
                      type="button"
                      onClick={() => addArrayField('yogaRecommendations')}
                      className="text-sm text-green-600 hover:text-green-800 transition-colors duration-300"
                    >
                      + Add
                    </button>
                  </div>
                  <div className="space-y-3">
                    {newTreatment.yogaRecommendations.map((yoga, index) => (
                      <div key={index} className="flex gap-3">
                        <input
                          type="text"
                          value={yoga}
                          onChange={(e) => updateArrayField('yogaRecommendations', index, e.target.value)}
                          placeholder="Yoga pose or practice"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                        />
                        {newTreatment.yogaRecommendations.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayField('yogaRecommendations', index)}
                            className="px-3 py-2 text-red-600 hover:text-red-800 transition-colors duration-300"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Follow-up & Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Date</label>
                    <input
                      type="date"
                      value={newTreatment.followUpDate}
                      onChange={(e) => setNewTreatment(prev => ({ ...prev, followUpDate: e.target.value }))}
                      min={getTodayDate()}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      value={newTreatment.notes}
                      onChange={(e) => setNewTreatment(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes..."
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 flex justify-end gap-4 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetNewTreatmentForm();
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={patients.length === 0}
                  className={`px-6 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg ${
                    patients.length === 0
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {patients.length === 0 
                    ? 'Add Patients First' 
                    : 'Create Treatment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Treatment Modal */}
      {showEditModal && selectedTreatment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">
                  Edit Treatment: {selectedTreatment.treatmentId}
                </h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedTreatment(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-300 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <form onSubmit={handleUpdateTreatment}>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Patient Info (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
                    <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-300">
                      <p className="text-gray-900 font-medium">
                        {selectedTreatment.patient?.fullName || 'Unknown Patient'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {selectedTreatment.patient?.patientId || 'No ID'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Doctor Info (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Doctor</label>
                    <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-300">
                      <p className="text-gray-900 font-medium">
                        Dr. {selectedTreatment.doctor?.name || 'Unknown Doctor'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {selectedTreatment.doctor?.specialization || 'No specialization'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Diagnosis */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis</label>
                    <input
                      type="text"
                      value={selectedTreatment.diagnosis || ''}
                      onChange={(e) => setSelectedTreatment(prev => ({ ...prev, diagnosis: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Status Update */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Treatment Status</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={selectedTreatment.status || 'ongoing'}
                        onChange={(e) => setSelectedTreatment(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                      >
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                        <option value="follow-up">Follow-up</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Date</label>
                      <input
                        type="date"
                        value={selectedTreatment.followUpDate ? new Date(selectedTreatment.followUpDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => setSelectedTreatment(prev => ({ ...prev, followUpDate: e.target.value }))}
                        min={getTodayDate()}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Notes Update */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={selectedTreatment.notes || ''}
                    onChange={(e) => setSelectedTreatment(prev => ({ ...prev, notes: e.target.value }))}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                  />
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 flex justify-end gap-4 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedTreatment(null);
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Update Treatment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Treatment Details Modal */}
      {showViewModal && selectedTreatment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    Treatment: {selectedTreatment.treatmentId}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Created on {formatDateTime(selectedTreatment.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedTreatment(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-300 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">Patient Information</h4>
                  <div className="flex items-center mb-3">
                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-green-600 font-bold text-lg">
                        {selectedTreatment.patient?.fullName?.charAt(0) || 'P'}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">
                        {selectedTreatment.patient?.fullName || 'Unknown Patient'}
                      </div>
                      <div className="text-sm text-gray-600">
                        ID: {selectedTreatment.patient?.patientId || 'N/A'}
                      </div>
                      {selectedTreatment.patient?.age && (
                        <div className="text-sm text-gray-600">
                          Age: {selectedTreatment.patient.age} years
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">Doctor Information</h4>
                  <div className="font-semibold text-gray-800 mb-2">
                    Dr. {selectedTreatment.doctor?.name || 'Unknown Doctor'}
                  </div>
                  {selectedTreatment.doctor?.specialization && (
                    <div className="text-sm text-gray-600">
                      Specialization: {selectedTreatment.doctor.specialization}
                    </div>
                  )}
                </div>
              </div>

              {/* Diagnosis & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">Diagnosis</h4>
                  <p className="text-gray-800">{selectedTreatment.diagnosis || 'No diagnosis provided'}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-700">Status</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTreatment.status)}`}>
                      {selectedTreatment.status || 'ongoing'}
                    </span>
                  </div>
                  {selectedTreatment.followUpDate && (
                    <div className="mt-2">
                      <div className="text-sm text-gray-600">Follow-up Date:</div>
                      <div className="text-gray-800">{formatDate(selectedTreatment.followUpDate)}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Examination Details */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Ayurvedic Examination</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Vata Pulse</div>
                    <div className="text-gray-800">{selectedTreatment.pulse?.vata || 'Not recorded'}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Pitta Pulse</div>
                    <div className="text-gray-800">{selectedTreatment.pulse?.pitta || 'Not recorded'}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Kapha Pulse</div>
                    <div className="text-gray-800">{selectedTreatment.pulse?.kapha || 'Not recorded'}</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">Tongue Examination</div>
                    <div className="text-gray-800">{selectedTreatment.tongueExamination || 'Not recorded'}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">Prakriti</div>
                    <div className="text-gray-800 capitalize">{selectedTreatment.prakriti || 'Not recorded'}</div>
                  </div>
                </div>
              </div>

              {/* Lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Chief Complaints */}
                {selectedTreatment.chiefComplaints && selectedTreatment.chiefComplaints.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2">Chief Complaints</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {selectedTreatment.chiefComplaints.map((complaint, index) => (
                        <li key={index} className="text-gray-800">{complaint}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Symptoms */}
                {selectedTreatment.symptoms && selectedTreatment.symptoms.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2">Symptoms</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {selectedTreatment.symptoms.map((symptom, index) => (
                        <li key={index} className="text-gray-800">{symptom}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Dosha Imbalance */}
                {selectedTreatment.doshaImbalance && selectedTreatment.doshaImbalance.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2">Dosha Imbalance</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {selectedTreatment.doshaImbalance.map((dosha, index) => (
                        <li key={index} className="text-gray-800">{dosha}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Therapies */}
              {selectedTreatment.prescribedTherapies && selectedTreatment.prescribedTherapies.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Prescribed Therapies</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedTreatment.prescribedTherapies.map((therapy, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-medium text-gray-700 mb-2">
                          {therapy.therapy?.name || `Therapy ${index + 1}`}
                        </h5>
                        <div className="text-sm text-gray-600">
                          <div>Sessions: {therapy.sessions || 1}</div>
                          <div>Duration: {therapy.duration || 30} minutes</div>
                          {therapy.instructions && (
                            <div className="mt-2">Instructions: {therapy.instructions}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medicines */}
              {selectedTreatment.medicines && selectedTreatment.medicines.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Medicines</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dosage</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instructions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedTreatment.medicines.map((medicine, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm text-gray-900">{medicine.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{medicine.dosage}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{medicine.frequency}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{medicine.duration}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{medicine.instructions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Diet Recommendations */}
                {selectedTreatment.dietRecommendations && selectedTreatment.dietRecommendations.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2">Diet Recommendations</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {selectedTreatment.dietRecommendations.map((rec, index) => (
                        <li key={index} className="text-gray-800">{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Lifestyle Changes */}
                {selectedTreatment.lifestyleChanges && selectedTreatment.lifestyleChanges.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2">Lifestyle Changes</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {selectedTreatment.lifestyleChanges.map((change, index) => (
                        <li key={index} className="text-gray-800">{change}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Yoga Recommendations */}
                {selectedTreatment.yogaRecommendations && selectedTreatment.yogaRecommendations.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2">Yoga Recommendations</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {selectedTreatment.yogaRecommendations.map((yoga, index) => (
                        <li key={index} className="text-gray-800">{yoga}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Notes */}
              {selectedTreatment.notes && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Notes</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-800">{selectedTreatment.notes}</p>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="pt-6 border-t border-gray-200 flex justify-end gap-4">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedTreatment(null);
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedTreatment(selectedTreatment);
                    setShowEditModal(true);
                  }}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300"
                >
                  Edit Treatment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">Treatment Statistics</h3>
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-300 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Status Distribution */}
              {stats && stats.statusDistribution && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Status Distribution</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.statusDistribution.map((stat, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-2 ${getStatusColor(stat._id)}`}>
                          {stat._id || 'Unknown'}
                        </div>
                        <div className="text-2xl font-bold text-gray-800">{stat.count || 0}</div>
                        <div className="text-sm text-gray-600">treatments</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Doctors */}
              {stats && stats.topDoctors && stats.topDoctors.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Top Doctors</h4>
                  <div className="space-y-4">
                    {stats.topDoctors.map((doctor, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                            <span className="text-green-600 font-bold">D</span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">{doctor.doctor || `Doctor ${index + 1}`}</div>
                            <div className="text-sm text-gray-600">
                              {doctor.specialization || 'General'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-800">{doctor.treatments || 0} treatments</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Common Diagnoses */}
              {stats && stats.commonDiagnoses && stats.commonDiagnoses.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Common Diagnoses</h4>
                  <div className="space-y-3">
                    {stats.commonDiagnoses.map((diagnosis, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="text-gray-800 truncate">{diagnosis._id || 'Unknown Diagnosis'}</div>
                        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          {diagnosis.count || 0}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreatmentsPage;