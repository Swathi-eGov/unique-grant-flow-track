import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '@/api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]                               = useState(null);
  const [isAuthenticated, setIsAuthenticated]         = useState(false);
  const [isLoadingAuth, setIsLoadingAuth]             = useState(true);
  // kept for interface compatibility — not used with JWT backend
  const [isLoadingPublicSettings]                     = useState(false);
  const [authError, setAuthError]                     = useState(null);
  const [appPublicSettings]                           = useState({ public_settings: {} });

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    if (!authApi.isLoggedIn()) {
      setIsLoadingAuth(false);
      setIsAuthenticated(false);
      return;
    }
    try {
      setIsLoadingAuth(true);
      const currentUser = await authApi.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      setAuthError(null);
    } catch (error) {
      authApi.logout();
      setIsAuthenticated(false);
      setAuthError({ type: 'auth_required', message: 'Session expired. Please log in again.' });
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = (shouldRedirect = true) => {
    authApi.logout();
    setUser(null);
    setIsAuthenticated(false);
    if (shouldRedirect) window.location.href = '/login';
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      checkAppState: checkUserAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
