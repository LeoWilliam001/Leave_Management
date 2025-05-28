import React, { useEffect, useState } from "react";
import Sidebar from "../admin/AdminSideBar";
import "../../styles/HRLeaveRequests.css"; 

interface LeaveRequest {
  lr_id: number;
  emp_id: number;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  manager_approval: string;
  hr_approval: string;
  dir_approval: string;
  employee: {
    name: string;
    manager_id: number | null;
    hr_id: number | null;
    dir_id: number | null;
  };
}

const HRLeaveRequests: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [rejectingRequestId, setRejectingRequestId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>("");

  const emp_id = localStorage.getItem("emp_id");

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const emp = JSON.parse(localStorage.getItem("emp") || "{}");
        const hrId = emp.id;
        const response = await fetch(`http://localhost:3000/api/leave/hr/${hrId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch leave requests");
        }
        const data = await response.json();
        setLeaveRequests(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchLeaveRequests();
  }, []);

  const handleApprove = async (lr_id: number, app: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/leave/approve/${lr_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          approver_id: emp_id,
          action: app,
          ...(app === "reject" && { rejection_reason: rejectionReason }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update leave request");
      }

      setLeaveRequests((prev) =>
        prev.map((req) =>
          req.lr_id === lr_id
            ? { 
                ...req, 
                hr_approval: app === "approve" ? "Approved" : "Rejected",
                status: app === "approve" ? req.status : "Rejected" 
              }
            : req
        )
      );

      setRejectingRequestId(null);
      setRejectionReason("");
      alert(`Leave request ${app === "approve" ? "approved" : "rejected"} successfully!`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const startRejectProcess = (lr_id: number) => {
    setRejectingRequestId(lr_id);
  };

  const cancelReject = () => {
    setRejectingRequestId(null);
    setRejectionReason("");
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="leave-container">
        <h2>HR Dashboard</h2>
        {error && <p style={{ color: "#D32F2F", textAlign: "center" }}>{error}</p>}
        <table className="leave-table">
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Leave Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Reason</th>
              <th>Manager Approval</th>
              <th>HR Approval</th>
              <th>Dir Approval</th>
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
                <td>{request.manager_approval}</td>
                <td>{request.hr_approval}</td>
                <td>{request.dir_approval}</td>
                <td className="status">{request.status}</td>
                <td>
                  {request.hr_approval === "Pending" ? (
                    <>
                      {rejectingRequestId === request.lr_id ? (
                        <div className="rejection-container">
                          <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Enter rejection reason"
                            className="rejection-reason"
                          />
                          <div className="rejection-buttons">
                            <button
                              onClick={() => handleApprove(request.lr_id, "reject")}
                              className="confirm-reject-btn"
                              disabled={!rejectionReason.trim()}
                            >
                              Confirm Reject
                            </button>
                            <button
                              onClick={cancelReject}
                              className="cancel-reject-btn"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleApprove(request.lr_id, "approve")}
                            className="approve-btn"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => startRejectProcess(request.lr_id)}
                            className="reject-btn"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <span className="status">{request.hr_approval}</span>
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

export default HRLeaveRequests;