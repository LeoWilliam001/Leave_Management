import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer, type View } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "../../styles/BigCalendar.css";
import Sidebar from "../employee/EmpSideBar";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
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
  

  useEffect(() => {
    const fetchData = async () => {
      const leaveRes = await fetch("http://localhost:3000/api/leave/emp/4");
      const allLeaves = await leaveRes.json();
      const approvedLeaves = allLeaves.filter((leave: any) => leave.status === "Approved");
  
      const holidayRes = await fetch("http://localhost:3000/api/leave/emp/holidays");
      const holidayData = await holidayRes.json();
  
      // Generate week offs for current month
      const generateWeekendEvents = (year: number): Event[] => {
        const weekends: Event[] = [];
        const d = new Date(year, 0, 1); // Jan 1
      
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
      
  
      // Exclude leaves on weekends
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
  }, []);
  

  const eventStyleGetter = (event: Event) => {
    let backgroundColor = "#3174ad"; // default
    if (event.title === "Week Off") backgroundColor = "#d1fae5"; // light green
    else if (event.type === "leave") backgroundColor = "#fca5a5"; // red
    else if (event.type === "holiday") backgroundColor = "#fcd34d"; // yellow
  
    return {
      style: {
        backgroundColor,
        borderRadius: "6px",
        color: "#000",
        border: "0px",
        display: "block",
        fontWeight: "bold",
      },
    };
  };
  

  return (
    <>
        <Sidebar/>
        <div className="calendar-container">
        <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>Employee Leave Calendar</h3>
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

        </div>
    </>
  );
};

export default EmployeeCalendar;
