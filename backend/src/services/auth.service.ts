import { AppDataSource } from "../data-source";
import { Employee } from "../entities/Employee.entity";
import { QueryBuilder } from "typeorm";
import jwt from "jsonwebtoken";

export class AuthService {
  private userRepository = AppDataSource.getRepository(Employee);

  async login(email_id: string, password: string) {
    console.log("Searching for email_id:", email_id);
    const user = await this.userRepository.findOne({ where: { email_id } });
    console.log("Query result:", user);
    if (!user) {
      throw new Error("User not found");
    }
    // console.log(user);
    console.log(email_id);
    console.log(password);
    console.log(user.password);

    if (password !== user.password) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
      {
        id: user.emp_id,
        role: user.role_id,
        email: user.email_id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "3h", 
      }
    );

    return {
      message: "Login successful",
      token,
      user: {
        id: user.emp_id,
        email: user.email_id,
        role_id:user.role_id,
        name: user.name,
        man_id: user.manager_id,
        hr_id: user.hr_id,
        dir__id: user.dir_id
      },
    };
  }
}
