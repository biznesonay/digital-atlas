import { Request, Response, NextFunction } from 'express';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({
        success: true,
        message: 'Login endpoint работает',
        data: {
          accessToken: 'test-token',
          user: {
            id: 1,
            email: 'admin@example.com',
            name: 'Admin',
            role: 'SUPER_ADMIN'
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    res.json({ success: true, message: 'Refresh endpoint' });
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    res.json({ success: true, message: 'Logout endpoint' });
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    res.json({ success: true, message: 'GetMe endpoint' });
  }
}

export const authController = new AuthController();
