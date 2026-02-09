import { CreateUserDTO, UpdateUserDTO } from "../../dtos/user.dto";
import { UserRepository } from "../../repositories/user.repository";
import bcryptjs from "bcryptjs";
import { HttpError } from "../../errors/http.error";

const userRepository = new UserRepository();

export class AdminUserService {
  async createUser(data: CreateUserDTO, file?: Express.Multer.File) {
    const existingUser = await userRepository.getUserByEmail(data.email);
    if (existingUser) {
      throw new HttpError(403, "Email already in use");
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(data.password, 10);
    data.password = hashedPassword;

    // Attach profile picture path if file exists
    if (file) {
      data.profilePictureUrl = `/uploads/users/${file.filename}`;
    }

    const newUser = await userRepository.createUser(data);
    return newUser;
  }

  async getAllUsers(params: { page?: string; size?: string; search?: string }) {
    const currentPage =
      params.page && parseInt(params.page) > 0 ? parseInt(params.page) : 1;

    const currentSize =
      params.size && parseInt(params.size) > 0 ? parseInt(params.size) : 10;

    const currentSearch = params.search?.trim() || "";

    const { users, totalUsers } = await userRepository.getAllUsers({
      page: currentPage,
      size: currentSize,
      search: currentSearch,
    });

    const pagination = {
      page: currentPage,
      size: currentSize,
      total: totalUsers,
      totalPages: Math.ceil(totalUsers / currentSize),
    };

    return { users, pagination };
  }

  async getUserById(id: string) {
    const user = await userRepository.getUserById(id);
    if (!user) throw new HttpError(404, "User not found");
    return user;
  }

  async updateUser(
    id: string,
    updateData: UpdateUserDTO,
    file?: Express.Multer.File
  ) {
    const user = await userRepository.getUserById(id);
    if (!user) throw new HttpError(404, "User not found");

    // Update profile picture if file is provided
    if (file) {
      updateData.profilePictureUrl = `/uploads/users/${file.filename}`;
    }

    const updatedUser = await userRepository.updateUser(id, updateData);
    return updatedUser;
  }

  async deleteUser(id: string) {
    const user = await userRepository.getUserById(id);
    if (!user) throw new HttpError(404, "User not found");

    const deleted = await userRepository.deleteUser(id);
    return deleted;
  }
}
