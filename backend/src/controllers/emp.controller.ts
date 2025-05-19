import { Request, Response } from 'express';
import { EmpService } from '../services/emp.service';
import { Employee } from '../entities/Employee.entity';

  const empService:EmpService = new EmpService();

  // Create a new employee (HR-only)
  export const createEmployee=async(req: Request, res: Response)=> {
    try {
      // 1. Check if the requesting user is HR
      const requestingUser = req.emp; 
      if (requestingUser.role !== 2) {
        return res.status(403).json({ error: "Only HR can create employees" });
      }

      // 2. Proceed if user is HR
      console.log("Header:",req.headers);
      console.log("Incoming body:", req.body);
      const employeeData: Partial<Employee> = req.body;
      const newEmployee = await empService.createEmployee(employeeData);
      res.status(201).json(newEmployee);

    } catch (error) {
        console.error("Error creating employee:", error);
        res.status(500).json({ error: "Failed to create employee" });
    }
  }


  export const getAllEmployees=async(req: Request, res: Response)=> {
    try {
      const filters = req.query; 
      const employees = await empService.getAllEmployees(filters);
      res.status(200).json(employees);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employees" });
    }
  }
  
  export const getEmployeeById=async(req: Request, res: Response) =>{
    try {
      const id = parseInt(req.params.id);
      console.log(id);
      const employee = await empService.getEmployeeById(Number(id));
      console.log(id);
      console.log(employee);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.status(200).json(employee);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch employee" });
    }
  }

  export const editEmpPassword = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { existingPassword, newPassword } = req.body;
  
      if (!existingPassword || !newPassword || isNaN(id)) {
        return res.status(400).json({ error: "Both existing and new passwords are required." });
      }
  
      const employee = await empService.getEmployeeById(id); // You’ll add this
      if (!employee) {
        return res.status(404).json({ error: "Employee not found." });
      }
  
      if (employee.password !== existingPassword) {
        return res.status(401).json({ error: "Existing password is incorrect." });
      }
  
      const updated = await empService.updateEmployeePassword(id, newPassword);
      if (!updated) {
        return res.status(500).json({ error: "Failed to update password." });
      }
  
      res.status(200).json({ message: "Password updated successfully." });
    } catch (err) {
      console.error("Error updating password:", err);
      res.status(500).json({ error: "Internal server error." });
    }
  };
  