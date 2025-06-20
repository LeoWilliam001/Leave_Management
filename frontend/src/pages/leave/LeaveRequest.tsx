import React, { useEffect, useState } from "react";
import "../../styles/LeaveRequest.css";
import Sidebar from "../employee/EmpSideBar";
import { useAuth } from "../../contexts/AuthContext"; // Import useAuth

interface LeaveRequest {
  lr_id: number;
  emp_id: number;
  leave_type: string; // Assuming this is leaveType.type_of_leave from backend
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  manager_approval: string;
  hr_approval:string;
  dir_approval: string;
  employee: {
    name: string;
    manager_id: number; // Ensure this is number
    dir_id: number;     // Ensure this is number
  };
}

const getStatusClass = (status: string) => {
  switch (status) {
    case "Approved":
      return "status approved";
    case "Rejected":
      return "status rejected";
    case "Pending":
      return "status pending";
    default:
      return "status";
  }
};


const LeaveRequest: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [error, setError] = useState("");

  const { user: currentUser, isLoading: authLoading } = useAuth(); // Use useAuth hook
  const manager_id = currentUser?.emp_id; // Get manager_id from user object

  // Handle loading state
  if (authLoading) {
    return <div>Loading leave requests...</div>;
  }

  // If user data isn't available after loading, or manager_id is missing
  if (!currentUser || manager_id === undefined) {
    return <div className="dashboard-wrapper">Error: Manager ID missing.</div>;
  }

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      // Ensure manager_id is available before fetching
      if (manager_id === undefined) return;

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

        const combined = [...managerData, ...directorData];
        // Filter out duplicate requests based on lr_id
        const uniqueRequests = Array.from(
          new Map(combined.map(item => [item.lr_id, item])).values()
        );

        setLeaveRequests(uniqueRequests);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchLeaveRequests();
  }, [manager_id]); // Dependency on manager_id

  const handleApprove = async (lr_id: number, action: string) => {
    if (manager_id === undefined) {
      setError("Approver ID is missing.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/leave/approve/${lr_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          approver_id: manager_id, // Use manager_id (number) directly
          action: action,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to approve leave request");
      }

      setLeaveRequests((prevRequests) =>
        prevRequests.map((request) => {
          // Determine which approval field to update based on who is approving
          let updatedRequest = { ...request };
          if (request.employee.manager_id === manager_id) { // Compare numbers directly
            updatedRequest.manager_approval = action === "approve" ? "Approved" : "Rejected";
          }
          if (request.employee.dir_id === manager_id) { // Compare numbers directly
            updatedRequest.dir_approval = action === "approve" ? "Approved" : "Rejected";
          }
          // Also update the overall status if all approvals are done or if rejected
          if (action === "reject") {
            updatedRequest.status = "Rejected";
          } else if (updatedRequest.manager_approval === "Approved" &&
                     updatedRequest.hr_approval === "Approved" &&
                     updatedRequest.dir_approval === "Approved") {
            updatedRequest.status = "Approved";
          }
          return updatedRequest;
        })
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
        <h2>Leave Requests</h2>
        {error && <p style={{ color: "#D32F2F", textAlign: "center" }}>{error}</p>}
        <table className="leave-table">
          <thead >
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
                <td className={getStatusClass(request.manager_approval)}>{request.manager_approval}</td>
                <td className={getStatusClass(request.hr_approval)}>{request.hr_approval}</td>
                <td className={getStatusClass(request.dir_approval)}>{request.dir_approval}</td>
                <td className={getStatusClass(request.status)}>{request.status}</td>
                <td>
                {/* Manager approval section */}
                {(request.manager_approval === "Pending" && request.status !== "Cancelled" && request.employee.manager_id === manager_id) ? (
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
                ) : // Director approval section (only if manager approved or manager not involved)
                  (request.dir_approval === "Pending" && request.employee.dir_id === manager_id) ? (
                  <>
                    <button onClick={() => handleApprove(request.lr_id, "approve")} className="approve-btn" >
                      Approve (Dir)
                    </button>
                    <button onClick={() => handleApprove(request.lr_id, "reject")} className="reject-btn" >
                      Reject (Dir)
                    </button>
                  </>
                ) : (
                  <span className="status">
                    {/* Display current user's approval status if it matches their role, else general status */}
                    {request.employee.manager_id === manager_id ? request.manager_approval : request.dir_approval}
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