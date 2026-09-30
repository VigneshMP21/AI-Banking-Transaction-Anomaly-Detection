import React, { useState } from 'react';
import { ShieldCheck, LogOut, Copy, Check, CreditCard, ArrowUpRight, Activity, Database, Lock, RefreshCw, Send, AlertTriangle, ArrowLeft, Globe, Terminal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.jpg';

export default function BankingPortalPage({ onLaunchSandboxTx }) {
  const { user, logout, dbStatus, navigateTo } = useAuth();
  const [copied, setCopied] = useState(false);
  const [txAmount, setTxAmount] = useState('45000');
  const [txRecipient, setTxRecipient] = useState('Nordic Clearnet Stockholm');
  const [txChannel, setTxChannel] = useState('SWIFT');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center">
          <Lock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Banking Session Inactive</h2>
          <p className="text-xs text-slate-500 mb-6">Please sign in to access your institutional banking vault.</p>
          <button
            type="button"
            onClick={() => navigateTo('signin')}
            className="w-full py-3 px-4 rounded-xl bg-sky-600 text-white font-bold text-xs shadow-md"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(user.account_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateTransfer = async (e) => {
    e.preventDefault();
    setIsSimulating(true);
    setSimulationResult(null);

    const numericAmount = parseFloat(txAmount) || 10000;
    const isAnomaly = numericAmount > 100000 || txRecipient.toLowerCase().includes('offshore');

    setTimeout(() => {
      setIsSimulating(false);
      const riskScore = isAnomaly ? 88.4 : 4.2;
      const decision = riskScore > 75 ? 'STEP_UP_MFA' : 'AUTO_CLEARED';
      const resultObj = {
        amount: numericAmount,
        currency: user.currency || 'USD',
        recipient: txRecipient,
        channel: txChannel,
        riskScore,
        decision,
        reason: isAnomaly ? 'High-value velocity spike + foreign jurisdiction flag' : 'Normal clearing velocity, whitelisted recipient'
      };
      setSimulationResult(resultObj);

      if (onLaunchSandboxTx) {
        onLaunchSandboxTx({
          sender: user.name,
          recipient: txRecipient,
          amount: numericAmount,
          currency: user.currency || 'USD',
          channel: txChannel,
          risk: riskScore,
          anomaly: isAnomaly
        });
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-sky-500/20 selection:text-sky-900">
      {/* Top Navigation */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200 py-3.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Landing & 3D Globe</span>
            </button>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <img src={logoImg} alt="Logo" className="w-7 h-7 rounded-lg object-cover shadow-xs" />
              <span className="text-base font-black text-slate-900">
                Bank<span className="text-sky-600">Guard</span> AI Vault
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigateTo('db-config')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-all cursor-pointer"
            >
              <span className={`w-2 h-2 rounded-full ${dbStatus.connected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span>PostgreSQL:</span>
              <span className={dbStatus.connected ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                {dbStatus.connected ? 'sample_bank' : 'Offline'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                logout();
                navigateTo('signin');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b border-slate-200 gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-sky-500/20">
              {(user.name || user.full_name || user.username || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-slate-900">{user.name || user.full_name || user.username || 'User'}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Vault</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {user.email} • <span className="text-sky-600 font-bold">{user.role || 'Client'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-bold shadow-md hover:scale-[1.02] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>View 3D Live Anomaly Matrix</span>
            </button>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          
          {/* Left: Luxury Hologram Banking Card (6 cols) */}
          <div className="lg:col-span-6 p-7 rounded-3xl bg-gradient-to-tr from-slate-900 via-sky-950 to-blue-900 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[260px]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between text-xs text-sky-300">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-sky-400" />
                  <span className="font-black tracking-widest uppercase text-sm">{user.account_tier}</span>
                </div>
                <span className="font-mono text-[10px] bg-white/10 px-2.5 py-0.5 rounded border border-white/20 font-bold">
                  256-BIT CHIP ACTIVE
                </span>
              </div>

              <div className="mt-6">
                <span className="text-[11px] text-slate-400 uppercase tracking-widest block font-bold">
                  Available Liquidity Balance
                </span>
                <div className="text-3xl sm:text-4xl font-black text-white font-mono mt-1">
                  {user.currency === 'EUR' ? '€' : user.currency === 'GBP' ? '£' : user.currency === 'INR' ? '₹' : '$'}
                  {Number(user.balance || 150000).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">Account Number</span>
                <span className="font-mono text-sm font-bold text-white tracking-widest">{user.account_number}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyAccount}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer text-xs flex items-center gap-1.5 font-bold"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Right: Real-time AI Security & Anomaly Guard (6 cols) */}
          <div className="lg:col-span-6 p-7 rounded-3xl bg-white border border-slate-200 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-600" />
                  <span>Real-Time Anomaly Guard & XAI Status</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  SHAP Surveillance Active
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-600 font-medium">Account Risk Scoring Index:</span>
                  <span className="font-mono font-black text-emerald-600">4.8 / 100 (TRUSTED LOW)</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-600 font-medium">PostgreSQL Database Sync:</span>
                  <span className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${dbStatus.connected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    {dbStatus.connected ? 'sample_bank Connected' : 'Local Fallback'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-600 font-medium">Multi-Factor Enforcement:</span>
                  <span className="font-bold text-sky-700">FIDO2 Hardware Key Enforced</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>ISO-20022 Financial Standard</span>
              <span>GDPR Article 22 Compliant</span>
            </div>
          </div>

        </div>

        {/* Transfer & Anomaly Detection Simulator Section */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-sky-600" />
              <span>Simulate Banking Transfer & Inspect Real-Time XAI Decision</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">Sends telemetry to risk engine</span>
          </div>

          <form onSubmit={handleSimulateTransfer} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Transfer Amount</label>
              <input
                type="number"
                value={txAmount}
                onChange={(e) => setTxAmount(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 font-mono font-bold"
                placeholder="45000"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Recipient Entity</label>
              <input
                type="text"
                value={txRecipient}
                onChange={(e) => setTxRecipient(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 font-medium"
                placeholder="Nordic Clearnet Stockholm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Clearing Channel</label>
              <select
                value={txChannel}
                onChange={(e) => setTxChannel(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 font-medium"
              >
                <option value="SWIFT">SWIFT Network</option>
                <option value="WIRE">Fedwire / CHAPS</option>
                <option value="ACH">Corporate ACH</option>
                <option value="UPI">Instant UPI/POS</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isSimulating}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-sm shadow-md hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowUpRight className="w-4 h-4" />}
                <span>Execute Transfer</span>
              </button>
            </div>
          </form>

          {simulationResult && (
            <div className={`mt-5 p-4 rounded-2xl text-xs flex items-start gap-3 border ${
              simulationResult.riskScore > 75 ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              {simulationResult.riskScore > 75 ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between font-bold text-sm mb-1">
                  <span>Decision: {simulationResult.decision}</span>
                  <span className="font-mono">AI Risk Score: {simulationResult.riskScore}%</span>
                </div>
                <p className="text-xs opacity-90">{simulationResult.reason}</p>
              </div>
            </div>
          )}
        </div>

      </main>

      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        © 2026 BankGuard AI • AI Banking Transaction Anomaly Detection & Explainable Risk Analysis
      </footer>
    </div>
  );
}
