import React, { useEffect, useState } from "react";
import "../../styles/EmpDash.css";
import Sidebar from "./EmpSideBar";
import ApplyLeave from "./ApplyLeave";
import LeaveBalanceChart from "./LeaveBalance";

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


const EmployeeDashboard: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [applyLeave, setApplyLeave] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [existingPassword, setExistingPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [teamLeaveRequests, setTeamLeaveRequests] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [age, setAge] = useState();
  const [role, setRole] = useState("");
  const [employee, setEmployee] = useState<Employee|null>(null);

  const name = localStorage.getItem("name");
  const emp_id = localStorage.getItem("emp_id");

  const TeamLeaveCard: React.FC<{ name: string }> = ({ name }) => {
    const firstLetter = name ? name.charAt(0).toUpperCase() : '?';
    
    return (
      <div className="team-leave-card">
        <div className="employee-initial-circle">{firstLetter}</div>
        <div className="employee-name">{name}</div>
      </div>
    );
  };

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
          console.error("Failed to fetch role:", roleData.message);
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

        const empl = await fetch(`http://localhost:3000/api/users/${emp_id}`);
        const employeeData = await empl.json();
        
        if (empl.ok) {
          setAge(employeeData.age);
          setEmployee(employeeData);
        } else {
          console.error("Failed to fetch employee: ", employeeData.error);
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
        <button className="profile-button" onClick={() => setShowModal(true)}>
          Edit Password
        </button>
        <br />
        {(employee)&&(employee.manager_id!=null || employee.hr_id!=null || employee.dir_id!=null) &&<button className="profile-button" onClick={() => setApplyLeave(true)}>
          Apply Leave
        </button>}
        <div className="employee-details">
          <p><strong>Name:</strong> {name}</p>
          <p><strong>Role:</strong> {role}</p>
          <p><strong>Age:</strong> {age}</p>
        </div>

        {(employee)&&(employee.manager_id!=null || employee.hr_id!=null || employee.dir_id!=null) &&(
          <div className="leave-section-container">
            <div className="leave-balances-section">
              <h2>Your Leave Balances</h2>
              <div className="leave-balance-cards" style={{ display: "flex", flexWrap: "wrap", gap: "2rem" }}>
                {leaveBalances.map((bal: any) => (
                  <LeaveBalanceChart
                    key={bal.lb_id}
                    type={bal.leaveType?.type_of_leave}
                    total={bal.total_days}
                    balance={bal.bal_days}
                  />
                ))}
              </div>
            </div>

            <div className="team-leave-section">
              <h2>On Leave Today</h2>
              <div className="team-leave-container">
                {teamLeaveRequests.length > 0 ? (
                  <div className="team-leave-cards">
                    {teamLeaveRequests.map((req: any) => (
                      <TeamLeaveCard key={req.lr_id} name={req.employee?.name} />
                    ))}
                  </div>
                ) : (
                  <p>No team members on leave today.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {showModal && (
          <div className="modaloverlay">
            <div className="pass-modal">
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
                <button onClick={() => setShowModal(false)} className="cancel-pass">Cancel</button>
              </div>
            </div>
          </div>
        )}

        { applyLeave && (
          <div className="modal-overlay">
            <div className="modal-content">
              <ApplyLeave onClose={() => setApplyLeave(false)} />
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default EmployeeDashboard;
