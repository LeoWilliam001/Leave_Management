import { Request, Response } from "express";
import { BalService } from "../services/bal.service";

const balService= new BalService();

export const getBalByEmp=async(req:Request, res:Response)=>{
    const {id}=req.params;
    const balances=await balService.getBalanceByEmp(Number(id));
    res.status(200).json({balances});
}