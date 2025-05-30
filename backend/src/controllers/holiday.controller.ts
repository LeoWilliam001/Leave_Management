import {Request, Response} from "express";
import { HolidayService } from "../services/holiday.service";

const holidayService=new HolidayService();

export const createHoliday=async (req: Request, res: Response)=>{
    try{
        const data = req.body;
        console.log(data)
        const creation = await holidayService.createHolidays(data);
        res.status(200).json(creation);
    }
    catch(err)
    {
        console.log("Error occured in holiday creation : "+err);
        res.status(500).json({error: "Failed to create holiday"});
    }
}