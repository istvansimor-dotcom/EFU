/**
 * noosphereMetrics600_51.js — EFU 600.51 Noosphere Antifluxus Metrikák v1.0
 *
 * Sorozat: 600 – Antifluxus és Rendszerszintű Patológiák
 * Cél: 600.50 kiegészítője – operacionalizált mérőszámok a nooszféra antifluxus
 *      dinamikáinak napi monitorozására. 900.1 CDS és 900.2 CDP input.
 * Státusz: AKTÍV / DEPLOY READY
 * Verzió: 1.0
 * Dátum: 2026-04-11
 */

// ---------------------------------------------------------------------------
// Modul meta
// ---------------------------------------------------------------------------

export const MODULE_META_51 = {
  id: '600.51',
  version: '1.0',
  title: 'Noosphere Antifluxus Metrikák',
  titleEn: 'Noosphere Antiflux Metrics',
  subtitle: 'Operacionalizált napi monitorozás – DKI, NPR, AIF kompozit Noo-CSI index',
  subtitleEn: 'Operationalised daily monitoring – DKI, NPR, AIF composite Noo-CSI index',
  series: '600 – Antifluxus és Rendszerszintű Patológiák',
  mechanism_primary: 'M11 BIO-COG',
  mechanism_secondary: 'M3 IDENTITY',
  tier: 1,
  priority: 8,
  status: 'AKTÍV / DEPLOY READY',
  date: '2026-04-11',
  formula: 'CSI_noo = 0.4×DKI + 0.4×NPR + 0.2×AIF',
  parent_module: '600.50',
  nexus: ['600.50', '900.1 CDS', '900.2 CDP', 'M3', 'M11', '303 Oktatási Fluxus'],
  refs: [
    'A. 600.50 Noosphere Research Framework v1.0',
    'B. Pew Research (digital wellbeing), X API (NPR)',
    'C. OECD PISA – DKI korreláció',
    'D. 900.1 VKI v2.0, 303 Oktatási Fluxus',
  ],
  hu_pilot_baseline: {
    date: '2026-02-18',
    DKI: 7.2,
    NPR: 3.8,
    AIF: 0.82,
    CSI_noo: 6.9,
    trigger_level: '900.2 Szint 2',
  },
};

// ---------------------------------------------------------------------------
// 3 Változó definíciók
// ---------------------------------------------------------------------------

export const NOO_VARIABLES = [
  {
    id: 'DKI',
    code: 'DKI',
    label: 'DKI – Digitális Kognitív Intrúzió',
    labelEn: 'Digital Cognitive Intrusion',
    description: 'Napi képernyőidő (óra/nap) – algoritmikus szorzóval normált',
    descriptionEn: 'Daily screen time (hours/day) – normalised with algorithmic multiplier',
    formula: 'DKI = screen_time / (Phi_kog / N) × P_alg',
    mechanism: 'M11 BIO-COG',
    keyFact: 'Zöld <2 h | Sárga 2–6 h | Narancs 6–10 h | Vörös >10 h',
    alertCode: '900.2',
    alertLevel: 'ORANGE',
    default: 7.2,
    min: 0,
    max: 16,
    step: 0.1,
    threshold_green: 2,
    threshold_yellow: 6,
    threshold_orange: 10,
    weight: 0.4,
    unit: 'h/nap',
    color: '#0369a1',
    cds_effect: 'VKI_noo -0.3',
    cdp_effect: 'Politikai +0.2',
    cds_threshold_label: '>6 óra 🔴',
  },
  {
    id: 'NPR',
    code: 'NPR',
    label: 'NPR – Narratíva Polarizációs Rate',
    labelEn: 'Narrative Polarisation Rate',
    description: '|pozitív sentiment − negatív sentiment| / neutrális sentiment',
    descriptionEn: '|positive sentiment − negative sentiment| / neutral sentiment',
    formula: 'NPR = |pos_sent − neg_sent| / neutral_sent',
    mechanism: 'M3 IDENTITY',
    keyFact: 'Trigger: NPR > 3.0 → 900.2 Szint 2',
    alertCode: '900.2 Szint 2',
    alertLevel: 'ORANGE',
    default: 3.8,
    min: 0,
    max: 10,
    step: 0.1,
    threshold_trigger: 3.0,
    weight: 0.4,
    unit: '',
    color: '#7c3aed',
    cds_effect: 'CII társadalmi -0.4',
    cdp_effect: 'Társadalmi +0.3',
    cds_threshold_label: '>3.0 🟠',
  },
  {
    id: 'AIF',
    code: 'AIF',
    label: 'AIF – Algoritmikus Interferencia Faktor',
    labelEn: 'Algorithmic Interference Factor',
    description: '1 − (organikus reach / total reach) – 0=organikus, 1=teljes algo-dominancia',
    descriptionEn: '1 − (organic reach / total reach) – 0=organic, 1=full algo-dominance',
    formula: 'AIF = 1 − organic_reach / total_reach',
    mechanism: 'M11 BIO-COG',
    keyFact: 'Kritikus: AIF > 0.7 = algo-dominancia',
    alertCode: 'ALGO-DOM',
    alertLevel: 'YELLOW',
    default: 0.82,
    min: 0,
    max: 1,
    step: 0.01,
    threshold_critical: 0.7,
    weight: 0.2,
    unit: '',
    color: '#dc2626',
    cds_effect: 'VKI_noo -0.2',
    cdp_effect: 'Digitális +0.1',
    cds_threshold_label: '>0.7 🟡',
  },
];

