import { UserModel, IUser } from "../models/user.model";

export interface IUserRepository {
  createUser(userData: Partial<IUser>): Promise<IUser>;

  getUserById(id: string): Promise<IUser | null>;
  getUserByEmail(email: string): Promise<IUser | null>;
  getAllUsers(params: {
    page: number;
    size: number;
    search?: string;
  }): Promise<{ users: IUser[]; totalUsers: number }>;

  updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null>;
  deleteUser(id: string): Promise<boolean>;
}

export class UserRepository implements IUserRepository {
  async createUser(userData: Partial<IUser>): Promise<IUser> {
    const user = new UserModel(userData);
    return await user.save();
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email });
  }

  async getUserById(id: string): Promise<IUser | null> {
    return await UserModel.findById(id);
  }

  async getAllUsers({
    page,
    size,
    search,
    sortBy,
    sortOrder,
  }: {
    page: number;
    size: number;
    search?: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
  }): Promise<{ users: IUser[]; totalUsers: number }> {
    let filter: any = {};

    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
      ];
    }

    const sortDirection = sortOrder === "asc" ? 1 : -1;

    const [users, totalUsers] = await Promise.all([
      UserModel.find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip((page - 1) * size)
        .limit(size),

      UserModel.countDocuments(filter),
    ]);

    return { users, totalUsers };
  }

  async updateUser(
    id: string,
    updateData: Partial<IUser>
  ): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }
}
