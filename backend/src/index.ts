import 'reflect-metadata';
import { AppDataSource } from "./data-source";
import dotenv from 'dotenv';
import express from 'express';
import empRoutes from './routes/emp.route';
import testTokenRoutes from './routes/test-token.route';
import authRoutes from './routes/auth.route'
import cors from 'cors';

dotenv.config();


const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors({
  origin: "http://localhost:5173"
}));
app.use(express.json());

app.use('/api/users', empRoutes);
app.use('/api/test', testTokenRoutes);
app.use("/api/auth", authRoutes);

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source initialized");
    app.listen(3000, () => console.log(`Server running in port ${PORT}`));
  })
  .catch((err) => {
    console.error("Error initializing data source", err);
  });