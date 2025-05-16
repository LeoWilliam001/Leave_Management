import React, { useEffect, useState } from "react";
import Sidebar from "./AdminSideBar"; // Sidebar component
import "../../styles/AllEmployees.css"; // CSS file for styling

interface Department {
  dept_id: number;
  dept_name: string;
}

interface Role {
  role_id: number;
  role_name: string;
}

interface Employee {
  emp_id: number;
  name: string;
  password: string;
  age: number;
  email_id: string;
  dept_id: number;
  role_id: number;
  manager_id: number | null;
  hr_id: number | null;
  dir_id: number | null;
  address: string;
  phno: string;
  department: Department;
  role: Role;
  manager: Employee | null;
  hr: Employee | null;
}


const AllEmployees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState("");
  let dat;

  useEffect(() => {
    const fetchAllEmployees = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/users/");
        const data = await response.json();
        console.log(data);
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch employees");
        }

        setEmployees(data);
        dat=data;
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchAllEmployees();
  }, []);

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <main className="dashboard-main">
        <h2>All Employees</h2>
        {error && <p className="error-message">{error}</p>}
        
        <div className="employee-card-container">
          {employees.map((emp) => (
            <div key={emp.emp_id} className="employee-card">
              <h3>{emp.name}</h3>
              <p><strong>Employee ID:</strong> {emp.emp_id}</p>
              <p><strong>Name:</strong> {emp.name}</p>
              <p><strong>Email:</strong> {emp.email_id}</p>
              <p><strong>Department:</strong> {emp.department.dept_name}</p>
              <p><strong>Role:</strong> {emp.role.role_name}</p>
              {/* <p><strong>Contact:</strong> {emp.contact}</p> */}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AllEmployees;
