import React from "react";
import {
  FaUserCheck,
  FaCheckCircle,
  FaPrescriptionBottleAlt,
  FaCalendarAlt,
} from "react-icons/fa";
import { colorMap } from "../../../utils/colorMap";

/* ---------- ICON MAP ---------- */
const iconMap = {
  user: <FaUserCheck />,
  check: <FaCheckCircle />,
  prescription: <FaPrescriptionBottleAlt />,
  calendar: <FaCalendarAlt />,
};

const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      title: "New patient registered",
      icon: "user",
      color: "teal",
      details: "Vikram Patel • 30 mins ago",
    },
    {
      id: 2,
      title: "Therapy completed",
      icon: "check",
      color: "green",
      details: "Priya Mehra • 2 hours ago",
    },
    {
      id: 3,
      title: "Prescription updated",
      icon: "prescription",
      color: "blue",
      details: "Rajesh Kumar • 4 hours ago",
    },
    {
      id: 4,
      title: "Appointment rescheduled",
      icon: "calendar",
      color: "purple",
      details: "Arun Sharma • 1 day ago",
    },
  ];

  return (
    <div className="glass-effect rounded-xl shadow-soft p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        Recent Activity
      </h2>

      <div className="space-y-5">
        {activities.map((activity) => {
          const style = colorMap[activity.color] || colorMap.teal;
          const Icon = iconMap[activity.icon];

          return (
            <div key={activity.id} className="flex items-start">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 shrink-0 ${style.bg} ${style.text}`}
              >
                {Icon}
              </div>

              <div>
                <p className="font-medium text-gray-800">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-500">
                  {activity.details}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;
