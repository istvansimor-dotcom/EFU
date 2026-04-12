/**
 * digitalExtraction600_53.js — EFU 600.53 Digitális Extrakció & AI Parazitizmus v0.3
 *
 * Sorozat: 600 – Antiflux
 * Altípus: CFI-D (Cognitive Flux Inversion – Digital)
 * Irreverzibilitási súly: W_irrev = 0.78
 * Kockázati szint: SEV HIGH
 * Státusz: DRAFT v0.3 (Bővített – Kontroll + Limitációk integrált)
 * Dátum: 2026-03-26
 *
 * Kapcsolódó modulok: 600.52 (CFI-B / PFAS), 600.58 (CFI-N / UPF), 900.5 Dashboard
 * Kaszkád: 600.53 ↔ 600.58 ↔ 600.52
 */

// ---------------------------------------------------------------------------
// Modul meta
// ---------------------------------------------------------------------------

export const MODULE_META_53 = {
  id: '600.53',
  version: '0.3',
  title: 'Digitális Extrakció & AI Parazitizmus',
  titleEn: 'Digital Extraction & AI Parasitism',
  subtitle: 'CFI-D – Cognitive Flux Inversion (Digital)',
  subtitleEn: 'Attention extraction, cognitive fragmentation, algorithmic sovereignty loss',
  series: '600 – Antiflux',
  subtype: 'CFI-D',
  mechanism_primary: 'M11 BIO-COG',
  mechanism_secondary: 'M3 IDENTITY',
  W_irrev: 0.78,
  risk_level: 'SEV HIGH',
  tier: 1,
  priority: 8,
  status: 'DRAFT v0.3',
  date: '2026-03-26',
  efu_base: '1 EFU = 20 kg/nap emberi metabolikus fluxus (AFU közvetítéssel)',
  formula: [
    'F_detox = 0.40×offline_time/8 + 0.35×deep_work/6 + 0.25×sleep_quality',
    'B_addikció = 1 + β×ln(1 + screen_time)',
    'raw = 0.35×screen_time/16 + 0.20×notification_rate + 0.25×AI_content_ratio + 0.20×personalization_depth − 0.15×user_agency_index',
    'CFI_D_base = raw × 1/(1+F_detox) × B_addikció × 1000',
    'CFI_D = CFI_D_base × (1 + alpha_AI)',
    'CFI_D_net = max(0, CFI_D − CFI_D_regenerative)',
    'CFI_D_total(t) = CFI_D_net × (1 + Debt_rate_D × t)',
  ].join('\n'),
  cascade_modules: ['600.52 (CFI-B)', '600.58 (CFI-N)'],
  dashboard: '900.5',
  nexus: ['600.52', '600.58', '500.4', '700.4', '700.5', '700.9', '900.5', '104.13.3'],
  limitations: [
    'AFU-EFU kalibrációs paraméter (k) 900.5 pilot adatokra épül – jelenleg becsült',
    'β, Debt_rate_D, alpha_AI longitudinális kohorsz-validálást igényelnek',
    'BLACK trigger küszöbök (AI_content_ratio, personalization_depth, user_agency_index) platformfüggő kalibrációt igényelnek',
  ],
};

// ---------------------------------------------------------------------------
// 8 Változó definíciók
// ---------------------------------------------------------------------------

