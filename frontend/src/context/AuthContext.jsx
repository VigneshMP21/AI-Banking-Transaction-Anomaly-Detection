import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_BASE_URL = 'http://localhost:8000';

const DEFAULT_DEMO_USERS = [
  {
    id: 1,
    name: 'Alex Vance',
    email: 'alex.vance@bankguard.ai',
    password: 'BankGuard2026!',
    phone: '+1 (555) 234-8901',
    role: 'Chief Risk Analyst',
    account_number: 'BG-8821-4902-7104',
    account_tier: 'Institutional Vault',
    balance: 4850000.00,
    currency: 'USD',
    risk_tier: 'LOW',
    kyc_verified: true,
    two_factor_enabled: true,
    badge: 'Risk Ops Level-3'
  },
  {
    id: 2,
    name: 'Elena Rostova',
    email: 'elena.rostova@bankguard.ai',
    password: 'BankGuard2026!',
    phone: '+44 20 7946 0912',
    role: 'Institutional Client',
    account_number: 'BG-3419-7721-0982',
    account_tier: 'Premier Business',
    balance: 890000.00,
    currency: 'EUR',
    risk_tier: 'LOW',
    kyc_verified: true,
    two_factor_enabled: true,
    badge: 'Tier-1 Treasury'
  },
  {
    id: 3,
    name: 'David Miller',
    email: 'david.miller@audits.bankguard.ai',
    password: 'BankGuardAudit2026!',
    phone: '+41 22 730 5111',
    role: 'Compliance Auditor',
    account_number: 'BG-1094-5582-3490',
    account_tier: 'Tier-1 Checking',
    balance: 250000.00,
    currency: 'USD',
    risk_tier: 'LOW',
    kyc_verified: true,
    two_factor_enabled: true,
    badge: 'GDPR / Basel III'
  }
];

function getInitialPage() {
  const hash = window.location.hash.replace('#/', '').replace('#', '').trim().toLowerCase();
  if (['signin', 'login'].includes(hash)) return 'signin';
  if (['signup', 'register'].includes(hash)) return 'signup';
  if (['portal', 'dashboard'].includes(hash)) return 'portal';
  if (['db-config', 'db'].includes(hash)) return 'db-config';
  return 'home';
}

export function AuthProvider({ children }) {
  const [currentPage, setCurrentPage] = useState(getInitialPage);
  const normalizeUser = (u) => {
    if (!u) return null;
    return {
      ...u,
      name: u.name || u.full_name || u.username || 'User',
      full_name: u.full_name || u.name || u.username || 'User'
    };
  };

  const [user, setUserState] = useState(() => {
    const saved = localStorage.getItem('bankguard_auth_user') || localStorage.getItem('aegis_auth_user');
    try {
      return saved ? normalizeUser(JSON.parse(saved)) : null;
    } catch {
      return null;
    }
  });

  const setUser = (u) => {
    const norm = normalizeUser(u);
    setUserState(norm);
    if (norm) {
      localStorage.setItem('bankguard_auth_user', JSON.stringify(norm));
    } else {
      localStorage.removeItem('bankguard_auth_user');
      localStorage.removeItem('aegis_auth_user');
    }
  };
  const [token, setToken] = useState(() => localStorage.getItem('bankguard_auth_token') || localStorage.getItem('aegis_auth_token') || null);
  const [dbStatus, setDbStatus] = useState({
    connected: false,
    database_type: 'PostgreSQL (pgAdmin 4)',
    host: 'localhost',
    port: '5432',
    database: 'sample_bank',
    message: 'Checking connection...',
    user_count: 3,
    transaction_count: 12
  });
  const [isDbLoading, setIsDbLoading] = useState(false);

  // Sync hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const page = getInitialPage();
      setCurrentPage(page);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (page) => {
    setCurrentPage(page);
    if (page === 'home') {
      window.location.hash = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.location.hash = `#/${page}`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const checkDbStatus = async () => {
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
          message: 'Backend server responded with error. Ensure PostgreSQL is initialized.'
        }));
      }
    } catch (e) {
      setDbStatus((prev) => ({
        ...prev,
        connected: false,
        message: 'Backend offline or connecting to PostgreSQL port 5432.'
      }));
    } finally {
      setIsDbLoading(false);
    }
  };

  useEffect(() => {
    checkDbStatus();
    const interval = setInterval(checkDbStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const signIn = async (identifier, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setToken(data.access_token);
        localStorage.setItem('bankguard_auth_user', JSON.stringify(data.user));
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
      (u) => (u.email.toLowerCase() === cleanIdent || u.name.toLowerCase().replace(' ', '_') === cleanIdent)
    );

    if (foundDemo && (password === foundDemo.password || password === '123456' || password.length >= 6)) {
      setUser(foundDemo);
      const fakeToken = `bankguard_demo_jwt_${Date.now()}`;
      setToken(fakeToken);
      localStorage.setItem('bankguard_auth_user', JSON.stringify(foundDemo));
      localStorage.setItem('bankguard_auth_token', fakeToken);
      return { success: true, user: foundDemo };
    }

    if (cleanIdent.length >= 3 && password.length >= 6) {
      const generatedUser = {
        id: Math.floor(Math.random() * 1000) + 10,
        full_name: cleanIdent.toUpperCase(),
        name: cleanIdent.toUpperCase(),
        email: cleanIdent.includes('@') ? cleanIdent : `${cleanIdent}@bankguard.ai`,
        username: cleanIdent.replace('@', '_'),
        phone: '+1 (555) 839-2041',
        role: 'User',
        account_number: `BG-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        account_tier: 'Standard',
        balance: 150000.00,
        currency: 'USD',
        risk_tier: 'LOW',
        kyc_verified: true,
        two_factor_enabled: true
      };
      setUser(generatedUser);
      const fakeToken = `bankguard_demo_jwt_${Date.now()}`;
      setToken(fakeToken);
      localStorage.setItem('bankguard_auth_user', JSON.stringify(generatedUser));
      localStorage.setItem('bankguard_auth_token', fakeToken);
      return { success: true, user: generatedUser };
    }

    throw new Error('Invalid email/username or password. Please try again.');
  };

  const signUp = async (formData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setToken(data.access_token);
        localStorage.setItem('bankguard_auth_user', JSON.stringify(data.user));
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
        phone: formData.phone || '+1 (555) 019-2834',
        role: formData.role || 'User',
        account_number: `BG-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        account_tier: 'Standard',
        balance: 150000.00,
        currency: 'USD',
        risk_tier: 'LOW',
        kyc_verified: true,
        two_factor_enabled: true
      };

      setUser(newUser);
      const fakeToken = `bankguard_demo_jwt_${Date.now()}`;
      setToken(fakeToken);
      localStorage.setItem('bankguard_auth_user', JSON.stringify(newUser));
      localStorage.setItem('bankguard_auth_token', fakeToken);
      return { success: true, user: newUser };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('bankguard_auth_user');
    localStorage.removeItem('bankguard_auth_token');
    localStorage.removeItem('aegis_auth_user');
    localStorage.removeItem('aegis_auth_token');
  };

  const testDbConnection = async (credentials) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/db/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const data = await res.json();
      if (res.ok) {
        await checkDbStatus();
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.detail || 'Connection failed' };
      }
    } catch (e) {
      return {
        success: false,
        message: 'FastAPI Backend is not reachable at http://localhost:8000. Start backend with `python -m uvicorn main:app --reload`.'
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
        signIn,
        signUp,
        logout,
        dbStatus,
        isDbLoading,
        checkDbStatus,
        testDbConnection,
        demoUsers: DEFAULT_DEMO_USERS
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
