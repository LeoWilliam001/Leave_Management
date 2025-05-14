import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Employee } from './Employee.entity';

@Entity('roles')
export class Role{
    @PrimaryGeneratedColumn()
    role_id: number;

    @Column({type:"varchar"})
    role_name: string;

    @OneToMany(()=>Employee,(e)=>e.role)
    employees:Employee[];
}