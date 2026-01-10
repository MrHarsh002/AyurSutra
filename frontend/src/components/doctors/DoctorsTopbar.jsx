import React, { useState, useRef, useEffect } from "react";
import {
  FaUserCircle, FaBell, FaSignOutAlt, FaUser, FaSearch,
} from "react-icons/fa";
import { IoChevronDown } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

const DoctorsTopbar = ({ sidebarCollapsed }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notificationCount = 3;

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🌟 Outside click close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🚪 Logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // 🔍 Search Submit
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert("Please enter something to search!");
      return;
    }

    try {
      setLoading(true);
      const res = await api.get(`/search?q=${searchQuery}`);
      navigate("/doctor/search-results", {
        state: { query: searchQuery, results: res.data.results },
      });
      setSuggestions([]);
    } catch (error) {
      console.log("Search error:", error);
      alert("Search failed! Check console.");
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Live Suggestions
  useEffect(() => {
    if (!searchQuery.trim()) return setSuggestions([]);

    const delay = setTimeout(async () => {
      try {
        const res = await api.get(`/search?q=${searchQuery}`);
        const all = [
          ...res.data.results.patients,
          ...res.data.results.doctors,
          ...res.data.results.appointments,
        ];
        setSuggestions(all.slice(0, 6));
      } catch {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 px-4 lg:px-6 py-3 flex items-center justify-between sticky top-0 z-40">

      {/* 🌱 Logo when Sidebar collapsed */}
      <div className="flex items-center gap-4">
        {sidebarCollapsed && (
          <div className="hidden lg:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            <span className="text-lg font-bold text-green-700 dark:text-green-400">AyurSutra</span>
          </div>
        )}
      </div>

      {/* 🔍 SEARCH BAR */}
      <div className="flex-1 max-w-2xl mx-4 relative">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="relative w-full max-w-sm"
        >
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />

          <input
            type="text"
            placeholder="Search patients, doctors, appointments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700
            bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100
            focus:ring-2 focus:ring-green-500 transition"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSuggestions([]);
              }}
              className="absolute right-10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 top-1/2 -translate-y-1/2"
            >
              ×
            </button>
          )}

          {loading && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin">⏳</span>
          )}
        </form>

        {/* 💡 Suggestions List */}
        {suggestions.length > 0 && (
          <div className="absolute bg-white dark:bg-gray-900 w-full mt-2 shadow-lg rounded-lg border dark:border-gray-800 z-50 max-w-sm">
            {suggestions.map((item, i) => (
              <div
                key={i}
                onClick={() => {
                  setSearchQuery(item.fullName || item.user?.name || item.status);
                  handleSearch();
                }}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              >
                <strong>
                  {item.fullName || item.user?.name || item.patientId}
                </strong>{" "}
                <span className="text-xs text-gray-500">
                  {item.department || item.status || ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🔔 User + Notifications */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <FaBell className="text-xl text-gray-600 dark:text-gray-300" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-5 h-5 flex items-center justify-center rounded-full">
              {notificationCount}
            </span>
          )}
        </button>

        {/* 👤 USER DROPDOWN */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-green-500">
              {user?.photo ? (
                <img src={user.photo} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <FaUserCircle className="w-full h-full text-gray-400" />
              )}
            </div>

            <p className="hidden md:block text-sm text-gray-800 dark:text-gray-200">
              {user?.name?.split(" ")[0] || "Admin"}
            </p>
            <IoChevronDown className={`hidden md:block transition ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-56 
                bg-white text-gray-700              
                dark:bg-gray-900 dark:text-gray-200 
                rounded-xl shadow-xl border border-gray-200 dark:border-gray-700"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <p className="font-semibold">{user?.name || "Admin User"}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.email || "admin@ayur.com"}
                </p>
              </div>

              <button
                onClick={() => navigate("/doctor/profile")}
                className="w-full px-4 py-2 text-left cursor-pointer
                  hover:bg-gray-100 dark:hover:bg-gray-700 
                  flex gap-2 items-center"
              >
                <FaUser /> Profile
              </button>

              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left  cursor-pointer
                  flex gap-2 items-center
                  text-red-600 hover:bg-red-50 
                  dark:text-red-400 dark:hover:bg-red-900/30"
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};

export default DoctorsTopbar;
