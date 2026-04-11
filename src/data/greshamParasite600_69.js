/**
 * greshamParasite600_69.js — EFU 600.69 Gresham–Parazita Spirál v1.0
 *
 * Sorozat: 600 – Antifluxus és Rendszerszintű Patológiák
 * Altípus: M9 ANYAGI (PRIMARY) | M12 VÁLSÁG (SECONDARY)
 * Mechanizmus: Metabolikus Extrakció és Rendszerszintű Kiszorítás
 * Kapcsolódó modulok: TÉKK v1.1-M, JIM-30 v1.1, HMI, AP-BLACKBOX, AP-SINKHOLE, AP-GRES-DET
 * Státusz: AKTÍV / KANONIZÁLT
 * Verzió: 1.0
 * Dátum: 2026-04-11
 */

// ---------------------------------------------------------------------------
// Modul meta
// ---------------------------------------------------------------------------

export const MODULE_META_69 = {
  id: '600.69',
  version: '1.0',
  title: 'Gresham–Parazita Spirál',
  titleEn: 'Gresham–Parasite Spiral',
  subtitle: 'Metabolikus Extrakció és Rendszerszintű Kiszorítás',
  subtitleEn: 'Metabolic Extraction and Systemic Displacement',
  series: '600 – Antifluxus és Rendszerszintű Patológiák',
  mechanism_primary: 'M9 ANYAGI',
  mechanism_secondary: 'M12 VÁLSÁG',
  tier: 1,
  priority: 9,
  status: 'AKTÍV / KANONIZÁLT',
  date: '2026-04-11',
  formula: 'GPS = (digital_lock×0.25 + monoblock×0.20 + knowledge_loss×0.15 + entropy_export×0.20 + jim30_loss×0.12 + local_quota_loss×0.08) × S × (1 + Φ/1000)',
  axiom: 'A 600.69 egy öntápláló entrópia-hurok. Akkor aktiválódik, amikor a „Láthatatlan Adósság" jelenértéke meghaladja a technológia által kínált azonnali hasznot, miközben a standard gazdasági mérések számára láthatatlan marad.',
  spiral_phases: ['I. Trójai fázis (Behatolás)', 'II. Gresham fázis (Kiszorítás)', 'III. Jevons összeomlás (Terminális)'],
  nexus: ['TÉKK v1.1-M', 'JIM-30 v1.1', 'HMI', 'AP-BLACKBOX', 'AP-SINKHOLE', 'AP-GRES-DET', '600.00'],
  alternatives: ['JIM-30 kompatibilis helyi rendszer', 'TÉKK-átment nyílt forráskódú megoldás'],
  net_hmi_global: -3.5,
  r_future: 0.15,
  fire_chief_flags: 'JEVONS ÖSSZEOMLÁS – Visszatérési út nincs',
};

// ---------------------------------------------------------------------------
// 6 Változó definíciók (a diagnosztikai táblázatból)
// ---------------------------------------------------------------------------

