import bcrypt from 'bcryptjs';

export class PasswordUtil {
  private static readonly SALT_ROUNDS = 10;

  // Хеширование пароля
  static async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  // Проверка пароля
  static async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Валидация силы пароля
  static validate(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Пароль должен содержать минимум 8 символов');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Пароль должен содержать хотя бы одну заглавную букву');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Пароль должен содержать хотя бы одну строчную букву');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Пароль должен содержать хотя бы одну цифру');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Пароль должен содержать хотя бы один специальный символ');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Генерация случайного пароля
  static generateRandom(length = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  }
}
