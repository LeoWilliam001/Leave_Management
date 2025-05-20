import { Router } from 'express';
import { getAllEmployees, getEmployeeById, createEmployee, editEmpPassword } from '../controllers/emp.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, createEmployee);
router.get('/',getAllEmployees);
router.patch('/editPass/:id',editEmpPassword);
router.get('/:id',getEmployeeById);
export default router;
