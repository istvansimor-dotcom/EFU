/**
 * ubs700_8.js — EFU 700.8 Univerzális Alapszolgáltatások (UBS) v1.0
 *
 * Sorozat: 700 – Regeneratív Beavatkozások
 * Modell: Universal Basic Services | UK NHS referencia
 * NET_EFU: +180M EFU-E/év (67M fő × +2.7 HMI-gain átlag)
 * Ellentét: 600.5 Munkaerő metabolikus deficit
 * Státusz: FC-APPROVED v1.0
 * Dátum: 2026-04-12
 */

export const MODULE_META_700_8 = {
  id: '700.8',
  version: '1.0',
  title: 'Univerzális Alapszolgáltatások',
  titleEn: 'Universal Basic Services (UBS)',
  subtitle: 'Healthcare · Education · Housing · Transport · Internet',
  series: '700 – Regeneratív Beavatkozások',
  tier: 1,
  status: 'FC-APPROVED ✓',
  date: '2026-04-12',
  net_efu_ref: '+180M EFU-E/év (67M × +2.7 átlag, UK NHS referencia)',
  formula: 'UBS = healthcare×0.30 + education×0.25 + housing×0.25 + transport×0.10 + internet×0.10',
  antithesis: '600.5 Munkaerő metabolikus deficit',
  connections: ['700.5', '700.9', '700.10', '600.5', '104.13'],
};

export const UBS_VARIABLES_MAIN = [
  { id: 'healthcare_coverage', label: 'Egészségügyi lefedettség', description: 'Univerzális egészségügyi hozzáférés aránya (UK NHS: ~1.0)', default: 0.80, min: 0, max: 1, step: 0.01, color: '#1d4ed8', positive: true, layer: 'main', unit: '' },
  { id: 'education_free', label: 'Ingyenes oktatás (bölcsőde-PhD)', description: 'Teljes oktatási lefedettség aránya (0=nincs, 1=bölcsőde-PhD ingyenes)', default: 0.70, min: 0, max: 1, step: 0.01, color: '#2563eb', positive: true, layer: 'main', unit: '' },
  { id: 'affordable_housing_pct', label: 'Megfizethető lakhatás %', description: 'Megfizethető lakások aránya (Vienna: 60%)', default: 0.55, min: 0, max: 1, step: 0.01, color: '#3b82f6', positive: true, layer: 'main', unit: '' },
  { id: 'public_transport_subsidy', label: 'Közlekedési támogatás szintje', description: 'Közlekedési szubvenció mértéke (Luxembourg ingyenes: 1.0)', default: 0.60, min: 0, max: 1, step: 0.01, color: '#0891b2', positive: true, layer: 'main', unit: '' },
  { id: 'internet_access', label: 'Internet hozzáférés lefedettség', description: 'Digitális hozzáférés aránya (0-1)', default: 0.75, min: 0, max: 1, step: 0.01, color: '#16a34a', positive: true, layer: 'main', unit: '' },
];

export const UBS_VARIABLES_NEGATIVE = [
  { id: 'market_commodification', label: 'Piaciasítás mértéke (privatizáció)', description: 'Alapszolgáltatások piaci kiszolgáltatottsága (0=közszolgáltatás, 1=teljesen privatizált)', default: 0.40, min: 0, max: 1, step: 0.01, color: '#dc2626', positive: false, layer: 'negative', unit: '' },
];

export const UBS_VARIABLES_CONTEXT = [
  { id: 'population_m', label: 'Népesség (millió fő)', description: 'Ország/régió lélekszáma millióban (UK: 67M)', default: 67, min: 1, max: 1400, step: 1, color: '#374151', positive: true, layer: 'context', unit: 'M' },
];

export const UBS_ALL_VARIABLES = [
  ...UBS_VARIABLES_MAIN,
  ...UBS_VARIABLES_NEGATIVE,
  ...UBS_VARIABLES_CONTEXT,
];

export const UBS_ZONES = [
  { id: 'MARKET_ONLY', label: '🔴 Piaci Dominancia', status: 'MARKET_ONLY', condition: 'UBS < 2', action: '600.5 aktív – alapszolgáltatások privatizálva, hozzáférési egyenlőtlenség kritikus', color: '#dc2626', bg: '#fef2f2', max: 2 },
  { id: 'PARTIAL', label: '🟠 Részleges Rendszer', status: 'PARTIAL', condition: '2 – 4', action: 'Szelektív juttatások – jövedelemi korlátok, részleges lefedettség', color: '#ea580c', bg: '#fff7ed', min: 2, max: 4 },
  { id: 'MIXED', label: '🟡 Vegyes Rendszer', status: 'MIXED', condition: '4 – 6', action: 'Vegyes köz-magán – fedezeti hiányok, szubvenciók szükségesek', color: '#ca8a04', bg: '#fefce8', min: 4, max: 6 },
  { id: 'WELFARE', label: '🟢 Jóléti Állam', status: 'WELFARE', condition: '6 – 8', action: 'Erős jóléti rendszer – EU standard, HMI +4.5 EFU/fő, korrupció csökken', color: '#16a34a', bg: '#f0fdf4', min: 6, max: 8 },
  { id: 'UNIVERSAL', label: '⭐ Univerzális UBS', status: 'UNIVERSAL', condition: 'UBS ≥ 8', action: 'Teljes UBS kernel – R_future 1.3+, bölcsőde-PhD ingyenes, NHS szint', color: '#0369a1', bg: '#eff6ff', min: 8 },
];

export const UBS_TRIGGERS = [
  { id: 'MARKET_FAILURE', label: 'MARKET_FAILURE – Piaci kudarc kritikus', condition: 'healthcare_coverage < 0.60 ÉS market_commodification > 0.60', action: '600.5 antiflux szükséges – NHS típusú közszolgáltatás bevezetése', level: 'RED', color: '#dc2626', positive: false },
  { id: 'LOW_HOUSING', label: 'LOW_HOUSING – Lakhatási válság', condition: 'affordable_housing_pct < 0.30', action: 'Lakhatási alap aktiválása – Vienna modell adaptáció', level: 'ORANGE', color: '#ea580c', positive: false },
  { id: 'NHS_ACTIVE', label: 'NHS_ACTIVE – NHS szintű egészségügy', condition: 'ubs_index ≥ 6.0', action: 'UBS kernel aktív – NET_EFU számítható, +4.5 EFU-E/fő realizálható', level: 'GREEN', color: '#16a34a', positive: true },
  { id: 'FULL_UBS', label: 'FULL_UBS – Teljes Univerzális Rendszer', condition: 'ubs_index ≥ 8.0 ÉS education_free ≥ 0.80', action: 'Teljes UBS aktív – R_future 1.3, interstitium +35%, globális replikáció', level: 'GREEN', color: '#0369a1', positive: true },
];
