/**
 * mvp600_10.js — EFU 600.10 Monitoring és Verifikáció (MVP) v1.0
 *
 * Sorozat: 600 – Antifluxus és Rendszerszintű Patológiák
 * Mechanizmus: Self-verification protocol
 * 3 monitoring réteg + 5 verifikációs feltétel + 3 indikátor-kategória
 * Kapcsolódó modulok: 600.0, 600.7, 600.8, 400.1, 900.1, 205.3
 * Státusz: Kész
 * Verzió: 1.0
 * Dátum: 2026-04-10
 */

// ---------------------------------------------------------------------------
// Modul meta
// ---------------------------------------------------------------------------

export const MODULE_META_10 = {
  id: '600.10',
  version: '1.0',
  title: 'Monitoring és Verifikáció (MVP)',
  titleEn: 'Monitoring and Verification Protocol (MVP)',
  subtitle: 'Ami nem mérhető, az nem auditálható – az alapréteg önellenőrzési mechanizmusa',
  series: '600 – Antifluxus és Rendszerszintű Patológiák',
  mechanism: 'Self-verification protocol',
  status: '✓ Kész',
  date: '2026-04-10',
  formula: 'MVP = (L1_mol×0.30 + L2_eco×0.30 + L3_gov×0.25 + V_ind×0.05 + V_rep×0.05 + V_pub×0.05) × S × (1 + Phi/1000)',
  nexus: ['600.0', '600.7', '600.8', '400.1', '900.1', '205.3'],
};

// ---------------------------------------------------------------------------
// Változók / csúszkák
// ---------------------------------------------------------------------------

export const MVP_VARIABLES = [
  {
    id: 'L1_mol',
    label: 'L1 – Molekuláris/kémiai monitoring',
    description: 'Molekuláris és kémiai monitoring intenzitása (0=nincs, 1=teljes)',
    default: 0.6,
    min: 0,
    max: 1,
    step: 0.01,
    threshold: 0.3,
    weight: 0.30,
    color: '#0369a1',
    group: 'monitoring',
  },
  {
    id: 'L2_eco',
    label: 'L2 – Ciklus/ökoszisztéma monitoring',
    description: 'Ökoszisztéma-szintű ciklus monitorozás (0=nincs, 1=teljes)',
    default: 0.5,
    min: 0,
    max: 1,
    step: 0.01,
    threshold: 0.3,
    weight: 0.30,
    color: '#16a34a',
    group: 'monitoring',
  },
  {
    id: 'L3_gov',
    label: 'L3 – Governance/compliance monitoring',
    description: 'Irányítási és megfelelési monitoring (0=nincs, 1=teljes)',
    default: 0.45,
    min: 0,
    max: 1,
    step: 0.01,
    threshold: 0.4,
    weight: 0.25,
    color: '#7c3aed',
    group: 'monitoring',
  },
  {
    id: 'V_ind',
    label: 'Verifikáció: Függetlenség',
    description: 'Verifikációs folyamat függetlenségének foka (0=nincs, 1=teljes)',
    default: 0.6,
    min: 0,
    max: 1,
    step: 0.01,
    threshold: 0.4,
    weight: 0.05,
    color: '#d97706',
    group: 'verification',
  },
  {
    id: 'V_rep',
    label: 'Verifikáció: Reprodukálhatóság',
    description: 'Eredmények reprodukálhatósági szintje (0=nem reprodukálható, 1=teljes)',
    default: 0.65,
    min: 0,
    max: 1,
    step: 0.01,
    threshold: 0.5,
    weight: 0.05,
    color: '#0891b2',
    group: 'verification',
  },
  {
    id: 'V_pub',
    label: 'Verifikáció: Nyilvánosság',
    description: 'Adatok és folyamatok nyilvánosságának szintje (0=zárt, 1=teljesen nyilvános)',
    default: 0.5,
    min: 0,
    max: 1,
    step: 0.01,
    threshold: 0.3,
    weight: 0.05,
    color: '#9333ea',
    group: 'verification',
  },
];

export const MVP_SYNERGY = {
  id: 'S',
  label: 'S – Szinergia multiplikátor',
  default: 1.1,
  min: 0.5,
  max: 2,
  step: 0.05,
  color: '#374151',
};

export const MVP_PHI = {
  id: 'Phi',
  label: 'Phi – CEWS integráció',
  default: 200,
  min: 0,
  max: 1000,
  step: 10,
  color: '#9a3412',
  isPhi: true,
};

