/**
 * hobbyAnimal600_30.js — EFU 600.30 Hobby Animal Keeping & Wildlife Extraction Parasitism v1.0
 *
 * Sorozat: 600 – Antifluxus és Rendszerszintű Patológiák
 * Altípus: M9 ANYAGI (PRIMARY) | M7 FEKETE (SECONDARY – csempészet réteg)
 * Almodulok: 6 réteg – Macskák | Legális szektor | Egzotikus | Vadcsempészet | Vadászat | Inváziós fajok
 * Kapcsolódó modulok: 600.4, 600.27, 600.39, 600.40, 600.45, 104.27, 104.19
 * Alternatívák: 700.1 (regeneratív), 700.3 (korlátolt), 800.12 (Gaian Awakening)
 * Speciális flagek: BLACK_LAYER_RESTRICTED | UNINTENTIONAL_PARASITISM
 * Státusz: AKTÍV / PILOT-READY
 * Verzió: 1.0
 * Dátum: 2026-04-10
 */

// ---------------------------------------------------------------------------
// Modul meta
// ---------------------------------------------------------------------------

export const MODULE_META_30 = {
  id: '600.30',
  version: '1.0',
  title: 'Hobbi Állattartás és Vadászati Parazitizmus',
  titleEn: 'Hobby Animal Keeping and Wildlife Extraction Parasitism',
  subtitle: 'A kedvencektől a maffiáig – a hobbi állattartás teljes EFU auditja',
  subtitleEn: 'From Pets to Trafficking – The Full EFU Audit of Hobby Animal Systems',
  series: '600 – Antifluxus és Rendszerszintű Patológiák',
  mechanism_primary: 'M9 ANYAGI',
  mechanism_secondary: 'M7 FEKETE',
  tier: 1,
  priority: 8,
  status: 'AKTÍV / PILOT-READY',
  date: '2026-04-10',
  formula: 'HAP = (L1×0.25 + L2×0.15 + L3×0.20 + L4×0.20 + L5×0.12 + L6×0.08) × S × (1 + Φ/1000)',
  special_flags: {
    BLACK_LAYER_RESTRICTED: true,
    UNINTENTIONAL_PARASITISM: true,
  },
  nexus: ['600.4', '600.27', '600.39', '600.40', '600.45', '104.27', '104.19'],
  alternatives: ['700.1 (regeneratív vadgazdálkodás)', '700.3 (korlátolt vadászat)', '800.12 (Gaian Awakening)'],
  net_hmi_global: -2.0,
  r_future: 0.28,
  fire_chief_flags: '6/8 RED FLAG – Szisztematikus parazitizmus CONFIRMED',
};

// ---------------------------------------------------------------------------
// 6 Réteg – változó definíciók
// ---------------------------------------------------------------------------

