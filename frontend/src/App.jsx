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
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
              !
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
            <p className="text-xs text-slate-500 mb-6">{this.state.error?.message || 'Failed to render section.'}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full py-3 rounded-xl bg-sky-600 text-white font-bold text-xs"
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

  // Standalone Separate Page Routing
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

  // Default Landing Page
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-sky-500/20 selection:text-sky-900">
      <Navbar />
      <main className="bg-white">
        <Hero />
        <LiveTransactionStream onSelectTx={handleSelectTx} />
        <InteractiveAnomalySandbox initialTx={selectedTx} />
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
