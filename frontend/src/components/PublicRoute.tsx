import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export const PublicRoute: React.FC = () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // If the user is ALREADY logged in, redirect them away from the login page to their dashboard
    if (token && role) {
        const cleanRole = role.trim().toLowerCase();

        if (cleanRole.includes("admin")) {
            return <Navigate to="/admin" replace />;
        } else if (cleanRole.includes("inventory")) {
            return <Navigate to="/inventory" replace />;
        } else if (cleanRole.includes("employee")) {
            return <Navigate to="/employee" replace />;
        }
    }

    // Otherwise, allow them to view the public login page
    return <Outlet />;
};