export const CFID_VARIABLES = [
  // --- Extractive inputs ---
  {
    id: 'screen_time',
    code: 'ST',
    label: 'ST – Napi képernyőidő',
    labelEn: 'Daily screen time',
    description: 'Átlagos napi képernyőidő az elmúlt 30 napra (óra/nap)',
    descriptionEn: 'Average daily screen time over last 30 days (hours/day)',
    group: 'extractive',
    mechanism: 'M11 BIO-COG',
    keyFact: 'Kognitív stressz trigger: >4 h/nap + CFI-D >500',
    default: 6.5,
    min: 0,
    max: 16,
    step: 0.1,
    unit: 'h/nap',
    weight: 0.35,
    normalizer: 16,
    threshold: 4,
    threshold_critical: 10,
    color: '#0369a1',
    positive: false,
  },
  {
    id: 'notification_rate',
    code: 'NR',
    label: 'NR – Értesítési ráta (diszrupció)',
    labelEn: 'Notification disruption rate',
    description: 'Figyelemdiszrupciós index – értesítések, task-switching (0=nincs, 1=folyamatos)',
    descriptionEn: 'Attention disruption index (0=none, 1=continuous)',
    group: 'extractive',
    mechanism: 'M11 BIO-COG',
    keyFact: 'Sustained attention time proxy: deep work ↓ arányos',
    default: 0.60,
    min: 0,
    max: 1,
    step: 0.01,
    unit: '',
    weight: 0.20,
    threshold: 0.5,
    color: '#7c3aed',
    positive: false,
  },
  {
    id: 'AI_content_ratio',
    code: 'ACR',
    label: 'ACR – AI/szintetikus tartalom arány',
    labelEn: 'AI / synthetic content ratio',
    description: 'A fogyasztott tartalom milyen hányada AI-generált/szintetikus (0=organikus, 1=teljes AI)',
    descriptionEn: 'Share of consumed content that is AI-generated or synthetic (0=organic, 1=full AI)',
    group: 'extractive',
    mechanism: 'M11 BIO-COG + M3 IDENTITY',
    keyFact: 'BLACK trigger: >0.6 + magas personalization + alacsony user_agency',
    default: 0.45,
    min: 0,
    max: 1,
    step: 0.01,
    unit: '',
    weight: 0.25,
    threshold: 0.6,
    color: '#dc2626',
    positive: false,
  },
  {
    id: 'personalization_depth',
    code: 'PD',
    label: 'PD – Algoritmikus személyre szabás mélysége',
    labelEn: 'Algorithmic personalisation depth',
    description: 'Filter bubble mélysége / platform algo dominancia (0=nyitott, 1=teljes zárt buborék)',
    descriptionEn: 'Filter bubble depth / platform algo dominance (0=open, 1=full closed bubble)',
    group: 'extractive',
    mechanism: 'M3 IDENTITY + M11 BIO-COG',
    keyFact: 'BLACK trigger: >0.7 + AI_content >0.6 + user_agency <0.3',
    default: 0.65,
    min: 0,
    max: 1,
    step: 0.01,
    unit: '',
    weight: 0.20,
    threshold: 0.7,
    color: '#ea580c',
    positive: false,
  },
  // --- Protective / detox inputs ---
  {
    id: 'offline_time',
    code: 'OT',
    label: 'OT – Napi offline idő (detox)',
    labelEn: 'Daily offline time (detox)',
    description: 'Képernyőn kívüli idő/nap (óra) – F_detox_kognitív komponens (w=0.40)',
    descriptionEn: 'Screen-free time per day (hours) – F_detox_kognitív component (w=0.40)',
    group: 'protective',
    mechanism: 'F_detox',
    keyFact: 'F_detox_kognitív = 0.40×OT/8 + 0.35×DW/6 + 0.25×SQ',
    default: 3.0,
    min: 0,
    max: 16,
    step: 0.1,
    unit: 'h/nap',
    weight_detox: 0.40,
    normalizer: 8,
    threshold: 4,
    color: '#16a34a',
    positive: true,
  },
  {
    id: 'deep_work_hours',
    code: 'DW',
    label: 'DW – Fókuszált deep work (h/nap)',
    labelEn: 'Focused deep work (h/day)',
    description: 'Megszakítás nélküli, fókuszált munkaórák naponta – F_detox_kognitív komponens (w=0.35)',
    descriptionEn: 'Uninterrupted focused work hours per day – F_detox component (w=0.35)',
    group: 'protective',
    mechanism: 'F_detox',
    default: 2.0,
    min: 0,
    max: 12,
    step: 0.1,
    unit: 'h/nap',
    weight_detox: 0.35,
    normalizer: 6,
    threshold: 2,
    color: '#0d9488',
    positive: true,
  },
  {
    id: 'sleep_quality_index',
    code: 'SQ',
    label: 'SQ – Alvásminőség index',
    labelEn: 'Sleep quality index',
    description: 'Validált alvásminőség-index (0=kritikusan rossz, 1=optimális) – F_detox_kognitív komponens (w=0.25)',
    descriptionEn: 'Validated sleep quality index (0=critical, 1=optimal) – F_detox component (w=0.25)',
    group: 'protective',
    mechanism: 'F_detox',
    default: 0.55,
    min: 0,
    max: 1,
    step: 0.01,
    unit: '',
    weight_detox: 0.25,
    threshold: 0.5,
    color: '#6d28d9',
    positive: true,
  },
  {
    id: 'user_agency_index',
    code: 'UA',
    label: 'UA – Felhasználói autonómia index',
    labelEn: 'User agency index',
    description: 'Tudatos digitális önrendelkezés mértéke (0=teljes algoritmikus befogás, 1=teljes autonómia) – védőfaktor',
    descriptionEn: 'Conscious digital self-determination (0=full capture, 1=full autonomy) – protective factor',
    group: 'protective',
    mechanism: 'M3 IDENTITY',
    keyFact: 'BLACK trigger: UA < 0.3 + ACR > 0.6 + PD > 0.7',
    default: 0.35,
    min: 0,
    max: 1,
    step: 0.01,
    unit: '',
    threshold: 0.3,
    color: '#15803d',
    positive: true,
  },
];

