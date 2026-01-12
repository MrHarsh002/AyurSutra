// src/pages/medical-zone/SymptomsPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Edit,
  Trash2,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Calendar,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle,
  FileText,
  Search,
  Filter,
  User,
  Eye,
  Save,
  Download,
  Printer
} from "lucide-react";
import api from "../../../services/api";
import { toast, Toaster } from "react-hot-toast";

const ITEMS_PER_PAGE = 10;

const SymptomsPage = () => {
  const { patientId } = useParams();
  const [symptoms, setSymptoms] = useState([]);
  const [patientInfo, setPatientInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editSymptom, setEditSymptom] = useState(null);
  const [selectedSymptom, setSelectedSymptom] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [symptomStatusOptions, setSymptomStatusOptions] = useState([]);
  const [symptomSeverityOptions, setSymptomSeverityOptions] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors, isSubmitting } 
  } = useForm({
    defaultValues: {
      name: "",
      severity: "",
      status: "",
      duration: "",
      description: "",
      onset: "",
      pattern: "",
      triggers: "",
      notes: ""
    }
  });

   // Fetch patient info
   useEffect(() => {
     const fetchPatientInfo = async () => {
       if (!patientId) return;
       
       try {
         const res = await api.get(`/patients/${patientId}`);
         const patientData = res.data.patient || res.data;
         if (patientData) {
           setPatientInfo(patientData);
         }
       } catch (err) {
         console.error("Failed to fetch patient info:", err);
       }
     };
     
     fetchPatientInfo();
   }, [patientId]);

  // Fetch meta data
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await api.get('/doctors/meta');
        setSymptomStatusOptions(res.data.symptomStatus || ["active", "resolved", "monitoring", "recurring"]);
        setSymptomSeverityOptions(res.data.symptomseverity || ["low", "moderate", "high", "severe"]);
      } catch (err) {
        console.error('Failed to fetch meta:', err);
        // Set default values if API fails
        setSymptomStatusOptions(["active", "resolved", "monitoring", "recurring"]);
        setSymptomSeverityOptions(["low", "moderate", "high", "severe"]);
      }
    };
    fetchMeta();
  }, []);

  // Fetch all symptoms with pagination
  const fetchSymptoms = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!patientId) {
        toast.error("Patient ID is required");
        return;
      }

      const params = {
        page,
        limit: ITEMS_PER_PAGE,
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      if (severityFilter !== "all") {
        params.severity = severityFilter;
      }
      
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const res = await api.get(`/medical-zone/${patientId}/symptoms`, { params });
      console.log("Symptoms API Response:", res.data);
      
      setSymptoms(res.data.symptoms || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
      setTotalItems(res.data.pagination?.totalItems || res.data.symptoms?.length || 0);
      
      // If patient info not already fetched, set it from the response
      if (res.data.patient && !patientInfo) {
        setPatientInfo(res.data.patient);
      }
      
      toast.success(`Loaded ${res.data.symptoms?.length || 0} symptoms`);
    } catch (err) {
      console.error("Failed to fetch symptoms:", err);
      const errorMsg = err.response?.data?.message || 'Failed to load symptoms';
      setError(errorMsg);
      toast.error(errorMsg);
      setSymptoms([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchSymptoms(currentPage);
    }
  }, [patientId, currentPage]);

  // Handle search and filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (patientId) {
        setCurrentPage(1);
        fetchSymptoms(1);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm, severityFilter, statusFilter, patientId]);

  // Open modals
  const openAddModal = () => {
    reset({
      name: "",
      severity: "",
      status: "",
      duration: "",
      description: "",
      onset: "",
      pattern: "",
      triggers: "",
      notes: ""
    });
    setEditSymptom(null);
    setModalOpen(true);
  };

  const openEditModal = (symptom) => {
    setEditSymptom(symptom);
    reset({
      name: symptom.name || "",
      severity: symptom.severity || "",
      status: symptom.status || "",
      duration: symptom.duration || "",
      description: symptom.description || "",
      onset: symptom.onset ? new Date(symptom.onset).toISOString().split('T')[0] : "",
      pattern: symptom.pattern || "",
      triggers: symptom.triggers || "",
      notes: symptom.notes || ""
    });
    setModalOpen(true);
  };

  const openViewModal = (symptom) => {
    setSelectedSymptom(symptom);
    setViewModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setViewModalOpen(false);
    setEditSymptom(null);
    setSelectedSymptom(null);
    reset();
  };

  // Submit symptom
  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.name.trim(),
        severity: data.severity,
        status: data.status,
        duration: data.duration.trim(),
        description: data.description.trim(),
        onset: data.onset || null,
        pattern: data.pattern.trim(),
        triggers: data.triggers.trim(),
        notes: data.notes.trim()
      };

      console.log("Submitting symptom:", payload);

      if (editSymptom) {
        // Update existing symptom
        await api.put(`/medical-zone/${patientId}/symptoms/${editSymptom._id}`, payload);
        toast.success("Symptom updated successfully!");
      } else {
        // Create new symptom
        await api.post(`/medical-zone/${patientId}/symptoms`, payload);
        toast.success("Symptom added successfully!");
      }

      closeModal();
      fetchSymptoms(currentPage);
      
    } catch (err) {
      console.error("Failed to save symptom:", err);
      const errorMsg = err.response?.data?.message || "Failed to save symptom";
      toast.error(errorMsg);
    }
  };

  // Save all symptoms as report
  const saveAllSymptoms = async () => {
    if (!window.confirm("Save all symptoms as a medical report?")) return;

    try {
      await api.post(`/medical-zone/${patientId}/symptoms/report`, {
        symptoms: symptoms,
        patientId: patientId,
        generatedAt: new Date().toISOString()
      });
      toast.success("Symptoms report saved successfully!");
    } catch (err) {
      console.error("Failed to save report:", err);
      toast.error("Failed to save report");
    }
  };

  // Delete symptom
  const onDelete = async (symptomId) => {
    if (!window.confirm("Are you sure you want to delete this symptom?")) return;

    try {
      await api.delete(`/medical-zone/${patientId}/symptoms/${symptomId}`);
      toast.success("Symptom deleted successfully!");
      fetchSymptoms(currentPage);
    } catch (err) {
      console.error("Failed to delete symptom:", err);
      const errorMsg = err.response?.data?.message || "Failed to delete symptom";
      toast.error(errorMsg);
    }
  };

  // Helper functions
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "low": return "bg-green-100 text-green-800 border-green-200";
      case "moderate": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "severe": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active": return "bg-blue-100 text-blue-800 border-blue-200";
      case "resolved": return "bg-green-100 text-green-800 border-green-200";
      case "monitoring": return "bg-purple-100 text-purple-800 border-purple-200";
      case "recurring": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not recorded";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return "Invalid date";
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Not recorded";
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "Invalid date";
    }
  };

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show limited pages with ellipsis
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  // Loading state
  if (loading && symptoms.length === 0) {
    return (
      <div className="min-h-screen p-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mb-6"></div>
          <div className="text-gray-700 text-lg mb-2">Loading symptoms...</div>
          {patientInfo && (
            <div className="text-gray-500">
              Patient: {patientInfo.name || patientInfo.fullName || patientInfo.patientName}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Error state
  if (error && symptoms.length === 0) {
    return (
      <div className="min-h-screen p-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center h-96">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <div className="text-xl font-semibold text-red-600 mb-2">{error}</div>
          <button
            onClick={() => fetchSymptoms(currentPage)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Patient Symptoms
            </h1>
            {patientInfo ? (
              <div className="flex items-center gap-2 mt-2 text-gray-700">
                <User size={18} />
                 {patientInfo && (
                    <span className="text-gray-500">
                      {patientInfo.name || patientInfo.fullName || patientInfo.patientName}
                    </span>
                  )}
                {patientInfo.patientId && (
                  <span className="text-gray-500">(ID: {patientInfo.patientId})</span>
                )}
                {patientInfo.age && (
                  <span className="text-gray-500">, {patientInfo.age} years</span>
                )}
                {patientInfo.gender && (
                  <span className="text-gray-500">, {patientInfo.gender}</span>
                )}
              </div>
            ) : patientId ? (
              <div className="flex items-center gap-2 mt-2 text-gray-600">
                <User size={16} />
                <span>Loading patient info...</span>
              </div>
            ) : null}
          </div>
          
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <button
              onClick={openAddModal}
              disabled={isSubmitting || !patientId}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Plus size={20} />
                  Add Symptom
                </>
              )}
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search symptoms by name, description, or triggers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>
          
          <div className="flex gap-4">
            <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl border">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="border-0 focus:outline-none focus:ring-0 bg-transparent"
              >
                <option value="all">All Severities</option>
                {symptomSeverityOptions.map((severity, index) => (
                  <option key={index} value={severity}>
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl border">
              <Activity className="w-4 h-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border-0 focus:outline-none focus:ring-0 bg-transparent"
              >
                <option value="all">All Status</option>
                {symptomStatusOptions.map((status, index) => (
                  <option key={index} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="text-sm text-gray-500">Total Symptoms</div>
            <div className="text-2xl font-bold text-gray-900">{totalItems}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="text-sm text-gray-500">Active</div>
            <div className="text-2xl font-bold text-blue-600">
              {symptoms.filter(s => s.status === 'active').length}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="text-sm text-gray-500">Resolved</div>
            <div className="text-2xl font-bold text-green-600">
              {symptoms.filter(s => s.status === 'resolved').length}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="text-sm text-gray-500">High Severity</div>
            <div className="text-2xl font-bold text-red-600">
              {symptoms.filter(s => s.severity === 'high' || s.severity === 'severe').length}
            </div>
          </div>
        </div>
      </div>

      {/* Symptoms Table */}
      {!patientId ? (
        <div className="text-center py-12 md:py-16 border-2 border-dashed border-gray-300 rounded-2xl">
          <div className="mb-4">
            <User className="mx-auto h-16 w-16 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Patient Selected</h3>
          <div className="text-gray-600 max-w-sm mx-auto">
            Please navigate to a patient's page to view symptoms.
          </div>
        </div>
      ) : symptoms.length === 0 ? (
        <div className="text-center py-12 md:py-16 border-2 border-dashed border-gray-300 rounded-2xl">
          <div className="mb-4">
            <FileText className="mx-auto h-16 w-16 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {loading ? 'Loading symptoms...' : 'No symptoms found'}
          </h3>
          <div className="text-gray-600 max-w-sm mx-auto mb-6">
            {searchTerm || severityFilter !== "all" || statusFilter !== "all"
              ? "No symptoms match your search criteria." 
              : "No symptoms have been recorded for this patient yet."}
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            <Plus className="w-4 h-4" />
            Add First Symptom
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">#</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Symptom</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Severity</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Duration</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Onset</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {symptoms.map((symptom, index) => (
                    <tr key={symptom._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{symptom.name || "Unnamed Symptom"}</div>
                        {symptom.description && (
                          <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {symptom.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(symptom.severity)}`}>
                          {symptom.severity || "Unknown"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(symptom.status)}`}>
                          {symptom.status || "Unknown"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-700">
                          {symptom.duration || "Not specified"}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-700">
                          {formatDate(symptom.onset)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openViewModal(symptom)}
                            className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => openEditModal(symptom)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => onDelete(symptom._id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} symptoms (Page {currentPage} of {totalPages})
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft size={20} />
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {getPaginationNumbers().map(pageNum => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white font-medium'
                          : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <span className="px-2 text-gray-500">...</span>
                  )}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className={`w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50 ${
                        currentPage === totalPages ? 'bg-blue-600 text-white' : 'text-gray-700'
                      }`}
                    >
                      {totalPages}
                    </button>
                  )}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Next
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Symptom Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editSymptom ? "Edit Symptom" : "Add New Symptom"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Symptom Name *
                </label>
                <input
                  {...register("name", { 
                    required: "Symptom name is required",
                    minLength: {
                      value: 2,
                      message: "Symptom name must be at least 2 characters"
                    }
                  })}
                  placeholder="e.g., Headache, Fever, Cough"
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.name && (
                  <div className="text-red-500 text-sm mt-1">{errors.name.message}</div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Severity *
                  </label>
                  <select
                    {...register("severity", { required: "Severity is required" })}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Severity</option>
                    {symptomSeverityOptions.map((severity, index) => (
                      <option key={index} value={severity}>
                        {severity.charAt(0).toUpperCase() + severity.slice(1)}
                      </option>
                    ))}
                  </select>
                  {errors.severity && (
                    <div className="text-red-500 text-sm mt-1">{errors.severity.message}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    {...register("status", { required: "Status is required" })}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Status</option>
                    {symptomStatusOptions.map((status, index) => (
                      <option key={index} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                  {errors.status && (
                    <div className="text-red-500 text-sm mt-1">{errors.status.message}</div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <input
                  {...register("duration")}
                  placeholder="e.g., 3 days, 2 weeks, 1 month"
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  {...register("description")}
                  rows={3}
                  placeholder="Describe the symptom in detail..."
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Onset Date
                </label>
                <input
                  type="date"
                  {...register("onset")}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pattern
                </label>
                <input
                  {...register("pattern")}
                  placeholder="e.g., Intermittent, Constant, Worse at night"
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Triggers
                </label>
                <input
                  {...register("triggers")}
                  placeholder="e.g., Stress, Certain foods, Weather changes"
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  {...register("notes")}
                  rows={2}
                  placeholder="Additional notes..."
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {editSymptom ? "Updating..." : "Saving..."}
                    </span>
                  ) : (
                    editSymptom ? "Update Symptom" : "Add Symptom"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Symptom Details Modal */}
      {viewModalOpen && selectedSymptom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Symptom Details
                </h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(selectedSymptom.severity)}`}>
                    {selectedSymptom.severity || "Unknown"}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedSymptom.status)}`}>
                    {selectedSymptom.status || "Unknown"}
                  </span>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Symptom Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Symptom Information</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-500">Symptom Name</div>
                      <div className="text-lg font-medium text-gray-900">{selectedSymptom.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Duration</div>
                      <div className="text-lg font-medium text-gray-900">{selectedSymptom.duration || "Not specified"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Onset Date</div>
                      <div className="text-lg font-medium text-gray-900">{formatDate(selectedSymptom.onset)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Pattern</div>
                      <div className="text-lg font-medium text-gray-900">{selectedSymptom.pattern || "Not specified"}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-500">Triggers</div>
                      <div className="text-lg font-medium text-gray-900">{selectedSymptom.triggers || "Not specified"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Recorded On</div>
                      <div className="text-lg font-medium text-gray-900">{formatDateTime(selectedSymptom.createdAt)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Last Updated</div>
                      <div className="text-lg font-medium text-gray-900">{formatDateTime(selectedSymptom.updatedAt)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedSymptom.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="text-gray-700 whitespace-pre-wrap">{selectedSymptom.description}</div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedSymptom.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
                  <div className="bg-yellow-50 p-4 rounded-xl">
                    <div className="text-gray-700 whitespace-pre-wrap">{selectedSymptom.notes}</div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={closeModal}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    closeModal();
                    openEditModal(selectedSymptom);
                  }}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
                >
                  Edit Symptom
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-section,
          .print-section * {
            visibility: visible;
          }
          .print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SymptomsPage;