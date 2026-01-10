import React from "react";
import { useLocation } from "react-router-dom";

const highlight = (text, query) => {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, "gi");
  return text.replace(regex, `<mark class="bg-yellow-300">$1</mark>`);
};

export default function SearchResults() {
  const { state } = useLocation();
  if (!state) return <h2>No search data provided</h2>;

  const { query, results } = state;
  const { patients, doctors, appointments } = results;

  return (
    <div className="p-6 space-y-6">
      <h1 className="font-bold text-2xl mb-4">Search Results for: {query}</h1>

      <div className="p-4 bg-green-50 border rounded-lg">
        <b>📌 Summary:</b> {patients.length} Patients, {doctors.length} Doctors, {appointments.length} Appointments
      </div>

      {/* Patients */}
      <section>
        <h2 className="font-bold text-lg">Patients</h2>
        {patients.length === 0 && <p className="text-gray-500">No patients found.</p>}
        {patients.map((p) => (
          <div className="border p-3 my-2 rounded" key={p._id}>
            <h3 dangerouslySetInnerHTML={{ __html: highlight(`${p.fullName} (${p.patientId})`, query) }} />
            <p dangerouslySetInnerHTML={{ __html: highlight(`${p.phone} | ${p.email}`, query) }} />
          </div>
        ))}
      </section>

      {/* Doctors */}
      <section>
        <h2 className="font-bold text-lg mt-4">Doctors</h2>
        {doctors.length === 0 && <p className="text-gray-500">No doctors found.</p>}
        {doctors.map((d) => (
          <div className="border p-3 my-2 rounded" key={d._id}>
            <p dangerouslySetInnerHTML={{ __html: highlight(d.user?.name || "Unknown", query) }} />
            <p>{d.specialization} - {d.department}</p>
          </div>
        ))}
      </section>

      {/* Appointments */}
      <section>
        <h2 className="font-bold text-lg mt-4">Appointments</h2>
        {appointments.length === 0 && <p className="text-gray-500">No appointments found.</p>}
        {appointments.map((a) => (
          <div className="border p-3 my-2 rounded" key={a._id}>
            <p dangerouslySetInnerHTML={{ __html: highlight(a.status, query) }} />
            <p>Patient: {a.patient?.fullName} | Doctor: {a.doctor?.specialization}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
