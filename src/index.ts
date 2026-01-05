import express from "express";
import { PORT } from "./config";
import { connectDatabase } from "./database/mongodb";
import router from "./routes/auth.route";

const app = express();

app.use(express.json());

app.get('/test', (req, res) => {
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