/**
 * meii800_13.js — EFU 800.13 Metabolikus Érték-Intenzitás Index (MEII) v1.1
 *
 * Sorozat: 200 – Policy Framework / GDP-kiegészítő
 * Cél: Az EFU mint a GDP biofizikai kiegészítője – MEII (Metabolikus Érték-Intenzitás Index)
 *      és MEII_w (súlyozott forma impact weighting-gel).
 * Státusz: FC-APPROVED ✓  |  v1.1 FINAL  |  2026.04.11
 *
 * Fő képletek:
 *   MEII     = GDP (USD) / Nemzeti EFU (éves)          [proxy, nem abszolút hatékonyság]
 *   MEII_w   = GDP / Σ_k (Ł_w,k × EFU_k)              [súlyozott, Q3 2026 pilot]
 *   Nemzeti EFU = Nép. + Ipari + Mezőg. + Hulladék EFU
 *
 * Hivatkozás: Zenodo 10.5281/zenodo.18888082 | 10.5281/zenodo.18696746
 */

// ---------------------------------------------------------------------------
// Modul meta
// ---------------------------------------------------------------------------

export const MODULE_META_205 = {
  id: '800.13',
  version: '1.1',
  title: 'EFU mint GDP-kiegészítő',
  titleEn: 'EFU as GDP Supplement',
  subtitle: 'Metabolikus Érték-Intenzitás Keretrendszer | Policy Framework',
  subtitleEn: 'Metabolic Value Intensity Framework | Policy Framework',
  series: '200 – Policy Framework / Biophysical Economics',
  status: 'FC-APPROVED ✓',
  date: '2026.04.11',
  author: 'Simor István',
  formula: [
    'MEII = GDP (USD) / Nemzeti EFU (éves)   [proxy, nem abszolút hatékonyság]',
    'MEII_w = GDP / Σ_k (Ł_w,k × EFU_k)    [súlyozott, Q3 2026 pilot]',
    'Nemzeti EFU = Nép. + Ipari + Mezőg. + Hulladék EFU',
  ].join('\n'),
  efu_base: '1 EFU = 20 kg/nap/fő [100.1 alapján]',
  nexus: ['100.1', '104.8', '00000.1', '104.45 CO₂', '000.7 DQI'],
  zenodo: ['10.5281/zenodo.18888082', '10.5281/zenodo.18696746'],
  limitations: [
    'MEII = proxy, nem abszolút fizikai hatékonysági mutató',
    'Ł_w értékek pilot-kalibrációra várnak (2026 Q3)',
    'AFU–EFU kapcsolat empirikus validáció alatt',
  ],
  gdp_blindspots: [
    'Anyagáramlás intenzitása (mennyi fluxus jutott 1 dollárra?)',
    'Ökológiai externáliák (ki fizet a szennyért?)',
    'Erőforrás-hatékonyság (körkörös vagy lineáris növekedés?)',
    'Rendszer-reziliencia (fenntartható-e ez az ütem?)',
  ],
  efu_adds: [
    'Biofizikai anyagáramlás mérése (100.1 alapján)',
    'Externália-import láthatóvá tétele (Norvégia-eset)',
    'Növekedés minőségének mérése (GDP vs. EFU együttes)',
    'Vállalati és nemzeti szintű összehasonlító adatok',
  ],
};

// ---------------------------------------------------------------------------
// Szektor súlyok (impact weighting Ł_w)
// ---------------------------------------------------------------------------

export const IMPACT_WEIGHTS = [
  {
    id: 'destructive',
    label: 'Destruktív (600.x parazita fluxus)',
    labelEn: 'Destructive (600.x parasite flux)',
    efu_load: 'magas',
    lw_min: 1.0,
    lw_max: 2.0,
    lw_default: 1.5,
    color: '#dc2626',
    note: 'Antiflux szorzóval súlyozva; CFI-B/N/D integráció',
  },
  {
    id: 'luxury',
    label: 'Luxus-fogyasztás',
    labelEn: 'Luxury consumption',
    efu_load: 'közepes',
    lw_min: 0.8,
    lw_max: 1.2,
    lw_default: 1.0,
    color: '#f59e0b',
    note: 'Kontextus-függő; GDP-arányban mérendő',
  },
  {
    id: 'essential',
    label: 'Szükséges (infra, egészség)',
    labelEn: 'Essential (infrastructure, health)',
    efu_load: 'magas',
    lw_min: 0.5,
    lw_max: 0.8,
    lw_default: 0.65,
    color: '#2563eb',
    note: 'Társadalmilag szükséges; nem büntethető',
  },
  {
    id: 'regenerative',
    label: 'Regeneratív (700.x)',
    labelEn: 'Regenerative (700.x)',
    efu_load: 'alacsony',
    lw_min: 0.1,
    lw_max: 0.5,
    lw_default: 0.3,
    color: '#16a34a',
    note: 'Pozitív jövő-réteg; jutalmazás indokolt',
  },
  {
    id: 'digital',
    label: 'Digitális (alacsony anyag)',
    labelEn: 'Digital (low material)',
    efu_load: 'alacsony',
    lw_min: 0.3,
    lw_max: 0.6,
    lw_default: 0.45,
    color: '#7c3aed',
    note: 'Nem automatikusan jobb – hatás-alapon mérendő',
  },
];

