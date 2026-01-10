import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaChevronLeft, FaChevronRight, FaUsers, FaPhone, FaEnvelope } from "react-icons/fa";
import { HiUser } from "react-icons/hi";
import api from "../../services/api";
import "aos/dist/aos.css";
import AOS from "aos";

/* ---------- COLOR CONFIGURATION ---------- */
const avatarColors = {
  teal: "bg-teal-100 text-teal-700",
  amber: "bg-amber-100 text-amber-700",
  green: "bg-green-100 text-green-700",
  purple: "bg-purple-100 text-purple-700",
  red: "bg-red-100 text-red-700",
  blue: "bg-blue-100 text-blue-700",
  indigo: "bg-indigo-100 text-indigo-700",
  pink: "bg-pink-100 text-pink-700",
};

const statusColors = {
  active: "bg-green-100 text-green-800 border border-green-200",
  inactive: "bg-gray-100 text-gray-800 border border-gray-200",
  deceased: "bg-red-100 text-red-800 border border-red-200",
  pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  completed: "bg-blue-100 text-blue-800 border border-blue-200",
};

const ITEMS_PER_PAGE = 8; // Increased for better view

const PatientTable = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);
  const [loadAll, setLoadAll] = useState(true);


  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 50,
      easing: 'ease-out-cubic'
    });
  }, []);

  // Fetch patients data
 useEffect(() => {
  setLoadAll(true);
  fetchPatients();
}, []);

