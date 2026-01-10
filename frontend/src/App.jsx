import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";

// Pages
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ResetPassword from "./components/auth/ResetPass";

// Layout + Role Routes
import RoleLayout from "./components/Layout";
import AdminRoutes from "./routes/AdminRoutes";
import DoctorRoutes from "./routes/DoctorRoutes";
import PatientRoutes from "./routes/PatientRoutes";
import TherapyRoutes from "./routes/TherapyRoutes";

function App() {
  return (
    <Routes>

      {/* ⬇️ FIRST PAGE ALWAYS LOGIN */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public Pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ===== ROLE BASED ROUTES ===== */}

      <Route
        path="/admin/*"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <RoleLayout />
          </PrivateRoute>
        }
      >
        <Route path="*" element={<AdminRoutes />} />
      </Route>

      <Route
        path="/doctor/*"
        element={
          <PrivateRoute allowedRoles={["doctor"]}>
            <RoleLayout />
          </PrivateRoute>
        }
      >
        <Route path="*" element={<DoctorRoutes />} />
      </Route>

      <Route
        path="/patient/*"
        element={
          <PrivateRoute allowedRoles={["patient"]}>
            <RoleLayout />
          </PrivateRoute>
        }
      >
        <Route path="*" element={<PatientRoutes />} />
      </Route>

      <Route
        path="/therapy/*"
        element={
          <PrivateRoute allowedRoles={["therapy"]}>
            <RoleLayout />
          </PrivateRoute>
        }
      >
        <Route path="*" element={<TherapyRoutes />} />
      </Route>

      {/* Default Redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
