import React, { useEffect, useState } from "react";
import Sidebar from "../admin/AdminSideBar";
import "../../styles/HRLeaveRequests.css";
import { useAuth } from "../../contexts/AuthContext"; // Assuming AuthContext is in the parent directory

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

  const { user, isLoading } = useAuth(); // Use the useAuth hook
  const emp_id = user?.emp_id; // Get emp_id from the authenticated user

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      // Ensure emp_id (hrId) is available before fetching
      if (emp_id === undefined) {
        setError("HR ID not available. Please log in.");
        return;
      }

      try {
        // Use emp_id from useAuth directly as hrId
        const hrId = emp_id;
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

    if (!isLoading) { // Only fetch once authentication state is known
      fetchLeaveRequests();
    }
  }, [emp_id, isLoading]); // Add emp_id and isLoading as dependencies

  const handleApprove = async (lr_id: number, app: string) => {
    if (emp_id === undefined) {
      setError("Approver ID is missing. Cannot perform action.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/leave/approve/${lr_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          approver_id: emp_id, // Use emp_id from useAuth
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

  // Optional: Add a loading state for the component itself
  if (isLoading) {
    return (
      <div className="dashboard-wrapper">
        <Sidebar />
        <div className="leave-container">
          <h2>HR Dashboard</h2>
          <p>Loading HR leave requests...</p>
        </div>
      </div>
    );
  }

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
                            <button onClick={cancelReject} className="cancel-reject-btn" >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button onClick={() => handleApprove(request.lr_id, "approve")} className="approve-btn" >
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