/**
 * CdsPanel.jsx — EFU 900.1 CDS / 900.2 CDP Integrációs Panel (Sprint 2)
 *
 * Sections:
 *   1. Modul fejléc + rendszer státusz (CDS / CDP online jelzők)
 *   2. CDS 900.1 Adatpanel — primer + másodlagos indexek vizualizáció
 *   3. CDS rekordválasztó + manuális frissítés gomb
 *   4. CDP 900.2 Akcióvezérlők — akció küldés
 *   5. Konfiguráció állapot (mock / valós API)
 *
 * Konfiguráció:
 *   VITE_CDS_API_URL  — valós CDS endpoint (ha nincs beállítva: mock mód)
 *   VITE_CDP_API_URL  — valós CDP endpoint
 *   VITE_CDS_API_KEY  — API kulcs
 *
 * Reference: EFU 900.1/900.2 Sprint 2 — 2026-04-10
 */

import { useState, useEffect, useCallback } from 'react';
import {
  fetchCdsData,
  fetchCdsList,
  sendCdpAction,
  getCdsStatus,
  getCdpStatus,
  CDS_API_CONFIG,
} from '../services/cds-api.js';
import { CDS_MODULE_META } from '../data/cds900_1.js';
import { CDP_MODULE_META } from '../data/cdp900_2.js';
import {
  PrimaryIndicesTable,
  SecondaryIndicesTable,
  RecordMetaRow,
} from './CdsDataDisplay.jsx';
import CdpActionControls from './CdpActionControls.jsx';

// ---------------------------------------------------------------------------
// Segédkomponensek
// ---------------------------------------------------------------------------

function Badge({ children, color, size = '11px' }) {
  return (
    <span style={{
      display: 'inline-block', background: color, color: 'white',
      padding: '2px 8px', borderRadius: '20px', fontSize: size,
      fontWeight: '700', letterSpacing: '0.03em',
    }}>
      {children}
    </span>
  );
}

