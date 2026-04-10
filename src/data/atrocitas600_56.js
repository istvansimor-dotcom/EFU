/**
 * atrocitas600_56.js — EFU 600.56 Atrocitás Potenciál (A-érték) Modell v1.2
 *
 * Sorozat: 600 – Antifluxus és Rendszerszintű Patológiák
 * Altípus: CFI-A (Systemic Collapse Trigger)
 * Kapcsolódó modulok: 900.1 (CDS), 900.2 (CDP), 650.0 (A-Modell), 500.4 (Reziliencia)
 * Státusz: AKTÍV / PILOT-READY
 * Dátum: 2026-03-28
 */

// ---------------------------------------------------------------------------
// Module meta
// ---------------------------------------------------------------------------

export const MODULE_META_56 = {
  id: '600.56',
  version: '1.2',
  title: 'Atrocitás Potenciál (A-érték) Modell',
  subtitle: 'Systemic Collapse Trigger',
  series: '600 – Antifluxus és Rendszerszintű Patológiák',
  subtype: 'CFI-A',
  status: 'AKTÍV / PILOT-READY',
  date: '2026-03-28',
  related_modules: ['900.1 (CDS)', '900.2 (CDP)', '650.0 (A-Modell)', '500.4 (Reziliencia)'],
  formula: 'A = B × P × S × E × I × (1/D) × T × Φ(EFU)',
  dynamic_formula: 'A_dynamic = A × (1 + α × dS/dt + β × dP/dt)',
};

// ---------------------------------------------------------------------------
// Variable definitions
// ---------------------------------------------------------------------------

/**
 * The 8 input variables of the A-model.
 * Each has: id, label, labelEn, description, default, min, max, step
 */
export const A_VARIABLES = [
  {
    id: 'B',
    label: 'B – Biocapacity Stress',
    labelShort: 'B',
    description: 'Erőforrás-hiány (víz, energia, élelmiszer)',
    descriptionEn: 'Resource scarcity (water, energy, food)',
    default: 1.2,
    min: 0,
    max: 2,
    step: 0.01,
    color: '#15803d',
  },
  {
    id: 'P',
    label: 'P – Polarization',
    labelShort: 'P',
    description: 'Narratív és társadalmi fragmentáció (VKI input)',
    descriptionEn: 'Narrative and social fragmentation (VKI input)',
    default: 1.4,
    min: 0,
    max: 2,
    step: 0.01,
    color: '#b91c1c',
  },
  {
    id: 'S',
    label: 'S – Systemic Parasitism',
    labelShort: 'S',
    description: '600-as modulok aggregált hatása',
    descriptionEn: 'Aggregated effect of 600-series modules',
    default: 1.6,
    min: 0,
    max: 2,
    step: 0.01,
    color: '#7c3aed',
  },
  {
    id: 'E',
    label: 'E – Economic Inequality',
    labelShort: 'E',
    description: 'Gazdasági aszimmetria (Gini + hozzáférés)',
    descriptionEn: 'Economic asymmetry (Gini + access)',
    default: 1.3,
    min: 0,
    max: 2,
    step: 0.01,
    color: '#b45309',
  },
  {
    id: 'I',
    label: 'I – Institutional Decay',
    labelShort: 'I',
    description: 'Intézményi bizalom és működési integritás',
    descriptionEn: 'Institutional trust and operational integrity',
    default: 1.5,
    min: 0,
    max: 2,
    step: 0.01,
    color: '#0369a1',
  },
  {
    id: 'D',
    label: 'D – Dampening Capacity',
    labelShort: 'D',
    description: 'Pufferek, reziliencia, közösségi stabilizátorok',
    descriptionEn: 'Buffers, resilience, community stabilizers',
    default: 0.8,
    min: 0.01,
    max: 1,
    step: 0.01,
    color: '#0891b2',
    isDampening: true,
  },
  {
    id: 'T',
    label: 'T – Technological Amplification',
    labelShort: 'T',
    description: 'Fegyveres/AI hozzáférés és romboló kapacitás',
    descriptionEn: 'Armed/AI access and destructive capacity',
    default: 1.2,
    min: 0,
    max: 2,
    step: 0.01,
    color: '#be185d',
  },
  {
    id: 'Phi',
    label: 'Φ(EFU) – Human Flux Stress',
    labelShort: 'Φ',
    description: 'Egyéni létbizonytalanság, metabolikus stressz',
    descriptionEn: 'Individual existential uncertainty, metabolic stress',
    default: 1.1,
    min: 0,
    max: 2,
    step: 0.01,
    color: '#9a3412',
  },
];

// ---------------------------------------------------------------------------
// Dynamic extension parameters
// ---------------------------------------------------------------------------

