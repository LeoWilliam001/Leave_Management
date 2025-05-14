import "reflect-metadata"
import * as dotenv from 'dotenv'
import { DataSource } from "typeorm"
import { Employee } from "./entities/Employee.entity"
import { Department } from "./entities/Department.entity"
import { LeaveType } from "./entities/LeaveType.entity"
import { LeaveRequest } from "./entities/LeaveRequest.entity"
import { LeaveBalance } from "./entities/LeaveBalance.entity"
import { Holiday } from "./entities/Holiday.entity"
import { Role } from "./entities/Role.entity"

dotenv.config();
export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: process.env.MYSQL_PASS,
    database: "leave_manager",
    synchronize: true,
    logging: false,
    entities: [Employee,Department,LeaveType,LeaveRequest,LeaveBalance,Holiday,Role],
    migrations: [],
    subscribers: [],
})
