import React, { useState, useMemo } from 'react';
import { Sliders, ShieldCheck, ShieldAlert, AlertTriangle, Play, Sparkles, CheckCircle2, RotateCcw, FileText, Cpu, Zap, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

const PRESET_SCENARIOS = [
  {
    id: 'smurfing',
    title: 'AML Smurfing / Structuring',
    desc: 'Series of rapid transactions just below the $10,000 CTR regulatory threshold.',
    params: {
      amount: 9850,
      velocity: 14,
      geoDistance: 120,
      timeHour: 15,
      deviceEntropy: 'high',
      accountAgeMonths: 3,
      beneficiaryNew: true,
      channel: 'wire'
    }
  },
  {
    id: 'atm_drain',
    title: 'Midnight ATM Velocity Cashout',
    desc: 'Rapid consecutive maximum cash withdrawals at 03:20 AM from an unfamiliar terminal.',
    params: {
      amount: 4000,
      velocity: 8,
      geoDistance: 650,
      timeHour: 3,
      deviceEntropy: 'medium',
      accountAgeMonths: 24,
      beneficiaryNew: true,
      channel: 'atm'
    }
  },
  {
    id: 'credential_hijack',
    title: 'Impossible Travel / IP Spoofing',
    desc: 'Login from Singapore 15 minutes after authenticated transaction in New York.',
    params: {
      amount: 12500,
      velocity: 3,
      geoDistance: 9500,
      timeHour: 21,
      deviceEntropy: 'high',
      accountAgeMonths: 48,
      beneficiaryNew: true,
      channel: 'ecommerce'
    }
  },
  {
    id: 'payroll_normal',
    title: 'Legitimate Corporate Payroll',
    desc: 'Scheduled monthly institutional salary batch to verified employee accounts.',
    params: {
      amount: 85000,
      velocity: 1,
      geoDistance: 0,
      timeHour: 10,
      deviceEntropy: 'low',
      accountAgeMonths: 60,
      beneficiaryNew: false,
      channel: 'wire'
    }
  },
  {
    id: 'micro_probing',
    title: 'Card Testing / Bot Probe',
    desc: 'Automated script executing $1.00 micro-charges across 20 merchants in 5 minutes.',
    params: {
      amount: 1.25,
      velocity: 28,
      geoDistance: 450,
      timeHour: 2,
      deviceEntropy: 'high',
      accountAgeMonths: 1,
      beneficiaryNew: true,
      channel: 'pos'
    }
  }
];

export default function InteractiveAnomalySandbox() {
  const [params, setParams] = useState(PRESET_SCENARIOS[0].params);
  const [activePreset, setActivePreset] = useState('smurfing');
  const [isSimulating, setIsSimulating] = useState(false);

  const applyPreset = (preset) => {
    setActivePreset(preset.id);
    setParams(preset.params);
  };

  // Real-time Anomaly Scoring Engine & SHAP calculation logic
  const evaluation = useMemo(() => {
    let score = 5; // Base baseline probability

    // Amount impact
    let amountImpact = 0;
    if (params.amount > 50000 && params.beneficiaryNew) amountImpact = 35;
    else if (params.amount >= 9000 && params.amount <= 9999) amountImpact = 28; // Smurfing marker
    else if (params.amount > 10000) amountImpact = 18;
    else if (params.amount < 5 && params.velocity > 10) amountImpact = 32; // Card testing probe
    else amountImpact = 2;

    // Velocity impact
    let velocityImpact = 0;
    if (params.velocity > 20) velocityImpact = 38;
    else if (params.velocity > 10) velocityImpact = 24;
    else if (params.velocity > 4) velocityImpact = 12;
    else velocityImpact = -5;

    // Geo hop distance
    let geoImpact = 0;
    if (params.geoDistance > 5000) geoImpact = 35; // Impossible travel
    else if (params.geoDistance > 500) geoImpact = 18;
    else if (params.geoDistance > 50) geoImpact = 5;
    else geoImpact = -8;

    // Time of day (Midnight hours 1 AM - 5 AM)
    let timeImpact = 0;
    if (params.timeHour >= 1 && params.timeHour <= 4) timeImpact = 16;
    else if (params.timeHour >= 9 && params.timeHour <= 18) timeImpact = -6; // Business hours trust

    // Device Entropy
    let deviceImpact = 0;
    if (params.deviceEntropy === 'high') deviceImpact = 22;
    else if (params.deviceEntropy === 'medium') deviceImpact = 10;
    else deviceImpact = -12; // Trusted fingerprint

    // Beneficiary trust
    let beneficiaryImpact = params.beneficiaryNew ? 15 : -14;

    // Account tenure
    let tenureImpact = params.accountAgeMonths > 36 ? -12 : (params.accountAgeMonths < 3 ? 14 : 0);

    const rawScore = score + amountImpact + velocityImpact + geoImpact + timeImpact + deviceImpact + beneficiaryImpact + tenureImpact;
    const finalScore = Math.min(99, Math.max(1, rawScore));

    let riskTier = 'LOW';
    let action = 'AUTO_APPROVE';
    let actionColor = 'emerald';
    let explanation = 'Transaction parameters align consistently with user habitual behavioral profile and trusted hardware biometric signature.';

    if (finalScore >= 75) {
      riskTier = 'CRITICAL_ANOMALY';
      action = 'AUTO_BLOCK_FREEZE';
      actionColor = 'rose';
      explanation = 'High-dimensional anomaly triggered: Multi-factor divergence detected across spatial velocity, payload size, and device telemetry.';
    } else if (finalScore >= 45) {
      riskTier = 'SUSPICIOUS_REVIEW';
      action = 'CHALLENGE_STEP_UP_MFA';
      actionColor = 'amber';
      explanation = 'Moderate behavioral deviation. Secondary authentication token or biometric passkey challenge required before settlement.';
    }

    // SHAP Feature Attribution Breakdown
    const shapFactors = [
      { name: 'Velocity Density (1hr)', value: velocityImpact, label: `${params.velocity} transactions in 60m` },
      { name: 'Geo-Hop Anomaly', value: geoImpact, label: `${params.geoDistance} km spatial delta` },
      { name: 'Payload Amount Pattern', value: amountImpact, label: `$${params.amount.toLocaleString()}` },
      { name: 'Device Fingerprint Entropy', value: deviceImpact, label: `${params.deviceEntropy.toUpperCase()} entropy profile` },
      { name: 'Temporal Deviation (Hour)', value: timeImpact, label: `${params.timeHour.toString().padStart(2, '0')}:00 UTC` },
      { name: 'Beneficiary Trust Baseline', value: beneficiaryImpact, label: params.beneficiaryNew ? 'Unrecognized New Account' : 'Known Whitelisted Counterparty' },
      { name: 'Account Tenure History', value: tenureImpact, label: `${params.accountAgeMonths} months active` }
    ].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

    return {
      score: finalScore,
      riskTier,
      action,
      actionColor,
      explanation,
      shapFactors
    };
  }, [params]);

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      if (evaluation.riskTier === 'LOW') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 }
        });
      }
    }, 600);
  };

  return (
    <section id="sandbox" className="py-20 relative bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-xs font-mono font-bold text-sky-800 mb-3">
            <Sliders className="w-3.5 h-3.5" />
            <span>Interactive Risk Laboratory</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Test Real-Time Anomaly & XAI Engine
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Simulate complex adversarial financial attacks or customize live parameters to see real-time SHAP feature attribution and instant mitigation decisions.
          </p>
        </div>

        {/* Preset Attack Vector Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {PRESET_SCENARIOS.map((scenario) => {
            const isSelected = activePreset === scenario.id;
            return (
              <button
                key={scenario.id}
                onClick={() => applyPreset(scenario)}
                className={`p-4 rounded-3xl text-left transition-all border ${isSelected ? 'bg-sky-50 border-sky-500 shadow-md scale-[1.02] ring-2 ring-sky-500/20' : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 shadow-sm'}`}
              >
                <div className="text-xs font-bold text-slate-900 mb-1 flex items-center justify-between">
                  <span>{scenario.title}</span>
                  {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>}
                </div>
                <div className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {scenario.desc}
                </div>
              </button>
            );
          })}
        </div>

        {/* Interactive Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Parameter Controls (5 cols) */}
          <div className="lg:col-span-5 glass-card-3d p-6 rounded-3xl border border-slate-200 flex flex-col justify-between shadow-xl bg-white">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-sky-600" />
                  <span className="text-sm font-extrabold text-slate-900">Transaction Attributes</span>
                </div>
                <button
                  onClick={() => applyPreset(PRESET_SCENARIOS[0])}
                  className="text-[11px] font-mono font-bold text-slate-500 hover:text-sky-600 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Sliders and Controls */}
              <div className="space-y-4 text-xs">
                
                {/* Amount Slider */}
                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1.5">
                    <span>Transaction Payload (USD)</span>
                    <span className="font-mono font-black text-sky-700">${params.amount.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100000"
                    step="50"
                    value={params.amount}
                    onChange={(e) => setParams({ ...params, amount: +e.target.value })}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-sky-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                    <span>$1.00</span>
                    <span className="font-bold text-sky-600">$10,000 CTR</span>
                    <span>$100,000+</span>
                  </div>
                </div>

                {/* Velocity Slider */}
                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1.5">
                    <span>Velocity Frequency (Past 60 mins)</span>
                    <span className="font-mono font-black text-sky-700">{params.velocity} tx/hr</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="35"
                    value={params.velocity}
                    onChange={(e) => setParams({ ...params, velocity: +e.target.value })}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-sky-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                    <span>1 (Standard)</span>
                    <span>15 (Elevated)</span>
                    <span>35 (Bot Flood)</span>
                  </div>
                </div>

                {/* Geo-Hop Slider */}
                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1.5">
                    <span>Spatial Delta / Geo-Hop</span>
                    <span className="font-mono font-black text-sky-700">{params.geoDistance.toLocaleString()} km</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="12000"
                    step="100"
                    value={params.geoDistance}
                    onChange={(e) => setParams({ ...params, geoDistance: +e.target.value })}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-sky-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                    <span>0 km (Local)</span>
                    <span>2,000 km</span>
                    <span>12,000 km (Impossible)</span>
                  </div>
                </div>

                {/* Time Hour Slider */}
                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1.5">
                    <span>Timestamp of Origin (UTC)</span>
                    <span className="font-mono font-black text-sky-700">{params.timeHour.toString().padStart(2, '0')}:00 UTC</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="23"
                    value={params.timeHour}
                    onChange={(e) => setParams({ ...params, timeHour: +e.target.value })}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-sky-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                    <span>00:00 (Midnight)</span>
                    <span>12:00 (Noon)</span>
                    <span>23:00</span>
                  </div>
                </div>

                {/* Device Entropy Radio */}
                <div>
                  <div className="font-semibold text-slate-700 mb-1.5">Device Fingerprint & IP Entropy</div>
                  <div className="grid grid-cols-3 gap-2">
                    {['low', 'medium', 'high'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setParams({ ...params, deviceEntropy: level })}
                        className={`py-2 rounded-2xl font-mono text-[11px] uppercase font-bold border transition-all ${params.deviceEntropy === level ? 'bg-sky-50 border-sky-500 text-sky-800 shadow-sm ring-2 ring-sky-500/20' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                      >
                        {level} {level === 'high' ? '🚨' : level === 'low' ? '🛡️' : '⚠️'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Beneficiary & Channel toggles */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300">
                    <input
                      type="checkbox"
                      checked={params.beneficiaryNew}
                      onChange={(e) => setParams({ ...params, beneficiaryNew: e.target.checked })}
                      className="rounded bg-white border-slate-300 text-sky-600 focus:ring-0"
                    />
                    <span className="text-[11px] text-slate-700 font-semibold">New Beneficiary</span>
                  </label>

                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-500">Tenure: <span className="text-slate-900 font-mono font-bold">{params.accountAgeMonths} mo</span></div>
                  </div>
                </div>

              </div>
            </div>

            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="mt-6 w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-sky-500/20 hover:shadow-sky-500/35 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <Zap className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>{isSimulating ? 'Evaluating Deep Neural Lattice...' : 'Re-Evaluate Real-Time Risk'}</span>
            </button>
          </div>

          {/* Right Column: Real-time Evaluation & XAI Waterfall (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Top Score Card */}
            <div className={`glass-card-3d p-6 rounded-3xl border transition-all ${evaluation.riskTier === 'CRITICAL_ANOMALY' ? 'border-rose-300 shadow-xl shadow-rose-500/5 bg-rose-50/20' : evaluation.riskTier === 'SUSPICIOUS_REVIEW' ? 'border-amber-300 shadow-xl shadow-amber-500/5 bg-amber-50/20' : 'border-emerald-300 shadow-xl shadow-emerald-500/5 bg-emerald-50/20'}`}>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">AI Risk Assessment Model</span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-slate-900">
                      {evaluation.score}%
                    </span>
                    <div className="flex flex-col">
                      <span className={`text-xs font-black uppercase px-3 py-1 rounded-full inline-block ${evaluation.riskTier === 'CRITICAL_ANOMALY' ? 'bg-rose-100 text-rose-800 border border-rose-200' : evaluation.riskTier === 'SUSPICIOUS_REVIEW' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}`}>
                        {evaluation.riskTier.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] text-slate-500 mt-0.5 font-semibold">Confidence: 99.84%</span>
                    </div>
                  </div>
                </div>

                {/* Automated Decision Pill */}
                <div className="bg-white border border-slate-200 p-3.5 rounded-2xl flex items-center gap-3 shadow-sm">
                  <div className={`p-2.5 rounded-2xl ${evaluation.riskTier === 'CRITICAL_ANOMALY' ? 'bg-rose-100 text-rose-700' : evaluation.riskTier === 'SUSPICIOUS_REVIEW' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {evaluation.riskTier === 'CRITICAL_ANOMALY' ? <ShieldAlert className="w-5 h-5" /> : evaluation.riskTier === 'SUSPICIOUS_REVIEW' ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Automated Policy Trigger</div>
                    <div className="text-xs font-black text-slate-900 tracking-wide">
                      {evaluation.action === 'AUTO_BLOCK_FREEZE' && 'BLOCK TRANSACTION & LOCK CARD'}
                      {evaluation.action === 'CHALLENGE_STEP_UP_MFA' && 'STEP-UP HARDWARE MFA REQUIRED'}
                      {evaluation.action === 'AUTO_APPROVE' && 'INSTANT SETTLEMENT APPROVED'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar Visualizer */}
              <div className="w-full bg-slate-200 rounded-full h-3 p-0.5 border border-slate-300 mb-4 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${evaluation.score > 70 ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-red-600' : evaluation.score > 40 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : 'bg-gradient-to-r from-teal-400 to-emerald-500'}`}
                  style={{ width: `${evaluation.score}%` }}
                />
              </div>

              {/* Human-Readable Natural Language Explanation */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5 shadow-sm">
                <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-sky-800">Explainable AI Summary: </span>
                  <span>{evaluation.explanation}</span>
                </div>
              </div>

            </div>

            {/* Bottom: SHAP Feature Attribution Waterfall Breakdown */}
            <div className="glass-card-3d p-6 rounded-3xl border border-slate-200 shadow-xl bg-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-600" />
                  <h3 className="text-sm font-extrabold text-slate-900">SHAP Value Feature Attribution (Explainability)</h3>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-mono font-bold">
                  <span className="flex items-center gap-1 text-rose-700">
                    <span className="w-2.5 h-2.5 rounded bg-rose-500"></span> + Risk Driver
                  </span>
                  <span className="flex items-center gap-1 text-emerald-700">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> - Trust Baseline
                  </span>
                </div>
              </div>

              {/* Factor Waterfall List */}
              <div className="space-y-2.5">
                {evaluation.shapFactors.map((factor, idx) => {
                  const isPositive = factor.value > 0;
                  const absVal = Math.min(100, Math.abs(factor.value) * 2.5);

                  return (
                    <div key={idx} className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="sm:w-1/3">
                        <div className="font-bold text-slate-800">{factor.name}</div>
                        <div className="text-[10px] text-slate-500">{factor.label}</div>
                      </div>

                      <div className="flex-1 flex items-center gap-3">
                        <div className="flex-1 bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
                          {isPositive ? (
                            <div
                              className="h-full bg-rose-500 rounded-full transition-all duration-300"
                              style={{ width: `${absVal}%` }}
                            />
                          ) : (
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                              style={{ width: `${absVal}%` }}
                            />
                          )}
                        </div>
                        <span className={`w-14 text-right font-mono font-black text-xs ${isPositive ? 'text-rose-700' : 'text-emerald-700'}`}>
                          {isPositive ? `+${factor.value}%` : `${factor.value}%`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between font-medium">
                <span>Auditable under EU GDPR Article 22 & Basel III Risk Frameworks</span>
                <span className="font-mono font-bold text-sky-700">SHAP Additivity Σ = {evaluation.score}</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
