import express from "express";
import cors from "cors";
import path from "path";
import { PORT } from "./config";
import { connectDatabase } from "./database/mongodb";

// Routes
import authRouter from "./routes/auth.route";
import adminUserRouter from "./routes/admin/user.route";

const app = express();

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3003",
    "http://localhost:3005",
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/test", (req, res) => {
  return res.status(200).json({ success: "true", message: "Welcome." });
});

app.use("/api/auth", authRouter);
app.use("/api/admin/users", adminUserRouter);

export default app;
