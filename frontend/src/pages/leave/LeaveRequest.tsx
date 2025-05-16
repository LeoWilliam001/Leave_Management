import React, { useEffect, useState } from "react";
import "../../styles/LeaveRequest.css"; // Import CSS for styling
import Sidebar from "../employee/EmpSideBar";

interface LeaveRequest {
  lr_id: number;
  emp_id: number;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  manager_approval: string;
  employee: {
    name: string;
  };
}

const LeaveRequest: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [error, setError] = useState("");
  const manager_id = localStorage.getItem("emp_id");

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/leave/manager/${manager_id}`);
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
  }, [manager_id]);

  const handleApprove = async (lr_id: number, action: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/leave/approve/${lr_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          approver_id: manager_id,
          action: action,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to approve leave request");
      }

      setLeaveRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.lr_id === lr_id
            ? { ...request, manager_approval: action === "approve" ? "Approved" : "Rejected" }
            : request
        )
      );

      alert(`Leave request ${action === "approve" ? "approved" : "rejected"} successfully!`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar /> 
      <div className="leave-container">
        <h2>Manager Dashboard</h2>
        {error && <p style={{ color: "#D32F2F", textAlign: "center" }}>{error}</p>}
        <table className="leave-table">
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Leave Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Approval</th>
            </tr>
          </thead>
          <tbody>
            {leaveRequests.map((request) => (
              <tr key={request.lr_id}>
                <td>{request.employee.name}</td>
                <td>{request.leave_type}</td>
                <td>{request.start_date}</td>
                <td>{request.end_date}</td>
                <td>{request.reason}</td>
                <td className="status">{request.status}</td>
                <td>
                  {request.manager_approval === "Pending" ? (
                    <>
                      <button
                        onClick={() => handleApprove(request.lr_id, "approve")}
                        className="approve-btn"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleApprove(request.lr_id, "reject")}
                        className="reject-btn"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className="status">{request.manager_approval}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveRequest;