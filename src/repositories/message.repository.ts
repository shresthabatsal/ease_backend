import { MessageModel, IMessage } from "../models/message.model";

export interface IMessageRepository {
  createMessage(data: Partial<IMessage>): Promise<IMessage>;
  getTicketMessages(ticketId: string): Promise<IMessage[]>;
  getMessageById(id: string): Promise<IMessage | null>;
}

export class MessageRepository implements IMessageRepository {
  async createMessage(data: Partial<IMessage>): Promise<IMessage> {
    const message = new MessageModel(data);
    return await message.save();
  }

  async getTicketMessages(ticketId: string): Promise<IMessage[]> {
    return await MessageModel.find({ ticketId })
      .populate("senderId", "fullName email profilePictureUrl")
      .sort({ createdAt: 1 });
  }

  async getMessageById(id: string): Promise<IMessage | null> {
    return await MessageModel.findById(id).populate(
      "senderId",
      "fullName email"
    );
  }
}