// ---------------------------------------------------------------------------
// Modell paraméterei
// ---------------------------------------------------------------------------

export const CFID_PARAMS = {
  beta: {
    id: 'beta',
    label: 'β – Addikciós szorzó paraméter',
    description: 'B_addikció = 1 + β×ln(1+screen_time). Kalibrálható: 0.1–0.3',
    default: 0.18,
    min: 0.05,
    max: 0.35,
    step: 0.01,
    unit: '',
    color: '#b91c1c',
  },
  alpha_AI: {
    id: 'alpha_AI',
    label: 'α_AI – AI erősítési faktor',
    description: 'CFI_D_AI = CFI_D × (1 + α_AI). AI integráció szintjétől függ: 0.2–0.6',
    default: 0.35,
    min: 0.0,
    max: 0.8,
    step: 0.01,
    unit: '',
    color: '#b45309',
  },
  CFI_D_regenerative: {
    id: 'CFI_D_regenerative',
    label: 'CFI_D_regen – Regeneratív digitális hatás',
    description: '700.x programok által csökkentett antiflux (oktatás, terápia, kognitív tréning)',
    default: 50,
    min: 0,
    max: 500,
    step: 10,
    unit: 'CFI-D egység',
    color: '#16a34a',
  },
  Debt_rate_D: {
    id: 'Debt_rate_D',
    label: 'Debt_rate_D – Kognitív adósság évi ráta',
    description: 'τ_kognitív = 1–5 év; CFI_D_total(t) = CFI_D_net × (1 + Debt_rate_D × t)',
    default: 0.12,
    min: 0.05,
    max: 0.25,
    step: 0.01,
    unit: '/év',
    color: '#9a3412',
  },
  t_years: {
    id: 't_years',
    label: 't – Időhorizont (év)',
    description: 'Kognitív adósság időhorizonja (t)',
    default: 3,
    min: 0,
    max: 10,
    step: 1,
    unit: 'év',
    color: '#374151',
  },
};

// ---------------------------------------------------------------------------
// 5 Zóna (CFI-D skálán)
// ---------------------------------------------------------------------------

