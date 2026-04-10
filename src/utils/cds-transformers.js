/**
 * cds-transformers.js — CDS/CDP ↔ EFU belső adatátalakítók
 *
 * Ez a modul az adatátalakítási logikát tartalmazza:
 *  – CDS API válasz → EFU belső CDS kötési formátum (600.56 atrocitas input)
 *  – EFU számítási eredmények → CDP kérés payload
 *  – Általános normalizáló és ellenőrző segédfüggvények
 */

import { CDS_FIELD_SCHEMA, validateCDSIndices } from '../data/cds900_1.js';

// ---------------------------------------------------------------------------
// CDS → EFU belső formátum
// ---------------------------------------------------------------------------

/**
 * A CDS API által visszaadott teljes rekordból kinyeri az EFU 600.56 modul
 * számára szükséges primer index objektumot, és elvégzi a szükséges normalizálást.
 *
 * @param {import('../data/cds900_1.js').CdsRecord} cdsRecord - Teljes CDS API rekord
 * @returns {{ CII: number, VKI: number, CFI_total: number }}
 * @throws {Error} Ha a rekord hiányos vagy érvénytelen
 */
export function extractCdsBindingFromRecord(cdsRecord) {
  if (!cdsRecord || typeof cdsRecord !== 'object') {
    throw new Error('CDS rekord hiányzik vagy érvénytelen formátumú');
  }

  const indices = cdsRecord.primary_indices;
  const validation = validateCDSIndices(indices);
  if (!validation.valid) {
    throw new Error(`CDS adatok érvénytelenek: ${validation.errors.join('; ')}`);
  }

  return {
    CII: clampToRange(indices.CII, CDS_FIELD_SCHEMA.CII.min, CDS_FIELD_SCHEMA.CII.max),
    VKI: clampToRange(indices.VKI, CDS_FIELD_SCHEMA.VKI.min, CDS_FIELD_SCHEMA.VKI.max),
    CFI_total: clampToRange(
      indices.CFI_total,
      CDS_FIELD_SCHEMA.CFI_total.min,
      CDS_FIELD_SCHEMA.CFI_total.max,
    ),
  };
}

/**
 * Nyers CDS primer index objektumot alakít EFU belső kötési formátumra.
 * Használható ha a teljes rekord struktúra nem áll rendelkezésre.
 *
 * @param {{ CII: number, VKI: number, CFI_total: number }} rawIndices
 * @returns {{ CII: number, VKI: number, CFI_total: number }}
 * @throws {Error} Ha a bemeneti adatok érvénytelenek
 */
export function normalizeCdsIndices(rawIndices) {
  const validation = validateCDSIndices(rawIndices);
  if (!validation.valid) {
    throw new Error(`CDS indexek érvénytelenek: ${validation.errors.join('; ')}`);
  }

  return {
    CII: clampToRange(rawIndices.CII, CDS_FIELD_SCHEMA.CII.min, CDS_FIELD_SCHEMA.CII.max),
    VKI: clampToRange(rawIndices.VKI, CDS_FIELD_SCHEMA.VKI.min, CDS_FIELD_SCHEMA.VKI.max),
    CFI_total: clampToRange(
      rawIndices.CFI_total,
      CDS_FIELD_SCHEMA.CFI_total.min,
      CDS_FIELD_SCHEMA.CFI_total.max,
    ),
  };
}

// ---------------------------------------------------------------------------
// EFU → CDP kérés payload
// ---------------------------------------------------------------------------

/**
 * EFU 600.56 számítási eredményekből CDP akció kérést állít össze.
 *
 * @param {Object} efuResult - EFU 600.56 számítási eredmény objektum
 * @param {number}  efuResult.A_value     - Logaritmikus A érték
 * @param {number}  efuResult.A_dynamic   - Dinamikus A érték
 * @param {string}  efuResult.zone        - Zóna azonosítója ('GREEN'|'YELLOW'|'ORANGE'|'RED')
 * @param {boolean} efuResult.cdp_activation - CDP aktiválás szükséges-e
 * @param {string} actionId - CDP akció azonosítója
 * @param {number} triggerLevel - Trigger szint (0–3)
 * @returns {import('../data/cdp900_2.js').CdpActionRequest}
 */
export function buildCdpActionRequest(efuResult, actionId, triggerLevel) {
  if (!efuResult || typeof efuResult !== 'object') {
    throw new Error('EFU eredmény objektum hiányzik vagy érvénytelen');
  }

  return {
    source_module: '600.56',
    action_id: actionId,
    trigger_level: triggerLevel,
    payload: {
      A_value: efuResult.A_value ?? null,
      A_dynamic: efuResult.A_dynamic ?? null,
      zone: efuResult.zone ?? null,
      cdp_activation: efuResult.cdp_activation ?? false,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * EFU Narratíva (600.40-42) eredményekből CDP kérést épít.
 *
 * @param {Object} ndiResult - EFU NDI számítási eredmény
 * @param {number}  ndiResult.NDI    - Narratíva Degradáció Index értéke
 * @param {string}  ndiResult.zone   - Zóna azonosítója
 * @param {string} actionId
 * @param {number} triggerLevel
 * @returns {import('../data/cdp900_2.js').CdpActionRequest}
 */
export function buildCdpNarrativeRequest(ndiResult, actionId, triggerLevel) {
  if (!ndiResult || typeof ndiResult !== 'object') {
    throw new Error('NDI eredmény objektum hiányzik vagy érvénytelen');
  }

  return {
    source_module: '600.40-42',
    action_id: actionId,
    trigger_level: triggerLevel,
    payload: {
      NDI: ndiResult.NDI ?? null,
      zone: ndiResult.zone ?? null,
    },
    timestamp: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Általános segédfüggvények
// ---------------------------------------------------------------------------

/**
 * Egy értéket az adott tartományba kényszerít (clamp).
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clampToRange(value, min, max) {
  if (typeof value !== 'number' || isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

/**
 * Ellenőrzi, hogy egy CDP trigger szint érvényes-e (0–3).
 * @param {number} level
 * @returns {boolean}
 */
export function isValidTriggerLevel(level) {
  return Number.isInteger(level) && level >= 0 && level <= 3;
}

/**
 * Egyszerű API hibakód → magyar hibaüzenet fordító.
 * @param {number|string} errorCode
 * @returns {string}
 */
export function translateApiError(errorCode) {
  const messages = {
    400: 'Hibás kérés – érvénytelen adatformátum',
    401: 'Hitelesítési hiba – érvénytelen vagy lejárt API kulcs',
    403: 'Hozzáférés megtagadva – nincs jogosultság',
    404: 'Az erőforrás nem található',
    429: 'Sebességkorlátozás elérve – kérjük várjon és próbálja újra',
    500: 'Belső szerverhiba – CDS/CDP rendszerhiba',
    503: 'Szolgáltatás nem elérhető – CDS/CDP rendszer átmenetileg leállt',
    NETWORK_ERROR: 'Hálózati hiba – kapcsolat a CDS/CDP szerverhez nem lehetséges',
    TIMEOUT: 'Időtúllépés – a CDS/CDP szerver nem válaszolt időben',
    PARSE_ERROR: 'Adatelemzési hiba – a CDS/CDP válasz nem értelmezhető',
  };
  return messages[errorCode] ?? `Ismeretlen hiba (kód: ${errorCode})`;
}
