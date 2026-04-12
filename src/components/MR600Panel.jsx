/**
 * MR600Panel.jsx — EFU 600.00 Metabolikus Ragadozó (Metabolic Predator) v2.1
 *
 * Interactive diagnostic panel for the Tier 0 Root Operator.
 * Sections:
 *   1. Module header + reference state alert
 *   2. M1–M12 mechanism activation sliders (interactive)
 *   3. MR_score + P_syn live calculation with visual gauge
 *   4. η(W)_eff Interruptor Calculator
 *   5. PRD — Perception-Reality Divergence
 *   6. Θ_collapse — Collapse Risk Assessment
 *   7. Ragadozó Anatómia (Predator Anatomy) hierarchy
 *   8. Dynamic Cascade sequence
 *   9. Fire Chief Verdict
 *
 * Reference: EFU 600.00 KALIBRÁLT FINAL OPERÁTOR (2026.03.30)
 */

import { useState, useMemo } from 'react';
import {
  MECHANISMS,
  ANATOMY_LEVELS,
  CASCADE_SEQUENCE,
  COLLAPSE_THRESHOLDS,
  REFERENCE_STATE_2026,
  PRD_LEVELS,
} from '../data/mr600.js';
import {
  calculateMRScore,
  calculatePSyn,
  calculateEfficiency,
  calculatePRD,
  classifyMRState,
} from '../logic/efu-engine.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function prdLevel(prd) {
  return PRD_LEVELS.find((l) => prd <= l.max) ?? PRD_LEVELS[PRD_LEVELS.length - 1];
}