export const CFID_ZONES = [
  {
    id: 'GREEN',
    label: '🟢 Normatív',
    labelShort: 'NORMATÍV',
    condition: 'CFI_D_total < 200',
    status: 'NORMATÍV',
    statusEn: 'Normative – no significant antiflux',
    action: '600.50 / 600.51 alap monitoring elegendő',
    color: '#16a34a',
    bg: '#f0fdf4',
    max: 200,
    dashboard_action: '—',
    allocation: '< 5% kognitív reziliencia allokáció',
  },
  {
    id: 'YELLOW',
    label: '🟡 Figyelem',
    labelShort: 'FIGYELEM',
    condition: '200 – 500',
    status: 'FIGYELEM',
    statusEn: 'Watch – moderate cognitive extraction',
    action: '700.9 Digitális Minimalizmus pilot + screen-time limit program',
    color: '#ca8a04',
    bg: '#fefce8',
    min: 200,
    max: 500,
    dashboard_action: 'CEWS: YELLOW kognitív stressz riasztás',
    allocation: '~5–10% kognitív reziliencia allokáció',
  },
  {
    id: 'ORANGE',
    label: '🟠 Kognitív Antiflux',
    labelShort: 'ANTIFLUX',
    condition: '500 – 1000',
    status: 'KOGNITÍV ANTIFLUX',
    statusEn: 'Cognitive antiflux – sustained extraction active',
    action: '700.5 Digitális írástudás + 700.4 Decentralizált Kommunikáció + kötelező algo audit',
    color: '#ea580c',
    bg: '#fff7ed',
    min: 500,
    max: 1000,
    dashboard_action: 'CEWS: ORANGE kognitív stressz + 900.5 Szint 2',
    allocation: '~10–20% kognitív reziliencia allokáció',
  },
  {
    id: 'RED',
    label: '🔴 Kritikus',
    labelShort: 'KRITIKUS',
    condition: '1000 – 2000',
    status: 'KRITIKUS ANTIFLUX',
    statusEn: 'Critical – platform capture + cognitive collapse risk',
    action: 'Fire Chief eszkaláció + szuverén digitális infrastruktúra program azonnali indítás',
    color: '#dc2626',
    bg: '#fef2f2',
    min: 1000,
    max: 2000,
    dashboard_action: 'CEWS: RED + Fire Chief automatikus eszkaláció',
    allocation: '~20–25% kognitív reziliencia allokáció (500.4)',
  },
  {
    id: 'BLACK',
    label: '⚫ Algoritmikus Befogás',
    labelShort: 'BEFOGÁS',
    condition: 'CFI_D_total > 2000 VAGY BLACK trigger aktív',
    status: 'ALGORITMIKUS BEFOGÁS',
    statusEn: 'Algorithmic capture – user agency loss',
    action: 'Azonnali 900.5 Szint 4 + CEWS M3/M11 teljes beavatkozás + adat-reintegráció protokoll',
    color: '#111827',
    bg: '#f9fafb',
    min: 2000,
    dashboard_action: 'CEWS: BLACK – algoritmikus befogás, külön protokoll',
    allocation: 'max 25% kötelező allokáció (500.4)',
  },
];

// ---------------------------------------------------------------------------
// Trigger definíciók
// ---------------------------------------------------------------------------

