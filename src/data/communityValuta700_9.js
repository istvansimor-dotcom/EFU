/**
 * communityValuta700_9.js — EFU 700.9 Közösségi Valuták és Időbanka v1.0
 *
 * Sorozat: 700 – Regeneratív Beavatkozások
 * Modell: Community Currencies & Time Banking | Fureai Kippu / WIR Bank
 * NET_EFU: +350 000 EFU-E/év (100k résztvevő × +3.5 HMI-gain)
 * Ellentét: 600.2 Financiális extrakció
 * Státusz: FC-APPROVED v1.0
 * Dátum: 2026-04-12
 */

export const MODULE_META_700_9 = {
  id: '700.9',
  version: '1.0',
  title: 'Közösségi Valuták és Időbanka',
  titleEn: 'Community Currencies & Time Banking',
  subtitle: 'Helyi gazdaság · Időbanka · Demurrage · Kölcsönös segítség',
  series: '700 – Regeneratív Beavatkozások',
  tier: 1,
  status: 'FC-APPROVED ✓',
  date: '2026-04-12',
  net_efu_ref: '+350 000 EFU-E/év (100k résztvevő × +3.5 átlag)',
  formula: 'CV = local_circulation×0.30 + time_banking×0.25 + demurrage×0.20 + community_trust×0.25',
  antithesis: '600.2 Financiális extrakció',
  connections: ['700.5', '700.8', '700.10', '600.2', '400.2'],
};

export const CV_VARIABLES_MAIN = [
  { id: 'local_circulation_boost', label: 'Helyi gazdaság cirkuláció növekedés', description: 'Helyi valuta cirkulációs multiplikátor (Brixton Pound: +35%)', default: 0.35, min: 0, max: 1, step: 0.01, color: '#7c3aed', positive: true, layer: 'main', unit: '' },
  { id: 'time_banking_activity', label: 'Időbanka aktivitás', description: 'Aktív időbanka részvétel (Fureai Kippu: 0.40)', default: 0.40, min: 0, max: 1, step: 0.01, color: '#6d28d9', positive: true, layer: 'main', unit: '' },
  { id: 'demurrage_rate', label: 'Demurrage ráta (negatív kamat)', description: 'Felhalmozás-gátló díj (WIR: 0.01 körül)', default: 0.01, min: 0, max: 0.10, step: 0.001, color: '#0891b2', positive: true, layer: 'main', unit: '' },
  { id: 'speculation_free', label: 'Spekulációmentesség', description: 'Pénzügyi spekulációtól való mentesség (0=spekulatív, 1=spekulációmentes)', default: 0.70, min: 0, max: 1, step: 0.01, color: '#0369a1', positive: true, layer: 'main', unit: '' },
  { id: 'mutual_aid_strength', label: 'Kölcsönös segítség ereje', description: 'Közösségi kölcsönös segítségnyújtás intenzitása (Ithaca Hours: 0.45)', default: 0.45, min: 0, max: 1, step: 0.01, color: '#16a34a', positive: true, layer: 'main', unit: '' },
];

export const CV_VARIABLES_NEGATIVE = [
  { id: 'fiat_leak_out', label: 'Fiat pénz kiszivárgás', description: 'Helyi gazdaságból kiszivárgó pénz aránya (0=teljes helyi, 1=teljes kiszivárgás)', default: 0.55, min: 0, max: 1, step: 0.01, color: '#dc2626', positive: false, layer: 'negative', unit: '' },
];

export const CV_VARIABLES_CONTEXT = [
  { id: 'participants_k', label: 'Résztvevők száma (ezer fő)', description: 'Aktív résztvevők száma ezrekben (NET_EFU skálázáshoz)', default: 100, min: 0.1, max: 10000, step: 0.1, color: '#374151', positive: true, layer: 'context', unit: 'k' },
];

export const CV_ALL_VARIABLES = [
  ...CV_VARIABLES_MAIN,
  ...CV_VARIABLES_NEGATIVE,
  ...CV_VARIABLES_CONTEXT,
];

export const CV_ZONES = [
  { id: 'FIAT_ONLY', label: '🔴 Fiat Dominancia', status: 'FIAT_ONLY', condition: 'CV < 2', action: '600.2 aktív – teljes fiat kiszivárgás, helyi gazdaság elsorvad', color: '#dc2626', bg: '#fef2f2', max: 2 },
  { id: 'PILOT', label: '🟠 Pilot Fázis', status: 'PILOT', condition: '2 – 4', action: 'Kis pilot – kritikus tömeg alatti, fiat dominancia fennáll', color: '#ea580c', bg: '#fff7ed', min: 2, max: 4 },
  { id: 'EMERGING', label: '🟡 Kibontakozó Rendszer', status: 'EMERGING', condition: '4 – 6', action: 'Növekvő közösségi gazdaság – demurrage aktiválva, fiat leak csökken', color: '#ca8a04', bg: '#fefce8', min: 4, max: 6 },
  { id: 'ACTIVE', label: '🟢 Aktív Közösségi Valuta', status: 'ACTIVE', condition: '6 – 8', action: 'WIR/Brixton szint – időbanka aktív, helyi multiplikátor +40%, HMI +1.8 EFU', color: '#16a34a', bg: '#f0fdf4', min: 6, max: 8 },
  { id: 'COMMUNITY_ECONOMY', label: '⭐ Közösségi Gazdaság', status: 'COMMUNITY_ECONOMY', condition: 'CV ≥ 8', action: 'Teljes közösségi gazdaság – R_future 1.2+, fiat leakage < 20%, globális replikáció', color: '#0369a1', bg: '#eff6ff', min: 8 },
];

export const CV_TRIGGERS = [
  { id: 'CRITICAL_MASS_LOW', label: 'CRITICAL_MASS_LOW – Kritikus tömeg nincs meg', condition: 'participants_k < 0.5 ÉS time_banking_activity < 0.30', action: 'Kritikus tömeg szükséges – minimum 500 aktív résztvevő a rendszer fenntartásához', level: 'RED', color: '#dc2626', positive: false },
  { id: 'FIAT_DOMINANT', label: 'FIAT_DOMINANT – Fiat kiszivárgás kritikus', condition: 'fiat_leak_out > 0.70', action: '600.2 antiflux szükséges – helyi valuta megerősítése, demurrage emelés', level: 'ORANGE', color: '#ea580c', positive: false },
  { id: 'TIMEBANK_ACTIVE', label: 'TIMEBANK_ACTIVE – Időbanka szintű aktiválás', condition: 'cv_index ≥ 6.0', action: 'Közösségi valuta pilot aktív – NET_EFU számítható, időbanka hálózat funkcionál', level: 'GREEN', color: '#16a34a', positive: true },
  { id: 'COMMUNITY_ECONOMY', label: 'COMMUNITY_ECONOMY – Teljes közösségi gazdaság', condition: 'cv_index ≥ 8.0 ÉS mutual_aid_strength ≥ 0.70', action: 'Közösségi gazdaság kernel aktív – R_future 1.2+, fiat kiszivárgás minimális', level: 'GREEN', color: '#0369a1', positive: true },
];
