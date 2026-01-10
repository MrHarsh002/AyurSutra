import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaSpa,
  FaTachometerAlt,
  FaCog,
  FaCalendarCheck,
  FaSignOutAlt,
  FaBars,
  FaChevronDown,
  FaFileMedicalAlt,
  FaCalendarAlt,
  FaCircle,
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
    { to: "/patient/dashboard", icon: FaTachometerAlt, label: "Dashboard" },
    { to: "/patient/patient-registration", icon: FaCalendarCheck, label: "Patients" },
    { to: "/patient/schedule", icon: FaCalendarAlt, label: "Schedule" },
    { to: "/patient/reports", icon: FaFileMedicalAlt, label: "Reports" },
    { to: "/patient/settings", icon: FaCog, label: "Settings" },  
  ];

  return (
    <div data-aos="fade-right">
    <aside
      className={`bg-green-900 text-white h-screen flex flex-col transition-all duration-300 font-sans
        ${isCollapsed ? "w-16" : "w-64"}`}
      
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-green-700">
        {!isCollapsed && (
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <FaSpa /> AyurSutra
            </h1>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="rounded-full p-2 cursor-pointer border border-gray-300 dark:border-gray-600 hover:bg-green-100 dark:hover:bg-green-700 transition-colors"
          title="Toggle Sidebar"
        >
          <FaBars className="text-gray-900 dark:text-white text-lg font-bold" />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-2 py-3 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
        {navItems.map((item, idx) =>
          item.children ? (
            <div key={idx}>
              {/* Parent Menu */}
              <div
                onClick={() => toggleDropdown(item.label)}
                className={`flex items-center justify-between gap-3 px-3 py-2 mt-1 rounded-md cursor-pointer hover:bg-green-700 transition-colors font-medium ${
                  openDropdowns[item.label] ? "bg-green-700" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon />
                  {!isCollapsed && <span>{item.label}</span>}
                </div>
                {!isCollapsed && (
                  <FaChevronDown
                    className={`transition-transform duration-300 ${
                      openDropdowns[item.label] ? "rotate-180" : ""
                    }`}
                  />
                )}
              </div>

              {/* Child Links */}
              {!isCollapsed && (
                <div
                  className={`ml-6 mt-1 space-y-1 overflow-hidden transition-all duration-300`}
                  style={{
                    maxHeight: openDropdowns[item.label] ? "500px" : "0",
                    overflowY: "auto",
                  }}
                >
                  {item.children.map((child) => (
                    <NavLink
                      key={child.to}
                      to={child.to}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-3 py-1 rounded-md text-base ${
                          isActive ? "bg-green-600" : "hover:bg-green-700"
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
                `flex items-center gap-3 px-3 py-2 rounded-md text-lg transition ${
                  isActive ? "bg-green-700" : "hover:bg-green-700"
                }`
              }
            >
              <item.icon />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          )
        )}
      </div>

      {/* Logout button - always at bottom */}
      <div className="p-2 border-t border-green-700">
        <button
          onClick={handleLogout}
          className="flex items-center w-full gap-3 px-3 py-2 rounded-md hover:bg-green-700 text-lg"
        >
          <FaSignOutAlt />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
    </div>
  );
};

export default AyurSutraSidebar;
