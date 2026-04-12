/**
 * ReligiousRegen700Panel.jsx — EFU 700.14 Vallási Rendszerek Regeneratív Fluxus Protokollja v1.1
 *
 * Sections:
 *   1. Module header (badge, title, antithesis, connections)
 *   2. CEWS 5-tengely sliders
 *   3. Audit protokoll sliders
 *   4. Kontextus slider
 *   5. CEWS Score eredmény
 *   6. CEWS Tengely radar (bar chart)
 *   7. Audit protokoll 5-lépés + verdikt
 *   8. EFU metrikák
 *   9. Reference models table
 *  10. Zóna táblázat
 *  11. Trigger logika
 *  12. JSON kimenet
 */

import { useState, useMemo } from 'react';
import {
  MODULE_META_700_14,
  REGEN_VARIABLES_CEWS,
  REGEN_VARIABLES_AUDIT,
  REGEN_VARIABLES_CONTEXT,
  REGEN_ZONES,
  REGEN_TRIGGERS,
} from '../data/religiousRegen700_14.js';
import { calculateReligiousRegen } from '../logic/efu-engine.js';

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
    if (variable.id === 'community_scale_k') return v.toLocaleString('hu-HU') + ' k';
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

// ---------------------------------------------------------------------------
// Main Panel
// ---------------------------------------------------------------------------

