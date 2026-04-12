/**
 * regenMeres700_1_1.js — EFU 700.1.1 Regeneratív Mérési Protokoll (RMP) v1.0
 *
 * Sorozat: 700 – Regeneratív Beavatkozások
 * Modell: Talaj–HRV–ESM háromszög | IoT + farmer-as-sensor
 * NET_EFU cél: 3.08 EFU-E/ha/félév → 6.16 EFU-E/ha/év
 * Státusz: FC-APPROVED DRAFT
 * Verzió: 1.0
 * Dátum: 2026-04-15
 */

// ---------------------------------------------------------------------------
// Modul meta
// ---------------------------------------------------------------------------

export const MODULE_META_700_1_1 = {
  id: '700.1.1',
  version: '1.0',
  title: 'Regeneratív Mérési Protokoll',
  titleEn: 'Regenerative Measurement Protocol (RMP)',
  subtitle: 'Talaj–HRV–ESM háromszög modell | IoT + farmer-as-sensor',
  series: '700 – Regeneratív Beavatkozások',
  tier: 1,
  status: 'FC-APPROVED DRAFT',
  date: '2026-04-15',
  net_efu_target: '3.08/ha/félév',
  formula: 'RMP = soil×0.40 + HRV×0.30 + ESM×0.20 + system×0.10',
  connections: ['700.2', '700.3', '700.4', '700.5'],
};

// ---------------------------------------------------------------------------
// Változók / csúszkák – 3 réteg
// ---------------------------------------------------------------------------

export const RMP_VARIABLES_SOIL = [
  {
    id: 'tdr_moisture',
    label: 'TDR talajnedvesség',
    description: 'TDR szenzorral mért talajnedvesség (0=száraz, 1=optimális)',
    default: 0.55,
    min: 0,
    max: 1,
    step: 0.01,
    color: '#92400e',
    positive: true,
    layer: 'soil',
  },
  {
    id: 'ec_fertility',
    label: 'EC talajtermékenység',
    description: 'Elektromos konduktivitás alapú termékenységi index',
    default: 0.60,
    min: 0,
    max: 1,
    step: 0.01,
    color: '#a16207',
    positive: true,
    layer: 'soil',
  },
  {
    id: 'redox_health',
    label: 'Redox talajegészség',
    description: 'Redox potenciál alapú talajegészség index',
    default: 0.58,
    min: 0,
    max: 1,
    step: 0.01,
    color: '#b45309',
    positive: true,
    layer: 'soil',
  },
  {
    id: 'som_delta',
    label: 'ΔSOM %/év normalizált',
    description: 'Szerves anyag változás rátája évente (negatív=degradáció)',
    default: 0.3,
    min: -0.5,
    max: 1.0,
    step: 0.01,
    color: '#78350f',
    positive: true,
    layer: 'soil',
  },
];

export const RMP_VARIABLES_HRV = [
  {
    id: 'hrv_rmssd_pct',
    label: 'HRV RMSSD életkor-normalizált',
    description: 'Gazdálkodó HRV RMSSD percentilise (életkorra normalizált)',
    default: 0.55,
    min: 0,
    max: 1,
    step: 0.01,
    color: '#be185d',
    positive: true,
    layer: 'hrv',
  },
  {
    id: 'hrv_stress',
    label: 'Stressz terhelés',
    description: 'Gazdálkodó stressz-terhelési indexe (0=relaxált, 1=kiégés)',
    default: 0.40,
    min: 0,
    max: 1,
    step: 0.01,
    color: '#dc2626',
    positive: false,
    layer: 'hrv',
  },
];

export const RMP_VARIABLES_ESM = [
  {
    id: 'esm_wellbeing',
    label: 'ESM jólét score',
    description: 'Experience Sampling Method – jólét napló score',
    default: 0.62,
    min: 0,
    max: 1,
    step: 0.01,
    color: '#7c3aed',
    positive: true,
    layer: 'esm',
  },
  {
    id: 'esm_engagement',
    label: 'ESM bevonódás score',
    description: 'Experience Sampling Method – bevonódás és flow score',
    default: 0.58,
    min: 0,
    max: 1,
    step: 0.01,
    color: '#6d28d9',
    positive: true,
    layer: 'esm',
  },
];

