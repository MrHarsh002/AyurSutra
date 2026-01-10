import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import AOS from "aos";
import "aos/dist/aos.css";

const MedicalZone = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-in-out",
    });
  }, []);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await api.get("/patients");
        setPatients(res.data?.patients || res.data || []);
      } catch (error) {
        console.error("Error fetching patients:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    navigate(`/doctor/medical-zone/${patient._id}`);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 p-6">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          🩺 Medical Zone
        </h1>
        <p className="text-gray-600 mt-2">
          Select a patient to view complete medical records
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      )}

      {/* Patient Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {patients.map((patient, index) => (
                <div
                key={patient._id}
                data-aos="fade-up"
                data-aos-delay={index * 80}
                onClick={() => handleSelectPatient(patient)}
                className={`
                    cursor-pointer relative rounded-2xl p-5
                    bg-white/70 backdrop-blur-xl
                    border transition-all duration-300
                    hover:shadow-2xl hover:-translate-y-2
                    hover:bg-linear-to-r hover:from-blue-100 hover:via-indigo-50 hover:to-purple-50
                    ${
                    selectedPatient?._id === patient._id
                        ? "border-blue-500 ring-2 ring-blue-300"
                        : "border-gray-200"
                    }
                `}
                >
                {/* Gradient Bar */}
                <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-linear-to-r from-blue-500 to-indigo-500"></div>

                {/* Avatar */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {patient.firstName?.charAt(0) || "P"}
                    </div>

                    <div>
                    <h3 className="font-semibold text-lg text-gray-900">
                        {patient.firstName} {patient.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">
                        Age: {patient.age || "N/A"}
                    </p>
                    </div>
                </div>

                {/* Info */}
                <div className="text-sm text-gray-600 space-y-1">
                    <p>
                    <span className="font-medium text-gray-700">Patient ID:</span>{" "}
                    {patient._id.slice(-6)}
                    </p>
                    <p>
                    <span className="font-medium text-gray-700">Gender:</span>{" "}
                    {patient.gender || "N/A"}
                    </p>
                </div>

                {/* CTA */}
                <div className="mt-4 flex justify-end">
                    <span className="text-sm font-medium text-blue-600 group-hover:underline">
                    View Medical Records →
                    </span>
                </div>
                </div>
            ))}
            </div>


      {/* Empty State */}
      {!loading && patients.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <p>No patients found.</p>
        </div>
      )}
    </div>
  );
};

export default MedicalZone;
