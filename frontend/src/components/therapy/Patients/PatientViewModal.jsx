// components/PatientViewModal.jsx
import React from 'react';
import {
  X, Calendar, Phone, Mail, MapPin, Hash, Droplets, Activity, 
  Heart, Pill, FileText, Clock, User, Shield, AlertCircle,
  Globe, Weight, Ruler, Thermometer
} from 'lucide-react';


import { format } from 'date-fns';

const PatientViewModal = ({ patient, isOpen, onClose }) => {
  if (!isOpen || !patient) return null;

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

  const statusConfig = {
    active: { color: 'bg-green-100 text-green-800', label: 'Active' },
    inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inactive' },
    deceased: { color: 'bg-red-100 text-red-800', label: 'Deceased' }
  };

  const patientStatus = statusConfig[patient.status] || statusConfig.inactive;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-linear-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center border border-blue-200">
                <span className="text-blue-600 font-bold text-lg">
                  {patient.firstName?.[0]}{patient.lastName?.[0]}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{patient.fullName}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-gray-500">ID: {patient.patientId}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${patientStatus.color}`}>
                    {patientStatus.label}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Personal Information */}
              <div className="lg:col-span-2">
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User size={20} />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">Date of Birth</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="font-medium">{formatDate(patient.dateOfBirth)}</span>
                        <span className="text-gray-500">({calculateAge(patient.dateOfBirth)} years)</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Gender</label>
                      <p className="font-medium mt-1">{patient.gender || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Nationality</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Globe size={16} className="text-gray-400" />
                        <span className="font-medium">{patient.nationality || 'N/A'}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Marital Status</label>
                      <p className="font-medium mt-1">{patient.maritalStatus || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-gray-50 rounded-xl p-5 mt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Phone size={20} />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">Phone Number</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone size={16} className="text-gray-400" />
                        <span className="font-medium">{patient.phone || 'N/A'}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Email Address</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail size={16} className="text-gray-400" />
                        <span className="font-medium truncate">{patient.email || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm text-gray-500">Address</label>
                      <div className="flex items-start gap-2 mt-1">
                        <MapPin size={16} className="text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium">{patient.address?.street || 'N/A'}</p>
                          <p className="text-gray-600">
                            {patient.address?.city && `${patient.address.city}, `}
                            {patient.address?.state && `${patient.address.state} `}
                            {patient.address?.zipCode && `${patient.address.zipCode}`}
                          </p>
                          <p className="text-gray-600">{patient.address?.country || ''}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                {patient.emergencyContact && (
                  <div className="bg-red-50 rounded-xl p-5 mt-4 border border-red-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <AlertCircle size={20} className="text-red-500" />
                      Emergency Contact
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-500">Name</label>
                        <p className="font-medium mt-1">{patient.emergencyContact.name}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Relationship</label>
                        <p className="font-medium mt-1">{patient.emergencyContact.relationship}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Phone</label>
                        <div className="flex items-center gap-2 mt-1">
                          <Phone size={16} className="text-gray-400" />
                          <span className="font-medium">{patient.emergencyContact.phone}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Email</label>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail size={16} className="text-gray-400" />
                          <span className="font-medium">{patient.emergencyContact.email || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Medical Information */}
              <div>
                <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Heart size={20} className="text-blue-500" />
                    Medical Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Droplets className="w-5 h-5 text-red-500" />
                        <div>
                          <p className="text-sm text-gray-500">Blood Group</p>
                          <p className="font-bold text-lg">{patient.bloodGroup || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <Pill size={18} className="text-purple-500" />
                        <p className="font-medium">Allergies</p>
                      </div>
                      {patient.allergies?.length > 0 ? (
                        <div className="space-y-2">
                          {patient.allergies.map((allergy, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <span className="font-medium">{allergy.name}</span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                allergy.severity === 'severe' 
                                  ? 'bg-red-100 text-red-800'
                                  : allergy.severity === 'moderate'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {allergy.severity}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No allergies recorded</p>
                      )}
                    </div>

                    <div className="p-3 bg-white rounded-lg border">
                      <div className="flex items-center gap-2 mb-3">
                        <Activity size={18} className="text-green-500" />
                        <p className="font-medium">Vital Statistics</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <Weight size={18} className="text-gray-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-500">Weight</p>
                          <p className="font-bold">{patient.weight || 'N/A'} kg</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <Ruler size={18} className="text-gray-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-500">Height</p>
                          <p className="font-bold">{patient.height || 'N/A'} cm</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <Thermometer size={18} className="text-gray-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-500">BMI</p>
                          <p className="font-bold">{patient.bmi || 'N/A'}</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <Activity size={18} className="text-gray-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-500">BP</p>
                          <p className="font-bold">{patient.bloodPressure || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Medical History */}
                    <div className="p-3 bg-white rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText size={18} className="text-orange-500" />
                        <p className="font-medium">Chronic Conditions</p>
                      </div>
                      {patient.chronicConditions?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {patient.chronicConditions.map((condition, index) => (
                            <span key={index} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                              {condition}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No chronic conditions</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* System Information */}
                <div className="bg-gray-50 rounded-xl p-5 mt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield size={20} />
                    System Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created On</span>
                      <span className="font-medium">{formatDate(patient.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Updated</span>
                      <span className="font-medium">{formatDate(patient.updatedAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Medical Record No.</span>
                      <span className="font-medium">{patient.medicalRecordNumber || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Close
            </button>
            <button
              onClick={() => {
                // Handle edit action
                onClose();
                // You can add edit navigation here
              }}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Edit Patient
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientViewModal;