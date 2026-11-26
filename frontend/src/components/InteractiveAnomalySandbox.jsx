import React, { useState, useMemo, useId } from 'react';
import {
  Sliders,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Sparkles,
  RotateCcw,
  FileText,
  Cpu,
  Zap,
  Scale,
  ArrowRight,
} from 'lucide-react';

const PRESET_SCENARIOS = [
  {
    id: 'smurfing',
    title: 'AML Smurfing / Structuring',
    desc: 'Rapid transfers structured just below the $10,000 CTR reporting threshold.',
    params: {
      amount: 9850,
      velocity: 14,
      geoDistance: 120,
      timeHour: 15,
      deviceEntropy: 'high',
      accountAgeMonths: 3,
      beneficiaryNew: true,
    },
  },
  {
    id: 'atm_drain',
    title: 'Midnight ATM Cashout',
    desc: 'Consecutive cash withdrawals at 03:00 UTC from an unfamiliar terminal.',
    params: {
      amount: 4000,
      velocity: 8,
      geoDistance: 650,
      timeHour: 3,
      deviceEntropy: 'medium',
      accountAgeMonths: 24,
      beneficiaryNew: true,
    },
  },
  {
    id: 'credential_hijack',
    title: 'Impossible Travel / Hijack',
    desc: 'Cross-border transfer 9,500 km away within minutes of prior session.',
    params: {
      amount: 12500,
      velocity: 3,
      geoDistance: 9500,
      timeHour: 21,
      deviceEntropy: 'high',
      accountAgeMonths: 48,
      beneficiaryNew: true,
    },
  },
  {
    id: 'payroll_normal',
    title: 'Verified Corporate Transfer',
    desc: 'Business-hours settlement to a whitelisted beneficiary from a trusted device.',
    params: {
      amount: 25000,
      velocity: 1,
      geoDistance: 0,
      timeHour: 10,
      deviceEntropy: 'low',
      accountAgeMonths: 60,
      beneficiaryNew: false,
    },
  },
  {
    id: 'micro_probing',
    title: 'Card Testing / Bot Flood',
    desc: 'Automated burst of micro-charges across multiple endpoints in 1 hour.',
    params: {
      amount: 1.5,
      velocity: 28,
      geoDistance: 450,
      timeHour: 2,
      deviceEntropy: 'high',
      accountAgeMonths: 1,
      beneficiaryNew: true,
    },
  },
];

function buildPresetFromTx(tx) {
  if (!tx) return PRESET_SCENARIOS[0].params;
  return (
    tx.sandboxPreset || {
      amount: Math.min(150000, Math.max(1, Math.round(tx.amount || 5000))),
      velocity: tx.status === 'CRITICAL' ? 14 : tx.status === 'SUSPICIOUS' ? 7 : 1,
      geoDistance: tx.status === 'CRITICAL' ? 8200 : tx.status === 'SUSPICIOUS' ? 600 : 0,
      timeHour: tx.status === 'CRITICAL' ? 2 : 13,
      deviceEntropy: tx.status === 'CRITICAL' ? 'high' : tx.status === 'SUSPICIOUS' ? 'medium' : 'low',
      accountAgeMonths: tx.status === 'CRITICAL' ? 4 : 42,
      beneficiaryNew: tx.status !== 'NORMAL',
    }
  );
}

