import axios from 'axios';
import { user, isAuthenticated } from './store';

// API URL configuration
export const API_URL = import.meta.env.VITE_API_URL;

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Create axios instance with interceptors
const apiClient = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add response interceptor to handle session expiration
apiClient.interceptors.response.use(
    (response) => {
        // Check if the response contains user data with expiresAt
        if (response.data && response.data.expiresAt) {
            const expiresAt = new Date(response.data.expiresAt);
            const now = new Date();
            
            // If the session has expired, clear user data and redirect
            if (expiresAt < now) {
                console.log('Session expired, clearing user data');
                user.set(null);
                isAuthenticated.set(false);
                localStorage.removeItem('user');
                window.location.href = '/';
            }
        }
        return response;
    },
    (error) => {
        console.error('API Error:', error);
        
        // Handle 401 (Unauthorized) errors
        if (error.response?.status === 401) {
            console.log('Session expired, clearing user data');
            user.set(null);
            isAuthenticated.set(false);
            localStorage.removeItem('user');
            window.location.href = '/';
        }
        
        return Promise.reject(error);
    }
);

// Export the configured axios instance
export default apiClient; 