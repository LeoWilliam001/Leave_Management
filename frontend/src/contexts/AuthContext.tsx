import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import type {ReactNode} from 'react';
// Define the interfaces based on your existing code
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
  // These should ideally be populated by your backend API if they exist
  manager?: Employee | null; // Manager as an Employee object
  hr?: Employee | null;     // HR as an Employee object
  department: Department; // Full department object
  role: Role;             // Full role object
}

// Define the shape of your context value
interface AuthContextType {
  user: Employee | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email_id: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

// Create the Context with a default null value
const AuthContext = createContext<AuthContextType | null>(null);

// AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Employee | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // To manage initial loading state

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    console.log('Logged out');
  }, []);

  // Function to handle login API call and update state
  const login = useCallback(async (credentials: { email_id: string; password: string }) => {
    setIsLoading(true); // Start loading when attempting login
    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        // Assuming data.user.user is the full Employee object
        const receivedUser: Employee = data.user.user;
        const receivedToken: string = data.user.token;

        setUser(receivedUser);
        setToken(receivedToken);
        setIsAuthenticated(true);

        // Persist data in local storage
        localStorage.setItem('user', JSON.stringify(receivedUser));
        localStorage.setItem('token', receivedToken);
        console.log('Login successful:', receivedUser);
        return { success: true };
      } else {
        console.error('Login failed:', data.message || 'Unknown error');
        logout(); // Clear any potential lingering data if login failed
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error: any) {
      console.error('Error during login:', error);
      logout();
      return { success: false, message: error.message || 'Network error' };
    } finally {
      setIsLoading(false); // End loading regardless of success/failure
    }
  }, [logout]);

  // Effect to check local storage on initial load for persisted session
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      try {
        const parsedUser: Employee = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        setIsAuthenticated(true);
        console.log('Session restored from local storage for:', parsedUser.name);
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        logout(); // Clear potentially corrupted data
      }
    }
    setIsLoading(false); // Set loading to false once initial check is done
  }, [logout]);

  const contextValue: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily consume the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};