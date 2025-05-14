import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../../styles/Login.css';


const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const navigate=useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email_id: email, password: pass }),
      });

      console.log(email);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }
      console.log(data);
      setToken(data.user.token);
      localStorage.setItem("token", data.user.token); 
      localStorage.setItem("role",data.user.user.role_id);
      alert("Login successful!");
      if (data.user.user.role_id === 1 || data.user.user.role_id === 2) {
        navigate("/admin_dash"); 
      } else {
        navigate("/dashboard"); 
      }
    } catch (err: any) {
      setError(err.message);
    }
  };
    return(
        <div className="login-container">
            <form onSubmit={handleLogin} className="login-form">
                <h2 className="login-title">Login</h2>
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)}/>

                    <label className="pass">Password</label>
                    <input type="password" value={pass} onChange={(e)=>setPass(e.target.value)}/>

                    <button type="submit" className="login-button">Login</button>
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    {token && <p style={{ color: "green" }}>Token received</p>}
                </div>
            </form>
        </div>
    )
}

export default LoginForm;