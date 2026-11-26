import React, { useState, useRef, useEffect, useId } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
  Database,
  UserCheck,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const REMEMBER_STORAGE_KEY = 'bankguard_remembered_ident';

export default function LoginPage() {
  const { signIn, navigateTo, dbStatus, demoUsers } = useAuth();

  const [identifier, setIdentifier] = useState(() => localStorage.getItem(REMEMBER_STORAGE_KEY) || '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => Boolean(localStorage.getItem(REMEMBER_STORAGE_KEY)));
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [touched, setTouched] = useState({ identifier: false, password: false });
  const [submitted, setSubmitted] = useState(false);

  // Forgot Password <dialog> state
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const resetDialogRef = useRef(null);

  const identifierRef = useRef(null);
  const passwordRef = useRef(null);

  const identId = useId();
  const identErrorId = useId();
  const passId = useId();
  const passErrorId = useId();
  const toggleHintId = useId();
  const resetEmailId = useId();

  useEffect(() => {
    const dialog = resetDialogRef.current;
    if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return;

    const isOutside = (e) => {
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };

    let pressedOutside = false;
    const onDown = (e) => {
      pressedOutside = isOutside(e);
    };
    const onUp = (e) => {
      if (pressedOutside && isOutside(e)) dialog.close();
      pressedOutside = false;
    };
    dialog.addEventListener('pointerdown', onDown);
    dialog.addEventListener('pointerup', onUp);
    return () => {
      dialog.removeEventListener('pointerdown', onDown);
      dialog.removeEventListener('pointerup', onUp);
    };
  }, []);

  const identInvalid = (touched.identifier || submitted) && !identifier.trim();
  const passInvalid = (touched.password || submitted) && !password;

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setServerError(null);

    if (!identifier.trim()) {
      identifierRef.current?.focus();
      return;
    }
    if (!password) {
      passwordRef.current?.focus();
      return;
    }

    setLoading(true);
    try {
      await signIn(identifier.trim(), password);
      if (rememberMe) {
        localStorage.setItem(REMEMBER_STORAGE_KEY, identifier.trim());
      } else {
        localStorage.removeItem(REMEMBER_STORAGE_KEY);
      }
      setLoading(false);
      navigateTo('portal');
    } catch (err) {
      setLoading(false);
      setServerError(err.message || 'Authentication failed. Please check your credentials.');
    }
  };

  const applyDemoProfile = (demo) => {
    setIdentifier(demo.email);
    setPassword(demo.password);
    setServerError(null);
    setTouched({ identifier: false, password: false });
    setSubmitted(false);
  };

  const openResetDialog = () => {
    setResetEmail(identifier.includes('@') ? identifier : '');
    setResetSent(false);
    resetDialogRef.current?.showModal();
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setResetSent(true);
  };

  const analystDemo = demoUsers?.[0];
  const customerDemo = demoUsers?.[1];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col lg:flex-row">
      {/* Left Institutional Navy Panel */}
      <aside className="lg:w-[44%] xl:w-[42%] bg-[#0A2540] text-white p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
        <div>
          {/* Top Brand + Back */}
          <div className="flex items-center justify-between gap-4">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('home');
              }}
              className="inline-flex items-center gap-3 group"
            >
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
                <div className="text-lg font-extrabold tracking-tight text-white leading-none">
                  BankGuard <span className="text-sky-400">AI</span>
                </div>
                <div className="text-[11px] text-slate-300 mt-1">Institutional Risk &amp; XAI</div>
              </div>
            </a>

            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Overview</span>
            </button>
          </div>

          {/* Security Messaging */}
          <div className="mt-10 lg:mt-14 space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-[11px] font-mono text-sky-300 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>JWT + BCRYPT AUTHENTICATION</span>
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Secure Access to Your Banking &amp; Risk Operations Portal
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-md">
              Sign in as a Customer to manage transfers and review transparent risk alerts, or as a Risk Analyst to investigate anomalies and audit trails.
            </p>
          </div>

          {/* 3 Clean Security Guarantees */}
          <ul className="mt-8 space-y-3 text-xs text-slate-300">
            <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/55 border border-slate-800">
              <UserCheck className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <strong className="text-white block">Role-Isolated Sessions</strong>
                <span>Customer vaults and Analyst operations are separated by signed HS256 JWT role claims.</span>
              </div>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/55 border border-slate-800">
              <ShieldAlert className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <strong className="text-white block">Immutable Sign-In Auditing</strong>
                <span>Every successful and rejected sign-in attempt is logged to the PostgreSQL security audit table.</span>
              </div>
            </li>
          </ul>
        </div>

        {/* Bottom Auth Engine / DB Connectivity Status */}
        <div className="mt-10 pt-5 border-t border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Database className="w-4 h-4 text-sky-400 shrink-0" aria-hidden="true" />
            <div>
              <div className="font-semibold text-white">
                {dbStatus?.connected ? 'FastAPI Backend Online' : 'Offline Demo Mode Active'}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {dbStatus?.connected ? dbStatus.database_type : 'Start FastAPI on port 8000 for live DB'}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('db-config')}
            className="px-2.5 py-1.5 rounded-lg border border-slate-700 hover:border-sky-400 text-[11px] font-semibold text-sky-300 transition-colors cursor-pointer shrink-0"
          >
            DB Config
          </button>
        </div>
      </aside>

      {/* Right Main Form Workspace */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-12">
        <div className="w-full max-w-[460px] bg-white rounded-2xl border border-slate-200 shadow-sm p-7 sm:p-9">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-[#0A2540] tracking-tight">Sign In</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Enter your registered email, username, or account number.
            </p>
          </div>

          {/* Server / Auth Error Alert */}
          {serverError && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-700 mt-0.5" aria-hidden="true" />
              <span className="font-semibold">{serverError}</span>
            </div>
          )}

          <form method="POST" onSubmit={handleLogin} noValidate className="space-y-4">
            {/* Identifier Input */}
            <div>
              <label htmlFor={identId} className="block text-xs font-semibold text-[#0A2540] mb-1.5">
                Email, Username, or Account ID <span aria-hidden="true" className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" aria-hidden="true" />
                </div>
                <input
                  ref={identifierRef}
                  id={identId}
                  name="identifier"
                  type="text"
                  required
                  autoComplete="username"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  enterKeyHint="next"
                  aria-invalid={identInvalid}
                  aria-describedby={identInvalid ? identErrorId : undefined}
                  placeholder="alex.vance@bankguard.ai"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setServerError(null);
                  }}
                  onBlur={() => setTouched((prev) => ({ ...prev, identifier: true }))}
                  className={`w-full pl-10 pr-4 py-2.5 min-h-[44px] rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 transition-colors ${
                    identInvalid
                      ? 'border-rose-500 bg-rose-50/40'
                      : 'border-slate-300 bg-white focus:border-[#0052CC]'
                  }`}
                />
              </div>
              {identInvalid && (
                <p id={identErrorId} className="mt-1.5 text-xs text-rose-700 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Error: Enter your email address, username, or account number.</span>
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor={passId} className="block text-xs font-semibold text-[#0A2540]">
                  Password <span aria-hidden="true" className="text-rose-600">*</span>
                </label>
                <button
                  type="button"
                  onClick={openResetDialog}
                  className="text-xs font-semibold text-[#0052CC] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" aria-hidden="true" />
                </div>
                <input
                  ref={passwordRef}
                  id={passId}
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  enterKeyHint="done"
                  aria-invalid={passInvalid}
                  aria-describedby={passInvalid ? passErrorId : undefined}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setServerError(null);
                  }}
                  onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                  className={`w-full pl-10 pr-11 py-2.5 min-h-[44px] rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 transition-colors ${
                    passInvalid
                      ? 'border-rose-500 bg-rose-50/40'
                      : 'border-slate-300 bg-white focus:border-[#0052CC]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-pressed={showPassword}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-describedby={toggleHintId}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                </button>
                <span id={toggleHintId} className="visually-hidden">
                  Toggles password visibility on screen.
                </span>
              </div>
              {passInvalid && (
                <p id={passErrorId} className="mt-1.5 text-xs text-rose-700 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Error: Please enter your account password.</span>
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 pt-0.5">
              <input
                id="remember-me-login"
                name="remember_me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300"
              />
              <label htmlFor="remember-me-login" className="text-xs text-slate-700 font-medium cursor-pointer select-none">
                Remember my email or username on this browser
              </label>
            </div>

            {/* Primary Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 min-h-[46px] rounded-xl bg-[#0052CC] hover:bg-[#0043a8] disabled:opacity-60 text-white font-semibold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Seeded Demo Accounts */}
          {(analystDemo || customerDemo) && (
            <div className="mt-6 pt-5 border-t border-slate-200">
              <div className="text-[11px] font-mono uppercase tracking-wider font-bold text-slate-500 mb-2.5">
                Quick-Fill Seeded Demo Profiles
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {customerDemo && (
                  <button
                    type="button"
                    onClick={() => applyDemoProfile(customerDemo)}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-[#0052CC] hover:bg-sky-50/50 text-left transition-colors cursor-pointer"
                  >
                    <div className="text-xs font-bold text-[#0A2540]">{customerDemo.name}</div>
                    <div className="text-[11px] text-[#0052CC] font-semibold">Customer View</div>
                  </button>
                )}
                {analystDemo && (
                  <button
                    type="button"
                    onClick={() => applyDemoProfile(analystDemo)}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-[#0052CC] hover:bg-sky-50/50 text-left transition-colors cursor-pointer"
                  >
                    <div className="text-xs font-bold text-[#0A2540]">{analystDemo.name}</div>
                    <div className="text-[11px] text-slate-600 font-semibold">Risk Analyst View</div>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Register Link */}
          <div className="mt-6 pt-5 border-t border-slate-200 text-center text-xs text-slate-600">
            <span>New to BankGuard AI? </span>
            <button
              type="button"
              onClick={() => navigateTo('signup')}
              className="font-bold text-[#0052CC] hover:underline cursor-pointer"
            >
              Open a new banking account
            </button>
          </div>
        </div>
      </main>

      {/* Native <dialog> Password Recovery Modal */}
      <dialog
        ref={resetDialogRef}
        aria-labelledby="reset-dialog-title"
        closedby="any"
        className="m-auto w-[min(92vw,28rem)] rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl text-slate-900"
      >
        <div className="flex items-center justify-between mb-3">
          <h1 id="reset-dialog-title" className="text-base font-bold text-[#0A2540]">
            Account Password Recovery
          </h1>
          <button
            type="button"
            onClick={() => resetDialogRef.current?.close()}
            className="px-2 py-1 rounded-md text-xs font-mono text-slate-500 hover:bg-slate-100 cursor-pointer"
          >
            Esc
          </button>
        </div>

        {resetSent ? (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                Recovery instructions queued for <strong>{resetEmail}</strong>. For local evaluation, you can also sign in using the seeded demo profiles.
              </span>
            </div>
            <button
              type="button"
              onClick={() => resetDialogRef.current?.close()}
              className="w-full py-2.5 rounded-xl bg-[#0052CC] text-white font-semibold cursor-pointer"
            >
              Return to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleResetSubmit} className="space-y-4 text-xs">
            <p className="text-slate-600 leading-relaxed">
              Enter your registered banking email address to initiate a verification reset request.
            </p>
            <div>
              <label htmlFor={resetEmailId} className="block font-semibold text-[#0A2540] mb-1.5">
                Registered Email Address
              </label>
              <input
                id={resetEmailId}
                type="email"
                required
                autoFocus
                autoComplete="email"
                placeholder="you@bankguard.ai"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => resetDialogRef.current?.close()}
                className="px-4 py-2 rounded-lg border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#0052CC] text-white font-semibold cursor-pointer"
              >
                Send Reset Link
              </button>
            </div>
          </form>
        )}
      </dialog>
    </div>
  );
}
