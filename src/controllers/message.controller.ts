import { Request, Response, NextFunction } from "express";
import { MessageService } from "../services/message.service";
import { getWebSocketService } from "../services/websocket.service";

export class MessageController {
  private get messageService() {
    return new MessageService(getWebSocketService().getIO());
  }

  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { ticketId, message, attachmentUrl } = req.body;
      const senderId = (req as any).user._id.toString();
      const senderRole = (req as any).user.role;

      if (!ticketId || !message) {
        return res.status(400).json({
          success: false,
          message: "Ticket ID and message are required",
        });
      }

      const newMessage = await this.messageService.sendMessage(
        ticketId,
        senderId,
        senderRole,
        message,
        attachmentUrl
      );

      return res.status(201).json({
        success: true,
        message: "Message sent successfully",
        data: newMessage,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getTicketMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const { ticketId } = req.params;
      const messages = await this.messageService.getTicketMessages(ticketId);

      return res.status(200).json({
        success: true,
        message: "Messages retrieved successfully",
        data: messages,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
