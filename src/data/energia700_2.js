/**
 * energia700_2.js — EFU 700.2 Közösségi Energia Szövetkezet (CEKS) v1.0
 *
 * Sorozat: 700 – Regeneratív Beavatkozások
 * Cél: 1000 fős közösségi energia-szövetkezet, 5M€ CAPEX, 6 GWh/év, 70% önellátás
 * Státusz: FC-APPROVED DRAFT
 * Verzió: 1.0
 * Dátum: 2026-04-15
 */

// ---------------------------------------------------------------------------
// Modul meta
// ---------------------------------------------------------------------------

export const MODULE_META_700_2 = {
  id: '700.2',
  version: '1.0',
  title: 'Közösségi Energia Szövetkezet',
  titleEn: 'Community Energy Cooperative (CEKS)',
  subtitle: '1000 tagos szövetkezet · 5M€ CAPEX · 6 GWh/év · 70% önellátás',
  series: '700 – Regeneratív Beavatkozások',
  tier: 1,
  status: 'FC-APPROVED DRAFT',
  date: '2026-04-15',
  R_future_target: 1.5,
  HMI_target: 1.8,
  formula: 'CEKS = energy_score×0.40 + governance_score×0.30 + financial_score×0.20 + sustainability_score×0.10',
  connections: ['700.5', '040.2', '104.62', '900.5', '104.8'],
};

// ---------------------------------------------------------------------------
// Változók / csúszkák
// ---------------------------------------------------------------------------

export const CEKS_VARIABLES = [
  {
    id: 'solar_mwp',
    label: 'Napelem kapacitás MWp',
    description: 'Telepített napelem kapacitás megawatt-csúcsban',
    default: 5,
    min: 0,
    max: 20,
    step: 0.1,
    color: '#d97706',
    positive: true,
    unit: 'MWp',
  },
  {
    id: 'wind_mw',
    label: 'Szél kapacitás MW',
    description: 'Telepített szélenergia kapacitás megawattban',
    default: 1,
    min: 0,
    max: 10,
    step: 0.1,
    color: '#0369a1',
    positive: true,
    unit: 'MW',
  },
  {
    id: 'storage_mwh',
    label: 'Tároló MWh',
    description: 'Energiatároló kapacitás megawattórában',
    default: 4,
    min: 0,
    max: 50,
    step: 0.5,
    color: '#7c3aed',
    positive: true,
    unit: 'MWh',
  },
  {
    id: 'members',
    label: 'Tagok száma',
    description: 'Szövetkezeti tagok száma',
    default: 1000,
    min: 100,
    max: 5000,
    step: 50,
    color: '#374151',
    positive: true,
    unit: 'fő',
  },
  {
    id: 'governance_q',
    label: 'Governance minőség 0-1',
    description: 'Szövetkezeti irányítás minősége (0=kritikus, 1=optimális)',
    default: 0.8,
    min: 0,
    max: 1,
    step: 0.01,
    color: '#16a34a',
    positive: true,
    unit: '',
  },
  {
    id: 'rte',
    label: 'Rendszer RTE',
    description: 'Round-Trip Efficiency – rendszer hatásfoka',
    default: 0.77,
    min: 0.60,
    max: 0.95,
    step: 0.01,
    color: '#0891b2',
    positive: true,
    unit: '',
  },
  {
    id: 'retail_price_mwh',
    label: 'Villany kiskerár €/MWh',
    description: 'Kiskereskedelmi villamosenergia ár euró/MWh',
    default: 250,
    min: 100,
    max: 400,
    step: 10,
    color: '#b45309',
    positive: true,
    unit: '€/MWh',
  },
  {
    id: 'self_suff_target',
    label: 'Önellátás cél (0-1)',
    description: 'Célzott önellátási arány (0.7 = 70%)',
    default: 0.70,
    min: 0.30,
    max: 1.0,
    step: 0.05,
    color: '#15803d',
    positive: true,
    unit: '',
  },
];

// ---------------------------------------------------------------------------
// 5 Zóna
// ---------------------------------------------------------------------------

export const CEKS_ZONES = [
  {
    id: 'CRITICAL',
    label: '🔴 Kritikus',
    status: 'FAILED',
    condition: 'CEKS < 2',
    action: 'Alapvető rendszerhibák – komplex újratervezés szükséges',
    color: '#dc2626',
    bg: '#fef2f2',
    max: 2,
  },
  {
    id: 'LOW',
    label: '🟠 Alacsony',
    status: 'DEVELOPING',
    condition: '2 – 4',
    action: 'Fejlesztési fázis – kapacitásbővítés szükséges',
    color: '#ea580c',
    bg: '#fff7ed',
    min: 2,
    max: 4,
  },
  {
    id: 'MEDIUM',
    label: '🟡 Közepes',
    status: 'OPERATIVE',
    condition: '4 – 6',
    action: 'Működőképes – governance és pénzügyi optimalizálás',
    color: '#ca8a04',
    bg: '#fefce8',
    min: 4,
    max: 6,
  },
  {
    id: 'HIGH',
    label: '🟢 Magas',
    status: 'THRIVING',
    condition: '6 – 8',
    action: 'Virágzó szövetkezet – skálázás és replikáció',
    color: '#16a34a',
    bg: '#f0fdf4',
    min: 6,
    max: 8,
  },
  {
    id: 'OPTIMAL',
    label: '⭐ Optimális',
    status: 'BENCHMARK',
    condition: 'CEKS ≥ 8',
    action: 'Benchmark protokoll – EU skálázható referenciamodell',
    color: '#0369a1',
    bg: '#eff6ff',
    min: 8,
  },
];

// ---------------------------------------------------------------------------
// 4 Trigger
// ---------------------------------------------------------------------------

export const CEKS_TRIGGERS = [
  {
    id: 'ENERGY_DEFICIT',
    label: 'ENERGY_DEFICIT – Energiatermelés kritikus',
    condition: 'usable_gwh < 4.0',
    action: 'Energiatermelés kritikusan alacsony – kapacitásbővítés szükséges',
    level: 'RED',
    color: '#dc2626',
    positive: false,
  },
  {
    id: 'HIGH_FLR',
    label: 'HIGH_FLR – Flux Loss Rate magas',
    condition: 'flr_total > 25%',
    action: 'FLR meghaladja a 25% küszöböt – rendszeroptimalizálás szükséges',
    level: 'ORANGE',
    color: '#ea580c',
    positive: false,
  },
  {
    id: 'PROFIT_LOSS',
    label: 'PROFIT_LOSS – Negatív profit',
    condition: 'profit_k < 0',
    action: 'Negatív nettó profit – pénzügyi kockázat, bevételoptimalizálás szükséges',
    level: 'RED',
    color: '#dc2626',
    positive: false,
  },
  {
    id: 'BENCHMARK_REACHED',
    label: 'BENCHMARK_REACHED – Optimális szint elért',
    condition: 'ceks_index ≥ 8',
    action: 'Benchmark elért – skálázható protokoll, EU replikáció lehetséges',
    level: 'GREEN',
    color: '#16a34a',
    positive: true,
  },
];
