/**
 * ReligiousFlux600Panel.jsx — EFU 600.82 Vallási Identitás Antiflux v1.0
 *
 * M3 IDENTITY (PRIMARY) | M11 BIO-COG (SECONDARY)
 * EFU nem értékítéletet alkot – kizárólag biofizikai fluxus-hatásokat mér
 *
 * Sections:
 *   1. Module header
 *   2. Változó kalibráció (sliders)
 *   3. RIA index eredmény + hozzájárulások
 *   4. Zóna táblázat (5 zóna)
 *   5. Trigger logika (4 trigger)
 *   6. CEWS tengelyek
 *   7. Pozitív referenciák
 *   8. JSON kimenet
 */

import { useState, useMemo } from 'react';
import {
  MODULE_META_82,
  RIA_VARIABLES,
  RIA_SYNERGY,
  RIA_PHI,
  RIA_ZONES,
  RIA_TRIGGERS,
  CEWS_AXES,
  POSITIVE_REFERENCES,
} from '../data/religiousFlux600_82.js';
import { calculateRIA } from '../logic/efu-engine.js';

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
  const isPositive = variable.positive;
  const warn = isPositive ? false : value > variable.threshold && variable.threshold > 0;
  const highlight = isPositive && value > 0.6;

  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
        <span style={{ fontSize: '12px', fontWeight: '700', color: variable.color }}>
          {variable.id}
          {isPositive && (
            <span style={{ marginLeft: '5px', fontSize: '9px', background: '#16a34a', color: 'white', padding: '1px 5px', borderRadius: '3px' }}>+</span>
          )}
        </span>
        <span style={{ fontSize: '10px', color: '#6b7280', flex: 1, margin: '0 6px' }}>
          {variable.label}
        </span>
        <span style={{ fontSize: '12px', fontWeight: '700', color: warn ? '#dc2626' : highlight ? '#16a34a' : variable.color, minWidth: '50px', textAlign: 'right' }}>
          {value.toFixed(2)}{warn ? ' ⚠️' : highlight ? ' ✓' : ''}
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
      {variable.note && (
        <div style={{ fontSize: '9px', color: '#16a34a', fontStyle: 'italic', marginTop: '2px' }}>⚑ {variable.note}</div>
      )}
    </div>
  );
}

