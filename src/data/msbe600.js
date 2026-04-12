/**
 * msbe600.js — EFU 600.2 Molekuláris Rendszerhatár-Események (MSBE)
 *
 * Molecular System Boundary Events (MSBE):
 * Classification criteria, primary categories, measurement indicators,
 * SBE trigger thresholds, and related module cross-references.
 *
 * Reference: EFU 600.2 (2026.04)
 * Kapcsolódó modulok: 600.0, 600.3, 600.51, 600.52, 104.28
 */

// ---------------------------------------------------------------------------
// MSBE Osztályozási Kritériumok (§600.2.3)
// ---------------------------------------------------------------------------

/**
 * Az anyag MSBE kategóriába sorolandó, ha LEGALÁBB EGY teljesül.
 */
export const MSBE_CRITERIA = [
  {
    id: 'C1',
    label: 'Biológiai felezési idő',
    labelEn: 'Biological half-life',
    unit: 'év',
    unitEn: 'years',
    threshold: 'meghaladja az ökoszisztéma regenerációs ciklusát',
    thresholdEn: 'exceeds ecosystem regeneration cycle',
    description: 'A molekula biológiai felezési ideje meghaladja az ökoszisztéma regenerációs ciklusát. Az anyag az élő rendszerekben felhalmozódik, mielőtt lebomlik.',
    sbe_activation: 'MSBE kritérium 1 aktiválódik',
    indicator_id: 'I_HALFLIFE',
    color: '#7c3aed',
  },
  {
    id: 'C2',
    label: 'Bioakkumulációs faktor (BAF)',
    labelEn: 'Bioaccumulation Factor (BAF)',
    unit: 'egység nélküli',
    unitEn: 'dimensionless',
    threshold: 'BAF > 1 a trofikus lánc bármely szintjén',
    thresholdEn: 'BAF > 1 at any trophic level',
    description: 'A bioakkumulációs faktor 1-nél nagyobb, ami azt jelzi, hogy az anyag az élőlényekben magasabb koncentrációban halmozódik fel, mint a környezetében.',
    sbe_activation: 'MSBE kritérium 2 aktiválódik',
    indicator_id: 'I_BAF',
    color: '#dc2626',
  },
  {
    id: 'C3',
    label: 'Lebontási melléktermék toxicitása',
    labelEn: 'Degradation product toxicity',
    unit: 'LD50 / EC50',
    unitEn: 'LD50 / EC50',
    threshold: 'toxikusabb az eredeti anyagnál',
    thresholdEn: 'more toxic than parent compound',
    description: 'A lebontási folyamat során keletkező mellékterméke toxikusabb az eredeti anyagnál (pl. dioxin → furán; DDT → DDE). Ez fokozza a hosszú távú ökoszisztéma-kockázatot.',
    sbe_activation: 'MSBE kritérium 3 aktiválódik',
    indicator_id: 'I_METABOLITE_TOX',
    color: '#ea580c',
  },
  {
    id: 'C4',
    label: 'Természetes analóg hiánya',
    labelEn: 'No natural analogue',
    unit: 'igen/nem',
    unitEn: 'yes/no',
    threshold: 'nincs természetes analóg a bioszférában',
    thresholdEn: 'no natural analogue in the biosphere',
    description: 'Az anyagnak nincs természetes megfelelője a bioszférában (pl. PFAS C–F kötés, szintetikus polimerek). Az ökoszisztéma evolúciósan nem rendelkezik lebontó mechanizmussal.',
    sbe_activation: 'MSBE kritérium 4 aktiválódik',
    indicator_id: 'I_NOVELTY',
    color: '#be185d',
  },
];

// ---------------------------------------------------------------------------
// MSBE Elsődleges Kategóriák (§600.2.4)
// ---------------------------------------------------------------------------

