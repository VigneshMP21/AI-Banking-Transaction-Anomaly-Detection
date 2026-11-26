import React, { useState } from 'react';
import { Database, Cpu, Layers, ShieldCheck, CheckCircle2, Zap } from 'lucide-react';

const PIPELINE_STAGES = [
  {
    step: '01',
    title: 'Transaction Ingestion',
    tech: 'FastAPI REST • WebSocket Stream',
    icon: Database,
    description:
      'Receives multi-channel payment payloads (SWIFT, Wire, UPI, POS, ATM) with Pydantic schema validation and JWT authentication.',
    specs: ['Schema validation & sanitization', 'PostgreSQL & SQLite persistence', 'Real-time event dispatch'],
  },
  {
    step: '02',
    title: 'Behavioral Feature Engine',
    tech: 'Velocity • Z-Score • Geo-Speed',
    icon: Zap,
    description:
      'Derives rolling stateful context from account history: 1h/24h transfer frequency, spending Z-score, and Haversine travel velocity.',
    specs: ['1h & 24h rolling burst counts', '30-day baseline Z-score', 'Impossible-travel km/h delta'],
  },
  {
    step: '03',
    title: 'Hybrid AI / ML / DL Scoring',
    tech: 'XGBoost • Autoencoder • Graph AI',
    icon: Cpu,
    description:
      'Combines supervised gradient-boosted trees, unsupervised neural reconstruction error, Isolation Forest, and graph ring signals.',
    specs: ['Supervised known-fraud scoring', 'Unsupervised zero-day anomaly check', 'NetworkX mule-ring inspection'],
  },
  {
    step: '04',
    title: 'XAI & Policy Enforcement',
    tech: 'TreeSHAP • Counterfactuals • Audit',
    icon: ShieldCheck,
    description:
      'Generates SHAP feature attributions and enforces 3-tier banking actions: Auto-Clear, Step-Up OTP MFA, or Block & Analyst Alert.',
    specs: ['GDPR Art. 22 reason codes', 'Step-Up MFA challenge flow', 'Immutable security audit trail'],
  },
];

export default function ArchitecturePipeline() {
  const [activeStage, setActiveStage] = useState(0);

  return (
    <section id="how-it-works" className="py-16 sm:py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 text-[#0052CC] font-mono text-xs font-bold uppercase tracking-wider mb-2">
            <Layers className="w-4 h-4" aria-hidden="true" />
            <span>System Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0A2540] tracking-tight">
            Four-Stage Risk Scoring &amp; Audit Pipeline
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Designed to keep legitimate payments seamless while intercepting high-risk anomalies before settlement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {PIPELINE_STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isSelected = activeStage === idx;
            return (
              <button
                key={stage.step}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setActiveStage(idx)}
                className={`text-left bank-surface rounded-2xl p-5 transition-colors cursor-pointer flex flex-col justify-between ${
                  isSelected ? 'border-[#0052CC] ring-1 ring-[#0052CC]' : 'hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-[#0A2540] text-white">
                      STAGE {stage.step}
                    </span>
                    <div
                      className={`p-2 rounded-xl ${
                        isSelected ? 'bg-[#0052CC] text-white' : 'bg-slate-100 text-[#0A2540]'
                      }`}
                    >
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-[#0A2540] mb-1">{stage.title}</h3>
                  <div className="text-[11px] font-mono font-semibold text-[#0052CC] mb-3">{stage.tech}</div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{stage.description}</p>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-slate-100">
                  {stage.specs.map((spec) => (
                    <div key={spec} className="flex items-center gap-2 text-[11px] text-slate-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Stage Details */}
        <div className="bank-surface rounded-2xl p-6 bg-[#F8FAFC]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-200">
            <div>
              <div className="text-[11px] font-mono uppercase text-slate-500 font-bold">Active Stage Specification</div>
              <div className="text-lg font-extrabold text-[#0A2540] mt-0.5">
                Stage {PIPELINE_STAGES[activeStage].step}: {PIPELINE_STAGES[activeStage].title}
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-mono font-semibold text-[#0052CC]">
              {PIPELINE_STAGES[activeStage].tech}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <div className="font-bold text-[#0A2540] mb-1">Atomic Policy Enforcement</div>
              <p className="text-slate-600">Low-risk transfers settle immediately; medium-risk triggers Step-Up OTP; critical anomalies freeze balance outflow.</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <div className="font-bold text-[#0A2540] mb-1">Role-Isolated Governance</div>
              <p className="text-slate-600">Customers view personal transfers and clear explanations, while Risk Analysts access alerts, graph clusters, and audit logs.</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <div className="font-bold text-[#0A2540] mb-1">Drift &amp; Feedback Ready</div>
              <p className="text-slate-600">Analyst dispositions (Confirmed Fraud / False Positive) and PSI drift metrics support continuous threshold tuning.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
