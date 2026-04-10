/**
 * cds-api.js — Mock aszinkron API szolgáltatás a 900.1 CDS / 900.2 CDP rendszerekhez
 *
 * Ez a modul szimulálja a valós CDS/CDP API hívásokat fejlesztési és tesztelési
 * célokra mindaddig, amíg a tényleges rendszerek API dokumentációja rendelkezésre áll.
 *
 * Funkciók:
 *  – fetchCdsData()    : CDS adatok lekérése (mock GET)
 *  – sendCdpAction()   : CDP akció elküldése (mock POST)
 *  – getCdsStatus()    : CDS rendszer státusz lekérése
 *  – Konfiguráció: VITE_CDS_API_URL / VITE_CDP_API_URL env változókon keresztül
 *  – Robusztus hibakezelés és újrapróbálkozás
 */

import {
  CDS_MOCK_RECORDS,
  CDS_MODULE_META,
} from '../data/cds900_1.js';
import {
  CDP_MODULE_META,
  CDP_MOCK_RESPONSES,
  CDP_ACTIONS,
  createMockCdpResponse,
} from '../data/cdp900_2.js';
import { translateApiError } from '../utils/cds-transformers.js';

// ---------------------------------------------------------------------------
// Konfiguráció
// ---------------------------------------------------------------------------

/**
 * API konfiguráció — környezeti változókból olvas, visszaesési (fallback) értékekkel.
 * Valós integrációnál az .env fájlban kell beállítani:
 *   VITE_CDS_API_URL=https://cds.internal/api/v1
 *   VITE_CDP_API_URL=https://cdp.internal/api/v1
 *   VITE_CDS_API_KEY=<api-key>
 */
export const CDS_API_CONFIG = {
  cdsBaseUrl: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CDS_API_URL) || null,
  cdpBaseUrl: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CDP_API_URL) || null,
  apiKey: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CDS_API_KEY) || null,
  timeoutMs: 8000,
  maxRetries: 3,
  retryDelayMs: 1000,
  // useMock: true ha sem CDS sem CDP URL nincs beállítva; false ha bármelyik konfigurálva van.
  useMock: !(
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CDS_API_URL) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CDP_API_URL)
  ),
};

// ---------------------------------------------------------------------------
// Belső segédeszközök
// ---------------------------------------------------------------------------

/**
 * Szimulálja a hálózati késedelmet (mock módban).
 * @param {number} [ms=80]
 * @returns {Promise<void>}
 */
function simulateLatency(ms = 80) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Sztenderd API hibaobjektumot hoz létre.
 * @param {string|number} code
 * @param {string} [detail]
 * @returns {{ code: string|number, message: string, detail?: string }}
 */
function createApiError(code, detail) {
  return { code, message: translateApiError(code), ...(detail ? { detail } : {}) };
}

// ---------------------------------------------------------------------------
// CDS API — Adatlekérés (900.1)
// ---------------------------------------------------------------------------

/**
 * CDS adatok aszinkron lekérése.
 *
 * Mock módban: a CDS_MOCK_RECORDS legújabb bejegyzését adja vissza.
 * Valós módban: GET <cdsBaseUrl>/indices/current hívást végez.
 *
 * @param {Object} [options]
 * @param {boolean} [options.forceMock]     - Erőltetett mock mód (teszteléshez)
 * @param {string}  [options.recordId]      - Adott rekord ID lekérése (mock esetén szimulált)
 * @returns {Promise<import('../data/cds900_1.js').CdsRecord>}
 * @throws {{ code: string|number, message: string }}
 */
export async function fetchCdsData(options = {}) {
  const useMock = options.forceMock ?? CDS_API_CONFIG.useMock;

  if (useMock) {
    await simulateLatency();
    const records = CDS_MOCK_RECORDS;
    if (options.recordId) {
      const found = records.find((r) => r.record_id === options.recordId);
      if (!found) throw createApiError(404, `Rekord nem található: ${options.recordId}`);
      return found;
    }
    return records[0];
  }

  // Valós API hívás (Sprint 2+)
  const url = `${CDS_API_CONFIG.cdsBaseUrl}/indices/current`;
  return _fetchWithRetry(url, { method: 'GET' });
}

/**
 * Több CDS rekord lekérése (lista).
 *
 * @param {Object} [options]
 * @param {boolean} [options.forceMock]
 * @param {number}  [options.limit=10]
 * @returns {Promise<import('../data/cds900_1.js').CdsRecord[]>}
 */
export async function fetchCdsList(options = {}) {
  const useMock = options.forceMock ?? CDS_API_CONFIG.useMock;
  const limit = options.limit ?? 10;

  if (useMock) {
    await simulateLatency();
    return CDS_MOCK_RECORDS.slice(0, limit);
  }

  const url = `${CDS_API_CONFIG.cdsBaseUrl}/indices?limit=${limit}`;
  return _fetchWithRetry(url, { method: 'GET' });
}

