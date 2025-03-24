import axios from 'axios';

// API URL configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5025';

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const defaultOptions = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    };

    try {
        const response = await fetch(url, { ...defaultOptions, ...options });
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }
        
        return data;
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
}

export async function register(user) {
    try {
        const response = await axios.post(`${API_URL}/api/users/register`, user);
        console.log('Registration response:', response.data);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Registration error:', error.response?.data || error);
        return { success: false, error: error.response?.data || 'Registration failed' };
    }
}

export async function login(email, password) {
    try {
        const response = await axios.post(`${API_URL}/api/users/login`, { email, password });
        console.log('Login response:', response.data);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Login error:', error.response?.data || error);
        return { success: false, error: error.response?.data || 'Login failed' };
    }
}

export async function logout() {
    try {
        const response = await axios.post(`${API_URL}/api/users/logout`);
        console.log('Logout response:', response.data);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Logout error:', error.response?.data || error);
        return { success: false, error: error.response?.data || 'Logout failed' };
    }
}

export async function getUserData() {
    try {
        const response = await axios.get(`${API_URL}/api/test/userdata`);
        console.log('User data response:', response.data);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Get user data error:', error.response?.data || error);
        return { success: false, error: error.response?.data || 'Failed to get user data' };
    }
}

export async function createCar(car) {
    try {
        const response = await axios.post(`${API_URL}/api/cars`, car);
        console.log('Create car response:', response.data);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Create car error:', error.response?.data || error);
        return { success: false, error: error.response?.data || 'Failed to create car' };
    }
}