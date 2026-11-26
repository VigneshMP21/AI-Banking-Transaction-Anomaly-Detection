import React from 'react';
import { Award, CheckCircle2 } from 'lucide-react';

const COMPLIANCE_ITEMS = [
  {
    title: 'GDPR Article 22 (Right to Explanation)',
    code: 'EU-GDPR-22',
    description:
      'Delivers human-readable SHAP feature breakdowns and counterfactual recourse whenever a transaction is held or blocked.',
  },
  {
    title: 'Basel III Operational Risk Traceability',
    code: 'BCBS-239',
    description:
      'Maintains structured transaction records, risk scores, and analyst dispositions for reproducible risk auditing.',
  },
  {
    title: 'Cryptographic Auth & Audit Trails',
    code: 'JWT + BCRYPT',
    description:
      'Uses salted Bcrypt password hashing, signed JWT sessions, and append-only security audit event tracking in PostgreSQL.',
  },
  {
    title: 'Role-Isolated Access Control',
    code: 'RBAC-GUARD',
    description:
      'Separates customer self-service vault views from analyst fraud investigation, model monitoring, and database configuration.',
  },
];

export default function InstitutionalCompliance() {
  return (
    <section id="compliance" className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 text-emerald-700 font-mono text-xs font-bold uppercase tracking-wider mb-2">
            <Award className="w-4 h-4" aria-hidden="true" />
            <span>Governance &amp; Security</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0A2540] tracking-tight">
            Built for Regulatory Transparency &amp; Auditability
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Designed around banking governance principles so automated risk controls remain accountable and reviewable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {COMPLIANCE_ITEMS.map((item) => (
            <div key={item.code} className="bank-surface rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                  {item.code}
                </span>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              </div>
              <h3 className="text-base font-bold text-[#0A2540] mb-2">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
