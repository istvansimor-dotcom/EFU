/**
 * entertainment600_20.js — EFU 600.20 Szórakoztatóipar Dopamin Extrakció v1.0
 *
 * Sorozat: 600 – Antifluxus és Rendszerszintű Patológiák
 * Mechanizmus: M4 COGNITIVE (PRIMARY) | M5 TEMPORAL (SECONDARY)
 * Státusz: AKTÍV / PILOT-READY
 * Verzió: 1.0
 * Dátum: 2026-04-10
 */

// ---------------------------------------------------------------------------
// Modul meta
// ---------------------------------------------------------------------------

export const MODULE_META_20 = {
  id: '600.20',
  version: '1.0',
  title: 'Szórakoztatóipar Dopamin Extrakció',
  titleEn: 'Entertainment Parasitism – Dopamine Extraction',
  subtitle: 'Figyelem és idő elszívása napi fluxusokból → dopamin-alapú függőség → csökkent jövőképesség',
  series: '600 – Antifluxus és Rendszerszintű Patológiák',
  mechanism_primary: 'M4 COGNITIVE',
  mechanism_secondary: 'M5 TEMPORAL',
  tier: 2,
  priority: 7,
  status: 'AKTÍV / PILOT-READY',
  date: '2026-04-10',
  formula: 'DEP = (G×0.30 + L×0.25 + B×0.15 + D×0.20 + (HMI/10)×0.10) × (1 + (1−R_future)×0.5) × S × (1 + Phi/1000)',
  nexus: ['600.1', '600.8'],
  examples: ['Bet365', 'DraftKings', 'FIFA Ultimate Team loot boxes', 'Twitch Stake.com slots'],
};

// ---------------------------------------------------------------------------
// Változók / csúszkák
// ---------------------------------------------------------------------------

export const DEP_VARIABLES = [
  {
    id: 'G_gambling',
    label: 'G – Gambling/betting intenzitás',
    description: 'Szerencsejáték-ipar penetrációs intenzitása (0=nincs, 1=maximális)',
    default: 0.65,
    min: 0,
    max: 1,
    step: 0.01,
    threshold: 0.5,
    weight: 0.30,
    color: '#dc2626',
    example: 'Bet365, DraftKings',
  },
  {
    id: 'L_lootbox',
    label: 'L – Loot box mechanizmus',
    description: 'Loot box / in-game purchase predatory design intenzitása',
    default: 0.55,
    min: 0,
    max: 1,
    step: 0.01,
    threshold: 0.5,
    weight: 0.25,
    color: '#9333ea',
    example: 'FIFA Ultimate Team, loot boxes',
  },
  {
    id: 'B_binge',
    label: 'B – Binge-watching extrakció',
    description: 'Streaming-alapú dopamin-extrakció intenzitása (0=mérsékelt, 1=maximális)',
    default: 0.50,
    min: 0,
    max: 1,
    step: 0.01,
    threshold: 0.6,
    weight: 0.15,
    color: '#0369a1',
  },
  {
    id: 'D_doom',
    label: 'D – Doom scrolling / közösségi média',
    description: 'Doom scrolling és közösségimédia-függőség intenzitása',
    default: 0.60,
    min: 0,
    max: 1,
    step: 0.01,
    threshold: 0.55,
    weight: 0.20,
    color: '#d97706',
  },
  {
    id: 'HMI_loss',
    label: 'HMI kár / fő / év (EFU-E)',
    description: 'Éves HMI-veszteség személyenként EFU-E egységben',
    default: 4.5,
    min: 0,
    max: 10,
    step: 0.1,
    threshold: 3.5,
    weight: 0.10,
    color: '#ea580c',
    unit: 'EFU-E',
  },
  {
    id: 'R_future',
    label: 'R_future (jövőképesség)',
    description: 'Jövőképesség-index – alacsony érték = nagyobb kár (0=nincs jövőkép, 1=erős)',
    default: 0.35,
    min: 0,
    max: 1,
    step: 0.01,
    threshold: 0.3,
    weight: null,
    color: '#16a34a',
    note: 'Alacsony érték = nagyobb kár',
    isRfuture: true,
  },
];

