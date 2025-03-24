import axios from 'axios';

// API URL configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5025';

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

// Helper function to get car logo based on brand
function getCarLogo(brand) {
    if (!brand) return 'https://www.carlogos.org/car-logos/default-car-logo.png';
    
    const brandLower = brand.toLowerCase();
    const logoMap = {
        'toyota': 'https://www.carlogos.org/car-logos/toyota-logo.png',
        'honda': 'https://www.carlogos.org/car-logos/honda-logo.png',
        'ford': 'https://www.carlogos.org/car-logos/ford-logo.png',
        'bmw': 'https://www.carlogos.org/car-logos/bmw-logo.png',
        'audi': 'https://www.carlogos.org/car-logos/audi-logo.png',
        'volkswagen': 'https://www.carlogos.org/car-logos/volkswagen-logo.png',
        'mercedes': 'https://www.carlogos.org/car-logos/mercedes-benz-logo.png',
        'hyundai': 'https://www.carlogos.org/car-logos/hyundai-logo.png',
        'peugeot': 'https://www.carlogos.org/car-logos/peugeot-logo.png'
    };
    return logoMap[brandLower] || 'https://www.carlogos.org/car-logos/default-car-logo.png';
}

export async function getUserData() {
    try {
        const response = await axios.get(`${API_URL}/api/cars`);
        console.log('Cars response:', response.data);
        
        // Transform the car data to match our frontend structure
        const cars = response.data.map(car => ({
            id: car.id,
            brand: car.brand,
            model: car.model,
            year: car.year,
            licensePlate: car.licensePlate,
            isOwn: true,
            color: "N/A",
            isParking: car.isParked,
            logo: getCarLogo(car.brand),
            parkingSpot: null
        }));
        
        console.log('Transformed cars:', cars);
        
        return { 
            success: true, 
            data: {
                cars: cars,
                activeParkings: [] // We'll handle this separately if needed
            }
        };
    } catch (error) {
        console.error('Error getting user data:', error);
        console.error('Error response:', error.response?.data);
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

// Parkolás indítása
export async function startParking(carId, parkingSpotId) {
    try {
        console.log('Starting parking with raw data:', { carId, parkingSpotId });
        
        // Ensure both values are valid numbers
        const parsedCarId = parseInt(carId);
        const parsedSpotId = parseInt(parkingSpotId);
        
        if (isNaN(parsedCarId) || parsedCarId <= 0) {
            console.error('Invalid carId:', carId);
            return {
                success: false,
                error: 'Érvénytelen autó azonosító'
            };
        }
        
        if (isNaN(parsedSpotId) || parsedSpotId <= 0) {
            console.error('Invalid parkingSpotId:', parkingSpotId);
            return {
                success: false,
                error: 'Érvénytelen parkolóhely azonosító'
            };
        }
        
        const data = {
            carId: parsedCarId,
            parkingSpotId: parsedSpotId
        };
        
        console.log('Sending data to server:', data);
        console.log('Request URL:', `${API_URL}/api/parking/start`);
        
        const response = await axios.post(`${API_URL}/api/parking/start`, data, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Server response:', response.data);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('Error starting parking:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        console.error('Error headers:', error.response?.headers);
        return {
            success: false,
            error: error.response?.data || 'Hiba történt a parkolás indítása során.'
        };
    }
}

// Parkolás leállítása
export async function stopParking(carId) {
    try {
        console.log('Stopping parking for car:', carId);
        const response = await axios.post(`${API_URL}/api/parking/end`, {
            carId: parseInt(carId)
        }, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('Stop parking response:', response.data);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Error stopping parking:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        return { 
            success: false, 
            error: error.response?.data || 'Hiba történt a parkolás leállítása során.' 
        };
    }
}

function openParkingMap(car) {
    console.log('Opening parking map for car:', car);
    console.log('Car ID:', car.id);
    selectedCar = car;
    console.log('Selected car after assignment:', selectedCar);
    console.log('Selected car ID after assignment:', selectedCar?.id);
    showParkingMap = true;
}

async function handleStartParking(carId, parkingSpotId) {
    if (!parkingSpotId) {
        error = 'Nincs kiválasztva parkolóhely!';
        return;
    }
    
    try {
        const result = await startParking(carId, parkingSpotId);
        if (result.success) {
            // Frissítjük az autók listáját
            await loadCars();
        } else {
            error = result.error || 'Hiba történt a parkolás indítása során.';
        }
    } catch (err) {
        console.error('Error starting parking:', err);
        error = 'Hiba történt a parkolás indítása során.';
    }
}

async function handleStopParking(carId) {
    try {
        const result = await stopParking(carId);
        if (result.success) {
            // Frissítjük az autók listáját
            await loadCars();
        } else {
            error = result.error || 'Hiba történt a parkolás leállítása során.';
        }
    } catch (error) {
        console.error('Error stopping parking:', error);
        error = 'Hiba történt a parkolás leállítása során.';
    }
}