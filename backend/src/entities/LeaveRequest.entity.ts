import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Employee } from "./Employee.entity";
import { LeaveType } from "./LeaveType.entity";
import { LeaveApp } from "./LeaveApproval.entity";

export enum ApprovalStatus {
  Pending = "Pending",
  Approved = "Approved",
  Rejected = "Rejected",
  NotRequired = "Not Required",
}

export enum LeaveStatus {
  Pending = "Pending",
  Approved = "Approved",
  Rejected = "Rejected",
  Cancelled = "Cancelled",
}

@Entity('leave_request')
export class LeaveRequest {
  @PrimaryGeneratedColumn()
  lr_id: number;

  @Column({ type: 'int' })
  emp_id: number;

  @Column({ type: 'int' })
  leave_type: number;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date' })
  end_date: Date;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({type:'timestamp', default:()=>'CURRENT_TIMESTAMP'})
  req_at: Date;

  @Column({ type: 'enum', enum: ApprovalStatus, default: ApprovalStatus.NotRequired})
  manager_approval: ApprovalStatus;

  @Column({type: 'enum', enum: ApprovalStatus, default: ApprovalStatus.NotRequired })
  hr_approval: ApprovalStatus;

  @Column({type: 'enum', enum: ApprovalStatus, default: ApprovalStatus.NotRequired })
  dir_approval: ApprovalStatus;

  @Column({ type: 'enum', enum: LeaveStatus, default: LeaveStatus.Pending })
  status: LeaveStatus;

  @Column({ type: 'int' })
  num_days: number;

  @ManyToOne(()=>Employee,(lr)=>lr.leaveRequests)
  @JoinColumn({ name: 'emp_id' })
  employee: Employee;

  @ManyToOne(()=>LeaveType,(lr)=>lr.leaveRequests)
  @JoinColumn({ name: 'leave_type' })
  leaveType: LeaveType;

  @OneToMany(()=>LeaveApp,(la)=>la.leaveRequest)
  leaveApp: LeaveApp[];
}