// ---------------------------------------------------------------------------
// CDP API — Akció küldés (900.2)
// ---------------------------------------------------------------------------

/**
 * CDP akció aszinkron elküldése.
 *
 * Mock módban: a megfelelő mock választ adja vissza.
 * Valós módban: POST <cdpBaseUrl>/actions hívást végez.
 *
 * @param {import('../data/cdp900_2.js').CdpActionRequest} actionRequest
 * @param {Object} [options]
 * @param {boolean} [options.forceMock]
 * @returns {Promise<import('../data/cdp900_2.js').CdpActionResponse>}
 * @throws {{ code: string|number, message: string }}
 */
export async function sendCdpAction(actionRequest, options = {}) {
  const useMock = options.forceMock ?? CDS_API_CONFIG.useMock;

  if (!actionRequest || typeof actionRequest !== 'object') {
    throw createApiError(400, 'Érvénytelen CDP akció kérés objektum');
  }
  if (!actionRequest.action_id || !CDP_ACTIONS[actionRequest.action_id]) {
    throw createApiError(400, `Ismeretlen CDP akció azonosító: ${actionRequest.action_id}`);
  }

  if (useMock) {
    await simulateLatency(120);
    return createMockCdpResponse(actionRequest.action_id, actionRequest.trigger_level ?? 0);
  }

  const url = `${CDS_API_CONFIG.cdpBaseUrl}/actions`;
  return _fetchWithRetry(url, {
    method: 'POST',
    body: JSON.stringify(actionRequest),
  });
}

// ---------------------------------------------------------------------------
// CDS státusz lekérése
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} CdsSystemStatus
 * @property {boolean} online       - CDS szerver elérhető-e
 * @property {string}  version      - API verzió
 * @property {string}  last_updated - Utolsó adatfrissítés ISO 8601
 * @property {string}  status       - 'OPERATIONAL' | 'DEGRADED' | 'OFFLINE'
 */

/**
 * CDS rendszer státuszának lekérése.
 * @param {Object} [options]
 * @param {boolean} [options.forceMock]
 * @returns {Promise<CdsSystemStatus>}
 */
export async function getCdsStatus(options = {}) {
  const useMock = options.forceMock ?? CDS_API_CONFIG.useMock;

  if (useMock) {
    await simulateLatency(40);
    return {
      online: true,
      version: CDS_MODULE_META.version,
      last_updated: new Date().toISOString(),
      status: 'OPERATIONAL',
    };
  }

  const url = `${CDS_API_CONFIG.cdsBaseUrl}/status`;
  return _fetchWithRetry(url, { method: 'GET' });
}

/**
 * CDP rendszer státuszának lekérése.
 * @param {Object} [options]
 * @param {boolean} [options.forceMock]
 * @returns {Promise<CdsSystemStatus>}
 */
export async function getCdpStatus(options = {}) {
  const useMock = options.forceMock ?? CDS_API_CONFIG.useMock;

  if (useMock) {
    await simulateLatency(40);
    return {
      online: true,
      version: CDP_MODULE_META.version,
      last_updated: new Date().toISOString(),
      status: 'OPERATIONAL',
    };
  }

  const url = `${CDS_API_CONFIG.cdpBaseUrl}/status`;
  return _fetchWithRetry(url, { method: 'GET' });
}

// ---------------------------------------------------------------------------
// Belső: fetch újrapróbálkozással és hibakezeléssel
// ---------------------------------------------------------------------------

/**
 * Fetch kérés újrapróbálkozási logikával.
 * @param {string} url
 * @param {RequestInit} fetchOptions
 * @param {number} [attempt=1]
 * @returns {Promise<unknown>}
 */
async function _fetchWithRetry(url, fetchOptions, attempt = 1) {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(CDS_API_CONFIG.apiKey ? { Authorization: `Bearer ${CDS_API_CONFIG.apiKey}` } : {}),
  };

  let response;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CDS_API_CONFIG.timeoutMs);

    response = await fetch(url, {
      ...fetchOptions,
      headers: { ...headers, ...(fetchOptions.headers || {}) },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
  } catch (err) {
    const isTimeout = err.name === 'AbortError';
    const code = isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR';

    if (attempt < CDS_API_CONFIG.maxRetries) {
      await _delay(CDS_API_CONFIG.retryDelayMs * attempt);
      return _fetchWithRetry(url, fetchOptions, attempt + 1);
    }

    throw createApiError(code, err.message);
  }

  if (!response.ok) {
    if (attempt < CDS_API_CONFIG.maxRetries && response.status >= 500) {
      await _delay(CDS_API_CONFIG.retryDelayMs * attempt);
      return _fetchWithRetry(url, fetchOptions, attempt + 1);
    }
    throw createApiError(response.status);
  }

  try {
    return await response.json();
  } catch {
    throw createApiError('PARSE_ERROR');
  }
}

/** @param {number} ms */
function _delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
