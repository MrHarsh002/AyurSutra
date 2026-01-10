import React from 'react';
import { X, User, Stethoscope, Calendar, FileText, Pill, Activity } from 'lucide-react';

const TreatmentDetailsModal = ({ treatment, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Treatment Details - {treatment.treatmentId}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Patient & Doctor Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Patient Information</h3>
              </div>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Name:</span>{' '}
                  {treatment.patient?.fullName}
                </p>
                <p>
                  <span className="font-medium">Patient ID:</span>{' '}
                  {treatment.patient?.patientId}
                </p>
                <p>
                  <span className="font-medium">Age:</span>{' '}
                  {treatment.patient?.age} years
                </p>
                <p>
                  <span className="font-medium">Gender:</span>{' '}
                  {treatment.patient?.gender}
                </p>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Stethoscope className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Doctor Information</h3>
              </div>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Doctor:</span>{' '}
                  Dr. {treatment.doctor?.name}
                </p>
                <p>
                  <span className="font-medium">Specialization:</span>{' '}
                  {treatment.doctor?.specialization}
                </p>
                <p>
                  <span className="font-medium">Created By:</span>{' '}
                  {treatment.createdBy?.name}
                </p>
              </div>
            </div>
          </div>

          {/* Diagnosis & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Diagnosis</h3>
              </div>
              <p className="text-gray-700">{treatment.diagnosis}</p>
            </div>

            <div className="bg-white border border-gray-200 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Activity className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Status</h3>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  treatment.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                  treatment.status === 'completed' ? 'bg-green-100 text-green-800' :
                  treatment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {treatment.status.charAt(0).toUpperCase() + treatment.status.slice(1)}
                </span>
                {treatment.followUpDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={14} />
                    Follow-up: {new Date(treatment.followUpDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chief Complaints */}
          {treatment.chiefComplaints?.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Chief Complaints</h3>
              <div className="flex flex-wrap gap-2">
                {treatment.chiefComplaints.map((complaint, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                  >
                    {complaint}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Medicines */}
          {treatment.medicines?.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Pill className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Prescribed Medicines</h3>
              </div>
              <div className="space-y-3">
                {treatment.medicines.map((medicine, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{medicine.name}</h4>
                        <div className="text-sm text-gray-600 mt-1 space-y-1">
                          <p>Dosage: {medicine.dosage}</p>
                          <p>Frequency: {medicine.frequency}</p>
                          <p>Duration: {medicine.duration}</p>
                          {medicine.instructions && (
                            <p>Instructions: {medicine.instructions}</p>
                          )}
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {medicine.beforeMeal ? 'Before Meal' : 'After Meal'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {treatment.prakriti && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Prakriti</h4>
                <p className="text-gray-700 capitalize">{treatment.prakriti}</p>
              </div>
            )}
            
            {treatment.doshaImbalance?.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Dosha Imbalance</h4>
                <div className="flex flex-wrap gap-2">
                  {treatment.doshaImbalance.map((dosha, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm"
                    >
                      {dosha}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          {treatment.notes && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Additional Notes</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{treatment.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TreatmentDetailsModal;