export const DYNAMIC_PARAMS = {
  alpha: { default: 0.3, min: 0.2, max: 0.5, step: 0.01, label: 'α (dS/dt súly)', description: 'Parazita rendszerek növekedési rátájának kalibrációs súlya' },
  beta:  { default: 0.3, min: 0.2, max: 0.5, step: 0.01, label: 'β (dP/dt súly)', description: 'Polarizáció gyorsulásának kalibrációs súlya' },
  dS_dt: { default: 0.2, min: 0, max: 1, step: 0.01, label: 'dS/dt', description: 'Parazita rendszerek növekedési rátája (/év)' },
  dP_dt: { default: 0.25, min: 0, max: 1, step: 0.01, label: 'dP/dt', description: 'Polarizáció gyorsulása (/év)' },
};

// ---------------------------------------------------------------------------
// CDS binding defaults
// ---------------------------------------------------------------------------

export const CDS_DEFAULTS = {
  CII: { default: 0.62, min: 0, max: 1, step: 0.01, label: 'CII', description: 'Civilizációs Integritás Index' },
  VKI: { default: 0.55, min: 0, max: 1, step: 0.01, label: 'VKI', description: 'Valóságkohézió Index' },
  CFI_total: { default: 897, min: 0, max: 3000, step: 1, label: 'CFI összesített', description: 'Civilizációs Fluxus Index (összesített)' },
};

// ---------------------------------------------------------------------------
// Zone / threshold configuration
// ---------------------------------------------------------------------------

export const A_ZONES = [
  {
    id: 'GREEN',
    label: '🟢 Zöld',
    labelShort: 'ZÖLD',
    condition: 'A < 1.0',
    state: 'Stabil',
    cdsReaction: 'Monitorozás',
    color: '#16a34a',
    bg: '#f0fdf4',
    max: 1.0,
  },
  {
    id: 'YELLOW',
    label: '🟡 Sárga',
    labelShort: 'SÁRGA',
    condition: '1.0 – 1.5',
    state: 'Instabil',
    cdsReaction: 'Figyelmeztetés',
    color: '#ca8a04',
    bg: '#fefce8',
    min: 1.0,
    max: 1.5,
  },
  {
    id: 'ORANGE',
    label: '🟠 Narancs',
    labelShort: 'NARANCS',
    condition: '1.5 – 2.5',
    state: 'Pre-Atrocitás',
    cdsReaction: 'Beavatkozás (900.2)',
    color: '#ea580c',
    bg: '#fff7ed',
    min: 1.5,
    max: 2.5,
  },
  {
    id: 'RED',
    label: '🔴 Vörös',
    labelShort: 'VÖRÖS',
    condition: 'A > 2.5',
    state: 'Aktív összeomlás',
    cdsReaction: 'Kényszer allokáció (AAP)',
    color: '#dc2626',
    bg: '#fef2f2',
    min: 2.5,
  },
];

// ---------------------------------------------------------------------------
// Trigger thresholds
// ---------------------------------------------------------------------------

export const A_TRIGGERS = [
  {
    id: 'T1',
    label: 'Trigger 1',
    condition: 'A > 1.5',
    threshold: 1.5,
    action: '900.2 aktiválás (intervenciós terv)',
    level: 1,
    color: '#ea580c',
  },
  {
    id: 'T2',
    label: 'Trigger 2',
    condition: 'A > 2.5',
    threshold: 2.5,
    action: 'AAP (Allokációs kényszerpálya)',
    level: 2,
    color: '#dc2626',
  },
  {
    id: 'T3',
    label: 'Trigger 3',
    condition: 'dA/dt > 0.3/év',
    threshold: 0.3,
    action: 'Gyorsított eszkaláció',
    level: 3,
    color: '#7c3aed',
    isDerivative: true,
  },
];

// ---------------------------------------------------------------------------
// Logarithmic weights (equal by default — can be tuned)
// ---------------------------------------------------------------------------

export const LOG_WEIGHTS = {
  B: 1,
  P: 1,
  S: 1,
  E: 1,
  I: 1,
  T: 1,
  Phi: 1,
};

// ---------------------------------------------------------------------------
// Dashboard JSON example (from spec)
// ---------------------------------------------------------------------------

export const DASHBOARD_EXAMPLE = {
  module: '600.56',
  A_value: 1.95,
  A_dynamic: 2.15,
  zone: 'ORANGE',
  trend: 'increasing',
  components: { B: 1.2, P: 1.4, S: 1.6, E: 1.3, I: 1.5, D: 0.8, T: 1.2, Phi_EFU: 1.1 },
  derivatives: { dS_dt: 0.2, dP_dt: 0.25 },
  cds_binding: { CII: 0.62, VKI: 0.55, CFI_total: 897 },
  trigger: { level: 2, cdp_activation: true, aap_required: false },
};
