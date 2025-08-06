import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import { config } from '../config/app.config';

export interface TokenPayload {
  userId: number;
  email: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class JwtUtil {
  // Генерация пары токенов
  static generateTokenPair(user: User): TokenPair {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpire,
    });

    const refreshToken = jwt.sign(payload, config.jwtRefreshSecret, {
      expiresIn: config.jwtRefreshExpire,
    });

    return { accessToken, refreshToken };
  }

  // Проверка access токена
  static verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.jwtSecret) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  // Проверка refresh токена
  static verifyRefreshToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.jwtRefreshSecret) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  // Декодирование токена без проверки
  static decodeToken(token: string): TokenPayload | null {
    try {
      return jwt.decode(token) as TokenPayload;
    } catch {
      return null;
    }
  }
}
