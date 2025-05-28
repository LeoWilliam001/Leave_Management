import { Employee } from '../entities/Employee.entity';

declare global {
  namespace Express {
    interface Request {
      emp?: {
        id: number;
        role: number;
      }; 
    }
  }
}