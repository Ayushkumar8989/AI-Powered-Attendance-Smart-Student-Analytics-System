export const jwtConfig = {
  accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'access_secret_key',
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'refresh_secret_key',
  accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};
