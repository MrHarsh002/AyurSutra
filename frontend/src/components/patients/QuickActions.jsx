import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaFileMedical,
  FaCalendarPlus,
  FaNotesMedical,
  FaPrescriptionBottleAlt,
  FaChevronRight,
} from "react-icons/fa";

/* ---------- SAFE STYLE MAP ---------- */
const actionStyles = {
  register: {
    bg: "bg-teal-100",
    text: "text-teal-600",
    hover: "hover:bg-teal-50",
    route: "/patient/patient-registration",
    icon: <FaFileMedical />,
  },
  schedule: {
    bg: "bg-blue-100",
    text: "text-blue-600",
    hover: "hover:bg-blue-50",
    route: "/therapies/schedule",
    icon: <FaCalendarPlus />,
  },
  report: {
    bg: "bg-green-100",
    text: "text-green-600",
    hover: "hover:bg-green-50",
    route: "/reports",
    icon: <FaNotesMedical />,
  },
  prescription: {
    bg: "bg-purple-100",
    text: "text-purple-600",
    hover: "hover:bg-purple-50",
    route: "/prescriptions/update",
    icon: <FaPrescriptionBottleAlt />,
  },
};

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    { id: 1, label: "New Patient Registration", key: "register" },
    { id: 2, label: "Schedule Therapy", key: "schedule" },
    { id: 3, label: "Generate Report", key: "report" },
    { id: 4, label: "Update Prescription", key: "prescription" },
  ];

  return (
    <div
      className="glass-effect rounded-xl shadow-soft p-6"
      data-aos="fade-left"
    >
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        Quick Actions
      </h2>

      <div className="space-y-4">
        {actions.map((action) => {
          const style = actionStyles[action.key];

          return (
            <button
              key={action.id}
              onClick={() => navigate(style.route)}
              className={`w-full flex items-center justify-between p-4 border border-gray-100 rounded-lg transition hover-lift ${style.hover}`}
            >
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${style.bg} ${style.text}`}
                >
                  {style.icon}
                </div>
                <span className="font-medium text-gray-800">
                  {action.label}
                </span>
              </div>

              <FaChevronRight className="text-gray-400" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
