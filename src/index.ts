import app from "./app";
import { PORT } from "./config";
import { connectDatabase } from "./database/mongodb";
import { createServer } from "http";
import { WebSocketService } from "./services/websocket.service";
import { setWebSocketService } from "./services/payment.service";
import { setOrderWebSocketService } from "./services/order.service";

async function startServer() {
  await connectDatabase();

  const httpServer = createServer(app);
  const wsService = new WebSocketService(httpServer);

  setWebSocketService(wsService);
  setOrderWebSocketService(wsService);

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
