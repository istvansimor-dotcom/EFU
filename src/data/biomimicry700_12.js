/**
 * biomimicry700_12.js — EFU 700.12 Biomimikry és Természettel Együttműködő Design v1.0
 *
 * Sorozat: 700 – Regeneratív Beavatkozások
 * Modell: Biomimicry & Nature-Inspired Design | Eastgate Centre blueprint
 * NET_EFU: +35 000 EFU-E (25 év, Eastgate Centre referencia)
 * Ellentét: 600.4 Ökológiai kanibalizmus
 * Státusz: FC-APPROVED v1.0
 * Dátum: 2026-04-12
 */

export const MODULE_META_700_12 = {
  id: '700.12',
  version: '1.0',
  title: 'Biomimikry és Természettel Együttműködő Design',
  titleEn: 'Biomimicry & Nature-Inspired Design',
  subtitle: 'Anyag hatékonyság · Energia csökkentés · Hulladék eliminálás · Bio-kompatibilitás',
  series: '700 – Regeneratív Beavatkozások',
  tier: 1,
  status: 'FC-APPROVED ✓',
  date: '2026-04-12',
  net_efu_ref: '+35 000 EFU-E (25 év, Eastgate Centre, Zimbabwe)',
  formula: 'BM = material_efficiency×0.25 + energy_efficiency×0.25 + zero_waste×0.20 + bio_compatibility×0.15 + r_future_factor×0.15',
  antithesis: '600.4 Ökológiai kanibalizmus',
  connections: ['600.4', '104.44', '104.45', '104.46', '700.1'],
};

export const BM_VARIABLES_MAIN = [
  { id: 'material_efficiency', label: 'Anyag hatékonyság (nature-inspired)', description: 'Természet által inspirált anyagfelhasználási hatékonyság (Shinkansen orr: 0.75)', default: 0.75, min: 0, max: 1, step: 0.01, color: '#166534', positive: true, layer: 'main', unit: '' },
  { id: 'energy_reduction', label: 'Energia csökkentés', description: 'Bio-inspirált energiacsökkentés mértéke (Eastgate: −90% AC energia)', default: 0.60, min: 0, max: 1, step: 0.01, color: '#16a34a', positive: true, layer: 'main', unit: '' },
  { id: 'waste_elimination', label: 'Hulladék eliminálás', description: 'Körforgásos, zero-waste design mértéke (cradle-to-cradle elv)', default: 0.70, min: 0, max: 1, step: 0.01, color: '#15803d', positive: true, layer: 'main', unit: '' },
  { id: 'toxicity_reduction', label: 'Toxicitás csökkentés (bio-compatible)', description: 'Mérgező anyagok kiváltása bio-kompatibilis alternatívákkal', default: 0.80, min: 0, max: 1, step: 0.01, color: '#0891b2', positive: true, layer: 'main', unit: '' },
  { id: 'bio_strategy_adoption', label: 'Bio-stratégiák alkalmazása', description: 'Biomimetikus stratégiák implementálási aránya (0=konvencionális, 1=teljes biomimikry)', default: 0.45, min: 0, max: 1, step: 0.01, color: '#0369a1', positive: true, layer: 'main', unit: '' },
];

export const BM_VARIABLES_NEGATIVE = [
  { id: 'industrial_linear_lock_in', label: 'Ipari lineáris lock-in (akadályozó)', description: 'Hagyományos lineáris ipari rendszertől való függőség (0=szabad, 1=teljes lock-in)', default: 0.55, min: 0, max: 1, step: 0.01, color: '#dc2626', positive: false, layer: 'negative', unit: '' },
];

export const BM_VARIABLES_CONTEXT = [
  { id: 'buildings_count', label: 'Épületek/projektek száma', description: 'Biomimetikus projektek száma (NET_EFU skálázáshoz)', default: 1, min: 1, max: 10000, step: 1, color: '#374151', positive: true, layer: 'context', unit: 'db' },
];

export const BM_ALL_VARIABLES = [
  ...BM_VARIABLES_MAIN,
  ...BM_VARIABLES_NEGATIVE,
  ...BM_VARIABLES_CONTEXT,
];

export const BM_ZONES = [
  { id: 'LINEAR_INDUSTRIAL', label: '🔴 Lineáris Ipari', status: 'LINEAR_INDUSTRIAL', condition: 'BM < 2', action: '600.4 aktív – természet elleni design, ökológiai kanibalizmus maximális', color: '#dc2626', bg: '#fef2f2', max: 2 },
  { id: 'AWARE', label: '🟠 Tudatos Kezdet', status: 'AWARE', condition: '2 – 4', action: 'Biomimikry tudatosság – részleges alkalmazás, lock-in még domináns', color: '#ea580c', bg: '#fff7ed', min: 2, max: 4 },
  { id: 'EMERGING', label: '🟡 Kibontakozó Design', status: 'EMERGING', condition: '4 – 6', action: 'Biomimetikus elemek integrálva – energia és anyag hatékonyság nő', color: '#ca8a04', bg: '#fefce8', min: 4, max: 6 },
  { id: 'ACTIVE', label: '🟢 Aktív Biomimikry', status: 'ACTIVE', condition: '6 – 8', action: 'Eastgate szint – bio-inspirált rendszerek aktívak, HMI +2.2 EFU/épület, hulladék csökken', color: '#16a34a', bg: '#f0fdf4', min: 6, max: 8 },
  { id: 'BIOMIMETIC', label: '⭐ Teljes Biomimetika', status: 'BIOMIMETIC', condition: 'BM ≥ 8', action: 'Biomimetikus kernel – R_future 1.5+, cradle-to-cradle aktív, pedoszféra regenerálódik', color: '#0369a1', bg: '#eff6ff', min: 8 },
];

export const BM_TRIGGERS = [
  { id: 'LINEAR_LOCK_IN', label: 'LINEAR_LOCK_IN – Lineáris ipari lock-in kritikus', condition: 'industrial_linear_lock_in > 0.70 ÉS bio_strategy_adoption < 0.20', action: '600.4 antiflux szükséges – biomimetikus átállás kötelező, lock-in feloldása', level: 'RED', color: '#dc2626', positive: false },
  { id: 'LOW_EFFICIENCY', label: 'LOW_EFFICIENCY – Alacsony hatékonyság', condition: 'material_efficiency < 0.30 ÉS energy_reduction < 0.30', action: 'Hatékonysági kritérium nem teljesül – bio-inspirált redesign szükséges', level: 'ORANGE', color: '#ea580c', positive: false },
  { id: 'BIOMIMICRY_ACTIVE', label: 'BIOMIMICRY_ACTIVE – Biomimikry szintű aktiválás', condition: 'bm_index ≥ 6.0', action: 'Biomimetikus pilot aktív – NET_EFU számítható, ökológiai lábnyom csökken', level: 'GREEN', color: '#16a34a', positive: true },
  { id: 'FULL_BIOMIMETIC', label: 'FULL_BIOMIMETIC – Teljes biomimetikai rendszer', condition: 'bm_index ≥ 8.0 ÉS waste_elimination ≥ 0.80', action: 'Teljes biomimetika kernel – R_future 1.5+, pedoszféra +20%, cradle-to-cradle aktív', level: 'GREEN', color: '#0369a1', positive: true },
];
