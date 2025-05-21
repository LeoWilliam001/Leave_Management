import React, { useEffect, useState } from "react";
import "../../styles/EmpDash.css";
import Sidebar from "./EmpSideBar";

const EmployeeDashboard: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const[showPassword, setShowPassword]=useState(false);
  const [existingPassword, setExistingPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [teamLeaveRequests, setTeamLeaveRequests] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [age,setAge]=useState();
  const [role, setRole] = useState('');

  const name = localStorage.getItem("name");
  const emp_id = localStorage.getItem("emp_id");

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
  
        // Fetch Leave Balance
        const balanceRes = await fetch(`http://localhost:3000/api/bal/getbal/${emp_id}`);
        const balanceData = await balanceRes.json();
        if (balanceRes.ok) {
          setLeaveBalances(balanceData.balances);
        } else {
          console.error("Failed to fetch leave balances:", balanceData.error);
        }
  
        // Fetch Team Leave Requests
        const teamLeaveRes = await fetch(`http://localhost:3000/api/leave/myteamleave/${emp_id}`);
        const teamLeaveData = await teamLeaveRes.json();
        if (teamLeaveRes.ok) {
          setTeamLeaveRequests(teamLeaveData);
        } else {
          console.error("Failed to fetch team leave:", teamLeaveData.error);
        }

        const empl=await fetch(`http://localhost:3000/api/users/${emp_id}`);
        const employee=await empl.json();
        console.log("Here is the employee ",employee);
        if(empl.ok)
        {
          setAge(employee.age);
        }
        else{
          console.error("Failed to fetch employee: ",employee.error);
        }
      } catch (err) {
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
    <>
      <Sidebar />
      <main className="dashboard-main">
        <h1 className="dashboard-heading">Employee Dashboard</h1>
        <button className="profile-button" onClick={() => setShowModal(true)}>Edit Password</button>
        <div className="employee-details">
          <p><strong>Name:</strong> {name}</p>
          <p><strong>Role:</strong> {role}</p>
          <p><strong>Age:</strong> {age}</p>
        </div>
        
        <h2>Your Leave Balances</h2>
        <div className="leave-balance-cards">
          {leaveBalances.map((bal: any) => (
            <div key={bal.lb_id} className="leave-card">
              <h3>{bal.leaveType?.type_of_leave}</h3>
              <p><strong>Total Days:</strong> {bal.total_days}</p>
              <p><strong>Balance Days:</strong> {bal.bal_days}</p>
            </div>
          ))}
        </div>


        <h2>Team Members in leave</h2>
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
    </table>) : (<p>No team members on leave today.</p>)}

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
    </>
  );
};

export default EmployeeDashboard;
