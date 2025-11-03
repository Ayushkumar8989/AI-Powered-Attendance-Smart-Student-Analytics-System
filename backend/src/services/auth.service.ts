import { User } from '../models/User.model';
import { tokenService } from './token.service';
import {
  ValidationError,
  UnauthorizedError,
  ConflictError,
} from '../utils/errors';
import { IUser, IUserResponse, UserRole } from '../types/user.types';

export class AuthService {
  private formatUserResponse(user: IUser): IUserResponse {
    return {
      id: (user._id as any).toString(),
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async register(email: string, password: string, role: UserRole = 'developer') {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError('User already exists with this email');
    }

    const user = await User.create({
      email,
      password,
      role,
    });

    const tokens = tokenService.generateTokens(user);

    await User.findByIdAndUpdate(user._id, {
      $push: { refreshTokens: tokens.refreshToken },
    });

    return {
      user: this.formatUserResponse(user),
      ...tokens,
    };
  }

  async login(email: string, password: string) {
    const user = await User.findOne({ email }).select('+password +refreshTokens');
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const tokens = tokenService.generateTokens(user);

    await User.findByIdAndUpdate(user._id, {
      $push: { refreshTokens: tokens.refreshToken },
    });

    return {
      user: this.formatUserResponse(user),
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = tokenService.verifyRefreshToken(refreshToken);

      const user = await User.findById(payload.userId).select('+refreshTokens');
      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      if (!user.refreshTokens.includes(refreshToken)) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      const newAccessToken = tokenService.generateAccessToken(user);

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  async logout(userId: string, refreshToken: string) {
    await User.findByIdAndUpdate(userId, {
      $pull: { refreshTokens: refreshToken },
    });
  }

  async getUserById(userId: string): Promise<IUserResponse> {
    const user = await User.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }
    return this.formatUserResponse(user);
  }
}

export const authService = new AuthService();
