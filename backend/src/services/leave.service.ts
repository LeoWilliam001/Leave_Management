import { AppDataSource } from "../data-source";
import { LeaveRequest } from "../entities/LeaveRequest.entity";
import { Employee } from "../entities/Employee.entity";
import { ApprovalStatus } from "../entities/LeaveRequest.entity";
import { In } from "typeorm"; // Import the In operator

export class LeaveService {
  private leaveRequestRepo = AppDataSource.getRepository(LeaveRequest);
  private employeeRepo = AppDataSource.getRepository(Employee);

  // Create a new leave request
  async createLeaveRequest(data: Partial<LeaveRequest>) {
    console.log(data);
    const employee = await this.employeeRepo.findOne({
      where: { emp_id: data.emp_id },
    });

    if (!employee) {
      throw new Error("Employee not found");
    }

    if (employee.manager_id !== null) {
      data.manager_approval = ApprovalStatus.Pending;
    }
    if (employee.hr_id !== null) {
      data.hr_approval = ApprovalStatus.Pending;
    }
    if (employee.dir_id !== null) {
      data.dir_approval = ApprovalStatus.NotRequired;
    }

    const leaveRequest = this.leaveRequestRepo.create(data);
    return await this.leaveRequestRepo.save(leaveRequest);
  }

  // Get all leave requests
  async getAllLeaveRequests() {
    return await this.leaveRequestRepo.find({
      relations: ["employee", "leaveType"],
    });
  }

  // Get a leave request by ID
  async getLeaveRequestById(lr_id: number) {
    return await this.leaveRequestRepo.findOne({
      where: { lr_id },
      relations: ["employee", "leaveType"],
    });
  }

  //Get leave requests by employee id
  async getLeaveRequestsByEmpId(emp_id: number) {
    const leaveRequestRepo = AppDataSource.getRepository(LeaveRequest);
    return await leaveRequestRepo.find({
      where: { emp_id },
      relations: ["employee"], 
    });
  };


  // Get leave requests by manager
  async getLeaveRequestsByManager(manager_id: number) {
    const employees = await this.employeeRepo.find({
      where: { manager_id },
    });

    if (!employees.length) {
      return [];
    }

    const employeeIds = employees.map((emp) => emp.emp_id);

    return await this.leaveRequestRepo.find({
      where: { emp_id: In(employeeIds) },
      relations: ["employee", "leaveType"],
    });
  }

  async getLeaveRequestsByHr(hr_id: number) {
    // Fetch employees managed by the HR
    const employees = await this.employeeRepo.find({
      where: { hr_id },
    });
  
    if (!employees.length) {
      return [];
    }
  
    // Extract employee IDs
    const employeeIds = employees.map((emp) => emp.emp_id);
  
    // Fetch leave requests where manager approval is either Approved or NotRequired
    return await this.leaveRequestRepo.find({
      where: {
        emp_id: In(employeeIds),
        manager_approval: In([ApprovalStatus.Approved, ApprovalStatus.NotRequired]), 
        hr_approval: In([ApprovalStatus.Pending])// Add condition for manager approval
      },
      relations: ["employee", "leaveType"],
    });
  }
}