import React from "react";
import { Routes, Route } from "react-router-dom";

//Main pages
import Dashboard from "../pages/adminPages/Dashboard";
import Appointments from "../pages/adminPages/Appointments";
import Billing from "../pages/adminPages/Billing";
import Inventory from "../pages/adminPages/Inventory";
import Reports from "../pages/adminPages/Reports";
import Therapy from "../pages/adminPages/Therapy";
import Treatments from "../pages/adminPages/Treatments"; 
import Profile from "../pages/adminPages/Profile";
import Settings from "../pages/adminPages/Setting";

//Patients pages
import AddPatients from "../pages/adminPages/patients/Add";
import PatientList from "../pages/adminPages/patients/List";

// Doctor pages
import AddDoctor from "../pages/adminPages/doctors/Add";
import DoctorList from "../pages/adminPages/doctors/List";
import DoctorSchedule from "../pages/adminPages/doctors/Schedule";

//Searching global 
import SearchResults from "../pages/adminPages/SearchResults";

//rs pages
import UsersList from "../pages/adminPages/ListUsers";

const MainContent = () => {
  return (
    <Routes>
      {/* Dashboard */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Patients */}
      <Route path="/patients/add" element={<AddPatients />} />
      <Route path="/patients/list" element={<PatientList />} />


      {/* Doctors */}
      <Route path="/doctors/main" element={<DoctorList />} />
      <Route path="/doctors/add" element={<AddDoctor />} />
      <Route path="/doctors/list" element={<DoctorList />} />
      <Route path="/doctors/schedule" element={<DoctorSchedule />} />

      {/* Therapy & Treatments */}
      <Route path="/therapy" element={<Therapy />} />
      <Route path="/treatments" element={<Treatments />} />

      {/* Management */}
      <Route path="/appointments" element={<Appointments />} />
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/billing" element={<Billing />} />
      <Route path="/reports" element={<Reports />} />

      {/* System */}
      <Route path="/settings" element={<Settings />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/users"  element={<UsersList />} />

      {/* Search Results */}
      <Route path="/admin/search-results" element={<SearchResults />} />

      {/* Default fallback */}
      <Route path="*" element={<Dashboard />} />
    </Routes>
  );
};

export default MainContent;
