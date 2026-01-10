import React, { useState, useEffect } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreVertical,
  Filter,
  Download,
  UserCheck,
  UserX,
  CalendarCheck,
  RefreshCw
} from 'lucide-react';
import  doctorApi  from '../../../services/doctorApi';

const DoctorSchedule = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [doctorData, setDoctorData] = useState(null);
  const [scheduleData, setScheduleData] = useState({
    timeSlots: [],
    appointments: [],
    stats: {
      totalAppointments: 0,
      completed: 0,
      pending: 0,
      cancelled: 0
    }
  });
  const [loading, setLoading] = useState(false);
  const [doctorLoading, setDoctorLoading] = useState(false);
  const [error, setError] = useState(null);

  //
  const fetchDoctors = async () => {
    try {
      setDoctorLoading(true);
      const response = await doctorApi.getDoctors({
        page: 1,
        limit: 10
      });
      
      if (response.success) {
        setDoctors(response.doctors);
        if (response.doctors.length > 0 && !selectedDoctor) {
          setSelectedDoctor(response.doctors[0]._id);
        }
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError(err.response?.data?.message || 'Failed to fetch doctors');
    } finally {
      setDoctorLoading(false);
    }
  };

  
const fetchDoctorSchedule = async () => {
  if (!selectedDoctor) return;

  try {
    setLoading(true);

    const data = await doctorApi.getDoctorSchedule(selectedDoctor, selectedDate);

    if (!data || !data.doctor) {
      throw new Error("Doctor schedule not found or invalid response.");
    }

    const {
      doctor,
      timeSlots = [],
      appointments = [],
      stats = {}
    } = data;

    setDoctorData({
      ...doctor,
      email: doctor.email || "No email provided",
      phone: doctor.phone || "N/A",
      department: doctor.department || "General",
      workingHours: doctor.workingHours || { start: "09:00", end: "17:00" },
      maxPatientsPerDay: doctor.maxPatientsPerDay || 20,
      availableDays: doctor.availableDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    });

    setScheduleData({
      timeSlots: timeSlots.map(slot => ({
        ...slot,
        time: slot.time || "00:00",
        appointment: slot.appointment ? {
          ...slot.appointment,
          patient: slot.appointment.patient || {
            fullName: "Unknown Patient",
            patientId: "N/A",
            phone: "N/A"
          }
        } : null
      })),
      appointments,
      stats: {
        totalAppointments: stats.totalAppointments || 0,
        completed: stats.completed || 0,
        pending: stats.pending || 0,
        cancelled: stats.cancelled || 0,
        confirmed: stats.confirmed || 0
      }
    });

  } catch (error) {
    console.error("Error fetching schedule:", error);
    setError(error.message || "Schedule load nahi ho paaya.");

    setScheduleData({
      timeSlots: generateDefaultTimeSlots(),
      appointments: [],
      stats: {
        totalAppointments: 0,
        completed: 0,
        pending: 0,
        cancelled: 0,
        confirmed: 0
      }
    });
  } finally {
    setLoading(false);
  }
};


  const generateDefaultTimeSlots = () => {
    const slots = [];
    const startHour = 9;
    const endHour = 17;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          time: timeString,
          appointment: null
        });
      }
    }
    
    return slots;
  };

  useEffect(() => {
    fetchDoctors();
  }, []);


  useEffect(() => {
    if (selectedDoctor) {
      fetchDoctorSchedule();
    }
  }, [selectedDoctor, selectedDate]);

  const navigateDate = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction);
    setSelectedDate(newDate);
  };

  const formatTime = (timeString) => {
    if (!timeString || typeof timeString !== "string") return "N/A";

    const parts = timeString.split(":");
    const hours = parseInt(parts[0], 10);
    const minutes = parts[1] || "00";

    if (isNaN(hours)) return "N/A";

    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 || 12;

    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'scheduled': 'bg-blue-100 text-blue-800',
      'confirmed': 'bg-green-100 text-green-800',
      'checked-in': 'bg-purple-100 text-purple-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-emerald-100 text-emerald-800',
      'cancelled': 'bg-red-100 text-red-800',
      'no-show': 'bg-gray-100 text-gray-800'
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      setLoading(true);
      await appointmentApi.updateAppointmentStatus(appointmentId, newStatus);
      

      fetchDoctorSchedule();
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDoctors();
    if (selectedDoctor) {
      fetchDoctorSchedule();
    }
  };
