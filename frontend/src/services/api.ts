import axios from 'axios';
import { AuthTokens } from '@/types';


// Instance of axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Axios interceptor function will run before each request is sent.
api.interceptors.request.use(
  (config) => {
    // get the tokens from localStorage
    const tokensString = localStorage.getItem('authTokens');
    if (tokensString) {
      const tokens: AuthTokens = JSON.parse(tokensString);
      // If an access token exists, we add it to the request's Authorization header.
      // Django backend will use this header to authenticate the user.
      config.headers.Authorization = `Bearer ${tokens.access}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;