/**
 * cewsIndicators.js — EFU CEWS (Civilization Early Warning System) Indicator Registry
 *
 * Source: UCAIF v3.1 (UCAIF v3.0 + Manus 10 new indicators)
 * Reference: EFU 217.2 – UCAIF v3.1 Master Reference
 *            EFU 217.3 – CEWS Operational Protocol
 *
 * Structure: "Hagyma Metódus" (Onion Method) — 7 layers + Trajectory Vector
 *
 * Total indicators: 472 + 1 meta (UCAIF v3.1 FINAL)
 *   UCAIF v3.0 base: 462 + 1 meta
 *   Manus additions: +10
 */

// ---------------------------------------------------------------------------
// CEWS Block / Module Registry
// ---------------------------------------------------------------------------

/**
 * CEWS Block definitions — corresponds to EFU module groups I–XXVI.
 * Each block contains one or more numbered modules.
 */
export const CEWS_BLOCKS = [
  {
    id: 'A',
    label: 'BLOKK A — Biofizikai & Társadalmi Alap',
    labelEn: 'BLOCK A — Biophysical & Social Foundation',
    modules: [
      { num: 'I',   id: 'atmosphere',    label: 'Légkör',         labelEn: 'Atmosphere' },
      { num: 'II',  id: 'hydrosphere',   label: 'Vízkörforgás',   labelEn: 'Hydrosphere' },
      { num: 'III', id: 'pedosphere',    label: 'Talaj & Demog.', labelEn: 'Pedosphere & Demographics' },
      { num: 'IV',  id: 'biodiversity',  label: 'Biodiverzitás',  labelEn: 'Biodiversity' },
      { num: 'V',   id: 'climate',       label: 'Éghajlat',       labelEn: 'Climate' },
      { num: 'VI',  id: 'antiflux',      label: 'Antiflux',       labelEn: 'Anti-flux Systems' },
      { num: 'VII', id: 'governance',    label: 'Governance',     labelEn: 'Governance & Institutions' },
    ],
  },
  {
    id: 'B',
    label: 'BLOKK B — Dinamikus Rendszerek',
    labelEn: 'BLOCK B — Dynamic Systems',
    modules: [
      { num: 'VIII', id: 'epigenetic',   label: 'Epigenetikai',   labelEn: 'Epigenetic Dynamics' },
      { num: 'IX',   id: 'psychosocial', label: 'Pszicho-szoc.',  labelEn: 'Psycho-social Dynamics' },
    ],
  },
  {
    id: 'C',
    label: 'BLOKK C — Entitás-specifikus',
    labelEn: 'BLOCK C — Entity-specific',
    modules: [
      { num: 'X',   id: 'corporate',    label: 'Vállalati',      labelEn: 'Corporate' },
      { num: 'XI',  id: 'project',      label: 'Projekt',        labelEn: 'Project' },
      { num: 'XII', id: 'community',    label: 'Közösségi',      labelEn: 'Community' },
      { num: 'XIII',id: 'disaster',     label: 'Katasztrófa',    labelEn: 'Disaster' },
    ],
  },
  {
    id: 'D',
    label: 'BLOKK D — Rejtett Fluxusok',
    labelEn: 'BLOCK D — Hidden Fluxes',
    modules: [
      { num: 'XIV', id: 'financial',    label: 'Pénzügyi',       labelEn: 'Financial' },
      { num: 'XV',  id: 'technology',   label: 'Technológiai',   labelEn: 'Technology' },
      { num: 'XVI', id: 'food_chain',   label: 'Élelmiszer-lánc',labelEn: 'Food Chain' },
    ],
  },
  {
    id: 'E',
    label: 'BLOKK E — Topológiai Rendszerek',
    labelEn: 'BLOCK E — Topological Systems',
    modules: [
      { num: 'XVII', id: 'energy',      label: 'Energia',        labelEn: 'Energy' },
      { num: 'XVIII',id: 'logistics',   label: 'Logisztika',     labelEn: 'Logistics' },
      { num: 'XIX',  id: 'information', label: 'Információ',     labelEn: 'Information' },
      { num: 'XX',   id: 'infra_topo',  label: 'Infra-topológia',labelEn: 'Infrastructure Topology' },
    ],
  },
  {
    id: 'F',
    label: 'BLOKK F — Komplex Rendszerek',
    labelEn: 'BLOCK F — Complex Systems',
    modules: [
      { num: 'XXI',  id: 'geopolitics', label: 'Geopolitika',    labelEn: 'Geopolitics' },
      { num: 'XXII', id: 'resilience',  label: 'Reziliencia',    labelEn: 'Resilience' },
    ],
  },
  {
    id: 'G',
    label: 'BLOKK G — Holisztikus / Meta',
    labelEn: 'BLOCK G — Holistic / Meta',
    modules: [
      { num: 'XXIII', id: 'ethics',     label: 'Etika & AI',     labelEn: 'Ethics & AI' },
      { num: 'XXIV',  id: 'health',     label: 'Egészség',       labelEn: 'Global Health' },
      { num: 'XXV',   id: 'economy',    label: 'Makrogazdaság',  labelEn: 'Macroeconomy' },
    ],
  },
  {
    id: 'XXVI',
    label: 'XXVI — Trajectory Vector',
    labelEn: 'XXVI — Trajectory Vector',
    modules: [
      { num: 'XXVI', id: 'trajectory',  label: 'Pályavektor',    labelEn: 'Civilization Trajectory Vector' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Hagyma Rétegek (Onion Layers)
// ---------------------------------------------------------------------------

/**
 * The 7 layers + meta of the "Onion Method" (Hagyma Metódus).
 * Inner layers have higher priority and W_irrev weights.
 *
 * layer 1 = innermost (core), layer 7 = outermost (meta), layer 8 = Trajectory Vector
 */
export const CEWS_LAYERS = [
  {
    layer: 1,
    id:    'core',
    label: 'Magréteg — Biofizikai Alap',
    labelEn: 'Core — Biophysical Foundation',
    question: 'Mit mérünk?',
    questionEn: 'What do we measure?',
    blocks: ['A'],
    indicatorCount: 210,
    priority: 'LEGMAGASABB',
    priorityEn: 'HIGHEST',
    color: '#16a34a',
    w_irrev_range: '0.8–1.0',
    compositeContrib: 'CII ökológiai komponens, VKI, MRI',
    compositeContribEn: 'CII ecological component, VKI, MRI',
  },
  {
    layer: 2,
    id:    'dynamic',
    label: 'Dinamikus Réteg — Időbeli Változások',
    labelEn: 'Dynamic Layer — Temporal Changes',
    question: 'Mikor változik?',
    questionEn: 'When does it change?',
    blocks: ['B'],
    indicatorCount: 50,
    priority: 'MAGAS',
    priorityEn: 'HIGH',
    color: '#2563eb',
    w_irrev_range: '0.5–0.8',
    compositeContrib: 'CII társadalmi komponens, Latency súlyozás',
    compositeContribEn: 'CII social component, Latency weighting',
  },
  {
    layer: 3,
    id:    'entity',
    label: 'Entitás Réteg — Kire Alkalmazzuk?',
    labelEn: 'Entity Layer — Applied to Whom?',
    question: 'Kire alkalmazzuk?',
    questionEn: 'To whom does it apply?',
    blocks: ['C'],
    indicatorCount: 62,
    priority: 'KÖZEPES–MAGAS',
    priorityEn: 'MEDIUM–HIGH',
    color: '#7c3aed',
    w_irrev_range: '0.4–0.7',
    compositeContrib: 'CSI, CII részkomponensek',
    compositeContribEn: 'CSI, CII sub-components',
  },
  {
    layer: 4,
    id:    'hidden',
    label: 'Rejtett Réteg — Láthatatlan Terhelések',
    labelEn: 'Hidden Layer — Invisible Loads',
    question: 'Mi a láthatatlan terhelés?',
    questionEn: 'What is the invisible load?',
    blocks: ['D'],
    indicatorCount: 36,
    priority: 'KÖZEPES',
    priorityEn: 'MEDIUM',
    color: '#d97706',
    w_irrev_range: '0.3–0.6',
    compositeContrib: 'Shadow delta, CII pénzügyi réteg',
    compositeContribEn: 'Shadow delta, CII financial layer',
  },
  {
    layer: 5,
    id:    'topology',
    label: 'Topológiai Réteg — Összeköttetések',
    labelEn: 'Topological Layer — Connections',
    question: 'Hogyan kapcsolódik?',
    questionEn: 'How is it connected?',
    blocks: ['E'],
    indicatorCount: 47,
    priority: 'KÖZEPES',
    priorityEn: 'MEDIUM',
    color: '#0891b2',
    w_irrev_range: '0.3–0.6',
    compositeContrib: 'GSI, Cascade flag',
    compositeContribEn: 'GSI, Cascade flag',
  },
  {
    layer: 6,
    id:    'complex',
    label: 'Komplex Réteg — Törésvonalak',
    labelEn: 'Complex Layer — Fracture Lines',
    question: 'Hol törik el?',
    questionEn: 'Where does it break?',
    blocks: ['F'],
    indicatorCount: 18,
    priority: 'KÖZEPES',
    priorityEn: 'MEDIUM',
    color: '#be185d',
    w_irrev_range: '0.4–0.7',
    compositeContrib: 'GSI, Recovery time, Cascade flag',
    compositeContribEn: 'GSI, Recovery time, Cascade flag',
  },
  {
    layer: 7,
    id:    'meta',
    label: 'Meta Réteg — Holisztikus Értelmezés',
    labelEn: 'Meta Layer — Holistic Interpretation',
    question: 'Mit jelent összességében?',
    questionEn: 'What does it mean overall?',
    blocks: ['G'],
    indicatorCount: 28,
    priority: 'MAGAS (holisztikus)',
    priorityEn: 'HIGH (holistic)',
    color: '#059669',
    w_irrev_range: '0.5–0.9',
    compositeContrib: 'VKI, CSI értelmezés, Regenerative',
    compositeContribEn: 'VKI, CSI interpretation, Regenerative',
  },
  {
    layer: 8,
    id:    'trajectory',
    label: 'XXVI — Trajectory Vector (Meta-indikátor)',
    labelEn: 'XXVI — Trajectory Vector (Meta-indicator)',
    question: 'Hová tart a civilizáció?',
    questionEn: 'Where is civilization heading?',
    blocks: ['XXVI'],
    indicatorCount: 1,
    priority: 'LEGMAGASABB (meta)',
    priorityEn: 'HIGHEST (meta)',
    color: '#374151',
    w_irrev_range: '1.0',
    compositeContrib: 'VKI, CSI szintézis, Fire Chief Protokoll',
    compositeContribEn: 'VKI, CSI synthesis, Fire Chief Protocol',
  },
];

// ---------------------------------------------------------------------------
// CEWS Version Summary
// ---------------------------------------------------------------------------

export const UCAIF_VERSION = '3.1';
export const TOTAL_INDICATORS = 472;  // base 462 from v3.0 + 10 Manus additions
export const TOTAL_META = 1;           // Trajectory Vector
export const EFU_MODULE_REF = '217.2';
export const EFU_PROTOCOL_REF = '217.3';

// ---------------------------------------------------------------------------
// 10 New Indicators (Manus additions — UCAIF v3.0 → v3.1)
// ---------------------------------------------------------------------------

/**
 * The 10 new indicators introduced in UCAIF v3.1 (Manus synthesis).
 *
 * Metadata fields:
 *   w_irrev       — reversibility weight 0–1 (higher = more irreversible)
 *   latency       — decision–effect delay: 'immediate' | 'medium' | 'long'
 *   recovery_time — recovery time class: 'short' | 'medium' | 'long' | 'very_long'
 *   cascade_flag  — systemic cascade risk: true/false
 *   shadow_delta  — hidden flux relevance: true/false
 *   regenerative  — positive regenerative threshold (0–100 scale)
 *   trajectory    — trajectory vector contribution: 'direct' | 'indirect' | 'meta'
 */
export const MANUS_10_INDICATORS = [
  {
    code:          'MRI_micro',
    label:         'Mikrobiális Rezisztencia Index',
    labelEn:       'Microbial Resistance Index',
    module:        'VIII / XXIV',
    block:         'B/G',
    layer:         2,
    description:   'Antibiotikum-rezisztens kórokozók globális terjedési rátája és kezelési kapacitás-deficit.',
    descriptionEn: 'Global spread rate of antimicrobial-resistant pathogens and treatment capacity deficit.',
    metadata: {
      w_irrev:       0.85,
      latency:       'medium',
      recovery_time: 'very_long',
      cascade_flag:  true,
      shadow_delta:  false,
      regenerative:  20,
      trajectory:    'direct',
    },
  },
  {
    code:          'GSI_geo',
    label:         'Geológiai Stabilitási Index',
    labelEn:       'Geological Stability Index',
    module:        'XXI.9 (Új)',
    block:         'F',
    layer:         6,
    description:   'Tektonikai aktivitás, vulkáni kockázat, szubszidencia és infrastruktúra-sérülékenység.',
    descriptionEn: 'Tectonic activity, volcanic risk, subsidence, and infrastructure vulnerability.',
    metadata: {
      w_irrev:       0.90,
      latency:       'long',
      recovery_time: 'very_long',
      cascade_flag:  true,
      shadow_delta:  false,
      regenerative:  10,
      trajectory:    'direct',
    },
  },
  {
    code:          'LPI',
    label:         'Fényszennyezési Index',
    labelEn:       'Light Pollution Index',
    module:        'I.1 kiegészítés',
    block:         'A',
    layer:         1,
    description:   'Mesterséges éjszakai fény hatása az ökoszisztémára, cirkadián ritmusra és energiafelhasználásra.',
    descriptionEn: 'Artificial night light impact on ecosystems, circadian rhythms, and energy consumption.',
    metadata: {
      w_irrev:       0.55,
      latency:       'medium',
      recovery_time: 'medium',
      cascade_flag:  false,
      shadow_delta:  false,
      regenerative:  40,
      trajectory:    'indirect',
    },
  },
  {
    code:          'CADI',
    label:         'Kollektív Figyelem Eloszlási Index',
    labelEn:       'Collective Attention Distribution Index',
    module:        'XIX kiegészítés',
    block:         'E',
    layer:         5,
    description:   'Társadalmi figyelem fragmentálódása, dezinformáció-terhelés és döntésképesség-csökkenés.',
    descriptionEn: 'Social attention fragmentation, disinformation load, and decision-making capacity decline.',
    metadata: {
      w_irrev:       0.65,
      latency:       'medium',
      recovery_time: 'medium',
      cascade_flag:  true,
      shadow_delta:  true,
      regenerative:  35,
      trajectory:    'indirect',
    },
  },
  {
    code:          'GJI',
    label:         'Generációs Igazságosság Index',
    labelEn:       'Generational Justice Index',
    module:        'III kiegészítés',
    block:         'A',
    layer:         1,
    description:   'Intergenerációs erőforrás-méltányosság, jövőbeli terhek diszkontálása és jogi védelmi szint.',
    descriptionEn: 'Intergenerational resource equity, future burden discounting, and legal protection level.',
    metadata: {
      w_irrev:       0.75,
      latency:       'long',
      recovery_time: 'long',
      cascade_flag:  false,
      shadow_delta:  false,
      regenerative:  60,
      trajectory:    'direct',
    },
  },
  {
    code:          'CACI',
    label:         'Közösségi Adaptációs Kapacitás',
    labelEn:       'Community Adaptive Capacity Index',
    module:        'XII kiegészítés',
    block:         'C',
    layer:         3,
    description:   'Helyi közösségek alkalmazkodóképessége sokkhatásokra (éghajlat, gazdaság, ellátási lánc).',
    descriptionEn: 'Local community adaptability to shocks (climate, economic, supply chain).',
    metadata: {
      w_irrev:       0.60,
      latency:       'medium',
      recovery_time: 'medium',
      cascade_flag:  false,
      shadow_delta:  false,
      regenerative:  55,
      trajectory:    'indirect',
    },
  },
  {
    code:          'SPIEI',
    label:         'Tudományos-Politikai Interfész Hatékonysága',
    labelEn:       'Science–Policy Interface Effectiveness Index',
    module:        'IV kiegészítés',
    block:         'A',
    layer:         1,
    description:   'Tudományos konszenzus és politikai döntéshozatal közötti átviteli hatékonyság és késleltetés.',
    descriptionEn: 'Transfer efficiency and delay between scientific consensus and political decision-making.',
    metadata: {
      w_irrev:       0.70,
      latency:       'medium',
      recovery_time: 'long',
      cascade_flag:  true,
      shadow_delta:  false,
      regenerative:  50,
      trajectory:    'direct',
    },
  },
  {
    code:          'SRMCI',
    label:         'Rendszerszintű Kockázatkezelési Kapacitás',
    labelEn:       'System-level Risk Management Capacity Index',
    module:        'XXI kiegészítés',
    block:         'F',
    layer:         6,
    description:   'Globális és regionális intézmények képessége összetett, kaszkádfenyegetések kezelésére.',
    descriptionEn: 'Global and regional institutional capacity to manage complex, cascading threats.',
    metadata: {
      w_irrev:       0.80,
      latency:       'medium',
      recovery_time: 'long',
      cascade_flag:  true,
      shadow_delta:  false,
      regenerative:  45,
      trajectory:    'direct',
    },
  },
  {
    code:          'NCAI',
    label:         'Természeti Tőke Elszámolási Index',
    labelEn:       'Natural Capital Accounting Index',
    module:        'V kiegészítés',
    block:         'A',
    layer:         1,
    description:   'Ökoszisztéma-szolgáltatások monetáris elszámolásának teljessége a nemzeti számlákban.',
    descriptionEn: 'Completeness of ecosystem service monetisation in national accounts.',
    metadata: {
      w_irrev:       0.72,
      latency:       'long',
      recovery_time: 'very_long',
      cascade_flag:  false,
      shadow_delta:  true,
      regenerative:  65,
      trajectory:    'direct',
    },
  },
  {
    code:          'AECI',
    label:         'AI Etikai Megfelelőségi Index',
    labelEn:       'AI Ethical Compliance Index',
    module:        'XXIII kiegészítés',
    block:         'G',
    layer:         7,
    description:   'Mesterséges intelligencia rendszerek átláthatósága, elszámoltathatósága és társadalmi hatás-auditja.',
    descriptionEn: 'AI system transparency, accountability, and social impact audit.',
    metadata: {
      w_irrev:       0.68,
      latency:       'medium',
      recovery_time: 'medium',
      cascade_flag:  true,
      shadow_delta:  true,
      regenerative:  55,
      trajectory:    'indirect',
    },
  },
];

// ---------------------------------------------------------------------------
// Metadata Schema (reference definitions)
// ---------------------------------------------------------------------------

export const CEWS_METADATA_SCHEMA = {
  w_irrev: {
    label:    'W_irrev — Visszafordíthatósági Súly',
    labelEn:  'W_irrev — Reversibility Weight',
    range:    '0–1',
    desc:     'Minél magasabb, annál irreverzibilisebb a változás és annál nagyobb az előrejelzési súly.',
    descEn:   'Higher values indicate more irreversible change and greater early-warning weight.',
  },
  latency: {
    label:    'Latency — Döntés–Hatás Késleltetés',
    labelEn:  'Latency — Decision–Effect Delay',
    values:   ['immediate', 'medium', 'long'],
    desc:     'Rövid késleltetés → azonnali beavatkozás; hosszú → strukturális tervezés.',
    descEn:   'Short latency → immediate intervention; long → structural planning.',
  },
  recovery_time: {
    label:    'Recovery Time — Helyreállási Idő',
    labelEn:  'Recovery Time — Restoration Duration',
    values:   ['short', 'medium', 'long', 'very_long'],
    desc:     'Hosszabb helyreállási idő → nagyobb előrejelzési prioritás.',
    descEn:   'Longer recovery time → higher early-warning priority.',
  },
  cascade_flag: {
    label:    'Cascade Flag — Kaszkád Kockázat',
    labelEn:  'Cascade Flag — Cascade Risk',
    type:     'boolean',
    desc:     'Igaz esetén az indikátor dominóhatást válthat ki más rétegekben.',
    descEn:   'When true, the indicator may trigger domino effects across other layers.',
  },
  shadow_delta: {
    label:    'Shadow Delta — Rejtett Fluxus',
    labelEn:  'Shadow Delta — Hidden Flux',
    type:     'boolean',
    desc:     'Nem jelentett / illegális tevékenységek korrekciós faktora.',
    descEn:   'Correction factor for unreported / illegal activity.',
  },
  regenerative: {
    label:    'Regenerative — Pozitív Célküszöb',
    labelEn:  'Regenerative — Positive Target Threshold',
    range:    '0–100',
    desc:     'Az R-Future felé mutató regeneratív folyamat célértéke.',
    descEn:   'Target value for regenerative processes pointing towards R-Future.',
  },
  trajectory: {
    label:    'Trajectory — Pályavektor Hozzájárulás',
    labelEn:  'Trajectory — Trajectory Vector Contribution',
    values:   ['direct', 'indirect', 'meta'],
    desc:     'Az indikátor trendjének közvetlen / közvetett / meta szintű hozzájárulása a Trajectory Vectorhoz.',
    descEn:   'Direct / indirect / meta-level contribution of the indicator trend to the Trajectory Vector.',
  },
};

// ---------------------------------------------------------------------------
// Composite Index Definitions
// ---------------------------------------------------------------------------

/**
 * The five CEWS composite indices fed by the weighted indicator system.
 */
export const CEWS_COMPOSITE_INDICES = [
  {
    id:      'CII',
    label:   'CII — Civilizációs Integritás Index',
    labelEn: 'CII — Civilization Integrity Index',
    layers:  [1, 2, 3, 4, 5, 6, 7],
    color:   '#16a34a',
    desc:    'Az összes réteg indikátorainak súlyozott összesítése; a civilizáció általános állapota.',
    descEn:  'Weighted aggregation of all layer indicators; overall civilisation health.',
  },
  {
    id:      'VKI',
    label:   'VKI — Sebezhetőségi-Kritikusság Index',
    labelEn: 'VKI — Vulnerability-Criticality Index',
    layers:  [1, 2, 6, 8],
    color:   '#dc2626',
    desc:    'Irreverzibilis és kaszkád kockázatú indikátorok fókuszált összesítése.',
    descEn:  'Focused aggregation of irreversible and cascade-risk indicators.',
  },
  {
    id:      'MRI',
    label:   'MRI — Metabolikus Reziliencia Index',
    labelEn: 'MRI — Metabolic Resilience Index',
    layers:  [1, 3, 5],
    color:   '#2563eb',
    desc:    'Biofizikai és entitás-specifikus reziliencia kapacitás.',
    descEn:  'Biophysical and entity-specific resilience capacity.',
  },
  {
    id:      'CSI',
    label:   'CSI — Civilizációs Stabilitási Index',
    labelEn: 'CSI — Civilization Stability Index',
    layers:  [2, 3, 7, 8],
    color:   '#7c3aed',
    desc:    'Dinamikus és meta-szintű stabilitás; Fire Chief Protokoll alapja.',
    descEn:  'Dynamic and meta-level stability; basis for the Fire Chief Protocol.',
  },
  {
    id:      'GSI',
    label:   'GSI — Geopolitikai Stabilitási Index',
    labelEn: 'GSI — Geopolitical Stability Index',
    layers:  [5, 6],
    color:   '#be185d',
    desc:    'Topológiai összekötöttség és komplex rendszer törésvonalak.',
    descEn:  'Topological connectivity and complex-system fracture lines.',
  },
];

// ---------------------------------------------------------------------------
// Track A / Track B Operational Protocol
// ---------------------------------------------------------------------------

export const CEWS_TRACKS = {
  A: {
    id:      'A',
    label:   'Track A — Automatizált Standardizált Beavatkozás',
    labelEn: 'Track A — Automated Standardised Intervention',
    color:   '#2563eb',
    steps: [
      { id: 'ingest',    label: 'Bejövő adat (205.4 API)', labelEn: 'Data Ingestion (205.4 API)' },
      { id: 'weight',    label: 'Dinamikus Súlyozási Motor', labelEn: 'Dynamic Weighting Engine' },
      { id: 'composite', label: 'CII / VKI / MRI / CSI / GSI számítás', labelEn: 'CII / VKI / MRI / CSI / GSI calculation' },
      { id: 'trigger',   label: 'Automatizált küszöb-ellenőrzés', labelEn: 'Automated threshold check' },
      { id: 'action',    label: 'Moduláris akciócsomagok', labelEn: 'Modular action packages' },
      { id: 'feedback',  label: 'Visszacsatolási hurok', labelEn: 'Feedback loop' },
    ],
  },
  B: {
    id:      'B',
    label:   'Track B — Fire Chief Protokoll (FC-DSS)',
    labelEn: 'Track B — Fire Chief Protocol (FC-DSS)',
    color:   '#dc2626',
    steps: [
      { id: 'trajectory', label: 'Trajectory Vector értékelés', labelEn: 'Trajectory Vector evaluation' },
      { id: 'fcdss',      label: 'FC-DSS döntéstámogató', labelEn: 'FC-DSS decision support' },
      { id: 'trigger_mx', label: 'Kompozit Trigger Mátrix', labelEn: 'Composite Trigger Matrix' },
      { id: 'action',     label: 'Rendszerszintű beavatkozás', labelEn: 'System-level intervention' },
      { id: 'exit',       label: 'Exit stratégia (600→700→800)', labelEn: 'Exit strategy (600→700→800)' },
    ],
  },
};

// ---------------------------------------------------------------------------
// Trigger Colour Levels
// ---------------------------------------------------------------------------

export const CEWS_TRIGGER_LEVELS = [
  { id: 'green',  label: 'Zöld',      labelEn: 'Green',  action: 'Monitoring',         actionEn: 'Monitoring',             color: '#16a34a' },
  { id: 'yellow', label: 'Sárga',     labelEn: 'Yellow', action: 'Fokozott figyelés',  actionEn: 'Enhanced surveillance',  color: '#ca8a04' },
  { id: 'orange', label: 'Narancs',   labelEn: 'Orange', action: 'Track A aktiválás',  actionEn: 'Track A activation',     color: '#ea580c' },
  { id: 'red',    label: 'Piros',     labelEn: 'Red',    action: 'Fire Chief Protokoll',actionEn:'Fire Chief Protocol',     color: '#dc2626' },
];
