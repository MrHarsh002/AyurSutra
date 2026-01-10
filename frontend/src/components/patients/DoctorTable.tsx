// components/doctors/DoctorTable.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaPhone, FaEnvelope, FaUserMd, FaStar, FaCalendarAlt } from "react-icons/fa";
import { MdMedicalServices } from "react-icons/md";
import api from "../../services/api";
import AOS from "aos";
import AppointmentFormModal from "../../components/patients/AppointmentModel";

interface Doctor {
  id: string;
  doctorId: string;
  name: string;
  email: string;
  phone: string;
  photo: string;
  department: string;
  specialization: string[];
  experience: number;
  consultationFee: number;
  rating: number;
  totalRatings: number;
  isAvailable: boolean;
  rawData: any;
}

const DoctorTable = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const itemsPerPage = 10;
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    fetchDoctors();
  }, [currentPage]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      // Fetch only active doctors
      const response = await api.get(`/doctors?available=true&page=${currentPage}&limit=${itemsPerPage}`);
      
      if (response.data.success) {
        const filteredDoctors = response.data.doctors
          .filter((doctor: any) => doctor.isAvailable === true)
          .map((doctor: any) => ({
            id: doctor._id,
            doctorId: doctor.doctorId || `DOC${doctor._id.toString().slice(-6).toUpperCase()}`,
            name: doctor.user?.name || "Unknown Doctor",
            email: doctor.user?.email || "N/A",
            phone: doctor.user?.phone || "N/A",
            photo: doctor.user?.photo || doctor.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.user?.name || "Doctor")}&background=10b981&color=fff`,
            department: doctor.department || "General",
            specialization: doctor.specialization || [],
            experience: doctor.experience || 0,
            consultationFee: doctor.consultationFee || 0,
            rating: doctor.rating || 0,
            totalRatings: doctor.totalRatings || 0,
            isAvailable: doctor.isAvailable,
            rawData: doctor
          }));

        setDoctors(filteredDoctors);
        setTotalPages(response.data.totalPages);
        setTotalDoctors(response.data.total);
      }
    } catch (err) {
      console.error("Error fetching doctors:", err);
      setError("Failed to load doctors. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentColor = (department: string) => {
    const colors: { [key: string]: string } = {
      'panchakarma': 'bg-purple-100 text-purple-800',
      'kayachikitsa': 'bg-blue-100 text-blue-800',
      'shalya': 'bg-red-100 text-red-800',
      'shalakya': 'bg-teal-100 text-teal-800',
      'prasuti': 'bg-pink-100 text-pink-800',
      'kaumarabhritya': 'bg-yellow-100 text-yellow-800',
      'swasthavritta': 'bg-green-100 text-green-800',
      'general': 'bg-gray-100 text-gray-800'
    };
    return colors[department] || colors.general;
  };

  const formatDepartment = (dept: string) => {
    const deptMap: { [key: string]: string } = {
      'panchakarma': 'Panchakarma',
      'kayachikitsa': 'Kayachikitsa',
      'shalya': 'Shalya Tantra',
      'shalakya': 'Shalakya',
      'prasuti': 'Prasuti & Stri Roga',
      'kaumarabhritya': 'Kaumarabhritya',
      'swasthavritta': 'Swasthavritta',
      'general': 'General Ayurveda'
    };
    return deptMap[dept] || dept;
  };

  const handleViewDoctor = (doctor: any) => {
    navigate(`/doctor/${doctor.id}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="glass-card rounded-xl shadow-lg p-8 text-center">
        <div className="inline-flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
          <div className="ml-4">
            <p className="text-lg font-medium text-gray-700">Loading doctors...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-linear-to-r from-emerald-50 to-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Active Doctors</h2>
            <p className="text-sm text-gray-600 mt-1">
              Total {totalDoctors} active doctors • Page {currentPage} of {totalPages}
            </p>
          </div>
          <button
            onClick={() => navigate("/doctors/card-view")}
            className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-md"
          >
            <MdMedicalServices /> Card View
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Doctor</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Specialization</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Experience & Rating</th>
              {/* <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Contact</th> */}
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {doctors.map((doctor) => (
              <tr key={doctor.id} className="hover:bg-emerald-50/50 transition-colors">
                {/* Doctor Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      src={doctor.photo}
                      alt={doctor.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-emerald-100"
                    />
                    <div className="ml-4">
                      <div className="text-sm font-semibold text-gray-900">{doctor.name}</div>
                      <div className="text-sm text-gray-500">ID: {doctor.doctorId}</div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getDepartmentColor(doctor.department)}`}>
                        {formatDepartment(doctor.department)}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Specialization */}
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {doctor.specialization.slice(0, 3).map((spec, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
                        {spec}
                      </span>
                    ))}
                    {doctor.specialization.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                        +{doctor.specialization.length - 3} more
                      </span>
                    )}
                  </div>
                </td>

                {/* Experience & Rating */}
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FaUserMd className="text-emerald-600" />
                      <span className="text-sm font-medium">{doctor.experience} years</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaStar className="text-yellow-500" />
                      <span className="text-sm font-medium">{doctor.rating.toFixed(1)}</span>
                      <span className="text-xs text-gray-500">({doctor.totalRatings} reviews)</span>
                    </div>
                    <div className="text-sm font-semibold text-emerald-700">
                      ₹{doctor.consultationFee}/consultation
                    </div>
                  </div>
                </td>

                {/* Contact
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <FaPhone className="text-gray-400" />
                      <span>{doctor.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FaEnvelope className="text-gray-400" />
                      <span className="truncate max-w-180px">{doctor.email}</span>
                    </div>
                  </div>
                </td> */}

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {/* <button
                    onClick={() => handleViewDoctor(doctor)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <FaEye /> View Profile
                  </button> */}

                   <button
                    onClick={() => { setSelectedDoctorId(doctor.id); setShowAppointmentModal(true); }}
                    className="mt-4 cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition"
                    >
                    <FaCalendarAlt /> Book Appointment
                </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalDoctors)} of {totalDoctors} doctors
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePageChange(idx + 1)}
                  className={`w-10 h-10 flex items-center justify-center border rounded-lg ${
                    currentPage === idx + 1
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL */}
            <AppointmentFormModal
              isOpen={showAppointmentModal}
              onClose={() => { setShowAppointmentModal(false); setSelectedDoctorId(null); }}
              onSuccess={() => {}}
              initialDoctor={selectedDoctorId as unknown as null | undefined}
            />
    </div>
  );
};

export default DoctorTable;