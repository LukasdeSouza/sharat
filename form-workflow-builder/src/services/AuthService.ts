import api from './api';

export interface User {
  id: string;
  email: string;
  company_id: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER' | 'APPROVER' | 'admin';
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export const authService = {
  async register(
    company_name: string,
    email: string,
    password: string
  ): Promise<AuthResponse> {
    const response = await api.post('/auth/register', {
      company_name,
      email,
      password,
    });
    return response.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get('/auth/me');
      return response.data.user;
    } catch {
      return null;
    }
  },

  logout() {
    localStorage.removeItem('auth_token');
  },

  setToken(token: string) {
    localStorage.setItem('auth_token', token);
  },

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
