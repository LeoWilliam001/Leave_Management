import { AppDataSource } from '../data-source';
import { Employee } from '../entities/Employee.entity';
import { FindOptionsWhere } from 'typeorm';
import { LeaveType } from '../entities/LeaveType.entity';
import { LeaveBalance } from '../entities/LeaveBalance.entity';

export class EmpService {
  private employeeRepo = AppDataSource.getRepository(Employee);
  private leaveTypesRepo=AppDataSource.getRepository(LeaveType);
  private leaveBalRepo=AppDataSource.getRepository(LeaveBalance);

  async createEmployee(data: Partial<Employee>) {
    const employee = this.employeeRepo.create(data);
    const savedEmp = await this.employeeRepo.save(employee);

    const leaveTypes=await this.leaveTypesRepo.find();

    const leaveBals=leaveTypes.map((lt) => {
      return this.leaveBalRepo.create({
        emp_id: savedEmp.emp_id,
        leave_type_id: lt.lt_id,
        total_days: lt.days_allocated,
        bal_days: lt.days_allocated,
        lop_days: 0,
      });
    });

    await this.leaveBalRepo.save(leaveBals);

    return savedEmp;  
  }

  async getAllEmployees(filters?: FindOptionsWhere<Employee>) {
    return await this.employeeRepo.find({
      where: filters, // Optional filters e.g., { department: 'IT' }
      relations:{department:true,role:true,manager:true,hr:true},
      order: { name: 'ASC' } 
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