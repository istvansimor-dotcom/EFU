import { useState, useEffect } from 'react';
import caseStudies, { DEFAULT_D, RACF_DEFAULT } from '../data/caseStudies.js';
import {
  calculateMROI,
  calculateFLR,
  detectParasitism,
  classifyMROI,
  FLR_PARASITISM_THRESHOLD,
} from '../logic/efu-engine.js';
import CewsPanel from './CewsPanel.jsx';
import MR600Panel from './MR600Panel.jsx';
import MSBE600Panel from './MSBE600Panel.jsx';
import PFAS600Panel from './PFAS600Panel.jsx';
import Happiness600Panel from './Happiness600Panel.jsx';
import Synergy600Panel from './Synergy600Panel.jsx';
import Atrocitas600Panel from './Atrocitas600Panel.jsx';
import Narrativa600Panel from './Narrativa600Panel.jsx';
import AMDPI600Panel from './AMDPI600Panel.jsx';
import HobbyAnimal600Panel from './HobbyAnimal600Panel.jsx';
import MVP600Panel from './MVP600Panel.jsx';
import Entertainment600Panel from './Entertainment600Panel.jsx';
import ReligiousFlux600Panel from './ReligiousFlux600Panel.jsx';
import CdsPanel from './CdsPanel.jsx';
import GreshamParasite600Panel from './GreshamParasite600Panel.jsx';
import DigitalExtraction600Panel from './DigitalExtraction600Panel.jsx';
import NooMetrics600Panel from './NooMetrics600Panel.jsx';
import UPFMetabolism600Panel from './UPFMetabolism600Panel.jsx';
import MEII800Panel from './MEII800Panel.jsx';
import Energia700Panel from './Energia700Panel.jsx';
import RegenMeres700Panel from './RegenMeres700Panel.jsx';
import AgroEnergia700Panel from './AgroEnergia700Panel.jsx';
import ParticipatiBudget700Panel from './ParticipatiBudget700Panel.jsx';

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

// Gauge scale constants
const GAUGE_MIN = -15;
const GAUGE_MAX = 60;
const GAUGE_RANGE = GAUGE_MAX - GAUGE_MIN;

// ── 1. MROI Gauge (CSS-only) ─────────────────────────────────────────────────
function MROIGauge({ mroi }) {
  const needlePct = Math.min(Math.max((mroi - GAUGE_MIN) / GAUGE_RANGE * 100, 0), 100);
  const zones = [
    { label: 'PARASITIC', width: (0 - GAUGE_MIN) / GAUGE_RANGE * 100,  color: '#dc2626' },
    { label: 'LIMITED',   width: (10 - 0) / GAUGE_RANGE * 100,         color: '#d97706' },
    { label: 'STABLE',    width: (25 - 10) / GAUGE_RANGE * 100,        color: '#2563eb' },
    { label: 'SYMBIOTIC', width: (GAUGE_MAX - 25) / GAUGE_RANGE * 100, color: '#16a34a' },
  ];
  const marks = [GAUGE_MIN, 0, 10, 25, GAUGE_MAX];
  return (
    <div style={{ marginTop: '16px' }}>
      <div style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
        MROI Position on Scale
      </div>
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', height: '18px', borderRadius: '9px', overflow: 'hidden' }}>
          {zones.map((z) => (
            <div key={z.label} style={{ width: `${z.width}%`, background: z.color, opacity: 0.85 }} />
          ))}
        </div>
        <div style={{
          position: 'absolute',
          top: '-4px',
          bottom: '-4px',
          left: `${needlePct}%`,
          width: '4px',
          transform: 'translateX(-50%)',
          background: 'white',
          borderRadius: '2px',
          boxShadow: '0 1px 5px rgba(0,0,0,0.5)',
          pointerEvents: 'none',
        }} />
      </div>
      <div style={{ position: 'relative', height: '18px', marginTop: '6px' }}>
        {marks.map((m) => (
          <span key={m} style={{
            position: 'absolute',
            left: `${Math.min(Math.max((m - GAUGE_MIN) / GAUGE_RANGE * 100, 0), 100)}%`,
            transform: 'translateX(-50%)',
            fontSize: '10px',
            color: '#9ca3af',
            whiteSpace: 'nowrap',
          }}>
            {m}%
          </span>
        ))}
      </div>
    </div>
  );
}

