import React from "react";
import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
    allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role") || "";

    // If no token or role is found, bounce them to login
    if (!token) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && allowedRoles.length > 0) {
        const userRoleClean = role.trim().toLowerCase();
        const allowedClean = allowedRoles.map(r => r.toLowerCase());

        // If the stored role doesn't match the strictly allowed roles, send to 404
        if (!allowedClean.includes(userRoleClean)) {
            return <Navigate to="/404" replace />;
        }
    }

    return <Outlet />;
};