import 'reflect-metadata';
import { AppDataSource } from "./data-source";
import dotenv from 'dotenv';
import express from 'express';
import balRoutes from './routes/bal.route'
import empRoutes from './routes/emp.route';
import testTokenRoutes from './routes/test-token.route';
import authRoutes from './routes/auth.route'
import leaveRoutes from './routes/leave.route';
import holidayRoutes from './routes/holiday.route';
import cors from 'cors';

dotenv.config();

console.log(process.env.MYSQL_PASS);
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors({
  origin: "http://localhost:5174"
}));
app.use(express.json());

app.use('/api/users', empRoutes);
app.use('/api/test', testTokenRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/leave',leaveRoutes);
app.use('/api/bal', balRoutes);
app.use('/api/holiday',holidayRoutes);

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source initialized");
    app.listen(3000, () => console.log(`Server running in port ${PORT}`));
  })
  .catch((err) => {
    console.error("Error initializing data source", err);
  });