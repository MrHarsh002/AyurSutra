// src/routes/TherapyRoutes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

/* Core pages */
import Dashboard from "../pages/therapyPages/Dashboard";
import Appointments from "../pages/therapyPages/Appointments";
import Doctors from "../pages/therapyPages/Doctors";
import Reports from "../pages/therapyPages/Reports";
import Therapy from "../pages/therapyPages/Therapies";
import Profile from "../pages/therapyPages/TherapyProfile";
import Settings from "../pages/therapyPages/Setting";
import PatientsList from "../pages/therapyPages/Patients";
import AddPatients from "../pages/adminPages/patients/Add";

const TherapyRoutes = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/patients/add" element={<AddPatients />} />
      <Route path="/patients/list" element={<PatientsList />} />
      <Route path="/doctors/list" element={<Doctors />} />
      <Route path="/therapy" element={<Therapy />} />
      <Route path="/appointments" element={<Appointments />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/profile" element={<Profile />} />

      {/* Default */}
      <Route path="*" element={<Dashboard />} />
    </Routes>
  );
};

export default TherapyRoutes;
