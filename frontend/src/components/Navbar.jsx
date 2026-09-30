import React, { useState, useEffect } from 'react';
import { Shield, Activity, Terminal, ChevronRight, Sparkles, User, LogIn, UserPlus, Database, CreditCard } from 'lucide-react';
import logoImg from '../assets/logo.jpg';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [liveLatency, setLiveLatency] = useState(11.4);
  const { user, navigateTo, dbStatus } = useAuth();

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
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm py-2.5' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <a 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            navigateTo('home');
          }}
          className="flex items-center gap-3 group"
        >
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl overflow-hidden p-[1.5px] bg-gradient-to-tr from-sky-500 via-blue-600 to-emerald-500 shadow-md shadow-sky-500/15 group-hover:scale-105 transition-transform duration-300">
            <img 
              src={logoImg} 
              alt="AI Banking Shield Logo" 
              className="w-full h-full object-cover rounded-[14px]"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                Bank<span className="text-sky-600">Guard</span> AI
              </span>
              <span className="px-1.5 py-0.2 text-[9px] sm:text-[10px] font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200 rounded-full">
                XAI v2.4
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium tracking-wide hidden sm:block">
              Transaction Anomaly & Risk Engine
            </span>
          </div>
        </a>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/90 p-1.5 rounded-full border border-slate-200/90 shadow-inner">
          <a href="#live-stream" className="px-3 py-1 text-xs font-semibold text-slate-600 hover:text-sky-600 hover:bg-white rounded-full transition-all">
            Live Stream
          </a>
          <a href="#sandbox" className="px-3 py-1 text-xs font-semibold text-slate-600 hover:text-sky-600 hover:bg-white rounded-full transition-all">
            Risk Sandbox
          </a>
          <a href="#xai-engine" className="px-3 py-1 text-xs font-semibold text-slate-600 hover:text-sky-600 hover:bg-white rounded-full transition-all">
            Explainable AI
          </a>
          <a href="#models" className="px-3 py-1 text-xs font-semibold text-slate-600 hover:text-sky-600 hover:bg-white rounded-full transition-all">
            ML Models
          </a>
          <a href="#architecture" className="px-3 py-1 text-xs font-semibold text-slate-600 hover:text-sky-600 hover:bg-white rounded-full transition-all">
            Architecture
          </a>
        </nav>

        {/* Right Section: DB Indicator & Auth Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* pgAdmin 4 / PostgreSQL Status Pill */}
          <button
            type="button"
            onClick={() => navigateTo('db-config')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200/90 text-[11px] font-semibold text-slate-700 shadow-xs transition-all cursor-pointer"
            title="Configure PostgreSQL / pgAdmin 4 Database"
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dbStatus.connected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${dbStatus.connected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            </span>
            <Database className="w-3 h-3 text-slate-500" />
            <span className="hidden sm:inline">pgAdmin 4:</span>
            <span className={`font-bold ${dbStatus.connected ? 'text-emerald-600' : 'text-amber-600'}`}>
              {dbStatus.connected ? 'sample_bank' : 'Port 5432'}
            </span>
          </button>

          {/* Authentication State */}
          {user ? (
            /* Logged In User Pill */
            <button
              type="button"
              onClick={() => navigateTo('portal')}
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-900 transition-all cursor-pointer shadow-xs"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                {(user.name || user.full_name || user.username || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[100px] sm:max-w-[130px]">
                  {user.name || user.full_name || user.username || 'User'}
                </span>
                <span className="text-[9px] text-sky-600 font-mono font-semibold">
                  {user.role || 'Member'}
                </span>
              </div>
            </button>
          ) : (
            /* Logged Out: Sign In & Sign Up Buttons */
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => navigateTo('signin')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-sky-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-sky-600" />
                <span>Login</span>
              </button>

              <button
                type="button"
                onClick={() => navigateTo('signup')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white shadow-md shadow-sky-500/20 hover:shadow-sky-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