export const GPS_VARIABLES = [
  {
    id: 'digital_lock',
    code: 'DL',
    label: 'DL – Digitális karantén',
    labelEn: 'Digital lockout rate',
    description: 'Az online hitelesítést igénylő funkciók aránya (0=nincs, 1=100%)',
    descriptionEn: 'Share of functions requiring online authentication (0=none, 1=100%)',
    mechanism: 'M9 ANYAGI',
    keyFact: 'CRITICAL küszöb: >20% – AP-BLACKBOX automatikus vétó-felülvizsgálat',
    alertCode: 'AP-BLACKBOX',
    alertLevel: 'CRITICAL',
    default: 0.30,
    min: 0,
    max: 1,
    step: 0.01,
    threshold: 0.20,
    weight: 0.25,
    unit: '',
    color: '#dc2626',
  },
  {
    id: 'monoblock',
    code: 'MB',
    label: 'MB – Monoblokk-kór',
    labelEn: 'Monobloc disease',
    description: 'A főegység roncsolásmentes szétbonthatatlansága (0=teljes javíthatóság, 1=totális monoblock)',
    descriptionEn: 'Inability to dismantle main unit non-destructively (0=fully repairable, 1=total monoblock)',
    mechanism: 'M9 ANYAGI + JIM-30',
    keyFact: 'HIGH – JIM-30 VÉTÓ: ha főegység nem bontható roncsolásmentesen',
    alertCode: 'JIM-30 VÉTÓ',
    alertLevel: 'HIGH',
    default: 0.55,
    min: 0,
    max: 1,
    step: 0.01,
    threshold: 0.50,
    weight: 0.20,
    unit: '',
    color: '#ea580c',
  },
  {
    id: 'knowledge_loss',
    code: 'KL',
    label: 'KL – Tudás-extrakció',
    labelEn: 'Knowledge extraction',
    description: 'Offline, helyi nyelvű szervizkönyv hiánya (0=teljes dokumentáció, 1=nincs)',
    descriptionEn: 'Absence of offline local-language service documentation (0=full docs, 1=none)',
    mechanism: 'M9 ANYAGI',
    keyFact: 'MEDIUM – AP-GRES-DET: TÉKK IV. nyilvános bemutatás kötelező',
    alertCode: 'AP-GRES-DET',
    alertLevel: 'MEDIUM',
    default: 0.40,
    min: 0,
    max: 1,
    step: 0.01,
    threshold: 0.50,
    weight: 0.15,
    unit: '',
    color: '#ca8a04',
  },
  {
    id: 'entropy_export',
    code: 'EE',
    label: 'EE – Entrópia-export',
    labelEn: 'Entropy export',
    description: 'Globális logisztikai lánc szükségessége a fenntartáshoz (0=helyi, 1=teljes globális függőség)',
    descriptionEn: 'Global logistics chain dependency for maintenance (0=local, 1=full global dependency)',
    mechanism: 'M12 VÁLSÁG',
    keyFact: 'HIGH – AP-SINKHOLE: kötelező alternatív lokális terv',
    alertCode: 'AP-SINKHOLE',
    alertLevel: 'HIGH',
    default: 0.45,
    min: 0,
    max: 1,
    step: 0.01,
    threshold: 0.40,
    weight: 0.20,
    unit: '',
    color: '#7c3aed',
  },
  {
    id: 'jim30_loss',
    code: 'JL',
    label: 'JL – JIM-30 inkompatibilitás',
    labelEn: 'JIM-30 incompatibility',
    description: 'JIM-30 minimálelvnek való meg nem felelés mértéke (0=teljes megfelelés, 1=teljes inkompatibilitás)',
    descriptionEn: 'Degree of JIM-30 minimum-principle non-compliance (0=fully compliant, 1=total failure)',
    mechanism: 'M9 ANYAGI',
    keyFact: 'A JIM-30 pontszám romlása a II. Gresham fázis diagnosztikai markere',
    alertCode: 'JIM-30',
    alertLevel: 'HIGH',
    default: 0.50,
    min: 0,
    max: 1,
    step: 0.01,
    threshold: 0.60,
    weight: 0.12,
    unit: '',
    color: '#0369a1',
  },
  {
    id: 'local_quota_loss',
    code: 'LQ',
    label: 'LQ – Helyi alkatrész-kvóta vesztés',
    labelEn: 'Local parts quota loss',
    description: 'A helyi alkatrész-ellátás és mérnöki autonómia csökkentése (0=teljes autonómia, 1=teljes kiszolgáltatottság)',
    descriptionEn: 'Decline of local parts supply and engineering autonomy (0=full autonomy, 1=total dependency)',
    mechanism: 'M9 ANYAGI + M12 VÁLSÁG',
    keyFact: 'A helyi szaktudás elsorvadása a II. Gresham fázis visszafordíthatatlan markere',
    alertCode: 'AP-SINKHOLE',
    alertLevel: 'HIGH',
    default: 0.35,
    min: 0,
    max: 1,
    step: 0.01,
    threshold: 0.50,
    weight: 0.08,
    unit: '',
    color: '#16a34a',
  },
];

// ---------------------------------------------------------------------------
// Szinergia és Φ
// ---------------------------------------------------------------------------

export const GPS_SYNERGY = {
  id: 'S',
  label: 'S – Spirál-erősítő szorzó',
  labelEn: 'Spiral amplifier multiplier',
  description: 'Változók egymást erősítő hatása (öntápláló entrópia-hurok) – minél magasabb, annál erősebb a spiráldinamika',
  default: 1.15,
  min: 1.0,
  max: 1.8,
  step: 0.01,
  unit: '×',
  color: '#374151',
};

export const GPS_PHI = {
  id: 'Phi',
  label: 'Φ – Halmozott láthatatlan adósság',
  labelEn: 'Cumulative invisible debt',
  description: 'Rejtett jövőbeli költségek halmozott indexe (EFU egység) – lock-in, externáliák, autonómiaveszteség',
  default: 200,
  min: 0,
  max: 1000,
  step: 10,
  unit: 'EFU',
  threshold: 400,
  threshold_fire: 700,
  color: '#9a3412',
  isPhi: true,
};

