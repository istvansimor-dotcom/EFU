/**
 * UBS700Panel.jsx — EFU 700.8 Univerzális Alapszolgáltatások (UBS) v1.0
 *
 * Sections:
 *   1. Module header
 *   2. Változó kalibráció – 3 réteg (Fő változók / Negatív / Kontextus)
 *   3. UBS index eredmény + komponens pontszámok
 *   4. NET_EFU + HMI + R_future + Interstitium összefoglaló
 *   5. Service Delivery Metrics
 *   6. Zóna táblázat (5 zóna)
 *   7. Trigger logika (4 trigger)
 *   8. Pilot referencia táblázat
 *   9. JSON kimenet
 */

import { useState, useMemo } from 'react';
import {
  MODULE_META_700_8,
  UBS_VARIABLES_MAIN,
  UBS_VARIABLES_NEGATIVE,
  UBS_VARIABLES_CONTEXT,
  UBS_ZONES,
  UBS_TRIGGERS,
} from '../data/ubs700_8.js';
import { calculateUBS } from '../logic/efu-engine.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function Badge({ children, color, size = '11px' }) {
  return (
    <span style={{
      display: 'inline-block', background: color, color: 'white',
      padding: '2px 8px', borderRadius: '20px', fontSize: size,
      fontWeight: '700', letterSpacing: '0.03em',
    }}>
      {children}
    </span>
  );
}

