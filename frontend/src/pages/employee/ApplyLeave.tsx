import React, { useState } from "react";

const ApplyLeave: React.FC = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [leaveType, setLeaveType] = useState<number>(0);
  const [error, setError] = useState("");
  const emp_id = localStorage.getItem("emp_id");

  const handleLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try
    {
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
    const daysdiff=(new Date(endDate).getTime() - new Date(startDate).getTime())/(1000 * 60 * 60 * 24);

    const response = await fetch("http://localhost:3000/api/leave/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            emp_id: emp_id,
            leave_type: leaveType,
            start_date: startDate,
            end_date: endDate,
            reason: reason,
            num_days: daysdiff
          }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }
      console.log("Employee ID : "+emp_id);

    console.log("Days : "+daysdiff);
    console.log({
      leaveType,
      startDate,
      endDate,
      reason,
    });

    alert("Leave request submitted successfully!");
    setLeaveType(0);
    setStartDate("");
    setEndDate("");
    setReason("");
  }
  catch(err:any){
    setError(err.message);
  }
};

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center" }}>Apply for Leave</h2>
      <form onSubmit={handleLeave}>
        <div style={{ marginBottom: "15px" }}>
          <h1>Employee ID: {emp_id}</h1>
          <label style={{ display: "block", marginBottom: "5px" }}>Leave Type</label>
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(Number(e.target.value))}
            style={{ width: "100%", padding: "8px" }}
          >
            <option value="">Select Leave Type</option>
            <option value={1}>Sick Leave</option>
            <option value={2}>Casual Leave</option>
            <option value={3}>Earned Leave</option>
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