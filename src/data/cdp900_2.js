/**
 * cdp900_2.js — EFU 900.2 CDP (Canonical Data Protocol) — Protokoll definíciók és mock adatok
 *
 * Sorozat: 900 – Rendszerintegrációs Modulok
 * Altípus: CDP – Canonical Data Protocol
 * Kapcsolódó modulok: 600.56 (Atrocitás Potenciál), 900.1 (CDS)
 * Státusz: SPRINT-1 / MOCK
 * Verzió: 1.0 DRAFT
 *
 * Ez a fájl tartalmazza:
 *  – A CDP 900.2 protokoll akciótípusait és trigger-szintjeit
 *  – Az automatikus aktiválási logikát (trigger → CDP akció)
 *  – Mock válaszadatokat fejlesztési és tesztelési célokra
 */

// ---------------------------------------------------------------------------
// Modul meta
// ---------------------------------------------------------------------------

export const CDP_MODULE_META = {
  id: '900.2',
  name: 'Canonical Data Protocol',
  shortName: 'CDP',
  version: '1.0 DRAFT',
  status: 'SPRINT-1 / MOCK',
  date: '2026-04-10',
  related_modules: ['900.1 (CDS)', '600.56'],
  description:
    'A CDP rendszer a CDS (900.1) adatai alapján automatikus beavatkozási és ' +
    'értesítési protokollokat hajt végre, amikor az EFU számítások kritikus ' +
    'küszöbértékeket lépnek át (pl. A_value > 1.5 → CDP aktiválás).',
};

// ---------------------------------------------------------------------------
// CDP akciótípusok
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} CdpActionDef
 * @property {string}  id          - Akció azonosítója
 * @property {string}  label       - Magyar megnevezés
 * @property {string}  labelEn     - Angol megnevezés
 * @property {string}  severity    - Súlyossági szint: 'INFO' | 'WARNING' | 'ALERT' | 'CRITICAL'
 * @property {string}  description - Rövid leírás
 * @property {boolean} requires_ack - Manuális visszaigazolást igényel-e
 */

/** @type {Record<string, CdpActionDef>} */
export const CDP_ACTIONS = {
  MONITOR: {
    id: 'MONITOR',
    label: 'Monitorozás',
    labelEn: 'Monitor',
    severity: 'INFO',
    description: 'Passzív megfigyelés; nincs aktív beavatkozás.',
    requires_ack: false,
  },
  NOTIFY: {
    id: 'NOTIFY',
    label: 'Értesítés',
    labelEn: 'Notify',
    severity: 'WARNING',
    description: 'Értesítési protokoll aktiválása; CDS adatok naplózása.',
    requires_ack: false,
  },
  INTERVENE: {
    id: 'INTERVENE',
    label: 'Beavatkozás',
    labelEn: 'Intervene',
    severity: 'ALERT',
    description: 'CDP aktív beavatkozás; adatgyűjtés gyorsítása, manuális ellenőrzés igénylése.',
    requires_ack: true,
  },
  EMERGENCY_ALLOC: {
    id: 'EMERGENCY_ALLOC',
    label: 'Kényszer allokáció (AAP)',
    labelEn: 'Emergency Allocation (AAP)',
    severity: 'CRITICAL',
    description: 'Automatikus Allokációs Protokoll (AAP) aktiválása; azonnali erőforrás-átcsoportosítás.',
    requires_ack: true,
  },
};

// ---------------------------------------------------------------------------
// CDP trigger-szintek (az A_value / NDI küszöbök alapján)
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} CdpTriggerLevel
 * @property {number}  level        - Trigger szint (0–3)
 * @property {string}  id           - Szint azonosítója
 * @property {string}  label        - Magyar megnevezés
 * @property {string}  action_id    - Kapcsolódó CDP akció azonosítója
 * @property {boolean} cdp_active   - CDP aktív-e ezen a szinten
 * @property {boolean} aap_required - AAP szükséges-e
 * @property {string}  a_condition  - A_value feltétel szövegesen
 */

/** @type {CdpTriggerLevel[]} */
export const CDP_TRIGGER_LEVELS = [
  {
    level: 0,
    id: 'L0_STABLE',
    label: 'Stabil – Monitorozás',
    action_id: 'MONITOR',
    cdp_active: false,
    aap_required: false,
    a_condition: 'A < 1.0',
  },
  {
    level: 1,
    id: 'L1_WARNING',
    label: 'Instabil – Értesítés',
    action_id: 'NOTIFY',
    cdp_active: false,
    aap_required: false,
    a_condition: '1.0 ≤ A < 1.5',
  },
  {
    level: 2,
    id: 'L2_INTERVENTION',
    label: 'Pre-Atrocitás – Beavatkozás',
    action_id: 'INTERVENE',
    cdp_active: true,
    aap_required: false,
    a_condition: '1.5 ≤ A < 2.5',
  },
  {
    level: 3,
    id: 'L3_EMERGENCY',
    label: 'Aktív összeomlás – Kényszer allokáció',
    action_id: 'EMERGENCY_ALLOC',
    cdp_active: true,
    aap_required: true,
    a_condition: 'A ≥ 2.5',
  },
];

