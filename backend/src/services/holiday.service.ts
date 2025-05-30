import { AppDataSource } from "../data-source";
import { Holiday } from "../entities/Holiday.entity";

export class HolidayService{
    private HolidayRepo=AppDataSource.getRepository("Holiday");

    async createHolidays(data:Partial<Holiday>)
    {
        console.log(data);
        const holiday=this.HolidayRepo.create(data);
        console.log(holiday);
        const savedHoliday=await this.HolidayRepo.save(holiday);
        return savedHoliday;
    }
}