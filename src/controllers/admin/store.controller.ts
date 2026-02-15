import { Request, Response, NextFunction } from "express";
import z from "zod";
import { StoreService } from "../../services/admin/store.service";
import { CreateStoreDTO, UpdateStoreDTO } from "../../dtos/store.dto";

const storeService = new StoreService();

export class StoreController {
  async createStore(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = CreateStoreDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: parsedData.error.flatten().fieldErrors,
        });
      }

      const store = await storeService.createStore(parsedData.data, req.file);

      return res.status(201).json({
        success: true,
        message: "Store created successfully",
        data: store,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getAllStores(req: Request, res: Response, next: NextFunction) {
    try {
      const stores = await storeService.getAllStores();

      return res.status(200).json({
        success: true,
        message: "Stores retrieved successfully",
        data: stores,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getStoreById(req: Request, res: Response, next: NextFunction) {
    try {
      const store = await storeService.getStoreById(req.params.id);

      return res.status(200).json({
        success: true,
        message: "Store retrieved successfully",
        data: store,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateStore(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = UpdateStoreDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: parsedData.error.flatten().fieldErrors,
        });
      }

      const store = await storeService.updateStore(
        req.params.id,
        parsedData.data,
        req.file
      );

      return res.status(200).json({
        success: true,
        message: "Store updated successfully",
        data: store,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async deleteStore(req: Request, res: Response, next: NextFunction) {
    try {
      await storeService.deleteStore(req.params.id);

      return res.status(200).json({
        success: true,
        message: "Store deleted successfully",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
