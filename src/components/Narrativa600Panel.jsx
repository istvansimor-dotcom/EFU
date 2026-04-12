/**
 * Narrativa600Panel.jsx — EFU 600.40–42 Narratíva Degradáció Modell v1.0
 *
 * M4 Narratíva Degrádáció – CEWS M4 hivatkozás
 * Almodulok: 600.41 Kognitív Narratíva (KNI) | 600.42 Érzelmi Narratíva (ENI)
 *
 * Sections:
 *   1. Module header + M4 hierarchia
 *   2. Változó kalibráció – N,C,E,F,R,D,S,T,P,Φ (10 db)
 *   3. NDI kalkulátor – főképlet eredmény + normalizált összetevők
 *   4. Almodulok – 600.41 KNI + 600.42 ENI
 *   5. Zóna táblázat (5 zóna)
 *   6. Trigger logika (4 trigger)
 *   7. CEWS M4 integráció
 *   8. Dashboard JSON kimenet
 *
 * Reference: EFU 600.40-42 v1.0 FINAL (2026-04-10)
 */

import { useState, useMemo } from 'react';
import {
  MODULE_META_40,
  N_VARIABLES,
  NDI_ZONES,
  M4_TRIGGERS,
  SUBMODULE_THRESHOLDS,
  DASHBOARD_EXAMPLE,
} from '../data/narrativa600_40.js';
import {
  calculateNDI,
  calculateKNI,
  calculateENI,
  classifyNDIZone,
  evaluateM4Triggers,
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

function VarSlider({ variable, value, onChange }) {
  const pct = ((value - variable.min) / (variable.max - variable.min)) * 100;
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
        <span style={{ fontSize: '12px', fontWeight: '600', color: variable.color }}>
          {variable.labelShort}
          {variable.submodule && (
            <span style={{ marginLeft: '4px', fontSize: '10px', color: '#6b7280' }}>({variable.submodule})</span>
          )}
        </span>
        <span style={{ fontSize: '11px', color: '#374151' }}>
          {variable.description}
        </span>
        <span style={{ fontSize: '13px', fontWeight: '700', color: variable.color, minWidth: '60px', textAlign: 'right' }}>
          {value.toFixed(variable.step < 0.1 ? 2 : 1)}{variable.unit ? ` ${variable.unit}` : ''}
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
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#9ca3af' }}>
        <span>{variable.min}{variable.unit ? ` ${variable.unit}` : ''}</span>
        {variable.threshold !== undefined && (
          <span style={{ color: '#d97706' }}>küszöb: {variable.threshold}{variable.unit ? ` ${variable.unit}` : ''}</span>
        )}
        <span>{variable.max}{variable.unit ? ` ${variable.unit}` : ''}</span>
      </div>
    </div>
  );
}

function NDIGauge({ ndi, zone }) {
  const maxDisplay = 10;
  const pct = Math.min((ndi / maxDisplay) * 100, 100);
  return (
    <div style={{ textAlign: 'center', padding: '16px 0' }}>
      <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>NDI Index</div>
      <div style={{ fontSize: '48px', fontWeight: '900', color: zone.color, lineHeight: 1 }}>
        {ndi.toFixed(3)}
      </div>
      <div style={{ marginTop: '8px', marginBottom: '8px' }}>
        <div style={{ height: '12px', background: '#e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: zone.color, transition: 'width 0.3s ease', borderRadius: '6px' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#9ca3af', marginTop: '2px' }}>
          <span>0</span><span>0.8</span><span>1.8</span><span>3.5</span><span>7.0</span><span>10</span>
        </div>
      </div>
      <Badge color={zone.color} size="14px">{zone.label} — {zone.m4_status}</Badge>
      <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px' }}>
        ×{zone.multiplier} súlyozás · {zone.action}
      </div>
    </div>
  );
}

function ComponentBar({ label, value, weight, color }) {
  const pct = Math.min(value * 100, 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
      <span style={{ width: '28px', fontSize: '11px', fontWeight: '700', color }}>{label}</span>
      <div style={{ flex: 1, height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '4px' }} />
      </div>
      <span style={{ width: '38px', fontSize: '10px', color: '#374151', textAlign: 'right' }}>
        {value.toFixed(3)}
      </span>
      {weight != null && (
        <span style={{ width: '32px', fontSize: '10px', color: '#9ca3af', textAlign: 'right' }}>
          ×{weight}
        </span>
      )}
    </div>
  );
}

