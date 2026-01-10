import React, { useState,useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import api from '../../../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

const TreatmentModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
  patient: "",
  diagnosis: "",
  chiefComplaints: [],
  symptoms: [],
  prakriti: "",
  doshaImbalance: [],
  medicines: [],
  status: "ongoing",
});

const [currentComplaint, setCurrentComplaint] = useState("");
const [currentSymptom, setCurrentSymptom] = useState("");

const [doctors, setDoctors] = useState([]);
const [patients, setPatients] = useState([]);

const [currentMedicine, setCurrentMedicine] = useState({
  name: "",
  dosage: "",
  frequency: "daily",
  duration: "",
});

const [prakritiTypes, setPrakritiTypes] = useState([]);
const [treatmentFrequency, setTreatmentFrequency] = useState([]);

const [searchTerm, setSearchTerm] = useState("");
const [showPatients, setShowPatients] = useState(false);
const [highlightIndex, setHighlightIndex] = useState(-1);
const [loading, setLoading] = useState(false);

  
  /* ---------------- META DATA ---------------- */
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await api.get("/doctors/meta");
        setPrakritiTypes(res.data?.prakritiTypes || []);
        setTreatmentFrequency(res.data?.treatmentFrequency || []);
      } catch (err) {
        console.error("Failed to fetch meta:", err);
      }
    };
    fetchMeta();
  }, []);

  /* ---------------- FETCH DOCTORS ---------------- */
const fetchDoctors = useCallback(async () => {
  try {
    const response = await api.get("/doctors");

    const doctorList = response.data?.doctors || [];
    const formattedDoctors = doctorList
      .filter(d => d.user)
      .map(d => ({
        _id: d.user._id,
        name: d.user.name,
        email: d.user.email,
        isAvailable: d.isAvailable,
      }));

    setDoctors(formattedDoctors);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    setDoctors([]);
  }
}, []);

//---------------- FETCH PATIENTS WITH SEARCH ---------------- */
const fetchPatients = useCallback(async (query) => {
  const trimmedQuery = query?.trim();

  if (!trimmedQuery) {
    setPatients([]);
    return;
  }

  try {
    setLoading(true);

    const res = await api.get(
      `/patients/search?q=${encodeURIComponent(trimmedQuery)}`
    );

    setPatients(Array.isArray(res.data) ? res.data : []);
  } catch (error) {
    console.error("Error fetching patients:", error);
    setPatients([]);
  } finally {
    setLoading(false);
  }
}, []);


  /* ---------------- PATIENT SEARCH WITH DEBOUNCE ---------------- */
useEffect(() => {
  if (!searchTerm.trim()) {
    setPatients([]);
    return;
  }

  const timer = setTimeout(() => {
    fetchPatients(searchTerm);
  }, 500);

  return () => clearTimeout(timer);
}, [searchTerm, fetchPatients]);

//---------------- HANDLE KEY DOWN ---------------- */
const handleKeyDown = (e) => {
  if (!showPatients || patients.length === 0) return;

  if (e.key === "ArrowDown") {
    setHighlightIndex(prev =>
      prev < patients.length - 1 ? prev + 1 : prev
    );
  }

  if (e.key === "ArrowUp") {
    setHighlightIndex(prev => (prev > 0 ? prev - 1 : 0));
  }

  if (e.key === "Enter" && highlightIndex >= 0) {
    handlePatientSelect(patients[highlightIndex]);
  }
};

//---------------- HANDLE PATIENT SELECT ---------------- */
const handlePatientSelect = (patient) => {
  setFormData(prev => ({
    ...prev,
    patient: patient._id
  }));

  setSearchTerm(
    `${patient.fullName} || Age: ${patient.age} || Gender: ${patient.gender}`
  );

  setShowPatients(false);
};

//---------------- HIGHLIGHT TEXT ---------------- */
const highlightText = (text, highlight) => {
  if (!highlight || !text) return text;

  const regex = new RegExp(`(${highlight})`, "gi");
  return text.split(regex).map((part, i) =>
    part.toLowerCase() === highlight.toLowerCase() ? (
      <span key={i} className="bg-yellow-300 px-1 rounded">
        {part}
      </span>
    ) : part
  );
};

//------------------------------ADD FUNCTIONS (NO SIDE EFFECTS)------------------
const handleAddComplaint = () => {
  if (!currentComplaint.trim()) return;

  setFormData(prev => ({
    ...prev,
    chiefComplaints: [...prev.chiefComplaints, currentComplaint.trim()],
  }));
  setCurrentComplaint("");
};

