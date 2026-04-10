/**
 * pfas600_52.js — EFU 600.52 PFAS & „Örök Vegyületek"
 *
 * Bio-fragmentációs Kémiai Motor (CFI-B) referencia adatok.
 * Audit mátrix küszöbök, forrástérkép, kórházi kapcsolat,
 * beavatkozási protokoll (700.x), és planetáris EFU skála.
 *
 * Státusz: CERTIFIED COMPLETE
 * W_irrev = 950/1000 · Veszélyességi szint: SEV MAX
 * Reference: EFU 600.52 v1.0 FINAL
 */

// ---------------------------------------------------------------------------
// Modul metaadatok
// ---------------------------------------------------------------------------

export const MODULE_META = {
  code:           '600.52',
  series:         '600-as széria — Antiflux',
  subtype:        'CFI-B (Kémiai Bio-fragmentáció)',
  w_irrev:        0.95,
  severity:       'SEV MAX',
  version:        '1.0 FINAL',
  status:         'CERTIFIED COMPLETE',
  efu_base:       '1 EFU = 20 kg/nap emberi anyagcsere-fluxus',
  related: ['104.13.3', '104.6', '104.44', '110.1', '900.5', '700.x'],
};

// ---------------------------------------------------------------------------
// CFI-B Három Szintű Hatásmodell (§3.1)
// ---------------------------------------------------------------------------

export const CFI_B_IMPACT_LEVELS = [
  {
    id: 'TISSUE',
    label: 'Szöveti szint',
    labelEn: 'Tissue level',
    color: '#dc2626',
    effects: [
      'Interstitiális viszkozitás növekedés',
      'Tápanyag-diffúzió csökkenés',
      'Immun-jelátvitel torzulás',
    ],
    efficiency_loss: 40,  // % — negentrópikus hatékonyság csökkenés
    link: '110.1',
  },
  {
    id: 'ECOSYSTEM',
    label: 'Ökoszisztéma szint',
    labelEn: 'Ecosystem level',
    color: '#ea580c',
    effects: [
      'Vízfluxus (104.6) szennyezés',
      'Pedoszféra (104.44) blokád',
      'Biomagnifikáció (hal → madár → ember)',
    ],
    efficiency_loss: null,
    link: '104.6 + 104.44',
  },
  {
    id: 'SYSTEM',
    label: 'Rendszer szint',
    labelEn: 'System level',
    color: '#7c3aed',
    effects: [
      'R_future exponenciális növekedés',
      'Jogi/egészségügyi teher',
      'Visszafordíthatatlan örökség',
    ],
    efficiency_loss: null,
    w_irrev: 0.95,
    link: '900.5',
  },
];

// ---------------------------------------------------------------------------
// Kibocsátási Forrástérkép (§2.1)
// ---------------------------------------------------------------------------

export const EMISSION_SOURCES = [
  { id: 'AFFF',       label: 'Tűzoltó habanyagok (AFFF)',               share: 20, efu_link: 'Fire Chief közvetlen felelősség',  color: '#dc2626' },
  { id: 'MEDICAL',    label: 'Egészségügyi egyszer használatos eszközök', share: 18, efu_link: '104.13.3',                          color: '#be185d' },
  { id: 'TEXTILE',    label: 'Textil/ruházati impregnálás',              share: 15, efu_link: '104.44 pedoszféra',                 color: '#d97706' },
  { id: 'PACKAGING',  label: 'Csomagolóanyagok',                         share: 22, efu_link: '104.6 vízfluxus',                   color: '#0891b2' },
  { id: 'ELECTRONICS',label: 'Elektronika / félvezetők',                 share: 25, efu_link: 'Ipari antiflux',                    color: '#374151' },
];

// ---------------------------------------------------------------------------
// Audit Mátrix — Küszöbértékek (§4.1 HU Pilot Régió)
// ---------------------------------------------------------------------------

export const AUDIT_INDICATORS = [
  {
    id:          'P_LOD_WATER',
    code:        'P-LOD',
    label:       'PFAS terhelési arány (ivóvíz)',
    unit:        'ng/L',
    threshold:   100,
    efu_penalty: 150,    // EFU/fő
    penalty_unit:'EFU/fő',
    source:      'WHO 2022',
    color:       '#0891b2',
    cfi_b_link:  true,
  },
  {
    id:          'P_LOD_BLOOD',
    code:        'P-LOD²',
    label:       'PFAS vérszérum',
    unit:        'ng/mL',
    threshold:   20,
    efu_penalty: 300,
    penalty_unit:'EFU/fő',
    source:      'EFSA limit',
    color:       '#dc2626',
    cfi_b_link:  true,
  },
  {
    id:          'B_ACC',
    code:        'B-ACC',
    label:       'Bioakkumuláció',
    unit:        '%/év',
    threshold:   10,
    efu_penalty: null,
    penalty_unit:'W_irrev +0.05',
    source:      'EFU 600.52',
    color:       '#7c3aed',
    cfi_b_link:  true,
  },
  {
    id:          'I_BLOCK',
    code:        'I-BLOCK',
    label:       'Interstitiális blokád',
    unit:        '%',
    threshold:   15,
    efu_penalty: null,
    penalty_unit:'API ×1.2',
    source:      '110.1',
    color:       '#be185d',
    cfi_b_link:  true,
  },
  {
    id:          'AFFF_RAD',
    code:        'AFFF-RAD',
    label:       'Tűzoltótelep-sugár',
    unit:        'm',
    threshold:   500,
    efu_penalty: null,
    penalty_unit:'Zóna-riasztás',
    source:      'EFU 600.52',
    color:       '#ea580c',
    cfi_b_link:  false,
  },
  {
    id:          'C_CHAIN',
    code:        'C-CHAIN',
    label:       'Tápláléklánc (hal)',
    unit:        'ng/g',
    threshold:   11,
    efu_penalty: null,
    penalty_unit:'Ökoszisztéma audit',
    source:      'EFSA 2020',
    color:       '#16a34a',
    cfi_b_link:  true,
  },
];

