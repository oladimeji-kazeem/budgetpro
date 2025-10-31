import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';

// Import Layout Components
import Sidebar from './components/Sidebar.js'; // Assuming this component is defined elsewhere
import PrivateRoute from './components/PrivateRoute.js';

// Import Page Components
import Login from './pages/Login.js';
import Register from './pages/Register.js';
import AdminDashboard from './pages/AdminDashboard.js';
import Dashboard from './pages/Dashboard.js'; // Main dashboard view

// --- Placeholder components for modules (to be replaced with actual content) ---
const HistoricalPosition = () => <div className="p-6 bg-white shadow-md rounded-lg h-96">
  <h2 className="text-xl font-bold text-gray-800">Historical Position</h2>
  <p className="mt-2 text-gray-600">This page will display historical GL data and positions.</p>
</div>;
const BudgetInput = () => <div className="p-6 bg-white shadow-md rounded-lg h-96">
  <h2 className="text-xl font-bold text-gray-800">Budget Input</h2>
  <p className="mt-2 text-gray-600">Department Officers will enter their budget proposals here.</p>
</div>;
const AumManagement = () => <div className="p-6 bg-white shadow-md rounded-lg h-96">
  <h2 className="text-xl font-bold text-gray-800">AUM Management</h2>
  <p className="mt-2 text-gray-600">Admin-level view for Asset Under Management oversight.</p>
</div>;
const Forecast = () => <div className="p-6 bg-white shadow-md rounded-lg h-96">
  <h2 className="text-xl font-bold text-gray-800">Forecast Generation</h2>
  <p className="mt-2 text-gray-600">Financial forecasting tools will reside here.</p>
</div>;
const Analysis = () => <div className="p-6 bg-white shadow-md rounded-lg h-96">
  <h2 className="text-xl font-bold text-gray-800">Performance Analysis</h2>
  <p className="mt-2 text-gray-600">Reporting and detailed performance analysis.</p>
</div>;
const Settings = () => <div className="p-6 bg-white shadow-md rounded-lg h-96">
  <h2 className="text-xl font-bold text-gray-800">Settings</h2>
  <p className="mt-2 text-gray-600">User profile and application settings.</p>
</div>;

// --- Dashboard Layout Component ---
// This component provides the fixed Sidebar and the scrolling main content area.
const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar is fixed on the left */}
      <Sidebar /> 
      
      {/* Main content area takes up the remaining width and allows scrolling */}
      <div className="flex-1 overflow-y-auto p-8">
        {/* Outlet renders the specific nested route component (e.g., Dashboard, BudgetInput) */}
        <Outlet />
      </div>
    </div>
  );
};


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 1. Public Routes: Login and Registration */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Default Route: Redirects unauthenticated users to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 2. Protected Routes (Requiring Authentication) */}
          <Route element={<PrivateRoute allowedRoles={['DO', 'HOD', 'AA', 'SA']} />}>
            {/* All authenticated users use the DashboardLayout */}
            <Route element={<DashboardLayout />}>
              
              {/* Core Dashboards */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />

              {/* Functional Modules - Accessed via Sidebar */}
              <Route path="/historical-position" element={<HistoricalPosition />} />
              <Route path="/budget-input" element={<BudgetInput />} />
              <Route path="/forecast" element={<Forecast />} />
              <Route path="/analysis" element={<Analysis />} />
              
              {/* Specific Admin/Super Admin Modules */}
              <Route path="/aum-management" element={<AumManagement />} />
              
              {/* Utility Pages */}
              <Route path="/settings" element={<Settings />} />

            </Route>
          </Route>
          

          {/* 3. Catch-all for 404 Pages */}
          <Route path="*" element={<div className="min-h-screen flex items-center justify-center bg-gray-100"><h1 className="text-2xl text-red-500">404 | Page Not Found</h1></div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
