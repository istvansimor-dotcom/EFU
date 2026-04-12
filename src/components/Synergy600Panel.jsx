/**
 * Synergy600Panel.jsx — EFU 600.0 v1.0 600-as Szinergia-Mátrix
 *
 * Antiflux Szinergia Alapoperátor | P_syn Kalibrációs Modul
 * Tier 0 (Meta) | FC-APPROVED | v1.0 FINAL
 */

import { useState, useMemo } from 'react';
import {
  MODULE_META_600_0,
  ANTIFLUX_MODULES,
  SYNERGY_MATRIX,
  P_SYN_BASE,
  P_SYN_MODIFIERS,
  ZONE_PROFILES,
  CEWS_SYNERGY_THRESHOLDS,
  ACTION_PRIORITIES,
} from '../data/synergy600_0';
import {
  calculatePSynBase,
  applyPSynModifiers,
  calculateEtaWEff,
  classifyCEWSSynergyState,
} from '../logic/efu-engine';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function Badge({ label, color }) {
  return (
    <span
      className="inline-block px-2 py-0.5 rounded text-xs font-bold"
      style={{ background: color + '22', color }}
    >
      {label}
    </span>
  );
}

function Card({ title, children, accent }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white/60 overflow-hidden">
      <div className="px-4 py-2 font-semibold text-sm" style={{ background: (accent || '#6b7280') + '18', color: accent || '#374151' }}>
        {title}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange, format }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-mono font-bold text-gray-800">{format ? format(value) : value}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-gray-200"
      />
      <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section I – Ontológiai Pozíció
// ---------------------------------------------------------------------------

