import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.jpg';

export default function LoginPage() {
  const { signIn, navigateTo } = useAuth();
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forgotPasswordMsg, setForgotPasswordMsg] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setForgotPasswordMsg(false);

    if (!identifier.trim() || !password) {
      setError('Please enter your email or username and password.');
      return;
    }

    setLoading(true);

    try {
      await signIn(identifier.trim(), password);
      setLoading(false);
      // Valid credentials -> Redirect to Dashboard
      navigateTo('portal');
    } catch (err) {
      setLoading(false);
      // Invalid credentials -> Display Error Message
      setError(err.message || 'Invalid email/username or password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-sky-500/20 selection:text-sky-900 font-sans">
      {/* Top Header */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200 py-3.5 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-2.5">
            <img src={logoImg} alt="BankGuard AI Logo" className="w-7 h-7 rounded-lg object-cover shadow-xs" />
            <span className="text-base font-black text-slate-900">
              BankGuard <span className="text-sky-600">AI</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigateTo('signup')}
            className="text-xs font-bold text-sky-600 hover:underline cursor-pointer"
          >
            Create an Account
          </button>
        </div>
      </header>

      {/* Main Login Container */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex items-center">
        <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10">
          
          {/* 1. BankGuard AI Logo & Subtitle */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl overflow-hidden p-[1.5px] bg-gradient-to-tr from-sky-500 via-blue-600 to-emerald-500 shadow-md">
              <img src={logoImg} alt="BankGuard AI Logo" className="w-full h-full object-cover rounded-[14px]" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              BankGuard <span className="text-sky-600">AI</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-medium">
              AI Banking Transaction Anomaly Detection & Explainable Risk Analysis
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {forgotPasswordMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-800 text-xs flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 shrink-0 text-sky-600" />
              <span>Password recovery instructions have been sent to your registered email address.</span>
            </div>
          )}

          {/* 2. Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Email / Username */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email / Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setError(null);
                  }}
                  placeholder="Enter your email or username"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium transition-all"
                  required
                />
              </div>
            </div>

            {/* Password with 👁 Show/Hide toggle */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 3. Remember Me & 4. Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 w-3.5 h-3.5 cursor-pointer"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => setForgotPasswordMsg(true)}
                className="text-xs text-slate-500 hover:text-sky-600 font-medium cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            {/* 5. Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Verifying credentials in PostgreSQL...</span>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* 6. Register Link */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-center text-xs text-slate-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => navigateTo('signup')}
              className="text-sky-600 font-bold hover:underline cursor-pointer"
            >
              Create an Account
            </button>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        © 2026 BankGuard AI • AI Banking Transaction Anomaly Detection & Explainable Risk Analysis
      </footer>
    </div>
  );
}
