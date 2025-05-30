import React, { useState } from "react";

const HolidayForm = () => {
  const [date, setDate] = useState("");
  const [fest, setFest] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("http://localhost:3000/api/holiday/create", {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date:date, fest:fest }),
    });

    if (res.ok) {
      setMessage("Holiday added successfully!");
      setDate("");
      setFest("");
    } else {
      setMessage("Error adding holiday");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto", padding: "1rem", border: "1px solid #ccc", borderRadius: "10px" }}>
      <h3 style={{ textAlign: "center", color:'#3498db'}}>Add Holiday</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Date:</label><br />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div>
          <label>Festival Name:</label><br />
          <input type="text" value={fest} onChange={(e) => setFest(e.target.value)} required />
        </div>
        <button type="submit" style={{ marginTop: "1rem",padding:'5px', borderRadius:'8px', backgroundColor:'#3498db', color:'white' }}>Add Holiday</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default HolidayForm;
