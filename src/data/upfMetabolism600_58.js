/**
 * upfMetabolism600_58.js — EFU 600.58 UPF Anyagcsere Parazitizmus v0.2
 *
 * Sorozat: 600 – Antiflux
 * Altípus: CFI-N (Cognitive Flux Inversion – Nutritional)
 * Irreverzibilitási súly: W_irrev = 0.70
 * Kockázati szint: SEV MAGAS
 * Státusz: DRAFT v0.2
 * Dátum: 2026-03-26
 *
 * Kapcsolódó modulok: 600.52 (CFI-B / PFAS), 600.53 (CFI-D / Digitális)
 * Kaszkád: 600.53 ↔ 600.58 ↔ 600.52
 */

// ---------------------------------------------------------------------------
// Modul meta
// ---------------------------------------------------------------------------

export const MODULE_META_58 = {
  id: '600.58',
  version: '0.2',
  title: 'UPF – Anyagcsere Parazitizmus',
  subtitle: 'CFI-N – Metabolikus Fluxus Inverzió (Táplálkozási)',
  series: '600 – Antiflux',
  subtype: 'CFI-N',
  W_irrev: 0.70,
  risk_level: 'SEV MAGAS',
  status: 'DRAFT v0.2',
  date: '2026-03-26',
  formula: [
    'B_food = UPF<0.20→1.0 | UPF<0.50→1.3 | UPF≥0.50→1.7',
    'extractive_sum = UPF×IR×0.30 + UPF×II×0.25 + UPF×(1−RG)×0.25 + PS×0.20',
    'CFI_N_base = extractive_sum × W_irrev × (1/RG) × B_food × 1000',
    'CFI_N_pfas = CFI_N_base × (1 + 0.4 × cfib_factor)',
    'CFI_N_total(t) = CFI_N_pfas × (1 + Debt_rate_N × t)',
  ].join('\n'),
  cascade_modules: ['600.52 (CFI-B)', '600.53 (CFI-D)'],
  dashboard: '900.5',
  nexus: ['600.52', '600.53', '500.4', '700.1', '104.13.3', '900.5'],
  limitations: [
    'W_irrev = 0.70 – piloton alapuló becslés, longitudinális validálás szükséges',
    'B_food küszöbök (<20%, <50%) NOVA osztályozáson alapulnak',
    'cfib_factor (PFAS kaszkád erőssége) 600.52 pilot adatokra épül',
  ],
};

// ---------------------------------------------------------------------------
// 6 Változó definíciók
// ---------------------------------------------------------------------------

export const CFIN_VARIABLES = [
  {
    id: 'upf_ratio',
    code: 'UPF',
    label: 'UPF – Ultrafeldolgozott élelmiszer arány',
    description: 'Napi étrend hányada UPF (0=nincs UPF, 1=100% UPF)',
    group: 'extractive',
    keyFact: 'Függőségi szorzó: <20%→1.0, 20-50%→1.3, >50%→1.7',
    default: 0.45,
    min: 0,
    max: 1,
    step: 0.01,
    threshold: 0.40,
    weight: 0.35,
    color: '#dc2626',
    positive: false,
    unit: '',
  },
  {
    id: 'insulin_resistance',
    code: 'IR',
    label: 'IR – Inzulinrezisztencia fok',
    description: 'Metabolikus diszreguláció – inzulinrezisztencia szintje (0=normál, 1=kritikus)',
    group: 'extractive',
    keyFact: 'HMI_metabolic: -2.8 referencia',
    default: 0.40,
    min: 0,
    max: 1,
    step: 0.01,
    threshold: 0.40,
    weight: 0.25,
    color: '#b91c1c',
    positive: false,
    unit: '',
  },
  {
    id: 'inflammation_index',
    code: 'II',
    label: 'II – Szisztémás gyulladás index',
    description: 'Krónikus alacsony fokú gyulladás (0=nincs, 1=kritikus)',
    group: 'extractive',
    keyFact: 'Immundiszreguláció + epigenetikai torzulás marker',
    default: 0.35,
    min: 0,
    max: 1,
    step: 0.01,
    threshold: 0.35,
    weight: 0.20,
    color: '#ea580c',
    positive: false,
    unit: '',
  },
  {
    id: 'pfas_synergy',
    code: 'PS',
    label: 'PS – PFAS szinergia expozíció (normált)',
    description: 'PFAS csomagolásból és UPF adalékokból eredő expozíció – 600.52 kaszkád input (0=nincs, 1=kritikus)',
    group: 'extractive',
    keyFact: 'CFI_total = CFI-N × (1 + 0.4 × CFI-B/ref) – legerősebb kaszkád',
    default: 0.30,
    min: 0,
    max: 1,
    step: 0.01,
    threshold: 0.20,
    weight: 0.20,
    color: '#7c3aed',
    positive: false,
    unit: '',
  },
  {
    id: 'F_regen_gut',
    code: 'RG',
    label: 'RG – Bélflóra regeneráló kapacitás',
    description: 'Mikrobiom egészség – gut regenerációs kapacitás (0=összeomlott, 1=optimális)',
    group: 'protective',
    keyFact: 'F_regen_gut = divisor – csökkenti a CFI-N értékét (magasabb = jobb)',
    default: 0.40,
    min: 0,
    max: 1,
    step: 0.01,
    threshold: 0.50,
    weight_regen: 1.0,
    color: '#16a34a',
    positive: true,
    unit: '',
  },
  {
    id: 'microbiom_loss',
    code: 'MB',
    label: 'MB – Mikrobiom diverzitás veszteség',
    description: 'Mikrobiom diverzitás csökkenése (0=egészséges, 1=teljes összeomlás)',
    group: 'extractive',
    keyFact: 'Mikrobiom: -35% (EFU hatás) – kaszkád 600.53↔600.58',
    default: 0.45,
    min: 0,
    max: 1,
    step: 0.01,
    threshold: 0.40,
    weight: 0.0,
    color: '#0d9488',
    positive: false,
    unit: '',
  },
];

