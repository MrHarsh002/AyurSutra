import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Filter, UserPlus, Eye, Edit, Trash2, ChevronLeft, ChevronRight, 
  Calendar, Phone, Mail, Download, Upload, RefreshCw, AlertCircle,
  User, Shield, Activity, Heart, Pill, FileText
} from 'lucide-react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import PatientViewModal from "../../components/therapy/Patients/PatientViewModal";
import PatientEditModal from "../../components/therapy/Patients/PatientEditModal";
import MedicalRecordModal from "../../components/therapy/Patients/MedicalRecordModal";

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });


  //
const [viewModalOpen, setViewModalOpen] = useState(false);
const [editModalOpen, setEditModalOpen] = useState(false);
const [recordModalOpen, setRecordModalOpen] = useState(false);
const [selectedPatient, setSelectedPatient] = useState(null);

// Add these handlers
const handleView = (patient) => {
  setSelectedPatient(patient);
  setViewModalOpen(true);
};

const handleEdit = (patient) => {
  setSelectedPatient(patient);
  setEditModalOpen(true);
};

const handleMedicalRecords = (patient) => {
  setSelectedPatient(patient);
  setRecordModalOpen(true);
};

const handleEditSave = (updatedPatient) => {
  setPatients(prev =>
    prev
      .filter(p => p) // remove undefined entries if any
      .map(p => (p?._id === updatedPatient?._id ? updatedPatient : p))
  );
  toast.success('Patient updated successfully');
};


  // Debounced fetch function
  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter })
      };

      const response = await api.get('/patients', { params });
      const { patients, total, totalPages, currentPage } = response.data;
      
      setPatients(patients);
      setPagination(prev => ({
        ...prev,
        total,
        totalPages,
        page: currentPage
      }));
      setSelectedPatients([]); // Clear selection on new fetch
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to load patients. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, statusFilter, sortConfig]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== '' || statusFilter !== '') {
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchPatients();
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchPatients();
  };

  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectPatient = (patientId) => {
    setSelectedPatients(prev =>
      prev.includes(patientId)
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPatients.length === patients.length) {
      setSelectedPatients([]);
    } else {
      setSelectedPatients(patients.map(p => p._id));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedPatients.length === 0) {
      toast.warning('Please select an action and at least one patient');
      return;
    }

    if (!window.confirm(`Are you sure you want to ${bulkAction} ${selectedPatients.length} patient(s)?`)) return;

    try {
      const response = await api.patch('/patients/bulk', {
        patientIds: selectedPatients,
        action: bulkAction
      });
      
      toast.success(response.data.message);
      fetchPatients();
      setBulkAction('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Bulk action failed');
    }
  };

  const handleDelete = async (id, fullName) => {
    if (!window.confirm(`Are you sure you want to delete patient: ${fullName}?\nThis action cannot be undone.`)) return;

    try {
      if (!id) {
        toast.error('Invalid patient ID');
        return;
      }
      await api.delete(`/patients/${id}`);
      toast.success('Patient deleted successfully');
      fetchPatients();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Delete failed. Please try again.');
    }
  };

  const handleExport = async () => {
    try {
      setExportLoading(true);
      const response = await api.get('/patients/export', {
        params: {
          search: searchTerm,
          status: statusFilter
        },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `patients_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Export completed successfully');
    } catch (error) {
      toast.error('Export failed. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const statusColors = {
    active: 'bg-green-100 text-green-800 border border-green-200',
    inactive: 'bg-gray-100 text-gray-800 border border-gray-200',
    deceased: 'bg-red-100 text-red-800 border border-red-200'
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'MMM dd, yyyy');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Patient Management</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExport}
              disabled={exportLoading}
              className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {exportLoading ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <Download size={18} />
              )}
              Export
            </button>
            <Link
              to="/therapy/patients/import"
              className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2.5 rounded-lg font-medium transition-colors"
            >
              <Upload size={18} />
              Import
            </Link>
            <Link
              to="/therapy/patients/add"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
            >
              <UserPlus size={18} />
              Add New Patient
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Patients', value: pagination.total, color: 'bg-blue-500', icon: User },
            { label: 'Active', value: patients.filter(p => p.status === 'active').length, color: 'bg-green-500', icon: Activity },
            { label: 'Inactive', value: patients.filter(p => p.status === 'inactive').length, color: 'bg-orange-500', icon: Shield },
            { label: 'Critical', value: patients.filter(p => p.allergies?.some(a => a.severity === 'severe')).length, color: 'bg-red-500', icon: AlertCircle }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} w-12 h-12 rounded-full flex items-center justify-center`}>
                  <stat.icon className="text-white" size={22} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl shadow p-5 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, ID, phone, email..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="deceased">Deceased</option>
              </select>
              
              <button
                type="submit"
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-medium transition-colors"
              >
                <Filter size={18} />
                Search
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setSortConfig({ key: 'createdAt', direction: 'desc' });
                  fetchPatients();
                }}
                className="flex items-center justify-center gap-2 px-5 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw size={18} />
                Reset
              </button>
            </div>
          </form>

          {/* Bulk Actions */}
          {selectedPatients.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                <span className="text-sm font-medium text-gray-700">
                  {selectedPatients.length} patient(s) selected
                </span>
                <div className="flex flex-wrap gap-2">
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                  >
                    <option value="">Bulk Actions</option>
                    <option value="activate">Activate</option>
                    <option value="deactivate">Deactivate</option>
                    <option value="export">Export Selected</option>
                  </select>
                  <button
                    onClick={handleBulkAction}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => setSelectedPatients([])}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-500">Loading patients...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 w-10">
                        <input
                          type="checkbox"
                          checked={selectedPatients.length === patients.length && patients.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('fullName')}
                      >
                        <div className="flex items-center gap-1">
                          Patient
                          <span className="text-xs">{getSortIcon('fullName')}</span>
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medical Info</th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center gap-1">
                          Status
                          <span className="text-xs">{getSortIcon('status')}</span>
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {patients.length > 0 ? (
                      patients.map((patient) => (
                        <tr key={patient._id} className="hover:bg-gray-50 transition-colors">
                          {/* Selection */}
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedPatients.includes(patient._id)}
                              onChange={() => handleSelectPatient(patient._id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>

                          {/* Patient Info */}
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <div className="shrink-0 h-10 w-10 bg-linear-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center border border-blue-200">
                                <span className="text-blue-600 font-bold text-sm">
                                  {patient.firstName?.[0]}{patient.lastName?.[0]}
                                </span>
                              </div>
                              <div className="ml-3">
                                <div className="font-medium text-gray-900">
                                  {patient.fullName}
                                  {patient.allergies?.some(a => a.severity === 'severe') && (
                                    <AlertCircle className="inline-block ml-2 text-red-500" size={16} />
                                  )}
                                </div>
                                <div className="text-xs text-gray-500">ID: {patient.patientId}</div>
                                <div className="text-xs text-gray-500">
                                  {calculateAge(patient.dateOfBirth)} yrs • {patient.gender}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Contact Info */}
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Phone size={14} className="text-gray-400" />
                                <span className="text-sm text-gray-900">{patient.phone || 'N/A'}</span>
                              </div>
                              {patient.email && (
                                <div className="flex items-center gap-2">
                                  <Mail size={14} className="text-gray-400" />
                                  <span className="text-sm text-gray-900 truncate max-w-180px">{patient.email}</span>
                                </div>
                              )}
                              {patient.address?.city && (
                                <div className="text-xs text-gray-500 truncate max-w-180px">
                                  {patient.address.city}, {patient.address.state}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Medical Info */}
                          <td className="px-4 py-3">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Heart size={14} className="text-red-400" />
                                <span className="text-sm">
                                  <span className="text-gray-500">Blood: </span>
                                  <span className="font-medium">{patient.bloodGroup || 'N/A'}</span>
                                </span>
                              </div>
                              <div className="flex items-start gap-2">
                                <Pill size={14} className="text-purple-400 mt-0.5" />
                                <span className="text-sm">
                                  <span className="text-gray-500">Allergies: </span>
                                  <span className="font-medium">
                                    {patient.allergies?.length > 0 
                                      ? `${patient.allergies.length} listed`
                                      : 'None'}
                                  </span>
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  statusColors[patient.status] || 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {patient.status
                                  ? patient.status.charAt(0).toUpperCase() + patient.status.slice(1)
                                  : 'Unknown'}
                              </span>
                              <span className="text-xs text-gray-500">
                                Since {formatDate(patient.createdAt)}
                              </span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              
                              {/* View */}
                              <button
                                onClick={() => handleView(patient)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye size={18} />
                              </button>

                              {/* Edit */}
                              <button
                                onClick={() => handleEdit(patient)}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit size={18} />
                              </button>

                              {/* Medical Records */}
                              <button
                                onClick={() => handleMedicalRecords(patient)}
                                className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                title="Medical Records"
                              >
                                <FileText size={18} />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDelete(patient._id, patient.fullName)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>

                            {/* ---------- MODALS ---------- */}

                            {viewModalOpen && (
                              <PatientViewModal
                                patient={selectedPatient}
                                isOpen={viewModalOpen}
                                onClose={() => setViewModalOpen(false)}
                              />
                            )}

                            {editModalOpen && (
                              <PatientEditModal
                                patient={selectedPatient}
                                isOpen={editModalOpen}
                                onClose={() => setEditModalOpen(false)}
                                onSave={handleEditSave}
                              />
                            )}

                            {recordModalOpen && (
                              <MedicalRecordModal
                                patient={selectedPatient}
                                isOpen={recordModalOpen}
                                onClose={() => setRecordModalOpen(false)}
                              />
                            )}

                          </td>

                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-8">
                          <div className="flex flex-col items-center justify-center text-gray-500">
                            <User size={48} className="mb-3 text-gray-300" />
                            <p className="text-lg font-medium">No patients found</p>
                            <p className="text-sm mt-1">
                              {searchTerm || statusFilter 
                                ? 'Try adjusting your search criteria'
                                : 'Add your first patient to get started'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.total > 0 && (
                <div className="px-4 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-700">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} patients
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={pagination.page === 1}
                      className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
                    >
                      <ChevronLeft size={18} />
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
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
                            onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                            className={`min-w-2rem h-8 rounded-lg font-medium text-sm ${
                              pagination.page === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
                      disabled={pagination.page === pagination.totalPages}
                      className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
                    >
                      Next
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientList;