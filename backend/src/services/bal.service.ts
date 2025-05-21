import { AppDataSource } from "../data-source";
import { LeaveBalance } from "../entities/LeaveBalance.entity";

export class BalService{
    private balRepo = AppDataSource.getRepository(LeaveBalance);

    async getBalanceByEmp(id: number)
    {
        return await this.balRepo.find({
            where: {emp_id: id},
            relations:["leaveType"],
        })
    }
}