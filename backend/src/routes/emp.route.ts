import { Router } from 'express';
import { EmployeeController } from '../controllers/emp.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

const empController=new EmployeeController();
router.post('/', authenticate, empController.createEmployee.bind(empController));
export default router;
