// components/medical-zone/MedicalZone.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Stethoscope,
  ArrowLeft,
  Loader2,
  XCircle,
  Printer,
  Download,
  FileText,
  User,
  Calendar,
  Clock,
  Pill,
  ClipboardList,
  FileBarChart,
  NotebookPen,
  Repeat
} from "lucide-react";

import api from "../../services/api";

import SymptomsSection from "./tabs/SymptomsSection";
import DiagnosisSection from "./tabs/DiagnosisSection";
import TreatmentSection from "./tabs/TreatmentSection";
import NotesSection from "./tabs/NotesSection";
import ReportsSection from "./tabs/ReportsSection";
import PrescriptionsSection from "./tabs/PrescriptionsSection";
import FollowUpsSection from "./tabs/FollowUpsSection";
import AppointmentStatusSection from "./tabs/AppointmentStatusSection";
import MedicalForms from "./FormModal";

const MedicalZone = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("symptoms");
  const [medicalData, setMedicalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patientInfo, setPatientInfo] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // Tab configuration with icons
const tabs = [
  { id: "symptoms", label: "Symptoms", icon: Stethoscope },
  { id: "diagnosis", label: "Diagnosis", icon: ClipboardList },
  { id: "treatment", label: "Treatment", icon: Pill },
  { id: "prescriptions", label: "Prescriptions", icon: FileText },
  { id: "notes", label: "Notes", icon: NotebookPen },
  { id: "followUps", label: "Follow-ups", icon: Repeat },
  { id: "reports", label: "Reports", icon: FileBarChart, hidden:false },
  { id: "appointmentStatus", label: "Appointment", icon: Calendar , hidden:true},
];


  const fetchMedicalData = useCallback(async () => {
    try {
      setLoading(true);
      const [medicalRes, patientRes] = await Promise.all([
        api.get(`/medical-zone/${patientId}`),
        api.get(`/patients/${patientId}`)
      ]);
      setMedicalData(medicalRes.data);
      setPatientInfo(patientRes.data);
    } catch (err) {
      setError("Failed to load medical data");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (!patientId) {
      navigate("/doctor/patients-card");
      return;
    }
    fetchMedicalData();
  }, [patientId, fetchMedicalData, navigate]);

  const openForm = (type, item = null) => {
    setFormType(type);
    setSelectedItem(item);
    setShowForm(true);
  };

const handlePrint = () => {
    // Create a print-friendly version
    const printWindow = window.open('', '_blank');
    const printContent = document.querySelector('.print-content').innerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Medical Record - ${patientInfo?.name || 'Patient'}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Inter', sans-serif; 
            padding: 20px; 
            color: #1f2937;
            line-height: 1.5;
          }
          .header { 
            border-bottom: 2px solid #3b82f6; 
            padding-bottom: 20px; 
            margin-bottom: 30px;
          }
          .patient-info { 
            background: #f8fafc; 
            padding: 20px; 
            border-radius: 8px; 
            margin-bottom: 30px;
            border-left: 4px solid #3b82f6;
          }
          .section { 
            margin-bottom: 30px; 
            page-break-inside: avoid;
          }
          .section-title { 
            color: #1e40af; 
            font-weight: 600; 
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 1px solid #dbeafe;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 10px;
          }
          th { 
            background: #eff6ff; 
            text-align: left; 
            padding: 12px;
            border: 1px solid #dbeafe;
            font-weight: 600;
          }
          td { 
            padding: 12px; 
            border: 1px solid #dbeafe;
          }
          .timestamp { 
            color: #6b7280; 
            font-size: 0.875rem;
            margin-top: 5px;
          }
          @media print {
            .no-print { display: none; }
            body { padding: 15px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="color: #1e40af; font-size: 24px; margin-bottom: 10px;">
            <span style="color: #3b82f6;">🩺</span> Medical Record
          </h1>
          <p style="color: #6b7280;">Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="patient-info">
          <h2 style="color: #1e40af; margin-bottom: 10px;">Patient Information</h2>
          <p><strong>Name:</strong> ${patientInfo?.name || 'N/A'}</p>
          <p><strong>Age:</strong> ${patientInfo?.age || 'N/A'}</p>
          <p><strong>Gender:</strong> ${patientInfo?.gender || 'N/A'}</p>
          <p><strong>Patient ID:</strong> ${patientId}</p>
        </div>
        
        ${printContent}
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 0.875rem;">
            This document contains confidential medical information. Unauthorized disclosure is prohibited.
          </p>
          <p style="color: #6b7280; font-size: 0.875rem; margin-top: 10px;">
            Generated by Medical Zone System • ${new Date().toLocaleString()}
          </p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const renderContent = () => {
    if (!medicalData) return null;

    const commonProps = {
      data: medicalData,
      onAdd: openForm,
      onEdit: openForm,
    };

    switch (activeTab) {
      case "symptoms":
        return <SymptomsSection {...commonProps} />;
      case "diagnosis":
        return <DiagnosisSection {...commonProps} />;
      case "treatment":
        return <TreatmentSection {...commonProps} />;
      case "notes":
        return <NotesSection {...commonProps} />;
      case "reports":
        return <ReportsSection {...commonProps} />;
      case "prescriptions":
        return <PrescriptionsSection {...commonProps} />;
      case "followUps":
        return <FollowUpsSection {...commonProps} />;
      case "appointmentStatus":
        return <AppointmentStatusSection {...commonProps} />;
      default:
        return null;
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-linear-to-br from-blue-50 to-white">
        <Loader2 className="animate-spin w-12 h-12 text-blue-600 mb-4" />
        <p className="text-gray-600">Loading medical data...</p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-medium mb-2">{error}</p>
          <button
            onClick={() => navigate("/doctor/patients-card")}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Patients
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 p-4 md:p-6 print:p-0">
      {/* Main Container */}
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
            <button 
                onClick={handlePrint}
            className="px-4 py-2 border  border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Printer className="w-4 h-4" />
              Print 
            </button>
            <button className="px-4 py-2 hidden bg-blue-600 text-white rounded-lg hover:bg-blue-700  items-center gap-2">
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
    <div>
        
      {/* Tab Navigation */}
        <div className="mb-8">
      <div className="flex flex-wrap gap-2">
        {tabs
          .filter(tab => !tab.hidden) // ✅ hide hidden tabs
          .map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-5 py-3 rounded-xl flex items-center gap-3 font-medium transition-all duration-300
                  ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg scale-105"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                  }
                `}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? "text-white" : "text-blue-600"
                  }`}
                />
                <span>{tab.label}</span>

                {isActive && (
                  <span className="ml-2 w-2 h-2 bg-white rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
      </div>

        </div>



        {/* Content Area */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden print:shadow-none print:rounded-none">
        
        {/* Tab Labels for Print */}
        <div className="hidden print:block p-6 border-b min-h-fit print:h-auto bg-white">
          <h2 className="text-xl font-bold text-blue-700 uppercase tracking-wide">
            {tabs.find(t => t.id === activeTab)?.label || 'Medical Information'}
          </h2>
        </div>

        {/* Main Content */}
        <div className="p-6 print:p-0 print-content h-auto">
          {renderContent()}
        </div>
      </div>


        {/* Footer Note */}
        <div className="mt-6 text-center text-gray-500 text-sm print:mt-8 print:border-t print:pt-4">
          <p>All medical information is confidential and protected under HIPAA regulations.</p>
          <p className="mt-1">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-slideUp">
            {/* Modal Header */}
            <div className="sticky top-0 bg-linear-to-r from-blue-600 to-blue-500 text-white p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold capitalize">{formType}</h2>
                  <p className="text-blue-100 text-sm mt-1">
                    {selectedItem ? 'Edit Record' : 'Add New Record'}
                  </p>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <MedicalForms
                type={formType}
                initialData={selectedItem}
                patientId={patientId}
                onSuccess={() => {
                  setShowForm(false);
                  fetchMedicalData();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MedicalZone;