// ---------------------------------------------------------------------------
// 5 Zóna
// ---------------------------------------------------------------------------

export const MVP_ZONES = [
  {
    id: 'GREEN',
    label: '🟢 Operatív',
    status: 'WATCH',
    condition: 'MVP < 0.4',
    action: 'Folyamatos monitorozás',
    color: '#16a34a',
    bg: '#f0fdf4',
    max: 0.4,
  },
  {
    id: 'YELLOW',
    label: '🟡 Sárga',
    status: 'REVIEW',
    condition: '0.4 – 0.7',
    action: 'Felülvizsgálat szükséges',
    color: '#ca8a04',
    bg: '#fefce8',
    min: 0.4,
    max: 0.7,
  },
  {
    id: 'ORANGE',
    label: '🟠 Narancs',
    status: 'HIÁNYOS',
    condition: '0.7 – 1.0',
    action: 'SBE-Watch kockázat',
    color: '#ea580c',
    bg: '#fff7ed',
    min: 0.7,
    max: 1.0,
  },
  {
    id: 'RED',
    label: '🔴 Piros',
    status: 'SBE-WATCH',
    condition: '1.0 – 1.5',
    action: 'Automatikus SBE-Watch besorolás',
    color: '#dc2626',
    bg: '#fef2f2',
    min: 1.0,
    max: 1.5,
  },
  {
    id: 'CRITICAL',
    label: '⚫ Kritikus',
    status: 'AUDITÁLT',
    condition: 'MVP ≥ 1.5',
    action: '900.1 CDS rendszeraudit',
    color: '#111827',
    bg: '#f9fafb',
    min: 1.5,
  },
];

// ---------------------------------------------------------------------------
// 4 Trigger
// ---------------------------------------------------------------------------

export const MVP_TRIGGERS = [
  {
    id: 'data_gap',
    label: 'DATA_GAP – SBE-Watch trigger',
    condition: 'L1_mol < 0.3 VAGY L2_eco < 0.3',
    action: 'Adathiány pótlása – SBE-Watch aktiválás',
    level: 'AMBER',
    color: '#ca8a04',
  },
  {
    id: 'independence_fail',
    label: 'INDEPENDENCE_FAIL – Verifikáció megbukott',
    condition: 'V_ind < 0.4',
    action: 'Független verifikátor bevonása szükséges',
    level: 'RED',
    color: '#dc2626',
  },
  {
    id: 'cews_disconnect',
    label: 'CEWS_DISCONNECT',
    condition: 'Phi < 100 ÉS (L1_mol < 0.5 VAGY L3_gov < 0.4)',
    action: 'CEWS integráció helyreállítása',
    level: 'ORANGE',
    color: '#ea580c',
  },
  {
    id: 'system_audit',
    label: 'SYSTEM_AUDIT – 900.1 CDS',
    condition: 'MVP ≥ 1.5 VAGY (V_ind < 0.3 ÉS V_pub < 0.3)',
    action: '900.1 CDS rendszeraudit indítása',
    level: 'CRITICAL',
    color: '#111827',
  },
];

// ---------------------------------------------------------------------------
// Önverifikáció küszöbök
// ---------------------------------------------------------------------------

export const SELF_VERIFICATION_THRESHOLDS = [
  { label: 'Adatsorok naprakészsége', threshold: '≥ 80%', description: 'Minden adatsor legalább 80%-ban naprakész' },
  { label: 'Felülvizsgálati ütemterv', threshold: '≥ 90%', description: 'Felülvizsgálati ütemterv teljesítési arány' },
  { label: 'SBE-Confirmed dokumentáció', threshold: '100%', description: 'Minden SBE-Confirmed eset dokumentált' },
  { label: 'CEWS-integráció', threshold: 'Folyamatos', description: 'CEWS-integráció megszakítás nélkül aktív' },
];

// ---------------------------------------------------------------------------
// CEWS integrációs táblázat
// ---------------------------------------------------------------------------

export const CEWS_INTEGRATION_TABLE = [
  { indicator: 'Állapotindikátor', baseline: 'Alapvonal-eltérés', update: 'CEWS-frissítés' },
  { indicator: 'Nyomásindikátor', baseline: 'Küszöbátlépés', update: 'CEWS-riasztás' },
  { indicator: 'Válaszindikátor', baseline: 'Hatékonysági jelentés', update: '900.1 CDS' },
];