export const CFID_TRIGGERS = [
  {
    id: 'KOGNITIV_STRESSZ',
    label: 'Kognitív Stressz Riasztás',
    labelEn: 'Cognitive Stress Alert',
    condition: 'screen_time > 4 h ÉS CFI_D > 500',
    conditionEn: 'screen_time > 4h AND CFI_D > 500',
    action: '700.9 Screen-time limit program + 900.5 YELLOW/ORANGE riasztás',
    level: 'ORANGE',
    color: '#ea580c',
    note: 'Időablak: 30 napos gördülő átlag + növekvő trend',
    solution_module: '700.9 Digitális Minimalizmus',
  },
  {
    id: 'FIRE_CHIEF',
    label: 'Fire Chief Eszkaláció',
    labelEn: 'Fire Chief Escalation',
    condition: 'CFI_D > 1000',
    conditionEn: 'CFI_D > 1000',
    action: 'CEWS RED + Fire Chief automatikus eszkaláció + 500.4 visszacsatolás',
    level: 'RED',
    color: '#dc2626',
    note: 'Szuverén digitális infrastruktúra program azonnali indítás',
    solution_module: '700.4 Decentralizált Kommunikáció',
  },
  {
    id: 'ALGORITMIKUS_BEFOGÁS',
    label: 'Algoritmikus Befogás (BLACK)',
    labelEn: 'Algorithmic Capture (BLACK)',
    condition: 'ACR > 0.6 ÉS PD > 0.7 ÉS UA < 0.3',
    conditionEn: 'AI_content_ratio > 0.6 AND personalization_depth > 0.7 AND user_agency_index < 0.3',
    action: 'CEWS BLACK + külön algoritmikus befogás protokoll + adat-reintegráció',
    level: 'CRITICAL',
    color: '#111827',
    note: 'Platformfüggő küszöbök – 900.5 pilottal validálandó',
    solution_module: '700.5 Digitális írástudás + 700.4 Fediverse',
  },
  {
    id: 'KASZKÁD_TRIGGER',
    label: 'Keresztmodul Kaszkád Aktív',
    labelEn: 'Cross-module Cascade Active',
    condition: 'CFI_D > 500 ÉS (CFI-B v. CFI-N magas)',
    conditionEn: 'CFI_D > 500 AND (CFI-B or CFI-N elevated)',
    action: '600.53↔600.58↔600.52 kaszkád monitorozás + integrált 700.x beavatkozás',
    level: 'HIGH',
    color: '#7c3aed',
    note: 'Digitális addikció ↑ → UPF↑ → PFAS↑ → mikrobiom↓ → kognitív reziliencia↓',
    solution_module: 'Multi-modul 600.52 + 600.58 + 600.53',
  },
];

// ---------------------------------------------------------------------------
// Kaszkád modell (600.53 ↔ 600.58 ↔ 600.52)
// ---------------------------------------------------------------------------

export const CFID_CASCADE = [
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

export const CFID_INTERVENTIONS = [
  {
    timeframe: 'Azonnali (0–72 óra)',
    steps: [
      { title: 'Infinite scroll tiltás (közszféra)', impact: 'Immediate attention recovery', module: '700.x' },
      { title: 'Algoritmikus expozíciós baseline felmérése', impact: 'Mérési alap + audit start', module: '900.5' },
      { title: 'Adat extrakció audit indítás', impact: 'Transparency baseline', module: '600.7/600.8' },
    ],
    color: '#dc2626',
  },
  {
    timeframe: 'Rövid táv (1–4 hét)',
    steps: [
      { title: '700.5 Digitális írástudás program', impact: 'User agency ↑ ~+0.15', module: '700.5' },
      { title: 'Kötelező algoritmus audit (kritikus platformok)', impact: 'Personalization depth ↓', module: '600.7' },
      { title: 'Time well spent design implementáció', impact: 'AI kompenzáció, detox UX', module: '700.9' },
    ],
    color: '#ea580c',
  },
  {
    timeframe: 'Középtáv (1–6 hónap)',
    steps: [
      { title: 'Szuverén digitális infrastruktúra kiépítése', impact: 'Algo-dominancia ↓, sovereignty ↑', module: '700.4' },
      { title: 'Kognitív regenerációs zónák (offline terek)', impact: 'F_detox_kognitív ↑ ~+0.25', module: '700.9' },
      { title: 'Adat-reintegrációs protokollok', impact: 'Kollektív adattulajdon, user agency ↑', module: '500.4' },
    ],
    color: '#ca8a04',
  },
];

// ---------------------------------------------------------------------------
// Planetáris EFU skála (nagyságrendi szintézis)
// ---------------------------------------------------------------------------

export const CFID_PLANETARY = [
  { label: 'Globális figyelem extrakció', value: '~28 milliárd óra/nap', unit: '(social + apps)', color: '#0369a1' },
  { label: 'Figyelemmonetizáció', value: '~500 milliárd USD/év', unit: '(globális platform GDP)', color: '#7c3aed' },
  { label: 'AI tréning korpusz', value: '~1 billió token', unit: '(fizetetlen emberi adat)', color: '#dc2626' },
  { label: 'Mentális egészség költség', value: '~1 billió USD/év', unit: '(digitális stressz, zavarok)', color: '#b91c1c' },
];
