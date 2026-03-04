import mongoose from "mongoose";
import { TicketRepository } from "../repositories/ticket.repository";
import { HttpError } from "../errors/http.error";

const ticketRepository = new TicketRepository();

export class TicketService {
  async createTicket(
    userId: string,
    title: string,
    description: string,
    category: string,
    priority: string
  ) {
    return await ticketRepository.createTicket({
      userId: new mongoose.Types.ObjectId(userId),
      title,
      description,
      category: category as
        | "BUG"
        | "COMPLAINT"
        | "REFUND"
        | "DELIVERY"
        | "OTHER",
      priority: priority as "LOW" | "MEDIUM" | "HIGH",
      status: "OPEN",
    });
  }

  async getTicketById(ticketId: string) {
    const ticket = await ticketRepository.getTicketById(ticketId);
    if (!ticket) {
      throw new HttpError(404, "Ticket not found");
    }
    return ticket;
  }

  async getUserTickets(userId: string) {
    return await ticketRepository.getUserTickets(userId);
  }

  async getAdminTickets(adminId: string) {
    return await ticketRepository.getAdminTickets(adminId);
  }

  async getOpenTickets() {
    return await ticketRepository.getOpenTickets();
  }

  async assignTicketToAdmin(ticketId: string, adminId: string) {
    const ticket = await ticketRepository.getTicketById(ticketId);
    if (!ticket) {
      throw new HttpError(404, "Ticket not found");
    }

    if (ticket.adminId) {
      throw new HttpError(400, "Ticket already assigned to an admin");
    }

    return await ticketRepository.assignTicketToAdmin(ticketId, adminId);
  }

  async updateTicketStatus(ticketId: string, status: string) {
    const ticket = await ticketRepository.getTicketById(ticketId);
    if (!ticket) {
      throw new HttpError(404, "Ticket not found");
    }

    return await ticketRepository.updateTicket(ticketId, {
      status: status as "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED",
    });
  }

  async closeTicket(ticketId: string) {
    const ticket = await ticketRepository.getTicketById(ticketId);
    if (!ticket) {
      throw new HttpError(404, "Ticket not found");
    }

    return await ticketRepository.closeTicket(ticketId);
  }
}
