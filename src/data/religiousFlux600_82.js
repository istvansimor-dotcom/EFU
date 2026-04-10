/**
 * religiousFlux600_82.js — EFU 600.82 Vallási Identitás Antiflux v1.0
 *
 * Sorozat: 600 – Antifluxus és Rendszerszintű Patológiák
 * Mechanizmus: M3 IDENTITY (PRIMARY) | M11 BIO-COG (SECONDARY)
 * Megjegyzés: EFU nem értékítéletet alkot vallási rendszerekről – kizárólag biofizikai fluxus-hatásokat mér
 * Státusz: FC-APPROVED DRAFT
 * Verzió: 1.0
 * Dátum: 2026-04-01
 * DOI: 10.5281/zenodo.18888082
 */

// ---------------------------------------------------------------------------
// Modul meta
// ---------------------------------------------------------------------------

export const MODULE_META_82 = {
  id: '600.82',
  version: '1.0',
  title: 'Vallási Identitás Antiflux',
  titleEn: 'Religious Identity Antiflux',
  subtitle: 'Biofizikai fluxusveszteség vallási/ideológiai identitásstruktúrákban – EFU nem moralizál, mér',
  series: '600 – Antifluxus és Rendszerszintű Patológiák',
  mechanism_primary: 'M3 IDENTITY',
  mechanism_secondary: 'M11 BIO-COG',
  tier: 2,
  priority: 6,
  status: 'FC-APPROVED DRAFT',
  date: '2026-04-01',
  formula: 'RIA = (cogn_lock×0.35 + time_distort×0.25 + rcr×0.25 + sac_infra×0.15 − flux_amp×0.20) × S × (1 + Phi/1000)',
  nexus: ['M3', 'M4', 'M11', '104.87', '600.78', '600.79', '600.80', '600.81'],
  twin_module: '700.14',
  doi: '10.5281/zenodo.18888082',
  note: 'EFU nem értékítéletet alkot vallási rendszerekről – kizárólag biofizikai fluxus-hatásokat mér',
};

// ---------------------------------------------------------------------------
// Változók / csúszkák
// ---------------------------------------------------------------------------

export const RIA_VARIABLES = [
  {
    id: 'cogn_lock',
    label: 'Kognitív zárlat (M3↔M11↔M4)',
    description: 'Kognitív zárlat intenzitása – vallási/ideológiai dogma által indukált gondolkodásbéli blokk',
    default: 0.5,
    min: 0,
    max: 1,
    step: 0.01,
    threshold: 0.6,
    weight: 0.35,
    color: '#7c3aed',
    positive: false,
  },
  {
    id: 'time_distort',
    label: 'Időhorizont-torzítás (túlvilági MROI)',
    description: 'Időhorizont-torzítás foka – túlvilági MROI priorizálása a valós fluxus rovására',
    default: 0.45,
    min: 0,
    max: 1,
    step: 0.01,
    threshold: 0.5,
    weight: 0.25,
    color: '#d97706',
    positive: false,
  },
  {
    id: 'rcr',
    label: 'Erőforrás-zárlat arány (RCR)',
    description: 'Csoporthatár merevsége – Resource Capture Ratio (0=nyitott, 1=teljes zárlat)',
    default: 0.50,
    min: 0,
    max: 1,
    step: 0.01,
    threshold: 0.55,
    weight: 0.25,
    color: '#ea580c',
    positive: false,
  },
  {
    id: 'sac_infra',
    label: 'Szakrális infrastruktúra-intenzitás',
    description: 'Szakrális infrastruktúrafluxus – nem produktív erőforrás-befektetés aránya',
    default: 0.40,
    min: 0,
    max: 1,
    step: 0.01,
    threshold: 0.6,
    weight: 0.15,
    color: '#0369a1',
    positive: false,
  },
  {
    id: 'flux_amp',
    label: 'Fluxus-erősítő potenciál (η_W+)',
    description: 'Pozitív fluxus-erősítő hatás – magas érték csökkenti az antiflux indexet',
    default: 0.35,
    min: 0,
    max: 1,
    step: 0.01,
    threshold: 0.0,
    weight: 0.20,
    color: '#16a34a',
    positive: true,
    note: 'Magas érték = pozitív hatás (csökkenti RIA-t)',
  },
];

export const RIA_SYNERGY = {
  id: 'S',
  label: 'S – Szinergia multiplikátor',
  default: 1.0,
  min: 0.5,
  max: 2,
  step: 0.05,
  color: '#374151',
};

export const RIA_PHI = {
  id: 'Phi',
  label: 'Phi – CEWS entrópia-amplifikátor',
  default: 150,
  min: 0,
  max: 1000,
  step: 10,
  color: '#9a3412',
  isPhi: true,
};

