import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const API_BASE_URL = 'http://localhost:8000';

const DEFAULT_DEMO_USERS = [
  {
    id: 1,
    name: 'Alex Vance',
    email: 'alex.vance@bankguard.ai',
    password: 'BankGuard2026!',
    phone: '+91 98201 44510',
    home_city: 'Mumbai, IN',
    role: 'Chief Risk Analyst',
    account_number: 'BG-8821-4902-7104',
    account_tier: 'Institutional Vault',
    balance: 4850000.0,
    currency: 'INR',
    risk_tier: 'LOW',
    kyc_verified: true,
    two_factor_enabled: true,
    badge: 'Risk Ops Level-3',
  },
  {
    id: 2,
    name: 'Elena Rostova',
    email: 'elena.rostova@bankguard.ai',
    password: 'BankGuard2026!',
    phone: '+91 98409 77210',
    home_city: 'Chennai, IN',
    role: 'User',
    account_number: 'BG-3419-7721-0982',
    account_tier: 'Premier Business',
    balance: 890000.0,
    currency: 'INR',
    risk_tier: 'LOW',
    kyc_verified: true,
    two_factor_enabled: true,
    badge: 'Tier-1 Treasury',
  },
];

function getInitialPage() {
  const hash = window.location.hash.replace('#/', '').replace('#', '').trim().toLowerCase();
  if (['signin', 'login'].includes(hash)) return 'signin';
  if (['signup', 'register'].includes(hash)) return 'signup';
  if (['portal', 'dashboard'].includes(hash)) return 'portal';
  if (['db-config', 'db'].includes(hash)) return 'db-config';
  return 'home';
}

function normalizeUser(u) {
  if (!u) return null;
  return {
    ...u,
    name: u.name || u.full_name || u.username || 'User',
    full_name: u.full_name || u.name || u.username || 'User',
  };
}

export function AuthProvider({ children }) {
  const [currentPage, setCurrentPage] = useState(getInitialPage);

  const [user, setUserState] = useState(() => {
    const saved = localStorage.getItem('bankguard_auth_user') || localStorage.getItem('aegis_auth_user');
    try {
      return saved ? normalizeUser(JSON.parse(saved)) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(
    () => localStorage.getItem('bankguard_auth_token') || localStorage.getItem('aegis_auth_token') || null
  );

  const [dbStatus, setDbStatus] = useState({
    connected: false,
    database_type: 'PostgreSQL (pgAdmin 4)',
    host: 'localhost',
    port: '5432',
    database: 'sample_bank',
    message: 'Checking connection...',
    user_count: 2,
    transaction_count: 3,
  });
  const [isDbLoading, setIsDbLoading] = useState(false);

  const updateUser = useCallback((u) => {
    const norm = normalizeUser(u);
    setUserState(norm);
    if (norm) {
      localStorage.setItem('bankguard_auth_user', JSON.stringify(norm));
    } else {
      localStorage.removeItem('bankguard_auth_user');
      localStorage.removeItem('aegis_auth_user');
    }
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPage(getInitialPage());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = useCallback((page) => {
    setCurrentPage(page);
    if (page === 'home') {
      window.location.hash = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.location.hash = `#/${page}`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const checkDbStatus = useCallback(async () => {
    setIsDbLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/db/status`, { signal: AbortSignal.timeout(3500) });
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data);
      } else {
        setDbStatus((prev) => ({
          ...prev,
          connected: false,
          message: 'Backend server responded with error. Ensure PostgreSQL is initialized.',
        }));
      }
    } catch {
      setDbStatus((prev) => ({
        ...prev,
        connected: false,
        message: 'Backend offline or connecting to PostgreSQL port 5432.',
      }));
    } finally {
      setIsDbLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(checkDbStatus, 0);
    const interval = setInterval(checkDbStatus, 15000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [checkDbStatus]);

  const apiFetch = useCallback(
    async (path, options = {}) => {
      const activeToken = token || localStorage.getItem('bankguard_auth_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      };
      if (activeToken) {
        headers.Authorization = `Bearer ${activeToken}`;
      }
      return fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
      });
    },
    [token]
  );

  const refreshProfile = useCallback(async () => {
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        updateUser(data);
        return data;
      }
    } catch {
      // Keep cached profile if backend unreachable
    }
    return null;
  }, [token, updateUser]);

  const signIn = async (identifier, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      if (res.ok) {
        const data = await res.json();
        updateUser(data.user);
        setToken(data.access_token);
        localStorage.setItem('bankguard_auth_token', data.access_token);
        return { success: true, user: data.user };
      } else {
        const errData = await res.json();
        throw new Error(errData.detail || 'Invalid email/username or password.');
      }
    } catch (e) {
      if (e.message && !e.message.includes('fetch') && !e.message.includes('network') && !e.message.includes('Failed to fetch')) {
        throw e;
      }
      console.warn('Backend API unreachable, checking demo profile...');
    }

    const cleanIdent = identifier.trim().toLowerCase();
    const foundDemo = DEFAULT_DEMO_USERS.find(
      (u) => u.email.toLowerCase() === cleanIdent || u.name.toLowerCase().replace(' ', '_') === cleanIdent
    );

    if (foundDemo && (password === foundDemo.password || password.length >= 6)) {
      updateUser(foundDemo);
      const fakeToken = `bankguard_demo_jwt_${Date.now()}`;
      setToken(fakeToken);
      localStorage.setItem('bankguard_auth_token', fakeToken);
      return { success: true, user: foundDemo };
    }

    throw new Error('Invalid email/username or password. Please try again.');
  };

  const signUp = async (formData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        updateUser(data.user);
        setToken(data.access_token);
        localStorage.setItem('bankguard_auth_token', data.access_token);
        return { success: true, user: data.user };
      } else {
        const err = await res.json();
        throw new Error(err.detail || 'Sign up failed');
      }
    } catch (e) {
      if (e.message && !e.message.includes('fetch') && !e.message.includes('network') && !e.message.includes('Failed to fetch')) {
        throw e;
      }

      const newUser = {
        id: Math.floor(Math.random() * 9000) + 100,
        full_name: formData.full_name,
        name: formData.full_name,
        email: formData.email,
        username: formData.username,
        phone: formData.phone || '+91 98400 00000',
        home_city: 'Chennai, IN',
        role: formData.role || 'User',
        account_number: `BG-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        account_tier: 'Standard',
        balance: 150000.0,
        currency: 'INR',
        risk_tier: 'LOW',
        kyc_verified: true,
        two_factor_enabled: true,
      };

      updateUser(newUser);
      const fakeToken = `bankguard_demo_jwt_${Date.now()}`;
      setToken(fakeToken);
      localStorage.setItem('bankguard_auth_token', fakeToken);
      return { success: true, user: newUser };
    }
  };

  const logout = () => {
    updateUser(null);
    setToken(null);
    localStorage.removeItem('bankguard_auth_token');
    localStorage.removeItem('aegis_auth_token');
  };

  const testDbConnection = async (credentials) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/db/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (res.ok) {
        await checkDbStatus();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.detail || 'Connection failed' };
    } catch {
      return {
        success: false,
        message: 'FastAPI Backend is not reachable at http://localhost:8000. Start backend with `python -m uvicorn main:app --reload`.',
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentPage,
        navigateTo,
        user,
        token,
        isAuthenticated: !!user,
        updateUser,
        refreshProfile,
        apiFetch,
        signIn,
        signUp,
        logout,
        dbStatus,
        isDbLoading,
        checkDbStatus,
        testDbConnection,
        demoUsers: DEFAULT_DEMO_USERS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
