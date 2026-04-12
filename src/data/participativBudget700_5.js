/**
 * participativBudget700_5.js — EFU 700.5 Participatív Költségvetés (dFOS) v1.2
 *
 * Sorozat: 700 – Regeneratív Beavatkozások
 * Modell: Distributed Fiscal Operating System (dFOS) | Porto Alegre blueprint
 * NET_EFU: +450 000 EFU-E/év (1.5M fő × +0.3 HMI-gain)
 * Ellentét: 600.18 Intézményi Parazitizmus
 * Státusz: FC-APPROVED v1.2
 * Dátum: 2026-04-12
 */

// ---------------------------------------------------------------------------
// Modul meta
// ---------------------------------------------------------------------------

export const MODULE_META_700_5 = {
  id: '700.5',
  version: '1.2',
  title: 'Participatív Költségvetés',
  titleEn: 'Participatory Budgeting – Distributed Fiscal OS (dFOS)',
  subtitle: '700-as Stack Döntési Kernele | dFOS civilizációs erőforrás-elosztó OS',
  series: '700 – Regeneratív Beavatkozások',
  tier: 1,
  status: 'FC-APPROVED ✓',
  date: '2026-04-12',
  net_efu_ref: '+450 000 EFU-E/év (1.5M fős Porto Alegre referencia)',
  formula: 'dFOS = participation×0.30 + transparency×0.25 + info_quality×0.25 + accountability×0.20',
  antithesis: '600.18 Intézményi Parazitizmus',
  connections: ['700.1', '700.2', '700.3', '700.4', '600.18', '104.87', '205.3', '900.5'],
};

// ---------------------------------------------------------------------------
// Változók / csúszkák – 4 réteg
// ---------------------------------------------------------------------------

/** Részvétel és döntéshozatal réteg */
export const DFOS_VARIABLES_PARTICIPATION = [
  {
    id: 'participation_rate',
    label: 'Részvételi ráta',
    description: 'Aktív résztvevők aránya a teljes városban (Porto Alegre: 3.3%)',
    default: 0.033,
    min: 0.001,
    max: 0.15,
    step: 0.001,
    color: '#0369a1',
    positive: true,
    layer: 'participation',
    unit: '',
  },
  {
    id: 'budget_share',
    label: 'Participatív büdzsé aránya',
    description: 'A városi költségvetés mekkora hányada participatív (Porto Alegre: 17.5%)',
    default: 0.175,
    min: 0.01,
    max: 0.50,
    step: 0.005,
    color: '#0284c7',
    positive: true,
    layer: 'participation',
    unit: '',
  },
  {
    id: 'sortition_level',
    label: 'Sorshúzás (sortition) alkalmazása',
    description: 'Véletlenszerű képviselő-kiválasztás mértéke (0=nincs, 1=teljes)',
    default: 0.50,
    min: 0,
    max: 1,
    step: 0.05,
    color: '#0891b2',
    positive: true,
    layer: 'participation',
    unit: '',
  },
  {
    id: 'alloc_capex_strat',
    label: 'CAPEX+STRAT arány',
    description: 'Hosszú távú befektetések aránya (0=csak OPEX, 1=teljes CAPEX+STRAT)',
    default: 0.40,
    min: 0,
    max: 1,
    step: 0.05,
    color: '#0e7490',
    positive: true,
    layer: 'participation',
    unit: '',
  },
];

/** Átláthatóság és elszámoltathatóság réteg */
export const DFOS_VARIABLES_TRANSPARENCY = [
  {
    id: 'open_budget_pct',
    label: 'Nyilvános büdzsé %',
    description: 'A teljes költségvetés nyilvánosságra hozott aránya (0-1)',
    default: 0.85,
    min: 0,
    max: 1,
    step: 0.01,
    color: '#15803d',
    positive: true,
    layer: 'transparency',
    unit: '',
  },
  {
    id: 'public_monitoring',
    label: 'Nyilvános monitoring',
    description: 'Végrehajtás közvetlen nyilvános ellenőrzésének szintje',
    default: 0.70,
    min: 0,
    max: 1,
    step: 0.05,
    color: '#16a34a',
    positive: true,
    layer: 'transparency',
    unit: '',
  },
  {
    id: 'capture_risk',
    label: 'Befogási kockázat (Capture Risk)',
    description: 'Érdekcsoportok általi folyamat-eltérítés kockázata',
    default: 0.25,
    min: 0,
    max: 0.60,
    step: 0.01,
    color: '#dc2626',
    positive: false,
    layer: 'transparency',
    unit: '',
  },
];

