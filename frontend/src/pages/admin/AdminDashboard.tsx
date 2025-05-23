import React, { useEffect, useState } from "react";
import "../../styles/AdminDash.css";
import Sidebar from "./AdminSideBar";
import ApplyLeave from "../employee/ApplyLeave";

interface Employee {
  emp_id: number;
  name: string;
  password: string;
  age: number;
  email_id: string;
  dept_id: number;
  role_id: number;
  manager_id: number | null;
  hr_id: number | null;
  dir_id: number | null;
  address: string;
  phno: string;
  manager: Employee | null;
  hr: Employee | null;
}

const HRDashboard: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [existingPassword, setExistingPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [applyLeave, setApplyLeave]=useState(false);
  const [role,setRole]=useState('');
  const [employee,setEmployee]=useState<Employee|null>(null);
  const [teamLeaveRequests, setTeamLeaveRequests]=useState([]);
  // const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");
  const emp_id=localStorage.getItem("emp_id");

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        if (!emp_id) return;
  
        // Fetch Role
        const roleRes = await fetch(`http://localhost:3000/api/users/role/${emp_id}`);
        const roleData = await roleRes.json();
        if (roleRes.ok) {
          setRole(roleData.role);
        } else {
          console.error('Failed to fetch role:', roleData.message);
        }

        const teamLeaveRes = await fetch(`http://localhost:3000/api/leave/myteamleave/${emp_id}`);
        const teamLeaveData = await teamLeaveRes.json();
        if (teamLeaveRes.ok) {
          setTeamLeaveRequests(teamLeaveData);
        } else {
          console.error("Failed to fetch team leave:", teamLeaveData.error);
        }

        const empl = await fetch(`http://localhost:3000/api/users/${emp_id}`);
        const employeeData = await empl.json();
        
        if (empl.ok) {
          setEmployee(employeeData);
        } else {
          console.error("Failed to fetch employee: ", employeeData.error);
        }
      }
      catch (err) {
        console.error("Error fetching data:", err);
      }
    };
  
    fetchAllData();
  }, [emp_id]);

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
      <Sidebar/>
      <main className="dashboard-main">
        <h1 className="dashboard-heading" style={{color:'#3498db'}}>HR Dashboard</h1>
        <button className="profile-button" onClick={() => setShowModal(true)} style={{backgroundColor:'#3498db'}}>Edit Password</button>
        <br/>
        {(employee)&&(employee.manager_id!=null || employee.hr_id!=null || employee.dir_id!=null) &&<button className="profile-button" onClick={() => setApplyLeave(true)} style={{backgroundColor:'#3498db'}}>Apply Leave</button>}
        <div className="employee-details">
          <p><strong>Name:</strong> {name}</p>
          <p><strong>Role:</strong> {role}</p>
        </div>


        <h2 style={{color:'#3498db'}}>Team Members in leave</h2>
        {teamLeaveRequests.length > 0 ? (
          <table className="team-leave-table">
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {teamLeaveRequests.map((req: any) => (
                <tr key={req.lr_id}>
                  <td>{req.employee?.name}</td>
                  <td>{new Date(req.start_date).toLocaleDateString()}</td>
                  <td>{new Date(req.end_date).toLocaleDateString()}</td>
                  <td>{req.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No team members on leave today.</p>
        )}


        {showModal && (
        <div className="modaloverlay">
          <div className="pass-modal">
            <h2 style={{ color: "#3498db" }}>Change Password</h2>

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
                style={{ backgroundColor: "#3498db" }}
                type="button"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div className="modal-buttons">
              <button onClick={handlePasswordChange} className="set-pass" style={{ backgroundColor: "#3498db" }}>Set Password</button>
              <button onClick={() => setShowModal(false)} className='cancel-pass'>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {applyLeave && (
          <div className="modal-overlay">
            <div className="modal-content">
              <ApplyLeave onClose={() => setApplyLeave(false)} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HRDashboard;


