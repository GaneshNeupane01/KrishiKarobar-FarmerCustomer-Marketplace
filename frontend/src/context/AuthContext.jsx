import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiUrl } from '../api/baseUrl';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { userType, profile, ... }
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from backend
  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/profile/'), {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (!res.ok) throw new Error('Not authenticated');
      const data = await res.json();
      setUser({
        userType: data.userType || (data.profile && data.profile.userType),
        profile: data.profile || data,
      });
      setIsAuthenticated(true);
    } catch (e) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // For login: set token, then fetch user
  const login = async (token) => {
    localStorage.setItem('token', token);
    await fetchUser();
  };

  // For logout: clear token and user
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    userType: user?.userType,
    profile: user?.profile,
    isAuthenticated,
    loading,
    fetchUser,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 