// ---------------------------------------------------------------------------
// 5 Zóna
// ---------------------------------------------------------------------------

export const RIA_ZONES = [
  {
    id: 'GREEN',
    label: '🟢 Fluxus-erősítő',
    status: 'AMPLIFIER',
    condition: 'RIA < 0.1',
    action: 'Pozitív regeneratív hatás (→ 700.14)',
    color: '#16a34a',
    bg: '#f0fdf4',
    max: 0.1,
  },
  {
    id: 'YELLOW',
    label: '🟡 Semleges',
    status: 'NEUTRAL',
    condition: '0.1 – 0.3',
    action: 'Mérhető antiflux, nem kritikus',
    color: '#ca8a04',
    bg: '#fefce8',
    min: 0.1,
    max: 0.3,
  },
  {
    id: 'ORANGE',
    label: '🟠 Antiflux',
    status: 'ANTIFLUX',
    condition: '0.3 – 0.6',
    action: 'M3↔M11↔M4 zárt hurok aktív',
    color: '#ea580c',
    bg: '#fff7ed',
    min: 0.3,
    max: 0.6,
  },
  {
    id: 'RED',
    label: '🔴 Kritikus antiflux',
    status: 'CRITICAL',
    condition: '0.6 – 1.0',
    action: 'Kognitív blokk + erőforrás-zárlat',
    color: '#dc2626',
    bg: '#fef2f2',
    min: 0.6,
    max: 1.0,
  },
  {
    id: 'CRITICAL',
    label: '⚫ Rendszerszintű',
    status: 'SYSTEMIC',
    condition: 'RIA ≥ 1.0',
    action: 'CEWS M3/M11 teljes zárlat',
    color: '#111827',
    bg: '#f9fafb',
    min: 1.0,
  },
];

// ---------------------------------------------------------------------------
// 4 Trigger
// ---------------------------------------------------------------------------

export const RIA_TRIGGERS = [
  {
    id: 'cognitive_loop',
    label: 'COGNITIVE_LOOP_M3_M11_M4 aktív',
    condition: 'cogn_lock > 0.6 ÉS rcr > 0.5',
    action: 'M3↔M11↔M4 zárt kognitív hurok azonosítva – intervenciós audit',
    level: 'RED',
    color: '#dc2626',
    positive: false,
  },
  {
    id: 'mroi_distortion',
    label: 'MROI_DISTORTION – MROI_tényleges < 0',
    condition: 'time_distort > 0.6',
    action: 'MROI-torzítás – túlvilági befektetési ráta kiigazítása szükséges',
    level: 'ORANGE',
    color: '#ea580c',
    positive: false,
  },
  {
    id: 'flux_amplifier',
    label: 'FLUX_AMPLIFIER – 700.14 aktiválható',
    condition: 'flux_amp > 0.6',
    action: '700.14 Pozitív spirituális fluxus modul aktiválható',
    level: 'GREEN',
    color: '#16a34a',
    positive: true,
  },
  {
    id: 'system_entropy',
    label: 'SYSTEM_ENTROPY – CEWS kritikus szint',
    condition: 'RIA ≥ 1.0',
    action: 'CEWS M3/M11 teljes rendszerentrópia – azonnali audit',
    level: 'CRITICAL',
    color: '#111827',
    positive: false,
  },
];

// ---------------------------------------------------------------------------
// CEWS tengelyek
// ---------------------------------------------------------------------------

export const CEWS_AXES = [
  { axis: 'M3 IDENTITY', impact: 'Közvetlen primer hatás', level: 'KRITIKUS', color: '#dc2626' },
  { axis: 'M4 COGNITIVE', impact: 'Zárt hurok', level: 'MAGAS', color: '#ea580c' },
  { axis: 'M11 BIO-COG', impact: 'Plaszticitás-blokk', level: 'MAGAS', color: '#ea580c' },
  { axis: 'M8 TIME', impact: 'Időhorizont-torzítás', level: 'KÖZEPES', color: '#ca8a04' },
  { axis: 'M2 MATERIAL', impact: 'Szakrális infrastruktúrafluxus', level: 'KÖZEPES', color: '#ca8a04' },
];

// ---------------------------------------------------------------------------
// Pozitív referenciák
// ---------------------------------------------------------------------------

export const POSITIVE_REFERENCES = [
  {
    title: 'Buddhista anyag-szerződtetés',
    detail: 'η(W) ↑, MROI ↑, σ_sys ↓',
    description: 'Anyag- és energiatakarékos életvitel – rendszer-entrópia csökken',
  },
  {
    title: 'Ferenc-rendi körgazdaság',
    detail: 'MROI_körgazdaság > 1.0',
    description: 'Körkörös gazdasági modell – valódi EFU-pozitív fluxus',
  },
];
