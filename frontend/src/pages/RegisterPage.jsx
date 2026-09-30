import React, { useState } from 'react';
import { 
  ShieldCheck, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  Search, 
  CreditCard, 
  BarChart3, 
  Cpu, 
  LogIn,
  Landmark,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { signUp, navigateTo } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'User',
    termsAccepted: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError(null);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validation
    if (!formData.fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!formData.username.trim()) {
      setError('Please enter a unique username.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }
    if (!formData.termsAccepted) {
      setError('You must agree to the Terms & Conditions and Privacy Policy.');
      return;
    }

    setLoading(true);

    try {
      await signUp({
        full_name: formData.fullName.trim(),
        email: formData.email.trim(),
        username: formData.username.trim().toLowerCase(),
        phone: formData.phone.trim() || '+1 (555) 019-2834',
        password: formData.password,
        role: formData.role,
        terms_accepted: formData.termsAccepted
      });

      setLoading(false);
      setSuccessMessage('Registration successful! Redirecting to login...');
      
      setTimeout(() => {
        navigateTo('signin');
      }, 1400);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Registration failed. Please check your information.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a2540] via-[#071d37] to-[#041126] text-white flex flex-col justify-between selection:bg-sky-500/20 selection:text-sky-200 font-sans">
      
      {/* 1. TOP HEADER BAR */}
      <header className="w-full py-4 px-6 sm:px-12 flex items-center justify-between z-20">
        {/* Logo Left */}
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); navigateTo('home'); }}
          className="flex items-center gap-3 group cursor-pointer"
        >
          <div className="w-9 h-10 flex-shrink-0">
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
            <span className="text-xl font-black tracking-tight text-white leading-none">
              BankGuard <span className="text-[#38BDF8]">AI</span>
            </span>
            <span className="text-[10.5px] text-slate-300 font-medium tracking-normal mt-1">
              Safer Transactions. Brighter Tomorrows.
            </span>
          </div>
        </a>

        {/* Status Badges Right */}
        <div className="text-xs text-slate-300/80 font-medium tracking-wider hidden sm:flex items-center gap-3">
          <span>Secure</span>
          <span className="text-slate-500">|</span>
          <span>Intelligent</span>
          <span className="text-slate-500">|</span>
          <span>Trusted</span>
        </div>
      </header>

      {/* 2. MAIN SPLIT CONTAINER */}
      <main className="max-w-[1440px] mx-auto w-full px-4 sm:px-8 lg:px-12 py-4 sm:py-6 flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center w-full">
          
          {/* ================= LEFT SIDE: CYBER SECURITY SHOWCASE & 3D PEDESTAL ================= */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col justify-between py-2 pr-0 lg:pr-6 relative hidden lg:flex">
            
            {/* Top Copy */}
            <div className="mb-4 z-10">
              <h1 className="text-4xl sm:text-5xl lg:text-[48px] font-extrabold text-white leading-[1.12] tracking-tight mb-3">
                Your Security <br />
                Our <span className="text-[#38BDF8]">Priority</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-lg">
                AI-powered transaction monitoring to detect fraud, prevent risks, and keep your money safe.
              </p>
            </div>

            {/* Center: 3D Holographic Pedestal & Floating Cards */}
            <div className="relative my-2 h-[300px] sm:h-[330px] w-full flex items-center justify-center">
              
              {/* Radial Light Glows */}
              <div className="absolute w-64 h-64 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

              {/* 3D Glowing Circular Pedestal Base */}
              <div className="absolute bottom-4 w-60 sm:w-72 h-14 sm:h-18 flex items-center justify-center">
                <div className="w-full h-11 rounded-full bg-gradient-to-t from-[#02183a] to-[#0a3a78] border-2 border-[#38bdf8]/60 shadow-[0_0_35px_rgba(56,189,248,0.5)] flex items-center justify-center">
                  <div className="w-[85%] h-6 rounded-full bg-gradient-to-t from-[#0052cc] to-[#38bdf8] opacity-80 blur-xs" />
                </div>
              </div>

              {/* Central Neon 3D Shield with Padlock */}
              <div className="relative z-10 flex items-center justify-center mb-6">
                <div className="relative w-32 h-40 sm:w-38 sm:h-46 flex items-center justify-center">
                  <svg viewBox="0 0 160 190" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_25px_rgba(56,189,248,0.8)]">
                    <path
                      d="M80 6L14 30V86C14 130 42 169 80 184C118 169 146 130 146 86V30L80 6Z"
                      fill="url(#regShieldGrad)"
                      stroke="#38BDF8"
                      strokeWidth="3.5"
                    />
                    <path
                      d="M80 18L24 40V86C24 122 48 156 80 168C112 156 136 122 136 86V40L80 18Z"
                      fill="none"
                      stroke="#0284C7"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                    <defs>
                      <linearGradient id="regShieldGrad" x1="80" y1="6" x2="80" y2="184" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#0284C7" stopOpacity="0.55" />
                        <stop stopColor="#0052CC" stopOpacity="0.25" />
                        <stop stopColor="#0369A1" stopOpacity="0.75" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* White Padlock */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg viewBox="0 0 36 44" fill="none" className="w-10 h-12 drop-shadow-[0_0_12px_#ffffff]">
                      <path
                        d="M8 18V10C8 4.477 12.477 0 18 0C23.523 0 28 4.477 28 10V18"
                        stroke="#FFFFFF"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                      <rect x="2" y="16" width="32" height="26" rx="6" fill="#FFFFFF" />
                      <circle cx="18" cy="27" r="2.5" fill="#0052CC" />
                      <path d="M18 29.5V35" stroke="#0052CC" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 4 Floating Hologram Glass Cards */}
              <div className="absolute left-2 top-4 z-20 p-2 rounded-xl bg-[#092247]/85 backdrop-blur-md border border-cyan-400/35 shadow-xl flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-300">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-semibold text-slate-100">Secure<br />Transactions</span>
              </div>

              <div className="absolute right-2 top-6 z-20 p-2 rounded-xl bg-[#092247]/85 backdrop-blur-md border border-cyan-400/35 shadow-xl flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-300">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-semibold text-slate-100">Fraud<br />Detection</span>
              </div>

              <div className="absolute left-2 bottom-8 z-20 p-2 rounded-xl bg-[#092247]/85 backdrop-blur-md border border-cyan-400/35 shadow-xl flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-300">
                  <Landmark className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-semibold text-slate-100">Trusted<br />Banking</span>
              </div>

              <div className="absolute right-2 bottom-8 z-20 p-2 rounded-xl bg-[#092247]/85 backdrop-blur-md border border-cyan-400/35 shadow-xl flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-300">
                  <BarChart3 className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-semibold text-slate-100">Smarter<br />Future</span>
              </div>

              <div className="absolute bottom-0 z-20 px-4 py-1 rounded-full bg-[#051833]/90 border border-slate-700/60 shadow-md">
                <span className="text-[9px] font-mono tracking-widest text-slate-300 uppercase">
                  BANK &nbsp;•&nbsp; PEOPLE &nbsp;•&nbsp; TRUST &nbsp;•&nbsp; AI
                </span>
              </div>

            </div>

            {/* Left Column Bottom: 3 Features & Quote */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-[#38BDF8] flex-shrink-0">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Detect Fraud</div>
                    <div className="text-[10px] text-slate-400">in Real-Time</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-[#38BDF8] flex-shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">AI-Powered</div>
                    <div className="text-[10px] text-slate-400">Risk Analysis</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center pl-0 sm:pl-3 border-l-0 sm:border-l border-slate-700/60">
                <blockquote className="text-xs text-slate-200 italic leading-snug">
                  “ Because every transaction tells a story. We make sure it's a safe one.”
                </blockquote>
                <div className="w-8 h-0.5 bg-[#38BDF8] rounded-full mt-2" />
              </div>
            </div>

          </div>

          {/* ================= RIGHT SIDE: EXACT WHITE REGISTER CARD ================= */}
          <div className="lg:col-span-6 xl:col-span-6 flex justify-center z-20">
            <div className="w-full max-w-[540px] bg-white text-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-100 max-h-[90vh] overflow-y-auto">
              
              {/* Card Brand Header */}
              <div className="flex flex-col items-center text-center mb-5">
                <div className="w-10 h-12 mb-1.5">
                  <svg viewBox="0 0 44 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xs">
                    <path d="M22 2L4 8.5V21.5C4 32.5 11.5 42.5 22 46C32.5 42.5 40 32.5 40 21.5V8.5L22 2Z" fill="#0052CC" />
                    <path d="M22 5.5L7.5 11V21.5C7.5 30.5 13.5 38.8 22 42C30.5 38.8 36.5 30.5 36.5 21.5V11L22 5.5Z" fill="#FFFFFF" />
                    <rect x="13.5" y="24" width="4" height="10" rx="1.5" fill="#0052CC" />
                    <rect x="20" y="17" width="4" height="17" rx="1.5" fill="#0052CC" />
                    <rect x="26.5" y="20.5" width="4" height="13.5" rx="1.5" fill="#0052CC" />
                    <path d="M15.5 23L22 16L28.5 19.5" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="text-xl font-extrabold text-[#0F172A] tracking-tight">
                  BankGuard <span className="text-[#0052CC]">AI</span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Safer Transactions. Brighter Tomorrows.
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mt-3 tracking-tight">
                  Create Account
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Join BankGuard AI to secure your transactions
                </p>
              </div>

              {/* Error / Success Banners */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span className="font-semibold">{error}</span>
                </div>
              )}

              {successMessage && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span className="font-semibold">{successMessage}</span>
                </div>
              )}

              {/* Register Form */}
              <form onSubmit={handleRegister} className="space-y-3.5">
                
                {/* 1. Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      name="fullName"
                      required
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/15 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 transition-all"
                    />
                  </div>
                </div>

                {/* 2. Email Address & Username (2 cols on sm) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="you@domain.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#0052CC] text-xs sm:text-sm text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                        @
                      </div>
                      <input
                        type="text"
                        name="username"
                        required
                        placeholder="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#0052CC] text-xs sm:text-sm text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Phone Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+1 (555) 234-5678"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#0052CC] text-xs sm:text-sm text-slate-900"
                    />
                  </div>
                </div>

                {/* 4. Password & Confirm Password (2 cols on sm) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        required
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#0052CC] text-xs sm:text-sm text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        required
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#0052CC] text-xs sm:text-sm text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 5. Role Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Initial Role
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${formData.role === 'User' ? 'border-[#0052CC] bg-sky-50/70 text-[#0052CC]' : 'border-slate-200 text-slate-600'}`}>
                      <input
                        type="radio"
                        name="role"
                        value="User"
                        checked={formData.role === 'User'}
                        onChange={handleChange}
                        className="text-[#0052CC] focus:ring-[#0052CC]"
                      />
                      <span className="text-xs font-semibold">User (Client)</span>
                    </label>

                    <label className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${formData.role === 'Analyst' ? 'border-[#0052CC] bg-sky-50/70 text-[#0052CC]' : 'border-slate-200 text-slate-600'}`}>
                      <input
                        type="radio"
                        name="role"
                        value="Analyst"
                        checked={formData.role === 'Analyst'}
                        onChange={handleChange}
                        className="text-[#0052CC] focus:ring-[#0052CC]"
                      />
                      <span className="text-xs font-semibold">Analyst (Ops)</span>
                    </label>
                  </div>
                </div>

                {/* 6. Terms & Conditions */}
                <div className="pt-1">
                  <label className="flex items-start gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="termsAccepted"
                      checked={formData.termsAccepted}
                      onChange={handleChange}
                      className="w-4 h-4 mt-0.5 rounded border-slate-300 text-[#0052CC] focus:ring-[#0052CC]"
                    />
                    <span className="text-xs text-slate-600 leading-snug">
                      I agree to the <span className="text-[#0052CC] underline">Terms & Conditions</span> and <span className="text-[#0052CC] underline">Privacy Policy</span>.
                    </span>
                  </label>
                </div>

                {/* Create Account Primary CTA */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 sm:py-3 rounded-xl bg-[#0052CC] hover:bg-[#0047b3] active:bg-[#003d99] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {loading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

              </form>

              {/* OR Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-slate-400 font-semibold font-mono text-[10px]">
                    OR
                  </span>
                </div>
              </div>

              {/* Secondary CTA: Login */}
              <button
                type="button"
                onClick={() => navigateTo('signin')}
                className="w-full py-2.5 rounded-xl bg-white border border-[#0052CC] text-[#0052CC] hover:bg-sky-50 font-semibold text-xs sm:text-sm transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <LogIn className="w-4 h-4" />
                <span>Already have an account? Login</span>
              </button>

              {/* Back to Home */}
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => navigateTo('home')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0052CC] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Home</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* 3. BOTTOM FOOTER */}
      <footer className="w-full py-3 text-center text-[11px] text-slate-400 z-20">
        © 2026 BankGuard AI • AI Banking Transaction Anomaly Detection & Explainable Risk Analysis
      </footer>

    </div>
  );
}