// ── 2. FLR Donut (SVG two-segment ring) ──────────────────────────────────────
function FLRDonut({ flr, efu_input_direct, efu_input_corrected }) {
  const r = 36, cx = 50, cy = 50;
  const circ = 2 * Math.PI * r;
  const directFrac = efu_input_corrected > 0
    ? Math.min(Math.max(efu_input_direct / efu_input_corrected, 0), 1)
    : 1;
  const frictionFrac = 1 - directFrac;
  const directLen = directFrac * circ;
  const frictionLen = frictionFrac * circ;
  const isParasitism = flr > FLR_PARASITISM_THRESHOLD;
  const frictionColor = isParasitism ? '#dc2626' : '#d97706';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '14px', marginBottom: '4px' }}>
      <svg width="100" height="100" viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth="12" />
        {directFrac > 0.001 && (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#2563eb" strokeWidth="12"
            strokeDasharray={`${directLen} ${circ - directLen}`}
            strokeDashoffset={circ / 4}
            strokeLinecap="butt"
          />
        )}
        {frictionFrac > 0.001 && (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={frictionColor} strokeWidth="12"
            strokeDasharray={`${frictionLen} ${circ - frictionLen}`}
            strokeDashoffset={circ / 4 - directLen}
            strokeLinecap="butt"
          />
        )}
        {isParasitism ? (
          <>
            <text x={cx} y={cy + 2} textAnchor="middle" fontSize="14" dominantBaseline="middle">⚠️</text>
            <text x={cx} y={cy + 14} textAnchor="middle" fontSize="8" fill="#dc2626" fontWeight="700">PARASITISM</text>
          </>
        ) : (
          <>
            <text x={cx} y={cy} textAnchor="middle" fontSize="13" fontWeight="700" fill="#374151" dominantBaseline="middle">{flr}%</text>
            <text x={cx} y={cy + 13} textAnchor="middle" fontSize="8" fill="#6b7280">FLR</text>
          </>
        )}
      </svg>
      <div style={{ fontSize: '11px', lineHeight: '1.9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#2563eb', flexShrink: 0 }} />
          <span>Useful input: <strong>{Math.round(directFrac * 100)}%</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: frictionColor, flexShrink: 0 }} />
          <span>Friction loss: <strong>{Math.round(frictionFrac * 100)}%</strong></span>
        </div>
        {isParasitism && (
          <div style={{ marginTop: '4px', color: '#dc2626', fontSize: '10px', fontWeight: '600' }}>
            ⚠️ Metabolic Parasitism
          </div>
        )}
      </div>
    </div>
  );
}

