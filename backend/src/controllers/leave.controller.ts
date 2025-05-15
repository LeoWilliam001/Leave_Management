// backend/src/controllers/leave.controller.ts
import { Request, Response } from "express";
import { LeaveService } from "../services/leave.service";
import { AppDataSource } from "../data-source";
import { ApprovalStatus, LeaveRequest, LeaveStatus } from "../entities/LeaveRequest.entity";

const leaveService = new LeaveService();

export const createLeaveRequest = async (req: Request, res: Response) => {
  try {
    const savedLeaveRequest = await leaveService.createLeaveRequest(req.body);
    res.status(201).json(savedLeaveRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Failed to save leave request" });
  }
};

export const getAllLeaveRequests = async (req: Request, res: Response) => {
  try {
    const leaveRequests = await leaveService.getAllLeaveRequests();
    res.status(200).json(leaveRequests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch leave requests" });
  }
};

export const getLeaveRequestById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const leaveRequest = await leaveService.getLeaveRequestById(Number(id));
    if (!leaveRequest) {
      return res.status(404).json({ message: "Leave request not found" });
    }
    res.status(200).json(leaveRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch leave request" });
  }
};

export const getLeaveRequestsByManager = async (req: Request, res: Response) => {
    try {
      const { manager_id } = req.params;
      const leaveRequests = await leaveService.getLeaveRequestsByManager(Number(manager_id));
      res.status(200).json(leaveRequests);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch leave requests for manager" });
    }
  };

  // There is some errors here. fix it using postman
  export const getLeaveRequestsByHR = async (req: Request, res: Response) => {
    try {
      const { hr_id } = req.params;
      const leaveRequests = await leaveService.getLeaveRequestsByHr(Number(hr_id));
      res.status(200).json(leaveRequests);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch leave requests for HR" });
    }
  };

// backend/src/controllers/leave.controller.ts
export const approveLeaveRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Leave request ID
    const { approver_id, action } = req.body; // Approver ID and action (approve/reject)

    console.log("Approver id : "+approver_id);
    console.log("Action :"+action);
    const leaveRequestRepo = AppDataSource.getRepository(LeaveRequest);
    const leaveRequest = await leaveRequestRepo.findOne({
      where: { lr_id: Number(id) },
      relations: ["employee"], // Fetch the related employee details
    });

    if (!leaveRequest) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    const employ = JSON.stringify(leaveRequest.employee);
    const employee = leaveRequest.employee;
    console.log("This is the employee : "+employ);
    console.log("Manager id : "+employee.manager_id);
    console.log("HR id : "+employee.hr_id);
    console.log("Approver_id : "+approver_id)
    
    // Check if the approver is the manager
    if (Number(approver_id) === Number(employee.manager_id)) {
      console.log("Inside first approval");
      if (leaveRequest.manager_approval !== ApprovalStatus.Pending) {
        return res.status(400).json({ message: "Manager has already approved/rejected this request" });
      }
      leaveRequest.manager_approval = action === "approve" ? ApprovalStatus.Approved : ApprovalStatus.Rejected;
    }
    // Check if the approver is the HR
    else if (Number(approver_id) === Number(employee.hr_id)) {
      console.log("Inside second approval");
      if(leaveRequest.manager_approval !== ApprovalStatus.Approved)
      {
        console.log("Manager did not approve this request yet");
        return res.status(400).json({ message: "Manager did not approve this request yet" });
      }
      else if (leaveRequest.hr_approval !== ApprovalStatus.Pending) {
        return res.status(400).json({ message: "HR has already approved/rejected this request" });
      }
      leaveRequest.hr_approval = action === "approve" ? ApprovalStatus.Approved : ApprovalStatus.Rejected;
    } 
    
    else {
      return res.status(403).json({ message: "You are not authorized to approve/reject this leave request" });
    }

    // Update the overall status if all approvals are completed
    if (
      leaveRequest.manager_approval === ApprovalStatus.Approved &&
      (leaveRequest.hr_approval === ApprovalStatus.Approved || leaveRequest.hr_approval === ApprovalStatus.NotRequired) &&
      (leaveRequest.dir_approval === ApprovalStatus.Approved || leaveRequest.dir_approval === ApprovalStatus.NotRequired)
    ) {
      console.log("Inside third approval");
      leaveRequest.status = LeaveStatus.Approved;
    }

    const updatedLeaveRequest = await leaveRequestRepo.save(leaveRequest);
    res.status(200).json(updatedLeaveRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to approve/reject leave request" });
  }
};