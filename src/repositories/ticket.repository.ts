import { TicketModel, ITicket } from "../models/ticket.model";
import mongoose from "mongoose";

export interface ITicketRepository {
  createTicket(data: Partial<ITicket>): Promise<ITicket>;
  getTicketById(id: string): Promise<ITicket | null>;
  getUserTickets(userId: string): Promise<ITicket[]>;
  getAdminTickets(adminId: string): Promise<ITicket[]>;
  getOpenTickets(): Promise<ITicket[]>;
  updateTicket(id: string, data: Partial<ITicket>): Promise<ITicket | null>;
  assignTicketToAdmin(
    ticketId: string,
    adminId: string
  ): Promise<ITicket | null>;
  closeTicket(id: string): Promise<ITicket | null>;
}

export class TicketRepository implements ITicketRepository {
  async createTicket(data: Partial<ITicket>): Promise<ITicket> {
    const ticket = new TicketModel(data);
    return await ticket.save();
  }

  async getTicketById(id: string): Promise<ITicket | null> {
    return await TicketModel.findById(id)
      .populate("userId", "fullName email")
      .populate("adminId", "fullName email");
  }

  async getUserTickets(userId: string): Promise<ITicket[]> {
    return await TicketModel.find({ userId })
      .populate("adminId", "fullName email")
      .sort({ createdAt: -1 });
  }

  async getAdminTickets(adminId: string): Promise<ITicket[]> {
    return await TicketModel.find({ adminId })
      .populate("userId", "fullName email")
      .sort({ createdAt: -1 });
  }

  async getOpenTickets(): Promise<ITicket[]> {
    return await TicketModel.find({ status: "OPEN" })
      .populate("userId", "fullName email")
      .sort({ priority: -1, createdAt: 1 });
  }

  async updateTicket(
    id: string,
    data: Partial<ITicket>
  ): Promise<ITicket | null> {
    return await TicketModel.findByIdAndUpdate(id, data, { new: true })
      .populate("userId", "fullName email")
      .populate("adminId", "fullName email");
  }

  async assignTicketToAdmin(
    ticketId: string,
    adminId: string
  ): Promise<ITicket | null> {
    return await TicketModel.findByIdAndUpdate(
      ticketId,
      { adminId, status: "IN_PROGRESS" },
      { new: true }
    )
      .populate("userId", "fullName email")
      .populate("adminId", "fullName email");
  }

  async closeTicket(id: string): Promise<ITicket | null> {
    return await TicketModel.findByIdAndUpdate(
      id,
      { status: "CLOSED" },
      { new: true }
    );
  }
}