// ---------------------------------------------------------------------------
// G7 összehasonlító adatok
// ---------------------------------------------------------------------------

export const G7_DATA = [
  { country: 'Japán',        flag: '🇯🇵', gdp: 4200,  efu: 95,  meii: 44.2, rank: 1, note: 'Hi-tech, kompakt városok' },
  { country: 'Németország',  flag: '🇩🇪', gdp: 4500,  efu: 110, meii: 40.9, rank: 2, note: 'High-tech, vegyipar' },
  { country: 'USA',          flag: '🇺🇸', gdp: 28000, efu: 752, meii: 37.2, rank: 3, note: 'Referencia számítás' },
  { country: 'UK',           flag: '🇬🇧', gdp: 3500,  efu: 98,  meii: 35.7, rank: 4, note: 'Szolgáltatás-orientált' },
  { country: 'Franciaország',flag: '🇫🇷', gdp: 3000,  efu: 95,  meii: 31.6, rank: 5, note: 'Nukleáris energiamix' },
  { country: 'Olaszország',  flag: '🇮🇹', gdp: 2300,  efu: 85,  meii: 27.1, rank: 6, note: 'Közepes ipar' },
  { country: 'Kanada',       flag: '🇨🇦', gdp: 2200,  efu: 95,  meii: 23.2, rank: 7, note: 'Nyersanyag-kitermelés, hideg éghajlat' },
];

// ---------------------------------------------------------------------------
// Vállalati összehasonlítók
// ---------------------------------------------------------------------------

export const CORPORATE_DATA = [
  {
    company: 'Tesla',
    revenue_bn_usd: 100,
    material_t: 500000,
    efu_m: 68.5,
    meii: 1460,
    color: '#dc2626',
    note: '4× több árbevétel anyagfluxus-egységenként',
  },
  {
    company: 'Ford',
    revenue_bn_usd: 150,
    material_t: 3000000,
    efu_m: 411,
    meii: 365,
    color: '#374151',
    note: 'Hagyományos autóipar: magas anyagfluxus',
  },
];

// ---------------------------------------------------------------------------
// Növekedési forgatókönyvek
// ---------------------------------------------------------------------------

export const GROWTH_SCENARIOS = [
  {
    id: 'A',
    label: 'A – Arányos pazarlás',
    gdp_change: '+100%',
    efu_change: '+100% (500M→1Mrd)',
    interpretation: 'Nincs hatékonyság-növekedés – arányos pazarlás',
    color: '#f59e0b',
    good: false,
  },
  {
    id: 'B',
    label: 'B – Maximális hatékonyság ★',
    gdp_change: '+100%',
    efu_change: '0% (500M marad)',
    interpretation: 'Maximális hatékonyság-növekedés: körforgásos gazdaság ✓',
    color: '#16a34a',
    good: true,
  },
  {
    id: 'C',
    label: 'C – Hatékonyság-veszteség',
    gdp_change: '+100%',
    efu_change: '+200% (500M→1.5Mrd)',
    interpretation: 'Hatékonyság-veszteség: növekedés pazarlás útján',
    color: '#dc2626',
    good: false,
  },
];

// ---------------------------------------------------------------------------
// Megvalósítási ütemterv
// ---------------------------------------------------------------------------

