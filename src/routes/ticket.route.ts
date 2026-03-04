import { Router } from "express";
import { TicketController } from "../controllers/ticket.controller";
import {
  authorizedMiddleware,
  adminMiddleware,
} from "../middleware/auth.middleware";

const router = Router();
const ticketController = new TicketController();

// User routes
router.post("/", authorizedMiddleware, (req, res, next) =>
  ticketController.createTicket(req, res, next)
);
router.get("/my-tickets", authorizedMiddleware, (req, res, next) =>
  ticketController.getUserTickets(req, res, next)
);
router.get("/:ticketId", authorizedMiddleware, (req, res, next) =>
  ticketController.getTicket(req, res, next)
);

// Admin routes
router.get(
  "/admin/open-tickets",
  authorizedMiddleware,
  adminMiddleware,
  (req, res, next) => ticketController.getOpenTickets(req, res, next)
);
router.get(
  "/admin/my-tickets",
  authorizedMiddleware,
  adminMiddleware,
  (req, res, next) => ticketController.getAdminTickets(req, res, next)
);
router.post(
  "/:ticketId/assign",
  authorizedMiddleware,
  adminMiddleware,
  (req, res, next) => ticketController.assignTicket(req, res, next)
);
router.put(
  "/:ticketId/status",
  authorizedMiddleware,
  adminMiddleware,
  (req, res, next) => ticketController.updateTicketStatus(req, res, next)
);
router.put("/:ticketId/close", authorizedMiddleware, (req, res, next) =>
  ticketController.closeTicket(req, res, next)
);

export default router;
