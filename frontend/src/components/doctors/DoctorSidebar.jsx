import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaCalendarCheck,
  FaUserInjured,
  FaPrescriptionBottleAlt,
  FaUserMd,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaChevronDown,
  FaCircle,
  FaSpa,
} from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import AOS from "aos";
import "aos/dist/aos.css";

const AyurSutraSidebar = ({ isCollapsed, onToggleCollapse }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [openDropdowns, setOpenDropdowns] = useState({});

  useEffect(() => {
    AOS.init({ duration: 500, easing: "ease-in-out", once: true });
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleDropdown = (label) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const navItems = [
    { to: "/doctor/dashboard", icon: FaTachometerAlt, label: "Dashboard" },
    { to: "/doctor/appointments", icon: FaCalendarCheck, label: "Appointments" },
    { to: "/doctor/patients-card", icon: FaUserInjured, label: "Patients" },
    { to: "/doctor/eprescription", icon: FaPrescriptionBottleAlt, label: "E-Prescription" },
    { to: "/doctor/list", icon: FaUserMd, label: "Doctor List" },
  ];

  return (
    <div data-aos="fade-right">
      <aside
        className={`backdrop-blur-xl bg-linear-to-b from-green-800/90 to-green-950/95 text-white h-screen flex flex-col 
        shadow-xl border-r border-green-600/30 transition-all duration-300 font-sans
        ${isCollapsed ? "w-20" : "w-64"}`}
      >

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-green-500/40 bg-white/10 backdrop-blur-lg">
          {!isCollapsed && (
            <h1 className="text-2xl font-extrabold tracking-wide flex items-center gap-2 text-lime-100 drop-shadow-lg">
              <FaSpa className="text-lime-300" /> AyurSutra
            </h1>
          )}

          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg bg-green-700/40 backdrop-blur hover:bg-green-700/70 transition border border-green-500/50"
            title="Toggle Sidebar"
          >
            <FaBars />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-green-700 scrollbar-track-transparent">
          {navItems.map((item, idx) =>
            item.children ? (
              <div key={idx}>
                <div
                  onClick={() => toggleDropdown(item.label)}
                  className={`flex items-center justify-between px-3 py-3 rounded-lg cursor-pointer mt-2 bg-white/5 backdrop-blur-sm font-medium shadow-sm
                    hover:bg-green-500/40 hover:scale-[1.02] hover:shadow-md transition ${
                      openDropdowns[item.label] ? "bg-green-700/60" : ""
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="text-xl drop-shadow-sm" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>
                  {!isCollapsed && (
                    <FaChevronDown
                      className={`transition-transform ${
                        openDropdowns[item.label] ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </div>

                {!isCollapsed && (
                  <div
                    className={`ml-6 mt-2 space-y-2 transition-all overflow-hidden duration-300 ${
                      openDropdowns[item.label] ? "max-h-60" : "max-h-0"
                    }`}
                  >
                    {item.children?.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-3 py-2 rounded-md text-base transition
                          ${
                            isActive
                              ? "bg-green-600 text-white shadow-inner font-semibold"
                              : "hover:bg-green-700/50"
                          }`
                        }
                      >
                        <FaCircle className="text-[6px]" /> {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer text-lg mt-2
                  tracking-wide transition shadow-sm
                  ${
                    isActive
                      ? "bg-linear-to-r from-green-500 to-lime-500 text-black font-semibold shadow-lg scale-[1.02]"
                      : "bg-white/5 backdrop-blur hover:bg-green-600/40 hover:scale-[1.03] hover:shadow-md"
                  }`
                }
              >
                <item.icon className="text-xl drop-shadow" />
                {!isCollapsed && item.label}
              </NavLink>
            )
          )}
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-green-600/40 bg-white/10 backdrop-blur">
          <button
            onClick={handleLogout}
            className="flex items-center cursor-pointer gap-4 w-full px-4 py-3 rounded-xl bg-red-600/70 hover:bg-red-700/90 transition text-white font-semibold shadow-md hover:scale-[1.03]"
          >
            <FaSignOutAlt className="text-xl" />
            {!isCollapsed && "Logout"}
          </button>
        </div>
      </aside>
    </div>
  );
};

export default AyurSutraSidebar;
