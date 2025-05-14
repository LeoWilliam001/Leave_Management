import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('holidays')
export class Holiday{
    @PrimaryGeneratedColumn()
    h_id:number;

    @Column({type:"date"})
    date: Date;

    @Column({type:"varchar"})
    fest: string;
}