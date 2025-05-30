import React, { useEffect, useState } from "react";
import Sidebar from "./EmpSideBar"; 
import "../../styles/LeaveStatus.css";

interface LeaveType{
  lt_id: number;
  type_of_leave: string;
  days_allocates: number;
}
interface Employee{
  name: string;
}
interface LeaveApp{
  la_id: number;
  approver_id:number;
  decision: string;
  comment:string | null;
  actionAt: Date;
}
interface LeaveRequest {
  lr_id: number;
  leave_type: number;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  req_at: Date;
  manager_approval: string;
  hr_approval: string;
  dir_approval: string;
  leaveType: LeaveType;
  employee: Employee;
  leaveApp: LeaveApp[];
}

const LeaveStatus: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleView = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
  };

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
          <button onClick={() => handleFilterChange("Cancelled")}>Cancelled</button>
        </div>
  
        <div className="leave-status-container">
          {filteredRequests.map((request) => (
            <div key={request.lr_id} className="leave-card">
              <div className="leave-card-header">
                <h4>Req on : {new Date(request.req_at).toLocaleDateString()}</h4>
                <span 
                  className={`leave-status ${request.status.replace(/\s+/g, '')}`}
                >
                  {request.status}
                </span>
              </div>
              <p>
                <strong>Type:</strong> 
                <span>{request.leaveType.type_of_leave}</span>
              </p>
              <p>
                <strong>Dates:</strong> 
                <span>{request.start_date} to {request.end_date}</span>
              </p>
              <p>
                <strong>Reason:</strong> 
                <span className="truncate">{request.reason}</span>
              </p>

              <div style={{ display: 'flex', justifyContent:'space-between', gap: '10px', marginTop: '5px' }}>
                <button 
                  style={{ padding: '3px', color:'#3498db' }} 
                  onClick={() => handleView(request)}
                >
                  View
                </button>

                {(request.status === "Pending" || 
                  (request.status === "Approved" && new Date(request.start_date) > new Date())) && (
                    <button 
                      className="cancelbutton" 
                      onClick={() => handleCancel(request.lr_id)}
                    >
                      Cancel
                    </button>
                )}
              </div>

            </div> 
          ))}
        </div>
        {showModal && selectedRequest && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button className="modal-close" onClick={closeModal}>❌</button>
              <h3>Leave Request Details</h3>
              <p><strong>Leave Type:</strong> {selectedRequest.leaveType.type_of_leave}</p>
              <p><strong>Dates:</strong> {selectedRequest.start_date} to {selectedRequest.end_date}</p>
              <p><strong>Reason:</strong> {selectedRequest.reason}</p>
              <p><strong>Status:</strong> {selectedRequest.status}</p>
              <p><strong>Requested At:</strong> {new Date(selectedRequest.req_at).toLocaleString()}</p>
              <p><strong>Manager Approval:</strong> {selectedRequest.manager_approval}</p>
              <p><strong>HR Approval:</strong> {selectedRequest.hr_approval}</p>
              <p><strong>Director Approval:</strong> {selectedRequest.dir_approval}</p>
              {selectedRequest.leaveApp && selectedRequest.leaveApp.length > 0 && (
                <>
                  <h4>Approval Trail</h4>
                  <ul>
                    {selectedRequest.leaveApp.map((approval,index) => (
                      <li key={approval.la_id}>
                        <p><strong>Level </strong>{index+1}</p>
                        <p><strong>Approver ID:</strong> {approval.approver_id}</p>
                        <p><strong>Decision:</strong> {approval.decision}</p>
                        <p><strong>Comment:</strong> {approval.comment || "None"}</p>
                        <p><strong>Action At:</strong> {new Date(approval.actionAt).toLocaleString()}</p>
                        <hr />
                      </li>
                    ))}
                  </ul>
                </>
              )}

            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default LeaveStatus;