// ---------------------------------------------------------------------------
// 5 Zóna küszöbértékek
// ---------------------------------------------------------------------------

export const NOO_ZONES = [
  {
    id: 'GREEN',
    label: '🟢 Zöld',
    labelShort: 'ZÖLD',
    condition: 'CSI_noo < 2.0',
    status: 'NORMATÍV',
    statusEn: 'Normative – no active antiflux',
    action: '600.50 alap monitoring elegendő',
    color: '#16a34a',
    bg: '#f0fdf4',
    max: 2.0,
    cdp_level: '—',
  },
  {
    id: 'YELLOW',
    label: '🟡 Sárga',
    labelShort: 'SÁRGA',
    condition: '2.0 – 4.0',
    status: 'FIGYELEM',
    statusEn: 'Watch – moderate antiflux',
    action: '700.9 Digitális Minimalizmus pilot indítása',
    color: '#ca8a04',
    bg: '#fefce8',
    min: 2.0,
    max: 4.0,
    cdp_level: '900.2 Szint 1',
  },
  {
    id: 'ORANGE',
    label: '🟠 Narancs',
    labelShort: 'NARANCS',
    condition: '4.0 – 7.0',
    status: 'ANTIFLUX',
    statusEn: 'Antiflux active – systemic cognitive intrusion',
    action: '700.8 Közösségi Narratíva + 700.4 Decentralizált Kommunikáció',
    color: '#ea580c',
    bg: '#fff7ed',
    min: 4.0,
    max: 7.0,
    cdp_level: '900.2 Szint 2',
  },
  {
    id: 'RED',
    label: '🔴 Piros',
    labelShort: 'PIROS',
    condition: '7.0 – 10.0',
    status: 'KRITIKUS ANTIFLUX',
    statusEn: 'Critical – platform algo-dominance + narrative collapse',
    action: 'CEWS Track B aktiválás + azonnali 700.x beavatkozás',
    color: '#dc2626',
    bg: '#fef2f2',
    min: 7.0,
    max: 10.0,
    cdp_level: '900.2 Szint 3',
  },
  {
    id: 'CRITICAL',
    label: '⚫ Kritikus',
    labelShort: 'KRITIKUS',
    condition: 'CSI_noo > 10.0',
    status: 'RENDSZERSZINTŰ ANTIFLUX',
    statusEn: 'Systemic – noosphere collapse threshold',
    action: 'Azonnali 900.2 Szint 4 + CEWS M3/M11 teljes beavatkozás',
    color: '#111827',
    bg: '#f9fafb',
    min: 10.0,
    cdp_level: '900.2 Szint 4',
  },
];

