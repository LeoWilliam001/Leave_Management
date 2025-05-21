import { Router } from "express";
import { getBalByEmp } from "../controllers/balance.controller";

const router = Router();

router.get("/getbal/:id",getBalByEmp);

export default router;