export const DEP_SYNERGY = {
  id: 'S',
  label: 'S – Szinergia multiplikátor',
  default: 1.15,
  min: 0.5,
  max: 2,
  step: 0.05,
  color: '#374151',
};

export const DEP_PHI = {
  id: 'Phi',
  label: 'Phi – Addikciós kaszkád amplifikátor',
  default: 300,
  min: 0,
  max: 1000,
  step: 10,
  color: '#9a3412',
  isPhi: true,
};

// ---------------------------------------------------------------------------
// 5 Zóna
// ---------------------------------------------------------------------------

export const DEP_ZONES = [
  {
    id: 'GREEN',
    label: '🟢 Zöld',
    status: 'STABLE',
    condition: 'DEP < 0.3',
    action: 'Normál szórakoztatás',
    color: '#16a34a',
    bg: '#f0fdf4',
    max: 0.3,
  },
  {
    id: 'YELLOW',
    label: '🟡 Sárga',
    status: 'MONITOR',
    condition: '0.3 – 0.6',
    action: 'Figyelés szükséges',
    color: '#ca8a04',
    bg: '#fefce8',
    min: 0.3,
    max: 0.6,
  },
  {
    id: 'ORANGE',
    label: '🟠 Narancs',
    status: 'ADDIKCIÓ RIZIKÓ',
    condition: '0.6 – 1.0',
    action: '600.1 kognitív vírus risk',
    color: '#ea580c',
    bg: '#fff7ed',
    min: 0.6,
    max: 1.0,
  },
  {
    id: 'RED',
    label: '🔴 Piros',
    status: 'KARANTÉN',
    condition: '1.0 – 1.5',
    action: 'Fire Chief beavatkozás',
    color: '#dc2626',
    bg: '#fef2f2',
    min: 1.0,
    max: 1.5,
  },
  {
    id: 'CRITICAL',
    label: '⚫ Kritikus',
    status: 'SYSTEMIC',
    condition: 'DEP ≥ 1.5',
    action: 'Rendszerszintű dopamin-extrakció',
    color: '#111827',
    bg: '#f9fafb',
    min: 1.5,
  },
];

// ---------------------------------------------------------------------------
// 4 Trigger
// ---------------------------------------------------------------------------

export const DEP_TRIGGERS = [
  {
    id: 'gambling_karantén',
    label: 'GAMBLING_KARANTEN',
    condition: 'G_gambling > 0.6 ÉS HMI_loss > 3.5',
    action: 'Gambling karantén protokoll – szabályozói beavatkozás',
    level: 'RED',
    color: '#dc2626',
  },
  {
    id: 'lootbox_children',
    label: 'LOOTBOX_CHILDREN_RISK',
    condition: 'L_lootbox > 0.5',
    action: 'Gyermek-védelmi loot box szabályozás aktiválása',
    level: 'AMBER',
    color: '#ca8a04',
  },
  {
    id: 'addiction_cascade',
    label: 'ADDICTION_CASCADE',
    condition: '(G_gambling + D_doom) > 1.0 ÉS R_future < 0.3',
    action: 'Addikciós kaszkád – kognitív válasz protokoll',
    level: 'ORANGE',
    color: '#ea580c',
  },
  {
    id: 'fire_chief',
    label: 'FIRE_CHIEF_TRIGGER',
    condition: 'DEP ≥ 1.5 VAGY (HMI_loss ≥ 8.0 ÉS R_future < 0.2)',
    action: 'Fire Chief beavatkozás – rendszerszintű dopamin-extrakció',
    level: 'CRITICAL',
    color: '#111827',
  },
];

// ---------------------------------------------------------------------------
// UK gambling referencia adatok
// ---------------------------------------------------------------------------

export const UK_GAMBLING_DATA = [
  { metric: 'Éves veszteség', value: '£14 milliárd' },
  { metric: 'Problem gamblers', value: '430 000 fő' },
  { metric: 'HMI kár/fő/év', value: '-8.5 EFU-E' },
  { metric: 'Társadalmi költség (NHS)', value: '£1.2 milliárd' },
  { metric: 'R_future', value: '< 0.2 (adósság spirál)' },
];
