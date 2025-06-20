import React, { useEffect, useState } from "react";
import Sidebar from "./EmpSideBar";
import "../../styles/LeaveStatus.css";
import { useAuth } from "../../contexts/AuthContext";

interface LeaveType {
  lt_id: number;
  type_of_leave: string;
  days_allocates: number;
}
interface Employee {
  emp_id: number; 
  name: string;
}
interface LeaveApp {
  la_id: number;
  approver_id: number;
  decision: string;
  comment: string | null;
  actionAt: Date;
}
interface LeaveRequest {
  lr_id: number;
  emp_id: number;
  leave_type: number;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  num_days: number;
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
  const [approverNamesMap, setApproverNamesMap] = useState<Map<number, string>>(new Map()); 

  const { user: currentUser, isLoading: authLoading } = useAuth();

  const handleView = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
  };

  const emp_id = currentUser?.emp_id;

  useEffect(() => {
    const fetchAllEmployees = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/users/");
        const data: Employee[] = await response.json();

        if (response.ok) {
          const namesMap = new Map<number, string>();
          data.forEach(employee => {
            namesMap.set(employee.emp_id, employee.name);
          });
          setApproverNamesMap(namesMap);
        } else {
          console.error("Failed to fetch employees:", data);
        }
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };

    fetchAllEmployees(); 
  }, []); 

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      if (!emp_id || authLoading) {
        return;
      }
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
  }, [emp_id, authLoading]); 

  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
  };

  const filteredRequests =
    filterStatus === "All"
      ? leaveRequests
      : leaveRequests.filter((req) => req.status === filterStatus);

  const handleCancel = async (lr_id: number, request: LeaveRequest) => {
    try {
      const response = await fetch(`http://localhost:3000/api/leave/request/cancel/${lr_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emp_id: request.emp_id,
          leave_type_id: request.leave_type,
          num_days: request.num_days,
          start_date: request.start_date,
          end_date: request.end_date
        })
      });
      if (response.status === 200) {
        console.log(response);
        alert("Leave request cancelled successfully");
        setLeaveRequests(prevRequests => prevRequests.map(req =>
          req.lr_id === lr_id ? { ...req, status: "Cancelled" } : req
        ));
      } else {
        alert("Your leave Request cannot be cancelled for several reasons");
      }
    } catch (err) {
      console.log(err);
      alert("Error cancelling leave request.");
    }
  };

  if (authLoading || !currentUser) {
    return <div>Loading Leave Status...</div>;
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
                <span>{request.leaveType?.type_of_leave || 'N/A'}</span>
              </p>
              <p>
                <strong>Dates:</strong>
                <span>{request.start_date} to {request.end_date}</span>
              </p>
              <p>
                <strong>Reason:</strong>
                <span className="truncate">{request.reason}</span>
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginTop: '5px' }}>
                <button
                  style={{ padding: '3px', color: '#3498db' }}
                  onClick={() => handleView(request)}
                >
                  View
                </button>

                {(request.status === "Pending" ||
                  (request.status === "Approved" && new Date(request.end_date) > new Date())) && (
                    <button
                      className="cancelbutton"
                      onClick={() => { handleCancel(request.lr_id, request); }}
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
              <h3 className="modal-title">Leave Request Details</h3>

              <div className="modal-details-grid">
                <p><strong>Leave Type:</strong> {selectedRequest.leaveType?.type_of_leave || 'N/A'}</p>
                <p><strong>Start Date:</strong> {selectedRequest.start_date}</p>
                <p><strong>End Date: </strong>{selectedRequest.end_date}</p>
                <p><strong>Reason:</strong> {selectedRequest.reason}</p>
                <p><strong>Status:</strong> <span className={`leave-status ${selectedRequest.status}`}>{selectedRequest.status}</span></p>
                <p><strong>Requested on:</strong> {new Date(selectedRequest.req_at).toLocaleDateString()}</p>
              </div>

              <div className="modal-approvals-summary">
                <p><strong>Manager Approval:</strong> <span className={`status-icon ${selectedRequest.manager_approval}`}>{selectedRequest.manager_approval === 'Approved' ? '✅' : selectedRequest.manager_approval === 'Rejected' ? '❌' :selectedRequest.manager_approval==="Pending"? '⏳':'🚫'}</span></p>
                <p><strong>HR Approval:</strong> <span className={`status-icon ${selectedRequest.hr_approval}`}>{selectedRequest.hr_approval === 'Approved' ? '✅' : selectedRequest.hr_approval === 'Rejected' ? '❌' : selectedRequest.hr_approval==="Pending"? '⏳':'🚫'}</span></p>
                <p><strong>Director Approval:</strong> <span className={`status-icon ${selectedRequest.dir_approval}`}>{selectedRequest.dir_approval === 'Approved' ? '✅' : selectedRequest.dir_approval === 'Rejected' ? '❌' : selectedRequest.dir_approval==="Pending"? '⏳':'🚫'}</span></p>
              </div>

              {selectedRequest.leaveApp && selectedRequest.leaveApp.length > 0 && (
                <>
                  <h4 className="approval-trail-title">Approval Hierarchy</h4>
                  <ul className="approval-trail-list">
                    {selectedRequest.leaveApp.map((approval, index) => (
                      <li key={approval.la_id} className="approval-trail-item">
                        <p><strong>Level {index + 1}</strong></p>
                        <p><strong>Approver:</strong> {approverNamesMap.get(approval.approver_id) || `ID: ${approval.approver_id}`}</p>
                        <p>
                          <strong>Decision:</strong>
                          <span className={`status-icon ${approval.decision}`}>
                            {approval.decision === 'Approved' ? '✅' : approval.decision === 'Rejected' ? '❌' : approval.decision==="Pending"?'⏳':'🚫'}
                          </span>
                        </p>
                        <p><strong>Comment:</strong> {approval.comment || "None"}</p>
                        <p><strong>Action At:</strong> {new Date(approval.actionAt).toLocaleString()}</p>
                        {index < selectedRequest.leaveApp.length - 1 && <hr className="approval-trail-divider" />}
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