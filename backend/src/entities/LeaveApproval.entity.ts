import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Timestamp } from 'typeorm';
import { LeaveRequest } from './LeaveRequest.entity';
import { Employee } from './Employee.entity';
  
export enum ApprovalStatus {
    Pending = "Pending",
    Approved = "Approved",
    Rejected = "Rejected",
    NotRequired = "Not Required",
  }

@Entity('leave_app')
export class LeaveApp {
    @PrimaryGeneratedColumn({ type: 'int' })
    la_id: number;
  
    @Column({type: 'int'})
    lr_id: number;
  
    @Column({type:'int'})
    approver_id: number;

    @Column({type: 'enum', enum: ApprovalStatus, default: 'Not Required'})
    decision: ApprovalStatus;
  
    @Column({ type: 'text', nullable: true })
    comment: string;
  
    @CreateDateColumn({ name: 'action_at', type: 'timestamp' })
    actionAt: Timestamp;

    @ManyToOne(() => LeaveRequest)
    @JoinColumn({ name: 'lr_id' })
    leaveRequest: LeaveRequest;
  
    @ManyToOne(() => Employee)
    @JoinColumn({ name: 'approver_id' })
    approver: Employee;
  }
  