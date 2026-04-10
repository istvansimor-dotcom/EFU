/**
 * CewsPanel.jsx — CEWS Indicator System Panel
 *
 * Displays:
 *   1. System summary (UCAIF v3.1, 472 + 1 meta indicators)
 *   2. Hagyma (Onion) Layer visualization — 8 concentric layers
 *   3. Manus 10 new indicators — reference table with dynamic weights
 *   4. Composite index map (CII, VKI, MRI, CSI, GSI)
 *   5. Track A / Track B operational protocol
 *
 * Reference: EFU 217.2 / EFU 217.3 (UCAIF v3.1 FINAL)
 */

import {
  CEWS_LAYERS,
  CEWS_BLOCKS,
  MANUS_10_INDICATORS,
  CEWS_COMPOSITE_INDICES,
  CEWS_TRACKS,
  CEWS_TRIGGER_LEVELS,
  UCAIF_VERSION,
  TOTAL_INDICATORS,
  TOTAL_META,
  EFU_MODULE_REF,
  EFU_PROTOCOL_REF,
} from '../data/cewsIndicators.js';
import { calculateDynamicWeight, classifyTrajectoryVector, classifyCewsTrigger } from '../logic/efu-engine.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const LATENCY_LABELS = { immediate: 'Azonnali', medium: 'Közepes', long: 'Hosszú' };
const RECOVERY_LABELS = { short: 'Rövid', medium: 'Közepes', long: 'Hosszú', very_long: 'Nagyon hosszú' };
const TRAJECTORY_LABELS = { direct: 'Közvetlen', indirect: 'Közvetett', meta: 'Meta' };

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Header badge */
function Badge({ children, color }) {
  return (
    <span style={{
      display: 'inline-block',
      background: color,
      color: 'white',
      padding: '2px 8px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: '700',
      letterSpacing: '0.03em',
    }}>
      {children}
    </span>
  );
}

// ── 1. Onion Layer Visualization ──────────────────────────────────────────
function OnionDiagram() {
  // We render the layers as concentric rings, innermost = layer 1 = largest ring
  // (in a concentric view the outer visual ring = innermost conceptual layer)
  // We'll use a simple SVG with 8 rings: layer 8 (outermost concept) = outermost ring
  // but displayed with the label outside.
  // For simplicity: reversed so layer 1 is drawn as the outer ring (widest),
  // which visually fills most area, matching "core = most important" semantics.

  const SIZE = 280;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const maxR = (SIZE / 2) - 8;
  const minR = 16;
  const step = (maxR - minR) / (CEWS_LAYERS.length - 1);

  // Layer 1 (core) gets the outermost visual ring; layer 8 (trajectory) = center dot.
  const reversed = [...CEWS_LAYERS].reverse(); // index 0 = trajectory, index 7 = core

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', marginBottom: '2px' }}>
        🧅 Hagyma Metódus — Rétegstruktúra
      </div>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ display: 'block' }}>
        {reversed.map((layer, i) => {
          const r = minR + i * step;
          return (
            <circle
              key={layer.id}
              cx={cx}
              cy={cy}
              r={r}
              fill={layer.color}
              fillOpacity={0.12 + i * 0.03}
              stroke={layer.color}
              strokeWidth={i === reversed.length - 1 ? 2 : 1}
              strokeOpacity={0.6}
            />
          );
        })}
        {/* Center label: Trajectory Vector */}
        <text x={cx} y={cy - 3} textAnchor="middle" fontSize="9" fontWeight="700" fill="#374151" dominantBaseline="middle">
          XXVI
        </text>
        <text x={cx} y={cy + 8} textAnchor="middle" fontSize="7" fill="#6b7280" dominantBaseline="middle">
          TV
        </text>
      </svg>

      {/* Layer legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', maxWidth: '360px' }}>
        {CEWS_LAYERS.map((layer) => (
          <div key={layer.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: layer.color, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: '700', color: '#374151' }}>R{layer.layer}:</span>{' '}
              <span style={{ color: '#374151' }}>{layer.label.split('—')[1]?.trim()}</span>
            </div>
            <div style={{ color: '#9ca3af', minWidth: '32px', textAlign: 'right' }}>
              {layer.indicatorCount === 1 ? '1 meta' : `${layer.indicatorCount}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 2. Layer Summary Table ────────────────────────────────────────────────
function LayerSummaryTable() {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
      <div style={{ background: '#f3f4f6', padding: '8px 14px', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#374151' }}>
        📊 Réteg–Kérdés–Indikátor Összesítő
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', minWidth: '520px' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['Réteg', 'Kérdés', 'Blokk', 'Indikátor', 'Prioritás', 'W_irrev'].map((h) => (
                <th key={h} style={{ padding: '6px 10px', textAlign: 'left', fontWeight: '600', color: '#6b7280', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CEWS_LAYERS.map((layer) => (
              <tr key={layer.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                <td style={{ padding: '6px 10px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: layer.color, display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontWeight: '600', color: '#374151' }}>R{layer.layer}</span>
                  </span>
                </td>
                <td style={{ padding: '6px 10px', color: '#374151', fontStyle: 'italic' }}>
                  {layer.question}
                </td>
                <td style={{ padding: '6px 10px', color: '#6b7280', fontFamily: 'monospace', fontSize: '10px' }}>
                  {layer.blocks.join(', ')}
                </td>
                <td style={{ padding: '6px 10px', fontWeight: '700', color: layer.color }}>
                  {layer.indicatorCount === 1 ? '1 meta' : layer.indicatorCount}
                </td>
                <td style={{ padding: '6px 10px', color: '#374151', fontSize: '10px' }}>
                  {layer.priority}
                </td>
                <td style={{ padding: '6px 10px', color: '#374151', fontFamily: 'monospace', fontSize: '10px' }}>
                  {layer.w_irrev_range}
                </td>
              </tr>
            ))}
            {/* Total row */}
            <tr style={{ borderTop: '2px solid #d1d5db', background: '#f9fafb' }}>
              <td colSpan={3} style={{ padding: '6px 10px', fontWeight: '700', color: '#374151' }}>
                UCAIF v{UCAIF_VERSION} TOTAL
              </td>
              <td style={{ padding: '6px 10px', fontWeight: '800', color: '#374151' }}>
                {TOTAL_INDICATORS} + {TOTAL_META} meta
              </td>
              <td colSpan={2} style={{ padding: '6px 10px', color: '#6b7280', fontSize: '10px' }}>
                Ref: {EFU_MODULE_REF} · {EFU_PROTOCOL_REF}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── 3. Manus 10 Indicators Table ──────────────────────────────────────────
