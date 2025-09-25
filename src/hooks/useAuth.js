import { useState, useEffect, useCallback } from 'react';
import { isAuthenticated, getCurrentUser, signOut } from '../utils/auth';
import { authService } from '@/services/authService';

/**
 * Custom hook for authentication management
 * No Context API - simple state management
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  // Initialize authentication state
  const initializeAuth = useCallback(() => {
    try {
      // console.log('Initializing authentication...');
      
      // Check if user is authenticated using cookie token
      const authenticated = isAuthenticated();
      // console.log('Is authenticated:', authenticated);
      
      if (authenticated) {
        // Get user data from token
        const currentUser = getCurrentUser();
        // console.log('Current user from token:', currentUser);
        
        if (currentUser) {
          setUser(currentUser);
          setIsAuth(true);
        } else {
          // Token exists but user data is invalid
          // console.log('Invalid user data, signing out...');
          signOut();
        }
      } else {
        // Not authenticated
        setUser(null);
        setIsAuth(false);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      setUser(null);
      setIsAuth(false);
      // Clear invalid tokens
      signOut();
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Set up periodic token validation
  useEffect(() => {
    if (!isAuth) return;

    const validateToken = () => {
      const authenticated = isAuthenticated();
      if (!authenticated) {
        console.error('Token validation failed, signing out...');
        signOut();
      }
    };

    // // Check token every 5 minutes
    // const interval = setInterval(validateToken, 5 * 60 * 1000);
    
    // return () => clearInterval(interval);
  }, [isAuth]);

  const signin = useCallback(async (credentials) => {
    try {
      setLoading(true);
      // console.log('Attempting signin...');
      
      const result = await authService.signin(credentials);
      
      if (result.success) {
        // console.log('Signin successful, getting user data...');
        
        // Get user data from token after successful signin
        const currentUser = getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuth(true);
          // console.log('Current user:', currentUser);
        } else {
          console.error('Failed to get user data after signin');
          return { success: false, error: 'Failed to get user data' };
        }
        
        return { success: true, data: result.data };
      } else {
        console.error('Signin failed:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Signin error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (userData) => {
    try {
      setLoading(true);
      // console.log('Attempting signup...');
      
      const result = await authService.signup(userData);
      
      if (result.success) {
        // console.log('Signup successful, getting user data...');
        
        // Get user data from token after successful signup
        const currentUser = getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuth(true);
          console.log('Current user:', currentUser);
        } else {
          console.error('Failed to get user data after signup');
          return { success: false, error: 'Failed to get user data' };
        }
        
        return { success: true, data: result.data };
      } else {
        console.error('Signup failed:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSignout = useCallback(() => {
    console.log('Signing out user...');
    signOut();
    setUser(null);
    setIsAuth(false);
  }, []);

  const updateUser = useCallback((userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  }, []);

  const refreshAuth = useCallback(() => {
    // console.log('Refreshing authentication...');
    initializeAuth();
  }, [initializeAuth]);

  return {
    // State
    user,
    loading,
    isAuthenticated: isAuth,
    setUser,
    // Actions
    signin,
    signup,
    signout: handleSignout,
    updateUser,
    refreshAuth,
    
    // Utilities
    checkAuth: initializeAuth,
    
    // Computed properties
    isLoggedIn: isAuth && !!user,
    userId: user?.id,
    userEmail: user?.email,
    username: user?.username,
  };
};