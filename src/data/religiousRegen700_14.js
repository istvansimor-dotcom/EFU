/**
 * religiousRegen700_14.js — EFU 700.14 Vallási Rendszerek Regeneratív Fluxus Protokollja v1.1
 *
 * Sorozat: 700 – Regeneratív Beavatkozások
 * Modell: Religious Systems Regenerative Flux Protocol | CEWS 5-tengely audit
 * NET_EFU: HMI +1.5 EFU-E/fő | +8-12% stack hatékonyság minden 700-as modulra
 * Ellentét: 600.22 Vallási/Szektás Parazitizmus | 600.82 Vallási Identitás Antiflux
 * Státusz: FC-APPROVED v1.1
 * Dátum: 2026-04-12
 */

export const MODULE_META_700_14 = {
  id: '700.14',
  version: '1.1',
  title: 'Vallási Regeneratív Fluxus Protokoll',
  titleEn: 'Religious Systems Regenerative Flux Protocol',
  subtitle: 'T₇₀₀.₁₄: S_antiflux → S_regen | CEWS 5-tengely | Audit protokoll',
  series: '700 – Regeneratív Beavatkozások',
  tier: 3,
  status: 'FC-APPROVED ✓',
  date: '2026-04-12',
  net_efu_ref: 'HMI +1.5 EFU-E/fő | +8-12% stack hatékonyság minden 700-as modulra',
  formula: 'CEWS_score = 0.20×M3 + 0.20×M4 + 0.15×M8 + 0.25×M2 + 0.20×M1 | REGEN ✓ = CEWS>0.7 + RCR<0.3',
  antithesis: '600.22 Vallási/Szektás Parazitizmus | 600.82 Vallási Identitás Antiflux',
  connections: ['600.22', '600.82', '700.11', '700.4', '700.9', '700.1', '700.2', '700.3'],
  transformation: 'T₇₀₀.₁₄(S_antiflux) = S_regen | feltételek: RCR<0.3, MROI_gap<0.2, CEWS>0.7, IQF>0.6',
};

export const REGEN_VARIABLES_CEWS = [
  { id: 'm3_identity', label: 'M3 IDENTITY – Identitás nyitás', description: 'Csoporthatár nyitottsága (0=zárlat/"mi vs. ők", 1=nyílt identitás fluxus)', default: 0.55, min: 0, max: 1, step: 0.01, color: '#7c3aed', positive: true, layer: 'cews', unit: '' },
  { id: 'm4_cognitive', label: 'M4 COGNITIVE – Kognitív nyitás', description: 'Dogmatikus zárlat hiánya (0=teljes dogma zárlat, 1=nyílt kritikai gondolkodás)', default: 0.60, min: 0, max: 1, step: 0.01, color: '#6d28d9', positive: true, layer: 'cews', unit: '' },
  { id: 'm8_time', label: 'M8 TIME – Időhorizont', description: 'Túlvilági diszkontráta kiegyensúlyozottsága (0=túl magas spirituális diszkont, 1=valós időhorizont)', default: 0.55, min: 0, max: 1, step: 0.01, color: '#b45309', positive: true, layer: 'cews', unit: '' },
  { id: 'm2_material', label: 'M2 MATERIAL – Anyagfluxus', description: 'Zarándokút / közösségi infra (0=rituális pazarlás/vegy MLM, 1=fluxus-erősítő infra)', default: 0.60, min: 0, max: 1, step: 0.01, color: '#0891b2', positive: true, layer: 'cews', unit: '' },
  { id: 'm1_energy', label: 'M1 ENERGY – Közösségi energiafluxus', description: 'Energia visszaforgatás (0=kényszer felhalmozás/spiritual MLM, 1=közösségi energia)', default: 0.65, min: 0, max: 1, step: 0.01, color: '#16a34a', positive: true, layer: 'cews', unit: '' },
];

export const REGEN_VARIABLES_AUDIT = [
  { id: 'rcr', label: 'RCR – Erőforrás-elzárás arány', description: 'Resource Closure Ratio: tanítás zárt a csoporthatáron (0=nyílt, 1=teljesen zárt)', default: 0.20, min: 0, max: 1, step: 0.01, color: '#dc2626', positive: false, layer: 'audit', unit: '' },
  { id: 'mroi_gap', label: 'MROI_gap – Valós vs. szubjektív MROI', description: 'MROI_tényleges - MROI_szubjektív különbség (0=arányos, 1=maximalista túlvilági)', default: 0.15, min: 0, max: 1, step: 0.01, color: '#ea580c', positive: false, layer: 'audit', unit: '' },
  { id: 'iqf', label: 'IQF – Információ-minőség faktor', description: 'Nyílt tudásátadás minősége: 0.4×Relevance + 0.3×Accuracy + 0.3×Integrability', default: 0.65, min: 0, max: 1, step: 0.01, color: '#0369a1', positive: true, layer: 'audit', unit: '' },
  { id: 'p_intent', label: 'P_intent szint', description: 'Szándék index: 0=Hatalmi, 0.5=Stabilizáló, 1=Optimizáló', default: 0.65, min: 0, max: 1, step: 0.05, color: '#7c3aed', positive: true, layer: 'audit', unit: '' },
];

