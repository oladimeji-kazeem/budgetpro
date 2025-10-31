import axios from 'axios';

const API_URL = 'http://localhost:8000/api/'; // Your Django API base URL

/**
 * NOTE: You will need to create these corresponding endpoints in Django REST Framework.
 * - `users/register/`
 * - `token/` (e.g., using Simple JWT for login)
 * - `users/requests/` (for the admin dashboard)
 */

const register = (userData) => {
    return axios.post(API_URL + 'users/register/', userData);
};

const login = (email, password) => {
    // Assuming you use DRF's Simple JWT for token-based auth
    return axios.post(API_URL + 'token/', { email, password });
};

const getAccessRequests = (authToken) => {
    return axios.get(API_URL + 'users/requests/', {
        headers: { Authorization: `Bearer ${authToken}` }
    });
};

const authService = {
    register,
    login,
    getAccessRequests,
};

export default authService;