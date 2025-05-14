import { AuthService } from "../services/auth.service";
import { Request, Response } from "express";

const authService = new AuthService();

export const LoginController = async (req: Request, res: Response) => {
  const { email_id, password } = req.body;

  try {
    const user = await authService.login(email_id, password);
    res.status(200).json({ message: "Login successful", user });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};
