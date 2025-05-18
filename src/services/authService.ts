import axios from 'axios';

const API_URL = 'http://localhost:3300/api';

// Define user and auth types
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  subscription?: {
    isActive: boolean;
    plan: string;
    endDate: string | null;
  };
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// Create a new user
export const register = async (userData: { name: string; email: string; password: string; phone: string }) => {
  const response = await axios.post(`${API_URL}/users/register`, userData);
  return response.data;
};

// Login a user
export const login = async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
  const response = await axios.post(`${API_URL}/users/login`, credentials);
  
  // Save token to localStorage
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  
  return response.data;
};

// Logout the current user
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Get the current user from localStorage
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Get the authorization header
export const authHeader = () => {
  const token = localStorage.getItem('token');
  
  if (token) {
    return { Authorization: `Bearer ${token}` };
  } else {
    return {};
  }
};

// Check if the user is authenticated
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

// Get user profile
export const getUserProfile = async () => {
  const response = await axios.get(`${API_URL}/users/profile`, { headers: authHeader() });
  
  // Update local storage with fresh user data
  localStorage.setItem('user', JSON.stringify(response.data.user));
  
  return response.data;
};
