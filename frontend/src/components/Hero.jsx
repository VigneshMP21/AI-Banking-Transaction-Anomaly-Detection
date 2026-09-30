import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  BarChart3, 
  Lock, 
  ArrowRight, 
  AlertTriangle, 
  Activity, 
  Users, 
  Landmark, 
  Cpu, 
  Globe,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Hero() {
  const { navigateTo } = useAuth();
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPulse((prev) => (prev + 1) % 100);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="home" className="relative pt-24 sm:pt-28 pb-12 bg-white overflow-hidden">
      
      {/* Container */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* ================= HERO TOP ROW (SPLIT 2 COLUMNS) ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center min-h-[580px] sm:min-h-[620px]">
          
          {/* LEFT COLUMN: Typography, CTAs, Feature Pills (6 cols) */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center pt-2 sm:pt-4 z-10">
            
            {/* 1. Category Eyebrow */}
            <div className="mb-4">
              <span className="text-[13px] sm:text-[14px] font-bold tracking-[0.18em] text-[#0284C7] uppercase">
                AI-POWERED BANKING SECURITY
              </span>
            </div>

            {/* 2. Main Headline */}
            <h1 className="text-[40px] sm:text-[48px] lg:text-[54px] xl:text-[58px] font-extrabold text-[#0F172A] leading-[1.12] tracking-tight mb-5">
              AI-Powered Banking <br />
              <span className="text-[#0052CC]">Transaction Security</span>
            </h1>

            {/* 3. Description */}
            <p className="text-[15px] sm:text-[16px] lg:text-[17px] text-slate-600 font-normal leading-relaxed mb-8 max-w-[540px]">
              Detect fraudulent transactions, identify unusual patterns and get{' '}
              <strong className="font-semibold text-slate-800">explainable risk analysis</strong> using advanced AI.
              Safer banking for a more secure tomorrow.
            </p>

            {/* 4. Action Buttons */}
            <div className="flex items-center gap-3.5 sm:gap-4 mb-10">
              {/* Login Button: Royal Blue with Right Arrow */}
              <button
                type="button"
                onClick={() => navigateTo('signin')}
                className="inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-3 rounded-lg bg-[#0052CC] hover:bg-[#0047b3] text-white font-semibold text-[15px] shadow-md hover:shadow-lg transition-all duration-150 cursor-pointer"
              >
                <span>Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Register Button: White with Royal Blue border */}
              <button
                type="button"
                onClick={() => navigateTo('signup')}
                className="inline-flex items-center justify-center px-7 sm:px-8 py-3 rounded-lg bg-white border border-[#0052CC] text-[#0052CC] hover:bg-sky-50 font-semibold text-[15px] shadow-xs transition-all duration-150 cursor-pointer"
              >
                <span>Register</span>
              </button>
            </div>

            {/* 5. Three Mini Feature Indicators */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2 border-t border-slate-100 max-w-[540px]">
              {/* Feature 1 */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0 text-[#0052CC]">
                  <ShieldCheck className="w-5 h-5 fill-sky-100 text-[#0052CC]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-slate-900 leading-tight">Detect Fraud</span>
                  <span className="text-[11px] text-slate-500 font-medium">In Real-Time</span>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0 text-[#0052CC]">
                  <BarChart3 className="w-5 h-5 text-[#0052CC]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-slate-900 leading-tight">Explainable AI</span>
                  <span className="text-[11px] text-slate-500 font-medium">Transparent Insights</span>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0 text-[#0052CC]">
                  <Lock className="w-5 h-5 fill-sky-100 text-[#0052CC]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-slate-900 leading-tight">Secure Banking</span>
                  <span className="text-[11px] text-slate-500 font-medium">Trusted & Reliable</span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Hologram Cyber Security Showcase Visual (6-7 cols) */}
          <div className="lg:col-span-6 xl:col-span-7 relative h-[420px] sm:h-[500px] lg:h-[540px] w-full rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center bg-[#071329]">
            
            {/* Background Cyber Banking Scene */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#030d22]/90 via-[#071a3d]/80 to-[#02102e]/95 z-0" />
            
            {/* Bank Building Outlines & Bokeh in Background */}
            <div 
              className="absolute inset-0 opacity-25 bg-cover bg-center mix-blend-luminosity"
              style={{
                backgroundImage: `radial-gradient(circle at 75% 30%, rgba(56, 189, 248, 0.25) 0%, transparent 50%), radial-gradient(circle at 20% 70%, rgba(0, 82, 204, 0.3) 0%, transparent 60%)`
              }}
            />

            {/* Glowing Bank Sign in Background */}
            <div className="absolute top-10 right-12 text-slate-400/30 text-3xl sm:text-4xl font-black tracking-widest uppercase select-none pointer-events-none">
              BANK
            </div>

            {/* Laptop Keyboard Subtle Grid Overlay */}
            <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-[#020b1d] via-[#051634]/60 to-transparent z-0 pointer-events-none" />

            {/* Glowing Script Text: "Secure Banking Smarter With AI" */}
            <div className="absolute top-8 sm:top-10 left-10 sm:left-14 z-20">
              <span 
                className="text-2xl sm:text-3xl text-sky-200 font-semibold tracking-wide block drop-shadow-[0_0_12px_rgba(56,189,248,0.8)]"
                style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
              >
                Secure<br />
                Banking<br />
                Smarter<br />
                With AI
              </span>
            </div>

            {/* ================= CENTRAL NEON SHIELD WITH PADLOCK ================= */}
            <div className="relative z-10 flex items-center justify-center scale-90 sm:scale-100 lg:scale-110">
              {/* Outer Cyan Energy Pulse Glow */}
              <div className="absolute w-56 h-64 bg-sky-500/20 rounded-full blur-2xl animate-pulse pointer-events-none" />

              {/* Connecting Nodes Radial Network */}
              <svg className="absolute w-72 h-72 pointer-events-none opacity-40 animate-spin-slow" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="85" fill="none" stroke="#38BDF8" strokeWidth="0.8" strokeDasharray="4 6" />
                <circle cx="100" cy="100" r="65" fill="none" stroke="#0052CC" strokeWidth="0.6" />
                <circle cx="100" cy="15" r="2.5" fill="#38BDF8" />
                <circle cx="185" cy="100" r="2.5" fill="#38BDF8" />
                <circle cx="100" cy="185" r="2.5" fill="#38BDF8" />
                <circle cx="15" cy="100" r="2.5" fill="#38BDF8" />
              </svg>

              {/* Neon Blue Glass Shield */}
              <div className="relative w-36 h-44 sm:w-40 sm:h-48 flex items-center justify-center">
                <svg viewBox="0 0 160 190" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_25px_rgba(14,165,233,0.7)]">
                  {/* Outer Shield Border with Glow */}
                  <path
                    d="M80 6L14 30V86C14 130 42 169 80 184C118 169 146 130 146 86V30L80 6Z"
                    fill="url(#shieldGrad)"
                    stroke="#38BDF8"
                    strokeWidth="3.5"
                  />
                  {/* Inner Geometric Shield Accent */}
                  <path
                    d="M80 18L24 40V86C24 122 48 156 80 168C112 156 136 122 136 86V40L80 18Z"
                    fill="none"
                    stroke="#0284C7"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                  <defs>
                    <linearGradient id="shieldGrad" x1="80" y1="6" x2="80" y2="184" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#0284C7" stopOpacity="0.45" />
                      <stop stopColor="#0052CC" stopOpacity="0.2" />
                      <stop stopColor="#0369A1" stopOpacity="0.6" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* White Glowing Padlock In Center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <svg viewBox="0 0 36 44" fill="none" className="w-10 h-12 drop-shadow-[0_0_10px_#ffffff]">
                      {/* Shackle */}
                      <path
                        d="M8 18V10C8 4.477 12.477 0 18 0C23.523 0 28 4.477 28 10V18"
                        stroke="#FFFFFF"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                      {/* Body */}
                      <rect x="2" y="16" width="32" height="26" rx="6" fill="#FFFFFF" />
                      {/* Keyhole */}
                      <circle cx="18" cy="27" r="2.5" fill="#0052CC" />
                      <path d="M18 29.5V35" stroke="#0052CC" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* ================= FLOATING CARD 1: Transaction Monitoring (Left) ================= */}
            <div className="absolute left-3 sm:left-6 bottom-16 sm:bottom-20 z-20 max-w-[170px] sm:max-w-[200px] w-full p-2.5 sm:p-3 rounded-xl bg-[#091E42]/85 backdrop-blur-md border border-cyan-500/30 shadow-xl">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-200">Transaction Monitoring</span>
              </div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[9px] font-medium text-emerald-400">Normal</span>
              </div>
              {/* Dynamic Oscillating Waveform */}
              <div className="h-7 w-full overflow-hidden">
                <svg viewBox="0 0 100 30" className="w-full h-full">
                  <path
                    d="M 0 15 Q 10 5, 20 15 T 40 15 T 60 15 T 80 5 T 90 25 T 100 15"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* ================= FLOATING CARD 2: Fraud Detection (Center-Right) ================= */}
            <div className="absolute right-24 sm:right-32 top-8 sm:top-12 z-20 max-w-[190px] sm:max-w-[210px] w-full p-3 rounded-xl bg-[#0a1f44]/90 backdrop-blur-md border border-cyan-500/35 shadow-2xl">
              <div className="text-[11px] font-semibold text-slate-200 mb-2">Fraud Detection</div>
              
              {/* Suspicious Activity Red Banner */}
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-bold mb-2.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                <span>Suspicious Activity</span>
              </div>

              <div className="space-y-1 text-[10px]">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Amount</span>
                  <span className="font-semibold text-white">₹ 50,000</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Merchant</span>
                  <span className="font-semibold text-white">Unknown</span>
                </div>
                <div className="flex justify-between items-center text-slate-300 pt-0.5">
                  <span className="text-slate-400">Risk Level</span>
                  <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white font-bold text-[9px]">High</span>
                </div>
              </div>
            </div>

            {/* ================= FLOATING CARD 3: Risk Analysis (Far Right) ================= */}
            <div className="absolute right-3 sm:right-5 bottom-12 sm:bottom-16 z-20 max-w-[130px] sm:max-w-[145px] w-full p-2.5 sm:p-3 rounded-xl bg-[#091E42]/85 backdrop-blur-md border border-cyan-500/30 shadow-xl text-center">
              <div className="text-[10px] sm:text-[11px] font-semibold text-slate-200 mb-2">Risk Analysis</div>
              
              {/* Circular Gauge 87% */}
              <div className="relative w-14 h-14 mx-auto mb-1 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#1E293B"
                    strokeWidth="3.2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#F43F5E"
                    strokeWidth="3.2"
                    strokeDasharray="87, 100"
                  />
                </svg>
                <span className="absolute text-xs font-black text-white">87%</span>
              </div>

              <div className="text-[10px] font-bold text-rose-400 mb-2">High Risk</div>

              {/* Mini Equalizer Bars */}
              <div className="flex items-end justify-center gap-1 h-4">
                <span className="w-1 h-2.5 bg-sky-400 rounded-xs" />
                <span className="w-1 h-4 bg-sky-400 rounded-xs" />
                <span className="w-1 h-3 bg-sky-400 rounded-xs" />
                <span className="w-1 h-4 bg-rose-500 rounded-xs" />
                <span className="w-1 h-3 bg-rose-500 rounded-xs" />
              </div>
            </div>

            {/* ================= FLOATING BADGE: Protecting People. Powering Trust. (Bottom Right) ================= */}
            <div className="absolute bottom-3 right-6 z-20 hidden sm:block px-4 py-2 rounded-lg bg-[#071329]/90 border border-slate-700/60 backdrop-blur-md">
              <span className="text-xs font-bold text-white tracking-wide">
                Protecting People. Powering Trust.
              </span>
            </div>

          </div>

        </div>

        {/* ================= BOTTOM FLOATING FEATURE BANNER (4 PILLARS) ================= */}
        <div className="mt-8 sm:mt-12 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xl p-5 sm:p-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            
            {/* Pillar 1: For Customers */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0 text-[#0052CC]">
                <Users className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-[15px] font-bold text-slate-900 leading-tight mb-1">For Customers</h3>
                <p className="text-[13px] text-slate-500 leading-snug">
                  Safer and smarter banking experience.
                </p>
              </div>
            </div>

            {/* Pillar 2: For Financial Institutions */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0 text-[#0052CC]">
                <Landmark className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-[15px] font-bold text-slate-900 leading-tight mb-1">For Financial Institutions</h3>
                <p className="text-[13px] text-slate-500 leading-snug">
                  Advanced fraud detection and risk management.
                </p>
              </div>
            </div>

            {/* Pillar 3: AI-Powered Insights */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0 text-[#0052CC]">
                <Cpu className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-[15px] font-bold text-slate-900 leading-tight mb-1">AI-Powered Insights</h3>
                <p className="text-[13px] text-slate-500 leading-snug">
                  Explainable and transparent risk analysis.
                </p>
              </div>
            </div>

            {/* Pillar 4: A More Secure Tomorrow */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0 text-[#0052CC]">
                <Globe className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-[15px] font-bold text-slate-900 leading-tight mb-1">A More Secure Tomorrow</h3>
                <p className="text-[13px] text-slate-500 leading-snug">
                  Building trust in every transaction.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>

    </section>
  );
}

