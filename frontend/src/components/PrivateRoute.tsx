import React, { type JSX } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // Import useAuth

interface PrivateRouteProps {
  children: JSX.Element;
  allowedRoles?: number[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth(); // Get auth state from context

  // If still loading (e.g., checking localStorage), show nothing or a loading indicator
  if (isLoading) {
    return <div>Loading...</div>; // You can replace this with a proper spinner component
  }

  // If not authenticated, redirect to the login page
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If roles are specified, check if the user's role is allowed
  if (allowedRoles && user) { // Ensure user object exists before checking role
    // user.role is an object, so access role_id
    if (user.role && !allowedRoles.includes(user.role.role_id)) {
      console.warn(`Access denied for role ${user.role.role_id}. Required roles: ${allowedRoles.join(',')}`);
      return <Navigate to="/" replace />; // Redirect if role not allowed
    }
  } else if (allowedRoles && !user) {
    // This case ideally shouldn't happen if isAuthenticated is true, but good for safety
    console.error("User is authenticated but user object is missing for role check.");
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;