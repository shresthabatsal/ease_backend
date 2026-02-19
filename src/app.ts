import express from "express";
import cors from "cors";
import path from "path";

// Routes
import authRouter from "./routes/auth.route";

import adminUserRouter from "./routes/admin/user.route";
import storeRouter from "./routes/admin/store.route";
import categoryRouter from "./routes/admin/category.route";
import subcategoryRouter from "./routes/admin/subcategory.route";
import productRouter from "./routes/admin/product.route";
import adminOrderRouter from "./routes/admin/order.route";

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
app.use("/api/admin/stores", storeRouter);
app.use("/api/admin/categories", categoryRouter);
app.use("/api/admin/subcategories", subcategoryRouter);
app.use("/api/admin/products", productRouter);
app.use("/api/admin", adminOrderRouter);

export default app;