// ── 3. RACF Comparator Bar (CSS two columns) ──────────────────────────────────
function RACFComparator({ racf, co2_reduction }) {
  const absReduction = Math.abs(co2_reduction);
  const maxVal = Math.max(racf, absReduction, 1);
  const BAR_MAX_H = 80;
  const racfH = Math.round((racf / maxVal) * BAR_MAX_H);
  const co2H = Math.max(Math.round((absReduction / maxVal) * BAR_MAX_H), 2);
  const isPositive = co2_reduction >= 0;
  const pct = racf > 0 ? Math.round((co2_reduction / racf) * 100) : 0;
  const efuEquiv = racf > 0 ? Math.round(co2_reduction / racf * 10) / 10 : 0;
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px 18px', background: '#f9fafb', marginBottom: '24px' }}>
      <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#374151', marginBottom: '14px' }}>
        📊 RACF Comparator
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '28px', flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600', marginBottom: '6px' }}>RACF Baseline</div>
          <div style={{ height: `${BAR_MAX_H}px`, display: 'flex', alignItems: 'flex-end' }}>
            <div style={{ width: '52px', height: `${racfH}px`, background: '#9ca3af', borderRadius: '4px 4px 0 0' }} />
          </div>
          <div style={{ width: '52px', height: '1px', background: '#d1d5db', margin: '0 auto' }} />
          <div style={{ fontSize: '11px', color: '#374151', fontWeight: '600', marginTop: '4px' }}>{racf.toLocaleString()} kg</div>
          <div style={{ fontSize: '10px', color: '#9ca3af' }}>CO₂/person/yr</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: isPositive ? '#16a34a' : '#dc2626', fontWeight: '700', marginBottom: '6px' }}>
            {isPositive ? `+${pct}%` : `${pct}%`} vs RACF
          </div>
          <div style={{ height: `${BAR_MAX_H}px`, display: 'flex', alignItems: 'flex-end' }}>
            <div style={{ width: '52px', height: `${co2H}px`, background: isPositive ? '#16a34a' : '#dc2626', borderRadius: '4px 4px 0 0' }} />
          </div>
          <div style={{ width: '52px', height: '1px', background: '#d1d5db', margin: '0 auto' }} />
          <div style={{ fontSize: '11px', color: '#374151', fontWeight: '600', marginTop: '4px' }}>
            {co2_reduction >= 0 ? '+' : ''}{co2_reduction.toLocaleString()} kg
          </div>
          <div style={{ fontSize: '10px', color: '#9ca3af' }}>CO₂ reduction/yr</div>
        </div>
        <div style={{ fontSize: '11px', color: '#6b7280', lineHeight: '1.7', maxWidth: '200px', paddingBottom: '8px', flex: 1 }}>
          Comparing annual CO₂ reduction to the Reference Annual Carbon Flux (RACF) of 1 person.
          {co2_reduction > 0 && (
            <> This system offsets <strong style={{ color: '#374151' }}>{efuEquiv}</strong> RACF-equivalent persons/year.</>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 4. Case Studies Comparison Table (sparkline rows) ────────────────────────
function CaseStudiesTable({ selectedId, onSelect }) {
  const MAX_MROI = 60;
  const studies = caseStudies.filter((s) => s.id !== 'custom' && s.params);
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden', marginBottom: '24px' }}>
      <div style={{ background: '#f3f4f6', padding: '8px 14px', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#374151' }}>
        📋 All Case Studies — MROI Comparison
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '480px' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {[
                { h: 'Case Study', align: 'left' },
                { h: 'MROI', align: 'left', minW: '160px' },
                { h: 'FLR', align: 'center' },
                { h: 'Status', align: 'center' },
              ].map(({ h, align, minW }) => (
                <th key={h} style={{ padding: '7px 14px', textAlign: align, fontWeight: '600', color: '#6b7280', fontSize: '11px', borderBottom: '1px solid #e5e7eb', minWidth: minW }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {studies.map((s) => {
              const r = calculateMROI(s.params);
              const f = calculateFLR(s.params);
              const d = detectParasitism(f.flr);
              const cls = classifyMROI(r.mroi);
              const isSelected = s.id === selectedId;
              const barW = Math.min(Math.max(r.mroi / MAX_MROI * 100, 0), 100);
              const shortLabel = s.label.includes('(') ? s.label.split('(')[0].trim() : s.label;
              return (
                <tr
                  key={s.id}
                  onClick={() => onSelect(s.id)}
                  style={{ background: isSelected ? `${cls.color}18` : 'white', cursor: 'pointer', borderTop: '1px solid #f3f4f6' }}
                >
                  <td style={{ padding: '8px 14px', fontWeight: isSelected ? '700' : '400', color: '#374151' }}>
                    {isSelected && <span style={{ marginRight: '5px', color: cls.color }}>▶</span>}
                    {shortLabel}
                  </td>
                  <td style={{ padding: '8px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '8px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${barW}%`, height: '100%', background: cls.color, borderRadius: '4px' }} />
                      </div>
                      <span style={{ color: cls.color, fontWeight: '700', minWidth: '42px', textAlign: 'right' }}>
                        {r.mroi}%
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '8px 14px', textAlign: 'center', color: d.parasitism ? '#dc2626' : '#374151' }}>
                    {f.flr}%
                  </td>
                  <td style={{ padding: '8px 14px', textAlign: 'center' }}>
                    <span style={{ background: d.parasitism ? '#fef2f2' : '#f0fdf4', color: d.parasitism ? '#dc2626' : '#16a34a', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>
                      {d.parasitism ? '⚠️ Parasitic' : '✔ OK'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main Calculator component ─────────────────────────────────────────────────
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

  useEffect(() => {
    const study = caseStudies.find((s) => s.id === selectedCaseStudyId);
    if (study && study.params) {
      setParams({ ...study.params });
    }
  }, [selectedCaseStudyId]);

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
          <input type="number" value={params.delta_e_saved} onChange={(e) => handleParamChange('delta_e_saved', e.target.value)} style={inputStyle} />
          <span style={{ fontSize: '11px', color: '#9ca3af' }}>Energy savings vs. baseline counterfactual</span>
        </div>
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>grid_CO₂ (kg CO₂/kWh)</label>
          <input type="number" step="0.01" value={params.grid_co2} onChange={(e) => handleParamChange('grid_co2', e.target.value)} style={inputStyle} />
          <span style={{ fontSize: '11px', color: '#9ca3af' }}>Regional grid carbon intensity (HU default: 0.35)</span>
        </div>
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>RACF (kg CO₂/person/year)</label>
          <input type="number" value={params.racf} onChange={(e) => handleParamChange('racf', e.target.value)} style={inputStyle} />
          <span style={{ fontSize: '11px', color: '#9ca3af' }}>Reference Annual Carbon Flux (Hungary: 526)</span>
        </div>
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>JIM-30 score (%)</label>
          <input type="number" min="0" max="100" value={params.jim30} onChange={(e) => handleParamChange('jim30', e.target.value)} style={inputStyle} />
          <span style={{ fontSize: '11px', color: '#9ca3af' }}>Repairability index 0–100 (S1 Supplementary Materials)</span>
        </div>
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>D — Debt Multiplier</label>
          <input type="number" step="0.05" value={params.d_multiplier} onChange={(e) => handleParamChange('d_multiplier', e.target.value)} style={inputStyle} />
          <span style={{ fontSize: '11px', color: '#9ca3af' }}>Infrastructure debt multiplier (default: 0.3)</span>
        </div>
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>EFU_input direct (EFU units)</label>
          <input type="number" step="0.01" value={params.efu_input_direct} onChange={(e) => handleParamChange('efu_input_direct', e.target.value)} style={inputStyle} />
          <span style={{ fontSize: '11px', color: '#9ca3af' }}>Direct biophysical EFU input (before correction)</span>
        </div>
      </div>

      {/* Results */}
      {result && classification && (
        <div style={{ border: `2px solid ${classification.color}`, borderRadius: '10px', padding: '20px', background: `${classification.color}10`, marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span style={{ fontSize: '28px', fontWeight: '800', color: classification.color }}>
              {result.mroi}%
            </span>
            <span style={{ background: classification.color, color: 'white', padding: '4px 10px', borderRadius: '20px', fontWeight: '700', fontSize: '13px' }}>
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

          {/* 1. MROI Gauge */}
          <MROIGauge mroi={result.mroi} />
        </div>
      )}

      {/* FLR — Frictional Loss Rate + Parasitism Detection */}
      {flrResult && (
        <div style={{ border: `2px solid ${flrResult.parasitism ? '#dc2626' : '#6b7280'}`, borderRadius: '10px', padding: '18px', background: flrResult.parasitism ? '#fef2f2' : '#f9fafb', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#374151' }}>
              ⚡ FLR — Frictional Loss Rate
            </span>
            <span style={{ background: flrResult.parasitism ? '#dc2626' : '#6b7280', color: 'white', padding: '3px 10px', borderRadius: '20px', fontWeight: '700', fontSize: '12px' }}>
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

          {/* 2. FLR Donut */}
          <FLRDonut
            flr={flrResult.flr}
            efu_input_direct={params.efu_input_direct}
            efu_input_corrected={flrResult.efu_input_corrected}
          />

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

      {/* 3. RACF Comparator */}
      {result && (
        <RACFComparator racf={params.racf} co2_reduction={result.co2_reduction} />
      )}

      {/* 4. Case Studies Comparison Table */}
      <CaseStudiesTable selectedId={selectedCaseStudyId} onSelect={setSelectedCaseStudyId} />

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
            style={{ display: 'flex', alignItems: 'center', padding: '8px 14px', borderTop: '1px solid #e5e7eb', background: result && classifyMROI(result.mroi).label === row.label ? `${row.color}18` : 'white' }}
          >
            <span style={{ width: '70px', fontWeight: '600', color: row.color }}>{row.range}</span>
            <span style={{ width: '100px', fontWeight: '700', color: row.color }}>{row.label}</span>
            <span style={{ color: '#6b7280' }}>{row.note}</span>
          </div>
        ))}
      </div>

      {/* CEWS — Civilization Early Warning System */}
      <CewsPanel />

      {/* EFU 600.00 — Metabolikus Ragadozó v2.1 */}
      <MR600Panel />

      {/* EFU 600.2 — Molekuláris Rendszerhatár-Események (MSBE) */}
      <MSBE600Panel />

      {/* EFU 600.52 — PFAS & Forever Chemicals */}
      <PFAS600Panel />
      <Happiness600Panel />

      {/* EFU 600.0 — 600-as Szinergia-Mátrix (Antiflux Szinergia Alapoperátor) */}
      <Synergy600Panel />

      {/* EFU 600.56 — Atrocitás Potenciál (A-érték) Modell v1.2 */}
      <Atrocitas600Panel />

      {/* EFU 600.40–42 — Narratíva Degradáció Modell v1.0 */}
      <Narrativa600Panel />

      {/* EFU 600.52.3 — AM-DPI Index (PFAS Audit Integration) v1.1 */}
      <AMDPI600Panel />

      {/* EFU 600.30 — Hobby Animal Keeping & Wildlife Extraction Parasitism v1.0 */}
      <HobbyAnimal600Panel />

      {/* EFU 600.10 — Monitoring és Verifikáció (MVP) v1.0 */}
      <MVP600Panel />

      {/* EFU 600.20 — Szórakoztatóipar Dopamin Extrakció v1.0 */}
      <Entertainment600Panel />

      {/* EFU 600.82 — Vallási Identitás Antiflux v1.0 */}
      <ReligiousFlux600Panel />

      {/* EFU 900.1 CDS / 900.2 CDP — Integrációs Panel (Sprint 2) */}
      <CdsPanel />

      {/* EFU 600.69 — Gresham–Parazita Spirál v1.0 */}
      <GreshamParasite600Panel />

      {/* EFU 600.53 — Digitális Extrakció & AI Parazitizmus v0.3 */}
      <DigitalExtraction600Panel />

      {/* EFU 600.51 — Noosphere Antifluxus Metrikák v1.0 */}
      <NooMetrics600Panel />

      {/* EFU 600.58 — UPF Anyagcsere Parazitizmus v0.2 */}
      <UPFMetabolism600Panel />

      {/* EFU 800.13 — MEII Metabolikus Érték-Intenzitás Index v1.1 */}
      <MEII800Panel />

      {/* EFU 700.2 — Közösségi Energia Szövetkezet v1.0 */}
      <Energia700Panel />

      {/* EFU 700.1.1 — Regeneratív Mérési Protokoll v1.0 */}
      <RegenMeres700Panel />

      {/* EFU 700.1.1.2 — Agro-Energia Szimbiózis v1.0 */}
      <AgroEnergia700Panel />

      {/* EFU 700.5 — Participatív Költségvetés / dFOS v1.2 */}
      <ParticipatiBudget700Panel />

      {/* Footer */}
      <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0, lineHeight: '1.6' }}>
        EFU Framework v5.1 · 1 EFU = 20 kg/day human metabolic throughput · D = 0.3 (S2 calibration) ·
        RACF Hungary = 526 kg CO₂/capita/year · grid_CO₂ = 0.35 kg/kWh (MAVIR 2024–25) ·
        Author: István Simor · ORCID: 0009-0002-6599-3480
      </p>
    </div>
  );
}