export const MSBE_CATEGORIES = [
  {
    id: 'POP',
    label: 'Persistent Organic Pollutants (POP)',
    labelHu: 'Tartós Szerves Szennyezők',
    abbrev: 'POP',
    description: 'Széles körben fennmaradó, lipofil szerves vegyületek, amelyek a trofikus láncon keresztül bioakkumulálódnak. Tartalmazza a PCB-ket, DDT-t, dioxinokat.',
    criteria_met: ['C1', 'C2', 'C3'],
    default_halflife: 15,      // évek
    default_baf: 4.5,
    default_metabolite_tox: true,
    default_novelty: false,
    ref_module: '600.0',
    color: '#7c3aed',
    risk_level: 'HIGH',
  },
  {
    id: 'PFAS',
    label: 'PFAS / Forever Chemicals',
    labelHu: 'Örökké Megmaradó Vegyületek',
    abbrev: 'PFAS',
    description: 'Per- és polifluor-alkil anyagok. Rendkívüli C–F kémiai stabilitásuk miatt gyakorlatilag nem bomlanak le. Globálisan jelen vannak talajban, vízben és emberi vérben.',
    criteria_met: ['C1', 'C2', 'C4'],
    default_halflife: 92,      // évek (humán szérumban ~3.8 év, talajban ~92 év)
    default_baf: 2.8,
    default_metabolite_tox: false,
    default_novelty: true,
    ref_module: '600.52',
    color: '#dc2626',
    risk_level: 'CRITICAL',
  },
  {
    id: 'MICROPLASTIC',
    label: 'Mikroplasztik & Nanoplasztik',
    labelHu: 'Mikroplasztik és Nanoplasztik',
    abbrev: 'MP/NP',
    description: 'Polimer fragmentumok 5 mm alatt (mikroplasztik) és 1 µm alatt (nanoplasztik). Mindenütt jelen vannak az ökoszisztémában, az emberi testben és az óceánok mélyén.',
    criteria_met: ['C1', 'C4'],
    default_halflife: 450,     // évek (PET palack becsült bomlása)
    default_baf: 1.2,
    default_metabolite_tox: false,
    default_novelty: true,
    ref_module: '600.51',
    color: '#0891b2',
    risk_level: 'HIGH',
  },
  {
    id: 'EDC',
    label: 'Szintetikus hormonok & endokrin diszruptorok',
    labelHu: 'Endokrin Diszruptorok',
    abbrev: 'EDC',
    description: 'A biológiai hormonális jelrendszert interferáló szintetikus vegyületek (pl. biszfenol-A, ftalátok, etinilösztradiol). Már nanogram szinten hatásosak.',
    criteria_met: ['C2', 'C4'],
    default_halflife: 8,
    default_baf: 1.8,
    default_metabolite_tox: true,
    default_novelty: true,
    ref_module: '600.0',
    color: '#be185d',
    risk_level: 'HIGH',
  },
  {
    id: 'RADIOACTIVE',
    label: 'Radioaktív izotópok (technogén)',
    labelHu: 'Technogén Radioaktív Izotópok',
    abbrev: 'RAD',
    description: 'Technológiai tevékenységből származó radioaktív izotópok (Cs-137, Sr-90, Pu-239). Felezési idejük geológiai időskálán mérhető; ionizáló sugárzásuk közvetlen biológiai károsodást okoz.',
    criteria_met: ['C1', 'C4'],
    default_halflife: 30240,   // évek (Pu-239: ~24.100 év)
    default_baf: 3.1,
    default_metabolite_tox: false,
    default_novelty: true,
    ref_module: '600.0',
    color: '#374151',
    risk_level: 'CRITICAL',
  },
];

// ---------------------------------------------------------------------------
// MSBE Mérési Indikátorok (§600.2.7)
// ---------------------------------------------------------------------------

export const MSBE_INDICATORS = [
  {
    id: 'I_HALFLIFE',
    label: 'Biológiai felezési idő (t½)',
    labelEn: 'Biological half-life',
    unit: 'év',
    threshold: null,          // dinamikus: > ökoszisztéma regenerációs ciklus
    eco_cycle_default: 25,    // évek — alapértelmezett ökoszisztéma regenerációs ciklus referencia
    description: 'A molekula biológiai felezési ideje az élő rendszerekben. Ha meghaladja az ökoszisztéma regenerációs ciklusát, MSBE kritérium 1 aktiválódik.',
    links_criteria: ['C1'],
    measurement_methods: ['Laboratóriumi lebontási teszt', 'Terepi monitorozás', 'Irodalmi adatok'],
  },
  {
    id: 'I_BAF',
    label: 'Bioakkumulációs faktor (BAF)',
    labelEn: 'Bioaccumulation Factor',
    unit: 'egység nélküli',
    threshold: 1.0,
    description: 'A trofikus lánc bármely szintjén mért bioakkumulációs faktor. BAF > 1 esetén MSBE kritérium 2 aktiválódik.',
    links_criteria: ['C2'],
    measurement_methods: ['Terepi mintavétel', 'Szöveti koncentráció mérés', 'QSAR modellezés'],
  },
  {
    id: 'I_METABOLITE_TOX',
    label: 'Lebontási melléktermék toxicitása',
    labelEn: 'Metabolite toxicity ratio',
    unit: 'igen/nem (LD50 összehasonlítás)',
    threshold: 1.0,           // > 1 = melléktermék toxikusabb
    description: 'A lebontási melléktermék toxicitásának aránya az eredeti anyaghoz képest (LD50_metabolit / LD50_szülő < 1 → toxikusabb melléktermék). Ha igen, MSBE kritérium 3 aktiválódik.',
    links_criteria: ['C3'],
    measurement_methods: ['Ecotoxikológiai teszt', 'In vitro sejtkultúra', 'Irodalmi áttekintés'],
  },
  {
    id: 'I_NOVELTY',
    label: 'Természetes analóg hiánya',
    labelEn: 'Environmental novelty',
    unit: 'logikai (igen/nem)',
    threshold: null,           // bináris
    description: 'Az anyagnak nincs természetes analógja a bioszférában. Ha nincs természetes analóg, MSBE kritérium 4 aktiválódik.',
    links_criteria: ['C4'],
    measurement_methods: ['Molekuláris szerkezet összehasonlítás', 'Bioszféra-adatbázis keresés'],
  },
];

