import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext"; // Import AuthProvider
import LoginPage from "./pages/auth/LoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import EmployeeDashboard from "./pages/employee/EmpDashboard";
import PrivateRoute from "./components/PrivateRoute";
import ApplyLeave from "./pages/employee/ApplyLeave";
import LeaveRequest from "./pages/leave/LeaveRequest";
import HRLeaveRequests from "./pages/hr/HRLeaveRequest";
import LeaveStatus from "./pages/employee/LeaveStatus";
import AllEmployees from "./pages/admin/ViewEmployees";
import CreateEmp from "./pages/admin/CreateEmployee";
import EmployeeCalendar from "./pages/employee/EmployeeCalendar";
import HolidayForm from "./pages/admin/CreateHoliday";

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider> {/* Wrap your entire application with AuthProvider */}
        <Routes>
          <Route path="/" element={<LoginPage />} /> {/* Login page is now public */}

          <Route
            path="/admin_dash"
            element={
              <PrivateRoute allowedRoles={[1, 2, 6]}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route path="/dashboard"
            element={
              <PrivateRoute allowedRoles={[3, 4, 5]}>
                <EmployeeDashboard />
              </PrivateRoute>
            }
          />

          <Route path="/applyleave"
            element={
              <PrivateRoute allowedRoles={[2, 3, 4, 6, 5]}>
                <ApplyLeave onClose={() => { /* Function not implemented. */ }} />
              </PrivateRoute>
            }
          />

          <Route path="/leavereq"
            element={
              <PrivateRoute allowedRoles={[3, 4, 5]}>
                <LeaveRequest />
              </PrivateRoute>
            }
          />

          <Route path="/hr/leaverequests"
            element={
              <PrivateRoute allowedRoles={[1, 2, 6]}>
                <HRLeaveRequests />
              </PrivateRoute>
            }
          />

          <Route path="/myleavestatus"
            element={
              <PrivateRoute allowedRoles={[3, 4, 5, 2, 6]}>
                <LeaveStatus />
              </PrivateRoute>
            }
          />

          <Route path="/hr/viewemployees"
            element={
              <PrivateRoute allowedRoles={[1, 2, 6]}>
                <AllEmployees />
              </PrivateRoute>
            }
          />

          <Route path="/hr/createemployees"
            element={
              <PrivateRoute allowedRoles={[1, 2, 6]}>
                <CreateEmp />
              </PrivateRoute>
            }
          />

          <Route path="/calendar"
            element={
              <PrivateRoute allowedRoles={[1, 2, 3, 4, 5, 6]}>
                <EmployeeCalendar />
              </PrivateRoute>
            }
          />

          <Route path="/holiday/edit"
            element={
              <PrivateRoute allowedRoles={[1, 2, 6]}>
                <HolidayForm />
              </PrivateRoute>
            }
          />

          {/* Redirect any unmatched routes to the login page if not authenticated */}
          <Route path="*" element={<PrivateRoute><LoginPage /></PrivateRoute>} />

        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;