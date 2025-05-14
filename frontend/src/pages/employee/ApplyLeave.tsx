import React, { useState } from "react";

const ApplyLeave: React.FC = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [error, setError] = useState("");

  const handleLeave = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!leaveType || !startDate || !endDate || !reason) {
      setError("All fields are required.");
      return;
    }

    if(new Date(startDate)>= new Date(endDate))
    {
        setError("Start date must be earlier than the end date");
        return;
    }
    else if(new Date()>new Date(startDate))
    {
        setError("Start date must begin after this day");
        return;
    }

    console.log({
      leaveType,
      startDate,
      endDate,
      reason,
    });

    alert("Leave request submitted successfully!");
    setLeaveType("");
    setStartDate("");
    setEndDate("");
    setReason("");
  };

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center" }}>Apply for Leave</h2>
      <form onSubmit={handleLeave}>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Leave Type</label>
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          >
            <option value="">Select Leave Type</option>
            <option value="sick">Sick Leave</option>
            <option value="casual">Casual Leave</option>
            <option value="earned">Earned Leave</option>
          </select>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Reason</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{ width: "100%", padding: "8px", resize: "none" }}
            rows={4}
          />
        </div>

        {error && <p style={{ color: "red", marginBottom: "15px" }}>{error}</p>}

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "blue",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default ApplyLeave;