import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [activeCard, setActiveCard] = useState(null);
  const [showNotification, setShowNotification] = useState(true);

  const cards = [
    {
      id: 1,
      title: "Today's Appointments",
      count: 12,
      icon: "👥",
      bgColor: "bg-gradient-to-r from-blue-500 to-cyan-400",
      borderColor: "border-blue-400",
      textColor: "text-white",
      detail: "8 Confirmed • 2 Pending • 2 Follow-up",
      route: "/doctor/appointments",
    },
    {
      id: 2,
      title: "Pending Prescriptions",
      count: 7,
      icon: "💊",
      bgColor: "bg-gradient-to-r from-purple-500 to-pink-400",
      borderColor: "border-purple-400",
      textColor: "text-white",
      detail: "3 Urgent • 4 Regular",
      route: "/doctor/eprescription",
    },
    {
      id: 3,
      title: "Patient Messages",
      count: 23,
      icon: "💬",
      bgColor: "bg-gradient-to-r from-green-500 to-emerald-400",
      borderColor: "border-green-400",
      textColor: "text-white",
      detail: "18 Unread • 5 Archived",
      route: "/doctor/query-section",
    },
    {
      id: 4,
      title: "Lab Results",
      count: 15,
      icon: "🔬",
      bgColor: "bg-gradient-to-r from-orange-500 to-amber-400",
      borderColor: "border-orange-400",
      textColor: "text-white",
      detail: "8 New • 7 Reviewed",
      route: "/doctor/lab-results",
    },
    {
      id: 5,
      title: "Schedule",
      icon: "📅",
      bgColor: "bg-gradient-to-r from-indigo-500 to-violet-400",
      borderColor: "border-indigo-400",
      textColor: "text-white",
      detail: "Next: 2:30 PM - John Doe",
      route: "/doctor/schedule",
    },
    {
      id: 6,
      title: "Medical Records",
      icon: "📋",
      bgColor: "bg-gradient-to-r from-rose-500 to-red-400",
      borderColor: "border-rose-400",
      textColor: "text-white",
      detail: "Last Updated: Today 10:30 AM",
      route: "/doctor/patients-card",
    },
  ];

  // ✅ CARD CLICK HANDLER
  const handleCardClick = (card) => {
    setActiveCard(card.id);

    setTimeout(() => {
      setActiveCard(null);
      navigate(card.route); // 🔥 NAVIGATE TO PAGE
    }, 200);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 p-6">
      
      {/* Notification */}
      {showNotification && (
        <div className="mb-6 p-4 bg-blue-100 border border-blue-200 rounded-xl flex justify-between">
          <span>📢 Staff meeting today at 4 PM</span>
          <button
            className="font-bold hover:text-gray-700"
            onClick={() => setShowNotification(false)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleCardClick(card)}
            className={`relative ${card.bgColor} ${card.textColor}
              p-6 rounded-2xl shadow-lg cursor-pointer
              transition-all duration-300 hover:scale-105
              border-2 ${card.borderColor}
              ${activeCard === card.id ? "ring-4 ring-white/50" : ""}
            `}
          >
            <div className="flex justify-between mb-4">
              <span className="text-4xl">{card.icon}</span>
              {card.count && (
                <span className="bg-white/20 px-3 py-1 rounded-full">
                  {card.count}
                </span>
              )}
            </div>

            <h3 className="text-xl font-bold">{card.title}</h3>
            <p className="text-sm opacity-90">{card.detail}</p>

            <div className="mt-4 text-right text-lg">→</div>

            {activeCard === card.id && (
              <div className="absolute inset-0 bg-white/30 animate-ping rounded-2xl"></div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: "🩺",
              label: "New Prescription",
              color: "bg-blue-100 text-blue-600",
              route: "/doctor/eprescription/new",
            },
            {
              icon: "📝",
              label: "Add Notes",
              color: "bg-green-100 text-green-600",
              route: "/doctor/add-notes",
            },
            {
              icon: "📤",
              label: "Share Report",
              color: "bg-purple-100 text-purple-600",
              route: "/doctor/reports",
            },
            {
              icon: "📊",
              label: "Analytics",
              color: "bg-orange-100 text-orange-600",
              route: "/doctor/analytics",
            },
          ].map((action, index) => (
            <button
              key={index}
              onClick={() => navigate(action.route)}
              className={`${action.color}
                p-4 rounded-xl
                hover:shadow-md hover:scale-105
                transition-all duration-300
                flex flex-col items-center justify-center
                space-y-2 cursor-pointer
              `}
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm mt-8">
        <p>© 2024 Medical Dashboard v2.0 • All rights reserved</p>
        <p className="mt-1">Last sync: Today 11:45 AM</p>
      </footer>
    </div>
  );
};

export default DoctorDashboard;
