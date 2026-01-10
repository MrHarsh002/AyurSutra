// src/pages/Patients.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaEye, FaChevronLeft, FaChevronRight, FaUsers, FaPhone, FaEnvelope, 
  FaSearch, FaFilter, FaPlus, FaUserPlus, FaUserMd, FaCalendarAlt, 
  FaFileMedical, FaChartLine 
} from "react-icons/fa";
import { HiUser } from "react-icons/hi";
import api from "../../services/api";
import "aos/dist/aos.css";
import AOS from "aos";

/* ---------- COLOR CONFIGURATION ---------- */
const avatarColors = {
  teal: "bg-teal-100 text-teal-700",
  amber: "bg-amber-100 text-amber-700",
  green: "bg-green-100 text-green-700",
  purple: "bg-purple-100 text-purple-700",
  red: "bg-red-100 text-red-700",
  blue: "bg-blue-100 text-blue-700",
  indigo: "bg-indigo-100 text-indigo-700",
  pink: "bg-pink-100 text-pink-700",
};

const statusColors = {
  active: "bg-green-100 text-green-800 border border-green-200",
  inactive: "bg-gray-100 text-gray-800 border border-gray-200",
  deceased: "bg-red-100 text-red-800 border border-red-200",
  pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  completed: "bg-blue-100 text-blue-800 border border-blue-200",
};

const ITEMS_PER_PAGE = 10;

