import { User } from '@prisma/client';
import crypto from 'crypto';
import { prisma } from '../config/database';
import { JwtUtil, TokenPair } from '../utils/jwt';
import { PasswordUtil } from '../utils/password';
import { AppError } from '../middleware/error-handler';

export class AuthService {
  // Вход пользователя
  static async login(email: string, password: string): Promise<{
    user: Partial<User>;
    tokens: TokenPair;
    sessionId: string;
  }> {
    // Ищем пользователя
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.password) {
      throw new AppError('Неверный email или пароль', 401, 'INVALID_CREDENTIALS');
    }

    // Проверяем пароль
    const isPasswordValid = await PasswordUtil.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Неверный email или пароль', 401, 'INVALID_CREDENTIALS');
    }

    // Проверяем, активен ли пользователь
    if (!user.isActive) {
      throw new AppError('Аккаунт деактивирован', 403, 'ACCOUNT_DISABLED');
    }

    // Генерируем токены
    const tokens = JwtUtil.generateTokenPair(user);

    // Создаем сессию
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 дней
      },
    });

    // Обновляем время последнего входа
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Убираем пароль из ответа
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens,
      sessionId: session.id,
    };
  }

  // Обновление токенов
  static async refreshTokens(refreshToken: string): Promise<TokenPair> {
    try {
      // Проверяем refresh token
      const payload = JwtUtil.verifyRefreshToken(refreshToken);

      // Проверяем сессию
      const session = await prisma.session.findFirst({
        where: {
          token: refreshToken,
          userId: payload.userId,
          expiresAt: { gt: new Date() },
        },
        include: { user: true },
      });

      if (!session) {
        throw new AppError('Недействительный refresh token', 401, 'INVALID_REFRESH_TOKEN');
      }

      if (!session.user.isActive) {
        throw new AppError('Аккаунт деактивирован', 403, 'ACCOUNT_DISABLED');
      }

      // Генерируем новые токены
      const tokens = JwtUtil.generateTokenPair(session.user);

      // Обновляем сессию
      await prisma.session.update({
        where: { id: session.id },
        data: {
          token: tokens.refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      return tokens;
    } catch (error) {
      throw new AppError('Недействительный refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }
  }

  // Выход пользователя
  static async logout(userId: number, sessionId?: string): Promise<void> {
    if (sessionId) {
      // Удаляем конкретную сессию
      await prisma.session.delete({
        where: { id: sessionId },
      });
    } else {
      // Удаляем все сессии пользователя
      await prisma.session.deleteMany({
        where: { userId },
      });
    }
  }

  // Запрос сброса пароля
  static async requestPasswordReset(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Не раскрываем информацию о существовании пользователя
      return;
    }

    // Генерируем токен сброса
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Сохраняем токен
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 часа
      },
    });

    // Здесь должна быть отправка email
    // await EmailService.sendPasswordResetEmail(user.email, resetToken);
    
    console.log(`Password reset token for ${user.email}: ${resetToken}`);
  }

  // Сброс пароля
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    // Хешируем токен
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Ищем пользователя с валидным токеном
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new AppError('Недействительный или истекший токен', 400, 'INVALID_TOKEN');
    }

    // Валидируем новый пароль
    const passwordValidation = PasswordUtil.validate(newPassword);
    if (!passwordValidation.isValid) {
      throw new AppError(
        'Пароль не соответствует требованиям',
        400,
        'INVALID_PASSWORD',
        { errors: passwordValidation.errors }
      );
    }

    // Хешируем новый пароль
    const hashedPassword = await PasswordUtil.hash(newPassword);

    // Обновляем пароль и очищаем токен
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    // Удаляем все сессии пользователя
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });
  }
}
