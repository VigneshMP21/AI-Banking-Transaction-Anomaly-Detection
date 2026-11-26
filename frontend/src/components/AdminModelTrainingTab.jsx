import React, { useEffect, useId, useState } from 'react';
import {
  UploadCloud,
  Database,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Play,
  Layers,
  Download,
  Sparkles,
  RefreshCw,
  FileSpreadsheet,
  ArrowRight,
} from 'lucide-react';

const MODEL_CATALOG = [
  {
    key: 'xgboost',
    name: 'XGBoost Gradient Booster',
    badge: 'Supervised + TreeSHAP',
    description: 'High-precision tabular classifier with exact TreeSHAP per-transaction explanations.',
  },
  {
    key: 'lightgbm',
    name: 'LightGBM Leaf-Wise Ensemble',
    badge: 'Supervised Fast',
    description: 'Low-latency leaf-wise GBDT calibrated for high-throughput UPI & IMPS streams.',
  },
  {
    key: 'isolation_forest',
    name: 'Isolation Forest Detector',
    badge: 'Unsupervised Outlier',
    description: 'Isolates zero-day structural anomalies without relying strictly on fraud labels.',
  },
  {
    key: 'autoencoder',
    name: 'PyTorch Deep Autoencoder',
    badge: 'Deep Learning (MSE)',
    description: 'Neural bottleneck trained on normal Indian banking flows to catch reconstruction spikes.',
  },
];

