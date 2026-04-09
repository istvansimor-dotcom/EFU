import { useState, useEffect } from 'react';
import caseStudies, { DEFAULT_D, RACF_DEFAULT } from '../data/caseStudies.js';
import {
  calculateMROI,
  calculateFLR,
  detectParasitism,
  classifyMROI,
  FLR_PARASITISM_THRESHOLD,
} from '../logic/efu-engine.js';

const inputStyle = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '14px',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: '600',
  color: '#374151',
  marginBottom: '4px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const fieldGroupStyle = {
  marginBottom: '16px',
};

export default function Calculator() {
  const [selectedCaseStudyId, setSelectedCaseStudyId] = useState('custom');
  const [params, setParams] = useState({
    delta_e_saved: 10000,
    grid_co2: 0.35,
    racf: RACF_DEFAULT,
    jim30: 50,
    d_multiplier: DEFAULT_D,
    efu_input_direct: 10,
  });
  const [result, setResult] = useState(null);
  const [flrResult, setFlrResult] = useState(null);

  // When case study selection changes, load its params
  useEffect(() => {
    const study = caseStudies.find((s) => s.id === selectedCaseStudyId);
    if (study && study.params) {
      setParams({ ...study.params });
    }
  }, [selectedCaseStudyId]);

  // Auto-calculate whenever params change
  useEffect(() => {
    try {
      const r = calculateMROI(params);
      setResult(r);
      const f = calculateFLR(params);
      setFlrResult({ ...f, ...detectParasitism(f.flr) });
    } catch {
      setResult(null);
      setFlrResult(null);
    }
  }, [params]);

  function handleParamChange(key, value) {
    // Switching to custom when user edits any field
    setSelectedCaseStudyId('custom');
    setParams((prev) => ({ ...prev, [key]: parseFloat(value) || 0 }));
  }

  const selectedStudy = caseStudies.find((s) => s.id === selectedCaseStudyId);
  const classification = result ? classifyMROI(result.mroi) : null;

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '760px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', margin: '0 0 6px', color: '#111827' }}>
          EFU — MROI Calculator
        </h1>
        <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
          Metabolic Return on Investment · EFU Framework v5.1 · Based on MROI Working Paper v1.3 (Simor, 2026)
        </p>
      </div>

      {/* Case Study Selector */}
      <div style={{ marginBottom: '28px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '18px' }}>
        <label style={{ ...labelStyle, marginBottom: '8px', fontSize: '13px' }}>
          📋 Case Study Options
        </label>
        <select
          value={selectedCaseStudyId}
          onChange={(e) => setSelectedCaseStudyId(e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer', background: 'white' }}
        >
          {caseStudies.map((study) => (
            <option key={study.id} value={study.id}>
              {study.label}
            </option>
          ))}
        </select>
        {selectedStudy && selectedStudy.description && (
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '8px 0 0', lineHeight: '1.5' }}>
            {selectedStudy.description}
          </p>
        )}
        {selectedStudy && selectedStudy.source && (
          <p style={{ fontSize: '11px', color: '#9ca3af', margin: '4px 0 0', fontStyle: 'italic' }}>
            Source: {selectedStudy.source}
          </p>
        )}
      </div>

      {/* Input Parameters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>ΔE_saved (kWh/year)</label>
          <input
            type="number"
            value={params.delta_e_saved}
            onChange={(e) => handleParamChange('delta_e_saved', e.target.value)}
            style={inputStyle}
          />
          <span style={{ fontSize: '11px', color: '#9ca3af' }}>Energy savings vs. baseline counterfactual</span>
        </div>

        <div style={fieldGroupStyle}>
          <label style={labelStyle}>grid_CO₂ (kg CO₂/kWh)</label>
          <input
            type="number"
            step="0.01"
            value={params.grid_co2}
            onChange={(e) => handleParamChange('grid_co2', e.target.value)}
            style={inputStyle}
          />
          <span style={{ fontSize: '11px', color: '#9ca3af' }}>Regional grid carbon intensity (HU default: 0.35)</span>
        </div>

        <div style={fieldGroupStyle}>
          <label style={labelStyle}>RACF (kg CO₂/person/year)</label>
          <input
            type="number"
            value={params.racf}
            onChange={(e) => handleParamChange('racf', e.target.value)}
            style={inputStyle}
          />
          <span style={{ fontSize: '11px', color: '#9ca3af' }}>Reference Annual Carbon Flux (Hungary: 526)</span>
        </div>

        <div style={fieldGroupStyle}>
          <label style={labelStyle}>JIM-30 score (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={params.jim30}
            onChange={(e) => handleParamChange('jim30', e.target.value)}
            style={inputStyle}
          />
          <span style={{ fontSize: '11px', color: '#9ca3af' }}>Repairability index 0–100 (S1 Supplementary Materials)</span>
        </div>

        <div style={fieldGroupStyle}>
          <label style={labelStyle}>D — Debt Multiplier</label>
          <input
            type="number"
            step="0.05"
            value={params.d_multiplier}
            onChange={(e) => handleParamChange('d_multiplier', e.target.value)}
            style={inputStyle}
          />
          <span style={{ fontSize: '11px', color: '#9ca3af' }}>Infrastructure debt multiplier (default: 0.3)</span>
        </div>

        <div style={fieldGroupStyle}>
          <label style={labelStyle}>EFU_input direct (EFU units)</label>
          <input
            type="number"
            step="0.01"
            value={params.efu_input_direct}
            onChange={(e) => handleParamChange('efu_input_direct', e.target.value)}
            style={inputStyle}
          />
          <span style={{ fontSize: '11px', color: '#9ca3af' }}>Direct biophysical EFU input (before correction)</span>
        </div>
      </div>

      {/* Results */}
      {result && classification && (
        <div
          style={{
            border: `2px solid ${classification.color}`,
            borderRadius: '10px',
            padding: '20px',
            background: `${classification.color}10`,
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span style={{ fontSize: '28px', fontWeight: '800', color: classification.color }}>
              {result.mroi}%
            </span>
            <span
              style={{
                background: classification.color,
                color: 'white',
                padding: '4px 10px',
                borderRadius: '20px',
                fontWeight: '700',
                fontSize: '13px',
              }}
            >
              {classification.emoji} {classification.label}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', fontSize: '13px' }}>
            <div>
              <div style={{ color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600' }}>CO₂ reduction</div>
              <div style={{ fontWeight: '600' }}>{result.co2_reduction.toLocaleString()} kg/year</div>
            </div>
            <div>
              <div style={{ color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600' }}>RACF units</div>
              <div style={{ fontWeight: '600' }}>{result.output_racf_units}</div>
            </div>
            <div>
              <div style={{ color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600' }}>Correction ×</div>
              <div style={{ fontWeight: '600' }}>×{result.correction_multiplier}</div>
            </div>
            <div>
              <div style={{ color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600' }}>EFU_input corrected</div>
              <div style={{ fontWeight: '600' }}>{result.efu_input_corrected}</div>
            </div>
          </div>

          {/* Formula display */}
          <div style={{ marginTop: '14px', padding: '10px 14px', background: 'white', borderRadius: '6px', fontFamily: 'monospace', fontSize: '12px', color: '#374151', lineHeight: '1.8' }}>
            <div>MROI = (ΔE_saved × grid_CO₂ / RACF) / EFU_input(corrected) × 100</div>
            <div style={{ color: '#6b7280' }}>
              = ({params.delta_e_saved.toLocaleString()} × {params.grid_co2} / {params.racf}) / {result.efu_input_corrected} × 100
            </div>
            <div style={{ color: '#6b7280' }}>
              EFU_input(corrected) = {params.efu_input_direct} × (1 + (1 − {params.jim30}/100) × {params.d_multiplier}) = {result.efu_input_corrected}
            </div>
          </div>
        </div>
      )}

      {/* FLR — Frictional Loss Rate + Parasitism Detection */}
      {flrResult && (
        <div
          style={{
            border: `2px solid ${flrResult.parasitism ? '#dc2626' : '#6b7280'}`,
            borderRadius: '10px',
            padding: '18px',
            background: flrResult.parasitism ? '#fef2f2' : '#f9fafb',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#374151' }}>
              ⚡ FLR — Frictional Loss Rate
            </span>
            <span
              style={{
                background: flrResult.parasitism ? '#dc2626' : '#6b7280',
                color: 'white',
                padding: '3px 10px',
                borderRadius: '20px',
                fontWeight: '700',
                fontSize: '12px',
              }}
            >
              {flrResult.parasitism ? '⚠️ ' : '✔ '}{flrResult.status}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', fontSize: '13px', marginBottom: '12px' }}>
            <div>
              <div style={{ color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600' }}>FLR</div>
              <div style={{ fontWeight: '700', fontSize: '18px', color: flrResult.parasitism ? '#dc2626' : '#374151' }}>
                {flrResult.flr}%
              </div>
            </div>
            <div>
              <div style={{ color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600' }}>Threshold</div>
              <div style={{ fontWeight: '600' }}>{FLR_PARASITISM_THRESHOLD}%</div>
            </div>
            <div>
              <div style={{ color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600' }}>Friction overhead</div>
              <div style={{ fontWeight: '600' }}>{flrResult.friction} EFU units</div>
            </div>
            <div>
              <div style={{ color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600' }}>EFU_input corrected</div>
              <div style={{ fontWeight: '600' }}>{flrResult.efu_input_corrected}</div>
            </div>
          </div>

          <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#6b7280', background: 'white', padding: '8px 12px', borderRadius: '6px', lineHeight: '1.8' }}>
            <div>FLR = (EFU_input(corrected) − EFU_input(direct)) / EFU_input(corrected) × 100</div>
            <div>= ({flrResult.efu_input_corrected} − {params.efu_input_direct}) / {flrResult.efu_input_corrected} × 100 = {flrResult.flr}%</div>
          </div>

          {flrResult.parasitism && (
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#991b1b', fontWeight: '600' }}>
              ⚠️ FLR &gt; {FLR_PARASITISM_THRESHOLD}% — Infrastructure debt friction exceeds the metabolic parasitism threshold.
              Low repairability (JIM-30 = {params.jim30}) amplifies systemic entropy costs.
              Recommendation: increase JIM-30 score or reduce D multiplier.
            </div>
          )}
        </div>
      )}

      {/* MROI Classification Table */}
      <div style={{ fontSize: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
        <div style={{ background: '#f3f4f6', padding: '8px 14px', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#374151' }}>
          MROI Classification Thresholds (MROI Working Paper v1.3, §2.3)
        </div>
        {[
          { range: '> 25%', label: 'SYMBIOTIC', note: 'Priority investment', color: '#16a34a' },
          { range: '10–25%', label: 'STABLE', note: 'Approved with annual review', color: '#2563eb' },
          { range: '0–10%', label: 'LIMITED', note: 'Conditional, improvement plan required', color: '#d97706' },
          { range: '< 0%', label: 'PARASITIC', note: 'Not recommended for public funding', color: '#dc2626' },
        ].map((row) => (
          <div
            key={row.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 14px',
              borderTop: '1px solid #e5e7eb',
              background: result && classifyMROI(result.mroi).label === row.label ? `${row.color}18` : 'white',
            }}
          >
            <span style={{ width: '70px', fontWeight: '600', color: row.color }}>{row.range}</span>
            <span style={{ width: '100px', fontWeight: '700', color: row.color }}>{row.label}</span>
            <span style={{ color: '#6b7280' }}>{row.note}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0, lineHeight: '1.6' }}>
        EFU Framework v5.1 · 1 EFU = 20 kg/day human metabolic throughput · D = 0.3 (S2 calibration) ·
        RACF Hungary = 526 kg CO₂/capita/year · grid_CO₂ = 0.35 kg/kWh (MAVIR 2024–25) ·
        Author: István Simor · ORCID: 0009-0002-6599-3480
      </p>
    </div>
  );
}
