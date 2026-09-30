import React, { useState } from 'react';
import { Database, Cpu, Layers, ShieldCheck, CheckCircle2, Zap } from 'lucide-react';

const PIPELINE_STAGES = [
  {
    step: '01',
    title: 'High-Throughput Ingestion',
    tech: 'Apache Kafka • WebSocket Streaming',
    icon: Database,
    color: 'from-sky-500 to-blue-600',
    description: 'Ingests up to 50,000 tx/sec from core banking engines, ISO 20022 XML feeds, card networks, and open banking REST APIs with zero data loss.',
    specs: ['< 2ms Ingestion Buffer', 'End-to-End TLS 1.3 Encryption', 'Schema Registry Validation']
  },
  {
    step: '02',
    title: 'Real-Time Feature Store',
    tech: 'Redis Cluster • Feast Feature Store',
    icon: Zap,
    color: 'from-blue-600 to-indigo-600',
    description: 'Computes 150+ rolling high-dimensional features on the fly: 1h/24h velocity windows, geographic speed deltas, account entropy, and graph degrees.',
    specs: ['Sub-millisecond State Retrieval', 'Dynamic Sliding Windows', 'Temporal Consistency Engine']
  },
  {
    step: '03',
    title: 'Ensemble ML Scoring',
    tech: 'Autoencoders • Isolation Forest • GNN',
    icon: Cpu,
    color: 'from-indigo-600 to-purple-600',
    description: 'Runs parallel supervised & unsupervised models to capture both known fraud patterns and emerging zero-day anomaly clusters.',
    specs: ['Unsupervised Deep Autoencoder', 'Graph Neural Net for Mule Rings', 'LightGBM Microsecond Inference']
  },
  {
    step: '04',
    title: 'XAI & Policy Enforcement',
    tech: 'TreeSHAP • Basel III Risk Engine',
    icon: ShieldCheck,
    color: 'from-emerald-500 to-teal-600',
    description: 'Generates instant mathematical SHAP explanations and executes sub-frame actions: Auto-Clear, Step-Up Hardware MFA, or Freeze.',
    specs: ['100% Auditable Reason Codes', 'Real-Time Webhook Triggers', 'Zero Customer Friction']
  }
];

export default function ArchitecturePipeline() {
  const [activeStage, setActiveStage] = useState(0);

  return (
    <section id="how-it-works" className="py-20 relative bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-xs font-mono font-bold text-sky-800 mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>End-to-End System Design</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Production Banking Pipeline Architecture
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Engineered for Tier-1 banks, payment processors, and global fintechs processing millions of transactions daily with &lt; 12ms end-to-end latency.
          </p>
        </div>

        {/* Pipeline Stage Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {PIPELINE_STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isSelected = activeStage === idx;

            return (
              <div
                key={stage.step}
                onClick={() => setActiveStage(idx)}
                className={`glass-card-3d p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group ${isSelected ? 'border-sky-500 bg-sky-50/40 shadow-xl ring-2 ring-sky-500/20 scale-[1.02]' : 'border-slate-200 bg-white hover:border-slate-300'}`}
              >
                {/* Stage Number Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs font-mono font-black px-2.5 py-1 rounded-xl bg-gradient-to-r ${stage.color} text-white shadow-sm`}>
                    STAGE {stage.step}
                  </span>
                  <div className={`p-2.5 rounded-2xl ${isSelected ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 group-hover:text-slate-900'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 mb-1 group-hover:text-sky-700 transition-colors">
                  {stage.title}
                </h3>
                <div className="text-[11px] font-mono font-bold text-sky-700 mb-3">
                  {stage.tech}
                </div>

                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {stage.description}
                </p>

                {/* Bullet Points */}
                <div className="space-y-1.5 pt-3 border-t border-slate-100">
                  {stage.specs.map((spec, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-2 text-[11px] text-slate-700 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Architecture Flow Diagram Interactive Card */}
        <div className="glass-card-3d p-8 rounded-3xl border border-slate-200 shadow-xl bg-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 mb-6 border-b border-slate-200">
            <div>
              <div className="text-xs font-mono uppercase text-slate-500 font-bold">Selected Pipeline Deep Dive</div>
              <div className="text-xl font-black text-slate-900 mt-1">
                Stage {PIPELINE_STAGES[activeStage].step}: {PIPELINE_STAGES[activeStage].title}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold">
                Status: Operational 100%
              </span>
              <span className="px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-mono font-bold">
                Avg Latency: 2.8ms
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="font-bold text-slate-900 mb-1">Fault-Tolerant Scalability</div>
              <p className="text-slate-600">Auto-scales dynamically on Kubernetes clusters to absorb flash sales, Black Friday spikes, and midnight crypto volatility.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="font-bold text-slate-900 mb-1">Zero-Trust Isolation</div>
              <p className="text-slate-600">Strict VPC network peering, mutual TLS (mTLS), and AES-256 hardware security module (HSM) key isolation.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="font-bold text-slate-900 mb-1">Continuous Model Retraining</div>
              <p className="text-slate-600">Automated concept drift detection using population stability index (PSI) triggers shadow retraining pipelines.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
