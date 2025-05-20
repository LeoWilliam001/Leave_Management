import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/EmpDash.css";

const Sidebar: React.FC = () => {
  const navigate=useNavigate();
  const handleLogout=()=>{
    localStorage.removeItem("emp_id");
    localStorage.removeItem("token");

    navigate("/");
  }
  return (
    <aside className="dashboard-sidebar">
      <h2 className="sidebar-title">HR </h2>
      <Link to="/admin_dash" className="sidebar-link">Dashboard</Link>
      <Link to="/hr/viewemployees" className="sidebar-link">Employees</Link>
      <Link to="/hr/createemployees" className="sidebar-link">Create Employee</Link>
      {/* <Link to="/applyleave" className="sidebar-link">Apply Leave</Link> */}
      <Link to="/hr/leaverequests" className="sidebar-link">View Leave Requests</Link>
      {/* <Link to="/myleavestatus" className="sidebar-link">My Leave Status</Link> */}
      <Link to="/myleavestatus" className="sidebar-link" style={{color:'red'}} onClick={handleLogout}>Logout</Link>
  
    </aside>

  );
};

export default Sidebar;