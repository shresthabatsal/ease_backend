import mongoose from "mongoose";
import { MessageRepository } from "../repositories/message.repository";
import { TicketRepository } from "../repositories/ticket.repository";
import { HttpError } from "../errors/http.error";
import { Server as SocketIOServer } from "socket.io";

const messageRepository = new MessageRepository();
const ticketRepository = new TicketRepository();

export class MessageService {
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  async sendMessage(
    ticketId: string,
    senderId: string,
    senderRole: "USER" | "ADMIN",
    message: string,
    attachmentUrl?: string
  ) {
    const ticket = await ticketRepository.getTicketById(ticketId);
    if (!ticket) {
      throw new HttpError(404, "Ticket not found");
    }

    const newMessage = await messageRepository.createMessage({
      ticketId: new mongoose.Types.ObjectId(ticketId),
      senderId: new mongoose.Types.ObjectId(senderId),
      senderRole,
      message,
      attachmentUrl,
    });

    // Emit to ticket room — reaches all connected clients (mobile + web) instantly
    this.io.to(`ticket_${ticketId}`).emit("new_message", {
      _id: newMessage._id,
      ticketId,
      senderId: { _id: senderId },
      senderRole,
      message,
      attachmentUrl,
      createdAt: newMessage.createdAt,
    });

    return newMessage;
  }

  async getTicketMessages(ticketId: string) {
    const ticket = await ticketRepository.getTicketById(ticketId);
    if (!ticket) {
      throw new HttpError(404, "Ticket not found");
    }

    return await messageRepository.getTicketMessages(ticketId);
  }
}
