/**
 * agroEnergia700_1_1_2.js — EFU 700.1.1.2 Agro-Energia Szimbiózis (AES) v1.0
 *
 * Sorozat: 700 – Regeneratív Beavatkozások
 * Modell: Agrovoltaika + Biomassza Loop | Foton-szimbiózis ökoszisztéma
 * LER: 1.2-1.7, EFU szorzó: 1.2-1.6, FLR: 15-30%
 * Státusz: FC-APPROVED DRAFT
 * Verzió: 1.0
 * Dátum: 2026-04-15
 */

// ---------------------------------------------------------------------------
// Modul meta
// ---------------------------------------------------------------------------

export const MODULE_META_700_1_1_2 = {
  id: '700.1.1.2',
  version: '1.0',
  title: 'Agro-Energia Szimbiózis',
  titleEn: 'Agro-Energy Symbiosis (AES)',
  subtitle: 'Agrovoltaika + Biomassza Loop | Foton-szimbiózis ökoszisztéma',
  series: '700 – Regeneratív Beavatkozások',
  tier: 2,
  status: 'FC-APPROVED DRAFT',
  date: '2026-04-15',
  efu_multiplier_range: '1.2–1.6',
  formula: 'AES = land×0.35 + energy×0.25 + water×0.20 + crop×0.20',
  connections: ['700.1.1', '700.2', '700.3', '700.4'],
};

// ---------------------------------------------------------------------------
// Változók / csúszkák
// ---------------------------------------------------------------------------

export const AES_VARIABLES = [
  {
    id: 'ler',
    label: 'Land Equivalent Ratio (LER)',
    description: 'Földegyenértékelési arány – kettős hasznosítás hatékonysága',
    default: 1.4,
    min: 1.0,
    max: 2.0,
    step: 0.05,
    color: '#15803d',
    positive: true,
    unit: '',
  },
  {
    id: 'rte_chain',
    label: 'Energia RTE lánc',
    description: 'Teljes energialánc Round-Trip Efficiency (napelemtől fogyasztóig)',
    default: 0.77,
    min: 0.60,
    max: 0.90,
    step: 0.01,
    color: '#0369a1',
    positive: true,
    unit: '',
  },
  {
    id: 'evapot_reduction',
    label: 'Párolgás csökkentés',
    description: 'Agrovoltaikus árnyékolás által csökkentett párolgás aránya',
    default: 0.25,
    min: 0,
    max: 0.5,
    step: 0.01,
    color: '#0891b2',
    positive: true,
    unit: '',
  },
  {
    id: 'soil_compaction',
    label: 'Talajkompakció szint',
    description: 'Gépjárómű-forgalom okozta talajkompakció mértéke',
    default: 0.12,
    min: 0,
    max: 0.5,
    step: 0.01,
    color: '#dc2626',
    positive: false,
    unit: '',
  },
  {
    id: 'crop_variance',
    label: 'Hozam variancia',
    description: 'Termés hozamának évközi és parcellák közötti variabilitása',
    default: 0.30,
    min: 0,
    max: 0.6,
    step: 0.01,
    color: '#ea580c',
    positive: false,
    unit: '',
  },
  {
    id: 'shade_gain',
    label: 'Árnyéktűrő hozamnövekedés',
    description: 'Árnyéktűrő kultúrák hozamnövekedése az agrovoltaikus árnyék hatására',
    default: 0.35,
    min: 0,
    max: 0.8,
    step: 0.01,
    color: '#16a34a',
    positive: true,
    unit: '',
  },
  {
    id: 'biomass_rte',
    label: 'Biomassza konverzió RTE',
    description: 'Biomassza energetikai konverzió hatásfoka',
    default: 0.40,
    min: 0.30,
    max: 0.60,
    step: 0.01,
    color: '#7c3aed',
    positive: true,
    unit: '',
  },
  {
    id: 'ctf_mitigation',
    label: 'CTF kompakció mitigáció',
    description: 'Controlled Traffic Farming – kompakció csökkentő protokoll hatékonysága',
    default: 0.50,
    min: 0,
    max: 1,
    step: 0.01,
    color: '#059669',
    positive: true,
    unit: '',
  },
];

// ---------------------------------------------------------------------------
// 5 Zóna
// ---------------------------------------------------------------------------

export const AES_ZONES = [
  {
    id: 'CRITICAL',
    label: '🔴 Kritikus',
    status: 'CRITICAL',
    condition: 'AES < 2',
    action: 'Alapvető APV integráció nem működik – rendszer-újratervezés',
    color: '#dc2626',
    bg: '#fef2f2',
    max: 2,
  },
  {
    id: 'WEAK',
    label: '🟠 Gyenge integrálás',
    status: 'WEAK',
    condition: '2 – 4',
    action: 'Gyenge szimbiotikus hatás – LER és RTE optimalizálás szükséges',
    color: '#ea580c',
    bg: '#fff7ed',
    min: 2,
    max: 4,
  },
  {
    id: 'OPERATIVE',
    label: '🟡 Működő APV',
    status: 'OPERATIVE',
    condition: '4 – 6',
    action: 'Működő agrovoltaika – kompakció és variancia csökkentés',
    color: '#ca8a04',
    bg: '#fefce8',
    min: 4,
    max: 6,
  },
  {
    id: 'SYMBIOTIC',
    label: '🟢 Szimbiózis',
    status: 'SYMBIOTIC',
    condition: '6 – 8',
    action: 'Foton-szimbiózis aktív – trilógia kész, skálázás lehetséges',
    color: '#16a34a',
    bg: '#f0fdf4',
    min: 6,
    max: 8,
  },
  {
    id: 'OPTIMAL',
    label: '⭐ Foton-szimbiózis',
    status: 'OPTIMAL',
    condition: 'AES ≥ 8',
    action: 'Optimális foton-szimbiózis – EU benchmark, publikáció kész',
    color: '#0369a1',
    bg: '#eff6ff',
    min: 8,
  },
];

// ---------------------------------------------------------------------------
// 4 Trigger
// ---------------------------------------------------------------------------

export const AES_TRIGGERS = [
  {
    id: 'COMPACTION_CRITICAL',
    label: 'COMPACTION_CRITICAL – Talajkompakció kritikus',
    condition: 'soil_compaction × (1-ctf_mitigation) > 0.15',
    action: 'Talajkompakció kritikus – CTF protokoll szükséges (700.1.1)',
    level: 'RED',
    color: '#dc2626',
    positive: false,
  },
  {
    id: 'LER_LOW',
    label: 'LER_LOW – APV hatékonyság marginal',
    condition: 'LER_effective < 1.15',
    action: 'LER alacsony – APV hatékonyság marginal, konfigurációs felülvizsgálat szükséges',
    level: 'ORANGE',
    color: '#ea580c',
    positive: false,
  },
  {
    id: 'HIGH_CROP_VARIANCE',
    label: 'HIGH_CROP_VARIANCE – Magas hozam variancia',
    condition: 'crop_variance > 0.45',
    action: 'Magas hozam variancia – 700.1.1 mérési protokoll szükséges',
    level: 'ORANGE',
    color: '#ea580c',
    positive: false,
  },
  {
    id: 'SYMBIOSIS_ACTIVE',
    label: 'SYMBIOSIS_ACTIVE – Foton-szimbiózis aktív',
    condition: 'aes_index ≥ 6.0',
    action: 'Foton-szimbiózis aktív – trilógia kész, EU finanszírozás aktiválható',
    level: 'GREEN',
    color: '#16a34a',
    positive: true,
  },
];
