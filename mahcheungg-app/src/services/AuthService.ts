import axios from 'axios';

interface AuthResponse {
  userId: string;
  email: string;
  displayName: string;
  token: string;
  photoURL?: string;
}

class AuthService {
  private static instance: AuthService;
  private token: string | null = null;
  private baseUrl: string = 'http://localhost:3001/api/auth';

  private constructor() {
    // Load token from localStorage
    this.token = localStorage.getItem('auth_token');
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${this.baseUrl}/login`, { email, password });
      const data = response.data;

      // Save token to localStorage
      localStorage.setItem('auth_token', data.token);
      this.token = data.token;

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  public async register(email: string, password: string, displayName: string): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${this.baseUrl}/register`, { email, password, displayName });
      const data = response.data;

      // Save token to localStorage
      localStorage.setItem('auth_token', data.token);
      this.token = data.token;

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  public async logout(): Promise<void> {
    // Remove token from localStorage
    localStorage.removeItem('auth_token');
    this.token = null;
  }

  public async getCurrentUser(): Promise<AuthResponse | null> {
    if (!this.token) {
      return null;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/profile`, {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      // If the token is invalid, clear it
      localStorage.removeItem('auth_token');
      this.token = null;
      return null;
    }
  }

  public async updateProfile(displayName: string, photoURL?: string): Promise<AuthResponse> {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await axios.put(
        `${this.baseUrl}/profile`,
        { displayName, photoURL },
        {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  public isAuthenticated(): boolean {
    return !!this.token;
  }
}

export default AuthService;
