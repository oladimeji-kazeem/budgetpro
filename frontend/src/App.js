import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';

import Navbar from './components/Navbar.js';
import PrivateRoute from './components/PrivateRoute.js';

import Login from './pages/Login.js';
import Register from './pages/Register.js';
import AdminDashboard from './pages/AdminDashboard.js';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main className="container mx-auto p-4">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Redirect root to login or a public landing page */}
            <Route path="/" element={<Navigate to="/login" />} />

            {/* Private Routes */}
            <Route element={<PrivateRoute allowedRoles={['AA', 'SA']} />}>
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;