import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔥 RESTORE USER ON PAGE REFRESH
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get("/profile/me");
        setUser(res.data.user);
      } catch (error) {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // ---------------- LOGIN ----------------
  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
    toast.success("Login successful");
    return res.data;
  };

  // ---------------- REGISTER ----------------
const register = async (name, email, password, role = "student") => {
  try {
    const res = await api.post("/auth/register", {
      name,
      email,
      password,
      role,
    });

    // Save JWT token to localStorage
    localStorage.setItem("token", res.data.token);

    // Update user state
    setUser(res.data.user);

    toast.success("Registration successful!");
    return res.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Registration failed");
    throw error;
  }
};

// ---------------- LOGOUT ----------------
const logout = () => {
  localStorage.removeItem("token");
  setUser(null);
  toast.info("Logged out");
  navigate("/login");
};

// ---------------- RESET PASSWORD ----------------
const resetPassword = async (token, newPassword) => {
  try {
    const res = await api.patch(`/auth/reset-password/${token}`, {
      password: newPassword,
    });

    toast.success("Password reset successfully!");
    return res.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Password reset failed");
    throw error;
  }
};


  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, resetPassword }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
