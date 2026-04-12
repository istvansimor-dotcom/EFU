/**
 * CollectiveTrauma700Panel.jsx — EFU 700.11 Kollektív Trauma Gyógyítás és Igazságtétel v1.0
 *
 * Sections:
 *   1. Module header
 *   2. Változó kalibráció – 3 réteg
 *   3. TRC index eredmény + komponens pontszámok
 *   4. NET_EFU + HMI + R_future + Interstitium összefoglaló
 *   5. Gyógyítási Folyamat Metrikák
 *   6. Zóna táblázat (5 zóna)
 *   7. Trigger logika (4 trigger)
 *   8. Pilot referencia táblázat
 *   9. JSON kimenet
 */

import { useState, useMemo } from 'react';
import {
  MODULE_META_700_11,
  TRC_VARIABLES_MAIN,
  TRC_VARIABLES_NEGATIVE,
  TRC_VARIABLES_TRI,
  TRC_VARIABLES_CONTEXT,
  TRC_ZONES,
  TRC_TRIGGERS,
} from '../data/collectiveTrauma700_11.js';
import { calculateTRC } from '../logic/efu-engine.js';

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
    if (variable.id === 'population_affected_m') return v.toLocaleString('hu-HU') + ' M';
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
        <span style={{ fontSize: '12px', fontWeight: '700', color: variable.color, minWidth: '54px', textAlign: 'right' }}>
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
        <span style={{ fontSize: '9px', color: '#9ca3af' }}>{variable.description}</span>
        <span>{variable.max}</span>
      </div>
    </div>
  );
}

