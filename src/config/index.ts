import dotenv from "dotenv";

dotenv.config();

// Server Port
export const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// MongoDB Connection String
export const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/default_db";

// JWT Secret
export const JWT_SECRET: string = process.env.JWT_SECRET || "default";