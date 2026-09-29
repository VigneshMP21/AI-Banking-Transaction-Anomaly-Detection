import React, { useState, useEffect } from 'react';
import { ShieldCheck, Zap, BarChart3, Lock, ArrowRight, Activity, Sparkles, CheckCircle2 } from 'lucide-react';
import ThreeNeuralGlobe from './ThreeNeuralGlobe';

export default function Hero() {
  const [txCount, setTxCount] = useState(8492014);
  const [anomalyBlocked, setAnomalyBlocked] = useState(14820);
  const [preventedLoss, setPreventedLoss] = useState(42.8);

  useEffect(() => {
    const interval = setInterval(() => {
      setTxCount(prev => prev + Math.floor(Math.random() * 5 + 2));
      if (Math.random() > 0.7) {
        setAnomalyBlocked(prev => prev + 1);
        setPreventedLoss(prev => +(prev + 0.04).toFixed(2));
      }
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen pt-32 pb-20 overflow-hidden flex flex-col justify-center bg-mesh-light">
      {/* Background Ambient Radial Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-sky-200/40 via-blue-100/30 to-transparent rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-light opacity-60 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-sky-200 text-xs font-bold text-sky-800 shadow-md shadow-sky-500/5 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-sky-600 animate-spin-slow" />
            <span>Explainable AI (XAI) & SHAP Risk Attribution</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-emerald-200 text-xs font-semibold text-emerald-800 shadow-md shadow-emerald-500/5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Real-Time Unsupervised Neural Surveillance</span>
          </div>
        </div>

        {/* 2-Column Hero: Left Copy, Right 3D Interactive Globe */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          
          {/* Left Headline & CTAs (7 cols) */}
          <div className="lg:col-span-7 text-left">
            <h1 className="text-4xl sm:text-6xl lg:text-[64px] font-black tracking-tight text-slate-900 leading-[1.08] mb-6">
              AI Banking Transaction{' '}
              <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Anomaly Detection
              </span>{' '}
              & Explainable Risk
            </h1>
            
            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed mb-8 max-w-2xl">
              Microsecond-latency deep neural transaction screening. Defend against zero-day financial fraud, money muling rings, and smurfing attacks with <span className="text-sky-700 font-bold">100% auditable SHAP & LIME mathematical transparency</span>.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <a
                href="#sandbox"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white font-bold text-sm shadow-xl shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <Zap className="w-4 h-4 text-sky-200 fill-current" />
                <span>Launch 3D Risk Sandbox</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#xai-engine"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-white border border-slate-300 hover:border-sky-400 text-slate-700 hover:text-sky-700 font-bold text-sm shadow-sm hover:shadow-md transition-all duration-200"
              >
                <BarChart3 className="w-4 h-4 text-sky-600" />
                <span>Explore XAI Transparency</span>
              </a>
            </div>

            {/* Quick Guarantees */}
            <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Sub-12ms Latency</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>GDPR Art. 22 Compliant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero False Chargebacks</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Three.js Interactive Neural Globe (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="glass-card-3d rounded-3xl p-3 border border-slate-200/90 relative overflow-hidden bg-gradient-to-b from-white/95 to-slate-50/90 shadow-2xl">
              {/* Subtle top glare */}
              <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-sky-100/40 to-transparent pointer-events-none" />
              
              <ThreeNeuralGlobe />
            </div>
          </div>

        </div>

        {/* Live Metrics Grid with 3D Elevated Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          
          <div className="glass-card-3d p-5 rounded-3xl border border-slate-200/90 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 text-sky-600">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold">Screened Transactions</div>
              <div className="text-2xl font-black font-mono text-slate-900 tracking-tight">
                {txCount.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                <span>↑ 4,200 tx/sec</span>
              </div>
            </div>
          </div>

          <div className="glass-card-3d p-5 rounded-3xl border border-slate-200/90 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold">Anomalies Prevented</div>
              <div className="text-2xl font-black font-mono text-emerald-600 tracking-tight">
                {anomalyBlocked.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                99.98% Precision Rate
              </div>
            </div>
          </div>

          <div className="glass-card-3d p-5 rounded-3xl border border-slate-200/90 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold">Inference Latency</div>
              <div className="text-2xl font-black font-mono text-indigo-600 tracking-tight">
                &lt; 11.2 ms
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                Sub-frame Micro-scoring
              </div>
            </div>
          </div>

          <div className="glass-card-3d p-5 rounded-3xl border border-slate-200/90 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold">Capital Safeguarded</div>
              <div className="text-2xl font-black font-mono text-slate-900 tracking-tight">
                ${preventedLoss}M USD
              </div>
              <div className="text-[11px] text-teal-600 font-bold mt-0.5">
                Zero Chargeback Rate
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
