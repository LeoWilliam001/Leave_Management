import React, { useEffect, useState } from "react";
import Sidebar from "./EmpSideBar"; 
import "../../styles/LeaveStatus.css";

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

  const handleCancel=async(lr_id: number)=> {
    try{
      const response=await fetch(`http://localhost:3000/api/leave/request/cancel/${lr_id}`,{
        method:"PATCH",
        headers:{
          "Content-Type": "application/json",
        }
      });
      if(response.status==200)
      {
        console.log(response);
        alert("Leave request cancelled successfully");
      }
      else{
        alert("Your leave Request cannot be cancelled for several reasons");
      }
    }
    catch(err){
      console.log(err);
    }
  }

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <main className="dashboard-main">
        <h2>Leave History</h2>
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
              <div className="leave-card-header">
                <h3>Request #{request.lr_id}</h3>
                <span 
                  className={`leave-status ${request.status.replace(/\s+/g, '')}`}
                >
                  {request.status}
                </span>
              </div>
              <p>
                <strong>Type:</strong> 
                <span>{request.leave_type}</span>
              </p>
              <p>
                <strong>Dates:</strong> 
                <span>{request.start_date} to {request.end_date}</span>
              </p>
              <p>
                <strong>Reason:</strong> 
                <span className="truncate">{request.reason}</span>
              </p>
              {(request.status === "Pending" || 
                (request.status === "Approved" && new Date(request.start_date) > new Date())) && (
                  <button 
                    className="cancelbutton" 
                    onClick={() => handleCancel(request.lr_id)}
                  >
                    Cancel
                  </button>)}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default LeaveStatus;
