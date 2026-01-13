import { LoginCredentials, LoginResponse } from '../types';

// const API_BASE_URL = 'https://gmo021.cansportsvg.com/api';
const API_BASE_URL = 'http://10.1.16.89/api';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/global-user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const text = await response.text();

      if (text.trim() === 'wrong') {
        throw new Error('Invalid username or password');
      }

      if (!response.ok) {
        throw new Error(text || 'Authentication failed');
      }

      try {
        return JSON.parse(text);
      } catch (err) {
        throw new Error('Invalid server response');
      }
    } catch (err: any) {
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        throw new Error('Invalid username or password');
      }
      throw err;
    }
  },
};