function SectionBox({ title, icon, children, accentColor = '#e5e7eb' }) {
  return (
    <div style={{ border: `1px solid ${accentColor}`, borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
      <div style={{ background: '#f3f4f6', padding: '8px 14px', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#374151' }}>
        {icon} {title}
      </div>
      <div style={{ padding: '14px' }}>{children}</div>
    </div>
  );
}

function LayerHeader({ label, icon, color }) {
  return (
    <div style={{ fontSize: '11px', fontWeight: '700', color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px', marginTop: '10px', paddingBottom: '4px', borderBottom: `2px solid ${color}40` }}>
      {icon} {label}
    </div>
  );
}

function VarSlider({ variable, value, onChange }) {
  const isPositive = variable.positive;
  const formatVal = (v) => {
    if (variable.id === 'population_m') return v.toLocaleString('hu-HU') + ' M';
    return v.toFixed(2);
  };
  return (
    <div style={{ marginBottom: '11px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
        <span style={{ fontSize: '11px', fontWeight: '700', color: variable.color }}>
          {variable.id}
          {isPositive
            ? <span style={{ marginLeft: '5px', fontSize: '9px', background: '#16a34a', color: 'white', padding: '1px 4px', borderRadius: '3px' }}>+</span>
            : <span style={{ marginLeft: '5px', fontSize: '9px', background: '#dc2626', color: 'white', padding: '1px 4px', borderRadius: '3px' }}>−</span>
          }
        </span>
        <span style={{ fontSize: '10px', color: '#6b7280', flex: 1, margin: '0 6px' }}>{variable.label}</span>
        <span style={{ fontSize: '12px', fontWeight: '700', color: variable.color, minWidth: '54px', textAlign: 'right' }}>
          {formatVal(value)}
        </span>
      </div>
      <input
        type="range"
        min={variable.min}
        max={variable.max}
        step={variable.step}
        value={value}
        onChange={(e) => onChange(variable.id, parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: variable.color }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#9ca3af', marginTop: '1px' }}>
        <span>{variable.min}</span>
        <span style={{ fontSize: '9px', color: '#9ca3af' }}>{variable.description}</span>
        <span>{variable.max}</span>
      </div>
    </div>
  );
}

function ScoreBar({ label, value, color, max = 1 }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
        <span style={{ fontSize: '11px', fontWeight: '700', color: '#374151' }}>{label}</span>
        <span style={{ fontSize: '12px', fontWeight: '700', color }}>{value.toFixed(3)}</span>
      </div>
      <div style={{ background: '#f3f4f6', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
        <div style={{ background: color, height: '100%', width: `${pct}%`, borderRadius: '4px', transition: 'width 0.3s' }} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pilot reference data
// ---------------------------------------------------------------------------

const PILOT_CASES = [
  { city: 'UK NHS 🇬🇧 ★', period: '1948–', size: '67M fő | 100% lefedett', result: 'Globális egészségügyi benchmark – ingyenes hozzáférés születéstől halálig' },
  { city: 'Finnország 🇫🇮', period: '1960–', size: 'bölcsőde-PhD ingyenes', result: 'PISA 1. hely – teljes ingyenes oktatás, legmagasabb PISA-pontszám' },
  { city: 'Bécs 🇦🇹', period: '1919–', size: '60% szociális lakás', result: 'Vienna modell – Gemeindebauten, legelérhetőbb lakhatás Európában' },
  { city: 'Luxemburg 🇱🇺', period: '2020–', size: 'ingyenes tömegközlekedés', result: 'Első ország teljes ingyenes public transit – 620k fő' },
];

// ---------------------------------------------------------------------------
// Main Panel
// ---------------------------------------------------------------------------

export default function UBS700Panel() {
  const buildDefaults = (vars) => {
    const d = {};
    vars.forEach(v => { d[v.id] = v.default; });
    return d;
  };

  const [vals, setVals] = useState({
    ...buildDefaults(UBS_VARIABLES_MAIN),
    ...buildDefaults(UBS_VARIABLES_NEGATIVE),
    ...buildDefaults(UBS_VARIABLES_CONTEXT),
  });

  const handleChange = (id, value) => setVals(prev => ({ ...prev, [id]: value }));

  const result = useMemo(() => calculateUBS(vals), [vals]);
  const { ubs_index, zone, triggers, scores, efu } = result;

  const [showJson, setShowJson] = useState(false);

  // Section 5 metrics
  const avg_coverage = (vals.healthcare_coverage + vals.education_free + vals.affordable_housing_pct + vals.public_transport_subsidy + vals.internet_access) / 5;
  const market_penalty = vals.market_commodification * 0.3;
  const overall_ubs = ubs_index / 10;

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif", maxWidth: '900px', margin: '32px auto', padding: '0 16px', color: '#111827' }}>

      {/* ── 1. Header ── */}
      <div style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 60%, #16a34a 100%)', color: 'white', borderRadius: '10px', padding: '20px 24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              EFU {MODULE_META_700_8.id} · {MODULE_META_700_8.series} · v{MODULE_META_700_8.version}
            </div>
            <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '800' }}>{MODULE_META_700_8.title}</h2>
            <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>{MODULE_META_700_8.subtitle}</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Badge color="rgba(255,255,255,0.25)" size="10px">{MODULE_META_700_8.status}</Badge>
              <Badge color="rgba(220,38,38,0.8)" size="10px">⚔ Ellentét: {MODULE_META_700_8.antithesis}</Badge>
              <Badge color="rgba(255,255,255,0.2)" size="10px">UBS Kernel</Badge>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '32px', fontWeight: '900', lineHeight: 1 }}>{ubs_index.toFixed(2)}</div>
            <div style={{ fontSize: '11px', opacity: 0.8 }}>UBS Index</div>
            <div style={{ marginTop: '6px' }}>
              <Badge color={zone.color} size="11px">{zone.label}</Badge>
            </div>
          </div>
        </div>
        <div style={{ marginTop: '12px', padding: '8px 12px', background: 'rgba(255,255,255,0.15)', borderRadius: '6px', fontSize: '11px' }}>
          <span style={{ opacity: 0.8 }}>Formula: </span>
          <code style={{ fontFamily: 'monospace', fontSize: '11px' }}>{MODULE_META_700_8.formula}</code>
        </div>
      </div>

      {/* ── 2. Sliders ── */}
      <SectionBox title="Változó Kalibráció – 3 Réteg" icon="🎛" accentColor="#bae6fd">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 28px' }}>
          <div>
            <LayerHeader label="Fő Változók (UBS komponensek)" icon="🏥" color="#1d4ed8" />
            {UBS_VARIABLES_MAIN.map(v => (
              <VarSlider key={v.id} variable={v} value={vals[v.id]} onChange={handleChange} />
            ))}
          </div>
          <div>
            <LayerHeader label="Negatív Tényező (privatizáció)" icon="⚠️" color="#dc2626" />
            {UBS_VARIABLES_NEGATIVE.map(v => (
              <VarSlider key={v.id} variable={v} value={vals[v.id]} onChange={handleChange} />
            ))}
            <LayerHeader label="Kontextus (népesség)" icon="👥" color="#374151" />
            {UBS_VARIABLES_CONTEXT.map(v => (
              <VarSlider key={v.id} variable={v} value={vals[v.id]} onChange={handleChange} />
            ))}
          </div>
        </div>
      </SectionBox>

      {/* ── 3. Index komponensek ── */}
      <SectionBox title="UBS Index Komponensek" icon="📊" accentColor="#bbf7d0">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 28px' }}>
          <div>
            <ScoreBar label="Egészségügy score"  value={scores.healthcare_score} color="#1d4ed8" />
            <ScoreBar label="Oktatás score"       value={scores.education_score}  color="#2563eb" />
            <ScoreBar label="Lakhatás score"      value={scores.housing_score}    color="#3b82f6" />
          </div>
          <div>
            <ScoreBar label="Közlekedés score"   value={scores.transport_score}  color="#0891b2" />
            <ScoreBar label="Internet score"     value={scores.internet_score}   color="#16a34a" />
          </div>
        </div>
        <div style={{ marginTop: '14px', padding: '12px', background: zone.bg, borderRadius: '8px', border: `2px solid ${zone.color}40` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '28px', fontWeight: '900', color: zone.color }}>{ubs_index.toFixed(2)}</span>
              <span style={{ fontSize: '13px', color: '#6b7280', marginLeft: '8px' }}>/ 10 UBS Index</span>
            </div>
            <Badge color={zone.color} size="12px">{zone.label}</Badge>
          </div>
          <div style={{ fontSize: '11px', color: '#374151', marginTop: '6px' }}>{zone.action}</div>
        </div>
      </SectionBox>

      {/* ── 4. NET_EFU + HMI + R_future összefoglaló ── */}
      <SectionBox title="NET EFU + Civilizációs Hatásmetrikák" icon="⚡" accentColor="#bae6fd">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
          {[
            { label: 'NET EFU/év', value: Math.round(efu.net_efu_annual).toLocaleString('hu-HU'), unit: 'EFU-E', color: '#1d4ed8', note: `${vals.population_m}M fő × +${efu.hmi_per_capita.toFixed(2)} HMI` },
            { label: 'HMI hatás/fő', value: '+' + efu.hmi_per_capita.toFixed(2), unit: 'EFU-E', color: '#16a34a', note: 'egészség + oktatás + lakhatás' },
            { label: 'R_future', value: efu.R_future.toFixed(3), unit: '', color: '#7c3aed', note: `UBS kernel: ${ubs_index.toFixed(1)} pont` },
            { label: 'Interstitium +', value: '+' + efu.interstitium_gain_pct.toFixed(1), unit: '%', color: '#0891b2', note: 'társadalmi kohézió, civic trust' },
            { label: 'Egészségügyi score', value: scores.healthcare_score.toFixed(3), unit: '', color: '#1d4ed8', note: 'market penalty levonva' },
            { label: 'Lakhatási score', value: scores.housing_score.toFixed(3), unit: '', color: '#3b82f6', note: 'Vienna modell benchmark' },
          ].map((m, i) => (
            <div key={i} style={{ background: '#f9fafb', border: `1px solid ${m.color}30`, borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{m.label}</div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: m.color }}>{m.value}<span style={{ fontSize: '13px', fontWeight: '600' }}> {m.unit}</span></div>
              <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px' }}>{m.note}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: '10px 14px', background: '#eff6ff', borderRadius: '6px', border: '1px solid #bae6fd', fontSize: '11px', color: '#1d4ed8' }}>
          <strong>UK NHS referencia (1948–):</strong> 67M fő · 100% lefedettség · NET EFU +180M/év · bölcsőde-PhD ingyenes (Finnország) · Vienna 60% szociális lakás
        </div>
      </SectionBox>

      {/* ── 5. Service Delivery Metrics ── */}
      <SectionBox title="Service Delivery Metrics – UBS Teljesítés" icon="🏛" accentColor="#bae6fd">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '12px' }}>
          {[
            { label: 'Átlagos Lefedettség', value: avg_coverage, note: '5 szolgáltatás átlaga', color: '#1d4ed8' },
            { label: 'Piaci Büntetés', value: market_penalty, note: 'privatizáció hatása', color: '#dc2626' },
            { label: 'Összesített UBS', value: overall_ubs, note: 'normalizált (0–1)', color: '#0369a1' },
          ].map((f, i) => (
            <div key={i} style={{ background: '#eff6ff', border: `1px solid ${f.color}30`, borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>{f.label}</div>
              <div style={{ fontSize: '20px', fontWeight: '900', color: f.color }}>{f.value.toFixed(3)}</div>
              <div style={{ fontSize: '9px', color: '#9ca3af', marginTop: '3px' }}>{f.note}</div>
            </div>
          ))}
        </div>
      </SectionBox>

      {/* ── 6. Zóna táblázat ── */}
      <SectionBox title="5 Zóna Besorolás" icon="🗺" accentColor="#e5e7eb">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              {['Zóna', 'Feltétel', 'Státusz', 'Akció'].map(h => (
                <th key={h} style={{ padding: '6px 10px', textAlign: 'left', fontWeight: '700', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {UBS_ZONES.map(z => {
              const isActive = zone.id === z.id;
              return (
                <tr key={z.id} style={{ background: isActive ? z.bg : 'transparent', fontWeight: isActive ? '700' : '400', borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '7px 10px', color: z.color, fontWeight: '700' }}>{z.label}</td>
                  <td style={{ padding: '7px 10px', color: '#374151', fontFamily: 'monospace', fontSize: '10px' }}>{z.condition}</td>
                  <td style={{ padding: '7px 10px' }}>{isActive ? <Badge color={z.color}>{z.status}</Badge> : <span style={{ color: '#9ca3af' }}>{z.status}</span>}</td>
                  <td style={{ padding: '7px 10px', color: '#4b5563', fontSize: '10px' }}>{z.action}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </SectionBox>

      {/* ── 7. Triggers ── */}
      <SectionBox title="Trigger Logika – 4 Küszöb" icon="⚠️" accentColor="#e5e7eb">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {UBS_TRIGGERS.map(t => {
            const isActive = triggers.active_triggers.includes(t.id);
            return (
              <div key={t.id} style={{ padding: '10px 12px', borderRadius: '8px', border: `1px solid ${isActive ? t.color : '#e5e7eb'}`, background: isActive ? (t.positive ? '#f0fdf4' : '#fef2f2') : '#f9fafb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '9px', fontWeight: '700', background: isActive ? t.color : '#9ca3af', color: 'white', padding: '2px 6px', borderRadius: '3px' }}>
                    {isActive ? 'AKTÍV' : 'INAKTÍV'}
                  </span>
                  <span style={{ fontSize: '10px', fontWeight: '700', color: isActive ? t.color : '#6b7280' }}>{t.id}</span>
                </div>
                <div style={{ fontSize: '10px', color: '#374151', marginBottom: '3px' }}>{t.label.replace(t.id + ' – ', '')}</div>
                <div style={{ fontSize: '9px', color: '#6b7280' }}>Feltétel: <code style={{ fontFamily: 'monospace' }}>{t.condition}</code></div>
                {isActive && <div style={{ fontSize: '10px', color: t.color, marginTop: '4px', fontWeight: '600' }}>→ {t.action}</div>}
              </div>
            );
          })}
        </div>
      </SectionBox>

      {/* ── 8. Pilot referencia ── */}
      <SectionBox title="Globális Pilot Validáció" icon="🌍" accentColor="#bae6fd">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              {['Ország/Város', 'Időszak', 'Méret / Modell', 'Kulcs eredmény'].map(h => (
                <th key={h} style={{ padding: '6px 10px', textAlign: 'left', fontWeight: '700', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PILOT_CASES.map((p, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', background: i === 0 ? '#eff6ff' : 'transparent' }}>
                <td style={{ padding: '7px 10px', fontWeight: i === 0 ? '700' : '400', color: i === 0 ? '#1d4ed8' : '#374151' }}>{p.city}</td>
                <td style={{ padding: '7px 10px', color: '#6b7280' }}>{p.period}</td>
                <td style={{ padding: '7px 10px', color: '#374151' }}>{p.size}</td>
                <td style={{ padding: '7px 10px', color: '#374151', fontSize: '10px' }}>{p.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: '10px', padding: '8px 12px', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0', fontSize: '10px', color: '#166534' }}>
          UBS Stack: <strong>700.8 (UBS)</strong> → <strong>700.9 (Közösségi Valuták)</strong> → <strong>700.10 (Munkás Coop)</strong> → feedback → civilizációs regeneráció
        </div>
      </SectionBox>

      {/* ── 9. JSON output ── */}
      <SectionBox title="JSON Kimenet" icon="📋" accentColor="#e5e7eb">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
          <button
            onClick={() => setShowJson(v => !v)}
            style={{ fontSize: '10px', padding: '4px 12px', border: '1px solid #d1d5db', borderRadius: '6px', background: '#f9fafb', cursor: 'pointer', fontWeight: '600', color: '#374151' }}
          >
            {showJson ? 'Elrejtés' : 'JSON mutatása'}
          </button>
        </div>
        {showJson && (
          <pre style={{ background: '#1e293b', color: '#e2e8f0', padding: '14px', borderRadius: '8px', overflow: 'auto', fontSize: '10px', maxHeight: '400px', lineHeight: '1.5' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </SectionBox>

      {/* Modul connections */}
      <div style={{ fontSize: '10px', color: '#9ca3af', textAlign: 'center', marginTop: '8px' }}>
        Connections: {MODULE_META_700_8.connections.join(' · ')} &nbsp;|&nbsp; {MODULE_META_700_8.titleEn} &nbsp;|&nbsp; {MODULE_META_700_8.date}
      </div>
    </div>
  );
}
