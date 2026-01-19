import express from "express";
import cors from "cors";
import { PORT } from "./config";
import { connectDatabase } from "./database/mongodb";
import router from "./routes/auth.route";

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

app.get("/test", (req, res) => {
  return res.status(200).json({ success: "true", message: "Welcome." });
});

app.use("/api/auth", router);

async function startServer() {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();