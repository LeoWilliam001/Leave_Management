import {Router} from "express";
import { createHoliday } from "../controllers/holiday.controller";

const router=Router();

router.post("/create",createHoliday);

export default router;