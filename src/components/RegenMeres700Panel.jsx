/**
 * RegenMeres700Panel.jsx — EFU 700.1.1 Regeneratív Mérési Protokoll (RMP) v1.0
 *
 * Modell: Talaj–HRV–ESM háromszög | IoT + farmer-as-sensor
 *
 * Sections:
 *   1. Module header
 *   2. Változó kalibráció – 3 réteg (Talaj / HRV / ESM / Rendszer)
 *   3. RMP index eredmény + réteg-pontszámok
 *   4. NET_EFU összefoglaló
 *   5. Zóna táblázat (5 zóna)
 *   6. Trigger logika (4 trigger)
 *   7. JSON kimenet
 */

import { useState, useMemo } from 'react';
import {
  MODULE_META_700_1_1,
  RMP_VARIABLES_SOIL,
  RMP_VARIABLES_HRV,
  RMP_VARIABLES_ESM,
  RMP_VARIABLES_SYSTEM,
  RMP_ZONES,
  RMP_TRIGGERS,
} from '../data/regenMeres700_1_1.js';
import { calculateRMP } from '../logic/efu-engine.js';

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
    if (variable.id === 'som_delta') return v.toFixed(2);
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
        <span style={{ fontSize: '12px', fontWeight: '700', color: variable.color, minWidth: '44px', textAlign: 'right' }}>
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
        <span>{variable.max}</span>
      </div>
    </div>
  );
}

