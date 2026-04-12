/**
 * UPFMetabolism600Panel.jsx — EFU 600.58 UPF Anyagcsere Parazitizmus v0.2
 *
 * Sections:
 *   1.  Modul fejléc (CFI-N, W_irrev, formula chain, cascade)
 *   2.  Változó kalibráció (extractive + protective sliders + params)
 *   3.  CFI-N eredmény gauge
 *   4.  Zóna táblázat
 *   5.  Aktív triggerek
 *   6.  Kaszkád diagram
 *   7.  Beavatkozások
 *   8.  Planetáris skála
 *   9.  Kórházi hatás (η_heal_metabolic)
 *   10. JSON kimenet
 */

import { useState, useMemo } from 'react';
import {
  MODULE_META_58,
  CFIN_VARIABLES,
  CFIN_PARAMS,
  CFIN_ZONES,
  CFIN_TRIGGERS,
  CFIN_CASCADE,
  CFIN_INTERVENTIONS,
  CFIN_PLANETARY,
} from '../data/upfMetabolism600_58.js';
import {
  calculateCFIN,
  classifyCFINZone,
  evaluateCFINTriggers,
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
  const exceeded = variable.positive ? value < variable.threshold : value > variable.threshold;
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
        <span style={{ fontSize: '12px', fontWeight: '700', color: variable.color }}>{variable.code}</span>
        <span style={{ fontSize: '10px', color: '#6b7280', flex: 1, margin: '0 6px' }}>{variable.label}</span>
        <span style={{ fontSize: '12px', fontWeight: '700', color: exceeded ? '#dc2626' : variable.color, minWidth: '50px', textAlign: 'right' }}>
          {value.toFixed(2)}{exceeded ? ' ⚠️' : ''}
        </span>
      </div>
      <input
        type="range"
        min={variable.min}
        max={variable.max}
        step={variable.step}
        value={value}
        onChange={(e) => onChange(variable.id, parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: exceeded ? '#dc2626' : variable.color }}
      />
      {variable.keyFact && (
        <div style={{ fontSize: '9px', color: '#9ca3af', marginTop: '2px', fontStyle: 'italic' }}>{variable.keyFact}</div>
      )}
    </div>
  );
}

