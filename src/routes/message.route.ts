import { Router } from "express";
import { MessageController } from "../controllers/message.controller";
import { authorizedMiddleware } from "../middleware/auth.middleware";

const router = Router();
const messageController = new MessageController();

router.post("/", authorizedMiddleware, (req, res, next) =>
  messageController.sendMessage(req, res, next)
);
router.get("/:ticketId", authorizedMiddleware, (req, res, next) =>
  messageController.getTicketMessages(req, res, next)
);

export default router;
