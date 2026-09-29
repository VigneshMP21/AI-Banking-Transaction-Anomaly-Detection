import React from 'react';
import { Shield, Code2, Terminal, ArrowUp, Lock, Cpu } from 'lucide-react';
import logoImg from '../assets/logo.jpg';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-slate-200 bg-slate-900 pt-16 pb-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src={logoImg} 
                alt="AI Banking Shield Logo" 
                className="w-9 h-9 rounded-xl border border-sky-400/30 object-cover shadow-sm"
              />
              <span className="text-base font-black text-white">
                Aegis<span className="text-sky-400">Bank</span> AI
              </span>
            </div>
            <p className="text-slate-400 text-xs max-w-md leading-relaxed">
              AI Banking Transaction Anomaly Detection & Explainable Risk Analysis System. Delivering real-time deep learning fraud prevention, graph network surveillance, and transparent SHAP explanations for institutional banking.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-sky-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>All Neural Ingestion Pipelines Operational</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <div className="font-bold text-white uppercase font-mono text-xs tracking-wider mb-3">
              Architecture & Models
            </div>
            <ul className="space-y-2 text-xs">
              <li><a href="#live-stream" className="hover:text-sky-300 transition-colors">Live Payment Stream</a></li>
              <li><a href="#sandbox" className="hover:text-sky-300 transition-colors">Risk Simulator & Sandbox</a></li>
              <li><a href="#xai-engine" className="hover:text-sky-300 transition-colors">Explainable AI (SHAP / LIME)</a></li>
              <li><a href="#models" className="hover:text-sky-300 transition-colors">Multi-Model Benchmarks</a></li>
              <li><a href="#architecture" className="hover:text-sky-300 transition-colors">Pipeline Design</a></li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div>
            <div className="font-bold text-white uppercase font-mono text-xs tracking-wider mb-3">
              Built With
            </div>
            <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
              <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-sky-300">React 19</span>
              <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-sky-300">Three.js 3D</span>
              <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-sky-300">Tailwind CSS</span>
              <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-sky-300">SHAP / XAI</span>
              <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-sky-300">Autoencoders</span>
              <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-sky-300">GraphSAGE GNN</span>
              <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-sky-300">XGBoost</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} AI Banking Transaction Anomaly Detection & Explainable Risk Analysis System.
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 hover:border-sky-400 text-slate-300 hover:text-white transition-all font-semibold"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
}
