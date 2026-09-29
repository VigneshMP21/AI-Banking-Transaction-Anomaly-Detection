import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import LiveTransactionStream from './components/LiveTransactionStream';
import InteractiveAnomalySandbox from './components/InteractiveAnomalySandbox';
import ExplainableRiskEngine from './components/ExplainableRiskEngine';
import ArchitecturePipeline from './components/ArchitecturePipeline';
import ModelBenchmarking from './components/ModelBenchmarking';
import InstitutionalCompliance from './components/InstitutionalCompliance';
import Footer from './components/Footer';

export default function App() {
  const [selectedTx, setSelectedTx] = useState(null);

  const handleSelectTx = (tx) => {
    setSelectedTx(tx);
    const sandboxEl = document.getElementById('sandbox');
    if (sandboxEl) {
      sandboxEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