export const HAP_LAYERS = [
  {
    id: 'L1',
    layer: 1,
    code: 'CAT',
    label: 'L1 – Macska ökológiai hatás',
    labelEn: 'Cat ecological impact',
    description: 'Feral + szabad macskák madár/emlős pusztítása (0=nincs, 1=maximális)',
    descriptionEn: 'Feral + free-roaming cats: bird/mammal kill rate (0=none, 1=maximum)',
    mechanism: 'M9 ANYAGI',
    keyFact: 'USA: 1.3–4.0 milliárd madár/év (Loss et al., Nature Comms 2013)',
    default: 0.55,
    min: 0,
    max: 1,
    step: 0.01,
    threshold: 0.6,
    weight: 0.25,
    unit: '',
    color: '#7c3aed',
    flag: 'UNINTENTIONAL_PARASITISM',
    nexus_module: '600.27',
  },
  {
    id: 'L2',
    layer: 2,
    code: 'PET',
    label: 'L2 – Legális szektór erőforrás-igény',
    labelEn: 'Legal pet sector resource intensity',
    description: 'Erőforrás-extrakció: CO₂, fehérje, víz (0=minimal, 1=maximális)',
    descriptionEn: 'Resource extraction: CO₂, protein, water intensity (0=minimal, 1=maximum)',
    mechanism: 'M9 ANYAGI',
    keyFact: 'Globális ipar $260 Mrd/év; US kutyák+macskák CO₂ = Uruguay teljes kibocsátása',
    default: 0.45,
    min: 0,
    max: 1,
    step: 0.01,
    threshold: 0.5,
    weight: 0.15,
    unit: '',
    color: '#0369a1',
    flag: 'UNINTENTIONAL_PARASITISM',
  },
  {
    id: 'L3',
    layer: 3,
    code: 'EXO',
    label: 'L3 – Egzotikus állattartás (CITES szürkezóna)',
    labelEn: 'Exotic pet trade (CITES grey zone)',
    description: 'Féllegális kereskedelem intenzitása CITES II fajokra (0=nincs, 1=teljes)',
    descriptionEn: 'Semi-legal trade intensity for CITES II species (0=none, 1=full)',
    mechanism: 'M9 ANYAGI + M7 FEKETE kezdet',
    keyFact: 'Befogott állatok 50–75%-a elpusztul mielőtt vevőhöz ér; tengeri hal 25–30 Mrd/év',
    default: 0.40,
    min: 0,
    max: 1,
    step: 0.01,
    threshold: 0.4,
    weight: 0.20,
    unit: '',
    color: '#d97706',
    nexus_module: '600.45',
  },
  {
    id: 'L4',
    layer: 4,
    code: 'TRF',
    label: 'L4 – Vadcsempészet (fekete réteg)',
    labelEn: 'Wildlife trafficking (black layer)',
    description: 'Illegális vadkereskedelem intenzitása (0=nincs, 1=teljes infrastruktúra)',
    descriptionEn: 'Illegal wildlife trade intensity (0=none, 1=full maffia infrastructure)',
    mechanism: 'M7 FEKETE PRIMARY',
    keyFact: '$23–26 Mrd/év (UNODC 2020); azonos hálózat a 600.39 emberkereskedelemmel',
    default: 0.35,
    min: 0,
    max: 1,
    step: 0.01,
    threshold: 0.3,
    weight: 0.20,
    unit: '',
    color: '#dc2626',
    flag: 'BLACK_LAYER_RESTRICTED',
    nexus_module: '600.39',
    restricted: true,
  },
  {
    id: 'L5',
    layer: 5,
    code: 'HNT',
    label: 'L5 – Vadászati parazitizmus',
    labelEn: 'Hunting parasitism',
    description: 'Nem fenntartható vadászat aránya (0=teljesen fenntartható, 1=tisztán trófeavadászat)',
    descriptionEn: 'Non-sustainable hunting ratio (0=fully sustainable, 1=pure trophy hunting)',
    mechanism: 'M9 ANYAGI + M2 PROTOKOLL',
    keyFact: 'Cápa 73–100 M/év; oroszlán populáció -94% 1975 óta',
    default: 0.40,
    min: 0,
    max: 1,
    step: 0.01,
    threshold: 0.5,
    weight: 0.12,
    unit: '',
    color: '#ea580c',
    hasPositiveCase: true,
    positiveNote: 'Fenntartható vadgazdálkodás és inváziós faj kontroll pozitív EFU értéket termel',
  },
  {
    id: 'L6',
    layer: 6,
    code: 'INV',
    label: 'L6 – Inváziós fajok (szabadon engedés)',
    labelEn: 'Invasive species (pet release)',
    description: 'Kedvencként tartott inváziós fajok szabadon engedési kockázata (0=nincs, 1=teljes)',
    descriptionEn: 'Invasive species release risk from abandoned pets (0=none, 1=maximum)',
    mechanism: 'M9 + M12 VÁLSÁG',
    keyFact: '$423 Mrd/év globális kár (Lonsdale 2021); Florida python – kis emlős populáció 99% pusztulás',
    default: 0.30,
    min: 0,
    max: 1,
    step: 0.01,
    threshold: 0.4,
    weight: 0.08,
    unit: '',
    color: '#16a34a',
    nexus_module: '104.51A',
  },
];

// ---------------------------------------------------------------------------
// Szinergia és Φ
// ---------------------------------------------------------------------------

export const HAP_SYNERGY = {
  id: 'S',
  label: 'S – Szinergia szorzó',
  labelEn: 'Synergy multiplier',
  description: 'Rétegek egymást erősítő hatása (pl. legális szektór + fekete réteg azonos infrastruktúra)',
  default: 1.1,
  min: 1.0,
  max: 1.5,
  step: 0.01,
  unit: '×',
  color: '#374151',
};

