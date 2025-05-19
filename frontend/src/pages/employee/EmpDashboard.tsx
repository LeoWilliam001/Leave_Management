import React, { useState } from "react";
import "../../styles/EmpDash.css";
import Sidebar from "./EmpSideBar";

const EmployeeDashboard: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const[showPassword, setShowPassword]=useState(false);
  const [existingPassword, setExistingPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");
  const emp = localStorage.getItem("emp");
  const emp_id = localStorage.getItem("emp_id");

  const handlePasswordChange = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/users/editPass/${emp_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ existingPassword, newPassword }),
      });
  
      const data = await response.json();
      if (response.ok) {
        alert("Password updated successfully");
        setShowModal(false);
        setNewPassword("");
        setExistingPassword("");
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      alert("Request failed.");
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <h1>hello its me</h1>
      <main className="dashboard-main">
        <h1 className="dashboard-heading">Employee Dashboard</h1>
        <button className="profile-button" onClick={() => setShowModal(true)}>Edit Password</button>
        <div className="employee-details">
          <p><strong>Name:</strong> {name}</p>
          <p><strong>Role:</strong> {role}</p>
          <p><strong>Employee ID:</strong> {emp}</p>
        </div>

        {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Change Password</h2>

            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter existing password"
                value={existingPassword}
                onChange={(e) => setExistingPassword(e.target.value)}
              />
            </div>

            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              
              <button
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                type="button"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div className="modal-buttons">
              <button onClick={handlePasswordChange} className="set-pass">Set Password</button>
              <button onClick={() => setShowModal(false)} className='cancel-pass'>Cancel</button>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
};

export default EmployeeDashboard;
