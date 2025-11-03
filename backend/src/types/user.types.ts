import { Document } from 'mongoose';

export type UserRole = 'admin' | 'developer' | 'viewer';

export interface IUser extends Document {
  email: string;
  password: string;
  role: UserRole;
  refreshTokens: string[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserResponse {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}
