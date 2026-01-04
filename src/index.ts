import express from "express";
import { PORT } from "./config";
import { connectDatabase } from "./database/mongodb";

const app = express();

async function startServer() {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();