// ---------------------------------------------------------------------------
// 5 Zóna küszöbértékek
// ---------------------------------------------------------------------------

export const GPS_ZONES = [
  {
    id: 'GREEN',
    label: '🟢 Zöld',
    labelShort: 'ZÖLD',
    condition: 'GPS < 0.5',
    status: 'WATCH',
    statusEn: 'Monitoring phase',
    multiplier: 1.0,
    action: 'TÉKK szűrő ellenőrzés – rendszeres audit',
    color: '#16a34a',
    bg: '#f0fdf4',
    max: 0.5,
  },
  {
    id: 'YELLOW',
    label: '🟡 Sárga',
    labelShort: 'SÁRGA',
    condition: '0.5 – 1.0',
    status: 'TRÓJAI FÁZIS',
    statusEn: 'Trojan phase – hidden debt growing',
    multiplier: 1.2,
    action: 'JIM-30 audit + lokális alternatív terv kidolgozása',
    color: '#ca8a04',
    bg: '#fefce8',
    min: 0.5,
    max: 1.0,
  },
  {
    id: 'ORANGE',
    label: '🟠 Narancs',
    labelShort: 'NARANCS',
    condition: '1.0 – 2.5',
    status: 'GRESHAM FÁZIS',
    statusEn: 'Gresham phase – systemic displacement',
    multiplier: 1.5,
    action: 'TÉKK IV. nyilvános bemutatás + AP-SINKHOLE aktiválás',
    color: '#ea580c',
    bg: '#fff7ed',
    min: 1.0,
    max: 2.5,
  },
  {
    id: 'RED',
    label: '🔴 Piros',
    labelShort: 'PIROS',
    condition: '2.5 – 4.5',
    status: 'JEVONS FÁZIS',
    statusEn: 'Jevons phase – terminal dependency',
    multiplier: 2.0,
    action: 'Vétó-felülvizsgálat + kötelező lokalizációs program',
    color: '#dc2626',
    bg: '#fef2f2',
    min: 2.5,
    max: 4.5,
  },
  {
    id: 'CRITICAL',
    label: '⚫ Kritikus',
    labelShort: 'KRITIKUS',
    condition: 'GPS > 4.5',
    status: 'JEVONS ÖSSZEOMLÁS',
    statusEn: 'Jevons collapse – no return path',
    multiplier: 3.0,
    action: 'Fire Chief + teljes rendszercsere JIM-30 kompatibilis alternatívával',
    color: '#111827',
    bg: '#f9fafb',
    min: 4.5,
  },
];

// ---------------------------------------------------------------------------
// 4 Trigger definíciók
// ---------------------------------------------------------------------------

export const GPS_TRIGGERS = [
  {
    id: 'DIGITAL_KARANTEEN',
    label: 'Digitális Karantén – AP-BLACKBOX',
    labelEn: 'Digital Quarantine – AP-BLACKBOX',
    condition: 'digital_lock > 0.20',
    conditionEn: 'digital_lock > 0.20',
    action: 'Automatikus VÉTÓ-felülvizsgálat – AP-BLACKBOX protokoll aktiválás',
    level: 'CRITICAL',
    color: '#dc2626',
    alertCode: 'AP-BLACKBOX',
    note: 'A funkciók több mint 20%-a online hitelesítést igényel – CRITICAL küszöb',
  },
  {
    id: 'MONOBLOCK_KOR',
    label: 'Monoblokk-kór – JIM-30 VÉTÓ',
    labelEn: 'Monobloc Disease – JIM-30 VETO',
    condition: 'monoblock > 0.50 VAGY jim30_loss > 0.60',
    conditionEn: 'monoblock > 0.50 OR jim30_loss > 0.60',
    action: 'Kötelező alternatív lokális terv – JIM-30 minimumelv-ellenőrzés',
    level: 'HIGH',
    color: '#ea580c',
    alertCode: 'JIM-30 VÉTÓ',
  },
  {
    id: 'ENTROPY_SINKHOLE',
    label: 'Entrópia-Sinkhole – AP-SINKHOLE',
    labelEn: 'Entropy Sinkhole – AP-SINKHOLE',
    condition: 'entropy_export > 0.40 VAGY local_quota_loss > 0.50',
    conditionEn: 'entropy_export > 0.40 OR local_quota_loss > 0.50',
    action: 'TÉKK IV. transzparencia-sokk nyilvános bemutatás + AP-SINKHOLE jelzés',
    level: 'HIGH',
    color: '#7c3aed',
    alertCode: 'AP-SINKHOLE',
  },
  {
    id: 'GRESHAM_FIRE_CHIEF',
    label: 'Gresham Fire Chief – Jevons Összeomlás',
    labelEn: 'Gresham Fire Chief – Jevons Collapse',
    condition: 'GPS > 4.0 VAGY (jim30_loss > 0.7 ÉS local_quota_loss > 0.7) VAGY Φ > 700',
    conditionEn: 'GPS > 4.0 OR (jim30_loss > 0.7 AND local_quota_loss > 0.7) OR Phi > 700',
    action: 'Fire Chief értesítés – JIM-30 kompatibilis teljes csereprogram azonnali indítás',
    level: 'CRITICAL',
    color: '#111827',
    note: 'A szimbiotikus infrastruktúrát a II. fázisban felszámolták. Nincs visszatérési út.',
  },
];

