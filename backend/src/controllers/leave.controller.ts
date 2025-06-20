// backend/src/controllers/leave.controller.ts
import { Request, Response } from "express";
import { LeaveService } from "../services/leave.service";
import { AppDataSource } from "../data-source";
import { ApprovalStatus, LeaveRequest, LeaveStatus } from "../entities/LeaveRequest.entity";
import { Holiday } from "../entities/Holiday.entity";
import { LeaveApp, ApprovalStatus as LAStatus } from "../entities/LeaveApproval.entity";
import { LeaveBalance } from "../entities/LeaveBalance.entity";

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
    res.status(500).json({ message: "Fail request" });
  }
};

export const getLeaveRequestByEmpId = async (req: Request, res: Response) => {
  try {
    const { emp_id } = req.params;
    console.log("Employee id: "+emp_id);
    const leaveRequest = await leaveService.getLeaveRequestsByEmpId(Number(emp_id));
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

  export const getLeaveRequestsByDirector = async (req: Request, res: Response) => {
    try {
      const { manager_id } = req.params;
      console.log(manager_id);
      const leaveRequests = await leaveService.getLeaveRequestsByDirector(Number(manager_id));
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


export const approveLeaveRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; 
    const { approver_id, action, rejection_reason} = req.body; 


    console.log("Approver id : "+approver_id);
    console.log("Action :"+action);
    const leaveRequestRepo = AppDataSource.getRepository(LeaveRequest);
    const leaveRequest = await leaveRequestRepo.findOne({
      where: { lr_id: Number(id) },
      relations: ["employee"], 
    });


    const leaveApprovalRepo = AppDataSource.getRepository(LeaveApp);
    
    if (!leaveRequest) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    const employ = JSON.stringify(leaveRequest.employee);
    const employee = leaveRequest.employee;
    
    const leaveApproval=await leaveApprovalRepo.findOne({
      where:{approver_id: approver_id, lr_id:leaveRequest.lr_id}
    });
    console.log(leaveApproval);

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
      leaveApproval.decision = action ==="approve" ? LAStatus.Approved : LAStatus.Rejected;
      leaveApproval.comment=action !=="approve" ? rejection_reason:"";
      leaveApproval.actionAt = new Date();
      leaveRequest.manager_approval = action === "approve" ? ApprovalStatus.Approved : ApprovalStatus.Rejected;
    }
    // Check if the approver is the HR
    else if (Number(approver_id) === Number(employee.hr_id)) {
      console.log("Inside second approval");
      if(leaveRequest.manager_approval !== ApprovalStatus.Approved && leaveRequest.manager_approval !== ApprovalStatus.NotRequired) 
      {
        console.log("Manager did not approve this request yet");
        return res.status(400).json({ message: "Manager did not approve this request yet" });
      }
      else if (leaveRequest.hr_approval !== ApprovalStatus.Pending) {
        return res.status(400).json({ message: "HR has already approved/rejected this request" });
      }
      leaveApproval.decision = action ==="approve" ? LAStatus.Approved : LAStatus.Rejected;
      leaveApproval.comment=action !=="approve" ? rejection_reason:"";
      leaveApproval.actionAt = new Date();
      leaveRequest.hr_approval = action === "approve" ? ApprovalStatus.Approved : ApprovalStatus.Rejected;
    } 

    // Check if the approver is the Director
    else if(Number(approver_id) === Number(employee.dir_id))
    {
      console.log("Inside third stage of approval");
      if(leaveRequest.manager_approval!==ApprovalStatus.Approved && leaveRequest.manager_approval!==ApprovalStatus.NotRequired
        && leaveRequest.hr_approval!==ApprovalStatus.Approved && leaveRequest.hr_approval!==ApprovalStatus.NotRequired)
      {
        console.log("Manager / HR did not approve this request yet");
        return res.status(400).json({ message: "Manager / HR did not approve this request yet" });
      }
      else if(leaveRequest.dir_approval !== ApprovalStatus.Pending)
      {
        return res.status(400).json({message: "Director has already approved this request"});
      }
      leaveApproval.decision = action ==="approve" ? LAStatus.Approved : LAStatus.Rejected;
      leaveApproval.comment=action !=="approve" ? rejection_reason:"";
      leaveApproval.actionAt = new Date();
      leaveRequest.dir_approval=action==="approve"? ApprovalStatus.Approved : ApprovalStatus.Rejected;
    }
    
    else {
      return res.status(403).json({ message: "You are not authorized to approve/reject this leave request" });
    }

    // Update the overall status if all approvals are completed
    if (
      (leaveRequest.manager_approval === ApprovalStatus.Approved || leaveRequest.manager_approval === ApprovalStatus.NotRequired)&&
      (leaveRequest.hr_approval === ApprovalStatus.Approved || leaveRequest.hr_approval === ApprovalStatus.NotRequired) &&
      (leaveRequest.dir_approval === ApprovalStatus.Approved || leaveRequest.dir_approval === ApprovalStatus.NotRequired)
    ) {
      console.log("Inside final approval");
      leaveRequest.status = LeaveStatus.Approved;
    }


    else if((leaveRequest.manager_approval === ApprovalStatus.Rejected)||(leaveRequest.hr_approval === ApprovalStatus.Rejected)||(leaveRequest.dir_approval === ApprovalStatus.Rejected))
    {
      leaveRequest.status = LeaveStatus.Rejected;
      const leaveBalRepo=AppDataSource.getRepository("LeaveBalance");
      const leaveBal=await leaveBalRepo.findOne({
        where:{
          emp_id:leaveRequest.emp_id,
          leave_type_id:leaveRequest.leave_type,
        }
      });

      
      console.log("Employee id: "+leaveRequest.emp_id);
      console.log("Levae Type id : "+leaveRequest.leave_type);
      console.log(leaveBal);

      if (!leaveBal) {
        return res.status(404).json({ message: "Leave balance not found for employee" });
      }
    
      // if (leaveBal.bal_days < leaveRequest.num_days) {
      //   return res.status(400).json({ message: "Insufficient leave balance" });
      // }
    
      leaveBal.bal_days += leaveRequest.num_days;
      await leaveBalRepo.save(leaveBal);
    }

    const updatedLeaveRequest = await leaveRequestRepo.save(leaveRequest);
    await leaveApprovalRepo.save(leaveApproval);
    res.status(200).json(updatedLeaveRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to approve/reject leave request" });
  }
};

export const getHolidays = async (req: Request, res: Response) => {
  try {
    const holidays = await AppDataSource.getRepository(Holiday).find();
    // console.log(holidays);
    res.status(200).json(holidays);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch holidays" });
  }
};



export const setCancelled=async(req:Request,res:Response)=>
{
    try{
      const id=parseInt(req.params.id,10);
      console.log("Raw body:", req.body);
      const {emp_id,leave_type_id, num_days, start_date, end_date}=req.body;
      console.log(emp_id+" "+leave_type_id+" "+num_days+" "+start_date+" "+end_date);
      if(isNaN(id))
      {
        return res.status(400).json({error:"Invalid ID"});
      }
      const lr_repo=AppDataSource.getRepository(LeaveRequest);
      const lr=await lr_repo.findOne({
        where:{lr_id:id}
      });
      const bal_repo=AppDataSource.getRepository(LeaveBalance);
      const bal=await bal_repo.findOne({
        where:{emp_id:emp_id,leave_type_id:leave_type_id}
      })

      if(lr.status===LeaveStatus.Pending || (lr.status==LeaveStatus.Approved && new Date(lr.start_date)>new Date()))
      {
        console.log("This is correct");
        lr.status=LeaveStatus.Cancelled;
        const updatedStats=await lr_repo.save(lr);
        bal.bal_days+=num_days;
        await bal_repo.save(bal);
        res.status(200).json(updatedStats);
      }
      else if(lr.status===LeaveStatus.Approved && new Date(lr.end_date)>new Date())
      {
        console.log("This is the most correct");
        lr.status=LeaveStatus.Cancelled;
        lr.end_date=new Date();
        const updatedStats=await lr_repo.save(lr);
        let count=0;
        const holidayRepo=AppDataSource.getRepository(Holiday);
        const holidays=await holidayRepo.find();
        const Hdates = holidays.map(h => {
          const dateObj = new Date(h.date); 
          return dateObj.toISOString().split("T")[0];
        });
        for(let i=new Date();i<=new Date(end_date);i.setDate(i.getDate()+1))
        {
          const day = i.getDay();
          const dateStr = i.toISOString().split("T")[0];
          if (day !== 0 && day !== 6 && !Hdates.includes(dateStr)) {
            count++;
          }
        }
        console.log("This is the count "+ count);
        bal.bal_days+=count;
        await bal_repo.save(bal);
        res.status(200).json(updatedStats);
      }
      else{
        return res.status(400).json({error: "You can cancel only if the starting date has not yet ended"});
      }
    }
    catch(error)
    {
      console.error(error);
      res.status(500).json({error:"Internal server error"});
    }
}


export const ViewTeamLeave=async(req:Request,res:Response)=>{
  try{
    const {id} = req.params;
    const teamLeaves=await leaveService.getTeamLeaveById(Number(id));
    res.status(200).json(teamLeaves);
  }
  catch(err)
  {
    console.error(err);
    res.status(400).json({error:"Error in viewing team leaves"});
  }
}

export const ViewAllTeamLeave=async(req:Request,res:Response)=>{
  try{
    const {id} = req.params;
    const {year,month}=req.body;
    const teamLeaves=await leaveService.getAllTeamLeaveById(Number(id),Number(year),Number(month));
    res.status(200).json(teamLeaves);
  }
  catch(err)
  {
    console.error(err);
    res.status(400).json({error:"Error in viewing all team leaves"});
  }
}

export const isClashing=async(req: Request, res: Response)=>
{
  try
  {
  const {id,sdate,edate}=req.body;
  const clashes=await leaveService.isClashing(Number(id),sdate,edate);
  console.log("Succes or failure : "+clashes);
  console.log(clashes === 1);
  return res.status(200).json({ clashing: clashes === 1 });
}
  catch(err)
  {
    console.error(err);
    res.json(400).json({error: "Error in getting clash values"});
  }
}








