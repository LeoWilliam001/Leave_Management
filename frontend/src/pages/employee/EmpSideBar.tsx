import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/EmpDash.css";
import { useAuth } from "../../contexts/AuthContext"; // Import useAuth

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading, logout } = useAuth(); // Use useAuth hook
  const empId = user?.emp_id; // Get empId from user object
  const roleId = user?.role?.role_id; // Get roleId from user object

  const [isManager, setIsManager] = useState(false);
  const [isDir, setIsDirector] = useState(false);
  const [activeLink, setActiveLink] = useState<string>("");

  const handleLogout = () => {
    logout(); // Call the logout function from AuthContext
    localStorage.removeItem("activeLink"); // Keep this if you manage active link in local storage
    navigate("/");
  };

  useEffect(() => {
    const savedLink = localStorage.getItem("activeLink");
    if (savedLink) setActiveLink(savedLink);

    const checkIfManagerAndDirector = async () => {
      if (empId === undefined) return; // Ensure empId is available

      try {
        // Check if the current user manages anyone
        const managerResponse = await fetch(`http://localhost:3000/api/users/reports-to/${empId}`);
        const managerData = await managerResponse.json();
        setIsManager(managerData.length > 0);

        // Check if the current user is a director (or if anyone reports directly to them as director)
        // Assuming roleId 6 means Director based on previous context
        if (roleId === 6) {
          setIsDirector(true);
        } else {
          const dirResponse = await fetch(`http://localhost:3000/api/users/isDir/${empId}`);
          const dirData = await dirResponse.json();
          setIsDirector(dirData.length > 0);
        }
      } catch (error) {
        console.error("Failed to check manager/director status", error);
      }
    };

    if (empId !== undefined) {
      checkIfManagerAndDirector();
    }
  }, [empId, roleId]); // Dependencies: empId and roleId from useAuth

  const handleLinkClick = (link: string) => {
    setActiveLink(link);
    localStorage.setItem("activeLink", link);
  };

  if (isLoading) {
    return <aside className="dashboard-sidebar">Loading menu...</aside>;
  }

  // If user is not loaded or empId is missing, don't render the sidebar yet
  if (!user || empId === undefined) {
    return <aside className="dashboard-sidebar">Authentication required.</aside>;
  }

  return (
    <aside className="dashboard-sidebar">
      <h2 className="sidebar-title">Employee Menu</h2>
      <Link
        to="/dashboard"
        className={`sidebar-link ${activeLink === "dashboard" ? "active" : ""}`}
        onClick={() => handleLinkClick("dashboard")}
      >
        Dashboard
      </Link>

      {isManager && (
        <Link
          to="/leavereq"
          className={`sidebar-link ${activeLink === "leavereq" ? "active" : ""}`}
          onClick={() => handleLinkClick("leavereq")}
        >
          View Leave Requests
        </Link>
      )}

      {!isDir && (
        <Link
          to="/myleavestatus"
          className={`sidebar-link ${activeLink === "myleavestatus" ? "active" : ""}`}
          onClick={() => handleLinkClick("myleavestatus")}
        >
          My Leave Status
        </Link>
      )}

      <Link
        to="/calendar"
        className={`sidebar-link ${activeLink === "calendar" ? "active" : ""}`}
        onClick={() => handleLinkClick("calendar")}
      >
        Calendar
      </Link>

      <Link
        to="/"
        className="sidebar-link"
        style={{ color: "red" }}
        onClick={handleLogout}
      >
        Logout
      </Link>
    </aside>
  );
};

export default Sidebar;