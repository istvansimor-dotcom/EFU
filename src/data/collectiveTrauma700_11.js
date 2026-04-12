/**
 * collectiveTrauma700_11.js — EFU 700.11 Kollektív Trauma Gyógyítás és Igazságtétel v1.0
 *
 * Sorozat: 700 – Regeneratív Beavatkozások
 * Modell: Transitional Justice & Collective Healing | Dél-Afrika TRC blueprint
 * NET_EFU: +120M EFU-E (20 év, 60M fő × +0.1 évente)
 * Ellentét: 500.1 Kollektív trauma
 * Státusz: FC-APPROVED v1.0
 * Dátum: 2026-04-12
 */

export const MODULE_META_700_11 = {
  id: '700.11',
  version: '1.0',
  title: 'Kollektív Trauma Gyógyítás és Igazságtétel',
  titleEn: 'Collective Trauma Healing & Transitional Justice',
  subtitle: 'Igazságtételi folyamat · Jóvátétel · Emlékezés · Politikai akarat',
  series: '700 – Regeneratív Beavatkozások',
  tier: 1,
  status: 'FC-APPROVED ✓',
  date: '2026-04-12',
  net_efu_ref: '+120M EFU-E (20 év, 60M fő × +0.1 évente)',
  formula: 'TRC = truth_process×0.30 + reparation×0.25 + memorialization×0.20 + political_stability×0.25',
  antithesis: '500.1 Kollektív trauma',
  connections: ['500.1', '501.0', '502.0', '700.5', '300.0'],
};

export const TRC_VARIABLES_MAIN = [
  { id: 'truth_process_depth', label: 'Igazságtételi folyamat mélysége', description: 'TRC folyamat teljessége és mélysége (Dél-Afrika TRC: 0.65)', default: 0.65, min: 0, max: 1, step: 0.01, color: '#7c3aed', positive: true, layer: 'main', unit: '' },
  { id: 'reparation_coverage', label: 'Jóvátétel kiterjedtsége', description: 'Reparációs program kiterjedtsége és mélysége (0-1)', default: 0.50, min: 0, max: 1, step: 0.01, color: '#9333ea', positive: true, layer: 'main', unit: '' },
  { id: 'memorialization_quality', label: 'Emlékezés minősége', description: 'Kollektív emlékezet megőrzésének minősége (múzeumok, emlékmű, oktatás)', default: 0.55, min: 0, max: 1, step: 0.01, color: '#a855f7', positive: true, layer: 'main', unit: '' },
  { id: 'community_participation', label: 'Közösségi részvétel', description: 'Érintett közösségek aktív részvétele a folyamatban (0-1)', default: 0.60, min: 0, max: 1, step: 0.01, color: '#0891b2', positive: true, layer: 'main', unit: '' },
  { id: 'political_will', label: 'Politikai akarat', description: 'Kormányzati és intézményi elkötelezetség a gyógyításra (0-1)', default: 0.55, min: 0, max: 1, step: 0.01, color: '#16a34a', positive: true, layer: 'main', unit: '' },
];

export const TRC_VARIABLES_NEGATIVE = [
  { id: 'trauma_transmission_untreated', label: 'Kezeletlen trauma transzmisszió', description: 'Generációkon átívelő kezeletlen trauma terjedési rátája (0-1)', default: 0.70, min: 0, max: 1, step: 0.01, color: '#dc2626', positive: false, layer: 'negative', unit: '' },
];

export const TRC_VARIABLES_CONTEXT = [
  { id: 'population_affected_m', label: 'Érintett népesség (millió fő)', description: 'Traumával érintett népesség millióban (NET_EFU skálázáshoz)', default: 60, min: 1, max: 1400, step: 1, color: '#374151', positive: true, layer: 'context', unit: 'M' },
];

export const TRC_ALL_VARIABLES = [
  ...TRC_VARIABLES_MAIN,
  ...TRC_VARIABLES_NEGATIVE,
  ...TRC_VARIABLES_CONTEXT,
];

export const TRC_ZONES = [
  { id: 'SILENCE', label: '🔴 Csend és Tagadás', status: 'SILENCE', condition: 'TRC < 2', action: '500.1 aktív – trauma tagadás, generációs transzmisszió maximális, rendszer mérgezett', color: '#dc2626', bg: '#fef2f2', max: 2 },
  { id: 'ACKNOWLEDGMENT', label: '🟠 Elismerés Fázis', status: 'ACKNOWLEDGMENT', condition: '2 – 4', action: 'Formális elismerés – részleges igazságtétel, reparáció nem szisztematikus', color: '#ea580c', bg: '#fff7ed', min: 2, max: 4 },
  { id: 'PROCESS', label: '🟡 Folyamat Aktív', status: 'PROCESS', condition: '4 – 6', action: 'TRC folyamat aktív – tanúvallomások, dokumentálás, jóvátétel megkezdve', color: '#ca8a04', bg: '#fefce8', min: 4, max: 6 },
  { id: 'RECONCILIATION', label: '🟢 Kibékülés és Gyógyítás', status: 'RECONCILIATION', condition: '6 – 8', action: 'Rwanda Gacaca szint – közösségi gyógyítás aktív, HMI +2.0 EFU/fő, R_future javul', color: '#16a34a', bg: '#f0fdf4', min: 6, max: 8 },
  { id: 'HEALING', label: '⭐ Teljes Gyógyítás', status: 'HEALING', condition: 'TRC ≥ 8', action: 'Teljes gyógyítás kernel – R_future 0.9+, trauma transzmisszió < 10%, globális modell', color: '#0369a1', bg: '#eff6ff', min: 8 },
];

export const TRC_TRIGGERS = [
  { id: 'TRAUMA_UNTREATED', label: 'TRAUMA_UNTREATED – Kezeletlen trauma kritikus', condition: 'trauma_transmission_untreated > 0.80 ÉS truth_process_depth < 0.20', action: '500.1 antiflux szükséges – azonnali TRC folyamat indítása kötelező', level: 'RED', color: '#dc2626', positive: false },
  { id: 'NO_REPARATION', label: 'NO_REPARATION – Jóvátétel hiánya', condition: 'reparation_coverage < 0.10 ÉS political_will < 0.30', action: 'Reparációs alap szükséges – politikai akarat nélkül a gyógyítás nem lehetséges', level: 'ORANGE', color: '#ea580c', positive: false },
  { id: 'TRC_ACTIVE', label: 'TRC_ACTIVE – Igazságtételi folyamat aktív', condition: 'trc_index ≥ 6.0', action: 'TRC kernel aktív – NET_EFU számítható, generációs gyógyítás folyamatban', level: 'GREEN', color: '#16a34a', positive: true },
  { id: 'FULL_HEALING', label: 'FULL_HEALING – Teljes gyógyítási ciklus', condition: 'trc_index ≥ 8.0 ÉS reparation_coverage ≥ 0.60', action: 'Teljes TRC kernel – R_future 0.9+, interstitium +55%, generációs trauma megszakítva', level: 'GREEN', color: '#0369a1', positive: true },
];
