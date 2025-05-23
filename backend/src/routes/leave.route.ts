// backend/src/routes/leave.route.ts
import { Router } from "express";
import {
    approveLeaveRequest,
  createLeaveRequest,
  getAllLeaveRequests,
  getLeaveRequestById,
  getLeaveRequestsByHR,
  getLeaveRequestByEmpId,
  getLeaveRequestsByManager,
  getHolidays,
  setCancelled,
  ViewTeamLeave,
  getLeaveRequestsByDirector,
} from "../controllers/leave.controller";

const router = Router();

router.post("/", createLeaveRequest);

router.get("/", getAllLeaveRequests);

router.get("/emp/holidays", getHolidays);

// router.get("/:id", getLeaveRequestById);

// router.get("/approvedleaves/:id",getApprovedLeaver)

router.get("/emp/:emp_id", getLeaveRequestByEmpId);

router.get("/manager/:manager_id", getLeaveRequestsByManager);

router.get("/director/:manager_id",getLeaveRequestsByDirector);

router.get("/hr/:hr_id", getLeaveRequestsByHR);

router.patch("/approve/:id", approveLeaveRequest);

router.patch("/request/cancel/:id",setCancelled);

router.get("/myteamleave/:id",ViewTeamLeave);

export default router;