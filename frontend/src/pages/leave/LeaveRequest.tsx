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
  dir_approval: string;
  employee: {
    name: string;
    manager_id: number;
    dir_id: number;
  };
}

const LeaveRequest: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [error, setError] = useState("");
  const manager_id = localStorage.getItem("emp_id");

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const [managerRes, directorRes] = await Promise.all([
          fetch(`http://localhost:3000/api/leave/manager/${manager_id}`),
          fetch(`http://localhost:3000/api/leave/director/${manager_id}`)
        ]);
  
        const [managerData, directorData] = await Promise.all([
          managerRes.json(),
          directorRes.json()
        ]);
  
        if (!managerRes.ok || !directorRes.ok) {
          throw new Error("Failed to fetch leave requests");
        }
  
        // Merge and remove duplicates if needed
        const combined = [...managerData, ...directorData];
        const uniqueRequests = Array.from(
          new Map(combined.map(item => [item.lr_id, item])).values()
        );
  
        setLeaveRequests(uniqueRequests);
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
      <div className="leavecontainer">
        <h2>Manager Dashboard</h2>
        {error && <p style={{ color: "#D32F2F", textAlign: "center" }}>{error}</p>}
        <table className="leave-table">
          <thead >
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
                {(request.manager_approval === "Pending" && request.employee.manager_id.toString() === manager_id) ? (
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
                ) : request.dir_approval === "Pending" && request.employee.dir_id.toString() === manager_id ? (
                  <>
                    <button
                      onClick={() => handleApprove(request.lr_id, "approve")}
                      className="approve-btn"
                    >
                      Approve (Dir)
                    </button>
                    <button
                      onClick={() => handleApprove(request.lr_id, "reject")}
                      className="reject-btn"
                    >
                      Reject (Dir)
                    </button>
                  </>
                ) : (
                  <span className="status">
                    {request.employee.manager_id.toString() == manager_id ? request.manager_approval : request.dir_approval}
                  </span>
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