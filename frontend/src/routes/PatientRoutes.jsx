import React from "react";
import { Routes, Route } from "react-router-dom";

// Core pages
import Dashboard from "../pages/patientsPages/Dhashboard";
import Schedule from "../pages/patientsPages/Schedule";
import Reports from "../pages/patientsPages/Reports"
import StatsCards from '../components/patients/StatsCards';
import PatientTable from '../components/patients/PatientTable';
import TherapySchedule from '../components/patients/TherapySchedule';
import QuickActions from '../components/patients/QuickActions';
import RecentActivity from '../components/patients/RecentActivity';
import DoshaDistribution from '../components/patients/DoshaDistribution';
import PatientProfiles from "../pages/patientsPages/PatientProfile";
import Patients from "../pages/patientsPages/Pastients";
import Setting from "../pages/patientsPages/Setting"; 
import ChatBot from '../components/patients/chatbot/Chatbot';
import MedicinePopup from '../components/patients/chatbot/MedicinePopup';
import PatientViews from "../pages/patientsPages/PatientsViews";
import DoctorSlide from "../components/patients/doctorViews";
import DoctorTable from "../components/patients/DoctorTable";
import AppointmentModel from "../components/patients/AppointmentModel";

const PatientRoutes = () => {
  return (
    <Routes>
      {/* Dashboard */}
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="schedule" element={<Schedule/>} />
      <Route path="reports" element ={<Reports />} />
         {/* Patients */}
      <Route path="/patient-registration" element={<Patients />} />
      <Route path="/profile" element={<PatientProfiles />} />
      <Route path="/settings" element={<Setting />} />

      {/* Stats and other components */}
      <Route path="/stats" element={<StatsCards />} />
      <Route path="/patients-table" element={<PatientTable />} />
      <Route path="/therapy-schedule" element={<TherapySchedule />} />
      <Route path="/quick-actions" element={<QuickActions />} />
      <Route path="/recent-activity" element={<RecentActivity />} />
      <Route path="/dosha-distribution" element={<DoshaDistribution />} />
      <Route path="/chatbot" element={<ChatBot />} />
      <Route path="/medicine-popup" element={<MedicinePopup />} />
      <Route path="/patients-views" element={<PatientViews />} />
      <Route path="/doctor-slide" element={<DoctorSlide />} />
      <Route path="/doctor-table" element={<DoctorTable />} />
      <Route path="/appointment-model" element={<AppointmentModel />} />
   

      {/* Default fallback */}
      <Route path="*" element={<Dashboard />} />
    </Routes>
  );
};

export default PatientRoutes;
