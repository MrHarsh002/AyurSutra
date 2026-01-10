import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/** 🔥 IMPORT All Sidebars & Topbars */
import AyurSutraSidebar from "../components/admin/AdminSidebar";
import AdminTopbar from "../components/admin/AdminTopbar";

import DoctorSidebar from "../components/doctors/DoctorSidebar";
import DoctorTopbar from "../components/doctors/DoctorsTopbar";

import PatientSidebar from "../components/patients/PatientsSidebar";
import PatientTopbar from "../components/patients/PatientsTopbar";

import TherapySidebar from "../components/therapy/TherapySidebar";
import TherapyTopbar from "../components/therapy/TherapyTopbar";

const RoleLayout = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // 🔥 Role Based Rendering (Core Logic)
  const renderSidebar = () => {
    switch (user?.role) {
      case "admin": return <AyurSutraSidebar isCollapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />;
      case "doctor": return <DoctorSidebar isCollapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />;
      case "patient": return <PatientSidebar isCollapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />;
      case "therapist": return <TherapySidebar isCollapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />;
      default: return null;
    }
  };

  const renderTopbar = () => {
    switch (user?.role) {
      case "admin": return <AdminTopbar sidebarCollapsed={collapsed} />;
      case "doctor": return <DoctorTopbar sidebarCollapsed={collapsed} />;
      case "patient": return <PatientTopbar sidebarCollapsed={collapsed} />;
      case "therapist": return <TherapyTopbar sidebarCollapsed={collapsed} />;
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      {renderSidebar()}

      {/* Main Area */}
      <div className="flex flex-col flex-1">
        {renderTopbar()}
        <main className="flex-1 p-4 overflow-y-auto bg-gray-50">
          <Outlet /> {/* 👈 This loads selected page content */}
        </main>
      </div>
    </div>
  );
};

export default RoleLayout;
