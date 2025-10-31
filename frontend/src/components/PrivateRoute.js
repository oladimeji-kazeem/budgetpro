import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ allowedRoles }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return allowedRoles && !allowedRoles.includes(user.role)
        ? <Navigate to="/" replace /> // Redirect if role not allowed
        : <Outlet />; // Render child route component
};

export default PrivateRoute;