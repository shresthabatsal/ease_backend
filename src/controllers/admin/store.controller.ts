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

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const storeImageFile = files?.storeImage?.[0];
      const qrCodeFile = files?.paymentQRCode?.[0];

      const store = await storeService.createStore(
        parsedData.data,
        storeImageFile,
        qrCodeFile
      );

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

  async getNearestStores(req: Request, res: Response, next: NextFunction) {
    try {
      const { latitude, longitude, maxDistance } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: "Latitude and longitude are required",
        });
      }

      const stores = await storeService.getNearestStores(
        parseFloat(latitude as string),
        parseFloat(longitude as string),
        parseInt(maxDistance as string) || 50
      );

      return res.status(200).json({
        success: true,
        message: "Nearest stores retrieved successfully",
        data: stores,
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

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const storeImageFile = files?.storeImage?.[0];
      const qrCodeFile = files?.paymentQRCode?.[0];

      const store = await storeService.updateStore(
        req.params.id,
        parsedData.data,
        storeImageFile,
        qrCodeFile
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
