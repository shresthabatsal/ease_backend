import dotenv from "dotenv";

dotenv.config();

// Server Port
export const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// MongoDB Connection String
export const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/default_db";

// JWT Secret
export const JWT_SECRET: string = process.env.JWT_SECRET || "default";

export const CLIENT_URL: string =
  process.env.CLIENT_URL || "http://localhost:3000";

export const EMAIL_USER: string =
  process.env.EMAIL_USER || "dummy@gmail.com";

export const EMAIL_PASS: string =
  process.env.EMAIL_PASS || "password";