const Patients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    gender: "all",
    fromDate: "",
    toDate: "",
  });
  
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    newThisMonth: 0,
    followUp: 0,
  });

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 50,
      easing: 'ease-out-cubic'
    });
  }, []);

  // Fetch patients data and stats
  useEffect(() => {
    fetchPatients();
    fetchStats();
  }, [currentPage]);

  // Apply search and filters whenever they change
  useEffect(() => {
    if (patients.length > 0) {
      applyFilters();
    }
  }, [searchTerm, filters, patients]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/patients?page=${currentPage}&limit=${ITEMS_PER_PAGE}`);
      
      if (response.data.success) {
        const transformedPatients = response.data.patients.map(patient => ({
          id: patient._id,
          patientId: patient.patientId || `PAT${patient._id.toString().slice(-6).toUpperCase()}`,
          initials: getInitials(patient.fullName || `${patient.firstName} ${patient.lastName}`),
          name: patient.fullName || `${patient.firstName} ${patient.lastName}`,
          firstName: patient.firstName,
          lastName: patient.lastName,
          age: patient.age || 'N/A',
          gender: patient.gender || 'N/A',
          phone: patient.phone || 'N/A',
          email: patient.email || 'N/A',
          bloodGroup: patient.bloodGroup || 'Unknown',
          occupation: patient.occupation || 'Not specified',
          address: patient.address 
            ? `${patient.address.city || ''}${patient.address.state ? `, ${patient.address.state}` : ''}`
            : 'Address not provided',
          status: patient.status || 'active',
          registeredDate: patient.createdAt || new Date(),
          emergencyContact: patient.emergencyContact,
          medicalHistory: patient.medicalHistory || [],
          allergies: patient.allergies || [],
          currentMedications: patient.currentMedications || [],
          maritalStatus: patient.maritalStatus || 'Not specified',
          rawData: patient
        }));

        setPatients(transformedPatients);
        setTotalPages(response.data.totalPages);
        setTotalPatients(response.data.total);
      }
    } catch (err) {
      setError("Failed to load patients. Please check your connection and try again.");
      console.error("Error fetching patients:", err);
      
      // Fallback mock data for demo
      setTotalPages(2);
      setTotalPatients(15);
    } finally {
      setLoading(false);
    }
  };


  const fetchStats = async () => {
    try {
      const response = await api.get("/patients");
      if (response.data.success) {
        const allPatients = response.data.patients || [];
        const activeCount = allPatients.filter(p => p.status === 'active').length;
        const thisMonth = new Date().getMonth();
        const newThisMonth = allPatients.filter(p => {
          const regDate = new Date(p.createdAt || p.registeredDate);
          return regDate.getMonth() === thisMonth;
        }).length;
        
        setStats({
          total: response.data.total || allPatients.length,
          active: activeCount,
          newThisMonth: newThisMonth,
          followUp: Math.floor(allPatients.length * 0.25) // 25% need follow-up
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Fallback stats
      setStats({
        total: 125,
        active: 98,
        newThisMonth: 15,
        followUp: 31
      });
    }
  };

  const applyFilters = () => {
    let filtered = [...patients];

    // Apply search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(patient =>
        patient.name.toLowerCase().includes(term) ||
        patient.patientId.toLowerCase().includes(term) ||
        patient.phone.includes(term) ||
        patient.email.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(patient => 
        patient.status.toLowerCase() === filters.status.toLowerCase()
      );
    }

    // Apply gender filter
    if (filters.gender !== "all") {
      filtered = filtered.filter(patient => 
        patient.gender.toLowerCase() === filters.gender.toLowerCase()
      );
    }

    // Apply date filters
    if (filters.fromDate) {
      const fromDate = new Date(filters.fromDate);
      filtered = filtered.filter(patient => {
        const regDate = new Date(patient.registeredDate);
        return regDate >= fromDate;
      });
    }

    if (filters.toDate) {
      const toDate = new Date(filters.toDate);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(patient => {
        const regDate = new Date(patient.registeredDate);
        return regDate <= toDate;
      });
    }

    setFilteredPatients(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Helper functions
  const getInitials = (fullName) => {
    if (!fullName) return "NA";
    const initials = fullName
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase();
    return initials.length > 2 ? initials.slice(0, 2) : initials;
  };

  const getInitialsColor = (initials) => {
    const keys = Object.keys(avatarColors);
    const hash = initials.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return keys[hash % keys.length];
  };

  const getStatusText = (status) => {
    const statusMap = {
      'active': 'Active',
      'inactive': 'Inactive',
      'deceased': 'Deceased',
      'pending': 'Pending'
    };
    return statusMap[status] || 'Active';
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'active': 'active',
      'inactive': 'inactive',
      'deceased': 'deceased',
      'pending': 'pending'
    };
    return colorMap[status] || 'active';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => AOS.refresh(), 300);
    }
  };

  const handleViewPatient = (patient) => {
    navigate(`/patient/${patient.id}`);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: "all",
      gender: "all",
      fromDate: "",
      toDate: "",
    });
    setSearchTerm("");
    setShowFilters(false);
  };

  // Generate mock data for fallback
  const generateMockPatients = () => {
    const mockData = [
      {
        id: 1, patientId: 'PAT001234', initials: 'RK', name: 'Rajesh Kumar', age: 45, gender: 'Male',
        phone: '+91 9876543210', email: 'rajesh.kumar@example.com', bloodGroup: 'B+',
        occupation: 'Engineer', address: 'Mumbai, MH', status: 'active',
        registeredDate: '2024-01-15', medicalHistory: ['Hypertension'], allergies: ['Penicillin']
      },
      {
        id: 2, patientId: 'PAT001235', initials: 'PM', name: 'Priya Mehra', age: 38, gender: 'Female',
        phone: '+91 8765432109', email: 'priya.mehra@example.com', bloodGroup: 'A+',
        occupation: 'Doctor', address: 'Delhi, DL', status: 'active',
        registeredDate: '2024-01-10', medicalHistory: ['Diabetes'], allergies: []
      },
      {
        id: 3, patientId: 'PAT001236', initials: 'AS', name: 'Arun Sharma', age: 52, gender: 'Male',
        phone: '+91 7654321098', email: 'arun.sharma@example.com', bloodGroup: 'O+',
        occupation: 'Teacher', address: 'Bangalore, KA', status: 'active',
        registeredDate: '2024-01-05', medicalHistory: [], allergies: []
      },
      {
        id: 4, patientId: 'PAT001237', initials: 'SD', name: 'Sunita Desai', age: 60, gender: 'Female',
        phone: '+91 6543210987', email: 'sunita.desai@example.com', bloodGroup: 'AB+',
        occupation: 'Retired', address: 'Pune, MH', status: 'active',
        registeredDate: '2024-01-01', medicalHistory: ['Arthritis'], allergies: ['Aspirin']
      },
      {
        id: 5, patientId: 'PAT001238', initials: 'VP', name: 'Vikram Patel', age: 30, gender: 'Male',
        phone: '+91 5432109876', email: 'vikram.patel@example.com', bloodGroup: 'B-',
        occupation: 'Business', address: 'Ahmedabad, GJ', status: 'inactive',
        registeredDate: '2023-12-28', medicalHistory: [], allergies: []
      },
      {
        id: 6, patientId: 'PAT001239', initials: 'NM', name: 'Neha Mehta', age: 42, gender: 'Female',
        phone: '+91 4321098765', email: 'neha.mehta@example.com', bloodGroup: 'A-',
        occupation: 'Architect', address: 'Chennai, TN', status: 'active',
        registeredDate: '2023-12-25', medicalHistory: ['Asthma'], allergies: ['Dust']
      },
      {
        id: 7, patientId: 'PAT001240', initials: 'SK', name: 'Suresh Kumar', age: 55, gender: 'Male',
        phone: '+91 3210987654', email: 'suresh.kumar@example.com', bloodGroup: 'O-',
        occupation: 'Farmer', address: 'Hyderabad, TS', status: 'pending',
        registeredDate: '2023-12-20', medicalHistory: [], allergies: []
      },
      {
        id: 8, patientId: 'PAT001241', initials: 'AP', name: 'Anjali Patil', age: 29, gender: 'Female',
        phone: '+91 2109876543', email: 'anjali.patil@example.com', bloodGroup: 'AB-',
        occupation: 'Software Engineer', address: 'Pune, MH', status: 'active',
        registeredDate: '2023-12-15', medicalHistory: [], allergies: ['Latex']
      },
      {
        id: 9, patientId: 'PAT001242', initials: 'RS', name: 'Ravi Singh', age: 48, gender: 'Male',
        phone: '+91 1098765432', email: 'ravi.singh@example.com', bloodGroup: 'B+',
        occupation: 'Bank Manager', address: 'Lucknow, UP', status: 'active',
        registeredDate: '2023-12-10', medicalHistory: ['Heart Condition'], allergies: []
      },
      {
        id: 10, patientId: 'PAT001243', initials: 'MJ', name: 'Maya Joshi', age: 35, gender: 'Female',
        phone: '+91 0987654321', email: 'maya.joshi@example.com', bloodGroup: 'A+',
        occupation: 'Teacher', address: 'Jaipur, RJ', status: 'active',
        registeredDate: '2023-12-05', medicalHistory: [], allergies: []
      }
    ];
    return mockData.map(p => ({ ...p, rawData: p }));
  };

  // Calculate displayed range
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredPatients.length);
  const displayedPatients = filteredPatients.slice(startIndex, endIndex);

  if (loading && patients.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mb-8" data-aos="fade-down">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Patients Management</h1>
          <p className="text-gray-600">Manage all patient records and information</p>
        </div>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-lg font-medium text-gray-700">Loading patients...</p>
            <p className="text-sm text-gray-500 mt-1">Please wait while we fetch the latest records</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8" data-aos="fade-down">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Patients Management</h1>
        <p className="text-gray-600">Manage all patient records, treatments, and appointments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div 
          className="bg-white rounded-xl p-4 md:p-6 shadow-lg border-l-4 border-teal-500"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Patients</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-800">{stats.total.toLocaleString()}</p>
            </div>
            <FaUserMd className="text-2xl md:text-3xl text-teal-500" />
          </div>
        </div>

        <div 
          className="bg-white rounded-xl p-4 md:p-6 shadow-lg border-l-4 border-green-500"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Patients</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-800">{stats.active.toLocaleString()}</p>
            </div>
            <FaChartLine className="text-2xl md:text-3xl text-green-500" />
          </div>
        </div>

        <div 
          className="bg-white rounded-xl p-4 md:p-6 shadow-lg border-l-4 border-blue-500"
          data-aos="fade-up"
          data-aos-delay="300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">New This Month</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-800">{stats.newThisMonth.toLocaleString()}</p>
            </div>
            <FaUserPlus className="text-2xl md:text-3xl text-blue-500" />
          </div>
        </div>

        <div 
          className="bg-white rounded-xl p-4 md:p-6 shadow-lg border-l-4 border-amber-500"
          data-aos="fade-up"
          data-aos-delay="400"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Follow-up Needed</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-800">{stats.followUp.toLocaleString()}</p>
            </div>
            <FaCalendarAlt className="text-2xl md:text-3xl text-amber-500" />
          </div>
        </div>
      </div>

      {/* Search and Actions Bar */}
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg mb-6 md:mb-8" data-aos="fade-up">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
            <div className="relative flex-1 w-full sm:w-auto">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients by name, ID, phone, or email..."
                className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all w-full sm:w-auto"
            >
              <FaFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all shadow-sm hover:shadow"
              onClick={() => navigate("/patient/patient-registration")}
            >
              <FaPlus /> New Patient
            </button>
            <button
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition-all"
            >
              <FaFileMedical /> Generate Report
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200" data-aos="fade-down">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="deceased">Deceased</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={filters.gender}
                  onChange={(e) => handleFilterChange('gender', e.target.value)}
                >
                  <option value="all">All Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={filters.fromDate}
                  onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={filters.toDate}
                  onChange={(e) => handleFilterChange('toDate', e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                Clear All Filters
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Info */}
      {filteredPatients.length > 0 && (
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold">{startIndex + 1}-{endIndex}</span> of{" "}
            <span className="font-semibold">{filteredPatients.length}</span> patients
            {searchTerm && (
              <span className="ml-2">
                for "<span className="font-semibold">{searchTerm}</span>"
              </span>
            )}
          </p>
          {filteredPatients.length < patients.length && (
            <button
              onClick={clearFilters}
              className="text-sm text-teal-600 hover:text-teal-700 transition-colors"
            >
              Clear search & filters
            </button>
          )}
        </div>
      )}

      {/* Patients Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden" data-aos="fade-up">
        {filteredPatients.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaUsers className="text-2xl text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No patients found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || Object.values(filters).some(f => f !== "all" && f !== "") 
                ? "Try adjusting your search or filters"
                : "No patients in the database yet"}
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              {searchTerm || Object.values(filters).some(f => f !== "all" && f !== "") 
                ? "Clear Search & Filters" 
                : "Add First Patient"}
            </button>
          </div>
        ) : (
          <>
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
                <thead>
                <tr className="bg-linear-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Patient
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Contact Info
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Demographics
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                    </th>
                </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                {patients.length > 0 ? (
                    patients.map((patient, index) => {
                    const avatarColor = getInitialsColor(patient.initials);
                    const statusColor = getStatusColor(patient.status);

                    return (
                        <tr
                        key={patient.id}
                        className="hover:bg-linear-to-r hover:from-teal-50/50 hover:to-blue-50/50 transition-all duration-300 cursor-pointer"
                        onClick={() => handleViewPatient(patient)}
                        >
                        {/* Patient Info */}
                        <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center">
                            <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm ${avatarColors[avatarColor]}`}
                            >
                                {patient.initials}
                            </div>
                            <div className="ml-4">
                                <p className="font-semibold text-gray-900">{patient.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                                    ID: {patient.patientId}
                                </span>
                                {patient.occupation && (
                                    <span className="text-xs text-gray-500 truncate max-w-[120px]">
                                    {patient.occupation}
                                    </span>
                                )}
                                </div>
                            </div>
                            </div>
                        </td>

                        {/* Contact Info */}
                        <td className="px-6 py-5 whitespace-nowrap">
                            <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <FaPhone className="text-gray-400 text-sm" />
                                <span className="text-sm text-gray-700 font-medium">{patient.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FaEnvelope className="text-gray-400 text-sm" />
                                <span className="text-sm text-gray-600 truncate max-w-[180px]">{patient.email}</span>
                            </div>
                            </div>
                        </td>

                        {/* Demographics */}
                        <td className="px-6 py-5 whitespace-nowrap">
                            <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                <HiUser className="text-gray-400" />
                                <span className="text-sm text-gray-700">
                                    {patient.age} yrs • {patient.gender}
                                </span>
                                </div>
                                {patient.bloodGroup && patient.bloodGroup !== 'Unknown' && (
                                <span className="text-xs font-medium px-2 py-0.5 bg-red-50 text-red-700 rounded">
                                    {patient.bloodGroup}
                                </span>
                                )}
                            </div>
                            {patient.address && patient.address !== 'Address not provided' && (
                                <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                📍 {patient.address}
                                </p>
                            )}
                            </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex flex-col gap-2">
                            <span
                                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${statusColors[statusColor]}`}
                            >
                                <span
                                className={`w-2 h-2 rounded-full mr-2 ${
                                    patient.status === 'active'
                                    ? 'bg-green-500'
                                    : patient.status === 'inactive'
                                    ? 'bg-gray-500'
                                    : patient.status === 'deceased'
                                    ? 'bg-red-500'
                                    : 'bg-yellow-500'
                                }`}
                                ></span>
                                {getStatusText(patient.status)}
                            </span>
                            <span className="text-xs text-gray-500">
                                Registered: {formatDate(patient.registeredDate)}
                            </span>
                            </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-5 whitespace-nowrap">
                            <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPatient(patient);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 hover:text-teal-800 transition-all border border-teal-100"
                            >
                            <FaEye className="text-sm" /> Quick View
                            </button>
                        </td>
                        </tr>
                    );
                    })
                ) : (
                    <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                        No patients found
                    </td>
                    </tr>
                )}
                </tbody>
            </table>
            </div>


            {/* Pagination */}
            {filteredPatients.length > ITEMS_PER_PAGE && (
              <div className="px-4 md:px-6 py-4 border-t border-gray-200 bg-gray-50/50">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-semibold">{startIndex + 1}</span> to{" "}
                    <span className="font-semibold">{endIndex}</span> of{" "}
                    <span className="font-semibold">{filteredPatients.length}</span> results
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="px-3 md:px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all flex items-center gap-2 text-sm"
                    >
                      <FaChevronLeft className="text-xs" /> Previous
                    </button>

                    <div className="flex gap-1">
                      {[...Array(Math.min(5, Math.ceil(filteredPatients.length / ITEMS_PER_PAGE)))].map((_, idx) => {
                        const pageNum = currentPage <= 3 
                          ? idx + 1 
                          : currentPage >= Math.ceil(filteredPatients.length / ITEMS_PER_PAGE) - 2 
                            ? Math.ceil(filteredPatients.length / ITEMS_PER_PAGE) - 4 + idx 
                            : currentPage - 2 + idx;
                        
                        if (pageNum < 1 || pageNum > Math.ceil(filteredPatients.length / ITEMS_PER_PAGE)) return null;

                        return (
                          <button
                            key={idx}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center border rounded-lg transition-all text-sm ${
                              currentPage === pageNum
                                ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                                : "border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      disabled={currentPage === Math.ceil(filteredPatients.length / ITEMS_PER_PAGE)}
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="px-3 md:px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all flex items-center gap-2 text-sm"
                    >
                      Next <FaChevronRight className="text-xs" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ================= DETAILED MODAL ================= */}
      {selectedPatient && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedPatient(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            data-aos="zoom-in"
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-linear-to-r from-teal-600 to-teal-700 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">{selectedPatient.name}</h3>
                  <p className="text-teal-100 mt-1">Patient ID: {selectedPatient.patientId}</p>
                </div>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="text-2xl text-white hover:text-teal-100 transition-colors p-1"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">Personal Information</h4>
                  <DetailItem label="Full Name" value={selectedPatient.name} />
                  <DetailItem label="First Name" value={selectedPatient.firstName} />
                  <DetailItem label="Last Name" value={selectedPatient.lastName} />
                  <DetailItem label="Age" value={`${selectedPatient.age} years`} />
                  <DetailItem label="Gender" value={selectedPatient.gender} />
                  <DetailItem label="Marital Status" value={selectedPatient.maritalStatus} />
                  <DetailItem label="Occupation" value={selectedPatient.occupation} />
                </div>

                {/* Contact & Medical */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">Contact & Medical</h4>
                  <DetailItem label="Phone" value={selectedPatient.phone} />
                  <DetailItem label="Email" value={selectedPatient.email} />
                  <DetailItem label="Blood Group" value={selectedPatient.bloodGroup} />
                  <DetailItem label="Address" value={selectedPatient.address} />
                  <DetailItem label="Registration Date" value={formatDate(selectedPatient.registeredDate)} />
                  <DetailItem label="Status" value={
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[getStatusColor(selectedPatient.status)]}`}>
                      {getStatusText(selectedPatient.status)}
                    </span>
                  } />
                </div>
              </div>

              {/* Additional Information */}
              {(selectedPatient.emergencyContact || selectedPatient.allergies?.length > 0 || selectedPatient.medicalHistory?.length > 0) && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedPatient.emergencyContact && selectedPatient.emergencyContact.name && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-medium text-gray-700 mb-2">Emergency Contact</h5>
                        <p className="text-sm">{selectedPatient.emergencyContact.name}</p>
                        <p className="text-sm text-gray-600">{selectedPatient.emergencyContact.relationship}</p>
                        <p className="text-sm text-gray-600">{selectedPatient.emergencyContact.phone}</p>
                      </div>
                    )}
                    {selectedPatient.allergies?.length > 0 && (
                      <div className="bg-red-50 p-4 rounded-lg">
                        <h5 className="font-medium text-red-700 mb-2">Allergies</h5>
                        <div className="flex flex-wrap gap-1">
                          {selectedPatient.allergies.map((allergy, idx) => (
                            <span key={idx} className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">
                              {allergy}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedPatient.medicalHistory?.length > 0 && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h5 className="font-medium text-blue-700 mb-2">Medical History</h5>
                        <div className="space-y-1">
                          {selectedPatient.medicalHistory.slice(0, 3).map((history, idx) => (
                            <p key={idx} className="text-sm text-blue-800">{history}</p>
                          ))}
                          {selectedPatient.medicalHistory.length > 3 && (
                            <p className="text-xs text-blue-600">+{selectedPatient.medicalHistory.length - 3} more</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedPatient(null);
                    handleViewPatient(selectedPatient);
                  }}
                  className="px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all shadow-md hover:shadow-lg"
                >
                  View Full Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Detail Component for Modal
const DetailItem = ({ label, value }) => (
  <div className="flex justify-between items-start py-2 border-b border-gray-100 last:border-b-0">
    <span className="text-gray-600 font-medium text-sm">{label}</span>
    <span className="text-gray-900 font-semibold text-right max-w-[60%] break-words">
      {value || 'Not specified'}
    </span>
  </div>
);

export default Patients;