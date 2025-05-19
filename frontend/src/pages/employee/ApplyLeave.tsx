import React, { useEffect, useState } from "react";
import Sidebar from "./EmpSideBar"; // Import the shared Sidebar component
import "../../styles/EmpDash.css";

const ApplyLeave: React.FC = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [holidays, setHolidays] = useState<string[]>([]);
  const [leaveType, setLeaveType] = useState<number>(0);
  const [error, setError] = useState("");
  const emp_id = localStorage.getItem("emp_id");

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/leave/emp/holidays");
        const data = await response.json();
  
        // Extract only dates in 'YYYY-MM-DD' format
        const holidayDates = data.map((h: any) => h.date);
        setHolidays(holidayDates);
      } catch (err) {
        console.error("Failed to fetch holidays", err);
      }
    };
  
    fetchHolidays();
  }, []);
  
  const handleLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // Basic validation
      if (!leaveType || !startDate || !endDate || !reason) {
        setError("All fields are required.");
        return;
      }

      if (new Date(startDate) >= new Date(endDate)) {
        setError("Start date must be earlier than the end date");
        return;
      } else if (new Date() > new Date(startDate)) {
        setError("Start date must begin after this day");
        return;
      }

      const totalDays =
        (new Date(endDate).getTime() - new Date(startDate).getTime()) /
          (1000 * 60 * 60 * 24) +
        1;

      // Function to calculate weekends
      const calculateWeekends = (start: string, end: string,holidays: string[]) => {
        let weekendCount = 0;
        let currentDate = new Date(start);
        console.log(holidays);
        while (currentDate <= new Date(end)) {
          const day = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
          const daystr= currentDate.toISOString().split("T")[0];
          console.log(daystr);
          if (day === 0 || day === 6 || holidays.includes(daystr)) {
            weekendCount++;
          }
          currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
        }

        return weekendCount;
      };

      // Calculate weekends
      const weekends = calculateWeekends(startDate, endDate, holidays);

      // Calculate working days
      const workingDays = totalDays - weekends;

      if (workingDays <= 0) {
        setError(
          "The selected range only includes weekends. Please select valid working days."
        );
        return;
      }

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
          num_days: workingDays,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Leave request submission failed");
      }

      alert("Leave request submitted successfully!");
      setLeaveType(0);
      setStartDate("");
      setEndDate("");
      setReason("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <main className="dashboard-main">
        <h1 className="dashboard-heading">Apply for Leave</h1>
        <form onSubmit={handleLeave} className="leave-form">
          <div className="form-group">
            <label>Leave Type</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(Number(e.target.value))}
            >
              <option value="">Select Leave Type</option>
              <option value={1}>Sick Leave</option>
              <option value={2}>Casual Leave</option>
              <option value={3}>Earned Leave</option>
            </select>
          </div>

          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="submit-button">
            Submit
          </button>
        </form>
      </main>
    </div>
  );
};

export default ApplyLeave;