/**
 * Happiness600Panel.jsx — EFU 600.85 v2.1 Boldogság-gazdaság Paradoxona
 *
 * Eudaimónia vs. Hedónia | F-META Domain | FC-APPROVED | POSITIVE_SECONDARY = TRUE
 *
 * Sections:
 *   1. Header + ontológiai pozíció
 *   2. BH Kalkulátor — Easterlin-paradoxon mérőkeret
 *   3. CBS Hibrid Kalkulátor — kognitív-bioszféra-stressz
 *   4. η(W) Dekompozíció — eudaimonikus/hedónikus komponensek + kompozit
 *   5. BGP_score — Parazitizmus Index + Δη(W) Paradoxon Képlet
 *   6. CEWS Állapotmátrix + Stabilitási Kritérium
 *   7. Globális Happiness Industry Mérleg (~4.5T$/év)
 *   8. Eudaimónia vs. Hedónia EFU-réteg térkép
 *   9. FC Farm vs. EU-átlag referenciapanel
 *  10. Licenc kategóriák + modul-kapcsolódások
 *
 * Reference: EFU 600.85 v2.1 FINAL (2026.04.10)
 * 600.79 → DEPRECATED (merged into this module)
 */

import { useState, useMemo } from 'react';
import {
  MODULE_META_85,
  CEWS_HAPPINESS_STATES,
  LICENSE_CATEGORIES_85,
  HAPPINESS_INDUSTRY,
  HEDONIA_EUDAIMONIA_MAP,
  REFERENCE_SYSTEMS,
  CBS_CONFIG,
} from '../data/happiness600_85.js';
import {
  calculateBH,
  calculateCBS,
  calculateEtaW,
  calculateBGPScore,
  calculateDeltaEtaW,
  classifyCEWSHappinessState,
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

function NumInput({ value, onChange, min, max, step = 0.01 }) {
  return (
    <input type="number" value={value} step={step} min={min} max={max}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ width: '100%', padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
  );
}

function FieldLabel({ label, hint }) {
  return (
    <div style={{ marginBottom: '4px' }}>
      <div style={{ fontSize: '10px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      {hint && <div style={{ fontSize: '10px', color: '#9ca3af' }}>{hint}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 1. BH Kalkulátor
// ---------------------------------------------------------------------------

function BHCalculator() {
  const [dH,    setDH]   = useState(0.8);
  const [dGDP,  setDGDP] = useState(10);

  const result = useMemo(() => calculateBH({ delta_h: dH, delta_gdp: dGDP }), [dH, dGDP]);

  const colorMap = { STRONG_PARADOX: '#dc2626', MODERATE_PARADOX: '#ea580c', NO_PARADOX: '#16a34a', PARADOX: '#6b7280' };
  const color = colorMap[result.state] ?? '#6b7280';

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <div>
          <FieldLabel label="ΔH_t — boldogság változás" hint="pl. +0.8 (egység: SWL pont vagy % változás)" />
          <NumInput value={dH} step="0.01" onChange={setDH} />
        </div>
        <div>
          <FieldLabel label="ΔGDP_t — GDP változás" hint="pl. +10 (% vagy abszolút; azonos mértékegység)" />
          <NumInput value={dGDP} step="0.1" onChange={setDGDP} />
        </div>
      </div>
      <div style={{ border: `2px solid ${color}`, borderRadius: '8px', padding: '12px', background: `${color}08` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: '800', fontSize: '22px', fontFamily: 'monospace', color }}>{result.bh}</span>
          <Badge color={color}>{result.state.replace('_', ' ')}</Badge>
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6b7280', marginBottom: '6px' }}>
          BH = |ΔH / ΔGDP| = |{dH} / {dGDP}| = {result.bh}
        </div>
        <div style={{ fontSize: '11px', color, fontWeight: '600' }}>{result.interpretation}</div>
        <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <Badge color="#6b7280" size="9px">EU (2024): BH ≈ 0.08</Badge>
          <Badge color="#047857" size="9px">BH ≈ 0 → Erős paradoxon</Badge>
          <Badge color="#0891b2" size="9px">BH ≫ 0 → Nem paradox</Badge>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. CBS Hibrid Kalkulátor
// ---------------------------------------------------------------------------

function CBSCalculator({ onCBSChange }) {
  const [stressEvents, setStressEvents] = useState(12);
  const [totalEvents,  setTotalEvents]  = useState(20);
  const [alpha,        setAlpha]        = useState(CBS_CONFIG.alpha_default);
  const [probStr,      setProbStr]      = useState('0.5, 0.3, 0.2');

  const probabilities = useMemo(() => {
    try {
      return probStr.split(',').map((s) => parseFloat(s.trim())).filter((n) => !isNaN(n));
    } catch { return []; }
  }, [probStr]);

  const result = useMemo(() => {
    const r = calculateCBS({ stress_events: stressEvents, total_events: totalEvents, probabilities, alpha });
    onCBSChange?.(r);
    return r;
  }, [stressEvents, totalEvents, probabilities, alpha]);

  const color = result.is_high ? '#dc2626' : '#16a34a';

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '12px' }}>
        <div>
          <FieldLabel label="Stressz-események száma" />
          <NumInput value={stressEvents} step="1" min={0} onChange={setStressEvents} />
        </div>
        <div>
          <FieldLabel label="Összes esemény" />
          <NumInput value={totalEvents} step="1" min={1} onChange={setTotalEvents} />
        </div>
        <div>
          <FieldLabel label="α — intenzitás/entrópia súly" hint="0 = csak entrópia, 1 = csak arány" />
          <NumInput value={alpha} step="0.05" min={0} max={1} onChange={setAlpha} />
        </div>
        <div>
          <FieldLabel label="p_i valószínűségek (vesszővel)" hint="Összeg ≈ 1 — entrópia számításhoz" />
          <input type="text" value={probStr} onChange={(e) => setProbStr(e.target.value)}
            style={{ width: '100%', padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box' }} />
        </div>
      </div>
      <div style={{ border: `2px solid ${color}`, borderRadius: '8px', padding: '12px', background: `${color}08` }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '8px' }}>
          {[
            { l: 'CBS_ratio', v: result.cbs_ratio },
            { l: 'CBS_entropy', v: result.cbs_entropy },
            { l: 'CBS (hibrid)', v: result.cbs },
          ].map(({ l, v }) => (
            <div key={l} style={{ textAlign: 'center', background: 'white', borderRadius: '6px', padding: '8px' }}>
              <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>{l}</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>
          CBS = {alpha} × {result.cbs_ratio} + {(1-alpha).toFixed(2)} × {result.cbs_entropy} = <strong style={{ color }}>{result.cbs}</strong>
        </div>
        <Badge color={color}>{result.is_high ? '⬆ CBS MAGAS — CEWS trigger lehetséges' : '⬇ CBS ALACSONY'}</Badge>
        <span style={{ fontSize: '10px', color: '#9ca3af', marginLeft: '8px' }}>Küszöb: ≥ {CBS_CONFIG.cbs_threshold}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. η(W) Dekompozíció
// ---------------------------------------------------------------------------

function EtaWPanel({ onEtaWChange }) {
  const [dHh,    setDHh]   = useState(-0.3);
  const [dHe,    setDHe]   = useState(0.5);
  const [dCBSlag, setDCBSlag] = useState(0.2);
  const [wH,     setWH]    = useState(0.72);

  const wE = Math.round((1 - wH) * 100) / 100;

  const result = useMemo(() => {
    const r = calculateEtaW({ delta_h_h: dHh, delta_h_e: dHe, delta_cbs_lag: dCBSlag, w_h: wH, w_e: wE });
    onEtaWChange?.(r);
    return r;
  }, [dHh, dHe, dCBSlag, wH, wE]);

  const stateColor = { EUDAIMONIC: '#16a34a', HEDONIC_DROP: '#dc2626', ADAPTATION: '#6b7280' }[result.state] ?? '#6b7280';

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginBottom: '12px' }}>
        <div>
          <FieldLabel label="ΔH_h — hedónikus boldogság Δ" hint="η_h < 0: hedónikus sérülékenység" />
          <NumInput value={dHh} step="0.01" onChange={setDHh} />
        </div>
        <div>
          <FieldLabel label="ΔH_e — eudaimonikus boldogság Δ" hint="η_e > 0: eudaimonikus reziliéncia" />
          <NumInput value={dHe} step="0.01" onChange={setDHe} />
        </div>
        <div>
          <FieldLabel label="ΔCBS_{t-1} — lagged CBS változás" hint="Előző periódus CBS változása" />
          <NumInput value={dCBSlag} step="0.01" onChange={setDCBSlag} />
        </div>
        <div>
          <FieldLabel label="w_h — hedónikus súly" hint={`w_e = ${wE} (automatikus)`} />
          <NumInput value={wH} step="0.01" min={0} max={1} onChange={setWH} />
        </div>
      </div>

      <div style={{ border: `2px solid ${stateColor}`, borderRadius: '8px', padding: '12px', background: `${stateColor}08`, marginBottom: '10px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '8px' }}>
          {[
            { l: 'η_h', v: result.eta_h, hint: 'hedónikus' },
            { l: 'η_e', v: result.eta_e, hint: 'eudaimonikus' },
            { l: 'η(W)', v: result.eta_w, hint: 'kompozit' },
            { l: 'Δη_e-h', v: Math.round((result.eta_e - Math.abs(result.eta_h)) * 100) / 100, hint: 'eudaimon. többlet' },
          ].map(({ l, v, hint }) => (
            <div key={l} style={{ textAlign: 'center', background: 'white', borderRadius: '6px', padding: '8px' }}>
              <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>{l}</div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: v > 0 ? '#16a34a' : v < 0 ? '#dc2626' : '#6b7280' }}>{v}</div>
              <div style={{ fontSize: '9px', color: '#9ca3af' }}>{hint}</div>
            </div>
          ))}
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>
          η(W) = {wH} × {result.eta_h} + {wE} × {result.eta_e} = <strong style={{ color: stateColor }}>{result.eta_w}</strong>
        </div>
        <Badge color={stateColor}>{result.state}</Badge>
        <span style={{ fontSize: '11px', color: stateColor, marginLeft: '8px', fontWeight: '600' }}>{result.description}</span>
      </div>

      {/* Dekompozíció értelmező */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {[
          { cond: result.eta_e > 0 && result.eta_h < 0, label: 'EUDAIM. NŐV.', desc: 'Stressz közben jellem-erősítőség — pozitív', color: '#047857' },
          { cond: result.eta_h > 0 && Math.abs(result.eta_e) < 0.05, label: 'FOGYASZTÁS-ORIENT.', desc: 'Rövid távú boldogságnövekedés, eudaimonikus hatás nélkül', color: '#ca8a04' },
        ].map(({ cond, label, desc, color }) => (
          <div key={label} style={{ padding: '8px 10px', borderRadius: '6px', border: `1px solid ${cond ? color : '#e5e7eb'}`, background: cond ? `${color}10` : '#fafafa', opacity: cond ? 1 : 0.4 }}>
            <Badge color={cond ? color : '#d1d5db'} size="9px">{label}</Badge>
            <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '3px' }}>{desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. BGP_score + Δη(W) Paradoxon Képlet
// ---------------------------------------------------------------------------

function BGPPanel({ eta_w }) {
  const [hSpend,   setHSpend]   = useState(800);
  const [dtIndex,  setDtIndex]  = useState(1.8);
  const [etaEud,   setEtaEud]   = useState(0.863);
  const [etaHed,   setEtaHed]   = useState(-0.45);
  const [wE,       setWE]       = useState(0.28);
  const wH = Math.round((1 - wE) * 100) / 100;

  const bgpResult  = useMemo(() => calculateBGPScore({ h_spend_per_capita: hSpend, dt_index: dtIndex, eta_w }), [hSpend, dtIndex, eta_w]);
  const deltaResult = useMemo(() => calculateDeltaEtaW({ eta_w_eudaimon: etaEud, eta_w_hedon: etaHed, w_e: wE, w_h: wH }), [etaEud, etaHed, wE, wH]);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* BGP */}
        <div>
          <div style={{ fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', color: '#6b7280', marginBottom: '8px', letterSpacing: '0.04em' }}>
            BGP_score — Parazitizmus Index
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <div>
              <FieldLabel label="H_spend/fő ($/év)" />
              <NumInput value={hSpend} step="10" min={0} onChange={setHSpend} />
            </div>
            <div>
              <FieldLabel label="DT_index" hint="Digital tox. szorzó" />
              <NumInput value={dtIndex} step="0.1" min={0} onChange={setDtIndex} />
            </div>
          </div>
          <div style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '8px' }}>
            η(W): <strong style={{ color: bgpResult.color }}>{eta_w}</strong> · η(W)_baseline: {CBS_CONFIG.eta_w_baseline}
          </div>
          <div style={{ border: `2px solid ${bgpResult.color}`, borderRadius: '8px', padding: '10px', background: `${bgpResult.color}08` }}>
            <div style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'monospace', color: bgpResult.color }}>{bgpResult.bgp}</div>
            <Badge color={bgpResult.color}>{bgpResult.zone}</Badge>
            <div style={{ fontSize: '10px', color: bgpResult.color, marginTop: '4px', fontWeight: '600' }}>{bgpResult.eta_effect}</div>
            <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#9ca3af', marginTop: '4px' }}>
              BGP = ({hSpend} × {dtIndex}) / ({CBS_CONFIG.eta_w_baseline} + |{eta_w}|)
            </div>
          </div>
        </div>

        {/* Δη(W) */}
        <div>
          <div style={{ fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', color: '#6b7280', marginBottom: '8px', letterSpacing: '0.04em' }}>
            Δη(W) — EU Kalibrált Paradoxon Képlet
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <div>
              <FieldLabel label="η(W)_eudaimon" hint="Eudaimonikus komponens" />
              <NumInput value={etaEud} step="0.01" onChange={setEtaEud} />
            </div>
            <div>
              <FieldLabel label="η(W)_hedón" hint="Hedónikus komponens" />
              <NumInput value={etaHed} step="0.01" onChange={setEtaHed} />
            </div>
            <div>
              <FieldLabel label="W_e (eudaimonikus súly)" hint={`W_h = ${wH}`} />
              <NumInput value={wE} step="0.01" min={0} max={1} onChange={setWE} />
            </div>
          </div>
          <div style={{ border: `2px solid ${deltaResult.color}`, borderRadius: '8px', padding: '10px', background: `${deltaResult.color}08` }}>
            <div style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'monospace', color: deltaResult.color }}>{deltaResult.delta_eta_w}</div>
            <Badge color={deltaResult.color}>{deltaResult.zone}</Badge>
            <div style={{ fontSize: '10px', color: deltaResult.color, marginTop: '4px', fontWeight: '600' }}>{deltaResult.description}</div>
            <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#9ca3af', marginTop: '4px' }}>
              Δη(W) = {etaEud}×{wE} − ({etaHed})×{wH} = {deltaResult.delta_eta_w}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 5. CEWS Állapotmátrix
// ---------------------------------------------------------------------------

function CEWSMatrix({ cbsHigh, bgp, etaE, etaH }) {
  const result = useMemo(
    () => classifyCEWSHappinessState({ cbs_high: cbsHigh, bgp, eta_e: etaE, eta_h: etaH }),
    [cbsHigh, bgp, etaE, etaH]
  );

  return (
    <div>
      {/* Current state */}
      <div style={{ border: `3px solid ${result.color}`, borderRadius: '10px', padding: '14px', background: `${result.color}08`, marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: '800', fontSize: '14px', color: result.color }}>{result.label}</span>
          <Badge color={result.color}>CBS: {cbsHigh ? 'MAGAS' : 'ALACSONY'}</Badge>
          <Badge color={bgp < 1 ? '#16a34a' : '#dc2626'}>BGP: {bgp < 1 ? 'REGENERATÍV' : 'PARAZITA'}</Badge>
        </div>
        <div style={{ fontSize: '12px', color: '#374151', marginBottom: '4px' }}>{result.description}</div>
        <div style={{ fontSize: '11px', fontWeight: '700', color: result.color }}>🔔 {result.action}</div>
      </div>

      {/* Full matrix */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['CBS', 'η(W)', 'CEWS Állapot', 'Jelentés'].map((h) => (
                <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '700', color: '#6b7280', fontSize: '10px', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CEWS_HAPPINESS_STATES.map((s) => (
              <tr key={s.id} style={{ borderBottom: '1px solid #f3f4f6', background: s.id === result.state ? `${s.color}10` : 'white' }}>
                <td style={{ padding: '6px 8px', fontWeight: '600' }}>{s.cbsHigh ? '↑ magas' : '↓ alacsony'}</td>
                <td style={{ padding: '6px 8px', fontWeight: '600' }}>{s.etaWPositive ? '+ pozitív' : '− negatív'}</td>
                <td style={{ padding: '6px 8px' }}>
                  <Badge color={s.color} size="10px">{s.label}</Badge>
                  {s.id === result.state && <span style={{ marginLeft: '6px', fontSize: '10px', fontWeight: '800', color: s.color }}>← AKTÍV</span>}
                </td>
                <td style={{ padding: '6px 8px', color: '#6b7280', fontSize: '10px' }}>{s.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stability criteria */}
      <div style={{ marginTop: '12px', border: '1px solid #e5e7eb', borderRadius: '7px', padding: '10px 12px', background: '#fafafa' }}>
        <div style={{ fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', color: '#6b7280', marginBottom: '6px' }}>
          CEWS GREEN Stabilitási Kritérium (§XI) — 3 feltétel egyidejű teljesítése:
        </div>
        {[
          { cond: etaE > Math.abs(etaH), label: `(1) η_e > |η_h| : ${etaE} > ${Math.abs(etaH)}`, desc: 'Eudaimonikus túlsúly' },
          { cond: bgp < 1,               label: `(2) BGP_score < 1 : ${bgp < 1 ? '✔' : bgp + ' > 1'}`,   desc: 'Regeneratív zóna' },
          { cond: !cbsHigh,              label: `(3) CBS ↓ : ${cbsHigh ? 'CBS MAGAS ✗' : 'CBS ALACSONY ✔'}`, desc: 'Csökkenő stressz-trend' },
        ].map(({ cond, label, desc }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '3px 0' }}>
            <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: cond ? '#16a34a' : '#dc2626', color: 'white', fontSize: '10px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {cond ? '✓' : '✗'}
            </div>
            <span style={{ fontSize: '11px', fontFamily: 'monospace', color: cond ? '#16a34a' : '#dc2626', fontWeight: '600' }}>{label}</span>
            <span style={{ fontSize: '10px', color: '#9ca3af' }}>{desc}</span>
          </div>
        ))}
        <div style={{ marginTop: '8px', fontSize: '11px', fontWeight: '700', color: etaE > Math.abs(etaH) && bgp < 1 && !cbsHigh ? '#047857' : '#dc2626' }}>
          → CEWS STATE: {etaE > Math.abs(etaH) && bgp < 1 && !cbsHigh ? '✅ GREEN (Teljes stabilitás)' : '⚠ ' + result.label}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 6. Globális Happiness Industry Mérleg
// ---------------------------------------------------------------------------

function HappinessIndustryTable() {
  const total = HAPPINESS_INDUSTRY.reduce((s, r) => s + r.size_T, 0);
  return (
    <div>
      <div style={{ overflowX: 'auto', marginBottom: '10px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['Szegmens', 'Méret', 'η(W) hatás', 'BGP_score', '600.x nexus'].map((h) => (
                <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '700', color: '#6b7280', fontSize: '10px', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HAPPINESS_INDUSTRY.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '6px 8px', fontWeight: '600', color: '#374151' }}>{r.label}</td>
                <td style={{ padding: '6px 8px', fontFamily: 'monospace', fontWeight: '700', color: r.color }}>${r.size_T}T</td>
                <td style={{ padding: '6px 8px', fontWeight: '700', color: '#dc2626' }}>{r.eta_effect}</td>
                <td style={{ padding: '6px 8px', fontFamily: 'monospace', color: r.color }}>{r.bgp_range}</td>
                <td style={{ padding: '6px 8px' }}><Badge color={r.color} size="9px">{r.nexus}</Badge></td>
              </tr>
            ))}
            <tr style={{ background: '#fef2f2', fontWeight: '800' }}>
              <td style={{ padding: '8px', color: '#dc2626' }}>NETTÓ EGYENLEG</td>
              <td style={{ padding: '8px', fontFamily: 'monospace', color: '#dc2626', fontWeight: '800' }}>${total}T</td>
              <td style={{ padding: '8px', color: '#dc2626', fontWeight: '800' }}>NEGATÍV</td>
              <td style={{ padding: '8px', color: '#dc2626' }}>η(W)↓</td>
              <td style={{ padding: '8px' }}><Badge color="#dc2626" size="9px">$4.5T → boldogság ↓</Badge></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style={{ padding: '10px 12px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '7px', fontSize: '12px', fontWeight: '700', color: '#dc2626', fontStyle: 'italic' }}>
        🔥 FIRE CHIEF MEGÁLLAPÍTÁS: „4.5 trillió dollár boldogság-költés → η(W) csökken." — Az Easterlin-paradoxon EFU-keretbe foglalt operacionális megfogalmazása.
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 7. Eudaimónia vs. Hedónia Réteg Térkép
// ---------------------------------------------------------------------------

function EudaimoniaMap() {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
        <thead>
          <tr style={{ background: '#f9fafb' }}>
            {['Típus', 'EFU-Réteg', 'η(W) hatás', 'BGP_score', 'Példa', '600.x nexus'].map((h) => (
              <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '700', color: '#6b7280', fontSize: '10px', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HEDONIA_EUDAIMONIA_MAP.map((r) => (
            <tr key={r.type} style={{ borderBottom: '1px solid #f3f4f6', background: r.type.includes('★') ? '#f0fdf4' : 'white' }}>
              <td style={{ padding: '6px 8px', fontWeight: '600', color: r.color }}>{r.type}</td>
              <td style={{ padding: '6px 8px', fontFamily: 'monospace', color: '#374151' }}>{r.layer}</td>
              <td style={{ padding: '6px 8px', fontWeight: '800', color: r.color }}>{r.eta_effect}</td>
              <td style={{ padding: '6px 8px', fontFamily: 'monospace', color: r.color }}>{r.bgp_score}</td>
              <td style={{ padding: '6px 8px', color: '#374151' }}>{r.example}</td>
              <td style={{ padding: '6px 8px' }}><Badge color={r.color} size="9px">{r.nexus}</Badge></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 8. FC Farm vs. EU-átlag Referenciapanel
// ---------------------------------------------------------------------------

function ReferencePanel({ onLoadRef }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
      {Object.entries(REFERENCE_SYSTEMS).map(([key, ref]) => {
        const isFC = key === 'fc_farm';
        const color = isFC ? '#047857' : '#dc2626';
        return (
          <div key={key} style={{ border: `2px solid ${color}`, borderRadius: '8px', padding: '12px', background: `${color}06` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <Badge color={color}>{ref.label}</Badge>
              <Badge color={isFC ? '#16a34a' : '#ea580c'} size="9px">{ref.cews_state.replace('_', ' ')}</Badge>
            </div>
            <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '8px' }}>
              {[
                { l: 'BH', v: ref.bh ?? '—' },
                { l: 'W_h / W_e', v: `${ref.w_h} / ${ref.w_e}` },
                { l: 'η(W)', v: ref.eta_w },
                { l: 'BGP_score', v: ref.bgp_score },
                { l: 'CBS trend', v: ref.cbs_trend },
              ].map(({ l, v }) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280', fontWeight: '600' }}>{l}:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: '700', color }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: '10px', color: '#6b7280', fontStyle: 'italic', marginBottom: '8px' }}>{ref.note}</div>
            <button onClick={() => onLoadRef(key)}
              style={{ width: '100%', padding: '5px 10px', border: `1px solid ${color}`, borderRadius: '5px', background: `${color}15`, color, fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>
              ↑ Betöltés a kalkulátorba
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 9. Licenc Kategóriák
// ---------------------------------------------------------------------------

function LicenseCategories() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {LICENSE_CATEGORIES_85.map((cat) => (
        <div key={cat.level} style={{ flex: '1 1 160px', border: `2px solid ${cat.color}40`, borderRadius: '8px', padding: '10px 12px', background: `${cat.color}08` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Badge color={cat.color} size="9px">Szint {cat.level}</Badge>
            <span style={{ fontWeight: '800', fontSize: '12px', color: cat.color }}>{cat.label}</span>
          </div>
          <div style={{ fontSize: '10px', color: '#374151' }}>BGP &lt; {cat.bgp_max === Infinity ? '∞' : cat.bgp_max} · η(W) &gt; {cat.eta_min}</div>
          <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px', fontStyle: 'italic' }}>{cat.desc}</div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Happiness600Panel
// ---------------------------------------------------------------------------

export default function Happiness600Panel() {
  // Shared state between panels
  const [cbsResult, setCBSResult]   = useState({ cbs: 0.7, is_high: true, cbs_ratio: 0.6, cbs_entropy: 0.5 });
  const [etaWResult, setEtaWResult] = useState({ eta_w: -0.31, eta_h: -0.45, eta_e: 0.18 });

  // For CEWS matrix: derived from CBS + η(W) + BGP
  const [bgpLive,  setBGPLive]  = useState(2.4);

  // Reference quick-load
  const [refOverride, setRefOverride] = useState(null);

  const loadRef = (key) => {
    const ref = REFERENCE_SYSTEMS[key];
    setRefOverride(ref);
  };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', marginTop: '32px' }}>
      {/* Header */}
      <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '24px', marginBottom: '18px', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: '10px', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '800', color: '#111827' }}>
            🌱 EFU 600.85 — Boldogság-gazdaság Paradoxona
          </h2>
          <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
            Eudaimónia vs. Hedónia · F-META Domain · v2.1 FINAL · 600-as Pozitív Referencia-Mérleg
          </p>
        </div>
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          <Badge color="#047857">600.85</Badge>
          <Badge color="#16a34a">FC-APPROVED</Badge>
          <Badge color="#0891b2">POSITIVE_SECONDARY</Badge>
          <Badge color="#7c3aed">Tier 1 · P:9/10</Badge>
          <Badge color="#6b7280">600.79 → DEPRECATED</Badge>
        </div>
      </div>

      {/* Ontológiai pozíció */}
      <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '10px 14px', marginBottom: '18px', fontSize: '12px', color: '#14532d', lineHeight: '1.7' }}>
        <strong>EFU EGYEDI STÁTUSZ:</strong> Ez az <strong>EGYETLEN 600-as modul, amely NEM antifluxust mér — hanem annak hiányát.</strong> A 600.85 a 600-sorozat „MI HIÁNYZIK" mérlege, és a 104.87 gazdasági tükörképe.
        <div style={{ marginTop: '4px', fontFamily: 'monospace', fontSize: '11px', color: '#166534' }}>
          600.67 (MÉRÉSI TORZÍTÁS) → 600.85 (BOLDOGSÁG-PARADOXON) → 104.87 (EFU-W JOG)
        </div>
        <div style={{ marginTop: '4px', fontSize: '11px', color: '#166534' }}>
          FC Farm empirikus bizonyíték: η(W)=0.863, BGP≈0.05 — az egyetlen hitelesített referenciapélda.
        </div>
      </div>

      {/* Reference load */}
      <SectionBox title="FC Farm vs. EU-átlag Referenciapanel — Gyors betöltés" icon="📌" accentColor="#047857">
        <ReferencePanel onLoadRef={loadRef} />
        {refOverride && (
          <div style={{ marginTop: '10px', padding: '8px 12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', fontSize: '11px', color: '#1e40af', fontWeight: '600' }}>
            ✅ Betöltve: <strong>{refOverride.label}</strong> — η(W): {refOverride.eta_w} · BGP: {refOverride.bgp_score} · {refOverride.note}
          </div>
        )}
      </SectionBox>

      {/* BH Calculator */}
      <SectionBox title="BH — Boldogság-gazdaság Paradoxon (Easterlin-mérőkeret)" icon="📈" accentColor="#0891b2">
        <BHCalculator />
      </SectionBox>

      {/* CBS */}
      <SectionBox title="CBS — Kognitív-Bioszféra-Stressz Hibrid Kalkulátor" icon="🧠" accentColor="#ea580c40">
        <CBSCalculator onCBSChange={setCBSResult} />
      </SectionBox>

      {/* η(W) */}
      <SectionBox title="η(W) — Boldogságválasz & Eudaimónia/Hedónia Dekompozíció" icon="⚡" accentColor="#7c3aed40">
        <EtaWPanel onEtaWChange={setEtaWResult} />
      </SectionBox>

      {/* BGP + Δη(W) */}
      <SectionBox title="BGP_score & Δη(W) — Parazitizmus Index + Paradoxon Képlet" icon="🔢" accentColor="#dc262640">
        <BGPPanel eta_w={etaWResult.eta_w} />
      </SectionBox>

      {/* CEWS Matrix */}
      <SectionBox title="CEWS Állapotmátrix + Stabilitási Kritérium (§IX–XI)" icon="🔔" accentColor="#ca8a0440">
        <CEWSMatrix
          cbsHigh={refOverride ? refOverride.cbs_trend === 'high' : cbsResult.is_high}
          bgp={refOverride ? refOverride.bgp_score : bgpLive}
          etaE={refOverride ? refOverride.w_e : etaWResult.eta_e}
          etaH={refOverride ? refOverride.w_h * -1 : etaWResult.eta_h}
        />
        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '10px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>BGP_score (élő)</label>
          <input type="number" min={0} step={0.1} value={bgpLive} onChange={(e) => { setRefOverride(null); setBGPLive(Number(e.target.value)); }}
            style={{ width: '90px', padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '5px', fontSize: '13px' }} />
        </div>
      </SectionBox>

      {/* Globális mérleg */}
      <SectionBox title="Globális Happiness Industry Mérleg (~$4.5T/év) (§VII)" icon="💰" accentColor="#dc262640">
        <HappinessIndustryTable />
      </SectionBox>

      {/* Réteg térkép */}
      <SectionBox title="Eudaimónia vs. Hedónia — EFU-Rétegek & BGP-Térkép (§VI)" icon="🗺">
        <EudaimoniaMap />
      </SectionBox>

      {/* Licenc kategóriák */}
      <SectionBox title="600.85 Licenc Kategóriák (§XII)" icon="📋">
        <LicenseCategories />
      </SectionBox>

      {/* Module status */}
      <div style={{ border: '2px solid #047857', borderRadius: '10px', padding: '14px', background: '#f0fdf4', marginBottom: '16px' }}>
        <div style={{ fontWeight: '800', fontSize: '13px', color: '#374151', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          📋 Modul Kapcsolódások & Státusz — EFU 600.85 v2.1
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '8px' }}>
          <span style={{ fontSize: '10px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginRight: '4px' }}>POZITÍV:</span>
          {['104.87 (EFU-W)', '104.88 (Fluxus-Credit)', '700.1 (közösség)', '700.5 (flow)'].map((m) => <Badge key={m} color="#047857" size="9px">{m}</Badge>)}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '8px' }}>
          <span style={{ fontSize: '10px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginRight: '4px' }}>ANTIFLUX:</span>
          {['600.20', '600.78 (streaming)', '600.36 (wellness)', '600.23/25 (kémiai)'].map((m) => <Badge key={m} color="#dc2626" size="9px">{m}</Badge>)}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '8px' }}>
          <span style={{ fontSize: '10px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginRight: '4px' }}>RENDSZER:</span>
          {['600.67 (szülő)', '050.3 (η(W)_eff.)', '900.5 (CEWS)', '104.37/45/46', '105.4'].map((m) => <Badge key={m} color="#0891b2" size="9px">{m}</Badge>)}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          <span style={{ fontSize: '10px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginRight: '4px' }}>DEPRECATED:</span>
          <Badge color="#6b7280" size="9px">600.79 → MERGED INTO 600.85 v2.0</Badge>
        </div>
      </div>

      <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0, lineHeight: '1.6' }}>
        EFU 600.85 Boldogság-gazdaság Paradoxona · BH, CBS, η(W), BGP_score, Δη(W) · FC-APPROVED ·
        POSITIVE_SECONDARY = TRUE · F-META Domain · 600.79 DEPRECATED ·
        Szerző: Simor István · ORCID: 0009-0002-6599-3480
      </p>
    </div>
  );
}
