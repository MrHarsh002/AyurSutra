import React from "react";
import { FaOilCan, FaBath, FaLeaf } from "react-icons/fa";
import { colorMap } from "../../../utils/colorMap";

/* ---------- ICON MAP ---------- */
const iconMap = {
  abhyanga: <FaOilCan />,
  basti: <FaBath />,
  nasya: <FaLeaf />,
};

const TherapySchedule = () => {
  const therapies = [
    {
      id: 1,
      name: "Abhyanga Therapy",
      icon: "abhyanga",
      color: "teal",
      room: "Room 3",
      time: "9:00 AM - 10:30 AM",
      patient: "Rajesh Kumar",
      dosha: "Vata-Pitta",
    },
    {
      id: 2,
      name: "Basti Therapy",
      icon: "basti",
      color: "blue",
      room: "Room 5",
      time: "11:00 AM - 12:00 PM",
      patient: "Arun Sharma",
      dosha: "Kapha",
    },
    {
      id: 3,
      name: "Nasya Therapy",
      icon: "nasya",
      color: "amber",
      room: "Room 2",
      time: "2:00 PM - 2:30 PM",
      patient: "Sunita Desai",
      dosha: "Vata",
    },
  ];

  return (
    <div className="glass-effect rounded-xl shadow-soft p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        Today's Therapy Schedule
      </h2>

      <div className="space-y-4">
        {therapies.map((therapy) => {
          const style = colorMap[therapy.color] || colorMap.teal;

          return (
            <div
              key={therapy.id}
              className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition"
            >
              {/* Left */}
              <div className="flex items-center">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${style.bg} ${style.text}`}
                >
                  {iconMap[therapy.icon]}
                </div>

                <div>
                  <p className="font-medium text-gray-800">
                    {therapy.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {therapy.room} • {therapy.time}
                  </p>
                </div>
              </div>

              {/* Right */}
              <div className="text-right">
                <p className="font-medium text-gray-800">
                  {therapy.patient}
                </p>
                <p className="text-sm text-gray-500">
                  {therapy.dosha}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TherapySchedule;
