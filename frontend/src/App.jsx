import React, { useState, Component } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import LiveTransactionStream from './components/LiveTransactionStream';
import InteractiveAnomalySandbox from './components/InteractiveAnomalySandbox';
import ExplainableRiskEngine from './components/ExplainableRiskEngine';
import ArchitecturePipeline from './components/ArchitecturePipeline';
import ModelBenchmarking from './components/ModelBenchmarking';
import InstitutionalCompliance from './components/InstitutionalCompliance';
import Footer from './components/Footer';

// Standalone Separate Full-Page Views
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BankingPortalPage from './pages/BankingPortalPage';
import DbConfigPage from './pages/DbConfigPage';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('UI Render Error caught by Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
              !
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h1>
            <p className="text-xs text-slate-500 mb-6">{this.state.error?.message || 'Failed to render section.'}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full py-3 rounded-lg bg-[#0052CC] text-white font-semibold text-xs cursor-pointer"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { currentPage, navigateTo } = useAuth();
  const [selectedTx, setSelectedTx] = useState(null);

  const handleSelectTx = (tx) => {
    setSelectedTx(tx);
    if (currentPage !== 'home') {
      navigateTo('home');
      setTimeout(() => {
        const sandboxEl = document.getElementById('sandbox');
        if (sandboxEl) sandboxEl.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const sandboxEl = document.getElementById('sandbox');
      if (sandboxEl) sandboxEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (currentPage === 'signin' || currentPage === 'login') {
    return <LoginPage />;
  }

  if (currentPage === 'signup' || currentPage === 'register') {
    return <RegisterPage />;
  }

  if (currentPage === 'portal') {
    return <BankingPortalPage onLaunchSandboxTx={handleSelectTx} />;
  }

  if (currentPage === 'db-config') {
    return <DbConfigPage />;
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-sky-500/15 selection:text-sky-950">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" className="bg-white">
        <Hero />
        <LiveTransactionStream onSelectTx={handleSelectTx} activeTxId={selectedTx?.id} />
        <InteractiveAnomalySandbox
          key={selectedTx?.id || 'default'}
          initialTx={selectedTx}
          onClearInspectedTx={() => setSelectedTx(null)}
        />
        <ExplainableRiskEngine />
        <ArchitecturePipeline />
        <ModelBenchmarking />
        <InstitutionalCompliance />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
