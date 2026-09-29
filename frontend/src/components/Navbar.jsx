import React, { useState, useEffect } from 'react';
import { Shield, Activity, Terminal, ChevronRight, Sparkles } from 'lucide-react';
import logoImg from '../assets/logo.jpg';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [liveLatency, setLiveLatency] = useState(11.4);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    const interval = setInterval(() => {
      setLiveLatency((10.5 + Math.random() * 2.2).toFixed(1));
    }, 3000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-sm py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-2xl overflow-hidden p-[1.5px] bg-gradient-to-tr from-sky-500 via-blue-600 to-emerald-500 shadow-md shadow-sky-500/15 group-hover:scale-105 transition-transform duration-300">
            <img 
              src={logoImg} 
              alt="AI Banking Shield Logo" 
              className="w-full h-full object-cover rounded-[14px]"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-slate-900">
                Aegis<span className="text-sky-600">Bank</span> AI
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200 rounded-full">
                XAI v2.4
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium tracking-wide">
              Transaction Anomaly & Risk Engine
            </span>
          </div>
        </a>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1.5 rounded-full border border-slate-200/90 shadow-inner">
          <a href="#live-stream" className="px-3.5 py-1 text-xs font-semibold text-slate-600 hover:text-sky-600 hover:bg-white rounded-full transition-all">
            Live Stream
          </a>
          <a href="#sandbox" className="px-3.5 py-1 text-xs font-semibold text-slate-600 hover:text-sky-600 hover:bg-white rounded-full transition-all">
            Risk Sandbox
          </a>
          <a href="#xai-engine" className="px-3.5 py-1 text-xs font-semibold text-slate-600 hover:text-sky-600 hover:bg-white rounded-full transition-all">
            Explainable AI
          </a>
          <a href="#models" className="px-3.5 py-1 text-xs font-semibold text-slate-600 hover:text-sky-600 hover:bg-white rounded-full transition-all">
            ML Models
          </a>
          <a href="#architecture" className="px-3.5 py-1 text-xs font-semibold text-slate-600 hover:text-sky-600 hover:bg-white rounded-full transition-all">
            Architecture
          </a>
        </nav>

        {/* Status Indicator & CTA */}
        <div className="flex items-center gap-3">
          {/* Live Node Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-700 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Latency:</span>
            <span className="text-sky-600 font-bold">{liveLatency}ms</span>
          </div>

          {/* Launch Sandbox Button */}
          <a
            href="#sandbox"
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-sky-500/20 hover:shadow-sky-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Interactive Simulator</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-80" />
          </a>
        </div>

      </div>
    </header>
  );
}
