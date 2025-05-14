import { Request, Response } from 'express';
import { EmpService } from '../services/emp.service';
import { Employee } from '../entities/Employee.entity';

export class EmployeeController {
  private empService:EmpService = new EmpService();

  // Create a new employee (HR-only)
  async createEmployee(req: Request, res: Response) {
    try {
      // 1. Check if the requesting user is HR
      const requestingUser = req.emp; // Assuming JWT/auth middleware attaches the user
      if (requestingUser.role !== 2) {
        return res.status(403).json({ error: "Only HR can create employees" });
      }

      // 2. Proceed if user is HR
      console.log("Header:",req.headers);
      console.log("Incoming body:", req.body);
      const employeeData: Partial<Employee> = req.body;
      const newEmployee = await this.empService.createEmployee(employeeData);
      res.status(201).json(newEmployee);

    } catch (error) {
        console.error("Error creating employee:", error);
        res.status(500).json({ error: "Failed to create employee" });
    }
  }

  // Updated controller methods to use the service
async getAllEmployees(req: Request, res: Response) {
    try {
      const filters = req.query; // e.g., ?department=HR
      const employees = await this.empService.getAllEmployees(filters);
      res.status(200).json(employees);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employees" });
    }
  }
  
  async getEmployeeById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const employee = await this.empService.getEmployeeById(id);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.status(200).json(employee);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employee" });
    }
  }
}