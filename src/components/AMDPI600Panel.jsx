/**
 * AMDPI600Panel.jsx — EFU 600.52.3 AM-DPI Audit Matrix Integration v1.0
 *
 * Súlyozott numerikus PFAS eszkalációs index panel.
 * Sections:
 *   1. Module header
 *   2. Változó kalibráció – P1,P2,B,I,D,T,S,Φ (8 db)
 *   3. AM-DPI index eredmény + normalizált összetevők
 *   4. Zóna táblázat (4 zóna)
 *   5. Trigger logika (3 trigger)
 *   6. EFU büntetés kalkulátor
 *   7. JSON kimenet
 *
 * Reference: EFU 600.52.3 AM-DPI v1.0 (2026-04-10)
 */

import { useState, useMemo } from 'react';
import {
  MODUL_META_52_3,
  AMDPI_VARIABLES,
  AMDPI_ZONES,
  AMDPI_TRIGGERS,
} from '../data/amdpi600_52_3.js';
import {
  calculateAMDPI,
  classifyAMDPIZone,
  evaluateAMDPITriggers,
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

function VarSlider({ varDef, value, onChange }) {
  const exceeded = varDef.threshold != null && !varDef.isSynergy && !varDef.isPhi && value > varDef.threshold;
  const phiExceeded = varDef.isPhi && value > varDef.threshold;
  const isAlert = exceeded || phiExceeded;

  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
        <span style={{ fontSize: '12px', fontWeight: '700', color: varDef.color }}>
          {varDef.id}
        </span>
        <span style={{ fontSize: '11px', color: '#6b7280', flex: 1, margin: '0 8px' }}>
          {varDef.name}
        </span>
        <span style={{ fontSize: '12px', fontWeight: '700', color: isAlert ? '#dc2626' : varDef.color, minWidth: '70px', textAlign: 'right' }}>
          {value.toFixed(varDef.step < 0.1 ? 2 : 1)} {varDef.unit}
          {isAlert && ' ⚠️'}
        </span>
      </div>
      <input
        type="range"
        min={varDef.min}
        max={varDef.max}
        step={varDef.step}
        value={value}
        onChange={(e) => onChange(varDef.id, parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: isAlert ? '#dc2626' : varDef.color }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#9ca3af' }}>
        <span>{varDef.min} {varDef.unit}</span>
        {varDef.threshold != null && (
          <span style={{ color: isAlert ? '#dc2626' : '#d97706', fontWeight: isAlert ? '700' : '400' }}>
            küszöb: {varDef.threshold} {varDef.unit}
            {varDef.threshold_fire != null && ` | fire: ${varDef.threshold_fire}`}
          </span>
        )}
        <span>{varDef.max} {varDef.unit}</span>
      </div>
    </div>
  );
}

function IndexGauge({ amdpi, zone }) {
  const maxDisplay = 8;
  const pct = Math.min((amdpi / maxDisplay) * 100, 100);
  return (
    <div style={{ textAlign: 'center', padding: '16px 0' }}>
      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>AM-DPI Index</div>
      <div style={{ fontSize: '52px', fontWeight: '900', color: zone.color, lineHeight: 1 }}>
        {amdpi.toFixed(3)}
      </div>
      <div style={{ margin: '10px 0' }}>
        <div style={{ height: '14px', background: '#e5e7eb', borderRadius: '7px', overflow: 'hidden', position: 'relative' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg, #16a34a, ${zone.color})`, transition: 'width 0.3s ease', borderRadius: '7px' }} />
          {[1.0, 2.5, 5.0].map((thr) => (
            <div key={thr} style={{
              position: 'absolute', top: 0, bottom: 0, left: `${(thr / maxDisplay) * 100}%`,
              width: '2px', background: 'white', opacity: 0.7,
            }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#9ca3af', marginTop: '2px' }}>
          <span>0</span><span>1.0</span><span>2.5</span><span>5.0</span><span>8</span>
        </div>
      </div>
      <Badge color={zone.color} size="14px">{zone.label} — {zone.sbe}</Badge>
      <div style={{ marginTop: '6px', fontSize: '11px', color: '#6b7280' }}>
        ×{zone.multiplier} EFU szorzó · {zone.action}
      </div>
    </div>
  );
}

function WeightBar({ id, normValue, weight, color }) {
  const contribution = normValue * weight;
  const pct = Math.min(contribution * 200, 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
      <span style={{ width: '24px', fontSize: '11px', fontWeight: '700', color }}>{id}</span>
      <div style={{ flex: 1, height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.3s' }} />
      </div>
      <span style={{ width: '42px', fontSize: '10px', textAlign: 'right', color: '#374151' }}>
        {contribution.toFixed(3)}
      </span>
      <span style={{ width: '30px', fontSize: '10px', color: '#9ca3af' }}>×{weight}</span>
    </div>
  );
}

function TriggerCard({ trigger, active }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 10px',
      borderRadius: '6px', background: active ? trigger.color + '14' : '#f9fafb',
      border: `1px solid ${active ? trigger.color + '50' : '#e5e7eb'}`,
      marginBottom: '6px',
    }}>
      <span style={{ fontSize: '16px', lineHeight: 1, marginTop: '1px' }}>{active ? '🔴' : '⚪'}</span>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: active ? trigger.color : '#374151' }}>
            {trigger.label}
          </span>
          <Badge color={active ? trigger.color : '#9ca3af'} size="10px">
            {active ? 'AKTÍV' : 'inaktív'}
          </Badge>
        </div>
        <div style={{ fontSize: '10px', color: '#6b7280', fontFamily: 'monospace', margin: '2px 0' }}>
          {trigger.condition}
        </div>
        <div style={{ fontSize: '10px', color: '#374151' }}>{trigger.action}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

const VAR_ORDER = ['P1', 'P2', 'B', 'I', 'D', 'T', 'S', 'Φ'];

export default function AMDPI600Panel() {
  const defaults = Object.fromEntries(
    VAR_ORDER.map((id) => [id, AMDPI_VARIABLES[id].default])
  );

  const [vals, setVals] = useState(defaults);
  const [showJSON, setShowJSON] = useState(false);

  function handleChange(id, v) {
    setVals((prev) => ({ ...prev, [id]: v }));
  }

  const result = useMemo(() => calculateAMDPI({
    P1: vals.P1, P2: vals.P2, B: vals.B, I: vals.I,
    D: vals.D, T: vals.T, S: vals.S, Φ: vals.Φ,
  }), [vals]);

  const { amdpi_index, zone, triggers, efu_penalty, variables } = result;
  const { raw, normalized } = variables;

  const jsonOutput = {
    module:      MODUL_META_52_3.code,
    amdpi_index,
    zone:        zone.zone,
    sbe:         zone.sbe,
    tier_status: triggers.tier_withdrawal ? 'TIER_1_VISSZAVONVA' : triggers.ceWS_red ? 'FORRAS_KARANTENBE' : 'NO_TIER',
    triggers: {
      ceWS_amber:       triggers.ceWS_amber,
      ceWS_red:         triggers.ceWS_red,
      fire_chief:       triggers.fire_chief,
      tier_withdrawal:  triggers.tier_withdrawal,
    },
    indicators: {
      P1: { value: raw.P1, threshold: 100, exceeded: raw.P1 > 100 },
      P2: { value: raw.P2, threshold: 20,  exceeded: raw.P2 > 20  },
      B:  raw.B, I: raw.I, D: raw.D, T: raw.T, S: raw.S, Φ: raw.Φ,
    },
    efu_penalty,
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '860px', margin: '24px auto', padding: '0 16px' }}>

      {/* ── 1. Header ──────────────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg, #0c4a6e 0%, #1e3a5f 100%)', color: 'white', borderRadius: '10px', padding: '20px 24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '10px', letterSpacing: '0.1em', opacity: 0.7, textTransform: 'uppercase', marginBottom: '4px' }}>
              EFU 600.52 szülőmodul · PFAS Audit Matrix · 600.7 integráció
            </div>
            <div style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '-0.02em' }}>
              600.52.3 AM-DPI Index
            </div>
            <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '4px' }}>
              {MODUL_META_52_3.description}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <Badge color="#0369a1">CFI-B</Badge>
            <Badge color="#dc2626">SEV-MAX</Badge>
            <Badge color="#374151">v1.0</Badge>
          </div>
        </div>
        <div style={{ marginTop: '12px', fontFamily: 'monospace', fontSize: '11px', opacity: 0.85, background: 'rgba(0,0,0,0.3)', borderRadius: '4px', padding: '6px 10px' }}>
          {MODUL_META_52_3.formula}
        </div>
      </div>

      {/* ── 2. Változók ────────────────────────────────────────────────────── */}
      <SectionBox title="Változó kalibráció (8 változó)" icon="🎛️" accentColor="#0369a1">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          {VAR_ORDER.map((id) => (
            <VarSlider
              key={id}
              varDef={AMDPI_VARIABLES[id]}
              value={vals[id]}
              onChange={handleChange}
            />
          ))}
        </div>
      </SectionBox>

      {/* ── 3. AM-DPI Eredmény ─────────────────────────────────────────────── */}
      <SectionBox title="AM-DPI Eszkalációs Index" icon="📊" accentColor={zone.color}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
          <IndexGauge amdpi={amdpi_index} zone={zone} />
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
              Súlyozott összetevők:
            </div>
            <WeightBar id="P1" normValue={normalized.P1} weight={0.15} color="#0369a1" />
            <WeightBar id="P2" normValue={normalized.P2} weight={0.25} color="#dc2626" />
            <WeightBar id="B"  normValue={normalized.B}  weight={0.10} color="#16a34a" />
            <WeightBar id="I"  normValue={normalized.I}  weight={0.20} color="#7c3aed" />
            <WeightBar id="T"  normValue={normalized.T}  weight={0.15} color="#ea580c" />
            <WeightBar id="D"  normValue={normalized.D}  weight={0.05} color="#d97706" />
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb', fontSize: '10px', color: '#6b7280' }}>
              <div>× S (szinergia): {raw.S.toFixed(2)}</div>
              <div>× (1 + Φ/1000): {(1 + raw.Φ / 1000).toFixed(4)}</div>
            </div>
          </div>
        </div>
      </SectionBox>

      {/* ── 4. Zóna táblázat ───────────────────────────────────────────────── */}
      <SectionBox title="4 Zóna Küszöbértékek" icon="📋">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              {['Zóna', 'AM-DPI', '600.7 szint', 'SBE Státusz', 'EFU szorzó', 'Intézkedés'].map((h) => (
                <th key={h} style={{ padding: '6px 10px', textAlign: 'left', fontWeight: '700', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {AMDPI_ZONES.map((z) => {
              const isActive = zone.id === z.id;
              return (
                <tr key={z.id} style={{ background: isActive ? z.color + '18' : 'white', borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '6px 10px' }}>
                    <span style={{ fontWeight: isActive ? '900' : '600', color: z.color }}>{z.label}</span>
                    {isActive && <span style={{ marginLeft: '6px', fontSize: '10px', color: z.color }}>◀</span>}
                  </td>
                  <td style={{ padding: '6px 10px', fontFamily: 'monospace', fontSize: '11px' }}>
                    {z.min} – {z.max === Infinity ? '∞' : z.max}
                  </td>
                  <td style={{ padding: '6px 10px', textAlign: 'center' }}>{z.level}</td>
                  <td style={{ padding: '6px 10px' }}><Badge color={z.color} size="10px">{z.sbe}</Badge></td>
                  <td style={{ padding: '6px 10px', textAlign: 'center', fontWeight: '700' }}>×{z.multiplier}</td>
                  <td style={{ padding: '6px 10px', fontSize: '11px' }}>{z.action}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </SectionBox>

      {/* ── 5. Triggerek ───────────────────────────────────────────────────── */}
      <SectionBox title="AM-DPI Trigger Logika (3 trigger)" icon="⚡" accentColor="#dc2626">
        {AMDPI_TRIGGERS.map((trig) => {
          const activeMap = {
            CEWS_AMBER: triggers.ceWS_amber,
            CEWS_RED:   triggers.ceWS_red,
            FIRE_CHIEF: triggers.fire_chief,
          };
          return <TriggerCard key={trig.id} trigger={trig} active={activeMap[trig.id] || false} />;
        })}
      </SectionBox>

      {/* ── 6. EFU Büntetés ────────────────────────────────────────────────── */}
      <SectionBox title="EFU Büntetés Kalkulátor" icon="💰" accentColor="#d97706">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
          {[
            { label: 'AM-DPI Index', value: amdpi_index.toFixed(3), color: zone.color },
            { label: 'EFU alap × szorzó', value: `150 × ${zone.multiplier}`, color: '#374151' },
            { label: 'EFU Büntetés', value: `${efu_penalty} EFU/fő`, color: '#dc2626' },
          ].map((item) => (
            <div key={item.label} style={{ background: '#f9fafb', borderRadius: '6px', padding: '12px' }}>
              <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>{item.label}</div>
              <div style={{ fontSize: '20px', fontWeight: '900', color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '10px', fontSize: '10px', color: '#6b7280', textAlign: 'center' }}>
          EFU büntetés = AM-DPI × 150 EFU/fő alap × {zone.multiplier} (×{zone.zone} zóna szorzó)
        </div>
      </SectionBox>

      {/* ── 7. JSON Kimenet ────────────────────────────────────────────────── */}
      <SectionBox title="Dashboard JSON Kimenet (205.3 kompatibilis)" icon="💾">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#374151', lineHeight: 1.8 }}>
            <div>600.52.3 AM-DPI STATUS</div>
            <div>├── INDEX: {amdpi_index.toFixed(3)} [{zone.label}]</div>
            <div>├── SBE: {zone.sbe}</div>
            <div>├── TIER: {jsonOutput.tier_status}</div>
            <div>├── TRIGGERS: {triggers.active_triggers.length > 0 ? triggers.active_triggers.join(' | ') : '—'}</div>
            <div>├── P2: {raw.P2}/{20} ng/mL [{raw.P2 > 20 ? '❌' : 'OK'}]  P1: {raw.P1}/{100} ng/L [{raw.P1 > 100 ? '❌' : 'OK'}]</div>
            <div>└── CFI-B: {raw.Φ}/{600} [{raw.Φ > 600 ? 'KARANTÉN ⚠️' : 'OK'}]</div>
          </div>
          <button
            onClick={() => setShowJSON((s) => !s)}
            style={{ fontSize: '11px', padding: '4px 12px', borderRadius: '4px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer', alignSelf: 'flex-start' }}
          >
            {showJSON ? 'Elrejtés' : 'JSON'}
          </button>
        </div>
        {showJSON && (
          <pre style={{ background: '#0c4a6e', color: '#bae6fd', borderRadius: '6px', padding: '14px', fontSize: '11px', overflow: 'auto', margin: 0 }}>
            {JSON.stringify(jsonOutput, null, 2)}
          </pre>
        )}
      </SectionBox>

      {/* Footer */}
      <div style={{ textAlign: 'center', fontSize: '10px', color: '#9ca3af', paddingBottom: '24px' }}>
        EFU 600.52.3 AM-DPI · Audit Matrix Detection Protocol Integration v1.0 · 2026-04-10
      </div>
    </div>
  );
}
