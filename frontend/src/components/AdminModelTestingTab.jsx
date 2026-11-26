import React, { useEffect, useId, useMemo, useState } from 'react';
import {
  FlaskConical,
  BarChart3,
  UploadCloud,
  ShieldAlert,
  Sliders,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  RefreshCw,
  Play,
  ArrowRight,
  Zap,
} from 'lucide-react';

const TEST_MODES = [
  { id: 'holdout', label: 'Holdout Leaderboard & Matrix', icon: BarChart3 },
  { id: 'batch', label: 'Batch CSV Blind Test', icon: UploadCloud },
  { id: 'adversarial', label: 'Adversarial Attack Suite', icon: ShieldAlert },
  { id: 'threshold', label: 'Threshold & Drift Lab', icon: Sliders },
];

export default function AdminModelTestingTab({ token, API_BASE_URL, onJumpToTraining }) {
  const formId = useId();
  const [mode, setMode] = useState('holdout');
  const [registry, setRegistry] = useState({ active_version: null, versions: [] });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Mode 2: Batch CSV
  const [batchFile, setBatchFile] = useState(null);
  const [batchThreshold, setBatchThreshold] = useState(0.5);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchResult, setBatchResult] = useState(null);

  // Mode 3: Adversarial
  const [advLoading, setAdvLoading] = useState(false);
  const [advResult, setAdvResult] = useState(null);

  // Mode 4: Threshold simulator + PSI Drift
  const [simStepUp, setSimStepUp] = useState(45);
  const [simBlock, setSimBlock] = useState(75);
  const [driftData, setDriftData] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [modRes, driftRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/ml/models`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/ml/test/drift`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      if (modRes.ok) {
        setRegistry(await modRes.json());
      }
      if (driftRes.ok) {
        setDriftData(await driftRes.json());
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load model evaluation metadata');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeModelMeta = useMemo(() => {
    if (!registry.versions?.length) return null;
    return (
      registry.versions.find((v) => v.version_id === registry.active_version) || registry.versions[0]
    );
  }, [registry]);

  const ensembleMetrics = useMemo(() => {
    if (!activeModelMeta?.leaderboard?.length) return null;
    return (
      activeModelMeta.leaderboard.find((m) => m.model_key === 'ensemble') ||
      activeModelMeta.leaderboard[0]
    );
  }, [activeModelMeta]);

  const handleBatchTest = async (e) => {
    e.preventDefault();
    if (!batchFile) {
      setErrorMsg('Please select a test .csv file before running batch evaluation.');
      return;
    }
    setBatchLoading(true);
    setErrorMsg('');
    try {
      const fd = new FormData();
      fd.append('file', batchFile);
      fd.append('threshold', String(batchThreshold));
      const res = await fetch(`${API_BASE_URL}/api/ml/test/batch-csv`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Batch CSV evaluation failed');
      setBatchResult(data);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setBatchLoading(false);
    }
  };

  const handleDownloadScoredCsv = () => {
    if (!batchResult?.scored_csv) return;
    const blob = new Blob([batchResult.scored_csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scored_${batchResult.filename || 'batch.csv'}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleRunAdversarial = async () => {
    setAdvLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/ml/test/adversarial`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Adversarial stress-test failed');
      setAdvResult(data);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setAdvLoading(false);
    }
  };

  const interpolatedPoint = useMemo(() => {
    const curve = activeModelMeta?.threshold_curve || [];
    if (!curve.length) return null;
    return curve.reduce((best, curr) =>
      Math.abs(curr.threshold - simStepUp) < Math.abs(best.threshold - simStepUp) ? curr : best
    );
  }, [activeModelMeta, simStepUp]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-xs font-semibold text-slate-500">
        Loading active ML/DL artifacts &amp; holdout telemetry...
      </div>
    );
  }

  if (!activeModelMeta) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
        <FlaskConical className="w-10 h-10 text-[#0052CC] mx-auto" />
        <h3 className="text-base font-bold text-slate-900">No Trained ML Model Active Yet</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Train your first XGBoost + LightGBM + Isolation Forest + PyTorch Autoencoder ensemble in Model Training Studio to unlock empirical metrics, blind batch testing, and adversarial probes.
        </p>
        {onJumpToTraining && (
          <button
            type="button"
            onClick={onJumpToTraining}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
          >
            <span>Go to Model Training Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Mode Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold mb-1.5">
              <FlaskConical className="w-3.5 h-3.5" />
              <span>MULTI-MODE MODEL TESTING &amp; EVALUATION LAB</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Active Model: <span className="font-mono text-[#0052CC]">{activeModelMeta.version_id}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Dataset: {activeModelMeta.dataset_name} • Features: {activeModelMeta.feature_names?.length} • Trained on{' '}
              {activeModelMeta.train_rows?.toLocaleString('en-IN')} rows ({activeModelMeta.test_rows?.toLocaleString('en-IN')} holdout)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadData}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
            {onJumpToTraining && (
              <button
                type="button"
                onClick={onJumpToTraining}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
              >
                <span>Train New Version</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          {TEST_MODES.map((m) => {
            const Icon = m.icon;
            const active = mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                  active
                    ? 'bg-[#0052CC] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700"
        >
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* MODE 1: Holdout Leaderboard, Confusion Matrix & TreeSHAP Global Importance */}
      {mode === 'holdout' && (
        <div className="space-y-6">
          {/* KPI Strip */}
          {ensembleMetrics && (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: 'Ensemble ROC-AUC', value: `${ensembleMetrics.roc_auc}%`, sub: 'Discrimination curve' },
                { label: 'PR-AUC (Imbalance)', value: `${ensembleMetrics.pr_auc}%`, sub: 'Precision-Recall integral' },
                { label: 'F1 Score', value: `${ensembleMetrics.f1}%`, sub: `Prec ${ensembleMetrics.precision}% / Rec ${ensembleMetrics.recall}%` },
                { label: 'False Positive Rate', value: `${ensembleMetrics.fpr}%`, sub: 'Customer friction index' },
                { label: 'Inference Latency', value: `${ensembleMetrics.latency_ms} ms`, sub: 'Per-transaction SLA' },
              ].map((kpi) => (
                <div key={kpi.label} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                  <div className="text-[11px] font-semibold text-slate-500">{kpi.label}</div>
                  <div className="text-2xl font-extrabold text-slate-900 mt-1">{kpi.value}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{kpi.sub}</div>
                </div>
              ))}
            </div>
          )}

          {/* Confusion Matrix + Global SHAP */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {ensembleMetrics?.confusion_matrix && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Holdout Confusion Matrix</h3>
                  <p className="text-xs text-slate-500">
                    Empirical predictions evaluated on unseen {activeModelMeta.test_rows} holdout rows.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                    <div className="text-[11px] font-bold text-emerald-700 uppercase">True Negative (TN)</div>
                    <div className="text-2xl font-extrabold text-emerald-900 mt-1">
                      {ensembleMetrics.confusion_matrix.tn}
                    </div>
                    <div className="text-[11px] text-emerald-700">Legitimate auto-cleared</div>
                  </div>
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                    <div className="text-[11px] font-bold text-amber-700 uppercase">False Positive (FP)</div>
                    <div className="text-2xl font-extrabold text-amber-900 mt-1">
                      {ensembleMetrics.confusion_matrix.fp}
                    </div>
                    <div className="text-[11px] text-amber-700">False step-up challenge</div>
                  </div>
                  <div className="rounded-xl bg-rose-50 border border-rose-200 p-4">
                    <div className="text-[11px] font-bold text-rose-700 uppercase">False Negative (FN)</div>
                    <div className="text-2xl font-extrabold text-rose-900 mt-1">
                      {ensembleMetrics.confusion_matrix.fn}
                    </div>
                    <div className="text-[11px] text-rose-700">Missed fraud escape</div>
                  </div>
                  <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
                    <div className="text-[11px] font-bold text-[#0052CC] uppercase">True Positive (TP)</div>
                    <div className="text-2xl font-extrabold text-slate-900 mt-1">
                      {ensembleMetrics.confusion_matrix.tp}
                    </div>
                    <div className="text-[11px] text-[#0052CC]">Caught fraud attacks</div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Global TreeSHAP Feature Importance</h3>
                <p className="text-xs text-slate-500">Mean |SHAP| weight driving ensemble predictions.</p>
              </div>
              <div className="space-y-2.5 pt-1">
                {(() => {
                  const shapList = activeModelMeta.global_shap || [];
                  const maxImp = Math.max(0.001, ...shapList.map((s) => Number(s.importance || 0)));
                  return shapList.map((item, idx) => {
                    const pct = Math.min(100, Math.round((Number(item.importance || 0) / maxImp) * 100));
                    return (
                      <div key={item.feature} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700">{item.feature}</span>
                          <span className="font-mono text-slate-600">{item.importance}</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              idx === 0 ? 'bg-[#0052CC]' : idx === 1 ? 'bg-blue-500' : 'bg-slate-500'
                            }`}
                            style={{ width: `${Math.max(4, pct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>

          {/* Model Comparison Leaderboard */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Head-to-Head Model Leaderboard</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-[11px] uppercase">
                    <th className="py-2 px-3">Algorithm</th>
                    <th className="py-2 px-3">ROC-AUC</th>
                    <th className="py-2 px-3">PR-AUC</th>
                    <th className="py-2 px-3">Precision</th>
                    <th className="py-2 px-3">Recall</th>
                    <th className="py-2 px-3">F1 Score</th>
                    <th className="py-2 px-3">FPR</th>
                    <th className="py-2 px-3">Avg Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(activeModelMeta.leaderboard || []).map((m) => (
                    <tr
                      key={m.model_key}
                      className={m.model_key === 'ensemble' ? 'bg-blue-50/40 font-semibold' : 'hover:bg-slate-50'}
                    >
                      <td className="py-2.5 px-3 font-bold text-slate-900">{m.model_name}</td>
                      <td className="py-2.5 px-3 text-[#0052CC] font-bold">{m.roc_auc}%</td>
                      <td className="py-2.5 px-3">{m.pr_auc}%</td>
                      <td className="py-2.5 px-3">{m.precision}%</td>
                      <td className="py-2.5 px-3">{m.recall}%</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-700">{m.f1}%</td>
                      <td className="py-2.5 px-3">{m.fpr}%</td>
                      <td className="py-2.5 px-3 text-slate-500">{m.latency_ms} ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Holdout Sample Inspector */}
          {activeModelMeta.holdout_samples?.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900">
                Holdout Sample Case Inspector (Model-vs-Model Disagreement Check)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-[11px] uppercase">
                      <th className="py-2 px-3">Sample #</th>
                      <th className="py-2 px-3">Amount / Primary</th>
                      <th className="py-2 px-3">True Label</th>
                      <th className="py-2 px-3">Ensemble Score</th>
                      <th className="py-2 px-3">Per-Model Probabilities</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeModelMeta.holdout_samples.map((s) => (
                      <tr key={s.sample_index} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-mono text-slate-600">#{s.sample_index}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900">
                          {s.primary_amount ? `₹${Number(s.primary_amount).toLocaleString('en-IN')}` : '-'}
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              s.actual_label === 1
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {s.actual_label === 1 ? 'FRAUD (1)' : 'NORMAL (0)'}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-extrabold text-[#0052CC]">{s.ensemble_score}%</td>
                        <td className="py-2 px-3 text-[11px] text-slate-600 space-x-2">
                          {Object.entries(s.model_scores || {}).map(([k, v]) => (
                            <span key={k} className="inline-block px-2 py-0.5 rounded bg-slate-100">
                              {k}: <strong>{v}%</strong>
                            </span>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: Batch CSV Blind Test */}
      {mode === 'batch' && (
        <div className="space-y-6">
          <form
            onSubmit={handleBatchTest}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4"
            style={{ accentColor: '#0052CC' }}
          >
            <div>
              <h3 className="text-sm font-bold text-slate-900">Batch CSV Blind Evaluation</h3>
              <p className="text-xs text-slate-500">
                Upload a separate holdout or unlabeled transaction `.csv` matching active model features ({activeModelMeta.feature_names?.join(', ')}). If a label column exists, empirical Confusion Matrix &amp; F1 are computed automatically.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-2">
                <label htmlFor={`${formId}-batch-file`} className="block text-xs font-semibold text-slate-700 mb-1">
                  Test Dataset CSV File
                </label>
                <input
                  id={`${formId}-batch-file`}
                  name="batch_file"
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => setBatchFile(e.target.files?.[0] || null)}
                  className="block w-full text-xs text-slate-700 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-[#0052CC] hover:file:bg-blue-100 border border-slate-300 rounded-xl p-1.5"
                />
              </div>

              <div>
                <label htmlFor={`${formId}-batch-thresh`} className="block text-xs font-semibold text-slate-700 mb-1">
                  Flag Probability Cutoff: {(batchThreshold * 100).toFixed(0)}%
                </label>
                <input
                  id={`${formId}-batch-thresh`}
                  name="threshold"
                  type="range"
                  min={0.1}
                  max={0.9}
                  step={0.05}
                  value={batchThreshold}
                  onChange={(e) => setBatchThreshold(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              {batchResult?.scored_csv && (
                <button
                  type="button"
                  onClick={handleDownloadScoredCsv}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#0052CC]" />
                  <span>Download Scored CSV</span>
                </button>
              )}
              <button
                type="submit"
                disabled={batchLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0052CC] hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{batchLoading ? 'Scoring Batch...' : 'Score & Evaluate Batch CSV'}</span>
              </button>
            </div>
          </form>

          {batchResult && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
                  <div className="text-[11px] font-semibold text-slate-500">Rows Scored</div>
                  <div className="text-xl font-extrabold text-slate-900">
                    {batchResult.total_rows.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="rounded-xl bg-amber-50 p-3.5 border border-amber-200">
                  <div className="text-[11px] font-semibold text-amber-700">Flagged (&ge; {Math.round(batchResult.threshold_used * 100)}%)</div>
                  <div className="text-xl font-extrabold text-amber-900">
                    {batchResult.flagged_count} ({batchResult.anomaly_rate_pct}%)
                  </div>
                </div>
                <div className="rounded-xl bg-rose-50 p-3.5 border border-rose-200">
                  <div className="text-[11px] font-semibold text-rose-700">Blocked (&ge; 75%)</div>
                  <div className="text-xl font-extrabold text-rose-900">{batchResult.blocked_count}</div>
                </div>
                <div className="rounded-xl bg-blue-50 p-3.5 border border-blue-200">
                  <div className="text-[11px] font-semibold text-[#0052CC]">
                    {batchResult.has_labels ? 'Labeled Blind F1 / ROC' : 'Mode'}
                  </div>
                  <div className="text-xl font-extrabold text-slate-900">
                    {batchResult.has_labels
                      ? `${batchResult.metrics.f1}% / ${batchResult.metrics.roc_auc}%`
                      : 'Unlabeled Inference'}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto max-h-80 rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead className="bg-slate-50 text-slate-500 uppercase sticky top-0">
                    <tr>
                      {batchResult.preview_columns.map((c) => (
                        <th key={c} className="px-3 py-2 border-b border-slate-200">
                          {c}
                        </th>
                      ))}
                      <th className="px-3 py-2 border-b border-slate-200">Risk Score</th>
                      <th className="px-3 py-2 border-b border-slate-200">Decision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {batchResult.preview_rows.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        {batchResult.preview_columns.map((c) => (
                          <td key={c} className="px-3 py-1.5 whitespace-nowrap text-slate-700">
                            {String(r[c] ?? '')}
                          </td>
                        ))}
                        <td className="px-3 py-1.5 font-extrabold text-slate-900">
                          {r.predicted_risk_score}%
                        </td>
                        <td className="px-3 py-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold ${
                              r.predicted_flag === 'BLOCKED_FROZEN'
                                ? 'bg-rose-100 text-rose-700'
                                : r.predicted_flag === 'STEP_UP_MFA'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {r.predicted_flag}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 3: 1-Click Adversarial Attack Stress-Test Suite */}
      {mode === 'adversarial' && (
        <div className="space-y-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                1-Click Indian Banking Adversarial &amp; Clean Regression Suite
              </h3>
              <p className="text-xs text-slate-500">
                Replays 6 real-world scenarios (Mumbai clean UPI, Jamtara SIM-swap, Chennai velocity smurfing, RTGS corporate wire, TOR proxy evasion, Delhi night ATM) against the active model with live TreeSHAP attributions.
              </p>
            </div>
            <button
              type="button"
              disabled={advLoading}
              onClick={handleRunAdversarial}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-xs font-bold cursor-pointer shrink-0"
            >
              <Zap className="w-4 h-4" />
              <span>{advLoading ? 'Running Probes...' : 'Run 6 Adversarial Scenarios'}</span>
            </button>
          </div>

          {advResult ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold">
                <span className="text-slate-700">Version: {advResult.version_id}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Passed: {advResult.passed} / {advResult.total} ({advResult.pass_rate}%)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(advResult.results || []).map((sc) => (
                  <div
                    key={sc.id}
                    className={`rounded-2xl border p-4 space-y-2 ${
                      sc.passed ? 'border-emerald-200 bg-emerald-50/20' : 'border-rose-200 bg-rose-50/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{sc.name}</h4>
                        <p className="text-[11px] text-slate-500">
                          Expected: <strong>{sc.expected}</strong> • Actual:{' '}
                          <strong className="text-[#0052CC]">{sc.predicted_decision}</strong> ({sc.risk_score}%)
                        </p>
                      </div>
                      {sc.passed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold shrink-0">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>PASS</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold shrink-0">
                          <XCircle className="w-3 h-3" />
                          <span>FAIL</span>
                        </span>
                      )}
                    </div>

                    {sc.model_breakdown && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {Object.entries(sc.model_breakdown).map(([mKey, mVal]) => (
                          <span
                            key={mKey}
                            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700"
                          >
                            {mKey}: <strong>{mVal}%</strong>
                          </span>
                        ))}
                      </div>
                    )}
                    {sc.top_reasons && (
                      <p className="text-[11px] text-slate-600">{sc.top_reasons}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-slate-50 border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500">
              Click <strong>Run 6 Adversarial Scenarios</strong> to verify precision vs recall under simulated attack payloads.
            </div>
          )}
        </div>
      )}

      {/* MODE 4: Threshold Calibration Simulator & PSI Drift Monitor */}
      {mode === 'threshold' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Threshold Calibration */}
          <div
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4"
            style={{ accentColor: '#0052CC' }}
          >
            <div>
              <h3 className="text-sm font-bold text-slate-900">Threshold Calibration Curve</h3>
              <p className="text-xs text-slate-500">
                Inspect empirical Precision / Recall / FPR trade-offs across holdout cutoffs before adjusting policy bounds.
              </p>
            </div>

            <div className="space-y-3 bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div>
                <label htmlFor={`${formId}-stepup`} className="block text-xs font-bold text-slate-800 mb-1">
                  Step-Up OTP Cutoff: {simStepUp}%
                </label>
                <input
                  id={`${formId}-stepup`}
                  type="range"
                  min={20}
                  max={70}
                  step={5}
                  value={simStepUp}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setSimStepUp(v);
                    if (simBlock <= v) setSimBlock(Math.min(95, v + 10));
                  }}
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor={`${formId}-block`} className="block text-xs font-bold text-slate-800 mb-1">
                  Auto-Block Cutoff: {simBlock}%
                </label>
                <input
                  id={`${formId}-block`}
                  type="range"
                  min={40}
                  max={95}
                  step={5}
                  value={simBlock}
                  onChange={(e) => setSimBlock(Math.max(simStepUp + 5, Number(e.target.value)))}
                  className="w-full"
                />
              </div>

              {interpolatedPoint && (
                <div className="grid grid-cols-4 gap-2 pt-2 text-center text-xs">
                  <div className="bg-white rounded-lg p-2 border border-slate-200">
                    <div className="text-[10px] text-slate-500">Precision</div>
                    <div className="font-bold text-slate-900">{interpolatedPoint.precision}%</div>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-slate-200">
                    <div className="text-[10px] text-slate-500">Recall</div>
                    <div className="font-bold text-[#0052CC]">{interpolatedPoint.recall}%</div>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-slate-200">
                    <div className="text-[10px] text-slate-500">F1</div>
                    <div className="font-bold text-emerald-700">{interpolatedPoint.f1}%</div>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-slate-200">
                    <div className="text-[10px] text-slate-500">FPR</div>
                    <div className="font-bold text-amber-700">{interpolatedPoint.fpr}%</div>
                  </div>
                </div>
              )}
            </div>

            {activeModelMeta.threshold_curve?.length > 1 && (() => {
              const curve = activeModelMeta.threshold_curve;
              const W = 420;
              const H = 160;
              const padL = 32;
              const padR = 14;
              const padT = 12;
              const padB = 24;
              const xOf = (i) => padL + (i / (curve.length - 1)) * (W - padL - padR);
              const yOf = (val) => padT + (1 - Math.max(0, Math.min(100, Number(val || 0))) / 100) * (H - padT - padB);
              const makePath = (key) =>
                curve.map((pt, i) => `${i === 0 ? 'M' : 'L'}${xOf(i).toFixed(1)},${yOf(pt[key]).toFixed(1)}`).join(' ');

              return (
                <div className="space-y-2">
                  <div className="flex items-center gap-4 text-[11px] font-semibold">
                    <span className="inline-flex items-center gap-1.5 text-[#0052CC]">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0052CC]" />
                      Precision %
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-emerald-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      Recall %
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-rose-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      FPR %
                    </span>
                  </div>
                  <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-44 overflow-visible">
                    {[0, 25, 50, 75, 100].map((v) => (
                      <g key={v}>
                        <line x1={padL} y1={yOf(v)} x2={W - padR} y2={yOf(v)} stroke="#e2e8f0" strokeDasharray="3 3" />
                        <text x={padL - 6} y={yOf(v) + 3} textAnchor="end" fontSize="9" fill="#64748b">
                          {v}
                        </text>
                      </g>
                    ))}
                    <path d={makePath('precision')} fill="none" stroke="#0052CC" strokeWidth="2.2" />
                    <path d={makePath('recall')} fill="none" stroke="#10b981" strokeWidth="2.2" />
                    <path d={makePath('fpr')} fill="none" stroke="#ef4444" strokeWidth="2.2" />
                    {curve.map((pt, i) => (
                      <text key={pt.threshold} x={xOf(i)} y={H - 4} textAnchor="middle" fontSize="9" fill="#64748b">
                        {pt.threshold}%
                      </text>
                    ))}
                  </svg>
                </div>
              );
            })()}
          </div>

          {/* Population Stability Index (PSI) Drift Monitor */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#0052CC]" />
                  <span>Population Stability Index (PSI) Drift</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Compares training distribution against live DB portal transactions ({driftData?.live_sample_count ?? 0} sampled).
                </p>
              </div>
              {driftData && (
                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    driftData.overall_status === 'RETRAIN_RECOMMENDED'
                      ? 'bg-rose-100 text-rose-700'
                      : driftData.overall_status === 'WARNING_MONITOR'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {driftData.overall_status} (PSI {driftData.overall_psi})
                </span>
              )}
            </div>

            {driftData && Array.isArray(driftData.features) && driftData.features.length > 0 ? (
              <div className="space-y-3">
                {driftData.features.map((info) => (
                  <div key={info.feature} className="rounded-xl border border-slate-200 p-3.5">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-800">{info.feature}</span>
                      <span className="font-mono font-semibold text-slate-700">
                        PSI = {info.psi} ({info.status})
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          info.psi >= 0.25
                            ? 'bg-rose-500'
                            : info.psi >= 0.1
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(6, info.psi * 200))}%` }}
                      />
                    </div>
                  </div>
                ))}
                <p className="text-[11px] text-slate-500">
                  PSI &lt; 0.10: Healthy • 0.10–0.25: Moderate Shift • &ge; 0.25: Significant Drift — schedule retraining in Training Studio.
                </p>
              </div>
            ) : (
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-6 text-center text-xs text-slate-500">
                Execute several transfers in the portal to accumulate live transactions for PSI drift comparison.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
