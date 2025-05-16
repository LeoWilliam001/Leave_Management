import { Router } from 'express';
import { getAllEmployees, getEmployeeById, createEmployee, editEmpPassword } from '../controllers/emp.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// const empController=new EmployeeController();
// router.post('/', authenticate, createEmployee.bind(empController));
router.get('/',getAllEmployees);
router.patch('/editPass/:id',editEmpPassword);
router.get('/:id',getEmployeeById);
export default router;