const handleAddSymptom = () => {
  if (!currentSymptom.trim()) return;

  setFormData(prev => ({
    ...prev,
    symptoms: [...prev.symptoms, currentSymptom.trim()],
  }));
  setCurrentSymptom("");
};

const handleAddMedicine = () => {
  if (!currentMedicine.name || !currentMedicine.dosage) return;

  setFormData(prev => ({
    ...prev,
    medicines: [...prev.medicines, currentMedicine],
  }));

  setCurrentMedicine({
    name: "",
    dosage: "",
    frequency: "daily",
    duration: "",
  });
};

//---------------- FETCH DOCTORS ON MOUNT ---------------- */
 useEffect(() => {
  fetchDoctors();
}, [fetchDoctors]);

  /* ---------------- SUBMIT ---------------- */
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const token = localStorage.getItem("token"); // or wherever you store it
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    await api.post("/treatments", formData, config);

    toast.success("Treatment created successfully!");
    // reset form or close modal
  } catch (err) {
    console.error("Error creating treatment:", err);
    toast.error(err.response?.data?.message || "Failed to create treatment");
  }
};

  
  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center p-4 z-50 fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Create New Treatment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Patient Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Patient *
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search patient by name or ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowPatients(true);
                  setHighlightIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

            </div>
           {showPatients && searchTerm && (
              <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto bg-white shadow">

                {loading && (
                  <div className="p-3 text-center text-gray-500">Searching...</div>
                )}

                {!loading && patients.length > 0 && patients.map((patient, index) => (
                  <div
                    key={patient._id}
                    onClick={() => handlePatientSelect(patient)}
                    className={`p-3 cursor-pointer transition-colors
                      ${index === highlightIndex ? 'bg-blue-100' : 'hover:bg-gray-50'}`}
                  >
                    <div className="font-medium">
                      {highlightText(patient.fullName, searchTerm)}
                      {" || "}
                      Age: {patient.age}
                      {" || "}
                      Gender: {patient.gender}
                    </div>
                  </div>
                ))}

                {!loading && patients.length === 0 && (
                  <div className="p-3 text-gray-500 text-center">
                    No patients found
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Doctor Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Doctor *
            </label>

          
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg
                          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                          transition-all duration-300"
              >
                <option value="">Select Doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    Dr. {doctor.name}
                  </option>
                ))}
              </select>
            
          </div>


          {/* Diagnosis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diagnosis *
            </label>
            <textarea
              value={formData.diagnosis}
              onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Enter diagnosis..."
              required
            />
          </div>

          {/* Chief Complaints */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chief Complaints
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={currentComplaint}
                onChange={(e) => setCurrentComplaint(e.target.value)}
                placeholder="Add chief complaint..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleAddComplaint}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.chiefComplaints.map((complaint, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm"
                >
                  {complaint}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        chiefComplaints: prev.chiefComplaints.filter((_, i) => i !== index)
                      }));
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Prakriti */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prakriti
            </label>

              <select
                value={formData.prakriti}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, prakriti: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Prakriti</option>

                {prakritiTypes.map((dep) => (
                  <option key={dep} value={dep}>
                    {dep.charAt(0).toUpperCase() + dep.slice(1)}
                  </option>
                ))}
              </select>
            </div>

          {/* Medicines */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medicines
            </label>
            <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={currentMedicine.name}
                  onChange={(e) => setCurrentMedicine(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Medicine name"
                  className="px-3 py-2 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  value={currentMedicine.dosage}
                  onChange={(e) => setCurrentMedicine(prev => ({ ...prev, dosage: e.target.value }))}
                  placeholder="Dosage"
                  className="px-3 py-2 border border-gray-300 rounded"
                />
                <select
                  value={currentMedicine.frequency}
                  onChange={(e) => setCurrentMedicine(prev => ({ ...prev, frequency: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded"
                >
                  {treatmentFrequency.map((dep) => (
                  <option key={dep} value={dep}>
                    {dep.charAt(0).toUpperCase() + dep.slice(1)}
                  </option>
                ))}
                </select>
                <input
                  type="text"
                  value={currentMedicine.duration}
                  onChange={(e) => setCurrentMedicine(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="Duration (e.g., 7 days)"
                  className="px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <button
                type="button"
                onClick={handleAddMedicine}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200"
              >
                Add Medicine
              </button>
            </div>

            {formData.medicines.length > 0 && (
              <div className="mt-4 space-y-2">
                {formData.medicines.map((medicine, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">{medicine.name}</div>
                      <div className="text-sm text-gray-600">
                        {medicine.dosage} • {medicine.frequency} • {medicine.duration}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          medicines: prev.medicines.filter((_, i) => i !== index)
                        }));
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Create Treatment
            </button>
          </div>
        </form>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
};

export default TreatmentModal;