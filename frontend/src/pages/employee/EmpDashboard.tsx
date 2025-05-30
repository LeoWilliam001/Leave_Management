import React, { useEffect, useState } from "react";
import "../../styles/EmpDash.css"; // Ensure this path is correct
import Sidebar from "./EmpSideBar";
import ApplyLeave from "./ApplyLeave";
import LeaveBalanceChart from "./LeaveBalance";

// Define interfaces for better type safety
interface Department {
  dept_id: number;
  dept_name: string;
}

interface Role {
  role_id: number;
  role_name: string;
}

interface Employee {
  emp_id: number;
  name: string;
  age: number;
  email_id: string;
  dept_id: number;
  role_id: number;
  manager_id: number | null;
  hr_id: number | null;
  dir_id: number | null;
  address: string;
  phno: string;
  manager?: Employee | null; // Optional as it might not be populated or self-referential
  hr?: Employee | null; // Optional
  department: Department;
  role: Role;
}

const EmployeeDashboard: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [applyLeave, setApplyLeave] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [existingPassword, setExistingPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [teamLeaveRequests, setTeamLeaveRequests] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [teamMembers, setTeamMembers] = useState<Employee[]>([]); // New state for team members
  const [selectedEmployeeDetail, setSelectedEmployeeDetail] =
    useState<Employee | null>(null); 

  const emp_id = localStorage.getItem("emp_id");

  // Re-using the TeamLeaveCard component for consistency or creating a new one
  const TeamLeaveCard: React.FC<{ name: string }> = ({ name }) => {
    const firstLetter = name ? name.charAt(0).toUpperCase() : "?";

    return (
      <div className="team-leave-card">
        <div className="employee-initial-circle">{firstLetter}</div>
        <div className="employee-name">{name}</div>
      </div>
    );
  };

  // New component for Team Member Card with View button
  const TeamMemberCard: React.FC<{ employee: Employee }> = ({ employee }) => {
    const firstLetter = employee.name ? employee.name.charAt(0).toUpperCase() : '?';
    return (
      <div className="team-member-card">
        <div className="employee-initial-circle" style={{ backgroundColor: '#258acd' }}>{firstLetter}</div>
        <div className="employee-info">
          <div className="employee-name">{employee.name}</div>
          <div className="employee-role">{employee.role.role_name}</div>
        </div>
        <button
          className="view-employee-button"
          style={{ backgroundColor: '#3498db', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}
          onClick={() => setSelectedEmployeeDetail(employee)}
        >
          View
        </button>
      </div>
    );
  };

  // New component for Employee Detail Modal
  const EmployeeDetailModal: React.FC<{ employee: Employee; onClose: () => void }> = ({
    employee,
    onClose,
  }) => {
    return (
      <div className="modal-overlay">
        <div className="employee-detail-modal-content">
          <h2>Employee Details</h2>
          <p><strong>Name:</strong> {employee.name}</p>
          <p><strong>Employee ID:</strong> {employee.emp_id}</p>
          <p><strong>Email:</strong> {employee.email_id}</p>
          <p><strong>Age:</strong> {employee.age}</p>
          <p><strong>Phone:</strong> {employee.phno}</p>
          <p><strong>Address:</strong> {employee.address}</p>
          <p><strong>Department:</strong> {employee.department.dept_name}</p>
          <p><strong>Role:</strong> {employee.role.role_name}</p>
          {employee.manager && <p><strong>Manager:</strong> {employee.manager.name}</p>}
          {employee.hr && <p><strong>HR:</strong> {employee.hr.name}</p>}
          <button onClick={onClose} style={{ backgroundColor: '#258acd', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', marginTop: '20px' }}>
            Close
          </button>
        </div>
      </div>
    );
  };


  useEffect(() => {
    const fetchAllData = async () => {
      try {
        if (!emp_id) {
          console.warn("emp_id not found in localStorage. Cannot fetch data.");
          return;
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

        // Fetch Current Employee Data
        const emplRes = await fetch(`http://localhost:3000/api/users/${emp_id}`);
        const employeeData = await emplRes.json();

        if (emplRes.ok) {
          setEmployee(employeeData);
        } else {
          console.error("Failed to fetch employee: ", employeeData.error);
          setEmployee(null); // Ensure employee is null if fetch fails
        }

        // Fetch Team Members (New API call)
        const teamRes = await fetch(`http://localhost:3000/api/users/team/${emp_id}`);
        const teamData = await teamRes.json();
        if (teamRes.ok) {
          // Filter out the current employee from the team members list
          const filteredTeam = teamData.filter((member: Employee) => member.emp_id !== parseInt(emp_id));
          setTeamMembers(filteredTeam);
        } else {
          console.error("Failed to fetch team members:", teamData.error);
          setTeamMembers([]);
        }

      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchAllData();
  }, [emp_id]); // Dependency array: re-run if emp_id changes

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
        <h1 className="dashboard-heading" style={{ fontFamily: 'Times New Roman' }}>Welcome {employee?.name}</h1>
        <button className="profile-button" onClick={() => setShowModal(true)}>
          Edit Password
        </button>
        <br />
        {/* Only show Apply Leave button if the employee has a manager/HR/director */}
        {(employee) && (employee.manager_id !== null || employee.hr_id !== null || employee.dir_id !== null) && (
          <button className="profile-button" onClick={() => setApplyLeave(true)}>
            Apply Leave
          </button>
        )}
        <div className="employee-details">
          <p><strong>Name:</strong> {employee?.name}</p>
          {employee?.manager_id && employee?.manager && <p><strong>Manager:</strong> {employee?.manager?.name}</p>}
          {employee?.hr_id && employee?.hr && <p><strong>HR:</strong> {employee?.hr?.name}</p>}
          <p><strong>Role:</strong> {employee?.role.role_name}</p>
        </div>

        {/* This entire section (Leave Balances & Team Leave) is conditionally rendered */}
        {(employee) && (employee.manager_id !== null || employee.hr_id !== null || employee.dir_id !== null) && (
          <div className="leave-section-container">
            <div className="leave-balances-section">
              <h2>Your Leave Balances</h2>
              <div className="leave-balance-cards" style={{ display: "flex", flexWrap: "wrap", gap: "2rem" }}>
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
        )}

        {/* New section for Team Members */}
        {teamMembers.length > 0 && ( 
          <div className="team-members-section">
            <h2 style={{marginTop: '30px'}}>Team Members</h2>
            <div className="team-members-container" style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
              {teamMembers.map((member: Employee) => (
                <TeamMemberCard key={member.emp_id} employee={member} />
              ))}
            </div>
          </div>
        )}


        {/* Password Change Modal */}
        {showModal && (
          <div className="modal-overlay"> {/* Renamed from modaloverlay to be consistent */}
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

        {/* Apply Leave Modal */}
        {applyLeave && (
          <div className="modal-overlay">
            <div className="modal-content">
              <ApplyLeave onClose={() => setApplyLeave(false)} />
            </div>
          </div>
        )}

        {/* Employee Detail Modal */}
        {selectedEmployeeDetail && (
          <EmployeeDetailModal
            employee={selectedEmployeeDetail}
            onClose={() => setSelectedEmployeeDetail(null)}
          />
        )}
      </main>
    </>
  );
};

export default EmployeeDashboard;