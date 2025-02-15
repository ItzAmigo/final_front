// src/components/AdminRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const AdminRoute = ({ children }) => {
    const { user } = useAuthStore();
    const isAdmin = user?.email === 'admin@example.com';

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRoute;