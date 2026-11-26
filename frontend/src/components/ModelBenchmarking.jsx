import React from 'react';
import { BarChart3 } from 'lucide-react';

const MODELS = [
  {
    name: 'XGBoost + LightGBM Ensemble',
    category: 'Supervised Gradient Boosting',
    strength: 'High precision on tabular behavioral & channel features with native TreeSHAP.',
    latency: '< 2 ms',
    xai: 'Exact TreeSHAP',
    role: 'Primary Scorer',
  },
  {
    name: 'Deep Variational Autoencoder (VAE)',
    category: 'Unsupervised Deep Learning',
    strength: 'Learns normal transaction manifolds to catch unseen zero-day attack patterns.',
    latency: '~ 6 ms',
    xai: 'Feature Reconstruction Error',
    role: 'Zero-Day Detector',
  },
  {
    name: 'Isolation Forest (iForest)',
    category: 'Unsupervised Tree Isolation',
    strength: 'Fast outlier boundary separation for high-dimensional anomalous spikes.',
    latency: '~ 3 ms',
    xai: 'Path Depth Attribution',
    role: 'Outlier Guard',
  },
  {
    name: 'Graph Analytics (NetworkX / GNN)',
    category: 'Relational Graph AI',
    strength: 'Identifies cyclic money laundering, smurfing fan-in hubs, and shared devices.',
    latency: '~ 10 ms',
    xai: 'Subgraph Highlighting',
    role: 'Mule Ring Detector',
  },
];

export default function ModelBenchmarking() {
  return (
    <section id="solution" className="py-16 sm:py-20 bg-[#F8FAFC] border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 text-[#0052CC] font-mono text-xs font-bold uppercase tracking-wider mb-2">
            <BarChart3 className="w-4 h-4" aria-hidden="true" />
            <span>Multi-Model Architecture</span>
          </div>
          <h2 id="models-heading" className="text-2xl sm:text-4xl font-extrabold text-[#0A2540] tracking-tight">
            Complementary ML, Deep Learning &amp; Graph Models
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Combining supervised, unsupervised, and relational models ensures both known fraud precision and zero-day anomaly coverage.
          </p>
        </div>

        {/* 4 Model Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {MODELS.map((m) => (
            <div key={m.name} className="bank-surface rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-[#0052CC] font-bold">
                    {m.role}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-500">{m.latency}</span>
                </div>
                <h3 className="text-base font-bold text-[#0A2540] mb-1.5">{m.name}</h3>
                <div className="text-[11px] font-mono text-slate-500 mb-3">{m.category}</div>
                <p className="text-xs text-slate-600 leading-relaxed">{m.strength}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Explainability</span>
                <span className="font-mono font-semibold text-[#0A2540]">{m.xai}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Accessible Comparison Matrix */}
        <div className="bank-surface rounded-2xl overflow-hidden">
          <div className="px-6 py-4 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-[#0A2540]">Model Role &amp; Explainability Matrix</h3>
            <span className="text-xs font-mono text-slate-500">
              Evaluated via PR-AUC, F1-Score, Recall &amp; False Positive Rate
            </span>
          </div>

          <div tabIndex={0} role="region" aria-labelledby="models-heading" className="table-scroll-region">
            <table className="w-full text-left text-xs min-w-[680px]">
              <caption className="visually-hidden">
                Comparison of ML, Deep Learning, and Graph models used in the BankGuard AI ensemble.
              </caption>
              <thead className="bg-slate-50 font-mono text-[11px] uppercase text-slate-600 border-b border-slate-200">
                <tr>
                  <th scope="col" className="py-3.5 px-6 font-bold">Model</th>
                  <th scope="col" className="py-3.5 px-4 font-bold">Paradigm</th>
                  <th scope="col" className="py-3.5 px-4 font-bold">Primary Role</th>
                  <th scope="col" className="py-3.5 px-4 font-bold">XAI Mechanism</th>
                  <th scope="col" className="py-3.5 px-6 font-bold text-right">Target Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                {MODELS.map((m) => (
                  <tr key={m.name} className="hover:bg-slate-50/80 transition-colors">
                    <th scope="row" className="py-3.5 px-6 font-bold text-[#0A2540] text-left">
                      {m.name}
                    </th>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{m.category}</td>
                    <td className="py-3.5 px-4 font-semibold text-[#0052CC]">{m.role}</td>
                    <td className="py-3.5 px-4">{m.xai}</td>
                    <td className="py-3.5 px-6 text-right font-mono font-bold text-[#0A2540]">{m.latency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
