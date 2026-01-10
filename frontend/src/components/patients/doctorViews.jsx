import React, { useEffect, useState } from "react";
import { FaStar, FaCalendarAlt } from "react-icons/fa";
import api from "../../services/api";
import AppointmentFormModal from "../../components/patients/AppointmentModel";

const DoctorSlide = () => {
  const [doctors, setDoctors] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      const res = await api.get("/doctors?available=true&limit=3");
      if (res.data.success) {
        setDoctors(res.data.doctors);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (!doctors.length) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % doctors.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [doctors]);

  if (!doctors.length) return null;

  const doctor = doctors[currentSlide];

  return (
    <>
      {/* SLIDE */}
      <div className="h-430px flex items-center justify-between bg-linear-to-r from-emerald-50 to-green-100 rounded-2xl p-10">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-emerald-700">
            Dr. {doctor.user?.name}
          </h2>

          <p className="text-gray-700">
            {doctor.specialization?.[0]} • {doctor.experience} yrs
          </p>

          <div className="flex items-center gap-2">
            <FaStar className="text-yellow-500" />
            {doctor.rating || 4.5}
          </div>

          <button
            onClick={() => setShowAppointmentModal(true)}
            className="mt-4 flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
          >
            <FaCalendarAlt /> Book Appointment
          </button>
        </div>

        <img
          src={doctor.user?.photo}
          alt={doctor.user?.name}
          className="w-280px h-360px object-cover rounded-xl shadow-xl"
        />
      </div>

      {/* MODAL */}
      <AppointmentFormModal
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        onSuccess={() => {}}
        initialDoctor={doctor._id}   // ✅ VERY IMPORTANT
      />
    </>
  );
};

export default DoctorSlide;
