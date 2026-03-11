import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper: unwrap user data jika tersimpan dalam format response { success, data: {...} }
  const unwrapUser = (raw) => {
    if (!raw) return null;
    if (raw.success && raw.data) return raw.data;
    return raw;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        const userData = unwrapUser(parsed);

        if (userData && userData.role) {
          // Data valid, simpan dalam format bersih dan set user
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
          setLoading(false);
          // Validasi ke server di background (non-blocking)
          validateUserWithServer(false);
        } else {
          // Tidak ada role, paksa ambil dari server
          validateUserWithServer(true);
        }
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const validateUserWithServer = async (setLoadingWhenDone = false) => {
    try {
      const response = await getCurrentUser();
      // Unwrap jika response berbentuk { success, data: {...} }
      const serverUser = unwrapUser(response.data);
      setUser(serverUser);
      localStorage.setItem('user', JSON.stringify(serverUser));
    } catch (error) {
      console.error('User validation failed:', error);
      const status = error?.response?.status;
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
      // Error selain 401 (network, server down) -> user tetap login dari localStorage
    } finally {
      if (setLoadingWhenDone) {
        setLoading(false);
      }
    }
  };

  const loadUser = async () => {
    try {
      const response = await getCurrentUser();
      const serverUser = unwrapUser(response.data);
      setUser(serverUser);
      localStorage.setItem('user', JSON.stringify(serverUser));
    } catch (error) {
      console.error('Failed to load user:', error);
      const status = error?.response?.status;
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    }
  };

  const login = (token, userData) => {
    const cleanUser = unwrapUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(cleanUser));
    setUser(cleanUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    loadUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isPetugas: user?.role === 'petugas',
    isUser: user?.role === 'user',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};