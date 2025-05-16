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
} from "../controllers/leave.controller";

const router = Router();

router.post("/", createLeaveRequest);

router.get("/", getAllLeaveRequests);

router.get("/:id", getLeaveRequestById);

router.get("/emp/:emp_id", getLeaveRequestByEmpId);

router.get("/manager/:manager_id", getLeaveRequestsByManager);

router.get("/hr/:hr_id", getLeaveRequestsByHR);

router.patch("/approve/:id", approveLeaveRequest);

// router.get("/holidays", getHolidays);

export default router;