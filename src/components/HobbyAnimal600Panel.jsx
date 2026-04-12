/**
 * HobbyAnimal600Panel.jsx — EFU 600.30 Hobby Animal & Wildlife Parasitism v1.0
 *
 * M9 ANYAGI (PRIMARY) | M7 FEKETE (SECONDARY)
 * Special flags: BLACK_LAYER_RESTRICTED | UNINTENTIONAL_PARASITISM
 *
 * Sections:
 *   1. Module header (special flags, nexus)
 *   2. 6-réteg kalibráció (L1–L6, S, Φ)
 *   3. HAP index eredmény + réteg-hozzájárulások
 *   4. Zóna táblázat (5 zóna)
 *   5. Trigger logika (4 trigger)
 *   6. Fire Chief audit (6/8 RED FLAG)
 *   7. Beavatkozási lépések
 *   8. JSON kimenet
 *
 * Reference: EFU 600.30 HAP v1.0 (2026-04-10)
 */

import { useState, useMemo } from 'react';
import {
  MODULE_META_30,
  HAP_LAYERS,
  HAP_SYNERGY,
  HAP_PHI,
  HAP_ZONES,
  HAP_TRIGGERS,
  FIRE_CHIEF_AUDIT,
  INTERVENTIONS,
} from '../data/hobbyAnimal600_30.js';
import {
  calculateHAP,
  classifyHAPZone,
  evaluateHAPTriggers,
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

function LayerSlider({ layer, value, onChange }) {
  const exceeded = value > layer.threshold;
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
        <span style={{ fontSize: '12px', fontWeight: '700', color: layer.color }}>
          {layer.id}
          {layer.restricted && (
            <span style={{ marginLeft: '5px', fontSize: '9px', background: '#7c3aed', color: 'white', padding: '1px 5px', borderRadius: '3px' }}>
              BLACK
            </span>
          )}
          {layer.flag === 'UNINTENTIONAL_PARASITISM' && (
            <span style={{ marginLeft: '5px', fontSize: '9px', background: '#ca8a04', color: 'white', padding: '1px 5px', borderRadius: '3px' }}>
              UNINT.
            </span>
          )}
        </span>
        <span style={{ fontSize: '10px', color: '#6b7280', flex: 1, margin: '0 6px' }}>
          {layer.label}
        </span>
        <span style={{ fontSize: '12px', fontWeight: '700', color: exceeded ? '#dc2626' : layer.color, minWidth: '50px', textAlign: 'right' }}>
          {value.toFixed(2)}{exceeded ? ' ⚠️' : ''}
        </span>
      </div>
      <input
        type="range"
        min={layer.min}
        max={layer.max}
        step={layer.step}
        value={value}
        onChange={(e) => onChange(layer.id, parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: exceeded ? '#dc2626' : layer.color }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#9ca3af', marginTop: '2px' }}>
        <span>0</span>
        <span style={{ color: exceeded ? '#dc2626' : '#d97706', fontWeight: exceeded ? '700' : '400' }}>
          küszöb: {layer.threshold}
        </span>
        <span>1.0</span>
      </div>
      <div style={{ fontSize: '9px', color: '#9ca3af', marginTop: '2px', fontStyle: 'italic' }}>
        {layer.keyFact}
      </div>
    </div>
  );
}

function HAPGauge({ hap, zone }) {
  const maxDisplay = 8;
  const pct = Math.min((hap / maxDisplay) * 100, 100);
  return (
    <div style={{ textAlign: 'center', padding: '16px 0' }}>
      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>HAP Index</div>
      <div style={{ fontSize: '52px', fontWeight: '900', color: zone.color, lineHeight: 1 }}>
        {hap.toFixed(3)}
      </div>
      <div style={{ margin: '10px 0' }}>
        <div style={{ height: '14px', background: '#e5e7eb', borderRadius: '7px', overflow: 'hidden', position: 'relative' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg, #16a34a, ${zone.color})`, transition: 'width 0.3s', borderRadius: '7px' }} />
          {[0.8, 1.5, 3.0, 6.0].map((thr) => (
            <div key={thr} style={{
              position: 'absolute', top: 0, bottom: 0, left: `${(thr / maxDisplay) * 100}%`,
              width: '2px', background: 'white', opacity: 0.7,
            }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#9ca3af', marginTop: '2px' }}>
          <span>0</span><span>0.8</span><span>1.5</span><span>3.0</span><span>6.0</span><span>8</span>
        </div>
      </div>
      <Badge color={zone.color} size="13px">{zone.label} — {zone.status}</Badge>
      <div style={{ marginTop: '6px', fontSize: '11px', color: '#6b7280' }}>
        ×{zone.multiplier} szorzó · {zone.action}
      </div>
    </div>
  );
}

function LayerBar({ id, value, weight, contribution, color }) {
  const pct = Math.min(contribution * 300, 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
      <span style={{ width: '28px', fontSize: '11px', fontWeight: '700', color }}>{id}</span>
      <div style={{ flex: 1, height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.3s' }} />
      </div>
      <span style={{ width: '48px', fontSize: '10px', textAlign: 'right', color: '#374151' }}>
        {contribution.toFixed(3)}
      </span>
      <span style={{ width: '36px', fontSize: '10px', color: '#9ca3af' }}>×{weight}</span>
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
            {trigger.restricted && (
              <span style={{ marginLeft: '6px', fontSize: '9px', background: '#7c3aed', color: 'white', padding: '1px 5px', borderRadius: '3px' }}>
                RESTRICTED
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
        {trigger.note && (
          <div style={{ fontSize: '9px', color: '#7c3aed', fontStyle: 'italic', marginTop: '2px' }}>
            ⚑ {trigger.note}
          </div>
        )}
      </div>
    </div>
  );
}

function AuditRow({ item }) {
  const isRed = item.verdict.startsWith('RED');
  const isRestricted = item.verdict === 'RED_RESTRICTED';
  const color = isRestricted ? '#7c3aed' : isRed ? '#dc2626' : '#16a34a';
  const icon = isRestricted ? '🟣' : isRed ? '🔴' : '🟢';
  return (
    <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
      <td style={{ padding: '5px 8px', fontSize: '11px', fontWeight: '600' }}>{icon} {item.layer}</td>
      <td style={{ padding: '5px 8px' }}>
        <Badge color={color} size="9px">
          {isRestricted ? 'RED (RESTRICTED)' : item.verdict}
        </Badge>
      </td>
      <td style={{ padding: '5px 8px', fontSize: '10px', color: '#6b7280' }}>{item.detail}</td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

const LAYER_COLORS = {
  L1: '#7c3aed', L2: '#0369a1', L3: '#d97706',
  L4: '#dc2626', L5: '#ea580c', L6: '#16a34a',
};

export default function HobbyAnimal600Panel() {
  const defaultVals = {
    L1: 0.55, L2: 0.45, L3: 0.40, L4: 0.35, L5: 0.40, L6: 0.30, S: 1.1, Phi: 150,
  };

  const [vals, setVals] = useState(defaultVals);
  const [showJSON, setShowJSON] = useState(false);
  const [showInterventions, setShowInterventions] = useState(false);

  function handleChange(id, v) {
    setVals((prev) => ({ ...prev, [id]: v }));
  }

  const result = useMemo(() => calculateHAP(vals), [vals]);
  const { hap_index, zone, triggers, layer_contributions, diagnostics } = result;

  const jsonOutput = {
    module: MODULE_META_30.id,
    hap_index,
    zone: zone.id,
    status: zone.status,
    mechanism_primary: MODULE_META_30.mechanism_primary,
    mechanism_secondary: MODULE_META_30.mechanism_secondary,
    special_flags: MODULE_META_30.special_flags,
    triggers: {
      unintentional_harm: triggers.unintentional_harm,
      black_layer: triggers.black_layer,
      invasion_alert: triggers.invasion_alert,
      fire_chief: triggers.fire_chief,
      active: triggers.active_triggers,
    },
    layers: vals,
    layer_contributions,
    diagnostics,
    nexus: MODULE_META_30.nexus,
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '860px', margin: '24px auto', padding: '0 16px' }}>

      {/* ── 1. Header ──────────────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg, #14532d 0%, #1e3a2f 100%)', color: 'white', borderRadius: '10px', padding: '20px 24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '10px', letterSpacing: '0.1em', opacity: 0.7, textTransform: 'uppercase', marginBottom: '4px' }}>
              EFU 600 · M9 ANYAGI PRIMARY · M7 FEKETE SECONDARY · Tier 1 · Prioritás 8/10
            </div>
            <div style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '-0.02em' }}>
              600.30 Hobbi Állattartás & Vadászati Parazitizmus
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
              {MODULE_META_30.subtitleEn}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Badge color="#7c3aed">UNINTENTIONAL</Badge>
              <Badge color="#dc2626">BLACK LAYER</Badge>
              <Badge color="#374151">v1.0</Badge>
            </div>
            <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px', textAlign: 'right' }}>
              Fire Chief: 6/8 RED FLAG
            </div>
          </div>
        </div>
        <div style={{ marginTop: '12px', fontFamily: 'monospace', fontSize: '11px', opacity: 0.85, background: 'rgba(0,0,0,0.3)', borderRadius: '4px', padding: '6px 10px' }}>
          {MODULE_META_30.formula}
        </div>
        <div style={{ marginTop: '8px', fontSize: '10px', opacity: 0.7 }}>
          Nexus: {MODULE_META_30.nexus.join(' · ')}
        </div>
        {/* Speciális megjegyzés */}
        <div style={{ marginTop: '10px', padding: '8px 12px', background: 'rgba(124,58,237,0.2)', borderRadius: '6px', borderLeft: '3px solid #a78bfa', fontSize: '11px', opacity: 0.95 }}>
          ⚑ <strong>UNINTENTIONAL_PARASITISM</strong> — Ez az EFU egyetlen modulja, ahol a parazitizmus elsősorban szándéktalan strukturális ártásból ered. A macska-tartó szereti az állatát – és eközben évente 50–100 madarat öl. Az EFU nem moralizál, de kötelező mérni.
        </div>
      </div>

      {/* ── 2. Réteg kalibráció ─────────────────────────────────────────────── */}
      <SectionBox title="6-Réteg Kalibráció (L1–L6, S, Φ)" icon="🎛️" accentColor="#14532d">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          {HAP_LAYERS.map((layer) => (
            <LayerSlider
              key={layer.id}
              layer={layer}
              value={vals[layer.id]}
              onChange={handleChange}
            />
          ))}
        </div>
        {/* Synergy + Phi */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
          {[HAP_SYNERGY, HAP_PHI].map((v) => {
            const val = vals[v.id];
            const exceeded = v.threshold && val > v.threshold;
            return (
              <div key={v.id} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: v.color }}>{v.id} – {v.label}</span>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: exceeded ? '#dc2626' : v.color }}>
                    {val.toFixed(v.id === 'S' ? 2 : 0)} {v.unit}{exceeded ? ' ⚠️' : ''}
                  </span>
                </div>
                <input
                  type="range"
                  min={v.min}
                  max={v.max}
                  step={v.step}
                  value={val}
                  onChange={(e) => handleChange(v.id, parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: exceeded ? '#dc2626' : v.color }}
                />
                {v.threshold && (
                  <div style={{ fontSize: '9px', color: '#9ca3af', marginTop: '1px' }}>
                    küszöb: {v.threshold}{v.threshold_fire ? ` | fire: ${v.threshold_fire}` : ''} {v.unit}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SectionBox>

      {/* ── 3. HAP Index ────────────────────────────────────────────────────── */}
      <SectionBox title="HAP – Hobby Animal Parasitism Index" icon="📊" accentColor={zone.color}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
          <HAPGauge hap={hap_index} zone={zone} />
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
              Réteg-hozzájárulások (súlyozott):
            </div>
            {HAP_LAYERS.map((layer) => (
              <LayerBar
                key={layer.id}
                id={layer.id}
                value={vals[layer.id]}
                weight={layer.weight}
                contribution={layer_contributions[layer.id] || 0}
                color={layer.color}
              />
            ))}
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb', fontSize: '10px', color: '#6b7280' }}>
              <div>× S (szinergia): {vals.S.toFixed(2)}</div>
              <div>× (1 + Φ/1000): {diagnostics.phi_effect.toFixed(4)}</div>
              <div style={{ marginTop: '4px', fontWeight: '700', color: '#374151' }}>
                Base: {diagnostics.base_index.toFixed(4)} → HAP: {hap_index.toFixed(3)}
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
              {['Zóna', 'HAP érték', 'Státusz', 'EFU szorzó', 'Intézkedés'].map((h) => (
                <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '700', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HAP_ZONES.map((z) => {
              const isActive = zone.id === z.id;
              return (
                <tr key={z.id} style={{ background: isActive ? z.color + '18' : 'white', borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '6px 8px' }}>
                    <span style={{ fontWeight: isActive ? '900' : '600', color: z.color }}>{z.label}</span>
                    {isActive && <span style={{ marginLeft: '6px', fontSize: '10px', color: z.color }}>◀</span>}
                  </td>
                  <td style={{ padding: '6px 8px', fontFamily: 'monospace', fontSize: '11px' }}>{z.condition}</td>
                  <td style={{ padding: '6px 8px' }}><Badge color={z.color} size="10px">{z.status}</Badge></td>
                  <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: '700' }}>×{z.multiplier}</td>
                  <td style={{ padding: '6px 8px', fontSize: '11px' }}>{z.action}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </SectionBox>

      {/* ── 5. Triggerek ───────────────────────────────────────────────────── */}
      <SectionBox title="HAP Trigger Logika (4 trigger)" icon="⚡" accentColor="#dc2626">
        {HAP_TRIGGERS.map((trig) => {
          const activeMap = {
            UNINTENTIONAL_HARM: triggers.unintentional_harm,
            BLACK_LAYER:        triggers.black_layer,
            INVASION_ALERT:     triggers.invasion_alert,
            FIRE_CHIEF:         triggers.fire_chief,
          };
          return <TriggerCard key={trig.id} trigger={trig} active={activeMap[trig.id] || false} />;
        })}
      </SectionBox>

      {/* ── 6. Fire Chief Audit ─────────────────────────────────────────────── */}
      <SectionBox title="Fire Chief Audit – 6/8 RED FLAG" icon="🔥" accentColor="#dc2626">
        <div style={{ marginBottom: '10px', padding: '8px 12px', background: '#fef2f2', borderRadius: '6px', fontSize: '11px', color: '#991b1b', fontWeight: '700' }}>
          Verdict: {MODULE_META_30.fire_chief_flags}
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={{ padding: '5px 8px', textAlign: 'left', fontSize: '10px', textTransform: 'uppercase' }}>Réteg</th>
              <th style={{ padding: '5px 8px', textAlign: 'left', fontSize: '10px', textTransform: 'uppercase' }}>Verdict</th>
              <th style={{ padding: '5px 8px', textAlign: 'left', fontSize: '10px', textTransform: 'uppercase' }}>Adat</th>
            </tr>
          </thead>
          <tbody>
            {FIRE_CHIEF_AUDIT.map((item, i) => <AuditRow key={i} item={item} />)}
          </tbody>
        </table>
        <div style={{ marginTop: '10px', padding: '8px 12px', background: '#f3f4ff', borderRadius: '6px', borderLeft: '3px solid #7c3aed', fontSize: '10px', color: '#4c1d95' }}>
          🟣 <strong>BLACK_LAYER_RESTRICTED</strong> — A fekete réteg részletei szándékosan korlátozottak. Publikusan elérhető UNODC + WWF + TRAFFIC adatokra támaszkodik. Teljes adatbázis: FC szintű hozzáférés.
        </div>
      </SectionBox>

      {/* ── 7. Diagnosztika ─────────────────────────────────────────────────── */}
      <SectionBox title="Engine Diagnosztika" icon="🔬" accentColor="#374151">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', textAlign: 'center' }}>
          {[
            { label: 'Base Index', value: diagnostics.base_index.toFixed(4), color: '#14532d' },
            { label: 'Φ Effect',   value: diagnostics.phi_effect.toFixed(4), color: '#9a3412' },
            { label: 'Synergy S',  value: diagnostics.synergy.toFixed(2),    color: '#374151' },
            { label: 'Confidence', value: `${(diagnostics.confidence * 100).toFixed(0)}%`, color: '#16a34a' },
          ].map((item) => (
            <div key={item.label} style={{ background: '#f9fafb', borderRadius: '6px', padding: '10px' }}>
              <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '3px' }}>{item.label}</div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
          <div style={{ background: '#fef2f2', borderRadius: '6px', padding: '8px' }}>
            <div style={{ fontSize: '9px', color: '#6b7280' }}>Nettó HMI (globális)</div>
            <div style={{ fontSize: '16px', fontWeight: '900', color: '#dc2626' }}>{MODULE_META_30.net_hmi_global}</div>
          </div>
          <div style={{ background: '#fef2f2', borderRadius: '6px', padding: '8px' }}>
            <div style={{ fontSize: '9px', color: '#6b7280' }}>R_future</div>
            <div style={{ fontSize: '16px', fontWeight: '900', color: '#dc2626' }}>{MODULE_META_30.r_future}</div>
          </div>
          <div style={{ background: '#f3f4ff', borderRadius: '6px', padding: '8px' }}>
            <div style={{ fontSize: '9px', color: '#6b7280' }}>Tier / Prioritás</div>
            <div style={{ fontSize: '16px', fontWeight: '900', color: '#7c3aed' }}>T{MODULE_META_30.tier} · {MODULE_META_30.priority}/10</div>
          </div>
        </div>
      </SectionBox>

      {/* ── 8. Beavatkozások ────────────────────────────────────────────────── */}
      <SectionBox title="Karantén Protokoll – Beavatkozási Lépések" icon="🛡️" accentColor="#14532d">
        <button
          onClick={() => setShowInterventions((s) => !s)}
          style={{ fontSize: '11px', padding: '4px 12px', borderRadius: '4px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer', marginBottom: '10px' }}
        >
          {showInterventions ? '▲ Elrejtés' : '▼ Beavatkozások megjelenítése'}
        </button>
        {showInterventions && (
          <div>
            {INTERVENTIONS.map((step) => (
              <div key={step.step} style={{ display: 'flex', gap: '12px', marginBottom: '10px', padding: '10px', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                <div style={{ width: '24px', height: '24px', background: '#14532d', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', flexShrink: 0 }}>
                  {step.step}
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '12px', color: '#14532d' }}>{step.title}</div>
                  <div style={{ fontSize: '11px', color: '#374151', marginTop: '2px' }}>{step.description}</div>
                  <div style={{ fontSize: '10px', color: '#16a34a', marginTop: '3px' }}>→ {step.estimated_impact}</div>
                  <div style={{ fontSize: '10px', color: '#0369a1', marginTop: '1px' }}>R_future delta: {step.r_future_delta}</div>
                </div>
              </div>
            ))}
            <div style={{ marginTop: '8px', padding: '8px 12px', background: '#f0fdf4', borderRadius: '6px', fontSize: '11px', color: '#14532d', fontWeight: '600' }}>
              Összesített 10 éves hatás: R_future &lt;0.3 → ~0.55 (ha mind megvalósul)
            </div>
          </div>
        )}
      </SectionBox>

      {/* ── 9. JSON Kimenet ─────────────────────────────────────────────────── */}
      <SectionBox title="Dashboard JSON Kimenet" icon="💾">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#374151', lineHeight: 1.8 }}>
            <div>600.30 HAP STATUS</div>
            <div>├── INDEX: {hap_index.toFixed(3)} [{zone.label}]</div>
            <div>├── STATUS: {zone.status}</div>
            <div>├── TRIGGERS: {triggers.active_triggers.length > 0 ? triggers.active_triggers.join(' | ') : '—'}</div>
            <div>├── L4 (TRAFFICKING): {vals.L4.toFixed(2)} {vals.L4 > 0.5 ? '[⚠️ BLACK LAYER]' : '[OK]'}</div>
            <div>├── L1 (CATS): {vals.L1.toFixed(2)} {vals.L1 > 0.6 ? '[❌ KÜSZÖB]' : '[OK]'}</div>
            <div>└── Φ: {vals.Phi} {vals.Phi > 600 ? '[FIRE CHIEF ⚠️]' : vals.Phi > 300 ? '[KARANTÉN]' : '[OK]'}</div>
          </div>
          <button
            onClick={() => setShowJSON((s) => !s)}
            style={{ fontSize: '11px', padding: '4px 12px', borderRadius: '4px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer', flexShrink: 0 }}
          >
            {showJSON ? 'Elrejtés' : 'JSON'}
          </button>
        </div>
        {showJSON && (
          <pre style={{ background: '#14532d', color: '#bbf7d0', borderRadius: '6px', padding: '14px', fontSize: '11px', overflow: 'auto', margin: 0 }}>
            {JSON.stringify(jsonOutput, null, 2)}
          </pre>
        )}
      </SectionBox>

      {/* Footer */}
      <div style={{ textAlign: 'center', fontSize: '10px', color: '#9ca3af', paddingBottom: '24px' }}>
        EFU 600.30 · Hobby Animal Keeping & Wildlife Extraction Parasitism v1.0 · 2026-04-10 ·
        Special: UNINTENTIONAL_PARASITISM | BLACK_LAYER_RESTRICTED
      </div>
    </div>
  );
}
