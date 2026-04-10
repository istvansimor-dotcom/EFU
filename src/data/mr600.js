/**
 * mr600.js — EFU 600.00 Metabolikus Ragadozó (Metabolic Predator) v2.1
 *
 * Module definitions, mechanism registry (M1–M12), cascade hierarchy,
 * collapse thresholds, and reference state for the Tier 0 root operator.
 *
 * Reference: EFU 600.00 KALIBRÁLT FINAL OPERÁTOR (2026.03.30)
 * Domain: A-BIOFIZ / E-GAZDASÁGI / TEMPORÁLIS
 * Tier: 0 (gyökér-operátor)
 */

// ---------------------------------------------------------------------------
// M1–M12 Mechanism Registry
// ---------------------------------------------------------------------------

/**
 * Each mechanism has:
 *   id, code, role, tier (L0–L5 in ragadozó anatómia), color, description
 *   default_activation: baseline value in [0,1] for demo/initial state
 */
export const MECHANISMS = [
  {
    id: 'M1',
    code: 'M1',
    label: 'Fluxus',
    labelEn: 'Flux',
    role: 'Input manipuláció',
    roleEn: 'Input manipulation',
    tier: 'L0',
    color: '#16a34a',
    description: 'A biofizikai fluxus (anyag, energia, információ) bemeneti torzítása. Az energiaforrások manipulálása és az anyagáramlás eltérítése.',
    default_activation: 0.85,
    ref_modules: ['600.10', '600.11'],
  },
  {
    id: 'M2',
    code: 'M2',
    label: 'Reguláció',
    labelEn: 'Regulation',
    role: 'Szabályozás megkerülése',
    roleEn: 'Regulatory bypass',
    tier: 'L1',
    color: '#2563eb',
    description: 'Intézményi és jogi szabályozási mechanizmusok kikerülése, a compliance rendszerek semlegesítése.',
    default_activation: 0.70,
    ref_modules: ['600.20'],
  },
  {
    id: 'M3',
    code: 'M3',
    label: 'Identitás',
    labelEn: 'Identity',
    role: 'Önfenntartó hurok',
    roleEn: 'Self-perpetuating loop',
    tier: 'L5',
    color: '#7c3aed',
    description: 'A parazita rendszer identitásának beágyazása a gazdaszervezetbe. Önreprodukáló narratíva és intézményi memória.',
    default_activation: 0.78,
    ref_modules: ['600.30', '600.31'],
  },
  {
    id: 'M4',
    code: 'M4',
    label: 'Narratíva',
    labelEn: 'Narrative',
    role: 'Észlelési torzítás',
    roleEn: 'Perception distortion',
    tier: 'L2',
    color: '#be185d',
    description: 'Szimbolikus és narratív réteg: a valóság eltorzított képének terjesztése, az alternatívák elfedése.',
    default_activation: 0.82,
    ref_modules: ['600.40', '600.41', '600.42'],
  },
  {
    id: 'M5',
    code: 'M5',
    label: 'Extrakció',
    labelEn: 'Extraction',
    role: 'Erőforrás-kinyerés',
    roleEn: 'Resource extraction',
    tier: 'L1',
    color: '#d97706',
    description: 'Közvetlen erőforrás-kinyerési folyamatok: természeti tőke, humán tőke, szociális tőke degradálása.',
    default_activation: 0.75,
    ref_modules: ['600.50'],
  },
  {
    id: 'M6',
    code: 'M6',
    label: 'Koordináció',
    labelEn: 'Coordination',
    role: 'Koordináció semlegesítése',
    roleEn: 'Coordination neutralisation',
    tier: 'L2',
    color: '#0891b2',
    description: 'Kollektív cselekvés és koordinációs képesség lebontása, a kooperatív struktúrák meggyengítése.',
    default_activation: 0.60,
    ref_modules: ['600.51'],
  },
  {
    id: 'M7',
    code: 'M7',
    label: 'Externália',
    labelEn: 'Externality',
    role: 'Költség externalizálás',
    roleEn: 'Cost externalisation',
    tier: 'L1',
    color: '#ea580c',
    description: 'A parazita tevékenység negatív következményeinek a gazdaszervezetre hárítása (ökológiai, szociális, pénzügyi).',
    default_activation: 0.88,
    ref_modules: ['600.52'],
  },
  {
    id: 'M8',
    code: 'M8',
    label: 'Idő',
    labelEn: 'Time',
    role: 'Perzisztencia stabilizálás',
    roleEn: 'Persistence stabilisation',
    tier: 'L3',
    color: '#374151',
    description: 'Időbeli stratégiák: késleltetés, rövid horizont preferencia, a jövőbeli következmények diszkontálása.',
    default_activation: 0.72,
    ref_modules: ['600.53', '600.54'],
  },
  {
    id: 'M9',
    code: 'M9',
    label: 'Adaptáció',
    labelEn: 'Adaptation',
    role: 'Immune rendszer semlegesítése',
    roleEn: 'Immune system neutralisation',
    tier: 'L3',
    color: '#6b7280',
    description: 'A gazdaszervezet ellenállási és adaptációs mechanizmusainak semlegesítése, immunitás lebontása.',
    default_activation: 0.65,
    ref_modules: ['600.55'],
  },
  {
    id: 'M10',
    code: 'M10',
    label: 'Likviditás',
    labelEn: 'Liquidity',
    role: 'Energia extrakció',
    roleEn: 'Energy extraction',
    tier: 'L4',
    color: '#dc2626',
    description: 'Pénzügyi és energetikai likviditás kinyerése: finanszírozási struktúrák kisajátítása, tőkeáramlás manipulálása.',
    default_activation: 0.90,
    ref_modules: ['600.56', '600.57'],
  },
  {
    id: 'M11',
    code: 'M11',
    label: 'Innováció',
    labelEn: 'Innovation',
    role: 'Kreatív kapacitás kisajátítása',
    roleEn: 'Creative capacity appropriation',
    tier: 'L3',
    color: '#059669',
    description: 'Az innovációs és kreatív energia parazita célokra terelése, az R&D output eltérítése.',
    default_activation: 0.55,
    ref_modules: ['600.58'],
  },
  {
    id: 'M12',
    code: 'M12',
    label: 'Hálózat',
    labelEn: 'Network',
    role: 'Terjedés és zárás',
    roleEn: 'Spread and lock-in',
    tier: 'L1',
    color: '#7c3aed',
    description: 'Hálózati terjedési mechanizmusok és záró hatások: a parazita rendszer önmegerősítő hálózati expanziója.',
    default_activation: 0.80,
    ref_modules: ['600.59', '600.60'],
  },
];