function RIAGauge({ ria, zone }) {
  const maxDisplay = 1.5;
  const pct = Math.min((ria / maxDisplay) * 100, 100);
  return (
    <div style={{ textAlign: 'center', padding: '16px 0' }}>
      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>RIA Index</div>
      <div style={{ fontSize: '52px', fontWeight: '900', color: zone.color, lineHeight: 1 }}>
        {ria.toFixed(3)}
      </div>
      <div style={{ margin: '10px 0' }}>
        <div style={{ height: '14px', background: '#e5e7eb', borderRadius: '7px', overflow: 'hidden', position: 'relative' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg, #16a34a, ${zone.color})`, transition: 'width 0.3s', borderRadius: '7px' }} />
          {[0.1, 0.3, 0.6, 1.0].map((thr) => (
            <div key={thr} style={{
              position: 'absolute', top: 0, bottom: 0, left: `${(thr / maxDisplay) * 100}%`,
              width: '2px', background: 'white', opacity: 0.7,
            }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#9ca3af', marginTop: '2px' }}>
          <span>0</span><span>0.1</span><span>0.3</span><span>0.6</span><span>1.0</span><span>1.5</span>
        </div>
      </div>
      <Badge color={zone.color} size="13px">{zone.label} — {zone.status}</Badge>
      <div style={{ marginTop: '6px', fontSize: '11px', color: '#6b7280' }}>
        {zone.action}
      </div>
    </div>
  );
}

function ContribBar({ id, contribution, color, positive }) {
  const isNeg = contribution < 0;
  const pct = Math.min(Math.abs(contribution) * 400, 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
      <span style={{ width: '80px', fontSize: '10px', fontWeight: '700', color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {id}{positive ? ' (−RIA)' : ''}
      </span>
      <div style={{ flex: 1, height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: isNeg ? '#16a34a' : color, borderRadius: '4px', transition: 'width 0.3s' }} />
      </div>
      <span style={{ width: '52px', fontSize: '10px', textAlign: 'right', color: isNeg ? '#16a34a' : '#374151', fontWeight: isNeg ? '700' : '400' }}>
        {contribution.toFixed(3)}
      </span>
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
      border: `1px solid ${active ? trigger.color + '50' : '#e5e7eb'}`,
      marginBottom: '6px',
    }}>
      <span style={{ fontSize: '16px', lineHeight: 1, marginTop: '1px' }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: active ? trigger.color : '#374151' }}>
            {trigger.label}
            {isPositive && (
              <span style={{ marginLeft: '6px', fontSize: '9px', background: '#16a34a', color: 'white', padding: '1px 5px', borderRadius: '3px' }}>
                POZITÍV
              </span>
            )}
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

const VAR_COLORS = {
  cogn_lock:    '#7c3aed',
  time_distort: '#d97706',
  rcr:          '#ea580c',
  sac_infra:    '#0369a1',
  flux_amp:     '#16a34a',
};

export default function ReligiousFlux600Panel() {
  const defaultVals = {
    cogn_lock: 0.5, time_distort: 0.45, rcr: 0.50,
    sac_infra: 0.40, flux_amp: 0.35,
    S: 1.0, Phi: 150,
  };

  const [vals, setVals] = useState(defaultVals);
  const [showJSON, setShowJSON] = useState(false);

  function handleChange(id, v) {
    setVals((prev) => ({ ...prev, [id]: v }));
  }

  const result = useMemo(() => calculateRIA(vals), [vals]);
  const { ria_index, zone, triggers, variable_contributions, diagnostics } = result;

  const jsonOutput = {
    module: MODULE_META_82.id,
    ria_index,
    zone: zone.id,
    status: zone.status,
    mechanism_primary: MODULE_META_82.mechanism_primary,
    mechanism_secondary: MODULE_META_82.mechanism_secondary,
    twin_module: MODULE_META_82.twin_module,
    doi: MODULE_META_82.doi,
    triggers: {
      active: triggers.active_triggers,
      cognitive_loop: triggers.cognitive_loop,
      mroi_distortion: triggers.mroi_distortion,
      flux_amplifier: triggers.flux_amplifier,
      system_entropy: triggers.system_entropy,
    },
    variables: vals,
    variable_contributions,
    diagnostics,
    nexus: MODULE_META_82.nexus,
    note: MODULE_META_82.note,
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '860px', margin: '24px auto', padding: '0 16px' }}>

      {/* ── 1. Header ──────────────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg, #3b0764 0%, #1e1b4b 100%)', color: 'white', borderRadius: '10px', padding: '20px 24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '10px', letterSpacing: '0.1em', opacity: 0.7, textTransform: 'uppercase', marginBottom: '4px' }}>
              EFU 600 · M3 IDENTITY PRIMARY · M11 BIO-COG SECONDARY · Tier {MODULE_META_82.tier} · Prioritás {MODULE_META_82.priority}/10
            </div>
            <div style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '-0.02em' }}>
              600.82 Vallási Identitás Antiflux
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
              {MODULE_META_82.titleEn}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Badge color="#7c3aed">M3 IDENTITY</Badge>
              <Badge color="#0369a1">M11 BIO-COG</Badge>
              <Badge color="#374151">v1.0</Badge>
            </div>
            <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px' }}>
              {MODULE_META_82.status} · Twin: {MODULE_META_82.twin_module}
            </div>
          </div>
        </div>
        <div style={{ marginTop: '12px', fontFamily: 'monospace', fontSize: '10px', opacity: 0.85, background: 'rgba(0,0,0,0.3)', borderRadius: '4px', padding: '6px 10px' }}>
          {MODULE_META_82.formula}
        </div>
        <div style={{ marginTop: '8px', fontSize: '10px', opacity: 0.7 }}>
          Nexus: {MODULE_META_82.nexus.join(' · ')}
        </div>
        <div style={{ marginTop: '8px', fontSize: '11px', opacity: 0.9, fontStyle: 'italic' }}>
          {MODULE_META_82.subtitle}
        </div>
        <div style={{ marginTop: '10px', padding: '8px 12px', background: 'rgba(22,163,74,0.15)', borderRadius: '6px', borderLeft: '3px solid #4ade80', fontSize: '11px', opacity: 0.95 }}>
          ⚑ <strong>MÉRÉSI SEMLEGESSÉG</strong> — {MODULE_META_82.note}
        </div>
      </div>

      {/* ── 2. Változó kalibráció ───────────────────────────────────────────── */}
      <SectionBox title="Változó Kalibráció (cogn_lock, time_distort, rcr, sac_infra, flux_amp, S, Phi)" icon="🎛️" accentColor="#3b0764">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          {RIA_VARIABLES.map((variable) => (
            <VarSlider key={variable.id} variable={variable} value={vals[variable.id]} onChange={handleChange} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
          {[RIA_SYNERGY, RIA_PHI].map((v) => {
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

      {/* ── 3. RIA Index ────────────────────────────────────────────────────── */}
      <SectionBox title="RIA – Religious Identity Antiflux Index" icon="📊" accentColor={zone.color}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
          <RIAGauge ria={ria_index} zone={zone} />
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
              Változó-hozzájárulások (flux_amp negatív = csökkenti RIA-t):
            </div>
            {Object.entries(variable_contributions).map(([id, contrib]) => (
              <ContribBar
                key={id}
                id={id}
                contribution={contrib}
                color={VAR_COLORS[id] || '#374151'}
                positive={id === 'flux_amp'}
              />
            ))}
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb', fontSize: '10px', color: '#6b7280' }}>
              <div>× S (szinergia): {vals.S.toFixed(2)}</div>
              <div>× (1 + Phi/1000): {diagnostics.phi_effect.toFixed(4)}</div>
              <div style={{ marginTop: '4px', fontWeight: '700', color: '#374151' }}>
                Base: {diagnostics.base_index.toFixed(4)} → RIA: {ria_index.toFixed(3)}
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
              {['Zóna', 'RIA érték', 'Státusz', 'Intézkedés'].map((h) => (
                <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '700', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RIA_ZONES.map((z) => {
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
      <SectionBox title="Trigger Logika (4 trigger)" icon="⚡" accentColor="#7c3aed">
        {RIA_TRIGGERS.map((trigger) => (
          <TriggerCard
            key={trigger.id}
            trigger={trigger}
            active={triggers.active_triggers.includes(trigger.id)}
          />
        ))}
      </SectionBox>

      {/* ── 6. CEWS tengelyek ──────────────────────────────────────────────── */}
      <SectionBox title="CEWS Tengelyek" icon="🔗">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              {['CEWS tengely', 'Hatásmód', 'Szint'].map((h) => (
                <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '700', fontSize: '10px', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CEWS_AXES.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '6px 8px', fontWeight: '700', fontSize: '11px', color: row.color }}>{row.axis}</td>
                <td style={{ padding: '6px 8px', fontSize: '11px', color: '#6b7280' }}>{row.impact}</td>
                <td style={{ padding: '6px 8px' }}><Badge color={row.color} size="10px">{row.level}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionBox>

      {/* ── 7. Pozitív referenciák ─────────────────────────────────────────── */}
      <SectionBox title="Pozitív Referenciák (Fluxus-erősítő esetek)" icon="🌱">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {POSITIVE_REFERENCES.map((ref, i) => (
            <div key={i} style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#15803d', marginBottom: '2px' }}>
                {i + 1}. {ref.title}
              </div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#16a34a', fontFamily: 'monospace', marginBottom: '4px' }}>
                {ref.detail}
              </div>
              <div style={{ fontSize: '10px', color: '#6b7280' }}>{ref.description}</div>
            </div>
          ))}
        </div>
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
