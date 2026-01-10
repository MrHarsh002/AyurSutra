import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import api from "../../../services/api";
import { 
  Plus, Edit, Trash2, X, Calendar, Clock, User, 
  Activity, FileText, CheckCircle, AlertCircle,
  Pill, Heart, Apple, Dumbbell, Stethoscope,
  ChevronLeft, ChevronRight, Eye
} from "lucide-react";

const TreatmentsPage = () => {
  const { patientId } = useParams();
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [editData, setEditData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Meta data states
  const [treatmentFrequency, setTreatmentFrequency] = useState([]);
  const [treatmentDosages, setTreatmentDosages] = useState([]);
  const [treatmentDurations, setTreatmentDurations] = useState([]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: "",
      symptoms: [{ value: "" }],
      therapies: [{ value: "" }],
      medicines: [{ name: "", dosage: "250mg", frequency: "once daily", duration: "1 week" }],
      diet: [{ value: "" }],
      lifestyle: [{ value: "" }],
      notes: "",
      status: "ongoing",
      duration: "",
      startDate: "",
      endDate: "",
      followUpDate: ""
    }
  });

  // Array field handlers
  const symptomsField = useFieldArray({ control, name: "symptoms" });
  const therapiesField = useFieldArray({ control, name: "therapies" });
  const medicinesField = useFieldArray({ control, name: "medicines" });
  const dietField = useFieldArray({ control, name: "diet" });
  const lifestyleField = useFieldArray({ control, name: "lifestyle" });

  // Fetch Treatments
  const fetchTreatments = async () => {
    try {
      const res = await api.get(`/medical-zone/${patientId}`);
      setTreatments(res.data.treatments || []);
    } catch (err) {
      console.error("Failed to load treatments", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch meta data
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await api.get('/doctors/meta');
        setTreatmentFrequency(res.data.treatmentFrequency || []);
        setTreatmentDosages(res.data.treatmentDosages || []);
        setTreatmentDurations(res.data.treatmentDurations || []);
      } catch (err) {
        console.error('Failed to fetch meta:', err);
      }
    };
    fetchMeta();
  }, []);

  useEffect(() => {
    fetchTreatments();
  }, [patientId]);

  // Open Modals
  const openAddModal = () => {
    setEditData(null);
    reset();
    setOpenModal(true);
  };

  const openEditModal = (t) => {
    setEditData(t);
    reset({
      name: t.diagnosis || "",
      symptoms: t.symptoms?.map(s => ({ value: s })) || [{ value: "" }],
      therapies: t.prescribedTherapies?.map(th => ({ value: th.therapy })) || [{ value: "" }],
      medicines: t.medicines?.map(m => ({
        name: m.name,
        dosage: m.dosage || "250mg",
        frequency: m.frequency || "Once daily",
        duration: m.duration || "1 week"
      })) || [{ name: "", dosage: "250mg", frequency: "Once daily", duration: "1 week" }],
      diet: t.dietRecommendations?.map(d => ({ value: d })) || [{ value: "" }],
      lifestyle: t.lifestyleChanges?.map(l => ({ value: l })) || [{ value: "" }],
      notes: t.notes || "",
      status: t.status || "ongoing",
      duration: t.duration || "",
      startDate: t.startDate?.substring(0, 10) || "",
      endDate: t.endDate?.substring(0, 10) || "",
      followUpDate: t.followUpDate?.substring(0, 10) || ""
    });
    setOpenModal(true);
  };

  const handleOpenViewModal = (treatment) => {
    setSelectedTreatment(treatment);
    setOpenViewModal(true);
  };

  // Submit
  const onSubmit = async (data) => {
    const payload = {
      diagnosis: data.name,
      symptoms: data.symptoms.map(s => s.value).filter(Boolean),
      prescribedTherapies: data.therapies.map(t => ({ therapy: t.value, duration: null, notes: "" })).filter(t => t.therapy),
      medicines: data.medicines.map(m => ({
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        duration: m.duration
      })).filter(m => m.name),
      dietRecommendations: data.diet.map(d => d.value).filter(Boolean),
      lifestyleChanges: data.lifestyle.map(l => l.value).filter(Boolean),
      notes: data.notes,
      status: data.status,
      duration: data.duration || null,
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      followUpDate: data.followUpDate || null
    };

    try {
      if (editData) {
        await api.put(`/medical-zone/treatments/${editData._id}`, payload);
      } else {
        await api.post(`/medical-zone/${patientId}/treatments`, payload);
      }
      setOpenModal(false);
      setEditData(null);
      fetchTreatments();
    } catch (err) {
      console.error("Save failed:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to save treatment");
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this treatment?")) return;
    try {
      await api.delete(`/medical-zone/treatments/${id}`);
      fetchTreatments();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // Status badge
  const getStatusBadge = (status) => {
    const config = {
      ongoing: { 
        color: "bg-blue-100 text-blue-800 border-blue-200", 
        icon: <Activity size={14} />,
        label: "Ongoing"
      },
      completed: { 
        color: "bg-green-100 text-green-800 border-green-200", 
        icon: <CheckCircle size={14} />,
        label: "Completed"
      },
      stopped: { 
        color: "bg-red-100 text-red-800 border-red-200", 
        icon: <AlertCircle size={14} />,
        label: "Stopped"
      }
    };
    const { color, icon, label } = config[status] || config.ongoing;
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Pagination
  const totalPages = Math.ceil(treatments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTreatments = treatments.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Treatment Plans</h1>
          <p className="text-gray-600 mt-1">Manage patient's medical treatments and care plans</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md"
        >
          <Plus size={20} />
          Add New Treatment
        </button>
      </div>

      {/* Stats Summary */}
      {treatments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Treatments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {treatments.filter(t => t.status === 'ongoing').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {treatments.filter(t => t.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Pill className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Medicines</p>
                <p className="text-2xl font-bold text-gray-900">
                  {treatments.reduce((acc, t) => acc + (t.medicines?.length || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Stethoscope className="text-orange-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Therapies</p>
                <p className="text-2xl font-bold text-gray-900">
                  {treatments.reduce((acc, t) => acc + (t.prescribedTherapies?.length || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Treatments List */}
      {treatments.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-2xl">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No treatments yet</h3>
          <p className="mt-2 text-gray-600 max-w-sm mx-auto">
            Start by creating a treatment plan to track medications, therapies, and lifestyle changes.
          </p>
          <button
            onClick={openAddModal}
            className="mt-6 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            <Plus size={18} />
            Create First Treatment
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {paginatedTreatments.map(t => (
              <div key={t._id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer">
                <div className="p-5 border-b border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {t.diagnosis}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(t.status)}
                        <span className="text-xs text-gray-500">
                          {t.startDate ? formatDate(t.startDate) : 'No start date'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleOpenViewModal(t); }}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); openEditModal(t); }}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(t._id); }}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Medicines Preview */}
                    {t.medicines && t.medicines.length > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Pill size={14} className="text-blue-500" />
                        <span className="text-gray-700">{t.medicines.length} medicine(s)</span>
                      </div>
                    )}
                    
                    {/* Therapies Preview */}
                    {t.prescribedTherapies && t.prescribedTherapies.length > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Heart size={14} className="text-red-500" />
                        <span className="text-gray-700">{t.prescribedTherapies.length} therapy(s)</span>
                      </div>
                    )}
                    
                    {/* Doctor Info */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User size={14} />
                      <span>Dr. {t.doctor?.name || "Unknown"}</span>
                    </div>
                  </div>
                </div>
                
                <div 
                  className="p-4 bg-gray-50 text-center group-hover:bg-blue-50 transition-colors"
                  onClick={() => handleOpenViewModal(t)}
                >
                  <span className="text-blue-600 text-sm font-medium cursor-pointer">View Details →</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, treatments.length)} of {treatments.length} treatments
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft size={20} />
                </button>
                
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
                      onClick={() => setCurrentPage(pageNum)}
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
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* View Treatment Modal */}
      {openViewModal && selectedTreatment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedTreatment.diagnosis}</h2>
                <div className="flex items-center gap-3 mt-2">
                  {getStatusBadge(selectedTreatment.status)}
                  <span className="text-sm text-gray-600">
                    Created: {formatDate(selectedTreatment.createdAt)}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setOpenViewModal(false)} 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Doctor Info */}
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                <div className="p-2 bg-white rounded-lg">
                  <User className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Prescribed by</p>
                  <p className="text-gray-600">Dr. {selectedTreatment.doctor?.name || "Unknown"}</p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={16} className="text-blue-500" />
                    <span className="text-sm font-medium text-gray-700">Start Date</span>
                  </div>
                  <p className="text-gray-900">{formatDate(selectedTreatment.startDate) || 'Not set'}</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={16} className="text-green-500" />
                    <span className="text-sm font-medium text-gray-700">End Date</span>
                  </div>
                  <p className="text-gray-900">{formatDate(selectedTreatment.endDate) || 'Not set'}</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={16} className="text-purple-500" />
                    <span className="text-sm font-medium text-gray-700">Follow-up</span>
                  </div>
                  <p className="text-gray-900">{formatDate(selectedTreatment.followUpDate) || 'Not set'}</p>
                </div>
              </div>

              {/* Symptoms */}
              {selectedTreatment.symptoms && selectedTreatment.symptoms.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Activity size={18} className="text-red-500" />
                    Symptoms
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTreatment.symptoms.map((symptom, index) => (
                      <span key={index} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Medicines */}
              {selectedTreatment.medicines && selectedTreatment.medicines.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Pill size={18} className="text-blue-500" />
                    Medicines ({selectedTreatment.medicines.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedTreatment.medicines.map((medicine, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-xl">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{medicine.name}</h4>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                              <span>Dosage: {medicine.dosage}</span>
                              <span>Frequency: {medicine.frequency}</span>
                              <span>Duration: {medicine.duration}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Therapies */}
              {selectedTreatment.prescribedTherapies && selectedTreatment.prescribedTherapies.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Heart size={18} className="text-green-500" />
                    Therapies ({selectedTreatment.prescribedTherapies.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedTreatment.prescribedTherapies.map((therapy, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">{therapy.therapy}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedTreatment.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedTreatment.notes}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button 
                  onClick={() => setOpenViewModal(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    setOpenViewModal(false);
                    openEditModal(selectedTreatment);
                  }}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Treatment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Treatment Modal */}
      {openModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{editData ? "Edit Treatment" : "Add New Treatment"}</h2>
                <p className="text-gray-600 mt-1">Fill in the treatment details below</p>
              </div>
              <button onClick={() => setOpenModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Diagnosis */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Diagnosis Name *
                    </label>
                    <input
                      type="text"
                      {...register("name", { required: "Diagnosis name is required" })}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter diagnosis name"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      {...register("status")}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                      <option value="stopped">Stopped</option>
                    </select>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                    <input
                      type="text"
                      {...register("duration")}
                      className="w-full border border-gray-300 rounded-lg p-3"
                      placeholder="e.g., 2 weeks"
                    />
                  </div>

                  {/* Dates */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      {...register("startDate")}
                      className="w-full border border-gray-300 rounded-lg p-3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      {...register("endDate")}
                      className="w-full border border-gray-300 rounded-lg p-3"
                    />
                  </div>
                </div>

                {/* Follow-up Date */}
                <div className="max-w-xs">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Date</label>
                  <input
                    type="date"
                    {...register("followUpDate")}
                    className="w-full border border-gray-300 rounded-lg p-3"
                  />
                </div>

                {/* Array Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Symptoms */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms</label>
                    <div className="space-y-2">
                      {symptomsField.fields.map((item, index) => (
                        <div key={item.id} className="flex gap-2">
                          <input
                            type="text"
                            {...register(`symptoms.${index}.value`)}
                            className="flex-1 border border-gray-300 rounded-lg p-2"
                            placeholder="Enter symptom"
                          />
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => symptomsField.remove(index)}
                              className="px-3 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <X size={20} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => symptomsField.append({ value: "" })}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        + Add Symptom
                      </button>
                    </div>
                  </div>

                  {/* Therapies */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Therapies</label>
                    <div className="space-y-2">
                      {therapiesField.fields.map((item, index) => (
                        <div key={item.id} className="flex gap-2">
                          <input
                            type="text"
                            {...register(`therapies.${index}.value`)}
                            className="flex-1 border border-gray-300 rounded-lg p-2"
                            placeholder="Enter therapy"
                          />
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => therapiesField.remove(index)}
                              className="px-3 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <X size={20} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => therapiesField.append({ value: "" })}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        + Add Therapy
                      </button>
                    </div>
                  </div>
                </div>

                {/* Medicines */}
                <div className="border-t pt-6">
                  <label className="block text-lg font-semibold text-gray-900 mb-4">Medicines</label>
                  <div className="space-y-4">
                    {medicinesField.fields.map((item, index) => (
                      <div key={item.id} className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Name *</label>
                            <input
                              type="text"
                              {...register(`medicines.${index}.name`)}
                              className="w-full border border-gray-300 rounded-lg p-2"
                              placeholder="Medicine name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Dosage</label>
                            <select
                              {...register(`medicines.${index}.dosage`)}
                              className="w-full border border-gray-300 rounded-lg p-2"
                            >
                              <option value="">Select Dosage</option>
                              {treatmentDosages.map(dose => (
                                <option key={dose} value={dose}>{dose}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Frequency</label>
                            <select
                              {...register(`medicines.${index}.frequency`)}
                              className="w-full border border-gray-300 rounded-lg p-2"
                            >
                              <option value="">Select Frequency</option>
                              {treatmentFrequency.map(freq => (
                                <option key={freq} value={freq}>{freq}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Duration</label>
                            <select
                              {...register(`medicines.${index}.duration`)}
                              className="w-full border border-gray-300 rounded-lg p-2"
                            >
                              <option value="">Select Duration</option>
                              {treatmentDurations.map(duration => (
                                <option key={duration} value={duration}>{duration}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => medicinesField.remove(index)}
                            className="mt-3 text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Remove Medicine
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => medicinesField.append({ name: "", dosage: "", frequency: "", duration: "" })}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                    >
                      + Add Another Medicine
                    </button>
                  </div>
                </div>

                {/* Diet & Lifestyle */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Diet Recommendations</label>
                    <div className="space-y-2">
                      {dietField.fields.map((item, index) => (
                        <div key={item.id} className="flex gap-2">
                          <input
                            type="text"
                            {...register(`diet.${index}.value`)}
                            className="flex-1 border border-gray-300 rounded-lg p-2"
                            placeholder="Enter diet recommendation"
                          />
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => dietField.remove(index)}
                              className="px-3 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <X size={20} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => dietField.append({ value: "" })}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        + Add Diet Recommendation
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lifestyle Changes</label>
                    <div className="space-y-2">
                      {lifestyleField.fields.map((item, index) => (
                        <div key={item.id} className="flex gap-2">
                          <input
                            type="text"
                            {...register(`lifestyle.${index}.value`)}
                            className="flex-1 border border-gray-300 rounded-lg p-2"
                            placeholder="Enter lifestyle change"
                          />
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => lifestyleField.remove(index)}
                              className="px-3 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <X size={20} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => lifestyleField.append({ value: "" })}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        + Add Lifestyle Change
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    {...register("notes")}
                    rows={3}
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
                    className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    {editData ? "Update Treatment" : "Save Treatment"}
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

export default TreatmentsPage;