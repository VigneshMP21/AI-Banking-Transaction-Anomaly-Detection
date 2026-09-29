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
    trigger: 'Offshore high-velocity wire anomaly + Unseen beneficiary + Layering pattern',
    model: 'Graph Neural Net + Autoencoder'
  },
  {
    id: 'TX-948119',
    time: '22:04:11.890',
    type: 'POS Terminal',
    channelIcon: CreditCard,
    sender: 'ACC-3129 (London)',
    recipient: 'Whole Foods Retail',
    amount: 84.50,
    currency: '£',
    riskScore: 4,
    status: 'NORMAL',
    trigger: 'Matches historical habitual spending baseline',
    model: 'XGBoost Baseline'
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
    trigger: 'Midnight withdrawal surge + Consecutive PIN retries within 40 seconds',
    model: 'Isolation Forest'
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
    trigger: 'Known trusted contact + Biometric FaceID authenticated',
    model: 'XGBoost Baseline'
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
    trigger: 'Smurfing velocity: 6th transaction below $10,000 reporting threshold',
    model: 'LSTM Temporal Sequence'
  },
];

export default function LiveTransactionStream({ onSelectTx }) {
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [isStreaming, setIsStreaming] = useState(true);
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const isAnomaly = Math.random() > 0.65;
      const isSuspicious = !isAnomaly && Math.random() > 0.5;

      const types = ['SWIFT Wire', 'POS Terminal', 'ATM Cash Out', 'Mobile P2P', 'E-Commerce API'];
      const icons = [Globe, CreditCard, Building2, Smartphone, CreditCard];
      const typeIdx = Math.floor(Math.random() * types.length);

      let riskScore = Math.floor(Math.random() * 20 + 2);
      let status = 'NORMAL';
      let trigger = 'Verified biometric signature & normal merchant profile';
      let model = 'XGBoost Baseline';
      let amount = +(Math.random() * 400 + 15).toFixed(2);

      if (isAnomaly) {
        riskScore = Math.floor(Math.random() * 25 + 75);
        status = 'CRITICAL';
        amount = Math.floor(Math.random() * 85000 + 9500);
        trigger = 'Impossible travel speed (Tokyo → London in 14m) + Elevated entropy';
        model = 'Isolation Forest + Autoencoder';
      } else if (isSuspicious) {
        riskScore = Math.floor(Math.random() * 30 + 45);
        status = 'SUSPICIOUS';
        amount = Math.floor(Math.random() * 3500 + 800);
        trigger = 'Deviation from 90-day account variance + Device mismatch';
        model = 'One-Class SVM';
      }

      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');

      const newTx = {
        id: `TX-${Math.floor(Math.random() * 900000 + 100000)}`,
        time: timeStr,
        type: types[typeIdx],
        channelIcon: icons[typeIdx],
        sender: `ACC-${Math.floor(Math.random() * 8999 + 1000)} (${['Tokyo', 'Zurich', 'New York', 'Dubai', 'Sydney'][Math.floor(Math.random() * 5)]})`,
        recipient: `ACC-${Math.floor(Math.random() * 8999 + 1000)} (${['London', 'Frankfurt', 'Singapore', 'Toronto', 'Sao Paulo'][Math.floor(Math.random() * 5)]})`,
        amount: amount,
        currency: '$',
        riskScore: riskScore,
        status: status,
        trigger: trigger,
        model: model
      };

      setTransactions(prev => [newTx, ...prev.slice(0, 14)]);
    }, 2400);

    return () => clearInterval(interval);
  }, [isStreaming]);

  const filtered = transactions.filter(t => {
    if (filterType === 'CRITICAL') return t.status === 'CRITICAL';
    if (filterType === 'SUSPICIOUS') return t.status === 'SUSPICIOUS';
    if (filterType === 'NORMAL') return t.status === 'NORMAL';
    return true;
  });

  return (
    <section id="live-stream" className="py-20 relative bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-sky-700 font-mono text-xs font-bold tracking-wider uppercase mb-2">
              <Activity className="w-4 h-4" />
              <span>Real-Time Ingestion Pipeline</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Live Core Banking Transaction Surveillance
            </h2>
            <p className="text-slate-600 text-sm mt-1 max-w-2xl">
              Microsecond neural evaluation across multi-channel payment streams. Click on any record to inspect deep SHAP feature attribution in the sandbox.
            </p>
          </div>

          {/* Stream Controls & Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1 text-xs shadow-sm">
              {['ALL', 'CRITICAL', 'SUSPICIOUS', 'NORMAL'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterType(f)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${filterType === f ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  {f}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-xs font-bold transition-all shadow-sm ${isStreaming ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-amber-50 border-amber-200 text-amber-800'}`}
            >
              {isStreaming ? <Pause className="w-3.5 h-3.5 text-sky-600" /> : <Play className="w-3.5 h-3.5 text-amber-600" />}
              <span>{isStreaming ? 'Pause Stream' : 'Resume Live'}</span>
            </button>
          </div>
        </div>

        {/* Live Stream Table Container */}
        <div className="glass-card-3d rounded-3xl border border-slate-200 overflow-hidden shadow-xl bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-mono uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-5 font-bold">Tx ID & Timestamp</th>
                  <th className="py-3.5 px-4 font-bold">Channel</th>
                  <th className="py-3.5 px-4 font-bold">Route (Origin → Beneficiary)</th>
                  <th className="py-3.5 px-4 font-bold text-right">Amount</th>
                  <th className="py-3.5 px-4 font-bold text-center">Risk Score</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold">AI Explainability Trigger</th>
                  <th className="py-3.5 px-5 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans text-xs">
                {filtered.map((tx) => {
                  const Icon = tx.channelIcon;
                  return (
                    <tr 
                      key={tx.id}
                      className="hover:bg-sky-50/50 transition-colors group cursor-pointer"
                      onClick={() => onSelectTx && onSelectTx(tx)}
                    >
                      {/* Tx ID & Time */}
                      <td className="py-3 px-5 font-mono">
                        <div className="font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                          {tx.id}
                        </div>
                        <div className="text-[10px] text-slate-400">{tx.time}</div>
                      </td>

                      {/* Channel */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-slate-700 font-semibold">{tx.type}</span>
                        </div>
                      </td>

                      {/* Sender & Recipient */}
                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-semibold">{tx.sender}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <span>→</span>
                          <span>{tx.recipient}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 text-right font-mono font-black text-slate-900">
                        {tx.currency}{tx.amount.toLocaleString()}
                      </td>

                      {/* Risk Score */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <div className="w-12 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                            <div 
                              className={`h-full rounded-full ${tx.riskScore > 70 ? 'bg-rose-500' : tx.riskScore > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${tx.riskScore}%` }}
                            />
                          </div>
                          <span className={`font-mono font-bold text-xs ${tx.riskScore > 70 ? 'text-rose-600' : tx.riskScore > 40 ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {tx.riskScore}%
                          </span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4">
                        {tx.status === 'CRITICAL' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <ShieldAlert className="w-3 h-3 text-rose-600" />
                            CRITICAL
                          </span>
                        )}
                        {tx.status === 'SUSPICIOUS' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <ShieldAlert className="w-3 h-3 text-amber-600" />
                            SUSPICIOUS
                          </span>
                        )}
                        {tx.status === 'NORMAL' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            AUTHORIZED
                          </span>
                        )}
                      </td>

                      {/* XAI Trigger Note */}
                      <td className="py-3 px-4 max-w-xs truncate text-slate-700 font-medium">
                        <div className="truncate text-xs">{tx.trigger}</div>
                        <div className="text-[10px] text-sky-700 font-mono mt-0.5">Model: {tx.model}</div>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-5 text-right">
                        <a
                          href="#sandbox"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-sky-100 text-slate-700 hover:text-sky-800 border border-slate-200 text-[11px] font-bold transition-all shadow-sm"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect</span>
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer Bar */}
          <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-600"></span>
              </span>
              <span>Kafka cluster active • Ingesting 150+ rolling transaction features</span>
            </div>
            <div className="font-mono font-bold text-sky-700">Throughput: 4,280 msgs/sec</div>
          </div>

        </div>

      </div>
    </section>
  );
}
