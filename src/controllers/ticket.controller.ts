import { Request, Response, NextFunction } from "express";
import { TicketService } from "../services/ticket.service";

const ticketService = new TicketService();

export class TicketController {
  async createTicket(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, description, category, priority } = req.body;
      const userId = (req as any).user._id.toString();

      if (!title || !description) {
        return res.status(400).json({
          success: false,
          message: "Title and description are required",
        });
      }

      const ticket = await ticketService.createTicket(
        userId,
        title,
        description,
        category || "OTHER",
        priority || "MEDIUM"
      );

      return res.status(201).json({
        success: true,
        message: "Ticket created successfully",
        data: ticket,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getTicket(req: Request, res: Response, next: NextFunction) {
    try {
      const ticket = await ticketService.getTicketById(req.params.ticketId);

      return res.status(200).json({
        success: true,
        message: "Ticket retrieved successfully",
        data: ticket,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getUserTickets(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id.toString();
      const tickets = await ticketService.getUserTickets(userId);

      return res.status(200).json({
        success: true,
        message: "User tickets retrieved successfully",
        data: tickets,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getAdminTickets(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = (req as any).user._id.toString();
      const tickets = await ticketService.getAdminTickets(adminId);

      return res.status(200).json({
        success: true,
        message: "Admin tickets retrieved successfully",
        data: tickets,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getOpenTickets(req: Request, res: Response, next: NextFunction) {
    try {
      const tickets = await ticketService.getOpenTickets();

      return res.status(200).json({
        success: true,
        message: "Open tickets retrieved successfully",
        data: tickets,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async assignTicket(req: Request, res: Response, next: NextFunction) {
    try {
      const { ticketId } = req.params;
      const adminId = (req as any).user._id.toString();

      const ticket = await ticketService.assignTicketToAdmin(ticketId, adminId);

      return res.status(200).json({
        success: true,
        message: "Ticket assigned successfully",
        data: ticket,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateTicketStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { ticketId } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status is required",
        });
      }

      const ticket = await ticketService.updateTicketStatus(ticketId, status);

      return res.status(200).json({
        success: true,
        message: "Ticket status updated successfully",
        data: ticket,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async closeTicket(req: Request, res: Response, next: NextFunction) {
    try {
      const { ticketId } = req.params;
      const ticket = await ticketService.closeTicket(ticketId);

      return res.status(200).json({
        success: true,
        message: "Ticket closed successfully",
        data: ticket,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
