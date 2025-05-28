import React, { type JSX } from "react";
import { Navigate } from "react-router-dom";

interface PrivateRouteProps {
  children: JSX.Element;
  allowedRoles?: number[]; 
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role") ? parseInt(localStorage.getItem("role")!, 10) : null;
  if (!token) {
    return <Navigate to="/" />;
  }

  console.log(role);

  if (allowedRoles && (role === null || !allowedRoles.includes(role))) {
    return <Navigate to="/" />;
  }

  return children; 
};

export default PrivateRoute;