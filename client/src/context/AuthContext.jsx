import { useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, getCurrentUser, logoutUser } from '../api/auth.js';
import { LS_TOKEN, LS_USER } from '../utils/constants.js';
import { initDB } from '../db/indexedDB.js';
import { AuthContext } from './authContext.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize IndexedDB
        await initDB();
        
        // Check for existing token
        const savedToken = localStorage.getItem(LS_TOKEN);
        const savedUser = localStorage.getItem(LS_USER);
        
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          setIsAuthenticated(true);
          
          // Verify token is still valid
          try {
            const { data } = await getCurrentUser();
            setUser(data.user);
            localStorage.setItem(LS_USER, JSON.stringify(data.user));
          } catch (error) {
            console.log(error)
            handleLogout();
          }
        }
      } catch (error) {
        console.error('❌ Auth initialization failed:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initialize();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Login
  const login = useCallback(async (credentials) => {
    try {
      const { data } = await loginUser(credentials);
      
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      
      localStorage.setItem(LS_TOKEN, data.token);
      localStorage.setItem(LS_USER, JSON.stringify(data.user));
      
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Register
  const register = useCallback(async (userData) => {
    try {
      const { data } = await registerUser(userData);
      
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      
      localStorage.setItem(LS_TOKEN, data.token);
      localStorage.setItem(LS_USER, JSON.stringify(data.user));
      
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Logout
  const handleLogout = useCallback(() => {
    logoutUser();
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // Update user
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem(LS_USER, JSON.stringify(updatedUser));
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    logout: handleLogout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}