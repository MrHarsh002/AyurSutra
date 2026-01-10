import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  Users,
  ClipboardList,
  FileText,
  CalendarDays,
  BarChart3
} from "lucide-react";

const TherapyDashboard = () => {
  const navigate = useNavigate();
  const [activeCard, setActiveCard] = useState(null);
  const [showNotification, setShowNotification] = useState(true);

  const cards = [
    {
      id: 1,
      title: "Today's Sessions",
      count: 10,
      icon: Brain,
      bgColor: "bg-gradient-to-r from-blue-500 to-sky-400",
      borderColor: "border-blue-400",
      textColor: "text-white",
      detail: "6 Completed • 4 Upcoming",
      route: "/therapy/sessions/today",
    },
    {
      id: 2,
      title: "Active Patients",
      count: 32,
      icon: Users,
      bgColor: "bg-gradient-to-r from-green-500 to-emerald-400",
      borderColor: "border-green-400",
      textColor: "text-white",
      detail: "5 New this week",
      route: "/therapy/patients/list",
    },
    {
      id: 3,
      title: "Therapy Plans",
      count: 18,
      icon: ClipboardList,
      bgColor: "bg-gradient-to-r from-purple-500 to-fuchsia-400",
      borderColor: "border-purple-400",
      textColor: "text-white",
      detail: "3 Pending review",
      route: "/therapy/plans",
    },
    {
      id: 4,
      title: "Session Notes",
      count: 24,
      icon: FileText,
      bgColor: "bg-gradient-to-r from-orange-500 to-amber-400",
      borderColor: "border-orange-400",
      textColor: "text-white",
      detail: "8 Unfinished",
      route: "/therapy/session-notes",
    },
    {
      id: 5,
      title: "Schedule",
      icon: CalendarDays,
      bgColor: "bg-gradient-to-r from-indigo-500 to-violet-400",
      borderColor: "border-indigo-400",
      textColor: "text-white",
      detail: "Next: 3:00 PM • Anxiety Therapy",
      route: "/therapy/schedule",
    },
    {
      id: 6,
      title: "Progress Reports",
      icon: BarChart3,
      bgColor: "bg-gradient-to-r from-rose-500 to-red-400",
      borderColor: "border-rose-400",
      textColor: "text-white",
      detail: "Last generated: Today",
      route: "/therapy/reports",
    },
  ];

  const handleCardClick = (card) => {
    setActiveCard(card.id);
    setTimeout(() => {
      setActiveCard(null);
      navigate(card.route);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-indigo-50 p-6">

      {/* Notification */}
      {showNotification && (
        <div className="mb-6 p-4 bg-indigo-100 border border-indigo-200 rounded-xl flex justify-between">
          <span>📢 New therapy guidelines updated today</span>
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
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(card)}
              className={`relative cursor-pointer p-6 rounded-2xl shadow-lg
                ${card.bgColor} ${card.textColor}
                border-2 ${card.borderColor}
                transition-all duration-300
                hover:scale-105 hover:shadow-2xl
                ${activeCard === card.id ? "ring-4 ring-white/50" : ""}
              `}
            >
              {/* Icon + Count */}
              <div className="flex justify-between items-center mb-4">
                <Icon className="w-10 h-10 opacity-90" />
                {card.count && (
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                    {card.count}
                  </span>
                )}
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold">{card.title}</h3>
              <p className="text-sm opacity-90 mt-1">{card.detail}</p>

              {/* Arrow */}
              <div className="mt-4 text-right text-xl">→</div>

              {/* Click Animation */}
              {activeCard === card.id && (
                <div className="absolute inset-0 bg-white/30 animate-ping rounded-2xl"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mt-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Quick Actions
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: "➕", label: "New Session", color: "bg-blue-100 text-blue-600", route: "/therapy/sessions/new" },
            { icon: "🧾", label: "Add Notes", color: "bg-green-100 text-green-600", route: "/therapy/session-notes/new" },
            { icon: "🧠", label: "Create Plan", color: "bg-purple-100 text-purple-600", route: "/therapy/plans/new" },
            { icon: "📈", label: "Progress", color: "bg-orange-100 text-orange-600", route: "/therapy/reports" },
          ].map((action, index) => (
            <button
              key={index}
              onClick={() => navigate(action.route)}
              className={`${action.color}
                p-4 rounded-xl
                flex flex-col items-center justify-center
                space-y-2
                hover:scale-105 hover:shadow-md
                transition-all duration-300
              `}
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm mt-10">
        <p>© 2024 Therapy Dashboard v1.0 • All rights reserved</p>
        <p className="mt-1">Last sync: Today 12:10 PM</p>
      </footer>
    </div>
  );
};

export default TherapyDashboard;
