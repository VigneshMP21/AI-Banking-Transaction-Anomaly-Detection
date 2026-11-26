import React, { useState, useEffect, useRef } from 'react';
import { Search, Menu, X, ArrowRight, Database, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { name: 'Overview', href: '#home' },
  { name: 'Live Surveillance', href: '#features' },
  { name: 'Risk Sandbox', href: '#sandbox' },
  { name: 'Explainable AI', href: '#about' },
  { name: 'Architecture', href: '#how-it-works' },
  { name: 'Benchmarks', href: '#solution' },
];

const QUICK_SEARCH_ENTRIES = [
  { label: 'Live Transaction Surveillance', desc: 'Real-time payment monitoring feed & filter controls', action: 'scroll', target: '#features', tag: 'Section' },
  { label: 'Interactive Risk & SHAP Sandbox', desc: 'Test amount, velocity, geo-hop, and counterfactual recourse', action: 'scroll', target: '#sandbox', tag: 'Simulator' },
  { label: 'Explainable AI (SHAP & Counterfactuals)', desc: 'GDPR Article 22 transparent risk attribution framework', action: 'scroll', target: '#about', tag: 'XAI' },
  { label: 'System Pipeline & Architecture', desc: '4-stage ingestion, behavioral features, ensemble & policy', action: 'scroll', target: '#how-it-works', tag: 'Pipeline' },
  { label: 'ML / DL Model Benchmarks', desc: 'XGBoost, Deep Autoencoder, GraphSAGE & Isolation Forest', action: 'scroll', target: '#solution', tag: 'Models' },
  { label: 'Compliance & Governance', desc: 'GDPR Art. 22, Basel III, PCI-DSS & Role Access Matrix', action: 'scroll', target: '#compliance', tag: 'Compliance' },
  { label: 'Customer & Analyst Sign In', desc: 'Authenticate with JWT to access the banking portal', action: 'route', target: 'signin', tag: 'Auth' },
  { label: 'Open New Bank Account', desc: 'Register a Client or Risk Analyst profile', action: 'route', target: 'signup', tag: 'Auth' },
  { label: 'PostgreSQL Database Config', desc: 'Configure and inspect pgAdmin 4 localhost connection', action: 'route', target: 'db-config', tag: 'Admin' },
];

