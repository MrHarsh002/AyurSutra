// components/patients/TodayAppointments.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { colorMap } from "../../../utils/colorMap";
import AOS from "aos";
import "aos/dist/aos.css";

const statusColorMap = {
  scheduled: "blue",
  confirmed: "teal",
  "checked-in": "amber",
  "in-progress": "purple",
  completed: "green",
  cancelled: "red",
  "no-show": "red",
};

const TodayAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-in-out",
      once: true,
    });

  const fetchAppointments = async () => {
  try {
    const res = await api.get("/appointments/today");

    console.log("API RESPONSE:", res.data); // ✅ debug

    const appts =
      res.data?.data?.appointments ||
      res.data?.appointments ||
      res.data?.data ||
      res.data ||
      [];

    setAppointments(Array.isArray(appts) ? appts : []);
  } catch (err) {
    console.error("Today Appointments Error:", err);
    setError("Failed to fetch today's appointments.");
  } finally {
    setLoading(false);
    setTimeout(() => AOS.refresh(), 100);
  }
};


    fetchAppointments();
  }, []);

  if (loading)
    return <p className="text-center mt-10 text-gray-500">Loading...</p>;

  if (error)
    return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Today's Appointments</h1>

      {appointments.length === 0 ? (
        <p className="text-gray-500">No appointments scheduled for today.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {appointments.map((appt, index) => {
            const colorKey = statusColorMap[appt.status] || "blue";
            const color = colorMap[colorKey] || colorMap.blue;

            const patientName =
              appt.patient?.fullName ||
              `${appt.patient?.firstName || ""} ${appt.patient?.lastName || ""}` ||
              "Unknown Patient";

            return (
              <div
                key={appt._id}
                data-aos="fade-up"
                data-aos-delay={index * 100}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition border"
              >
                {/* TOP COLOR BAR */}
                <div className={`h-2 rounded-t-xl ${color.bg}`} />

                <div className="p-5 flex justify-between items-start">
                  <div>
                    <h3 className={`text-lg font-bold ${color.text}`}>
                      {patientName}
                    </h3>

                    <p className="text-sm text-gray-600 mt-1">
                      Doctor:{" "}
                      <span className="font-medium">
                        {appt.doctor?.name || "Unknown Doctor"}
                      </span>
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(appt.date).toLocaleDateString()} • {appt.time}
                    </p>

                    <p className="text-sm text-gray-500 capitalize mt-1">
                      Type: {appt.type}
                    </p>

                    {appt.notes && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                        Notes: {appt.notes}
                      </p>
                    )}
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${color.badge}`}
                  >
                    {appt.status.replace("-", " ")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TodayAppointments;
