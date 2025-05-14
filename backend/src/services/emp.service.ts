import { AppDataSource } from '../data-source';
import { Employee } from '../entities/Employee.entity';
import { FindOptionsWhere } from 'typeorm';

export class EmpService {
  private employeeRepo = AppDataSource.getRepository(Employee);

  async createEmployee(data: Partial<Employee>) {
    const employee = this.employeeRepo.create(data);
    return await this.employeeRepo.save(employee);
  }

  // Get all employees (with optional filtering)
  async getAllEmployees(filters?: FindOptionsWhere<Employee>) {
    return await this.employeeRepo.find({
      where: filters, // Optional filters e.g., { department: 'IT' }
      order: { name: 'ASC' } // Default sorting
    });
  }

  // Get employee by ID (strict check)
  async getEmployeeById(emp_id: number) {
    return await this.employeeRepo.findOne({
      where: { emp_id },
      relations: ['department'] // Optional: Load relationships
    });
  }

  
}