const fetchPatients = async () => {
  try {
    setLoading(true);

    const url = loadAll
      ? `/patients` // ✅ fetch ALL data
      : `/patients?page=${currentPage}&limit=${ITEMS_PER_PAGE}`;

    const response = await api.get(url);

    if (response.data.success) {
      const patientList = response.data.patients;

      const transformedPatients = patientList.map(patient => ({
        id: patient._id,
        patientId: patient.patientId || `PAT${patient._id.slice(-6)}`,
        initials: getInitials(patient.fullName || `${patient.firstName} ${patient.lastName}`),
        name: patient.fullName || `${patient.firstName} ${patient.lastName}`,
        age: patient.age || "N/A",
        gender: patient.gender || "N/A",
        phone: patient.phone || "N/A",
        email: patient.email || "N/A",
        status: patient.status || "active",
        registeredDate: patient.createdAt,
        rawData: patient
      }));

      setPatients(transformedPatients);

      // Pagination sirf UI ke liye
      setTotalPatients(transformedPatients.length);
      setTotalPages(Math.ceil(transformedPatients.length / ITEMS_PER_PAGE));
    }
  } catch (err) {
    setError("Failed to load patients");
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  // Helper functions
  const getInitials = (fullName) => {
    if (!fullName) return "NA";
    const initials = fullName
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase();
    return initials.length > 2 ? initials.slice(0, 2) : initials;
  };

  const getInitialsColor = (initials) => {
    const keys = Object.keys(avatarColors);
    const hash = initials.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return keys[hash % keys.length];
  };

  const getStatusText = (status) => {
    const statusMap = {
      'active': 'Active',
      'inactive': 'Inactive',
      'deceased': 'Deceased',
      'pending': 'Pending'
    };
    return statusMap[status] || 'Active';
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'active': 'active',
      'inactive': 'inactive',
      'deceased': 'deceased',
      'pending': 'pending'
    };
    return colorMap[status] || 'active';
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => AOS.refresh(), 300);
    }
  };

  const handleViewPatient = (patient) => {
    // Navigate to detailed patient view page
    navigate(`/patient/${patient.id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  

  if (loading) {
    return (
      <div className="glass-card overflow-hidden rounded-xl shadow-lg" data-aos="fade-up">
        <div className="px-6 py-4 border-b border-gray-200 bg-linear-to-r from-teal-50 to-white">
          <h2 className="text-xl font-bold text-gray-800">Recent Patients</h2>
        </div>
        <div className="p-12 text-center">
          <div className="inline-flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-600 border-t-transparent"></div>
            <div className="ml-4">
              <p className="text-lg font-medium text-gray-700">Loading patients...</p>
              <p className="text-sm text-gray-500 mt-1">Please wait while we fetch the latest records</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && patients.length === 0) {
    return (
      <div className="glass-card overflow-hidden rounded-xl shadow-lg" data-aos="fade-up">
        <div className="px-6 py-4 border-b border-gray-200 bg-linear-to-r from-teal-50 to-white">
          <h2 className="text-xl font-bold text-gray-800">Recent Patients</h2>
        </div>
        <div className="p-8 text-center">
          <div className="inline-flex flex-col items-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl text-red-600">!</span>
            </div>
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <p className="text-gray-600 mb-6">Displaying sample data for demonstration</p>
            <button
              onClick={fetchPatients}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all shadow-md hover:shadow-lg"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ================= TABLE CONTAINER ================= */}
      <div className="glass-card overflow-hidden rounded-xl shadow-lg border border-gray-100" data-aos="fade-up">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-linear-to-r from-teal-50 to-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Patient Records</h2>
            <p className="text-sm text-gray-600 mt-1">
              Total {totalPatients} patients • Page {currentPage} of {totalPages}
            </p>
          </div>
          <button
            onClick={() => navigate("/patient/patients-views")}
            className="cursor-pointer flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-teal-600 to-teal-700 text-white rounded-lg hover:from-teal-700 hover:to-teal-800 transition-all shadow-md hover:shadow-lg active:scale-95"
            data-aos="fade-left"
            data-aos-delay="200"
          >
            <FaUsers className="text-lg" /> View All Patients
          </button>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-linear-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {patients.length > 0 ? (
                patients.map((patient, index) => {
                  const avatarColor = getInitialsColor(patient.initials);
                  const statusColor = getStatusColor(patient.status);

                  return (
                    <tr
                      key={patient.id}
                      className="hover:bg-linear-to-r hover:from-teal-50/50 hover:to-blue-50/50 transition-all duration-300 cursor-pointer"
                      onClick={() => handleViewPatient(patient)}
                    >
                      {/* Patient Info */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm ${avatarColors[avatarColor]}`}
                          >
                            {patient.initials}
                          </div>
                          <div className="ml-4">
                            <p className="font-semibold text-gray-900">{patient.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                                ID: {patient.patientId}
                              </span>
                              {patient.occupation && (
                                <span className="text-xs text-gray-500 truncate max-w-120px">
                                  {patient.occupation}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex flex-col gap-2">
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${statusColors[statusColor]}`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full mr-2 ${
                                patient.status === 'active'
                                  ? 'bg-green-500'
                                  : patient.status === 'inactive'
                                  ? 'bg-gray-500'
                                  : patient.status === 'deceased'
                                  ? 'bg-red-500'
                                  : 'bg-yellow-500'
                              }`}
                            ></span>
                            {getStatusText(patient.status)}
                          </span>
                          <span className="text-xs text-gray-500">
                            Registered: {formatDate(patient.registeredDate)}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPatient(patient);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 hover:text-teal-800 transition-all border border-teal-100"
                        >
                          <FaEye className="text-sm" /> Quick View
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    No patients found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>


        {/* ================= PAGINATION ================= */}
        {totalPatients > ITEMS_PER_PAGE && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50" data-aos="fade-up" data-aos-delay="400">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalPatients)}</span> -{" "}
                <span className="font-semibold">{Math.min(currentPage * ITEMS_PER_PAGE, totalPatients)}</span> of{" "}
                <span className="font-semibold">{totalPatients}</span> patients
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all active:scale-95 flex items-center gap-2"
                  data-aos="fade-right"
                >
                  <FaChevronLeft className="text-sm" /> Previous
                </button>

                <div className="flex gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                    const pageNum = currentPage <= 3 
                      ? idx + 1 
                      : currentPage >= totalPages - 2 
                        ? totalPages - 4 + idx 
                        : currentPage - 2 + idx;
                    
                    if (pageNum < 1 || pageNum > totalPages) return null;

                    return (
                      <button
                        key={idx}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 flex items-center justify-center border rounded-lg transition-all ${
                          currentPage === pageNum
                            ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                            : "border-gray-300 hover:bg-gray-50"
                        } active:scale-95`}
                        data-aos="fade-up"
                        data-aos-delay={idx * 50}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all active:scale-95 flex items-center gap-2"
                  data-aos="fade-left"
                >
                  Next <FaChevronRight className="text-sm" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= DETAILED MODAL ================= */}
      {selectedPatient && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          data-aos="fade-in"
          onClick={() => setSelectedPatient(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            data-aos="zoom-in"
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-linear-to-r from-teal-600 to-teal-700 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">{selectedPatient.name}</h3>
                  <p className="text-teal-100 mt-1">Patient ID: {selectedPatient.patientId}</p>
                </div>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="text-2xl text-white hover:text-teal-100 transition-colors p-1"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">Personal Information</h4>
                  <DetailItem label="Full Name" value={selectedPatient.name} />
                  <DetailItem label="Date of Birth" value={formatDate(selectedPatient.rawData?.dateOfBirth)} />
                  <DetailItem label="Age" value={`${selectedPatient.age} years`} />
                  <DetailItem label="Gender" value={selectedPatient.gender} />
                  <DetailItem label="Marital Status" value={selectedPatient.maritalStatus} />
                  <DetailItem label="Occupation" value={selectedPatient.occupation} />
                </div>

                {/* Contact & Medical */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">Contact & Medical</h4>
                  <DetailItem label="Phone" value={selectedPatient.phone} />
                  <DetailItem label="Email" value={selectedPatient.email} />
                  <DetailItem label="Blood Group" value={selectedPatient.bloodGroup} />
                  <DetailItem label="Address" value={selectedPatient.address} />
                  <DetailItem label="Registration Date" value={formatDate(selectedPatient.registeredDate)} />
                  <DetailItem label="Status" value={
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[getStatusColor(selectedPatient.status)]}`}>
                      {getStatusText(selectedPatient.status)}
                    </span>
                  } />
                </div>
              </div>

              {/* Additional Information */}
              {(selectedPatient.emergencyContact || selectedPatient.allergies?.length > 0 || selectedPatient.medicalHistory?.length > 0) && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedPatient.emergencyContact && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-medium text-gray-700 mb-2">Emergency Contact</h5>
                        <p className="text-sm">{selectedPatient.emergencyContact.name}</p>
                        <p className="text-sm text-gray-600">{selectedPatient.emergencyContact.relationship}</p>
                        <p className="text-sm text-gray-600">{selectedPatient.emergencyContact.phone}</p>
                      </div>
                    )}
                    {selectedPatient.allergies?.length > 0 && (
                      <div className="bg-red-50 p-4 rounded-lg">
                        <h5 className="font-medium text-red-700 mb-2">Allergies</h5>
                        <div className="flex flex-wrap gap-1">
                          {selectedPatient.allergies.map((allergy, idx) => (
                            <span key={idx} className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">
                              {allergy}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedPatient.medicalHistory?.length > 0 && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h5 className="font-medium text-blue-700 mb-2">Medical History</h5>
                        <div className="space-y-1">
                          {selectedPatient.medicalHistory.slice(0, 3).map((history, idx) => (
                            <p key={idx} className="text-sm text-blue-800">{history}</p>
                          ))}
                          {selectedPatient.medicalHistory.length > 3 && (
                            <p className="text-xs text-blue-600">+{selectedPatient.medicalHistory.length - 3} more</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedPatient(null);
                    handleViewPatient(selectedPatient);
                  }}
                  className="px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all shadow-md hover:shadow-lg"
                >
                  View All Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Reusable Detail Component for Modal
const DetailItem = ({ label, value }) => (
  <div className="flex justify-between items-start py-2 border-b border-gray-100 last:border-b-0">
    <span className="text-gray-600 font-medium text-sm">{label}</span>
    <span className="text-gray-900 font-semibold text-right max-w-[60%]">{value || 'Not specified'}</span>
  </div>
);

export default PatientTable;