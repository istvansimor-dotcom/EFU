/**
 * WorkerCoop700Panel.jsx — EFU 700.10 Munkás Önigazgatás és Kooperatív Vállalatok v1.0
 *
 * Sections:
 *   1. Module header
 *   2. Változó kalibráció – 3 réteg
 *   3. COOP index eredmény + komponens pontszámok
 *   4. NET_EFU + HMI + R_future + Interstitium összefoglaló
 *   5. Kooperatív Vállalati Metrikák
 *   6. Zóna táblázat (5 zóna)
 *   7. Trigger logika (4 trigger)
 *   8. Pilot referencia táblázat
 *   9. JSON kimenet
 */

import { useState, useMemo } from 'react';
import {
  MODULE_META_700_10,
  COOP_VARIABLES_MAIN,
  COOP_VARIABLES_NEGATIVE,
  COOP_VARIABLES_SFACTOR,
  COOP_VARIABLES_CONTEXT,
  COOP_ZONES,
  COOP_TRIGGERS,
} from '../data/workerCoop700_10.js';
import { calculateCOOP } from '../logic/efu-engine.js';

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
    if (variable.id === 'workers_k') return v.toLocaleString('hu-HU') + ' k';
    if (variable.id === 'rd_investment_pct') return (v * 100).toFixed(1) + '%';
    if (variable.id === 'wage_ratio_ceo_worker') return v.toFixed(0) + ':1';
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
  { city: 'Mondragon 🇪🇸 ★', period: '1956–', size: '81k munkás, 13Mrd€ forgalom', result: 'Globális kooperatív modell – 0 csőd 65 év alatt, bérarány max 6:1' },
  { city: 'Emilia-Romagna 🇮🇹', period: '1970–', size: 'GDP 45% coop szektor', result: 'Legversenyképesebb EU régió – coop klaszterek, Bologna blueprint' },
  { city: 'Evergreen 🇺🇸', period: '2008–', size: '5 kooperatív vállalat', result: 'Cleveland modell – bezárt gyárak helyén munkástulajdonú vállalatok' },
  { city: 'Co-operative Group 🇬🇧', period: '1844–', size: '4.6M tag, £10Mrd forgalom', result: 'Világ legrégebbi szövetkezet – Rochdale Pioneers örökség' },
  { city: 'Jugoszláv önigazgatás 🇾🇺 (1950–90)', period: '1950–1990', size: 'Nemzeti szintű rendszer', result: 'Nemzeti szintű rendszerszintű kísérlet – skálázás és makrokoord. tanulságok' },
];

// ---------------------------------------------------------------------------
// Main Panel
// ---------------------------------------------------------------------------

