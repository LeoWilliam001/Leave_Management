import React from "react";
import { Link } from "react-router-dom";

const EmployeeDashboard: React.FC = () => {
  const role = localStorage.getItem("role"); // Assuming role is stored in localStorage
  const name=localStorage.getItem("name");
  const emp=localStorage.getItem("emp");
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Employee Dashboard</h1>
      <h1>Name : {name}</h1>
      <h1>Role : {role}</h1>
      <h1>Emp info : {emp}</h1>
      <p>Welcome! Here you can view your tasks, update your profile, and more.</p>
      <Link to="/applyleave" style={{ textDecoration: "none", color: "blue", fontSize: "18px" }}>
        Apply Leave
      </Link>
        <div style={{ marginTop: "20px" }}>
          <Link to="/leavereq" style={{ textDecoration: "none", color: "blue", fontSize: "18px" }}>
            View Leave Requests
          </Link>
        </div>
    </div>
  );
};

export default EmployeeDashboard;