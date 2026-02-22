import { Request, Response, NextFunction } from "express";
import { ProductService } from "../services/product.service";

const productService = new ProductService();

export class ProductController {
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

  async getProductsByStoreAndCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { storeId, categoryId } = req.params;
      const products = await productService.getProductsByStoreAndCategory(
        storeId,
        categoryId
      );
      return res.status(200).json({
        success: true,
        message: "Products retrieved successfully",
        data: products,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getProductsByStoreAndSubcategory(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { storeId, subcategoryId } = req.params;
      const products = await productService.getProductsByStoreAndSubcategory(
        storeId,
        subcategoryId
      );
      return res.status(200).json({
        success: true,
        message: "Products retrieved successfully",
        data: products,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
