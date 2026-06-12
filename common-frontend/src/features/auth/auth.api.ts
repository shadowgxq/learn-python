import { request } from '../../shared/api';
import type { RegisterRequest, LoginRequest, TokenResponse, CurrentUser } from './auth.types';

export const authApi = {
  register(data: RegisterRequest) {
    return request<CurrentUser>({ url: '/v1/auth/register', method: 'POST', data });
  },

  login(data: LoginRequest) {
    return request<TokenResponse>({ url: '/v1/auth/login', method: 'POST', data });
  },

  me() {
    return request<CurrentUser>({ url: '/v1/auth/me' });
  },
};