export default function WorkerCoop700Panel() {
  const buildDefaults = (vars) => {
    const d = {};
    vars.forEach(v => { d[v.id] = v.default; });
    return d;
  };

  const [vals, setVals] = useState({
    ...buildDefaults(COOP_VARIABLES_MAIN),
    ...buildDefaults(COOP_VARIABLES_NEGATIVE),
    ...buildDefaults(COOP_VARIABLES_SFACTOR),
    ...buildDefaults(COOP_VARIABLES_CONTEXT),
  });

  const handleChange = (id, value) => setVals(prev => ({ ...prev, [id]: value }));

  const result = useMemo(() => calculateCOOP(vals), [vals]);
  const { coop_index, zone, triggers, scores, efu } = result;

  const [showJson, setShowJson] = useState(false);

  // Section 5 metrics
  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
  const wage_equality = clamp(1 - (vals.wage_ratio_ceo_worker - 1) / 299, 0, 1);
  const rd_impact = vals.rd_investment_pct / 0.10;
  const ownership_strength = vals.worker_ownership_pct * (1 + rd_impact * 0.2);

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif", maxWidth: '900px', margin: '32px auto', padding: '0 16px', color: '#111827' }}>

      {/* ── 1. Header ── */}
      <div style={{ background: 'linear-gradient(135deg, #b45309 0%, #d97706 60%, #16a34a 100%)', color: 'white', borderRadius: '10px', padding: '20px 24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              EFU {MODULE_META_700_10.id} · {MODULE_META_700_10.series} · v{MODULE_META_700_10.version}
            </div>
            <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '800' }}>{MODULE_META_700_10.title}</h2>
            <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>JIM-30 társadalmi analóg: Szervezet helyileg irányítható? · {MODULE_META_700_10.subtitle.split('|')[0].trim()}</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Badge color="rgba(255,255,255,0.25)" size="10px">{MODULE_META_700_10.status}</Badge>
              <Badge color="rgba(220,38,38,0.8)" size="10px">⚔ Ellentét: {MODULE_META_700_10.antithesis}</Badge>
              <Badge color="rgba(255,255,255,0.2)" size="10px">COOP Kernel</Badge>
              <Badge color="rgba(255,255,255,0.2)" size="10px">HMI: 0.6–0.9 STABIL–SZIMBIOTIKUS</Badge>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '32px', fontWeight: '900', lineHeight: 1 }}>{coop_index.toFixed(2)}</div>
            <div style={{ fontSize: '11px', opacity: 0.8 }}>COOP Index</div>
            <div style={{ marginTop: '6px' }}>
              <Badge color={zone.color} size="11px">{zone.label}</Badge>
            </div>
          </div>
        </div>
        <div style={{ marginTop: '12px', padding: '8px 12px', background: 'rgba(255,255,255,0.15)', borderRadius: '6px', fontSize: '11px' }}>
          <span style={{ opacity: 0.8 }}>Formula: </span>
          <code style={{ fontFamily: 'monospace', fontSize: '11px' }}>{MODULE_META_700_10.formula}</code>
        </div>
      </div>

      {/* ── 2. Sliders ── */}
      <SectionBox title="Változó Kalibráció – 3 Réteg" icon="🎛" accentColor="#fde68a">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 28px' }}>
          <div>
            <LayerHeader label="Fő Változók (COOP komponensek)" icon="🏭" color="#b45309" />
            {COOP_VARIABLES_MAIN.map(v => (
              <VarSlider key={v.id} variable={v} value={vals[v.id]} onChange={handleChange} />
            ))}
          </div>
          <div>
            <LayerHeader label="Negatív Tényezők (bérarány + S-factor)" icon="⚠️" color="#dc2626" />
            {COOP_VARIABLES_NEGATIVE.map(v => (
              <VarSlider key={v.id} variable={v} value={vals[v.id]} onChange={handleChange} />
            ))}
            <LayerHeader label="S-factor: Helyi tudás" icon="🧠" color="#15803d" />
            {COOP_VARIABLES_SFACTOR.map(v => (
              <VarSlider key={v.id} variable={v} value={vals[v.id]} onChange={handleChange} />
            ))}
            <LayerHeader label="Kontextus (munkások)" icon="👷" color="#374151" />
            {COOP_VARIABLES_CONTEXT.map(v => (
              <VarSlider key={v.id} variable={v} value={vals[v.id]} onChange={handleChange} />
            ))}
          </div>
        </div>
      </SectionBox>

      {/* ── JIM-30 Analóg Info Box ── */}
      <SectionBox title="JIM-30 Társadalmi Analóg" icon="🔧" accentColor="#fde68a">
        <div style={{ marginBottom: '10px', fontSize: '11px', color: '#374151' }}>
          Ahogy a <strong>JIM-30</strong> méri, hogy egy eszköz helyileg javítható-e, a <strong>700.10</strong> méri, hogy egy szervezet helyileg irányítható-e. Alacsony S-factor = belső autonómia; Magas S-factor = külső függőség.
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr style={{ background: '#fef3c7' }}>
              <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: '700', color: '#b45309' }}>600.5 Centralizált</th>
              <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: '700', color: '#16a34a' }}>700.10 Önigazgatás</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Döntés távolról', 'Döntés ott ahol a tudás van'],
              ['Magas S-factor', 'Alacsony S-factor'],
              ['Tervezett elavulás', 'JIM-30 folyamat-karbantartás'],
            ].map(([l, r], i) => (
              <tr key={i} style={{ borderBottom: '1px solid #fde68a' }}>
                <td style={{ padding: '6px 10px', color: '#dc2626' }}>{l}</td>
                <td style={{ padding: '6px 10px', color: '#16a34a' }}>{r}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: '10px', padding: '8px 12px', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0', fontSize: '11px', color: '#166534' }}>
          <strong>600.69 Gresham-spirál:</strong> Az extraktív forma kiszorítja az önigazgatott formát – aktív védekezés szükséges a Gresham-spirál ellen.
        </div>
        <div style={{ marginTop: '8px', padding: '6px 12px', background: '#fffbeb', borderRadius: '6px', border: '1px solid #fde68a', fontSize: '11px', color: '#b45309' }}>
          <strong>HMI tartomány: 0.6–0.9 (STABIL–SZIMBIOTIKUS)</strong> – operációs zóna az önigazgatott szervezetek számára
        </div>
      </SectionBox>

      {/* ── 3. Index komponensek ── */}
      <SectionBox title="COOP Index Komponensek" icon="📊" accentColor="#fde68a">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 28px' }}>
          <div>
            <ScoreBar label="Tulajdon score"     value={scores.ownership_score} color="#b45309" />
            <ScoreBar label="Bérarány (norm.)"   value={scores.wage_ratio_norm} color="#d97706" />
          </div>
          <div>
            <ScoreBar label="K+F (norm.)"        value={scores.rd_norm}         color="#0891b2" />
            <ScoreBar label="Alap COOP score"    value={scores.base_coop}       color="#16a34a" />
          </div>
        </div>
        <div style={{ marginTop: '14px', padding: '12px', background: zone.bg, borderRadius: '8px', border: `2px solid ${zone.color}40` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '28px', fontWeight: '900', color: zone.color }}>{coop_index.toFixed(2)}</span>
              <span style={{ fontSize: '13px', color: '#6b7280', marginLeft: '8px' }}>/ 10 COOP Index</span>
            </div>
            <Badge color={zone.color} size="12px">{zone.label}</Badge>
          </div>
          <div style={{ fontSize: '11px', color: '#374151', marginTop: '6px' }}>{zone.action}</div>
        </div>
      </SectionBox>

      {/* ── 4. NET_EFU + HMI + R_future összefoglaló ── */}
      <SectionBox title="NET EFU + Civilizációs Hatásmetrikák" icon="⚡" accentColor="#fde68a">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
          {[
            { label: 'NET EFU/év', value: Math.round(efu.net_efu_annual).toLocaleString('hu-HU'), unit: 'EFU-E', color: '#b45309', note: `${vals.workers_k}k munkás × +${efu.hmi_per_worker.toFixed(2)} HMI` },
            { label: 'HMI/munkás', value: '+' + efu.hmi_per_worker.toFixed(2), unit: 'EFU-E', color: '#16a34a', note: 'tulajdon + demokrácia + biztonság' },
            { label: 'R_future', value: efu.R_future.toFixed(3), unit: '', color: '#0891b2', note: `COOP kernel: ${coop_index.toFixed(1)} pont` },
            { label: 'Interstitium +', value: '+' + efu.interstitium_gain_pct.toFixed(1), unit: '%', color: '#d97706', note: 'munkás önigazgatás ereje' },
            { label: 'Bérarány (wage_eq)', value: wage_equality.toFixed(3), unit: '', color: '#b45309', note: '1 − (ratio−1)/299' },
            { label: 'K+F hatás', value: rd_impact.toFixed(3), unit: '', color: '#0891b2', note: 'rd_pct / 0.10 norm.' },
          ].map((m, i) => (
            <div key={i} style={{ background: '#f9fafb', border: `1px solid ${m.color}30`, borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{m.label}</div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: m.color }}>{m.value}<span style={{ fontSize: '13px', fontWeight: '600' }}> {m.unit}</span></div>
              <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px' }}>{m.note}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: '10px 14px', background: '#fffbeb', borderRadius: '6px', border: '1px solid #fde68a', fontSize: '11px', color: '#b45309' }}>
          <strong>Mondragon referencia (1956–):</strong> 81k munkás · 13Mrd€ forgalom · 0 csőd · bérarány max 6:1 · Emilia-Romagna: GDP 45% coop szektor
        </div>
      </SectionBox>

      {/* ── 5. Kooperatív Vállalati Metrikák ── */}
      <SectionBox title="Kooperatív Vállalati Metrikák" icon="⚙️" accentColor="#fde68a">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '12px' }}>
          {[
            { label: 'Bérarány Egyenlőség', value: wage_equality, note: '1 − (ceo/worker − 1) / 299', color: '#b45309' },
            { label: 'K+F Hatás', value: rd_impact, note: 'rd_investment_pct / 0.10', color: '#0891b2' },
            { label: 'Tulajdon Ereje', value: ownership_strength, note: 'worker_own × (1 + rd × 0.2)', color: '#16a34a' },
          ].map((f, i) => (
            <div key={i} style={{ background: '#fffbeb', border: `1px solid ${f.color}30`, borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
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
            {COOP_ZONES.map(z => {
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
          {COOP_TRIGGERS.map(t => {
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
      <SectionBox title="Globális Pilot Validáció" icon="🌍" accentColor="#fde68a">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              {['Vállalat/Régió', 'Időszak', 'Méret / Modell', 'Kulcs eredmény'].map(h => (
                <th key={h} style={{ padding: '6px 10px', textAlign: 'left', fontWeight: '700', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PILOT_CASES.map((p, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', background: i === 0 ? '#fffbeb' : 'transparent' }}>
                <td style={{ padding: '7px 10px', fontWeight: i === 0 ? '700' : '400', color: i === 0 ? '#b45309' : '#374151' }}>{p.city}</td>
                <td style={{ padding: '7px 10px', color: '#6b7280' }}>{p.period}</td>
                <td style={{ padding: '7px 10px', color: '#374151' }}>{p.size}</td>
                <td style={{ padding: '7px 10px', color: '#374151', fontSize: '10px' }}>{p.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: '10px', padding: '8px 12px', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0', fontSize: '10px', color: '#166534' }}>
          COOP Stack: <strong>700.10 (Munkás Coop)</strong> → <strong>700.8 (UBS)</strong> → <strong>700.9 (Közösségi Valuták)</strong> → feedback → demokratikus gazdaság
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
        Connections: {MODULE_META_700_10.connections.join(' · ')} &nbsp;|&nbsp; {MODULE_META_700_10.titleEn} &nbsp;|&nbsp; {MODULE_META_700_10.date}
      </div>
    </div>
  );
}