const handleExport = async () => {
  try {
    if (!selectedDoctor || !selectedDate) {
      setError("Doctor aur date select kare.");
      return;
    }

    const formattedDate = selectedDate.toISOString().split("T")[0];

    const data = await doctorApi.exportSchedule(
      selectedDoctor,
      formattedDate,
      formattedDate
    );

    console.log("📌 Export Result:", data);
    alert(`Export Successful!\nAppointments: ${data.data.stats.totalAppointments}`);

  } catch (err) {
    console.error("Export Error:", err.message);
    setError(err.message || "Failed to export schedule");
  }
};


  const getCurrentDoctor = () => {
    return doctors.find(d => d._id === selectedDoctor);
  };

  return (
    <div className="space-y-6">
      {/* Header with Date Navigation */}
      <div className="bg-linear-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Medical Schedule</h2>
              <p className="text-gray-600">Manage and view doctor appointments</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateDate(-1)}
              className="p-2 rounded-lg border border-gray-200 hover:bg-white transition-colors"
              aria-label="Previous day"
              disabled={loading}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {formatDate(selectedDate)}
              </div>
              <div className="text-sm text-gray-500">
                {selectedDate.toDateString() === new Date().toDateString() ? 'Today' : ''}
              </div>
            </div>
            
            <button
              onClick={() => navigateDate(1)}
              className="p-2 rounded-lg border border-gray-200 hover:bg-white transition-colors"
              aria-label="Next day"
              disabled={loading}
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
              disabled={loading}
            >
              Today
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex shrink-0" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  handleRefresh();
                }}
                className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Selection and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Doctor Selection Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 h-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Doctor</h3>
            
            {doctorLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-full p-4 rounded-xl border border-gray-200 animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {doctors.map(doctor => {
                  const doctorUser = doctor.user || {};
                  const isCurrent = selectedDoctor === doctor._id;
                  
                  return (
                    <button
                      key={doctor._id}
                      onClick={() => setSelectedDoctor(doctor._id)}
                      className={`w-full p-4 rounded-xl border transition-all duration-300 ${
                        isCurrent
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                          isCurrent ? 'bg-linear-to-br from-blue-500 to-indigo-500' : 'bg-linear-to-br from-blue-100 to-indigo-100'
                        }`}>
                          <span className={`font-bold ${isCurrent ? 'text-white' : 'text-blue-600'}`}>
                            {doctorUser.name?.charAt(0)?.toUpperCase() || 'D'}
                          </span>
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {doctorUser.name || 'Unknown Doctor'}
                          </div>
                          <div className="text-sm text-gray-500 capitalize truncate">
                            {doctor.department || 'General'}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {doctor.availableDays?.join(', ') || 'Mon-Fri'}
                          </div>
                        </div>
                        {doctor.isAvailable !== false ? (
                          <div className="flex flex-col items-center">
                            <CheckCircle className="h-5 w-5 text-green-500 flex shrink-0" />
                            <span className="text-xs text-green-600 mt-1">Available</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <XCircle className="h-5 w-5 text-red-500 flex shrink-0" />
                            <span className="text-xs text-red-600 mt-1">Unavailable</span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Doctor Information */}
            {doctorData && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-3">Doctor Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-2 flex shrink-0 text-gray-400" />
                    <span className="text-sm truncate" title={doctorData.email}>
                      {doctorData.email || 'No email'}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2 flex shrink-0 text-gray-400" />
                    <span className="text-sm">
                      {doctorData.phone || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2 flex shrink-0 text-gray-400" />
                    <span className="text-sm">
                      {doctorData.workingHours?.start || '09:00'} - {doctorData.workingHours?.end || '17:00'}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <CalendarCheck className="h-4 w-4 mr-2 flex shrink-0 text-gray-400" />
                    <span className="text-sm">
                      Max Patients: {doctorData.maxPatientsPerDay || 20} per day
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Schedule Content */}
        <div className="lg:col-span-3">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Appointments</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{scheduleData.stats.totalAppointments}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{scheduleData.stats.pending}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{scheduleData.stats.completed}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Cancelled</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{scheduleData.stats.cancelled}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Time Slot Schedule */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Daily Schedule</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {doctorData ? doctorData.name : 'Select a doctor'} - {formatDate(selectedDate)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                    onClick={handleRefresh}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                        Refreshing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </>
                    )}
                  </button>
                  <button 
                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                    onClick={handleExport}
                    disabled={!selectedDoctor || loading}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </button>
                  <button 
                    className="px-4 py-2 text-sm font-medium text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors flex items-center"
                    onClick={() => window.location.href = '/appointments/new'}
                  >
                    <CalendarCheck className="h-4 w-4 mr-2" />
                    New Appointment
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading schedule...</p>
              </div>
            ) : !selectedDoctor ? (
              <div className="p-12 text-center">
                <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Doctor</h3>
                <p className="text-gray-500">Please select a doctor from the left panel to view their schedule</p>
              </div>
            ) : scheduleData.timeSlots.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {scheduleData.timeSlots.map((slot, index) => (
                  <div
                    key={slot.time || index}
                    className="p-6 hover:bg-gray-50 transition-all duration-300"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start space-x-6 flex-1">
                        <div className="w-28 lg:w-32 flex shrink-0 flex-col">
                          <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-gray-400 flex shrink-0" />
                            <span className="font-medium text-gray-900">
                              {formatTime(slot.time)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {slot.time}
                          </div>
                        </div>

                        {slot.appointment ? (
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 bg-linear-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center shrink-0">
                                    <User className="h-5 w-5 text-blue-600" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-medium text-gray-900 truncate">
                                      {slot.appointment.patient?.fullName || 'Unknown Patient'}
                                    </div>
                                    <div className="text-sm text-gray-500 truncate">
                                      ID: {slot.appointment.patient?.patientId || 'N/A'} • 
                                      Phone: {slot.appointment.patient?.phone || 'N/A'}
                                    </div>
                                    {slot.appointment.purpose && (
                                      <div className="text-sm text-gray-600 mt-1">
                                        Purpose: {slot.appointment.purpose}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                <select
                                  value={slot.appointment.status}
                                  onChange={(e) => handleStatusUpdate(slot.appointment._id, e.target.value)}
                                  className={`px-3 py-1.5 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer ${getStatusColor(slot.appointment.status)}`}
                                  disabled={loading}
                                >
                                  <option value="scheduled">Scheduled</option>
                                  <option value="confirmed">Confirmed</option>
                                  <option value="checked-in">Checked In</option>
                                  <option value="in-progress">In Progress</option>
                                  <option value="completed">Completed</option>
                                  <option value="cancelled">Cancelled</option>
                                  <option value="no-show">No Show</option>
                                </select>
                                <button 
                                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                  onClick={() => window.location.href = `/appointments/${slot.appointment._id}`}
                                >
                                  <MoreVertical className="h-5 w-5 text-gray-400" />
                                </button>
                              </div>
                            </div>
                            
                            {slot.appointment.notes && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                <div className="text-sm text-gray-600">
                                  <span className="font-medium">Notes:</span> {slot.appointment.notes}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex-1 flex items-center justify-center py-2">
                            <div className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-50 border border-gray-200">
                              <span className="text-gray-500 text-sm">Available time slot</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointments Scheduled</h3>
                <p className="text-gray-500 mb-4">
                  {doctorData 
                    ? `No appointments are scheduled for Dr. ${doctorData.name} on ${formatDate(selectedDate)}`
                    : 'Select a doctor to view schedule'
                  }
                </p>
                <button
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                  onClick={() => window.location.href = '/appointments/new'}
                >
                  <CalendarCheck className="h-4 w-4" />
                  Schedule New Appointment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSchedule;