import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import z from "zod";

const userService = new UserService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      // Validate request body
      const parsedData = CreateUserDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const userData: CreateUserDTO = parsedData.data;
      const newUser = await userService.createUser(userData);

      return res.status(201).json({
        success: true,
        message: "User Created Successfully.",
        data: newUser,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error.",
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const parsedData = LoginUserDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const loginData: LoginUserDTO = parsedData.data;
      const { token, user } = await userService.loginUser(loginData);

      return res.status(200).json({
        success: true,
        message: "Login Successful.",
        token,
        data: user,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error.",
      });
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      const user = await userService.getProfile(req.user!._id.toString());
      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (err: any) {
      return res.status(err.statusCode || 500).json({
        success: false,
        message: err.message,
      });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const parsedData = UpdateUserDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const updatedUser = await userService.updateProfile(
        req.user!._id.toString(),
        parsedData.data,
        req.file
      );

      return res.status(200).json({
        success: true,
        message: "Profile updated",
        data: updatedUser,
      });
    } catch (err: any) {
      return res.status(err.statusCode || 500).json({
        success: false,
        message: err.message,
      });
    }
  }

  async uploadProfilePicture(req: Request, res: Response) {
    try {
      const user = await userService.uploadProfilePicture(
        req.user!._id.toString(),
        req.file!
      );

      const profilePictureUrl = `${req.protocol}://${req.get("host")}${
        user.profilePictureUrl
      }`;

      return res.status(200).json({
        success: true,
        message: "Profile picture uploaded",
        data: profilePictureUrl,
      });
    } catch (err: any) {
      return res.status(err.statusCode || 500).json({
        success: false,
        message: err.message,
      });
    }
  }

  async deleteAccount(req: Request, res: Response) {
    try {
      await userService.deleteAccount(req.user!._id.toString());

      return res.status(200).json({
        success: true,
        message: "User account deleted",
      });
    } catch (err: any) {
      return res.status(err.statusCode || 500).json({
        success: false,
        message: err.message,
      });
    }
  }

  async sendResetPasswordEmail(req: Request, res: Response) {
    try {
      const { email } = req.body;

      await userService.sendResetPasswordEmail(email);

      return res.status(200).json({
        success: true,
        message: "If the email is registered, a reset link has been sent.",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const token = req.query.token as string;
      const { newPassword } = req.body;

      await userService.resetPassword(token, newPassword);

      return res.status(200).json({
        success: true,
        message: "Password has been reset successfully.",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
