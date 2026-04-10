/**
 * happiness600_85.js — EFU 600.85 v2.1 Boldogság-gazdaság Paradoxona
 *
 * Eudaimónia vs. Hedónia | 600-as Pozitív Referencia-Mérleg
 * F-META Domain | FC-APPROVED | POSITIVE_SECONDARY = TRUE
 *
 * Fő képletek:
 *   BH_t  = |ΔH_t / ΔGDP_t|_window  |  BH = |(dH/H)/(dGDP/GDP)|
 *   CBS   = α × CBS_ratio + (1−α) × CBS_entropy
 *   η(W)  = ΔH_t / ΔCBS_{t-1}   |   H = H_h + H_e
 *   BGP   = (H_spend/fő × DT_index) / (η(W)_baseline + |η(W)|)
 *   Δη(W) = η(W)_eudaimon × W_e − η(W)_hedón × W_h
 *
 * CEWS: CRITICAL | ADAPTIVE STRESS | OPTIMAL GROWTH | LATENT DECLINE
 * 600.79 → DEPRECATED (merged into 600.85 v2.0)
 * Reference: EFU 600.85 v2.1 FINAL (2026.04.10)
 */

// ---------------------------------------------------------------------------
// Modul metaadatok
// ---------------------------------------------------------------------------

export const MODULE_META_85 = {
  code:            '600.85',
  title:           'Boldogság-gazdaság Paradoxona',
  subtitle:        'Eudaimónia vs. Hedónia',
  domain:          'F-META',
  status:          'FC-APPROVED',
  version:         'v2.1 FINAL',
  date:            '2026.04.10',
  tier:            'Tier 1',
  priority:        '9 / 10',
  positive_secondary: true,
  category:        'C – Kognitív Parazitizmus (pozitív mérleg)',
  eta_w_baseline:  0.70,
  cfib_ref:        300,
  deprecated:      ['600.79'],
  related: [
    '104.87', '104.88', '600.20', '050.3', '900.5', '600.67',
    '600.78', '600.82', '600.83', '600.86', '600.87', '600.88',
    '104.37', '104.45', '104.46', '105.4', '700.1', '700.5',
  ],
};

// ---------------------------------------------------------------------------
// CEWS Állapotmátrix (§IX — CBS × η(W))
// ---------------------------------------------------------------------------

export const CEWS_HAPPINESS_STATES = [
  {
    id:      'CRITICAL',
    label:   'CRITICAL',
    cbsHigh: true,
    etaWPositive: false,
    color:   '#dc2626',
    description: 'Klasszikus krízis: stressz nő, boldogság csökken',
    trigger: 'CBS↑  ∧  BGP_score > 1',
    action:  'Azonnali policy beavatkozás szükséges',
  },
  {
    id:      'ADAPTIVE_STRESS',
    label:   'ADAPTIVE STRESS',
    cbsHigh: true,
    etaWPositive: true,
    color:   '#ca8a04',
    description: 'Eudaimonikus növekedés stressz közben',
    trigger: 'CBS↑  ∧  BGP_score < 1',
    action:  'Eudaimonikus megerősítés javasolt',
  },
  {
    id:      'OPTIMAL_GROWTH',
    label:   'OPTIMAL GROWTH',
    cbsHigh: false,
    etaWPositive: true,
    color:   '#16a34a',
    description: 'Ideális: alacsony stressz, növekvő boldogság',
    trigger: 'CBS↓  ∧  BGP_score < 1',
    action:  'Rendszerstabilitás fenntartása — policy célállapot',
  },
  {
    id:      'LATENT_DECLINE',
    label:   'LATENT DECLINE',
    cbsHigh: false,
    etaWPositive: false,
    color:   '#7c3aed',
    description: 'Rejtett romlás: kedvezőtlen tendencia látens stressz alatt',
    trigger: 'CBS↓  de  η_e < |η_h|',
    action:  'Monitoring fokozása szükséges',
  },
];

// ---------------------------------------------------------------------------
// Licenc Kategóriák (§XII — 600.85 EFU-minősítés)
// ---------------------------------------------------------------------------

export const LICENSE_CATEGORIES_85 = [
  { level: 1, bgp_max: 0.2,  eta_min: 0.80, label: 'EUDAIMÓNIA',    color: '#16a34a', desc: 'FC Farm típus' },
  { level: 2, bgp_max: 1.0,  eta_min: 0.60, label: 'REGENERATÍV',   color: '#0891b2', desc: 'Fenntartható gazdaság' },
  { level: 3, bgp_max: 3.0,  eta_min: 0.40, label: 'SEMLEGES',      color: '#ca8a04', desc: 'Átmeneti zóna' },
  { level: 4, bgp_max: Infinity, eta_min: 0, label: 'PARAZITA',     color: '#dc2626', desc: 'Antiflux termelő' },
];

