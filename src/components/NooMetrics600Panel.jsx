/**
 * NooMetrics600Panel.jsx — EFU 600.51 Noosphere Antifluxus Metrikák v1.0
 *
 * Sections:
 *   1. Modul fejléc
 *   2. 3 változó slider (DKI, NPR, AIF)
 *   3. CSI_noo eredmény + komponensek
 *   4. Zóna táblázat
 *   5. Aktív triggerek
 *   6. 600.51→700.x mapping
 *   7. HU Pilot Baseline
 *   8. Dashboard integráció (900.1 CDS / 900.2 CDP)
 *   9. JSON kimenet
 */

import { useState, useMemo } from 'react';
import {
  MODULE_META_51,
  NOO_VARIABLES,
  NOO_ZONES,
  NOO_TRIGGERS,
  NOO_700_MAPPING,
  HU_PILOT_BASELINE,
} from '../data/noosphereMetrics600_51.js';
import {
  calculateNooCSI,
  classifyNooCSIZone,
  evaluateNooCSITriggers,
} from '../logic/efu-engine.js';

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

function NooSlider({ variable, value, onChange }) {
  const isHigh = variable.id === 'AIF'
    ? value > (variable.threshold_critical || 0.7)
    : variable.id === 'NPR'
      ? value > (variable.threshold_trigger || 3.0)
      : value > (variable.threshold_orange || 6);
  const displayVal = variable.unit === 'h/nap' ? value.toFixed(1) : value.toFixed(variable.step < 0.05 ? 2 : 1);
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
        <span style={{ fontSize: '13px', fontWeight: '700', color: variable.color }}>{variable.code}</span>
        <span style={{ fontSize: '11px', color: '#6b7280', flex: 1, margin: '0 8px' }}>{variable.label}</span>
        <span style={{ fontSize: '13px', fontWeight: '800', color: isHigh ? '#dc2626' : variable.color, minWidth: '60px', textAlign: 'right' }}>
          {displayVal}{variable.unit ? ` ${variable.unit}` : ''}{isHigh ? ' ⚠️' : ''}
        </span>
      </div>
      <input
        type="range"
        min={variable.min}
        max={variable.max}
        step={variable.step}
        value={value}
        onChange={(e) => onChange(variable.id, parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: isHigh ? '#dc2626' : variable.color }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#9ca3af', marginTop: '2px' }}>
        <span>{variable.min}</span>
        <span style={{ color: '#d97706', fontStyle: 'italic' }}>{variable.keyFact}</span>
        <span>{variable.max}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function NooMetrics600Panel() {
  const initVars = () => {
    const v = {};
    for (const vr of NOO_VARIABLES) v[vr.id] = vr.default;
    return v;
  };

  const [varValues, setVarValues] = useState(initVars);
  const [showJson,  setShowJson]  = useState(false);

  const handleVarChange = (id, val) => setVarValues(prev => ({ ...prev, [id]: val }));

  const result = useMemo(
    () => calculateNooCSI({ ...varValues }),
    [varValues],
  );

  const { csi_noo, zone, triggers, components, diagnostics } = result;

  const progressPct = Math.min(100, (csi_noo / 10) * 100);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', fontSize: '13px', color: '#111827', maxWidth: '900px', margin: '0 auto', padding: '20px' }}>

      {/* 1. Header */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)', color: 'white', borderRadius: '10px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '4px' }}>
              EFU {MODULE_META_51.id} · {MODULE_META_51.series}
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>{MODULE_META_51.title}</h2>
            <div style={{ fontSize: '13px', opacity: 0.85, marginTop: '4px' }}>{MODULE_META_51.subtitle}</div>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <Badge color="#dc2626">{MODULE_META_51.mechanism_primary}</Badge>
            <Badge color="#7c3aed">{MODULE_META_51.mechanism_secondary}</Badge>
            <Badge color="#374151">{MODULE_META_51.status}</Badge>
          </div>
        </div>
        <div style={{ marginTop: '12px', background: 'rgba(0,0,0,0.25)', borderRadius: '6px', padding: '8px 12px', fontSize: '11px', fontFamily: 'monospace', color: '#fbbf24' }}>
          {MODULE_META_51.formula}
        </div>
        <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '9px', background: 'rgba(255,255,255,0.15)', padding: '2px 7px', borderRadius: '10px' }}>Szülőmodul: {MODULE_META_51.parent_module}</span>
          {MODULE_META_51.nexus.map(n => (
            <span key={n} style={{ fontSize: '9px', background: 'rgba(255,255,255,0.10)', padding: '2px 7px', borderRadius: '10px' }}>{n}</span>
          ))}
        </div>
        <div style={{ marginTop: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', padding: '8px 12px', fontSize: '10px' }}>
          🇭🇺 HU Pilot Baseline ({MODULE_META_51.hu_pilot_baseline.date}): DKI={MODULE_META_51.hu_pilot_baseline.DKI} · NPR={MODULE_META_51.hu_pilot_baseline.NPR} · AIF={MODULE_META_51.hu_pilot_baseline.AIF} → CSI_noo={MODULE_META_51.hu_pilot_baseline.CSI_noo} 🟠 {MODULE_META_51.hu_pilot_baseline.trigger_level}
        </div>
      </div>

      {/* 2. Variable sliders */}
      <SectionBox title="Noosphere Változók – DKI · NPR · AIF" icon="⚙️" accentColor="#d1d5db">
        {NOO_VARIABLES.map(vr => (
          <NooSlider key={vr.id} variable={vr} value={varValues[vr.id]} onChange={handleVarChange} />
        ))}
      </SectionBox>

      {/* 3. CSI result */}
      <SectionBox title="CSI_noo Eredmény" icon="📊" accentColor={zone.color}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center', background: zone.color, color: 'white', borderRadius: '10px', padding: '16px 24px', minWidth: '130px' }}>
            <div style={{ fontSize: '11px', opacity: 0.85, marginBottom: '4px' }}>CSI_noo</div>
            <div style={{ fontSize: '38px', fontWeight: '900', lineHeight: 1 }}>{csi_noo.toFixed(2)}</div>
            <div style={{ fontSize: '12px', marginTop: '6px', opacity: 0.9 }}>{zone.id}</div>
            <div style={{ fontSize: '11px', marginTop: '2px', opacity: 0.85 }}>{zone.status}</div>
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ marginBottom: '8px', width: '100%', background: '#e5e7eb', borderRadius: '6px', height: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPct}%`, background: zone.color, height: '100%', transition: 'width 0.3s' }} />
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280', lineHeight: '1.8' }}>
              <div>dki_norm (×0.4): <strong>{components.dki_norm.toFixed(3)}</strong> → contrib: <strong>{(0.4 * components.dki_norm).toFixed(3)}</strong></div>
              <div>npr_norm (×0.4): <strong>{components.npr_norm.toFixed(3)}</strong> → contrib: <strong>{(0.4 * components.npr_norm).toFixed(3)}</strong></div>
              <div>aif_norm (×0.2): <strong>{components.aif_norm.toFixed(3)}</strong> → contrib: <strong>{(0.2 * components.aif_norm).toFixed(3)}</strong></div>
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '4px', marginTop: '4px' }}>
                Konfidencia: <strong>{(diagnostics.confidence * 100).toFixed(0)}%</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Component bars */}
        <div style={{ marginTop: '14px' }}>
          <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase' }}>Komponens hozzájárulások</div>
          {NOO_VARIABLES.map(vr => {
            const normKey = `${vr.id.toLowerCase()}_norm`;
            const normVal = components[normKey] || 0;
            const contrib = vr.weight * normVal;
            const pct     = Math.min(100, (contrib / 10) * 100);
            return (
              <div key={vr.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                <span style={{ fontSize: '10px', fontWeight: '700', color: vr.color, minWidth: '32px' }}>{vr.code}</span>
                <div style={{ flex: 1, background: '#f3f4f6', borderRadius: '3px', height: '8px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, background: vr.color, height: '100%', transition: 'width 0.3s' }} />
                </div>
                <span style={{ fontSize: '10px', color: '#374151', minWidth: '40px', textAlign: 'right' }}>{contrib.toFixed(3)}</span>
              </div>
            );
          })}
        </div>
      </SectionBox>

      {/* 4. Zone table */}
      <SectionBox title="Zóna Táblázat – Noo-CSI Skála" icon="🌐" accentColor="#d1d5db">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              {['Zóna', 'CSI_noo', 'Státusz', 'CDP Szint', 'Beavatkozás'].map(h => (
                <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '700', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {NOO_ZONES.map(z => {
              const active = zone.id === z.id;
              return (
                <tr key={z.id} style={{ background: active ? z.bg : 'transparent', fontWeight: active ? '700' : '400' }}>
                  <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ color: z.color, fontWeight: '700' }}>{z.label}</span>
                    {active && <span style={{ marginLeft: '6px', fontSize: '9px', background: z.color, color: 'white', padding: '1px 5px', borderRadius: '4px' }}>AKTÍV</span>}
                  </td>
                  <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', color: '#374151' }}>{z.condition}</td>
                  <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', color: z.color, fontWeight: '600' }}>{z.status}</td>
                  <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', color: '#4b5563', fontSize: '10px' }}>{z.cdp_level}</td>
                  <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', color: '#4b5563', fontSize: '10px' }}>{z.action}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </SectionBox>

      {/* 5. Triggers */}
      <SectionBox title="Aktív Triggerek" icon="🚨" accentColor="#fca5a5">
        {NOO_TRIGGERS.map(trig => {
          const isActive = triggers.active_triggers.includes(trig.id);
          return (
            <div key={trig.id} style={{
              display: 'flex', gap: '10px', padding: '10px 12px', borderRadius: '6px', marginBottom: '8px',
              background: isActive ? '#fef2f2' : '#f9fafb',
              border: `1px solid ${isActive ? trig.color : '#e5e7eb'}`,
              opacity: isActive ? 1 : 0.6,
            }}>
              <div style={{ fontSize: '18px', lineHeight: 1, marginTop: '2px' }}>{isActive ? '🔴' : '⚪'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                  <span style={{ fontWeight: '700', color: trig.color, fontSize: '12px' }}>{trig.label}</span>
                  <Badge color={isActive ? trig.color : '#9ca3af'} size="10px">{trig.level}</Badge>
                </div>
                <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '3px' }}>
                  Feltétel: <code style={{ background: '#f3f4f6', padding: '1px 4px', borderRadius: '3px' }}>{trig.condition}</code>
                </div>
                <div style={{ fontSize: '10px', color: isActive ? '#dc2626' : '#6b7280', fontWeight: isActive ? '600' : '400' }}>
                  → {trig.action}
                </div>
                {trig.note && (
                  <div style={{ fontSize: '9px', color: '#9ca3af', marginTop: '2px', fontStyle: 'italic' }}>{trig.note}</div>
                )}
              </div>
            </div>
          );
        })}
      </SectionBox>

      {/* 6. 700.x mapping */}
      <SectionBox title="600.51 → 700.x Megoldási Mapping" icon="🗺️" accentColor="#bbf7d0">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              {['Probléma', 'Modul', 'Implementáció'].map(h => (
                <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '700', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {NOO_700_MAPPING.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? '#f9fafb' : 'white' }}>
                <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', color: '#dc2626', fontWeight: '600' }}>{row.problem}</td>
                <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6' }}><Badge color="#2563eb" size="10px">{row.module}</Badge></td>
                <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', color: '#4b5563' }}>{row.implementation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionBox>

      {/* 7. HU Pilot Baseline */}
      <SectionBox title={`HU Pilot Baseline – ${HU_PILOT_BASELINE.date}`} icon="🇭🇺" accentColor="#bfdbfe">
        <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '8px' }}>
          Forrás: {HU_PILOT_BASELINE.source}
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              {['Metrika', 'Érték', 'Státusz', 'Zóna'].map(h => (
                <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '700', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HU_PILOT_BASELINE.entries.map((e, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? '#f9fafb' : 'white' }}>
                <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', fontWeight: '600', color: '#374151' }}>{e.label}</td>
                <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', fontWeight: '700', color: '#111827' }}>{e.value}{e.unit ? ` ${e.unit}` : ''}</td>
                <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', fontSize: '14px' }}>{e.status}</td>
                <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', color: '#4b5563', fontSize: '10px' }}>{e.zone}{e.trigger ? ` · ${e.trigger}` : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionBox>

      {/* 8. Dashboard integration */}
      <SectionBox title="Dashboard Integráció – 900.1 CDS / 900.2 CDP" icon="🔗" accentColor="#e9d5ff">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              {['Változó', 'CDS Hatás (900.1)', 'CDP Hatás (900.2)', 'CDS Küszöb'].map(h => (
                <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '700', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {NOO_VARIABLES.map((vr, i) => (
              <tr key={vr.id} style={{ background: i % 2 === 0 ? '#f9fafb' : 'white' }}>
                <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ fontWeight: '700', color: vr.color }}>{vr.code}</span>
                  <span style={{ fontSize: '10px', color: '#6b7280', marginLeft: '6px' }}>{vr.label}</span>
                </td>
                <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', color: '#dc2626', fontWeight: '600' }}>{vr.cds_effect}</td>
                <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', color: '#7c3aed', fontWeight: '600' }}>{vr.cdp_effect}</td>
                <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', color: '#4b5563' }}>{vr.cds_threshold_label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionBox>

      {/* 9. JSON output */}
      <SectionBox title="JSON Kimenet" icon="📋" accentColor="#d1d5db">
        <button
          onClick={() => setShowJson(v => !v)}
          style={{ padding: '6px 14px', fontSize: '11px', background: '#374151', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '10px' }}
        >
          {showJson ? 'Elrejtés' : 'JSON megjelenítése'}
        </button>
        {showJson && (
          <pre style={{ background: '#f3f4f6', padding: '12px', borderRadius: '6px', fontSize: '10px', overflow: 'auto', maxHeight: '300px', margin: 0 }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </SectionBox>

    </div>
  );
}
