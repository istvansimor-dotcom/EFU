/**
 * CdpActionControls.jsx — CDP 900.2 akcióvezérlők
 *
 * Lehetővé teszi:
 *  – CDP akció kiválasztását legördülő menüből (MONITOR / NOTIFY / INTERVENE / EMERGENCY_ALLOC)
 *  – Trigger szint és forrás modul paraméter megadását
 *  – Az akció elküldését és a visszajelzés megjelenítését
 *
 * @param {Object} props
 * @param {Function} props.onSendAction - (actionRequest) => Promise<CdpActionResponse>
 * @param {boolean}  [props.disabled]  - Letiltja a vezérlőket (pl. API hívás folyamatban)
 */

import { useState } from 'react';
import { CDP_ACTIONS, CDP_TRIGGER_LEVELS } from '../data/cdp900_2.js';

// ---------------------------------------------------------------------------
// Stílus segédeszközök
// ---------------------------------------------------------------------------

const inputStyle = {
  width: '100%',
  padding: '7px 10px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '13px',
  boxSizing: 'border-box',
  background: 'white',
};

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: '700',
  color: '#374151',
  marginBottom: '4px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

function severityColor(severity) {
  const map = { INFO: '#2563eb', WARNING: '#d97706', ALERT: '#ea580c', CRITICAL: '#dc2626' };
  return map[severity] ?? '#6b7280';
}

function statusColor(status) {
  const map = { QUEUED: '#2563eb', PROCESSING: '#d97706', COMPLETED: '#16a34a', FAILED: '#dc2626' };
  return map[status] ?? '#6b7280';
}

// ---------------------------------------------------------------------------
// ActionFeedback
// ---------------------------------------------------------------------------

function ActionFeedback({ response, error }) {
  if (error) {
    return (
      <div style={{
        marginTop: '12px', padding: '10px 14px',
        background: '#fef2f2', border: '1px solid #fecaca',
        borderRadius: '6px', fontSize: '12px', color: '#dc2626',
      }}>
        <strong>⚠ Hiba:</strong> {error.message ?? error}
        {error.detail && <div style={{ marginTop: '4px', color: '#b91c1c' }}>{error.detail}</div>}
      </div>
    );
  }

  if (!response) return null;

  const statusCol = statusColor(response.status);

  return (
    <div style={{
      marginTop: '12px', padding: '10px 14px',
      background: '#f0fdf4', border: '1px solid #bbf7d0',
      borderRadius: '6px', fontSize: '12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <span style={{ fontSize: '14px' }}>{response.accepted ? '✓' : '✗'}</span>
        <strong style={{ color: response.accepted ? '#16a34a' : '#dc2626' }}>
          {response.accepted ? 'CDP Protokoll elfogadva' : 'CDP Protokoll elutasítva'}
        </strong>
        <span style={{
          marginLeft: 'auto', background: statusCol, color: 'white',
          padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: '700',
        }}>
          {response.status}
        </span>
      </div>
      <div style={{ color: '#374151' }}>{response.message}</div>
      <div style={{ marginTop: '4px', color: '#9ca3af', fontSize: '10px' }}>
        ID: {response.protocol_id} · {new Date(response.timestamp).toLocaleString('hu-HU')}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Fő komponens
// ---------------------------------------------------------------------------

export default function CdpActionControls({ onSendAction, disabled = false }) {
  const [actionId, setActionId] = useState('NOTIFY');
  const [triggerLevel, setTriggerLevel] = useState(1);
  const [sourceModule, setSourceModule] = useState('600.56');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const selectedAction = CDP_ACTIONS[actionId];
  const selectedTrigger = CDP_TRIGGER_LEVELS[triggerLevel];
  const isDisabled = disabled || loading;

  async function handleSend() {
    if (!onSendAction) return;
    setLoading(true);
    setResponse(null);
    setError(null);

    const request = {
      source_module: sourceModule,
      action_id: actionId,
      trigger_level: triggerLevel,
      payload: { manual_dispatch: true },
      timestamp: new Date().toISOString(),
    };

    try {
      const result = await onSendAction(request);
      setResponse(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Paraméter sor */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
        {/* Akció típusa */}
        <div>
          <label style={labelStyle}>CDP Akció</label>
          <select
            value={actionId}
            onChange={(e) => setActionId(e.target.value)}
            disabled={isDisabled}
            style={inputStyle}
          >
            {Object.values(CDP_ACTIONS).map((a) => (
              <option key={a.id} value={a.id}>{a.id} – {a.label}</option>
            ))}
          </select>
        </div>

        {/* Trigger szint */}
        <div>
          <label style={labelStyle}>Trigger szint</label>
          <select
            value={triggerLevel}
            onChange={(e) => setTriggerLevel(Number(e.target.value))}
            disabled={isDisabled}
            style={inputStyle}
          >
            {CDP_TRIGGER_LEVELS.map((t) => (
              <option key={t.level} value={t.level}>L{t.level} – {t.label}</option>
            ))}
          </select>
        </div>

        {/* Forrás modul */}
        <div>
          <label style={labelStyle}>Forrás modul</label>
          <select
            value={sourceModule}
            onChange={(e) => setSourceModule(e.target.value)}
            disabled={isDisabled}
            style={inputStyle}
          >
            {['600.56', '600.40-42', '600.00', 'CEWS', '600.82', '600.85'].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Kiválasztott akció leírása */}
      {selectedAction && (
        <div style={{
          padding: '8px 12px', background: '#f9fafb', border: '1px solid #e5e7eb',
          borderRadius: '6px', fontSize: '12px', marginBottom: '10px',
          display: 'flex', gap: '12px', alignItems: 'flex-start',
        }}>
          <span style={{
            display: 'inline-block', padding: '2px 8px', borderRadius: '12px',
            background: severityColor(selectedAction.severity), color: 'white',
            fontSize: '10px', fontWeight: '700', whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            {selectedAction.severity}
          </span>
          <div>
            <div style={{ fontWeight: '700', color: '#374151', marginBottom: '2px' }}>
              {selectedAction.label} ({selectedAction.labelEn})
            </div>
            <div style={{ color: '#6b7280' }}>{selectedAction.description}</div>
            {selectedTrigger && (
              <div style={{ marginTop: '4px', color: '#374151' }}>
                Feltétel: <code style={{ background: '#e5e7eb', padding: '1px 4px', borderRadius: '3px', fontSize: '11px' }}>
                  {selectedTrigger.a_condition}
                </code>
                {selectedAction.requires_ack && (
                  <span style={{ marginLeft: '8px', color: '#d97706', fontWeight: '600' }}>⚡ Manuális visszaigazolást igényel</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Küldés gomb */}
      <button
        onClick={handleSend}
        disabled={isDisabled}
        style={{
          padding: '8px 20px',
          background: isDisabled ? '#d1d5db' : severityColor(selectedAction?.severity ?? 'INFO'),
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: '700',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          transition: 'background 0.2s',
        }}
      >
        {loading ? '⏳ Küldés…' : '▶ CDP Akció Küldése'}
      </button>

      {/* Visszajelzés */}
      <ActionFeedback response={response} error={error} />
    </div>
  );
}
