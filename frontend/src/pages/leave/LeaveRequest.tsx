import React, { useEffect, useState } from "react";

interface LeaveRequest {
  lr_id: number;
  emp_id: number;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  manager_approval: string; // Added manager_approval field
  employee: {
    name: string;
  };
}

const LeaveRequest: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [error, setError] = useState("");
//Here is an error in storing manager id
  const manager_id = localStorage.getItem("emp_id"); // Assuming manager's ID is stored in localStorage
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        
        const response = await fetch(`http://localhost:3000/api/leave/manager/${manager_id}`);
        const data = await response.json();

        // const emp = JSON.parse(localStorage.getItem("emp")|| "{}"); // Assuming HR ID is stored in localStorage
        // const hrId=emp.hr_id;
        // console.log("This is the hr id : "+hrId);
        // const response = await fetch(`/api/leave/hr/${hrId}`);
        // const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch leave requests");
        }
        console.log(data);

        setLeaveRequests(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchLeaveRequests();
  }, [manager_id]);

  const handleApprove = async (lr_id: number,app:string) => {
    try {
      {
      const response = await fetch(`http://localhost:3000/api/leave/approve/${lr_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          approver_id: manager_id,
          action: app
        }),
      });

      console.log(manager_id);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to approve leave request");
      }

      // Update the leaveRequests state to reflect the approval
      setLeaveRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.lr_id === lr_id
            ? { ...request, manager_approval: app === "approve" ? "Approved" : "Rejected" }
            : request
        )
      );
  
      alert(`Leave request ${app === "approve" ? "approved" : "rejected"} successfully!`);
    }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center" }}>Manager Dashboard</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid black", padding: "8px" }}>Employee Name</th>
            <th style={{ border: "1px solid black", padding: "8px" }}>Leave Type</th>
            <th style={{ border: "1px solid black", padding: "8px" }}>Start Date</th>
            <th style={{ border: "1px solid black", padding: "8px" }}>End Date</th>
            <th style={{ border: "1px solid black", padding: "8px" }}>Reason</th>
            <th style={{ border: "1px solid black", padding: "8px" }}>Status</th>
            <th style={{ border: "1px solid black", padding: "8px" }}>Approval</th>
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
              {request.manager_approval === "Pending" ? (
                <span>
                  <button
                    onClick={() => handleApprove(request.lr_id, "approve")}
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
                    onClick={() => handleApprove(request.lr_id, "reject")}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "red",
                      color: "white",
                      border: "none",
                      borderRadius: "3px",
                      cursor: "pointer",
                      marginLeft: "7px",
                    }}
                  >
                    Reject
                  </button>
                </span>
              ) : (
                <span>{request.manager_approval}</span>
              )}
            </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaveRequest;