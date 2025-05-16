import React, { type JSX } from "react";
import { Navigate } from "react-router-dom";

interface PrivateRouteProps {
  children: JSX.Element;
  allowedRoles?: number[]; // Array of allowed role IDs
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role") ? parseInt(localStorage.getItem("role")!, 10) : null;
  if (!token) {
    // If no token, redirect to login page
    return <Navigate to="/" />;
  }

  // Decode the JWT token to extract the role_id
  console.log(role);

  if (allowedRoles && (role === null || !allowedRoles.includes(role))) {
    return <Navigate to="/" />;
  }

  return children; 
};

export default PrivateRoute;