export default function AdminModelTrainingTab({ token, API_BASE_URL, onJumpToTesting }) {
  const formId = useId();
  const [sourceMode, setSourceMode] = useState('upload'); // 'upload' | 'synthetic'
  const [csvFile, setCsvFile] = useState(null);
  const [syntheticRows, setSyntheticRows] = useState(4000);
  const [fraudRatio, setFraudRatio] = useState(0.06);

  const [inspection, setInspection] = useState(null);
  const [inspectLoading, setInspectLoading] = useState(false);

  const [targetCol, setTargetCol] = useState('is_fraud');
  const [selectedModels, setSelectedModels] = useState([
    'xgboost',
    'lightgbm',
    'isolation_forest',
    'autoencoder',
  ]);
  const [useSmote, setUseSmote] = useState(true);
  const [testSize, setTestSize] = useState(0.2);
  const [autoActivate, setAutoActivate] = useState(true);

  const [training, setTraining] = useState(false);
  const [trainResult, setTrainResult] = useState(null);
  const [registry, setRegistry] = useState({ active_version: null, versions: [] });
  const [activatingId, setActivatingId] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);

  const loadRegistry = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ml/models`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRegistry(data);
      }
    } catch {
      // ignore initial offline retry
    }
  };

  useEffect(() => {
    loadRegistry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownloadSampleCsv = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/ml/dataset/sample-csv?rows=3000&fraud_ratio=0.06`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Failed to generate sample CSV');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bankguard_indian_banking_3000.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  const handleInspectDataset = async (overrideMode = sourceMode, overrideFile = csvFile) => {
    if (overrideMode === 'upload' && !overrideFile) {
      setStatusMessage({ type: 'error', text: 'Please select a .csv dataset file first.' });
      return;
    }

    setInspectLoading(true);
    setStatusMessage(null);
    try {
      const fd = new FormData();
      if (overrideMode === 'synthetic') {
        fd.append('use_synthetic', 'true');
        fd.append('synthetic_rows', String(syntheticRows));
        fd.append('fraud_ratio', String(fraudRatio));
      } else {
        fd.append('use_synthetic', 'false');
        fd.append('file', overrideFile);
      }

      const res = await fetch(`${API_BASE_URL}/api/ml/dataset/inspect`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Dataset inspection failed');

      setInspection(data);
      if (data.detected_target) {
        setTargetCol(data.detected_target);
      } else if (data.columns?.length) {
        setTargetCol('');
      }
      setStatusMessage({
        type: 'success',
        text: `Validated ${data.rows.toLocaleString('en-IN')} rows × ${data.cols} columns (${data.dataset_name}).`,
      });
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setInspectLoading(false);
    }
  };

  const toggleModel = (key) => {
    setSelectedModels((prev) =>
      prev.includes(key) ? (prev.length > 1 ? prev.filter((k) => k !== key) : prev) : [...prev, key]
    );
  };

  const handleTrainSubmit = async (e) => {
    e.preventDefault();
    if (sourceMode === 'upload' && !csvFile) {
      setStatusMessage({
        type: 'error',
        text: 'Select a CSV dataset or switch to the Indian Synthetic Benchmark generator.',
      });
      return;
    }

    setTraining(true);
    setStatusMessage(null);
    try {
      const fd = new FormData();
      if (sourceMode === 'synthetic') {
        fd.append('use_synthetic', 'true');
        fd.append('synthetic_rows', String(syntheticRows));
        fd.append('fraud_ratio', String(fraudRatio));
      } else {
        fd.append('use_synthetic', 'false');
        fd.append('file', csvFile);
      }
      if (targetCol) fd.append('target_col', targetCol);
      fd.append('models_json', JSON.stringify(selectedModels));
      fd.append('use_smote', useSmote ? 'true' : 'false');
      fd.append('test_size', String(testSize));
      fd.append('activate', autoActivate ? 'true' : 'false');

      const res = await fetch(`${API_BASE_URL}/api/ml/train`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Training pipeline failed');

      setTrainResult(data);
      await loadRegistry();
      setStatusMessage({
        type: 'success',
        text: `Trained ${data.version_id} in multi-model Hybrid Pipeline (${data.train_rows.toLocaleString('en-IN')} train / ${data.test_rows.toLocaleString('en-IN')} holdout).`,
      });
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setTraining(false);
    }
  };

  const handleActivateVersion = async (versionId) => {
    setActivatingId(versionId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ml/models/${encodeURIComponent(versionId)}/activate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Activation failed');
      setRegistry(data);
      setStatusMessage({
        type: 'success',
        text: `Activated ${versionId} for live portal scoring & Model Testing Lab.`,
      });
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setActivatingId('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 text-[#0052CC] text-[11px] font-bold mb-2">
            <Cpu className="w-3.5 h-3.5" />
            <span>ADMIN MODEL TRAINING STUDIO (OPEN-SOURCE STACK)</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Dataset Ingestion &amp; Multi-Model Training Pipeline
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload your custom CSV transaction dataset or build a realistic Indian UPI/IMPS/NEFT/RTGS benchmark to train XGBoost, LightGBM, Isolation Forest, and PyTorch Deep Autoencoder.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleDownloadSampleCsv}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#0052CC]" />
            <span>Download Sample Indian CSV</span>
          </button>
          {onJumpToTesting && (
            <button
              type="button"
              onClick={onJumpToTesting}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
            >
              <span>Open Testing Lab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Live Status Banner */}
      {statusMessage && (
        <div
          role="status"
          aria-live="polite"
          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-semibold border ${
            statusMessage.type === 'error'
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}
        >
          {statusMessage.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Training Configuration Form */}
      <form
        onSubmit={handleTrainSubmit}
        aria-labelledby={`${formId}-heading`}
        className="grid grid-cols-1 xl:grid-cols-3 gap-6"
        style={{ accentColor: '#0052CC' }}
      >
        <h3 id={`${formId}-heading`} className="sr-only">
          Model Training Pipeline Configuration
        </h3>

        {/* Step 1: Dataset Upload / Generator */}
        <div className="xl:col-span-2 space-y-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-[#0052CC]" />
              <span>1. Training Dataset Source</span>
            </h3>
            <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSourceMode('upload')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  sourceMode === 'upload' ? 'bg-white text-[#0052CC] shadow-xs' : 'text-slate-600'
                }`}
              >
                Upload CSV File
              </button>
              <button
                type="button"
                onClick={() => setSourceMode('synthetic')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  sourceMode === 'synthetic' ? 'bg-white text-[#0052CC] shadow-xs' : 'text-slate-600'
                }`}
              >
                Indian Synthetic Generator
              </button>
            </div>
          </div>

          {sourceMode === 'upload' ? (
            <div className="space-y-3">
              <label
                htmlFor={`${formId}-csv-input`}
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#0052CC] bg-slate-50/70 hover:bg-blue-50/30 p-6 text-center cursor-pointer transition-colors"
              >
                <UploadCloud className="w-8 h-8 text-[#0052CC] mb-2" />
                <span className="text-sm font-bold text-slate-800">
                  {csvFile ? csvFile.name : 'Choose a .CSV transaction dataset to inspect & train'}
                </span>
                <span className="text-[11px] text-slate-500 mt-1">
                  {csvFile
                    ? `${(csvFile.size / 1024).toFixed(1)} KB ready • Click to replace file`
                    : 'Supports any tabular banking CSV (amount, velocity, geo_distance, channel, is_fraud/Class)'}
                </span>
                <input
                  id={`${formId}-csv-input`}
                  name="dataset_file"
                  type="file"
                  accept=".csv,text/csv"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setCsvFile(f);
                    if (f) handleInspectDataset('upload', f);
                  }}
                />
              </label>
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  disabled={!csvFile || inspectLoading}
                  onClick={() => handleInspectDataset('upload', csvFile)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>{inspectLoading ? 'Inspecting...' : 'Re-Inspect Schema'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div>
                <label
                  htmlFor={`${formId}-syn-rows`}
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Rows (INR Banking Flows)
                </label>
                <select
                  id={`${formId}-syn-rows`}
                  name="synthetic_rows"
                  value={syntheticRows}
                  onChange={(e) => setSyntheticRows(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
                >
                  <option value={2000}>2,000 rows (Fast ~3s)</option>
                  <option value={4000}>4,000 rows (Standard ~5s)</option>
                  <option value={8000}>8,000 rows (Deep ~9s)</option>
                  <option value={12000}>12,000 rows (Heavy ~14s)</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor={`${formId}-fraud-ratio`}
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Fraud Contamination Ratio
                </label>
                <select
                  id={`${formId}-fraud-ratio`}
                  name="fraud_ratio"
                  value={fraudRatio}
                  onChange={(e) => setFraudRatio(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
                >
                  <option value={0.03}>3% Realistic Imbalance</option>
                  <option value={0.06}>6% Standard Banking</option>
                  <option value={0.12}>12% High-Attack Stress</option>
                </select>
              </div>
              <button
                type="button"
                disabled={inspectLoading}
                onClick={() => handleInspectDataset('synthetic', null)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0052CC] text-xs font-bold cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{inspectLoading ? 'Generating...' : 'Preview Generated Schema'}</span>
              </button>
            </div>
          )}

          {/* Schema & Class Balance Inspector Preview */}
          {inspection && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-800">
                  Dataset Schema &amp; Class Distribution ({inspection.dataset_name})
                </span>
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {inspection.rows.toLocaleString('en-IN')} Rows
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {inspection.cols} Columns
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700">
                    Missing Cells: {inspection.missing_cells}
                  </span>
                  {inspection.class_balance && (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700">
                      Fraud Rate: {inspection.class_balance.fraud_pct}% ({inspection.class_balance.fraud_count} fraud)
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor={`${formId}-target-col`}
                    className="block text-[11px] font-semibold text-slate-600 mb-1"
                  >
                    Target Label Column (leave empty for pure Unsupervised mode)
                  </label>
                  <select
                    id={`${formId}-target-col`}
                    name="target_col"
                    value={targetCol}
                    onChange={(e) => setTargetCol(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
                  >
                    <option value="">-- Unsupervised (No Target Label) --</option>
                    {inspection.columns.map((c) => (
                      <option key={c} value={c}>
                        {c} ({inspection.dtypes[c]})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <div className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-[11px] text-slate-600">
                    <span className="font-bold text-slate-800">Auto-Encoded Numerics: </span>
                    Categoricals (UPI/NEFT/IMPS, locations) are safely Label-Encoded during fit.
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto max-h-40 rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead className="bg-slate-50 text-slate-500 uppercase sticky top-0">
                    <tr>
                      {inspection.columns.slice(0, 9).map((col) => (
                        <th key={col} className="px-2.5 py-1.5 font-semibold border-b border-slate-200">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inspection.sample_rows.slice(0, 4).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        {inspection.columns.slice(0, 9).map((col) => (
                          <td key={col} className="px-2.5 py-1.5 text-slate-700 whitespace-nowrap">
                            {String(row[col] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Model Selection & Hyperparameters */}
        <div className="space-y-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#0052CC]" />
              <span>2. Ensemble &amp; Preprocessing</span>
            </h3>

            <fieldset className="space-y-2">
              <legend className="text-xs font-semibold text-slate-700 mb-1.5">
                Select Algorithms to Train
              </legend>
              {MODEL_CATALOG.map((m) => {
                const checked = selectedModels.includes(m.key);
                return (
                  <label
                    key={m.key}
                    htmlFor={`${formId}-model-${m.key}`}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                      checked
                        ? 'border-[#0052CC]/50 bg-blue-50/40'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      id={`${formId}-model-${m.key}`}
                      name="models"
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleModel(m.key)}
                      className="mt-0.5 h-4 w-4 shrink-0"
                    />
                    <span className="text-xs">
                      <span className="font-bold text-slate-900 block">
                        {m.name}{' '}
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 ml-1">
                          {m.badge}
                        </span>
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        {m.description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </fieldset>

            <div className="pt-2 border-t border-slate-100 space-y-2.5">
              <label
                htmlFor={`${formId}-smote`}
                className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                <input
                  id={`${formId}-smote`}
                  name="use_smote"
                  type="checkbox"
                  checked={useSmote}
                  onChange={(e) => setUseSmote(e.target.checked)}
                  className="h-4 w-4"
                />
                <span>Apply SMOTE Class Balancing (for rare fraud samples)</span>
              </label>

              <label
                htmlFor={`${formId}-activate`}
                className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                <input
                  id={`${formId}-activate`}
                  name="activate"
                  type="checkbox"
                  checked={autoActivate}
                  onChange={(e) => setAutoActivate(e.target.checked)}
                  className="h-4 w-4"
                />
                <span>Promote &amp; Activate Ensemble immediately</span>
              </label>

              <div>
                <label
                  htmlFor={`${formId}-split`}
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Holdout Test Split ({Math.round((1 - testSize) * 100)}% Train / {Math.round(testSize * 100)}% Test)
                </label>
                <select
                  id={`${formId}-split`}
                  name="test_size"
                  value={testSize}
                  onChange={(e) => setTestSize(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
                >
                  <option value={0.15}>85% Train / 15% Holdout Test</option>
                  <option value={0.2}>80% Train / 20% Holdout Test (Recommended)</option>
                  <option value={0.25}>75% Train / 25% Holdout Test</option>
                  <option value={0.3}>70% Train / 30% Holdout Test</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={training}
            className="w-full mt-4 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#0052CC] hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold shadow-sm cursor-pointer transition-colors"
          >
            {training ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Training Pipeline Running...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Train Hybrid ML/DL Pipeline</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Immediate Post-Train Metrics Summary */}
      {trainResult && (
        <div className="bg-white rounded-2xl border border-emerald-200/90 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                LATEST TRAINING RUN COMPLETED
              </span>
              <h3 className="text-base font-bold text-slate-900">
                {trainResult.version_id} • {trainResult.dataset_name}
              </h3>
            </div>
            {onJumpToTesting && (
              <button
                type="button"
                onClick={onJumpToTesting}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
              >
                <span>Inspect Full Evaluation &amp; Stress-Tests</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[11px] uppercase">
                  <th className="py-2 px-3">Model</th>
                  <th className="py-2 px-3">ROC-AUC</th>
                  <th className="py-2 px-3">PR-AUC</th>
                  <th className="py-2 px-3">Precision</th>
                  <th className="py-2 px-3">Recall</th>
                  <th className="py-2 px-3">F1-Score</th>
                  <th className="py-2 px-3">FPR</th>
                  <th className="py-2 px-3">Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trainResult.leaderboard.map((row) => (
                  <tr key={row.model_key} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{row.model_name}</td>
                    <td className="py-2.5 px-3 font-semibold text-[#0052CC]">{row.roc_auc}%</td>
                    <td className="py-2.5 px-3 font-semibold">{row.pr_auc}%</td>
                    <td className="py-2.5 px-3">{row.precision}%</td>
                    <td className="py-2.5 px-3">{row.recall}%</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-700">{row.f1}%</td>
                    <td className="py-2.5 px-3">{row.fpr}%</td>
                    <td className="py-2.5 px-3 text-slate-500">{row.latency_ms} ms/tx</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Versioned Model Artifact Registry */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Model Version Registry</h3>
            <p className="text-xs text-slate-500">
              Switch or rollback the active scoring ensemble used across transfers &amp; Testing Lab.
            </p>
          </div>
          <button
            type="button"
            onClick={loadRegistry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {registry.versions.length === 0 ? (
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-6 text-center text-xs text-slate-500">
            No trained model versions found yet. Run the pipeline above using an uploaded CSV or Indian Synthetic Generator.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[11px] uppercase">
                  <th className="py-2 px-3">Version ID</th>
                  <th className="py-2 px-3">Dataset</th>
                  <th className="py-2 px-3">Rows (Train/Test)</th>
                  <th className="py-2 px-3">Features</th>
                  <th className="py-2 px-3">Ensemble ROC / F1</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {registry.versions.map((ver) => {
                  const isActive = registry.active_version === ver.version_id;
                  const ens = ver.leaderboard?.find((m) => m.model_key === 'ensemble') || ver.leaderboard?.[0];
                  return (
                    <tr key={ver.version_id} className={isActive ? 'bg-blue-50/40' : 'hover:bg-slate-50'}>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{ver.version_id}</td>
                      <td className="py-2.5 px-3 text-slate-700">{ver.dataset_name}</td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {ver.train_rows?.toLocaleString('en-IN')} / {ver.test_rows?.toLocaleString('en-IN')}
                        {ver.smote_applied && (
                          <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold">
                            SMOTE
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[11px] text-slate-600">
                          {ver.feature_names?.length || 0} cols{' '}
                          {ver.is_canonical_schema && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">
                              Portal-Ready
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {ens ? `${ens.roc_auc}% / ${ens.f1}%` : 'Unsupervised'}
                      </td>
                      <td className="py-2.5 px-3">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={activatingId === ver.version_id}
                            onClick={() => handleActivateVersion(ver.version_id)}
                            className="px-3 py-1 rounded-lg bg-[#0052CC] hover:bg-blue-700 disabled:opacity-50 text-white text-[11px] font-semibold cursor-pointer"
                          >
                            {activatingId === ver.version_id ? 'Activating...' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