function OntologySection() {
  return (
    <Card title="I. Ontológiai Pozíció a 600-sorozatban" accent="#7c3aed">
      <div className="grid md:grid-cols-3 gap-3 mb-4">
        {[
          { code: '600.0',  label: 'META-OPERÁTOR',        desc: 'Szinergia, P_syn kalibráció',                    color: '#7c3aed' },
          { code: '600.x',  label: 'Egyedi antiflux',       desc: '600.52, 600.53, 600.58 …',                       color: '#ea580c' },
          { code: '600.85', label: 'Pozitív referencia',    desc: 'Eudaimónia ellen-mérleg',                         color: '#16a34a' },
        ].map(r => (
          <div key={r.code} className="rounded-lg p-3 text-center border-2" style={{ borderColor: r.color + '66', background: r.color + '0d' }}>
            <div className="text-lg font-black" style={{ color: r.color }}>{r.code}</div>
            <div className="text-xs font-bold mt-0.5">{r.label}</div>
            <div className="text-[11px] text-gray-500 mt-1">{r.desc}</div>
          </div>
        ))}
      </div>
      <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm">
        <div className="font-bold text-amber-800 mb-1">⚡ A szinergia-hatás alaptétele</div>
        <p className="text-amber-700 text-xs">
          Az antifluxusok nem összeadódnak, hanem <strong>hatványozódnak</strong>. Egy városi környezetben,
          ahol a 600.52, 600.53 és 600.58 egyszerre van jelen, a rendszer η(W)_eff értéke nem 3× az egyes
          hatásoknak, hanem akár <strong>5–10×-es romlás</strong> is bekövetkezhet. Ez a P_syn szorzó lényege.
        </p>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Section II – Alapváltozók
// ---------------------------------------------------------------------------

const BASE_VARIABLES = [
  { sym: 'η_W',       name: 'Pillanatényi hatékonyság',  def: 'Egyéni és társadalmi fluxushatékonyság (050-sorozat)' },
  { sym: 'EFM',       name: 'Epigenetikai Fl. Memória',  def: 'Generációs adaptáció; antifluxusok állandósítják (050.2)' },
  { sym: 'N_cogn',    name: 'Kognitív kapacitás',        def: 'Fókusz, észlelés, CEWS-riasztás-érzet; brain fog csökkent' },
  { sym: 'P_syn',     name: 'Parazita Szorzó',           def: 'Szupralineáris szinergia-szorzó [0.0, 1.0]; 1.0 = nincs, 0.0 = kollapszus' },
  { sym: 'η(W)_eff',  name: 'Eff. fluxushatékonyság',   def: 'η(W)_eff = (η_W_inst × η_W_epi) × P_syn (050.3)' },
];

function VariablesSection() {
  return (
    <Card title="II. Alapváltozók Definíciója" accent="#0891b2">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-3 py-2 text-left font-mono text-blue-700">Jelölés</th>
              <th className="px-3 py-2 text-left">Név</th>
              <th className="px-3 py-2 text-left">Definíció</th>
            </tr>
          </thead>
          <tbody>
            {BASE_VARIABLES.map(v => (
              <tr key={v.sym} className="border-t border-gray-100">
                <td className="px-3 py-2 font-mono font-bold text-blue-600 whitespace-nowrap">{v.sym}</td>
                <td className="px-3 py-2 font-semibold whitespace-nowrap">{v.name}</td>
                <td className="px-3 py-2 text-gray-600">{v.def}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Section III – Szinergia-Mátrix
// ---------------------------------------------------------------------------

const MODULE_KEYS = ANTIFLUX_MODULES.map(m => m.id);
const SEV_STYLES = {
  BASE:     { bg: '#f3f4f6', border: '#d1d5db', text: '#374151' },
  HIGH:     { bg: '#fff7ed', border: '#fdba74', text: '#9a3412' },
  CRITICAL: { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b' },
};

function SynergyMatrixSection() {
  return (
    <Card title="III. Szinergia-Mátrix 3×3 (Elsődleges → Másodlagos)" accent="#dc2626">
      <p className="text-xs text-gray-500 mb-3">
        A mátrix azt mutatja, hogyan készíti elő az <strong>elsődleges parazita (bal sor)</strong> a terepet a <strong>másodlagos parazita (oszlop)</strong> számára.
        <span className="ml-2 inline-flex items-center gap-1"><span className="text-red-600">⚠</span> <span className="text-red-700 font-semibold">'Gyorsított Pusztítás'</span> – a két legveszélyesebb kombináció.</span>
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-left text-gray-500 font-normal border border-gray-200 bg-gray-50">Elsőd. →<br/>Másodt. ↓</th>
              {ANTIFLUX_MODULES.map(m => (
                <th key={m.id} className="p-2 text-center border border-gray-200 bg-gray-50">
                  <div className="font-bold" style={{ color: m.color }}>{m.icon} {m.short}</div>
                  <div className="text-gray-500 font-normal text-[10px]">{m.id}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MODULE_KEYS.map(rowKey => {
              const rowMod = ANTIFLUX_MODULES.find(m => m.id === rowKey);
              return (
                <tr key={rowKey}>
                  <td className="p-2 border border-gray-200 bg-gray-50 font-bold text-[11px]" style={{ color: rowMod.color }}>
                    {rowMod.icon} {rowMod.short}<br/>
                    <span className="font-normal text-gray-400">{rowMod.id}</span>
                  </td>
                  {MODULE_KEYS.map(colKey => {
                    const cell = SYNERGY_MATRIX[rowKey]?.[colKey];
                    const sev = cell?.severity || 'BASE';
                    const s = SEV_STYLES[sev];
                    return (
                      <td key={colKey} className="p-2 border border-gray-200 align-top"
                        style={{ background: s.bg, borderColor: s.border }}>
                        <div className="font-bold text-[11px] flex items-start gap-1" style={{ color: s.text }}>
                          {cell?.warning && <span>⚠</span>}
                          {cell?.label}
                        </div>
                        <div className="text-[10px] mt-1 text-gray-600 leading-tight">{cell?.desc}</div>
                        <div className="text-[10px] mt-1 font-mono italic text-gray-500">{cell?.effect}</div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Section IV – P_syn Kalkulátor
// ---------------------------------------------------------------------------

function PSynCalculator() {
  const [activeModules, setActiveModules] = useState({ '600.52': false, '600.53': false, '600.58': false });
  const [mods, setMods]   = useState({ M1: false, M2: false, M3: false, M4: false, M5: false });

  const activeCount = Object.values(activeModules).filter(Boolean).length;

  const baseResult = useMemo(() => calculatePSynBase(activeCount), [activeCount]);

  const modifierInput = useMemo(() => P_SYN_MODIFIERS.map(m => ({
    ...m,
    active: m.requires
      ? m.requires.every(r => activeModules[r]) && mods[m.id]
      : mods[m.id],
  })), [mods, activeModules]);

  // M1 auto-activates if both 600.52 and 600.53 are active
  const m1AutoActive = activeModules['600.52'] && activeModules['600.53'];
  const modInputFinal = modifierInput.map(m => m.id === 'M1' ? { ...m, active: m1AutoActive || mods.M1 } : m);

  const modResult = useMemo(() => applyPSynModifiers(baseResult.p_syn_base, modInputFinal), [baseResult, modInputFinal]);

  const baseRow = P_SYN_BASE.find(r => r.active === activeCount) || P_SYN_BASE[0];

  return (
    <Card title="IV. P_syn Kalibrációs Kalkulátor" accent="#7c3aed">
      {/* IV.1 Aktív paraziták */}
      <div className="mb-4">
        <div className="text-xs font-bold text-gray-700 mb-2">IV.1  Aktív antiflux modulok kiválasztása</div>
        <div className="flex flex-wrap gap-2">
          {ANTIFLUX_MODULES.map(m => (
            <button
              key={m.id}
              onClick={() => setActiveModules(prev => ({ ...prev, [m.id]: !prev[m.id] }))}
              className="px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all"
              style={activeModules[m.id]
                ? { background: m.color, color: '#fff', borderColor: m.color }
                : { background: '#f9fafb', color: m.color, borderColor: m.color + '66' }}
            >
              {m.icon} {m.short} ({m.id})
            </button>
          ))}
        </div>
      </div>

      {/* IV.1 Base result */}
      <div className="rounded-lg p-3 mb-4 border-2" style={{ borderColor: baseRow.color + '66', background: baseRow.color + '12' }}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="text-sm font-bold" style={{ color: baseRow.color }}>
              P_syn alap = {baseResult.p_syn_base.toFixed(2)}
              {baseResult.supralinear && <span className="ml-2 text-xs text-red-600">⚡ Szupralineáris küszöb!</span>}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{activeCount} aktív parazita | {baseRow.label}</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black" style={{ color: baseRow.color }}>{baseResult.p_syn_base.toFixed(2)}</div>
          </div>
        </div>
        <div className="mt-2 bg-gray-200 rounded-full h-2">
          <div className="h-2 rounded-full transition-all" style={{ width: `${baseResult.p_syn_base * 100}%`, background: baseRow.color }} />
        </div>
      </div>

      {/* IV.2 Modifiers */}
      <div className="mb-4">
        <div className="text-xs font-bold text-gray-700 mb-2">IV.2  Szinergia-erősség Modifikátorok</div>
        <div className="space-y-2">
          {P_SYN_MODIFIERS.map(m => {
            const isAuto  = m.id === 'M1' && m1AutoActive;
            const checked = isAuto || mods[m.id];
            return (
              <label key={m.id}
                className="flex items-start gap-2 cursor-pointer rounded-lg px-3 py-2 border transition-all"
                style={checked
                  ? { background: m.color + '15', borderColor: m.color + '66' }
                  : { borderColor: '#e5e7eb' }}
              >
                <input type="checkbox" checked={checked} disabled={isAuto}
                  onChange={() => setMods(prev => ({ ...prev, [m.id]: !prev[m.id] }))}
                  className="mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs font-semibold flex items-center gap-2">
                    <span style={{ color: m.color }}>{m.label}</span>
                    <Badge
                      label={`${m.effect > 0 ? '+' : ''}${(m.effect * 100).toFixed(0)}%`}
                      color={m.color}
                    />
                    {isAuto && <span className="text-[10px] text-amber-600">(auto)</span>}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{m.desc}</div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Final P_syn */}
      <div className="rounded-xl border-2 border-purple-300 bg-purple-50 p-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="text-sm font-bold text-purple-700">P_syn Végleges</div>
            <div className="text-xs text-purple-500 mt-0.5">
              {baseResult.p_syn_base.toFixed(2)}
              {modResult.total_mod !== 0 && ` + (${modResult.total_mod > 0 ? '+' : ''}${modResult.total_mod.toFixed(2)})`}
              {' '}= {modResult.p_syn.toFixed(3)}
            </div>
          </div>
          <div className="text-3xl font-black text-purple-700">{modResult.p_syn.toFixed(3)}</div>
        </div>
        <div className="mt-2 bg-purple-200 rounded-full h-3">
          <div className="h-3 rounded-full bg-purple-600 transition-all" style={{ width: `${modResult.p_syn * 100}%` }} />
        </div>
      </div>

      {/* IV.3 Zone profiles reference */}
      <div className="mt-4">
        <div className="text-xs font-bold text-gray-700 mb-2">IV.3  Kalibrált P_syn Zóna-Profilok</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-2 py-1.5 text-left">Zóna-típus</th>
                <th className="px-2 py-1.5 text-center">P_syn alap</th>
                <th className="px-2 py-1.5 text-center">Mod.</th>
                <th className="px-2 py-1.5 text-center">P_syn végleges</th>
                <th className="px-2 py-1.5 text-center">CEWS</th>
              </tr>
            </thead>
            <tbody>
              {ZONE_PROFILES.map(z => (
                <tr key={z.id} className="border-t border-gray-100">
                  <td className="px-2 py-1.5">
                    <div className="font-semibold">{z.label}</div>
                    <div className="text-[10px] text-gray-500">{z.desc}</div>
                  </td>
                  <td className="px-2 py-1.5 text-center font-mono">{z.p_syn_base.toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center font-mono">
                    {z.modifier === 0 ? '—' : `${z.modifier > 0 ? '+' : ''}${(z.modifier * 100).toFixed(0)}%`}
                  </td>
                  <td className="px-2 py-1.5 text-center font-mono font-bold" style={{ color: z.color }}>
                    {z.p_syn_final.toFixed(2)}
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <Badge label={z.cews} color={z.color} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Section V – η(W)_eff Kalkulátor
// ---------------------------------------------------------------------------

function EtaWEffCalc({ p_syn_override }) {
  const [etaInst, setEtaInst] = useState(0.72);
  const [etaEpi,  setEtaEpi]  = useState(0.80);
  const [pSyn,    setPSyn]    = useState(p_syn_override !== undefined ? p_syn_override : 0.40);
  const [nCogn,   setNCogn]   = useState(0.55);
  const [efmFixed, setEfmFixed] = useState(false);

  const result  = useMemo(() => calculateEtaWEff({ eta_w_inst: etaInst, eta_w_epi: etaEpi, p_syn: pSyn }), [etaInst, etaEpi, pSyn]);
  const cews    = useMemo(() => classifyCEWSSynergyState({ p_syn: pSyn, n_cogn: nCogn, efm_fixed: efmFixed, eta_w_eff: result.eta_w_eff }), [pSyn, nCogn, efmFixed, result]);

  const EXAMPLES = [
    { label: 'Modern városi', eta_inst: 0.72, eta_epi: 0.80, p: 0.30 },
    { label: 'Előváros',      eta_inst: 0.80, eta_epi: 0.85, p: 0.65 },
    { label: 'Vidéki',        eta_inst: 0.90, eta_epi: 0.88, p: 0.90 },
    { label: 'FC Farm',       eta_inst: 0.95, eta_epi: 0.92, p: 1.00 },
  ];

  return (
    <Card title="V. η(W)_eff Végképlet — 050.3 Kapcsolat" accent="#0891b2">
      <div className="bg-blue-50 rounded-lg p-3 mb-4 font-mono text-sm text-center text-blue-700 font-bold border border-blue-200">
        η(W)_eff = (η(W)_inst × η(W)_epi) × P_syn
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <Slider label="η(W)_inst (pillanatényi hatékonyság)" value={etaInst} min={0} max={1} step={0.01} onChange={setEtaInst} format={v => v.toFixed(2)} />
          <Slider label="η(W)_epi (epigenetikai memória)" value={etaEpi}  min={0} max={1} step={0.01} onChange={setEtaEpi}  format={v => v.toFixed(2)} />
          <Slider label="P_syn (parazita szorzó)"          value={pSyn}   min={0} max={1} step={0.01} onChange={setPSyn}   format={v => v.toFixed(2)} />
          <Slider label="N_cogn (kognitív kapacitás)"       value={nCogn}  min={0} max={1} step={0.01} onChange={setNCogn}  format={v => v.toFixed(2)} />
          <label className="flex items-center gap-2 text-xs mt-2 cursor-pointer">
            <input type="checkbox" checked={efmFixed} onChange={e => setEfmFixed(e.target.checked)} />
            <span>EFM-rögzülés észlelt (krónikus &gt;2 év)</span>
          </label>
        </div>

        <div className="flex flex-col gap-3">
          <div className="rounded-xl border-2 border-blue-300 bg-blue-50 p-4 text-center">
            <div className="text-xs text-blue-500 mb-1">η(W)_eff</div>
            <div className="text-4xl font-black text-blue-700">{result.eta_w_eff.toFixed(3)}</div>
            <div className="text-xs text-blue-400 mt-1">({(result.eta_w_eff * 100).toFixed(1)}%)</div>
            <div className="mt-2 bg-blue-200 rounded-full h-3">
              <div className="h-3 rounded-full bg-blue-600 transition-all" style={{ width: `${result.eta_w_eff * 100}%` }} />
            </div>
          </div>
          <div className="rounded-lg p-3 border-2 text-center" style={{ borderColor: cews.color + '66', background: cews.color + '12' }}>
            <div className="text-xs mb-1">CEWS Állapot</div>
            <div className="text-xl font-black" style={{ color: cews.color }}>{cews.label}</div>
            <div className="text-xs mt-1 text-gray-600">{cews.action}</div>
            {cews.eta_critical && (
              <div className="text-[11px] mt-1 text-red-600 font-bold">⚠ η(W)_eff &lt; 0.35 → Azonnali beavatkozás!</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick examples */}
      <div className="mb-4">
        <div className="text-xs font-bold text-gray-700 mb-2">Gyors példák betöltése</div>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map(ex => (
            <button key={ex.label}
              onClick={() => { setEtaInst(ex.eta_inst); setEtaEpi(ex.eta_epi); setPSyn(ex.p); }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
            >
              {ex.label}: {(ex.eta_inst * ex.eta_epi * ex.p).toFixed(3)}
            </button>
          ))}
        </div>
      </div>

      {/* Calculation breakdown */}
      <div className="rounded-lg bg-gray-50 p-3 text-xs font-mono">
        <div className="font-bold text-gray-600 mb-1">Számítás:</div>
        <div>{etaInst.toFixed(2)} (inst) × {etaEpi.toFixed(2)} (epi) = {result.base_product.toFixed(3)} (alap)</div>
        <div>{result.base_product.toFixed(3)} × {pSyn.toFixed(2)} (P_syn) = <strong>{result.eta_w_eff.toFixed(3)}</strong></div>
        <div className="mt-1 text-red-600">P_syn szupralineáris veszteség: {result.loss_pct.toFixed(1)}%</div>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Section VI – Gyorsított Pusztítás
// ---------------------------------------------------------------------------

function AcceleratedDestructionSection() {
  const steps = [
    { n: 1, mod: '600.52', title: '600.52 (vegyi) fellazítja a neurónális védekezést', detail: 'Vér-agy gát sérül, N_cogn csökken', color: '#7c3aed', icon: '☣' },
    { n: 2, mod: '600.53', title: '600.53 átírja a jutalmazási rendszert',              detail: 'Dopamin-küszöb süllyed, anhedónia bekövetkezik', color: '#2563eb', icon: '📱' },
    { n: 3, mod: 'RESULT', title: 'Populáció elveszti a kollektív fókuszát',            detail: 'A túlélési stratégiákra irányuló figyelem megszűnik', color: '#ea580c', icon: '⚠' },
    { n: 4, mod: 'COLLAPSE', title: 'Rendszerszintű kollapszus',                         detail: 'N_cogn < 0.50 → CEWS-riasztás felismerés MEGHIÚSUL', color: '#dc2626', icon: '💥' },
  ];

  return (
    <Card title="VI. 'Gyorsított Pusztítás' Mechanizmusa (600.52 × 600.53)" accent="#dc2626">
      <div className="mb-3 text-xs text-gray-600">
        A szinergia legveszélyesebb pontja a <strong>600.53 (Digitális Dopamin)</strong> és a <strong>600.52 (Vegyi terh.)</strong> találkozása.
      </div>
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
        <div className="space-y-3">
          {steps.map(s => (
            <div key={s.n} className="relative pl-14">
              <div className="absolute left-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm z-10"
                style={{ background: s.color }}>
                {s.n}
              </div>
              <div className="rounded-lg p-3 border" style={{ borderColor: s.color + '44', background: s.color + '08' }}>
                <div className="text-xs font-bold" style={{ color: s.color }}>{s.icon} {s.title}</div>
                <div className="text-[11px] text-gray-600 mt-0.5">{s.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3">
        <div className="text-xs font-bold text-red-700 mb-1">⚡ EFU KRITIKUS MEGÁLLAPÍTÁS</div>
        <p className="text-xs text-red-600">
          A jövő gyilkosa a figyelemelvonás, amely elrejti a fizikai megsemmisülést.
          Ha N_cogn a CEWS-riasztás felismerési küszöbe alá süllyedt, a rendszer már nem tudja önmagát védeni.
        </p>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Section VII – CEWS Trigger Feltételek
// ---------------------------------------------------------------------------

function CEWSTriggerSection() {
  const rows = [
    { p_syn: '> 0.80', eta: '> 0.60',     cews: 'GREEN',    color: '#16a34a', action: 'Monitorozás elegendő' },
    { p_syn: '0.60–0.80', eta: '0.40–0.60', cews: 'AMBER',  color: '#ca8a04', action: 'Primer prevenció: N_cogn védős, étrendváltás' },
    { p_syn: '0.40–0.60', eta: '0.25–0.40', cews: 'RED',    color: '#dc2626', action: '600.53 detox első; kognitív visszanyerés prioritás' },
    { p_syn: '< 0.40',  eta: '< 0.25',     cews: 'CRITICAL',color: '#7c3aed', action: 'Azonnali rendszerbeavatkozás; EFM-védelem prioritás' },
  ];

  return (
    <Card title="VII. CEWS Vörös Trigger Feltételek" accent="#dc2626">
      <div className="grid md:grid-cols-3 gap-3 mb-4 text-xs">
        {[
          { cond: '(1) P_syn < 0.50', label: 'Stressz-küszöb', color: '#ea580c' },
          { cond: '(2) N_cogn < 0.50', label: 'Brain fog küszöb', color: '#dc2626' },
          { cond: '(3) EFM rögzülés', label: 'Krónikus > 2 év', color: '#7c3aed' },
        ].map(c => (
          <div key={c.cond} className="rounded-lg p-2.5 text-center border-2" style={{ borderColor: c.color + '66', background: c.color + '10' }}>
            <div className="font-mono font-bold" style={{ color: c.color }}>{c.cond}</div>
            <div className="text-gray-500 mt-0.5">{c.label}</div>
          </div>
        ))}
      </div>
      <div className="rounded-lg bg-gray-50 text-xs p-3 mb-4 font-mono space-y-1">
        <div>2 feltétel teljesül  →  <span className="text-amber-600 font-bold">CEWS AMBER</span></div>
        <div>(1) + (2) egyszerre  →  <span className="text-red-600 font-bold">CEWS RED</span></div>
        <div>(1) + (2) + (3)      →  <span className="text-purple-700 font-bold">CEWS CRITICAL</span> (visszafordíthatatlan zóna)</div>
        <div className="mt-2 text-red-600">η(W)_eff &lt; 0.35  →  azonnali beavatkozás szükséges</div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-3 py-2 text-left">P_syn</th>
              <th className="px-3 py-2 text-left">η(W)_eff</th>
              <th className="px-3 py-2 text-center">CEWS</th>
              <th className="px-3 py-2 text-left">Beavatkozás</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.cews} className="border-t border-gray-100">
                <td className="px-3 py-2 font-mono">{r.p_syn}</td>
                <td className="px-3 py-2 font-mono">{r.eta}</td>
                <td className="px-3 py-2 text-center"><Badge label={r.cews} color={r.color} /></td>
                <td className="px-3 py-2 text-gray-600">{r.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Section VIII – Intézkedési Mező
// ---------------------------------------------------------------------------

function ActionPrioritiesSection() {
  return (
    <Card title="VIII. Intézkedési Mező — Antiparazita Prioritások" accent="#16a34a">
      <p className="text-xs text-gray-500 mb-3">
        Helyes sorrend (audit alapján): <strong>percepció → szerkezet → gazdaság</strong> (nem GDP-first, nem detox-first)
      </p>
      <div className="space-y-3">
        {ACTION_PRIORITIES.map(a => (
          <div key={a.rank} className="flex items-start gap-3 rounded-lg p-3 border-l-4"
            style={{ borderColor: a.color, background: a.color + '0d' }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0"
              style={{ background: a.color }}>
              {a.rank}
            </div>
            <div>
              <div className="text-sm font-bold flex items-center gap-2">
                <span style={{ color: a.color }}>{a.priority}</span>
                <Badge label={a.target} color={a.color} />
              </div>
              <div className="text-xs text-gray-600 mt-0.5">{a.mechanism}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Section IX – Modul kapcsolódások
// ---------------------------------------------------------------------------

function ConnectionsSection() {
  const groups = [
    { type: 'INPUTOK',  mods: ['600.52 (PFAS/Vegyi)', '600.53 (Digitális Dopamin)', '600.58 (UPF/Élelmiszer)'], color: '#dc2626' },
    { type: 'OUTPUT',   mods: ['P_syn → 050.3 (η(W)_eff végképlet szorzója)'],                                  color: '#2563eb' },
    { type: 'RENDSZER', mods: ['900.5 (CEWS Dashboard)', '600.85 (pozitív ellen-referencia)', '050.2 (EFM)'],   color: '#7c3aed' },
    { type: 'BŐVÍTÉS',  mods: ['600.0 kiterjeszthető újabb antiflux párokra (pl. 600.78+600.53)'],              color: '#0891b2' },
  ];

  return (
    <Card title="IX. Modul-Kapcsolódások" accent="#7c3aed">
      <div className="grid md:grid-cols-2 gap-3">
        {groups.map(g => (
          <div key={g.type} className="rounded-lg p-3 border" style={{ borderColor: g.color + '44', background: g.color + '08' }}>
            <div className="text-xs font-bold mb-2" style={{ color: g.color }}>{g.type}</div>
            <div className="flex flex-wrap gap-1.5">
              {g.mods.map(m => (
                <span key={m} className="text-[11px] px-2 py-0.5 rounded-full border font-mono"
                  style={{ borderColor: g.color + '55', color: g.color, background: g.color + '12' }}>
                  {m}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main Panel
// ---------------------------------------------------------------------------

export default function Synergy600Panel() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-purple-400 mb-1">{MODULE_META_600_0.code} · {MODULE_META_600_0.tier}</div>
            <h2 className="text-2xl font-black text-purple-800 leading-tight">{MODULE_META_600_0.title}</h2>
            <p className="text-sm text-purple-600 mt-1">{MODULE_META_600_0.subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge label="FC-APPROVED ✓" color="#16a34a" />
            <Badge label={MODULE_META_600_0.version}    color="#7c3aed" />
            <Badge label="Tier 0 Meta"                  color="#0891b2" />
            <Badge label={`Priority ${MODULE_META_600_0.priority}`} color="#ca8a04" />
          </div>
        </div>
        <div className="mt-3 grid md:grid-cols-3 gap-2 text-xs">
          {[
            { label: 'Kategória', value: MODULE_META_600_0.category },
            { label: 'Verzió',    value: `${MODULE_META_600_0.version} (${MODULE_META_600_0.date})` },
            { label: 'Kapcsolódás', value: MODULE_META_600_0.related.join(' | ') },
          ].map(f => (
            <div key={f.label} className="bg-white/60 rounded-lg px-3 py-2">
              <div className="text-purple-400">{f.label}</div>
              <div className="font-semibold text-purple-700 mt-0.5">{f.value}</div>
            </div>
          ))}
        </div>
      </div>

      <OntologySection />
      <VariablesSection />
      <SynergyMatrixSection />
      <PSynCalculator />
      <EtaWEffCalc />
      <AcceleratedDestructionSection />
      <CEWSTriggerSection />
      <ActionPrioritiesSection />
      <ConnectionsSection />

      {/* Meta heading footer */}
      <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-4 text-xs text-purple-700 space-y-1">
        <div className="font-bold">{MODULE_META_600_0.code} – {MODULE_META_600_0.title}</div>
        <div>Type: {MODULE_META_600_0.category} | {MODULE_META_600_0.tier}</div>
        <div>Status: {MODULE_META_600_0.status} | {MODULE_META_600_0.version} ({MODULE_META_600_0.date})</div>
        <div className="font-mono">
          η(W)_eff = (η(W)_inst × η(W)_epi) × P_syn<br />
          P_syn: 1={'>'}0.85 | 2={'>'}0.65 | 3={'>'}0.40 | CEWS RED: P_syn{'<'}0.50 ∧ N_cogn{'<'}0.50
        </div>
        <div>Connections: {MODULE_META_600_0.related.join(', ')}</div>
      </div>
    </div>
  );
}
