import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, ShieldCheck, Pause, Play, Eye, Globe, CreditCard, Building2, Smartphone } from 'lucide-react';

const INITIAL_TRANSACTIONS = [
  {
    id: 'TX-948120',
    time: '22:04:12.410',
    type: 'SWIFT Wire',
    channelIcon: Globe,
    sender: 'ACC-8812 (Geneva)',
    recipient: 'ACC-4910 (Cayman)',
    amount: 142500,
    currency: '$',
    riskScore: 89,
    status: 'CRITICAL',
    trigger: 'Offshore high-velocity wire + Unseen beneficiary + Geo-hop delta',
    model: 'Ensemble (VAE + XGBoost)',
    sandboxPreset: {
      amount: 142500,
      velocity: 11,
      geoDistance: 8200,
      timeHour: 2,
      deviceEntropy: 'high',
      accountAgeMonths: 6,
      beneficiaryNew: true,
    },
  },
  {
    id: 'TX-948119',
    time: '22:04:11.890',
    type: 'POS Terminal',
    channelIcon: CreditCard,
    sender: 'ACC-3129 (London)',
    recipient: 'Whole Foods Retail',
    amount: 84.5,
    currency: '£',
    riskScore: 4,
    status: 'NORMAL',
    trigger: 'Matches 90-day habitual spending baseline & trusted device',
    model: 'XGBoost Baseline',
    sandboxPreset: {
      amount: 85,
      velocity: 1,
      geoDistance: 0,
      timeHour: 14,
      deviceEntropy: 'low',
      accountAgeMonths: 54,
      beneficiaryNew: false,
    },
  },
  {
    id: 'TX-948118',
    time: '22:04:11.120',
    type: 'ATM Cash Out',
    channelIcon: Building2,
    sender: 'ACC-1904 (New York)',
    recipient: 'ATM Terminal #492',
    amount: 3000,
    currency: '$',
    riskScore: 68,
    status: 'SUSPICIOUS',
    trigger: 'Midnight withdrawal surge + Consecutive attempts within 40s',
    model: 'Isolation Forest',
    sandboxPreset: {
      amount: 3000,
      velocity: 9,
      geoDistance: 650,
      timeHour: 3,
      deviceEntropy: 'medium',
      accountAgeMonths: 24,
      beneficiaryNew: true,
    },
  },
  {
    id: 'TX-948117',
    time: '22:04:10.550',
    type: 'Mobile P2P (UPI)',
    channelIcon: Smartphone,
    sender: 'ACC-7741 (Mumbai)',
    recipient: 'ACC-6102 (Bengaluru)',
    amount: 450,
    currency: '₹',
    riskScore: 8,
    status: 'NORMAL',
    trigger: 'Whitelisted contact + Verified hardware biometric token',
    model: 'XGBoost Baseline',
    sandboxPreset: {
      amount: 450,
      velocity: 2,
      geoDistance: 0,
      timeHour: 11,
      deviceEntropy: 'low',
      accountAgeMonths: 42,
      beneficiaryNew: false,
    },
  },
  {
    id: 'TX-948116',
    time: '22:04:09.910',
    type: 'E-Commerce API',
    channelIcon: CreditCard,
    sender: 'ACC-5520 (Singapore)',
    recipient: 'Crypto Exchange Gateway',
    amount: 9800,
    currency: '$',
    riskScore: 94,
    status: 'CRITICAL',
    trigger: 'Structuring / Smurfing burst just below $10,000 CTR threshold',
    model: 'Autoencoder + Velocity',
    sandboxPreset: {
      amount: 9800,
      velocity: 16,
      geoDistance: 400,
      timeHour: 15,
      deviceEntropy: 'high',
      accountAgeMonths: 3,
      beneficiaryNew: true,
    },
  },
];

