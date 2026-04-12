/**
 * MVP600Panel.jsx — EFU 600.10 Monitoring és Verifikáció (MVP) v1.0
 *
 * Mechanizmus: Self-verification protocol
 * 3 monitoring réteg + 5 verifikációs feltétel + 3 indikátor-kategória
 *
 * Sections:
 *   1. Module header
 *   2. Változó kalibráció (sliders)
 *   3. MVP index eredmény + változó-hozzájárulások
 *   4. Zóna táblázat (5 zóna)
 *   5. Trigger logika (4 trigger)
 *   6. Önverifikáció küszöbök
 *   7. CEWS integrációs táblázat
 *   8. JSON kimenet
 */

import { useState, useMemo } from 'react';
import {
  MODULE_META_10,
  MVP_VARIABLES,
  MVP_SYNERGY,
  MVP_PHI,
  MVP_ZONES,
  MVP_TRIGGERS,
  SELF_VERIFICATION_THRESHOLDS,
  CEWS_INTEGRATION_TABLE,
} from '../data/mvp600_10.js';
import { calculateMVP } from '../logic/efu-engine.js';

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
  const exceeded = variable.threshold > 0 ? value < variable.threshold : false;
  const warn = variable.threshold > 0 && value < variable.threshold;
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
        <span style={{ fontSize: '12px', fontWeight: '700', color: variable.color }}>
          {variable.id}
        </span>
        <span style={{ fontSize: '10px', color: '#6b7280', flex: 1, margin: '0 6px' }}>
          {variable.label}
        </span>
        <span style={{ fontSize: '12px', fontWeight: '700', color: warn ? '#dc2626' : variable.color, minWidth: '50px', textAlign: 'right' }}>
          {value.toFixed(2)}{warn ? ' ⚠️' : ''}
        </span>
      </div>
      <input
        type="range"
        min={variable.min}
        max={variable.max}
        step={variable.step}
        value={value}
        onChange={(e) => onChange(variable.id, parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: warn ? '#dc2626' : variable.color }}
      />
      {variable.threshold > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#9ca3af', marginTop: '2px' }}>
          <span>0</span>
          <span style={{ color: warn ? '#dc2626' : '#d97706', fontWeight: warn ? '700' : '400' }}>
            küszöb: {variable.threshold}
          </span>
          <span>1.0</span>
        </div>
      )}
    </div>
  );
}