function SectionBox({ title, icon, children, accentColor = '#e5e7eb' }) {
  return (
    <div style={{ border: `1px solid ${accentColor}`, borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
      <div style={{
        background: '#f3f4f6', padding: '8px 14px',
        fontWeight: '700', fontSize: '11px', textTransform: 'uppercase',
        letterSpacing: '0.05em', color: '#374151',
      }}>
        {icon} {title}
      </div>
      <div style={{ padding: '14px' }}>{children}</div>
    </div>
  );
}

function StatusDot({ online }) {
  return (
    <span style={{
      display: 'inline-block', width: '8px', height: '8px',
      borderRadius: '50%', background: online ? '#16a34a' : '#dc2626',
      marginRight: '5px', verticalAlign: 'middle',
      boxShadow: online ? '0 0 0 2px #bbf7d0' : '0 0 0 2px #fecaca',
    }} />
  );
}

function ErrorBox({ error }) {
  if (!error) return null;
  const msg = typeof error === 'object' ? (error.message ?? JSON.stringify(error)) : error;
  const detail = typeof error === 'object' ? error.detail : null;
  return (
    <div style={{
      padding: '10px 14px', background: '#fef2f2',
      border: '1px solid #fecaca', borderRadius: '6px',
      fontSize: '12px', color: '#dc2626', marginBottom: '12px',
    }}>
      <strong>⚠ API hiba:</strong> {msg}
      {detail && <div style={{ marginTop: '4px', color: '#b91c1c' }}>{detail}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Fő komponens
// ---------------------------------------------------------------------------

export default function CdsPanel() {
  // Rendszer státusz
  const [cdsStatus, setCdsStatus] = useState(null);
  const [cdpStatus, setCdpStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  // CDS adatok
  const [cdsRecord, setCdsRecord] = useState(null);
  const [cdsList, setCdsList] = useState([]);
  const [selectedRecordId, setSelectedRecordId] = useState('');
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState(null);

  // Konfiguráció
  const isMock = CDS_API_CONFIG.useMock;

  // ---------------------------------------------------------------------------
  // Státusz lekérés
  // ---------------------------------------------------------------------------

  const loadStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const [cds, cdp] = await Promise.all([getCdsStatus(), getCdpStatus()]);
      setCdsStatus(cds);
      setCdpStatus(cdp);
    } catch {
      // Státusz hiba nem kritikus — néma elutasítás
    } finally {
      setStatusLoading(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // CDS adatlekérés
  // ---------------------------------------------------------------------------

  const loadCdsList = useCallback(async () => {
    try {
      const list = await fetchCdsList({ limit: 5 });
      setCdsList(list);
      if (list.length > 0 && !selectedRecordId) {
        setSelectedRecordId(list[0].record_id);
      }
    } catch {
      // Lista hiba nem állítja le a panelt
    }
  }, [selectedRecordId]);

  const loadCdsData = useCallback(async (recordId) => {
    setDataLoading(true);
    setDataError(null);
    try {
      const record = await fetchCdsData({ recordId: recordId || undefined });
      setCdsRecord(record);
    } catch (err) {
      setDataError(err);
    } finally {
      setDataLoading(false);
    }
  }, []);

  // Kezdeti betöltés
  useEffect(() => {
    loadStatus();
    loadCdsList().then(() => loadCdsData(''));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Rekordválasztás után frissítés
  function handleRecordSelect(e) {
    const id = e.target.value;
    setSelectedRecordId(id);
    loadCdsData(id);
  }

  function handleRefresh() {
    loadStatus();
    loadCdsData(selectedRecordId);
  }

  // ---------------------------------------------------------------------------
  // CDP akció küldés
  // ---------------------------------------------------------------------------

  async function handleSendAction(request) {
    return sendCdpAction(request);
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const cdsOnline = cdsStatus?.online ?? null;
  const cdpOnline = cdpStatus?.online ?? null;

  return (
    <div style={{
      background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px',
      padding: '20px', marginBottom: '24px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      {/* ── Fejléc ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <Badge color="#1e40af" size="10px">900.1</Badge>
            <Badge color="#6d28d9" size="10px">900.2</Badge>
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#111827' }}>
              CDS / CDP Integrációs Panel
            </h2>
            <Badge color={isMock ? '#d97706' : '#16a34a'} size="10px">
              {isMock ? 'MOCK MÓD' : 'VALÓS API'}
            </Badge>
          </div>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>
            Canonical Data Structure (900.1) · Canonical Data Protocol (900.2) · Sprint 2
          </div>
        </div>

        {/* Státusz jelzők */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '12px' }}>
          <div>
            <StatusDot online={cdsOnline !== false} />
            <span style={{ color: '#374151', fontWeight: '600' }}>CDS</span>
            {cdsStatus && (
              <span style={{ marginLeft: '4px', color: '#9ca3af' }}>
                {cdsStatus.status} · v{cdsStatus.version}
              </span>
            )}
          </div>
          <div>
            <StatusDot online={cdpOnline !== false} />
            <span style={{ color: '#374151', fontWeight: '600' }}>CDP</span>
            {cdpStatus && (
              <span style={{ marginLeft: '4px', color: '#9ca3af' }}>
                {cdpStatus.status} · v{cdpStatus.version}
              </span>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={dataLoading || statusLoading}
            style={{
              padding: '5px 12px',
              background: dataLoading || statusLoading ? '#e5e7eb' : '#1e40af',
              color: dataLoading || statusLoading ? '#9ca3af' : 'white',
              border: 'none', borderRadius: '6px',
              fontSize: '11px', fontWeight: '700',
              cursor: dataLoading || statusLoading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {dataLoading ? '⏳ Frissítés…' : '↺ Frissítés'}
          </button>
        </div>
      </div>

      {/* ── Konfiguráció infó ────────────────────────────────────────────── */}
      {isMock && (
        <div style={{
          padding: '8px 12px', background: '#fffbeb',
          border: '1px solid #fde68a', borderRadius: '6px',
          fontSize: '11px', color: '#92400e', marginBottom: '16px',
        }}>
          <strong>Mock mód aktív</strong> — Valós API integrációhoz állítsa be a
          {' '}<code style={{ background: '#fef3c7', padding: '1px 4px', borderRadius: '3px' }}>VITE_CDS_API_URL</code>
          {' '}és
          {' '}<code style={{ background: '#fef3c7', padding: '1px 4px', borderRadius: '3px' }}>VITE_CDP_API_URL</code>
          {' '}környezeti változókat az <code style={{ background: '#fef3c7', padding: '1px 4px', borderRadius: '3px' }}>.env</code> fájlban.
        </div>
      )}

      {/* ── CDS Adatok ───────────────────────────────────────────────────── */}
      <SectionBox title="CDS 900.1 — Adatlekérés" icon="📊" accentColor="#bfdbfe">
        {/* Rekord választó */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{
              display: 'block', fontSize: '11px', fontWeight: '700',
              color: '#374151', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em',
            }}>
              CDS Rekord
            </label>
            <select
              value={selectedRecordId}
              onChange={handleRecordSelect}
              disabled={dataLoading}
              style={{
                width: '100%', padding: '7px 10px',
                border: '1px solid #d1d5db', borderRadius: '6px',
                fontSize: '12px', background: 'white', boxSizing: 'border-box',
              }}
            >
              <option value="">— Legújabb rekord —</option>
              {cdsList.map((r) => (
                <option key={r.record_id} value={r.record_id}>
                  {r.record_id} ({r.data_quality ?? '?'})
                </option>
              ))}
            </select>
          </div>
          {dataLoading && (
            <div style={{ fontSize: '12px', color: '#6b7280', paddingTop: '18px' }}>
              ⏳ Adatok lekérése…
            </div>
          )}
        </div>

        {/* Hibajelzés */}
        <ErrorBox error={dataError} />

        {/* Rekord meta */}
        {cdsRecord && (
          <div style={{ marginBottom: '12px' }}>
            <RecordMetaRow record={cdsRecord} />
          </div>
        )}

        {/* Primer indexek */}
        {cdsRecord && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Primer indexek
            </div>
            <PrimaryIndicesTable indices={cdsRecord.primary_indices} />
          </div>
        )}

        {/* Másodlagos indexek */}
        {cdsRecord?.secondary_indices && (
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Másodlagos indexek
            </div>
            <SecondaryIndicesTable indices={cdsRecord.secondary_indices} />
          </div>
        )}

        {!cdsRecord && !dataLoading && !dataError && (
          <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: '12px' }}>
            CDS adatok nem tölthetők be. Kattintson a Frissítés gombra.
          </div>
        )}
      </SectionBox>

      {/* ── CDP Akciók ───────────────────────────────────────────────────── */}
      <SectionBox title="CDP 900.2 — Akció Kezdeményezés" icon="⚡" accentColor="#ddd6fe">
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '10px' }}>
          {CDP_MODULE_META.description}
        </div>
        <CdpActionControls
          onSendAction={handleSendAction}
          disabled={dataLoading}
        />
      </SectionBox>

      {/* ── Rendszer info ────────────────────────────────────────────────── */}
      <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px' }}>
        {CDS_MODULE_META.id} {CDS_MODULE_META.name} v{CDS_MODULE_META.version} ·{' '}
        {CDP_MODULE_META.id} {CDP_MODULE_META.name} v{CDP_MODULE_META.version} ·{' '}
        Kapcsolódó modulok: {CDS_MODULE_META.related_modules.join(', ')}
      </div>
    </div>
  );
}
