import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Employee } from "./Employee.entity";
import { LeaveType } from "./LeaveType.entity";

@Entity('leave_bal')
export class LeaveBalance{
    @PrimaryGeneratedColumn()
    lb_id: number;

    @Column({type:'int'})   //start
    emp_id:number;

    @Column({type:'int'})
    leave_type_id:number;   //stop

    @Column({type:'int'})
    total_days: number;

    @Column({type:'int'})
    bal_days:number;

    @Column({type:'int'})
    lop_days:number;

    @ManyToOne(()=>Employee,(lb)=>lb.leaveBalances)
    @JoinColumn({ name: 'emp_id' })
    employees: Employee;

    @ManyToOne(()=>LeaveType,(lb)=>lb.leaveBalance)
    @JoinColumn({ name: 'leave_type_id' })
    leaveType: LeaveType;
}