export default function ReligiousRegen700Panel() {
  const buildDefaults = (vars) => {
    const d = {};
    vars.forEach(v => { d[v.id] = v.default; });
    return d;
  };

  const [vals, setVals] = useState({
    ...buildDefaults(REGEN_VARIABLES_CEWS),
    ...buildDefaults(REGEN_VARIABLES_AUDIT),
    ...buildDefaults(REGEN_VARIABLES_CONTEXT),
  });

  const handleChange = (id, value) => setVals(prev => ({ ...prev, [id]: value }));

  const result = useMemo(() => calculateReligiousRegen(vals), [vals]);
  const { cews_score, cews_score_0_10, t700_14_active, zone, triggers, audit, efu, reference_models } = result;

  const [showJson, setShowJson] = useState(false);

  const CEWS_AXES_META = [
    { id: 'm3_identity',  label: 'M3 IDENTITY',  weight: '20%', color: '#7c3aed' },
    { id: 'm4_cognitive', label: 'M4 COGNITIVE', weight: '20%', color: '#6d28d9' },
    { id: 'm8_time',      label: 'M8 TIME',      weight: '15%', color: '#b45309' },
    { id: 'm2_material',  label: 'M2 MATERIAL',  weight: '25%', color: '#0891b2' },
    { id: 'm1_energy',    label: 'M1 ENERGY',    weight: '20%', color: '#16a34a' },
  ];

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif", maxWidth: '900px', margin: '32px auto', padding: '0 16px', color: '#111827' }}>

      {/* ── 1. Header ── */}
      <div style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 60%, #a855f7 100%)', color: 'white', borderRadius: '10px', padding: '20px 24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              EFU {MODULE_META_700_14.id} · {MODULE_META_700_14.series} · v{MODULE_META_700_14.version}
            </div>
            <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '800' }}>{MODULE_META_700_14.title}</h2>
            <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>T₇₀₀.₁₄ Transzformátor: S_antiflux → S_regen | CEWS 5-tengely | Audit protokoll</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Badge color="rgba(255,255,255,0.25)" size="10px">{MODULE_META_700_14.status}</Badge>
              <Badge color="rgba(220,38,38,0.8)" size="10px">⚔ {MODULE_META_700_14.antithesis}</Badge>
              <Badge color="rgba(255,255,255,0.2)" size="10px">Tier {MODULE_META_700_14.tier}</Badge>
            </div>
            <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {MODULE_META_700_14.connections.map(c => (
                <Badge key={c} color="rgba(255,255,255,0.15)" size="9px">{c}</Badge>
              ))}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '32px', fontWeight: '900', lineHeight: 1 }}>{cews_score_0_10.toFixed(2)}</div>
            <div style={{ fontSize: '11px', opacity: 0.8 }}>CEWS Score (0–10)</div>
            <div style={{ marginTop: '6px' }}>
              <Badge color={zone.color} size="11px">{zone.label}</Badge>
            </div>
            {t700_14_active && (
              <div style={{ marginTop: '6px' }}>
                <Badge color="#16a34a" size="10px">⭐ T₇₀₀.₁₄ AKTÍV</Badge>
              </div>
            )}
          </div>
        </div>
        <div style={{ marginTop: '12px', padding: '8px 12px', background: 'rgba(255,255,255,0.15)', borderRadius: '6px', fontSize: '11px' }}>
          <span style={{ opacity: 0.8 }}>Formula: </span>
          <code style={{ fontFamily: 'monospace', fontSize: '11px' }}>{MODULE_META_700_14.formula}</code>
        </div>
      </div>

      {/* ── 2. CEWS 5-Tengely Sliders ── */}
      <SectionBox title="CEWS 5-Tengely Kalibráció" icon="🔮" accentColor="#e9d5ff">
        <LayerHeader label="CEWS 5-Tengely (M1 M2 M3 M4 M8)" icon="✨" color="#7c3aed" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 28px' }}>
          <div>
            {REGEN_VARIABLES_CEWS.slice(0, 3).map(v => (
              <VarSlider key={v.id} variable={v} value={vals[v.id]} onChange={handleChange} />
            ))}
          </div>
          <div>
            {REGEN_VARIABLES_CEWS.slice(3).map(v => (
              <VarSlider key={v.id} variable={v} value={vals[v.id]} onChange={handleChange} />
            ))}
          </div>
        </div>
      </SectionBox>

      {/* ── 3. Audit Protokoll Sliders ── */}
      <SectionBox title="Audit Protokoll Változók" icon="📋" accentColor="#e9d5ff">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 28px' }}>
          <div>
            <LayerHeader label="Negatív Tényezők (RCR, MROI_gap)" icon="⚠️" color="#dc2626" />
            {REGEN_VARIABLES_AUDIT.filter(v => !v.positive).map(v => (
              <VarSlider key={v.id} variable={v} value={vals[v.id]} onChange={handleChange} />
            ))}
          </div>
          <div>
            <LayerHeader label="Pozitív Tényezők (IQF, P_intent)" icon="✅" color="#7c3aed" />
            {REGEN_VARIABLES_AUDIT.filter(v => v.positive).map(v => (
              <VarSlider key={v.id} variable={v} value={vals[v.id]} onChange={handleChange} />
            ))}
            <LayerHeader label="Kontextus" icon="👥" color="#374151" />
            {REGEN_VARIABLES_CONTEXT.map(v => (
              <VarSlider key={v.id} variable={v} value={vals[v.id]} onChange={handleChange} />
            ))}
          </div>
        </div>
      </SectionBox>

      {/* ── 5. CEWS Score ── */}
      <SectionBox title="CEWS Score Eredmény" icon="📊" accentColor="#e9d5ff">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
          <div style={{ padding: '14px', background: zone.bg || '#f5f3ff', borderRadius: '8px', border: `2px solid ${zone.color}40`, textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>CEWS Score (0–1)</div>
            <div style={{ fontSize: '36px', fontWeight: '900', color: zone.color }}>{cews_score.toFixed(3)}</div>
          </div>
          <div style={{ padding: '14px', background: '#eff6ff', borderRadius: '8px', border: `2px solid #0369a140`, textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>CEWS Score (0–10)</div>
            <div style={{ fontSize: '36px', fontWeight: '900', color: '#0369a1' }}>{cews_score_0_10.toFixed(2)}</div>
          </div>
        </div>
        <div style={{ padding: '10px 14px', background: t700_14_active ? '#f0fdf4' : '#faf5ff', borderRadius: '6px', border: `1px solid ${t700_14_active ? '#86efac' : '#e9d5ff'}`, fontSize: '11px', color: t700_14_active ? '#166534' : '#7c3aed', textAlign: 'center', fontWeight: '700' }}>
          {t700_14_active
            ? '✅ T₇₀₀.₁₄ AKTÍV – S_antiflux → S_regen transzformáció teljes | Stack hatékonyság +' + efu.stack_efficiency_bonus + '%'
            : '⏳ T₇₀₀.₁₄ NEM AKTÍV – Feltételek: CEWS≥0.7 + RCR<0.3 + MROI_gap<0.2 + IQF≥0.6'
          }
        </div>
      </SectionBox>

      {/* ── 6. CEWS Tengely Radar ── */}
      <SectionBox title="CEWS Tengely Vizualizáció" icon="🕸" accentColor="#e9d5ff">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '6px' }}>
          {CEWS_AXES_META.map(axis => {
            const value = vals[axis.id] ?? 0;
            const pct = Math.round(value * 100);
            return (
              <div key={axis.id} style={{ marginBottom: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: axis.color }}>{axis.label}</span>
                  <span style={{ fontSize: '10px', color: '#6b7280' }}>súly: {axis.weight}</span>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: axis.color }}>{value.toFixed(2)}</span>
                </div>
                <div style={{ background: '#f3f4f6', borderRadius: '4px', height: '10px', overflow: 'hidden' }}>
                  <div style={{ background: axis.color, height: '100%', width: `${pct}%`, borderRadius: '4px', transition: 'width 0.3s' }} />
                </div>
              </div>
            );
          })}
        </div>
      </SectionBox>

      {/* ── 7. Audit Protokoll 5-lépés + Verdikt ── */}
      <SectionBox title="Audit Protokoll – 5 Lépés + Verdikt" icon="🔍" accentColor="#e9d5ff">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
          {[
            { step: '1', label: 'CEWS_score számítás', value: cews_score.toFixed(3), pass: audit.cews_pass, note: 'CEWS ≥ 0.7 szükséges' },
            { step: '2', label: 'RCR mérés', value: audit.rcr.toFixed(2), pass: audit.rcr_pass, note: 'RCR < 0.3 szükséges' },
            { step: '3', label: 'MROI_gap', value: audit.mroi_gap.toFixed(2), pass: audit.mroi_pass, note: 'MROI_gap < 0.2 szükséges' },
            { step: '4', label: 'IQF validáció', value: audit.iqf.toFixed(2), pass: audit.iqf_pass, note: 'IQF ≥ 0.6 szükséges' },
          ].map(item => (
            <div key={item.step} style={{ padding: '10px', background: item.pass ? '#f0fdf4' : '#fef2f2', borderRadius: '8px', border: `1px solid ${item.pass ? '#86efac' : '#fca5a5'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', fontWeight: '700', color: '#6b7280' }}>Lépés {item.step}: {item.label}</span>
                <span style={{ fontSize: '16px' }}>{item.pass ? '✓' : '✗'}</span>
              </div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: item.pass ? '#16a34a' : '#dc2626' }}>{item.value}</div>
              <div style={{ fontSize: '9px', color: '#9ca3af' }}>{item.note}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: '8px 12px', background: '#faf5ff', borderRadius: '6px', border: '1px solid #e9d5ff', fontSize: '11px', color: '#7c3aed', marginBottom: '10px' }}>
          Lépés 5 – P_intent besorolás: <strong style={{ color: audit.p_intent >= 0.7 ? '#16a34a' : audit.p_intent >= 0.4 ? '#ca8a04' : '#dc2626' }}>
            {audit.p_intent >= 0.7 ? 'Optimizáló' : audit.p_intent >= 0.4 ? 'Stabilizáló' : 'Hatalmi'}
          </strong> (P_intent = {audit.p_intent.toFixed(2)})
        </div>
        <div style={{ padding: '14px', background: t700_14_active ? '#f0fdf4' : '#fef2f2', borderRadius: '8px', border: `2px solid ${t700_14_active ? '#16a34a' : '#dc2626'}`, textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: '900', color: t700_14_active ? '#166534' : '#dc2626' }}>
            VERDIKT: CEWS&gt;0.7 + RCR&lt;0.3 = {t700_14_active ? '✅ REGENERATÍV' : '❌ NEM TELJESÜL'}
          </div>
          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
            {t700_14_active
              ? 'T₇₀₀.₁₄(S_antiflux) = S_regen – transzformáció aktív, stack +8-12%'
              : 'Hiányzó feltételek: ' + [!audit.cews_pass && 'CEWS<0.7', !audit.rcr_pass && 'RCR≥0.3', !audit.mroi_pass && 'MROI_gap≥0.2', !audit.iqf_pass && 'IQF<0.6'].filter(Boolean).join(', ')
            }
          </div>
        </div>
      </SectionBox>

      {/* ── 8. EFU Metrikák ── */}
      <SectionBox title="EFU Metrikák" icon="⚡" accentColor="#e9d5ff">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
          {[
            { label: 'HMI/fő', value: '+' + efu.hmi_per_capita.toFixed(3), unit: 'EFU-E', color: '#7c3aed', note: 'CEWS × 1.5 (max 1.8)' },
            { label: 'NET EFU/év', value: Math.round(efu.net_efu_annual).toLocaleString('hu-HU'), unit: 'EFU-E', color: '#6d28d9', note: `${vals.community_scale_k}k fő alap` },
            { label: 'R_future', value: efu.R_future.toFixed(3), unit: '', color: '#0369a1', note: '1.0 + CEWS×0.2' },
            { label: 'Interstitium +', value: '+' + efu.interstitium_gain_pct.toFixed(1), unit: '%', color: '#a855f7', note: 'CEWS × 35 (max 40%)' },
            { label: 'Stack hatékonyság', value: t700_14_active ? '+' + efu.stack_efficiency_bonus : '—', unit: t700_14_active ? '%' : '', color: t700_14_active ? '#16a34a' : '#9ca3af', note: 'T₇₀₀.₁₄ aktív esetén +8-12%' },
            { label: 'NET EFU ref', value: '+1.5', unit: 'EFU-E/fő', color: '#7c3aed', note: 'HMI referencia érték' },
          ].map((m, i) => (
            <div key={i} style={{ background: '#faf5ff', border: `1px solid ${m.color}30`, borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{m.label}</div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: m.color }}>{m.value}<span style={{ fontSize: '13px', fontWeight: '600' }}> {m.unit}</span></div>
              <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px' }}>{m.note}</div>
            </div>
          ))}
        </div>
      </SectionBox>

      {/* ── 9. Reference Models ── */}
      <SectionBox title="Referencia Modellek" icon="🕍" accentColor="#e9d5ff">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              {['Modell', 'EFU↓', 'η(W)', 'MROI', 'RCR', 'CEWS', 'Státusz'].map(h => (
                <th key={h} style={{ padding: '6px 10px', textAlign: 'left', fontWeight: '700', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reference_models.map((m, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', background: i === 0 ? '#faf5ff' : 'transparent' }}>
                <td style={{ padding: '7px 10px', fontWeight: '700', color: '#7c3aed' }}>{m.name}</td>
                <td style={{ padding: '7px 10px', color: '#16a34a', fontWeight: '700' }}>{m.efu_reduction}</td>
                <td style={{ padding: '7px 10px', color: '#374151' }}>{m.eta_w}</td>
                <td style={{ padding: '7px 10px', color: '#374151' }}>{m.mroi}</td>
                <td style={{ padding: '7px 10px', color: '#374151' }}>{m.rcr}</td>
                <td style={{ padding: '7px 10px', color: '#374151' }}>{m.cews}</td>
                <td style={{ padding: '7px 10px' }}><Badge color="#16a34a" size="10px">{m.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionBox>

      {/* ── 10. Zóna táblázat ── */}
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
            {REGEN_ZONES.map(z => {
              const isActive = zone.id === z.id;
              return (
                <tr key={z.id} style={{ background: isActive ? (z.bg || '#f5f3ff') : 'transparent', fontWeight: isActive ? '700' : '400', borderBottom: '1px solid #f3f4f6' }}>
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

      {/* ── 11. Triggers ── */}
      <SectionBox title="Trigger Logika – 4 Küszöb" icon="⚠️" accentColor="#e5e7eb">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {REGEN_TRIGGERS.map(t => {
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

      {/* ── 12. JSON output ── */}
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
        Connections: {MODULE_META_700_14.connections.join(' · ')} &nbsp;|&nbsp; {MODULE_META_700_14.titleEn} &nbsp;|&nbsp; {MODULE_META_700_14.date}
      </div>
    </div>
  );
}
