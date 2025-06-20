// TeamCalendar.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  format,
  getDaysInMonth,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from "date-fns";
import Sidebar from "../employee/EmpSideBar";
import AdminSide from "../admin/AdminSideBar";
import "../../styles/TeamCalendar.css";

interface Type {
  type_of_leave: string;
}
interface LeaveDetail {
  lr_id: number;
  emp_id: number;
  leave_type: number;
  start_date: string;
  end_date: string;
  reason: string | null;
  req_at: string;
  manager_approval: string;
  hr_approval: string;
  dir_approval: string;
  status: string;
  num_days: number;
  employee: {
    emp_id: number;
    name: string;
  };
  leaveType: Type;
}

interface TeamMemberLeave {
  emp: {
    emp_id: number;
    name: string;
  };
  leaves: LeaveDetail[];
}

const TeamCalendar: React.FC = () => {
  const [teamLeaveData, setTeamLeaveData] = useState<TeamMemberLeave[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const { user: currentUser, isLoading: authLoading } = useAuth();

  const roleId = currentUser?.role?.role_id;
  const emp_id = currentUser?.emp_id;

  if (authLoading) return <div>Loading team calendar...</div>;
  if (!currentUser || emp_id === undefined) {
    return <div className="team-calendar-container">Error: User not logged in or ID missing.</div>;
  }

  useEffect(() => {
    const fetchTeamLeaveData = async () => {
      if (emp_id === undefined) return;
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();

      try {
        const response = await fetch(`http://localhost:3000/api/leave/teamleavebymonth/3`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ year: year, month: month }),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data: TeamMemberLeave[] = await response.json();
        console.log(data);
        setTeamLeaveData(data);
      } catch (error) {
        console.error("Error fetching team leave data:", error);
      }
    };

    fetchTeamLeaveData();
  }, [emp_id, currentMonth]);

  const daysInMonth = getDaysInMonth(currentMonth);

  const getLeaveColor = (typeOfLeave: string): string => {
    switch (typeOfLeave.toLowerCase()) {
      case "casual leave":
        return "casual-leave-bg";
      case "sick leave":
        return "sick-leave-bg";
      case "paid leave":
        return "paid-leave-bg";
      default:
        return "default-leave-bg";
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() - 1);
      return newMonth;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() + 1);
      console.log(newMonth);
      return newMonth;
    });
  };

  const isAdminOrDirector = roleId && [1, 2, 6].includes(roleId);

  return (
    <>
      {isAdminOrDirector ? <AdminSide /> : <Sidebar />}
      <div className="team-calendar-wrapper">
        <h3 className="team-calendar-header">Team Leave Calendar</h3>
        <div className="month-navigation">
          <button onClick={goToPreviousMonth}>&lt;</button>
          <div className="current-month-display">{format(currentMonth, "MMMM")}</div>
          <button onClick={goToNextMonth}>&gt;</button>
        </div>

        <div className="team-calendar-table-container">
          <table className="team-calendar-table">
            <thead>
              <tr>
                <th className="team-calendar-header-cell employee-name-header">Employee</th>
                {[...Array(daysInMonth).keys()].map((i) => (
                  <th key={`day-header-${i + 1}`} className="team-calendar-header-cell day-header">
                    {i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
        {teamLeaveData.map((teamMember) => (
          <tr key={teamMember.emp.emp_id}>
            <td className="team-calendar-employee-cell">{teamMember.emp.name}</td>
            {[...Array(daysInMonth).keys()].map((i) => {
              const day = i + 1;
              const currentDay = new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth(),
                day
              );

              // const isToday = currentDay.toDateString() === new Date().toDateString();
              const isWeekend = currentDay.getDay() === 0 || currentDay.getDay() === 6;

              const leavesForThisDay = (teamMember.leaves || []).filter((leave) => {
                const leaveStart = new Date(leave.start_date);
                const leaveEnd = new Date(leave.end_date);
                return isWithinInterval(currentDay, {
                  start: leaveStart,
                  end: leaveEnd,
                });
              });

              const leaveColorClass = leavesForThisDay.length > 0
                ? getLeaveColor(leavesForThisDay[0].leaveType.type_of_leave)
                : "";

                return (
                  <td
                    key={`day-cell-${teamMember.emp.emp_id}-${day}`}
                    className={`team-calendar-day-cell ${leaveColorClass}`}
                    // style={isToday ? { backgroundColor: "#ff67ff", borderRadius: "100px", position: "relative" } : { position: "relative" }}
                  >
                    {/* Day number */}
                    <div className="day-number">{day}</div>

                    {/* Weekend overlay */}
                    {isWeekend && <div className="weekend-overlay"></div>}

                    {/* Leave tooltip (invisible span) */}
                    {leavesForThisDay.map((leave, index) => (
                      <span
                        key={`${leave.lr_id}-${index}`}
                        title={`${leave.employee?.name || teamMember.emp.name} - ${leave.leaveType.type_of_leave}`}
                      ></span>
                    ))}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>

        </table>
        </div>
        {teamLeaveData.every(member => member.leaves.length === 0) && (
          <div className="no-leaves-message">No members on leave this month.</div>
        )}

        <div className="leave-legend">
          <h4>Leave Legend:</h4>
          <ul className="legend-list">
            <li><span className="legend-box casual-leave-bg"></span> Casual Leave</li>
            <li><span className="legend-box sick-leave-bg"></span> Sick Leave</li>
            <li><span className="legend-box paid-leave-bg"></span> Paid Leave</li>
            <li><span className="legend-box default-leave-bg"></span> Other Leave</li>
            {/* <li><span className="legend-box" style={{ backgroundColor: "#ff67ff" }}></span> Today</li>
            <li><span className="legend-box" style={{ border: "2px solid red" }}></span> Weekend</li>  */}
          </ul>
        </div>
      </div>
    </>
  );
};

export default TeamCalendar;