function ScoreBar({ label, value, color, max = 1 }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
        <span style={{ fontSize: '11px', fontWeight: '700', color: '#374151' }}>{label}</span>
        <span style={{ fontSize: '12px', fontWeight: '700', color }}>{value.toFixed(3)}</span>
      </div>
      <div style={{ background: '#f3f4f6', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
        <div style={{ background: color, height: '100%', width: `${pct}%`, borderRadius: '4px', transition: 'width 0.3s' }} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pilot reference data
// ---------------------------------------------------------------------------

const PILOT_CASES = [
  { city: 'Dél-Afrika TRC 🇿🇦 ★', period: '1996–1998', size: '21,000 vallomás, 7,124 amnesztia kérelem', result: 'Globális TRC modell – Desmond Tutu elnökletével, megbocsátás + igazság' },
  { city: 'Rwanda Gacaca 🇷🇼', period: '2002–2012', size: '1.2M ügy, 12k közösségi bíróság', result: 'Közösségi igazságszolgáltatás – 80% ügy lezárva, kibékülés folyamatban' },
  { city: 'Kanada TRC 🇨🇦', period: '2008–2015', size: '150k bentlakásos iskola túlélő', result: '94 cselekvési terv – teljes jóvátétel, őslakos oktatás reformja' },
  { city: 'Argentína CONADEP 🇦🇷', period: '1983–1985', size: '9,000 eltűnt dokumentálva', result: 'Nunca Más jelentés – latin-amerik. minta, katonai vezetők elítélve' },
];

// ---------------------------------------------------------------------------
// Main Panel
// ---------------------------------------------------------------------------

export default function CollectiveTrauma700Panel() {
  const buildDefaults = (vars) => {
    const d = {};
    vars.forEach(v => { d[v.id] = v.default; });
    return d;
  };

  const [vals, setVals] = useState({
    ...buildDefaults(TRC_VARIABLES_MAIN),
    ...buildDefaults(TRC_VARIABLES_NEGATIVE),
    ...buildDefaults(TRC_VARIABLES_TRI),
    ...buildDefaults(TRC_VARIABLES_CONTEXT),
  });

  const handleChange = (id, value) => setVals(prev => ({ ...prev, [id]: value }));

  const result = useMemo(() => calculateTRC(vals), [vals]);
  const { trc_index, tri, tri_zone, zone, triggers, scores, efu } = result;

  const [showJson, setShowJson] = useState(false);

  // Section 5 metrics
  const trauma_reduction = 1 - vals.trauma_transmission_untreated * (1 - vals.truth_process_depth * 0.5);
  const political_effectiveness = (vals.political_will + vals.community_participation) / 2;
  const healing_trajectory = (vals.truth_process_depth + vals.reparation_coverage + vals.memorialization_quality) / 3;

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif", maxWidth: '900px', margin: '32px auto', padding: '0 16px', color: '#111827' }}>

      {/* ── 1. Header ── */}
      <div style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 60%, #dc2626 100%)', color: 'white', borderRadius: '10px', padding: '20px 24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              EFU {MODULE_META_700_11.id} · {MODULE_META_700_11.series} · v{MODULE_META_700_11.version}
            </div>
            <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '800' }}>{MODULE_META_700_11.title}</h2>
            <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>TRI = (P_agency × C_trust) / (T_load + 1) · Fire Chief: érzelmi biztonság szövése · EZ SEV 2 előfeltétel</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Badge color="rgba(255,255,255,0.25)" size="10px">{MODULE_META_700_11.status}</Badge>
              <Badge color="rgba(220,38,38,0.8)" size="10px">⚔ Ellentét: {MODULE_META_700_11.antithesis}</Badge>
              <Badge color="rgba(255,255,255,0.2)" size="10px">TRC Kernel</Badge>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '32px', fontWeight: '900', lineHeight: 1 }}>{trc_index.toFixed(2)}</div>
            <div style={{ fontSize: '11px', opacity: 0.8 }}>TRC Index</div>
            <div style={{ marginTop: '6px' }}>
              <Badge color={zone.color} size="11px">{zone.label}</Badge>
            </div>
          </div>
        </div>
        <div style={{ marginTop: '12px', padding: '8px 12px', background: 'rgba(255,255,255,0.15)', borderRadius: '6px', fontSize: '11px' }}>
          <span style={{ opacity: 0.8 }}>Formula: </span>
          <code style={{ fontFamily: 'monospace', fontSize: '11px' }}>{MODULE_META_700_11.formula}</code>
        </div>
      </div>

      {/* ── 2. Sliders ── */}
      <SectionBox title="Változó Kalibráció – 3 Réteg" icon="🎛" accentColor="#e9d5ff">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 28px' }}>
          <div>
            <LayerHeader label="Fő Változók (TRC komponensek)" icon="⚖️" color="#7c3aed" />
            {TRC_VARIABLES_MAIN.map(v => (
              <VarSlider key={v.id} variable={v} value={vals[v.id]} onChange={handleChange} />
            ))}
          </div>
          <div>
            <LayerHeader label="Negatív Tényezők (trauma + T_load)" icon="⚠️" color="#dc2626" />
            {TRC_VARIABLES_NEGATIVE.map(v => (
              <VarSlider key={v.id} variable={v} value={vals[v.id]} onChange={handleChange} />
            ))}
            <LayerHeader label="TRI Formula (P_agency, C_trust)" icon="🔬" color="#6d28d9" />
            {TRC_VARIABLES_TRI.map(v => (
              <VarSlider key={v.id} variable={v} value={vals[v.id]} onChange={handleChange} />
            ))}
            <LayerHeader label="Kontextus (érintett népesség)" icon="👥" color="#374151" />
            {TRC_VARIABLES_CONTEXT.map(v => (
              <VarSlider key={v.id} variable={v} value={vals[v.id]} onChange={handleChange} />
            ))}
          </div>
        </div>
      </SectionBox>

      {/* ── TRI Section ── */}
      <SectionBox title="TRI – Trauma Regeneratív Index" icon="🧬" accentColor="#e9d5ff">
        {(() => {
          const triColor = tri_zone === 'CRITICAL' ? '#dc2626' : tri_zone === 'TRANSITIONAL' ? '#ca8a04' : '#16a34a';
          const triLabel = tri_zone === 'CRITICAL' ? '🔴 KRITIKUS – nem alkalmas önigazgatásra' : tri_zone === 'TRANSITIONAL' ? '🟡 ÁTMENETI – vegyes governance + mentorálás szükséges' : '🟢 REGENERATÍV – teljes 700-as stack futtatható';
          return (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '12px' }}>
                <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>P_agency</div>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: '#7c3aed' }}>{vals.p_agency?.toFixed(2) ?? '—'}</div>
                  <div style={{ fontSize: '9px', color: '#9ca3af' }}>Közösség cselekvőképessége</div>
                </div>
                <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>C_trust</div>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: '#6d28d9' }}>{vals.c_trust?.toFixed(2) ?? '—'}</div>
                  <div style={{ fontSize: '9px', color: '#9ca3af' }}>Horizontális bizalmi index</div>
                </div>
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>T_load</div>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: '#dc2626' }}>{vals.t_load?.toFixed(1) ?? '—'}</div>
                  <div style={{ fontSize: '9px', color: '#9ca3af' }}>Traumaterhelés (0–10)</div>
                </div>
              </div>
              <div style={{ padding: '14px', background: triColor + '15', borderRadius: '8px', border: `2px solid ${triColor}40`, textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: '900', color: triColor }}>{(tri ?? 0).toFixed(3)}</div>
                <div style={{ fontSize: '12px', color: '#374151', marginBottom: '4px' }}>TRI = (P_agency × C_trust) / (T_load + 1)</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: triColor }}>{triLabel}</div>
              </div>
              <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '10px' }}>
                <div style={{ padding: '8px', background: '#fef2f2', borderRadius: '6px', border: '1px solid #fecaca', color: '#dc2626', textAlign: 'center' }}>
                  <strong>TRI &lt; 0.3</strong><br />KRITIKUS<br /><span style={{ color: '#6b7280' }}>Nem alkalmas önigazgatásra</span>
                </div>
                <div style={{ padding: '8px', background: '#fefce8', borderRadius: '6px', border: '1px solid #fde68a', color: '#ca8a04', textAlign: 'center' }}>
                  <strong>0.3 – 0.7</strong><br />ÁTMENETI<br /><span style={{ color: '#6b7280' }}>Vegyes governance + mentorálás</span>
                </div>
                <div style={{ padding: '8px', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0', color: '#16a34a', textAlign: 'center' }}>
                  <strong>TRI &gt; 0.7</strong><br />REGENERATÍV<br /><span style={{ color: '#6b7280' }}>Teljes 700-stack futtatható</span>
                </div>
              </div>
            </div>
          );
        })()}
      </SectionBox>

      {/* ── 3-rétegű gyógyítási modell ── */}
      <SectionBox title="3-Rétegű Gyógyítási Modell" icon="🏥" accentColor="#e9d5ff">
        {[
          { icon: '🔧', label: 'Fizikai réteg', color: '#b45309', desc: 'JIM-30 infrastruktúra – fizikai biztonság, helyreállítási kapacitás, materiális stabilitás' },
          { icon: '💬', label: 'Közösségi réteg', color: '#7c3aed', desc: 'Facilitált dialógus, narratív gyógyítás, kollektív emlékezés – Fire Chief érzelmi biztonság szövése' },
          { icon: '🏛', label: 'Intézményi réteg', color: '#0369a1', desc: 'Trauma-érzékeny design, 900.6.1 protokoll, EZ SEV 2 szintű beavatkozási rendszer' },
        ].map((layer, i) => (
          <div key={i} style={{ display: 'flex', gap: '12px', padding: '10px', background: '#faf5ff', borderRadius: '8px', border: `1px solid ${layer.color}30`, marginBottom: '8px' }}>
            <div style={{ fontSize: '24px' }}>{layer.icon}</div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: layer.color }}>{layer.label}</div>
              <div style={{ fontSize: '11px', color: '#374151' }}>{layer.desc}</div>
            </div>
          </div>
        ))}
      </SectionBox>

      {/* ── 3. Index komponensek ── */}
      <SectionBox title="TRC Index Komponensek" icon="📊" accentColor="#e9d5ff">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 28px' }}>
          <div>
            <ScoreBar label="Igazságtétel score"  value={scores.truth_score}     color="#7c3aed" />
            <ScoreBar label="Politikai score"     value={scores.political_score} color="#9333ea" />
          </div>
          <div>
            <ScoreBar label="Trauma büntetés"    value={scores.trauma_penalty}  color="#dc2626" />
            <ScoreBar label="Alap TRC score"     value={scores.base_trc}        color="#0369a1" />
          </div>
        </div>
        <div style={{ marginTop: '14px', padding: '12px', background: zone.bg, borderRadius: '8px', border: `2px solid ${zone.color}40` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '28px', fontWeight: '900', color: zone.color }}>{trc_index.toFixed(2)}</span>
              <span style={{ fontSize: '13px', color: '#6b7280', marginLeft: '8px' }}>/ 10 TRC Index</span>
            </div>
            <Badge color={zone.color} size="12px">{zone.label}</Badge>
          </div>
          <div style={{ fontSize: '11px', color: '#374151', marginTop: '6px' }}>{zone.action}</div>
        </div>
      </SectionBox>

      {/* ── 4. NET_EFU + HMI + R_future összefoglaló ── */}
      <SectionBox title="NET EFU + Civilizációs Hatásmetrikák" icon="⚡" accentColor="#e9d5ff">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
          {[
            { label: 'NET EFU/év', value: Math.round(efu.net_efu_annual).toLocaleString('hu-HU'), unit: 'EFU-E', color: '#7c3aed', note: `${vals.population_affected_m}M fő × 20 év` },
            { label: 'HMI hatás/fő', value: '+' + efu.hmi_per_capita.toFixed(2), unit: 'EFU-E', color: '#9333ea', note: 'gyógyítás + kibékülés hatás' },
            { label: 'R_future', value: efu.R_future.toFixed(3), unit: '', color: '#0369a1', note: `TRC kernel: ${trc_index.toFixed(1)} pont` },
            { label: 'Interstitium +', value: '+' + efu.interstitium_gain_pct.toFixed(1), unit: '%', color: '#9333ea', note: 'generációs gyógyítás ereje' },
            { label: 'Trauma csökkentés', value: trauma_reduction.toFixed(3), unit: '', color: '#7c3aed', note: '1 − trauma × (1 − truth × 0.5)' },
            { label: 'Politikai hatékonyság', value: political_effectiveness.toFixed(3), unit: '', color: '#16a34a', note: '(political_will + community) / 2' },
          ].map((m, i) => (
            <div key={i} style={{ background: '#f9fafb', border: `1px solid ${m.color}30`, borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{m.label}</div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: m.color }}>{m.value}<span style={{ fontSize: '13px', fontWeight: '600' }}> {m.unit}</span></div>
              <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px' }}>{m.note}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: '10px 14px', background: '#f5f3ff', borderRadius: '6px', border: '1px solid #e9d5ff', fontSize: '11px', color: '#7c3aed' }}>
          <strong>Dél-Afrika TRC referencia (1996–1998):</strong> 21k vallomás · Rwanda Gacaca: 1.2M ügy · Kanada: 150k túlélő · CONADEP: Nunca Más
        </div>
      </SectionBox>

      {/* ── 5. Gyógyítási Folyamat Metrikák ── */}
      <SectionBox title="Gyógyítási Folyamat Metrikák" icon="💜" accentColor="#e9d5ff">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '12px' }}>
          {[
            { label: 'Trauma Csökkentés', value: trauma_reduction, note: '1 − trauma × (1 − truth × 0.5)', color: '#7c3aed' },
            { label: 'Politikai Hatékonyság', value: political_effectiveness, note: '(political_will + community) / 2', color: '#9333ea' },
            { label: 'Gyógyítási Trajektória', value: healing_trajectory, note: '(truth + reparation + memory) / 3', color: '#16a34a' },
          ].map((f, i) => (
            <div key={i} style={{ background: '#faf5ff', border: `1px solid ${f.color}30`, borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>{f.label}</div>
              <div style={{ fontSize: '20px', fontWeight: '900', color: f.color }}>{f.value.toFixed(3)}</div>
              <div style={{ fontSize: '9px', color: '#9ca3af', marginTop: '3px' }}>{f.note}</div>
            </div>
          ))}
        </div>
      </SectionBox>

      {/* ── 6. Zóna táblázat ── */}
      <SectionBox title="5 Zóna Besorolás" icon="🗺" accentColor="#e5e7eb">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              {['Zóna', 'Feltétel', 'Státusz', 'Akció'].map(h => (
                <th key={h} style={{ padding: '6px 10px', textAlign: 'left', fontWeight: '700', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TRC_ZONES.map(z => {
              const isActive = zone.id === z.id;
              return (
                <tr key={z.id} style={{ background: isActive ? z.bg : 'transparent', fontWeight: isActive ? '700' : '400', borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '7px 10px', color: z.color, fontWeight: '700' }}>{z.label}</td>
                  <td style={{ padding: '7px 10px', color: '#374151', fontFamily: 'monospace', fontSize: '10px' }}>{z.condition}</td>
                  <td style={{ padding: '7px 10px' }}>{isActive ? <Badge color={z.color}>{z.status}</Badge> : <span style={{ color: '#9ca3af' }}>{z.status}</span>}</td>
                  <td style={{ padding: '7px 10px', color: '#4b5563', fontSize: '10px' }}>{z.action}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </SectionBox>

      {/* ── 7. Triggers ── */}
      <SectionBox title="Trigger Logika – 4 Küszöb" icon="⚠️" accentColor="#e5e7eb">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {TRC_TRIGGERS.map(t => {
            const isActive = triggers.active_triggers.includes(t.id);
            return (
              <div key={t.id} style={{ padding: '10px 12px', borderRadius: '8px', border: `1px solid ${isActive ? t.color : '#e5e7eb'}`, background: isActive ? (t.positive ? '#f0fdf4' : '#fef2f2') : '#f9fafb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '9px', fontWeight: '700', background: isActive ? t.color : '#9ca3af', color: 'white', padding: '2px 6px', borderRadius: '3px' }}>
                    {isActive ? 'AKTÍV' : 'INAKTÍV'}
                  </span>
                  <span style={{ fontSize: '10px', fontWeight: '700', color: isActive ? t.color : '#6b7280' }}>{t.id}</span>
                </div>
                <div style={{ fontSize: '10px', color: '#374151', marginBottom: '3px' }}>{t.label.replace(t.id + ' – ', '')}</div>
                <div style={{ fontSize: '9px', color: '#6b7280' }}>Feltétel: <code style={{ fontFamily: 'monospace' }}>{t.condition}</code></div>
                {isActive && <div style={{ fontSize: '10px', color: t.color, marginTop: '4px', fontWeight: '600' }}>→ {t.action}</div>}
              </div>
            );
          })}
        </div>
      </SectionBox>

      {/* ── 8. Pilot referencia ── */}
      <SectionBox title="Globális Pilot Validáció" icon="🌍" accentColor="#e9d5ff">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              {['Program', 'Időszak', 'Méret / Modell', 'Kulcs eredmény'].map(h => (
                <th key={h} style={{ padding: '6px 10px', textAlign: 'left', fontWeight: '700', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PILOT_CASES.map((p, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', background: i === 0 ? '#faf5ff' : 'transparent' }}>
                <td style={{ padding: '7px 10px', fontWeight: i === 0 ? '700' : '400', color: i === 0 ? '#7c3aed' : '#374151' }}>{p.city}</td>
                <td style={{ padding: '7px 10px', color: '#6b7280' }}>{p.period}</td>
                <td style={{ padding: '7px 10px', color: '#374151' }}>{p.size}</td>
                <td style={{ padding: '7px 10px', color: '#374151', fontSize: '10px' }}>{p.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: '10px', padding: '8px 12px', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0', fontSize: '10px', color: '#166534' }}>
          TRC Stack: <strong>700.11 (TRC Gyógyítás)</strong> → <strong>500.1 (Kollektív Trauma)</strong> → <strong>300.0 (SSF)</strong> → feedback → generációs regeneráció
        </div>
      </SectionBox>

      {/* ── 9. JSON output ── */}
      <SectionBox title="JSON Kimenet" icon="📋" accentColor="#e5e7eb">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
          <button
            onClick={() => setShowJson(v => !v)}
            style={{ fontSize: '10px', padding: '4px 12px', border: '1px solid #d1d5db', borderRadius: '6px', background: '#f9fafb', cursor: 'pointer', fontWeight: '600', color: '#374151' }}
          >
            {showJson ? 'Elrejtés' : 'JSON mutatása'}
          </button>
        </div>
        {showJson && (
          <pre style={{ background: '#1e293b', color: '#e2e8f0', padding: '14px', borderRadius: '8px', overflow: 'auto', fontSize: '10px', maxHeight: '400px', lineHeight: '1.5' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </SectionBox>

      {/* Modul connections */}
      <div style={{ fontSize: '10px', color: '#9ca3af', textAlign: 'center', marginTop: '8px' }}>
        Connections: {MODULE_META_700_11.connections.join(' · ')} &nbsp;|&nbsp; {MODULE_META_700_11.titleEn} &nbsp;|&nbsp; {MODULE_META_700_11.date}
      </div>
    </div>
  );
}