function SubmoduleMeter({ code, label, formula, value, thresholdZones }) {
  const zone = thresholdZones.find((z) => {
    if (z.max !== undefined && z.min === undefined) return value < z.max;
    if (z.min !== undefined && z.max !== undefined) return value >= z.min && value < z.max;
    if (z.min !== undefined && z.max === undefined) return value >= z.min;
    return false;
  }) || thresholdZones[0];

  return (
    <div style={{ border: `1px solid ${zone?.color || '#e5e7eb'}30`, borderRadius: '6px', padding: '10px', background: '#fafafa' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <span style={{ fontSize: '11px', fontWeight: '700', color: '#374151' }}>{code} – {label}</span>
        <Badge color={zone?.color || '#6b7280'}>{zone?.label || '?'}</Badge>
      </div>
      <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '6px', fontFamily: 'monospace' }}>{formula}</div>
      <div style={{ fontSize: '28px', fontWeight: '900', color: zone?.color || '#374151', textAlign: 'center' }}>
        {value.toFixed(4)}
      </div>
      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '6px' }}>
        {thresholdZones.map((z, i) => (
          <span key={i} style={{
            fontSize: '9px', padding: '1px 6px', borderRadius: '3px',
            background: z.color + '22', color: z.color, fontWeight: '600',
          }}>
            {z.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function TriggerRow({ trigger, active }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px',
      borderRadius: '6px', background: active ? trigger.color + '12' : '#f9fafb',
      border: `1px solid ${active ? trigger.color + '40' : '#e5e7eb'}`,
      marginBottom: '6px',
    }}>
      <span style={{ fontSize: '16px', lineHeight: 1 }}>{active ? '🔴' : '⚪'}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: active ? trigger.color : '#374151' }}>
          {trigger.label} ({trigger.labelEn})
        </div>
        <div style={{ fontSize: '10px', color: '#6b7280', fontFamily: 'monospace', margin: '2px 0' }}>
          {trigger.condition}
        </div>
        <div style={{ fontSize: '10px', color: '#374151' }}>{trigger.action}</div>
      </div>
      <Badge color={active ? trigger.color : '#9ca3af'} size="10px">
        {active ? 'AKTÍV' : 'inaktív'}
      </Badge>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function Narrativa600Panel() {
  const defaults = Object.fromEntries(
    N_VARIABLES.map((v) => [v.id, v.default])
  );

  const [vars, setVars] = useState(defaults);
  const [showJSON, setShowJSON] = useState(false);

  function handleChange(id, val) {
    setVars((prev) => ({ ...prev, [id]: val }));
  }

  const result = useMemo(() => calculateNDI({
    N: vars.N, C: vars.C, E: vars.E, F: vars.F,
    R: vars.R, D: vars.D, S: vars.S, T: vars.T,
    P: vars.P, Phi: vars.Phi,
  }), [vars]);

  const { ndi_index, zone, m4_status, triggers, submodules, variables } = result;
  const { raw, normalized } = variables;

  const jsonOutput = {
    module:    MODULE_META_40.id,
    ndi_index: parseFloat(ndi_index.toFixed(4)),
    zone:      zone.id,
    m4_status,
    triggers: {
      m4_amber:            triggers.m4_amber,
      m4_red:              triggers.m4_red,
      narrative_emergency: triggers.narrative_emergency,
      rapid_polarization:  triggers.rapid_polarization,
    },
    submodules: {
      '600.41_kni': parseFloat(submodules.kni.toFixed(4)),
      '600.42_eni': parseFloat(submodules.eni.toFixed(4)),
    },
    variables: {
      N: raw.N, C: raw.C, E: raw.E, F: raw.F, R: raw.R,
      D: raw.D, S: raw.S, T: raw.T, P: raw.P, Phi: raw.Phi,
    },
    active_triggers: triggers.active_triggers,
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '860px', margin: '24px auto', padding: '0 16px' }}>

      {/* ── 1. Header ──────────────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #3b0764 100%)', color: 'white', borderRadius: '10px', padding: '20px 24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '10px', letterSpacing: '0.1em', opacity: 0.7, textTransform: 'uppercase', marginBottom: '4px' }}>
              EFU 600 sorozat · M4 Narratíva · CEWS integráció
            </div>
            <div style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '-0.02em' }}>
              600.40–42 Narratíva Degradáció
            </div>
            <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '4px' }}>
              {MODULE_META_40.subtitle}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <Badge color="#7c3aed">M4.COG</Badge>
            <Badge color="#be185d">M4.EMO</Badge>
            <Badge color="#374151">v1.0 FINAL</Badge>
          </div>
        </div>

        {/* Modul hierarchia */}
        <div style={{ marginTop: '14px', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', padding: '10px 14px', fontFamily: 'monospace', fontSize: '11px', lineHeight: 1.6 }}>
          <div>600.40 – Narratíva Fluxus Gátlás (Meta-modul)</div>
          <div style={{ paddingLeft: '12px' }}>├── 600.41 – Kognitív Narratíva (M4.COG) · KNI = C × F × (1-R) × T</div>
          <div style={{ paddingLeft: '12px' }}>├── 600.42 – Érzelmi Narratíva (M4.EMO) · ENI = E × P × D × S</div>
          <div style={{ paddingLeft: '12px' }}>└── CEWS M4 → NARRATÍVA DEGRÁDÁCIÓ trigger</div>
        </div>

        <div style={{ marginTop: '10px', fontFamily: 'monospace', fontSize: '11px', opacity: 0.85, background: 'rgba(0,0,0,0.3)', borderRadius: '4px', padding: '6px 10px' }}>
          NDI = (1–N) × (C×0.15 + E×0.18 + F×0.12 + D×0.08 + T×0.07 + P×0.05) × S × (1 + Φ/1000)
        </div>
      </div>

      {/* ── 2. Változók ────────────────────────────────────────────────────── */}
      <SectionBox title="Változó kalibráció (10 változó)" icon="🎛️" accentColor="#6d28d9">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          {N_VARIABLES.map((v) => (
            <VarSlider key={v.id} variable={v} value={vars[v.id]} onChange={handleChange} />
          ))}
        </div>
      </SectionBox>

      {/* ── 3. NDI Kalkulátor ──────────────────────────────────────────────── */}
      <SectionBox title="Narratíva Degradáció Index (NDI)" icon="📊" accentColor={zone.color}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
          <NDIGauge ndi={ndi_index} zone={zone} />
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
              Normalizált összetevők:
            </div>
            <ComponentBar label="C"  value={normalized.C * 0.15} weight={0.15} color="#0369a1" />
            <ComponentBar label="E"  value={normalized.E * 0.18} weight={0.18} color="#be185d" />
            <ComponentBar label="F"  value={normalized.F * 0.12} weight={0.12} color="#d97706" />
            <ComponentBar label="D"  value={normalized.D * 0.08} weight={0.08} color="#7c3aed" />
            <ComponentBar label="T"  value={normalized.T * 0.07} weight={0.07} color="#ea580c" />
            <ComponentBar label="P"  value={normalized.P * 0.05} weight={0.05} color="#dc2626" />
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb', fontSize: '10px', color: '#6b7280' }}>
              <div>× S (szinergia): {raw.S.toFixed(2)}</div>
              <div>× (1 + Φ/1000): {(1 + raw.Phi / 1000).toFixed(4)}</div>
              <div>× (1–N): {(1 - raw.N).toFixed(2)}</div>
            </div>
          </div>
        </div>
      </SectionBox>

      {/* ── 4. Almodulok ───────────────────────────────────────────────────── */}
      <SectionBox title="Almodulok: 600.41 KNI · 600.42 ENI" icon="🔬" accentColor="#0891b2">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <SubmoduleMeter
            code="600.41"
            label={SUBMODULE_THRESHOLDS['600.41'].label}
            formula={SUBMODULE_THRESHOLDS['600.41'].formula}
            value={submodules.kni}
            thresholdZones={SUBMODULE_THRESHOLDS['600.41'].zones}
          />
          <SubmoduleMeter
            code="600.42"
            label={SUBMODULE_THRESHOLDS['600.42'].label}
            formula={SUBMODULE_THRESHOLDS['600.42'].formula}
            value={submodules.eni}
            thresholdZones={SUBMODULE_THRESHOLDS['600.42'].zones}
          />
        </div>
      </SectionBox>

      {/* ── 5. Zóna táblázat ───────────────────────────────────────────────── */}
      <SectionBox title="5 Zóna Küszöbértékek" icon="📋">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              {['Zóna', 'NDI', 'M4 Státusz', 'Súlyozás', 'Intézkedés'].map((h) => (
                <th key={h} style={{ padding: '6px 10px', textAlign: 'left', fontWeight: '700', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {NDI_ZONES.map((z) => {
              const isActive = zone.id === z.id;
              return (
                <tr key={z.id} style={{ background: isActive ? z.color + '18' : 'white', borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '6px 10px' }}>
                    <span style={{ fontWeight: isActive ? '900' : '600', color: z.color }}>{z.label}</span>
                    {isActive && <span style={{ marginLeft: '6px', fontSize: '10px', color: z.color }}>◀ aktív</span>}
                  </td>
                  <td style={{ padding: '6px 10px', fontFamily: 'monospace', fontSize: '11px' }}>{z.condition}</td>
                  <td style={{ padding: '6px 10px' }}><Badge color={z.color} size="10px">{z.m4_status}</Badge></td>
                  <td style={{ padding: '6px 10px', textAlign: 'center', fontWeight: '700' }}>×{z.multiplier}</td>
                  <td style={{ padding: '6px 10px', fontSize: '11px' }}>{z.action}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </SectionBox>

      {/* ── 6. Trigger logika ──────────────────────────────────────────────── */}
      <SectionBox title="M4 Trigger Logika (4 trigger)" icon="⚡" accentColor="#dc2626">
        {M4_TRIGGERS.map((trig) => {
          const active = triggers.active_triggers.includes(trig.id);
          return <TriggerRow key={trig.id} trigger={trig} active={active} />;
        })}
      </SectionBox>

      {/* ── 7. CEWS M4 Integráció ──────────────────────────────────────────── */}
      <SectionBox title="CEWS M4 Integráció" icon="🔗" accentColor="#374151">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div style={{ background: '#f9fafb', borderRadius: '6px', padding: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', marginBottom: '8px', color: '#374151' }}>M4.NARRATIVA pipeline</div>
            <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#374151', lineHeight: 1.8 }}>
              <div>INPUT: NDI &gt; 1.8 → M4.DEGRADED</div>
              <div>TRIGGER: NDI &gt; 3.5 → CEWS RED</div>
              <div>FIRE_CHIEF: Φ &gt; 500 VAGY N &lt; 0.4</div>
              <div>700.4: Narratíva stabilizáció</div>
            </div>
          </div>
          <div style={{ background: '#f9fafb', borderRadius: '6px', padding: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', marginBottom: '8px', color: '#374151' }}>Jelenlegi CEWS státusz</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { label: 'M4 AMBER', active: triggers.m4_amber, color: '#d97706' },
                { label: 'M4 RED',   active: triggers.m4_red,   color: '#dc2626' },
                { label: 'FIRE CHIEF', active: triggers.narrative_emergency, color: '#111827' },
                { label: 'RAPID POLAR', active: triggers.rapid_polarization, color: '#be185d' },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.active ? item.color : '#d1d5db', flexShrink: 0 }} />
                  <span style={{ fontSize: '11px', fontWeight: item.active ? '700' : '400', color: item.active ? item.color : '#9ca3af' }}>
                    {item.label}
                  </span>
                  <span style={{ marginLeft: 'auto', fontSize: '10px', color: item.active ? item.color : '#9ca3af' }}>
                    {item.active ? '✓ AKTÍV' : '—'}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #e5e7eb', fontSize: '10px', color: '#6b7280' }}>
              <div>Φ: {raw.Phi} EFU {raw.Phi > 500 ? '⚠️ > 500' : `(küszöb: 500)`}</div>
              <div>N: {raw.N.toFixed(2)} {raw.N < 0.4 ? '⚠️ < 0.4' : `(küszöb: 0.4)`}</div>
            </div>
          </div>
        </div>
      </SectionBox>

      {/* ── 8. JSON kimenet ────────────────────────────────────────────────── */}
      <SectionBox title="Dashboard JSON Kimenet (205.3 kompatibilis)" icon="💾">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', color: '#6b7280' }}>Live output — aktuális értékek alapján</span>
          <button
            onClick={() => setShowJSON((s) => !s)}
            style={{ fontSize: '11px', padding: '4px 12px', borderRadius: '4px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}
          >
            {showJSON ? 'Elrejtés' : 'Megjelenítés'}
          </button>
        </div>
        {showJSON && (
          <pre style={{ background: '#1e1b4b', color: '#c4b5fd', borderRadius: '6px', padding: '14px', fontSize: '11px', overflow: 'auto', margin: 0 }}>
            {JSON.stringify(jsonOutput, null, 2)}
          </pre>
        )}
        {!showJSON && (
          <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#374151', background: '#f3f4f6', borderRadius: '6px', padding: '10px 14px', lineHeight: 1.8 }}>
            <div>600.40-42 NARRATÍVA STATUS</div>
            <div>├── INDEX: {ndi_index.toFixed(3)} [{zone.label}]</div>
            <div>├── M4: {m4_status}</div>
            <div>├── TRIGGERS: {triggers.active_triggers.length > 0 ? triggers.active_triggers.join(' | ') : 'nincs aktív trigger'}</div>
            <div>├── KNI (600.41): {submodules.kni.toFixed(4)}</div>
            <div>├── ENI (600.42): {submodules.eni.toFixed(4)}</div>
            <div>└── Φ: {raw.Phi} EFU · N: {raw.N.toFixed(2)} · S: {raw.S.toFixed(2)}</div>
          </div>
        )}
      </SectionBox>

      {/* Footer */}
      <div style={{ textAlign: 'center', fontSize: '10px', color: '#9ca3af', paddingBottom: '24px' }}>
        EFU 600.40–42 · Narratíva Degradáció Modell v1.0 FINAL · 2026-04-10 ·
        {' '}<a href="https://ppke.hu/storage/tinymce/uploads/II--kotet.pdf" target="_blank" rel="noreferrer" style={{ color: '#9ca3af' }}>PPKE referencia</a>
      </div>
    </div>
  );
}
