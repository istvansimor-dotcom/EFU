/**
 * MSBE600Panel.jsx — EFU 600.2 Molekuláris Rendszerhatár-Események (MSBE)
 *
 * Interactive diagnostic panel for Molecular System Boundary Events.
 * Sections:
 *   1. Header + definition
 *   2. Substance input (t½, BAF, metabolite toxicity, natural analogue)
 *   3. MSBE criteria check (C1–C4) with live results
 *   4. MSBE score + SBE trigger level
 *   5. Evidence level selector
 *   6. Primary category quick-load (POP, PFAS, Microplastics, EDC, Radioactive)
 *   7. Related modules cross-reference
 *
 * Reference: EFU 600.2 (2026.04)
 */

import { useState, useMemo } from 'react';
import {
  MSBE_CRITERIA,
  MSBE_CATEGORIES,
  MSBE_INDICATORS,
  SBE_TRIGGER_LEVELS,
  EVIDENCE_LEVELS,
  MSBE_RELATED_MODULES,
} from '../data/msbe600.js';
import {
  classifyMSBE,
  calculateMSBEScore,
  triggerSBELevel,
} from '../logic/efu-engine.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

function Field({ label, children, hint }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.04em' }}>
        {label}
      </label>
      {children}
      {hint && <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>{hint}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 1. Criteria Matrix
// ---------------------------------------------------------------------------

function CriteriaMatrix({ details }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {MSBE_CRITERIA.map((c) => {
        const detail = details.find((d) => d.id === c.id);
        const met = detail?.met ?? false;
        return (
          <div key={c.id} style={{
            display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 12px',
            borderRadius: '7px', border: `1px solid ${met ? c.color : '#e5e7eb'}`,
            background: met ? `${c.color}10` : '#fafafa',
          }}>
            <div style={{
              width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0, marginTop: '1px',
              background: met ? c.color : '#d1d5db',
              color: 'white', fontSize: '10px', fontWeight: '800',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {met ? '✓' : c.id.slice(1)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: '700', fontSize: '12px', color: met ? c.color : '#6b7280' }}>{c.id}</span>
                <span style={{ fontSize: '12px', color: '#374151' }}>{c.label}</span>
                {met && <Badge color={c.color}>AKTIVÁLVA</Badge>}
              </div>
              <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>
                Küszöb: <em>{c.threshold}</em>
                {detail && <span style={{ marginLeft: '8px', fontFamily: 'monospace', color: met ? c.color : '#9ca3af' }}>
                  → {detail.value !== undefined && detail.value !== null ? String(detail.value) : '—'} {met ? '✔' : '✗'}
                </span>}
              </div>
              <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '1px' }}>{c.sbe_activation}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. MSBE Score Gauge
// ---------------------------------------------------------------------------

function MSBEScoreGauge({ score, sbe_level }) {
  const trigger = triggerSBELevel(sbe_level);
  return (
    <div style={{ border: `2px solid ${trigger.color}`, borderRadius: '10px', padding: '14px', background: `${trigger.color}08` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ fontWeight: '800', fontSize: '13px', color: '#374151', textTransform: 'uppercase' }}>
          MSBE Kockázati Pontszám
        </div>
        <Badge color={trigger.color} size="12px">{trigger.label}</Badge>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '11px', color: '#6b7280' }}>MSBE Score (0–100)</span>
        <span style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '20px', color: trigger.color }}>{score}</span>
      </div>
      <div style={{ height: '14px', background: '#f3f4f6', borderRadius: '7px', overflow: 'hidden', marginBottom: '6px' }}>
        <div style={{ width: `${score}%`, height: '100%', background: trigger.color, borderRadius: '7px', transition: 'width 0.25s' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#9ca3af', marginBottom: '10px' }}>
        <span>0 — Nincs MSBE</span>
        <span>35 — Elővigy.</span>
        <span>65 — Megerős.</span>
        <span>100 — Kritikus</span>
      </div>

      <div style={{ fontSize: '11px', color: trigger.color, fontWeight: '600', padding: '7px 10px', background: 'white', borderRadius: '6px' }}>
        🔔 CEWS trigger: <strong>{trigger.cews_trigger.toUpperCase()}</strong> · Intézkedés: {trigger.action}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. Category Quick-Load
// ---------------------------------------------------------------------------

function CategorySelector({ onLoad }) {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', marginBottom: '18px' }}>
      <div style={{ background: '#f3f4f6', padding: '8px 14px', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#374151' }}>
        📂 Elsődleges MSBE Kategóriák — Gyors betöltés
      </div>
      <div style={{ padding: '10px 14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
        {MSBE_CATEGORIES.map((cat) => (
          <button key={cat.id} onClick={() => onLoad(cat)}
            style={{
              textAlign: 'left', padding: '10px 12px', border: `2px solid ${cat.color}40`,
              borderRadius: '8px', background: `${cat.color}08`, cursor: 'pointer',
              transition: 'border-color 0.15s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
              <Badge color={cat.color} size="9px">{cat.abbrev}</Badge>
              <span style={{ fontWeight: '700', fontSize: '11px', color: '#374151' }}>{cat.label.split(' ')[0]}</span>
              <Badge color={cat.risk_level === 'CRITICAL' ? '#dc2626' : '#ea580c'} size="9px">
                {cat.risk_level}
              </Badge>
            </div>
            <div style={{ fontSize: '10px', color: '#6b7280', lineHeight: '1.4' }}>{cat.description.slice(0, 80)}…</div>
            <div style={{ fontSize: '9px', color: '#9ca3af', marginTop: '3px' }}>t½: {cat.default_halflife} év · BAF: {cat.default_baf} · Ref: {cat.ref_module}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. Related Modules
// ---------------------------------------------------------------------------

function RelatedModules() {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
      <div style={{ background: '#f3f4f6', padding: '8px 14px', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#374151' }}>
        🔗 Kapcsolódó Modulok
      </div>
      <div style={{ padding: '10px 14px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {Object.entries(MSBE_RELATED_MODULES).map(([code, desc]) => (
          <div key={code} style={{ fontSize: '11px', padding: '4px 10px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
            <strong>{code}</strong> — {desc}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main MSBE600Panel
// ---------------------------------------------------------------------------

const DEFAULT_PARAMS = {
  halflife: 92,
  eco_cycle: 25,
  baf: 2.8,
  metabolite_more_toxic: false,
  no_natural_analogue: true,
  evidence_level: 'field',
};

export default function MSBE600Panel() {
  const [params, setParams] = useState(DEFAULT_PARAMS);

  const set = (key, val) => setParams((p) => ({ ...p, [key]: val }));

  const { criteria_met, criteria_details } = useMemo(
    () => classifyMSBE(params),
    [params]
  );

  const { msbe_score, sbe_level } = useMemo(
    () => calculateMSBEScore(params),
    [params]
  );

  const loadCategory = (cat) => {
    setParams({
      halflife: cat.default_halflife,
      eco_cycle: 25,
      baf: cat.default_baf,
      metabolite_more_toxic: cat.default_metabolite_tox,
      no_natural_analogue: cat.default_novelty,
      evidence_level: 'confirmed',
    });
  };

  const currentEvidence = EVIDENCE_LEVELS.find((e) => e.id === params.evidence_level) ?? EVIDENCE_LEVELS[0];

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', marginTop: '32px' }}>
      {/* Header */}
      <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '24px', marginBottom: '18px', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: '10px', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '800', color: '#111827' }}>
            🔬 EFU 600.2 — Molekuláris Rendszerhatár-Események (MSBE)
          </h2>
          <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
            Molecular System Boundary Events · Osztályozás: C1–C4 · SBE Trigger: 0–3 · CEWS-KOMPATIBILIS
          </p>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <Badge color="#0891b2">600.2</Badge>
          <Badge color="#7c3aed">CFI-B</Badge>
          <Badge color="#dc2626">4 Kritérium</Badge>
          <Badge color="#ea580c">SBE-KOMPATIBILIS</Badge>
        </div>
      </div>

      {/* Definition box */}
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px 14px', marginBottom: '18px', fontSize: '12px', color: '#1e40af', lineHeight: '1.7' }}>
        <strong>Definíció (§600.2.1):</strong> MSBE minden olyan szintetikus vagy technogén molekula bioszférába juttatása, amely a természetes biogeokémiai lebontási kapacitást tartósan meghaladja, és amelynek következtében irreverzibilis molekuláris akkumuláció következik be. Az MSBE az SBE kritériumrendszer (600.0) első feltételét aktiválja.
      </div>

      {/* Category quick-load */}
      <CategorySelector onLoad={loadCategory} />

      {/* Substance Input */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', marginBottom: '18px' }}>
        <div style={{ background: '#f3f4f6', padding: '8px 14px', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#374151' }}>
          ⚗️ Vizsgált Anyag Paraméterei
        </div>
        <div style={{ padding: '14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
          <Field label="Biológiai felezési idő t½ (év)" hint="C1 kritérium — ökoszisztéma ciklussal összehasonlítva">
            <input type="number" min="0" step="0.1" value={params.halflife}
              onChange={(e) => set('halflife', Number(e.target.value))}
              style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} />
          </Field>
          <Field label="Ökoszisztéma regenerációs ciklus (év)" hint="C1 küszöb referencia — alapértelmezett: 25 év">
            <input type="number" min="1" step="1" value={params.eco_cycle}
              onChange={(e) => set('eco_cycle', Number(e.target.value))}
              style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} />
          </Field>
          <Field label="Bioakkumulációs faktor (BAF)" hint="C2 kritérium — küszöb: > 1">
            <input type="number" min="0" step="0.01" value={params.baf}
              onChange={(e) => set('baf', Number(e.target.value))}
              style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} />
          </Field>

          <Field label="Bizonyítéki szint" hint="Befolyásolja az MSBE pontszámot (§600.2.5)">
            <select value={params.evidence_level} onChange={(e) => set('evidence_level', e.target.value)}
              style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}>
              {EVIDENCE_LEVELS.map((ev) => (
                <option key={ev.id} value={ev.id}>{ev.label}</option>
              ))}
            </select>
            <div style={{ fontSize: '10px', color: currentEvidence.color, marginTop: '3px', fontWeight: '600' }}>
              {currentEvidence.precautionary ? '⚠ Elővigyázatossági besorolás lehetséges' : '✔ Közvetlen mérési adat'} — {currentEvidence.note}
            </div>
          </Field>

          <Field label="C3: Lebontási melléktermék toxikusabb?" hint="Ha igen, MSBE kritérium 3 aktiválódik">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '7px 8px', border: `1px solid ${params.metabolite_more_toxic ? '#ea580c' : '#d1d5db'}`, borderRadius: '6px', background: params.metabolite_more_toxic ? '#fff7ed' : 'white' }}>
              <input type="checkbox" checked={params.metabolite_more_toxic}
                onChange={(e) => set('metabolite_more_toxic', e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#ea580c' }} />
              <span style={{ fontSize: '12px', fontWeight: params.metabolite_more_toxic ? '700' : '400', color: params.metabolite_more_toxic ? '#ea580c' : '#374151' }}>
                {params.metabolite_more_toxic ? 'IGEN — toxikusabb melléktermék' : 'Nem'}
              </span>
            </label>
          </Field>

          <Field label="C4: Nincs természetes analóg a bioszférában?" hint="Ha igen, MSBE kritérium 4 aktiválódik">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '7px 8px', border: `1px solid ${params.no_natural_analogue ? '#be185d' : '#d1d5db'}`, borderRadius: '6px', background: params.no_natural_analogue ? '#fdf2f8' : 'white' }}>
              <input type="checkbox" checked={params.no_natural_analogue}
                onChange={(e) => set('no_natural_analogue', e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#be185d' }} />
              <span style={{ fontSize: '12px', fontWeight: params.no_natural_analogue ? '700' : '400', color: params.no_natural_analogue ? '#be185d' : '#374151' }}>
                {params.no_natural_analogue ? 'IGEN — nincs természetes analóg' : 'Van természetes analóg'}
              </span>
            </label>
          </Field>
        </div>
      </div>

      {/* Criteria matrix */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', marginBottom: '18px' }}>
        <div style={{ background: '#f3f4f6', padding: '8px 14px', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#374151' }}>
          📋 C1–C4 Kritérium Ellenőrzés
          {criteria_met.length > 0 && (
            <span style={{ marginLeft: '10px', background: '#dc2626', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '10px' }}>
              {criteria_met.length} / 4 AKTIVÁLVA
            </span>
          )}
        </div>
        <div style={{ padding: '12px 14px' }}>
          <CriteriaMatrix details={criteria_details} />
        </div>
        {criteria_met.length > 0 && (
          <div style={{ padding: '8px 14px', borderTop: '1px solid #f3f4f6', background: '#fef2f2', fontSize: '11px', color: '#dc2626', fontWeight: '700' }}>
            ✅ MSBE MINŐSÍTÉS: Az anyag legalább egy kritériumot teljesít — MSBE kategóriába sorolandó.
          </div>
        )}
        {criteria_met.length === 0 && (
          <div style={{ padding: '8px 14px', borderTop: '1px solid #f3f4f6', background: '#f0fdf4', fontSize: '11px', color: '#16a34a', fontWeight: '700' }}>
            ℹ Jelenleg egyik kritérium sem teljesül. Bizonyítéki szint: {currentEvidence.precautionary ? 'elővigyázatossági besorolás lehetséges.' : 'mérési adatok szükségesek.'}
          </div>
        )}
      </div>

      {/* Score gauge */}
      <div style={{ marginBottom: '18px' }}>
        <MSBEScoreGauge score={msbe_score} sbe_level={sbe_level} />
      </div>

      {/* Indicator reference */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', marginBottom: '18px' }}>
        <div style={{ background: '#f3f4f6', padding: '8px 14px', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#374151' }}>
          📊 Mérési Indikátorok (§600.2.7)
        </div>
        <div style={{ padding: '10px 14px' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Indikátor', 'Egység', 'Küszöb', 'Kapcsolódó kritérium', 'Mérési módszerek'].map((h) => (
                    <th key={h} style={{ padding: '6px 10px', textAlign: 'left', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', fontSize: '10px', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MSBE_INDICATORS.map((ind) => (
                  <tr key={ind.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '7px 10px', fontWeight: '600', color: '#374151' }}>{ind.label}</td>
                    <td style={{ padding: '7px 10px', fontFamily: 'monospace', color: '#6b7280' }}>{ind.unit}</td>
                    <td style={{ padding: '7px 10px', fontFamily: 'monospace', color: '#374151' }}>
                      {ind.threshold !== null ? `> ${ind.threshold}` : 'bináris (igen/nem)'}
                    </td>
                    <td style={{ padding: '7px 10px' }}>
                      {ind.links_criteria.map((c) => {
                        const cdef = MSBE_CRITERIA.find((x) => x.id === c);
                        return <Badge key={c} color={cdef?.color ?? '#6b7280'} size="9px">{c}</Badge>;
                      })}
                    </td>
                    <td style={{ padding: '7px 10px', color: '#6b7280', fontSize: '10px' }}>
                      {ind.measurement_methods.join(' · ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Related modules */}
      <div style={{ marginBottom: '8px' }}>
        <RelatedModules />
      </div>

      <p style={{ fontSize: '10px', color: '#9ca3af', marginTop: '8px', lineHeight: '1.6' }}>
        EFU 600.2 MSBE · Molekuláris Rendszerhatár-Események · C1–C4 osztályozás · SBE Trigger 0–3 ·
        600.51 Plastic Metabolism · 600.52 PFAS & Forever Chemicals · CEWS-KOMPATIBILIS ·
        Szerző: Simor István · ORCID: 0009-0002-6599-3480
      </p>
    </div>
  );
}
