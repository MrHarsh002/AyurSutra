// components/AddDoctor.jsx
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { 
  UserPlus,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Upload
} from 'lucide-react';
import api from '../../../services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddDoctor = ({ onDoctorAdded }) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    trigger
  } = useForm({
    defaultValues: {
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
    },
    mode: 'onChange'
  });

  const [departments, setDepartments] = useState([]);
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const availableDays = watch('availableDays');

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        // Static data for now
        setDepartments(['general', 'panchakarma', 'kayachikitsa', 'shalya', 'shalakya', 'prasuti', 'kaumarabhritya', 'swasthavritta']);
        setDaysOfWeek(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);
      } catch (err) {
        console.error('Failed to fetch meta:', err);
        toast.error('Failed to load form options', { position: 'top-right' });
      }
    };
    fetchMeta();
  }, []);

  const onSubmit = async (data) => {
    try {
      // Format phone number - remove any non-digit characters
      const formattedPhone = data.phone ? data.phone.replace(/\D/g, '') : '';
      
      const formattedData = {
        ...data,
        phone: formattedPhone,
        consultationFee: Number(data.consultationFee),
        experience: data.experience ? Number(data.experience) : 0,
        maxPatientsPerDay: data.maxPatientsPerDay
          ? Number(data.maxPatientsPerDay)
          : 20,
        availableDays: data.availableDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      };

      console.log('Submitting doctor data:', formattedData);

      const response = await api.post('/doctors', formattedData);

      toast.success('Doctor created successfully!', { 
        position: 'top-right', 
        autoClose: 3000 
      });

      setSubmitSuccess(true);
      reset();
      onDoctorAdded?.();

      // Reset success state after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error('Error creating doctor:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.join(', ') || 
                          'Failed to create doctor';
      toast.error(errorMessage, { 
        position: 'top-right', 
        autoClose: 3000 
      });
    }
  };

  const handleDayToggle = (day) => {
    const newDays = availableDays.includes(day)
      ? availableDays.filter(d => d !== day)
      : [...availableDays, day];
    
    setValue('availableDays', newDays);
    trigger('availableDays');
  };

  const handleClearAll = () => {
    reset({
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
    setSubmitSuccess(false);
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
          </div>
        </div>

        {submitSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl animate-fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Doctor created successfully!</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                    {...register('name', { 
                      required: 'Name is required',
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters'
                      }
                    })}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    } focus:ring-2 focus:ring-blue-200 transition-all duration-300`}
                    placeholder="Dr. John Doe"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
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
                        message: 'Email is invalid'
                      }
                    })}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    } focus:ring-2 focus:ring-blue-200 transition-all duration-300`}
                    placeholder="doctor@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

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
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.password ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    } focus:ring-2 focus:ring-blue-200 transition-all duration-300`}
                    placeholder="••••••••"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    {...register('phone', {
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: 'Phone number must be 10 digits'
                      }
                    })}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.phone ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    } focus:ring-2 focus:ring-blue-200 transition-all duration-300`}
                    placeholder="Enter 10-digit phone number"
                    maxLength="10"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Qualifications
                  </label>
                  <input
                    type="text"
                    {...register('qualifications')}
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
                    {...register('department', { 
                      required: 'Department is required' 
                    })}
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
                    <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialization
                  </label>
                  <input
                    type="text"
                    {...register('specialization')}
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
                    {...register('consultationFee', { 
                      required: 'Consultation fee is required',
                      min: {
                        value: 0,
                        message: 'Fee must be positive'
                      }
                    })}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.consultationFee ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    } focus:ring-2 focus:ring-blue-200 transition-all duration-300`}
                    placeholder="100"
                    min="0"
                    step="0.01"
                  />
                  {errors.consultationFee && (
                    <p className="mt-1 text-sm text-red-600">{errors.consultationFee.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience (years)
                  </label>
                  <input
                    type="number"
                    {...register('experience', {
                      min: {
                        value: 0,
                        message: 'Experience cannot be negative'
                      }
                    })}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.experience ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    } focus:ring-2 focus:ring-blue-200 transition-all duration-300`}
                    placeholder="5"
                    min="0"
                  />
                  {errors.experience && (
                    <p className="mt-1 text-sm text-red-600">{errors.experience.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Patients Per Day
                  </label>
                  <input
                    type="number"
                    {...register('maxPatientsPerDay', {
                      min: {
                        value: 1,
                        message: 'Must be at least 1 patient'
                      }
                    })}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.maxPatientsPerDay ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    } focus:ring-2 focus:ring-blue-200 transition-all duration-300`}
                    placeholder="20"
                    min="1"
                  />
                  {errors.maxPatientsPerDay && (
                    <p className="mt-1 text-sm text-red-600">{errors.maxPatientsPerDay.message}</p>
                  )}
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
                          availableDays.includes(day)
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={availableDays.includes(day)}
                          onChange={() => handleDayToggle(day)}
                          className="sr-only"
                        />
                        <span className="capitalize text-sm">{day}</span>
                      </label>
                    ))}
                  </div>
                  <input type="hidden" {...register('availableDays', {
                    validate: value => value.length > 0 || 'Select at least one day'
                  })} />
                  {errors.availableDays && (
                    <p className="mt-2 text-sm text-red-600">{errors.availableDays.message}</p>
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
                        {...register('workingHours.start')}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                        defaultValue="09:00"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">End Time</label>
                      <input
                        type="time"
                        {...register('workingHours.end')}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                        defaultValue="17:00"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="px-5 py-2.5 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-all duration-300 text-sm"
                    >
                      <X className="h-4 w-4 inline mr-2" />
                      Clear All
                    </button>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {isSubmitting ? (
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