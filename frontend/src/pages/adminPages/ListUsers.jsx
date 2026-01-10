// pages/Users.jsx
import React, { useState, useEffect } from 'react';
import {
  FaUserPlus, FaEdit, FaTrash, FaEye,
  FaSearch, FaFilter, FaUserMd, FaUserGraduate,
  FaUserShield, FaKey, FaCopy, FaCheck, FaHandHoldingMedical, 
  FaPhone, FaEnvelope, FaCalendar, FaIdCard,FaUserInjured,
  FaTimes, FaArrowUp, FaArrowDown, FaExclamationTriangle,
  FaChevronLeft, FaChevronRight, FaExternalLinkAlt, FaUser, FaStethoscope,
  FaSpa // Added missing import
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'descending' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    number: '',
    role: 'patient',
    bio: '',
    photo: '',
    password: '' // Added password field
  });
  const [error, setError] = useState(null);
  const [searchHighlight, setSearchHighlight] = useState('');
  const [roleTypes, setRoleTypes] = useState([]);
  const [passwordVisibility, setPasswordVisibility] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const navigate = useNavigate();

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch role types
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await api.get('/users/meta'); // Changed endpoint
        setRoleTypes(res.data.roleTypes || ['admin', 'doctor', 'therapist', 'patient']);
      } catch (err) {
        console.error('Failed to fetch meta:', err);
        // Default roles if API fails
        setRoleTypes(['admin', 'doctor', 'therapist', 'patient']);
      }
    };
    fetchMeta();
  }, []);

  // Filter and sort users when dependencies change
  useEffect(() => {
    let result = [...users];
    let highlightTerm = '';

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      highlightTerm = searchLower;
      
      result = result.filter(user => {
        const nameMatch = user.name?.toLowerCase().includes(searchLower);
        const emailMatch = user.email?.toLowerCase().includes(searchLower);
        const phoneMatch = user.number?.toLowerCase().includes(searchLower);
        const roleMatch = user.role?.toLowerCase().includes(searchLower);
        
        // Highlight yellow for doctors if searching "doctor"
        if (searchLower === 'doctor' && user.role === 'doctor') {
          return true;
        }
        
        return nameMatch || emailMatch || phoneMatch || roleMatch;
      });
    }

    // Filter by role
    if (filterRole !== 'all') {
      result = result.filter(user => user.role === filterRole);
    }

    // Sort users
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key] || '';
        const bVal = b[sortConfig.key] || '';
        
        if (aVal < bVal) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredUsers(result);
    setSearchHighlight(highlightTerm);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, filterRole, users, sortConfig]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get("/users");
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to fetch users. Please check your API endpoint.");
    } finally {
      setLoading(false);
    }
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }
      
      if (start > 1) {
        pageNumbers.unshift('...');
        pageNumbers.unshift(1);
      }
      
      if (end < totalPages) {
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPassword(password);
    setFormData(prev => ({ ...prev, password }));
    return password;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = { ...formData };
      
      // If creating new user and no password provided, generate one
      if (!editingUser && !userData.password) {
        userData.password = generatePassword();
      }

      if (editingUser) {
        // For editing, only send password if it was changed
        if (!userData.password || userData.password === '') {
          delete userData.password;
        }
        await api.put(`/users/${editingUser._id}`, userData);
        alert('User updated successfully!');
      } else {
        // For new user, always send password
        await api.post('/auth/register', userData);
        alert('User created successfully!');
        if (userData.password) {
          alert(`Generated password: ${userData.password}\nPlease save this password for login.`);
        }
      }

      resetForm();
      fetchUsers();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving user:', error);
      alert(error.response?.data?.message || 'Failed to save user');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      number: user.number || '',
      role: user.role,
      bio: user.bio || '',
      photo: user.photo || '',
      password: '' // Clear password field for edit
    });
    setGeneratedPassword('');
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/users/${selectedUser._id}`);
      alert('User deleted successfully!');
      fetchUsers();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handleView = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      number: '',
      role: 'patient',
      bio: '',
      photo: '',
      password: ''
    });
    setGeneratedPassword('');
    setEditingUser(null);
    setPasswordVisibility(false);
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case "admin": return <FaUser className="w-4 h-4" />;
      case "doctor": return <FaStethoscope className="w-4 h-4" />;
      case "therapist": return <FaSpa className="w-4 h-4" />;
      case "patient": return <FaUserInjured className="w-4 h-4" />;
      default: return <FaUser className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role) => {
    const isDoctorSearch = searchTerm.toLowerCase() === 'doctor' && role === 'doctor';
    switch (role) {
      case 'admin': 
        return isDoctorSearch 
          ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
          : 'bg-purple-100 text-purple-800 border-purple-200';
      case 'doctor': 
        return isDoctorSearch 
          ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
          : 'bg-blue-100 text-blue-800 border-blue-200';
      case 'patient': 
        return isDoctorSearch 
          ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
          : 'bg-green-100 text-green-800 border-green-200';
      case 'therapist': 
        return isDoctorSearch 
          ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
          : 'bg-pink-100 text-pink-800 border-pink-200'; 
      default: 
        return isDoctorSearch 
          ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
          : 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleBadge = (role) => (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${getRoleColor(role)}`}>
      {getRoleIcon(role)}
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );

  // Format date to show years, months, days
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    
    const years = Math.floor(diffDays / 365);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  };

  const formatFullDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const extractNumbers = (text) => {
    if (!text) return '';
    const numbers = text.match(/\d+/g);
    return numbers ? numbers.join('') : '';
  };

  // Highlight search terms in text
  const HighlightText = ({ text, highlight }) => {
    if (!highlight || !text) return text;
    
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-yellow-200 px-1 py-0.5 rounded font-medium">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const UserAvatar = ({ user, size = 'md' }) => {
    const sizes = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-12 h-12 text-base',
      lg: 'w-16 h-16 text-lg',
      xl: 'w-24 h-24 text-xl'
    };

    if (user.photo) {
      return (
        <img
          src={user.photo}
          alt={user.name}
          className={`${sizes[size]} rounded-full object-cover border-2 border-white shadow-sm`}
        />
      );
    }

    const initials = user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const colors = ['bg-linear-to-br from-emerald-500 to-emerald-700', 
                    'bg-linear-to-br from-blue-500 to-blue-700', 
                    'bg-linear-to-br from-purple-500 to-purple-700', 
                    'bg-linear-to-br from-amber-500 to-amber-700', 
                    'bg-linear-to-br from-rose-500 to-rose-700'];
    const colorIndex = user.name.length % colors.length;

    return (
      <div className={`${sizes[size]} ${colors[colorIndex]} rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-sm`}>
        {initials}
      </div>
    );
  };

  // Navigation to individual user pages
  const navigateToUserPage = (userId) => {
    navigate(`/users/${userId}`);
  };

  const navigateToEditPage = (userId) => {
    navigate(`/users/${userId}/edit`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium animate-pulse">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">User Management</h1>
          </div>
          
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg hover:shadow-xl"
          >
            <FaUserPlus className="w-5 h-5" />
            <span>Add New User</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-800">{users.length}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Showing {currentUsers.length} of {filteredUsers.length}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <FaUserGraduate className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-gray-800">{users.filter(u => u.role === 'admin').length}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <FaUserShield className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Doctors</p>
                <p className="text-2xl font-bold text-gray-800">{users.filter(u => u.role === 'doctor').length}</p>
              </div>
              <div className={`p-3 rounded-lg ${searchTerm.toLowerCase() === 'doctor' ? 'bg-yellow-50' : 'bg-green-50'}`}>
                <FaUserMd className={`w-6 h-6 ${searchTerm.toLowerCase() === 'doctor' ? 'text-yellow-600' : 'text-green-600'}`} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Therapist</p>
                <p className="text-2xl font-bold text-gray-800">{users.filter(u => u.role === 'therapist').length}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <FaHandHoldingMedical className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Patients</p>
                <p className="text-2xl font-bold text-gray-800">{users.filter(u => u.role === 'patient').length}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <FaUserInjured className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <FaExclamationTriangle className="w-5 h-5 text-red-500 flex shrink-0" />
              <div>
                <p className="text-red-700 font-medium">API Error</p>
                <p className="text-red-600 text-sm">{error}</p>
                <button 
                  onClick={fetchUsers}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users by name, email, number, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all duration-200"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                )}
              </div>
              {searchTerm.toLowerCase() === 'doctor' && (
                <p className="text-sm text-yellow-600 mt-2 ml-1">
                  <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full mr-1"></span>
                  Doctor search active - highlighting doctor users in yellow
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FaFilter className="text-gray-400 w-5 h-5" />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl 
                            focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                            focus:outline-none transition-all duration-200"
                >
                  <option value="all">All Roles</option>
                  {roleTypes.map((role) => (
                    <option key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-slide-up">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-2 hover:text-gray-900 focus:outline-none"
                  >
                    User
                    {sortConfig.key === 'name' && (
                      sortConfig.direction === 'ascending' ? 
                      <FaArrowUp className="w-3 h-3" /> : 
                      <FaArrowDown className="w-3 h-3" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('createdAt')}
                    className="flex items-center gap-2 hover:text-gray-900 focus:outline-none"
                  >
                    Member Since
                    {sortConfig.key === 'createdAt' && (
                      sortConfig.direction === 'ascending' ? 
                      <FaArrowUp className="w-3 h-3" /> : 
                      <FaArrowDown className="w-3 h-3" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentUsers.map((user) => (
                <tr 
                  key={user._id} 
                  className={`hover:bg-gray-50 transition-colors duration-150 ${
                    searchTerm.toLowerCase() === 'doctor' && user.role === 'doctor' ? 'bg-yellow-50/50' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar user={user} />
                      <div>
                        <div className="font-medium text-gray-900">
                          <HighlightText text={user.name} highlight={searchHighlight} />
                        </div>
                        <div className="text-sm text-gray-500">
                          <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                            ID: {user._id?.substring(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900">
                      {user.number ? (
                        <>
                          <HighlightText text={user.number} highlight={searchHighlight} />
                        </>
                      ) : (
                        'Not provided'
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      <HighlightText text={user.email} highlight={searchHighlight} />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900 font-medium">
                      {formatDate(user.createdAt)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(user)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                        title="Quick View"
                      >
                        <FaEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
                        title="Edit User"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                        title="Delete User"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <FaUserGraduate className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {searchTerm || filterRole !== 'all' ? 'No matching users found' : 'No users found'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? `No results for "${searchTerm}"` : 'Try adding new users or check your API connection'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterRole('all');
                  }}
                  className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium hover:bg-blue-50 rounded-lg transition-colors duration-200"
                >
                  Clear search & filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-700 mb-4 sm:mb-0">
              Showing <span className="font-semibold">{indexOfFirstItem + 1}</span> to{" "}
              <span className="font-semibold">
                {Math.min(indexOfLastItem, filteredUsers.length)}
              </span>{" "}
              of <span className="font-semibold">{filteredUsers.length}</span> users
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Page {currentPage} of {totalPages}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg ${
                  currentPage === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                <FaChevronLeft className="w-4 h-4" />
              </button>
              
              {getPaginationNumbers().map((pageNum, index) => (
                <button
                  key={index}
                  onClick={() => typeof pageNum === 'number' && setCurrentPage(pageNum)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : typeof pageNum === 'number'
                      ? 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                      : 'text-gray-400 cursor-default'
                  }`}
                  disabled={typeof pageNum !== 'number'}
                >
                  {pageNum}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg ${
                  currentPage === totalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                <FaChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => { setShowModal(false); resetForm(); }}></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-modal-in">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingUser ? 'Edit User' : 'Create New User'}
                </h2>
                <button
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                {editingUser && (
                  <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <FaIdCard className="w-4 h-4" />
                      <span className="font-mono">User ID: {editingUser._id}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all duration-200"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all duration-200"
                      placeholder="user@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="number"
                      value={formData.number}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3  bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all duration-200"
                      placeholder="+91 9876543210"
                    />
                    {formData.number && (
                      <p className="text-xs text-gray-500 mt-1">
                        Numbers only: {extractNumbers(formData.number)}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role *
                    </label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl 
                                  focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                                  focus:outline-none transition-all duration-200"
                      >
                        <option value="" disabled>Select role</option>
                        {roleTypes.map((role) => (
                          <option key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </option>
                        ))}
                      </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all duration-200"
                      placeholder="Tell us about this user..."
                    />
                  </div>

                  {/* Password Field */}
                  {(!editingUser || formData.password) && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password {editingUser ? '(Leave empty to keep current)' : '*'}
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type={passwordVisibility ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all duration-200"
                            placeholder={editingUser ? "Enter new password (optional)" : "Enter password or generate one"}
                            required={!editingUser}
                          />
                          <button
                            type="button"
                            onClick={() => setPasswordVisibility(!passwordVisibility)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {passwordVisibility ? 'Hide' : 'Show'}
                          </button>
                        </div>
                        {!editingUser && (
                          <>
                            <button
                              type="button"
                              onClick={generatePassword}
                              className="px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-all duration-200 flex items-center gap-2"
                            >
                              <FaKey className="w-4 h-4" />
                              <span>Generate</span>
                            </button>
                            {(formData.password || generatedPassword) && (
                              <button
                                type="button"
                                onClick={() => copyToClipboard(formData.password || generatedPassword)}
                                className="px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-all duration-200"
                                title="Copy to clipboard"
                              >
                                {copiedPassword ? (
                                  <FaCheck className="w-4 h-4 text-green-500" />
                                ) : (
                                  <FaCopy className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {editingUser 
                          ? 'Enter new password only if you want to change it'
                          : 'Password must be at least 8 characters long. Save this password for login.'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="px-6 py-2.5 text-gray-700 font-medium rounded-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-linear-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200 shadow-sm hover:shadow"
                  >
                    {editingUser ? 'Update User' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal (Read Only) */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowViewModal(false)}></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-modal-in">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">User Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
                  <UserAvatar user={selectedUser} size="xl" />
                  <div className="text-center md:text-left">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedUser.name}</h3>
                    <div className="mb-3">
                      {getRoleBadge(selectedUser.role)}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <FaEnvelope className="w-4 h-4" />
                      <span>{selectedUser.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaIdCard className="w-4 h-4" />
                      <span className="font-mono text-sm">ID: {selectedUser._id}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-700 mb-2">
                      <FaPhone className="w-4 h-4" />
                      <span className="text-sm font-medium">Phone Number</span>
                    </div>
                    <p className="text-gray-900">{selectedUser.number || 'Not provided'}</p>
                    {selectedUser.number && (
                      <p className="text-sm text-gray-600 mt-1">
                        Numbers: {extractNumbers(selectedUser.number)}
                      </p>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-700 mb-2">
                      <FaCalendar className="w-4 h-4" />
                      <span className="text-sm font-medium">Member Since</span>
                    </div>
                    <p className="text-gray-900 font-medium">
                      {formatDate(selectedUser.createdAt)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatFullDate(selectedUser.createdAt)}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-700 mb-2">
                      <FaCalendar className="w-4 h-4" />
                      <span className="text-sm font-medium">Last Updated</span>
                    </div>
                    <p className="text-gray-900 font-medium">
                      {formatDate(selectedUser.updatedAt)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatFullDate(selectedUser.updatedAt)}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-700 mb-2">
                      <FaIdCard className="w-4 h-4" />
                      <span className="text-sm font-medium">User ID</span>
                    </div>
                    <p className="text-gray-900 font-mono text-sm break-all">
                      {selectedUser._id}
                    </p>
                    <button
                      onClick={() => copyToClipboard(selectedUser._id)}
                      className="mt-2 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Copy ID to clipboard
                    </button>
                  </div>
                </div>

                {selectedUser.bio && (
                  <div className="mb-8">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Bio</h4>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-gray-700 leading-relaxed">{selectedUser.bio}</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between gap-3 pt-6 border-t border-gray-200">
                  <div>
                    <button
                      onClick={() => navigateToUserPage(selectedUser._id)}
                      className="px-4 py-2 text-blue-600 font-medium rounded-xl hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200 flex items-center gap-2"
                    >
                      <FaExternalLinkAlt className="w-3 h-3" />
                      <span>View Full Page</span>
                    </button>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        handleEdit(selectedUser);
                      }}
                      className="px-6 py-2.5 bg-linear-to-r from-emerald-600 to-emerald-700 text-white font-medium rounded-xl hover:from-emerald-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 transition-all duration-200 shadow-sm hover:shadow flex items-center gap-2"
                    >
                      <FaEdit className="w-4 h-4" />
                      <span>Edit User</span>
                    </button>
                    <button
                      onClick={() => setShowViewModal(false)}
                      className="px-6 py-2.5 text-gray-700 font-medium rounded-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-all duration-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowDeleteModal(false)}></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-modal-in">
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaTrash className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Delete User</h2>
                
                <div className="my-6">
                  <UserAvatar user={selectedUser} size="lg" className="mx-auto mb-4" />
                  <div className="text-center mb-4">
                    <p className="text-gray-800 font-medium">{selectedUser.name}</p>
                    <p className="text-sm text-gray-600">{selectedUser.email}</p>
                    <p className="text-xs text-gray-500 font-mono mt-1">ID: {selectedUser._id.substring(0, 12)}...</p>
                  </div>
                  <p className="text-gray-600">
                    Are you sure you want to delete this user?
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    This action cannot be undone. All data associated with this user will be permanently removed.
                  </p>
                </div>

                <div className="flex justify-center gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-6 py-2.5 text-gray-700 font-medium rounded-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-6 py-2.5 bg-linear-to-r from-red-600 to-red-700 text-white font-medium rounded-xl hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-all duration-200 shadow-sm hover:shadow"
                  >
                    Yes, Delete User
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;