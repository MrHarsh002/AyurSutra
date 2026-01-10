
import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  Star,
  Clock,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Users,
  Calendar,
  Award,
  MapPin,
  Shield,
  BadgeCheck,
  Activity,
  Download,
  Share2,
  User,
  X,
  ChevronLeft,
  ChevronRight,
  Instagram,
  Twitter,
  Linkedin,
  Heart,
  MessageCircle,
  Video
} from 'lucide-react';
import api from '../../services/api';

const DoctorList = ({ onDoctorUpdated, onDoctorDeleted }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    availability: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 0
  });
  
  // Modal states
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    consultationFee: '',
    experience: '',
    specialization: '',
    education: ''
  });

  useEffect(() => {
    fetchDoctors();
  }, [pagination.page, filters]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(searchTerm && { search: searchTerm }),
        ...(filters.department && { department: filters.department }),
        ...(filters.availability && { available: filters.availability === 'true' })
      };

      const response = await api.get('/doctors', { params });
      
      setDoctors(response.data?.doctors || []);
      setPagination({
        ...pagination,
        total: response.data?.total || 0,
        totalPages: response.data?.totalPages || 0
      });
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setViewModalOpen(true);
  };

  const handleEditDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setEditForm({
      name: doctor?.user?.name || '',
      email: doctor?.user?.email || '',
      phone: doctor?.user?.phone || '',
      department: doctor?.department || '',
      consultationFee: doctor?.consultationFee || '',
      experience: doctor?.experience || '',
      specialization: doctor?.specialization || '',
      education: doctor?.education || ''
    });
    setEditModalOpen(true);
  };

  const handleUpdateDoctor = async () => {
    try {
      await api.put(`/doctors/${selectedDoctor._id}`, editForm);
      fetchDoctors();
      setEditModalOpen(false);
      onDoctorUpdated?.();
    } catch (error) {
      console.error('Error updating doctor:', error);
    }
  };

  const handleDeleteDoctor = async () => {
    try {
      await api.delete(`/doctors/${selectedDoctor._id}`);
      fetchDoctors();
      setDeleteModalOpen(false);
      onDoctorDeleted?.();
    } catch (error) {
      console.error('Error deleting doctor:', error);
    }
  };

  const handleAvailabilityToggle = async (doctorId, currentStatus) => {
    try {
      await api.put(`/doctors/${doctorId}/availability`, {
        isAvailable: !currentStatus
      });
      fetchDoctors();
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

    const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await api.get('/doctors/meta');
        setDepartments(res.data.departments);
      } catch (err) {
        console.error('Failed to fetch meta:', err);
      }
    };
    fetchMeta();
  }, []);


  const getDoctorImage = (doctor) => {
    if (doctor?.imageUrl) return doctor.imageUrl;
    const name = doctor?.user?.name || 'Doctor';
    const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    const colors = ['667eea', '764ba2', 'f093fb', '4facfe', '00f2fe'];
    const color = colors[hash % colors.length];
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=fff&size=256&bold=true`;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Doctor Management</h1>
        <p className="text-gray-600">Manage your medical team with ease and efficiency</p>
      </div>

        {/* Search & Filter Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-200">
            <div className="flex flex-col lg:flex-row items-end gap-6 w-full">

        {/* 🔍 Search Bar */}
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Search</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search doctors by name, email, specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && fetchDoctors()}
                  className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-300"
                />
              </div>
            </div>

            {/* 🏥 Department */}
            <div className="w-full lg:w-48">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Department</label>
              <select
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="">All departments</option>
                {departments.map(dep => (
                  <option key={dep} value={dep}>
                    {dep.charAt(0).toUpperCase() + dep.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* 📌 Availability */}
            <div className="w-full lg:w-40">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Availability</label>
              <select
                value={filters.availability}
                onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="">All</option>
                <option value="true">Available</option>
                <option value="false">Busy</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={fetchDoctors}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow flex items-center gap-2"
              >
                <Filter className="h-5 w-5" />
                Apply
              </button>

              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilters({ department: '', availability: '' });
                  fetchDoctors();
                }}
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
              >
                <X className="h-5 w-5" />
                Clear
              </button>
            </div>
          </div>
        </div>


      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Total Doctors</p>
              <p className="text-3xl font-bold">{pagination.total}</p>
            </div>
            <Users className="h-10 w-10 opacity-80" />
          </div>
        </div>
        <div className="bg-linear-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">Available Now</p>
              <p className="text-3xl font-bold">
                {doctors.filter(d => d.isAvailable).length}
              </p>
            </div>
            <CheckCircle className="h-10 w-10 opacity-80" />
          </div>
        </div>
        <div className="bg-linear-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm mb-1">Avg. Rating</p>
              <p className="text-3xl font-bold">
                {doctors.length > 0 
                  ? (doctors.reduce((acc, d) => acc + (d.rating || 0), 0) / doctors.length).toFixed(1)
                  : '0.0'
                }
              </p>
            </div>
            <Star className="h-10 w-10 opacity-80" />
          </div>
        </div>
        <div className="bg-linear-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-1">Avg. Fee</p>
              <p className="text-3xl font-bold">
                ${doctors.length > 0 
                  ? Math.round(doctors.reduce((acc, d) => acc + (d.consultationFee || 0), 0) / doctors.length)
                  : '0'
                }
              </p>
            </div>
            <DollarSign className="h-10 w-10 opacity-80" />
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-20 w-20 bg-gray-200 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          ))}
        </div>
      ) : doctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map(doctor => {
            const dept = departments.find(d => d.value === doctor.department) || departments[0];
            return (
              <div
                key={doctor._id}
                className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-200 hover:border-blue-300"
              >
                {/* Doctor Image Header */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={getDoctorImage(doctor)}
                    alt={doctor?.user?.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent"></div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() => handleAvailabilityToggle(doctor._id, doctor.isAvailable)}
                      className={`px-4 py-2 rounded-full backdrop-blur-md text-sm font-semibold flex items-center gap-2 transition-all ${
                        doctor?.isAvailable 
                          ? 'bg-green-500/90 text-white hover:bg-green-600'
                          : 'bg-red-500/90 text-white hover:bg-red-600'
                      }`}
                    >
                      {doctor?.isAvailable ? (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Available
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4" />
                          Busy
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* Department Badge */}
                  <div className="absolute bottom-4 left-4">
                    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${dept.color}`}>
                      {dept.label}
                    </span>
                  </div>
                </div>

                {/* Doctor Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-gray-900">{doctor?.user?.name}</h3>
                        {doctor?.verified && (
                          <BadgeCheck className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                      <p className="text-gray-500 text-sm flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        {doctor?.specialization || 'General Practitioner'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      <span className="font-bold text-gray-900">{(doctor?.rating || 0).toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-4 w-4 mr-3 text-blue-500 flex shrink-0" />
                      <span className="text-sm truncate">{doctor?.user?.email}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-3 text-green-500 flex shrink-0" />
                      <span className="text-sm">{doctor?.user?.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-3 text-purple-500 flex shrink-0" />
                      <span className="text-sm">{doctor?.experience || 0} years experience</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">${doctor?.consultationFee || 0}</div>
                      <div className="text-xs text-gray-500">Consultation</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{doctor?.totalRatings || 0}</div>
                      <div className="text-xs text-gray-500">Reviews</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{doctor?.patients || 0}</div>
                      <div className="text-xs text-gray-500">Patients</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleViewDoctor(doctor)}
                      className="flex-1 px-4 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 font-medium"
                    >
                      <Eye className="h-5 w-5" />
                      View
                    </button>
                    <button
                      onClick={() => handleEditDoctor(doctor)}
                      className="flex-1 px-4 py-3 bg-linear-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 flex items-center justify-center gap-2 font-medium"
                    >
                      <Edit className="h-5 w-5" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDoctor(doctor);
                        setDeleteModalOpen(true);
                      }}
                      className="px-4 py-3 bg-linear-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 flex items-center gap-2 font-medium"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
          <div className="w-24 h-24 bg-linear-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No Doctors Found</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            We couldn't find any doctors matching your criteria. Try adjusting your search or filters.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilters({ department: '', availability: '' });
              fetchDoctors();
            }}
            className="px-8 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-medium"
          >
            Reset Filters & Refresh
          </button>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white rounded-2xl shadow-xl p-6 mt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              <span className="font-medium text-gray-900">Page {pagination.page} of {pagination.totalPages}</span> • {pagination.total} doctors total
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination({...pagination, page: pagination.page - 1})}
                disabled={pagination.page === 1}
                className="px-4 py-2.5 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              
              {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setPagination({...pagination, page: pageNum})}
                    className={`w-10 h-10 rounded-lg border transition-all ${
                      pagination.page === pageNum
                        ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white border-transparent'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setPagination({...pagination, page: pagination.page + 1})}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2.5 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Doctor Modal */}
      {viewModalOpen && selectedDoctor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Doctor Profile</h2>
                <p className="text-gray-500">Complete details of Dr. {selectedDoctor.user?.name}</p>
              </div>
              <button
                onClick={() => setViewModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column - Image and Basic Info */}
                <div className="lg:w-1/3">
                  <div className="bg-linear-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 mb-6">
                    <div className="relative h-64 w-64 mx-auto mb-6">
                      <img
                        src={getDoctorImage(selectedDoctor)}
                        alt={selectedDoctor.user?.name}
                        className="w-full h-full object-cover rounded-2xl shadow-lg"
                      />
                      <div className="absolute -bottom-3 -right-3">
                        <div className={`px-4 py-2 rounded-full ${
                          selectedDoctor.isAvailable 
                            ? 'bg-green-500 text-white' 
                            : 'bg-red-500 text-white'
                        }`}>
                          {selectedDoctor.isAvailable ? 'Available' : 'Busy'}
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-center mb-2">{selectedDoctor.user?.name}</h3>
                    <p className="text-gray-500 text-center mb-4">{selectedDoctor.specialization}</p>
                    
                    <div className="flex justify-center gap-4 mb-6">
                      <button className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200">
                        <Instagram className="h-5 w-5" />
                      </button>
                      <button className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200">
                        <Twitter className="h-5 w-5" />
                      </button>
                      <button className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200">
                        <Linkedin className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                        <span className="text-gray-600">Rating</span>
                        <span className="font-bold flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          {(selectedDoctor.rating || 0).toFixed(1)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                        <span className="text-gray-600">Experience</span>
                        <span className="font-bold">{selectedDoctor.experience || 0} years</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                        <span className="text-gray-600">Consultation Fee</span>
                        <span className="font-bold">${selectedDoctor.consultationFee || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Right Column - Details */}
                <div className="lg:w-2/3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="font-bold text-lg mb-4">Contact Information</h4>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{selectedDoctor.user?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-medium">{selectedDoctor.user?.phone || 'Not provided'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-red-500" />
                          <div>
                            <p className="text-sm text-gray-500">Location</p>
                            <p className="font-medium">{selectedDoctor.location || 'Not specified'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="font-bold text-lg mb-4">Professional Details</h4>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500">Doctor ID</p>
                          <p className="font-medium">{selectedDoctor.doctorId || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Department</p>
                          <p className="font-medium capitalize">{selectedDoctor.department || 'General'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Specialization</p>
                          <p className="font-medium">{selectedDoctor.specialization || 'General Practitioner'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">License Number</p>
                          <p className="font-medium">{selectedDoctor.licenseNumber || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <h4 className="font-bold text-lg mb-4">Education & Qualifications</h4>
                    <div className="space-y-3">
                      {selectedDoctor.education ? (
                        <p className="text-gray-700">{selectedDoctor.education}</p>
                      ) : (
                        <p className="text-gray-500 italic">No education details available</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-bold text-lg mb-4">Schedule & Availability</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <div key={day} className="text-center p-3 bg-white rounded-lg">
                          <p className="font-medium mb-1">{day}</p>
                          <p className="text-sm text-green-600 font-medium">9AM-5PM</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-4">
              <button
                onClick={() => {
                  setViewModalOpen(false);
                  handleEditDoctor(selectedDoctor);
                }}
                className="flex-1 px-6 py-3 bg-linear-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 font-medium flex items-center justify-center gap-2"
              >
                <Edit className="h-5 w-5" />
                Edit Profile
              </button>
              <button
                onClick={() => {
                  setViewModalOpen(false);
                  setDeleteModalOpen(true);
                }}
                className="flex-1 px-6 py-3 bg-linear-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 font-medium flex items-center justify-center gap-2"
              >
                <Trash2 className="h-5 w-5" />
                Delete Doctor
              </button>
              <button
                onClick={() => setViewModalOpen(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Doctor Modal */}
      {editModalOpen && selectedDoctor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Edit Doctor Profile</h2>
                <p className="text-gray-500">Update details for Dr. {selectedDoctor.user?.name}</p>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <select
                      value={editForm.department}
                      onChange={(e) => setEditForm({...editForm, department: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept.value} value={dept.value}>{dept.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Fee ($)</label>
                    <input
                      type="number"
                      value={editForm.consultationFee}
                      onChange={(e) => setEditForm({...editForm, consultationFee: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter fee"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience (years)</label>
                    <input
                      type="number"
                      value={editForm.experience}
                      onChange={(e) => setEditForm({...editForm, experience: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter years of experience"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                  <input
                    type="text"
                    value={editForm.specialization}
                    onChange={(e) => setEditForm({...editForm, specialization: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter specialization"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Education & Qualifications</label>
                  <textarea
                    value={editForm.education}
                    onChange={(e) => setEditForm({...editForm, education: e.target.value})}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter education details and qualifications"
                  />
                </div>
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-4">
              <button
                onClick={handleUpdateDoctor}
                className="flex-1 px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-medium"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditModalOpen(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedDoctor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="h-10 w-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Delete Doctor</h3>
              <p className="text-gray-600 mb-2">
                Are you sure you want to delete Dr. {selectedDoctor.user?.name}?
              </p>
              <p className="text-red-500 text-sm mb-8">
                This action cannot be undone. All associated data will be permanently removed.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteDoctor}
                  className="flex-1 px-6 py-3 bg-linear-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 font-medium flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-5 w-5" />
                  Delete Doctor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorList;