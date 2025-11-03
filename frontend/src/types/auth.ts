export type UserRole = 'admin' | 'developer' | 'viewer';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  role?: UserRole;
}