function RMPGauge({ value, zone }) {
  const pct = Math.min((value / 10) * 100, 100);
  return (
    <div style={{ textAlign: 'center', padding: '16px 0' }}>
      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>RMP Index</div>
      <div style={{ fontSize: '52px', fontWeight: '900', color: zone.color, lineHeight: 1 }}>
        {value.toFixed(2)}
      </div>
      <div style={{ margin: '10px 0' }}>
        <div style={{ height: '14px', background: '#e5e7eb', borderRadius: '7px', overflow: 'hidden', position: 'relative' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg, #dc2626, ${zone.color})`, transition: 'width 0.3s', borderRadius: '7px' }} />
          {[3, 5, 6.5, 8].map((thr) => (
            <div key={thr} style={{
              position: 'absolute', top: 0, bottom: 0, left: `${thr * 10}%`,
              width: '2px', background: 'white', opacity: 0.7,
            }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#9ca3af', marginTop: '2px' }}>
          <span>0</span><span>3</span><span>5</span><span>6.5</span><span>8</span><span>10</span>
        </div>
      </div>
      <Badge color={zone.color} size="13px">{zone.label} — {zone.status}</Badge>
      <div style={{ marginTop: '6px', fontSize: '11px', color: '#6b7280' }}>{zone.action}</div>
    </div>
  );
}

function LayerBar({ label, score, color, weight }) {
  const pct = Math.min(score * 100, 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
      <span style={{ width: '90px', fontSize: '10px', fontWeight: '700', color }}>{label}</span>
      <div style={{ flex: 1, height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.3s' }} />
      </div>
      <span style={{ width: '36px', fontSize: '10px', textAlign: 'right', fontWeight: '700', color }}>{score.toFixed(3)}</span>
      <span style={{ width: '30px', fontSize: '9px', textAlign: 'right', color: '#9ca3af' }}>×{weight}</span>
    </div>
  );
}

function TriggerCard({ trigger, active }) {
  const isPositive = trigger.positive;
  const icon = isPositive ? (active ? '🟢' : '⚪') : (active ? '🔴' : '⚪');
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 10px',
      borderRadius: '6px', background: active ? trigger.color + '14' : '#f9fafb',
      border: `1px solid ${active ? trigger.color + '50' : '#e5e7eb'}`, marginBottom: '6px',
    }}>
      <span style={{ fontSize: '16px', lineHeight: 1, marginTop: '1px' }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: active ? trigger.color : '#374151' }}>
            {trigger.label}
            {isPositive && <span style={{ marginLeft: '6px', fontSize: '9px', background: '#16a34a', color: 'white', padding: '1px 5px', borderRadius: '3px' }}>POZITÍV</span>}
          </span>
          <Badge color={active ? trigger.color : '#9ca3af'} size="10px">{active ? 'AKTÍV' : 'inaktív'}</Badge>
        </div>
        <div style={{ fontSize: '10px', color: '#6b7280', fontFamily: 'monospace', margin: '2px 0' }}>{trigger.condition}</div>
        <div style={{ fontSize: '10px', color: '#374151' }}>{trigger.action}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

const ALL_VARS = [
  ...RMP_VARIABLES_SOIL, ...RMP_VARIABLES_HRV,
  ...RMP_VARIABLES_ESM, ...RMP_VARIABLES_SYSTEM,
];

export default function RegenMeres700Panel() {
  const defaultVals = Object.fromEntries(ALL_VARS.map((v) => [v.id, v.default]));
  const [vals, setVals] = useState(defaultVals);
  const [showJSON, setShowJSON] = useState(false);

  function handleChange(id, v) {
    setVals((prev) => ({ ...prev, [id]: v }));
  }

  const result = useMemo(() => calculateRMP(vals), [vals]);
  const { rmp_index, zone, triggers, layers, net_efu, sustainability } = result;

  const jsonOutput = {
    module: MODULE_META_700_1_1.id,
    rmp_index,
    zone: zone.id,
    status: zone.status,
    series: MODULE_META_700_1_1.series,
    net_efu_target: MODULE_META_700_1_1.net_efu_target,
    connections: MODULE_META_700_1_1.connections,
    triggers: triggers.active_triggers,
    layers,
    net_efu,
    sustainability,
    variables: vals,
    diagnostics: result.diagnostics,
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '860px', margin: '24px auto', padding: '0 16px' }}>

      {/* ── 1. Header ──────────────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)', color: 'white', borderRadius: '10px', padding: '20px 24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '10px', letterSpacing: '0.1em', opacity: 0.7, textTransform: 'uppercase', marginBottom: '4px' }}>
              EFU 700 · Regeneratív Beavatkozások · Tier {MODULE_META_700_1_1.tier}
            </div>
            <div style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '-0.02em' }}>
              700.1.1 Regeneratív Mérési Protokoll
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
              {MODULE_META_700_1_1.titleEn}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Badge color="#065f46">700 REGEN</Badge>
              <Badge color="#92400e">TALAJ+HRV+ESM</Badge>
              <Badge color="#374151">v1.0</Badge>
            </div>
            <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px' }}>{MODULE_META_700_1_1.status}</div>
          </div>
        </div>
        <div style={{ marginTop: '10px', fontFamily: 'monospace', fontSize: '10px', opacity: 0.85, background: 'rgba(0,0,0,0.3)', borderRadius: '4px', padding: '6px 10px' }}>
          {MODULE_META_700_1_1.formula}
        </div>
        <div style={{ marginTop: '8px', fontSize: '10px', opacity: 0.7 }}>
          Connections: {MODULE_META_700_1_1.connections.join(' · ')}
        </div>
        <div style={{ marginTop: '8px', fontSize: '11px', opacity: 0.9, fontStyle: 'italic' }}>
          {MODULE_META_700_1_1.subtitle}
        </div>
        <div style={{ marginTop: '10px', padding: '6px 10px', background: 'rgba(255,255,255,0.15)', borderRadius: '6px', fontSize: '11px' }}>
          🎯 NET_EFU cél: <strong>{MODULE_META_700_1_1.net_efu_target}</strong> · IoT: TDR + EC + Redox + LoRaWAN + farmer-as-sensor
        </div>
      </div>

      {/* ── 2. Változó kalibráció ───────────────────────────────────────────── */}
      <SectionBox title="Változó Kalibráció – 3 Háromszög Réteg" icon="🎛️" accentColor="#065f46">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          <div>
            <LayerHeader label="🌱 Talaj réteg" icon="" color="#92400e" />
            {RMP_VARIABLES_SOIL.map((v) => (
              <VarSlider key={v.id} variable={v} value={vals[v.id]} onChange={handleChange} />
            ))}
          </div>
          <div>
            <LayerHeader label="💓 HRV réteg (Gazda fiziológia)" icon="" color="#be185d" />
            {RMP_VARIABLES_HRV.map((v) => (
              <VarSlider key={v.id} variable={v} value={vals[v.id]} onChange={handleChange} />
            ))}
            <LayerHeader label="🧠 ESM réteg (Pszichológia)" icon="" color="#7c3aed" />
            {RMP_VARIABLES_ESM.map((v) => (
              <VarSlider key={v.id} variable={v} value={vals[v.id]} onChange={handleChange} />
            ))}
            <LayerHeader label="📡 Rendszer (IoT)" icon="" color="#0369a1" />
            {RMP_VARIABLES_SYSTEM.map((v) => (
              <VarSlider key={v.id} variable={v} value={vals[v.id]} onChange={handleChange} />
            ))}
          </div>
        </div>
      </SectionBox>

      {/* ── 3. RMP Index ────────────────────────────────────────────────────── */}
      <SectionBox title="RMP – Regeneratív Mérési Protokoll Index" icon="📊" accentColor={zone.color}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
          <RMPGauge value={rmp_index} zone={zone} />
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
              Réteg pontszámok:
            </div>
            <LayerBar label="🌱 Talaj" score={layers.soil_score} color="#92400e" weight="0.40" />
            <LayerBar label="💓 HRV" score={layers.hrv_score} color="#be185d" weight="0.30" />
            <LayerBar label="🧠 ESM" score={layers.esm_score} color="#7c3aed" weight="0.20" />
            <LayerBar label="📡 Rendszer" score={layers.system_q} color="#0369a1" weight="0.10" />
            <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #e5e7eb', fontSize: '10px', color: '#6b7280', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px' }}>
              <div>FLR total: <strong style={{ color: sustainability.flr_total > 15 ? '#ea580c' : '#374151' }}>{sustainability.flr_total.toFixed(1)}%</strong></div>
              <div>R_future: <strong style={{ color: '#065f46' }}>{sustainability.R_future.toFixed(3)}</strong></div>
            </div>
          </div>
        </div>
      </SectionBox>

      {/* ── 4. NET_EFU összefoglaló ─────────────────────────────────────────── */}
      <SectionBox title="NET_EFU Összefoglaló" icon="🌿" accentColor="#065f46">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          {[
            { label: 'Base EFU', value: net_efu.base_efu.toFixed(4), color: '#374151' },
            { label: 'NET_EFU / ha / félév', value: `${net_efu.net_efu_half.toFixed(3)} EFU-E`, color: net_efu.net_efu_half >= 3.08 ? '#16a34a' : '#ea580c' },
            { label: 'NET_EFU / ha / év', value: `${net_efu.net_efu_annual.toFixed(3)} EFU-E`, color: net_efu.net_efu_annual >= 6.16 ? '#16a34a' : '#ea580c' },
          ].map((item, i) => (
            <div key={i} style={{ padding: '10px 14px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>{item.label}</div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '10px', fontSize: '10px', color: '#6b7280', textAlign: 'center' }}>
          Cél: ≥ 3.08 EFU-E/ha/félév · Jelenlegi: {net_efu.net_efu_half.toFixed(3)} EFU-E
          {net_efu.net_efu_half >= 3.08
            ? <span style={{ marginLeft: '6px', color: '#16a34a', fontWeight: '700' }}>✓ CÉL TELJESÍTVE</span>
            : <span style={{ marginLeft: '6px', color: '#ea580c', fontWeight: '700' }}>⚠ CÉL NEM TELJESÍTVE</span>
          }
        </div>
      </SectionBox>

      {/* ── 5. Zóna táblázat ───────────────────────────────────────────────── */}
      <SectionBox title="5 Zóna Küszöbértékek" icon="📋">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              {['Zóna', 'RMP érték', 'Státusz', 'Intézkedés'].map((h) => (
                <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '700', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RMP_ZONES.map((z) => {
              const isActive = zone.id === z.id;
              return (
                <tr key={z.id} style={{ background: isActive ? z.color + '18' : 'white', borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '6px 8px' }}>
                    <span style={{ fontWeight: isActive ? '900' : '600', color: z.color }}>{z.label}</span>
                    {isActive && <span style={{ marginLeft: '6px', fontSize: '10px', color: z.color }}>◀</span>}
                  </td>
                  <td style={{ padding: '6px 8px', fontFamily: 'monospace', fontSize: '11px' }}>{z.condition}</td>
                  <td style={{ padding: '6px 8px' }}><Badge color={z.color} size="10px">{z.status}</Badge></td>
                  <td style={{ padding: '6px 8px', fontSize: '11px' }}>{z.action}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </SectionBox>

      {/* ── 6. Trigger logika ──────────────────────────────────────────────── */}
      <SectionBox title="Trigger Logika (4 trigger)" icon="⚡" accentColor="#065f46">
        {RMP_TRIGGERS.map((trigger) => (
          <TriggerCard key={trigger.id} trigger={trigger} active={triggers.active_triggers.includes(trigger.id)} />
        ))}
      </SectionBox>

      {/* ── 7. JSON kimenet ─────────────────────────────────────────────────── */}
      <SectionBox title="JSON Kimenet" icon="📄">
        <button
          onClick={() => setShowJSON((v) => !v)}
          style={{ fontSize: '11px', padding: '4px 12px', borderRadius: '4px', border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', marginBottom: '8px' }}
        >
          {showJSON ? 'Elrejt' : 'Megjelenít'}
        </button>
        {showJSON && (
          <pre style={{ fontSize: '10px', background: '#1e293b', color: '#e2e8f0', padding: '12px', borderRadius: '6px', overflow: 'auto', maxHeight: '300px' }}>
            {JSON.stringify(jsonOutput, null, 2)}
          </pre>
        )}
      </SectionBox>

    </div>
  );
}
