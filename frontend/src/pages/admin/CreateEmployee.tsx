import React, { useState } from "react";
import Sidebar from "./AdminSideBar";
import "../../styles/CreateEmp.css"
import { useNavigate } from "react-router-dom";

const CreateEmp: React.FC = () => {
  const navigate=useNavigate();
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

      console.log(JSON.stringify(formData));

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
      <div className="sidebar">
        <Sidebar />
      </div>
      <div className="content">
        <h2>Create Employee</h2>
        <form onSubmit={handleSubmit}>
          <input name="name" placeholder="Name" onChange={handleChange} required />
          <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
          <input name="age" type="number" placeholder="Age" onChange={handleChange} required />
          <input name="email_id" type="email" placeholder="Email" onChange={handleChange} required />
          <input name="dept_id" type="number" placeholder="Department ID" onChange={handleChange} required />
          <input name="role_id" type="number" placeholder="Role ID" onChange={handleChange} required />
          <input name="manager_id" type="number" placeholder="Manager ID" onChange={handleChange} />
          <input name="hr_id" type="number" placeholder="HR ID" onChange={handleChange} />
          <input name="dir_id" type="number" placeholder="Director ID" onChange={handleChange} />
          <input name="address" placeholder="Address" onChange={handleChange} required />
          <input name="phno" placeholder="Phone Number" onChange={handleChange} required />
          <button type="submit">Create</button>
        </form>
      </div>
    </div>
  );
};

export default CreateEmp;
