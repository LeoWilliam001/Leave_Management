import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/EmpDash.css";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const empId = localStorage.getItem("emp_id");
  const [isManager, setIsManager] = useState(false);
  const [isDir, setIsDirector] = useState(false);
  const [activeLink, setActiveLink] = useState<string>("");

  const handleLogout = () => {
    localStorage.removeItem("emp_id");
    localStorage.removeItem("token");
    localStorage.removeItem("activeLink");
    navigate("/");
  };

  useEffect(() => {
    const savedLink = localStorage.getItem("activeLink");
    if (savedLink) setActiveLink(savedLink);

    const checkIfManager = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/users/reports-to/${empId}`);
        const dirres=await fetch(`http://localhost:3000/api/users/isDir/${empId}`);
        const data = await response.json();
        const dirdata=await dirres.json();
        if (data.length > 0) {
          setIsManager(true);
        }
        if(dirdata.length>0)
        {
          setIsDirector(true);
        }
      } catch (error) {
        console.error("Failed to check manager status", error);
      }
    };

    if (empId) {
      checkIfManager();
    }
  }, [empId]);

  const handleLinkClick = (link: string) => {
    setActiveLink(link);
    localStorage.setItem("activeLink", link);
  };

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

      {!isDir&&<Link
        to="/myleavestatus"
        className={`sidebar-link ${activeLink === "myleavestatus" ? "active" : ""}`}
        onClick={() => handleLinkClick("myleavestatus")}
      >
        My Leave Status
      </Link>}

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
