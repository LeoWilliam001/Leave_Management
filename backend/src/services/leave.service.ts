import { AppDataSource } from "../data-source";
import { LeaveRequest } from "../entities/LeaveRequest.entity";
import { Employee } from "../entities/Employee.entity";
import { ApprovalStatus, LeaveStatus } from "../entities/LeaveRequest.entity";
import { In } from "typeorm"; // Import the In operator
import { LeaveType } from "../entities/LeaveType.entity";

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
    if (employee.dir_id !== null && data.num_days<=4) {
      data.dir_approval = ApprovalStatus.NotRequired;
    }
    else if(employee.dir_id !== null && data.num_days>4)
    {
      data.dir_approval=ApprovalStatus.Pending;
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
      relations: ["employee","leaveType"], 
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
      where: { emp_id: In(employeeIds), manager_approval: In([ApprovalStatus.Pending]) },
      relations: ["employee", "leaveType"],
    });
  }

  async getLeaveRequestsByDirector(manager_id: number) {
    const employees = await this.employeeRepo.find({
      where: { dir_id:manager_id },
    });

    if (!employees.length) {
      return [];
    }

    const employeeIds = employees.map((emp) => emp.emp_id);

    return await this.leaveRequestRepo.find({
      where: { emp_id: In(employeeIds), 
        manager_approval: In([ApprovalStatus.Approved, ApprovalStatus.NotRequired]), 
        hr_approval: In([ApprovalStatus.Approved, ApprovalStatus.NotRequired]),
        dir_approval: In([ApprovalStatus.Pending]) },
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

    const employeeIds = employees.map((emp) => emp.emp_id);
  
    return await this.leaveRequestRepo.find({
      where: {
        emp_id: In(employeeIds),
        manager_approval: In([ApprovalStatus.Approved, ApprovalStatus.NotRequired]), 
        hr_approval: In([ApprovalStatus.Pending])
      },
      relations: ["employee", "leaveType"],
    });
  }


  async getTeamLeaveById(id: number) {
    const employeeRepo = AppDataSource.getRepository(Employee);
    const leaveRepo = AppDataSource.getRepository(LeaveRequest);
    const employee = await employeeRepo.findOne({ where: { emp_id: id } });
  
    const whereConditions = [];
  
    // Always include `id` in every `In` check
    whereConditions.push({
      manager_id: In(employee?.manager_id != null ? [id, employee.manager_id] : [id]),
    });
  
    whereConditions.push({
      hr_id: In(employee?.hr_id != null ? [id, employee.hr_id] : [id]),
    });
  
    whereConditions.push({
      dir_id: In(employee?.dir_id != null ? [id, employee.dir_id] : [id]),
    });
  
    // Always include self by emp_id
    whereConditions.push({ emp_id: id });
  
    const teamMembers = await employeeRepo.find({
      where: whereConditions,
    });
  
    if (!teamMembers.length) {
      return [];
    }
  
    const memberIds = teamMembers.map(member => member.emp_id);
    console.log(memberIds);
    const today=new Date();
    const leaveRequests = await leaveRepo.createQueryBuilder("leave")
    .where("leave.emp_id IN (:...memberIds)", { memberIds })
    .andWhere(":today BETWEEN leave.start_date AND leave.end_date", { today })
    .leftJoinAndSelect("leave.employee", "employee") 
    .getMany();

    console.log(leaveRequests);
  
    return leaveRequests;
  }

  async isClashing(id: number, sdate:Date, edate:Date)
  {
    const approvedLeaves=await this.leaveRequestRepo.find({where:{emp_id:id, status:LeaveStatus.Approved}});

    if(approvedLeaves.length==0)
    {
      return 1;
    }
    console.log(approvedLeaves);
    for(const leave of approvedLeaves)
    {
      const startDate=new Date(leave.start_date);
      const endDate =new Date(leave.end_date);
      console.log(startDate+":"+endDate);
      console.log(new Date(sdate)+":"+new Date(edate));
      const isOverlap= new Date(sdate)<=endDate && new Date(edate)>=startDate;
      console.log("Is overlap : "+isOverlap);
      if(isOverlap)
      {
        return 0;
      }
      return 1;
    }
  }

}