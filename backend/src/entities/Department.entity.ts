import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Employee } from "./Employee.entity";

@Entity('departments')
export class Department{
    @PrimaryGeneratedColumn()
    dept_id: number;

    @Column({type:"varchar"})
    dept_name: string;

    @OneToMany(()=>Employee, employee=>employee.department)
    employees: Employee[];
}