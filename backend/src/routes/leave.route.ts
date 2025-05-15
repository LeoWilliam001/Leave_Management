// backend/src/routes/leave.route.ts
import { Router } from "express";
import {
    approveLeaveRequest,
  createLeaveRequest,
  getAllLeaveRequests,
  getLeaveRequestById,
  getLeaveRequestsByHR,
  getLeaveRequestsByManager
} from "../controllers/leave.controller";

const router = Router();

router.post("/", createLeaveRequest);

router.get("/", getAllLeaveRequests);

router.get("/:id", getLeaveRequestById);

router.get("/manager/:manager_id", getLeaveRequestsByManager);

router.get("/hr/:hr_id", getLeaveRequestsByHR);

router.patch("/approve/:id", approveLeaveRequest);

// router.patch("reject/:id", rejectLeaveRequest);

export default router;