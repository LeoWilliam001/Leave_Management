import React from "react";
import { Link } from "react-router-dom";

const AdminDashboard: React.FC = () => {

  const hr=localStorage.getItem("emp");
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Admin Dashboard</h1>
      <h1>{hr}</h1>
      <p>Welcome, Admin! Here you can manage employees, view reports, and more.</p>
      <Link to="/hr/leaverequests" style={{ textDecoration: "none", color: "blue", fontSize: "18px" }}>
        View Leave Requests
      </Link>
    </div>
  );
};

export default AdminDashboard;