export default function Navbar() {
  const [activeNav, setActiveNav] = useState('Overview');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchDialogRef = useRef(null);
  const { user, dbStatus, navigateTo } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Polyfill-free light-dismiss fallback for browsers without <dialog closedby="any">
  useEffect(() => {
    const dialog = searchDialogRef.current;
    if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return;

    const isOutside = (e) => {
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };

    let pressedOutside = false;
    const onPointerDown = (e) => {
      pressedOutside = isOutside(e);
    };
    const onPointerUp = (e) => {
      if (pressedOutside && isOutside(e)) dialog.close();
      pressedOutside = false;
    };

    dialog.addEventListener('pointerdown', onPointerDown);
    dialog.addEventListener('pointerup', onPointerUp);
    return () => {
      dialog.removeEventListener('pointerdown', onPointerDown);
      dialog.removeEventListener('pointerup', onPointerUp);
    };
  }, []);

  const openSearchDialog = () => {
    setSearchQuery('');
    searchDialogRef.current?.showModal();
  };

  const closeSearchDialog = () => {
    searchDialogRef.current?.close();
  };

  const handleNavClick = (e, item) => {
    e.preventDefault();
    setActiveNav(item.name);
    setMobileMenuOpen(false);
    if (item.href === '#home') {
      navigateTo('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.querySelector(item.href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSearchSelect = (entry) => {
    closeSearchDialog();
    if (entry.action === 'route') {
      navigateTo(entry.target);
    } else {
      const el = document.querySelector(entry.target);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const filteredSearch = QUICK_SEARCH_ENTRIES.filter((item) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      item.label.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q) ||
      item.tag.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 bg-white/95 backdrop-blur-md border-b ${
          scrolled ? 'border-slate-200 shadow-xs py-2.5' : 'border-slate-100 py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, NAV_ITEMS[0])}
            className="flex items-center gap-3 shrink-0 group"
          >
            <div className="w-9 h-10 shrink-0">
              <svg viewBox="0 0 44 48" fill="none" aria-hidden="true" className="w-full h-full">
                <path d="M22 2L4 8.5V21.5C4 32.5 11.5 42.5 22 46C32.5 42.5 40 32.5 40 21.5V8.5L22 2Z" fill="#0A2540" />
                <path d="M22 5.5L7.5 11V21.5C7.5 30.5 13.5 38.8 22 42C30.5 38.8 36.5 30.5 36.5 21.5V11L22 5.5Z" fill="#FFFFFF" />
                <rect x="13.5" y="24" width="4" height="10" rx="1.5" fill="#0052CC" />
                <rect x="20" y="17" width="4" height="17" rx="1.5" fill="#0052CC" />
                <rect x="26.5" y="20.5" width="4" height="13.5" rx="1.5" fill="#0052CC" />
                <path d="M15.5 23L22 16L28.5 19.5" stroke="#0284C7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-[#0A2540] leading-none">
                BankGuard <span className="text-[#0052CC]">AI</span>
              </span>
              <span className="text-[11px] text-slate-500 font-medium mt-0.5">
                Institutional Risk &amp; XAI
              </span>
            </div>
          </a>

          {/* Primary Navigation (Desktop) */}
          <nav aria-label="Primary" className="hidden lg:flex items-center gap-6">
            <ul className="flex items-center gap-6">
              {NAV_ITEMS.map((item) => {
                const isActive = activeNav === item.name;
                return (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={(e) => handleNavClick(e, item)}
                      className={`relative py-2 text-[13.5px] font-semibold transition-colors whitespace-nowrap ${
                        isActive ? 'text-[#0052CC]' : 'text-slate-600 hover:text-[#0A2540]'
                      }`}
                    >
                      {item.name}
                      {isActive && (
                        <span
                          aria-hidden="true"
                          className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0052CC] rounded-full"
                        />
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Live DB Status Indicator Pill (Desktop) */}
            <button
              type="button"
              onClick={() => navigateTo('db-config')}
              title="Inspect PostgreSQL / Backend Connection"
              className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-mono font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-[#0052CC]" aria-hidden="true" />
              <span
                className={`w-2 h-2 rounded-full ${
                  dbStatus?.connected ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                aria-hidden="true"
              />
              <span>{dbStatus?.connected ? 'PG Synced' : 'DB Setup'}</span>
            </button>

            {/* Quick Search Button */}
            <button
              type="button"
              onClick={openSearchDialog}
              aria-label="Search sections and actions"
              className="min-w-9 min-h-9 px-2.5 py-2 flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-[#0A2540] hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline text-xs font-medium text-slate-500">Search</span>
            </button>

            {user ? (
              <button
                type="button"
                onClick={() => navigateTo('portal')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0052CC] hover:bg-[#0043a8] text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer shadow-xs"
              >
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                <span>Open Portal</span>
              </button>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigateTo('signin')}
                  className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-[#0A2540] font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('signup')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0052CC] hover:bg-[#0043a8] text-white font-semibold text-xs sm:text-sm transition-colors shadow-xs cursor-pointer"
                >
                  <span>Open Account</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-primary-nav"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="lg:hidden min-w-9 min-h-9 p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <nav
            id="mobile-primary-nav"
            aria-label="Mobile"
            className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3"
          >
            <ul className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = activeNav === item.name;
                return (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={(e) => handleNavClick(e, item)}
                      className={`block px-3 py-2.5 rounded-lg text-sm font-semibold ${
                        isActive ? 'bg-sky-50 text-[#0052CC]' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {item.name}
                    </a>
                  </li>
                );
              })}
            </ul>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigateTo('db-config');
                }}
                className="w-full py-2.5 px-3 rounded-lg border border-slate-200 text-left text-xs font-semibold text-slate-700 flex items-center justify-between"
              >
                <span>PostgreSQL DB Configuration</span>
                <span className="font-mono text-[11px] text-[#0052CC]">
                  {dbStatus?.connected ? 'Connected' : 'Configure'}
                </span>
              </button>
              {!user && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigateTo('signin');
                    }}
                    className="py-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-[#0A2540]"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigateTo('signup');
                    }}
                    className="py-2.5 rounded-lg bg-[#0052CC] text-white text-xs font-semibold"
                  >
                    Open Account
                  </button>
                </div>
              )}
            </div>
          </nav>
        )}
      </header>

      {/* Accessible Native <dialog> Quick Search */}
      <dialog
        ref={searchDialogRef}
        aria-labelledby="quick-search-title"
        closedby="any"
        className="m-auto w-[min(92vw,34rem)] rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl text-slate-900"
      >
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h1 id="quick-search-title" className="text-sm font-bold text-[#0A2540] flex items-center gap-2">
              <Search className="w-4 h-4 text-[#0052CC]" aria-hidden="true" />
              <span>Quick Navigate BankGuard AI</span>
            </h1>
            <button
              type="button"
              onClick={closeSearchDialog}
              className="px-2.5 py-1 rounded-md text-xs font-mono font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            >
              Esc
            </button>
          </div>

          <label htmlFor="quick-search-input" className="visually-hidden">
            Search sections, simulators, and pages
          </label>
          <input
            id="quick-search-input"
            type="search"
            autoFocus
            placeholder="Search live stream, SHAP sandbox, models, sign in..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400"
          />

          <ul className="mt-3 max-h-64 overflow-y-auto divide-y divide-slate-100">
            {filteredSearch.length > 0 ? (
              filteredSearch.map((entry) => (
                <li key={entry.label}>
                  <button
                    type="button"
                    onClick={() => handleSearchSelect(entry)}
                    className="w-full text-left py-2.5 px-2.5 hover:bg-slate-50 rounded-lg flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#0A2540]">{entry.label}</div>
                      <div className="text-[11px] text-slate-500">{entry.desc}</div>
                    </div>
                    <span className="shrink-0 px-2 py-0.5 rounded bg-slate-100 text-[10px] font-mono font-semibold text-slate-600">
                      {entry.tag}
                    </span>
                  </button>
                </li>
              ))
            ) : (
              <li className="py-6 text-center text-xs text-slate-500">
                No matching sections found.
              </li>
            )}
          </ul>
        </div>
      </dialog>
    </>
  );
}
