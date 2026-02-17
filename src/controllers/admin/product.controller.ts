import { Request, Response, NextFunction } from "express";
import z from "zod";
import { ProductService } from "../../services/admin/product.service";
import { CreateProductDTO, UpdateProductDTO } from "../../dtos/product.dto";

const productService = new ProductService();

export class ProductController {
  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = CreateProductDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: parsedData.error.flatten().fieldErrors,
        });
      }

      const product = await productService.createProduct(
        parsedData.data,
        req.file
      );

      return res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: product,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getAllProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        page = "1",
        size = "10",
        search = "",
        sortBy = "name",
        sortOrder = "asc",
      } = req.query;

      const { products, pagination } = await productService.getAllProducts({
        page: page as string,
        size: size as string,
        search: search as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as "asc" | "desc",
      });

      return res.status(200).json({
        success: true,
        message: "Products retrieved successfully",
        data: products,
        pagination,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.getProductById(req.params.id);

      return res.status(200).json({
        success: true,
        message: "Product retrieved successfully",
        data: product,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getProductsByStore(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await productService.getProductsByStore(
        req.params.storeId
      );

      return res.status(200).json({
        success: true,
        message: "Store products retrieved successfully",
        data: products,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = UpdateProductDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: parsedData.error.flatten().fieldErrors,
        });
      }

      const product = await productService.updateProduct(
        req.params.id,
        parsedData.data,
        req.file
      );

      return res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: product,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      await productService.deleteProduct(req.params.id);

      return res.status(200).json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