export const HAP_PHI = {
  id: 'Phi',
  label: 'Φ – Halmozott EFU kár',
  labelEn: 'Cumulative EFU harm',
  description: 'Összesített ökológiai és társadalmi kárindex (EFU egység)',
  default: 150,
  min: 0,
  max: 1000,
  step: 10,
  unit: 'EFU',
  threshold: 300,
  threshold_fire: 600,
  color: '#9a3412',
  isPhi: true,
};

// ---------------------------------------------------------------------------
// 5 Zóna küszöbértékek
// ---------------------------------------------------------------------------

export const HAP_ZONES = [
  {
    id: 'GREEN',
    label: '🟢 Zöld',
    labelShort: 'ZÖLD',
    condition: 'HAP < 0.8',
    status: 'WATCH',
    statusEn: 'Structural monitoring',
    multiplier: 1.0,
    action: 'Monitorozás – oktatási kampány',
    color: '#16a34a',
    bg: '#f0fdf4',
    max: 0.8,
  },
  {
    id: 'YELLOW',
    label: '🟡 Sárga',
    labelShort: 'SÁRGA',
    condition: '0.8 – 1.5',
    status: 'STRUKTURÁLIS',
    statusEn: 'Structural harm identified',
    multiplier: 1.2,
    action: 'TNR program + CITES audit',
    color: '#ca8a04',
    bg: '#fefce8',
    min: 0.8,
    max: 1.5,
  },
  {
    id: 'ORANGE',
    label: '🟠 Narancs',
    labelShort: 'NARANCS',
    condition: '1.5 – 3.0',
    status: 'CONFIRMED',
    statusEn: 'Systemic parasitism confirmed',
    multiplier: 1.5,
    action: 'CEWS M9 trigger + fekete réteg vizsgálat',
    color: '#ea580c',
    bg: '#fff7ed',
    min: 1.5,
    max: 3.0,
  },
  {
    id: 'RED',
    label: '🔴 Piros',
    labelShort: 'PIROS',
    condition: '3.0 – 6.0',
    status: 'KARANTÉN',
    statusEn: 'Emergency quarantine',
    multiplier: 2.0,
    action: 'Karantén protokoll + 700.1 beavatkozás',
    color: '#dc2626',
    bg: '#fef2f2',
    min: 3.0,
    max: 6.0,
  },
  {
    id: 'CRITICAL',
    label: '⚫ Kritikus',
    labelShort: 'KRITIKUS',
    condition: 'HAP > 6.0',
    status: 'FIRE CHIEF',
    statusEn: 'Fire Chief activation',
    multiplier: 3.0,
    action: 'Fire Chief + 700.1 + 800.12 Gaian protocol',
    color: '#111827',
    bg: '#f9fafb',
    min: 6.0,
  },
];

// ---------------------------------------------------------------------------
// 4 Trigger definíciók
// ---------------------------------------------------------------------------

export const HAP_TRIGGERS = [
  {
    id: 'UNINTENTIONAL_HARM',
    label: 'Szándéktalan Strukturális Kár',
    labelEn: 'Unintentional Structural Harm',
    condition: 'L1 > 0.5 VAGY L2 > 0.45',
    conditionEn: 'L1 > 0.5 OR L2 > 0.45',
    action: 'TNR program indítás + erőforrás-cimkézés + oktatási kampány',
    level: 'AMBER',
    color: '#ca8a04',
    flag: 'UNINTENTIONAL_PARASITISM',
    note: 'Egyedi a 600-as sorozatban: szándék nélküli parazitizmus',
  },
  {
    id: 'BLACK_LAYER',
    label: 'M7 Fekete Réteg Aktiválás',
    labelEn: 'M7 Black Layer Activation',
    condition: 'L4 > 0.5 VAGY Φ > 400',
    conditionEn: 'L4 > 0.5 OR Phi > 400',
    action: 'CITES büntetőrendszer megerősítés + UNODC koordináció + 600.39 nexus aktiválás',
    level: 'RED',
    color: '#7c3aed',
    flag: 'BLACK_LAYER_RESTRICTED',
    restricted: true,
  },
  {
    id: 'INVASION_ALERT',
    label: 'Inváziós Faj Riasztás',
    labelEn: 'Invasive Species Alert',
    condition: 'L6 > 0.4 ÉS (L3 > 0.3 VAGY L5 > 0.4)',
    conditionEn: 'L6 > 0.4 AND (L3 > 0.3 OR L5 > 0.4)',
    action: 'Hobbiállat-visszaadó program + kötelező inváziós faj kockázati cimke',
    level: 'ORANGE',
    color: '#ea580c',
    nexus: '104.51A',
  },
  {
    id: 'FIRE_CHIEF',
    label: 'Fire Chief – Ökológiai Összeomlás',
    labelEn: 'Fire Chief – Ecological Collapse',
    condition: 'HAP > 5.0 VAGY L4 > 0.7 VAGY Φ > 600',
    conditionEn: 'HAP > 5.0 OR L4 > 0.7 OR Phi > 600',
    action: 'Fire Chief értesítés – 700.1 + 800.12 Gaian Awakening protocol aktiválás',
    level: 'CRITICAL',
    color: '#111827',
  },
];

