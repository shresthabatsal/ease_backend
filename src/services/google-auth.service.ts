import { OAuth2Client } from "google-auth-library";
import { UserRepository } from "../repositories/user.repository";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { HttpError } from "../errors/http.error";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "../config/google";

const userRepository = new UserRepository();

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);

export class GoogleAuthService {
  async verifyGoogleToken(token: string) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new HttpError(400, "Invalid Google token");
      }

      // Add null checks
      if (!payload.email || !payload.name) {
        throw new HttpError(400, "Google token missing required fields");
      }

      return {
        googleId: payload.sub,
        email: payload.email,
        fullName: payload.name,
        profilePictureUrl: payload.picture,
      };
    } catch (error: any) {
      throw new HttpError(400, "Invalid Google token");
    }
  }

  async googleRegisterOrLogin(googleData: {
    googleId: string;
    email: string;
    fullName: string;
    profilePictureUrl?: string;
  }) {
    try {
      // Check if user exists by email
      let user = await userRepository.getUserByEmail(googleData.email);

      if (user) {
        // User exists - update googleId if not set
        if (!user.googleId) {
          user = await userRepository.updateUser(user._id.toString(), {
            googleId: googleData.googleId,
          });
        }
      } else {
        // Create new user
        user = await userRepository.createUser({
          fullName: googleData.fullName,
          email: googleData.email,
          googleId: googleData.googleId,
          profilePictureUrl: googleData.profilePictureUrl,
          role: "USER",
        });
      }

      if (!user) {
        throw new HttpError(500, "Failed to create or update user");
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
    } catch (error: any) {
      if (error instanceof HttpError) throw error;
      throw new HttpError(500, "Google authentication failed");
    }
  }
}
