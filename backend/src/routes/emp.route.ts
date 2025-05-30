import { Router } from 'express';
import { getAllEmployees, getEmployeeById, createEmployee, editEmpPassword, editEmpData, getRole, getReportees, getisDir, getEmployeesByTeam } from '../controllers/emp.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, createEmployee);
router.get('/',getAllEmployees);
router.patch('/editPass/:id',editEmpPassword);
router.patch('/editData/:id',editEmpData);
router.get('/:id',getEmployeeById);
router.get('/role/:id',getRole);
router.get("/reports-to/:empId", getReportees);
router.get("/isDir/:empId",getisDir);
router.get("/team/:id",getEmployeesByTeam);
export default router;
