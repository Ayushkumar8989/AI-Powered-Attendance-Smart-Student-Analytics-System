import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';
import { IUser } from '../types/user.types';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export class TokenService {
  generateAccessToken(user: IUser): string {
    const payload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, jwtConfig.accessTokenSecret, {
      expiresIn: jwtConfig.accessTokenExpiresIn,
    });
  }

  generateRefreshToken(user: IUser): string {
    const payload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, jwtConfig.refreshTokenSecret, {
      expiresIn: jwtConfig.refreshTokenExpiresIn,
    });
  }

  verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, jwtConfig.accessTokenSecret) as TokenPayload;
  }

  verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, jwtConfig.refreshTokenSecret) as TokenPayload;
  }

  generateTokens(user: IUser) {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
    };
  }
}

export const tokenService = new TokenService();
