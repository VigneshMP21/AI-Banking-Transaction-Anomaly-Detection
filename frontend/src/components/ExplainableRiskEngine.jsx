import React, { useState } from 'react';
import { Eye, ShieldCheck, Scale, Binary, FileCheck, Layers, GitBranch, Lightbulb } from 'lucide-react';

const XAI_PILLARS = [
  {
    id: 'shap',
    title: 'TreeSHAP & KernelSHAP Values',
    badge: 'Game-Theoretic Rigor',
    icon: Scale,
    description: 'Calculates exact marginal Shapley contributions for every continuous and categorical feature across non-linear decision trees and deep ensembles.',
    benefit: 'Guarantees local accuracy, missingness, and consistency properties required by bank auditing.'
  },
  {
    id: 'counterfactual',
    title: 'Counterfactual Explanations ("What-If")',
    badge: 'Actionable Recourse',
    icon: GitBranch,
    description: 'Generates minimal feature adjustments that would transition a flagged transaction back into the legitimate baseline threshold.',
    benefit: 'Empowers fraud dispute analysts with immediate clear explanation: "If amount was under $5,000, risk falls by 45%."'
  },
  {
    id: 'lime',
    title: 'LIME Local Surrogate Approximations',
    badge: 'Black-Box Interpretable',
    icon: Binary,
    description: 'Fits sparse linear surrogate models around individual high-dimensional deep neural network points for human-readable feature importance.',
    benefit: 'Converts complex 512-dimension latent autoencoder vectors into plain-English reasoning.'
  },
  {
    id: 'audit',
    title: 'Cryptographic Audit Trail Logging',
    badge: 'Regulatory Grade',
    icon: FileCheck,
    description: 'Every model inference, weights snapshot, and XAI attribution score is hashed into an immutable append-only compliance ledger.',
    benefit: 'Zero-tampering guarantee for Federal Reserve, ECB, and Basel III regulatory examinations.'
  }
];

export default function ExplainableRiskEngine() {
  const [activePillar, setActivePillar] = useState(XAI_PILLARS[0]);

  return (
    <section id="xai-engine" className="py-20 relative bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-xs font-mono font-bold text-sky-800 mb-3">
            <Eye className="w-3.5 h-3.5" />
            <span>Explainable AI (XAI) Framework</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            No Black Boxes. 100% Transparent Financial Intelligence.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3">
            Traditional AI blocks transactions without explanation. Our XAI Engine delivers mathematically rigorous, human-interpretable reasons for every flagged payment.
          </p>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {XAI_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            const isSelected = activePillar.id === pillar.id;

            return (
              <div
                key={pillar.id}
                onClick={() => setActivePillar(pillar)}
                className={`glass-card-3d p-6 rounded-3xl border transition-all cursor-pointer group ${isSelected ? 'border-sky-500 bg-sky-50/40 shadow-xl ring-2 ring-sky-500/20 scale-[1.02]' : 'border-slate-200 bg-white hover:border-slate-300'}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl ${isSelected ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 group-hover:bg-sky-50 group-hover:text-sky-700'}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600">
                    {pillar.badge}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 mb-2 group-hover:text-sky-700 transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {pillar.description}
                </p>

                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-medium">
                  <span className="font-bold text-slate-900">Compliance Value: </span>
                  {pillar.benefit}
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Comparison: Black Box vs. Aegis XAI Engine */}
        <div className="glass-card-3d p-8 rounded-3xl border border-slate-200 shadow-xl bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            
            {/* Legacy Black Box Approach */}
            <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200">
              <div className="flex items-center gap-2 text-rose-800 font-extrabold text-sm mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                <span>Legacy "Black Box" Neural Systems</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">✗</span>
                  <span>Opaque probability outputs without decision rationale</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">✗</span>
                  <span>High false-positive customer rejection without recourse</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">✗</span>
                  <span>Fails GDPR Article 22 "Right to Explanation" compliance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">✗</span>
                  <span>Lengthy manual fraud disputes taking 5-10 business days</span>
                </li>
              </ul>
            </div>

            {/* Aegis Explainable AI Approach */}
            <div className="p-6 rounded-3xl bg-sky-50 border border-sky-200">
              <div className="flex items-center gap-2 text-sky-800 font-extrabold text-sm mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
                <span>AegisBank Explainable Risk AI</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-800 font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-sky-600 font-bold">✓</span>
                  <span>Instant mathematical SHAP factor contribution for every tx</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-600 font-bold">✓</span>
                  <span>Counterfactual what-if simulation for automated dispute resolutions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-600 font-bold">✓</span>
                  <span>100% compliant with CFPB & European Banking Authority auditing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-600 font-bold">✓</span>
                  <span>Microsecond decisioning with human-readable natural language</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
