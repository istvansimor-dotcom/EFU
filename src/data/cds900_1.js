/**
 * cds900_1.js — EFU 900.1 CDS (Canonical Data Structure) — Integrációs séma és mock adatok
 *
 * Sorozat: 900 – Rendszerintegrációs Modulok
 * Altípus: CDS – Canonical Data Structure
 * Kapcsolódó modulok: 600.56 (Atrocitás Potenciál), 600.40-42 (Narratíva), CEWS
 * Státusz: SPRINT-1 / MOCK
 * Verzió: 1.0 DRAFT
 *
 * Ez a fájl tartalmazza:
 *  – A CDS 900.1 rendszer belső adatmodelljeit (mezőleírások, típusok, validációs határok)
 *  – Mock mintaadatokat fejlesztési és tesztelési célokra
 *  – A valós API integráció előkészítésekor használandó sémát
 */

// ---------------------------------------------------------------------------
// Modul meta
// ---------------------------------------------------------------------------

export const CDS_MODULE_META = {
  id: '900.1',
  name: 'Canonical Data Structure',
  shortName: 'CDS',
  version: '1.0 DRAFT',
  status: 'SPRINT-1 / MOCK',
  date: '2026-04-10',
  related_modules: ['600.56', '600.40-42', 'CEWS'],
  description:
    'A CDS rendszer a 600.56 Atrocitás Potenciál és más EFU modulok számára biztosítja a ' +
    'Civilizációs Integritás Index (CII), Valóságkohézió Index (VKI) és CFI összesített ' +
    'értékeket, amelyek az elsődleges triggervariáblók és az immunválasz aktivátorai.',
};

// ---------------------------------------------------------------------------
// Mezőséma definíciók (Field Schema)
// A valós CDS API-ból várható JSON struktúrát tükrözik.
// ---------------------------------------------------------------------------

/**
 * CDS_FIELD_SCHEMA
 * A 900.1 CDS rendszer által közölt mező-leírások.
 * Minden mező tartalmazza: típus, mértékegység, érvényes tartomány, leírás.
 *
 * @type {Record<string, CdsFieldDef>}
 *
 * @typedef {Object} CdsFieldDef
 * @property {string}  type        - JS típus ('number' | 'string' | 'boolean')
 * @property {string}  unit        - Mértékegység (pl. 'index [0-1]')
 * @property {number}  [min]       - Érvényes minimumérték
 * @property {number}  [max]       - Érvényes maximumérték
 * @property {string}  label       - Magyar megnevezés
 * @property {string}  labelEn     - Angol megnevezés
 * @property {string}  description - Rövid leírás
 * @property {boolean} required    - Kötelező-e az EFU számításhoz
 */
export const CDS_FIELD_SCHEMA = {
  // -- Primer indexek (600.56 CDS kötés) --
  CII: {
    type: 'number',
    unit: 'index [0–1]',
    min: 0,
    max: 1,
    label: 'Civilizációs Integritás Index',
    labelEn: 'Civilizational Integrity Index',
    description:
      'Az intézményi, normatív és strukturális koherencia összesített mutatója. ' +
      '1 = teljes integritás, 0 = teljes összeomlás.',
    required: true,
  },
  VKI: {
    type: 'number',
    unit: 'index [0–1]',
    min: 0,
    max: 1,
    label: 'Valóságkohézió Index',
    labelEn: 'Reality Cohesion Index',
    description:
      'A közös valóságértelmezés egységességét mérő index. ' +
      'Alacsony érték = tömeges narratívafragmentáció (600.40-42 M4 input).',
    required: true,
  },
  CFI_total: {
    type: 'number',
    unit: 'EFU-egység',
    min: 0,
    max: 3000,
    label: 'CFI összesített (Civilizációs Fluxus Index)',
    labelEn: 'Civilizational Flux Index – Total',
    description:
      'Az összes civilizációs stressz-forrás aggregált értéke. ' +
      'Forrása: CFI-A (600.56) + CFI-B (600.52) részindexek.',
    required: true,
  },

  // -- Másodrendű mutatók --
  RCI: {
    type: 'number',
    unit: 'index [0–1]',
    min: 0,
    max: 1,
    label: 'Reziliencia-Kapacitás Index',
    labelEn: 'Resilience Capacity Index',
    description: 'A rendszer öngyógyító és alkalmazkodóképességének mértéke.',
    required: false,
  },
  SFI: {
    type: 'number',
    unit: 'EFU-egység',
    min: 0,
    max: 1000,
    label: 'Szociális Fluxus Index',
    labelEn: 'Social Flux Index',
    description: 'A társadalmi kohézió változásának aggregált mértékszáma.',
    required: false,
  },

  // -- Metaadatok --
  timestamp: {
    type: 'string',
    unit: 'ISO 8601',
    label: 'Időbélyeg',
    labelEn: 'Timestamp',
    description: 'A CDS adatcsomag keletkezési időpontja UTC-ben.',
    required: true,
  },
  source_system: {
    type: 'string',
    unit: '',
    label: 'Forrásrendszer',
    labelEn: 'Source System',
    description: 'A CDS adatot generáló alrendszer azonosítója.',
    required: false,
  },
  data_quality: {
    type: 'string',
    unit: 'enum',
    label: 'Adatminőség',
    labelEn: 'Data Quality',
    description: 'Az adatcsomag minőségi besorolása: "HIGH" | "MEDIUM" | "LOW" | "ESTIMATED".',
    required: false,
  },
};

