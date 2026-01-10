// components/patients/StatsCards.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/api"; // your axios instance
import {colorMap} from "../../../utils/colorMap"; // import color mapping
import {iconMap} from "../../../utils/iconMap"; // import icon mapping
const StatsCards = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/dashboard"); // matches backend route
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const color = colorMap[stat.color] || colorMap.teal;
        const Icon = iconMap[stat.icon];
        return (
          <div key={index} className="glass-card p-6 hover:shadow-lg transition">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <h3 className="text-3xl font-bold mt-1">{stat.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color.bg}`}>
                <Icon className={`${color.text} text-xl`} />
              </div>
            </div>
            <p className={`mt-4 text-sm font-medium ${color.text}`}>{stat.trend}</p>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
