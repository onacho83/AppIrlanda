import api from './api';
import type { LoginResponse, ApiResponse } from '../types';

export const authService = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const res = await api.post<ApiResponse<LoginResponse>>('/auth/login', {
      username,
      password,
    });
    return res.data.data!;
  },

  refresh: async (refreshToken: string): Promise<LoginResponse> => {
    const res = await api.post<ApiResponse<LoginResponse>>('/auth/refresh', {
      refreshToken,
    });
    return res.data.data!;
  },
};
