import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Employee } from "./Employee.entity";
import { LeaveType } from "./LeaveType.entity";

@Entity('leave_request')
export class LeaveRequest{
    @PrimaryGeneratedColumn()
    lr_id: number;

    @Column({type:'int'}) //start
    emp_id:number;

    @Column({type:'int'})
    leave_type_id:number;  //stop

    @Column({type:'date'})
    start_date: Date;

    @Column({type:'date'})
    end_date: Date;

    @Column({type:'varchar'})
    reason: string;

    @Column({type:'varchar'})
    next_level_of_approval: string;

    @Column({type:'varchar'})
    status: "Pending" | "Approved" | "Rejected";

    @ManyToOne(()=>Employee,(lr)=>lr.leaveRequests)
    @JoinColumn({ name: 'emp_id' })
    employee: Employee;

    @ManyToOne(()=>LeaveType,(lr)=>lr.leaveRequests)
    @JoinColumn({ name: 'leave_type_id' })
    leaveType: LeaveType;
}