function Manus10Table() {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
      <div style={{ background: '#f3f4f6', padding: '8px 14px', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#374151' }}>
        ✨ Manus 10 Új Indikátor — UCAIF v3.0 → v3.1
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', minWidth: '700px' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['Kód', 'Indikátor', 'Modul', 'Réteg', 'W_irrev', 'Latency', 'Helyreállás', 'Kaszkád', 'Dyn. Súly'].map((h) => (
                <th key={h} style={{ padding: '6px 10px', textAlign: 'left', fontWeight: '600', color: '#6b7280', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MANUS_10_INDICATORS.map((ind) => {
              const dynW = calculateDynamicWeight(ind.metadata);
              const layer = CEWS_LAYERS.find((l) => l.layer === ind.layer);
              return (
                <tr key={ind.code} style={{ borderTop: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '6px 10px', fontFamily: 'monospace', fontWeight: '700', color: '#374151', fontSize: '10px' }}>
                    {ind.code}
                  </td>
                  <td style={{ padding: '6px 10px', color: '#374151', lineHeight: '1.3' }}>
                    <div style={{ fontWeight: '600' }}>{ind.label}</div>
                    <div style={{ color: '#9ca3af', fontSize: '10px' }}>{ind.labelEn}</div>
                  </td>
                  <td style={{ padding: '6px 10px', color: '#6b7280', fontFamily: 'monospace', fontSize: '10px', whiteSpace: 'nowrap' }}>
                    {ind.module}
                  </td>
                  <td style={{ padding: '6px 10px' }}>
                    {layer && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: layer.color, display: 'inline-block' }} />
                        <span style={{ fontSize: '10px', color: '#374151' }}>R{layer.layer}</span>
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '6px 10px', fontFamily: 'monospace', color: '#374151' }}>
                    {ind.metadata.w_irrev}
                  </td>
                  <td style={{ padding: '6px 10px', color: '#6b7280', fontSize: '10px' }}>
                    {LATENCY_LABELS[ind.metadata.latency] ?? ind.metadata.latency}
                  </td>
                  <td style={{ padding: '6px 10px', color: '#6b7280', fontSize: '10px' }}>
                    {RECOVERY_LABELS[ind.metadata.recovery_time] ?? ind.metadata.recovery_time}
                  </td>
                  <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                    {ind.metadata.cascade_flag
                      ? <span style={{ color: '#dc2626', fontWeight: '700' }}>⚠</span>
                      : <span style={{ color: '#9ca3af' }}>—</span>}
                  </td>
                  <td style={{ padding: '6px 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ flex: 1, height: '6px', background: '#f3f4f6', borderRadius: '3px', overflow: 'hidden', minWidth: '40px' }}>
                        <div style={{ width: `${dynW * 100}%`, height: '100%', background: dynW > 0.8 ? '#dc2626' : dynW > 0.6 ? '#d97706' : '#2563eb', borderRadius: '3px' }} />
                      </div>
                      <span style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '10px', color: '#374151', minWidth: '32px' }}>
                        {dynW}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ padding: '8px 14px', borderTop: '1px solid #e5e7eb', fontSize: '10px', color: '#9ca3af' }}>
        Dyn. Súly = W_irrev × Latency × Recovery × Cascade × Shadow szorzók alapján (EFU 217.2 §2)
      </div>
    </div>
  );
}

// ── 4. Composite Index Map ────────────────────────────────────────────────
function CompositeIndexMap() {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
      <div style={{ background: '#f3f4f6', padding: '8px 14px', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#374151' }}>
        🧮 Kompozit Indexek — CII · VKI · MRI · CSI · GSI
      </div>
      <div style={{ padding: '12px 14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
        {CEWS_COMPOSITE_INDICES.map((idx) => {
          const layerColors = idx.layers.map((ln) => {
            const l = CEWS_LAYERS.find((r) => r.layer === ln);
            return l ? l.color : '#9ca3af';
          });
          return (
            <div key={idx.id} style={{ border: `1px solid ${idx.color}40`, borderRadius: '6px', padding: '10px 12px', background: `${idx.color}08` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontWeight: '800', fontSize: '15px', color: idx.color }}>{idx.id}</span>
                <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                  {layerColors.map((c, i) => (
                    <span key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: c, display: 'inline-block' }} />
                  ))}
                </div>
              </div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#374151', marginBottom: '3px' }}>
                {idx.label.split('—')[1]?.trim()}
              </div>
              <div style={{ fontSize: '10px', color: '#9ca3af', lineHeight: '1.4' }}>
                {idx.desc}
              </div>
              <div style={{ marginTop: '6px', fontSize: '10px', color: '#6b7280' }}>
                Rétegek: {idx.layers.map((n) => `R${n}`).join(', ')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── 5. Track A / Track B Protocol ────────────────────────────────────────
function TrackProtocol() {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
      <div style={{ background: '#f3f4f6', padding: '8px 14px', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#374151' }}>
        ⚡ Operatív Protokoll — Track A / Track B
      </div>
      <div style={{ padding: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        {Object.values(CEWS_TRACKS).map((track) => (
          <div key={track.id} style={{ border: `1px solid ${track.color}40`, borderRadius: '6px', padding: '12px', background: `${track.color}06` }}>
            <div style={{ fontWeight: '700', fontSize: '12px', color: track.color, marginBottom: '10px' }}>
              {track.label}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {track.steps.map((step, i) => (
                <div key={step.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '7px' }}>
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '50%',
                    background: track.color, color: 'white',
                    fontSize: '9px', fontWeight: '700',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: '1px',
                  }}>
                    {i + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#374151', lineHeight: '1.3' }}>
                      {step.label}
                    </div>
                    <div style={{ fontSize: '10px', color: '#9ca3af' }}>
                      {step.labelEn}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Trigger Colour Levels */}
      <div style={{ padding: '0 14px 14px' }}>
        <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', marginBottom: '6px' }}>
          Trigger Szintek
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {CEWS_TRIGGER_LEVELS.map((level) => (
            <div key={level.id} style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              background: `${level.color}18`, border: `1px solid ${level.color}40`,
              borderRadius: '20px', padding: '3px 10px',
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: level.color }} />
              <span style={{ fontSize: '10px', fontWeight: '700', color: level.color }}>{level.label}</span>
              <span style={{ fontSize: '10px', color: '#6b7280' }}>— {level.action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 6. Metadata Schema Reference ─────────────────────────────────────────
function MetadataSchemaRef() {
  const fields = [
    { key: 'w_irrev',       icon: '🔒', label: 'W_irrev',     desc: 'Visszafordíthatósági súly (0–1)', color: '#dc2626' },
    { key: 'latency',       icon: '⏱',  label: 'Latency',     desc: 'Döntés–hatás késleltetés',       color: '#2563eb' },
    { key: 'recovery_time', icon: '🔄',  label: 'Recovery',    desc: 'Helyreállási idő',               color: '#7c3aed' },
    { key: 'cascade_flag',  icon: '🌊',  label: 'Cascade',     desc: 'Kaszkád kockázat',               color: '#ea580c' },
    { key: 'shadow_delta',  icon: '👁',  label: 'Shadow Δ',    desc: 'Rejtett fluxus korrekció',      color: '#6b7280' },
    { key: 'regenerative',  icon: '🌱',  label: 'Regenerative',desc: 'Pozitív célküszöb (0–100)',      color: '#16a34a' },
    { key: 'trajectory',    icon: '🧭',  label: 'Trajectory',  desc: 'Pályavektor hozzájárulás',      color: '#0891b2' },
  ];
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px 14px', background: '#f9fafb', marginBottom: '20px' }}>
      <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#374151', marginBottom: '10px' }}>
        📐 Dinamikus Metaadat Séma
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
        {fields.map((f) => (
          <div key={f.key} style={{ display: 'flex', alignItems: 'flex-start', gap: '7px' }}>
            <span style={{ fontSize: '14px', lineHeight: '1' }}>{f.icon}</span>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: f.color }}>{f.label}</div>
              <div style={{ fontSize: '10px', color: '#6b7280' }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main CewsPanel component
// ---------------------------------------------------------------------------

export default function CewsPanel() {
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
            🌐 CEWS — Civilizációs Korai Előrejelző Rendszer
          </h2>
          <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
            Civilization Early Warning System · UCAIF v{UCAIF_VERSION} · EFU {EFU_MODULE_REF} / {EFU_PROTOCOL_REF}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <Badge color="#374151">{TOTAL_INDICATORS} indikátor</Badge>
          <Badge color="#6b7280">+{TOTAL_META} meta</Badge>
          <Badge color="#16a34a">UCAIF v{UCAIF_VERSION}</Badge>
          <Badge color="#2563eb">{CEWS_LAYERS.length - 1} réteg + TV</Badge>
        </div>
      </div>

      {/* Version summary */}
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontSize: '12px', color: '#166534', lineHeight: '1.6' }}>
        <strong>UCAIF v3.1 FINAL összesítés:</strong>{' '}
        UCAIF v3.0 alap: 462 + 1 meta · Manus 10 új indikátor: +10 · Összesen: <strong>472 + 1 meta</strong>.{' '}
        26 modul (I–XXVI), 7 réteg + Trajectory Vector. Track A automatizált + Track B Fire Chief Protokoll.
        Ref: 217.2 UCAIF Master Reference · 217.3 CEWS Operatív Protokoll.
      </div>

      {/* Layout: onion diagram + layer table */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 320px) 1fr', gap: '20px', marginBottom: '20px', alignItems: 'start' }}>
        <OnionDiagram />
        <LayerSummaryTable />
      </div>

      {/* Metadata schema */}
      <MetadataSchemaRef />

      {/* Manus 10 new indicators */}
      <Manus10Table />

      {/* Composite indices */}
      <CompositeIndexMap />

      {/* Track A / Track B */}
      <TrackProtocol />

      {/* Footer */}
      <p style={{ fontSize: '10px', color: '#9ca3af', marginTop: '8px', lineHeight: '1.6' }}>
        EFU CEWS — UCAIF v{UCAIF_VERSION} · {TOTAL_INDICATORS} + {TOTAL_META} meta indikátor · 26 modul · 7 réteg + Trajectory Vector ·
        Ref: EFU {EFU_MODULE_REF} (UCAIF Master Reference) · EFU {EFU_PROTOCOL_REF} (CEWS Operatív Protokoll) ·
        Dinamikus Súlyozási Motor: W_irrev × Latency × Recovery × Cascade × Shadow ·
        Szerző: Simor István · ORCID: 0009-0002-6599-3480
      </p>
    </div>
  );
}
