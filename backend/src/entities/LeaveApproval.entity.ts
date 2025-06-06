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
  
    @Column({ name: 'action_at',type:'timestamp', default:()=>'CURRENT_TIMESTAMP'})
    actionAt: Date;

    @ManyToOne(() => LeaveRequest,(la)=>la.leaveApp)
    @JoinColumn({ name: 'lr_id' })
    leaveRequest: LeaveRequest;
  
    @ManyToOne(() => Employee,(la)=>la.emp)
    @JoinColumn({ name: 'approver_id' })
    approver: Employee;
  }
  