export const REGEN_VARIABLES_CONTEXT = [
  { id: 'community_scale_k', label: 'Közösség mérete (ezer fő)', description: 'Érintett vallási közösség mérete', default: 50, min: 0.1, max: 10000, step: 0.1, color: '#374151', positive: true, layer: 'context', unit: 'k' },
];

export const REGEN_ALL_VARIABLES = [
  ...REGEN_VARIABLES_CEWS,
  ...REGEN_VARIABLES_AUDIT,
  ...REGEN_VARIABLES_CONTEXT,
];

export const REGEN_ZONES = [
  { id: 'PARASITIC_EXTRACTION', label: '🔴 Parazita Extrakció', status: 'PARASITIC_EXTRACTION', condition: 'CEWS < 2', action: '600.22/600.82 aktív – spiritual MLM, tized/adomány extrakció, csoporthatár-zár', color: '#dc2626', bg: '#fef2f2', max: 2 },
  { id: 'ANTIFLUX', label: '🟠 Antiflux Domináns', status: 'ANTIFLUX', condition: '2 – 4', action: 'Antiflux domináns – részleges nyitás, de zárlatok fennmaradnak', color: '#ea580c', bg: '#fff7ed', min: 2, max: 4 },
  { id: 'TRANSITIONAL', label: '🟡 Átmeneti', status: 'TRANSITIONAL', condition: '4 – 6', action: 'Átmeneti – kognitív és identitás nyitás indul, CEWS fejlesztés szükséges', color: '#ca8a04', bg: '#fefce8', min: 4, max: 6 },
  { id: 'REGEN_EMERGING', label: '🟢 Regeneratív Induló', status: 'REGEN_EMERGING', condition: '6 – 8', action: 'Regeneratív induló – CEWS>0.6, RCR csökkentés folyamatban', color: '#16a34a', bg: '#f0fdf4', min: 6, max: 8 },
  { id: 'REGENERATIVE_ACTIVE', label: '⭐ T₇₀₀.₁₄ Regeneratív Aktív', status: 'REGENERATIVE_ACTIVE', condition: 'CEWS ≥ 8', action: 'T₇₀₀.₁₄ aktív – CEWS>0.7 + RCR<0.3, fluxus-erősítő, stack +8-12%', color: '#0369a1', bg: '#eff6ff', min: 8 },
];

export const REGEN_TRIGGERS = [
  { id: 'ANTIFLUX_ACTIVE', label: 'ANTIFLUX_ACTIVE – Kognitív zárlat aktív', condition: 'rcr > 0.5 ÉS m4_cognitive < 0.30', action: '600.82 kognitív zárlat aktív – T₇₀₀.₁₄ transzformáció szükséges', level: 'RED', color: '#dc2626', positive: false },
  { id: 'SPIRITUAL_MLM', label: 'SPIRITUAL_MLM – Spiritual MLM detektálva', condition: 'rcr > 0.50 ÉS m1_energy < 0.30', action: '600.22 spiritual MLM detektálva – non-attachment intervenció szükséges', level: 'RED', color: '#dc2626', positive: false },
  { id: 'REGEN_THRESHOLD', label: 'REGEN_THRESHOLD – Regeneratív küszöb elérve', condition: 'cews_score ≥ 0.7', action: 'REGEN ✓ – CEWS>0.7, fluxus-erősítő protokoll aktív', level: 'GREEN', color: '#16a34a', positive: true },
  { id: 'FULL_REGEN', label: 'FULL_REGEN – T₇₀₀.₁₄ teljes transzformáció', condition: 'cews_score ≥ 0.7 ÉS rcr < 0.3 ÉS iqf ≥ 0.6', action: 'T₇₀₀.₁₄ AKTÍV – S_antiflux → S_regen transzformáció teljes, stack +8-12%', level: 'GREEN', color: '#0369a1', positive: true },
];
