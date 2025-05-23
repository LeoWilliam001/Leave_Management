import React, { useEffect, useState } from "react";
import Sidebar from "./AdminSideBar";
import "../../styles/AllEmployees.css";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [editEmpId, setEditEmpId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Employee>>({});
  const [isLoading, setIsLoading] = useState(true);
  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  

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
      } finally {
        setIsLoading(false);
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
      [name]: ["age", "dept_id", "role_id", "manager_id", "hr_id", "dir_id"].includes(name) 
        ? Number(value) 
        : value,
    }));
  };
  
  const handleEditSubmit = async (emp_id: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/users/editData/${editEmpId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update employee.");
      }

      setEmployees(employees.map(emp => 
        emp.emp_id === emp_id ? { ...emp, ...editForm } : emp
      ));
      setEditEmpId(null);
      alert("Employee updated successfully.");
    } catch (error: any) {
      alert("Update failed: " + error.message);
    }
  };

  if (isLoading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <main className="dashboard-main">
        <div className="header-section">
          <h2>Employee Directory</h2>
          <div className="stats-summary">
            <div className="stat-card">
              <span>{employees.length}</span>
              <p>Total Employees</p>
            </div>
            <div className="stat-card">
              <span>{new Set(employees.map(e => e.department.dept_name)).size}</span>
              <p>Departments</p>
            </div>
          </div>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>


        <div className="employee-grid">
          {filteredEmployees.map((emp) => (
            <div key={emp.emp_id} className="employee-card">
              <div className="employee-avatar">
                {emp.name.charAt(0).toUpperCase()}
              </div>
              <div className="employee-info">
                <h3>{emp.name}</h3>
                <p className="employee-title">{emp.role.role_name}</p>
                <div className="employeedetails">
                  <p>
                    <span className="detail-label">Department:</span>
                    <span>{emp.department.dept_name}</span>
                  </p>
                  <p>
                    <span className="detail-label">Email:</span>
                    <span>{emp.email_id}</span>
                  </p>
                  <p>
                    <span className="detail-label">Phone:</span>
                    <span>{emp.phno}</span>
                  </p>
                </div>
              </div>
              <button 
                className="edit-button"
                onClick={() => handleEditClick(emp)}
              >
                Edit Profile
              </button>
            </div>
          ))}
        </div>

        {editEmpId && (
          <div className="edit-overlay">
            <div className="edit-modal">
              <div className="modal-header">
                <h3>Edit Employee</h3>
                <button 
                  className="close-button"
                  onClick={() => setEditEmpId(null)}
                >
                  &times;
                </button>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    name="name" 
                    value={editForm.name || ""} 
                    onChange={handleInputChange} 
                  />
                </div>
                
                <div className="form-group">
                  <label>Age</label>
                  <input 
                    name="age" 
                    type="number" 
                    value={editForm.age || ""} 
                    onChange={handleInputChange} 
                  />
                </div>
                
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    name="email_id" 
                    type="email" 
                    value={editForm.email_id || ""} 
                    onChange={handleInputChange} 
                  />
                </div>
                
                <div className="form-group">
                  <label>Phone</label>
                  <input 
                    name="phno" 
                    value={editForm.phno || ""} 
                    onChange={handleInputChange} 
                  />
                </div>
                
                <div className="form-group">
                  <label>Department ID</label>
                  <input 
                    name="dept_id" 
                    type="number" 
                    value={editForm.dept_id || ""} 
                    onChange={handleInputChange} 
                  />
                </div>
                
                <div className="form-group">
                  <label>Role ID</label>
                  <input 
                    name="role_id" 
                    type="number" 
                    value={editForm.role_id || ""} 
                    onChange={handleInputChange} 
                  />
                </div>
                
                <div className="form-group">
                  <label>Manager ID</label>
                  <input 
                    name="manager_id" 
                    type="number" 
                    value={editForm.manager_id || ""} 
                    onChange={handleInputChange} 
                  />
                </div>
                
                <div className="form-group">
                  <label>Address</label>
                  <input 
                    name="address" 
                    value={editForm.address || ""} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="save-button"
                  onClick={() => handleEditSubmit(editEmpId)}
                >
                  Save Changes
                </button>
                <button 
                  className="cancel-button"
                  onClick={() => setEditEmpId(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AllEmployees;