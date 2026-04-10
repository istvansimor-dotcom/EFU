/**
 * narrativa600_40.js — EFU 600.40–42 Narratíva Degradáció Modell v1.0
 *
 * Sorozat: 600 – Antifluxus és Rendszerszintű Patológiák
 * Altípus: M4 – Narratíva Degrádáció (CEWS M4 hivatkozás)
 * Almodulok: 600.41 Kognitív Narratíva (M4.COG) | 600.42 Érzelmi Narratíva (M4.EMO)
 * Kapcsolódó modulok: CEWS M4, 700.4, 900.1 (CDS), 650.0
 * Státusz: AKTÍV / PILOT-READY
 * Verzió: 1.0 FINAL
 */

// ---------------------------------------------------------------------------
// Modul meta
// ---------------------------------------------------------------------------

export const MODULE_META_40 = {
  id: '600.40-42',
  version: '1.0 FINAL',
  title: 'Narratíva Degradáció Modell',
  subtitle: 'Kollektív narratíva antifluxus – társadalmi koherencia elvesztése',
  series: '600 – Antifluxus és Rendszerszintű Patológiák',
  subtype: 'M4 Narratíva Degrádáció',
  status: 'AKTÍV / PILOT-READY',
  date: '2026-04-10',
  related_modules: ['CEWS M4', '700.4 (Narratíva stabilizáció)', '900.1 (CDS)', '650.0'],
  formula: 'NDI = (1-N) × (C×0.15 + E×0.18 + F×0.12 + D×0.08 + T×0.07 + P×0.05) × S × (1 + Φ/1000)',
  submodules: {
    '600.41': { code: 'M4.COG', name: 'Kognitív Narratíva', formula: 'KNI = C × F × (1-R) × T' },
    '600.42': { code: 'M4.EMO', name: 'Érzelmi Narratíva',  formula: 'ENI = E × P × D × S'     },
  },
};

// ---------------------------------------------------------------------------
// Változó definíciók (10 db)
// ---------------------------------------------------------------------------

