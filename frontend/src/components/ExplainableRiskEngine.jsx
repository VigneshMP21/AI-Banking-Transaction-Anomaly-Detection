import React, { useState } from 'react';
import { Eye, Scale, Binary, FileCheck, GitBranch } from 'lucide-react';

const XAI_PILLARS = [
  {
    id: 'shap',
    title: 'TreeSHAP Attribution',
    badge: 'Game-Theoretic',
    icon: Scale,
    description:
      'Computes exact marginal Shapley contributions for every numerical and behavioral feature across gradient-boosted ensembles.',
    benefit: 'Provides auditable, consistent feature weights for every automated decision.',
  },
  {
    id: 'counterfactual',
    title: 'Counterfactual Recourse',
    badge: 'What-If Analysis',
    icon: GitBranch,
    description:
      'Identifies the minimal changes required to move a held or blocked payment back below the approval threshold.',
    benefit: 'Reduces customer dispute resolution friction with clear, actionable guidance.',
  },
  {
    id: 'lime',
    title: 'Reconstruction & Surrogates',
    badge: 'Deep Model XAI',
    icon: Binary,
    description:
      'Translates unsupervised autoencoder reconstruction error and local LIME surrogates into plain-English risk summaries.',
    benefit: 'Makes zero-day deep learning alerts understandable for risk operations teams.',
  },
  {
    id: 'audit',
    title: 'Immutable Audit Logging',
    badge: 'Regulatory Trail',
    icon: FileCheck,
    description:
      'Persists transaction attributes, risk scores, reason codes, and analyst actions in PostgreSQL security audit tables.',
    benefit: 'Supports GDPR Article 22 Right-to-Explanation and internal model governance.',
  },
];

export default function ExplainableRiskEngine() {
  const [activePillar, setActivePillar] = useState(XAI_PILLARS[0].id);

  return (
    <section id="about" className="py-16 sm:py-20 bg-[#F8FAFC] border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 text-[#0052CC] font-mono text-xs font-bold uppercase tracking-wider mb-2">
            <Eye className="w-4 h-4" aria-hidden="true" />
            <span>Explainable AI Framework</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0A2540] tracking-tight">
            Transparent Decisions Without Black-Box Guesswork
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Every flagged or held payment is accompanied by mathematically grounded reason codes, feature impacts, and actionable recourse.
          </p>
        </div>

        {/* 4 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {XAI_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            const isSelected = activePillar === pillar.id;
            return (
              <button
                key={pillar.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setActivePillar(pillar.id)}
                className={`text-left bank-surface rounded-2xl p-5 transition-colors cursor-pointer flex flex-col justify-between ${
                  isSelected ? 'border-[#0052CC] ring-1 ring-[#0052CC]' : 'hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`p-2.5 rounded-xl ${
                        isSelected ? 'bg-[#0052CC] text-white' : 'bg-slate-100 text-[#0A2540]'
                      }`}
                    >
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {pillar.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#0A2540] mb-2">{pillar.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{pillar.description}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-700">
                  <strong className="text-[#0A2540]">Audit Value: </strong>
                  {pillar.benefit}
                </div>
              </button>
            );
          })}
        </div>

        {/* Comparison Table Card */}
        <div className="bank-surface rounded-2xl p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-rose-50/60 border border-rose-200">
              <h3 className="text-sm font-bold text-rose-900 mb-3">Legacy Black-Box Fraud Rules</h3>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-rose-700 font-bold" aria-hidden="true">&times;</span>
                  <span>Binary block/pass outputs with no feature-level rationale</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-700 font-bold" aria-hidden="true">&times;</span>
                  <span>High false positives declining legitimate high-value customers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-700 font-bold" aria-hidden="true">&times;</span>
                  <span>Difficult to justify automated adverse actions under GDPR Art. 22</span>
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-sky-50/60 border border-sky-200">
              <h3 className="text-sm font-bold text-[#0A2540] mb-3">BankGuard AI Explainable Engine</h3>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-[#0052CC] font-bold" aria-hidden="true">&#10003;</span>
                  <span>Per-transaction SHAP risk contributions &amp; natural-language summaries</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0052CC] font-bold" aria-hidden="true">&#10003;</span>
                  <span>Step-Up OTP verification for borderline transactions instead of hard blocks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0052CC] font-bold" aria-hidden="true">&#10003;</span>
                  <span>Actionable counterfactual recourse &amp; analyst investigation feedback loop</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
