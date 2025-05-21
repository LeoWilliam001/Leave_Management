import { Router } from 'express';
import { getAllEmployees, getEmployeeById, createEmployee, editEmpPassword, editEmpData, getRole } from '../controllers/emp.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, createEmployee);
router.get('/',getAllEmployees);
router.patch('/editPass/:id',editEmpPassword);
router.patch('/editData/:id',editEmpData);
router.get('/:id',getEmployeeById);
router.get('/role/:id',getRole);
export default router;