// ---------------------------------------------------------------------------
// Globális Happiness Industry Mérleg (~4.5T$/év) (§VII)
// ---------------------------------------------------------------------------

export const HAPPINESS_INDUSTRY = [
  { id: 'SOCIAL_MEDIA', label: 'Social media',    size_T: 0.6,  eta_effect: '↓↓',  bgp_range: '3.2–5.0', nexus: '600.78', color: '#dc2626' },
  { id: 'ALCOHOL_DRUG', label: 'Alkohol / Drog',  size_T: 1.5,  eta_effect: '↓↓↓', bgp_range: '> 4.0',  nexus: '600.23 / 600.25', color: '#7c3aed' },
  { id: 'WELLNESS',     label: 'Wellness ipar',   size_T: 1.2,  eta_effect: '↓',   bgp_range: '1.5–2.5', nexus: '600.36', color: '#ea580c' },
  { id: 'PHARMA',       label: 'Pharma / psych',  size_T: 0.7,  eta_effect: '↓↓',  bgp_range: '> 3.0',  nexus: '600.33 / 600.34', color: '#be185d' },
];

// ---------------------------------------------------------------------------
// Eudaimónia vs. Hedónia EFU-Réteg Térkép (§VI)
// ---------------------------------------------------------------------------

export const HEDONIA_EUDAIMONIA_MAP = [
  { type: 'Hedónia-digitális',  layer: 'C',  eta_effect: '↓↓',  bgp_score: '> 3.0',  example: 'TikTok, Netflix',       nexus: '600.78', color: '#dc2626' },
  { type: 'Hedónia-anyagi',     layer: 'I.E', eta_effect: '↓',  bgp_score: '1.5–3.0', example: 'Wellness ipar',         nexus: '600.36', color: '#ea580c' },
  { type: 'Hedónia-kémiai',     layer: 'B',  eta_effect: '↓↓↓', bgp_score: '> 4.0',  example: 'Alkohol, pharma',       nexus: '600.23/25', color: '#7c3aed' },
  { type: 'Eudaimónia-kapcsolat', layer: 'CD', eta_effect: '↑↑', bgp_score: '< 0.2', example: 'Valódi közösség',       nexus: '700.1', color: '#16a34a' },
  { type: 'Eudaimónia-alkotói',  layer: 'C',  eta_effect: '↑↑',  bgp_score: '< 0.1', example: 'Flow-állapot',          nexus: '700.5', color: '#0891b2' },
  { type: 'Eudaimónia-természeti ★', layer: 'AB', eta_effect: '↑↑↑', bgp_score: '≈0.05', example: 'FC Farm η(W)=0.863', nexus: '104.87', color: '#047857' },
];

// ---------------------------------------------------------------------------
// Referencia rendszerpontok
// ---------------------------------------------------------------------------

export const REFERENCE_SYSTEMS = {
  eu_average: {
    label: 'EU-átlag (2024)',
    bh:        0.08,
    w_h:       0.72,
    w_e:       0.28,
    eta_w:    -0.31,
    bgp_score: 2.4,
    cbs_trend: 'high',
    cews_state: 'CRITICAL',
    note: 'Erős Easterlin-paradoxon — GDP nő, boldogság nem követi',
  },
  fc_farm: {
    label: 'FC Farm (empirikusan validált)',
    bh:         null,
    w_h:        0.08,
    w_e:        0.92,
    eta_w:      0.863,
    bgp_score:  0.05,
    cbs_trend: 'low',
    cews_state: 'OPTIMAL_GROWTH',
    note: 'Egyetlen hitelesített referenciapélda — nem profitábilis, zárt rendszer',
  },
};

// ---------------------------------------------------------------------------
// CBS küszöbök és α-kalibrálás
// ---------------------------------------------------------------------------

export const CBS_CONFIG = {
  alpha_default:    0.5,    // α = intenzitás és entrópia közti súlyozás
  cbs_threshold:    0.6,    // CBS felett: MAGAS — CEWS trigger
  eta_w_baseline:   0.70,
  delta_eta_w_critical: -0.20,  // Δη(W) < -0.20 → CRITICAL zóna
};

// ---------------------------------------------------------------------------
// EU Kalibrált Δη(W) referencia (§VIII)
// ---------------------------------------------------------------------------

export const DELTA_ETA_W_EU = {
  w_h:          0.72,
  w_e:          0.28,
  eta_w_eudaimon: 0.863,   // FC Farm referencia
  eta_w_hedon:   -0.45,    // EU-átlag hedónikus komponens becsléss
  delta_eta_w:  -0.31,
  state:        'PARAZITA ZÓNÁBAN',
};
