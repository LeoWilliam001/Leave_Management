import React from "react";
import { Link } from "react-router-dom";

const EmployeeDashboard: React.FC = () => {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Employee Dashboard</h1>
      <p>Welcome! Here you can view your tasks, update your profile, and more.</p>
      <Link to='/applyleave' style={{ textDecoration: "none", color: "blue", fontSize: "18px" }}>Apply Leave</Link>
    </div>
  );
};

export default EmployeeDashboard;