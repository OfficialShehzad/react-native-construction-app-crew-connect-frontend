// frontend/api/axios.js
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

// For React Native development, use your computer's IP address instead of localhost
// Replace this IP with your actual computer's IP address
// You can find your IP by running 'ipconfig' in Windows Command Prompt
const API_URL = "http://10.55.5.166:5000";

const api = axios.create({
  baseURL: `${API_URL}/api`, // all endpoints start with /api
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token for protected routes
api.interceptors.request.use(
  async (config) => {
    // List of routes that don't need authentication
    const publicRoutes = ['/auth/login', '/auth/register'];
    
    // Check if this is a public route
    const isPublicRoute = publicRoutes.some(route => config.url?.includes(route));
    
    // Only add token for protected routes
    if (!isPublicRoute) {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.log('Error getting token from AsyncStorage:', error);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      try {
        await AsyncStorage.removeItem('authToken');
        // You can add navigation logic here if needed
        console.log('Token expired, please login again');
      } catch (error) {
        console.log('Error removing token:', error);
      }
    }
    return Promise.reject(error);
  }
);

// Helper functions for token management
export const setAuthToken = async (token) => {
  try {
    await AsyncStorage.setItem('authToken', token);
    console.log('Token saved successfully');
  } catch (error) {
    console.log('Error saving token:', error);
  }
};

export const removeAuthToken = async () => {
  try {
    await AsyncStorage.removeItem('authToken');
    console.log('Token removed successfully');
  } catch (error) {
    console.log('Error removing token:', error);
  }
};

export const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem('authToken');
  } catch (error) {
    console.log('Error getting token:', error);
    return null;
  }
};

export default api;
