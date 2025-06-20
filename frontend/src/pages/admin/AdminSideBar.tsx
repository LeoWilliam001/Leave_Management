import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/EmpDash.css";
import { useAuth } from "../../contexts/AuthContext"; // Assuming AuthContext is in the parent directory

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth(); // Use the logout function from AuthContext
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleLogout = () => {
    logout(); // Call the logout function from AuthContext
    navigate("/");
  };

  const links = [
    { to: "/admin_dash", label: "Dashboard" },
    { to: "/hr/viewemployees", label: "Employees" },
    { to: "/hr/createemployees", label: "Create Employee" },
    { to: "/calendar", label: "Calendar"},
    { to: "/hr/leaverequests", label: "View Leave Requests" },
    { to: "/", label: "Logout", isLogout: true },
  ];

  return (
    <aside className="dashboard-sidebar" style={{ backgroundColor: "#3498db" }}>
      <h2 className="sidebar-title">HR</h2>
      {links.map((link, index) => (
        <Link
          key={index}
          to={link.to}
          className="sidebar-link"
          onClick={link.isLogout ? handleLogout : undefined}
          style={{
            color: link.isLogout ? "red" : "#fff",
            textDecoration: "none",
            display: "block",
            padding: "10px 15px",
            backgroundColor: hoveredIndex === index ? "#2980b9" : "transparent",
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {link.label}
        </Link>
      ))}
    </aside>
  );
};

export default Sidebar;