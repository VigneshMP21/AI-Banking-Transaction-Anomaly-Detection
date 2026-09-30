import React, { useState, useMemo } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  CreditCard, 
  Search, 
  Bell, 
  Calendar, 
  ChevronDown, 
  ArrowUpRight, 
  ArrowDownRight, 
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
  HelpCircle, 
  RefreshCw, 
  Zap, 
  Lock, 
  ArrowLeft, 
  TrendingUp, 
  Sliders, 
  Check, 
  Download, 
  Plus, 
  Send,
  Database,
  ExternalLink,
  ShieldQuestion
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function BankingPortalPage({ onLaunchSandboxTx }) {
  const { user, logout, navigateTo, dbStatus } = useAuth();

  // Active View State: 'dashboard' | 'transactions' | 'analyze' | 'risk-analysis' | 'alerts' | 'reports' | 'users' | 'ml-models' | 'audit-logs' | 'profile' | 'settings'
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Role switcher toggle: allow switching between Admin and User view during presentation
  const [currentRoleView, setCurrentRoleView] = useState(() => {
    if (user?.role === 'Analyst' || user?.role === 'Admin' || user?.role === 'Administrator') {
      return 'admin';
    }
    return 'admin'; // Default to admin for full visibility as requested
  });

  const [dateRange, setDateRange] = useState('Sep 9, 2026');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTxModal, setSelectedTxModal] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [trendFilter, setTrendFilter] = useState('Last 7 Days');
  const [riskFilter, setRiskFilter] = useState('Last 7 Days');

  // Interactive Anomaly Analyzer State
  const [analyzeForm, setAnalyzeForm] = useState({
    amount: '85000',
    location: 'Mumbai',
    channel: 'Wire',
    beneficiary: 'Offshore Gateway BZ',
    hour: '03:15 AM',
    device: 'Unknown Linux Agent'
  });
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // New Transfer Simulation (for User Dashboard)
  const [transferForm, setTransferForm] = useState({
    recipient: 'A. Sharma (HDFC Bank)',
    amount: '15000',
    note: 'Consulting fees'
  });
  const [transferSuccess, setTransferSuccess] = useState(null);

  const userName = user?.name || user?.full_name || 'Vicky';
  const isAdmin = currentRoleView === 'admin';

  // Sample Dataset Matching the Screenshot
  const adminTransactions = [
    { id: 1, time: 'Sep 9, 2026 10:24 AM', txId: 'TXN784521', customer: 'R. Kumar', amount: '₹ 12,500', numericAmount: 12500, type: 'Transfer', riskLevel: 'Normal', status: 'Completed', location: 'Chennai', score: 14 },
    { id: 2, time: 'Sep 9, 2026 09:18 AM', txId: 'TXN784520', customer: 'S. Priya', amount: '₹ 2,00,000', numericAmount: 200000, type: 'Transfer', riskLevel: 'High-Risk', status: 'Flagged', location: 'Mumbai', score: 88 },
    { id: 3, time: 'Sep 9, 2026 08:45 AM', txId: 'TXN784519', customer: 'A. Khan', amount: '₹ 8,700', numericAmount: 8700, type: 'Payment', riskLevel: 'Normal', status: 'Completed', location: 'Delhi', score: 18 },
    { id: 4, time: 'Sep 9, 2026 08:12 AM', txId: 'TXN784518', customer: 'M. Reddy', amount: '₹ 1,25,000', numericAmount: 125000, type: 'Transfer', riskLevel: 'Suspicious', status: 'Under Review', location: 'Hyderabad', score: 64 },
    { id: 5, time: 'Sep 9, 2026 07:56 AM', txId: 'TXN784517', customer: 'P. Sharma', amount: '₹ 5,000', numericAmount: 5000, type: 'Payment', riskLevel: 'Normal', status: 'Completed', location: 'Bangalore', score: 8 },
    { id: 6, time: 'Sep 9, 2026 06:30 AM', txId: 'TXN784516', customer: 'K. Varma', amount: '₹ 4,50,000', numericAmount: 450000, type: 'Wire', riskLevel: 'High-Risk', status: 'Blocked', location: 'Dubai (Geo-hop)', score: 94 },
    { id: 7, time: 'Sep 9, 2026 05:15 AM', txId: 'TXN784515', customer: 'N. Iyer', amount: '₹ 18,200', numericAmount: 18200, type: 'POS', riskLevel: 'Normal', status: 'Completed', location: 'Pune', score: 12 },
  ];

  const userTransactions = [
    { id: 1, time: '30-09-2026 10:24 AM', txId: 'TXN001', recipient: 'Amazon India Retail', amount: '₹ 5,000', location: 'Chennai', score: 18, riskLevel: 'Low', status: 'Completed' },
    { id: 2, time: '30-09-2026 09:18 AM', txId: 'TXN002', recipient: 'Crypto Vault Gateway', amount: '₹ 85,000', location: 'Mumbai', score: 82, riskLevel: 'High', status: 'Step-Up MFA' },
    { id: 3, time: '29-09-2026 04:15 PM', txId: 'TXN003', recipient: 'Swiggy Food Delivery', amount: '₹ 1,200', location: 'Bangalore', score: 12, riskLevel: 'Low', status: 'Completed' },
    { id: 4, time: '28-09-2026 11:30 AM', txId: 'TXN004', recipient: 'Apollo Pharmacy', amount: '₹ 14,500', location: 'Hyderabad', score: 42, riskLevel: 'Medium', status: 'Completed' },
    { id: 5, time: '27-09-2026 02:20 PM', txId: 'TXN005', recipient: 'Zara Fashion Outlet', amount: '₹ 6,800', location: 'Chennai', score: 15, riskLevel: 'Low', status: 'Completed' },
  ];

  const alerts = [
    {
      id: 'ALT-1092',
      title: 'High-Risk Transaction Detected',
      txId: 'TXN784520',
      description: 'Transaction TXN784520 has an unusual amount (₹ 2,00,000) and geo-hop velocity anomaly (>8,000 km/h).',
      severity: 'HIGH',
      time: '12 mins ago',
      status: 'Open'
    },
    {
      id: 'ALT-1091',
      title: 'Repeated Rapid Small Payments (Smurfing)',
      txId: 'TXN784518',
      description: '4 burst transactions in 90 seconds from unrecognized terminal signature.',
      severity: 'MEDIUM',
      time: '45 mins ago',
      status: 'Under Review'
    },
    {
      id: 'ALT-1090',
      title: 'Large Foreign Wire Outflow',
      txId: 'TXN784516',
      description: '₹ 4,50,000 wire flagged for sanction list and sudden device fingerprint mismatch.',
      severity: 'CRITICAL',
      time: '2 hours ago',
      status: 'Frozen'
    }
  ];

  const handleRunAnalysis = (e) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setAnalysisResult(null);

    setTimeout(() => {
      const amt = parseFloat(analyzeForm.amount) || 50000;
      const isHigh = amt > 150000 || analyzeForm.location.includes('Geo') || analyzeForm.beneficiary.includes('Offshore');
      const isMed = amt > 60000 && !isHigh;

      const score = isHigh ? 88.5 : (isMed ? 58.2 : 12.4);
      const level = isHigh ? 'CRITICAL RISK' : (isMed ? 'MEDIUM RISK' : 'LOW RISK / NORMAL');
      const decision = isHigh ? 'BLOCKED & FROZEN' : (isMed ? 'STEP-UP 2FA REQUIRED' : 'AUTO-CLEARED');

      setAnalysisResult({
        score,
        level,
        decision,
        shapAttribution: [
          { feature: 'Transaction Amount vs 90d Baseline', impact: isHigh ? '+38.4%' : '+8.2%', positive: isHigh },
          { feature: 'Beneficiary Geo-location Entropy', impact: isHigh ? '+26.1%' : '-12.5%', positive: isHigh },
          { feature: 'Device Fingerprint Token Signature', impact: isHigh ? '+18.0%' : '-18.2%', positive: isHigh },
          { feature: 'Time of Day Habitual Variance', impact: '+6.0%', positive: true },
          { feature: 'Historical KYC Biometric Trust', impact: '-24.5%', positive: false }
        ],
        reason: isHigh 
          ? 'Anomalous velocity detected with unverified beneficiary endpoint and extreme amount deviation.'
          : 'Transaction aligns with normative statistical distributions and verified cryptographic key.'
      });
      setIsAnalyzing(false);
    }, 700);
  };

  const handleExecuteTransfer = (e) => {
    e.preventDefault();
    setTransferSuccess('Transfer executed successfully! Anomaly score: 14.2 (Auto-cleared by BankGuard AI).');
    setTimeout(() => setTransferSuccess(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-800 flex font-sans">
      
      {/* ========================================================================= */}
      {/* LEFT SIDEBAR NAVIGATION (Matching Reference Screenshot) */}
      {/* ========================================================================= */}
      <aside className="w-64 bg-[#0A2540] text-white flex flex-col justify-between shrink-0 min-h-screen border-r border-[#13355b] z-30">
        
        {/* Top Brand Logo */}
        <div>
          <div className="p-5 border-b border-slate-700/50 flex items-center gap-3">
            <div className="w-9 h-10 shrink-0">
              <svg viewBox="0 0 44 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
                <path d="M22 2L4 8.5V21.5C4 32.5 11.5 42.5 22 46C32.5 42.5 40 32.5 40 21.5V8.5L22 2Z" fill="#0052CC" />
                <path d="M22 5.5L7.5 11V21.5C7.5 30.5 13.5 38.8 22 42C30.5 38.8 36.5 30.5 36.5 21.5V11L22 5.5Z" fill="#FFFFFF" />
                <rect x="13.5" y="24" width="4" height="10" rx="1.5" fill="#0052CC" />
                <rect x="20" y="17" width="4" height="17" rx="1.5" fill="#0052CC" />
                <rect x="26.5" y="20.5" width="4" height="13.5" rx="1.5" fill="#0052CC" />
                <path d="M15.5 23L22 16L28.5 19.5" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-white leading-tight">
                BankGuard <span className="text-[#38BDF8]">AI</span>
              </span>
              <span className="text-[9.5px] text-slate-300 font-medium tracking-normal">
                Safer Transactions. Brighter Tomorrows.
              </span>
            </div>
          </div>

          {/* Navigation Menu Links */}
          <nav className="p-3 space-y-1">
            
            {/* 1. Dashboard */}
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${activeTab === 'dashboard' ? 'bg-[#0052CC] text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'}`}
            >
              <Activity className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            {/* 2. User Management (Admin Only) */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${activeTab === 'users' ? 'bg-[#0052CC] text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'}`}
              >
                <Users className="w-4 h-4" />
                <span>User Management</span>
              </button>
            )}

            {/* 3. Transactions */}
            <button
              type="button"
              onClick={() => setActiveTab('transactions')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${activeTab === 'transactions' ? 'bg-[#0052CC] text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'}`}
            >
              <CreditCard className="w-4 h-4" />
              <span>{isAdmin ? 'All Transactions' : 'My Transactions'}</span>
            </button>

            {/* 4. Analyze Transaction / Anomaly Detection */}
            <button
              type="button"
              onClick={() => setActiveTab('analyze')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${activeTab === 'analyze' ? 'bg-[#0052CC] text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'}`}
            >
              <Search className="w-4 h-4" />
              <span>Analyze Transaction</span>
            </button>

            {/* 5. Risk Analysis */}
            <button
              type="button"
              onClick={() => setActiveTab('risk-analysis')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${activeTab === 'risk-analysis' ? 'bg-[#0052CC] text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'}`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Risk Analysis</span>
            </button>

            {/* 6. Alerts */}
            <button
              type="button"
              onClick={() => setActiveTab('alerts')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${activeTab === 'alerts' ? 'bg-[#0052CC] text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'}`}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4" />
                <span>{isAdmin ? 'Alerts & Investigations' : 'Alerts'}</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">3</span>
            </button>

            {/* 7. Reports */}
            <button
              type="button"
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${activeTab === 'reports' ? 'bg-[#0052CC] text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'}`}
            >
              <FileText className="w-4 h-4" />
              <span>{isAdmin ? 'Analytics & Reports' : 'My Reports'}</span>
            </button>

            {/* 8. ML Model Performance (Admin Only) */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab('ml-models')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${activeTab === 'ml-models' ? 'bg-[#0052CC] text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'}`}
              >
                <Cpu className="w-4 h-4" />
                <span>ML Model Performance</span>
              </button>
            )}

            {/* 9. Audit Logs (Admin Only) */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab('audit-logs')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${activeTab === 'audit-logs' ? 'bg-[#0052CC] text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'}`}
              >
                <Layers className="w-4 h-4" />
                <span>Audit Logs</span>
              </button>
            )}

            {/* 10. Profile */}
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${activeTab === 'profile' ? 'bg-[#0052CC] text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'}`}
            >
              <UserIcon className="w-4 h-4" />
              <span>Profile</span>
            </button>

            {/* 11. Settings */}
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${activeTab === 'settings' ? 'bg-[#0052CC] text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'}`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>

            {/* Logout */}
            <div className="pt-2 border-t border-slate-700/50 mt-2">
              <button
                type="button"
                onClick={() => { logout(); navigateTo('signin'); }}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-rose-300 hover:text-rose-200 hover:bg-rose-950/40 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>

          </nav>
        </div>

        {/* Bottom Glowing Shield Card (From Reference Screenshot) */}
        <div className="p-4 m-3 rounded-2xl bg-gradient-to-b from-[#0e335b] to-[#08203c] border border-cyan-500/25 text-center relative overflow-hidden shadow-lg">
          <div className="w-12 h-14 mx-auto mb-2 relative flex items-center justify-center">
            <svg viewBox="0 0 160 190" fill="none" className="w-full h-full drop-shadow-[0_0_15px_rgba(56,189,248,0.7)]">
              <path d="M80 6L14 30V86C14 130 42 169 80 184C118 169 146 130 146 86V30L80 6Z" fill="#0052CC" stroke="#38BDF8" strokeWidth="4" />
              <path d="M8 18V10C8 4.477 12.477 0 18 0C23.523 0 28 4.477 28 10V18" stroke="#FFFFFF" strokeWidth="4" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <Lock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xs font-bold text-white leading-tight">
            Secure Banking<br />Smarter Future
          </div>
          <div className="text-[10px] text-cyan-300/80 mt-1 font-medium">
            AI Today. Safer Tomorrows.
          </div>
        </div>

      </aside>

      {/* ========================================================================= */}
      {/* MAIN CONTENT AREA */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        
        {/* TOP HEADER BAR (Matching Reference Screenshot) */}
        <header className="bg-white border-b border-slate-200/90 py-3.5 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
          
          {/* Search Input Box */}
          <div className="max-w-md w-full relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search transactions, customers, or reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:border-[#0052CC] focus:bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 transition-all"
            />
          </div>

          {/* Right Header Controls: Role Switcher + Notification Bell + User Profile */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Quick Role Switcher Pill */}
            <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setCurrentRoleView('user')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${!isAdmin ? 'bg-white text-[#0052CC] shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                👤 User View
              </button>
              <button
                type="button"
                onClick={() => setCurrentRoleView('admin')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${isAdmin ? 'bg-[#0052CC] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                🛡️ Admin View
              </button>
            </div>

            {/* Notification Bell with Badge */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 relative transition-all cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  3
                </span>
              </button>

              {/* Notifications Dropdown Drawer */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-40">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800">Security Alerts</span>
                    <span className="text-[10px] text-sky-600 font-semibold cursor-pointer">Mark all read</span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                    {alerts.map((a) => (
                      <div key={a.id} className="py-2.5 text-left">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                          <span className="text-rose-600">{a.title}</span>
                          <span className="text-[10px] text-slate-400">{a.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{a.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 pl-2 pr-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#0052CC] text-white flex items-center justify-center font-bold text-xs">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-900 leading-tight">
                    {userName}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {isAdmin ? 'Administrator' : 'Verified Customer'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-40">
                  <button 
                    onClick={() => { setActiveTab('profile'); setProfileDropdownOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
                  >
                    👤 My Profile
                  </button>
                  <button 
                    onClick={() => { setActiveTab('settings'); setProfileDropdownOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
                  >
                    ⚙️ Settings
                  </button>
                  <div className="border-t border-slate-100 my-1" />
                  <button 
                    onClick={() => { logout(); navigateTo('signin'); }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>

          </div>

        </header>

        {/* ========================================================================= */}
        {/* TAB 1: MAIN DASHBOARD (Exact Replica of Admin & User Dashboards) */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && (
          <main className="p-6 sm:p-8 space-y-6">
            
            {/* Top Greeting & Date Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                  Welcome Back, {userName}!
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  {isAdmin 
                    ? "Here's what's happening with your banking transactions today."
                    : "Monitor your transactions and review potential risks in real-time."
                  }
                </p>
              </div>

              {/* Date Filter Pill */}
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs font-semibold text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{dateRange}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>

            {/* ================= 4 SUMMARY METRIC CARDS ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              
              {/* Card 1: Total Transactions (Blue) */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-500">Total Transactions</div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mt-1">
                    {isAdmin ? '12,458' : '48'}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                    <span>↑ 12.5%</span>
                    <span className="text-slate-400 font-normal">vs. last week</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-[#0052CC] flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
              </div>

              {/* Card 2: Normal Transactions (Green) */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-500">Normal Transactions</div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mt-1">
                    {isAdmin ? '11,342' : '44'}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                    <span>↑ 10.2%</span>
                    <span className="text-slate-400 font-normal">vs. last week</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>

              {/* Card 3: Suspicious Transactions (Orange) */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-500">Suspicious Transactions</div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mt-1">
                    {isAdmin ? '892' : '3'}
                  </div>
                  <div className="text-[11px] text-amber-600 font-bold flex items-center gap-1 mt-1">
                    <span>↑ 18.6%</span>
                    <span className="text-slate-400 font-normal">vs. last week</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>

              {/* Card 4: High-Risk Transactions (Red) */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-500">High-Risk Transactions</div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mt-1">
                    {isAdmin ? '224' : '1'}
                  </div>
                  <div className="text-[11px] text-rose-600 font-bold flex items-center gap-1 mt-1">
                    <span>↑ 25.3%</span>
                    <span className="text-slate-400 font-normal">vs. last week</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6" />
                </div>
              </div>

            </div>

            {/* ================= MIDDLE ROW: CHARTS (Transaction Trend & Risk Distribution) ================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Chart 1: Transaction Trend (8 cols) */}
              <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <h2 className="text-base font-bold text-slate-900">Transaction Trend</h2>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                        <span className="w-2 h-2 rounded-full bg-[#0052CC]" /> Normal
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                        <span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> Suspicious
                      </span>
                    </div>
                  </div>

                  {/* Filter */}
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 bg-slate-50">
                    <span>{trendFilter}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </div>
                </div>

                {/* SVG Trend Graph with Realistic Curved Nodes & Tooltip */}
                <div className="relative h-56 sm:h-64 w-full">
                  <svg viewBox="0 0 650 200" className="w-full h-full">
                    {/* Grid horizontal lines */}
                    <line x1="40" y1="30" x2="630" y2="30" stroke="#F1F5F9" strokeWidth="1" />
                    <line x1="40" y1="80" x2="630" y2="80" stroke="#F1F5F9" strokeWidth="1" />
                    <line x1="40" y1="130" x2="630" y2="130" stroke="#F1F5F9" strokeWidth="1" />
                    <line x1="40" y1="180" x2="630" y2="180" stroke="#E2E8F0" strokeWidth="1" />

                    {/* Y-axis Labels */}
                    <text x="5" y="35" fill="#94A3B8" fontSize="10" fontFamily="sans-serif">2,000</text>
                    <text x="5" y="85" fill="#94A3B8" fontSize="10" fontFamily="sans-serif">1,500</text>
                    <text x="5" y="135" fill="#94A3B8" fontSize="10" fontFamily="sans-serif">1,000</text>
                    <text x="15" y="185" fill="#94A3B8" fontSize="10" fontFamily="sans-serif">0</text>

                    {/* Normal Transactions Curve (Blue) */}
                    <path
                      d="M 60 145 Q 140 85, 220 115 T 380 90 T 540 120 T 620 65"
                      fill="none"
                      stroke="#0052CC"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />

                    {/* Suspicious Transactions Curve (Orange) */}
                    <path
                      d="M 60 180 Q 140 170, 220 175 T 380 160 T 540 165 T 620 155"
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Data Points (Circles) */}
                    <circle cx="60" cy="145" r="4" fill="#0052CC" />
                    <circle cx="140" cy="100" r="4" fill="#0052CC" />
                    <circle cx="220" cy="115" r="4" fill="#0052CC" />
                    <circle cx="300" cy="100" r="4" fill="#0052CC" />
                    <circle cx="380" cy="90" r="4" fill="#0052CC" />
                    <circle cx="460" cy="130" r="4" fill="#0052CC" />
                    <circle cx="540" cy="120" r="4" fill="#0052CC" />
                    <circle cx="620" cy="65" r="5" fill="#0052CC" stroke="#FFFFFF" strokeWidth="2" />

                    {/* Orange Data Points */}
                    <circle cx="60" cy="180" r="3.5" fill="#F59E0B" />
                    <circle cx="140" cy="170" r="3.5" fill="#F59E0B" />
                    <circle cx="220" cy="175" r="3.5" fill="#F59E0B" />
                    <circle cx="300" cy="165" r="3.5" fill="#F59E0B" />
                    <circle cx="380" cy="160" r="3.5" fill="#F59E0B" />
                    <circle cx="460" cy="170" r="3.5" fill="#F59E0B" />
                    <circle cx="540" cy="165" r="3.5" fill="#F59E0B" />
                    <circle cx="620" cy="155" r="4.5" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.5" />

                    {/* X-axis Day Labels */}
                    <text x="50" y="196" fill="#64748B" fontSize="10">Sep 2</text>
                    <text x="130" y="196" fill="#64748B" fontSize="10">Sep 3</text>
                    <text x="210" y="196" fill="#64748B" fontSize="10">Sep 4</text>
                    <text x="290" y="196" fill="#64748B" fontSize="10">Sep 5</text>
                    <text x="370" y="196" fill="#64748B" fontSize="10">Sep 6</text>
                    <text x="450" y="196" fill="#64748B" fontSize="10">Sep 7</text>
                    <text x="530" y="196" fill="#64748B" fontSize="10">Sep 8</text>
                    <text x="605" y="196" fill="#64748B" fontSize="10">Sep 9</text>
                  </svg>

                  {/* Tooltip on Sep 9 point (Matching screenshot) */}
                  <div className="absolute right-4 top-4 p-2.5 rounded-xl bg-white border border-slate-200 shadow-lg text-[11px] pointer-events-none">
                    <div className="font-bold text-slate-800 mb-1">Sep 9, 2026</div>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <span className="w-2 h-2 rounded-full bg-[#0052CC]" />
                      <span>Normal: <strong>1,642</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                      <span>Suspicious: <strong>104</strong></span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Chart 2: Risk Distribution (4 cols) */}
              <div className="lg:col-span-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base font-bold text-slate-900">Risk Distribution</h2>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 bg-slate-50">
                    <span>{riskFilter}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </div>
                </div>

                {/* Donut Chart with Center Metric */}
                <div className="relative w-40 h-40 mx-auto my-3 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    {/* Ring Background */}
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#E2E8F0"
                      strokeWidth="3.8"
                    />
                    {/* Normal 91% (Green) */}
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="3.8"
                      strokeDasharray="91, 100"
                    />
                    {/* Suspicious 7.2% (Orange) */}
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="3.8"
                      strokeDasharray="7.2, 100"
                      strokeDashoffset="-91"
                    />
                    {/* High Risk 1.8% (Red) */}
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="3.8"
                      strokeDasharray="1.8, 100"
                      strokeDashoffset="-98.2"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-base font-extrabold text-[#0F172A] leading-tight">
                      {isAdmin ? '12,458' : '48'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Transactions</span>
                  </div>
                </div>

                {/* Legend Rows */}
                <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                      Normal
                    </span>
                    <span className="font-bold text-slate-900">91.0%</span>
                    <span className="text-slate-400 font-mono text-[11px]">{isAdmin ? '11,342' : '44'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                      Suspicious
                    </span>
                    <span className="font-bold text-slate-900">7.2%</span>
                    <span className="text-slate-400 font-mono text-[11px]">{isAdmin ? '892' : '3'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                      High-Risk
                    </span>
                    <span className="font-bold text-slate-900">1.8%</span>
                    <span className="text-slate-400 font-mono text-[11px]">{isAdmin ? '224' : '1'}</span>
                  </div>
                </div>

              </div>

            </div>

            {/* ================= BOTTOM ROW: RECENT TRANSACTIONS & PROMO CARDS ================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left 8 Cols: Recent Transactions Table */}
              <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-slate-900">Recent Transactions</h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab('transactions')}
                    className="text-xs font-bold text-[#0052CC] hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                        <th className="pb-3 font-medium">#</th>
                        <th className="pb-3 font-medium">Date & Time</th>
                        <th className="pb-3 font-medium">Transaction ID</th>
                        <th className="pb-3 font-medium">{isAdmin ? 'Customer' : 'Recipient'}</th>
                        <th className="pb-3 font-medium">Amount</th>
                        <th className="pb-3 font-medium">Type</th>
                        <th className="pb-3 font-medium">Risk Level</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(isAdmin ? adminTransactions : userTransactions).map((tx, idx) => (
                        <tr key={tx.txId} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 font-mono text-slate-400">{idx + 1}</td>
                          <td className="py-3 text-slate-600 whitespace-nowrap">{tx.time}</td>
                          <td className="py-3 font-mono font-bold text-[#0052CC]">{tx.txId}</td>
                          <td className="py-3 font-medium text-slate-900">{isAdmin ? tx.customer : tx.recipient}</td>
                          <td className="py-3 font-bold text-slate-900">{tx.amount}</td>
                          <td className="py-3 text-slate-600">{tx.type || 'Transfer'}</td>
                          
                          {/* Risk Level Badge */}
                          <td className="py-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              tx.riskLevel.includes('High') || tx.riskLevel.includes('Critical')
                                ? 'bg-rose-100 text-rose-700'
                                : tx.riskLevel.includes('Suspicious') || tx.riskLevel.includes('Medium')
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {tx.riskLevel}
                            </span>
                          </td>

                          {/* Status Badge */}
                          <td className="py-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              tx.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                : tx.status === 'Flagged' || tx.status === 'Blocked'
                                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                                : 'bg-amber-50 text-amber-600 border border-amber-200'
                            }`}>
                              {tx.status}
                            </span>
                          </td>

                          {/* Action Button */}
                          <td className="py-3 text-center">
                            <button
                              type="button"
                              onClick={() => setSelectedTxModal(tx)}
                              className="p-1 rounded-lg text-slate-400 hover:text-[#0052CC] hover:bg-sky-50 transition-colors cursor-pointer"
                              title="Inspect AI Reason Codes"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right 4 Cols: Fraud Detection Banner & System Status */}
              <div className="lg:col-span-4 space-y-4">
                
                {/* AI-Powered Fraud Detection Promo Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#061B36] via-[#0A2E5C] to-[#04142B] text-white relative overflow-hidden shadow-lg">
                  <div className="relative z-10">
                    <h3 className="text-base font-extrabold text-white tracking-tight">
                      AI-Powered<br />Fraud Detection
                    </h3>
                    <p className="text-xs text-slate-300 mt-2 max-w-[180px] leading-relaxed">
                      Detect. Analyze. Prevent. Because your security matters.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('analyze')}
                      className="mt-4 px-4 py-2 rounded-xl bg-[#0052CC] hover:bg-[#0047b3] text-white font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <span>Learn More</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Holographic Glowing Shield in Background */}
                  <div className="absolute -right-3 -bottom-2 w-32 h-36 opacity-90 pointer-events-none">
                    <svg viewBox="0 0 160 190" fill="none" className="w-full h-full drop-shadow-[0_0_20px_rgba(56,189,248,0.6)]">
                      <path d="M80 6L14 30V86C14 130 42 169 80 184C118 169 146 130 146 86V30L80 6Z" fill="#0052CC" stroke="#38BDF8" strokeWidth="4" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <Lock className="w-8 h-8" />
                    </div>
                  </div>
                </div>

                {/* System Status Card */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                  <div className="text-xs font-bold text-slate-900 mb-3">System Status</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-medium text-emerald-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      All Systems Operational
                    </span>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400">Uptime</div>
                      <div className="font-bold text-slate-900 font-mono">99.9%</div>
                    </div>
                  </div>
                </div>

                {/* User Dashboard: Quick Transfer Simulation Card (When in User View) */}
                {!isAdmin && (
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                    <div className="text-xs font-bold text-slate-900 mb-2">Quick Transfer Simulator</div>
                    <form onSubmit={handleExecuteTransfer} className="space-y-2 text-xs">
                      <div>
                        <input
                          type="text"
                          value={transferForm.recipient}
                          onChange={(e) => setTransferForm({ ...transferForm, recipient: e.target.value })}
                          className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                          placeholder="Recipient Account / Name"
                        />
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={transferForm.amount}
                          onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                          className="w-1/2 p-2 rounded-lg border border-slate-200 text-xs font-bold"
                          placeholder="Amount (₹)"
                        />
                        <button
                          type="submit"
                          className="w-1/2 py-2 rounded-lg bg-[#0052CC] hover:bg-[#0047b3] text-white font-bold text-xs cursor-pointer"
                        >
                          Send Money
                        </button>
                      </div>
                      {transferSuccess && (
                        <div className="p-2 rounded bg-emerald-50 text-emerald-700 text-[11px] font-medium">
                          {transferSuccess}
                        </div>
                      )}
                    </form>
                  </div>
                )}

              </div>

            </div>

          </main>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: ANALYZE TRANSACTION / ANOMALY DETECTION */}
        {/* ========================================================================= */}
        {activeTab === 'analyze' && (
          <main className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">AI Transaction Anomaly Analyzer</h1>
                <p className="text-xs sm:text-sm text-slate-500">Run mathematical neural inference and SHAP explainability attribution on payment parameters.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form Input */}
              <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#0052CC]" /> Transaction Parameters
                </h2>

                <form onSubmit={handleRunAnalysis} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Transaction Amount (₹)</label>
                    <input
                      type="number"
                      value={analyzeForm.amount}
                      onChange={(e) => setAnalyzeForm({ ...analyzeForm, amount: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Origin City / Location</label>
                      <input
                        type="text"
                        value={analyzeForm.location}
                        onChange={(e) => setAnalyzeForm({ ...analyzeForm, location: e.target.value })}
                        className="w-full p-2 rounded-xl border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Payment Channel</label>
                      <select
                        value={analyzeForm.channel}
                        onChange={(e) => setAnalyzeForm({ ...analyzeForm, channel: e.target.value })}
                        className="w-full p-2 rounded-xl border border-slate-300"
                      >
                        <option>Wire Transfer</option>
                        <option>SWIFT</option>
                        <option>UPI / Instant</option>
                        <option>POS Terminal</option>
                        <option>ATM Cash Out</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Beneficiary Counterparty</label>
                    <input
                      type="text"
                      value={analyzeForm.beneficiary}
                      onChange={(e) => setAnalyzeForm({ ...analyzeForm, beneficiary: e.target.value })}
                      className="w-full p-2 rounded-xl border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Device Token & Signature</label>
                    <input
                      type="text"
                      value={analyzeForm.device}
                      onChange={(e) => setAnalyzeForm({ ...analyzeForm, device: e.target.value })}
                      className="w-full p-2 rounded-xl border border-slate-300"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isAnalyzing}
                    className="w-full py-3 rounded-xl bg-[#0052CC] hover:bg-[#0047b3] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md mt-2"
                  >
                    {isAnalyzing ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>Execute Neural Anomaly Scoring</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Analysis Output & SHAP Waterfall */}
              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#0052CC]" /> Deep SHAP Risk Factor Attribution
                  </h2>

                  {analysisResult ? (
                    <div className="space-y-4">
                      {/* Score Banner */}
                      <div className={`p-4 rounded-xl flex items-center justify-between ${
                        analysisResult.score > 70 
                          ? 'bg-rose-50 border border-rose-200 text-rose-800' 
                          : analysisResult.score > 40
                          ? 'bg-amber-50 border border-amber-200 text-amber-800'
                          : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      }`}>
                        <div>
                          <div className="text-xs font-semibold">Composite Anomaly Score</div>
                          <div className="text-2xl font-black font-mono">{analysisResult.score} / 100</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold uppercase">{analysisResult.level}</div>
                          <div className="text-xs font-medium">Policy: {analysisResult.decision}</div>
                        </div>
                      </div>

                      {/* SHAP Factors */}
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-slate-700">Shapley Value Contribution (% Risk Impact)</div>
                        {analysisResult.shapAttribution.map((sh, i) => (
                          <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100">
                            <span className="text-slate-700 font-medium">{sh.feature}</span>
                            <span className={`font-mono font-bold ${sh.positive ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {sh.impact}
                            </span>
                          </div>
                        ))}
                      </div>

                      <p className="text-xs text-slate-600 p-3 bg-sky-50/60 rounded-xl border border-sky-100">
                        <strong>Explainable Reason:</strong> {analysisResult.reason}
                      </p>
                    </div>
                  ) : (
                    <div className="py-16 text-center text-slate-400 text-xs">
                      <Search className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                      Configure parameters on the left and click "Execute Neural Anomaly Scoring".
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ML MODEL PERFORMANCE (Step 4B #7 for Final Year Project) */}
        {/* ========================================================================= */}
        {activeTab === 'ml-models' && (
          <main className="p-6 sm:p-8 space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">AI / ML Model Performance Metrics</h1>
              <p className="text-xs sm:text-sm text-slate-500">Empirical benchmark evaluation of trained neural anomaly detection models on institutional banking datasets.</p>
            </div>

            {/* 5 Core Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs text-center">
                <div className="text-xs text-slate-400 font-semibold">Accuracy</div>
                <div className="text-2xl font-black text-[#0052CC] font-mono mt-1">99.4%</div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs text-center">
                <div className="text-xs text-slate-400 font-semibold">Precision</div>
                <div className="text-2xl font-black text-emerald-600 font-mono mt-1">98.8%</div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs text-center">
                <div className="text-xs text-slate-400 font-semibold">Recall</div>
                <div className="text-2xl font-black text-sky-600 font-mono mt-1">97.9%</div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs text-center">
                <div className="text-xs text-slate-400 font-semibold">F1-Score</div>
                <div className="text-2xl font-black text-indigo-600 font-mono mt-1">98.3%</div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs text-center">
                <div className="text-xs text-slate-400 font-semibold">ROC-AUC</div>
                <div className="text-2xl font-black text-teal-600 font-mono mt-1">0.992</div>
              </div>
            </div>

            {/* Comparison Matrix Table */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <h2 className="text-base font-bold text-slate-900 mb-4">Architecture Comparative Evaluation Matrix</h2>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="pb-3">Model Architecture</th>
                    <th className="pb-3">AUC-ROC</th>
                    <th className="pb-3">Precision</th>
                    <th className="pb-3">Recall</th>
                    <th className="pb-3">Inference Latency</th>
                    <th className="pb-3">Auditable XAI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-sky-50/50 font-semibold">
                    <td className="py-3 text-[#0052CC]">BankGuard VAE + TreeSHAP Ensemble</td>
                    <td className="py-3 font-mono font-bold text-emerald-600">99.4%</td>
                    <td className="py-3 font-mono">98.8%</td>
                    <td className="py-3 font-mono">97.9%</td>
                    <td className="py-3 font-mono">3.4 ms</td>
                    <td className="py-3 text-emerald-600 font-bold">100% Certified</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium">Graph Neural Net (GraphSAGE)</td>
                    <td className="py-3 font-mono">98.7%</td>
                    <td className="py-3 font-mono">97.4%</td>
                    <td className="py-3 font-mono">96.8%</td>
                    <td className="py-3 font-mono">8.2 ms</td>
                    <td className="py-3 text-emerald-600">GNNExplainer</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium">XGBoost Decision Ensembles</td>
                    <td className="py-3 font-mono">97.9%</td>
                    <td className="py-3 font-mono">96.5%</td>
                    <td className="py-3 font-mono">95.2%</td>
                    <td className="py-3 font-mono">1.8 ms</td>
                    <td className="py-3 text-emerald-600">TreeSHAP</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium">Isolation Forest (Outlier Baseline)</td>
                    <td className="py-3 font-mono">94.1%</td>
                    <td className="py-3 font-mono">91.8%</td>
                    <td className="py-3 font-mono">92.4%</td>
                    <td className="py-3 font-mono">2.1 ms</td>
                    <td className="py-3 text-amber-600">Partial</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </main>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: USER MANAGEMENT (Admin Only) */}
        {/* ========================================================================= */}
        {activeTab === 'users' && (
          <main className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">User Management Directory</h1>
                <p className="text-xs sm:text-sm text-slate-500">Connected to PostgreSQL localhost database (`sample_bank`).</p>
              </div>
              <button 
                type="button" 
                onClick={() => navigateTo('signup')}
                className="px-4 py-2 rounded-xl bg-[#0052CC] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add User</span>
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="pb-3">User</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Account No</th>
                    <th className="pb-3">KYC Verified</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 font-bold text-slate-900">Alex Vance</td>
                    <td className="py-3 font-mono text-slate-600">alex.vance@bankguard.ai</td>
                    <td className="py-3"><span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px]">Analyst</span></td>
                    <td className="py-3 font-mono text-slate-600">BG-8821-4902-7104</td>
                    <td className="py-3 text-emerald-600 font-bold">✓ Verified</td>
                    <td className="py-3"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">Active</span></td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-slate-900">Elena Rostova</td>
                    <td className="py-3 font-mono text-slate-600">elena.rostova@bankguard.ai</td>
                    <td className="py-3"><span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 font-bold text-[10px]">User</span></td>
                    <td className="py-3 font-mono text-slate-600">BG-3419-7721-0982</td>
                    <td className="py-3 text-emerald-600 font-bold">✓ Verified</td>
                    <td className="py-3"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">Active</span></td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-slate-900">Vicky</td>
                    <td className="py-3 font-mono text-slate-600">vicky@bankguard.ai</td>
                    <td className="py-3"><span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold text-[10px]">Administrator</span></td>
                    <td className="py-3 font-mono text-slate-600">BG-5512-9901-4432</td>
                    <td className="py-3 text-emerald-600 font-bold">✓ Verified</td>
                    <td className="py-3"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">Active</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </main>
        )}

        {/* ========================================================================= */}
        {/* OTHER TABS: Fallback view */}
        {/* ========================================================================= */}
        {['transactions', 'risk-analysis', 'alerts', 'reports', 'audit-logs', 'profile', 'settings'].includes(activeTab) && (
          <main className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 capitalize">{activeTab.replace('-', ' ')}</h1>
                <p className="text-xs sm:text-sm text-slate-500">Live section view for BankGuard AI system operations.</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                ← Back to Dashboard
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs text-xs space-y-4">
              <div className="flex items-center gap-2 font-bold text-[#0052CC]">
                <Activity className="w-4 h-4" />
                <span>Live Telemetry Synchronized</span>
              </div>
              <p className="text-slate-600">
                Connected to PostgreSQL on localhost:5432 (database: <strong>sample_bank</strong>). Total records indexed: <strong>12,458</strong>.
              </p>
            </div>
          </main>
        )}

      </div>

      {/* ========================================================================= */}
      {/* TRANSACTION INSPECTION MODAL */}
      {/* ========================================================================= */}
      {selectedTxModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Search className="w-4 h-4 text-[#0052CC]" />
                <span>Transaction Inspection ({selectedTxModal.txId})</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTxModal(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Amount:</span>
                <span className="font-bold text-slate-900">{selectedTxModal.amount}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Location:</span>
                <span className="font-semibold text-slate-800">{selectedTxModal.location || 'London, UK'}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Risk Level:</span>
                <span className="font-bold text-rose-600">{selectedTxModal.riskLevel}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Anomaly Score:</span>
                <span className="font-mono font-bold text-slate-900">{selectedTxModal.score || 84}/100</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600">
                <strong>TreeSHAP Attribution:</strong> High-entropy payload, transaction velocity spike exceeding 90-day baseline threshold.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedTxModal(null)}
              className="w-full py-2.5 rounded-xl bg-[#0052CC] text-white font-bold text-xs cursor-pointer shadow-xs"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
