/**
 * CdsDataDisplay.jsx — CDS 900.1 adatmegjelenítő segédkomponensek
 *
 * Tartalmazza:
 *  – IndexBar: egyetlen CDS index vizuális sávja értékcímkével
 *  – PrimaryIndicesTable: CII / VKI / CFI_total táblázatos megjelenítés
 *  – SecondaryIndicesTable: RCI / SFI másodlagos indexek
 *  – RecordMetaRow: rekord azonosító, időbélyeg, adatminőség
 *
 * Ezek stateless, tisztán vizuális komponensek — adatot props-ként kapnak.
 */

// ---------------------------------------------------------------------------
// Segédfüggvények
// ---------------------------------------------------------------------------

/**
 * Szín az index értéke alapján (alacsony = piros, közepes = sárga, magas = zöld).
 * @param {number} value  - 0–1 közötti normalizált érték
 * @param {boolean} [invert=false] - Ha true, magas érték = piros (pl. CFI_total, SFI)
 */
function indexColor(value, invert = false) {
  const v = invert ? 1 - value : value;
  if (v >= 0.7) return '#16a34a';
  if (v >= 0.4) return '#d97706';
  return '#dc2626';
}

/**
 * Adatminőség → szín
 * @param {'HIGH'|'MEDIUM'|'LOW'|string} quality
 */
function qualityColor(quality) {
  const map = { HIGH: '#16a34a', MEDIUM: '#d97706', LOW: '#dc2626' };
  return map[quality] ?? '#6b7280';
}

// ---------------------------------------------------------------------------
// IndexBar
// ---------------------------------------------------------------------------

/**
 * Egy CDS index értékét sáv + szöveg formájában jeleníti meg.
 *
 * @param {{ label: string, value: number, min: number, max: number, unit?: string, invert?: boolean }} props
 */
export function IndexBar({ label, value, min = 0, max = 1, unit = '', invert = false }) {
  const pct = max > min ? Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100) : 0;
  const normalized = max > min ? (value - min) / (max - min) : 0;
  const color = indexColor(normalized, invert);

  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
        <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>{label}</span>
        <span style={{ fontSize: '12px', fontWeight: '700', color }}>
          {typeof value === 'number' ? value.toFixed(3) : '—'}
          {unit ? ` ${unit}` : ''}
        </span>
      </div>
      <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: '4px',
          transition: 'width 0.4s ease',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
        <span style={{ fontSize: '10px', color: '#9ca3af' }}>{min}</span>
        <span style={{ fontSize: '10px', color: '#9ca3af' }}>{max}{unit}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PrimaryIndicesTable
// ---------------------------------------------------------------------------

/**
 * CDS primer indexek (CII, VKI, CFI_total) táblázatos megjelenítése.
 *
 * @param {{ indices: { CII: number, VKI: number, CFI_total: number } }} props
 */
export function PrimaryIndicesTable({ indices }) {
  if (!indices) return <EmptyState label="Primer indexek nem elérhetők" />;

  const rows = [
    { key: 'CII', label: 'Civilizációs Integritás Index', labelShort: 'CII', min: 0, max: 1, invert: false },
    { key: 'VKI', label: 'Valóságkohézió Index', labelShort: 'VKI', min: 0, max: 1, invert: false },
    { key: 'CFI_total', label: 'CFI Összesített', labelShort: 'CFI total', min: 0, max: 1, invert: true },
  ];

  return (
    <div>
      {rows.map((row) => (
        <IndexBar
          key={row.key}
          label={`${row.labelShort} — ${row.label}`}
          value={indices[row.key]}
          min={row.min}
          max={row.max}
          invert={row.invert}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SecondaryIndicesTable
// ---------------------------------------------------------------------------

/**
 * CDS másodlagos indexek (RCI, SFI) egyszerű kártya-nézetben.
 *
 * @param {{ indices: { RCI?: number, SFI?: number } }} props
 */
export function SecondaryIndicesTable({ indices }) {
  if (!indices) return null;

  const cards = [
    { key: 'RCI', label: 'Resilience Capacity Index', unit: '[0–1]', min: 0, max: 1, invert: false },
    { key: 'SFI', label: 'Social Fragmentation Index', unit: '[0–1000]', min: 0, max: 1000, invert: true },
  ];

  return (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
      {cards.map((card) => {
        const val = indices[card.key];
        const normalized = card.max > card.min ? (val - card.min) / (card.max - card.min) : 0;
        const color = indexColor(normalized, card.invert);
        return (
          <div key={card.key} style={{
            flex: '1 1 120px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '10px 12px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {card.key}
            </div>
            <div style={{ fontSize: '20px', fontWeight: '800', color, lineHeight: 1 }}>
              {typeof val === 'number' ? val.toFixed(2) : '—'}
            </div>
            <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '3px' }}>{card.label}</div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// RecordMetaRow
// ---------------------------------------------------------------------------

/**
 * Rekord metaadatok megjelenítése (ID, időbélyeg, minőség, forrás).
 *
 * @param {{ record: import('../data/cds900_1.js').CdsRecord }} props
 */
export function RecordMetaRow({ record }) {
  if (!record) return null;

  const dt = record.timestamp ? new Date(record.timestamp).toLocaleString('hu-HU') : '—';

  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: '10px',
      background: '#f9fafb', border: '1px solid #e5e7eb',
      borderRadius: '6px', padding: '8px 12px', fontSize: '11px',
    }}>
      <MetaChip label="Rekord ID" value={record.record_id ?? '—'} />
      <MetaChip label="Időbélyeg" value={dt} />
      <MetaChip label="Forrás" value={record.source_system ?? '—'} />
      <MetaChip
        label="Adatminőség"
        value={record.data_quality ?? '—'}
        valueColor={qualityColor(record.data_quality)}
      />
      {record.metadata?.api_version && (
        <MetaChip label="API verzió" value={record.metadata.api_version} />
      )}
    </div>
  );
}

function MetaChip({ label, value, valueColor }) {
  return (
    <div>
      <span style={{ color: '#9ca3af', marginRight: '4px' }}>{label}:</span>
      <span style={{ fontWeight: '700', color: valueColor ?? '#374151' }}>{value}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// EmptyState
// ---------------------------------------------------------------------------

function EmptyState({ label }) {
  return (
    <div style={{ padding: '16px', textAlign: 'center', color: '#9ca3af', fontSize: '12px' }}>
      {label}
    </div>
  );
}
