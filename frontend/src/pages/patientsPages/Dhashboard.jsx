import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import StatsCards from '../../components/patients/StatsCards';
import PatientTable from '../../components/patients/PatientTable';
import TherapySchedule from '../../components/patients/TherapySchedule';
import QuickActions from '../../components/patients/QuickActions';
import RecentActivity from '../../components/patients/RecentActivity';
import DoshaDistribution from '../../components/patients/DoshaDistribution';
import ChatBot from '../../components/patients/chatbot/Chatbot';
import DoctorSlide from '../../components/patients/doctorViews';
import DoctorTable from '../../components/patients/DoctorTable';


const DashboardPage = () => {
  const [showChatBot, setShowChatBot] = useState(false);
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-teal-50 p-4 md:p-6 relative">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header with Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4" data-aos="fade-down">
          <h1 className="text-3xl font-bold text-gray-900">
            Patient Dashboard
          </h1>
          
         <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/patient/patient-registration")}
              className="cursor-pointer px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Patient
            </button>

            <button
              onClick={() => navigate("/patient/patients-views")}
              className="cursor-pointer px-4 py-2 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              </svg>
              View All Patients
            </button>
          </div>
        </div>

        {/* Stats */}
        <StatsCards />
         <DoctorSlide />
         
        {/* Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left */}
          <div className="xl:col-span-2 space-y-6">
            <PatientTable />
            <TherapySchedule />
            <DoctorTable />
          </div>

          {/* Right */}
          <div className="space-y-6">
            <QuickActions />
            <DoshaDistribution />
            <RecentActivity />
          </div>
        </div>
      </div>

      {/* ChatBot Button (Floating) */}
      <button
        onClick={() => setShowChatBot(!showChatBot)}
        className="cursor-pointer fixed bottom-6 right-6 bg-teal-600 text-white p-4 rounded-full shadow-lg hover:bg-teal-700 transition-all duration-200 hover:shadow-xl hover:scale-105 z-50"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

      {/* ChatBot Window */}
      {showChatBot && (
        <div className="fixed cursor-pointer bottom-20 right-6 w-100 h-130 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden">
          <ChatBot onClose={() => setShowChatBot(false)} />
        </div>
      )}

    </div>
  );
};

export default DashboardPage;