import { Response } from 'express';
import { ApiResponse } from '../types';

export class ApiResponseUtil {
  static success<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode = 200
  ): Response<ApiResponse<T>> {
    return res.status(statusCode).json({
      success: true,
      data,
      ...(message && { message }),
    });
  }

  static error(
    res: Response,
    code: string,
    message: string,
    statusCode = 400,
    details?: any
  ): Response<ApiResponse> {
    return res.status(statusCode).json({
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
    });
  }

  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number
  ): Response<ApiResponse<T[]>> {
    return res.status(200).json({
      success: true,
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }
}
