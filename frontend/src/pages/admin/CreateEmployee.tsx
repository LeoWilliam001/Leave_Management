import React, { useState } from "react";
import Sidebar from "./AdminSideBar";
import "../../styles/CreateEmp.css";
import { useNavigate } from "react-router-dom";

const CreateEmp: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    age: 0,
    email_id: "",
    dept_id: 0,
    role_id: 0,
    manager_id: null,
    hr_id: null,
    dir_id: null,
    address: "",
    phno: ""
  });

  const token = localStorage.getItem("token");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "age" || ["dept_id", "role_id", "manager_id", "hr_id", "dir_id"].includes(name)
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/api/users/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error creating employee");
      alert("Employee created successfully!");

      navigate("/admin_dash");
    } catch (err: any) {
      alert("Failed: " + err.message);
    }
  };

  return (
    <div className="container">
      <Sidebar />
      <div className="content">
        <div className="card">
          <button
            onClick={() => navigate("/admin_dash")}
            className="close-button"
            title="Close"
          >
            &times;
          </button>
  
          <h2 style={{ color: '#3498db' }}>Create Employee</h2>
          <form onSubmit={handleSubmit} className="create-emp-form">
            <div>
              <label>Name</label>
              <input name="name" onChange={handleChange} required />
            </div>
            <div>
              <label>Password</label>
              <input name="password" type="password" onChange={handleChange} required />
            </div>
            <div>
              <label>Age</label>
              <input name="age" type="number" onChange={handleChange} required />
            </div>
            <div>
              <label>Email</label>
              <input name="email_id" type="email" onChange={handleChange} required />
            </div>
            <div>
              <label>Department ID</label>
              <input name="dept_id" type="number" onChange={handleChange} required />
            </div>
            <div>
              <label>Role ID</label>
              <input name="role_id" type="number" onChange={handleChange} required />
            </div>
            <div>
              <label>Manager ID</label>
              <input name="manager_id" type="number" onChange={handleChange} />
            </div>
            <div>
              <label>HR ID</label>
              <input name="hr_id" type="number" onChange={handleChange} />
            </div>
            <div>
              <label>Director ID</label>
              <input name="dir_id" type="number" onChange={handleChange} />
            </div>
            <div>
              <label>Address</label>
              <input name="address" onChange={handleChange} required />
            </div>
            <div>
              <label>Phone Number</label>
              <input name="phno" onChange={handleChange} required />
            </div>
            <div className="form-actions">
              <button type="submit" className="submit-button" style={{ backgroundColor: '#3498db' }}>
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );  
};

export default CreateEmp;