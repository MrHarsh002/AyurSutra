// Dashboard.jsx
import React, { useState, useEffect } from 'react';
import {
   XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { useNavigate } from "react-router-dom";
import { 
  FaUsers, FaCalendarAlt, FaStethoscope, FaFileInvoiceDollar, 
  FaBoxes, FaChartLine, FaUserMd, FaSyringe, FaArrowUp, FaArrowDown,
  FaCalendarCheck, FaClock, FaClipboardList, FaExclamationTriangle,
  FaMoneyBillWave, FaClipboard, FaUserPlus, FaFileMedical,
  FaArrowRight, FaPrescriptionBottleAlt, FaHospitalUser,FaClipboardCheck, FaCalendar
} from 'react-icons/fa';
import api from '../../services/api';
import '../../index.css';


const Dashboard = () => {
  const navigate = useNavigate();
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('today');
  const [dashboardStats, setDashboardStats] = useState(null);
  const [recentPatients, setRecentPatients] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null); // Added missing state
  
  // Enhanced colors with gradients
  const colors = {
    primary: '#10B981',
    secondary: '#3B82F6',
    accent: '#8B5CF6',
    warning: '#F59E0B',
    danger: '#EF4444',
    success: '#10B981',
    info: '#06B6D4',
  };

  const cardConfigs = [
    {
      id: 'patients',
      title: "Total Patients",
      icon: <FaUsers className="text-3xl" />,
      linear: 'from-emerald-500 to-emerald-700',
      hoverGradient: 'from-emerald-600 to-emerald-800',
      route: '/admin/users',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600'
    },
    {
      id: 'appointments',
      title: "Today's Appointments",
      icon: <FaCalendarAlt className="text-3xl" />,
      linear: 'from-blue-500 to-blue-700',
      hoverGradient: 'from-blue-600 to-blue-800',
      route: '/admin/appointments',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      id: 'doctors',
      title: "Active Doctors",
      icon: <FaUserMd className="text-3xl" />,
      linear: 'from-purple-500 to-purple-700',
      hoverGradient: 'from-purple-600 to-purple-800',
      route: '/admin/doctors/list',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      id: 'revenue',
      title: "Monthly Revenue",
      icon: <FaMoneyBillWave className="text-3xl" />,
      linear: 'from-amber-500 to-amber-700',
      hoverGradient: 'from-amber-600 to-amber-800',
      route: '/admin/billing',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600'
    },
    {
      id: 'inventory',
      title: "Low Stock Items",
      icon: <FaBoxes className="text-3xl" />,
      linear: 'from-rose-500 to-rose-700',
      hoverGradient: 'from-rose-600 to-rose-800',
      route: '/admin/inventory',
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-600'
    },
    {
      id: 'completion',
      title: "Completion Rate",
      icon: <FaChartLine className="text-3xl" />,
      linear: 'from-cyan-500 to-cyan-700',
      hoverGradient: 'from-cyan-600 to-cyan-800',
      route: '/admin/analytics',
      iconBg: 'bg-cyan-100',
      iconColor: 'text-cyan-600'
    }
  ];

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all dashboard data in parallel
      const [statsResponse, appointmentsResponse, patientsResponse, upcomingResponse] = await Promise.all([
        api.get('/reports/dashboard-stats'),
        api.get('/appointments', {
          params: {
            page: 1,
            limit: 5,
            date: timeRange === 'today' ? new Date().toISOString().split('T')[0] : undefined,
          }
        }),
        api.get('/patients', { params: { page: 1, limit: 5 } }),
        api.get('/appointments', {
          params: {
            page: 1,
            limit: 5,
            status: 'scheduled',
            date: { $gte: new Date().toISOString().split('T')[0] }
          }
        })
      ]);

      setDashboardStats(statsResponse.data);
      setRecentActivities(appointmentsResponse.data.appointments || []);
      setRecentPatients(patientsResponse.data.patients || []);
      setUpcomingAppointments(upcomingResponse.data.appointments || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCardValue = (cardId) => {
    if (!dashboardStats?.stats) return 0;
    
    switch(cardId) {
      case 'patients':
        return dashboardStats.stats.patients?.total || 0;
      case 'appointments':
        return dashboardStats.stats.appointments?.today || 0;
      case 'doctors':
        return dashboardStats.stats?.totalDoctors || 5;
      case 'revenue':
        return `₹${(dashboardStats.stats.financial?.monthlyRevenue || 0).toLocaleString()}`;
      case 'inventory':
        return dashboardStats.stats.inventory?.lowStockItems || 0;
      case 'completion':
        return "92%";
      default:
        return 0;
    }
  };

  const getCardChange = (cardId) => {
    // Mock percentage changes - replace with actual data
    const changes = {
      'patients': 12.5,
      'appointments': 8.3,
      'doctors': 0,
      'revenue': 18.7,
      'inventory': -5.2,
      'completion': 2.1
    };
    return changes[cardId] || 0;
  };

  const StatCard = ({ config }) => {
    const value = getCardValue(config.id);
    const change = getCardChange(config.id);
    const isPositive = change >= 0;
    
    return (
      <div 
        className={`relative overflow-hidden group cursor-pointer transition-all duration-500 ease-out transform hover:-translate-y-2`}
        onMouseEnter={() => setHoveredCard(config.id)}
        onMouseLeave={() => setHoveredCard(null)}
        onClick={() => navigate(config.route)}
      >
        {/* Background with linear and shine effect */}
        <div className={`absolute inset-0 bg-linear-to-br ${config.linear} rounded-2xl transition-all duration-500 ${hoveredCard === config.id ? config.hoverGradient : ''} group-hover:scale-105`}></div>
        
        {/* Shine effect */}
        <div className="absolute inset-0 bg-linear-to-r from-white/10 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Content */}
        <div className="relative p-6 h-full">
          <div className="flex items-start justify-between mb-6">
            <div className={`p-3 ${config.iconBg} ${config.iconColor} rounded-xl backdrop-blur-sm transition-transform duration-300 group-hover:scale-110`}>
              {config.icon}
            </div>
            
            {/* Change indicator */}
            {change !== undefined && (
              <div className={`flex items-center px-3 py-1.5 rounded-full backdrop-blur-sm transition-all duration-300 group-hover:scale-110 ${isPositive ? 'bg-green-500/20 text-green-100' : 'bg-red-500/20 text-red-100'}`}>
                {isPositive ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                <span className="font-semibold text-sm">{Math.abs(change)}%</span>
              </div>
            )}
          </div>
          
          {/* Value and title */}
          <div className="mb-2">
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            <div className="text-sm font-medium text-white/90">{config.title}</div>
          </div>
          
          {/* Footer with navigation hint */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/20">
            <span className="text-xs text-white/70">Click to view</span>
            <div className="flex items-center text-white/70 group-hover:text-white transition-colors">
              <span className="text-xs mr-2">View Details</span>
              <FaArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>
          
          {/* Hover effect border */}
          <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/20 rounded-2xl transition-all duration-300 pointer-events-none"></div>
        </div>
        
        {/* Shadow effect */}
        <div className={`absolute -bottom-2 left-4 right-4 h-4 bg-linear-to-t from-black/20 to-transparent rounded-2xl blur-md transition-all duration-300 group-hover:-bottom-3 group-hover:blur-lg`}></div>
      </div>
    );
  };

  const AppointmentCard = ({ appointment }) => {
    const getStatusColor = (status) => {
      switch(status) {
        case 'confirmed': return 'bg-green-500';
        case 'scheduled': return 'bg-blue-500';
        case 'completed': return 'bg-emerald-500';
        case 'cancelled': return 'bg-red-500';
        default: return 'bg-gray-500';
      }
    };

    return (
      <div className="group bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100 hover:border-blue-200 cursor-pointer">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(appointment.status)} mr-3 animate-pulse`}></div>
            <span className="font-semibold text-gray-800">
              {appointment.patient?.fullName || 'Unknown Patient'}
            </span>
          </div>
          <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
            {new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm mb-3">
          <div className="flex items-center text-gray-600">
            <FaUserMd className="mr-2 text-blue-500" />
            <span>{appointment.doctor?.name || 'Unknown Doctor'}</span>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {appointment.type}
          </span>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            <FaClipboard className="inline mr-1" />
            Room: {appointment.therapyRoom || 'Consultation'}
          </div>
          <button 
            className="text-xs px-3 py-1.5 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center group"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/appointments/${appointment._id}`);
            }}
          >
            <span>View Details</span>
            <FaArrowRight className="w-3 h-3 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    );
  };

  const PatientCard = ({ patient }) => (
    <div className="group bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100 hover:border-emerald-200 cursor-pointer"
         onClick={() => navigate(`/patients/${patient._id}`)}>
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-10 h-10 bg-linear-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
          {patient.name?.charAt(0) || 'P'}
        </div>
        <div>
          <div className="font-semibold text-gray-800">{patient.fullName}</div>
          <div className="text-xs text-gray-500">{patient.patientId}</div>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center text-gray-600">
          <FaCalendar className="mr-2 text-gray-400" />
          <span className="text-xs">
            {new Date(patient.createdAt).toLocaleDateString()}
          </span>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          patient.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {patient.status || 'active'}
        </span>
      </div>
    </div>
  );

  const QuickActionButton = ({ icon, label, linear, onClick }) => (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden bg-linear-to-br ${linear} rounded-xl p-4 text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1 active:translate-y-0`}
    >
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div className="mb-3 transform transition-transform duration-300 group-hover:scale-110">
          {icon}
        </div>
        <span className="text-sm font-medium text-center">{label}</span>
      </div>
      
      {/* Hover shine effect */}
      <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-[100%] transition-transform duration-700"></div>
    </button>
  );

  const AlertItem = ({ type, title, description, icon }) => {
    const alertConfigs = {
      warning: { bg: 'bg-amber-50', border: 'border-l-amber-500', text: 'text-amber-800' },
      danger: { bg: 'bg-red-50', border: 'border-l-red-500', text: 'text-red-800' },
      info: { bg: 'bg-blue-50', border: 'border-l-blue-500', text: 'text-blue-800' },
      success: { bg: 'bg-green-50', border: 'border-l-green-500', text: 'text-green-800' }
    };
    
    const config = alertConfigs[type] || alertConfigs.info;
    
    return (
      <div className={`${config.bg} ${config.border} border-l-4 p-3 rounded-r-lg hover:shadow-md transition-shadow duration-200`}>
        <div className="flex items-start">
          {icon && <div className={`mt-0.5 mr-3 flex shrink-0 ${config.text}`}>{React.createElement(icon)}</div>}
          <div>
            <div className={`font-medium ${config.text}`}>{title}</div>
            <div className="text-sm text-gray-600 mt-1">{description}</div>
          </div>
        </div>
      </div>
    );
  };

  const generateChartData = () => {
    // Generate realistic data for the last 7 days
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, index) => ({
      name: day,
      appointments: Math.floor(Math.random() * 30) + 20,
      revenue: Math.floor(Math.random() * 40000) + 20000
    }));
  };

  const generatePatientDemographics = () => {
    return [
      { name: '18-30', value: 35, color: colors.primary },
      { name: '31-45', value: 28, color: colors.secondary },
      { name: '46-60', value: 22, color: colors.accent },
      { name: '60+', value: 15, color: colors.warning },
    ];
  };
if (loading) {
  return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-500/30 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
  );
}
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              AyurSutra Dashboard
            </h1>
          </div>
          
          <div className="mt-4 md:mt-0">
            <div className="flex flex-wrap gap-2 bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-sm">
              {['today', 'week', 'month', 'year'].map((range) => (
                <button
                  key={range}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                    timeRange === range 
                      ? 'bg-linear-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                  onClick={() => setTimeRange(range)}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="items-center text-sm text-gray-500 bg-white/50 backdrop-blur-sm rounded-xl px-4 py-2.5 inline-flex">
          <FaClock className="mr-2 text-blue-500" />
          <span>Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {cardConfigs.map((config) => (
          <StatCard key={config.id} config={config} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Appointments & Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2 sm:mb-0">Appointments & Revenue Trend</h2>
            <select className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all duration-200">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last Quarter</option>
            </select>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={generateChartData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    background: 'white',
                    padding: '12px'
                  }}
                  formatter={(value, name) => {
                    if (name === 'revenue') return [`₹${value.toLocaleString()}`, 'Revenue'];
                    return [value, 'Appointments'];
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="appointments" 
                  stroke={colors.secondary} 
                  fill="url(#gradientAppointments)"
                  strokeWidth={2}
                  name="Appointments"
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke={colors.success} 
                  fill="url(#gradientRevenue)"
                  strokeWidth={2}
                  name="Revenue"
                />
                <defs>
                  <linearGradient id="gradientAppointments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.secondary} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={colors.secondary} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gradientRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.success} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={colors.success} stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Patient Demographics */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Patient Age Distribution</h2>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={generatePatientDemographics()}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {generatePatientDemographics().map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      className="transition-all duration-300 hover:opacity-80"
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Patients']}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    background: 'white'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-3">
            {generatePatientDemographics().map((item, index) => (
              <div key={index} className="flex items-center bg-gray-50 rounded-lg p-2">
                <div 
                  className="w-3 h-3 rounded-full mr-2 shadow-sm"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-700 font-medium">{item.name}</span>
                <span className="ml-auto text-sm font-bold text-gray-800">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Appointments */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Today's Appointments</h2>
              <button 
                className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer flex items-center transition-colors duration-200"
                onClick={() => navigate('/admin/appointments')}
              >
                View All
                <FaArrowRight className="ml-2 w-3 h-3" />
              </button>
            </div>
            
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((appointment, index) => (
                  <AppointmentCard 
                    key={appointment._id || index} 
                    appointment={appointment} 
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
                    <FaCalendarCheck className="text-3xl text-blue-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No appointments scheduled for today</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Patients */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Recent Patients</h2>
              <button 
                className="text-emerald-600 hover:text-emerald-800 font-medium cursor-pointer flex items-center transition-colors duration-200"
                onClick={() => navigate('/admin/patients/list')}
              >
                View All
                <FaArrowRight className="ml-2 w-3 h-3" />
              </button>
            </div>
            
            <div className="space-y-4">
              {recentPatients.length > 0 ? (
                recentPatients.map((patient, index) => (
                  <PatientCard key={patient._id || index} patient={patient} />
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">No recent patients</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions & Alerts */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <QuickActionButton 
                icon={<FaCalendarAlt className="text-2xl" />}
                label="New Appointment"
                linear="from-emerald-500 to-emerald-600 cursor-pointer"
                onClick={() => navigate('/admin/appointments')}
              />
              
              <QuickActionButton
                icon={<FaUserPlus className="text-2xl" />}
                label="Register Patient"
                linear="from-blue-500 to-blue-600 cursor-pointer"
                onClick={() => navigate('/admin/patients/add')}
              />
              
              <QuickActionButton
                icon={<FaFileInvoiceDollar className="text-2xl " />}
                label="Create Invoice"
                linear="from-purple-500 to-purple-600 cursor-pointer"
                onClick={() => navigate('/admin/inventory')}
              />
              
              <QuickActionButton
                icon={<FaClipboardList className="text-2xl" />}
                label="Generate Report"
                linear="from-amber-500 to-amber-600 cursor-pointer"
                onClick={() => navigate('/admin/reports')}
              />
            </div>
          </div>

          {/* System Alerts */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">System Alerts</h2>
              <FaExclamationTriangle className="text-amber-500 text-xl" />
            </div>
            
            <div className="space-y-3">
              {dashboardStats?.stats?.inventory?.lowStockItems > 0 && (
                <AlertItem
                  type="danger"
                  title={`${dashboardStats.stats.inventory.lowStockItems} items are low in stock`}
                  description="Requires immediate attention"
                  icon={FaBoxes}
                />
              )}
              
              <AlertItem
                type="warning"
                title="3 appointments pending confirmation"
                description="Send reminders to patients"
                icon={FaCalendarAlt}
              />
              
              <AlertItem
                type="info"
                title="2 prescriptions ready for review"
                description="Doctor approval required"
                icon={FaPrescriptionBottleAlt}
              />
              
              <AlertItem
                type="success"
                title="System backup completed"
                description="Last backup: Today, 02:00 AM"
                icon={FaClipboardCheck}
              />
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Upcoming</h2>
              <FaClock className="text-blue-500 text-xl" />
            </div>
            
            <div className="space-y-3">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.slice(0, 3).map((appointment, index) => (
                  <div key={index} className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200 cursor-pointer"
                       onClick={() => navigate(`/admin/appointments/${appointment._id}`)}>
                    <div className="flex shrink-0 w-8 h-8 bg-blue-500 rounded-full items-center justify-center text-white text-xs font-bold mr-3">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {appointment.patient?.fullName || 'Patient'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <FaArrowRight className="text-gray-400 w-3 h-3 ml-2" />
                  </div>
                ))
              ) : (
                <div className="text-center py-3">
                  <p className="text-gray-500 text-sm">No upcoming appointments</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
             onClick={() => navigate('/patients')}>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {dashboardStats?.stats?.patients?.newThisMonth || 0}
            </div>
            <div className="text-sm text-gray-600">New Patients This Month</div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
             onClick={() => navigate('/admin/appointments')}>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {dashboardStats?.stats?.appointments?.thisWeek || 0}
            </div>
            <div className="text-sm text-gray-600">Appointments This Week</div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
             onClick={() => navigate('/admin/billing')}>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 mb-1">
              ₹{((dashboardStats?.stats?.financial?.collected || 0) / 1000).toFixed(0)}K
            </div>
            <div className="text-sm text-gray-600">Revenue Collected</div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
             onClick={() => navigate('/admin/reports')}>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 mb-1">92%</div>
            <div className="text-sm text-gray-600">Patient Satisfaction</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;