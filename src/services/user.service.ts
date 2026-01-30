import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";
import bcryptjs from "bcryptjs";
import { HttpError } from "../errors/http.error";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

const userRepository = new UserRepository();

export class UserService {

  async createUser(data: CreateUserDTO) {
    // Check if email already exists
    const existingUser = await userRepository.getUserByEmail(data.email);
    if (existingUser) {
      throw new HttpError(409, "Email already in use.");
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(data.password, 10);

    // Create user
    const newUser = await userRepository.createUser({
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      password: hashedPassword,
      role: data.role,
    });

    return newUser;
  }

  async loginUser(data: LoginUserDTO) {
    const user = await userRepository.getUserByEmail(data.email);
    if (!user) {
      throw new HttpError(404, "User not found.");
    }

    // Compare password
    const isValidPassword = await bcryptjs.compare(
      data.password,
      user.password
    );

    if (!isValidPassword) {
      throw new HttpError(401, "Invalid credentials.");
    }

    // Generate JWT
    const payload = {
      userId: user._id.toString(),
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: "30d",
    });

    return {
      token,
      user,
    };
  }

  async getProfile(userId: string) {
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new HttpError(404, "User not found");
    }
    return user;
  }

  async updateProfile(
    userId: string,
    updateData: UpdateUserDTO,
    file?: Express.Multer.File
  ) {
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    if (file) {
      updateData.profilePictureUrl = `/uploads/users/${file.filename}`;
    }

    return await userRepository.updateUser(userId, updateData);
  }

  async uploadProfilePicture(userId: string, file: Express.Multer.File) {
    if (!file) {
      throw new HttpError(400, "Profile picture is required");
    }

    const profilePictureUrl = `/uploads/users/${file.filename}`;

    return await userRepository.updateUser(userId, {
      profilePictureUrl,
    });
  }


  async deleteAccount(userId: string) {
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    await userRepository.deleteUser(userId);
    return true;
  }
}