// ---------------------------------------------------------------------------
// SBE Triggerek (§600.2.7 — kapcsolat 600.7 SBE szintekhez)
// ---------------------------------------------------------------------------

export const SBE_TRIGGER_LEVELS = [
  {
    level: 0,
    id: 'SBE_0',
    label: 'Nincs MSBE kritérium',
    labelEn: 'No MSBE criteria met',
    color: '#16a34a',
    action: 'Monitoring folytatása',
    cews_trigger: 'green',
  },
  {
    level: 1,
    id: 'SBE_1',
    label: 'MSBE — Elővigyázatossági besorolás',
    labelEn: 'MSBE — Precautionary classification',
    color: '#ca8a04',
    action: 'Megerősítő mérés szükséges',
    cews_trigger: 'yellow',
  },
  {
    level: 2,
    id: 'SBE_2',
    label: 'MSBE — Megerősített esemény',
    labelEn: 'MSBE — Confirmed event',
    color: '#ea580c',
    action: 'Track A CEWS aktiválás; 600.52-CFI-B réteg frissítés',
    cews_trigger: 'orange',
  },
  {
    level: 3,
    id: 'SBE_3',
    label: 'MSBE — Kritikus / Irreverzibilis',
    labelEn: 'MSBE — Critical / Irreversible',
    color: '#dc2626',
    action: 'Fire Chief Protokoll; 600.7 SBE maximális szint; azonnali beavatkozás',
    cews_trigger: 'red',
  },
];

// ---------------------------------------------------------------------------
// Kapcsolódó modulok cross-reference
// ---------------------------------------------------------------------------

export const MSBE_RELATED_MODULES = {
  '600.0':  'SBE alapdefiníció és kritériumrendszer',
  '600.2':  'MSBE — Molekuláris rendszerhatár-események (ez a modul)',
  '600.3':  'Biogeokémiai ciklus sérülések',
  '600.51': 'Plastic Metabolism',
  '600.52': 'PFAS & Forever Chemicals',
  '104.28': 'Chemical Industry Licence',
  'CEWS':   'Civilization Early Warning System — valós idejű riasztás',
};

// ---------------------------------------------------------------------------
// Bizonyíték szintek (§600.2.5 elővigyázatosság)
// ---------------------------------------------------------------------------

export const EVIDENCE_LEVELS = [
  { id: 'none',          label: 'Nincs bizonyíték',           labelEn: 'No evidence',           color: '#6b7280', precautionary: true,  note: 'Molekuláris tulajdonságok alapján elővigyázatossági besorolás lehetséges' },
  { id: 'model',         label: 'Modellezési bizonyíték',     labelEn: 'Model evidence',         color: '#ca8a04', precautionary: true,  note: 'Előrejelző szimulációk vagy QSAR modellek' },
  { id: 'lab',           label: 'Laboratóriumi bizonyíték',   labelEn: 'Laboratory evidence',    color: '#ea580c', precautionary: false, note: 'Kontrollált körülmények között mért adatok' },
  { id: 'field',         label: 'Terepi bizonyíték',          labelEn: 'Field evidence',         color: '#dc2626', precautionary: false, note: 'Valós környezetben detektált jelenlét' },
  { id: 'confirmed',     label: 'Megerősített / Publikált',   labelEn: 'Confirmed / Published',  color: '#7c3aed', precautionary: false, note: 'Peer-reviewed irodalom vagy hatósági mérések' },
];