// ---------------------------------------------------------------------------
// Modell paraméterei
// ---------------------------------------------------------------------------

export const CFIN_PARAMS = {
  Debt_rate_N: {
    id: 'Debt_rate_N',
    label: 'Debt_rate_N – Metabolikus adósság évi ráta',
    description: 'τ_metabolic = 3–10 év; CFI_N_total(t) = CFI_N × (1 + Debt_rate_N × t)',
    default: 0.10,
    min: 0.05,
    max: 0.20,
    step: 0.01,
    unit: '/év',
    color: '#9a3412',
  },
  t_years: {
    id: 't_years',
    label: 't – Időhorizont (év)',
    description: 'Metabolikus adósság időhorizonja (t)',
    default: 5,
    min: 0,
    max: 15,
    step: 1,
    unit: 'év',
    color: '#374151',
  },
  cfib_factor: {
    id: 'cfib_factor',
    label: 'CFI-B szinergia faktor (0–1)',
    description: '600.52 PFAS kaszkád erőssége – CFI_total = CFI_N × (1 + 0.4 × cfib_factor)',
    default: 0.25,
    min: 0,
    max: 1,
    step: 0.01,
    unit: '',
    color: '#7c3aed',
  },
};

// ---------------------------------------------------------------------------
// 5 Zóna (CFI-N skálán)
// ---------------------------------------------------------------------------

export const CFIN_ZONES = [
  {
    id: 'GREEN',
    label: '🟢 Normatív',
    labelShort: 'NORMATÍV',
    condition: 'CFI_N < 200',
    status: 'NORMATÍV',
    action: '700.1 alapmonitoring',
    color: '#16a34a',
    bg: '#f0fdf4',
    max: 200,
    dashboard_action: '—',
    allocation: '< 5% metabolikus reziliencia allokáció',
  },
  {
    id: 'YELLOW',
    label: '🟡 Figyelem',
    labelShort: 'FIGYELEM',
    condition: '200 – 400',
    status: 'FIGYELEM',
    action: 'NOVA címkézés + lokális élelmiszerbeszerzés pilot',
    color: '#ca8a04',
    bg: '#fefce8',
    min: 200,
    max: 400,
    dashboard_action: 'CEWS: YELLOW metabolikus riasztás',
    allocation: '~5–10% metabolikus reziliencia allokáció',
  },
  {
    id: 'ORANGE',
    label: '🟠 Metabolikus Antiflux',
    labelShort: 'ANTIFLUX',
    condition: '400 – 700',
    status: 'METABOLIKUS ANTIFLUX',
    action: 'UPF adó + kötelező CFI-N audit + mikrobiom program',
    color: '#ea580c',
    bg: '#fff7ed',
    min: 400,
    max: 700,
    dashboard_action: 'CEWS: ORANGE metabolikus antiflux + 900.5 Szint 2',
    allocation: '~10–20% metabolikus reziliencia allokáció',
  },
  {
    id: 'RED',
    label: '🔴 Kritikus – Fire Chief szint',
    labelShort: 'KRITIKUS',
    condition: '700 – 1200',
    status: 'KRITIKUS – Fire Chief szint',
    action: 'Fire Chief eszkaláció + 500.4 30% kötelező allokáció',
    color: '#dc2626',
    bg: '#fef2f2',
    min: 700,
    max: 1200,
    dashboard_action: 'CEWS: RED + Fire Chief automatikus eszkaláció',
    allocation: '~20–30% metabolikus reziliencia allokáció (500.4)',
  },
  {
    id: 'CRITICAL',
    label: '⚫ Civilizációs Antiflux Spirál',
    labelShort: 'SPIRÁL',
    condition: 'CFI_N > 1200',
    status: 'CIVILIZÁCIÓS ANTIFLUX SPIRÁL',
    action: 'Azonnali 900.5 Szint 4 + 600.53↔600.52 kaszkád protokoll',
    color: '#111827',
    bg: '#f9fafb',
    min: 1200,
    dashboard_action: 'CEWS: BLACK – civilizációs antiflux spirál',
    allocation: 'max 30% kötelező allokáció (500.4)',
  },
];

// ---------------------------------------------------------------------------
// Trigger definíciók
// ---------------------------------------------------------------------------