export const N_VARIABLES = [
  {
    id: 'N',
    label: 'N – Narratíva koherencia',
    labelShort: 'N',
    description: 'Tematikus egységesség (0=teljes fragmentáció, 1=koherens)',
    descriptionEn: 'Thematic coherence (0=fully fragmented, 1=coherent)',
    default: 0.75,
    min: 0.3,
    max: 1.0,
    step: 0.01,
    weight: 0.20,
    unit: '',
    color: '#16a34a',
    isCoherence: true,
  },
  {
    id: 'C',
    label: 'C – Kognitív disszonancia',
    labelShort: 'C',
    description: 'Ellentmondásos frame-ek száma a diskurzusban',
    descriptionEn: 'Number of contradictory frames in discourse',
    default: 3,
    min: 0,
    max: 10,
    step: 0.1,
    weight: 0.15,
    unit: '',
    threshold: 10,
    color: '#0369a1',
    submodule: '600.41',
  },
  {
    id: 'E',
    label: 'E – Érzelmi polarizáció',
    labelShort: 'E',
    description: 'Érzelem-vektor szórás [0,1]',
    descriptionEn: 'Emotion vector dispersion [0,1]',
    default: 0.4,
    min: 0,
    max: 1,
    step: 0.01,
    weight: 0.18,
    unit: '',
    threshold: 0.7,
    color: '#be185d',
    submodule: '600.42',
  },
  {
    id: 'F',
    label: 'F – Frame ütközés',
    labelShort: 'F',
    description: 'Konfliktusos keretek száma hétenként',
    descriptionEn: 'Conflicting frames per week',
    default: 4,
    min: 0,
    max: 20,
    step: 0.5,
    weight: 0.12,
    unit: '/hét',
    threshold: 10,
    color: '#d97706',
    submodule: '600.41',
  },
  {
    id: 'R',
    label: 'R – Reziliencia index',
    labelShort: 'R',
    description: 'Narratíva helyreállítási sebesség [0,1]',
    descriptionEn: 'Narrative recovery speed [0,1]',
    default: 0.6,
    min: 0,
    max: 1,
    step: 0.01,
    weight: 0.10,
    unit: '',
    color: '#0891b2',
    isResilience: true,
    submodule: '600.41',
  },
  {
    id: 'D',
    label: 'D – Dopamin loop',
    labelShort: 'D',
    description: 'Figyelem-ciklus hossza (perc)',
    descriptionEn: 'Attention cycle length (minutes)',
    default: 8,
    min: 1,
    max: 30,
    step: 0.5,
    weight: 0.08,
    unit: 'perc',
    threshold: 15,
    color: '#7c3aed',
    submodule: '600.42',
  },
  {
    id: 'S',
    label: 'S – Szinergia faktor',
    labelShort: 'S',
    description: 'Több platform együttes hatása [0.8,1.5]',
    descriptionEn: 'Multi-platform joint effect [0.8,1.5]',
    default: 1.0,
    min: 0.8,
    max: 1.5,
    step: 0.01,
    weight: null,
    unit: '×',
    color: '#374151',
    isSynergy: true,
  },
  {
    id: 'T',
    label: 'T – Időbeli entropia',
    labelShort: 'T',
    description: 'Narratíva időbeli szétszóródás [0,1]',
    descriptionEn: 'Temporal narrative dispersion [0,1]',
    default: 0.3,
    min: 0,
    max: 1,
    step: 0.01,
    weight: 0.07,
    unit: '',
    color: '#ea580c',
    submodule: '600.41',
  },
  {
    id: 'P',
    label: 'P – Polarizáció sebesség',
    labelShort: 'P',
    description: 'dE/dt – polarizáció változásának üteme (hét⁻¹)',
    descriptionEn: 'dE/dt – rate of polarisation change (week⁻¹)',
    default: 0.1,
    min: 0,
    max: 0.5,
    step: 0.01,
    weight: 0.05,
    unit: '/hét',
    threshold: 0.3,
    color: '#dc2626',
    submodule: '600.42',
  },
  {
    id: 'Phi',
    label: 'Φ – Narratíva fluxus',
    labelShort: 'Φ',
    description: 'Összesített N-degradáció (EFU egység)',
    descriptionEn: 'Cumulative narrative degradation (EFU units)',
    default: 120,
    min: 0,
    max: 1000,
    step: 10,
    weight: null,
    unit: 'EFU',
    threshold: 500,
    color: '#9a3412',
    isPhi: true,
  },
];

// ---------------------------------------------------------------------------
// Normalizálási referenciák
// ---------------------------------------------------------------------------

export const NORM_REFS = {
  C: 10,
  F: 20,
  D: 30,
  P: 0.5,
};

// ---------------------------------------------------------------------------
// NDI súlyok (normalizált értékekre)
// ---------------------------------------------------------------------------

export const NDI_WEIGHTS = {
  C: 0.15,
  E: 0.18,
  F: 0.12,
  D: 0.08,
  T: 0.07,
  P: 0.05,
};

// ---------------------------------------------------------------------------
// 5 Zóna konfiguráció
// ---------------------------------------------------------------------------