// ---------------------------------------------------------------------------
// Ragadozó Anatómia (Predator Anatomy) — Hierarchy Levels
// ---------------------------------------------------------------------------

export const ANATOMY_LEVELS = [
  { tier: 'L0', label: 'Fluxus',      labelEn: 'Flux',        mechanisms: ['M1'],       function: 'Táplálás',          functionEn: 'Feeding',            color: '#16a34a' },
  { tier: 'L1', label: 'Hálózat',     labelEn: 'Network',     mechanisms: ['M12','M2','M5','M7'], function: 'Terjedés',  functionEn: 'Spread',             color: '#2563eb' },
  { tier: 'L2', label: 'Narratíva',   labelEn: 'Narrative',   mechanisms: ['M4','M6'],  function: 'Elfedés',           functionEn: 'Concealment',        color: '#be185d' },
  { tier: 'L3', label: 'Idő',         labelEn: 'Time',        mechanisms: ['M8','M9','M11'], function: 'Stabilizáció', functionEn: 'Stabilisation',      color: '#374151' },
  { tier: 'L4', label: 'Likviditás',  labelEn: 'Liquidity',   mechanisms: ['M10'],      function: 'Finanszírozás',     functionEn: 'Financing',          color: '#dc2626' },
  { tier: 'L5', label: 'Identitás',   labelEn: 'Identity',    mechanisms: ['M3'],       function: 'Rendszerzárás',     functionEn: 'System lock-in',     color: '#7c3aed' },
];

// ---------------------------------------------------------------------------
// Collapse Thresholds (§VI)
// ---------------------------------------------------------------------------

export const COLLAPSE_THRESHOLDS = {
  p_syn_collapse:     0.50,  // P_syn < 0.5 → collapse warning
  mr_score_tier0:     0.85,  // MR_score ≥ 0.85 → Tier 0
  mr_score_tier1:     0.60,  // MR_score ≥ 0.60 → Tier 1
  mr_score_tier2:     0.35,  // MR_score ≥ 0.35 → Tier 2
  prd_warning:        0.10,  // PRD > 0.1 → warning
  prd_critical:       0.30,  // PRD > 0.3 → critical
  prd_blind:          0.50,  // PRD > 0.5 → perceptual blindness
  d_percept_critical: 0.60,  // D_percept > 0.6 → cognitive collapse threshold
};