// ---------------------------------------------------------------------------
// Fire Chief audit (spirál fázis diagnózis)
// ---------------------------------------------------------------------------

export const FIRE_CHIEF_AUDIT_69 = [
  {
    layer: 'I. Trójai fázis: Alacsony belépési költség',
    verdict: 'RED',
    detail: 'Rejtett S-factor (függőségi szorzó) – a döntéshozó nem érzékeli a jövőbeli autonómiaveszteséget',
  },
  {
    layer: 'I. Trójai fázis: Licenc- és szervizfüggőség',
    verdict: 'RED',
    detail: 'Magas licenc- vagy speciális szervizigény + külső szoftver-/alkatrészfüggőség',
  },
  {
    layer: 'II. Gresham fázis: Helyi szaktudás elsorvadása',
    verdict: 'RED',
    detail: 'Műhelyek, mérnöki autonómia megszűnése – a javíthatósági kapacitás eltűnik',
  },
  {
    layer: 'II. Gresham fázis: „Dobd el és cseréld" ciklus',
    verdict: 'RED',
    detail: 'JIM-30 pontszám romlása + importarány növekedése + helyi alkatrész-kvóta csökkenése',
  },
  {
    layer: 'III. Jevons összeomlás: EZ SEV 2 sérülékenység',
    verdict: 'RED',
    detail: 'Konfliktuszóna hatására külső ellátási lánc/szerverkapcsolat megszakadásakor azonnali leállás',
  },
  {
    layer: 'AP-BLACKBOX: Digitális karantén',
    verdict: 'RED',
    detail: '>20% funkció online hitelesítést igényel – CRITICAL szintű zárt doboz',
  },
  {
    layer: 'TÉKK szűrő: Biofizikai alkalmasság',
    verdict: 'GREEN',
    detail: 'Ha a rendszer átmegy a TÉKK és JIM-30 szűrőkön – nem parazita',
  },
  {
    layer: 'JIM-30 minimumelv: Helyi javíthatóság',
    verdict: 'GREEN',
    detail: 'JIM-30 kompatibilis rendszer: helyi javítható, offline dokumentált, lokális alkatrészek',
  },
];

// ---------------------------------------------------------------------------
// Beavatkozások
// ---------------------------------------------------------------------------

export const GPS_INTERVENTIONS = [
  {
    step: 1,
    title: 'TÉKK szűrő alkalmazása',
    description: 'Minden új technológiai beszerzés átmegy a TÉKK v1.1-M biofizikai és matematikai alkalmassági teszten',
    estimated_impact: 'A parazita technológiák >70%-a kiszűrhető a belépési ponton',
    r_future_delta: '+0.15',
  },
  {
    step: 2,
    title: 'JIM-30 minimumelv kötelezővé tétele',
    description: 'Minden közintézményi eszköz megfelel a JIM-30 helyi javíthatósági minimumelvnek',
    estimated_impact: 'Helyi szervizkapacitás visszaépítése – Gresham fázis visszafordítása',
    r_future_delta: '+0.20',
  },
  {
    step: 3,
    title: 'HMI aggregációs szabály alkalmazása',
    description: 'Az összes digitális zárolási arány (DL) nyilvánosan mért és közzétett HMI komponensként',
    estimated_impact: 'Digitális karantén láthatóvá tétele – AP-BLACKBOX korai azonosítás',
    r_future_delta: '+0.10',
  },
  {
    step: 4,
    title: 'Lokális alkatrész- és szaktudás-kvóta visszaépítése',
    description: 'Kötelező helyi szervizkönyv (offline, magyar nyelvű) + hazai alkatrész-biztonsági kvóta',
    estimated_impact: 'Jevons összeomlás kockázatának csökkentése EZ SEV 2 szcenáriókban',
    r_future_delta: '+0.18',
  },
];