// ---------------------------------------------------------------------------
// Fire Chief audit eredmények (6/8 RED FLAG)
// ---------------------------------------------------------------------------

export const FIRE_CHIEF_AUDIT = [
  { layer: 'L1: Macskák ökológiai kára', verdict: 'RED', detail: '1.3–4 Mrd madár/év – 600.27 kaszkad (Nature Comms 2013)' },
  { layer: 'L2: Legális hobbiállat erőforrás', verdict: 'RED', detail: '$260 Mrd/év; US kutya+macska CO₂ = Uruguay teljes kibocsátása' },
  { layer: 'L3: Egzotikus állattartás (CITES II)', verdict: 'RED', detail: '50–75% befogott állat elpusztul – megelőzhető halálesetek' },
  { layer: 'L4: Fekete vadcsempészet', verdict: 'RED_RESTRICTED', detail: '$23–26 Mrd/év; azonos infrastruktúra 600.39-cel (UNODC)' },
  { layer: 'L5: Trófeavadászat (védett fajok)', verdict: 'RED', detail: 'Oroszlán 94% csökkenés; cápa 73–100 M/év – apex ragadozó' },
  { layer: 'L6: Inváziós fajok (szabadon engedés)', verdict: 'RED', detail: '$423 Mrd/év globális kár; Florida python – 99% kis emlős pusztulás' },
  { layer: 'L7: Fenntartható vadgazdálkodás', verdict: 'GREEN', detail: 'Ragadozó-szabályozás, inváziós faj kontroll – valódi EFU érték' },
  { layer: 'L8: Terápiás állathasználat', verdict: 'GREEN', detail: 'HMI +pozitív – segítő kutyák, terápiás lovak – 500.4 Resilience nexus' },
];

// ---------------------------------------------------------------------------
// Védelmi beavatkozások és becsült hatás
// ---------------------------------------------------------------------------

export const INTERVENTIONS = [
  {
    step: 1,
    title: 'TNR program (feral macska)',
    description: 'Trap-Neuter-Return – leghatékonyabb feral macska populáció-szabályozás',
    estimated_impact: 'Madár-pusztulás -30–50% 10 év alatt (Dauphiné & Robinson, 2009)',
    r_future_delta: '+0.08',
  },
  {
    step: 2,
    title: 'CITES büntetőrendszer megerősítése',
    description: 'Digitális QR-kód alapú állatpassz + UNODC finanszírozás növelés',
    estimated_impact: 'Védett faj kereskedelem -40% (TRAFFIC modell becslés)',
    r_future_delta: '+0.12',
  },
  {
    step: 3,
    title: 'Inváziós faj tudatosság kampány',
    description: 'Kötelező kockázati cimke + szankciómentes visszaadó program',
    estimated_impact: '$423 Mrd/év globális kár 5–10%-a megelőzhető – $20–40 Mrd megtakarítás',
    r_future_delta: '+0.06',
  },
  {
    step: 4,
    title: 'EFU hobbiállat-cimkézés',
    description: 'Minden hobbiállat-táp EFU szimulációja (mint az energiacímke)',
    estimated_impact: 'Fogyasztói döntéstámogatás – nehezen mérhető rövid távon',
    r_future_delta: '+0.03',
  },
];
