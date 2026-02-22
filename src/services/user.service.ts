import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";
import bcryptjs from "bcryptjs";
import { HttpError } from "../errors/http.error";
import jwt from "jsonwebtoken";
import { CLIENT_URL, JWT_SECRET } from "../config";
import { sendEmail } from "../config/email";

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

    // Hash password
    if (updateData.password) {
      updateData.password = await bcryptjs.hash(updateData.password, 10);
    }

    return await userRepository.updateUser(userId, updateData);
  }

  async uploadProfilePicture(userId: string, file: Express.Multer.File) {
    if (!file) {
      throw new HttpError(400, "Profile picture is required");
    }

    const profilePictureUrl = `/uploads/users/${file.filename}`;

    const updatedUser = await userRepository.updateUser(userId, {
      profilePictureUrl,
    });

    if (!updatedUser) {
      throw new HttpError(500, "Failed to update profile picture");
    }

    return updatedUser;
  }

  async deleteAccount(userId: string) {
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    await userRepository.deleteUser(userId);
    return true;
  }

  async sendResetPasswordEmail(email?: string) {
    if (!email) {
      throw new HttpError(400, "Email is required");
    }

    const user = await userRepository.getUserByEmail(email);
    if (!user) {
      // Security best practice: don't reveal existence
      return;
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

    const resetLink = `${CLIENT_URL}/reset-password?token=${token}`;

    const html = `
      <p>You requested a password reset.</p>
      <p>
        Click <a href="${resetLink}">here</a> to reset your password.
      </p>
      <p>This link will expire in 1 hour.</p>
    `;

    await sendEmail(user.email, "Password Reset", html);

    return { user };
  }

  async resetPassword(token?: string, newPassword?: string) {
    if (!token || !newPassword) {
      throw new HttpError(400, "Token and new password are required");
    }

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);

      const user = await userRepository.getUserById(decoded.id);
      if (!user) {
        throw new HttpError(404, "User not found");
      }

      const hashedPassword = await bcryptjs.hash(newPassword, 10);

      await userRepository.updateUser(user._id.toString(), {
        password: hashedPassword,
      });

      return true;
    } catch (error) {
      throw new HttpError(400, "Invalid or expired token");
    }
  }
}
