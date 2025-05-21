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
  const [editEmpId, setEditEmpId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Employee>>({});

  useEffect(() => {
    const fetchAllEmployees = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/users/");
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch employees");
        }
        setEmployees(data);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchAllEmployees();
  }, []);

  const handleEditClick = (emp: Employee) => {
    setEditEmpId(emp.emp_id);
    setEditForm({
      name: emp.name,
      age: emp.age,
      email_id: emp.email_id,
      dept_id: emp.dept_id,
      role_id: emp.role_id,
      manager_id: emp.manager_id,
      hr_id: emp.hr_id,
      dir_id: emp.dir_id,
      address: emp.address,
      phno: emp.phno,
    });
  };
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: ["age", "dept_id", "role_id", "manager_id", "hr_id", "dir_id"].includes(name) ? Number(value) : value,
    }));
  };
  
  const handleEditSubmit = async (emp_id: number) => {
    try {
      console.log(JSON.stringify(editForm));
      const response = await fetch(`http://localhost:3000/api/users/editData/${editEmpId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update employee.");
      }

      // Update UI
      const updatedEmployees = employees.map((emp) =>
        emp.emp_id === emp_id ? { ...emp, ...editForm } : emp
      );
      setEmployees(updatedEmployees);
      setEditEmpId(null);
      alert("Employee updated successfully.");
    } catch (error: any) {
      alert("Update failed: " + error.message);
    }
  };

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
              <p><strong>ID:</strong> {emp.emp_id}</p>
              <p><strong>Email:</strong> {emp.email_id}</p>
              <p><strong>Phone:</strong> {emp.phno}</p>
              <p><strong>Department:</strong> {emp.department.dept_name}</p>
              <p><strong>Role:</strong> {emp.role.role_name}</p>

              <button onClick={() => handleEditClick(emp)}>Edit</button>

              {editEmpId !== null && (
              <div className="edit-overlay">
                <div className="edit-modal">
                  <h3>Edit Employee</h3>
                  <input name="name" placeholder="Name" value={editForm.name || ""} onChange={handleInputChange} />
                  <input name="age" type="number" placeholder="Age" value={editForm.age || ""} onChange={handleInputChange} />
                  <input name="email_id" placeholder="Email" value={editForm.email_id || ""} onChange={handleInputChange} />
                  <input name="dept_id" type="number" placeholder="Department ID" value={editForm.dept_id || ""} onChange={handleInputChange} />
                  <input name="role_id" type="number" placeholder="Role ID" value={editForm.role_id || ""} onChange={handleInputChange} />
                  <input name="manager_id" type="number" placeholder="Manager ID" value={editForm.manager_id || ""} onChange={handleInputChange} />
                  <input name="hr_id" type="number" placeholder="HR ID" value={editForm.hr_id || ""} onChange={handleInputChange} />
                  <input name="dir_id" type="number" placeholder="Director ID" value={editForm.dir_id || ""} onChange={handleInputChange} />
                  <input name="address" placeholder="Address" value={editForm.address || ""} onChange={handleInputChange} />
                  <input name="phno" placeholder="Phone" value={editForm.phno || ""} onChange={handleInputChange} />
                  <div className="edit-buttons">
                    <button onClick={() => handleEditSubmit(editEmpId)}>Save</button>
                    <button onClick={() => setEditEmpId(null)}>Cancel</button>
                  </div>
                </div>
              </div>
            )}

            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AllEmployees;