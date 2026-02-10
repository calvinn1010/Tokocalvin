import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor untuk menambahkan token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

// Auth functions
export const login = (data) => api.post('/auth/login', data);
export const register = (userData) => api.post('/auth/register', userData);
export const getCurrentUser = () => api.get('/auth/me');

// User functions
export const getUsers = () => api.get('/users');
export const getUser = (id) => api.get(`/users/${id}`);
export const createUser = (userData) => api.post('/users', userData);
export const updateUser = (id, userData) => api.put(`/users/${id}`, userData);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Instrument functions
export const getInstruments = () => api.get('/instruments');
export const getInstrument = (id) => api.get(`/instruments/${id}`);
export const createInstrument = (formData) => api.post('/instruments', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const updateInstrument = (id, formData) => api.put(`/instruments/${id}`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteInstrument = (id) => api.delete(`/instruments/${id}`);

// Rental functions
export const getRentals = () => api.get('/rentals');
export const getRental = (id) => api.get(`/rentals/${id}`);
export const createRental = (rentalData) => api.post('/rentals', rentalData);
export const updateRentalStatus = (id, status) => api.put(`/rentals/${id}/status`, { status });
export const deleteRental = (id) => api.delete(`/rentals/${id}`);

// Category functions
export const getCategories = () => api.get('/categories');