function Badge({ children, color, size = '11px' }) {
  return (
    <span style={{
      display: 'inline-block',
      background: color,
      color: 'white',
      padding: '2px 8px',
      borderRadius: '20px',
      fontSize: size,
      fontWeight: '700',
      letterSpacing: '0.03em',
    }}>
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// 1. Mechanism Sliders
// ---------------------------------------------------------------------------

function MechanismSliders({ activations, onChange }) {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
      <div style={{ background: '#f3f4f6', padding: '8px 14px', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#374151' }}>
        ⚙️ M1–M12 Mechanizmus Aktiváció
      </div>
      <div style={{ padding: '12px 14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
        {MECHANISMS.map((m) => {
          const val = activations[m.id] ?? m.default_activation;
          return (
            <div key={m.id} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: m.color, display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#374151' }}>{m.id}</span>
                  <span style={{ fontSize: '11px', color: '#6b7280' }}>{m.label}</span>
                  <Badge color={val > 0.75 ? '#dc2626' : val > 0.45 ? '#d97706' : '#16a34a'} size="9px">
                    {m.tier}
                  </Badge>
                </div>
                <span style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '12px', color: val > 0.75 ? '#dc2626' : val > 0.45 ? '#d97706' : '#16a34a', minWidth: '36px', textAlign: 'right' }}>
                  {Math.round(val * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={Math.round(val * 100)}
                onChange={(e) => onChange(m.id, Number(e.target.value) / 100)}
                style={{ width: '100%', accentColor: m.color, cursor: 'pointer' }}
                title={m.role}
              />
              <div style={{ fontSize: '10px', color: '#9ca3af', lineHeight: '1.3' }}>{m.role}</div>
            </div>
          );
        })}
      </div>
      <div style={{ padding: '8px 14px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={() => MECHANISMS.forEach((m) => onChange(m.id, REFERENCE_STATE_2026.mr_score > 0.9 ? m.default_activation : m.default_activation))}
          style={{ fontSize: '11px', padding: '4px 12px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white', cursor: 'pointer', fontWeight: '600' }}
        >
          📋 2026.03.30 referencia
        </button>
        <button
          onClick={() => MECHANISMS.forEach((m) => onChange(m.id, 0.1))}
          style={{ fontSize: '11px', padding: '4px 12px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white', cursor: 'pointer', fontWeight: '600' }}
        >
          🔄 Reset (alacsony)
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. MR Score + P_syn Gauge
// ---------------------------------------------------------------------------

function MRGauge({ mr_score, p_syn }) {
  const GAUGE_W = 100;
  const pct = Math.round(mr_score * 100);
  const color = mr_score >= 0.85 ? '#7c3aed' : mr_score >= 0.6 ? '#dc2626' : mr_score >= 0.35 ? '#ea580c' : '#16a34a';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* MR_score bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>MR_score</span>
          <span style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '18px', color }}>{(mr_score).toFixed(3)}</span>
        </div>
        <div style={{ height: '14px', background: '#f3f4f6', borderRadius: '7px', overflow: 'hidden', position: 'relative' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '7px', transition: 'width 0.2s' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px', fontSize: '9px', color: '#9ca3af' }}>
          <span>0 — Egészséges</span>
          <span>0.35 — T2</span>
          <span>0.60 — T1</span>
          <span>0.85 — T0</span>
          <span>1.0</span>
        </div>
      </div>

      {/* P_syn bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>P_syn</span>
          <span style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '15px', color: p_syn < 0.5 ? '#dc2626' : '#374151' }}>
            {p_syn.toFixed(3)} {p_syn < 0.5 ? '⚠' : '✔'}
          </span>
        </div>
        <div style={{ height: '10px', background: '#f3f4f6', borderRadius: '5px', overflow: 'hidden' }}>
          <div style={{ width: `${Math.round(p_syn * 100)}%`, height: '100%', background: p_syn < 0.5 ? '#dc2626' : p_syn < 0.65 ? '#ea580c' : '#16a34a', borderRadius: '5px', transition: 'width 0.2s' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px', fontSize: '9px', color: '#9ca3af' }}>
          <span>0 — Összeomlás</span>
          <span style={{ color: '#dc2626', fontWeight: '700' }}>0.5 ←Θ</span>
          <span>1.0 — Egészséges</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. η(W)_eff Interruptor Calculator
// ---------------------------------------------------------------------------

function EfficiencyPanel({ mr_score, p_syn }) {
  const [base, setBase] = useState(100);
  const [moduleSum, setModuleSum] = useState(1);
  const { eta_eff, reduction_pct } = calculateEfficiency(base, mr_score, p_syn, moduleSum);

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '14px', marginBottom: '20px' }}>
      <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#374151', marginBottom: '12px' }}>
        ⚡ η(W)_eff — Interruptor Kalkulátor
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase' }}>
            Alap hatékonyság (%)
          </label>
          <input
            type="number"
            min="1" max="200"
            value={base}
            onChange={(e) => setBase(Number(e.target.value))}
            style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase' }}>
            Σ600.x aktív terhelés
          </label>
          <input
            type="number"
            min="0" max="20" step="0.1"
            value={moduleSum}
            onChange={(e) => setModuleSum(Number(e.target.value))}
            style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '10px' }}>
        <div style={{ textAlign: 'center', background: '#f9fafb', borderRadius: '6px', padding: '10px 6px' }}>
          <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>Alap</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#374151' }}>{base}%</div>
        </div>
        <div style={{ textAlign: 'center', background: '#fef2f2', borderRadius: '6px', padding: '10px 6px' }}>
          <div style={{ fontSize: '10px', color: '#dc2626', fontWeight: '600', textTransform: 'uppercase' }}>Tényleges</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#dc2626' }}>{eta_eff.toFixed(1)}%</div>
        </div>
        <div style={{ textAlign: 'center', background: '#fef2f2', borderRadius: '6px', padding: '10px 6px' }}>
          <div style={{ fontSize: '10px', color: '#dc2626', fontWeight: '600', textTransform: 'uppercase' }}>Veszteség</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#dc2626' }}>−{reduction_pct}%</div>
        </div>
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6b7280', background: '#f9fafb', padding: '8px 10px', borderRadius: '6px', lineHeight: '1.7' }}>
        <div>η(W)_eff = Base / (1 + MR_score × Σ600.x) × P_syn</div>
        <div style={{ color: '#374151' }}>
          = {base} / (1 + {mr_score.toFixed(3)} × {moduleSum}) × {p_syn.toFixed(3)} = <strong>{eta_eff.toFixed(2)}%</strong>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. PRD Panel
// ---------------------------------------------------------------------------

function PRDPanel({ mr_score, p_syn }) {
  const [etaReal,      setEtaReal]      = useState(32);
  const [etaPerceived, setEtaPerceived] = useState(79);
  const [dPercept,     setDPercept]     = useState(0.72);
  const { prd } = calculatePRD(etaReal, etaPerceived);
  const level = prdLevel(prd);

  // Perceptual collapse threshold (§V)
  const mr_crit = mr_score * (1 + dPercept);
  const percept_collapse = dPercept > COLLAPSE_THRESHOLDS.d_percept_critical;

  return (
    <div style={{ border: `2px solid ${level.color}40`, borderRadius: '8px', padding: '14px', marginBottom: '20px', background: `${level.color}08` }}>
      <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#374151', marginBottom: '12px' }}>
        👁 PRD — Percepció–Valóság Divergencia
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase' }}>
            η_real (%)
          </label>
          <input type="number" min="0" max="100" value={etaReal}
            onChange={(e) => setEtaReal(Number(e.target.value))}
            style={{ width: '100%', padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>Tényleges hatékonyság</div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase' }}>
            η_perceived (%)
          </label>
          <input type="number" min="0" max="200" value={etaPerceived}
            onChange={(e) => setEtaPerceived(Number(e.target.value))}
            style={{ width: '100%', padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>Észlelt hatékonyság</div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase' }}>
            D_percept
          </label>
          <input type="number" min="0" max="1" step="0.01" value={dPercept}
            onChange={(e) => setDPercept(Number(e.target.value))}
            style={{ width: '100%', padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>Digit. torzítás (600.53)</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
        <div style={{ textAlign: 'center', background: `${level.color}15`, borderRadius: '6px', padding: '10px' }}>
          <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>PRD érték</div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: level.color }}>{prd.toFixed(3)}</div>
          <Badge color={level.color}>{level.label}</Badge>
        </div>
        <div style={{ textAlign: 'center', background: percept_collapse ? '#fef2f2' : '#f9fafb', borderRadius: '6px', padding: '10px' }}>
          <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>MR_crit = MR × (1+D)</div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: percept_collapse ? '#dc2626' : '#374151' }}>
            {mr_crit.toFixed(3)}
          </div>
          {percept_collapse && (
            <Badge color="#dc2626">KOGNITÍV ÖSSZEOMLÁS</Badge>
          )}
        </div>
      </div>

      <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6b7280', background: 'white', padding: '6px 10px', borderRadius: '6px' }}>
        PRD = |{etaReal} − {etaPerceived}| / 100 = {prd.toFixed(3)} · MR_crit = {mr_score.toFixed(3)} × (1 + {dPercept}) = {mr_crit.toFixed(3)}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 5. Collapse Risk (Θ_collapse)
// ---------------------------------------------------------------------------

function CollapsePanel({ mr_score, p_syn }) {
  const [etaDecl,  setEtaDecl]  = useState(true);
  const [cognDecl, setCognDecl] = useState(true);
  const { collapse_risk, tier, color, flags } = classifyMRState(mr_score, p_syn, etaDecl, cognDecl);

  return (
    <div style={{ border: `2px solid ${color}40`, borderRadius: '8px', padding: '14px', marginBottom: '20px', background: `${color}08` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#374151' }}>
          ⚠️ Θ_collapse — Összeomlási Kockázat
        </span>
        <Badge color={color}>{tier}</Badge>
        {collapse_risk && <Badge color="#dc2626">IRREVERZIBILIS PÁLYA</Badge>}
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
          <input type="checkbox" checked={etaDecl} onChange={(e) => setEtaDecl(e.target.checked)} />
          <span>dη_W/dt &lt; 0 — Hatékonyság csökken</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
          <input type="checkbox" checked={cognDecl} onChange={(e) => setCognDecl(e.target.checked)} />
          <span>dN_cogn/dt &lt; 0 — Kognitív kapacitás csökken</span>
        </label>
      </div>

      {flags.length > 0 && (
        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginBottom: '5px' }}>
            🚩 Aktív RED FLAGS:
          </div>
          {flags.map((f) => (
            <div key={f} style={{ fontSize: '11px', color: '#dc2626', fontWeight: '600', padding: '2px 0' }}>
              • {f}
            </div>
          ))}
        </div>
      )}

      <div style={{ background: 'white', borderRadius: '6px', padding: '8px 10px', fontFamily: 'monospace', fontSize: '11px', color: '#6b7280', lineHeight: '1.7' }}>
        <div>Θ_collapse ← [dη_W/dt &lt; 0] ∧ [dN_cogn/dt &lt; 0] ∧ [P_syn &lt; 0.5]</div>
        <div>= [{etaDecl ? 'TRUE' : 'FALSE'}] ∧ [{cognDecl ? 'TRUE' : 'FALSE'}] ∧ [{p_syn < 0.5 ? 'TRUE' : 'FALSE'}] = {collapse_risk ? <strong style={{ color: '#dc2626' }}>COLLAPSE RISK</strong> : 'CLEAR'}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 6. Predator Anatomy
// ---------------------------------------------------------------------------

function AnatomyPanel({ activations }) {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
      <div style={{ background: '#f3f4f6', padding: '8px 14px', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#374151' }}>
        🦴 Ragadozó Anatómia — Hierarchia
      </div>
      <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {[...ANATOMY_LEVELS].reverse().map((level) => {
          const mechs = MECHANISMS.filter((m) => level.mechanisms.includes(m.id));
          const avgAct = mechs.length > 0
            ? mechs.reduce((s, m) => s + (activations[m.id] ?? m.default_activation), 0) / mechs.length
            : 0;
          return (
            <div key={level.tier} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 10px', borderRadius: '6px', background: `${level.color}10`, border: `1px solid ${level.color}30` }}>
              <Badge color={level.color}>{level.tier}</Badge>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#374151' }}>{level.label}</span>
                  <span style={{ fontSize: '10px', color: '#6b7280' }}>{level.function}</span>
                </div>
                <div style={{ display: 'flex', gap: '4px', marginTop: '3px', flexWrap: 'wrap' }}>
                  {mechs.map((m) => (
                    <span key={m.id} style={{ fontSize: '10px', padding: '1px 6px', background: m.color, color: 'white', borderRadius: '10px', fontWeight: '600' }}>
                      {m.id}: {Math.round((activations[m.id] ?? m.default_activation) * 100)}%
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ minWidth: '60px', textAlign: 'right' }}>
                <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px' }}>avg</div>
                <div style={{ fontFamily: 'monospace', fontWeight: '700', color: avgAct > 0.7 ? '#dc2626' : avgAct > 0.4 ? '#d97706' : '#16a34a', fontSize: '13px' }}>
                  {Math.round(avgAct * 100)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 7. Dynamic Cascade
// ---------------------------------------------------------------------------

function CascadePanel({ mr_score, p_syn }) {
  const synActive    = mr_score > 0.6;
  const psynCollapse = p_syn < 0.5;
  const etaDown      = mr_score > 0.7;
  const cognDown     = mr_score > 0.75;
  const cewsIgnored  = mr_score > 0.80;
  const sbeActive    = mr_score >= 0.85 && p_syn < 0.5;

  const stepActive = [true, synActive, psynCollapse, etaDown, cognDown, cewsIgnored, sbeActive];

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
      <div style={{ background: '#f3f4f6', padding: '8px 14px', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#374151' }}>
        🌊 Dinamikus Kaszkád Szekvencia
      </div>
      <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {CASCADE_SEQUENCE.map((step, i) => {
          const active = stepActive[i] ?? false;
          return (
            <div key={step.step} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 10px', borderRadius: '6px', background: active ? '#fef2f210' : 'transparent', opacity: active ? 1 : 0.45 }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: active ? '#dc2626' : '#d1d5db', color: 'white', fontSize: '10px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {step.step}
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: active ? '700' : '400', color: active ? '#dc2626' : '#6b7280' }}>{step.label}</div>
                <div style={{ fontSize: '10px', color: '#9ca3af' }}>{step.desc}</div>
              </div>
              {active && <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#dc2626', fontWeight: '700' }}>● AKTÍV</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 8. Fire Chief Verdict
// ---------------------------------------------------------------------------

function FireChiefVerdict({ mr_score, p_syn, result }) {
  const { tier, color, flags, collapse_risk } = result;

  return (
    <div style={{ border: `3px solid ${color}`, borderRadius: '10px', padding: '16px', marginBottom: '20px', background: `${color}08` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '20px' }}>🚒</span>
        <span style={{ fontWeight: '800', fontSize: '14px', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Fire Chief Verdict
        </span>
        <Badge color={color} size="12px">{tier}</Badge>
        {collapse_risk && <Badge color="#dc2626" size="12px">IRREVERZIBILIS PÁLYA</Badge>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '12px' }}>
        <div style={{ textAlign: 'center', background: 'white', borderRadius: '6px', padding: '10px' }}>
          <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', marginBottom: '2px' }}>MR_score</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color }}>{mr_score.toFixed(3)}</div>
        </div>
        <div style={{ textAlign: 'center', background: 'white', borderRadius: '6px', padding: '10px' }}>
          <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', marginBottom: '2px' }}>P_syn</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: p_syn < 0.5 ? '#dc2626' : '#374151' }}>{p_syn.toFixed(3)}</div>
        </div>
        <div style={{ textAlign: 'center', background: 'white', borderRadius: '6px', padding: '10px' }}>
          <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', marginBottom: '2px' }}>Θ_collapse</div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: collapse_risk ? '#dc2626' : '#16a34a' }}>
            {collapse_risk ? '⚠️ AKTÍV' : '✅ Nem aktív'}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <div style={{ fontSize: '10px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginBottom: '5px' }}>RED FLAGS:</div>
        {flags.length === 0
          ? <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>✅ Nincsenek aktív red flagek</div>
          : flags.map((f) => (
              <div key={f} style={{ fontSize: '12px', color: '#dc2626', fontWeight: '600', padding: '2px 0' }}>
                🚩 {f}
              </div>
            ))
        }
      </div>

      <div style={{ padding: '10px', background: 'white', borderRadius: '6px', fontSize: '11px', color: '#6b7280', lineHeight: '1.6' }}>
        <strong style={{ color: '#374151' }}>EFU 700.x következő lépés: </strong>
        ANTIFLUXUS VÉDELEM → Detektálás → Izoláció → Reverzió → Immunizáció
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main MR600Panel component
// ---------------------------------------------------------------------------

export default function MR600Panel() {
  // Initial activations from reference state
  const initialActivations = useMemo(() =>
    Object.fromEntries(MECHANISMS.map((m) => [m.id, m.default_activation])),
    []
  );
  const [activations, setActivations] = useState(initialActivations);

  const handleChange = (id, val) => setActivations((prev) => ({ ...prev, [id]: val }));

  // Load reference state preset
  const loadReference = () => {
    const preset = Object.fromEntries(MECHANISMS.map((m) => [m.id, m.default_activation]));
    setActivations(preset);
  };

  // Core calculations
  const mechValues = MECHANISMS.map((m) => activations[m.id] ?? m.default_activation);
  const { mr_score, sum_m, syn, inner } = calculateMRScore(mechValues);
  const p_syn   = calculatePSyn(mr_score);
  const stateResult = classifyMRState(mr_score, p_syn, true, true);

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', marginTop: '32px' }}>
      {/* Section header */}
      <div style={{
        borderTop: '2px solid #e5e7eb',
        paddingTop: '24px',
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        gap: '10px',
        justifyContent: 'space-between',
      }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '800', color: '#111827' }}>
            🦠 EFU 600.00 — Metabolikus Ragadozó v2.1
          </h2>
          <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
            Tier 0 Gyökér-Operátor · Domain: A-BIOFIZ / E-GAZDASÁGI / TEMPORÁLIS · M1–M12 teljes spektrum
          </p>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <Badge color="#7c3aed">TIER 0</Badge>
          <Badge color="#dc2626">12 Mechanizmus</Badge>
          <Badge color="#374151">600.00</Badge>
          <Badge color="#ea580c">CEWS-KOMPATIBILIS</Badge>
        </div>
      </div>

      {/* Reference state alert */}
      <div style={{ background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '8px', padding: '10px 14px', marginBottom: '20px', fontSize: '12px', color: '#92400e', lineHeight: '1.6' }}>
        <strong>📋 Referencia állapot (2026.03.30):</strong>{' '}
        MR_score = 0.93 · P_syn = 0.42 · PRD ≈ 0.47 · Verdict: <strong>TIER 0 SZINERGIKUS MASTER PARAZITA</strong> · Attractor lock-in · Összeomlási tartomány közeli.
        {' '}<button onClick={loadReference} style={{ marginLeft: '8px', fontSize: '11px', padding: '2px 10px', border: '1px solid #fbbf24', borderRadius: '4px', background: 'white', cursor: 'pointer', fontWeight: '600', color: '#92400e' }}>
          Betöltés
        </button>
      </div>

      {/* Live MR_score + P_syn */}
      <div style={{ border: `2px solid ${stateResult.color}`, borderRadius: '10px', padding: '16px', background: `${stateResult.color}08`, marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: '800', fontSize: '14px', color: '#374151', textTransform: 'uppercase' }}>
            Live: MR_score & P_syn
          </span>
          <Badge color={stateResult.color}>{stateResult.tier}</Badge>
        </div>
        <MRGauge mr_score={mr_score} p_syn={p_syn} />
        <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6b7280', background: 'white', padding: '8px 10px', borderRadius: '6px', lineHeight: '1.8', marginTop: '10px' }}>
          <div>MR_score = σ( ΣM_i × DCC × Network × e^(β×Syn) ) = σ( {sum_m.toFixed(2)} × 1 × 1 × e^(2.1×{syn.toFixed(3)}) ) = σ({inner.toFixed(3)}) = <strong>{mr_score.toFixed(3)}</strong></div>
          <div>P_syn = e^(-λ × MR_score) = e^(-1.5 × {mr_score.toFixed(3)}) = <strong>{p_syn.toFixed(3)}</strong></div>
          <div>Syn = Σ(M_i × M_j) [i&lt;j] = <strong>{syn.toFixed(3)}</strong></div>
        </div>
      </div>

      {/* Mechanism sliders */}
      <MechanismSliders activations={activations} onChange={handleChange} />

      {/* η(W)_eff */}
      <EfficiencyPanel mr_score={mr_score} p_syn={p_syn} />

      {/* PRD */}
      <PRDPanel mr_score={mr_score} p_syn={p_syn} />

      {/* Θ_collapse */}
      <CollapsePanel mr_score={mr_score} p_syn={p_syn} />

      {/* Predator Anatomy */}
      <AnatomyPanel activations={activations} />

      {/* Dynamic Cascade */}
      <CascadePanel mr_score={mr_score} p_syn={p_syn} />

      {/* Fire Chief Verdict */}
      <FireChiefVerdict mr_score={mr_score} p_syn={p_syn} result={stateResult} />

      {/* Footer */}
      <p style={{ fontSize: '10px', color: '#9ca3af', marginTop: '8px', lineHeight: '1.6' }}>
        EFU 600.00 Metabolikus Ragadozó v2.1 · Tier 0 · M1–M12 · MR_score = σ(ΣM × DCC × Network × e^(β·Syn)) ·
        P_syn = e^(-λ·MR) · β=2.1 · λ=1.5 ·
        Következő: EFU 700.x ANTIFLUXUS VÉDELEM ·
        Szerző: Simor István · ORCID: 0009-0002-6599-3480
      </p>
    </div>
  );
}