function ParamSlider({ param, value, onChange }) {
  const displayVal = param.unit === 'év' ? value : value.toFixed(param.step < 1 ? 2 : 0);
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
        <span style={{ fontSize: '11px', fontWeight: '700', color: param.color }}>{param.label}</span>
        <span style={{ fontSize: '12px', fontWeight: '700', color: param.color }}>
          {displayVal}{param.unit ? ` ${param.unit}` : ''}
        </span>
      </div>
      <input
        type="range"
        min={param.min}
        max={param.max}
        step={param.step}
        value={value}
        onChange={(e) => onChange(param.id, parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: param.color }}
      />
      {param.description && (
        <div style={{ fontSize: '9px', color: '#9ca3af', marginTop: '2px', fontStyle: 'italic' }}>{param.description}</div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function UPFMetabolism600Panel() {
  const initVars = () => {
    const v = {};
    for (const vr of CFIN_VARIABLES) v[vr.id] = vr.default;
    return v;
  };
  const initParams = () => {
    const p = {};
    for (const [k, param] of Object.entries(CFIN_PARAMS)) p[k] = param.default;
    return p;
  };

  const [varValues,   setVarValues]   = useState(initVars);
  const [paramValues, setParamValues] = useState(initParams);
  const [showJson,    setShowJson]    = useState(false);

  const handleVarChange   = (id, val) => setVarValues(prev  => ({ ...prev, [id]: val }));
  const handleParamChange = (id, val) => setParamValues(prev => ({ ...prev, [id]: val }));

  const result = useMemo(
    () => calculateCFIN({ ...varValues, ...paramValues }),
    [varValues, paramValues],
  );

  const { cfin_base, cfin_pfas, cfin_total, zone, triggers, components, diagnostics } = result;
  const isFireChief = zone.id === 'RED' || zone.id === 'CRITICAL';

  const extractiveVars = CFIN_VARIABLES.filter(v => v.group === 'extractive');
  const protectiveVars = CFIN_VARIABLES.filter(v => v.group === 'protective');
  const paramList      = Object.values(CFIN_PARAMS);

  const progressPct = Math.min(100, (cfin_total / 1500) * 100);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', fontSize: '13px', color: '#111827', maxWidth: '900px', margin: '0 auto', padding: '20px' }}>

      {/* 1. Header */}
      <div style={{ background: 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)', color: 'white', borderRadius: '10px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '4px' }}>
              EFU {MODULE_META_58.id} · {MODULE_META_58.series}
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>{MODULE_META_58.title}</h2>
            <div style={{ fontSize: '13px', opacity: 0.85, marginTop: '4px' }}>{MODULE_META_58.subtitle}</div>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <Badge color="#111827">{MODULE_META_58.subtype}</Badge>
            <Badge color="#374151">W_irrev = {MODULE_META_58.W_irrev}</Badge>
            <Badge color="#b91c1c">{MODULE_META_58.risk_level}</Badge>
            <Badge color="#374151">{MODULE_META_58.status}</Badge>
          </div>
        </div>
        <div style={{ marginTop: '12px', background: 'rgba(0,0,0,0.30)', borderRadius: '6px', padding: '10px', fontSize: '10px', fontFamily: 'monospace' }}>
          {MODULE_META_58.formula.split('\n').map((line, i) => (
            <div key={i} style={{ color: '#fbbf24', marginBottom: '2px' }}>{line}</div>
          ))}
        </div>
        <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {MODULE_META_58.cascade_modules.map(m => (
            <span key={m} style={{ fontSize: '9px', background: 'rgba(255,255,255,0.15)', padding: '2px 7px', borderRadius: '10px' }}>⇄ {m}</span>
          ))}
        </div>
        {MODULE_META_58.limitations && (
          <div style={{ marginTop: '10px', fontSize: '9px', opacity: 0.65 }}>
            ⚠️ Limitációk: {MODULE_META_58.limitations.join(' · ')}
          </div>
        )}
      </div>

      {/* 2. Calibration */}
      <SectionBox title="Változó Kalibráció – CFI-N" icon="⚙️" accentColor="#d1d5db">
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#dc2626', marginBottom: '8px', textTransform: 'uppercase' }}>
          📉 Extraktív változók
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 30px' }}>
          {extractiveVars.map(vr => (
            <VarSlider key={vr.id} variable={vr} value={varValues[vr.id]} onChange={handleVarChange} />
          ))}
        </div>
        <div style={{ borderTop: '1px dashed #e5e7eb', paddingTop: '12px', marginTop: '4px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#16a34a', marginBottom: '8px', textTransform: 'uppercase' }}>
            🛡️ Védő változó
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 30px' }}>
            {protectiveVars.map(vr => (
              <VarSlider key={vr.id} variable={vr} value={varValues[vr.id]} onChange={handleVarChange} />
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px dashed #e5e7eb', paddingTop: '12px', marginTop: '4px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '8px', textTransform: 'uppercase' }}>
            🔧 Modell paraméterek
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 30px' }}>
            {paramList.map(p => (
              <ParamSlider key={p.id} param={p} value={paramValues[p.id]} onChange={handleParamChange} />
            ))}
          </div>
        </div>
      </SectionBox>

      {/* 3. Result gauge */}
      <SectionBox title="CFI-N Eredmény" icon="📊" accentColor={zone.color}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center', background: zone.color, color: 'white', borderRadius: '10px', padding: '16px 24px', minWidth: '130px' }}>
            <div style={{ fontSize: '11px', opacity: 0.85, marginBottom: '4px' }}>CFI-N TOTAL</div>
            <div style={{ fontSize: '32px', fontWeight: '900', lineHeight: 1 }}>{cfin_total.toFixed(1)}</div>
            <div style={{ fontSize: '12px', marginTop: '6px', opacity: 0.9 }}>{zone.id}</div>
            <div style={{ fontSize: '10px', marginTop: '2px', opacity: 0.85 }}>{zone.status}</div>
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ marginBottom: '8px', width: '100%', background: '#e5e7eb', borderRadius: '6px', height: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPct}%`, background: zone.color, height: '100%', transition: 'width 0.3s' }} />
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280', lineHeight: '1.8' }}>
              <div>CFI-N base: <strong>{cfin_base.toFixed(1)}</strong></div>
              <div>CFI-N + PFAS kaszkád: <strong>{cfin_pfas.toFixed(1)}</strong></div>
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '4px', marginTop: '4px' }}>
                B_food: <strong>{components.B_food}</strong> · extractive_sum: <strong>{components.extractive_sum.toFixed(4)}</strong> · W_irrev: <strong>{components.W_irrev}</strong>
              </div>
              <div>Konfidencia: <strong>{(diagnostics.confidence * 100).toFixed(0)}%</strong></div>
              {diagnostics.missing_inputs.length > 0 && (
                <div style={{ color: '#f59e0b' }}>Hiányzó: {diagnostics.missing_inputs.join(', ')}</div>
              )}
            </div>
          </div>
        </div>
        {isFireChief && (
          <div style={{ marginTop: '12px', background: '#111827', color: '#fbbf24', padding: '10px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
            🔴 FIRE CHIEF SZINT AKTÍV — 500.4 minimum 30% allokáció kötelező + mikrobiom rehabilitáció program azonnali indítás.
          </div>
        )}
      </SectionBox>

      {/* 4. Zone table */}
      <SectionBox title="Zóna Táblázat – CFI-N Skála" icon="🌐" accentColor="#d1d5db">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              {['Zóna', 'CFI-N', 'Státusz', 'Dashboard akció', 'Allokáció'].map(h => (
                <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '700', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CFIN_ZONES.map(z => {
              const active = zone.id === z.id;
              return (
                <tr key={z.id} style={{ background: active ? z.bg : 'transparent', fontWeight: active ? '700' : '400' }}>
                  <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ color: z.color, fontWeight: '700' }}>{z.label}</span>
                    {active && <span style={{ marginLeft: '6px', fontSize: '9px', background: z.color, color: 'white', padding: '1px 5px', borderRadius: '4px' }}>AKTÍV</span>}
                  </td>
                  <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', color: '#374151' }}>{z.condition}</td>
                  <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', color: z.color, fontWeight: '600' }}>{z.status}</td>
                  <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', color: '#4b5563', fontSize: '10px' }}>{z.dashboard_action}</td>
                  <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', color: '#4b5563', fontSize: '10px' }}>{z.allocation}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </SectionBox>

      {/* 5. Triggers */}
      <SectionBox title="Aktív Triggerek" icon="🚨" accentColor="#fca5a5">
        {CFIN_TRIGGERS.map(trig => {
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
              </div>
            </div>
          );
        })}
      </SectionBox>

      {/* 6. Cascade */}
      <SectionBox title="Kaszkád Diagram – 600.53 ↔ 600.58 ↔ 600.52" icon="🔄" accentColor="#c4b5fd">
        {CFIN_CASCADE.map(step => (
          <div key={step.step} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ background: step.color, color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', flexShrink: 0 }}>
              {step.step}
            </div>
            <div style={{ flex: 1, background: '#f9fafb', border: `1px solid ${step.color}`, borderRadius: '6px', padding: '8px 12px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: step.color }}>{step.from}</div>
              <div style={{ fontSize: '10px', color: '#374151', margin: '2px 0' }}>⬇ {step.mechanism}</div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#111827' }}>{step.to}</div>
            </div>
          </div>
        ))}
      </SectionBox>

      {/* 7. Interventions */}
      <SectionBox title="Stratégiai Beavatkozások" icon="🛠️" accentColor="#bbf7d0">
        {CFIN_INTERVENTIONS.map((iv, i) => (
          <div key={i} style={{ background: '#f9fafb', border: `1px solid ${iv.color}`, borderRadius: '6px', padding: '12px', marginBottom: '10px' }}>
            <div style={{ fontWeight: '700', color: iv.color, fontSize: '12px', marginBottom: '8px' }}>{iv.timeframe}</div>
            {iv.steps.map((s, j) => (
              <div key={j} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '5px' }}>
                <span style={{ fontSize: '9px', background: iv.color, color: 'white', padding: '2px 5px', borderRadius: '3px', marginTop: '1px', flexShrink: 0 }}>{s.module}</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#111827' }}>{s.title}</span>
                  <span style={{ fontSize: '10px', color: '#6b7280', marginLeft: '6px' }}>{s.impact}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </SectionBox>

      {/* 8. Planetary scale */}
      <SectionBox title="Planetáris Skála" icon="🌍" accentColor="#fecaca">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {CFIN_PLANETARY.map((p, i) => (
            <div key={i} style={{ background: '#fff5f5', border: `1px solid ${p.color}`, borderRadius: '6px', padding: '10px 14px' }}>
              <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px' }}>{p.label}</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: p.color }}>{p.value}</div>
              <div style={{ fontSize: '9px', color: '#9ca3af' }}>{p.unit}</div>
            </div>
          ))}
        </div>
      </SectionBox>

      {/* 9. Hospital impact */}
      <SectionBox title="Kórházi Metabolikus Hatás" icon="🏥" accentColor="#fde68a">
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', padding: '12px', marginBottom: '10px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#92400e', marginBottom: '6px' }}>η_heal_metabolic formula</div>
          <code style={{ fontSize: '11px', color: '#374151', background: '#f3f4f6', padding: '6px 10px', borderRadius: '4px', display: 'block', lineHeight: '1.8' }}>
            η_heal_metabolic = (1 − CFI_N_total / CFI_N_max) × F_regen_gut × W_irrev_inv<br/>
            ahol W_irrev_inv = 1 − {MODULE_META_58.W_irrev} = {(1 - MODULE_META_58.W_irrev).toFixed(2)}
          </code>
        </div>
        <div style={{ fontSize: '11px', color: '#6b7280', lineHeight: '1.8' }}>
          <div>📊 Jelenlegi CFI-N total: <strong style={{ color: zone.color }}>{cfin_total.toFixed(1)}</strong></div>
          <div>🔬 Referencia maximum (CRITICAL küszöb): <strong>1200</strong></div>
          <div>🌿 F_regen_gut: <strong style={{ color: '#16a34a' }}>{varValues.F_regen_gut.toFixed(2)}</strong></div>
          <div style={{ marginTop: '6px', padding: '8px', background: '#f0fdf4', borderRadius: '4px', color: '#15803d', fontWeight: '600' }}>
            η_heal_metabolic ≈ {Math.max(0, ((1 - Math.min(cfin_total, 1200) / 1200) * varValues.F_regen_gut * (1 - MODULE_META_58.W_irrev))).toFixed(4)}
          </div>
          <div style={{ marginTop: '6px', fontSize: '9px', color: '#9ca3af', fontStyle: 'italic' }}>
            Referencia: 104.13.3 EFU Hospital Metabolism Audit v1.0 – HMI_metabolic = -2.8
          </div>
        </div>
      </SectionBox>

      {/* 10. JSON output */}
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
