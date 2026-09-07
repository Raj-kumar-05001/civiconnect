import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import CitizenDashboard from "./pages/citizen/Dashboard";
import ReportIssue from "./pages/citizen/ReportIssue";
import MyComplaints from "./pages/citizen/MyComplaints";
import CitizenComplaintDetails from "./pages/citizen/ComplaintDetails";

import AdminDashboard from "./pages/admin/Dashboard";
import AdminComplaints from "./pages/admin/Complaints";
import AdminComplaintDetails from "./pages/admin/ComplaintDetails";
import AdminCategories from "./pages/admin/Categories";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/citizen/dashboard" element={<ProtectedRoute role="citizen"><CitizenDashboard /></ProtectedRoute>} />
      <Route path="/citizen/report" element={<ProtectedRoute role="citizen"><ReportIssue /></ProtectedRoute>} />
      <Route path="/citizen/complaints" element={<ProtectedRoute role="citizen"><MyComplaints /></ProtectedRoute>} />
      <Route path="/citizen/complaints/:id" element={<ProtectedRoute role="citizen"><CitizenComplaintDetails /></ProtectedRoute>} />

      <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/complaints" element={<ProtectedRoute role="admin"><AdminComplaints /></ProtectedRoute>} />
      <Route path="/admin/complaints/:id" element={<ProtectedRoute role="admin"><AdminComplaintDetails /></ProtectedRoute>} />
      <Route path="/admin/categories" element={<ProtectedRoute role="admin"><AdminCategories /></ProtectedRoute>} />

      <Route path="*" element={<Home />} />
    </Routes>
  );
}
