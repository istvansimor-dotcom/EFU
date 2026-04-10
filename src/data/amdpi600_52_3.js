/**
 * amdpi600_52_3.js — EFU 600.52.3 AM-DPI Index
 *
 * Audit Matrix Detection Protocol Integration (AM-DPI)
 * Súlyozott numerikus index az Audit Matrix ↔ 600.7 kétirányú visszacsatoláshoz.
 *
 * Sorozat: 600 – Antifluxus és Rendszerszintű Patológiák
 * Szülőmodul: 600.52 PFAS & „Örök Vegyületek" (CFI-B)
 * Státusz: AKTÍV / PILOT-READY
 * Verzió: 1.0
 * Dátum: 2026-04-10
 */

// ---------------------------------------------------------------------------
// Modul meta
// ---------------------------------------------------------------------------

export const MODUL_META_52_3 = {
  code:              '600.52.3',
  name:              'AM-DPI Index (PFAS Audit Integration)',
  description:       'Súlyozott numerikus index az Audit Matrix ↔ 600.7 kétirányú visszacsatoláshoz',
  version:           '1.0',
  status:            'AKTÍV / PILOT-READY',
  date:              '2026-04-10',
  parent:            '600.52',
  efu_penalty_base:  150,
  formula:           'AM-DPI = (P1×0.15 + P2×0.25 + B×0.10 + I×0.20 + T×0.15 + D×0.05) × S × (1 + Φ/1000)',
  weights: {
    P1: 0.15,
    P2: 0.25,
    B:  0.10,
    I:  0.20,
    T:  0.15,
    D:  0.05,
    S:  1.0,
    Φ:  0.001,
  },
};

// ---------------------------------------------------------------------------
// Bemeneti változók (8 db)
// ---------------------------------------------------------------------------

export const AMDPI_VARIABLES = {
  P1: {
    id: 'P1',
    name: 'P-LOD (víz)',
    nameEn: 'P-LOD (drinking water)',
    description: 'Primer PFAS terhelési arány ivóvízben',
    unit: 'ng/L',
    threshold: 100,
    default: 50,
    min: 0,
    max: 300,
    step: 1,
    weight: 0.15,
    level_600_7: 2,
    color: '#0369a1',
  },
  P2: {
    id: 'P2',
    name: 'P-LOD² (vér)',
    nameEn: 'P-LOD² (blood serum)',
    description: 'Primer PFAS terhelés vérszérumban – kritikus mutató',
    unit: 'ng/mL',
    threshold: 20,
    default: 8,
    min: 0,
    max: 60,
    step: 0.5,
    weight: 0.25,
    level_600_7: 3,
    color: '#dc2626',
  },
  B: {
    id: 'B',
    name: 'B-ACC',
    nameEn: 'Bioaccumulation rate',
    description: 'Bioakkumuláció üteme szövetekben',
    unit: '%/év',
    threshold: 10,
    default: 3,
    min: 0,
    max: 30,
    step: 0.1,
    weight: 0.10,
    level_600_7: 2,
    color: '#16a34a',
  },
  I: {
    id: 'I',
    name: 'I-BLOCK',
    nameEn: 'Interstitial blockade',
    description: 'Interstitiális blokád – szöveti diffúziógátlás',
    unit: '%',
    threshold: 15,
    default: 5,
    min: 0,
    max: 45,
    step: 0.5,
    weight: 0.20,
    level_600_7: 3,
    color: '#7c3aed',
  },
  D: {
    id: 'D',
    name: 'AFFF-RAD',
    nameEn: 'AFFF contamination radius',
    description: 'AFFF habanyag szennyezési sugár',
    unit: 'km',
    threshold: 0.5,
    default: 0.2,
    min: 0,
    max: 1.5,
    step: 0.05,
    weight: 0.05,
    level_600_7: 1,
    color: '#d97706',
  },
  T: {
    id: 'T',
    name: 'C-CHAIN',
    nameEn: 'Trophic chain concentration',
    description: 'Trófiás lánc PFAS koncentráció',
    unit: 'ng/g',
    threshold: 11,
    default: 4,
    min: 0,
    max: 33,
    step: 0.5,
    weight: 0.15,
    level_600_7: 3,
    color: '#ea580c',
  },
  S: {
    id: 'S',
    name: 'Szinergia',
    nameEn: 'Synergy factor',
    description: 'Több forrás együttes hatásnövelő faktora',
    unit: '×',
    threshold: 1.0,
    default: 1.0,
    min: 0.8,
    max: 1.5,
    step: 0.01,
    weight: null,
    level_600_7: null,
    color: '#374151',
    isSynergy: true,
  },
  Φ: {
    id: 'Φ',
    name: 'CFI-B',
    nameEn: 'Chemical Bio-fragmentation Index',
    description: 'Összesített kémiai bio-fragmentáció index (EFU egység)',
    unit: 'EFU',
    threshold: 300,
    threshold_fire: 600,
    default: 120,
    min: 0,
    max: 1000,
    step: 10,
    weight: null,
    level_600_7: 4,
    color: '#9a3412',
    isPhi: true,
  },
};

