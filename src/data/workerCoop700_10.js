/**
 * workerCoop700_10.js — EFU 700.10 Munkás Önigazgatás és Kooperatív Vállalatok v1.0
 *
 * Sorozat: 700 – Regeneratív Beavatkozások
 * Modell: Worker Self-Management & Cooperative Enterprises | Mondragon blueprint
 * NET_EFU: +340 000 EFU-E/év (81k munkás × +4.2 HMI-gain)
 * Ellentét: 600.5 Munkaerő metabolikus deficit
 * Státusz: FC-APPROVED v1.0
 * Dátum: 2026-04-12
 */

export const MODULE_META_700_10 = {
  id: '700.10',
  version: '1.0',
  title: 'Munkás Önigazgatás és Kooperatív Vállalatok',
  titleEn: 'Worker Self-Management & Cooperative Enterprises',
  subtitle: 'Munkástulajdon · Profit megosztás · Demokratikus döntéshozatal',
  series: '700 – Regeneratív Beavatkozások',
  tier: 1,
  status: 'FC-APPROVED ✓',
  date: '2026-04-12',
  net_efu_ref: '+340 000 EFU-E/év (81k × +4.2 átlag, Mondragon referencia)',
  formula: 'COOP = worker_ownership×0.30 + profit_sharing×0.25 + workplace_democracy×0.25 + job_security×0.20',
  antithesis: '600.5 Munkaerő metabolikus deficit',
  connections: ['700.5', '700.8', '700.9', '600.5', '118.2'],
};

export const COOP_VARIABLES_MAIN = [
  { id: 'worker_ownership_pct', label: 'Munkástulajdon aránya', description: 'Munkás-tulajdonú részesedés aránya (Mondragon: 100%)', default: 0.80, min: 0, max: 1, step: 0.01, color: '#b45309', positive: true, layer: 'main', unit: '' },
  { id: 'profit_sharing_ratio', label: 'Profit megosztás munkásoknak', description: 'Nyereség munkások közötti elosztásának aránya (0-1)', default: 0.60, min: 0, max: 1, step: 0.01, color: '#d97706', positive: true, layer: 'main', unit: '' },
  { id: 'workplace_democracy', label: 'Demokratikus döntéshozatal szintje', description: 'Vállalati döntéshozatal demokratikus jellege (0=hierarch., 1=teljes demokrácia)', default: 0.75, min: 0, max: 1, step: 0.01, color: '#f59e0b', positive: true, layer: 'main', unit: '' },
  { id: 'job_security', label: 'Munkahely-biztonság', description: 'Munkahely-stabilitás és biztonság mértéke (Mondragon: magas)', default: 0.85, min: 0, max: 1, step: 0.01, color: '#16a34a', positive: true, layer: 'main', unit: '' },
  { id: 'rd_investment_pct', label: 'K+F befektetés %', description: 'Kutatás-fejlesztési befektetés aránya (0-0.15)', default: 0.045, min: 0, max: 0.15, step: 0.001, color: '#0891b2', positive: true, layer: 'main', unit: '' },
];

export const COOP_VARIABLES_NEGATIVE = [
  { id: 'wage_ratio_ceo_worker', label: 'CEO/worker bérarány', description: 'Legmagasabb és legalacsonyabb bér aránya (Mondragon: 6, S&P500 CEO: 300+)', default: 6, min: 1, max: 300, step: 1, color: '#dc2626', positive: false, layer: 'negative', unit: ':1' },
];

export const COOP_VARIABLES_CONTEXT = [
  { id: 'workers_k', label: 'Munkások száma (ezer fő)', description: 'Érintett munkások száma ezrekben (Mondragon: 81k)', default: 81, min: 1, max: 10000, step: 1, color: '#374151', positive: true, layer: 'context', unit: 'k' },
];

export const COOP_ALL_VARIABLES = [
  ...COOP_VARIABLES_MAIN,
  ...COOP_VARIABLES_NEGATIVE,
  ...COOP_VARIABLES_CONTEXT,
];

export const COOP_ZONES = [
  { id: 'EXPLOITATIVE', label: '🔴 Kizsákmányoló Vállalat', status: 'EXPLOITATIVE', condition: 'COOP < 2', action: '600.5 aktív – tőke-felhalmozás, munkás-érdekek semmibevétele, bérkizsákmányolás', color: '#dc2626', bg: '#fef2f2', max: 2 },
  { id: 'HIERARCHICAL', label: '🟠 Hierarchikus Cég', status: 'HIERARCHICAL', condition: '2 – 4', action: 'Hagyományos hierarchia – minimális munkásrészvétel, tőkejövedelem domináns', color: '#ea580c', bg: '#fff7ed', min: 2, max: 4 },
  { id: 'TRANSITIONAL', label: '🟡 Átmeneti Modell', status: 'TRANSITIONAL', condition: '4 – 6', action: 'Részleges kooperatív elemek – ESOP, profit sharing indul, demokrácia fejlődik', color: '#ca8a04', bg: '#fefce8', min: 4, max: 6 },
  { id: 'COOPERATIVE', label: '🟢 Kooperatív Vállalat', status: 'COOPERATIVE', condition: '6 – 8', action: 'Emilia-Romagna szint – munkás-tulajdon domináns, HMI +3.8 EFU/munkás, stabilitás nő', color: '#16a34a', bg: '#f0fdf4', min: 6, max: 8 },
  { id: 'WORKER_OWNED', label: '⭐ Munkástulajdonú Vállalat', status: 'WORKER_OWNED', condition: 'COOP ≥ 8', action: 'Mondragon szint – teljes munkástulajdon, R_future 1.4+, K+F aktív, globális modell', color: '#0369a1', bg: '#eff6ff', min: 8 },
];

export const COOP_TRIGGERS = [
  { id: 'WAGE_INEQUALITY_HIGH', label: 'WAGE_INEQUALITY_HIGH – Bér-egyenlőtlenség kritikus', condition: 'wage_ratio_ceo_worker > 50 ÉS worker_ownership_pct < 0.20', action: '600.5 antiflux szükséges – bérarány korrekció, munkástulajdon bevezetése', level: 'RED', color: '#dc2626', positive: false },
  { id: 'LOW_PROFIT_SHARING', label: 'LOW_PROFIT_SHARING – Profit megosztás hiány', condition: 'profit_sharing_ratio < 0.10', action: 'Profit megosztási policy szükséges – minimum 10% munkás felé irányítandó', level: 'ORANGE', color: '#ea580c', positive: false },
  { id: 'COOP_ACTIVE', label: 'COOP_ACTIVE – Kooperatív szintű aktiválás', condition: 'coop_index ≥ 6.0', action: 'Kooperatív modell aktív – NET_EFU számítható, munkás jóllét javul', level: 'GREEN', color: '#16a34a', positive: true },
  { id: 'MONDRAGON_MODEL', label: 'MONDRAGON_MODEL – Mondragon szintű modell', condition: 'coop_index ≥ 8.0 ÉS workplace_democracy ≥ 0.70', action: 'Mondragon kernel aktív – R_future 1.4+, K+F integráció, interstitium +50%', level: 'GREEN', color: '#0369a1', positive: true },
];