// ---------------------------------------------------------------------------
// CFI-B Minősítési Szintek (§4.2)
// ---------------------------------------------------------------------------

export const CFI_B_LEVELS = [
  { min: 0,   max: 100,  label: 'ZÖLD',     labelEn: 'GREEN',    color: '#16a34a', action: 'Nincs beavatkozás szükséges' },
  { min: 100, max: 300,  label: 'SÁRGA',    labelEn: 'YELLOW',   color: '#ca8a04', action: 'Monitoring fokozás' },
  { min: 300, max: 600,  label: 'NARANCS',  labelEn: 'ORANGE',   color: '#ea580c', action: 'Forrás-karantén' },
  { min: 600, max: Infinity, label: 'PIROS', labelEn: 'RED',    color: '#dc2626', action: 'Azonnali beavatkozás' },
];

// ---------------------------------------------------------------------------
// Kórházi Kapcsolódás (§5 — 104.13.3)
// ---------------------------------------------------------------------------

export const HOSPITAL_CONNECTION = {
  module_ref: '104.13.3',
  entry_points: [
    'Vízhálózat (P-LOD)',
    'Műanyag eszközök és csomagolás',
    'Sebészeti drapériák, katéterek',
  ],
  exit_points: [
    'Szennyvíz → 104.6',
    'Hulladék → 104.44',
  ],
  heal_formula: {
    description: 'η_heal = η_max × (1 – 0.4 × (CFI-B_beteg / CFI-B_ref))',
    eta_max: 1.0,
    pfas_efficiency_penalty: 0.4,   // 40% at reference CFI-B
    cfib_ref: 300,                   // reference CFI-B value (NARANCS küszöb)
  },
  audit_trigger: {
    conditions: ['P-LOD (víz) > 100 ng/L', 'P-LOD (vér) > 20 ng/mL', 'I-BLOCK > 15%'],
    actions: ['TIER 1 visszavonva', '700.x protokoll aktiválva', 'Dashboard: ALERT', 'Fire Chief értesítés'],
  },
};

// ---------------------------------------------------------------------------
// Beavatkozási Protokoll (§6 — 700.x)
// ---------------------------------------------------------------------------

export const INTERVENTION_PROTOCOL = [
  {
    phase: 1,
    timeframe: '0–72 óra',
    label: 'Azonnali',
    color: '#dc2626',
    actions: [
      'PFAS-alapú bevonatok tiltása',
      'AFFF készletek izolálása',
      'Vízmintavétel és laboranalízis indítása',
    ],
  },
  {
    phase: 2,
    timeframe: '1–4 hét',
    label: 'Rövid táv',
    color: '#ea580c',
    actions: [
      'Aktív szén + ioncsere szűrés telepítése',
      'Fluoridmentes habanyagra átállás',
      'Személyzeti vérszűrő program',
    ],
  },
  {
    phase: 3,
    timeframe: '1–6 hónap',
    label: 'Közép táv',
    color: '#ca8a04',
    actions: [
      'Gyártói audit és tanúsítás visszavonás',
      'Közbeszerzési módosítás PFAS-mentes alternatívákra',
      'Talajvíz-monitoring rendszer kiépítése',
    ],
  },
];

// ---------------------------------------------------------------------------
// Planetáris EFU Skála (§7)
// ---------------------------------------------------------------------------

export const PLANETARY_SCALE = [
  { metric: 'Globális PFAS-termelés',  value: '~200 000 t/év',          efu_analogy: '~10 millió ember éves metabolikus kibocsátása' },
  { metric: 'Szennyezett ivóvíz',      value: '>200 millió fő',          efu_analogy: 'Magyarország ×20' },
  { metric: 'Remediáció becsült cost', value: '~400 Mrd USD',            efu_analogy: '~20 év Magyar GDP' },
  { metric: 'C–F kötés féléletidő',   value: 'Gyakorlatilag végtelen',  efu_analogy: 'W_irrev = 0.95 — indoklás' },
];

// ---------------------------------------------------------------------------
// Interstitiális Blokád mérőszámok (§3.3 — 110.1)
// ---------------------------------------------------------------------------

export const INTERSTITIAL_METRICS = [
  { id: 'I_BLOCK',   label: 'Szurfaktáns-diszkrupció', mechanism: 'Membrán-permeabilitás csökken', unit: 'I-BLOCK %' },
  { id: 'FLUX_SLOW', label: 'Proteoglikán-kötés',      mechanism: 'ECM struktúra torzul',          unit: 'Fluxus-lassulás' },
  { id: 'MROI_ATP',  label: 'Mitokondriális toxicitás', mechanism: 'ATP-termelés csökken',          unit: 'MROI' },
];
