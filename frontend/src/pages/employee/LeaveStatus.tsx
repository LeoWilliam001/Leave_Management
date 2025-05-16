import React, { useEffect, useState } from "react";
import Sidebar from "./EmpSideBar"; // Import the shared Sidebar component
import "../../styles/LeaveStatus.css"; // Import the updated CSS

interface LeaveRequest {
  lr_id: number;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  manager_approval: string;
  hr_approval: string;
  dir_approval: string;
}

const LeaveStatus: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const emp_id = localStorage.getItem("emp_id");

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/leave/emp/${emp_id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch leave requests");
        }

        setLeaveRequests(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchLeaveRequests();
  }, [emp_id]);

  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
  };

  const filteredRequests =
    filterStatus === "All"
      ? leaveRequests
      : leaveRequests.filter((req) => req.status === filterStatus);

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <main className="dashboard-main">
        <h2>Leave Status</h2>
        {error && <p className="error-message">{error}</p>}

        <div className="status-button">
          <button onClick={() => handleFilterChange("All")}>All</button>
          <button onClick={() => handleFilterChange("Pending")}>Pending</button>
          <button onClick={() => handleFilterChange("Approved")}>Approved</button>
          <button onClick={() => handleFilterChange("Rejected")}>Rejected</button>
        </div>

        <div className="leave-status-container">
          {filteredRequests.map((request) => (
            <div key={request.lr_id} className="leave-card">
              <div>
                <h3>Leave Request #{request.lr_id}</h3>
                <h3 className="leave-status">{request.status}</h3>
              </div>
              <p>
                <strong>Leave Type:</strong> {request.leave_type}
              </p>
              <p>
                <strong>Start Date:</strong> {request.start_date}
              </p>
              <p>
                <strong>End Date:</strong> {request.end_date}
              </p>
              <p>
                <strong>Reason:</strong> {request.reason}
              </p>
              <p>
                <strong>Manager Approval:</strong> {request.manager_approval}
              </p>
              <p>
                <strong>HR Approval:</strong> {request.hr_approval}
              </p>
              <p>
                <strong>Director Approval:</strong> {request.dir_approval}
              </p>
              <p>
                <strong>Status:</strong> {request.status}
              </p>
              <button className="cancel-button">Cancel</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default LeaveStatus;