// ---------------------------------------------------------------------------
// CDS rekord séma (teljes API válasz struktúra)
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} CdsRecord
 * @property {string}  record_id    - Egyedi azonosító (UUID)
 * @property {string}  timestamp    - ISO 8601 időbélyeg
 * @property {string}  source_system - Forrásrendszer azonosítója
 * @property {string}  data_quality  - Adatminőség besorolás
 * @property {CdsPrimaryIndices} primary_indices  - Primer indexek
 * @property {CdsSecondaryIndices} [secondary_indices] - Másodrendű mutatók
 * @property {CdsMetadata} metadata - Rekord metaadatok
 */

/**
 * @typedef {Object} CdsPrimaryIndices
 * @property {number} CII       - Civilizációs Integritás Index [0–1]
 * @property {number} VKI       - Valóságkohézió Index [0–1]
 * @property {number} CFI_total - CFI összesített [0–3000]
 */

/**
 * @typedef {Object} CdsSecondaryIndices
 * @property {number} [RCI] - Reziliencia-Kapacitás Index [0–1]
 * @property {number} [SFI] - Szociális Fluxus Index [0–1000]
 */

/**
 * @typedef {Object} CdsMetadata
 * @property {string} api_version - CDS API verzió
 * @property {string} schema      - Séma azonosító
 * @property {number} ttl_seconds - Adat érvényességi ideje másodpercben
 */

// ---------------------------------------------------------------------------
// Mock mintaadatok (valós API-t szimulálnak)
// ---------------------------------------------------------------------------

/** @type {CdsPrimaryIndices} */
export const CDS_MOCK_STABLE = {
  CII: 0.78,
  VKI: 0.72,
  CFI_total: 520,
};

/** @type {CdsPrimaryIndices} */
export const CDS_MOCK_WARNING = {
  CII: 0.55,
  VKI: 0.48,
  CFI_total: 1050,
};

/** @type {CdsPrimaryIndices} */
export const CDS_MOCK_CRITICAL = {
  CII: 0.28,
  VKI: 0.22,
  CFI_total: 2340,
};

/**
 * Teljes mock CDS rekordok (ahogy az API visszaadná)
 * @type {CdsRecord[]}
 */
export const CDS_MOCK_RECORDS = [
  {
    record_id: 'cds-mock-001-stable',
    timestamp: '2026-04-10T18:00:00Z',
    source_system: 'EFU-MOCK-v1',
    data_quality: 'HIGH',
    primary_indices: { ...CDS_MOCK_STABLE },
    secondary_indices: { RCI: 0.81, SFI: 210 },
    metadata: { api_version: '1.0', schema: 'CDS-900.1', ttl_seconds: 300 },
  },
  {
    record_id: 'cds-mock-002-warning',
    timestamp: '2026-04-10T12:00:00Z',
    source_system: 'EFU-MOCK-v1',
    data_quality: 'MEDIUM',
    primary_indices: { ...CDS_MOCK_WARNING },
    secondary_indices: { RCI: 0.52, SFI: 480 },
    metadata: { api_version: '1.0', schema: 'CDS-900.1', ttl_seconds: 300 },
  },
  {
    record_id: 'cds-mock-003-critical',
    timestamp: '2026-04-10T06:00:00Z',
    source_system: 'EFU-MOCK-v1',
    data_quality: 'LOW',
    primary_indices: { ...CDS_MOCK_CRITICAL },
    secondary_indices: { RCI: 0.19, SFI: 870 },
    metadata: { api_version: '1.0', schema: 'CDS-900.1', ttl_seconds: 300 },
  },
];

// ---------------------------------------------------------------------------
// Validációs segédfüggvény
// ---------------------------------------------------------------------------

/**
 * Ellenőrzi, hogy egy CDS primer index objektum érvényes-e.
 * @param {CdsPrimaryIndices} indices
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateCDSIndices(indices) {
  const errors = [];
  if (indices == null || typeof indices !== 'object') {
    return { valid: false, errors: ['indices objektum hiányzik'] };
  }

  const required = ['CII', 'VKI', 'CFI_total'];
  for (const field of required) {
    if (indices[field] == null) {
      errors.push(`Hiányzó kötelező mező: ${field}`);
      continue;
    }
    const def = CDS_FIELD_SCHEMA[field];
    const val = indices[field];
    if (typeof val !== 'number' || isNaN(val)) {
      errors.push(`${field}: szám típus elvárt, kapott: ${typeof val}`);
    } else {
      if (def.min != null && val < def.min) errors.push(`${field}: ${val} < minimum ${def.min}`);
      if (def.max != null && val > def.max) errors.push(`${field}: ${val} > maximum ${def.max}`);
    }
  }

  return { valid: errors.length === 0, errors };
}
