import React, { useEffect, useState } from "react";
import "../../styles/EmpDash.css";

interface LeaveBalance {
  leave_type_id: number;
  bal_days: number;
  leaveType: {
    type_of_leave: string;
  };
}

const ApplyLeave: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [holidays, setHolidays] = useState<string[]>([]);
  const [leaveType, setLeaveType] = useState<number>(0);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [error, setError] = useState("");
  const [workingDays, setWorkingDays] = useState<number | null>(null);
  const emp_id = localStorage.getItem("emp_id");
  console.log(emp_id);

  useEffect(() => {
    const fetchHolidaysAndBalances = async () => {
      try {
        const holidaysResponse = await fetch("http://localhost:3000/api/leave/emp/holidays");
        const holidaysData = await holidaysResponse.json();
        const holidayDates = holidaysData.map((h: any) => h.date);
        setHolidays(holidayDates);

        const balanceRes = await fetch(`http://localhost:3000/api/bal/getbal/${emp_id}`);
        const balanceData = await balanceRes.json();
        if (balanceRes.ok) {
          setLeaveBalances(balanceData.balances);
        } else {
          console.error("Failed to fetch leave balances:", balanceData.error);
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };

    fetchHolidaysAndBalances();
  }, [emp_id]);

  useEffect(() => {
    const checkClashingLeavesAndCalculate = async () => {
      if (startDate && endDate) {
        try {
          const res = await fetch("http://localhost:3000/api/leave/clashing", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: emp_id,
              sdate: new Date(startDate),
              edate: new Date(endDate)
            }),
          });

          const data = await res.json();
          console.log(data);
          if (data.clashing === false) {
            setError("You have already taken leave on one or more selected dates.");
            setWorkingDays(null);
            return;
          }
          setError("");
          calculateWorkingDays();
        } catch (err) {
          setError("Failed to check for clashing leaves.");
          console.error(err);
        }
      } else {
        setWorkingDays(null);
      }
    };

    checkClashingLeavesAndCalculate();
  }, [startDate, endDate, holidays]);

  const calculateWorkingDays = () => {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    let total = 0;

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      const dateStr = d.toISOString().split("T")[0];
      if (day !== 0 && day !== 6 && !holidays.includes(dateStr)) {
        total++;
      }
    }

    setWorkingDays(total);
  };

  const handleLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!leaveType || !startDate || !endDate || !reason) {
      setError("All fields are required.");
      return;
    }

    const today = new Date().setHours(0, 0, 0, 0);
    const sDate = new Date(startDate).setHours(0, 0, 0, 0);
    const eDate = new Date(endDate).setHours(0, 0, 0, 0);

    if (sDate >= eDate) {
      setError("Start date must be earlier than the end date.");
      return;
    }

    if (sDate <= today) {
      setError("Start date must be in the future.");
      return;
    }

    if (workingDays === null || workingDays <= 0) {
      setError("The selected range includes only weekends/holidays.");
      return;
    }

    const balance = leaveBalances.find(b => b.leave_type_id === leaveType);
    if (!balance || workingDays > balance.bal_days) {
      const leaveTypeName = getLeaveTypeName(leaveType);
      setError(`Not enough ${leaveTypeName} balance. Available: ${balance?.bal_days || 0} days.`);
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/leave/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emp_id,
          leave_type: leaveType,
          start_date: startDate,
          end_date: endDate,
          reason,
          num_days: workingDays,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Leave request submission failed");

      alert("Leave request submitted successfully!");
      resetForm();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setLeaveType(0);
    setStartDate("");
    setEndDate("");
    setReason("");
    setWorkingDays(null);
    setError("");
  };

  const getLeaveTypeName = (typeId: number): string => {
    return leaveBalances.find(b => b.leave_type_id === typeId)?.leaveType.type_of_leave || "Leave";
  };

  const getLeaveBalance = (typeId: number): number => {
    return leaveBalances.find(b => b.leave_type_id === typeId)?.bal_days || 0;
  };

  return (
    <form onSubmit={handleLeave} className="leave-form">
      {/* ❌ Close Button */}
      <button
        type="button"
        onClick={onClose}
        style={{
          background: "transparent",
          border: "none",
          fontSize: "24px",
          cursor: "pointer",
          color: "#999"
        }}
        aria-label="Close"
        title="Close"
      >
        ×
      </button>

      <h2>Apply for Leave</h2>

      <div className="form-group">
        <label>Leave Type</label>
        <select
          value={leaveType}
          style={{ height: '35px' }}
          onChange={(e) => setLeaveType(Number(e.target.value))}
        >
          <option value={0}>Select Type</option>
          {leaveBalances.map((balance) => (
            <option key={balance.leave_type_id} value={balance.leave_type_id}>
              {balance.leaveType.type_of_leave}
            </option>
          ))}
        </select>
        {leaveType !== 0 && (
          <span className="balance-info">
            {getLeaveBalance(leaveType)} days
          </span>
        )}
      </div>

      <div className="form-group">
        <label>Start Date</label>
        <input
          type="date"
          value={startDate}
          style={{ height: '35px' }}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>End Date</label>
        <input
          type="date"
          value={endDate}
          style={{ height: '35px' }}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      {workingDays !== null && (
        <div className="form-group">
          <label>Leave Count</label>
          <span>{workingDays} day{workingDays !== 1 ? 's' : ''}</span>
        </div>
      )}

      <div className="form-group">
        <label>Reason</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          style={{ height: "30px", width: "300px", padding:'5px' }}
        />
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="modal-buttons">
        <button type="submit" className="set-pass">Submit</button>
      </div>
    </form>
  );
};

export default ApplyLeave;