// ---------------------------------------------------------------------------
// Trigger definíciók
// ---------------------------------------------------------------------------

export const NOO_TRIGGERS = [
  {
    id: 'DKI_HIGH',
    label: 'DKI Túllépés – Kognitív Intrúzió',
    labelEn: 'DKI Exceeded – Cognitive Intrusion',
    condition: 'DKI > 6',
    action: '700.9 Screen-time limit program + 900.1 VKI_noo korrekció',
    level: 'RED',
    color: '#0369a1',
    note: 'HU baseline (18–45 év): 9.1 óra/nap',
    solution_module: '700.9 Digitális Minimalizmus',
  },
  {
    id: 'NPR_POLARISED',
    label: 'NPR Trigger – Narratíva Polarizáció',
    labelEn: 'NPR Trigger – Narrative Polarisation',
    condition: 'NPR > 3.0',
    action: '700.8 Lokális fórumok + 900.2 Szint 2 aktiválás',
    level: 'ORANGE',
    color: '#7c3aed',
    note: 'X platform: NPR 4.2 (2026-02-18)',
    solution_module: '700.8 Közösségi Narratíva',
  },
  {
    id: 'AIF_ALGO_DOM',
    label: 'AIF Kritikus – Algoritmikus Dominancia',
    labelEn: 'AIF Critical – Algorithmic Dominance',
    condition: 'AIF > 0.7',
    action: '700.4 Fediverse / Decentralizált Kommunikáció aktiválás',
    level: 'YELLOW',
    color: '#dc2626',
    note: 'Facebook algo dominancia: 89% (2026-02-18)',
    solution_module: '700.4 Decentralizált Kommunikáció',
  },
  {
    id: 'NOO_CSI_CRITICAL',
    label: 'Noo-CSI Kritikus – Kompozit Küszöb',
    labelEn: 'Noo-CSI Critical – Composite Threshold',
    condition: 'CSI_noo > 6.9',
    action: 'CEWS Track B deploy + 900.2 Szint 2 kompozit trigger',
    level: 'CRITICAL',
    color: '#111827',
    note: 'HU pilot: CSI_noo = 6.9 🟠 (2026-02-18)',
  },
];

// ---------------------------------------------------------------------------
// 600.51 → 700.x Mapping
// ---------------------------------------------------------------------------

export const NOO_700_MAPPING = [
  {
    problem: 'DKI > 6 óra',
    module: '700.9 Digitális Minimalizmus',
    implementation: 'Screen-time limit + kognitív detox programok',
  },
  {
    problem: 'NPR > 3.0',
    module: '700.8 Közösségi Narratíva',
    implementation: 'Lokális fórumok + narratíva-diverzifikáció',
  },
  {
    problem: 'AIF > 0.7',
    module: '700.4 Decentralizált Kommunikáció',
    implementation: 'Fediverse platform migráció + organikus reach visszaépítés',
  },
];

// ---------------------------------------------------------------------------
// HU Pilot Baseline (2026-02-18)
// ---------------------------------------------------------------------------

export const HU_PILOT_BASELINE = {
  date: '2026-02-18',
  source: 'OSINT aggregátum, FDP > 0.8',
  entries: [
    { label: 'DKI (általános)', value: 7.2, unit: 'h', status: '🟠', zone: 'NARANCS' },
    { label: 'DKI (18–45 év)', value: 9.1, unit: 'h', status: '🔴', zone: 'PIROS' },
    { label: 'NPR (átlag)', value: 3.8, unit: '', status: '🟠', zone: 'NARANCS' },
    { label: 'NPR (X platform)', value: 4.2, unit: '', status: '🟠', zone: 'NARANCS' },
    { label: 'AIF (átlag)', value: 0.82, unit: '', status: '🔴', zone: 'PIROS' },
    { label: 'AIF (Facebook)', value: 0.89, unit: '', status: '🔴', zone: 'PIROS' },
    { label: 'CSI_noo', value: 6.9, unit: '', status: '🟠', zone: 'NARANCS', trigger: '900.2 Szint 2' },
  ],
};
