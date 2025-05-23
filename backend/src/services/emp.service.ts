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
      relations:{department:true,role:true,manager:true,hr:true},
      order: { name: 'ASC' } // Default sorting
    });
  }

  // Get employee by ID (strict check)
  async getEmployeeById(emp_id: number) {
    console.log(emp_id);
    const empRepo = AppDataSource.getRepository(Employee);
    return await empRepo.findOne({
      where: { emp_id }
    });
  }
  

  async updateEmployeePassword(empId: number, rawPassword: string): Promise<boolean> {
    const employee = await this.employeeRepo.findOne({ where: { emp_id: empId } });
    if (!employee) return false;
  
    employee.password = rawPassword;
    await this.employeeRepo.save(employee);
    return true;
  }
  

  async editEmpData(id: number, updateData: Partial<Employee>): Promise<Employee | null> {
    const employee = await this.employeeRepo.findOne({ where: { emp_id: id } });
    if (!employee) return null;
  
    Object.assign(employee, updateData);
    return await this.employeeRepo.save(employee);
  }

  async getRoleNameByEmpId(empId: number) {
    const empRepo = AppDataSource.getRepository(Employee);
    const employee = await empRepo.findOne({
      where: { emp_id: empId },
      relations: ["role"],
    });

    if (!employee) throw new Error("Employee not found");
    return employee.role.role_name;
  }

  async getReportees(empId: number)
  {
    const reportees = await this.employeeRepo.find({
      where: [
        { manager_id: empId },
        { dir_id: empId }
      ]
    });

    if(!reportees)
      return null;
    return reportees;
  }

  async isDirById(empId:number)
  {
    const reportees=await this.employeeRepo.find({
      where:{dir_id:empId}
    })
    if(!reportees)
      return null;
    return reportees;
  }

}