export const CFIN_TRIGGERS = [
  {
    id: 'KOMBINALT_BIOKOCKAZAT',
    label: 'Kombinált Bio-kockázat Riasztás',
    condition: 'upf_ratio > 0.40 ÉS pfas_synergy > 0.20',
    action: '900.5 🔴 Kombinált bio-kockázat riasztás',
    level: 'RED',
    color: '#dc2626',
  },
  {
    id: 'FIRE_CHIEF',
    label: 'Fire Chief Eszkaláció',
    condition: 'CFI_N > 700',
    action: 'Fire Chief + 500.4 minimum 30% allokáció kötelező',
    level: 'RED',
    color: '#dc2626',
  },
  {
    id: 'CIVILIZACIOS_SPIRAL',
    label: 'Civilizációs Antiflux Spirál',
    condition: 'CFI_N > 500 ÉS (600.53 CFI-D magas)',
    action: '⚫ Civilizációs antiflux spirál – 600.53↔600.58↔600.52 kaszkád aktív',
    level: 'CRITICAL',
    color: '#111827',
  },
  {
    id: 'MIKROBIOM_KOLAPS',
    label: 'Mikrobiom Kolaps',
    condition: 'F_regen_gut < 0.30 ÉS microbiom_loss > 0.60',
    action: 'Mikrobiom rehabilitáció program + 700.1 regeneratív mezőgazdaság',
    level: 'HIGH',
    color: '#7c3aed',
  },
];

// ---------------------------------------------------------------------------
// Kaszkád modell (600.53 ↔ 600.58 ↔ 600.52)
// ---------------------------------------------------------------------------

export const CFIN_CASCADE = [
  {
    step: 1,
    from: '600.53 Digitális addikció ↑',
    to: '600.58 UPF fogyasztás ↑',
    mechanism: 'Figyelem kimerülés → impulzusvezérelt evési döntések',
    color: '#0369a1',
  },
  {
    step: 2,
    from: '600.58 UPF fogyasztás ↑',
    to: '600.52 PFAS + vegyi expozíció ↑',
    mechanism: 'Feldolgozott élelmiszer → PFAS csomagolás + adalékok',
    color: '#7c3aed',
  },
  {
    step: 3,
    from: '600.52 PFAS + UPF kombinált hatás',
    to: 'Mikrobiom összeomlás ↑',
    mechanism: 'Kémiai + táplálkozási antiflux → bélflóra degradáció',
    color: '#dc2626',
  },
  {
    step: 4,
    from: 'Mikrobiom összeomlás',
    to: '600.53 Kognitív reziliencia ↓ (zárt hurok)',
    mechanism: 'Bél-agy tengely → kognitív kapacitás csökken → digitális addikció erősödik',
    color: '#111827',
  },
];

// ---------------------------------------------------------------------------
// Stratégiai beavatkozások
// ---------------------------------------------------------------------------

export const CFIN_INTERVENTIONS = [
  {
    timeframe: 'Azonnali (0–72 óra)',
    steps: [
      { title: 'UPF audit', impact: 'Baseline felmérés + NOVA osztályozás', module: '700.1' },
      { title: 'PFAS csomagolás vizsgálat', impact: 'Kombinált expozíció feltérképezése', module: '600.52' },
      { title: 'Iskolai étrend baseline', impact: 'Generációs kockázat mérési alap', module: '700.1' },
    ],
    color: '#dc2626',
  },
  {
    timeframe: 'Rövid táv (1–4 hét)',
    steps: [
      { title: 'NOVA címkézés kötelezővé tétele', impact: 'UPF arány ↓ ~-0.10', module: '700.1' },
      { title: 'Lokális élelmiszerbeszerzés pilot', impact: 'PFAS szinergia ↓', module: '700.1' },
      { title: 'UPF transzparencia program', impact: 'Fogyasztói tudatosság ↑', module: '500.4' },
    ],
    color: '#ea580c',
  },
  {
    timeframe: 'Középtáv (1–6 hónap)',
    steps: [
      { title: 'UPF adó bevezetése', impact: 'UPF arány ↓ ~-0.15 (árérzékenység)', module: '500.4' },
      { title: 'Kötelező CFI-N audit', impact: 'Rendszerszintű metabolikus monitoring', module: '900.5' },
      { title: 'Mikrobiom program', impact: 'F_regen_gut ↑ ~+0.20', module: '700.1' },
    ],
    color: '#ca8a04',
  },
];

// ---------------------------------------------------------------------------
// Planetáris EFU skála
// ---------------------------------------------------------------------------

export const CFIN_PLANETARY = [
  { label: 'UPF piac', value: '$2.1T', unit: '(globális éves forgalom)', color: '#dc2626' },
  { label: 'Externalizált kár', value: '$2.3T', unit: '(egészségügyi + környezeti)', color: '#b91c1c' },
  { label: 'T2DM növekedés', value: '+150%', unit: '(1990–2024 globális)', color: '#ea580c' },
  { label: 'Mikrobiom csökkenés', value: '-40%', unit: '(ipari populációkban)', color: '#0d9488' },
];
