import { Request, Response, NextFunction } from "express";
import z from "zod";
import { CreateUserDTO, UpdateUserDTO } from "../../dtos/user.dto";
import { AdminUserService } from "../../services/admin/user.service";

const adminUserService = new AdminUserService();

export class AdminUserController {
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = CreateUserDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      // Attach profile picture if uploaded
      if (req.file) {
        parsedData.data.profilePictureUrl = `/uploads/users/${req.file.filename}`;
      }

      const newUser = await adminUserService.createUser(
        parsedData.data,
        req.file
      );

      return res.status(201).json({
        success: true,
        message: "User Created",
        data: newUser,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        page = "1",
        size = "20",
        search = "",
        sortBy = "fullName",
        sortOrder = "asc",
      } = req.query;

      const { users, pagination } = await adminUserService.getAllUsers({
        page: page as string,
        size: size as string,
        search: search as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as "asc" | "desc",
      });

      return res.status(200).json({
        success: true,
        message: "All Users Retrieved",
        data: users,
        pagination,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;
      const user = await adminUserService.getUserById(userId);
      return res.status(200).json({
        success: true,
        message: "User Retrieved",
        data: user,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;
      const parsedData = UpdateUserDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      // Attach profile picture if uploaded
      if (req.file) {
        parsedData.data.profilePictureUrl = `/uploads/users/${req.file.filename}`;
      }

      const updatedUser = await adminUserService.updateUser(
        userId,
        parsedData.data,
        req.file
      );

      return res.status(200).json({
        success: true,
        message: "User Updated",
        data: updatedUser,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;
      const deleted = await adminUserService.deleteUser(userId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "User Deleted",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
