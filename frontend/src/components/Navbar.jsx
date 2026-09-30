import React, { useState, useEffect } from 'react';
import { Search, Shield, ChevronRight, User, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [activeTab, setActiveTab] = useState('Home');
  const [scrolled, setScrolled] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, navigateTo } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Solution', href: '#solution' },
    { name: 'Contact', href: '#contact' },
  ];

  const handleNavClick = (e, item) => {
    e.preventDefault();
    setActiveTab(item.name);
    if (item.name === 'Home') {
      navigateTo('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.querySelector(item.href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 bg-white ${scrolled ? 'border-b border-slate-200/90 shadow-xs py-3' : 'py-3.5 sm:py-4'}`}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 flex items-center justify-between">
          
          {/* 1. Exact Brand Logo & Subtitle */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('Home');
              navigateTo('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3.5 group cursor-pointer"
          >
            {/* Shield Icon with 3 Vertical Bars */}
            <div className="relative w-10 h-11 sm:w-11 sm:h-12 flex-shrink-0">
              <svg viewBox="0 0 44 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xs">
                {/* Shield Outline Outer */}
                <path
                  d="M22 2L4 8.5V21.5C4 32.5 11.5 42.5 22 46C32.5 42.5 40 32.5 40 21.5V8.5L22 2Z"
                  fill="#0052CC"
                />
                {/* Shield Inner White Inset */}
                <path
                  d="M22 5.5L7.5 11V21.5C7.5 30.5 13.5 38.8 22 42C30.5 38.8 36.5 30.5 36.5 21.5V11L22 5.5Z"
                  fill="#FFFFFF"
                />
                {/* 3 Blue Vertical Bar Graph Columns */}
                {/* Bar 1 */}
                <rect x="13.5" y="24" width="4" height="10" rx="1.5" fill="#0052CC" />
                {/* Bar 2 (Taller) */}
                <rect x="20" y="17" width="4" height="17" rx="1.5" fill="#0052CC" />
                {/* Bar 3 (Medium) */}
                <rect x="26.5" y="20.5" width="4" height="13.5" rx="1.5" fill="#0052CC" />
                {/* Subtle Ascending Trend Line */}
                <path
                  d="M15.5 23L22 16L28.5 19.5"
                  stroke="#38BDF8"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Brand Title & Subtitle */}
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0F172A] leading-tight">
                BankGuard <span className="text-[#0052CC]">AI</span>
              </span>
              <span className="text-[11px] sm:text-xs text-slate-500 font-medium tracking-normal mt-0.5">
                Safer Transactions. Brighter Tomorrows.
              </span>
            </div>
          </a>

          {/* 2. Exact Centered Nav Links with Active Underline Bar */}
          <nav className="hidden lg:flex items-center gap-7 xl:gap-9">
            {navItems.map((item) => {
              const isActive = activeTab === item.name;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item)}
                  className="relative py-2 text-[14.5px] font-semibold transition-colors duration-150 group"
                  style={{ color: isActive ? '#0052CC' : '#334155' }}
                >
                  <span className="hover:text-[#0052CC] transition-colors">{item.name}</span>
                  {isActive && (
                    <span 
                      className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#0052CC] rounded-full"
                      style={{ transform: 'translateY(4px)' }}
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* 3. Right Action Area: Search + Login + Register */}
          <div className="flex items-center gap-3 sm:gap-3.5">
            {/* Search Icon Button */}
            <button
              type="button"
              onClick={() => setShowSearchModal(true)}
              aria-label="Search"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 hover:text-[#0052CC] hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Search className="w-5 h-5" strokeWidth={2.2} />
            </button>

            {/* Auth Buttons */}
            {user ? (
              <button
                type="button"
                onClick={() => navigateTo('portal')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-[#0052CC] font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs"
              >
                <div className="w-5 h-5 rounded-full bg-[#0052CC] text-white flex items-center justify-center text-[10px]">
                  {(user.name || user.full_name || 'U').charAt(0).toUpperCase()}
                </div>
                <span>Portal ({user.name || user.full_name || 'User'})</span>
              </button>
            ) : (
              <div className="flex items-center gap-2.5 sm:gap-3">
                {/* Login Button: Clean White with light border */}
                <button
                  type="button"
                  onClick={() => navigateTo('signin')}
                  className="px-5 sm:px-6 py-2 rounded-lg bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-[#0F172A] font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
                >
                  Login
                </button>

                {/* Register Button: Exact Royal Blue Solid Button */}
                <button
                  type="button"
                  onClick={() => navigateTo('signup')}
                  className="px-5 sm:px-6 py-2 rounded-lg bg-[#0052CC] hover:bg-[#0047b3] text-white font-semibold text-xs sm:text-sm transition-all shadow-sm hover:shadow-md cursor-pointer"
                >
                  Register
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Quick Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-24 px-4">
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Search className="w-4 h-4 text-[#0052CC]" /> Quick Search BankGuard AI
              </h3>
              <button 
                type="button"
                onClick={() => setShowSearchModal(false)}
                className="text-xs text-slate-400 hover:text-slate-700 px-2 py-1 rounded-md"
              >
                ✕ Esc
              </button>
            </div>
            <input
              type="text"
              autoFocus
              placeholder="Search features, transactions, risk models, explainable AI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#0052CC] text-sm"
            />
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="font-medium text-slate-400">Quick Links:</span>
              <button onClick={() => { setShowSearchModal(false); navigateTo('signin'); }} className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[#0052CC] font-medium">Customer Login</button>
              <button onClick={() => { setShowSearchModal(false); navigateTo('signup'); }} className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[#0052CC] font-medium">Create Account</button>
              <a href="#features" onClick={() => setShowSearchModal(false)} className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium">Fraud Detection</a>
              <a href="#solution" onClick={() => setShowSearchModal(false)} className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium">Risk Analysis</a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

