import React, { useState } from 'react';
import { Database, CheckCircle2, AlertCircle, RefreshCw, KeyRound, Server, ShieldCheck, Terminal, ExternalLink, ArrowLeft, Check, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.jpg';

export default function DbConfigPage() {
  const { dbStatus, isDbLoading, checkDbStatus, testDbConnection, navigateTo } = useAuth();
  const [pgPassword, setPgPassword] = useState('2107');
  const [pgUser, setPgUser] = useState('postgres');
  const [pgDatabase, setPgDatabase] = useState('sample_bank');
  const [pgHost, setPgHost] = useState('localhost');
  const [pgPort, setPgPort] = useState('5432');
  const [testing, setTesting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleTestConnection = async (e) => {
    e.preventDefault();
    setTesting(true);
    setFeedback(null);

    const result = await testDbConnection({
      user: pgUser,
      password: pgPassword,
      host: pgHost,
      port: pgPort,
      db: pgDatabase
    });

    setTesting(false);
    setFeedback(result);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-sky-500/20 selection:text-sky-900">
      {/* Top Header */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200 py-3.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <img src={logoImg} alt="Logo" className="w-7 h-7 rounded-lg object-cover shadow-xs" />
              <span className="text-base font-black text-slate-900">
                Bank<span className="text-sky-600">Guard</span> AI
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigateTo('signin')}
              className="text-xs font-bold text-sky-600 hover:underline cursor-pointer"
            >
              Go to Sign In Portal
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10">
          
          {/* Header */}
          <div className="text-center max-w-xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold mb-3">
              <Database className="w-3.5 h-3.5 text-sky-600" />
              <span>PostgreSQL localhost Database Manager</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              pgAdmin 4 Database Configuration
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Connect your local PostgreSQL instance on port 5432 to sync users, transactions, and security audits.
            </p>
          </div>

          {/* Connection Status Banner */}
          <div className={`p-5 rounded-2xl border mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            dbStatus.connected ? 'bg-emerald-50/80 border-emerald-200' : 'bg-amber-50/80 border-amber-200'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-md ${
                dbStatus.connected ? 'bg-emerald-500' : 'bg-amber-500'
              }`}>
                <Server className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-base font-black text-slate-900">
                    {dbStatus.database_type || 'PostgreSQL (pgAdmin 4)'}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    dbStatus.connected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {dbStatus.connected ? 'ONLINE & SYNCED' : 'STANDBY / LOCAL STORAGE'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Host: <span className="font-mono font-bold">{dbStatus.host}:{dbStatus.port}</span> | Database: <span className="font-mono font-bold">{dbStatus.database}</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={checkDbStatus}
              disabled={isDbLoading}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 ${isDbLoading ? 'animate-spin text-sky-600' : ''}`} />
              <span>Ping Status</span>
            </button>
          </div>

          {feedback && (
            <div className={`mb-6 p-4 rounded-2xl text-xs flex items-center gap-3 border ${
              feedback.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              {feedback.success ? <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" /> : <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />}
              <span className="font-medium text-sm">{feedback.message}</span>
            </div>
          )}

          {/* Quick Guide */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-3">
                <Terminal className="w-4 h-4 text-sky-600" />
                <span>pgAdmin 4 Setup Steps:</span>
              </h3>
              <ol className="list-decimal list-inside text-xs text-slate-600 space-y-2">
                <li>
                  Open pgAdmin 4 &rarr; expand <span className="font-bold text-slate-900">Servers</span> &rarr; <span className="font-bold text-slate-900">PostgreSQL</span>.
                </li>
                <li>
                  Right click <span className="font-bold text-slate-900">Databases</span> &rarr; <span className="font-bold text-slate-900">Create &rarr; Database</span>.
                </li>
                <li>
                  Name it <code className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-bold text-sky-700">sample_bank</code> and click Save.
                </li>
              </ol>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Synchronized Tables:</span>
              </h3>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span><strong className="text-slate-900">users</strong>: Profiles, balances, roles & hashed passwords</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span><strong className="text-slate-900">transactions</strong>: Streaming payments & SHAP anomaly scores</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span><strong className="text-slate-900">security_audits</strong>: Logins, MFA & compliance trails</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Connection Test Form */}
          <form onSubmit={handleTestConnection} className="space-y-4 max-w-2xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  PostgreSQL User
                </label>
                <input
                  type="text"
                  value={pgUser}
                  onChange={(e) => setPgUser(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  PostgreSQL Password
                </label>
                <input
                  type="password"
                  value={pgPassword}
                  onChange={(e) => setPgPassword(e.target.value)}
                  placeholder="e.g. 2107"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Host</label>
                <input
                  type="text"
                  value={pgHost}
                  onChange={(e) => setPgHost(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Port</label>
                <input
                  type="text"
                  value={pgPort}
                  onChange={(e) => setPgPort(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Database</label>
                <input
                  type="text"
                  value={pgDatabase}
                  onChange={(e) => setPgDatabase(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={testing}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white font-bold text-sm shadow-md shadow-sky-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {testing ? (
                <span>Verifying Connection to localhost:5432...</span>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  <span>Connect & Synchronize PostgreSQL</span>
                </>
              )}
            </button>
          </form>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        © 2026 BankGuard AI • AI Banking Transaction Anomaly Detection & Explainable Risk Analysis
      </footer>
    </div>
  );
}
