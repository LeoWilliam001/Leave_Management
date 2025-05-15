import React, { useEffect, useState } from "react";

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

  const emp_id=localStorage.getItem("emp_id");

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const emp = JSON.parse(localStorage.getItem("emp")|| "{}"); // Assuming HR ID is stored in localStorage
        const hrId=emp.id;
        console.log("This is the hr id : "+hrId);
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

  const handleApprove = async (lr_id: number,app:string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/leave/approve/${lr_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          approver_id: emp_id,
          action: app
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to approve leave request");
      }
      const updatedRequest = await response.json();
      setLeaveRequests((prev) =>
        prev.map((req) => (req.lr_id === updatedRequest.lr_id ? updatedRequest : req))
      );
    } catch (err: any) {
      console.log(err);
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>HR Leave Requests</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid black", padding: "8px" }}>Employee Name</th>
            <th style={{ border: "1px solid black", padding: "8px" }}>Leave Type</th>
            <th style={{ border: "1px solid black", padding: "8px" }}>Start Date</th>
            <th style={{ border: "1px solid black", padding: "8px" }}>End Date</th>
            <th style={{ border: "1px solid black", padding: "8px" }}>Reason</th>
            <th style={{ border: "1px solid black", padding: "8px" }}>Status</th>
            <th style={{ border: "1px solid black", padding: "8px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leaveRequests.map((request) => (
            <tr key={request.lr_id}>
              <td style={{ border: "1px solid black", padding: "8px" }}>{request.employee.name}</td>
              <td style={{ border: "1px solid black", padding: "8px" }}>{request.leave_type}</td>
              <td style={{ border: "1px solid black", padding: "8px" }}>{request.start_date}</td>
              <td style={{ border: "1px solid black", padding: "8px" }}>{request.end_date}</td>
              <td style={{ border: "1px solid black", padding: "8px" }}>{request.reason}</td>
              <td style={{ border: "1px solid black", padding: "8px" }}>{request.status}</td>
              <td style={{ border: "1px solid black", padding: "8px" }}>
              {request.hr_approval === "Pending" ? (
                <span>
                  <button
                    onClick={() => handleApprove(request.lr_id,"approve")}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "green",
                      color: "white",
                      border: "none",
                      borderRadius: "3px",
                      cursor: "pointer",
                    }}
                  >
                    Approve
                  </button>
                  <button
                  onClick={() => handleApprove(request.lr_id,"reject")}
                  style={{
                    padding: "5px 10px",
                    backgroundColor: "red",
                    color: "white",
                    border: "none",
                    borderRadius: "3px",
                    cursor: "pointer",
                    marginLeft:"7px"
                  }}
                  >
                  Reject
                  </button>
                  </span>
                ) : (
                  <span>Accepted</span>
                )}
              
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HRLeaveRequests;