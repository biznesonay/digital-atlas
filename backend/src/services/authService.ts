// src/services/authService.ts
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { generateTokens } from '../utils/jwt';
import { SafeUser } from '../types';

export class AuthService {
  static async login(email: string, password: string) {
    // Находим пользователя
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user || !user.password) {
      throw new Error('Неверный email или пароль');
    }

    if (!user.isActive) {
      throw new Error('Аккаунт деактивирован');
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Неверный email или пароль');
    }

    // Обновляем время последнего входа
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Генерируем токены
    const tokens = generateTokens({
      id: user.id,
      email: user.email,
      role: user.role
    });

    // Создаем сессию
    await prisma.session.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 дней
      }
    });

    // Убираем пароль из ответа
    const { password: _, ...safeUser } = user;

    return {
      user: safeUser as SafeUser,
      ...tokens
    };
  }

  static async logout(userId: number, refreshToken: string) {
    await prisma.session.deleteMany({
      where: {
        userId,
        token: refreshToken
      }
    });
  }

  static async refreshTokens(refreshToken: string) {
    const session = await prisma.session.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!session || session.expiresAt < new Date()) {
      throw new Error('Недействительный refresh token');
    }

    // Удаляем старую сессию
    await prisma.session.delete({
      where: { id: session.id }
    });

    // Генерируем новые токены
    const tokens = generateTokens({
      id: session.user.id,
      email: session.user.email,
      role: session.user.role
    });

    // Создаем новую сессию
    await prisma.session.create({
      data: {
        userId: session.user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    return tokens;
  }
}