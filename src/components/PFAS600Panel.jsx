/**
 * PFAS600Panel.jsx — EFU 600.52 PFAS & „Örök Vegyületek"
 *
 * Interactive CFI-B calculator and audit dashboard.
 * Sections:
 *   1. Header + W_irrev / SEV MAX badge
 *   2. Emission source map (pie breakdown)
 *   3. CFI-B Calculator — compound list (C_i, BAF), F_detox, live result
 *   4. CFI-B Three-level impact model
 *   5. HU Pilot Régió Audit Mátrix — threshold inputs + breach detection
 *   6. Hospital connection (104.13.3) — η_heal calculator + audit-trigger
 *   7. 700.x Intervention Protocol timeline
 *   8. Planetary EFU Scale
 *
 * Státusz: CERTIFIED COMPLETE · W_irrev = 950/1000 · SEV MAX
 * Reference: EFU 600.52 v1.0 FINAL
 */

import { useState, useMemo } from 'react';
import {
  MODULE_META,
  CFI_B_IMPACT_LEVELS,
  EMISSION_SOURCES,
  AUDIT_INDICATORS,
  CFI_B_LEVELS,
  HOSPITAL_CONNECTION,
  INTERVENTION_PROTOCOL,
  PLANETARY_SCALE,
  INTERSTITIAL_METRICS,
} from '../data/pfas600_52.js';
import {
  calculateCFIB,
  classifyPFASAudit,
  calculateHealingEfficiency,
} from '../logic/efu-engine.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function Badge({ children, color, size = '11px' }) {
  return (
    <span style={{
      display: 'inline-block', background: color, color: 'white',
      padding: '2px 8px', borderRadius: '20px', fontSize: size, fontWeight: '700',
      letterSpacing: '0.03em',
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

function NumInput({ value, onChange, min = 0, step = 0.1, style = {} }) {
  return (
    <input type="number" min={min} step={step} value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ width: '100%', padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', ...style }} />
  );
}

// ---------------------------------------------------------------------------
// 1. Emission Source Map
// ---------------------------------------------------------------------------

function EmissionSourceMap() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {EMISSION_SOURCES.map((s) => (
        <div key={s.id} style={{ flex: '1 1 160px', border: `2px solid ${s.color}40`, borderRadius: '8px', padding: '10px 12px', background: `${s.color}08` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontWeight: '700', fontSize: '11px', color: s.color }}>{s.share}%</span>
            <Badge color={s.color} size="9px">{s.id}</Badge>
          </div>
          <div style={{ fontSize: '11px', fontWeight: '600', color: '#374151', marginBottom: '2px' }}>{s.label}</div>
          <div style={{ fontSize: '10px', color: '#6b7280' }}>EFU: {s.efu_link}</div>
          {/* Simple bar */}
          <div style={{ height: '4px', background: '#f3f4f6', borderRadius: '2px', marginTop: '6px', overflow: 'hidden' }}>
            <div style={{ width: `${s.share * 4}%`, height: '100%', background: s.color, borderRadius: '2px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. CFI-B Calculator
// ---------------------------------------------------------------------------

const DEFAULT_COMPOUNDS = [
  { id: 1, name: 'PFOS',  concentration: 45, baf: 3.2 },
  { id: 2, name: 'PFOA',  concentration: 28, baf: 2.1 },
  { id: 3, name: 'PFHxS', concentration: 12, baf: 1.8 },
];

function CFIBCalculator() {
  const [compounds, setCompounds] = useState(DEFAULT_COMPOUNDS);
  const [fDetox,    setFDetox]    = useState(1.0);
  const [nextId,    setNextId]    = useState(4);

  const result = useMemo(() => calculateCFIB(compounds, fDetox), [compounds, fDetox]);

  const addCompound = () => {
    setCompounds((c) => [...c, { id: nextId, name: `PFAS-${nextId}`, concentration: 10, baf: 1.5 }]);
    setNextId((n) => n + 1);
  };

  const removeCompound = (id) => setCompounds((c) => c.filter((x) => x.id !== id));

  const updateCompound = (id, key, val) =>
    setCompounds((c) => c.map((x) => x.id === id ? { ...x, [key]: val } : x));

  return (
    <div>
      {/* Compound list */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 30px', gap: '6px', marginBottom: '6px' }}>
          {['Vegyület neve', 'C_i (ng/g)', 'BAF', ''].map((h) => (
            <div key={h} style={{ fontSize: '10px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>{h}</div>
          ))}
        </div>
        {compounds.map((comp) => (
          <div key={comp.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 30px', gap: '6px', marginBottom: '4px', alignItems: 'center' }}>
            <input type="text" value={comp.name}
              onChange={(e) => updateCompound(comp.id, 'name', e.target.value)}
              style={{ padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: '5px', fontSize: '12px' }} />
            <NumInput value={comp.concentration} step="0.1" onChange={(v) => updateCompound(comp.id, 'concentration', v)} />
            <NumInput value={comp.baf} step="0.01" min={0} onChange={(v) => updateCompound(comp.id, 'baf', v)} />
            <button onClick={() => removeCompound(comp.id)}
              style={{ width: '26px', height: '26px', border: '1px solid #fca5a5', borderRadius: '5px', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ×
            </button>
          </div>
        ))}
        <button onClick={addCompound}
          style={{ marginTop: '4px', fontSize: '11px', padding: '4px 12px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white', cursor: 'pointer', fontWeight: '600' }}>
          + Vegyület hozzáadása
        </button>
      </div>

      {/* F_detox */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>
            F_detox (EFU/nap)
          </label>
          <NumInput value={fDetox} step="0.1" min={0} onChange={setFDetox} />
          <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>
            Ha F_detox → 0 (nem bomlik le), a CFI-B divergál
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>
            W_irrev
          </label>
          <div style={{ padding: '5px 8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', fontWeight: '800', color: '#7c3aed', background: '#f5f3ff' }}>
            {MODULE_META.w_irrev} (rögzített — PFAS)
          </div>
        </div>
      </div>

      {/* Result */}
      <div style={{ border: `3px solid ${result.level.color}`, borderRadius: '10px', padding: '14px', background: `${result.level.color}08` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: '800', fontSize: '13px', color: '#374151', textTransform: 'uppercase' }}>CFI-B Eredmény</span>
          <Badge color={result.level.color} size="12px">{result.level.label}</Badge>
          <Badge color="#7c3aed" size="10px">W_irrev = {MODULE_META.w_irrev}</Badge>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '10px' }}>
          {[
            { l: 'Σ(C_i × P_i)', v: result.compounds_sum.toFixed(2), unit: 'ng/g × BAF' },
            { l: 'F_detox', v: fDetox > 0 ? fDetox : '→ 0', unit: 'EFU/nap' },
            { l: 'CFI-B', v: result.cfib >= 9999 ? '⚠ DIVERGÁL' : result.cfib.toFixed(1), unit: '' },
          ].map(({ l, v, unit }) => (
            <div key={l} style={{ textAlign: 'center', background: 'white', borderRadius: '6px', padding: '10px' }}>
              <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>{l}</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: result.level.color }}>{v}</div>
              {unit && <div style={{ fontSize: '10px', color: '#9ca3af' }}>{unit}</div>}
            </div>
          ))}
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6b7280', background: 'white', padding: '8px 10px', borderRadius: '6px' }}>
          CFI-B = Σ(C_i × P_i × W_irrev) × (1 / F_detox) = {result.compounds_sum.toFixed(3)} × {MODULE_META.w_irrev} × (1/{fDetox > 0 ? fDetox : '0⁺'}) = <strong style={{ color: result.level.color }}>{result.cfib >= 9999 ? 'DIVERGÁL' : result.cfib.toFixed(2)}</strong>
        </div>
        <div style={{ marginTop: '8px', fontSize: '11px', fontWeight: '600', color: result.level.color }}>
          🔔 Intézkedés: {result.level.action}
        </div>
      </div>

      {/* Level reference */}
      <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
        {CFI_B_LEVELS.map((l) => (
          <div key={l.label} style={{ fontSize: '10px', padding: '3px 10px', background: `${l.color}15`, border: `1px solid ${l.color}40`, borderRadius: '20px', color: l.color, fontWeight: '700' }}>
            {l.min}–{l.max < 9999 ? l.max : '∞'}: {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. Three-level Impact Model
// ---------------------------------------------------------------------------

function ImpactLevels() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {CFI_B_IMPACT_LEVELS.map((level) => (
        <div key={level.id} style={{ border: `2px solid ${level.color}40`, borderRadius: '8px', padding: '12px', background: `${level.color}06` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '7px', flexWrap: 'wrap' }}>
            <Badge color={level.color}>{level.id}</Badge>
            <span style={{ fontWeight: '800', fontSize: '12px', color: '#374151' }}>{level.label}</span>
            {level.efficiency_loss && (
              <Badge color="#dc2626" size="10px">Negentrópikus hatékonyság: −{level.efficiency_loss}%</Badge>
            )}
            {level.w_irrev && (
              <Badge color="#7c3aed" size="10px">W_irrev = {level.w_irrev}</Badge>
            )}
            <span style={{ fontSize: '10px', color: '#9ca3af', marginLeft: 'auto' }}>→ {level.link}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {level.effects.map((e) => (
              <span key={e} style={{ fontSize: '11px', padding: '3px 8px', background: `${level.color}15`, border: `1px solid ${level.color}30`, borderRadius: '4px', color: '#374151' }}>
                {e}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. HU Pilot Régió Audit Mátrix
// ---------------------------------------------------------------------------

function AuditMatrix() {
  const defaults = { p_lod_water: 85, p_lod_blood: 18, b_acc: 8, i_block: 12, afff_rad: 600, c_chain: 9 };
  const [readings, setReadings] = useState(defaults);

  const set = (key, val) => setReadings((r) => ({ ...r, [key]: val }));

  const audit = useMemo(() => classifyPFASAudit(readings), [readings]);

  const readingKeys = ['p_lod_water', 'p_lod_blood', 'b_acc', 'i_block', 'afff_rad', 'c_chain'];

  return (
    <div>
      <div style={{ overflowX: 'auto', marginBottom: '14px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['Kód', 'Indikátor', 'Mért érték', 'Egység', 'Határérték', 'EFU Büntetés', 'Forrás', 'Állapot'].map((h) => (
                <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '700', color: '#6b7280', fontSize: '10px', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {AUDIT_INDICATORS.map((ind, i) => {
              const key = readingKeys[i];
              const val = readings[key] ?? 0;
              const breach = val > ind.threshold;
              return (
                <tr key={ind.id} style={{ borderBottom: '1px solid #f3f4f6', background: breach ? `${ind.color}08` : 'white' }}>
                  <td style={{ padding: '6px 8px', fontWeight: '700', color: ind.color }}>{ind.code}</td>
                  <td style={{ padding: '6px 8px', color: '#374151' }}>{ind.label}</td>
                  <td style={{ padding: '6px 8px' }}>
                    <input type="number" min="0" step="0.1" value={val}
                      onChange={(e) => set(key, Number(e.target.value))}
                      style={{ width: '80px', padding: '3px 6px', border: `1px solid ${breach ? ind.color : '#d1d5db'}`, borderRadius: '4px', fontSize: '12px', background: breach ? `${ind.color}10` : 'white', fontWeight: breach ? '700' : '400' }} />
                  </td>
                  <td style={{ padding: '6px 8px', fontFamily: 'monospace', color: '#6b7280', fontSize: '10px' }}>{ind.unit}</td>
                  <td style={{ padding: '6px 8px', fontFamily: 'monospace', color: '#374151', fontSize: '10px' }}>&gt; {ind.threshold}</td>
                  <td style={{ padding: '6px 8px', fontSize: '10px', color: ind.color, fontWeight: '600' }}>{ind.penalty_unit}</td>
                  <td style={{ padding: '6px 8px', fontSize: '10px', color: '#9ca3af' }}>{ind.source}</td>
                  <td style={{ padding: '6px 8px' }}>
                    {breach
                      ? <Badge color={ind.color} size="9px">⚠ BREACH</Badge>
                      : <Badge color="#16a34a" size="9px">✓ OK</Badge>
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Audit result */}
      {audit.breaches.length > 0 && (
        <div style={{ border: `2px solid ${audit.trigger_protocol ? '#dc2626' : '#ea580c'}`, borderRadius: '8px', padding: '12px', background: audit.trigger_protocol ? '#fef2f2' : '#fff7ed' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: '800', fontSize: '12px', color: audit.trigger_protocol ? '#dc2626' : '#ea580c' }}>
              {audit.trigger_protocol ? '🚨 700.x PROTOKOLL AKTIVÁLVA' : '⚠ AUDIT BREACH DETEKTÁLVA'}
            </span>
            <Badge color={audit.trigger_protocol ? '#dc2626' : '#ea580c'}>{audit.breaches.length} breach</Badge>
          </div>
          {audit.alerts.map((a) => (
            <div key={a} style={{ fontSize: '11px', color: '#dc2626', fontWeight: '600', padding: '2px 0' }}>🚩 {a}</div>
          ))}
          {audit.trigger_protocol && (
            <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {HOSPITAL_CONNECTION.audit_trigger.actions.map((act) => (
                <Badge key={act} color="#dc2626" size="10px">{act}</Badge>
              ))}
            </div>
          )}
        </div>
      )}
      {audit.breaches.length === 0 && (
        <div style={{ padding: '8px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '7px', fontSize: '11px', color: '#16a34a', fontWeight: '700' }}>
          ✅ Minden indikátor a határértéken belül — Monitoring folytatása
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 5. Hospital Connection — η_heal calculator
// ---------------------------------------------------------------------------

function HospitalPanel() {
  const [cfibPatient, setCfibPatient] = useState(250);
  const { eta_heal, reduction_pct } = useMemo(() =>
    calculateHealingEfficiency(cfibPatient), [cfibPatient]
  );
  const etaColor = reduction_pct > 30 ? '#dc2626' : reduction_pct > 15 ? '#ea580c' : '#16a34a';

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '14px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>
            CFI-B_beteg
          </label>
          <NumInput value={cfibPatient} step="1" onChange={setCfibPatient} />
          <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>
            Beteg PFAS terhelése (CFI-B egység) · ref = 300 (NARANCS küszöb)
          </div>
        </div>
        <div style={{ textAlign: 'center', background: `${etaColor}10`, borderRadius: '8px', padding: '12px', border: `2px solid ${etaColor}40` }}>
          <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>η_heal (gyógyulási hatékonyság)</div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: etaColor }}>{(eta_heal * 100).toFixed(1)}%</div>
          <Badge color={etaColor}>−{reduction_pct}% veszteség</Badge>
        </div>
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6b7280', background: '#f9fafb', padding: '8px 10px', borderRadius: '6px', lineHeight: '1.8' }}>
        η_heal = η_max × (1 – 0.4 × (CFI-B_beteg / CFI-B_ref))
        <br />= 1.0 × (1 – 0.4 × ({cfibPatient} / 300)) = <strong style={{ color: etaColor }}>{eta_heal.toFixed(3)}</strong>
      </div>

      {/* Entry/exit points */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
        <div style={{ background: '#eff6ff', borderRadius: '7px', padding: '10px' }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#1e40af', textTransform: 'uppercase', marginBottom: '5px' }}>Bejövő PFAS forrás</div>
          {HOSPITAL_CONNECTION.entry_points.map((e) => (
            <div key={e} style={{ fontSize: '11px', color: '#374151', padding: '2px 0' }}>• {e}</div>
          ))}
        </div>
        <div style={{ background: '#fef3c7', borderRadius: '7px', padding: '10px' }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#92400e', textTransform: 'uppercase', marginBottom: '5px' }}>Kimenő szennyezés</div>
          {HOSPITAL_CONNECTION.exit_points.map((e) => (
            <div key={e} style={{ fontSize: '11px', color: '#374151', padding: '2px 0' }}>• {e}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 6. 700.x Intervention Protocol
// ---------------------------------------------------------------------------

function InterventionTimeline() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {INTERVENTION_PROTOCOL.map((phase) => (
        <div key={phase.phase} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: phase.color, color: 'white', fontWeight: '800', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {phase.phase}
            </div>
            {phase.phase < INTERVENTION_PROTOCOL.length && (
              <div style={{ width: '2px', height: '30px', background: '#e5e7eb' }} />
            )}
          </div>
          <div style={{ flex: 1, border: `1px solid ${phase.color}40`, borderRadius: '7px', padding: '10px 12px', background: `${phase.color}06` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '7px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: '800', fontSize: '12px', color: phase.color }}>{phase.label}</span>
              <Badge color={phase.color} size="10px">{phase.timeframe}</Badge>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {phase.actions.map((a) => (
                <div key={a} style={{ fontSize: '11px', color: '#374151', display: 'flex', gap: '6px' }}>
                  <span style={{ color: phase.color, fontWeight: '700', flexShrink: 0 }}>→</span>
                  <span>{a}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 7. Planetary EFU Scale
// ---------------------------------------------------------------------------

function PlanetaryScale() {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
        <thead>
          <tr style={{ background: '#f9fafb' }}>
            {['Mutató', 'Érték', 'EFU-analógia'].map((h) => (
              <th key={h} style={{ padding: '7px 10px', textAlign: 'left', fontWeight: '700', color: '#6b7280', fontSize: '10px', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PLANETARY_SCALE.map((row) => (
            <tr key={row.metric} style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '7px 10px', fontWeight: '600', color: '#374151' }}>{row.metric}</td>
              <td style={{ padding: '7px 10px', fontFamily: 'monospace', fontWeight: '700', color: '#dc2626' }}>{row.value}</td>
              <td style={{ padding: '7px 10px', color: '#6b7280', fontSize: '11px' }}>{row.efu_analogy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main PFAS600Panel
// ---------------------------------------------------------------------------

export default function PFAS600Panel() {
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', marginTop: '32px' }}>
      {/* Header */}
      <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '24px', marginBottom: '18px', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: '10px', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '800', color: '#111827' }}>
            ⚗️ EFU 600.52 — PFAS & „Örök Vegyületek"
          </h2>
          <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
            Bio-fragmentációs Kémiai Motor (CFI-B) · W_irrev = 950/1000 · SEV MAX · HU Pilot Régió Dashboard
          </p>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <Badge color="#7c3aed">600.52</Badge>
          <Badge color="#dc2626">SEV MAX</Badge>
          <Badge color="#374151">W_irrev = 0.95</Badge>
          <Badge color="#16a34a">CERTIFIED COMPLETE</Badge>
          <Badge color="#0891b2">CFI-B</Badge>
        </div>
      </div>

      {/* Definition box */}
      <div style={{ background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '8px', padding: '10px 14px', marginBottom: '18px', fontSize: '12px', color: '#78350f', lineHeight: '1.7' }}>
        <strong>Definíció (§2):</strong> A PFAS nem hagyományos szennyező, hanem <strong>Antifluxus-horgony</strong>. A C–F kötés disszociációs energiája (~544 kJ/mol) meghaladja az ismert biológiai enzimrendszerek lebontási kapacitását. A civilizáció anyagcsere-fluxusának visszacsatolás nélküli mellékterméke — a bioszféra <em>„betonba öntött" szennyezési öröksége</em>.
      </div>

      {/* Emission Source Map */}
      <SectionBox title="Kibocsátási Forrástérkép (EFU-releváns)" icon="🗺">
        <EmissionSourceMap />
      </SectionBox>

      {/* CFI-B Calculator */}
      <SectionBox title="CFI-B Kalkulátor — Bio-fragmentációs Kémiai Index" icon="🧪" accentColor="#7c3aed40">
        <CFIBCalculator />
      </SectionBox>

      {/* Three-level impact model */}
      <SectionBox title="CFI-B Háromszintű Hatásmodell (§3.1)" icon="🔬">
        <ImpactLevels />
      </SectionBox>

      {/* Interstitial metrics */}
      <SectionBox title="Interstitiális Blokád Mérőszámok (§3.3 — 110.1)" icon="🫀">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {INTERSTITIAL_METRICS.map((m) => (
            <div key={m.id} style={{ flex: '1 1 180px', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '7px', background: '#fafafa' }}>
              <div style={{ fontWeight: '700', fontSize: '12px', color: '#374151', marginBottom: '2px' }}>{m.label}</div>
              <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '3px' }}>{m.mechanism}</div>
              <Badge color="#374151" size="9px">{m.unit}</Badge>
            </div>
          ))}
        </div>
      </SectionBox>

      {/* HU Audit Matrix */}
      <SectionBox title="HU Pilot Régió Monitoring — Audit Mátrix (§4.1, 900.5 Dashboard)" icon="📊" accentColor="#dc262640">
        <AuditMatrix />
      </SectionBox>

      {/* Hospital connection */}
      <SectionBox title="Kórházi Kapcsolódás (104.13.3) — η_heal Kalkulátor" icon="🏥" accentColor="#be185d40">
        <HospitalPanel />
      </SectionBox>

      {/* 700.x Intervention Protocol */}
      <SectionBox title="700.x Beavatkozási Protokoll" icon="🚨" accentColor="#ea580c40">
        <InterventionTimeline />
      </SectionBox>

      {/* Planetary EFU Scale */}
      <SectionBox title="Planetáris EFU Skála (§7)" icon="🌍">
        <PlanetaryScale />
      </SectionBox>

      {/* Module status */}
      <div style={{ border: '2px solid #7c3aed', borderRadius: '10px', padding: '14px', background: '#f5f3ff', marginBottom: '16px' }}>
        <div style={{ fontWeight: '800', fontSize: '13px', color: '#374151', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          📋 Modul Státusz — EFU 600.52
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {[
            { l: 'CFI-B motor: AKTÍV', c: '#16a34a' },
            { l: '104.13.3 integráció: BEKÖTVE', c: '#16a34a' },
            { l: '110.1 link: BEKÖTVE', c: '#16a34a' },
            { l: '104.6 link: BEKÖTVE', c: '#16a34a' },
            { l: '104.44 link: BEKÖTVE', c: '#16a34a' },
            { l: '900.5 Dashboard: AKTÍV', c: '#16a34a' },
            { l: '700.x hivatkozás: BEKÖTVE', c: '#16a34a' },
            { l: `W_irrev = ${MODULE_META.w_irrev}`, c: '#7c3aed' },
            { l: MODULE_META.severity, c: '#dc2626' },
          ].map(({ l, c }) => <Badge key={l} color={c}>{l}</Badge>)}
        </div>
      </div>

      <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0, lineHeight: '1.6' }}>
        EFU 600.52 PFAS & Forever Chemicals · CFI-B = Σ(C_i × P_i × W_irrev) × (1/F_detox) ·
        W_irrev = 0.95 · SEV MAX · 104.13.3 · 104.6 · 104.44 · 110.1 · 900.5 · 700.x ·
        Szerző: Simor István · ORCID: 0009-0002-6599-3480
      </p>
    </div>
  );
}