// ---------------------------------------------------------------------------
// PRD Classification
// ---------------------------------------------------------------------------

export const PRD_LEVELS = [
  { max: 0.10, label: 'Stabil',              labelEn: 'Stable',              color: '#16a34a' },
  { max: 0.30, label: 'Figyelmeztető',        labelEn: 'Warning',             color: '#ca8a04' },
  { max: 0.50, label: 'Kritikus',             labelEn: 'Critical',            color: '#ea580c' },
  { max: 1.00, label: 'Percepciós vakság',    labelEn: 'Perceptual blindness', color: '#dc2626' },
];

// ---------------------------------------------------------------------------
// Reference State (2026.03.30 — documented in §XI)
// ---------------------------------------------------------------------------

export const REFERENCE_STATE_2026 = {
  label:       '2026.03.30 Referencia Állapot',
  mr_score:    0.93,
  p_syn:       0.42,
  d_percept:   0.72,  // high (estimated)
  prd:         0.47,
  eta_real:    32,    // effective efficiency % (estimated)
  eta_perceived: 79,  // perceived efficiency % (estimated)
  verdict:     'TIER 0 SZINERGIKUS MASTER PARAZITA',
  flags: [
    'M1 fluxus torzítás',
    'M8 idő stabilizáció',
    'M12 hálózati zárás',
    'M4 narratíva torzítás',
    'M10 likviditás extrakció',
    'M3 identitás hurok',
    'P_syn < 0.5',
  ],
  attractor: 'Attractor_parazita — Összeomlási tartomány közeli',
};

// ---------------------------------------------------------------------------
// Cascade Sequence (§IV Dynamic Cascade)
// ---------------------------------------------------------------------------

export const CASCADE_SEQUENCE = [
  { step: 1, label: '600.00 MR Operátor',        labelEn: '600.00 MR Operator',         desc: 'Tier 0 aktiválódik'              },
  { step: 2, label: 'Szinergia aktiváció',        labelEn: 'Synergy activation',          desc: '600.52 + 600.53 + 600.58 aktív'  },
  { step: 3, label: 'P_syn < 0.5',               labelEn: 'P_syn < 0.5',                 desc: 'Szuppresszió küszöb átlépve'     },
  { step: 4, label: 'η(W)_eff csökken',           labelEn: 'η(W)_eff declines',           desc: 'Hatékonysági degradáció'         },
  { step: 5, label: 'N_cogn csökken',             labelEn: 'N_cogn declines',             desc: 'Kognitív kapacitás csökkenés'    },
  { step: 6, label: 'CEWS ignorálás',             labelEn: 'CEWS ignored',                desc: 'Korai jelzések nem érzékelhetők' },
  { step: 7, label: 'SBE pálya aktiválódik',      labelEn: 'SBE trajectory activated',    desc: 'Irreverzibilis hanyatlás indul'  },
];

// ---------------------------------------------------------------------------
// Module Reference (EFU 600.x sub-modules)
// ---------------------------------------------------------------------------

export const EFU_600_SUBMODULES = {
  '600.00': 'Metabolikus Ragadozó Master Operátor',
  '600.10': 'Fluxus Torzítás Mátrix',
  '600.11': 'Input Manipuláció Protokoll',
  '600.20': 'Reguláció Bypass Mátrix',
  '600.30': 'Identitás Beágyazás Index',
  '600.31': 'Intézményi Memória Analízis',
  '600.40': 'Narratíva Torzítás Spektrum',
  '600.41': 'Szimbolikus Réteg Analízis',
  '600.42': 'Alternatíva Elnyomási Index',
  '600.50': 'Tőkekinyerési Ráta',
  '600.51': 'Koordináció Dezintegráció',
  '600.52': 'Externália Transzfer Mátrix',
  '600.53': 'Időhorizont Torzítás / D_percept',
  '600.54': 'Perzisztencia Stabilizáció',
  '600.55': 'Immunitás Lebontási Index',
  '600.56': 'Likviditás Extrakciós Ráta',
  '600.57': 'Tőkeáramlás Manipuláció',
  '600.58': 'Kreatív Kisajátítási Index',
  '600.59': 'Hálózati Terjedési Együttható',
  '600.60': 'Lock-in Mátrix',
};