export const NDI_ZONES = [
  {
    id: 'GREEN',
    label: '🟢 Zöld',
    labelShort: 'ZÖLD',
    condition: 'NDI < 0.8',
    m4_status: 'M4.STABLE',
    multiplier: 1.0,
    action: 'Monitor',
    color: '#16a34a',
    bg: '#f0fdf4',
    max: 0.8,
  },
  {
    id: 'YELLOW',
    label: '🟡 Sárga',
    labelShort: 'SÁRGA',
    condition: '0.8 – 1.8',
    m4_status: 'M4.DEGRADED',
    multiplier: 1.2,
    action: 'Narratíva audit',
    color: '#ca8a04',
    bg: '#fefce8',
    min: 0.8,
    max: 1.8,
  },
  {
    id: 'ORANGE',
    label: '🟠 Narancs',
    labelShort: 'NARANCS',
    condition: '1.8 – 3.5',
    m4_status: 'M4.FRAGMENTED',
    multiplier: 1.5,
    action: 'M4.CEWS trigger',
    color: '#ea580c',
    bg: '#fff7ed',
    min: 1.8,
    max: 3.5,
  },
  {
    id: 'RED',
    label: '🔴 Piros',
    labelShort: 'PIROS',
    condition: '3.5 – 7.0',
    m4_status: 'M4.POLARIZED',
    multiplier: 2.0,
    action: '700.4 protokoll',
    color: '#dc2626',
    bg: '#fef2f2',
    min: 3.5,
    max: 7.0,
  },
  {
    id: 'CRITICAL',
    label: '⚫ Kritikus',
    labelShort: 'KRITIKUS',
    condition: 'NDI > 7.0',
    m4_status: 'M4.COLLAPSED',
    multiplier: 3.0,
    action: 'Fire Chief',
    color: '#111827',
    bg: '#f9fafb',
    min: 7.0,
  },
];

// ---------------------------------------------------------------------------
// 4 Trigger definíciók
// ---------------------------------------------------------------------------

export const M4_TRIGGERS = [
  {
    id: 'M4_AMBER',
    label: 'Trigger M4.1',
    labelEn: 'CEWS AMBER',
    condition: 'NDI > 1.8 VAGY E > 0.7',
    action: 'CEWS AMBER – Narratíva audit indítás',
    level: 1,
    color: '#d97706',
  },
  {
    id: 'M4_RED',
    label: 'Trigger M4.2',
    labelEn: 'CEWS RED',
    condition: 'NDI > 3.5 ÉS (C>5 VAGY F>10)',
    action: 'CEWS RED – 700.4 beavatkozás',
    level: 2,
    color: '#dc2626',
  },
  {
    id: 'M4_EMERGENCY',
    label: 'Trigger M4.3',
    labelEn: 'Narratíva vészhelyzet',
    condition: 'Φ > 500 VAGY N < 0.4',
    action: 'Narratíva vészhelyzet – Fire Chief értesítés',
    level: 3,
    color: '#7c3aed',
  },
  {
    id: 'M4_POLAR',
    label: 'Trigger M4.4',
    labelEn: 'Gyors polarizáció',
    condition: 'P > 0.3 ÉS D > 15',
    action: 'Gyors polarizáció – azonnali monitorozás',
    level: 2,
    color: '#be185d',
  },
];

// ---------------------------------------------------------------------------
// Almodul küszöbök
// ---------------------------------------------------------------------------

export const SUBMODULE_THRESHOLDS = {
  '600.41': {
    code: 'KNI',
    label: 'Kognitív Narratíva Index',
    formula: 'KNI = C × F × (1-R) × T',
    zones: [
      { max: 0.5,  label: 'OK',       color: '#16a34a' },
      { min: 0.5, max: 2.0, label: 'DEGRADED',  color: '#ca8a04' },
      { min: 2.0, label: 'CRITICAL',  color: '#dc2626' },
    ],
  },
  '600.42': {
    code: 'ENI',
    label: 'Érzelmi Narratíva Index',
    formula: 'ENI = E × P × D × S',
    zones: [
      { max: 0.3,  label: 'STABLE',   color: '#16a34a' },
      { min: 0.3, max: 1.0, label: 'POLARIZED', color: '#d97706' },
      { min: 1.0, label: 'COLLAPSE',  color: '#dc2626' },
    ],
  },
};

// ---------------------------------------------------------------------------
// Dashboard JSON példa
// ---------------------------------------------------------------------------

export const DASHBOARD_EXAMPLE = {
  module: '600.40-42',
  ndi_index: 2.84,
  zone: 'NARANCS',
  m4_status: 'M4.FRAGMENTED',
  triggers: {
    m4_amber:           true,
    m4_red:             false,
    narrative_emergency: false,
    rapid_polarization: true,
  },
  submodules: {
    '600.41_kni': 1.42,
    '600.42_eni': 0.87,
  },
};
