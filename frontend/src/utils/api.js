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

// Response interceptor untuk menangani error globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Jika token tidak valid atau expired (401)
    if (error.response && error.response.status === 401) {
      console.warn('Session expired or unauthorized. Redirecting to login...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Gunakan window.location untuk redirect (alternatif redirect di non-component)
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login?expired=true';
      }
    }
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
export const deleteInstrumentImage = (id) => api.delete(`/instruments/${id}/image`);

// Rental functions
export const getRentals = (params = {}) => api.get('/rentals', { params });
export const getRental = (id) => api.get(`/rentals/${id}`);
export const createRental = (rentalData) => api.post('/rentals', rentalData);
export const createBulkRentals = async (rentalsData) => {
  // rentalsData is an array of rental objects which share same paymentMethod
  const paymentMethod = rentalsData.length > 0 ? rentalsData[0].paymentMethod : 'cash';
  const response = await api.post('/rentals/bulk', {
    rentals: rentalsData,
    paymentMethod: paymentMethod
  });
  return response.data;
};
export const updateRentalStatus = (id, status, extraData = {}) => api.put(`/rentals/${id}/status`, { status, ...extraData });
export const deleteRental = (id) => api.delete(`/rentals/${id}`);

// Category functions
export const getCategories = () => api.get('/categories');

// Fine functions
export const getFines = () => api.get('/fines');
export const getFineSettings = () => api.get('/fines/settings');
export const updateFineSettings = (settings) => api.put('/fines/settings', settings);
export const calculateFine = (id, data) => api.post(`/fines/${id}/calculate`, data);
export const markFinePaid = (id) => api.put(`/fines/${id}/pay`);
export const getFineStats = () => api.get('/fines/stats');

// Notification functions
export const getNotifications = () => api.get('/notifications');
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);
export const clearAllNotifications = () => api.put('/notifications/clear');
