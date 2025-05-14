import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { Department } from "./Department.entity";
import { Role } from "./Role.entity";
import { LeaveBalance } from "./LeaveBalance.entity";
import { LeaveRequest } from "./LeaveRequest.entity";

@Entity('employees')
export class Employee{
    @PrimaryGeneratedColumn()
    emp_id: number;

    @Column({type:"varchar"})
    name: string;

    @Column({type:'varchar'})
    password: string;

    @Column({type:"int"})
    age: number;

    @Column({type:"varchar"})
    email_id: string;

    @Column({type:"int"})
    dept_id: number;

    @Column({type:"int"})
    role_id: number;

    @Column({ name: 'manager_id', type:"int",nullable: true })
    manager_id: number;

    @Column({ name: 'hr_id', type:"int", nullable: true })
    hr_id: number;

    @ManyToOne(()=>Department,(dept)=>dept.employees)
    @JoinColumn({ name: 'dept_id' })
    department: Department;

    @ManyToOne(()=>Role,(r)=>r.employees)
    @JoinColumn({ name: 'role_id' })
    role: Role;
    
    @ManyToOne(()=>Employee,(e)=>e.subordinates,{nullable:true})
    @JoinColumn({ name: 'manager_id' })
    manager: Employee;

    @OneToMany(()=>Employee, (e)=>e.manager)
    subordinates: Employee[];

    @ManyToOne(()=>Employee,(emp)=>emp.hrTeam,{nullable:true})
    @JoinColumn({ name: 'hr_id' })
    hr: Employee;

    @OneToMany(()=>Employee,(emp)=>emp.hr)
    hrTeam:Employee[];

    @Column({type:"varchar",length: 255 })
    address: string;

    @Column({type:"varchar", unique: true })
    phno: string;

    @OneToMany(() => LeaveRequest, (lr) => lr.employee)
    leaveRequests: LeaveRequest[];

    @OneToMany(() => LeaveBalance, (lb) => lb.employees)
    leaveBalances: LeaveBalance[];
}