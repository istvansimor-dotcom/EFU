/**
 * GreshamParasite600Panel.jsx — EFU 600.69 Gresham–Parazita Spirál v1.0
 *
 * M9 ANYAGI (PRIMARY) | M12 VÁLSÁG (SECONDARY)
 * Mechanizmus: Metabolikus Extrakció és Rendszerszintű Kiszorítás
 *
 * Sections:
 *   1. Modul fejléc (axióma, spirál fázisok, nexus)
 *   2. 6-változó kalibráció (DL, MB, KL, EE, JL, LQ, S, Φ)
 *   3. GPS index eredmény + változó-hozzájárulások
 *   4. Zóna táblázat (5 zóna, spirál fázisok)
 *   5. Trigger logika (4 trigger, AP kódok)
 *   6. Fire Chief audit (spirál fázis diagnózis)
 *   7. Beavatkozási lépések
 *   8. JSON kimenet
 *
 * Reference: EFU 600.69 GPS v1.0 (2026-04-11)
 */

import { useState, useMemo } from 'react';
import {
  MODULE_META_69,
  GPS_VARIABLES,
  GPS_SYNERGY,
  GPS_PHI,
  GPS_ZONES,
  GPS_TRIGGERS,
  FIRE_CHIEF_AUDIT_69,
  GPS_INTERVENTIONS,
} from '../data/greshamParasite600_69.js';
import {
  calculateGPS,
  classifyGPSZone,
  evaluateGPSTriggers,
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
  const exceeded = value > variable.threshold;
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
        <span style={{ fontSize: '12px', fontWeight: '700', color: variable.color }}>
          {variable.code}
        </span>
        <span style={{ fontSize: '10px', color: '#6b7280', flex: 1, margin: '0 6px' }}>
          {variable.label}
        </span>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#9ca3af', marginTop: '2px' }}>
        <span>0</span>
        <span style={{ color: exceeded ? '#dc2626' : '#d97706', fontWeight: exceeded ? '700' : '400' }}>
          küszöb: {variable.threshold.toFixed(2)} [{variable.alertLevel}]
        </span>
        <span>1</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function GreshamParasite600Panel() {
  // Build initial state from variable defaults
  const initVars = () => {
    const v = {};
    for (const vr of GPS_VARIABLES) v[vr.id] = vr.default;
    return v;
  };

  const [varValues, setVarValues] = useState(initVars);
  const [synergy, setSynergy]     = useState(GPS_SYNERGY.default);
  const [phi, setPhi]             = useState(GPS_PHI.default);
  const [showJson, setShowJson]   = useState(false);

  const handleVarChange = (id, val) => setVarValues(prev => ({ ...prev, [id]: val }));

  const result = useMemo(
    () => calculateGPS({ ...varValues, S: synergy, Phi: phi }),
    [varValues, synergy, phi],
  );

  const { gps_index, zone, triggers, variable_contributions, diagnostics } = result;
  const isFireChief = zone.id === 'CRITICAL';

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', fontSize: '13px', color: '#111827', maxWidth: '900px', margin: '0 auto', padding: '20px' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)', color: 'white', borderRadius: '10px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '4px' }}>
              EFU {MODULE_META_69.id} · {MODULE_META_69.series}
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>{MODULE_META_69.title}</h2>
            <div style={{ fontSize: '13px', opacity: 0.85, marginTop: '4px' }}>{MODULE_META_69.subtitle}</div>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <Badge color="#dc2626">{MODULE_META_69.mechanism_primary}</Badge>
            <Badge color="#7c3aed">{MODULE_META_69.mechanism_secondary}</Badge>
            <Badge color="#374151">{MODULE_META_69.status}</Badge>
          </div>
        </div>
        <div style={{ marginTop: '12px', fontSize: '11px', opacity: 0.8, lineHeight: '1.6', fontStyle: 'italic' }}>
          {MODULE_META_69.axiom}
        </div>
        <div style={{ marginTop: '10px', fontSize: '10px', opacity: 0.65 }}>
          Formula: <code style={{ color: '#fbbf24' }}>{MODULE_META_69.formula}</code>
        </div>
        <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {MODULE_META_69.spiral_phases.map(p => (
            <span key={p} style={{ fontSize: '9px', background: 'rgba(255,255,255,0.15)', padding: '2px 7px', borderRadius: '10px' }}>{p}</span>
          ))}
        </div>
        <div style={{ marginTop: '8px', fontSize: '10px', opacity: 0.65 }}>
          Nexus: {MODULE_META_69.nexus.join(' · ')}
        </div>
      </div>

      {/* Calibration */}
      <SectionBox title="Változó Kalibráció" icon="⚙️" accentColor="#d1d5db">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 30px' }}>
          {GPS_VARIABLES.map(vr => (
            <VarSlider key={vr.id} variable={vr} value={varValues[vr.id]} onChange={handleVarChange} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 30px', marginTop: '4px', paddingTop: '12px', borderTop: '1px dashed #e5e7eb' }}>
          {/* Synergy slider */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#374151' }}>S – Spirál-erősítő</span>
              <span style={{ fontSize: '12px', fontWeight: '700' }}>{synergy.toFixed(2)}×</span>
            </div>
            <input type="range" min={GPS_SYNERGY.min} max={GPS_SYNERGY.max} step={GPS_SYNERGY.step}
              value={synergy} onChange={e => setSynergy(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#374151' }} />
          </div>
          {/* Phi slider */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#9a3412' }}>Φ – Láthatatlan Adósság</span>
              <span style={{ fontSize: '12px', fontWeight: '700', color: phi > GPS_PHI.threshold ? '#dc2626' : '#9a3412' }}>
                {phi} EFU{phi > GPS_PHI.threshold ? ' ⚠️' : ''}
              </span>
            </div>
            <input type="range" min={GPS_PHI.min} max={GPS_PHI.max} step={GPS_PHI.step}
              value={phi} onChange={e => setPhi(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: phi > GPS_PHI.threshold_fire ? '#dc2626' : '#9a3412' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#9ca3af', marginTop: '2px' }}>
              <span>0</span>
              <span>küszöb: {GPS_PHI.threshold} | fire: {GPS_PHI.threshold_fire}</span>
              <span>1000</span>
            </div>
          </div>
        </div>
      </SectionBox>

      {/* Result */}
      <SectionBox title="GPS Index Eredmény" icon="📊" accentColor={zone.color}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center', background: zone.color, color: 'white', borderRadius: '10px', padding: '16px 24px', minWidth: '120px' }}>
            <div style={{ fontSize: '11px', opacity: 0.85, marginBottom: '4px' }}>GPS INDEX</div>
            <div style={{ fontSize: '36px', fontWeight: '900', lineHeight: 1 }}>{gps_index.toFixed(3)}</div>
            <div style={{ fontSize: '12px', marginTop: '6px', opacity: 0.9 }}>{zone.label}</div>
            <div style={{ fontSize: '11px', marginTop: '2px', opacity: 0.85 }}>{zone.status}</div>
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ fontWeight: '700', color: '#374151' }}>Beavatkozás: </span>
              <span style={{ color: zone.color, fontWeight: '600' }}>{zone.action}</span>
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280', lineHeight: '1.7' }}>
              <div>Alap-index: <strong>{diagnostics.base_index}</strong></div>
              <div>Φ-erősítő: <strong>{diagnostics.phi_effect}×</strong></div>
              <div>Szinergia (S): <strong>{diagnostics.synergy}×</strong></div>
              <div>Konfidencia: <strong>{(diagnostics.confidence * 100).toFixed(0)}%</strong></div>
              {diagnostics.missing_inputs.length > 0 && (
                <div style={{ color: '#f59e0b' }}>Hiányzó: {diagnostics.missing_inputs.join(', ')}</div>
              )}
            </div>
          </div>
        </div>

        {/* Variable contributions bar chart */}
        <div style={{ marginTop: '14px' }}>
          <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase' }}>Változó hozzájárulások</div>
          {GPS_VARIABLES.map(vr => {
            const contrib = variable_contributions[vr.id] || 0;
            const maxContrib = vr.weight;
            const pct = maxContrib > 0 ? Math.min(100, (contrib / maxContrib) * 100) : 0;
            return (
              <div key={vr.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '10px', fontWeight: '700', color: vr.color, minWidth: '28px' }}>{vr.code}</span>
                <div style={{ flex: 1, background: '#f3f4f6', borderRadius: '3px', height: '8px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, background: vr.color, height: '100%', transition: 'width 0.3s' }} />
                </div>
                <span style={{ fontSize: '10px', color: '#374151', minWidth: '40px', textAlign: 'right' }}>{contrib.toFixed(4)}</span>
              </div>
            );
          })}
        </div>
      </SectionBox>

      {/* Zone table */}
      <SectionBox title="Zóna Táblázat – Spirál Fázisok" icon="🌀" accentColor="#d1d5db">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              {['Zóna', 'GPS', 'Spirál Fázis', 'Szorzó', 'Beavatkozás'].map(h => (
                <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '700', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GPS_ZONES.map(z => {
              const active = zone.id === z.id;
              return (
                <tr key={z.id} style={{ background: active ? z.bg : 'transparent', fontWeight: active ? '700' : '400' }}>
                  <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ color: z.color, fontWeight: '700' }}>{z.label}</span>
                    {active && <span style={{ marginLeft: '6px', fontSize: '9px', background: z.color, color: 'white', padding: '1px 5px', borderRadius: '4px' }}>AKTÍV</span>}
                  </td>
                  <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', color: '#374151' }}>{z.condition}</td>
                  <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', color: z.color, fontWeight: '600' }}>{z.status}</td>
                  <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6' }}>{z.multiplier}×</td>
                  <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', color: '#4b5563' }}>{z.action}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </SectionBox>

      {/* Triggers */}
      <SectionBox title="Trigger Logika – AP Kód Aktiválás" icon="🚨" accentColor="#fca5a5">
        {GPS_TRIGGERS.map(trig => {
          const isActive = triggers.active_triggers.includes(trig.id);
          return (
            <div key={trig.id} style={{
              display: 'flex', gap: '10px', padding: '10px 12px', borderRadius: '6px', marginBottom: '8px',
              background: isActive ? '#fef2f2' : '#f9fafb',
              border: `1px solid ${isActive ? trig.color : '#e5e7eb'}`,
              opacity: isActive ? 1 : 0.65,
            }}>
              <div style={{ fontSize: '18px', lineHeight: 1, marginTop: '2px' }}>
                {isActive ? '🔴' : '⚪'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                  <span style={{ fontWeight: '700', color: trig.color, fontSize: '12px' }}>{trig.label}</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <Badge color={isActive ? trig.color : '#9ca3af'} size="10px">{trig.level}</Badge>
                    {trig.alertCode && <Badge color={isActive ? '#111827' : '#9ca3af'} size="10px">{trig.alertCode}</Badge>}
                  </div>
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

      {/* Fire Chief Audit */}
      <SectionBox title={`Fire Chief Audit – Spirál Fázis Diagnózis ${isFireChief ? '⚫ AKTÍV' : ''}`} icon="🔥" accentColor={isFireChief ? '#111827' : '#d1d5db'}>
        {isFireChief && (
          <div style={{ background: '#111827', color: '#fbbf24', padding: '10px 14px', borderRadius: '6px', marginBottom: '12px', fontSize: '11px', fontWeight: '700' }}>
            ⚫ JEVONS ÖSSZEOMLÁS AKTÍV — A szimbiotikus infrastruktúrát a II. fázisban felszámolták. Nincs visszatérési út.
            Azonnali Fire Chief protokoll + JIM-30 kompatibilis teljes rendszercsere szükséges.
          </div>
        )}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              {['Spirál Marker', 'Diagnózis', 'Részlet'].map(h => (
                <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '700', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FIRE_CHIEF_AUDIT_69.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? '#f9fafb' : 'white' }}>
                <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', fontWeight: '600', color: '#374151', maxWidth: '180px' }}>{row.layer}</td>
                <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6' }}>
                  <Badge color={row.verdict.startsWith('RED') ? '#dc2626' : '#16a34a'} size="10px">
                    {row.verdict}
                  </Badge>
                </td>
                <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', color: '#4b5563' }}>{row.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionBox>

      {/* Interventions */}
      <SectionBox title="Operatív Beavatkozások" icon="🛠️" accentColor="#bbf7d0">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {GPS_INTERVENTIONS.map(iv => (
            <div key={iv.step} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <span style={{ fontWeight: '700', color: '#15803d', fontSize: '12px' }}>{iv.step}. {iv.title}</span>
                <Badge color="#15803d">{iv.r_future_delta} r_future</Badge>
              </div>
              <div style={{ fontSize: '10px', color: '#374151', marginBottom: '4px' }}>{iv.description}</div>
              <div style={{ fontSize: '10px', color: '#15803d', fontStyle: 'italic' }}>{iv.estimated_impact}</div>
            </div>
          ))}
        </div>
      </SectionBox>

      {/* JSON output */}
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
