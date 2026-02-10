import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { UserRepository } from "../repositories/user.repository";
import { HttpError } from "../errors/http.error";
import { IUser } from "../models/user.model";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

const userRepository = new UserRepository();

export const authorizedMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    // Check header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new HttpError(401, "Unauthorized: Invalid token format");
    }

    // Extract token
    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new HttpError(401, "Unauthorized: Token missing");
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch (jwtError) {
      // Handle JWT-specific errors
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    if (!decoded?.userId) {
      throw new HttpError(401, "Unauthorized: Token verification failed");
    }

    // Fetch user
    const user = await userRepository.getUserById(decoded.userId);
    if (!user) {
      throw new HttpError(401, "Unauthorized: User not found");
    }

    req.user = user;
    next(); // Just call next(), don't return it
  } catch (err: any) {
    // Pass HttpError to the next middleware
    if (err instanceof HttpError) {
      return next(err);
    }

    // For unexpected errors
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new HttpError(401, "Unauthorized: No user info");
    }

    // Ensure role matches
    if (req.user.role !== "ADMIN") {
      throw new HttpError(403, "Forbidden: Admin access only");
    }

    next();
  } catch (err: any) {
    if (err instanceof HttpError) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
      });
    }

    // For unexpected errors
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
