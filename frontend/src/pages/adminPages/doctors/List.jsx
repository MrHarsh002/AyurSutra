import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Filter,
  Mail,
  Phone,
  Star,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Users,
  MapPin,
  BadgeCheck,
  X,
  ChevronLeft,
  ChevronRight,
  Camera,
  Calendar,
  Shield,
  Activity,
  TrendingUp,
  MessageCircle,
  Video,
} from 'lucide-react';
import api from '../../../services/api';

const DoctorList = ({ onDoctorUpdated, onDoctorDeleted }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    availability: '',
    experience: '',
    feeRange: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });
  
  // Modal states
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [setUploadModalOpen] = useState(false);
  
  // Photo upload state
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const fileInputRef = useRef(null);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    photo: '',
    department: '',
    consultationFee: '',
    experience: '',
    specialization: '',
    education: '',
    bio: '',
    location: '',
    licenseNumber: ''
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    avgRating: 0,
    avgFee: 0
  });

  useEffect(() => {
    fetchDoctors();
    fetchStats();
  }, [pagination.page, filters]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(searchTerm && { search: searchTerm }),
        ...(filters.department && { department: filters.department }),
        ...(filters.availability && { available: filters.availability === 'true' }),
        ...(filters.experience && { minExperience: filters.experience }),
        ...(filters.feeRange && { maxFee: filters.feeRange })
      };

      const response = await api.get('/doctors', { params });
      
      setDoctors(response.data?.doctors || []);
      setPagination(prev => ({
        ...prev,
        total: response.data?.total || 0,
        totalPages: response.data?.totalPages || 0
      }));
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/doctors/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
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
      photo: doctor?.user?.photo || '',
      department: doctor?.department || '',
      consultationFee: doctor?.consultationFee || '',
      experience: doctor?.experience || '',
      specialization: doctor?.specialization || '',
      education: doctor?.education || '',
      bio: doctor?.bio || '',
      location: doctor?.location || '',
      licenseNumber: doctor?.licenseNumber || ''
    });
    setEditModalOpen(true);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setUploadingPhoto(true);

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const res = await api.post("/doctors/upload-image", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const imageUrl = res.data.cloudinaryUrl || res.data.url;

      setEditForm(prev => ({
        ...prev,
        photo: imageUrl
      }));

      // Update doctors list if editing
      if (selectedDoctor) {
        setDoctors(prev => prev.map(doc => 
          doc._id === selectedDoctor._id 
            ? { ...doc, user: { ...doc.user, photo: imageUrl } }
            : doc
        ));
      }

      alert("Image uploaded successfully!");
      e.target.value = "";
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.response?.data?.message || "Image upload failed");
    } finally {
      setUploadingPhoto(false);
      setSelectedFileName('');
    }
  };

  const handleUpdateDoctor = async () => {
    try {
      await api.put(`/doctors/${selectedDoctor._id}`, editForm);
      fetchDoctors();
      setEditModalOpen(false);
      onDoctorUpdated?.();
      alert("Doctor updated successfully!");
    } catch (error) {
      console.error('Error updating doctor:', error);
      alert("Failed to update doctor");
    }
  };

  const handleDeleteDoctor = async () => {
    try {
      await api.delete(`/doctors/${selectedDoctor._id}`);
      fetchDoctors();
      setDeleteModalOpen(false);
      onDoctorDeleted?.();
      alert("Doctor deleted successfully!");
    } catch (error) {
      console.error('Error deleting doctor:', error);
      alert("Failed to delete doctor");
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

  const [experienceRanges] = useState([
    { label: '0-5 years', value: '5' },
    { label: '5-10 years', value: '10' },
    { label: '10-15 years', value: '15' },
    { label: '15+ years', value: '20' }
  ]);

  const [feeRanges] = useState([
    { label: 'Under $50', value: '50' },
    { label: '$50-$100', value: '100' },
    { label: '$100-$200', value: '200' },
    { label: '$200+', value: '500' }
  ]);

  
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
    if (doctor?.user?.photo) return doctor.user.photo;
    const name = doctor?.user?.name || 'Doctor';
    const colors = ['667eea', '764ba2', 'f093fb', '4facfe', '00f2fe'];
    const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    const color = colors[hash % colors.length];
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=fff&size=512&bold=true&font-size=0.4`;
  };

  const getDepartmentColor = (department) => {
    const colors = {
      cardiology: 'bg-red-100 text-red-800',
      neurology: 'bg-blue-100 text-blue-800',
      orthopedics: 'bg-green-100 text-green-800',
      pediatrics: 'bg-yellow-100 text-yellow-800',
      dermatology: 'bg-purple-100 text-purple-800',
      default: 'bg-gray-100 text-gray-800'
    };
    return colors[department?.toLowerCase()] || colors.default;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      {/* Search & Filter Section - Modern Card */}
      <div className="relative mb-8">
        <div className="absolute -inset-1 bg-linear-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-10"></div>
        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200/50">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
            {/* Search */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search Doctors
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Name, email, specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && fetchDoctors()}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
              >
                <option value="">All Departments</option>
                {departments.map((dept, idx) => (
                  <option key={idx} value={dept.value}>{dept.label}</option>
                ))}
              </select>
            </div>

            {/* Experience */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2">Experience</label>
              <select
                value={filters.experience}
                onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
              >
                <option value="">Any Experience</option>
                {experienceRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={fetchDoctors}
                className="flex-1 px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Filter className="h-5 w-5" />
                Apply Filters
              </button>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilters({ department: '', availability: '', experience: '', feeRange: '' });
                  fetchDoctors();
                }}
                className="px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards - Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { 
              label: 'Total Doctors', 
              value: stats.total || 0, // Safe access
              icon: Users,
              color: 'from-blue-500 to-cyan-500',
              trend: '+12%'
            },
            { 
              label: 'Available Now', 
              value: stats.available || 0, // Safe access
              icon: CheckCircle,
              color: 'from-emerald-500 to-green-500',
              trend: '+8%'
            },
            { 
              label: 'Avg. Rating', 
              value: (stats.avgRating || 0).toFixed(1), // Safe with default value
              icon: Star,
              color: 'from-amber-500 to-orange-500',
              trend: '+0.3'
            },
            { 
              label: 'Avg. Fee', 
              value: `$${stats.avgFee || 0}`, // Safe with default value
              icon: DollarSign,
              color: 'from-purple-500 to-pink-500',
              trend: '+5%'
            }
          ].map((stat, idx) => (
            <div key={idx} className="group">
              <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-white to-gray-50 p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">{stat.trend}</span>
                      <span className="text-sm text-gray-500 ml-2">from last month</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl bg-linear-to-br ${stat.color} text-white`}>
                    <stat.icon className="h-8 w-8" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      {/* Doctors Grid - Modern Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg p-5 animate-pulse">
              <div className="flex flex-col items-center text-center">
                <div className="h-32 w-32 bg-gray-200 rounded-full mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-2 w-full">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : doctors.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {doctors.map(doctor => (
            <div
              key={doctor._id}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-200 hover:border-blue-300"
            >
              {/* Top Ribbon */}
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => handleAvailabilityToggle(doctor._id, doctor.isAvailable)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 transition-all ${
                    doctor?.isAvailable
                      ? 'bg-green-500/20 text-green-700 hover:bg-green-500/30'
                      : 'bg-red-500/20 text-red-700 hover:bg-red-500/30'
                  }`}
                >
                  {doctor?.isAvailable ? (
                    <>
                      <CheckCircle className="h-3.5 w-3.5" />
                      Available
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3.5 w-3.5" />
                      Busy
                    </>
                  )}
                </button>
              </div>

              {/* Doctor Card Content */}
              <div className="p-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative mb-4">
                    <img
                    src={
                      doctor.user?.photo
                        ? doctor.user.photo
                        : `https://ui-avatars.com/api/?name=${doctor.user?.name}&background=3B82F6&color=fff`
                    }
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDepartmentColor(doctor.department)}`}>
                        {doctor.department || 'General'}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 text-center mb-1">
                    {doctor?.user?.name}
                    {doctor?.verified && (
                      <BadgeCheck className="h-5 w-5 text-blue-500 inline-block ml-1" />
                    )}
                  </h3>
                  <p className="text-sm text-gray-500 text-center mb-3">
                    {doctor?.specialization || 'General Practitioner'}
                  </p>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-bold text-gray-900">{(doctor?.rating || 0).toFixed(1)}</span>
                    <span className="text-gray-500 text-sm">({doctor?.totalRatings || 0} reviews)</span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-lg font-bold text-gray-900">${doctor?.consultationFee || 0}</div>
                    <div className="text-xs text-gray-500">Fee</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-lg font-bold text-gray-900">{doctor?.experience || 0}y</div>
                    <div className="text-xs text-gray-500">Exp</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-lg font-bold text-gray-900">{doctor?.patients || 0}</div>
                    <div className="text-xs text-gray-500">Patients</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDoctor(doctor)}
                    className="flex-1 px-4 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </button>
                  <button
                    onClick={() => handleEditDoctor(doctor)}
                    className="px-4 py-2.5 bg-linear-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 flex items-center gap-2 text-sm font-medium"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDoctor(doctor);
                      setDeleteModalOpen(true);
                    }}
                    className="px-4 py-2.5 bg-linear-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 flex items-center gap-2 text-sm font-medium"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
          <div className="w-24 h-24 mx-auto mb-6 bg-linear-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center">
            <Users className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No Doctors Found</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Try adjusting your search criteria or add a new doctor to get started.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilters({ department: '', availability: '', experience: '', feeRange: '' });
              fetchDoctors();
            }}
            className="px-8 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
          >
            Reset Filters & Refresh
          </button>
        </div>
      )}

      {/* Pagination - Modern */}
      {pagination.totalPages > 1 && (
        <div className="bg-white rounded-2xl shadow-xl p-6 mt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{(pagination.page - 1) * pagination.limit + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-semibold text-gray-900">{pagination.total}</span> doctors
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination(prev => ({...prev, page: prev.page - 1}))}
                disabled={pagination.page === 1}
                className="px-4 py-2.5 rounded-xl border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium"
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
                    onClick={() => setPagination(prev => ({...prev, page: pageNum}))}
                    className={`min-w-[40px] h-10 rounded-xl border transition-all text-sm font-medium ${
                      pagination.page === pageNum
                        ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-lg'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setPagination(prev => ({...prev, page: prev.page + 1}))}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2.5 rounded-xl border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Doctor Modal - Enhanced */}
      {viewModalOpen && selectedDoctor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Doctor Profile
                  </span>
                  <Shield className="h-6 w-6 text-blue-500" />
                </h2>
                <p className="text-gray-500">Complete details of Dr. {selectedDoctor.user?.name}</p>
              </div>
              <button
                onClick={() => setViewModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column - Profile & Quick Actions */}
                <div className="lg:w-1/3 space-y-6">
                  {/* Profile Card */}
                  <div className="bg-linear-to-br from-blue-50 to-indigo-100 rounded-2xl p-6">
                    <div className="relative mb-6">
                      <div className="relative h-48 w-48 mx-auto rounded-2xl overflow-hidden shadow-2xl">
                        <img
                          src={getDoctorImage(selectedDoctor)}
                          alt={selectedDoctor.user?.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent"></div>
                      </div>
                      <button
                        onClick={() => setUploadModalOpen(true)}
                        className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
                      >
                        <Camera className="h-5 w-5 text-blue-600" />
                      </button>
                    </div>
                    
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedDoctor.user?.name}</h3>
                      <p className="text-gray-600 mb-3">{selectedDoctor.specialization}</p>
                      <div className="inline-flex items-center gap-1 px-4 py-2 bg-white rounded-full shadow">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-bold">{(selectedDoctor.rating || 0).toFixed(1)}</span>
                        <span className="text-gray-500">({selectedDoctor.totalRatings || 0} reviews)</span>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-white p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold text-gray-900">${selectedDoctor.consultationFee || 0}</div>
                        <div className="text-sm text-gray-500">Consultation</div>
                      </div>
                      <div className="bg-white p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold text-gray-900">{selectedDoctor.experience || 0}y</div>
                        <div className="text-sm text-gray-500">Experience</div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <button className="w-full px-4 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 font-medium">
                        <Video className="h-5 w-5" />
                        Schedule Video Call
                      </button>
                      <button className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 font-medium">
                        <MessageCircle className="h-5 w-5" />
                        Send Message
                      </button>
                    </div>
                  </div>

                  {/* Availability Card */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      Availability
                    </h4>
                    <div className="space-y-3">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <div key={day} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <span className="font-medium">{day}</span>
                          <span className="text-green-600 font-medium">9:00 AM - 5:00 PM</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column - Details */}
                <div className="lg:w-2/3 space-y-6">
                  {/* Contact Info Card */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h4 className="font-bold text-lg mb-4">Contact Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <Mail className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{selectedDoctor.user?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-50 rounded-lg">
                            <Phone className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-medium">{selectedDoctor.user?.phone || 'Not provided'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-red-50 rounded-lg">
                            <MapPin className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Location</p>
                            <p className="font-medium">{selectedDoctor.location || 'Not specified'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-50 rounded-lg">
                            <Activity className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedDoctor.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {selectedDoctor.isAvailable ? 'Available' : 'Busy'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Professional Details Card */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h4 className="font-bold text-lg mb-4">Professional Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Doctor ID</p>
                          <p className="font-medium">{selectedDoctor.doctorId || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Department</p>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDepartmentColor(selectedDoctor.department)}`}>
                            {selectedDoctor.department || 'General'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Specialization</p>
                          <p className="font-medium">{selectedDoctor.specialization || 'General Practitioner'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">License Number</p>
                          <p className="font-medium">{selectedDoctor.licenseNumber || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Education Card */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h4 className="font-bold text-lg mb-4">Education & Qualifications</h4>
                    <div className="prose prose-sm max-w-none">
                      {selectedDoctor.education ? (
                        <p className="text-gray-700">{selectedDoctor.education}</p>
                      ) : (
                        <p className="text-gray-500 italic">No education details available</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-4">
              <button
                onClick={() => {
                  setViewModalOpen(false);
                  handleEditDoctor(selectedDoctor);
                }}
                className="flex-1 px-6 py-3 bg-linear-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Edit className="h-5 w-5" />
                Edit Profile
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

      {/* Edit Doctor Modal - With Photo Upload */}
      {editModalOpen && selectedDoctor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="bg-linear-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                    Edit Doctor Profile
                  </span>
                  <Edit className="h-6 w-6 text-emerald-600" />
                </h2>
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
              {/* Photo Upload Section */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-4">Profile Photo</label>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <img
                      src={editForm.photo || getDoctorImage(selectedDoctor)}
                      alt="Profile"
                      className="h-32 w-32 rounded-2xl object-cover border-4 border-white shadow-lg"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                    >
                      <Camera className="h-5 w-5" />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  <div className="flex-1">
                    {selectedFileName && (
                      <div className="mb-4 p-3 bg-green-50 rounded-xl">
                        <p className="text-green-700 text-sm flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Selected: {selectedFileName}
                        </p>
                      </div>
                    )}
                    <p className="text-sm text-gray-500 mb-4">
                      Upload a new profile photo. Supported formats: JPG, PNG, WebP. Max size: 5MB.
                    </p>
                    {uploadingPhoto && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                        Uploading...
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Info */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-lg text-gray-900">Personal Information</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Enter email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  {/* Professional Info */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-lg text-gray-900">Professional Information</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                      <select
                        value={editForm.department}
                        onChange={(e) => setEditForm({...editForm, department: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      >
                        <option value="">Select Department</option>
                          {departments.map((dept, idx) => (
                              <option key={idx} value={dept}>
                                {dept}
                              </option>
                            ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                      <input
                        type="text"
                        value={editForm.specialization}
                        onChange={(e) => setEditForm({...editForm, specialization: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Enter specialization"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Fee ($)</label>
                        <input
                          type="number"
                          value={editForm.consultationFee}
                          onChange={(e) => setEditForm({...editForm, consultationFee: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="Enter fee"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Experience (years)</label>
                        <input
                          type="number"
                          value={editForm.experience}
                          onChange={(e) => setEditForm({...editForm, experience: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="Enter years"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Education & Qualifications</label>
                  <textarea
                    value={editForm.education}
                    onChange={(e) => setEditForm({...editForm, education: e.target.value})}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter education details and qualifications"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio / About</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter a brief bio"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Enter location"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                    <input
                      type="text"
                      value={editForm.licenseNumber}
                      onChange={(e) => setEditForm({...editForm, licenseNumber: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Enter license number"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-4">
              <button
                onClick={handleUpdateDoctor}
                className="flex-1 px-6 py-3 bg-linear-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="h-10 w-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Delete Doctor</h3>
              <p className="text-gray-600 mb-2">
                Are you sure you want to permanently delete Dr. {selectedDoctor.user?.name}?
              </p>
              <p className="text-red-500 text-sm mb-8">
                This will remove all doctor data including appointments, ratings, and history.
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
                  className="flex-1 px-6 py-3 bg-linear-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
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