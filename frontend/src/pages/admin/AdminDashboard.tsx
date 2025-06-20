import React, { useEffect, useState } from "react";
import "../../styles/AdminDash.css";
import Sidebar from "./AdminSideBar";
import ApplyLeave from "../employee/ApplyLeave";
import LeaveBalanceChart from "../employee/LeaveBalance";
import { useAuth } from "../../contexts/AuthContext";

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

// Reusable TeamLeaveCard component (copied from EmpDashboard.tsx)
const TeamLeaveCard: React.FC<{ name: string }> = ({ name }) => {
  const firstLetter = name ? name.charAt(0).toUpperCase() : "?";

  return (
    <div className="team-leave-card">
      <div className="employee-initial-circle">{firstLetter}</div>
      <div className="employee-name">{name}</div>
    </div>
  );
};

const HRDashboard: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [existingPassword, setExistingPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [applyLeave, setApplyLeave] = useState(false);
  const [role, setRole] = useState('');
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [teamLeaveRequests, setTeamLeaveRequests] = useState<any[]>([]); // Use 'any' for now, or define a more specific interface for leave requests
  const [leaveBalances, setLeaveBalances] = useState<any[]>([]); // State for leave balances

  // Use the useAuth hook to get the authenticated user's data
  const { user } = useAuth();
  const name = user?.name;
  const emp_id = user?.emp_id;

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        if (!emp_id) return;
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

        // Fetch team leave requests for today
        const teamLeaveRes = await fetch(`http://localhost:3000/api/leave/myteamleave/${emp_id}`);
        const teamLeaveData = await teamLeaveRes.json();
        if (teamLeaveRes.ok) {
          // Filter for leaves that are active today
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Normalize today's date to start of day

          const onLeaveToday = teamLeaveData.filter((req: any) => {
            const startDate = new Date(req.start_date);
            const endDate = new Date(req.end_date);
            startDate.setHours(0, 0, 0, 0); // Normalize start date
            endDate.setHours(0, 0, 0, 0); // Normalize end date

            return today >= startDate && today <= endDate && req.status === 'Approved';
          });
          setTeamLeaveRequests(onLeaveToday);
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
        console.log("Password updated successfully");
        setShowModal(false);
        setNewPassword("");
        setExistingPassword("");
      } else {
        console.error("Error: " + data.error);
      }
    } catch (error) {
      console.error("Request failed:", error);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <main className="dashboard-main">
        {/* New header structure for buttons */}
        <div className="dashboard-header-controls">
          <h1 className="dashboard-heading" style={{ color: '#3498db', fontFamily: 'Times New Roman' }}>Welcome {name}</h1>
          <div className="dashboard-buttons-group">
            <button className="profile-button" onClick={() => setShowModal(true)} style={{ backgroundColor: '#3498db' }}>Edit Password</button>
            {(employee) && (employee.manager_id != null || employee.hr_id != null || employee.dir_id != null) &&
              <button className="profile-button" onClick={() => setApplyLeave(true)} style={{ backgroundColor: '#3498db' }}>Apply Leave</button>
            }
          </div>
        </div>

        <div className="employee-details">
          <p><strong>Name:</strong> {name}</p>
          <p><strong>Role:</strong> {role}</p>
        </div>

        <div className="leave-section-container"> {/* Container for potential multiple sections like leave balances */}
          {/* Your Leave Balances Section (similar to EmpDashboard) */}
          <div className="leave-balances-section">
            <h2>Your Leave Balances</h2>
            <div className="leave-balance-cards">
              {leaveBalances.length > 0 ? (
                leaveBalances.map((bal: any) => (
                  <LeaveBalanceChart
                    key={bal.lb_id}
                    type={bal.leaveType?.type_of_leave}
                    total={bal.total_days}
                    balance={bal.bal_days}
                  />
                ))
              ) : (
                <p>No leave balances found.</p>
              )}
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


        {showModal && (
          <div className="modal-overlay"> {/* Changed to modal-overlay for consistency */}
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