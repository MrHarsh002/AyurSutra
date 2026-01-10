// components/MedicalZone.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  FileText,
  PillIcon,
  Pill,
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  Save,
  Printer,
  Download,
  Upload,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Eye,
  Share2,
  MessageSquare,
  Heart,
  Activity,
  Thermometer,
  FileHeart,
  ClipboardList,
  Bell,
  UserCheck,
  Star,
  Award,
  Shield,
  HeartPulse,
  Droplet,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity as ActivityIcon,
  FileCheck,
  FilePlus,
  FileMinus,
  UserPlus,
  UserMinus,
  CalendarDays,
  Syringe,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import api from '../../services/api';
import MedicalForms from '../../components/medical-zone/FormModal';

const MedicalZone = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('symptoms');
  const [medicalData, setMedicalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const tabs = [
    { id: 'symptoms', label: 'Symptoms', icon: Activity, color: 'red' },
    { id: 'diagnosis', label: 'Diagnosis', icon: ClipboardList, color: 'blue' },
    { id: 'treatment', label: 'Treatment', icon: PillIcon, color: 'green' },
    { id: 'notes', label: 'Notes', icon: FileText, color: 'purple' },
    { id: 'reports', label: 'Reports', icon: FileHeart, color: 'orange' },
    { id: 'prescriptions', label: 'Prescriptions', icon: FileText, color: 'pink' },
    { id: 'followUps', label: 'Next Follow-up', icon: CalendarDays, color: 'indigo' },
    { id: 'appointmentStatus', label: 'Appointment Status', icon: UserCheck, color: 'teal' }
  ];

  const fetchMedicalData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/medical-zone/${patientId}`);
      setMedicalData(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching medical data:", err);
      setError(err.response?.data?.message || "Failed to load medical data");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (!patientId) {
      console.warn("No patient ID provided, redirecting to /doctor/list");
      navigate("/doctor/list");
      return;
    }
    fetchMedicalData();
  }, [patientId, navigate, fetchMedicalData]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  

  // Handle form operations
  const handleAdd = (type) => {
    setFormType(type);
    setSelectedItem(null);
    setShowForm(true);
  };

  const handleEdit = (type, item) => {
    setFormType(type);
    setSelectedItem(item);
    setShowForm(true);
  };

  const handleDelete = async (type, id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await api.delete(`/medical-zone/records/${id}`);
        fetchMedicalData(); // Refresh data
      } catch (err) {
        console.error('Error deleting record:', err);
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      let endpoint = '';
      let method = 'post';
      
      switch (formType) {
        case 'symptom':
          endpoint = `/medical-zone/${patientId}/symptoms`;
          break;
        case 'diagnosis':
          endpoint = `/medical-zone/${patientId}/diagnosis`;
          break;
        case 'treatment':
          endpoint = `/medical-zone/${patientId}/treatments`;
          break;
        case 'note':
          endpoint = `/medical-zone/${patientId}/notes`;
          break;
        case 'prescription':
          endpoint = `/medical-zone/${patientId}/prescriptions`;
          break;
        case 'followUp':
          endpoint = `/medical-zone/${patientId}/follow-ups`;
          break;
      }
      
      await api[method](endpoint, formData);
      setShowForm(false);
      fetchMedicalData(); // Refresh data
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Render error state
  if (error || !medicalData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load medical data</h3>
          <p className="text-gray-600 mb-4">{error || 'No data available'}</p>
          <button
            onClick={() => navigate('/patients')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Patients
          </button>
        </div>
      </div>
    );
  }

  // Individual section components
  const SymptomsSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Symptoms Record</h3>
        <button 
          onClick={() => handleAdd('symptom')}
          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Symptom
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {medicalData?.symptoms && medicalData.symptoms.length > 0 ? (
          medicalData.symptoms.map((symptom, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-bold text-lg text-gray-900">{symptom.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    symptom.severity === 'high' ? 'bg-red-100 text-red-800' :
                    symptom.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {symptom.severity?.charAt(0).toUpperCase() + symptom.severity?.slice(1)} Severity
                  </span>
                  <span className="text-gray-500 text-sm">• {symptom.duration}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleEdit('symptom', symptom)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Edit className="w-4 h-4 text-gray-600" />
                </button>
                <button 
                  onClick={() => handleDelete('symptom', symptom.id)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Trash2 className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-gray-600 text-sm">{symptom.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Onset</p>
                  <p className="font-medium">{symptom.onset}</p>
                </div>
                <div>
                  <p className="text-gray-500">Pattern</p>
                  <p className="font-medium">{symptom.pattern}</p>
                </div>
                <div>
                  <p className="text-gray-500">Triggers</p>
                  <p className="font-medium">{symptom.triggers}</p>
                </div>
                <div>
                  <p className="text-gray-500">Notes</p>
                  <p className="font-medium">{symptom.notes}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 text-xs rounded ${
                    symptom.status === 'active' ? 'bg-red-100 text-red-800' :
                    symptom.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {symptom.status?.charAt(0).toUpperCase() + symptom.status?.slice(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {symptom.date ? new Date(symptom.date).toLocaleDateString() : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
            ))
          ) : (
            <p className="text-gray-500 col-span-full">No symptoms recorded yet.</p>
          )}
      </div>
    </div>
  );

  const DiagnosisSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Diagnosis Details</h3>
        <button 
          onClick={() => handleAdd('diagnosis')}
          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Diagnosis
        </button>
      </div>

      {medicalData?.diagnosis && medicalData.diagnosis.length > 0 ? (
        medicalData.diagnosis.map((diagnosis, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-bold text-lg text-gray-900">{diagnosis.name}</h4>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                    {diagnosis.code}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                    {diagnosis.confidence} Confidence
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                    {diagnosis.status}
                  </span>
                  <span className="text-gray-500 text-sm">{diagnosis.type} Diagnosis</span>
                </div>
              </div>
              <button 
                onClick={() => handleEdit('diagnosis', diagnosis)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Edit className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-gray-600">{diagnosis.notes}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Supporting Evidence:</p>
                <div className="flex flex-wrap gap-2">
                  {diagnosis.evidence.map((item, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Diagnosed by {diagnosis.doctor?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(diagnosis.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500">No diagnoses recorded yet.</p>
      )}
    </div>
  );

  const TreatmentSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Treatment Plan</h3>
        <button 
          onClick={() => handleAdd('treatment')}
          className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Treatment
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {medicalData?.treatment && medicalData.treatment.length > 0 ? (
          medicalData.treatment.map((treatment, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-bold text-lg text-gray-900">{treatment.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                      {treatment.type}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      treatment.status === 'Active' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {treatment.status}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => handleEdit('treatment', treatment)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Edit className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Frequency</p>
                    <p className="font-medium">{treatment.frequency}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium">{treatment.duration}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium">
                      {new Date(treatment.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">End Date</p>
                    <p className="font-medium">
                      {treatment.endDate ? new Date(treatment.endDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Instructions</p>
                  <p className="text-gray-700">{treatment.instructions}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-2">Progress</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 rounded-full h-2"
                        style={{ width: treatment.progress }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{treatment.progress}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <p className="text-gray-600">{treatment.notes}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 col-span-full">No treatments recorded yet.</p>
        )}
      </div>
    </div>
  );

  // Rest of the section components follow similar pattern...
  // [PrescriptionsSection, FollowUpsSection, AppointmentStatusSection, etc.]

  const renderContent = () => {
    switch (activeTab) {
      case 'symptoms':
        return <SymptomsSection />;
      case 'diagnosis':
        return <DiagnosisSection />;
      case 'treatment':
        return <TreatmentSection />;
      case 'notes':
        return <NotesSection />;
      case 'reports':
        return <ReportsSection />;
      case 'prescriptions':
        return <PrescriptionsSection />;
      case 'followUps':
        return <FollowUpsSection />;
      case 'appointmentStatus':
        return <AppointmentStatusSection />;
      default:
        return <SymptomsSection />;
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/doctor/patients-card')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Stethoscope className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Medical Zone</h1>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Printer className="w-4 h-4" />
              Print Summary
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Records
            </button>
          </div>
        </div>

        {/* Patient Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <img
                src={medicalData.patient.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${medicalData.patient.fullName}`}
                alt="Patient"
                className="w-16 h-16 rounded-full border-4 border-blue-100"
              />
              <div>
                <h3 className="text-xl font-bold text-gray-900">{medicalData.patient.fullName}</h3>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-gray-600">Patient ID: <span className="font-medium">{medicalData.patient.patientId}</span></p>
                  <p className="text-gray-600">Age: <span className="font-medium">{medicalData.patient.age}</span></p>
                  <p className="text-gray-600">Gender: <span className="font-medium">{medicalData.patient.gender}</span></p>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    medicalData.patient.status === 'active' ? 'bg-green-100 text-green-800' :
                    medicalData.patient.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {medicalData.patient.status?.charAt(0).toUpperCase() + medicalData.patient.status?.slice(1)} Patient
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Blood Group</p>
                <p className="font-medium">{medicalData.patient.bloodGroup || 'N/A'}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{medicalData.patient.phone}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{medicalData.patient.email || 'N/A'}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Allergies</p>
                <p className="font-medium">{medicalData.patient.allergies?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {tabs.map(tab => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 rounded-xl flex items-center gap-3 transition-all ${
                  isActive
                    ? `bg-${tab.color}-600 text-white shadow-lg`
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <TabIcon className={`w-5 h-5 ${isActive ? 'text-white' : `text-${tab.color}-600`}`} />
                <span className="font-medium">{tab.label}</span>
                {isActive && (
                  <div className="ml-2 w-2 h-2 bg-white rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="p-6">
          {renderContent()}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedItem ? 'Edit' : 'Add New'} {formType}
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <MedicalForms
                type={formType}
                initialData={selectedItem}
                onSubmit={handleFormSubmit}
                onCancel={() => setShowForm(false)}
                patientId={patientId}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalZone;