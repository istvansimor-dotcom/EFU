/**
 * synergy600_0.js — EFU 600.0 v1.0 600-as Szinergia-Mátrix
 *
 * Antiflux Szinergia Alapoperátor | P_syn Kalibrációs Modul
 * Tier 0 (Meta) | FC-APPROVED | v1.0 FINAL
 *
 * Fő képletek:
 *   η(W)_eff = (η(W)_inst × η(W)_epi) × P_syn
 *   P_syn: 1 parazita=0.85 | 2=0.65 | 3=0.40
 *   CEWS RED:      P_syn < 0.50 ∧ N_cogn < 0.50
 *   CEWS CRITICAL: + EFM rögzülés észlelt
 *
 * Szinergia-mátrix: 600.52 × 600.53 × 600.58 (3×3)
 * Reference: EFU 600.0 v1.0 FINAL (2026.04.10)
 */

// ---------------------------------------------------------------------------
// Modul metaadatok
// ---------------------------------------------------------------------------

export const MODULE_META_600_0 = {
  code:     '600.0',
  title:    '600-as Szinergia-Mátrix',
  subtitle: 'Antiflux Szinergia Alapoperátor | P_syn Kalibrációs Modul',
  tier:     'Tier 0 (Meta)',
  priority: '10 / 10',
  status:   'FC-APPROVED',
  version:  'v1.0 FINAL',
  date:     '2026.04.10',
  category: 'A+B – Antiflux Szinergia Alapoperátor',
  related:  ['600.52', '600.53', '600.58', '050.2', '050.3', '900.5', '600.85'],
};

// ---------------------------------------------------------------------------
// Antiflux Modulok (szinergia-résztvevők)
// ---------------------------------------------------------------------------

export const ANTIFLUX_MODULES = [
  {
    id:    '600.52',
    label: 'PFAS / Vegyi terhelés',
    short: 'PFAS',
    color: '#7c3aed',
    icon:  '☣',
    desc:  'Vegyi és PFAS terhelés – biológiai alapzaj, immunrendszer állandó terhelése',
  },
  {
    id:    '600.53',
    label: 'Digitális Dopamin',
    short: 'Digital',
    color: '#2563eb',
    icon:  '📱',
    desc:  'Digitális dopamin rendszer – jutalmazási rendszer átírása, N_cogn csökkentés',
  },
  {
    id:    '600.58',
    label: 'UPF / Élelmiszer',
    short: 'UPF',
    color: '#ea580c',
    icon:  '🍔',
    desc:  'Ultra-feldolgozott élelmiszer – bélflóra torzulás, metabolikus rögzülés',
  },
];

// ---------------------------------------------------------------------------
// Szinergia-Mátrix 3×3 (§III)
// ---------------------------------------------------------------------------

// [primary][secondary] → interaction description
export const SYNERGY_MATRIX = {
  '600.52': {
    '600.52': {
      label:    'Biológiai Alapzaj',
      severity: 'BASE',
      color:    '#6b7280',
      desc:     'Immunrendszer állandó terhelése; η_W csökkentés közvetlen biofizikai csatornán',
      effect:   'η_W ↓ (közvetlen biofizikai)',
    },
    '600.53': {
      label:    'Neurotoxikus felerősítés',
      severity: 'CRITICAL',
      color:    '#dc2626',
      desc:     'A vegyi anyagok rontják a vér-agy gátat, drámai módon növelve a digitális addikció érzékenységét',
      effect:   'Vér-agy gát sérül → N_cogn ↓↓',
      warning:  true,
    },
    '600.58': {
      label:    'Metabolikus Csapda',
      severity: 'HIGH',
      color:    '#ea580c',
      desc:     'PFAS gátolja a méregtelenítést; UPF gyulladásban tartja a bélrendszert',
      effect:   'Méregtelenítés blokkolva + bélgyulladás',
    },
  },
  '600.53': {
    '600.52': {
      label:    'Kognitív Gátlás',
      severity: 'HIGH',
      color:    '#ea580c',
      desc:     'Állandó stimuláció miatt az egyén nem észleli a fizikai tüneteket; N_cogn ↓',
      effect:   'Tünet-felismerés ↓ → N_cogn ↓',
    },
    '600.53': {
      label:    'Dopamin-kiégés',
      severity: 'CRITICAL',
      color:    '#dc2626',
      desc:     'Örömérzet teljes elvesztése (anhedónia); η_W összeomlik; EFM rögzíti',
      effect:   'Anhedónia → η_W összeomlás → EFM rögzítés',
    },
    '600.58': {
      label:    'Impulzus-kontroll elveszítés',
      severity: 'CRITICAL',
      color:    '#dc2626',
      desc:     'Digitális kimerültség képtelenné tesz az UPF elutasítására; érzelmi evés kör állandósul',
      effect:   'Impulzus-kontroll ↓ → érzelmi evés kör',
      warning:  true,
    },
  },
  '600.58': {
    '600.52': {
      label:    'Gyulladásos Koktél',
      severity: 'HIGH',
      color:    '#ea580c',
      desc:     'Bélflóra-torzulás felerősíti a környezeti mérgek (PFAS) felszívódását',
      effect:   'PFAS felszívódás ↑ + bélflóra torzulás',
    },
    '600.53': {
      label:    'Ködös Agy (Brain Fog)',
      severity: 'CRITICAL',
      color:    '#dc2626',
      desc:     'Vércukor-ingadozás és gyulladás drasztikusan rontja N_cogn-t; CEWS-riasztás láthatatlanná válik',
      effect:   'N_cogn ↓↓ → CEWS-riasztás láthatatlan',
      warning:  true,
    },
    '600.58': {
      label:    'Metabolikus Rögzülés',
      severity: 'CRITICAL',
      color:    '#dc2626',
      desc:     'EFM elmenti az inzulinrezisztenciát a következő generációnak; visszafordíthatatlan',
      effect:   'EFM rögzítés → generációs inzulinrezisztencia',
    },
  },
};

// ---------------------------------------------------------------------------
// P_syn Alap-Kalibráció (§IV.1)
// ---------------------------------------------------------------------------

export const P_SYN_BASE = [
  { active: 0, p_syn: 1.00, label: 'Szinergia nincs',     delta: 0,    color: '#16a34a', desc: '0 aktív parazita — teljes hatékonyság' },
  { active: 1, p_syn: 0.85, label: '−15% hatékonyság',    delta: -0.15, color: '#0891b2', desc: '1 aktív parazita — enyhe csökkentés' },
  { active: 2, p_syn: 0.65, label: '−35% hatékonyság',    delta: -0.35, color: '#ca8a04', desc: '2 aktív parazita — közepes romlás' },
  { active: 3, p_syn: 0.40, label: '−60% hatékonyság',    delta: -0.60, color: '#dc2626', desc: '3 aktív parazita — szupralineáris küszöb átlépve' },
];

// ---------------------------------------------------------------------------
// P_syn Modifikátorok (§IV.2)
// ---------------------------------------------------------------------------

export const P_SYN_MODIFIERS = [
  {
    id:    'M1',
    label: '600.52 × 600.53 egyidejű',
    effect: -0.10,
    dir:   'decrease',
    color: '#dc2626',
    desc:  'Neurotoxikus + digitális: legveszélyesebb kombináció',
    requires: ['600.52', '600.53'],
  },
  {
    id:    'M2',
    label: 'Krónikus terhelés (> 2 év)',
    effect: -0.05,
    dir:   'decrease',
    color: '#ea580c',
    desc:  'EFM-rögzülés: generációs hatás bekövetkezhet',
  },
  {
    id:    'M3',
    label: 'Fiatalkori expozíció (< 18 év)',
    effect: -0.15,
    dir:   'decrease',
    color: '#7c3aed',
    desc:  'Fejlődő idegrendszer: mély EFM-bevésődés',
  },
  {
    id:    'M4',
    label: 'N_cogn > 0.70 (védett)',
    effect: +0.10,
    dir:   'increase',
    color: '#0891b2',
    desc:  'Magas kognitív kapacitás észleli és ellenáll a szinergiáknak',
  },
  {
    id:    'M5',
    label: 'FC Farm-típus környezet',
    effect: +0.20,
    dir:   'increase',
    color: '#16a34a',
    desc:  'Természeti + közösségi környezet: η(W) védelmi hatás',
  },
];

// ---------------------------------------------------------------------------
// Zóna-Profilok (§IV.3)
// ---------------------------------------------------------------------------

export const ZONE_PROFILES = [
  {
    id:         'URBAN',
    label:      'Modern városi környezet',
    desc:       'Mind 3 parazita aktív (600.52 + 600.53 + 600.58)',
    p_syn_base: 0.40,
    modifier:   -0.10,
    p_syn_final: 0.30,
    cews:       'CRITICAL',
    color:      '#dc2626',
    active:     ['600.52', '600.53', '600.58'],
  },
  {
    id:         'SUBURBAN',
    label:      'Előváros',
    desc:       '2 aktív parazita (600.53 + 600.58)',
    p_syn_base: 0.65,
    modifier:   0,
    p_syn_final: 0.65,
    cews:       'AMBER',
    color:      '#ca8a04',
    active:     ['600.53', '600.58'],
  },
  {
    id:         'RURAL',
    label:      'Vidéki (ön-ellátó)',
    desc:       '1 aktív parazita (600.53 csak)',
    p_syn_base: 0.85,
    modifier:   +0.05,
    p_syn_final: 0.90,
    cews:       'GREEN-AMBER',
    color:      '#0891b2',
    active:     ['600.53'],
  },
  {
    id:         'FC_FARM',
    label:      'FC Farm típus',
    desc:       '0 aktív parazita – referencia-zóna',
    p_syn_base: 1.00,
    modifier:   +0.20,
    p_syn_final: 1.00,
    cews:       'GREEN',
    color:      '#16a34a',
    active:     [],
  },
];

// ---------------------------------------------------------------------------
// CEWS Trigger Feltételek (§VII)
// ---------------------------------------------------------------------------

export const CEWS_SYNERGY_THRESHOLDS = {
  p_syn_red:      0.50,
  n_cogn_red:     0.50,
  eta_w_eff_crit: 0.35,
  states: [
    { id: 'GREEN',    p_syn_min: 0.80, eta_eff_min: 0.60, color: '#16a34a', action: 'Monitorozás elegendő' },
    { id: 'AMBER',    p_syn_min: 0.60, eta_eff_min: 0.40, color: '#ca8a04', action: 'Primer prevenció: N_cogn védős, étrendváltás' },
    { id: 'RED',      p_syn_min: 0.40, eta_eff_min: 0.25, color: '#dc2626', action: '600.53 detox első; kognitív visszanyerés prioritás' },
    { id: 'CRITICAL', p_syn_min: 0,   eta_eff_min: 0,    color: '#7c3aed', action: 'Azonnali rendszerbeavatkozás; EFM-védelem prioritás' },
  ],
};

// ---------------------------------------------------------------------------
// Intézkedési Mező (§VIII)
// ---------------------------------------------------------------------------

export const ACTION_PRIORITIES = [
  {
    rank:      1,
    priority:  '600.53 detox először',
    target:    'N_cogn ↑',
    mechanism: 'Figyelem-visszanyerés: digitális zaj csökkentése, anhedónia ellen; CEWS észlelési küszöb helyreáll',
    color:     '#2563eb',
  },
  {
    rank:      2,
    priority:  'Biológiai stabilizálás',
    target:    'P_syn ↑',
    mechanism: 'Immun + méregtelenítés (600.52 hatás csökkentése); bélflóra, vér-agy gát',
    color:     '#7c3aed',
  },
  {
    rank:      3,
    priority:  'Metabolikus rendezés',
    target:    'EFM ↓',
    mechanism: 'UPF kizárás; inzulinrezisztencia-kör megszakítása; generációs EFM védelem',
    color:     '#ea580c',
  },
  {
    rank:      4,
    priority:  'Generációs védelem',
    target:    'η(W)_eff ↑',
    mechanism: 'PFAS/UPF kizárás gyermekeknél; kognitív tréning; kollektív fókusz helyreállítása',
    color:     '#16a34a',
  },
];
