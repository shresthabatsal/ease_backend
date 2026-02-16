import { Request, Response, NextFunction } from "express";
import z from "zod";
import { SubcategoryService } from "../../services/admin/subcategory.service";
import {
  CreateSubcategoryDTO,
  UpdateSubcategoryDTO,
} from "../../dtos/subcategory.dto";

const subcategoryService = new SubcategoryService();

export class SubcategoryController {
  async createSubcategory(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = CreateSubcategoryDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: parsedData.error.flatten().fieldErrors,
        });
      }

      const subcategory = await subcategoryService.createSubcategory(
        parsedData.data
      );

      return res.status(201).json({
        success: true,
        message: "Subcategory created successfully",
        data: subcategory,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getAllSubcategories(req: Request, res: Response, next: NextFunction) {
    try {
      const subcategories = await subcategoryService.getAllSubcategories();

      return res.status(200).json({
        success: true,
        message: "Subcategories retrieved successfully",
        data: subcategories,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getSubcategoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const subcategory = await subcategoryService.getSubcategoryById(
        req.params.id
      );

      return res.status(200).json({
        success: true,
        message: "Subcategory retrieved successfully",
        data: subcategory,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getSubcategoriesByCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const subcategories = await subcategoryService.getSubcategoriesByCategory(
        req.params.categoryId
      );

      return res.status(200).json({
        success: true,
        message: "Subcategories retrieved successfully",
        data: subcategories,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateSubcategory(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = UpdateSubcategoryDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: parsedData.error.flatten().fieldErrors,
        });
      }

      const subcategory = await subcategoryService.updateSubcategory(
        req.params.id,
        parsedData.data
      );

      return res.status(200).json({
        success: true,
        message: "Subcategory updated successfully",
        data: subcategory,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async deleteSubcategory(req: Request, res: Response, next: NextFunction) {
    try {
      await subcategoryService.deleteSubcategory(req.params.id);

      return res.status(200).json({
        success: true,
        message: "Subcategory deleted successfully",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
