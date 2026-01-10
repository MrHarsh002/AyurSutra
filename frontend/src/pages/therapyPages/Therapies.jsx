import React, { useState, useEffect } from 'react';
import { 
  UserPlus,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Upload
} from 'lucide-react';
import api from '../../services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddDoctor = ({ onDoctorAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialization: '',
    department: '',
    consultationFee: '',
    experience: '',
    maxPatientsPerDay: '',
    qualifications: '',
    availableDays: [],
    workingHours: {
      start: '09:00',
      end: '17:00'
    }
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [daysOfWeek, setDaysOfWeek] = useState([]);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await api.get('/doctors/meta');
        setDepartments(res.data.departments);
        setDaysOfWeek(res.data.daysOfWeek);
      } catch (err) {
        console.error('Failed to fetch meta:', err);
      }
    };
    fetchMeta();
  }, []);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      if (name === 'availableDays') {
        setFormData(prev => ({
          ...prev,
          availableDays: checked
            ? [...prev.availableDays, value]
            : prev.availableDays.filter(day => day !== value)
        }));
      }
    } else if (name.startsWith('workingHours.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        workingHours: {
          ...prev.workingHours,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.consultationFee) newErrors.consultationFee = 'Consultation fee is required';
    if (formData.availableDays.length === 0) newErrors.availableDays = 'Select at least one day';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  setLoading(true);
  try {
    const formattedData = {
      ...formData,
      consultationFee: Number(formData.consultationFee),
      experience: formData.experience ? Number(formData.experience) : 0,
      maxPatientsPerDay: formData.maxPatientsPerDay
        ? Number(formData.maxPatientsPerDay)
        : 20
    };

    await api.post('/doctors', formattedData);

    // Show success toast
    toast.success('Doctor created successfully!', { position: 'top-right', autoClose: 3000 });

    // Reset form
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      specialization: '',
      department: '',
      consultationFee: '',
      experience: '',
      maxPatientsPerDay: '',
      qualifications: '',
      availableDays: [],
      workingHours: { start: '09:00', end: '17:00' }
    });

    onDoctorAdded?.();

  } catch (error) {
    console.error('Error creating doctor:', error);

    // Show error toast
    toast.error(error.response?.data?.message || 'Failed to create doctor', { position: 'top-right', autoClose: 3000 });
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="max-w-8xl mx-auto p-6">
      <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-lg mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-blue-100 rounded-xl">
            <UserPlus className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add New Doctor</h2>
            <p className="text-gray-600">Fill in the details to register a new doctor</p>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl animate-fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Doctor created successfully!</p>
                <p className="text-sm text-green-600">The doctor has been added to the system.</p>
              </div>
            </div>
          </div>
        )}

        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="font-medium text-red-800">{errors.submit}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Horizontal Layout for All Sections */}
          <div className="flex flex-col xl:flex-row gap-6">
            
            {/* Personal Information - First Column */}
            <div className="bg-white rounded-xl p-6 shadow-sm flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Personal Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    } focus:ring-2 focus:ring-blue-200 transition-all duration-300`}
                    placeholder="Dr. John Doe"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    } focus:ring-2 focus:ring-blue-200 transition-all duration-300`}
                    placeholder="doctor@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.password ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    } focus:ring-2 focus:ring-blue-200 transition-all duration-300`}
                    placeholder="••••••••"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    // Allow only digits and restrict to 10 characters
                    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setFormData({ ...formData, phone: value });

                    // Clear error as user types
                    setErrors((prev) => ({ ...prev, phone: "" }));
                  }}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                  placeholder="Enter 10-digit phone number"
                />

                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Qualifications
                  </label>
                  <input
                    type="text"
                    name="qualifications"
                    value={formData.qualifications}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                    placeholder="MBBS, MD, etc."
                  />
                </div>
              </div>
            </div>

            {/* Professional Information - Second Column */}
            <div className="bg-white rounded-xl p-6 shadow-sm flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Professional Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.department ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    } focus:ring-2 focus:ring-blue-200 transition-all duration-300`}
                  >
                    <option value="">Select Department</option>
                    {departments.map(dep => (
                      <option key={dep} value={dep}>
                        {dep.charAt(0).toUpperCase() + dep.slice(1)}
                      </option>
                    ))}
                  </select>
                  {errors.department && (
                    <p className="mt-1 text-sm text-red-600">{errors.department}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialization
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                    placeholder="Cardiology, Neurology, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Consultation Fee ($) *
                  </label>
                  <input
                    type="number"
                    name="consultationFee"
                    value={formData.consultationFee}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.consultationFee ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    } focus:ring-2 focus:ring-blue-200 transition-all duration-300`}
                    placeholder="100"
                    min="0"
                  />
                  {errors.consultationFee && (
                    <p className="mt-1 text-sm text-red-600">{errors.consultationFee}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience (years)
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                    placeholder="5"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Patients Per Day
                  </label>
                  <input
                    type="number"
                    name="maxPatientsPerDay"
                    value={formData.maxPatientsPerDay}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                    placeholder="20"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Schedule Information - Third Column */}
            <div className="bg-white rounded-xl p-6 shadow-sm flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Schedule Information
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Available Days *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                    {daysOfWeek.map(day => (
                      <label
                        key={day}
                        className={`flex items-center px-3 py-2.5 rounded-lg border cursor-pointer transition-all duration-300 ${
                          formData.availableDays.includes(day)
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          name="availableDays"
                          value={day}
                          checked={formData.availableDays.includes(day)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFormData(prev => ({
                              ...prev,
                              availableDays: checked
                                ? [...prev.availableDays, day]       // Add day if checked
                                : prev.availableDays.filter(d => d !== day) // Remove day if unchecked
                            }));
                          }}
                          className="sr-only"
                        />
                        <span className="capitalize text-sm">{day}</span>
                      </label>
                    ))}
                  </div>

                  {errors.availableDays && (
                    <p className="mt-2 text-sm text-red-600">{errors.availableDays}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Working Hours
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                      <input
                        type="time"
                        name="workingHours.start"
                        value={formData.workingHours.start}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">End Time</label>
                      <input
                        type="time"
                        name="workingHours.end"
                        value={formData.workingHours.end}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Buttons - Inside Schedule Column */}
                <div className="pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({
                        name: '',
                        email: '',
                        password: '',
                        phone: '',
                        specialization: '',
                        department: '',
                        consultationFee: '',
                        experience: '',
                        maxPatientsPerDay: '',
                        qualifications: '',
                        availableDays: [],
                        workingHours: { start: '09:00', end: '17:00' }
                      })}
                      className="px-5 py-2.5 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-all duration-300 text-sm"
                    >
                      <X className="h-4 w-4 inline mr-2" />
                      Clear All
                    </button>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 inline mr-2" />
                          Create Doctor
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
         <ToastContainer />
      </div>
    </div>
  );
};

export default AddDoctor;