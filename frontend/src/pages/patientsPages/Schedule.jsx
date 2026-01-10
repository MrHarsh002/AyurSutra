// pages/SchedulePage.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';

const SchedulePage = () => {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: 'all',
    department: 'all'
  });

  // Days of week
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Time slots
  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
    '04:00 PM', '04:30 PM', '05:00 PM'
  ];

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100
    });
    
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch doctors
      const doctorsRes = await fetch('/api/doctors?limit=50');
      const doctorsData = await doctorsRes.json();
      if (doctorsData.success) {
        setDoctors(doctorsData.doctors);
      }
      
      // Fetch appointments
      const appointmentsRes = await fetch(`/api/appointments?date=${selectedDate}`);
      const appointmentsData = await appointmentsRes.json();
      if (appointmentsData.success) {
        setAppointments(appointmentsData.data);
      }
      
      // Fetch stats
      const statsRes = await fetch('/api/doctors/stats');
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.data);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter appointments based on selected criteria
  const filteredAppointments = appointments.filter(apt => {
    if (filter.status !== 'all' && apt.status !== filter.status) return false;
    if (selectedDoctor && apt.doctor?._id !== selectedDoctor) return false;
    if (filter.department !== 'all' && apt.doctor?.department !== filter.department) return false;
    return true;
  });

  // Get appointments for a specific doctor and time
  const getAppointmentForSlot = (doctorId, time) => {
    return filteredAppointments.find(apt => 
      apt.doctor?._id === doctorId && 
      apt.time === time
    );
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'scheduled': 'bg-blue-100 text-blue-800',
      'confirmed': 'bg-green-100 text-green-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-purple-100 text-purple-800',
      'cancelled': 'bg-red-100 text-red-800',
      'no-show': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Get department color
  const getDepartmentColor = (department) => {
    const colors = {
      'general': 'bg-blue-50 border-blue-200',
      'panchakarma': 'bg-green-50 border-green-200',
      'kayachikitsa': 'bg-purple-50 border-purple-200',
      'shalya': 'bg-red-50 border-red-200',
      'shalakya': 'bg-yellow-50 border-yellow-200',
      'prasuti': 'bg-pink-50 border-pink-200',
      'kaumarabhritya': 'bg-indigo-50 border-indigo-200',
      'swasthavritta': 'bg-teal-50 border-teal-200'
    };
    return colors[department] || 'bg-gray-50 border-gray-200';
  };

  // Format time for display
  const formatTime = (time) => {
    return time ? time.replace(' AM', '').replace(' PM', '') : '';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8" data-aos="fade-down">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Doctor Schedule</h1>
            <p className="text-gray-600 mt-2">View and manage doctor appointments</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
              <span className="text-gray-600 text-sm">Today: </span>
              <span className="font-semibold text-gray-900">
                {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div 
            className="bg-white p-6 rounded-xl shadow-sm border border-blue-100"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Doctors</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDoctors || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white p-6 rounded-xl shadow-sm border border-green-100"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Available Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.availableToday || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white p-6 rounded-xl shadow-sm border border-purple-100"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            data-aos="fade-up"
            data-aos-delay="300"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Avg. Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white p-6 rounded-xl shadow-sm border border-yellow-100"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            data-aos="fade-up"
            data-aos-delay="400"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-100">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Today's Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.appointmentsToday || 0}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border" data-aos="fade-up">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Doctor</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
            >
              <option value="">All Doctors</option>
              {doctors.map(doctor => (
                <option key={doctor._id} value={doctor._id}>
                  Dr. {doctor.user?.name} - {doctor.specialization?.[0] || doctor.department}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Status</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filter.status}
              onChange={(e) => setFilter({...filter, status: e.target.value})}
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filter.department}
              onChange={(e) => setFilter({...filter, department: e.target.value})}
            >
              <option value="all">All Departments</option>
              <option value="general">General</option>
              <option value="panchakarma">Panchakarma</option>
              <option value="kayachikitsa">Kayachikitsa</option>
              <option value="shalya">Shalya</option>
              <option value="shalakya">Shalakya</option>
              <option value="prasuti">Prasuti</option>
              <option value="kaumarabhritya">Kaumarabhritya</option>
              <option value="swasthavritta">Swasthavritta</option>
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64" data-aos="fade-up">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Schedule Grid */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden mb-6" data-aos="fade-up">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                      Time
                    </th>
                    {doctors.map((doctor, index) => (
                      <th 
                        key={doctor._id} 
                        className={`px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${getDepartmentColor(doctor.department)}`}
                        data-aos="fade-left"
                        data-aos-delay={index * 100}
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {doctor.user?.photo ? (
                              <img className="h-10 w-10 rounded-full" src={doctor.user.photo} alt="" />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-500 font-bold">
                                  {doctor.user?.name?.charAt(0) || 'D'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              Dr. {doctor.user?.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {doctor.specialization?.[0] || doctor.department}
                            </div>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {timeSlots.map((time, timeIndex) => (
                    <tr key={time} data-aos="fade-up" data-aos-delay={timeIndex * 50}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50 sticky left-0 z-10">
                        {time}
                      </td>
                      {doctors.map((doctor, doctorIndex) => {
                        const appointment = getAppointmentForSlot(doctor._id, time);
                        return (
                          <td 
                            key={`${doctor._id}-${time}`}
                            className="px-6 py-4 whitespace-nowrap text-sm border"
                            data-aos="zoom-in"
                            data-aos-delay={timeIndex * 50 + doctorIndex * 10}
                          >
                            {appointment ? (
                              <motion.div 
                                className={`p-3 rounded-lg border-l-4 ${
                                  appointment.status === 'completed' ? 'border-l-green-500' :
                                  appointment.status === 'in-progress' ? 'border-l-yellow-500' :
                                  appointment.status === 'confirmed' ? 'border-l-blue-500' :
                                  'border-l-gray-500'
                                } ${getDepartmentColor(doctor.department)}`}
                                whileHover={{ scale: 1.02 }}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {appointment.patient?.name || 'Unknown Patient'}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">
                                      {appointment.type} • {appointment.duration}min
                                    </div>
                                  </div>
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                                    {appointment.status.replace('-', ' ')}
                                  </span>
                                </div>
                                <div className="mt-2 text-xs text-gray-500">
                                  Room: {appointment.therapyRoom || 'Consultation'}
                                </div>
                              </motion.div>
                            ) : (
                              <div className="text-gray-400 text-center p-4">
                                <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-xs mt-1 block">Available</span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upcoming Appointments List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Appointments */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden" data-aos="fade-right">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
              </div>
              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {filteredAppointments
                  .filter(apt => ['scheduled', 'confirmed'].includes(apt.status))
                  .slice(0, 10)
                  .map((appointment, index) => (
                    <motion.div 
                      key={appointment._id}
                      className="p-4 hover:bg-gray-50"
                      whileHover={{ x: 5 }}
                      data-aos="fade-up"
                      data-aos-delay={index * 100}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-bold">
                                {appointment.patient?.name?.charAt(0) || 'P'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.patient?.name || 'Unknown Patient'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {appointment.time} • {appointment.doctor?.user?.name ? `Dr. ${appointment.doctor.user.name}` : 'Unknown Doctor'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                      {appointment.purpose && (
                        <div className="mt-3 text-sm text-gray-600">
                          <span className="font-medium">Purpose:</span> {appointment.purpose}
                        </div>
                      )}
                    </motion.div>
                  ))}
              </div>
            </div>

            {/* Available Doctors */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden" data-aos="fade-left">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Available Doctors Today</h3>
              </div>
              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {doctors
                  .filter(doctor => doctor.isAvailable)
                  .slice(0, 10)
                  .map((doctor, index) => (
                    <motion.div 
                      key={doctor._id}
                      className="p-4 hover:bg-gray-50"
                      whileHover={{ x: 5 }}
                      data-aos="fade-up"
                      data-aos-delay={index * 100}
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {doctor.user?.photo ? (
                            <img className="h-12 w-12 rounded-full" src={doctor.user.photo} alt={doctor.user.name} />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 font-bold text-lg">
                                {doctor.user?.name?.charAt(0) || 'D'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                Dr. {doctor.user?.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {doctor.specialization?.join(', ') || doctor.department}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">
                                ₹{doctor.consultationFee}
                              </div>
                              <div className="text-xs text-gray-500">
                                Consultation Fee
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center">
                            <div className="flex items-center">
                              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="ml-1 text-sm text-gray-600">
                                {doctor.rating ? doctor.rating.toFixed(1) : 'N/A'} ({doctor.totalRatings || 0})
                              </span>
                            </div>
                            <div className="ml-4 text-sm text-gray-500">
                              {doctor.experience || 0} years exp.
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SchedulePage;