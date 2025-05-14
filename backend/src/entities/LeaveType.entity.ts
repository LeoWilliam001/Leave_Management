import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { LeaveRequest } from "./LeaveRequest.entity";
import { LeaveBalance } from "./LeaveBalance.entity";

@Entity('leave_types')
export class LeaveType{
    @PrimaryGeneratedColumn()
    lt_id: number;

    @Column({type:"varchar"})
    type_of_leave: string;

    @Column({type:"int"})
    days_allocated: number;

    @OneToMany(()=>LeaveRequest,(lt)=>lt.leaveType)
    leaveRequests: LeaveRequest[];

    @OneToMany(()=>LeaveBalance, (lt)=>lt.leaveType)
    leaveBalance: LeaveBalance[];
}