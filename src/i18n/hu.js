export const hu = {
  // Header
  title: 'EFU — MROI Kalkulátor',
  subtitle: 'Metabolikus Befektetési Megtérülés · EFU Keretrendszer v5.1 · MROI Working Paper v1.3 alapján (Simor, 2026)',

  // Case study selector
  caseStudyLabel: '📋 Esettanulmány-választó',
  sourceLabel: 'Forrás:',

  // Input fields
  fields: {
    delta_e_saved: 'ΔE_megtakarított (kWh/év)',
    delta_e_saved_hint: 'Energiamegtakarítás a kiindulási forgatókönyvhöz képest',
    grid_co2: 'hálózat_CO₂ (kg CO₂/kWh)',
    grid_co2_hint: 'Regionális hálózati szén-dioxid-intenzitás (HU alapértelmezés: 0,35)',
    racf: 'RACF (kg CO₂/fő/év)',
    racf_hint: 'Referencia Éves Szén-Fluxus (Magyarország: 526)',
    jim30: 'JIM-30 pontszám (%)',
    jim30_hint: 'Javíthatósági index 0–100 (S1 Kiegészítő Anyagok)',
    d_multiplier: 'D — Adósságszorzó',
    d_multiplier_hint: 'Infrastruktúra-adósság szorzója (alapértelmezés: 0,3)',
    efu_input_direct: 'EFU_input közvetlen (EFU egység)',
    efu_input_direct_hint: 'Közvetlen biofizikai EFU-ráfordítás (korrekció előtt)',
  },

  // Results
  co2Reduction: 'CO₂-csökkentés',
  co2Unit: 'kg/év',
  racfUnits: 'RACF egység',
  correctionX: 'Korrekciós szorzó ×',
  efuInputCorrected: 'EFU_input korrigált',
  mroisScale: 'MROI helyzete a skálán',

  // FLR
  flrTitle: '⚡ FLR — Súrlódásos Veszteségi Arány',
  flrLabel: 'FLR',
  threshold: 'Küszöb',
  frictionOverhead: 'Súrlódási többletköltség',
  efuUnits: 'EFU egység',
  usefulInput: 'Hasznos ráfordítás:',
  frictionLoss: 'Súrlódási veszteség:',
  parasitismWarning: (flr, jim30, d) =>
    `⚠️ FLR > ${flr}% — Az infrastruktúra-adósság súrlódása meghaladja a metabolikus parazitizmus küszöbét. Az alacsony javíthatóság (JIM-30 = ${jim30}) felerősíti a rendszerszintű entrópia-költségeket. Ajánlás: növelje a JIM-30 pontszámot vagy csökkentse a D szorzót (jelenlegi: ${d}).`,

  // RACF Comparator
  racfComparatorTitle: '📊 RACF Összehasonlító',
  racfBaseline: 'RACF Alap',
  co2PersonYear: 'CO₂/fő/év',
  co2ReductionYear: 'CO₂-csökkentés/év',
  racfNote: 'Az éves CO₂-csökkentés összehasonlítása 1 fő Referencia Éves Szén-Fluxusával (RACF).',
  racfOffsets: (n) => ` Ez a rendszer ${n} RACF-egyenértékű személynek megfelelő kibocsátást kompenzál évente.`,

  // Case Studies Table
  caseStudiesTableTitle: '📋 Összes Esettanulmány — MROI Összehasonlítás',
  colCaseStudy: 'Esettanulmány',
  colMROI: 'MROI',
  colFLR: 'FLR',
  colStatus: 'Státusz',
  statusOK: '✔ OK',
  statusParasitic: '⚠️ Parazita',

  // Classification table
  classificationTitle: 'MROI Osztályozási Küszöbök (MROI Working Paper v1.3, §2.3)',
  classRows: [
    { range: '> 25%', label: 'SZIMBIOTIKUS', note: 'Kiemelt befektetés', color: '#16a34a' },
    { range: '10–25%', label: 'STABIL', note: 'Jóváhagyva éves felülvizsgálattal', color: '#2563eb' },
    { range: '0–10%', label: 'KORLÁTOZOTT', note: 'Feltételes, fejlesztési terv szükséges', color: '#d97706' },
    { range: '< 0%', label: 'PARAZITA', note: 'Közfinanszírozásra nem ajánlott', color: '#dc2626' },
  ],

  // Export
  exportJSON: '⬇ JSON Export',
  exportPrint: '🖨 Nyomtatás',

  // Debt Clock
  debtClockTitle: '⏱ EFU Adósságóra',
  debtClockSubtitle: 'Valós idejű metabolikus adósság-felhalmozódás ehhez a rendszerhez',
  debtClockFrictionPerSec: 'Súrlódási költség / mp',
  debtClockFrictionPerYear: 'Éves súrlódási többletköltség',
  debtClockSinceOpen: 'Adósság az oldal megnyitása óta',
  debtClockNote: 'Az FLR súrlódási többletköltség alapján, a közvetlen EFU-ráfordításhoz viszonyítva.',

  // Parasitism labels
  parasitismDetected: 'Metabolikus Parazitizmus Észlelve',
  withinBounds: 'Elfogadható Határon Belül',

  // Footer
  footer:
    'EFU Keretrendszer v5.1 · 1 EFU = 20 kg/nap humán metabolikus átbocsátás · D = 0,3 (S2 kalibráció) · RACF Magyarország = 526 kg CO₂/fő/év · hálózat_CO₂ = 0,35 kg/kWh (MAVIR 2024–25) · Szerző: Simor István · ORCID: 0009-0002-6599-3480',
};
