import React from 'react';
import { ArrowUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  const { navigateTo } = useAuth();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="contact" className="bg-[#0A2540] text-slate-300 border-t border-slate-800 pt-14 pb-10 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Summary */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-9 shrink-0">
                <svg viewBox="0 0 44 48" fill="none" aria-hidden="true" className="w-full h-full">
                  <path d="M22 2L4 8.5V21.5C4 32.5 11.5 42.5 22 46C32.5 42.5 40 32.5 40 21.5V8.5L22 2Z" fill="#0052CC" />
                  <path d="M22 5.5L7.5 11V21.5C7.5 30.5 13.5 38.8 22 42C30.5 38.8 36.5 30.5 36.5 21.5V11L22 5.5Z" fill="#FFFFFF" />
                  <rect x="13.5" y="24" width="4" height="10" rx="1.5" fill="#0052CC" />
                  <rect x="20" y="17" width="4" height="17" rx="1.5" fill="#0052CC" />
                  <rect x="26.5" y="20.5" width="4" height="13.5" rx="1.5" fill="#0052CC" />
                  <path d="M15.5 23L22 16L28.5 19.5" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-lg font-extrabold text-white">
                BankGuard <span className="text-sky-400">AI</span>
              </span>
            </div>
            <p className="text-slate-400 max-w-md leading-relaxed">
              AI Banking Transaction Anomaly Detection &amp; Explainable Risk Analysis System. Built for transparent financial risk decisioning, behavioral monitoring, and auditable compliance.
            </p>
          </div>

          {/* Section Links (All verified IDs) */}
          <div>
            <div className="font-bold text-white uppercase font-mono text-[11px] tracking-wider mb-3">
              Platform Sections
            </div>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-white transition-colors">Transaction Surveillance</a></li>
              <li><a href="#sandbox" className="hover:text-white transition-colors">Interactive Risk Sandbox</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">Explainable AI (SHAP)</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">4-Stage Pipeline</a></li>
              <li><a href="#solution" className="hover:text-white transition-colors">Model Architecture</a></li>
              <li><a href="#compliance" className="hover:text-white transition-colors">Compliance &amp; Governance</a></li>
            </ul>
          </div>

          {/* Portal Access & Tech */}
          <div>
            <div className="font-bold text-white uppercase font-mono text-[11px] tracking-wider mb-3">
              Portal &amp; Stack
            </div>
            <ul className="space-y-2 mb-4">
              <li>
                <button type="button" onClick={() => navigateTo('signin')} className="hover:text-white transition-colors cursor-pointer">
                  Sign In to Portal
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo('signup')} className="hover:text-white transition-colors cursor-pointer">
                  Open Banking Account
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo('db-config')} className="hover:text-white transition-colors cursor-pointer">
                  PostgreSQL Setup
                </button>
              </li>
            </ul>
            <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-sky-300">React 19</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-sky-300">FastAPI</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-sky-300">PostgreSQL</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-sky-300">SHAP XAI</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            &copy; {CURRENT_YEAR} BankGuard AI &mdash; AI Banking Transaction Anomaly Detection &amp; Explainable Risk Analysis.
          </div>
          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:border-sky-400 text-slate-200 hover:text-white transition-colors font-semibold cursor-pointer"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
}
