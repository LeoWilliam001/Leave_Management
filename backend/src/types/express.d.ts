import { Employee } from '../entities/Employee.entity';

declare global {
  namespace Express {
    interface Request {
      emp?: {
        id: number;
        role: number;
      }; // Or replace with `User` if you imported it
    }
  }
}