import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import api from "../../services/api";
import { 
  Plus, Edit, Trash2, X, Clock, User, 
  FileText, CheckCircle, AlertCircle, Pill, Printer,
  Eye, ChevronLeft, ChevronRight, Filter, Search,
} from "lucide-react";
import { toast } from "react-toastify";

const Eprescription = () => {
  const { patientId: urlPatientId } = useParams();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [editData, setEditData] = useState(null);
  const [patientInfo, setPatientInfo] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState(urlPatientId || "");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusCounts, setStatusCounts] = useState({});

  // Meta data states
  const [dosages, setDosages] = useState([]);
  const [frequencies, setFrequencies] = useState([]);
  const [durations, setDurations] = useState([]);
  const [treatmentInstructions, setTreatmentInstructions] = useState([]);
  const [patients, setPatients] = useState([]);
  
  // Refs to prevent multiple calls
  const initialLoadRef = useRef(false);
  const prevPatientIdRef = useRef("");

  // Initialize form
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      patientId: urlPatientId || "",
      diagnosis: "",
      medicines: [{ 
        name: "", 
        dosage: "", 
        frequency: "", 
        duration: "",
        quantity: 1,
        instructions: "",
        beforeMeal: false
      }],
      instructions: "",
      notes: "",
      followUpDate: "",
      durationDays: 30
    }
  });

  const medicinesField = useFieldArray({ control, name: "medicines" });

  // Separate function to fetch patient info
  const fetchPatientInfo = useCallback(async (patientId) => {
    if (!patientId || patientId === prevPatientIdRef.current) return;
    
    try {
      console.log('Fetching patient info for:', patientId);
      const res = await api.get(`/patients/${patientId}`);
      console.log('Patient info response:', res.data);
      
      const patientData = res.data.patient || res.data;
      if (patientData) {
        setPatientInfo(patientData);
      }
    } catch (err) {
      console.error("Failed to fetch patient info:", err);
    }
  }, []);

  // Optimized fetchPrescriptions function
  const fetchPrescriptions = useCallback(async (page = 1) => {
    if (!selectedPatientId || selectedPatientId.trim() === '') {
      console.log('No valid patient ID selected');
      setPrescriptions([]);
      setTotalPages(1);
      setTotalItems(0);
      return;
    }

    // Prevent duplicate calls for same patient and page
    if (prevPatientIdRef.current === selectedPatientId && page === currentPage) {
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching prescriptions for patient:', selectedPatientId, 'page:', page);
      
      const res = await api.get(`/medical-zone/${selectedPatientId}/prescriptions`, {
        params: {
          page,
          limit: itemsPerPage,
          status: statusFilter !== "all" ? statusFilter : undefined,
          search: searchTerm || undefined
        }
      });

      const data = res.data;
      console.log('Prescriptions API Response:', data);
      
      if (data && data.prescriptions) {
        setPrescriptions(data.prescriptions);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.totalItems || 0);
        setStatusCounts(data.statusCounts || {});
        setCurrentPage(data.pagination?.currentPage || page);
        prevPatientIdRef.current = selectedPatientId;
      } else {
        setPrescriptions([]);
        setTotalPages(1);
        setTotalItems(0);
      }

    } catch (err) {
      console.error("Failed to load prescriptions:", err.response?.data || err.message);
      const errorMsg = err.response?.data?.message || 'Failed to load prescriptions';
      toast.error(errorMsg);
      setPrescriptions([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [selectedPatientId, statusFilter, searchTerm, itemsPerPage]);

  // Initialize on component mount
  useEffect(() => {
    if (!initialLoadRef.current && urlPatientId) {
      console.log('Initial load with URL patient ID:', urlPatientId);
      initialLoadRef.current = true;
      setSelectedPatientId(urlPatientId);
      setValue('patientId', urlPatientId);
      fetchPatientInfo(urlPatientId);
    }
  }, [urlPatientId, fetchPatientInfo, setValue]);

  // Fetch meta data
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await api.get('/doctors/meta');
        setDosages(res.data.treatmentDosages || []);
        setFrequencies(res.data.treatmentFrequency || []);
        setDurations(res.data.treatmentDurations || []);
        setTreatmentInstructions(res.data.treatmentInstructions || []);
        
      } catch (err) {
        console.error('Failed to fetch meta:', err);
      }
    };
    fetchMeta();
  }, []);

  // Fetch patients list
  useEffect(() => {
    const fetchPatients = async () => {
      if (urlPatientId) return; // Skip if we have URL patient ID
      
      try {
        const res = await api.get("/patients");
        setPatients(res.data?.patients || res.data || []);
      } catch (error) {
        console.error("Error fetching patients:", error);
      }
    };
    fetchPatients();
  }, [urlPatientId]);

  // Main effect to fetch prescriptions
  useEffect(() => {
    if (selectedPatientId && selectedPatientId !== prevPatientIdRef.current) {
      console.log('Fetching prescriptions for new patient:', selectedPatientId);
      setCurrentPage(1);
      const timer = setTimeout(() => {
        fetchPrescriptions(1);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedPatientId, fetchPrescriptions]);

  // Handle search and filter changes
  useEffect(() => {
    if (selectedPatientId) {
      const timer = setTimeout(() => {
        setCurrentPage(1);
        fetchPrescriptions(1);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [statusFilter, searchTerm, selectedPatientId, fetchPrescriptions]);

  // Open Modals
  const openAddModal = () => {
    if (!selectedPatientId) {
      toast.error("Please select a patient first");
      return;
    }
    
    setEditData(null);
    reset({
      patientId: selectedPatientId,
      diagnosis: "",
      medicines: [{ 
        name: "", 
        dosage: "", 
        frequency: "", 
        duration: "",
        quantity: 1,
        instructions: "",
        beforeMeal: false
      }],
      instructions: "",
      notes: "",
      followUpDate: "",
      durationDays: 30
    });
    setOpenModal(true);
  };

  const openEditModal = (prescription) => {
    setEditData(prescription);
    reset({
      patientId: prescription.patient?._id || selectedPatientId,
      diagnosis: prescription.diagnosis || "",
      medicines: prescription.medicines?.map(m => ({
        name: m.name || "",
        dosage: m.dosage || "",
        frequency: m.frequency || "",
        duration: m.duration || "",
        quantity: m.quantity || 1,
        instructions: m.instructions || "",
        beforeMeal: m.beforeMeal || false
      })) || [{ name: "", dosage: "", frequency: "", duration: "" }],
      instructions: prescription.instructions || "",
      notes: prescription.notes || "",
      followUpDate: prescription.followUpDate?.substring(0, 10) || "",
      durationDays: prescription.durationDays || 30
    });
    setOpenModal(true);
  };

  const handleViewModal = (prescription) => {
    setSelectedPrescription(prescription);
    setOpenViewModal(true);
  };

  // Submit prescription
  const onSubmit = async (data) => {
    try {
      const payload = {
        patientId: data.patientId,
        diagnosis: data.diagnosis.trim(),
        medicines: data.medicines
          .map(m => ({
            name: m.name.trim(),
            dosage: m.dosage.trim(),
            frequency: m.frequency.trim(),
            duration: m.duration.trim(),
            quantity: Number(m.quantity) || 1,
            instructions: m.instructions.trim(),
            beforeMeal: m.beforeMeal || false
          }))
          .filter(m => m.name), // Remove empty medicines
        instructions: data.instructions.trim(),
        notes: data.notes.trim(),
        followUpDate: data.followUpDate || null,
        durationDays: Number(data.durationDays) || 30,
        status: "ongoing"
      };

      console.log('Submitting prescription:', payload);
      
      if (editData) {
        // Update existing prescription
        await api.put(`/medical-zone/prescriptions/${editData._id}`, payload);
        toast.success("Prescription updated successfully!");
      } else {
        // Create new prescription
        await api.post(`/medical-zone/${payload.patientId}/prescriptions`, payload);
        toast.success("Prescription created successfully!");
      }
      
      setOpenModal(false);
      setEditData(null);
      fetchPrescriptions(currentPage);
      
    } catch (err) {
      console.error("Save failed:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to save prescription";
      toast.error(errorMessage);
    }
  };

  // Delete prescription
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this prescription?")) return;
    
    try {
      await api.delete(`/medical-zone/prescriptions/${id}`);
      toast.success("Prescription deleted successfully!");
      fetchPrescriptions(currentPage);
    } catch (err) {
      console.error("Delete failed:", err);
      const errorMsg = err.response?.data?.message || "Failed to delete prescription";
      toast.error(errorMsg);
    }
  };

  // Mark as printed
  const handlePrint = async (id) => {
    try {
      await api.put(`/medical-zone/prescriptions/${id}/print`);
      toast.success("Prescription marked as printed!");
      fetchPrescriptions(currentPage);
      setOpenViewModal(false);
    } catch (err) {
      console.error("Mark as printed failed:", err);
      const errorMsg = err.response?.data?.message || "Failed to mark as printed";
      toast.error(errorMsg);
    }
  };

  // Status badge
  const getStatusBadge = (prescription) => {
    const status = prescription.status || 'ongoing';
    const isExpired = prescription.validUntil && new Date(prescription.validUntil) < new Date();
    const actualStatus = isExpired ? 'expired' : status;
    
    const config = {
      ongoing: { 
        color: "bg-green-100 text-green-800 border-green-200", 
        icon: <CheckCircle size={14} />,
        label: "Active"
      },
      active: { 
        color: "bg-green-100 text-green-800 border-green-200", 
        icon: <CheckCircle size={14} />,
        label: "Active"
      },
      completed: { 
        color: "bg-blue-100 text-blue-800 border-blue-200", 
        icon: <CheckCircle size={14} />,
        label: "Completed"
      },
      expired: { 
        color: "bg-red-100 text-red-800 border-red-200", 
        icon: <AlertCircle size={14} />,
        label: "Expired"
      },
      cancelled: { 
        color: "bg-gray-100 text-gray-800 border-gray-200", 
        icon: <X size={14} />,
        label: "Cancelled"
      }
    };
    
    const { color, icon, label } = config[actualStatus] || config.ongoing;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${color}`}>
        {icon}
        {label}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
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

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "";
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPrescriptions(1);
  };

  // Reset search
  const handleResetSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
    fetchPrescriptions(1);
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
    fetchPrescriptions(page);
  };

  // Handle patient select
  const handlePatientSelect = (patientId) => {
    if (patientId === selectedPatientId) return;
    setSelectedPatientId(patientId);
    setValue('patientId', patientId);
    if (patientId) {
      fetchPatientInfo(patientId);
    }
  };

  // Show loading state
  if (loading && selectedPatientId) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mb-6"></div>
          <p className="text-gray-700 text-lg mb-2">Loading prescriptions...</p>
          <p className="text-gray-500">
            Patient: {patientInfo?.name || patientInfo?.fullName || selectedPatientId}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Remove debug info in production */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded text-xs">
          <div className="font-medium mb-1">Debug Info:</div>
          <div>URL Patient ID: {urlPatientId || 'None'}</div>
          <div>Selected Patient ID: {selectedPatientId || 'None'}</div>
          <div>Patient Info: {patientInfo ? 'Loaded' : 'Not loaded'}</div>
          <div>Prescriptions count: {prescriptions.length}</div>
        </div>
      )} */}
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Prescriptions</h1>
          {patientInfo ? (
            <div className="flex items-center gap-2 mt-2 text-gray-700">
              <User size={18} />
              <span className="font-medium">
                {patientInfo.name || patientInfo.fullName || patientInfo.patientName}
              </span>
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
          ) : selectedPatientId ? (
            <div className="flex items-center gap-2 mt-2 text-gray-600">
              <User size={16} />
              <span>Loading patient info...</span>
            </div>
          ) : null}
        </div>
        
        <div className="flex gap-3">
          {selectedPatientId && (
            <button
              onClick={openAddModal}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 md:px-5 md:py-3 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Plus size={20} />
                  New Prescription
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Patient Selection - Only show if no URL patient ID */}
      {!urlPatientId && (
        <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User size={20} />
            Select Patient
          </h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <select
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedPatientId || ""}
                onChange={(e) => handlePatientSelect(e.target.value)}
              >
                <option value="">-- Select a patient --</option>
                {patients.map((patient) => (
                  <option key={patient._id} value={patient._id}>
                    {patient.fullName || patient.name} 
                    {patient.patientId && ` (ID: ${patient.patientId})`}
                    {patient.age && `, ${patient.age}y`}
                    {patient.gender && `, ${patient.gender}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {selectedPatientId ? (
        <>
          {/* Stats Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
            <div className="bg-white p-3 md:p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">{totalItems}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-3 md:p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">{statusCounts.active || statusCounts.ongoing || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-3 md:p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="text-red-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Expired</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">{statusCounts.expired || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-3 md:p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Printer className="text-purple-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Printed</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">{statusCounts.printed || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by diagnosis, medicine, or ID..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={handleResetSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={18} />
                    </button>
                  )}
                </form>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-gray-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Prescriptions List */}
          {prescriptions.length === 0 ? (
            <div className="text-center py-12 md:py-16 border-2 border-dashed border-gray-300 rounded-2xl">
              <div className="mb-4">
                <Pill className="mx-auto h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {loading ? 'Loading prescriptions...' : 'No prescriptions found'}
              </h3>
              <p className="text-gray-600 max-w-sm mx-auto mb-6">
                {searchTerm || statusFilter !== "all" 
                  ? "No prescriptions match your search criteria." 
                  : "No prescriptions have been created for this patient yet."}
              </p>
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
              >
                <Plus size={18} />
                Create First Prescription
              </button>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Diagnosis</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Medicines</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Doctor</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {prescriptions.map(prescription => (
                        <tr key={prescription._id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900">{prescription.diagnosis || "No diagnosis"}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              ID: {prescription.treatmentId || prescription._id?.substring(0, 8)}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(prescription)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <Pill size={14} className="text-gray-400" />
                              <span>{prescription.medicines?.length || 0} meds</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-gray-700">
                              Dr. {prescription.doctor?.name || "Unknown"}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-gray-700">
                              {formatDate(prescription.createdAt)}
                            </div>
                            {prescription.validUntil && (
                              <div className={`text-xs ${new Date(prescription.validUntil) < new Date() ? 'text-red-500' : 'text-gray-500'}`}>
                                Valid until: {formatDate(prescription.validUntil)}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewModal(prescription)}
                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => openEditModal(prescription)}
                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(prescription._id)}
                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                              {!prescription.isPrinted && (
                                <button
                                  onClick={() => handlePrint(prescription._id)}
                                  className="hidden p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                  title="Mark as Printed"
                                >
                                  <Printer size={16} />
                                </button>
                              )}
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
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} prescriptions
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronLeft size={20} />
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={i}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-10 h-10 rounded-lg ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        /* Show this when no patient is selected */
        !urlPatientId && (
          <div className="text-center py-12 md:py-16 border-2 border-dashed border-gray-300 rounded-2xl">
            <div className="mb-4">
              <User className="mx-auto h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Patient Selected</h3>
            <p className="text-gray-600 max-w-sm mx-auto mb-6">
              Please select a patient to view and manage their prescriptions.
            </p>
            <div className="max-w-md mx-auto">
              <select
                value={selectedPatientId}
                onChange={(e) => handlePatientSelect(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4"
              >
                <option value="">Select a patient</option>
                {patients.map(patient => (
                  <option key={patient._id} value={patient._id}>
                    {patient.fullName || patient.name} 
                    {patient.patientId && ` (ID: ${patient.patientId})`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )
      )}

      {/* View Prescription Modal */}
      {openViewModal && selectedPrescription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
              <div className="flex items-center justify-between p-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedPrescription.diagnosis || "Prescription Details"}
                  </h2>
                  <div className="flex items-center gap-3 mt-2">
                    {getStatusBadge(selectedPrescription)}
                    <span className="text-sm text-gray-600">
                      ID: {selectedPrescription.treatmentId || selectedPrescription._id?.substring(0, 8)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePrint(selectedPrescription._id)}
                    disabled={selectedPrescription.isPrinted}
                    className="hidden p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
                    title={selectedPrescription.isPrinted ? "Already Printed" : "Mark as Printed"}
                  >
                    <Printer size={20} />
                  </button>
                  <button
                    onClick={() => setOpenViewModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Patient Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <User size={18} />
                  Patient Information
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">
                      {selectedPrescription.patient?.fullName || selectedPrescription.patient?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Patient ID</p>
                    <p className="font-medium">
                      {selectedPrescription.patient?.patientId || selectedPrescription.patient?._id || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Age/Gender</p>
                    <p className="font-medium">
                      {selectedPrescription.patient?.age ? `${selectedPrescription.patient.age}y` : "N/A"}
                      {selectedPrescription.patient?.gender && ` / ${selectedPrescription.patient.gender}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Prescribing Doctor</p>
                    <p className="font-medium">
                      Dr. {selectedPrescription.doctor?.name || "Unknown"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Medicines List */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Pill size={18} />
                  Prescribed Medicines ({selectedPrescription.medicines?.length || 0})
                </h3>
                <div className="space-y-3">
                  {selectedPrescription.medicines?.map((medicine, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{index + 1}. {medicine.name}</h4>
                        <div className="text-sm text-gray-600">
                          Qty: {medicine.quantity || 1}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Dosage</p>
                          <p className="font-medium">{medicine.dosage || "Not specified"}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Frequency</p>
                          <p className="font-medium">{medicine.frequency || "Not specified"}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Duration</p>
                          <p className="font-medium">{medicine.duration || "Not specified"}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Instructions</p>
                          <p className="font-medium">{medicine.instructions || "Not specified"}</p>
                        </div>
                      </div>
                      {medicine.beforeMeal && (
                        <div className="mt-2">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            <Clock size={12} />
                            Take before meal
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Instructions</h3>
                  <div className="bg-gray-50 p-4 rounded-lg min-h-100px">
                    {selectedPrescription.instructions ? (
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedPrescription.instructions}</p>
                    ) : (
                      <p className="text-gray-500 italic">No specific instructions provided.</p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Notes</h3>
                  <div className="bg-gray-50 p-4 rounded-lg min-h-100px">
                    {selectedPrescription.notes ? (
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedPrescription.notes}</p>
                    ) : (
                      <p className="text-gray-500 italic">No additional notes.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Dates and Status */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-medium text-gray-900 mb-4">Prescription Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Prescribed On</p>
                    <p className="font-medium">{formatDate(selectedPrescription.createdAt)}</p>
                    <p className="text-xs text-gray-500">{formatTime(selectedPrescription.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Valid Until</p>
                    <p className={`font-medium ${new Date(selectedPrescription.validUntil) < new Date() ? 'text-red-600' : ''}`}>
                      {selectedPrescription.validUntil ? formatDate(selectedPrescription.validUntil) : "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Follow-up Date</p>
                    <p className="font-medium">
                      {selectedPrescription.followUpDate ? formatDate(selectedPrescription.followUpDate) : "Not scheduled"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    {getStatusBadge(selectedPrescription)}
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setOpenViewModal(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    openEditModal(selectedPrescription);
                    setOpenViewModal(false);
                  }}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Edit Prescription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Prescription Modal */}
      {openModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
              <div className="flex items-center justify-between p-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editData ? "Edit Prescription" : "Add New Prescription"}
                  </h2>
                  <p className="text-gray-600 mt-1">Prescribe medications and treatments</p>
                </div>
                <button
                  onClick={() => setOpenModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Patient Selection - Hidden if URL has patientId */}
                {!urlPatientId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient <span className="text-red-500">*</span> 
                    </label>
                    <select
                      {...register("patientId", { required: "Patient is required" })}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select patient</option>
                      {patients.map((patient) => (
                        <option key={patient._id} value={patient._id}>
                          {patient.fullName || patient.name} 
                          {patient.patientId && ` (ID: ${patient.patientId})`}
                        </option>
                      ))}
                    </select>
                    {errors.patientId && (
                      <p className="text-red-500 text-sm mt-1">{errors.patientId.message}</p>
                    )}
                  </div>
                )}

                {/* Diagnosis */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diagnosis / Condition <span className="text-red-500">*</span> 
                  </label>
                  <input
                    type="text"
                    {...register("diagnosis", { 
                      required: "Diagnosis is required",
                      minLength: {
                        value: 3,
                        message: "Diagnosis must be at least 3 characters"
                      }
                    })}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter diagnosis or condition"
                  />
                  {errors.diagnosis && (
                    <p className="text-red-500 text-sm mt-1">{errors.diagnosis.message}</p>
                  )}
                </div>

                {/* Medicines */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <label className="text-lg font-semibold text-gray-900">Medicines</label>
                      <p className="text-sm text-gray-600">Add medicines to the prescription</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => medicinesField.append({ 
                        name: "", 
                        dosage: "", 
                        frequency: "", 
                        duration: "", 
                        quantity: 1,
                        instructions: "",
                        beforeMeal: false 
                      })}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <Plus size={18} />
                      Add Medicine
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {medicinesField.fields.map((item, index) => (
                      <div key={item.id} className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-medium text-gray-900">Medicine {index + 1}</h4>
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => medicinesField.remove(index)}
                              className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Medicine Name <span className="text-red-500">*</span> </label>
                            <input
                              type="text"
                              {...register(`medicines.${index}.name`, { 
                                required: "Medicine name is required"
                              })}
                              className="w-full border border-gray-300 rounded-lg p-2"
                              placeholder="Enter medicine name"
                            />
                            {errors.medicines?.[index]?.name && (
                              <p className="text-red-500 text-xs mt-1">{errors.medicines[index].name.message}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Quantity <span className="text-red-500">*</span> </label>
                            <input
                              type="number"
                              {...register(`medicines.${index}.quantity`, { 
                                min: 1,
                                valueAsNumber: true
                              })}
                              min="1"
                              className="w-full border border-gray-300 rounded-lg p-2"
                              placeholder="Quantity"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                          <label className="block text-sm text-gray-600 mb-1"> Dosage <span className="text-red-500">*</span> </label>
                            <select
                              {...register(`medicines.${index}.dosage`, { required: "Dosage is required" })}
                              className="w-full border border-gray-300 rounded-lg p-2"
                            >
                              <option value="">Select Dosage</option>
                              {dosages.map((dose, idx) => (
                                <option key={idx} value={dose}>{dose}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Frequency <span className="text-red-500">*</span> </label>
                            <select
                              {...register(`medicines.${index}.frequency`, { required: "Frequency is required" })}
                              className="w-full border border-gray-300 rounded-lg p-2"
                            >
                              <option value="">Select Frequency</option>
                              {frequencies.map((freq, idx) => (
                                <option key={idx} value={freq}>{freq}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Duration <span className="text-red-500">*</span> </label>
                            <select
                              {...register(`medicines.${index}.duration`, { required: "Duration is required" })}
                              className="w-full border border-gray-300 rounded-lg p-2"
                            >
                              <option value="">Select Duration</option>
                              {durations.map((duration, idx) => (
                                <option key={idx} value={duration}>{duration}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Instructions <span className="text-red-500">*</span> </label>
                            <select
                              {...register(`medicines.${index}.instructions`, { required: "Instructions are required" })}
                              className="w-full border border-gray-300 rounded-lg p-2"
                            >
                              <option value="">Select Instructions</option>
                              {treatmentInstructions.map((instr, idx) => (
                                <option key={idx} value={instr}>{instr}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-center gap-2 mt-6">
                            <input
                              type="checkbox"
                              id={`beforeMeal-${index}`}
                              {...register(`medicines.${index}.beforeMeal`)}
                              className="h-4 w-4 text-blue-600"
                            />
                            <label htmlFor={`beforeMeal-${index}`} className="text-sm text-gray-600">
                              Take before meal
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">General Instructions</label>
                  <textarea
                    {...register("instructions")}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg p-3"
                    placeholder="Enter general instructions for the patient..."
                  />
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Date</label>
                    <input
                      type="date"
                      {...register("followUpDate")}
                      className="w-full border border-gray-300 rounded-lg p-3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prescription Validity (Days)</label>
                    <input
                      type="number"
                      {...register("durationDays", { 
                        min: 1,
                        max: 365,
                        valueAsNumber: true
                      })}
                      min="1"
                      max="365"
                      className="w-full border border-gray-300 rounded-lg p-3"
                      placeholder="e.g., 30 days"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                  <textarea
                    {...register("notes")}
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg p-3"
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setOpenModal(false)}
                    className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {editData ? "Updating..." : "Saving..."}
                      </span>
                    ) : (
                      editData ? "Update Prescription" : "Save Prescription"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Eprescription;