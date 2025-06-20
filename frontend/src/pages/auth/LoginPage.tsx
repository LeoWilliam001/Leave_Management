import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../../styles/Login.css';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const { login, isAuthenticated, user, isLoading } = useAuth(); // Get login function and auth state
  const navigate = useNavigate();

  useEffect(() => {
    // If authenticated and user data is available, redirect based on role
    if (isAuthenticated && user) {
      if (user.role.role_id === 1 || user.role.role_id === 2 || user.role.role_id === 6) {
        navigate("/admin_dash", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]); // Depend on isAuthenticated and user

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isLoading) return; // Prevent multiple submissions while loading

    const result = await login({ email_id: email, password: pass }); // Use the login from context

    if (!result.success) {
      setError(result.message || "Login failed. Please check your credentials.");
    }
    // No need to navigate here, the useEffect above will handle redirection on success
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2 className="login-title">Login</h2>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

          <label className="pass">Password</label>
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} />

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Logging In...' : 'Login'}
          </button>
          {error && <p style={{ color: "red" }}>{error}</p>}
          {/* No token display needed here, as context handles it */}
        </div>
      </form>
    </div>
  );
};

export default LoginForm;