// ---------------------------------------------------------------------------
// 4 Zóna küszöbértékek
// ---------------------------------------------------------------------------

export const AMDPI_ZONES = [
  {
    id: 'GREEN',
    zone: 'ZÖLD',
    label: '🟢 Zöld',
    min: 0,
    max: 1.0,
    level: 1,
    sbe: 'SBE-Watch',
    multiplier: 1.0,
    color: '#16a34a',
    bg: '#f0fdf4',
    action: 'Monitorozás',
  },
  {
    id: 'YELLOW',
    zone: 'SÁRGA',
    label: '🟡 Sárga',
    min: 1.0,
    max: 2.5,
    level: 2,
    sbe: 'SBE-Probable',
    multiplier: 1.2,
    color: '#ca8a04',
    bg: '#fefce8',
    action: 'PFAS audit indítás',
  },
  {
    id: 'ORANGE',
    zone: 'NARANCS',
    label: '🟠 Narancs',
    min: 2.5,
    max: 5.0,
    level: 3,
    sbe: 'SBE-Confirmed',
    multiplier: 1.5,
    color: '#ea580c',
    bg: '#fff7ed',
    action: 'Forrás karanténbe',
  },
  {
    id: 'RED',
    zone: 'PIROS',
    label: '🔴 Piros',
    min: 5.0,
    max: Infinity,
    level: 4,
    sbe: 'SBE-Confirmed_P1',
    multiplier: 2.0,
    color: '#dc2626',
    bg: '#fef2f2',
    action: 'Tier 1 visszavonás',
  },
];

// ---------------------------------------------------------------------------
// 3 Trigger definíciók
// ---------------------------------------------------------------------------

export const AMDPI_TRIGGERS = [
  {
    id: 'CEWS_AMBER',
    label: 'CEWS AMBER',
    condition: 'AM-DPI > 1.0 VAGY P2 > 20 VAGY I > 15',
    level: 'AMBER',
    action: 'CEWS AMBER – PFAS audit indítás, 600.7 szint 2 aktiválás',
    color: '#d97706',
  },
  {
    id: 'CEWS_RED',
    label: 'CEWS RED',
    condition: 'AM-DPI > 2.5 ÉS (P2 > 20 VAGY I > 15)',
    level: 'RED',
    action: 'CEWS RED – Forrás karantén, 700.x beavatkozás',
    color: '#dc2626',
  },
  {
    id: 'FIRE_CHIEF',
    label: 'FIRE CHIEF',
    condition: 'Φ > 600 VAGY AM-DPI > 5.0',
    level: 'CRITICAL',
    action: 'Fire Chief értesítés – Tier 1 visszavonás, teljes audit',
    color: '#111827',
  },
];
