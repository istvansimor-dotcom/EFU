/**
 * MEII205Panel.jsx — EFU 205.1 Metabolikus Érték-Intenzitás Index v1.1
 *
 * Sections:
 *   1. Modul fejléc (MEII, GDP vakfoltok, policy nexus)
 *   2. Szektoriális EFU kalibráció (4 szektor slider)
 *   3. GDP és modell paraméterek
 *   4. MEII eredmény gauge (alap + súlyozott)
 *   5. G7 összehasonlító táblázat
 *   6. Növekedési forgatókönyvek
 *   7. Impact weighting (Ł_w táblázat)
 *   8. Policy eszközök (adó, CBAM, kötvény)
 *   9. Megvalósítási ütemterv
 *   10. JSON kimenet
 */

import { useState, useMemo } from 'react';
import {
  MODULE_META_205,
  G7_DATA,
  CORPORATE_DATA,
  GROWTH_SCENARIOS,
  IMPACT_WEIGHTS,
  IMPLEMENTATION_TIMELINE,
  POLICY_TOOLS,
  USA_SECTOR_EFU,
} from '../data/meii205_1.js';
import {
  calculateMEII,
  classifyMEIIZone,
  evaluateMEIITriggers,
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

function SectorSlider({ label, unit, value, min, max, step, color, calc, onChange }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
        <span style={{ fontSize: '12px', fontWeight: '700', color }}>{label}</span>
        <span style={{ fontSize: '10px', color: '#6b7280', flex: 1, margin: '0 6px', fontStyle: 'italic' }}>{calc}</span>
        <span style={{ fontSize: '12px', fontWeight: '700', color, minWidth: '80px', textAlign: 'right' }}>
          {value.toFixed(1)} {unit}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: color }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function MEII205Panel() {
  const [gdpBn,          setGdpBn]          = useState(28000);
  const [popEfuBn,       setPopEfuBn]       = useState(122.3);
  const [industryEfuBn,  setIndustryEfuBn]  = useState(400);
  const [agriEfuBn,      setAgriEfuBn]      = useState(180);
  const [wasteEfuBn,     setWasteEfuBn]     = useState(50);
  const [lwDestructive,  setLwDestructive]  = useState(1.5);
  const [lwLuxury,       setLwLuxury]       = useState(1.0);
  const [lwEssential,    setLwEssential]    = useState(0.65);
  const [lwRegenerative, setLwRegenerative] = useState(0.3);
  const [lwDigital,      setLwDigital]      = useState(0.45);
  const [growthRate,     setGrowthRate]     = useState(0.023);
  const [efuGrowthRate,  setEfuGrowthRate]  = useState(0.008);
  const [taxRate,        setTaxRate]        = useState(0.10);
  const [showJson,       setShowJson]       = useState(false);

  const result = useMemo(() => calculateMEII({
    gdp_bn: gdpBn,
    pop_efu_bn: popEfuBn,
    industry_efu_bn: industryEfuBn,
    agri_efu_bn: agriEfuBn,
    waste_efu_bn: wasteEfuBn,
    lw_destructive: lwDestructive,
    lw_luxury: lwLuxury,
    lw_essential: lwEssential,
    lw_regenerative: lwRegenerative,
    lw_digital: lwDigital,
    growth_rate: growthRate,
    efu_growth_rate: efuGrowthRate,
    tax_rate_usd_per_efu: taxRate,
  }), [gdpBn, popEfuBn, industryEfuBn, agriEfuBn, wasteEfuBn,
       lwDestructive, lwLuxury, lwEssential, lwRegenerative, lwDigital,
       growthRate, efuGrowthRate, taxRate]);

  const { meii, meii_w, efu_total_bn, efu_tax_revenue_bn, cbam_ref_factor, zone, triggers, components, diagnostics } = result;
  const progressPct = Math.min(100, (meii / 50) * 100);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', fontSize: '13px', color: '#111827', maxWidth: '900px', margin: '0 auto', padding: '20px' }}>

      {/* 1. Header */}
      <div style={{ background: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)', color: 'white', borderRadius: '10px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '4px' }}>
              EFU {MODULE_META_205.id} · {MODULE_META_205.series}
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>{MODULE_META_205.title}</h2>
            <div style={{ fontSize: '13px', opacity: 0.85, marginTop: '4px' }}>{MODULE_META_205.subtitle}</div>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <Badge color="#15803d">{MODULE_META_205.status}</Badge>
            <Badge color="#374151">v{MODULE_META_205.version}</Badge>
            <Badge color="#374151">{MODULE_META_205.date}</Badge>
          </div>
        </div>
        <div style={{ marginTop: '12px', background: 'rgba(0,0,0,0.25)', borderRadius: '6px', padding: '10px', fontSize: '10px', fontFamily: 'monospace' }}>
          {MODULE_META_205.formula.split('\n').map((line, i) => (
            <div key={i} style={{ color: '#6ee7b7', marginBottom: '2px' }}>{line}</div>
          ))}
        </div>
        <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {MODULE_META_205.nexus.map(n => (
            <span key={n} style={{ fontSize: '9px', background: 'rgba(255,255,255,0.15)', padding: '2px 7px', borderRadius: '10px' }}>⇄ {n}</span>
          ))}
        </div>
        <div style={{ marginTop: '10px', fontSize: '10px', color: '#6ee7b7' }}>
          📌 {MODULE_META_205.efu_base}
        </div>
        {MODULE_META_205.limitations && (
          <div style={{ marginTop: '8px', fontSize: '9px', opacity: 0.65 }}>
            ⚠️ {MODULE_META_205.limitations.join(' · ')}
          </div>
        )}
      </div>

      {/* GDP vakfoltok */}
      <SectionBox title="A GDP Vakfoltjai – Mit lát az EFU?" icon="🔍" accentColor="#a7f3d0">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#dc2626', marginBottom: '6px' }}>❌ Amit a GDP nem lát</div>
            {MODULE_META_205.gdp_blindspots.map((s, i) => (
              <div key={i} style={{ fontSize: '11px', color: '#374151', marginBottom: '4px', paddingLeft: '8px', borderLeft: '2px solid #fca5a5' }}>
                {s}
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#16a34a', marginBottom: '6px' }}>✅ Amit az EFU hozzáad</div>
            {MODULE_META_205.efu_adds.map((s, i) => (
              <div key={i} style={{ fontSize: '11px', color: '#374151', marginBottom: '4px', paddingLeft: '8px', borderLeft: '2px solid #86efac' }}>
                {s}
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: '12px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '6px', padding: '10px 14px', fontSize: '11px', color: '#15803d' }}>
          💡 <strong>Paradoxon példa:</strong> Két ország azonos GDP-vel (1000 Mrd USD), de az egyiknek 500M EFU/év, a másiknak 2000M EFU/év.
          GDP szerint: egyformák. EFU szerint: az egyik <strong>4× metabolikusan drágább</strong>.
        </div>
      </SectionBox>

      {/* 2. Szektoriális EFU kalibráció */}
      <SectionBox title="Szektoriális EFU Kalibráció" icon="⚙️" accentColor="#d1d5db">
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#059669' }}>GDP (milliárd USD)</span>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#059669' }}>{gdpBn.toLocaleString()} Mrd USD</span>
          </div>
          <input type="range" min={500} max={35000} step={100} value={gdpBn}
            onChange={e => setGdpBn(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#059669' }} />
        </div>
        <SectorSlider label="Népesség EFU" unit="Mrd EFU" value={popEfuBn} min={10} max={500} step={0.1} color="#2563eb"
          calc={`pl. ${(popEfuBn / 0.3653).toFixed(0)}M fő × 365 EFU/év`} onChange={setPopEfuBn} />
        <SectorSlider label="Ipari EFU" unit="Mrd EFU" value={industryEfuBn} min={10} max={2000} step={1} color="#ea580c"
          calc="Anyagáramlás ÷ 7300 kg/EFU" onChange={setIndustryEfuBn} />
        <SectorSlider label="Mezőgazdasági EFU" unit="Mrd EFU" value={agriEfuBn} min={5} max={500} step={1} color="#16a34a"
          calc="Élelmiszer + állattartás" onChange={setAgriEfuBn} />
        <SectorSlider label="Hulladék EFU" unit="Mrd EFU" value={wasteEfuBn} min={1} max={200} step={1} color="#6b7280"
          calc="Lerakó + égetés" onChange={setWasteEfuBn} />

        {/* USA szektoriális bontás referenciaként */}
        <div style={{ marginTop: '12px', background: '#f9fafb', borderRadius: '6px', padding: '10px' }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#6b7280', marginBottom: '6px', textTransform: 'uppercase' }}>🇺🇸 USA Referencia bontás (752 Mrd EFU)</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {USA_SECTOR_EFU.map(s => (
              <div key={s.sector} style={{ background: 'white', border: `1px solid ${s.color}`, borderRadius: '5px', padding: '5px 10px', fontSize: '10px' }}>
                <div style={{ fontWeight: '700', color: s.color }}>{s.sector}</div>
                <div style={{ color: '#374151' }}>{s.value_bn} Mrd EFU</div>
                <div style={{ color: '#9ca3af', fontSize: '9px' }}>{s.calc}</div>
              </div>
            ))}
          </div>
        </div>
      </SectionBox>

      {/* 3. Modell paraméterek */}
      <SectionBox title="Modell Paraméterek – Ł_w Impact Weighting & Policy" icon="🔧" accentColor="#d1d5db">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 30px' }}>
          {[
            { label: 'Ł_w destruktív (600.x)', value: lwDestructive, set: setLwDestructive, min: 1.0, max: 2.0, step: 0.05, color: '#dc2626' },
            { label: 'Ł_w luxus-fogyasztás',   value: lwLuxury,      set: setLwLuxury,      min: 0.8, max: 1.2, step: 0.05, color: '#f59e0b' },
            { label: 'Ł_w szükséges (infra)',  value: lwEssential,   set: setLwEssential,   min: 0.5, max: 0.8, step: 0.05, color: '#2563eb' },
            { label: 'Ł_w regeneratív (700.x)',value: lwRegenerative, set: setLwRegenerative,min: 0.1, max: 0.5, step: 0.05, color: '#16a34a' },
            { label: 'Ł_w digitális',           value: lwDigital,     set: setLwDigital,     min: 0.3, max: 0.6, step: 0.05, color: '#7c3aed' },
          ].map(({ label, value, set, min, max, step, color }) => (
            <div key={label} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color }}>{label}</span>
                <span style={{ fontSize: '12px', fontWeight: '700', color }}>{value.toFixed(2)}</span>
              </div>
              <input type="range" min={min} max={max} step={step} value={value}
                onChange={e => set(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: color }} />
            </div>
          ))}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#059669' }}>GDP növekedési ráta</span>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#059669' }}>{(growthRate * 100).toFixed(1)}%</span>
            </div>
            <input type="range" min={0} max={0.10} step={0.001} value={growthRate}
              onChange={e => setGrowthRate(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#059669' }} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#ea580c' }}>EFU növekedési ráta</span>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#ea580c' }}>{(efuGrowthRate * 100).toFixed(1)}%</span>
            </div>
            <input type="range" min={-0.05} max={0.10} step={0.001} value={efuGrowthRate}
              onChange={e => setEfuGrowthRate(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#ea580c' }} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#374151' }}>EFU-adó kulcs (USD/EFU)</span>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#374151' }}>{taxRate.toFixed(2)} USD/EFU</span>
            </div>
            <input type="range" min={0.01} max={0.50} step={0.01} value={taxRate}
              onChange={e => setTaxRate(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#374151' }} />
          </div>
        </div>
        <div style={{ marginTop: '8px', fontSize: '9px', color: '#9ca3af', fontStyle: 'italic' }}>
          ⚠️ Ł_w értékek pilot-kalibrációra várnak (2026 Q3). Jelenlegi értékek becsült default paraméterek.
        </div>
      </SectionBox>

      {/* 4. MEII eredmény */}
      <SectionBox title="MEII Eredmény" icon="📊" accentColor={zone.color}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center', background: zone.color, color: 'white', borderRadius: '10px', padding: '16px 24px', minWidth: '140px' }}>
            <div style={{ fontSize: '11px', opacity: 0.85, marginBottom: '4px' }}>MEII (alap)</div>
            <div style={{ fontSize: '36px', fontWeight: '900', lineHeight: 1 }}>{meii.toFixed(1)}</div>
            <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.9 }}>USD/EFU</div>
            <div style={{ fontSize: '12px', marginTop: '6px', opacity: 0.9 }}>{zone.status}</div>
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ marginBottom: '8px', width: '100%', background: '#e5e7eb', borderRadius: '6px', height: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPct}%`, background: zone.color, height: '100%', transition: 'width 0.3s' }} />
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280', lineHeight: '1.9' }}>
              <div>MEII (súlyozott): <strong style={{ color: '#374151' }}>{meii_w.toFixed(1)} USD/EFU</strong></div>
              <div>Nemzeti EFU total: <strong style={{ color: '#374151' }}>{efu_total_bn.toFixed(1)} Mrd EFU</strong></div>
              <div>GDP: <strong style={{ color: '#374151' }}>{gdpBn.toLocaleString()} Mrd USD</strong></div>
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '4px', marginTop: '4px' }}>
                EFU-adó bevétel: <strong style={{ color: '#059669' }}>{efu_tax_revenue_bn.toFixed(1)} Mrd USD/év</strong>
              </div>
              <div>CBAM referencia Δ: <strong>{cbam_ref_factor.toFixed(1)} USD/EFU</strong></div>
              <div>Leválasztási rés: <strong style={{ color: diagnostics.decoupling_gap > 0 ? '#16a34a' : '#dc2626' }}>
                {diagnostics.decoupling_gap > 0 ? '+' : ''}{(diagnostics.decoupling_gap * 100).toFixed(1)}%
              </strong> (GDP − EFU növekedés)</div>
            </div>
          </div>
        </div>

        {/* Trigger badges */}
        {triggers.active_triggers.length > 0 && (
          <div style={{ marginTop: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {triggers.active_triggers.includes('ELITE_MEII') && <Badge color="#15803d">★ ELITE MEII ≥40</Badge>}
            {triggers.active_triggers.includes('ABSOLUTE_DECOUPLING') && <Badge color="#16a34a">✓ ABSZOLÚT LEVÁLASZTÁS</Badge>}
            {triggers.active_triggers.includes('RELATIVE_DECOUPLING') && <Badge color="#2563eb">∼ RELATÍV LEVÁLASZTÁS</Badge>}
            {triggers.active_triggers.includes('CRITICAL_LOW_MEII') && <Badge color="#dc2626">⚠ KRITIKUS ALACSONY</Badge>}
            {triggers.active_triggers.includes('CBAM_RECOMMENDED') && <Badge color="#ea580c">🌐 CBAM AJÁNLOTT</Badge>}
          </div>
        )}
        <div style={{ marginTop: '10px', fontSize: '10px', color: '#6b7280', fontStyle: 'italic' }}>
          {zone.note}
        </div>
      </SectionBox>

      {/* 5. G7 összehasonlítás */}
      <SectionBox title="G7 Összehasonlító Táblázat" icon="🌍" accentColor="#bfdbfe">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              {['Rang', 'Ország', 'GDP (Mrd USD)', 'Nemzeti EFU (Mrd)', 'MEII ($/EFU)', 'Megjegyzés'].map(h => (
                <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '700', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {G7_DATA.map((row, i) => {
              const rowZone = classifyMEIIZone(row.meii);
              const isActive = Math.abs(row.meii - meii) < 3;
              return (
                <tr key={row.country} style={{ background: isActive ? '#f0fdf4' : (i % 2 === 0 ? '#f9fafb' : 'white'), fontWeight: isActive ? '700' : '400' }}>
                  <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', fontWeight: '700', color: row.rank === 1 ? '#15803d' : '#374151' }}>
                    {row.rank}. {row.rank === 1 ? '★' : ''}
                  </td>
                  <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6' }}>{row.flag} {row.country}</td>
                  <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', color: '#374151' }}>{row.gdp.toLocaleString()}</td>
                  <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', color: '#374151' }}>{row.efu}</td>
                  <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', fontWeight: '700', color: rowZone.color }}>{row.meii}</td>
                  <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', color: '#6b7280', fontSize: '10px' }}>{row.note}</td>
                </tr>
              );
            })}
            {/* Custom row */}
            <tr style={{ background: '#eff6ff', fontWeight: '700' }}>
              <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', color: '#2563eb' }}>–</td>
              <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', color: '#2563eb' }}>🔧 Saját kalibráció</td>
              <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', color: '#2563eb' }}>{gdpBn.toLocaleString()}</td>
              <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', color: '#2563eb' }}>{efu_total_bn.toFixed(0)}</td>
              <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', color: zone.color }}>{meii.toFixed(1)}</td>
              <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', color: '#2563eb', fontSize: '10px' }}>Interaktív slider</td>
            </tr>
          </tbody>
        </table>
        <div style={{ marginTop: '10px', background: '#f0f9ff', borderRadius: '6px', padding: '10px 14px', fontSize: '11px', color: '#0369a1' }}>
          💡 <strong>Kínai Paradoxon:</strong> Kína ~18 000 Mrd USD GDP / MEII ≈ 4.0 (nehézipar, acél, cement, szén).
          Policy-következmény: Kína 10×-ezhetik GDP-jét az EFU növelése nélkül, ha magas értékű szolgáltatásokra/tech-re vált.
        </div>
      </SectionBox>

      {/* 6. Növekedési forgatókönyvek */}
      <SectionBox title="Növekedés Minősége – Három Forgatókönyv" icon="📈" accentColor="#fde68a">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          {GROWTH_SCENARIOS.map(s => (
            <div key={s.id} style={{ background: s.good ? '#f0fdf4' : '#fff7ed', border: `1px solid ${s.color}`, borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontWeight: '700', color: s.color, fontSize: '12px', marginBottom: '6px' }}>{s.label}</div>
              <div style={{ fontSize: '10px', color: '#374151', marginBottom: '4px' }}>GDP: <strong>{s.gdp_change}</strong></div>
              <div style={{ fontSize: '10px', color: '#374151', marginBottom: '4px' }}>EFU: <strong>{s.efu_change}</strong></div>
              <div style={{ fontSize: '10px', color: s.color, fontWeight: '600', marginTop: '6px', fontStyle: 'italic' }}>{s.interpretation}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '12px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '6px', padding: '10px', fontSize: '11px' }}>
          <strong style={{ color: '#16a34a' }}>Leválasztás ({(diagnostics.decoupling_gap * 100).toFixed(1)}%): </strong>
          {diagnostics.decoupling_gap > 0
            ? `GDP gyorsabban nő, mint az EFU → hatékonyság-nyereség (B forgatókönyv irány)`
            : `EFU gyorsabban nő, mint GDP → hatékonyság-veszteség (C forgatókönyv irány)`
          }
        </div>
      </SectionBox>

      {/* 7. Impact weighting táblázat */}
      <SectionBox title="Impact Weighting – Ł_w Réteg (v1.1 – Bevezetve)" icon="⚖️" accentColor="#e9d5ff">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              {['Fluxus típus', 'EFU terhelés', 'Ł_w (jelenlegi)', 'Indoklás'].map(h => (
                <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '700', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {IMPACT_WEIGHTS.map((w, i) => (
              <tr key={w.id} style={{ background: i % 2 === 0 ? '#f9fafb' : 'white' }}>
                <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ fontWeight: '700', color: w.color }}>{w.label}</span>
                </td>
                <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', color: '#374151' }}>{w.efu_load}</td>
                <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', fontWeight: '700', color: w.color }}>
                  {w.lw_min}–{w.lw_max} <span style={{ fontSize: '9px', color: '#9ca3af' }}>(default: {w.lw_default})</span>
                </td>
                <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', color: '#6b7280', fontSize: '10px' }}>{w.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: '10px', fontSize: '9px', color: '#9ca3af', fontStyle: 'italic' }}>
          ⚠️ Ł_w = 1.0 → semleges | &gt;1.0 → büntetett (több EFU = rosszabb) | &lt;1.0 → jutalmazó (kevesebb EFU = jobb)
        </div>
      </SectionBox>

      {/* 8. Vállalati összehasonlítás */}
      <SectionBox title="Vállalati MEII – Tesla vs. Ford" icon="🏭" accentColor="#fed7aa">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              {['Vállalat', 'Árbevétel', 'Anyagáramlás', 'Váll. EFU', 'MEII ($/EFU)', 'Értékelés'].map(h => (
                <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '700', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CORPORATE_DATA.map((c, i) => (
              <tr key={c.company} style={{ background: i % 2 === 0 ? '#f9fafb' : 'white' }}>
                <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', fontWeight: '700', color: c.color }}>{c.company}</td>
                <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6' }}>{c.revenue_bn_usd} Mrd USD</td>
                <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6' }}>{c.material_t.toLocaleString()} t/év</td>
                <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6' }}>{c.efu_m.toFixed(1)}M EFU</td>
                <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', fontWeight: '700', color: c.color }}>{c.meii.toLocaleString()} $/EFU</td>
                <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', fontSize: '10px', color: '#6b7280' }}>{c.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: '10px', fontSize: '11px', color: '#374151', background: '#fff7ed', borderRadius: '6px', padding: '10px 14px' }}>
          💡 <strong>Befektetési következmény:</strong> Magas MEII vállalatok = jövőbiztosak (erőforrás-hatékonyak).
          Tesla <strong>4× több árbevételt</strong> generál anyagfluxus-egységenként, mint Ford.
        </div>
      </SectionBox>

      {/* 9. Policy eszközök */}
      <SectionBox title="Policy Eszközök" icon="🛠️" accentColor="#bbf7d0">
        {POLICY_TOOLS.map(tool => (
          <div key={tool.id} style={{ background: '#f9fafb', border: `1px solid ${tool.color}`, borderRadius: '6px', padding: '12px', marginBottom: '10px' }}>
            <div style={{ fontWeight: '700', color: tool.color, fontSize: '12px', marginBottom: '6px' }}>{tool.icon} {tool.title}</div>
            <div style={{ fontSize: '10px', color: '#374151', fontFamily: 'monospace', background: '#f3f4f6', padding: '6px 10px', borderRadius: '4px', marginBottom: '6px' }}>
              {tool.formula}
            </div>
            {tool.id === 'tax' && (
              <div style={{ fontSize: '11px', color: '#059669', marginBottom: '4px' }}>
                📌 Kalkulált bevétel ({taxRate.toFixed(2)} USD/EFU × {efu_total_bn.toFixed(0)} Mrd EFU): <strong>{efu_tax_revenue_bn.toFixed(1)} Mrd USD/év</strong>
              </div>
            )}
            {tool.id === 'cbam' && (
              <div style={{ fontSize: '11px', color: '#7c3aed', marginBottom: '4px' }}>
                📌 MEII({meii.toFixed(1)}) − MEII_Kína(4.0) = <strong>{cbam_ref_factor.toFixed(1)} USD/EFU kiigazítási alap</strong>
              </div>
            )}
            <div style={{ fontSize: '10px', color: '#6b7280', fontStyle: 'italic' }}>{tool.example}</div>
            <div style={{ fontSize: '10px', color: '#374151', marginTop: '4px' }}>→ {tool.note}</div>
          </div>
        ))}
      </SectionBox>

      {/* 10. Megvalósítási ütemterv */}
      <SectionBox title="Megvalósítási Ütemterv" icon="🗓️" accentColor="#bfdbfe">
        {IMPLEMENTATION_TIMELINE.map(ph => (
          <div key={ph.phase} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start' }}>
            <div style={{ background: ph.color, color: 'white', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>
              {ph.phase}
            </div>
            <div style={{ flex: 1, background: '#f9fafb', border: `1px solid ${ph.color}`, borderRadius: '6px', padding: '8px 12px' }}>
              <div style={{ fontWeight: '700', color: ph.color, fontSize: '11px', marginBottom: '3px' }}>{ph.year}</div>
              <div style={{ fontSize: '11px', color: '#374151', marginBottom: '4px' }}>{ph.step}</div>
              <div style={{ fontSize: '9px', color: '#9ca3af' }}>{ph.modules}</div>
            </div>
          </div>
        ))}
      </SectionBox>

      {/* Integráció keretrendszerekkel */}
      <SectionBox title="Integráció Meglévő Keretrendszerekkel" icon="🔗" accentColor="#e9d5ff">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              {['Keretrendszer', 'Jelen fókusz', 'EFU kiegészítés'].map(h => (
                <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '700', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { fw: 'ENSZ SNA', current: 'GDP-elszámolás globális standard', efu: 'Satellite account: EFU-táblázat hozzáadva (GDP, Nemzeti EFU, MEII, éves átalakulás)' },
              { fw: 'OECD Better Life', current: 'Jövedelem, munka, lakhatás, környezet', efu: 'MEII ($/EFU) központi mutatóként; egy főre jutó EFU; GDP vs. EFU szétválasztás' },
              { fw: 'IMF IV. cikk.', current: 'Fiskális, infláció, adósság-fenntarthatóság', efu: 'Metabolikus fenntarthatósági értékelés: GDP-növekedés EFU-leválasztott?' },
              { fw: 'ESG Reporting', current: 'Környezeti, társadalmi, irányítási jelentés', efu: 'Vállalati MEII: árbevétel / vállalati EFU → anyag-intenzitás KPI' },
            ].map((row, i) => (
              <tr key={row.fw} style={{ background: i % 2 === 0 ? '#f9fafb' : 'white' }}>
                <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', fontWeight: '700', color: '#374151' }}>{row.fw}</td>
                <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', color: '#6b7280' }}>{row.current}</td>
                <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', color: '#4b5563' }}>{row.efu}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
