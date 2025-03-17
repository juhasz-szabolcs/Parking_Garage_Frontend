import axios from 'axios';

const API_URL = 'https://localhost:7016';

// Configure axios to include credentials (cookies)
axios.defaults.withCredentials = true;

export async function register(user) {
    try {
        const response = await axios.post(`${API_URL}/api/users/register`, user);
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, error: error.response?.data || 'Registration failed' };
    }
}

export async function login(email, password) {
    try {
        const response = await axios.post(`${API_URL}/api/users/login`, { email, password }, {
            withCredentials: true
        });
        console.log(response.data);
        console.log(response.data.message);
        console.log(response.data.user);
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, error: error.response?.data || 'Login failed' };
    }
}

export async function logout() {
    try {
        const response = await axios.post(`${API_URL}/api/users/logout`);
        console.log(response.data);
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, error: error.response?.data || 'Logout failed' };
    }
}

export async function getUserData() {
    try {
        const response = await axios.get(`${API_URL}/api/test/userdata`);
        console.log(response.data);
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, error: error.response?.data || 'Failed to get user data' };
    }
}

export async function createCar(car) {
    try {
        const response = await axios.post(`${API_URL}/api/cars`, car);
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, error: error.response?.data || 'Failed to create car' };
    }
}