/** Tudás és deliberáció réteg */
export const DFOS_VARIABLES_INFO = [
  {
    id: 'knowledge_pipeline',
    label: '700.4 Tudás pipeline ereje',
    description: 'Knowledge Commons → döntési minőség pipeline (0=nincs, 1=teljes)',
    default: 0.55,
    min: 0,
    max: 1,
    step: 0.05,
    color: '#7c3aed',
    positive: true,
    layer: 'info',
    unit: '',
  },
  {
    id: 'digital_tools',
    label: 'Digitális eszközök (async)',
    description: 'Online platformok és AI összefoglalók alkalmazása (deliberative exhaustion csökkentés)',
    default: 0.50,
    min: 0,
    max: 1,
    step: 0.05,
    color: '#6d28d9',
    positive: true,
    layer: 'info',
    unit: '',
  },
  {
    id: 'info_asymmetry',
    label: 'Információs aszimmetria',
    description: 'Szaktudás-különbség résztvevők közt (0=nincs, 1=teljes)',
    default: 0.20,
    min: 0,
    max: 0.50,
    step: 0.01,
    color: '#b45309',
    positive: false,
    layer: 'info',
    unit: '',
  },
  {
    id: 'deliberate_exhaustion',
    label: 'Deliberatív kimerülés (FLR)',
    description: 'Részvételi fáradtság és folyamat-kimerülés rátája',
    default: 0.12,
    min: 0,
    max: 0.30,
    step: 0.01,
    color: '#ea580c',
    positive: false,
    layer: 'info',
    unit: '',
  },
];

/** Városméret (kontextuális) */
export const DFOS_VARIABLES_CONTEXT = [
  {
    id: 'population_k',
    label: 'Városméret (ezer fő)',
    description: 'A város lélekszáma ezrekben (NET_EFU skálázáshoz)',
    default: 1500,
    min: 10,
    max: 10000,
    step: 10,
    color: '#374151',
    positive: true,
    layer: 'context',
    unit: 'k',
  },
];

export const DFOS_ALL_VARIABLES = [
  ...DFOS_VARIABLES_PARTICIPATION,
  ...DFOS_VARIABLES_TRANSPARENCY,
  ...DFOS_VARIABLES_INFO,
  ...DFOS_VARIABLES_CONTEXT,
];

// ---------------------------------------------------------------------------
// 5 Zóna
// ---------------------------------------------------------------------------

export const DFOS_ZONES = [
  {
    id: 'PARASITIC',
    label: '🔴 Intézményi Parazita',
    status: 'PARASITIC',
    condition: 'dFOS < 2',
    action: '600.18 aktív – top-down, 0.001% részvétel, korrupció strukturális',
    color: '#dc2626',
    bg: '#fef2f2',
    max: 2,
  },
  {
    id: 'WEAK',
    label: '🟠 Gyenge dFOS',
    status: 'WEAK',
    condition: '2 – 4',
    action: 'Részleges részvétel – magas befogási kockázat, szortíció szükséges',
    color: '#ea580c',
    bg: '#fff7ed',
    min: 2,
    max: 4,
  },
  {
    id: 'EMERGING',
    label: '🟡 Induló dFOS',
    status: 'EMERGING',
    condition: '4 – 6',
    action: 'Részvétel elindul – 700.4 pipeline aktiválás, info-aszimmetria csökkentés',
    color: '#ca8a04',
    bg: '#fefce8',
    min: 4,
    max: 6,
  },
  {
    id: 'ACTIVE',
    label: '🟢 Aktív dFOS',
    status: 'ACTIVE',
    condition: '6 – 8',
    action: 'Porto Alegre szint – R_future 1.1–1.3, HMI +2.0 EFU/lakos, korrupció −70%',
    color: '#16a34a',
    bg: '#f0fdf4',
    min: 6,
    max: 8,
  },
  {
    id: 'OPTIMAL',
    label: '⭐ Optimális dFOS Kernel',
    status: 'OPTIMAL',
    condition: 'dFOS ≥ 8',
    action: 'dFOS kernel aktív – R_future 1.4+, 700 stack closed-loop, globális replikáció',
    color: '#0369a1',
    bg: '#eff6ff',
    min: 8,
  },
];

// ---------------------------------------------------------------------------
// 4 Trigger
// ---------------------------------------------------------------------------

export const DFOS_TRIGGERS = [
  {
    id: 'CAPTURE_RISK_HIGH',
    label: 'CAPTURE_RISK_HIGH – Befogási kockázat kritikus',
    condition: 'capture_risk > 0.40 ÉS sortition_level < 0.30',
    action: '600.18 antiflux szükséges – sorshúzás aktiválása kötelező',
    level: 'RED',
    color: '#dc2626',
    positive: false,
  },
  {
    id: 'INFO_ASYMMETRY_HIGH',
    label: 'INFO_ASYMMETRY_HIGH – Szakértői gap kritikus',
    condition: 'info_asymmetry > 0.35 ÉS knowledge_pipeline < 0.30',
    action: '700.4 tudás pipeline aktiválás szükséges – szakértői support kötelező',
    level: 'ORANGE',
    color: '#ea580c',
    positive: false,
  },
  {
    id: 'PILOT_ACTIVE',
    label: 'PILOT_ACTIVE – Porto Alegre szintű aktiválás',
    condition: 'dfos_index ≥ 6.0',
    action: 'Pilot aktív – NET_EFU számítható, finanszírozás aktiválható',
    level: 'GREEN',
    color: '#16a34a',
    positive: true,
  },
  {
    id: 'DFOS_KERNEL_ACTIVE',
    label: 'DFOS_KERNEL_ACTIVE – 700 stack closed-loop',
    condition: 'dfos_index ≥ 8.0 ÉS knowledge_pipeline ≥ 0.70',
    action: '700 stack teljesen zárt – 700.4 → 700.5 → 700.1/2/3 → feedback loop aktív',
    level: 'GREEN',
    color: '#0369a1',
    positive: true,
  },
];