export const IMPLEMENTATION_TIMELINE = [
  { phase: 1, year: '2026 – Pilot',   step: '5 pilot ország (Norvégia, Costa Rica, Szingapúr, Ruanda, Bhután). Első EFU-GDP jelentések.', modules: '00000.1 | 000.7 DQI', color: '#2563eb' },
  { phase: 2, year: '2027 – OECD',    step: 'OECD hozzáadja az EFU-t a Better Life Indexhez. G7 csúcs megvitatja.', modules: '800.13 | 104.8 Arány-Standard', color: '#7c3aed' },
  { phase: 3, year: '2028 – ENSZ',    step: 'ENSZ SNA satellite account. IMF IV. cikk. konzultációk metabolikus értékeléssel.', modules: '104.45 CO₂ | 205.3 Transzpar. API', color: '#dc2626' },
  { phase: 4, year: '2029+ – Standard', step: 'Minden ENSZ tagállam jelentést tesz. Klímafinanszírozás MEII-célhoz kötve.', modules: 'Teljes EFU v5.1', color: '#111827' },
];

// ---------------------------------------------------------------------------
// MEII zónák
// ---------------------------------------------------------------------------

export const MEII_ZONES = [
  { id: 'ELITE',    label: '★ Elithatékony',     condition: 'MEII ≥ 40',      color: '#15803d', bg: '#f0fdf4', status: 'KIVÁLÓ', note: 'Japán, Németország – hi-tech, körforgásos struktúra' },
  { id: 'HIGH',     label: '✓ Magas',             condition: '30 ≤ MEII < 40', color: '#16a34a', bg: '#f0fdf4', status: 'JÓ',    note: 'USA, UK – fejlett, de javítható' },
  { id: 'MEDIUM',   label: '~ Közepes',           condition: '15 ≤ MEII < 30', color: '#ca8a04', bg: '#fefce8', status: 'ÁTLAGOS', note: 'Olaszország, Kanada – fejlesztési potenciál' },
  { id: 'LOW',      label: '↓ Alacsony',          condition: '5 ≤ MEII < 15',  color: '#ea580c', bg: '#fff7ed', status: 'GYENGE', note: 'Kína ~4 – nehézipar-dominancia' },
  { id: 'CRITICAL', label: '⚠ Kritikus alacsony', condition: 'MEII < 5',       color: '#dc2626', bg: '#fef2f2', status: 'KRITIKUS', note: 'Elsősorban nyersanyag-kitermelő gazdaságok' },
];

// ---------------------------------------------------------------------------
// Policy eszközök
// ---------------------------------------------------------------------------

export const POLICY_TOOLS = [
  {
    id: 'tax',
    title: 'EFU-alapú Adóreform',
    icon: '💰',
    formula: 'EFU-adó = Nemzeti EFU × Adókulcs (USD/EFU)',
    example: 'Adókulcs = 0,10 USD/EFU → Németország: 110 Mrd EFU × 0,10 = 11 Mrd USD/év',
    note: 'Bevétel → körforgásos gazdaság K+F. Impact weighting-gel bővíthető.',
    color: '#2563eb',
  },
  {
    id: 'cbam',
    title: 'EFU Határkiigazítás (CBAM-kiterjesztés)',
    icon: '🌐',
    formula: 'Kiigazítás = import EFU × (MEII_cél − MEII_forrás)',
    example: '10M EFU × (40,9 − 4,0) = 369M USD importilleték',
    note: 'Egyenlő versenyhelyzet a metabolikus hatékonyság terén.',
    color: '#7c3aed',
  },
  {
    id: 'bonds',
    title: 'MEII-kötött Kötvények',
    icon: '📈',
    formula: 'MEII +10% → kamat −0,5% | MEII −10% → kamat +0,5%',
    example: 'Alapkamat 3% → MEII-javulással 2,5%-ra csökken',
    note: 'Fiskális politika + metabolikus fenntarthatóság összhangba kerül.',
    color: '#16a34a',
  },
];

// ---------------------------------------------------------------------------
// USA szektoriális EFU lebontás
// ---------------------------------------------------------------------------

export const USA_SECTOR_EFU = [
  { sector: 'Népesség',    calc: '335M fő × 365 EFU/év', value_bn: 122.3, color: '#2563eb' },
  { sector: 'Ipar',        calc: 'Anyagáramlás ÷ 7300 kg/év', value_bn: 400,   color: '#ea580c' },
  { sector: 'Mezőgazdaság',calc: 'Élelmiszer + állattartás',    value_bn: 180,   color: '#16a34a' },
  { sector: 'Hulladék',    calc: 'Lerakó + égetés',              value_bn: 50,    color: '#6b7280' },
];
