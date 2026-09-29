import React from 'react';
import { ShieldCheck, CheckCircle2, Award } from 'lucide-react';

const COMPLIANCE_ITEMS = [
  {
    title: 'GDPR Article 22 & "Right to Explanation"',
    code: 'EU-GDPR-22',
    description: 'Enforces human-in-the-loop oversight and delivers clear SHAP feature breakdowns to account holders whenever an automated adverse decision occurs.'
  },
  {
    title: 'Basel III & IV Capital Risk Standards',
    code: 'BCBS-239',
    description: 'Complies with internal ratings-based (IRB) capital requirements, maintaining complete traceability and reproducibility for operational risk calculation.'
  },
  {
    title: 'PCI-DSS Level 1 & Tokenization',
    code: 'PCI-DSS-v4.0',
    description: 'Zero raw PAN storage. All card and account numbers are tokenized with format-preserving encryption (FPE) before entering ML ingestion.'
  },
  {
    title: 'SOC 2 Type II & ISO 27001 Certified',
    code: 'AICPA-SOC2',
    description: 'Strict end-to-end access isolation, automated continuous security scanning, and cryptographic tamper-evident event streaming.'
  }
];

export default function InstitutionalCompliance() {
  return (
    <section className="py-20 relative bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-mono font-bold text-emerald-800 mb-3">
            <Award className="w-3.5 h-3.5" />
            <span>Bank-Grade Governance</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Institutional Regulatory Compliance
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Built from the ground up to satisfy the strictest global financial regulators, internal model governance boards, and external auditors.
          </p>
        </div>

        {/* 4 Compliance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {COMPLIANCE_ITEMS.map((item, idx) => (
            <div
              key={idx}
              className="glass-card-3d p-6 rounded-3xl border border-slate-200 hover:border-emerald-400 transition-all group bg-white shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                  {item.code}
                </span>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>

              <h3 className="text-base font-extrabold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
