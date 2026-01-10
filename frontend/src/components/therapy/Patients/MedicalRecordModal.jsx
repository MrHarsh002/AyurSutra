// components/MedicalRecordModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  X, Plus, FileText, Calendar, Clock, User, Activity, 
  Heart, Pill, Thermometer, Weight, Ruler, Stethoscope,
  Download, Printer, Share2, Eye, Edit, Trash2, AlertCircle, RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../../../services/api';
import { toast } from 'react-toastify';

const MedicalRecordModal = ({ patient, isOpen, onClose }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showNewRecordForm, setShowNewRecordForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [newRecord, setNewRecord] = useState({
    visitType: 'routine',
    date: new Date().toISOString().split('T')[0],
    time: format(new Date(), 'HH:mm'),
    diagnosis: '',
    symptoms: '',
    treatment: '',
    prescription: '',
    notes: '',
    vitalSigns: {
      temperature: '',
      bloodPressure: '',
      heartRate: '',
      respiratoryRate: '',
      oxygenSaturation: ''
    },
    tests: [],
    followUpDate: ''
  });

  useEffect(() => {
    if (isOpen && patient) {
      fetchMedicalRecords();
    }
  }, [isOpen, patient]);

  const fetchMedicalRecords = async () => {
  try {
    setLoading(true);
    const response = await api.get(`/patients/${patient._id}/medical-records`);
    setRecords(response.data?.records || []);
  } catch (error) {
    toast.error('Failed to load medical records');
    setRecords([]);
  } finally {
    setLoading(false);
  }
};

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    
    if (!newRecord.diagnosis.trim()) {
      toast.warning('Please enter a diagnosis');
      return;
    }

    setFormLoading(true);
    try {
      const response = await api.post(`/patients/${patient._id}/medical-records`, newRecord);
      toast.success('Medical record created successfully');
      setRecords(prev => [response.data?.record, ...prev]);
      setShowNewRecordForm(false);
      setSelectedRecord(response.data?.record);
      setNewRecord({
        visitType: 'routine',
        date: new Date().toISOString().split('T')[0],
        time: format(new Date(), 'HH:mm'),
        diagnosis: '',
        symptoms: '',
        treatment: '',
        prescription: '',
        notes: '',
        vitalSigns: {
          temperature: '',
          bloodPressure: '',
          heartRate: '',
          respiratoryRate: '',
          oxygenSaturation: ''
        },
        tests: [],
        followUpDate: ''
      });
    } catch (error) {
      console.error('Error creating record:', error);
      toast.error(error.response?.data?.message || 'Failed to create medical record');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (!recordId || !window.confirm('Are you sure you want to delete this medical record?')) return;

    try {
      await api.delete(`/medical-records/${recordId}`);
      toast.success('Record deleted successfully');
      setRecords(prev => prev.filter(record => record._id !== recordId));
      if (selectedRecord?._id === recordId) {
        setSelectedRecord(null);
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      toast.error(error.response?.data?.message || 'Failed to delete record');
    }
  };

  const formatDateTime = (date, time) => {
    if (!date) return 'N/A';
    try {
      const dateObj = new Date(`${date}T${time || '00:00'}`);
      return format(dateObj, 'MMM dd, yyyy • hh:mm a');
    } catch {
      return 'Invalid Date';
    }
  };

  const getVisitTypeColor = (type) => {
    const colors = {
      routine: 'bg-blue-100 text-blue-800',
      emergency: 'bg-red-100 text-red-800',
      followup: 'bg-green-100 text-green-800',
      specialist: 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const safeRecords = Array.isArray(records) ? records : [];

  if (!isOpen || !patient) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Medical Records</h2>
              <div className="flex items-center gap-2 mt-1">
                <User size={16} className="text-gray-400" />
                <span className="text-gray-600">{patient.fullName || 'Patient'}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">ID: {patient.patientId || 'N/A'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNewRecordForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                <Plus size={18} />
                New Record
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={formLoading}
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex h-600px">
            {/* Records List */}
            <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
              <div className="p-4">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                    <p className="text-gray-500 text-sm">Loading records...</p>
                  </div>
                ) : safeRecords.length > 0 ? (
                  <div className="space-y-3">
                    {safeRecords.map(record => (
                      <div
                        key={record?._id || Math.random()}
                        onClick={() => setSelectedRecord(record)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all hover:border-blue-300 ${
                          selectedRecord?._id === record?._id
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getVisitTypeColor(record?.visitType)}`}>
                            {record?.visitType
                              ? record.visitType.charAt(0).toUpperCase() + record.visitType.slice(1)
                              : 'Visit'
                            }
                          </span>
                          <span className="text-sm text-gray-500">
                            {record?.date ? format(new Date(record.date), 'MMM dd') : '--'}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900 truncate">
                          {record?.diagnosis || 'No diagnosis recorded'}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1 truncate">
                          {record?.symptoms || 'No symptoms recorded'}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-gray-500">
                            {record?.date
                              ? formatDateTime(record.date, record.time)
                              : 'No date'
                            }
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRecord(record);
                              }}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                              title="View Details"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteRecord(record?._id);
                              }}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                              title="Delete Record"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No medical records found</p>
                    <button
                      onClick={() => setShowNewRecordForm(true)}
                      className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Create first record
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Record Details */}
            <div className="flex-1 overflow-y-auto">
              {showNewRecordForm ? (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">New Medical Record</h3>
                    <button
                      onClick={() => setShowNewRecordForm(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                      disabled={formLoading}
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <form onSubmit={handleCreateRecord} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Visit Type *
                        </label>
                        <select
                          value={newRecord.visitType}
                          onChange={(e) => setNewRecord(prev => ({ ...prev, visitType: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                          disabled={formLoading}
                        >
                          <option value="routine">Routine Checkup</option>
                          <option value="emergency">Emergency</option>
                          <option value="followup">Follow-up</option>
                          <option value="specialist">Specialist Consultation</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date *
                        </label>
                        <input
                          type="date"
                          value={newRecord.date}
                          onChange={(e) => setNewRecord(prev => ({ ...prev, date: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                          disabled={formLoading}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Diagnosis *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter diagnosis"
                        value={newRecord.diagnosis}
                        onChange={(e) => setNewRecord(prev => ({ ...prev, diagnosis: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                        disabled={formLoading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Symptoms
                      </label>
                      <textarea
                        placeholder="Describe symptoms"
                        value={newRecord.symptoms}
                        onChange={(e) => setNewRecord(prev => ({ ...prev, symptoms: e.target.value }))}
                        rows="2"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        disabled={formLoading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Treatment & Prescription
                      </label>
                      <textarea
                        placeholder="Treatment plan and prescriptions"
                        value={newRecord.treatment}
                        onChange={(e) => setNewRecord(prev => ({ ...prev, treatment: e.target.value }))}
                        rows="3"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        disabled={formLoading}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Temperature (°C)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="35"
                          max="42"
                          value={newRecord.vitalSigns.temperature}
                          onChange={(e) => setNewRecord(prev => ({
                            ...prev,
                            vitalSigns: { ...prev.vitalSigns, temperature: e.target.value }
                          }))}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          disabled={formLoading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Blood Pressure
                        </label>
                        <input
                          type="text"
                          placeholder="120/80"
                          value={newRecord.vitalSigns.bloodPressure}
                          onChange={(e) => setNewRecord(prev => ({
                            ...prev,
                            vitalSigns: { ...prev.vitalSigns, bloodPressure: e.target.value }
                          }))}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          disabled={formLoading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Heart Rate
                        </label>
                        <input
                          type="number"
                          min="40"
                          max="200"
                          value={newRecord.vitalSigns.heartRate}
                          onChange={(e) => setNewRecord(prev => ({
                            ...prev,
                            vitalSigns: { ...prev.vitalSigns, heartRate: e.target.value }
                          }))}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          disabled={formLoading}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => setShowNewRecordForm(false)}
                        className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        disabled={formLoading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={formLoading}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {formLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Plus size={18} />
                            Save Record
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              ) : selectedRecord ? (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {selectedRecord?.diagnosis || 'Medical Record'}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getVisitTypeColor(selectedRecord?.visitType)}`}>
                          {selectedRecord?.visitType
                            ? selectedRecord.visitType.charAt(0).toUpperCase() + selectedRecord.visitType.slice(1)
                            : 'Visit'
                          }
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDateTime(selectedRecord?.date, selectedRecord?.time)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Print"
                      >
                        <Printer size={18} />
                      </button>
                      <button
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download size={18} />
                      </button>
                      <button
                        onClick={() => setShowNewRecordForm(true)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Add New Record"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Symptoms */}
                    {selectedRecord?.symptoms && (
                      <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-100">
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <Activity size={18} className="text-yellow-600" />
                          Symptoms
                        </h4>
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {selectedRecord.symptoms}
                        </p>
                      </div>
                    )}

                    {/* Vital Signs */}
                    {(selectedRecord?.vitalSigns?.temperature || selectedRecord?.vitalSigns?.bloodPressure) && (
                      <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <Activity size={18} className="text-blue-600" />
                          Vital Signs
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          {selectedRecord.vitalSigns.temperature && (
                            <div className="text-center p-3 bg-white rounded-lg border">
                              <Thermometer size={20} className="text-red-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-500">Temperature</p>
                              <p className="font-bold">{selectedRecord.vitalSigns.temperature}°C</p>
                            </div>
                          )}
                          {selectedRecord.vitalSigns.bloodPressure && (
                            <div className="text-center p-3 bg-white rounded-lg border">
                              <Activity size={20} className="text-blue-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-500">Blood Pressure</p>
                              <p className="font-bold">{selectedRecord.vitalSigns.bloodPressure}</p>
                            </div>
                          )}
                          {selectedRecord.vitalSigns.heartRate && (
                            <div className="text-center p-3 bg-white rounded-lg border">
                              <Heart size={20} className="text-red-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-500">Heart Rate</p>
                              <p className="font-bold">{selectedRecord.vitalSigns.heartRate} BPM</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Treatment */}
                    {selectedRecord?.treatment && (
                      <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <Stethoscope size={18} className="text-green-600" />
                          Treatment & Prescription
                        </h4>
                        <div className="space-y-3">
                          {selectedRecord.prescription && (
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Prescription:</p>
                              <div className="bg-white p-3 rounded-lg border">
                                <p className="text-gray-700 whitespace-pre-wrap">
                                  {selectedRecord.prescription}
                                </p>
                              </div>
                            </div>
                          )}
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {selectedRecord.treatment}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {selectedRecord?.notes && (
                      <div className="bg-gray-50 rounded-xl p-5">
                        <h4 className="font-medium text-gray-900 mb-2">Additional Notes</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {selectedRecord.notes}
                        </p>
                      </div>
                    )}

                    {/* Follow Up */}
                    {selectedRecord?.followUpDate && (
                      <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <Calendar size={18} className="text-purple-600" />
                          Follow-up Appointment
                        </h4>
                        <p className="text-gray-700">
                          Scheduled for {format(new Date(selectedRecord.followUpDate), 'MMMM dd, yyyy')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-6">
                  <FileText size={64} className="text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Record Selected</h3>
                  <p className="text-gray-500 text-center mb-6 max-w-md">
                    Select a medical record from the list to view details, or create a new record.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowNewRecordForm(true)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus size={18} />
                      New Record
                    </button>
                    {safeRecords.length > 0 && (
                      <button
                        onClick={() => setSelectedRecord(safeRecords[0])}
                        className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        View First Record
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              {safeRecords.length} record(s) found
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchMedicalRecords()}
                className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-white transition-colors"
              >
                <RefreshCw size={14} />
                Refresh
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordModal;