import { Request, Response } from 'express';
import { EmpService } from '../services/emp.service';
import { Employee } from '../entities/Employee.entity';

  const empService:EmpService = new EmpService();

  // Create a new employee (HR-only)
  export const createEmployee=async(req: Request, res: Response)=> {
    try {
      // 1. Check if the requesting user is HR
      const requestingUser = req.emp; 
      console.log("User requested : "+JSON.stringify(requestingUser));
      if (requestingUser.role !== 2 && requestingUser.role!==6) {
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
  

  export const editEmpData = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updateData: Partial<Employee> = req.body;
  
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid employee ID" });
      }
  
      const existingEmployee = await empService.getEmployeeById(id);
      if (!existingEmployee) {
        return res.status(404).json({ error: "Employee not found" });
      }
  
      const updatedEmployee = await empService.editEmpData(id, updateData);
      if (!updatedEmployee) {
        return res.status(500).json({ error: "Failed to update employee" });
      }
  
      res.status(200).json(updatedEmployee);
    } catch (error) {
      console.error("Error patching employee:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  
  export const getRole = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const roleName = await empService.getRoleNameByEmpId(Number(id));
      res.json({ role: roleName });
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: err instanceof Error ? err.message : err });
    }
  };

  export const getReportees = async (req: Request, res: Response) => {
    const empId = parseInt(req.params.empId);
  
    if (isNaN(empId)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }
  
    try {
      const reportees = await empService.getReportees(empId);
      res.status(200).json(reportees);
    } catch (error) {
      console.error("Error fetching reportees:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  export const getisDir = async (req: Request, res: Response) => {
    const empId = parseInt(req.params.empId);
  
    if (isNaN(empId)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }
  
    try {
      const reportees = await empService.isDirById(empId);
      res.status(200).json(reportees);
    } catch (error) {
      console.error("Error fetching reportees:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

