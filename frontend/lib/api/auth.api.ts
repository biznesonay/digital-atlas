import { apiClient } from './client';
import { User, AuthResponse } from '@/types';

export class AuthAPI {
  static async login(email: string, password: string) {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    
    if (response.data) {
      apiClient.setAccessToken(response.data.accessToken);
    }
    
    return response;
  }

  static async logout() {
    const response = await apiClient.post('/auth/logout');
    apiClient.setAccessToken(null);
    return response;
  }

  static async getCurrentUser() {
    return apiClient.get<User>('/auth/me');
  }

  static async refreshToken() {
    return apiClient.post<{ accessToken: string }>('/auth/refresh');
  }
}