export const RMP_VARIABLES_SYSTEM = [
  {
    id: 'lora_coverage',
    label: 'LoRaWAN lefedettség',
    description: 'LoRaWAN hálózati lefedettség a farmon (0=nincs, 1=teljes)',
    default: 0.75,
    min: 0,
    max: 1,
    step: 0.01,
    color: '#0369a1',
    positive: true,
    layer: 'system',
  },
  {
    id: 'sensor_drift',
    label: 'Szenzor drift/pontosság FLR',
    description: 'Szenzor kalibrációs drift – pontosságveszteség aránya',
    default: 0.08,
    min: 0,
    max: 0.30,
    step: 0.01,
    color: '#ea580c',
    positive: false,
    layer: 'system',
  },
];

export const RMP_ALL_VARIABLES = [
  ...RMP_VARIABLES_SOIL,
  ...RMP_VARIABLES_HRV,
  ...RMP_VARIABLES_ESM,
  ...RMP_VARIABLES_SYSTEM,
];

// ---------------------------------------------------------------------------
// 5 Zóna
// ---------------------------------------------------------------------------

export const RMP_ZONES = [
  {
    id: 'DEGRADED',
    label: '🔴 Degradált',
    status: 'DEGRADED',
    condition: 'RMP < 3',
    action: 'Talaj- és gazda-állapot kritikus – azonnali beavatkozás',
    color: '#dc2626',
    bg: '#fef2f2',
    max: 3,
  },
  {
    id: 'WEAK',
    label: '🟠 Gyenge',
    status: 'WEAK',
    condition: '3 – 5',
    action: 'Gyenge regeneratív kapacitás – szisztematikus fejlesztés szükséges',
    color: '#ea580c',
    bg: '#fff7ed',
    min: 3,
    max: 5,
  },
  {
    id: 'BASELINE',
    label: '🟡 Alap',
    status: 'BASELINE',
    condition: '5 – 6.5',
    action: 'Alapszintű funkció – mérési rendszer stabilizálása',
    color: '#ca8a04',
    bg: '#fefce8',
    min: 5,
    max: 6.5,
  },
  {
    id: 'REGENERATIVE',
    label: '🟢 Regeneratív',
    status: 'REGENERATIVE',
    condition: '6.5 – 8',
    action: 'Regeneratív kapacitás aktív – pilot finanszírozás aktiválható',
    color: '#16a34a',
    bg: '#f0fdf4',
    min: 6.5,
    max: 8,
  },
  {
    id: 'OPTIMAL',
    label: '⭐ Optimális',
    status: 'OPTIMAL',
    condition: 'RMP ≥ 8',
    action: 'Optimális protokoll – replikáció és EU publikáció',
    color: '#0369a1',
    bg: '#eff6ff',
    min: 8,
  },
];

// ---------------------------------------------------------------------------
// 4 Trigger
// ---------------------------------------------------------------------------

export const RMP_TRIGGERS = [
  {
    id: 'SOIL_CRITICAL',
    label: 'SOIL_CRITICAL – Talaj degradáció',
    condition: 'soil_score < 0.4',
    action: 'Talaj degradáció kritikus – talajjavítási beavatkozás szükséges',
    level: 'RED',
    color: '#dc2626',
    positive: false,
  },
  {
    id: 'FARMER_BURNOUT',
    label: 'FARMER_BURNOUT – Gazda kiégés kockázat',
    condition: 'hrv_stress > 0.7 ÉS hrv_rmssd_pct < 0.4',
    action: 'Gazda kiégés kockázat – 700.4 beavatkozás szükséges',
    level: 'RED',
    color: '#dc2626',
    positive: false,
  },
  {
    id: 'LORA_GAP',
    label: 'LORA_GAP – LoRaWAN lefedettség kritikus',
    condition: 'lora_coverage < 0.5',
    action: 'LoRaWAN lefedettség kritikus – mesh fallback szükséges',
    level: 'ORANGE',
    color: '#ea580c',
    positive: false,
  },
  {
    id: 'PILOT_READY',
    label: 'PILOT_READY – Finanszírozás aktiválható',
    condition: 'rmp_index ≥ 6.5',
    action: 'Pilot-ready protokoll – finanszírozás aktiválható',
    level: 'GREEN',
    color: '#16a34a',
    positive: true,
  },
];
