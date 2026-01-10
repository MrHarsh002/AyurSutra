import React from "react";
import { Routes, Route } from "react-router-dom";

//Doctor pages
import Dashboard from "../pages/doctorPages/Dashboard";
import Appointments from "../pages/adminPages/Appointments";
import DoctorProfiles from "../pages/doctorPages/DoctorProfiles";
import DoctorList from "../pages/doctorPages/DoctorList";
import MedicalZone from "../components/medical-zone/MedicalZone";
import Eprescription  from "../pages/doctorPages/Eprescription";
import Notes from "../pages/doctorPages/AddNotes";
import PatientsCard from "../pages/doctorPages/PatientsCard";
import QuerySection from "../pages/doctorPages/QuerySection";
import Setting from "../pages/doctorPages/Setting"; 
// Define Doctor-specific routes

const DoctorRoutes = () => {
  return (
    <Routes>
      {/* Dashboard */}
      <Route path="/dashboard" element={<Dashboard />} />
      {/* Doctors */}
      <Route path="/appointments" element={<Appointments />} />
      <Route path="/list" element={<DoctorList />} />
      <Route path="/medical-zone/:patientId" element={<MedicalZone />} />
      <Route path="/patients-card" element={<PatientsCard />} />
      <Route path="/eprescription" element={<Eprescription />} />
      <Route path="/add-notes" element={<Notes />} />
      <Route path="/query-section" element={<QuerySection />} />
      <Route path="/profile" element={<DoctorProfiles />} />
      <Route path="/settings" element={<Setting />} />

      {/* Default fallback */}
      <Route path="*" element={<Dashboard />} />
    </Routes>
  );
};

export default DoctorRoutes;