export default function InteractiveAnomalySandbox({ initialTx, onClearInspectedTx }) {
  const [params, setParams] = useState(() => buildPresetFromTx(initialTx));
  const [activePreset, setActivePreset] = useState(() => (initialTx ? 'custom' : 'smurfing'));
  const [inspectedTxLabel, setInspectedTxLabel] = useState(() =>
    initialTx ? `${initialTx.id} (${initialTx.type})` : null
  );
  const [isSimulating, setIsSimulating] = useState(false);

  const amountId = useId();
  const velocityId = useId();
  const geoId = useId();
  const timeId = useId();
  const beneficiaryId = useId();

  const applyPreset = (preset) => {
    setActivePreset(preset.id);
    setInspectedTxLabel(null);
    setParams(preset.params);
    if (onClearInspectedTx) onClearInspectedTx();
  };

  const evaluation = useMemo(() => {
    const baseScore = 8;

    let amountImpact = 0;
    if (params.amount > 50000 && params.beneficiaryNew) amountImpact = 34;
    else if (params.amount >= 9000 && params.amount <= 9999) amountImpact = 26;
    else if (params.amount > 10000) amountImpact = 16;
    else if (params.amount < 5 && params.velocity > 10) amountImpact = 30;
    else amountImpact = 2;

    let velocityImpact = 0;
    if (params.velocity > 20) velocityImpact = 34;
    else if (params.velocity > 10) velocityImpact = 22;
    else if (params.velocity > 4) velocityImpact = 10;
    else velocityImpact = -6;

    let geoImpact = 0;
    if (params.geoDistance > 5000) geoImpact = 34;
    else if (params.geoDistance > 500) geoImpact = 16;
    else if (params.geoDistance > 50) geoImpact = 4;
    else geoImpact = -8;

    let timeImpact = 0;
    if (params.timeHour >= 1 && params.timeHour <= 4) timeImpact = 14;
    else if (params.timeHour >= 9 && params.timeHour <= 18) timeImpact = -6;

    let deviceImpact = 0;
    if (params.deviceEntropy === 'high') deviceImpact = 20;
    else if (params.deviceEntropy === 'medium') deviceImpact = 9;
    else deviceImpact = -12;

    const beneficiaryImpact = params.beneficiaryNew ? 14 : -14;
    const tenureImpact = params.accountAgeMonths > 36 ? -10 : params.accountAgeMonths < 3 ? 12 : 0;

    const rawScore =
      baseScore +
      amountImpact +
      velocityImpact +
      geoImpact +
      timeImpact +
      deviceImpact +
      beneficiaryImpact +
      tenureImpact;
    const finalScore = Math.min(99, Math.max(1, rawScore));

    let riskTier = 'LOW_RISK';
    let action = 'AUTO_CLEARED';
    let explanation =
      'Transaction aligns with habitual account baseline, verified hardware token, and expected geo-location.';

    if (finalScore >= 75) {
      riskTier = 'CRITICAL_ANOMALY';
      action = 'BLOCKED_FROZEN';
      explanation =
        'High-risk divergence across spatial velocity, payload behavior, and device telemetry. Transfer frozen and analyst alert generated.';
    } else if (finalScore >= 45) {
      riskTier = 'SUSPICIOUS_REVIEW';
      action = 'STEP_UP_MFA';
      explanation =
        'Moderate behavioral deviation detected. Hold settlement and issue a 6-digit OTP / biometric Step-Up MFA challenge.';
    }

    const shapFactors = [
      { name: 'Velocity Density (1h)', value: velocityImpact, label: `${params.velocity} tx / 60m` },
      { name: 'Geo-Hop Spatial Delta', value: geoImpact, label: `${params.geoDistance.toLocaleString()} km` },
      { name: 'Payload Amount Pattern', value: amountImpact, label: `$${params.amount.toLocaleString()}` },
      { name: 'Device & IP Entropy', value: deviceImpact, label: `${params.deviceEntropy.toUpperCase()} risk profile` },
      { name: 'Origin Timestamp (UTC)', value: timeImpact, label: `${String(params.timeHour).padStart(2, '0')}:00 UTC` },
      {
        name: 'Beneficiary Trust',
        value: beneficiaryImpact,
        label: params.beneficiaryNew ? 'Unverified New Counterparty' : 'Whitelisted Counterparty',
      },
      { name: 'Account Tenure', value: tenureImpact, label: `${params.accountAgeMonths} months active` },
    ].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

    // Actionable Counterfactual Recourse Suggestions
    const recourseSteps = [];
    if (finalScore >= 45) {
      if (params.deviceEntropy !== 'low') {
        recourseSteps.push('Authenticate from a registered trusted device (low entropy) to reduce risk by ~22–32 pts.');
      }
      if (params.geoDistance > 500) {
        recourseSteps.push('Confirm travel status or originate within <500 km home corridor to remove geo-hop penalty.');
      }
      if (params.beneficiaryNew) {
        recourseSteps.push('Complete beneficiary pre-verification / whitelist cooling period (-28 pts shift).');
      }
      if (params.velocity > 4) {
        recourseSteps.push('Reduce burst frequency below 4 tx/hr to clear velocity anomaly.');
      }
    }

    return {
      score: finalScore,
      riskTier,
      action,
      explanation,
      shapFactors,
      recourseSteps,
    };
  }, [params]);

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 350);
  };

  return (
    <section id="sandbox" className="py-16 sm:py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-2 text-[#0052CC] font-mono text-xs font-bold uppercase tracking-wider mb-2">
            <Sliders className="w-4 h-4" aria-hidden="true" />
            <span>Interactive Risk &amp; XAI Laboratory</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0A2540] tracking-tight">
            Test Anomaly Scoring, SHAP &amp; What-If Recourse
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Choose an attack scenario or adjust parameters below to observe how adaptive policy enforcement, feature attribution, and counterfactual recourse respond in real time.
          </p>
        </div>

        {/* Inspected Transaction Banner */}
        {inspectedTxLabel && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-between gap-3 text-xs">
            <span className="text-[#0A2540] font-medium">
              Loaded attributes from live stream record: <strong className="font-mono text-[#0052CC]">{inspectedTxLabel}</strong>
            </span>
            <button
              type="button"
              onClick={() => applyPreset(PRESET_SCENARIOS[0])}
              className="text-[#0052CC] font-semibold hover:underline cursor-pointer"
            >
              Reset to Preset
            </button>
          </div>
        )}

        {/* Preset Selector Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
          {PRESET_SCENARIOS.map((scenario) => {
            const isSelected = activePreset === scenario.id;
            return (
              <button
                key={scenario.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => applyPreset(scenario)}
                className={`p-4 rounded-xl text-left transition-colors border cursor-pointer ${
                  isSelected
                    ? 'bg-sky-50/70 border-[#0052CC] ring-1 ring-[#0052CC]'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-bold text-[#0A2540] mb-1 flex items-center justify-between gap-2">
                  <span>{scenario.title}</span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-[#0052CC] shrink-0" aria-hidden="true" />}
                </div>
                <div className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                  {scenario.desc}
                </div>
              </button>
            );
          })}
        </div>

        {/* Interactive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Controls */}
          <div className="lg:col-span-5 bank-surface rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#0052CC]" aria-hidden="true" />
                <h3 className="text-sm font-bold text-[#0A2540]">Transaction Parameters</h3>
              </div>
              <button
                type="button"
                onClick={() => applyPreset(PRESET_SCENARIOS[0])}
                className="text-xs font-semibold text-slate-600 hover:text-[#0052CC] inline-flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Reset</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Amount */}
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1.5">
                  <label htmlFor={amountId}>Transaction Payload (USD)</label>
                  <span className="font-mono font-bold text-[#0052CC]">${params.amount.toLocaleString()}</span>
                </div>
                <input
                  id={amountId}
                  type="range"
                  min="1"
                  max="150000"
                  step="50"
                  value={params.amount}
                  onChange={(e) => {
                    setActivePreset('custom');
                    setParams({ ...params, amount: +e.target.value });
                  }}
                  className="w-full cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                  <span>$1</span>
                  <span className="text-[#0052CC] font-semibold">$10k CTR Threshold</span>
                  <span>$150k</span>
                </div>
              </div>

              {/* Velocity */}
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1.5">
                  <label htmlFor={velocityId}>Velocity (Transactions / Hour)</label>
                  <span className="font-mono font-bold text-[#0052CC]">{params.velocity} tx/hr</span>
                </div>
                <input
                  id={velocityId}
                  type="range"
                  min="1"
                  max="35"
                  value={params.velocity}
                  onChange={(e) => {
                    setActivePreset('custom');
                    setParams({ ...params, velocity: +e.target.value });
                  }}
                  className="w-full cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                  <span>1 (Normal)</span>
                  <span>15 (Elevated)</span>
                  <span>35 (Burst)</span>
                </div>
              </div>

              {/* Geo-Hop */}
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1.5">
                  <label htmlFor={geoId}>Spatial Delta / Geo-Hop</label>
                  <span className="font-mono font-bold text-[#0052CC]">{params.geoDistance.toLocaleString()} km</span>
                </div>
                <input
                  id={geoId}
                  type="range"
                  min="0"
                  max="12000"
                  step="100"
                  value={params.geoDistance}
                  onChange={(e) => {
                    setActivePreset('custom');
                    setParams({ ...params, geoDistance: +e.target.value });
                  }}
                  className="w-full cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                  <span>0 km (Local)</span>
                  <span>2,000 km</span>
                  <span>12,000 km</span>
                </div>
              </div>

              {/* Time */}
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1.5">
                  <label htmlFor={timeId}>Origin Hour (UTC)</label>
                  <span className="font-mono font-bold text-[#0052CC]">{String(params.timeHour).padStart(2, '0')}:00 UTC</span>
                </div>
                <input
                  id={timeId}
                  type="range"
                  min="0"
                  max="23"
                  value={params.timeHour}
                  onChange={(e) => {
                    setActivePreset('custom');
                    setParams({ ...params, timeHour: +e.target.value });
                  }}
                  className="w-full cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                  <span>00:00</span>
                  <span>12:00</span>
                  <span>23:00</span>
                </div>
              </div>

              {/* Device Entropy */}
              <fieldset>
                <legend className="font-semibold text-slate-700 mb-1.5">Device &amp; IP Risk Entropy</legend>
                <div className="grid grid-cols-3 gap-2">
                  {['low', 'medium', 'high'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      aria-pressed={params.deviceEntropy === level}
                      onClick={() => {
                        setActivePreset('custom');
                        setParams({ ...params, deviceEntropy: level });
                      }}
                      className={`py-2 rounded-lg font-mono text-[11px] uppercase font-bold border transition-colors cursor-pointer ${
                        params.deviceEntropy === level
                          ? 'bg-sky-50 border-[#0052CC] text-[#0052CC]'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Beneficiary & Tenure */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <label
                  htmlFor={beneficiaryId}
                  className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <input
                    id={beneficiaryId}
                    type="checkbox"
                    checked={params.beneficiaryNew}
                    onChange={(e) => {
                      setActivePreset('custom');
                      setParams({ ...params, beneficiaryNew: e.target.checked });
                    }}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <span className="text-[11px] text-slate-700 font-semibold">New Beneficiary</span>
                </label>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Tenure</span>
                  <span className="text-xs text-[#0A2540] font-mono font-bold">{params.accountAgeMonths} mo</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="w-full py-3 rounded-xl bg-[#0052CC] hover:bg-[#0043a8] text-white font-semibold text-xs shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4" aria-hidden="true" />
              <span>{isSimulating ? 'Re-Evaluating Risk...' : 'Re-Evaluate Risk Score'}</span>
            </button>
          </div>

          {/* Right Column: Score, SHAP Waterfall, and Counterfactual Recourse */}
          <div className="lg:col-span-7 space-y-5">
            {/* Risk Assessment Summary */}
            <div
              className={`rounded-2xl border p-6 transition-colors ${
                evaluation.riskTier === 'CRITICAL_ANOMALY'
                  ? 'border-rose-200 bg-rose-50/40'
                  : evaluation.riskTier === 'SUSPICIOUS_REVIEW'
                  ? 'border-amber-200 bg-amber-50/40'
                  : 'border-emerald-200 bg-emerald-50/40'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                    Composite Risk Score
                  </span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-4xl font-extrabold font-mono text-[#0A2540]">
                      {evaluation.score}%
                    </span>
                    <span
                      className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                        evaluation.riskTier === 'CRITICAL_ANOMALY'
                          ? 'bg-rose-100 text-rose-800 border-rose-200'
                          : evaluation.riskTier === 'SUSPICIOUS_REVIEW'
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {evaluation.riskTier.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Automated Policy Action */}
                <div className="bg-white border border-slate-200 px-4 py-3 rounded-xl flex items-center gap-3 shadow-2xs">
                  <div
                    className={`p-2 rounded-lg ${
                      evaluation.riskTier === 'CRITICAL_ANOMALY'
                        ? 'bg-rose-100 text-rose-700'
                        : evaluation.riskTier === 'SUSPICIOUS_REVIEW'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {evaluation.riskTier === 'CRITICAL_ANOMALY' ? (
                      <ShieldAlert className="w-5 h-5" aria-hidden="true" />
                    ) : evaluation.riskTier === 'SUSPICIOUS_REVIEW' ? (
                      <AlertTriangle className="w-5 h-5" aria-hidden="true" />
                    ) : (
                      <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                    )}
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Policy Trigger</div>
                    <div className="text-xs font-bold text-[#0A2540]">
                      {evaluation.action === 'BLOCKED_FROZEN' && 'Block & Freeze + Analyst Alert'}
                      {evaluation.action === 'STEP_UP_MFA' && 'Step-Up OTP Challenge'}
                      {evaluation.action === 'AUTO_CLEARED' && 'Auto-Clear Settlement'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full bg-slate-200/80 rounded-full h-2.5 mb-4 overflow-hidden" aria-hidden="true">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    evaluation.score >= 75 ? 'bg-rose-600' : evaluation.score >= 45 ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${evaluation.score}%` }}
                />
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#0052CC] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <strong className="text-[#0A2540]">Decision Summary: </strong>
                  <span>{evaluation.explanation}</span>
                </div>
              </div>
            </div>

            {/* SHAP Attribution Breakdown */}
            <div className="bank-surface rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0052CC]" aria-hidden="true" />
                  <h3 className="text-sm font-bold text-[#0A2540]">SHAP Feature Attribution Breakdown</h3>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-mono font-semibold">
                  <span className="flex items-center gap-1 text-rose-700">
                    <span className="w-2 h-2 rounded-xs bg-rose-600" aria-hidden="true" /> + Risk Driver
                  </span>
                  <span className="flex items-center gap-1 text-emerald-700">
                    <span className="w-2 h-2 rounded-xs bg-emerald-600" aria-hidden="true" /> - Trust Baseline
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                {evaluation.shapFactors.map((factor) => {
                  const isPositive = factor.value > 0;
                  const barWidth = Math.min(100, Math.abs(factor.value) * 2.6);
                  return (
                    <div
                      key={factor.name}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="sm:w-2/5">
                        <div className="font-semibold text-[#0A2540]">{factor.name}</div>
                        <div className="text-[11px] text-slate-500">{factor.label}</div>
                      </div>
                      <div className="flex-1 flex items-center gap-3">
                        <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden" aria-hidden="true">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isPositive ? 'bg-rose-600' : 'bg-emerald-600'
                            }`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <span
                          className={`w-12 text-right font-mono font-bold text-xs ${
                            isPositive ? 'text-rose-700' : 'text-emerald-700'
                          }`}
                        >
                          {isPositive ? `+${factor.value}%` : `${factor.value}%`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Actionable Counterfactual Recourse Box */}
              {evaluation.recourseSteps.length > 0 && (
                <div className="mt-5 p-4 rounded-xl bg-sky-50/70 border border-sky-200 text-xs">
                  <div className="flex items-center gap-2 font-bold text-[#0A2540] mb-2">
                    <Scale className="w-4 h-4 text-[#0052CC]" aria-hidden="true" />
                    <span>Counterfactual (&ldquo;What-If&rdquo;) Recourse — How to Clear This Transaction</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-700">
                    {evaluation.recourseSteps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <ArrowRight className="w-3.5 h-3.5 text-[#0052CC] shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
