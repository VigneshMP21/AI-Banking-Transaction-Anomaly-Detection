import React from 'react';
import {
  ArrowRight,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Scale,
  Users,
  Landmark,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Hero() {
  const { user, navigateTo } = useAuth();

  const scrollToSection = (id) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative pt-24 sm:pt-28 pb-16 bg-white bg-bank-grid border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Institutional Value Proposition */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-[#0A2540]">
              <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true" />
              <span>Real-Time Banking Anomaly Detection &amp; Explainable AI</span>
            </div>

            <h1 tabIndex={-1} className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold text-[#0A2540] leading-[1.1] tracking-tight">
              Transparent Risk Intelligence for{' '}
              <span className="text-[#0052CC]">Modern Banking</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Detect fraudulent transactions in real time, protect legitimate customers with adaptive{' '}
              <strong className="font-semibold text-[#0A2540]">Step-Up MFA</strong>, and audit every decision with{' '}
              <strong className="font-semibold text-[#0A2540]">SHAP &amp; Counterfactual explanations</strong>.
            </p>

            {/* Clear Primary & Secondary CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <button
                type="button"
                onClick={() => scrollToSection('#sandbox')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#0052CC] hover:bg-[#0043a8] text-white font-semibold text-sm shadow-sm transition-colors cursor-pointer"
              >
                <Sliders className="w-4 h-4" aria-hidden="true" />
                <span>Launch Risk Sandbox</span>
              </button>

              <button
                type="button"
                onClick={() => navigateTo(user ? 'portal' : 'signin')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white border border-slate-300 hover:border-[#0052CC] hover:bg-slate-50 text-[#0A2540] font-semibold text-sm transition-colors cursor-pointer"
              >
                <span>{user ? 'Open Banking Portal' : 'Sign In to Portal'}</span>
                <ArrowRight className="w-4 h-4 text-[#0052CC]" aria-hidden="true" />
              </button>
            </div>

            {/* Key Architectural Capabilities Strip */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 max-w-xl">
              <div>
                <div className="text-xs font-mono font-bold text-[#0052CC]">3-TIER POLICY</div>
                <div className="text-xs text-slate-600 mt-1 font-medium">Auto-Clear, Step-Up OTP, or Freeze</div>
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-[#0052CC]">EXPLAINABLE AI</div>
                <div className="text-xs text-slate-600 mt-1 font-medium">SHAP Attribution &amp; What-If Recourse</div>
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-[#0052CC]">DUAL-ROLE PORTAL</div>
                <div className="text-xs text-slate-600 mt-1 font-medium">Customer Vault &amp; Risk Ops Console</div>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Institutional Live Decision Preview Card */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl bg-[#0A2540] text-white p-6 sm:p-7 shadow-xl border border-slate-800">
              {/* Preview Window Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-700/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#0052CC] flex items-center justify-center">
                    <Activity className="w-4 h-4 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Real-Time Risk Decision Trace</div>
                    <div className="text-[11px] text-slate-400 font-mono">TX-948120 • SWIFT Cross-Border Wire</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-400/30 text-rose-300 font-mono text-[11px] font-bold">
                  BLOCKED_FROZEN
                </span>
              </div>

              {/* Transaction Summary Row */}
              <div className="grid grid-cols-3 gap-3 my-5">
                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Payload</div>
                  <div className="text-base font-bold font-mono text-white mt-0.5">$142,500</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Composite Risk</div>
                  <div className="text-base font-bold font-mono text-rose-400 mt-0.5">88.6 / 100</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Balance Held</div>
                  <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">Protected</div>
                </div>
              </div>

              {/* Top SHAP Drivers */}
              <div className="space-y-2.5 mb-5">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase">
                  <span>Top SHAP Risk Drivers</span>
                  <span>Impact</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-200 flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" aria-hidden="true" />
                      Impossible Geo-Hop Velocity (8,200 km/h)
                    </span>
                    <span className="font-mono font-bold text-rose-400">+34.0%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-200 flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
                      Unrecognized Device &amp; Offshore Corridor
                    </span>
                    <span className="font-mono font-bold text-rose-400">+28.5%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-200 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
                      Verified 4-Year Account Tenure Baseline
                    </span>
                    <span className="font-mono font-bold text-emerald-400">-12.0%</span>
                  </div>
                </div>
              </div>

              {/* Counterfactual Recourse Preview */}
              <div className="p-3.5 rounded-xl bg-[#0052CC]/20 border border-sky-400/30 flex items-start gap-3 text-xs">
                <Scale className="w-4 h-4 text-sky-300 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <div className="font-bold text-sky-200">GDPR Art. 22 Actionable Recourse</div>
                  <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                    Verify transaction from registered hardware token and confirm beneficiary to step down from BLOCKED to STEP_UP_MFA.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Two-Persona Capabilities Strip (Customer vs Risk Analyst) */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bank-surface rounded-2xl p-6 flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-200 text-[#0052CC] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-bold text-[#0A2540]">For Banking Customers</h2>
                <span className="text-[11px] font-mono font-semibold text-[#0052CC]">Client Portal</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Protected fund transfers with adaptive Step-Up OTP challenges, transparent reason codes when a payment is held, and instant self-verification alerts.
              </p>
            </div>
          </div>

          <div className="bank-surface rounded-2xl p-6 flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 text-[#0A2540] flex items-center justify-center shrink-0">
              <Landmark className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-bold text-[#0A2540]">For Risk Analysts &amp; Compliance</h2>
                <span className="text-[11px] font-mono font-semibold text-slate-700">Operations Console</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Real-time alert triage, SHAP waterfall inspection, PostgreSQL audit trails, model benchmarking, and regulatory transparency under GDPR &amp; Basel III.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
