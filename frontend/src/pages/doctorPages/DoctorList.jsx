import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  MapPin,
  Star,
  Calendar,
  Users,
  Award,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Download,
  Upload,
  UserPlus,
  Shield,
  Clock,
  X,
  CheckCircle,
  XCircle,
  Briefcase,
  GraduationCap,
  DollarSign,
  Activity,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import api from '../../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Doctor Card Component
const DoctorCard = ({ doctor, onEdit, onDelete, onView, onToggleAvailability }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <img
              src={doctor.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.user?.name || 'Doctor')}&background=667eea&color=fff&size=128`}
              alt={doctor.user?.name}
              className="w-16 h-16 rounded-full border-4 border-blue-50"
            />
            <div>
              <h3 className="font-bold text-lg">{doctor.user?.name || 'N/A'}</h3>
              <p className="text-blue-600 font-medium">{doctor.specialization || 'General Practitioner'}</p>
              <div className="flex items-center mt-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="ml-1 text-sm font-medium">{doctor.rating?.toFixed(1) || '0.0'}</span>
                <span className="mx-2 text-gray-300">•</span>
                <button
                  onClick={() => onToggleAvailability(doctor._id, doctor.isAvailable)}
                  className={`text-sm px-2 py-1 rounded-full ${doctor.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                >
                  {doctor.isAvailable ? 'Available' : 'Busy'}
                </button>
              </div>
            </div>
          </div>
          <div className="relative">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center text-gray-600">
            <Mail className="w-4 h-4 mr-3" />
            <span className="text-sm truncate">{doctor.user?.email || 'N/A'}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Phone className="w-4 h-4 mr-3" />
            <span className="text-sm">{doctor.user?.phone || 'Not provided'}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Award className="w-4 h-4 mr-3" />
            <span className="text-sm">{doctor.experience || 0} years exp</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Briefcase className="w-4 h-4 mr-3" />
            <span className="text-sm capitalize">{doctor.department || 'General'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center text-gray-600">
            <DollarSign className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">${doctor.consultationFee || 0}</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onView(doctor)}
              className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg"
              title="View Details"
            >
              <Eye className="w-5 h-5" />
            </button>
            <button
              onClick={() => onEdit(doctor)}
              className="p-2 hover:bg-green-50 text-green-600 rounded-lg hidden"
              title="Edit Doctor"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={() => onDelete(doctor._id)}
              className="p-2 hover:bg-red-50 text-red-600 rounded-lg hidden"
              title="Delete Doctor"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add/Edit Doctor Modal with React Hook Form
const DoctorModal = ({ isOpen, onClose, doctor, onSave, departments }) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: doctor || {
      name: '',
      email: '',
      password: '',
      phone: '',
      specialization: '',
      department: '',
      consultationFee: '',
      experience: '',
      qualifications: '',
      education: '',
      licenseNumber: '',
      maxPatientsPerDay: '20',
      status: 'Active'
    }
  });

  useEffect(() => {
    if (doctor) {
      reset({
        name: doctor.user?.name || '',
        email: doctor.user?.email || '',
        phone: doctor.user?.phone || '',
        specialization: doctor.specialization || '',
        department: doctor.department || '',
        consultationFee: doctor.consultationFee || '',
        experience: doctor.experience || '',
        qualifications: doctor.qualifications || '',
        education: doctor.education || '',
        licenseNumber: doctor.licenseNumber || '',
        maxPatientsPerDay: doctor.maxPatientsPerDay || '20',
        status: doctor.isAvailable ? 'Active' : 'Inactive'
      });
    } else {
      reset({
        name: '',
        email: '',
        password: '',
        phone: '',
        specialization: '',
        department: '',
        consultationFee: '',
        experience: '',
        qualifications: '',
        education: '',
        licenseNumber: '',
        maxPatientsPerDay: '20',
        status: 'Active'
      });
    }
  }, [doctor, reset]);

  const onSubmit = async (data) => {
    try {
      await onSave(data, doctor?._id);
      onClose();
    } catch (error) {
      console.error('Error saving doctor:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {doctor ? 'Edit Doctor' : 'Add New Doctor'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: 'Invalid email address'
                    }
                  })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>

              {!doctor && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.password ? 'border-red-300' : 'border-gray-300'}`}
                  />
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  {...register('phone', {
                    pattern: {
                      value: /^\d{10}$/,
                      message: 'Phone number must be 10 digits'
                    }
                  })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.phone ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <select
                  {...register('department', { required: 'Department is required' })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.department ? 'border-red-300' : 'border-gray-300'}`}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept.charAt(0).toUpperCase() + dept.slice(1)}</option>
                  ))}
                </select>
                {errors.department && <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization *
                </label>
                <input
                  type="text"
                  {...register('specialization', { required: 'Specialization is required' })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.specialization ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.specialization && <p className="mt-1 text-sm text-red-600">{errors.specialization.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consultation Fee ($) *
                </label>
                <input
                  type="number"
                  {...register('consultationFee', { 
                    required: 'Consultation fee is required',
                    min: { value: 0, message: 'Fee must be positive' }
                  })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.consultationFee ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.consultationFee && <p className="mt-1 text-sm text-red-600">{errors.consultationFee.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience (years)
                </label>
                <input
                  type="number"
                  {...register('experience', { min: { value: 0, message: 'Experience cannot be negative' } })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.experience ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.experience && <p className="mt-1 text-sm text-red-600">{errors.experience.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualifications
                </label>
                <input
                  type="text"
                  {...register('qualifications')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Patients Per Day
                </label>
                <input
                  type="number"
                  {...register('maxPatientsPerDay', { min: { value: 1, message: 'Must be at least 1' } })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.maxPatientsPerDay ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.maxPatientsPerDay && <p className="mt-1 text-sm text-red-600">{errors.maxPatientsPerDay.message}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Education
                </label>
                <textarea
                  {...register('education')}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Number
                </label>
                <input
                  type="text"
                  {...register('licenseNumber')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600  text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : doctor ? 'Update Doctor' : 'Add Doctor'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Doctor Details Modal
const DoctorDetailsModal = ({ isOpen, onClose, doctor }) => {
  if (!isOpen || !doctor) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <img
                src={doctor.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.user?.name || 'Doctor')}&background=667eea&color=fff&size=256`}
                alt={doctor.user?.name}
                className="w-20 h-20 rounded-full border-4 border-blue-100"
              />
              <div>
                <h2 className="text-2xl font-bold">{doctor.user?.name || 'N/A'}</h2>
                <p className="text-blue-600 font-medium">{doctor.specialization || 'General Practitioner'}</p>
                <div className="flex items-center mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${doctor.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {doctor.isAvailable ? 'Available' : 'Busy'}
                  </span>
                  <span className="mx-4 text-gray-300">•</span>
                  <span className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="ml-1 font-medium">{doctor.rating?.toFixed(1) || '0.0'}</span>
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{doctor.user?.email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{doctor.user?.phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Professional Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Briefcase className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="font-medium capitalize">{doctor.department || 'General'}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Award className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Experience</p>
                      <p className="font-medium">{doctor.experience || 0} years</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Consultation Fee</p>
                      <p className="font-medium">${doctor.consultationFee || 0}</p>
                    </div>
                  </div>
                  {doctor.licenseNumber && (
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">License Number</p>
                        <p className="font-medium">{doctor.licenseNumber}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Education & Qualifications</h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800">
                    {doctor.qualifications || doctor.education || 'No education details available'}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Schedule & Availability</h3>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Available Days</p>
                    <p className="font-medium">
                      {doctor.availableDays?.length > 0 
                        ? doctor.availableDays.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ')
                        : 'Not specified'}
                    </p>
                  </div>
                </div>
                {doctor.workingHours && (
                  <div className="mt-4 flex items-center">
                    <Clock className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Working Hours</p>
                      <p className="font-medium">
                        {doctor.workingHours.start} - {doctor.workingHours.end}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-500">Max Patients/Day</p>
                    <p className="text-2xl font-bold text-blue-600">{doctor.maxPatientsPerDay || 20}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-500">Patient Rating</p>
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      <span className="ml-1 text-2xl font-bold">{doctor.rating?.toFixed(1) || '0.0'}</span>
                      <span className="ml-1 text-gray-500">/5</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
const DoctorManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDoctors: 0,
    availableToday: 0,
    averageRating: 0,
    appointmentsToday: 0
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDoctors, setTotalDoctors] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [editingDoctor, setEditingDoctor] = useState(null);

  // Fetch meta data (departments)
  useEffect(() => {
    fetchMeta();
    fetchStats();
  }, []);

  // Fetch doctors with filters
  useEffect(() => {
    fetchDoctors();
  }, [currentPage, searchTerm, selectedDepartment, selectedStatus]);

  const fetchMeta = async () => {
    try {
      const res = await api.get('/doctors/meta');
      setDepartments(res.data.departments || []);
    } catch (error) {
      console.error('Error fetching meta data:', error);
      toast.error('Failed to load departments');
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/doctors/stats');
      setStats(res.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 9,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedDepartment && { department: selectedDepartment }),
        ...(selectedStatus && { available: selectedStatus === 'true' })
      };

      const response = await api.get('/doctors', { params });
      
      setDoctors(response.data.doctors || []);
      setTotalDoctors(response.data.total || 0);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to load doctors');
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchKey = (e) => {
    if (e.key === 'Enter') {
      fetchDoctors();
    }
  };

  const handleAddDoctor = () => {
    setEditingDoctor(null);
    setIsModalOpen(true);
  };

  const handleEditDoctor = (doctor) => {
    setEditingDoctor(doctor);
    setIsModalOpen(true);
  };

  const handleDeleteDoctor = async (id) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await api.delete(`/doctors/${id}`);
        toast.success('Doctor deleted successfully');
        fetchDoctors();
        fetchStats();
      } catch (error) {
        console.error('Error deleting doctor:', error);
        toast.error('Failed to delete doctor');
      }
    }
  };

  const handleViewDetails = (doctor) => {
    setSelectedDoctor(doctor);
    setIsDetailsModalOpen(true);
  };

  const handleToggleAvailability = async (id, currentStatus) => {
    try {
      await api.put(`/doctors/${id}/availability`, {
        isAvailable: !currentStatus
      });
      toast.success(`Doctor marked as ${!currentStatus ? 'available' : 'busy'}`);
      fetchDoctors();
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Failed to update availability');
    }
  };

  const handleSaveDoctor = async (data, doctorId) => {
    try {
      if (doctorId) {
        // Update existing doctor
        await api.put(`/doctors/${doctorId}`, data);
        toast.success('Doctor updated successfully');
      } else {
        // Create new doctor
        await api.post('/doctors', data);
        toast.success('Doctor created successfully');
      }
      fetchDoctors();
      fetchStats();
    } catch (error) {
      console.error('Error saving doctor:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save doctor';
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleExport = () => {
    alert('Export functionality would be implemented here');
  };

  const handleImport = () => {
    alert('Import functionality would be implemented here');
  };

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'true', label: 'Available' },
    { value: 'false', label: 'Busy' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Doctors</p>
              <p className="text-2xl font-bold">{stats.totalDoctors}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">+{doctors.filter(d => d.isNew).length} new</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Available Today</p>
              <p className="text-2xl font-bold">{stats.availableToday}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">Currently working</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Avg. Rating</p>
              <p className="text-2xl font-bold">{stats.averageRating?.toFixed(1) || '0.0'}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600 fill-current" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">Across all doctors</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Appointments Today</p>
              <p className="text-2xl font-bold">{stats.appointmentsToday}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">Scheduled for today</p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="flex-1 lg:mr-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search doctors by name, specialization, or email..."
                value={searchTerm}
                onChange={handleSearch}
                onKeyPress={handleSearchKey}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={selectedDepartment}
                onChange={(e) => {
                  setSelectedDepartment(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept.charAt(0).toUpperCase() + dept.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleImport}
                className="hidden items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Upload className="w-5 h-5 mr-2" />
                Import
              </button>
              <button
                onClick={handleExport}
                className="hidden items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Download className="w-5 h-5 mr-2" />
                Export
              </button>
              <button
                onClick={handleAddDoctor}
                className="hidden items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Doctor
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-3 mt-6">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <UserPlus className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No doctors found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
          <button
            onClick={handleAddDoctor}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Add Your First Doctor
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {doctors.map(doctor => (
              <DoctorCard
                key={doctor._id}
                doctor={doctor}
                onEdit={handleEditDoctor}
                onDelete={handleDeleteDoctor}
                onView={handleViewDetails}
                onToggleAvailability={handleToggleAvailability}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * 9 + 1} to {Math.min(currentPage * 9, totalDoctors)} of {totalDoctors} doctors
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  // Show limited pagination
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return <span key={pageNum} className="px-2">...</span>;
                  }
                  return null;
                })}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <DoctorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        doctor={editingDoctor}
        onSave={handleSaveDoctor}
        departments={departments}
      />

      <DoctorDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        doctor={selectedDoctor}
      />
    </div>
  );
};

export default DoctorManagement;