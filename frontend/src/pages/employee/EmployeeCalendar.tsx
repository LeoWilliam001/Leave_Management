// EmployeeCalendar.tsx
import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer, type View } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enIN } from "date-fns/locale";
import "../../styles/BigCalendar.css";
import Sidebar from "../employee/EmpSideBar";
import AdminSide from "../admin/AdminSideBar";
import HolidayForm from "../admin/CreateHoliday";
import { useAuth } from "../../contexts/AuthContext";
import TeamCalendar from "./TeamCalendar"; // <--- Make sure this import is present!

const locales = {
  "en-IN": enIN,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

type Event = {
  title: string;
  start: Date;
  end: Date;
  type: "leave" | "holiday";
};

const EmployeeCalendar: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState<Date>(new Date());
  const [showForm, setShowForm] = useState(false);

  const { user: currentUser, isLoading: authLoading } = useAuth();
  const roleId = currentUser?.role?.role_id;
  const emp_id = currentUser?.emp_id;

  if (authLoading) {
    return <div>Loading calendar...</div>;
  }

  if (!currentUser || emp_id === undefined) {
    return <div className="calendar-container">Error: User not logged in or ID missing.</div>;
  }

  useEffect(() => {
    const fetchData = async () => {
      if (emp_id === undefined) return;

      const leaveRes = await fetch(`http://localhost:3000/api/leave/emp/${emp_id}`);
      const allLeaves = await leaveRes.json();
      const approvedLeaves = allLeaves.filter((leave: any) => leave.status === "Approved");

      const holidayRes = await fetch("http://localhost:3000/api/leave/emp/holidays");
      const holidayData = await holidayRes.json();

      const generateWeekendEvents = (year: number): Event[] => {
        const weekends: Event[] = [];
        const d = new Date(year, 0, 1);
        while (d.getFullYear() === year) {
          const day = d.getDay();
          if (day === 0 || day === 6) {
            weekends.push({
              title: "Week Off",
              start: new Date(d),
              end: new Date(d),
              type: "holiday",
            });
          }
          d.setDate(d.getDate() + 1);
        }
        return weekends;
      };

      const now = new Date();
      const weekOffEvents = generateWeekendEvents(now.getFullYear());

      const leaveEvents: Event[] = [];
      approvedLeaves.forEach((item: any) => {
        const startDate = new Date(item.start_date);
        const endDate = new Date(item.end_date);
        const current = new Date(startDate);
        while (current <= endDate) {
          const day = current.getDay();
          if (day !== 0 && day !== 6) {
            leaveEvents.push({
              title: item.leaveType?.type_of_leave || "Leave",
              start: new Date(current),
              end: new Date(current),
              type: "leave",
            });
          }
          current.setDate(current.getDate() + 1);
        }
      });

      const holidayEvents = holidayData.map((item: any) => ({
        title: item.fest,
        start: new Date(item.date),
        end: new Date(item.date),
        type: "holiday",
      }));

      setEvents([...leaveEvents, ...holidayEvents, ...weekOffEvents]);
    };
    fetchData();
  }, [emp_id]);

  const eventStyleGetter = (event: Event) => {
    let backgroundColor = "#3174ad";
    if (event.title === "Week Off") backgroundColor = "#d1fae5";
    else if (event.type === "leave") backgroundColor = "#fca5a5";
    else if (event.type === "holiday") backgroundColor = "#fcd34d";
    return {
      style: { backgroundColor, borderRadius: "6px", color: "#000", border: "0px", display: "block", fontWeight: "bold", },
    };
  };

  const isAdminOrDirector = roleId && [1, 2, 6].includes(roleId);

  return (
    <>
      {isAdminOrDirector ? <AdminSide /> : <Sidebar />}
      {/* This div will handle the margin-left for the sidebar */}
      <div style={{ marginLeft: isAdminOrDirector ? '250px' : '250px', padding: '20px' }}>
        <div style={{ position: "relative", marginBottom: "1rem", textAlign: "center" }}>
          <h3 style={{ margin: 0 }}>Employee Leave Calendar</h3>
          {isAdminOrDirector && (
            <button style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-90%)", marginTop: "1rem", padding: '5px', borderRadius: '8px', backgroundColor: '#3498db', color: 'white' }} onClick={() => setShowForm(true)}>
              Add Holiday
            </button>
          )}
        </div>

        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '550px', width: '90%', margin: '0 auto' }}
          eventPropGetter={eventStyleGetter}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
        />

        {/* Add TeamCalendar here again */}
        <TeamCalendar />

        {showForm && (
          <div style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}>
            <div style={{ position: "relative", background: "white", padding: "1rem", borderRadius: "10px" }}>
              <button
                style={{ position: "absolute", top: 5, right: 10, cursor: "pointer" }}
                onClick={() => setShowForm(false)}
              >
                ❌
              </button>
              <HolidayForm />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default EmployeeCalendar;