// ---------------------------------------------------------------------------
// CDP trigger kiértékelő logika
// ---------------------------------------------------------------------------

/**
 * Az A_value alapján meghatározza a CDP trigger szintet és az akciót.
 *
 * @param {number} aValue - 600.56 A érték (logaritmikus)
 * @returns {{ level: CdpTriggerLevel, action: CdpActionDef }}
 */
export function evaluateCDPTrigger(aValue) {
  let triggerLevel;
  if (aValue >= 2.5) {
    triggerLevel = CDP_TRIGGER_LEVELS[3];
  } else if (aValue >= 1.5) {
    triggerLevel = CDP_TRIGGER_LEVELS[2];
  } else if (aValue >= 1.0) {
    triggerLevel = CDP_TRIGGER_LEVELS[1];
  } else {
    triggerLevel = CDP_TRIGGER_LEVELS[0];
  }
  return {
    level: triggerLevel,
    action: CDP_ACTIONS[triggerLevel.action_id],
  };
}

// ---------------------------------------------------------------------------
// CDP API kérés/válasz struktúrák
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} CdpActionRequest
 * @property {string} source_module  - Az EFU forrás modul azonosítója (pl. '600.56')
 * @property {string} action_id      - CDP akció azonosítója
 * @property {number} trigger_level  - Trigger szint (0–3)
 * @property {Object} payload        - EFU számítási eredmények (módosítandó modulonként)
 * @property {string} timestamp      - ISO 8601 időbélyeg
 */

/**
 * @typedef {Object} CdpActionResponse
 * @property {boolean} accepted      - Az akció elfogadva-e
 * @property {string}  protocol_id   - Protokoll esemény azonosítója
 * @property {string}  action_id     - Végrehajtott CDP akció azonosítója
 * @property {string}  status        - Státusz: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
 * @property {string}  message       - Szöveges visszajelzés
 * @property {string}  timestamp     - ISO 8601 időbélyeg
 */

// ---------------------------------------------------------------------------
// Mock CDP válaszadatok
// ---------------------------------------------------------------------------

/**
 * Mock CDP akció-válasz (trigger szint szerint)
 * @param {string} actionId
 * @param {number} level
 * @returns {CdpActionResponse}
 */
export function createMockCdpResponse(actionId, level) {
  return {
    accepted: true,
    protocol_id: `cdp-proto-mock-${Date.now()}-L${level}`,
    action_id: actionId,
    status: 'QUEUED',
    message: `CDP protokoll aktiválva: ${CDP_ACTIONS[actionId]?.label ?? actionId} (L${level})`,
    timestamp: new Date().toISOString(),
  };
}

/** Előre definiált mock válaszok tesztelési célokra */
export const CDP_MOCK_RESPONSES = {
  MONITOR: {
    accepted: true,
    protocol_id: 'cdp-proto-mock-L0',
    action_id: 'MONITOR',
    status: 'COMPLETED',
    message: 'Monitorozás aktív – nincs beavatkozás szükséges.',
    timestamp: '2026-04-10T18:00:00Z',
  },
  NOTIFY: {
    accepted: true,
    protocol_id: 'cdp-proto-mock-L1',
    action_id: 'NOTIFY',
    status: 'COMPLETED',
    message: 'Értesítés elküldve – CDS adatok naplózva.',
    timestamp: '2026-04-10T18:00:00Z',
  },
  INTERVENE: {
    accepted: true,
    protocol_id: 'cdp-proto-mock-L2',
    action_id: 'INTERVENE',
    status: 'QUEUED',
    message: 'CDP beavatkozás iniciálva – manuális ellenőrzés szükséges.',
    timestamp: '2026-04-10T18:00:00Z',
  },
  EMERGENCY_ALLOC: {
    accepted: true,
    protocol_id: 'cdp-proto-mock-L3',
    action_id: 'EMERGENCY_ALLOC',
    status: 'PROCESSING',
    message: 'AAP aktiválva – azonnali erőforrás-átcsoportosítás folyamatban.',
    timestamp: '2026-04-10T18:00:00Z',
  },
};
