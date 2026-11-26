import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  CreditCard,
  Search,
  Bell,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Users,
  FileText,
  Settings,
  LogOut,
  User as UserIcon,
  Layers,
  Cpu,
  RefreshCw,
  Zap,
  Lock,
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  Sliders,
  Download,
  Send,
  KeyRound,
  Landmark,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function formatMoney(amount, currency = 'INR') {
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₹';
  return `${symbol}${Number(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function decisionLabel(decision) {
  if (decision === 'BLOCKED_FROZEN') return 'Blocked & Frozen';
  if (decision === 'STEP_UP_MFA') return 'Step-Up OTP';
  return 'Auto-Cleared';
}

function riskBadgeStyle(decision) {
  if (decision === 'BLOCKED_FROZEN') {
    return 'bg-rose-50 text-rose-700 border border-rose-200';
  }
  if (decision === 'STEP_UP_MFA') {
    return 'bg-amber-50 text-amber-800 border border-amber-200';
  }
  return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
}

export default function BankingPortalPage() {
  const { user, logout, navigateTo, apiFetch, updateUser, refreshProfile } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [txStatusFilter, setTxStatusFilter] = useState('ALL');
  const [selectedTxModal, setSelectedTxModal] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Live Database State
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [portalUsers, setPortalUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [readAlertIds, setReadAlertIds] = useState(() => new Set());
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState(null);

  // Send Money / Fund Transfer State
  const [recipientMode, setRecipientMode] = useState('internal'); // 'internal' | 'external'
  const [transferForm, setTransferForm] = useState({
    recipientIdentifier: '',
    amount: '2500',
    channel: 'Transfer',
    location: user?.home_city || 'Chennai, IN',
    device: 'BankGuard Web Client',
    note: '',
  });
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferFeedback, setTransferFeedback] = useState(null);

  // Step-Up OTP Challenge Modal State
  const [otpModal, setOtpModal] = useState(null); // { reference_id, demo_otp_preview, amount, recipient }
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState(null);
  const [otpLoading, setOtpLoading] = useState(false);

  // Profile Edit & Password State
  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || user?.name || '',
    phone: user?.phone || '',
    home_city: user?.home_city || 'Chennai, IN',
  });
  const [profileStatus, setProfileStatus] = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [passwordStatus, setPasswordStatus] = useState(null);

  // Admin Analyze Transaction Lab State
  const [analyzeForm, setAnalyzeForm] = useState({
    amount: '85000',
    location: 'Mumbai, IN',
    channel: 'IMPS',
    beneficiary: 'Unverified Proxy Gateway',
  });
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const userName = user?.full_name || user?.name || 'User';
  const normalizedRole = (user?.role || '').toLowerCase();
  const isAdmin = [
    'analyst',
    'admin',
    'administrator',
    'chief risk analyst',
    'compliance auditor',
    'compliance',
  ].includes(normalizedRole);

  const effectiveTab =
    !isAdmin && ['users', 'ml-models', 'audit-logs', 'analyze', 'risk-analysis'].includes(activeTab)
      ? 'dashboard'
      : activeTab;

  const loadPortalData = useCallback(async () => {
    if (!user) return;
    setIsLoadingData(true);
    setDataError(null);
    try {
      const [sumRes, txRes, alertRes, recRes] = await Promise.all([
        apiFetch('/api/portal/summary'),
        apiFetch('/api/transactions?limit=50'),
        apiFetch('/api/alerts'),
        apiFetch('/api/users/recipients'),
      ]);

      if (sumRes.ok) {
        const sumData = await sumRes.json();
        setSummary(sumData);
      }
      if (txRes.ok) {
        const txData = await txRes.json();
        setTransactions(Array.isArray(txData) ? txData : []);
      }
      if (alertRes.ok) {
        const alertData = await alertRes.json();
        setAlerts(Array.isArray(alertData) ? alertData : []);
      }
      if (recRes.ok) {
        const recData = await recRes.json();
        const list = Array.isArray(recData) ? recData : [];
        setRecipients(list);
        setTransferForm((prev) => ({
          ...prev,
          recipientIdentifier: prev.recipientIdentifier || list[0]?.account_number || '',
        }));
      }

      if (isAdmin) {
        const [usersRes, auditRes] = await Promise.all([
          apiFetch('/api/users'),
          apiFetch('/api/security/audits?limit=25'),
        ]);
        if (usersRes.ok) setPortalUsers(await usersRes.json());
        if (auditRes.ok) setAuditLogs(await auditRes.json());
      }
    } catch {
      setDataError('Could not sync live data from FastAPI backend (port 8000).');
    } finally {
      setIsLoadingData(false);
    }
  }, [user, isAdmin, apiFetch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPortalData();
      refreshProfile();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadPortalData, refreshProfile]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-[#0A2540] mb-2">Session Required</h1>
          <p className="text-xs text-slate-600 mb-6">Please sign in to access your BankGuard AI banking portal.</p>
          <button
            type="button"
            onClick={() => navigateTo('signin')}
            className="w-full py-2.5 rounded-xl bg-[#0052CC] text-white font-semibold text-xs cursor-pointer"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  const unreadAlertsCount = alerts.filter((a) => !readAlertIds.has(a.id)).length;

  const markAllAlertsRead = () => {
    setReadAlertIds(new Set(alerts.map((a) => a.id)));
  };

  const handleToggleNotifications = () => {
    const nextOpen = !notificationsOpen;
    setNotificationsOpen(nextOpen);
    if (nextOpen && unreadAlertsCount > 0) {
      markAllAlertsRead();
    }
  };

  // Execute Real Transfer
  const handleSendTransfer = async (e) => {
    e.preventDefault();
    setTransferFeedback(null);

    const amt = parseFloat(transferForm.amount);
    if (!transferForm.recipientIdentifier.trim()) {
      setTransferFeedback({ type: 'error', message: 'Please select or enter a recipient account/name.' });
      return;
    }
    if (!amt || amt <= 0) {
      setTransferFeedback({ type: 'error', message: 'Enter a valid transfer amount greater than 0.' });
      return;
    }

    setTransferLoading(true);
    try {
      const res = await apiFetch('/api/transactions/transfer', {
        method: 'POST',
        body: JSON.stringify({
          recipient_identifier: transferForm.recipientIdentifier.trim(),
          amount: amt,
          channel: transferForm.channel,
          location: transferForm.location,
          device_fingerprint: transferForm.device,
          note: transferForm.note,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Transfer failed.');
      }

      if (data.updated_balance !== undefined) {
        updateUser({ ...user, balance: data.updated_balance });
      }

      if (data.requires_otp) {
        setOtpModal({
          reference_id: data.transaction.reference_id,
          demo_otp_preview: data.demo_otp_preview,
          amount: data.transaction.amount,
          recipient: data.transaction.recipient,
          risk_score: data.transaction.risk_score,
          reasons: data.transaction.anomaly_reasons,
        });
        setOtpCode('');
        setOtpError(null);
      } else if (data.transaction.decision === 'BLOCKED_FROZEN') {
        setTransferFeedback({
          type: 'blocked',
          message: `Transfer blocked by AI Risk Policy (Score: ${data.transaction.risk_score}/100). Your balance was not deducted.`,
          transaction: data.transaction,
        });
      } else {
        setTransferFeedback({
          type: 'success',
          message: `Transfer ${data.transaction.reference_id} completed! Risk score: ${data.transaction.risk_score}/100 (Auto-Cleared).`,
          transaction: data.transaction,
        });
      }

      await loadPortalData();
    } catch (err) {
      setTransferFeedback({ type: 'error', message: err.message });
    } finally {
      setTransferLoading(false);
    }
  };

  // Verify Step-Up OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpModal) return;
    setOtpLoading(true);
    setOtpError(null);

    try {
      const res = await apiFetch('/api/transactions/verify-otp', {
        method: 'POST',
        body: JSON.stringify({
          reference_id: otpModal.reference_id,
          otp_code: otpCode.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'OTP verification failed.');
      }

      updateUser({ ...user, balance: data.updated_balance });
      setOtpModal(null);
      setTransferFeedback({
        type: 'success',
        message: `Step-Up MFA verified! Transfer ${data.transaction.reference_id} completed.`,
        transaction: data.transaction,
      });
      await loadPortalData();
    } catch (err) {
      setOtpError(err.message);
      if (err.message.includes('blocked')) {
        await loadPortalData();
      }
    } finally {
      setOtpLoading(false);
    }
  };

  // Update Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileStatus(null);
    try {
      const res = await apiFetch('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Could not update profile.');
      updateUser(data);
      setProfileStatus({ type: 'success', message: 'Profile updated and saved to database.' });
    } catch (err) {
      setProfileStatus({ type: 'error', message: err.message });
    } finally {
      setProfileSaving(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordStatus(null);
    if (passwordForm.new_password.length < 6) {
      setPasswordStatus({ type: 'error', message: 'New password must be at least 6 characters.' });
      return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordStatus({ type: 'error', message: 'New passwords do not match.' });
      return;
    }
    try {
      const res = await apiFetch('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Password update failed.');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      setPasswordStatus({ type: 'success', message: 'Password changed successfully.' });
    } catch (err) {
      setPasswordStatus({ type: 'error', message: err.message });
    }
  };

  // Admin Risk Analyzer
  const handleRunAdminAnalysis = async (e) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const res = await apiFetch('/api/transactions/analyze', {
        method: 'POST',
        body: JSON.stringify({
          amount: parseFloat(analyzeForm.amount) || 50000,
          currency: user.currency || 'INR',
          channel: analyzeForm.channel,
          sender: userName,
          recipient: analyzeForm.beneficiary,
          location: analyzeForm.location,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Analysis failed.');
      setAnalysisResult(data);
      await loadPortalData();
    } catch (err) {
      setAnalysisResult({ error: err.message });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Export CSV Statement
  const handleExportCsv = () => {
    const headers = ['Reference ID', 'Direction', 'Sender', 'Recipient', 'Account', 'Channel', 'Location', 'Amount', 'Currency', 'Risk Score', 'Decision', 'Reasons', 'Date'];
    const rows = filteredTransactions.map((t) => [
      t.reference_id,
      t.direction,
      `"${t.sender}"`,
      `"${t.recipient}"`,
      t.recipient_account || '',
      t.channel,
      `"${t.location}"`,
      t.amount,
      t.currency,
      t.risk_score,
      t.decision,
      `"${(t.anomaly_reasons || '').replace(/"/g, '""')}"`,
      t.created_at || '',
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bankguard-transactions-${user.username || 'statement'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesStatus = txStatusFilter === 'ALL' || t.decision === txStatusFilter;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchesStatus;
    return (
      matchesStatus &&
      (t.reference_id?.toLowerCase().includes(q) ||
        t.recipient?.toLowerCase().includes(q) ||
        t.sender?.toLowerCase().includes(q) ||
        t.location?.toLowerCase().includes(q) ||
        t.channel?.toLowerCase().includes(q))
    );
  });

  // Compute dynamic SVG trend polyline coordinates
  const trendSeries = summary?.trend_series || [];
  const maxTrendVal = Math.max(1, ...trendSeries.map((d) => Math.max(d.normal, d.suspicious)));
  const trendCoords = trendSeries.map((d, idx) => {
    const x = trendSeries.length > 1 ? 55 + (idx * 555) / (trendSeries.length - 1) : 320;
    const yNorm = 170 - (d.normal / maxTrendVal) * 130;
    const ySusp = 170 - (d.suspicious / maxTrendVal) * 130;
    return { ...d, x, yNorm, ySusp };
  });
  const normalPath = trendCoords.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.yNorm}`).join(' ');
  const suspPath = trendCoords.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.ySusp}`).join(' ');

  const totalCount = summary?.total_transactions ?? 0;
  const normalCount = summary?.normal_count ?? 0;
  const suspCount = summary?.suspicious_count ?? 0;
  const highCount = summary?.high_risk_count ?? 0;
  const dist = summary?.risk_distribution || { normal_pct: 0, suspicious_pct: 0, high_risk_pct: 0 };

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-800 flex font-sans">
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-[#0A2540] text-white flex flex-col justify-between shrink-0 min-h-screen border-r border-[#13355b] z-30">
        <div>
          <div className="p-5 border-b border-slate-700/50 flex items-center gap-3">
            <div className="w-9 h-10 shrink-0">
              <svg viewBox="0 0 44 48" fill="none" aria-hidden="true" className="w-full h-full">
                <path d="M22 2L4 8.5V21.5C4 32.5 11.5 42.5 22 46C32.5 42.5 40 32.5 40 21.5V8.5L22 2Z" fill="#0052CC" />
                <path d="M22 5.5L7.5 11V21.5C7.5 30.5 13.5 38.8 22 42C30.5 38.8 36.5 30.5 36.5 21.5V11L22 5.5Z" fill="#FFFFFF" />
                <rect x="13.5" y="24" width="4" height="10" rx="1.5" fill="#0052CC" />
                <rect x="20" y="17" width="4" height="17" rx="1.5" fill="#0052CC" />
                <rect x="26.5" y="20.5" width="4" height="13.5" rx="1.5" fill="#0052CC" />
                <path d="M15.5 23L22 16L28.5 19.5" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div className="text-lg font-extrabold tracking-tight text-white leading-tight">
                BankGuard <span className="text-[#38BDF8]">AI</span>
              </div>
              <div className="text-[10px] text-slate-300 font-medium">
                {isAdmin ? 'Risk Operations Console' : 'Personal & Business Vault'}
              </div>
            </div>
          </div>

          <nav aria-label="Portal navigation" className="p-3 space-y-1">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                effectiveTab === 'dashboard' ? 'bg-[#0052CC] text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            {!isAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab('transfer')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  effectiveTab === 'transfer' ? 'bg-[#0052CC] text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>Send Money</span>
              </button>
            )}

            {isAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  effectiveTab === 'users' ? 'bg-[#0052CC] text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>User Management</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('transactions')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                effectiveTab === 'transactions' ? 'bg-[#0052CC] text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>{isAdmin ? 'All Transactions' : 'My Transactions'}</span>
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab('analyze')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  effectiveTab === 'analyze' ? 'bg-[#0052CC] text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Analyze Transaction</span>
              </button>
            )}

            {isAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab('risk-analysis')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  effectiveTab === 'risk-analysis' ? 'bg-[#0052CC] text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Risk Analysis</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setActiveTab('alerts');
                markAllAlertsRead();
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                effectiveTab === 'alerts' ? 'bg-[#0052CC] text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4" />
                <span>{isAdmin ? 'Alerts & Investigations' : 'Alerts'}</span>
              </div>
              {unreadAlertsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                effectiveTab === 'reports' ? 'bg-[#0052CC] text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{isAdmin ? 'Analytics & Reports' : 'My Reports'}</span>
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab('ml-models')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  effectiveTab === 'ml-models' ? 'bg-[#0052CC] text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Cpu className="w-4 h-4" />
                <span>ML Model Performance</span>
              </button>
            )}

            {isAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab('audit-logs')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  effectiveTab === 'audit-logs' ? 'bg-[#0052CC] text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Audit Logs</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                effectiveTab === 'profile' ? 'bg-[#0052CC] text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>Profile</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                effectiveTab === 'settings' ? 'bg-[#0052CC] text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>

            <div className="pt-2 border-t border-slate-700/50 mt-2">
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigateTo('signin');
                }}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-rose-300 hover:text-rose-200 hover:bg-rose-950/40 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </nav>
        </div>

        <div className="p-4 m-3 rounded-xl bg-slate-900/60 border border-slate-700/60 text-xs">
          <div className="text-[10px] font-mono uppercase text-slate-400">Account ID</div>
          <div className="font-mono font-bold text-sky-300 mt-0.5">{user.account_number || 'BG-0000-0000'}</div>
          <div className="text-[11px] text-slate-300 mt-1">{user.account_tier || 'Standard'}</div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* TOP HEADER */}
        <header className="bg-white border-b border-slate-200 py-3.5 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20 gap-4">
          <div className="max-w-md w-full relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="search"
              placeholder="Search by Tx ID, recipient, sender, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadPortalData}
              title="Refresh live data"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin text-[#0052CC]' : ''}`} />
            </button>

            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
              <span className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-[#0052CC]' : 'bg-emerald-500'}`} />
              <span>{isAdmin ? 'Risk Operations (Admin)' : 'Customer Portal'}</span>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={handleToggleNotifications}
                aria-label="Security notifications"
                aria-expanded={notificationsOpen}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 relative cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadAlertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadAlertsCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-40">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800">Security Alerts</span>
                    <button
                      type="button"
                      onClick={markAllAlertsRead}
                      className="text-[11px] text-[#0052CC] hover:underline font-semibold cursor-pointer"
                    >
                      {unreadAlertsCount > 0 ? 'Mark all read' : 'All caught up'}
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                    {alerts.length > 0 ? (
                      alerts.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => {
                            setNotificationsOpen(false);
                            setActiveTab('alerts');
                          }}
                          className="w-full py-2.5 text-left hover:bg-slate-50 rounded-lg px-1.5 cursor-pointer"
                        >
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className={a.severity === 'CRITICAL' ? 'text-rose-600' : 'text-amber-700'}>
                              {a.title}
                            </span>
                            <span className="text-[10px] text-slate-400">{a.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{a.description}</p>
                        </button>
                      ))
                    ) : (
                      <div className="py-6 text-center text-xs text-slate-500">No flagged alerts.</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 pl-2 pr-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#0052CC] text-white flex items-center justify-center font-bold text-xs">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-900 leading-tight">{userName}</span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {isAdmin ? 'Risk Analyst' : 'Verified Customer'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-40">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('profile');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    My Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('settings');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Settings
                  </button>
                  <div className="border-t border-slate-100 my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      navigateTo('signin');
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {dataError && (
          <div className="mx-6 sm:mx-8 mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
            {dataError}
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB: DASHBOARD (100% LIVE DATABASE METRICS) */}
        {/* ===================================================================== */}
        {effectiveTab === 'dashboard' && (
          <main className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A2540] tracking-tight">
                  Welcome Back, {userName}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  {isAdmin
                    ? 'Live bank-wide transaction monitoring and anomaly risk summary.'
                    : 'Your live account balance, personal transactions, and security status.'}
                </p>
              </div>

              {!isAdmin && (
                <button
                  type="button"
                  onClick={() => setActiveTab('transfer')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0052CC] hover:bg-[#0043a8] text-white font-semibold text-xs sm:text-sm shadow-xs cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Money</span>
                </button>
              )}
            </div>

            {/* Customer Live Balance Banner */}
            {!isAdmin && (
              <div className="rounded-2xl bg-[#0A2540] text-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="text-xs font-mono uppercase text-sky-300 font-semibold">Available Account Balance</div>
                  <div className="text-3xl sm:text-4xl font-extrabold font-mono mt-1">
                    {formatMoney(summary?.balance ?? user.balance, user.currency)}
                  </div>
                  <div className="text-xs text-slate-300 mt-1.5 font-mono">
                    {user.account_number} &bull; Home Corridor: {user.home_city || 'Chennai, IN'}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-700/80">
                    <div className="text-slate-400">Cleared Outflows</div>
                    <div className="text-base font-bold font-mono text-white mt-0.5">
                      {formatMoney(summary?.total_sent ?? 0, user.currency)}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-700/80">
                    <div className="text-slate-400">Cleared Credits</div>
                    <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                      {formatMoney(summary?.total_received ?? 0, user.currency)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4 REAL KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-500">Total Transactions</div>
                  <div className="text-3xl font-extrabold text-[#0A2540] mt-1 font-mono">{totalCount}</div>
                  <div className="text-[11px] text-slate-500 mt-1">Synced from database</div>
                </div>
                <div className="w-11 h-11 rounded-xl bg-sky-50 text-[#0052CC] flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-500">Auto-Cleared</div>
                  <div className="text-3xl font-extrabold text-[#0A2540] mt-1 font-mono">{normalCount}</div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-1">{dist.normal_pct}% of total</div>
                </div>
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-500">Step-Up MFA</div>
                  <div className="text-3xl font-extrabold text-[#0A2540] mt-1 font-mono">{suspCount}</div>
                  <div className="text-[11px] text-amber-700 font-semibold mt-1">{dist.suspicious_pct}% of total</div>
                </div>
                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-500">Blocked / High-Risk</div>
                  <div className="text-3xl font-extrabold text-[#0A2540] mt-1 font-mono">{highCount}</div>
                  <div className="text-[11px] text-rose-600 font-semibold mt-1">{dist.high_risk_pct}% of total</div>
                </div>
                <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* DYNAMIC CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* 7-Day Trend */}
              <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <h2 className="text-base font-bold text-[#0A2540]">7-Day Activity Trend</h2>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <span className="w-2 h-2 rounded-full bg-[#0052CC]" /> Cleared
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> Flagged
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-500">Live 7-Day Window</span>
                </div>

                <div className="relative h-56 w-full">
                  <svg viewBox="0 0 650 200" className="w-full h-full">
                    <line x1="45" y1="40" x2="625" y2="40" stroke="#F1F5F9" strokeWidth="1" />
                    <line x1="45" y1="105" x2="625" y2="105" stroke="#F1F5F9" strokeWidth="1" />
                    <line x1="45" y1="170" x2="625" y2="170" stroke="#E2E8F0" strokeWidth="1" />
                    <text x="10" y="44" fill="#94A3B8" fontSize="10">{maxTrendVal}</text>
                    <text x="10" y="109" fill="#94A3B8" fontSize="10">{Math.round(maxTrendVal / 2)}</text>
                    <text x="20" y="174" fill="#94A3B8" fontSize="10">0</text>

                    {normalPath && <path d={normalPath} fill="none" stroke="#0052CC" strokeWidth="2.8" strokeLinecap="round" />}
                    {suspPath && <path d={suspPath} fill="none" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" />}

                    {trendCoords.map((p) => (
                      <g key={p.label}>
                        <circle cx={p.x} cy={p.yNorm} r="4" fill="#0052CC" />
                        <circle cx={p.x} cy={p.ySusp} r="3.5" fill="#F59E0B" />
                        <text x={p.x - 16} y="192" fill="#64748B" fontSize="10">
                          {p.label}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>

              {/* Dynamic Risk Distribution Donut */}
              <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base font-bold text-[#0A2540]">Risk Distribution</h2>
                  <span className="text-xs text-slate-500 font-mono">Live</span>
                </div>

                <div className="relative w-40 h-40 mx-auto my-3 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#E2E8F0"
                      strokeWidth="3.8"
                    />
                    {totalCount > 0 && (
                      <>
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#10B981"
                          strokeWidth="3.8"
                          strokeDasharray={`${dist.normal_pct}, 100`}
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#F59E0B"
                          strokeWidth="3.8"
                          strokeDasharray={`${dist.suspicious_pct}, 100`}
                          strokeDashoffset={`-${dist.normal_pct}`}
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#EF4444"
                          strokeWidth="3.8"
                          strokeDasharray={`${dist.high_risk_pct}, 100`}
                          strokeDashoffset={`-${dist.normal_pct + dist.suspicious_pct}`}
                        />
                      </>
                    )}
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-lg font-extrabold text-[#0A2540] font-mono">{totalCount}</span>
                    <span className="text-[10px] text-slate-500">Transactions</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Auto-Cleared
                    </span>
                    <span className="font-bold text-[#0A2540] font-mono">{dist.normal_pct}% ({normalCount})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Step-Up MFA
                    </span>
                    <span className="font-bold text-[#0A2540] font-mono">{dist.suspicious_pct}% ({suspCount})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Blocked
                    </span>
                    <span className="font-bold text-[#0A2540] font-mono">{dist.high_risk_pct}% ({highCount})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RECENT TRANSACTIONS TABLE */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-[#0A2540]">
                  {isAdmin ? 'Recent Bank-Wide Transactions' : 'Your Recent Transactions'}
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveTab('transactions')}
                  className="text-xs font-bold text-[#0052CC] hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              {transactions.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <CreditCard className="w-10 h-10 mx-auto text-slate-300" />
                  <div className="text-sm font-bold text-[#0A2540]">No transactions found yet</div>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Your account currently has 0 recorded transfers. Send money to see real-time AI scoring and SHAP attribution here.
                  </p>
                  {!isAdmin && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('transfer')}
                      className="px-4 py-2 rounded-xl bg-[#0052CC] text-white text-xs font-semibold cursor-pointer"
                    >
                      Make Your First Transfer
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                        <th className="pb-3">Ref ID</th>
                        <th className="pb-3">{isAdmin ? 'Origin → Recipient' : 'Direction & Counterparty'}</th>
                        <th className="pb-3">Channel</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Risk</th>
                        <th className="pb-3">Decision</th>
                        <th className="pb-3 text-center">Inspect</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transactions.slice(0, 6).map((tx) => (
                        <tr key={tx.reference_id} className="hover:bg-slate-50">
                          <td className="py-3 font-mono font-bold text-[#0052CC]">{tx.reference_id}</td>
                          <td className="py-3">
                            {isAdmin ? (
                              <div>
                                <div className="font-semibold text-slate-900">{tx.sender} &rarr; {tx.recipient}</div>
                                <div className="text-[11px] text-slate-500">{tx.location}</div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                {tx.direction === 'CREDIT' ? (
                                  <ArrowDownLeft className="w-4 h-4 text-emerald-600 shrink-0" />
                                ) : (
                                  <ArrowUpRight className="w-4 h-4 text-slate-600 shrink-0" />
                                )}
                                <div>
                                  <div className="font-semibold text-slate-900">
                                    {tx.direction === 'CREDIT' ? `From ${tx.sender}` : `To ${tx.recipient}`}
                                  </div>
                                  <div className="text-[11px] text-slate-500">
                                    {tx.recipient_account || tx.location}
                                  </div>
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="py-3 text-slate-600 font-medium">{tx.channel}</td>
                          <td className="py-3 font-mono font-bold text-[#0A2540]">
                            {tx.direction === 'CREDIT' && !isAdmin ? '+' : ''}
                            {formatMoney(tx.amount, tx.currency)}
                          </td>
                          <td className="py-3 font-mono font-bold">{tx.risk_score}/100</td>
                          <td className="py-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${riskBadgeStyle(tx.decision)}`}>
                              {decisionLabel(tx.decision)}
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <button
                              type="button"
                              onClick={() => setSelectedTxModal(tx)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-[#0052CC] hover:bg-sky-50 cursor-pointer"
                              title="Inspect risk explanation"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </main>
        )}

        {/* ===================================================================== */}
        {/* TAB: SEND MONEY / FUND TRANSFER (CUSTOMER DEDICATED PAGE) */}
        {/* ===================================================================== */}
        {!isAdmin && effectiveTab === 'transfer' && (
          <main className="p-6 sm:p-8 space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-[#0A2540]">Send Money &amp; Real-Time Risk Check</h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Transfers are evaluated by BankGuard AI before settlement. Medium-risk transfers prompt Step-Up OTP; high-risk anomalies are blocked without deducting your balance.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Transfer Form */}
              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-sm font-bold text-[#0A2540]">Transfer Details</span>
                  <div className="inline-flex rounded-lg bg-slate-100 p-1 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setRecipientMode('internal');
                        setTransferForm((prev) => ({
                          ...prev,
                          recipientIdentifier: recipients[0]?.account_number || '',
                        }));
                      }}
                      className={`px-3 py-1 rounded-md font-semibold cursor-pointer ${
                        recipientMode === 'internal' ? 'bg-white text-[#0052CC] shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      BankGuard User
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRecipientMode('external');
                        setTransferForm((prev) => ({ ...prev, recipientIdentifier: '' }));
                      }}
                      className={`px-3 py-1 rounded-md font-semibold cursor-pointer ${
                        recipientMode === 'external' ? 'bg-white text-[#0052CC] shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      External Beneficiary
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSendTransfer} className="space-y-4 text-xs">
                  {recipientMode === 'internal' ? (
                    <div>
                      <label htmlFor="recipient-select" className="block font-semibold text-[#0A2540] mb-1.5">
                        Select Registered BankGuard Recipient
                      </label>
                      <select
                        id="recipient-select"
                        value={transferForm.recipientIdentifier}
                        onChange={(e) => setTransferForm({ ...transferForm, recipientIdentifier: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-sm"
                        required
                      >
                        {recipients.length === 0 && <option value="">No other users available</option>}
                        {recipients.map((r) => (
                          <option key={r.id} value={r.account_number}>
                            {r.full_name} ({r.account_number})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="recipient-ext" className="block font-semibold text-[#0A2540] mb-1.5">
                        Beneficiary Name, Email, or Account
                      </label>
                      <input
                        id="recipient-ext"
                        type="text"
                        required
                        placeholder="e.g., Apollo Pharmacy or Offshore Crypto Gateway"
                        value={transferForm.recipientIdentifier}
                        onChange={(e) => setTransferForm({ ...transferForm, recipientIdentifier: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="transfer-amount" className="block font-semibold text-[#0A2540] mb-1.5">
                        Amount ({user.currency || 'INR'})
                      </label>
                      <input
                        id="transfer-amount"
                        type="number"
                        min="1"
                        step="0.01"
                        required
                        value={transferForm.amount}
                        onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="transfer-channel" className="block font-semibold text-[#0A2540] mb-1.5">
                        Payment Channel
                      </label>
                      <select
                        id="transfer-channel"
                        value={transferForm.channel}
                        onChange={(e) => setTransferForm({ ...transferForm, channel: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                      >
                        <option value="Transfer">Internal Transfer</option>
                        <option value="UPI">UPI Instant</option>
                        <option value="IMPS">IMPS Rail</option>
                        <option value="NEFT">NEFT Clearing</option>
                        <option value="RTGS">RTGS High-Value</option>
                        <option value="POS">Merchant Payment</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="transfer-location" className="block font-semibold text-[#0A2540] mb-1.5">
                        Origin Location
                      </label>
                      <input
                        id="transfer-location"
                        type="text"
                        value={transferForm.location}
                        onChange={(e) => setTransferForm({ ...transferForm, location: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="transfer-device" className="block font-semibold text-[#0A2540] mb-1.5">
                        Device Signature
                      </label>
                      <select
                        id="transfer-device"
                        value={transferForm.device}
                        onChange={(e) => setTransferForm({ ...transferForm, device: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                      >
                        <option value="BankGuard Web Client">Trusted Registered Browser</option>
                        <option value="Unknown Linux Tor Node">Unrecognized Device / Tor (Test Risk)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="transfer-note" className="block font-semibold text-[#0A2540] mb-1.5">
                      Payment Note (Optional)
                    </label>
                    <input
                      id="transfer-note"
                      type="text"
                      placeholder="Invoice #204, family support, etc."
                      value={transferForm.note}
                      onChange={(e) => setTransferForm({ ...transferForm, note: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={transferLoading}
                    className="w-full py-3 rounded-xl bg-[#0052CC] hover:bg-[#0043a8] disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{transferLoading ? 'Evaluating Risk & Processing...' : 'Send Money Now'}</span>
                  </button>
                </form>
              </div>

              {/* Right Column: Balance + Live Result */}
              <div className="lg:col-span-5 space-y-5">
                <div className="p-5 rounded-2xl bg-[#0A2540] text-white">
                  <div className="text-[11px] font-mono uppercase text-sky-300">Source Account</div>
                  <div className="text-2xl font-extrabold font-mono mt-1">
                    {formatMoney(summary?.balance ?? user.balance, user.currency)}
                  </div>
                  <div className="text-xs text-slate-300 mt-1 font-mono">{user.account_number}</div>
                </div>

                {transferFeedback && (
                  <div
                    className={`p-5 rounded-2xl border text-xs space-y-3 ${
                      transferFeedback.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : transferFeedback.type === 'blocked'
                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}
                  >
                    <div className="font-bold text-sm">{transferFeedback.message}</div>
                    {transferFeedback.transaction && (
                      <>
                        <div className="p-3 rounded-xl bg-white border border-slate-200 text-slate-700 space-y-1.5">
                          <div className="flex justify-between">
                            <span>Recipient:</span>
                            <strong className="text-[#0A2540]">{transferFeedback.transaction.recipient}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Risk Score:</span>
                            <strong className="font-mono">{transferFeedback.transaction.risk_score} / 100</strong>
                          </div>
                          <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                            <strong>Reason:</strong> {transferFeedback.transaction.anomaly_reasons}
                          </div>
                        </div>
                        {transferFeedback.transaction.shap_factors && (
                          <div className="space-y-1.5">
                            <div className="font-bold text-[11px] uppercase text-slate-600">SHAP Feature Attribution</div>
                            {transferFeedback.transaction.shap_factors.map((f) => (
                              <div key={f.feature} className="flex justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                                <span>{f.feature}</span>
                                <span className={`font-mono font-bold ${f.positive ? 'text-rose-700' : 'text-emerald-700'}`}>
                                  {f.impact}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </main>
        )}

        {/* ===================================================================== */}
        {/* TAB: MY TRANSACTIONS / ALL TRANSACTIONS (REAL DB TABLE) */}
        {/* ===================================================================== */}
        {effectiveTab === 'transactions' && (
          <main className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-[#0A2540]">
                  {isAdmin ? 'All Bank Transactions' : 'My Transactions'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  {isAdmin
                    ? 'Complete ledger across all accounts with AI risk scores and decisions.'
                    : 'Every transfer you sent or received, showing counterparty details and AI decision reasons.'}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={txStatusFilter}
                  onChange={(e) => setTxStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="AUTO_CLEARED">Auto-Cleared</option>
                  <option value="STEP_UP_MFA">Step-Up OTP</option>
                  <option value="BLOCKED_FROZEN">Blocked / Frozen</option>
                </select>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-[#0A2540] cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {filteredTransactions.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500">
                  No matching transactions found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[780px]">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-mono uppercase text-slate-500">
                      <tr>
                        <th className="py-3.5 px-5">Ref ID &amp; Time</th>
                        <th className="py-3.5 px-4">Direction</th>
                        <th className="py-3.5 px-4">{isAdmin ? 'Sender → Recipient' : 'Counterparty (To / From)'}</th>
                        <th className="py-3.5 px-4">Channel &amp; City</th>
                        <th className="py-3.5 px-4 text-right">Amount</th>
                        <th className="py-3.5 px-4 text-center">Risk Score</th>
                        <th className="py-3.5 px-4">Decision</th>
                        <th className="py-3.5 px-5 text-right">Explain</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTransactions.map((tx) => (
                        <tr key={tx.reference_id} className="hover:bg-slate-50">
                          <td className="py-3 px-5 font-mono">
                            <div className="font-bold text-[#0052CC]">{tx.reference_id}</div>
                            <div className="text-[10px] text-slate-400">
                              {tx.created_at ? new Date(tx.created_at).toLocaleString() : 'Recent'}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                tx.direction === 'CREDIT'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {tx.direction === 'CREDIT' ? (
                                <ArrowDownLeft className="w-3 h-3" />
                              ) : (
                                <ArrowUpRight className="w-3 h-3" />
                              )}
                              {tx.direction === 'CREDIT' ? 'Received' : 'Sent'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {isAdmin ? (
                              <>
                                <div className="font-semibold text-[#0A2540]">
                                  {tx.sender} &rarr; {tx.recipient}
                                </div>
                                <div className="text-[11px] text-slate-500 font-mono">
                                  {tx.recipient_account || 'External'}
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="font-semibold text-[#0A2540]">
                                  {tx.direction === 'CREDIT' ? tx.sender : tx.recipient}
                                </div>
                                <div className="text-[11px] text-slate-500 font-mono">
                                  {tx.recipient_account || 'External Beneficiary'}
                                  {tx.note ? ` • ${tx.note}` : ''}
                                </div>
                              </>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-700">{tx.channel}</div>
                            <div className="text-[11px] text-slate-500">{tx.location}</div>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-[#0A2540]">
                            {tx.direction === 'CREDIT' && !isAdmin ? '+' : ''}
                            {formatMoney(tx.amount, tx.currency)}
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold">{tx.risk_score}/100</td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${riskBadgeStyle(tx.decision)}`}>
                              {decisionLabel(tx.decision)}
                            </span>
                          </td>
                          <td className="py-3 px-5 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedTxModal(tx)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#0052CC] text-slate-700 hover:text-white text-[11px] font-semibold cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Inspect</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </main>
        )}

        {/* ===================================================================== */}
        {/* TAB: PROFILE (READ-ONLY BANK IDENTITY + EDITABLE DETAILS + PASSWORD) */}
        {/* ===================================================================== */}
        {effectiveTab === 'profile' && (
          <main className="p-6 sm:p-8 space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-[#0A2540]">Account Profile &amp; Security</h1>
              <p className="text-xs sm:text-sm text-slate-500">
                View your verified banking credentials and update your personal contact details or password.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Read-Only Banking Identity */}
              <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-2xl bg-[#0052CC] text-white flex items-center justify-center font-extrabold text-lg">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#0A2540]">{userName}</h2>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Account Number</span>
                    <span className="font-mono font-bold text-[#0A2540]">{user.account_number}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Username</span>
                    <span className="font-mono font-semibold text-slate-800">@{user.username || 'user'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Assigned Role</span>
                    <span className="px-2 py-0.5 rounded-full bg-sky-50 text-[#0052CC] font-bold">{user.role}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Current Balance</span>
                    <span className="font-mono font-bold text-emerald-700">
                      {formatMoney(summary?.balance ?? user.balance, user.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">KYC Status</span>
                    <span className="text-emerald-700 font-bold">
                      {user.kyc_verified !== false ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Risk Tier</span>
                    <span className="font-mono font-bold text-[#0A2540]">{user.risk_tier || 'LOW'}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">Member Since</span>
                    <span className="font-mono text-slate-600">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : '2026'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Editable Details & Password */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                  <h2 className="text-sm font-bold text-[#0A2540] mb-4 flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-[#0052CC]" /> Edit Personal Details
                  </h2>

                  {profileStatus && (
                    <div
                      className={`mb-4 p-3 rounded-xl text-xs font-semibold ${
                        profileStatus.type === 'success'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {profileStatus.message}
                    </div>
                  )}

                  <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                    <div>
                      <label htmlFor="prof-name" className="block font-semibold text-[#0A2540] mb-1">
                        Full Name
                      </label>
                      <input
                        id="prof-name"
                        type="text"
                        required
                        value={profileForm.full_name}
                        onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="prof-phone" className="block font-semibold text-[#0A2540] mb-1">
                          Phone Number
                        </label>
                        <input
                          id="prof-phone"
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="prof-city" className="block font-semibold text-[#0A2540] mb-1">
                          Home City (Baseline Geo-Corridor)
                        </label>
                        <input
                          id="prof-city"
                          type="text"
                          value={profileForm.home_city}
                          onChange={(e) => setProfileForm({ ...profileForm, home_city: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="px-5 py-2.5 rounded-xl bg-[#0052CC] hover:bg-[#0043a8] text-white font-semibold text-xs cursor-pointer"
                    >
                      {profileSaving ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                  </form>
                </div>

                {/* Change Password */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                  <h2 className="text-sm font-bold text-[#0A2540] mb-4 flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-[#0052CC]" /> Change Password
                  </h2>

                  {passwordStatus && (
                    <div
                      className={`mb-4 p-3 rounded-xl text-xs font-semibold ${
                        passwordStatus.type === 'success'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {passwordStatus.message}
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
                    <div>
                      <label htmlFor="cur-pw" className="block font-semibold text-[#0A2540] mb-1">
                        Current Password
                      </label>
                      <input
                        id="cur-pw"
                        type="password"
                        required
                        value={passwordForm.current_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="new-pw" className="block font-semibold text-[#0A2540] mb-1">
                          New Password
                        </label>
                        <input
                          id="new-pw"
                          type="password"
                          required
                          value={passwordForm.new_password}
                          onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="conf-pw" className="block font-semibold text-[#0A2540] mb-1">
                          Confirm New Password
                        </label>
                        <input
                          id="conf-pw"
                          type="password"
                          required
                          value={passwordForm.confirm_password}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl border border-[#0052CC] text-[#0052CC] hover:bg-sky-50 font-semibold text-xs cursor-pointer"
                    >
                      Update Password
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </main>
        )}

        {/* ===================================================================== */}
        {/* TAB: ALERTS */}
        {/* ===================================================================== */}
        {effectiveTab === 'alerts' && (
          <main className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-[#0A2540]">
                  {isAdmin ? 'Alerts & Flagged Investigations' : 'My Security Alerts'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Transactions flagged with Step-Up MFA or Blocked/Frozen decisions.
                </p>
              </div>
            </div>

            {alerts.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                No security alerts recorded for your view.
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((a) => (
                  <div key={a.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            a.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {a.severity}
                        </span>
                        <span className="font-mono text-xs font-bold text-[#0052CC]">{a.txId}</span>
                        <span className="text-[11px] text-slate-400">{a.time}</span>
                      </div>
                      <h2 className="text-sm font-bold text-[#0A2540]">{a.title}</h2>
                      <p className="text-xs text-slate-600">{a.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 ${riskBadgeStyle(a.status)}`}>
                      {decisionLabel(a.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </main>
        )}

        {/* ===================================================================== */}
        {/* TAB: ADMIN ANALYZE TRANSACTION */}
        {/* ===================================================================== */}
        {isAdmin && effectiveTab === 'analyze' && (
          <main className="p-6 sm:p-8 space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-[#0A2540]">AI Transaction Anomaly Analyzer</h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Execute backend behavioral scoring and SHAP attribution via FastAPI.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200">
                <h2 className="text-sm font-bold text-[#0A2540] mb-4 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#0052CC]" /> Transaction Parameters
                </h2>
                <form onSubmit={handleRunAdminAnalysis} className="space-y-3.5 text-xs">
                  <div>
                    <label htmlFor="an-amt" className="block font-semibold text-slate-700 mb-1">Amount (INR)</label>
                    <input
                      id="an-amt"
                      type="number"
                      value={analyzeForm.amount}
                      onChange={(e) => setAnalyzeForm({ ...analyzeForm, amount: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="an-loc" className="block font-semibold text-slate-700 mb-1">Location</label>
                      <input
                        id="an-loc"
                        type="text"
                        value={analyzeForm.location}
                        onChange={(e) => setAnalyzeForm({ ...analyzeForm, location: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300"
                      />
                    </div>
                    <div>
                      <label htmlFor="an-ch" className="block font-semibold text-slate-700 mb-1">Channel</label>
                      <select
                        id="an-ch"
                        value={analyzeForm.channel}
                        onChange={(e) => setAnalyzeForm({ ...analyzeForm, channel: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                      >
                        <option>IMPS</option>
                        <option>NEFT</option>
                        <option>RTGS</option>
                        <option>UPI</option>
                        <option>POS</option>
                        <option>ATM</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="an-ben" className="block font-semibold text-slate-700 mb-1">Beneficiary</label>
                    <input
                      id="an-ben"
                      type="text"
                      value={analyzeForm.beneficiary}
                      onChange={(e) => setAnalyzeForm({ ...analyzeForm, beneficiary: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isAnalyzing}
                    className="w-full py-3 rounded-xl bg-[#0052CC] hover:bg-[#0043a8] text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Zap className="w-4 h-4" />
                    <span>{isAnalyzing ? 'Analyzing...' : 'Run Backend Risk Scoring'}</span>
                  </button>
                </form>
              </div>

              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200">
                <h2 className="text-sm font-bold text-[#0A2540] mb-4">SHAP Risk Attribution Output</h2>
                {analysisResult && !analysisResult.error ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-slate-500">Reference {analysisResult.reference_id}</div>
                        <div className="text-2xl font-black font-mono text-[#0A2540]">{analysisResult.risk_score} / 100</div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${riskBadgeStyle(analysisResult.decision)}`}>
                        {decisionLabel(analysisResult.decision)}
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      {(analysisResult.shap_factors || []).map((f) => (
                        <div key={f.feature} className="flex justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="font-medium text-slate-700">{f.feature}</span>
                          <span className={`font-mono font-bold ${f.positive ? 'text-rose-700' : 'text-emerald-700'}`}>
                            {f.impact}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 p-3 bg-sky-50 rounded-xl border border-sky-100">
                      <strong>Reason:</strong> {analysisResult.anomaly_reasons}
                    </p>
                  </div>
                ) : (
                  <div className="py-16 text-center text-xs text-slate-400">
                    Submit parameters to run live risk evaluation and save to database.
                  </div>
                )}
              </div>
            </div>
          </main>
        )}

        {/* ===================================================================== */}
        {/* TAB: ADMIN USER MANAGEMENT */}
        {/* ===================================================================== */}
        {isAdmin && effectiveTab === 'users' && (
          <main className="p-6 sm:p-8 space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-[#0A2540]">User Management Directory</h1>
              <p className="text-xs sm:text-sm text-slate-500">Live registered accounts in PostgreSQL / SQLite.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                  <tr>
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Account No</th>
                    <th className="pb-3 text-right">Balance</th>
                    <th className="pb-3 text-center">KYC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {portalUsers.map((u) => (
                    <tr key={u.id}>
                      <td className="py-3 font-bold text-[#0A2540]">{u.full_name}</td>
                      <td className="py-3 font-mono text-slate-600">{u.email}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full bg-sky-50 text-[#0052CC] font-bold text-[10px]">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-slate-600">{u.account_number}</td>
                      <td className="py-3 text-right font-mono font-bold">{formatMoney(u.balance, u.currency)}</td>
                      <td className="py-3 text-center text-emerald-700 font-bold">{u.kyc_verified ? 'Verified' : 'Pending'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </main>
        )}

        {/* ===================================================================== */}
        {/* TAB: ADMIN AUDIT LOGS */}
        {/* ===================================================================== */}
        {isAdmin && effectiveTab === 'audit-logs' && (
          <main className="p-6 sm:p-8 space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-[#0A2540]">Security Audit Logs</h1>
              <p className="text-xs sm:text-sm text-slate-500">Immutable authentication, OTP, and transfer audit trail.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                  <tr>
                    <th className="pb-3">ID</th>
                    <th className="pb-3">User ID</th>
                    <th className="pb-3">Action</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="py-2.5 font-mono text-slate-400">#{log.id}</td>
                      <td className="py-2.5 font-mono">{log.user_id ?? '-'}</td>
                      <td className="py-2.5 font-mono font-semibold text-[#0A2540]">{log.action}</td>
                      <td className="py-2.5 font-bold text-slate-700">{log.status}</td>
                      <td className="py-2.5 text-slate-500">
                        {log.created_at ? new Date(log.created_at).toLocaleString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </main>
        )}

        {/* ===================================================================== */}
        {/* TAB: REPORTS / SETTINGS / ADMIN ML-MODELS & RISK-ANALYSIS */}
        {/* ===================================================================== */}
        {['reports', 'settings', 'ml-models', 'risk-analysis'].includes(effectiveTab) && (
          <main className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-[#0A2540] capitalize">
                  {effectiveTab.replace('-', ' ')}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  {effectiveTab === 'reports' && 'Download transaction statements and risk audit summaries.'}
                  {effectiveTab === 'settings' && 'Account security preferences and session configuration.'}
                  {effectiveTab === 'ml-models' && 'Model architecture evaluation overview.'}
                  {effectiveTab === 'risk-analysis' && 'Behavioral velocity and corridor risk breakdown.'}
                </p>
              </div>
              {effectiveTab === 'reports' && (
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0052CC] text-white text-xs font-semibold cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download CSV Statement</span>
                </button>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-xs space-y-3">
              <div className="flex items-center gap-2 font-bold text-[#0A2540]">
                <Landmark className="w-4 h-4 text-[#0052CC]" />
                <span>Live Summary</span>
              </div>
              <p className="text-slate-600">
                Total tracked transactions in your scope: <strong>{totalCount}</strong> ({normalCount} auto-cleared, {suspCount} step-up MFA, {highCount} blocked).
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="inline-flex items-center gap-1 text-[#0052CC] font-semibold hover:underline cursor-pointer"
              >
                <span>Return to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </main>
        )}
      </div>

      {/* ===================================================================== */}
      {/* TRANSACTION INSPECTION MODAL */}
      {/* ===================================================================== */}
      {selectedTxModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-sm text-[#0A2540]">
                <ShieldCheck className="w-4 h-4 text-[#0052CC]" />
                <span>Transaction {selectedTxModal.reference_id}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTxModal(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="py-4 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Sender:</span>
                <span className="font-semibold text-[#0A2540]">{selectedTxModal.sender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Recipient:</span>
                <span className="font-semibold text-[#0A2540]">{selectedTxModal.recipient}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="font-mono font-bold text-[#0A2540]">
                  {formatMoney(selectedTxModal.amount, selectedTxModal.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location &amp; Channel:</span>
                <span>{selectedTxModal.location} ({selectedTxModal.channel})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Risk Score &amp; Decision:</span>
                <span className="font-mono font-bold">
                  {selectedTxModal.risk_score}/100 ({decisionLabel(selectedTxModal.decision)})
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-700">
                <strong>AI Explanation:</strong> {selectedTxModal.anomaly_reasons}
              </div>

              {selectedTxModal.shap_factors && (
                <div className="space-y-1 pt-1">
                  <div className="text-[10px] font-mono uppercase font-bold text-slate-500">SHAP Feature Drivers</div>
                  {selectedTxModal.shap_factors.map((f) => (
                    <div key={f.feature} className="flex justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg">
                      <span>{f.feature}</span>
                      <span className={`font-mono font-bold ${f.positive ? 'text-rose-700' : 'text-emerald-700'}`}>
                        {f.impact}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSelectedTxModal(null)}
              className="w-full py-2.5 rounded-xl bg-[#0052CC] text-white font-semibold text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* STEP-UP MFA OTP CHALLENGE MODAL */}
      {/* ===================================================================== */}
      {otpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 text-slate-900">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-sm mb-2">
              <Lock className="w-4 h-4" />
              <span>Step-Up MFA Verification Required</span>
            </div>
            <p className="text-xs text-slate-600 mb-3">
              Your transfer of <strong>{formatMoney(otpModal.amount, user.currency)}</strong> to{' '}
              <strong>{otpModal.recipient}</strong> scored <strong>{otpModal.risk_score}/100</strong> ({otpModal.reasons}).
            </p>

            {otpModal.demo_otp_preview && (
              <div className="mb-4 p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs text-[#0A2540]">
                Demo Verification OTP: <strong className="font-mono text-sm text-[#0052CC]">{otpModal.demo_otp_preview}</strong>
              </div>
            )}

            {otpError && (
              <div className="mb-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {otpError}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-3 text-xs">
              <div>
                <label htmlFor="otp-code-input" className="block font-semibold text-[#0A2540] mb-1">
                  Enter 6-Digit OTP
                </label>
                <input
                  id="otp-code-input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  maxLength={6}
                  placeholder="6-digit code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-center text-base tracking-widest"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOtpModal(null)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={otpLoading}
                  className="w-1/2 py-2.5 rounded-xl bg-[#0052CC] text-white font-semibold cursor-pointer"
                >
                  {otpLoading ? 'Verifying...' : 'Verify & Complete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
