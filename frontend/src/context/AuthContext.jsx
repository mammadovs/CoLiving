import { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import { apiClient } from '../api/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const decoded = jwtDecode(token);
          // Backend-dən asılı olaraq id fərqli field-də gələ bilər
          const userId = decoded.user_id || decoded.sub;
          if (userId) {
            const userData = await apiClient(`/users/${userId}`);
            setUser(userData);
          }
        } catch (error) {
          console.error('User yüklənərkən xəta:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (username, password) => {
    setIsLoading(true);
    try {
      const data = await apiClient('/login', {
        method: 'POST',
        body: { username, password }
      });
      
      // Token-in access_token adıyla qayıtdığını fərz edirik
      const accessToken = data.access_token || data.token;
      
      if (accessToken) {
        setToken(accessToken);
        localStorage.setItem('token', accessToken);
        
        const decoded = jwtDecode(accessToken);
        const userId = decoded.user_id || decoded.sub;
        
        const userData = await apiClient(`/users/${userId}`);
        setUser(userData);
        return userData;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload) => {
    return await apiClient('/users/', {
      method: 'POST',
      body: payload
    });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  // Profil edit-dən sonra user state-ini yeniləmək üçün
  const refreshUser = async () => {
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      const userId = decoded.user_id || decoded.sub;
      const userData = await apiClient(`/users/${userId}`);
      setUser(userData);
      return userData;
    } catch (err) {
      console.error('refreshUser xəta:', err);
    }
  };

  // Hesabı sil
  const deleteAccount = async () => {
    await apiClient('/users/me', { method: 'DELETE' });
    logout();
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, register, refreshUser, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