function MVPGauge({ mvp, zone }) {
  const maxDisplay = 2;
  const pct = Math.min((mvp / maxDisplay) * 100, 100);
  return (
    <div style={{ textAlign: 'center', padding: '16px 0' }}>
      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>MVP Index</div>
      <div style={{ fontSize: '52px', fontWeight: '900', color: zone.color, lineHeight: 1 }}>
        {mvp.toFixed(3)}
      </div>
      <div style={{ margin: '10px 0' }}>
        <div style={{ height: '14px', background: '#e5e7eb', borderRadius: '7px', overflow: 'hidden', position: 'relative' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg, #16a34a, ${zone.color})`, transition: 'width 0.3s', borderRadius: '7px' }} />
          {[0.4, 0.7, 1.0, 1.5].map((thr) => (
            <div key={thr} style={{
              position: 'absolute', top: 0, bottom: 0, left: `${(thr / maxDisplay) * 100}%`,
              width: '2px', background: 'white', opacity: 0.7,
            }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#9ca3af', marginTop: '2px' }}>
          <span>0</span><span>0.4</span><span>0.7</span><span>1.0</span><span>1.5</span><span>2</span>
        </div>
      </div>
      <Badge color={zone.color} size="13px">{zone.label} — {zone.status}</Badge>
      <div style={{ marginTop: '6px', fontSize: '11px', color: '#6b7280' }}>
        {zone.action}
      </div>
    </div>
  );
}

function ContribBar({ id, value, contribution, color, positive = true }) {
  const pct = Math.min(Math.abs(contribution) * 500, 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
      <span style={{ width: '72px', fontSize: '10px', fontWeight: '700', color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{id}</span>
      <div style={{ flex: 1, height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.3s' }} />
      </div>
      <span style={{ width: '52px', fontSize: '10px', textAlign: 'right', color: '#374151' }}>
        {contribution.toFixed(3)}
      </span>
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

export default function MVP600Panel() {
  const defaultVals = {
    L1_mol: 0.6, L2_eco: 0.5, L3_gov: 0.45,
    V_ind: 0.6, V_rep: 0.65, V_pub: 0.5,
    S: 1.1, Phi: 200,
  };

  const [vals, setVals] = useState(defaultVals);
  const [showJSON, setShowJSON] = useState(false);

  function handleChange(id, v) {
    setVals((prev) => ({ ...prev, [id]: v }));
  }

  const result = useMemo(() => calculateMVP(vals), [vals]);
  const { mvp_index, zone, triggers, variable_contributions, diagnostics } = result;

  const jsonOutput = {
    module: MODULE_META_10.id,
    mvp_index,
    zone: zone.id,
    status: zone.status,
    mechanism: MODULE_META_10.mechanism,
    triggers: triggers.active_triggers,
    variables: vals,
    variable_contributions,
    diagnostics,
    nexus: MODULE_META_10.nexus,
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '860px', margin: '24px auto', padding: '0 16px' }}>

      {/* ── 1. Header ──────────────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1e3a5f 100%)', color: 'white', borderRadius: '10px', padding: '20px 24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '10px', letterSpacing: '0.1em', opacity: 0.7, textTransform: 'uppercase', marginBottom: '4px' }}>
              EFU 600 · Self-Verification Protocol · Status: {MODULE_META_10.status}
            </div>
            <div style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '-0.02em' }}>
              600.10 Monitoring és Verifikáció (MVP)
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
              {MODULE_META_10.titleEn}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Badge color="#0369a1">MONITORING</Badge>
              <Badge color="#7c3aed">VERIFICATION</Badge>
              <Badge color="#374151">v1.0</Badge>
            </div>
          </div>
        </div>
        <div style={{ marginTop: '12px', fontFamily: 'monospace', fontSize: '10px', opacity: 0.85, background: 'rgba(0,0,0,0.3)', borderRadius: '4px', padding: '6px 10px' }}>
          {MODULE_META_10.formula}
        </div>
        <div style={{ marginTop: '8px', fontSize: '10px', opacity: 0.7 }}>
          Nexus: {MODULE_META_10.nexus.join(' · ')}
        </div>
        <div style={{ marginTop: '8px', fontSize: '11px', opacity: 0.9, fontStyle: 'italic' }}>
          {MODULE_META_10.subtitle}
        </div>
      </div>

      {/* ── 2. Változó kalibráció ───────────────────────────────────────────── */}
      <SectionBox title="Változó Kalibráció (L1–L3, V_ind–V_pub, S, Phi)" icon="🎛️" accentColor="#1e3a5f">
        <div style={{ marginBottom: '8px', fontSize: '11px', fontWeight: '700', color: '#374151' }}>
          🔵 Monitoring rétegek
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          {MVP_VARIABLES.filter((v) => v.group === 'monitoring').map((variable) => (
            <VarSlider key={variable.id} variable={variable} value={vals[variable.id]} onChange={handleChange} />
          ))}
        </div>
        <div style={{ marginTop: '12px', marginBottom: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb', fontSize: '11px', fontWeight: '700', color: '#374151' }}>
          🔐 Verifikációs feltételek
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 24px' }}>
          {MVP_VARIABLES.filter((v) => v.group === 'verification').map((variable) => (
            <VarSlider key={variable.id} variable={variable} value={vals[variable.id]} onChange={handleChange} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
          {[MVP_SYNERGY, MVP_PHI].map((v) => {
            const val = vals[v.id];
            return (
              <div key={v.id} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: v.color }}>{v.id} – {v.label}</span>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: v.color }}>
                    {val.toFixed(v.id === 'S' ? 2 : 0)}
                  </span>
                </div>
                <input
                  type="range"
                  min={v.min}
                  max={v.max}
                  step={v.step}
                  value={val}
                  onChange={(e) => handleChange(v.id, parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: v.color }}
                />
              </div>
            );
          })}
        </div>
      </SectionBox>

      {/* ── 3. MVP Index ────────────────────────────────────────────────────── */}
      <SectionBox title="MVP – Monitoring and Verification Protocol Index" icon="📊" accentColor={zone.color}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
          <MVPGauge mvp={mvp_index} zone={zone} />
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
              Változó-hozzájárulások (súlyozott):
            </div>
            {MVP_VARIABLES.map((v) => (
              <ContribBar
                key={v.id}
                id={v.id}
                value={vals[v.id]}
                contribution={variable_contributions[v.id] || 0}
                color={v.color}
              />
            ))}
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb', fontSize: '10px', color: '#6b7280' }}>
              <div>× S (szinergia): {vals.S.toFixed(2)}</div>
              <div>× (1 + Phi/1000): {diagnostics.phi_effect.toFixed(4)}</div>
              <div style={{ marginTop: '4px', fontWeight: '700', color: '#374151' }}>
                Base: {diagnostics.base_index.toFixed(4)} → MVP: {mvp_index.toFixed(3)}
              </div>
            </div>
          </div>
        </div>
      </SectionBox>

      {/* ── 4. Zóna táblázat ───────────────────────────────────────────────── */}
      <SectionBox title="5 Zóna Küszöbértékek" icon="📋">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              {['Zóna', 'MVP érték', 'Státusz', 'Intézkedés'].map((h) => (
                <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '700', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MVP_ZONES.map((z) => {
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

      {/* ── 5. Trigger logika ──────────────────────────────────────────────── */}
      <SectionBox title="Trigger Logika (4 trigger)" icon="⚡" accentColor="#dc2626">
        {MVP_TRIGGERS.map((trigger) => (
          <TriggerCard
            key={trigger.id}
            trigger={trigger}
            active={triggers.active_triggers.includes(trigger.id)}
          />
        ))}
      </SectionBox>

      {/* ── 6. Önverifikáció küszöbök ──────────────────────────────────────── */}
      <SectionBox title="Önverifikáció Küszöbértékek" icon="✅">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {SELF_VERIFICATION_THRESHOLDS.map((item, i) => (
            <div key={i} style={{ padding: '8px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#15803d' }}>{item.label}</div>
              <div style={{ fontSize: '13px', fontWeight: '900', color: '#16a34a', margin: '2px 0' }}>{item.threshold}</div>
              <div style={{ fontSize: '10px', color: '#6b7280' }}>{item.description}</div>
            </div>
          ))}
        </div>
      </SectionBox>

      {/* ── 7. CEWS integrációs táblázat ───────────────────────────────────── */}
      <SectionBox title="CEWS Integrációs Táblázat" icon="🔗">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              {['Indikátor típus', 'Alapvonal', 'CEWS akció'].map((h) => (
                <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '700', fontSize: '10px', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CEWS_INTEGRATION_TABLE.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '6px 8px', fontWeight: '600', fontSize: '11px' }}>{row.indicator}</td>
                <td style={{ padding: '6px 8px', fontSize: '11px', color: '#6b7280' }}>{row.baseline}</td>
                <td style={{ padding: '6px 8px' }}><Badge color="#0369a1" size="10px">{row.update}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionBox>

      {/* ── 8. JSON kimenet ─────────────────────────────────────────────────── */}
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
