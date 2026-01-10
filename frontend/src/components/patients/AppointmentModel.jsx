import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import api from "../../services/api";
import { 
  FaCalendarAlt, 
  FaClock, 
  FaUserMd, 
  FaUserInjured, 
  FaNotesMedical,
  FaExclamationCircle,
  FaCheckCircle
} from "react-icons/fa";
import { MdAccessTimeFilled } from "react-icons/md";
import "aos/dist/aos.css";
import AOS from "aos";

const AppointmentFormModal = ({ 
isOpen,
  onClose,
  onSuccess,
  initialDoctor = null,
  initialPatient = null,
}) => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    control,
  } = useForm({
    defaultValues: {
      patient: "",
      doctor: "",
      date: new Date().toISOString().split("T")[0],
      time: "09:00",
      duration: 30,
      type: "consultation",
      priority: "medium",
      purpose: "",
      notes: "",
      reminderEnabled: true,
      location: "Clinic",
    },
  });

  /* ------------------ Utils ------------------ */
  const getTodayDate = () =>
    new Date().toISOString().split("T")[0];

  const roundToNext15 = (date) => {
    const minutes = date.getMinutes();
    const rounded = Math.ceil(minutes / 15) * 15;
    date.setMinutes(rounded);
    date.setSeconds(0);
    return date;
  };

  const getMinTime = () => {
    const selectedDate = watch("date");
    if (selectedDate === getTodayDate()) {
      return roundToNext15(new Date())
        .toTimeString()
        .slice(0, 5);
    }
    return "08:00";
  };

  const getMaxTime = () => "20:00";

  /* ------------------ Effects ------------------ */
  useEffect(() => {
    AOS.init({ duration: 500, once: true, offset: 10 });
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchFormData();
      setTimeout(() => AOS.refresh(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialDoctor || initialPatient) {
      reset((prev) => ({
        ...prev,
        doctor: initialDoctor ?? prev.doctor,
        patient: initialPatient ?? prev.patient,
      }));
    }
  }, [initialDoctor, initialPatient, reset]);

  /* ------------------ API ------------------ */
  const fetchFormData = async () => {
    try {
      setFormLoading(true);

      const [patientsRes, doctorsRes] = await Promise.all([
        api.get("/patients?status=active&limit=100"),
        api.get("/doctors?available=true&limit=100"),
      ]);

      if (patientsRes.data.success)
        setPatients(patientsRes.data.patients || []);

      if (doctorsRes.data.success)
        setDoctors(doctorsRes.data.doctors || []);
    } catch (err) {
      console.error("Fetch form data error:", err);
    } finally {
      setFormLoading(false);
    }
  };

  /* ------------------ Submit ------------------ */
  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const appointmentData = {
        patient: data.patient,
        doctor: data.doctor,   // ✅ FIXED
        date: data.date,
        time: data.time,
        duration: Number(data.duration),
        type: data.type,
        priority: data.priority,
        purpose: data.purpose,
        notes: data.notes,
        reminderEnabled: data.reminderEnabled,
        location: data.location,
      };

      const response = await api.post(
        "/appointments",
        appointmentData
      );

      if (response.data.success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          reset();
          onSuccess?.();
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error("Appointment creation error:", err);
      alert(err.response?.data?.message || "Failed to create appointment");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        data-aos="fade-in"
      />

      {/* Modal Container */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div 
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden"
          data-aos="zoom-in"
          data-aos-duration="300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-linear-to-r from-blue-600 to-blue-700 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <FaCalendarAlt className="text-white" />
                  Book New Appointment
                </h2>
                <p className="text-blue-100 mt-1">Schedule consultation with our specialists</p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-blue-200 text-2xl transition-colors p-2"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Success Animation */}
        {showSuccess && (
            <div 
                className="absolute inset-0 bg-green-50 flex items-center justify-center z-50 pointer-events-none"
            >
                <div className="text-center">
                <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4 animate-bounce" />
                <h3 className="text-2xl font-bold text-green-700">
                    Appointment Booked!
                </h3>
                <p className="text-green-600 mt-2">
                    Redirecting...
                </p>
                </div>
            </div>
            )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 max-h-[70vh] overflow-y-auto">
            {formLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                <p className="text-gray-600 mt-4">Loading form data...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Patient Selection - Required */}
                <div data-aos="fade-up" data-aos-delay="100">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FaUserInjured className="inline mr-2 text-blue-600" />
                    Patient <span className="text-red-500">*</span>
                  </label>
                  {patients.length > 0 ? (
                    <div className="relative">
                      <select
                        {...register("patient", { required: "Patient is required" })}
                        className={`w-full px-4 py-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                          errors.patient ? "border-red-500 bg-red-50" : "border-gray-300"
                        }`}
                      >
                        <option value="">Select Patient</option>
                        {patients.map(patient => (
                          <option key={patient._id} value={patient._id}>
                            {patient.fullName || `${patient.firstName || ''} ${patient.lastName || ''}`.trim()}
                            {patient.patientId ? ` (ID: ${patient.patientId})` : ''}
                          </option>
                        ))}
                      </select>
                      {errors.patient && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <FaExclamationCircle /> {errors.patient.message}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                      No patients found. Please add patients first.
                    </div>
                  )}
                </div>

                {/* Doctor Selection - Required */}
                <div data-aos="fade-up" data-aos-delay="150">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FaUserMd className="inline mr-2 text-blue-600" />
                    Doctor <span className="text-red-500">*</span>
                  </label>
                  {doctors.length > 0 ? (
                    <div className="relative">
                      <select
                        {...register("doctor", { required: "Doctor is required" })}
                        className={`w-full px-4 py-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                          errors.doctor ? "border-red-500 bg-red-50" : "border-gray-300"
                        }`}
                      >
                        <option value="">Select Doctor</option>
                        {doctors.map(doctor => (
                          <option key={doctor._id} value={doctor._id}>
                            Dr. {doctor.user?.name}
                            {doctor.specialization?.[0] ? ` - ${doctor.specialization[0]}` : ''}
                          </option>
                        ))}
                      </select>
                      {errors.doctor && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <FaExclamationCircle /> {errors.doctor.message}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                      No doctors found. Please add doctors first.
                    </div>
                  )}
                </div>

                {/* Date - Required */}
                <div data-aos="fade-up" data-aos-delay="200">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FaCalendarAlt className="inline mr-2 text-blue-600" />
                    Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      {...register("date", { 
                        required: "Date is required",
                        min: {
                          value: getTodayDate(),
                          message: "Date cannot be in the past"
                        }
                      })}
                      min={getTodayDate()}
                      className={`w-full px-4 py-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        errors.date ? "border-red-500 bg-red-50" : "border-gray-300"
                      }`}
                    />
                    {errors.date && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <FaExclamationCircle /> {errors.date.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Time - Required */}
                <div data-aos="fade-up" data-aos-delay="250">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FaClock className="inline mr-2 text-blue-600" />
                    Time <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                        type="time"
                        {...register("time", {
                            required: "Time is required",
                            validate: (value) => {
                            if (!value) return "Time is required";

                            const [h, m] = value.split(":").map(Number);
                            const selectedMinutes = h * 60 + m;

                            const [minH, minM] = getMinTime().split(":").map(Number);
                            const minMinutes = minH * 60 + minM;

                            const [maxH, maxM] = getMaxTime().split(":").map(Number);
                            const maxMinutes = maxH * 60 + maxM;

                            if (selectedMinutes < minMinutes)
                                return `Time ${getMinTime()} ke baad select kare`;

                            if (selectedMinutes > maxMinutes)
                                return `Time ${getMaxTime()} se pehle select kare`;

                            return true;
                            },
                        })}
                        min={getMinTime()}
                        max={getMaxTime()}
                        step="900"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            errors.time ? "border-red-500 bg-red-50" : "border-gray-300"
                        }`}
                        />

                  </div>
                </div>

                {/* Duration - Required */}
                <div data-aos="fade-up" data-aos-delay="300">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <MdAccessTimeFilled className="inline mr-2 text-blue-600" />
                    Duration <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("duration", { required: "Duration is required" })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      errors.duration ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                    <option value="90">90 minutes</option>
                  </select>
                </div>

                {/* Appointment Type - Required */}
                <div data-aos="fade-up" data-aos-delay="350">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("type", { required: "Type is required" })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="consultation">Consultation</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="therapy">Therapy</option>
                    <option value="emergency">Emergency</option>
                    <option value="check-up">Check-up</option>
                  </select>
                </div>

                {/* Priority - Required */}
                <div data-aos="fade-up" data-aos-delay="400">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="priority"
                    control={control}
                    rules={{ required: "Priority is required" }}
                    render={({ field }) => (
                      <select
                        {...field}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                          errors.priority ? "border-red-500 bg-red-50" : "border-gray-300"
                        }`}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="emergency">Emergency</option>
                      </select>
                    )}
                  />
                </div>

                {/* Location - Required */}
                <div data-aos="fade-up" data-aos-delay="450">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("location", { required: "Location is required" })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="Clinic">Main Clinic</option>
                    <option value="Therapy Room 1">Therapy Room 1</option>
                    <option value="Therapy Room 2">Therapy Room 2</option>
                    <option value="Consultation Room">Consultation Room</option>
                    <option value="Emergency Room">Emergency Room</option>
                  </select>
                </div>

                {/* Reminder Toggle */}
                <div data-aos="fade-up" data-aos-delay="500">
                    <label className="flex items-center cursor-pointer select-none">
                        <Controller
                        name="reminderEnabled"
                        control={control}
                        render={({ field }) => (
                            <div
                            onClick={() => field.onChange(!field.value)}
                            className={`relative w-14 h-8 rounded-full transition ${
                                field.value ? "bg-blue-600" : "bg-gray-300"
                            }`}
                            >
                            <div
                                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                                field.value ? "translate-x-6" : ""
                                }`}
                            />
                            </div>
                        )}
                        />
                        <span className="ml-3 text-gray-700 font-medium">
                        Enable Reminder
                        </span>
                    </label>

                    <p className="text-sm text-gray-500 mt-1">
                        Patient will receive appointment reminder
                    </p>
                    </div>


                {/* Purpose - Required */}
                <div className="md:col-span-2" data-aos="fade-up" data-aos-delay="550">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FaNotesMedical className="inline mr-2 text-blue-600" />
                    Purpose <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("purpose", { 
                      required: "Purpose is required",
                      minLength: {
                        value: 10,
                        message: "Purpose must be at least 10 characters"
                      }
                    })}
                    placeholder="Brief description of appointment purpose"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      errors.purpose ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                  />
                  {errors.purpose && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <FaExclamationCircle /> {errors.purpose.message}
                    </p>
                  )}
                </div>

                {/* Notes - Optional */}
                <div className="md:col-span-2" data-aos="fade-up" data-aos-delay="600">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    {...register("notes")}
                    placeholder="Any additional information, symptoms, or special requirements..."
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="sticky bottom-0 bg-white mt-8 pt-6 border-t border-gray-200 flex justify-end gap-4 z-20">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium"
                data-aos="fade-right"
                data-aos-delay="700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || loading || patients.length === 0 || doctors.length === 0}
               className={`px-6 py-3 rounded-xl transition-all duration-300 font-medium flex items-center gap-2 ${
                isSubmitting || loading || patients.length === 0 || doctors.length === 0
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl"
                }`}

                data-aos="fade-left"
                data-aos-delay="700"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Creating...
                  </>
                ) : patients.length === 0 || doctors.length === 0 ? (
                  "Add Data First"
                ) : (
                  <>
                    <FaCheckCircle /> Book Appointment
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AppointmentFormModal;