export default function LiveTransactionStream({ onSelectTx, activeTxId }) {
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [isStreaming, setIsStreaming] = useState(true);
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const isAnomaly = Math.random() > 0.68;
      const isSuspicious = !isAnomaly && Math.random() > 0.5;

      const types = ['SWIFT Wire', 'POS Terminal', 'ATM Cash Out', 'Mobile P2P', 'E-Commerce API'];
      const icons = [Globe, CreditCard, Building2, Smartphone, CreditCard];
      const typeIdx = Math.floor(Math.random() * types.length);

      let riskScore = Math.floor(Math.random() * 18 + 3);
      let status = 'NORMAL';
      let trigger = 'Verified device signature & normal merchant profile';
      let model = 'XGBoost Baseline';
      let amount = +(Math.random() * 450 + 25).toFixed(2);
      let sandboxPreset = {
        amount: Math.round(amount),
        velocity: 1,
        geoDistance: 0,
        timeHour: 13,
        deviceEntropy: 'low',
        accountAgeMonths: 48,
        beneficiaryNew: false,
      };

      if (isAnomaly) {
        riskScore = Math.floor(Math.random() * 22 + 76);
        status = 'CRITICAL';
        amount = Math.floor(Math.random() * 85000 + 12000);
        trigger = 'Impossible travel speed + Unrecognized device entropy';
        model = 'VAE + Isolation Forest';
        sandboxPreset = {
          amount: Math.min(100000, amount),
          velocity: 14,
          geoDistance: 8900,
          timeHour: 2,
          deviceEntropy: 'high',
          accountAgeMonths: 4,
          beneficiaryNew: true,
        };
      } else if (isSuspicious) {
        riskScore = Math.floor(Math.random() * 26 + 46);
        status = 'SUSPICIOUS';
        amount = Math.floor(Math.random() * 3500 + 1200);
        trigger = 'Elevated 1h velocity vs 90-day account baseline';
        model = 'XGBoost + Velocity';
        sandboxPreset = {
          amount,
          velocity: 8,
          geoDistance: 700,
          timeHour: 3,
          deviceEntropy: 'medium',
          accountAgeMonths: 18,
          beneficiaryNew: true,
        };
      }

      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');

      const newTx = {
        id: `TX-${Math.floor(Math.random() * 900000 + 100000)}`,
        time: timeStr,
        type: types[typeIdx],
        channelIcon: icons[typeIdx],
        sender: `ACC-${Math.floor(Math.random() * 8999 + 1000)} (${['Mumbai', 'Chennai', 'London', 'Zurich', 'Singapore'][Math.floor(Math.random() * 5)]})`,
        recipient: `ACC-${Math.floor(Math.random() * 8999 + 1000)} (${['Bengaluru', 'New York', 'Frankfurt', 'Dubai', 'Toronto'][Math.floor(Math.random() * 5)]})`,
        amount,
        currency: '$',
        riskScore,
        status,
        trigger,
        model,
        sandboxPreset,
      };

      setTransactions((prev) => [newTx, ...prev.slice(0, 11)]);
    }, 3000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  const filtered = transactions.filter((t) => {
    if (filterType === 'ALL') return true;
    return t.status === filterType;
  });

  return (
    <section id="features" className="py-16 sm:py-20 bg-[#F8FAFC] border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-[#0052CC] font-mono text-xs font-bold tracking-wider uppercase mb-2">
              <Activity className="w-4 h-4" aria-hidden="true" />
              <span>Live Simulation Feed</span>
            </div>
            <h2 id="live-stream-heading" className="text-2xl sm:text-4xl font-extrabold text-[#0A2540] tracking-tight">
              Transaction Surveillance Stream
            </h2>
            <p className="text-slate-600 text-sm mt-1.5 max-w-2xl">
              Simulated multi-channel banking feed demonstrating real-time scoring. Select any row or click <strong>Inspect</strong> to load its parameters into the SHAP Risk Sandbox below.
            </p>
          </div>

          {/* Filter & Stream Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div role="group" aria-label="Filter transactions by risk status" className="inline-flex items-center bg-white border border-slate-200 rounded-xl p-1 text-xs shadow-2xs">
              {['ALL', 'CRITICAL', 'SUSPICIOUS', 'NORMAL'].map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={filterType === f}
                  onClick={() => setFilterType(f)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    filterType === f
                      ? 'bg-[#0052CC] text-white'
                      : 'text-slate-600 hover:text-[#0A2540] hover:bg-slate-50'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsStreaming(!isStreaming)}
              aria-pressed={!isStreaming}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                isStreaming
                  ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}
            >
              {isStreaming ? (
                <Pause className="w-3.5 h-3.5 text-[#0052CC]" aria-hidden="true" />
              ) : (
                <Play className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
              )}
              <span>{isStreaming ? 'Pause Feed' : 'Resume Feed'}</span>
            </button>
          </div>
        </div>

        {/* Semantic Accessible Table Container */}
        <div className="bank-surface rounded-2xl overflow-hidden">
          <div
            tabIndex={0}
            role="region"
            aria-labelledby="live-stream-heading"
            className="table-scroll-region"
          >
            <table className="w-full text-left border-collapse min-w-[820px]">
              <caption className="visually-hidden">
                Simulated banking transactions with risk score, policy decision, and AI attribution triggers.
              </caption>
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-mono uppercase tracking-wider text-slate-600">
                  <th scope="col" className="py-3.5 px-5 font-bold">Tx ID &amp; Time</th>
                  <th scope="col" className="py-3.5 px-4 font-bold">Channel</th>
                  <th scope="col" className="py-3.5 px-4 font-bold">Origin &rarr; Beneficiary</th>
                  <th scope="col" className="py-3.5 px-4 font-bold text-right">Amount</th>
                  <th scope="col" className="py-3.5 px-4 font-bold text-center">Risk Score</th>
                  <th scope="col" className="py-3.5 px-4 font-bold">Status</th>
                  <th scope="col" className="py-3.5 px-4 font-bold">Primary Trigger</th>
                  <th scope="col" className="py-3.5 px-5 font-bold text-right">Sandbox</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs bg-white">
                {filtered.map((tx) => {
                  const Icon = tx.channelIcon;
                  const isInspected = activeTxId === tx.id;
                  return (
                    <tr
                      key={tx.id}
                      className={`transition-colors ${
                        isInspected ? 'bg-sky-50/80' : 'hover:bg-slate-50/90'
                      }`}
                    >
                      <th scope="row" className="py-3 px-5 font-mono text-left font-normal">
                        <div className="font-bold text-[#0A2540]">{tx.id}</div>
                        <div className="text-[11px] text-slate-500">{tx.time}</div>
                      </th>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
                            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                          </div>
                          <span className="text-slate-700 font-semibold whitespace-nowrap">{tx.type}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-semibold">{tx.sender}</div>
                        <div className="text-[11px] text-slate-500">&rarr; {tx.recipient}</div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-[#0A2540] whitespace-nowrap">
                        {tx.currency}{tx.amount.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <div className="w-12 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200" aria-hidden="true">
                            <div
                              className={`h-full rounded-full ${
                                tx.riskScore > 70 ? 'bg-rose-600' : tx.riskScore > 40 ? 'bg-amber-500' : 'bg-emerald-600'
                              }`}
                              style={{ width: `${tx.riskScore}%` }}
                            />
                          </div>
                          <span
                            className={`font-mono font-bold text-xs ${
                              tx.riskScore > 70 ? 'text-rose-700' : tx.riskScore > 40 ? 'text-amber-700' : 'text-emerald-700'
                            }`}
                          >
                            {tx.riskScore}%
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {tx.status === 'CRITICAL' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                            <ShieldAlert className="w-3 h-3" aria-hidden="true" />
                            CRITICAL
                          </span>
                        )}
                        {tx.status === 'SUSPICIOUS' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <ShieldAlert className="w-3 h-3" aria-hidden="true" />
                            STEP-UP MFA
                          </span>
                        )}
                        {tx.status === 'NORMAL' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <ShieldCheck className="w-3 h-3" aria-hidden="true" />
                            AUTO-CLEARED
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="truncate text-slate-700 font-medium" title={tx.trigger}>
                          {tx.trigger}
                        </div>
                        <div className="text-[10px] text-[#0052CC] font-mono mt-0.5">{tx.model}</div>
                      </td>

                      <td className="py-3 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => onSelectTx && onSelectTx(tx)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#0052CC] text-slate-700 hover:text-white border border-slate-200 hover:border-[#0052CC] text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-emerald-500' : 'bg-amber-500'}`} aria-hidden="true" />
              <span>
                {isStreaming
                  ? 'Demo Stream Active • Click Inspect on any row to simulate SHAP attribution below'
                  : 'Demo Stream Paused'}
              </span>
            </div>
            <span className="font-mono text-[11px] text-slate-500">
              Showing {filtered.length} of {transactions.length} recent events
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
