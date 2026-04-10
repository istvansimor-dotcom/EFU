/**
 * Atrocitas600Panel.jsx — EFU 600.56 Atrocitás Potenciál (A-érték) Modell v1.2
 *
 * CFI-A: Systemic Collapse Trigger
 * Kapcsolódó modulok: 900.1 (CDS), 900.2 (CDP), 650.0 (A-Modell), 500.4 (Reziliencia)
 *
 * Sections:
 *   1. Module header + ontológiai pozíció
 *   2. Változó kalibráció — B, P, S, E, I, D, T, Φ(EFU)
 *   3. A-érték kalkulátor (multiplikatív + logaritmikus)
 *   4. Dinamikus kiterjesztés (dS/dt, dP/dt, α, β)
 *   5. Zóna + threshold táblázat
 *   6. Trigger logika (T1–T3)
 *   7. CDS kötés (CII, VKI, CFI)
 *   8. Dashboard JSON kimenet
 *
 * Reference: EFU 600.56 v1.2 (2026-03-28)
 */

import { useState, useMemo } from 'react';
import {
  MODULE_META_56,
  A_VARIABLES,
  DYNAMIC_PARAMS,
  CDS_DEFAULTS,
  A_ZONES,
  A_TRIGGERS,
} from '../data/atrocitas600_56.js';
import {
  calculateAValue,
  calculateAValueLog,
  calculateADynamic,
  classifyAZone,
  evaluateATriggers,
} from '../logic/efu-engine.js';

// ---------------------------------------------------------------------------
// Helpers
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
      <div style={{ background: '#f3f4f6', padding: '8px 14px', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#374151' }}>
        {icon} {title}
      </div>
      <div style={{ padding: '14px' }}>{children}</div>
    </div>
  );
}

function NumSlider({ label, hint, value, onChange, min, max, step, color }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
        <span style={{ fontSize: '11px', fontWeight: '700', color: '#374151' }}>{label}</span>
        <span style={{ fontSize: '12px', fontWeight: '700', color: color ?? '#1f2937', fontFamily: 'monospace' }}>
          {value.toFixed(2)}
        </span>
      </div>
      {hint && <div style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '3px' }}>{hint}</div>}
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: color ?? '#6b7280' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#9ca3af' }}>
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  );
}

function Gauge({ value, max = 3, label, color }) {
  const pct = Math.min(value / max, 1) * 100;
  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
        <span style={{ fontSize: '11px', fontWeight: '700', color: '#374151' }}>{label}</span>
        <span style={{ fontSize: '12px', fontWeight: '800', color, fontFamily: 'monospace' }}>{value.toFixed(3)}</span>
      </div>
      <div style={{ background: '#e5e7eb', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.3s' }} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 1. Module Header
// ---------------------------------------------------------------------------

function ModuleHeader({ zone }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#111827', letterSpacing: '0.02em' }}>
            EFU {MODULE_META_56.id} — {MODULE_META_56.title}
          </div>
          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '3px' }}>{MODULE_META_56.series}</div>
          <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>
            Kapcsolódó: {MODULE_META_56.related_modules.join(' · ')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <Badge color="#7c3aed">CFI-A</Badge>
          <Badge color="#16a34a">AKTÍV</Badge>
          <Badge color="#0369a1">PILOT-READY</Badge>
          {zone && <Badge color={zone.color}>{zone.label}</Badge>}
        </div>
      </div>
      <div style={{ marginTop: '10px', background: '#fef9c3', border: '1px solid #fde68a', borderRadius: '6px', padding: '8px 12px', fontSize: '11px', color: '#92400e' }}>
        <strong>Ontológiai pozíció:</strong> Az A-érték nem eseményt mér, hanem azt a valószínűségi állapotot,
        amelyben a rendszer erőszakos átcsapásra (atrocitásra) hajlamossá válik.
        A CDS (900.1) rendszerben: <em>elsődleges trigger változó</em> és az <em>immunválasz aktivátora</em>.
      </div>
      <div style={{ marginTop: '8px', background: '#f3f4f6', borderRadius: '6px', padding: '8px 12px', fontSize: '11px', color: '#374151', fontFamily: 'monospace' }}>
        {MODULE_META_56.formula}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. Variable Calibration
// ---------------------------------------------------------------------------

function VariableCalibration({ values, onChange }) {
  return (
    <SectionBox title="Változó Kalibráció" icon="⚙️" accentColor="#d1d5db">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        {A_VARIABLES.map((v) => (
          <NumSlider
            key={v.id}
            label={v.label}
            hint={v.description}
            value={values[v.id]}
            onChange={(val) => onChange(v.id, val)}
            min={v.min}
            max={v.max}
            step={v.step}
            color={v.color}
          />
        ))}
      </div>
    </SectionBox>
  );
}

// ---------------------------------------------------------------------------
// 3. A-érték Result Block
// ---------------------------------------------------------------------------

function AValueResult({ A_multi, A_log, zone }) {
  return (
    <SectionBox title="A-érték Kalkulátor" icon="📊" accentColor={zone?.color ?? '#e5e7eb'}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div style={{ background: zone?.bg ?? '#f9fafb', border: `2px solid ${zone?.color ?? '#e5e7eb'}`, borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Multiplikatív</div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: zone?.color ?? '#1f2937', fontFamily: 'monospace', lineHeight: 1.1 }}>
            {A_multi.toFixed(3)}
          </div>
          <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px' }}>A = B×P×S×E×I×(1/D)×T×Φ</div>
        </div>
        <div style={{ background: '#f0f9ff', border: '2px solid #bae6fd', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Logaritmikus stabil (CDS)</div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#0369a1', fontFamily: 'monospace', lineHeight: 1.1 }}>
            {A_log.toFixed(3)}
          </div>
          <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px' }}>A = exp(Σ w_i·log(X_i)) × (1/D)</div>
        </div>
      </div>
      {zone && (
        <div style={{ background: zone.bg, border: `1px solid ${zone.color}40`, borderRadius: '6px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>{zone.label.split(' ')[0]}</span>
          <div>
            <div style={{ fontWeight: '700', color: zone.color, fontSize: '13px' }}>{zone.state}</div>
            <div style={{ fontSize: '11px', color: '#6b7280' }}>CDS reakció: <strong>{zone.cdsReaction}</strong></div>
          </div>
        </div>
      )}
    </SectionBox>
  );
}

// ---------------------------------------------------------------------------
// 4. Dynamic Extension
// ---------------------------------------------------------------------------

function DynamicExtension({ dynParams, onChange, A_value, A_dynamic }) {
  const zone = classifyAZone(A_dynamic);
  return (
    <SectionBox title="Dinamikus Kiterjesztés" icon="⚡" accentColor="#fde68a">
      <div style={{ fontSize: '10px', color: '#9ca3af', fontFamily: 'monospace', marginBottom: '12px' }}>
        A_dynamic = A × (1 + α × dS/dt + β × dP/dt)
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '14px' }}>
        {Object.entries(DYNAMIC_PARAMS).map(([key, cfg]) => (
          <NumSlider
            key={key}
            label={cfg.label}
            hint={cfg.description}
            value={dynParams[key]}
            onChange={(val) => onChange(key, val)}
            min={cfg.min}
            max={cfg.max}
            step={cfg.step}
            color="#d97706"
          />
        ))}
      </div>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '120px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#9a3412', textTransform: 'uppercase', marginBottom: '4px' }}>A statikus</div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: '#ea580c', fontFamily: 'monospace' }}>{A_value.toFixed(3)}</div>
        </div>
        <div style={{ flex: 1, minWidth: '120px', background: zone.bg, border: `2px solid ${zone.color}`, borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: zone.color, textTransform: 'uppercase', marginBottom: '4px' }}>A_dynamic</div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: zone.color, fontFamily: 'monospace' }}>{A_dynamic.toFixed(3)}</div>
          <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '3px' }}>{zone.state}</div>
        </div>
      </div>
    </SectionBox>
  );
}

// ---------------------------------------------------------------------------
// 5. Zone Threshold Table
// ---------------------------------------------------------------------------

function ZoneTable({ currentA }) {
  return (
    <SectionBox title="Threshold Rendszer (Operatív)" icon="🎯" accentColor="#e5e7eb">
      <div style={{ border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '80px 100px 1fr 1fr', background: '#f3f4f6', padding: '6px 10px', fontSize: '10px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>
          <div>Zóna</div><div>A érték</div><div>Állapot</div><div>CDS reakció</div>
        </div>
        {A_ZONES.map((z) => {
          const isActive = classifyAZone(currentA).id === z.id;
          return (
            <div key={z.id} style={{
              display: 'grid', gridTemplateColumns: '80px 100px 1fr 1fr',
              padding: '8px 10px', borderTop: '1px solid #e5e7eb',
              background: isActive ? `${z.color}15` : 'white',
              fontWeight: isActive ? '700' : '400',
            }}>
              <div style={{ color: z.color, fontWeight: '700' }}>{z.label}</div>
              <div style={{ fontFamily: 'monospace', color: '#374151' }}>{z.condition}</div>
              <div style={{ color: '#374151' }}>{z.state}</div>
              <div style={{ color: '#6b7280' }}>{z.cdsReaction}</div>
            </div>
          );
        })}
      </div>
    </SectionBox>
  );
}

// ---------------------------------------------------------------------------
// 6. Trigger Logic
// ---------------------------------------------------------------------------

function TriggerBlock({ triggerResult }) {
  return (
    <SectionBox title="900.2 Automatikus Trigger Logika" icon="🚨" accentColor="#fecaca">
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {A_TRIGGERS.map((t) => {
          const active = triggerResult.active_triggers.includes(t.id);
          return (
            <div key={t.id} style={{
              flex: 1, minWidth: '160px', borderRadius: '8px', padding: '12px',
              border: `2px solid ${active ? t.color : '#e5e7eb'}`,
              background: active ? `${t.color}12` : '#f9fafb',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: active ? t.color : '#9ca3af' }}>{t.label}</span>
                <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '10px', background: active ? t.color : '#e5e7eb', color: active ? 'white' : '#9ca3af', fontWeight: '700' }}>
                  {active ? 'AKTÍV' : 'INAKTÍV'}
                </span>
              </div>
              <div style={{ fontSize: '10px', fontFamily: 'monospace', color: '#6b7280' }}>{t.condition}</div>
              <div style={{ fontSize: '10px', color: '#374151', marginTop: '4px' }}>→ {t.action}</div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        {[
          { label: 'Trigger szint', value: triggerResult.level, color: triggerResult.level > 0 ? '#dc2626' : '#16a34a' },
          { label: 'CDP aktiválás', value: triggerResult.cdp_activation ? '✅ IGEN' : '❌ NEM', color: triggerResult.cdp_activation ? '#16a34a' : '#6b7280' },
          { label: 'AAP szükséges', value: triggerResult.aap_required ? '⚠️ IGEN' : 'NEM', color: triggerResult.aap_required ? '#dc2626' : '#6b7280' },
        ].map((item) => (
          <div key={item.label} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.label}</div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: item.color, marginTop: '2px' }}>{item.value}</div>
          </div>
        ))}
      </div>
    </SectionBox>
  );
}

// ---------------------------------------------------------------------------
// 7. CDS Binding
// ---------------------------------------------------------------------------

function CDSBinding({ cdsValues, onChange }) {
  return (
    <SectionBox title="CDS Kötés (900.1)" icon="🔗" accentColor="#bfdbfe">
      <div style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '10px' }}>
        CII ↓ → A ↑ &nbsp;|&nbsp; VKI ↓ → P ↑ → A ↑ &nbsp;|&nbsp; CFI ↑ → S ↑ → A ↑
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        {Object.entries(CDS_DEFAULTS).map(([key, cfg]) => (
          <div key={key}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#6b7280', marginBottom: '4px' }}>
              {cfg.label} <span style={{ color: '#9ca3af', fontWeight: '400' }}>— {cfg.description}</span>
            </div>
            <input
              type="number"
              value={cdsValues[key]}
              min={cfg.min} max={cfg.max} step={cfg.step}
              onChange={(e) => onChange(key, Number(e.target.value))}
              style={{ width: '100%', padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>
        ))}
      </div>
      <div style={{ marginTop: '12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '8px 12px', fontSize: '11px', color: '#1e40af', fontFamily: 'monospace' }}>
        A ≈ k × (1 / CII<sup>α</sup>)
      </div>
    </SectionBox>
  );
}

// ---------------------------------------------------------------------------
// 8. Dashboard JSON output
// ---------------------------------------------------------------------------

function DashboardJSON({ A_value, A_dynamic, components, dynParams, cdsValues, triggerResult }) {
  const zone = classifyAZone(A_dynamic);
  const trend = A_dynamic > A_value ? 'increasing' : A_dynamic < A_value ? 'decreasing' : 'stable';

  const json = {
    module: '600.56',
    A_value: parseFloat(A_value.toFixed(3)),
    A_dynamic: parseFloat(A_dynamic.toFixed(3)),
    zone: zone.id,
    trend,
    components: {
      B: components.B, P: components.P, S: components.S,
      E: components.E, I: components.I, D: components.D,
      T: components.T, Phi_EFU: components.Phi,
    },
    derivatives: {
      dS_dt: dynParams.dS_dt,
      dP_dt: dynParams.dP_dt,
    },
    cds_binding: {
      CII: cdsValues.CII,
      VKI: cdsValues.VKI,
      CFI_total: cdsValues.CFI_total,
    },
    trigger: {
      level: triggerResult.level,
      cdp_activation: triggerResult.cdp_activation,
      aap_required: triggerResult.aap_required,
    },
  };

  return (
    <SectionBox title="Dashboard JSON Kimenet (205.3 kompatibilis)" icon="📋" accentColor="#d1d5db">
      <pre style={{
        background: '#1f2937', color: '#d1fae5', borderRadius: '6px',
        padding: '12px', fontSize: '11px', overflowX: 'auto', margin: 0,
        fontFamily: 'monospace', lineHeight: '1.5',
      }}>
        {JSON.stringify(json, null, 2)}
      </pre>
    </SectionBox>
  );
}

// ---------------------------------------------------------------------------
// Main Panel
// ---------------------------------------------------------------------------

export default function Atrocitas600Panel() {
  // Component values
  const initComponents = Object.fromEntries(A_VARIABLES.map((v) => [v.id, v.default]));
  const [components, setComponents] = useState(initComponents);

  // Dynamic params
  const initDyn = Object.fromEntries(Object.entries(DYNAMIC_PARAMS).map(([k, v]) => [k, v.default]));
  const [dynParams, setDynParams] = useState(initDyn);

  // CDS values
  const initCDS = Object.fromEntries(Object.entries(CDS_DEFAULTS).map(([k, v]) => [k, v.default]));
  const [cdsValues, setCdsValues] = useState(initCDS);

  const { A_multi, A_log, A_dynamic, zone, triggerResult } = useMemo(() => {
    const A_multi = calculateAValue(components);
    const A_log   = calculateAValueLog(components);
    const A_dyn   = calculateADynamic(A_multi, {
      alpha: dynParams.alpha,
      beta:  dynParams.beta,
      dS_dt: dynParams.dS_dt,
      dP_dt: dynParams.dP_dt,
    });
    const zone    = classifyAZone(A_multi);
    const triggerResult = evaluateATriggers(A_dyn, dynParams.dS_dt + dynParams.dP_dt);
    return { A_multi, A_log, A_dynamic: A_dyn, zone, triggerResult };
  }, [components, dynParams]);

  const handleComponent = (id, val) => setComponents((prev) => ({ ...prev, [id]: val }));
  const handleDyn       = (k, val) => setDynParams((prev) => ({ ...prev, [k]: val }));
  const handleCDS       = (k, val) => setCdsValues((prev) => ({ ...prev, [k]: val }));

  return (
    <div style={{
      background: 'white', border: `2px solid ${zone.color}`,
      borderRadius: '12px', padding: '20px', marginBottom: '20px',
    }}>
      <ModuleHeader zone={zone} />

      {/* Component gauges summary */}
      <SectionBox title="Komponens Összefoglaló" icon="📈" accentColor="#e5e7eb">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
          {A_VARIABLES.map((v) => (
            <Gauge
              key={v.id}
              label={`${v.labelShort} — ${v.description.split(' (')[0]}`}
              value={components[v.id]}
              max={v.isDampening ? 1 : 2}
              color={v.color}
            />
          ))}
        </div>
      </SectionBox>

      <VariableCalibration values={components} onChange={handleComponent} />
      <AValueResult A_multi={A_multi} A_log={A_log} zone={zone} />
      <DynamicExtension dynParams={dynParams} onChange={handleDyn} A_value={A_multi} A_dynamic={A_dynamic} />
      <ZoneTable currentA={A_multi} />
      <TriggerBlock triggerResult={triggerResult} />
      <CDSBinding cdsValues={cdsValues} onChange={handleCDS} />
      <DashboardJSON
        A_value={A_multi}
        A_dynamic={A_dynamic}
        components={components}
        dynParams={dynParams}
        cdsValues={cdsValues}
        triggerResult={triggerResult}
      />

      {/* Footer */}
      <div style={{ fontSize: '10px', color: '#9ca3af', borderTop: '1px solid #e5e7eb', paddingTop: '10px', lineHeight: '1.6' }}>
        <strong>EFU 600.56 v1.2</strong> · CFI-A Systemic Collapse Trigger · 2026-03-28 ·
        Az A-érték <em>nem politikai mutató, nem morális kategória</em>, hanem fizikai–társadalmi instabilitás előrejelző.
      </div>
    </div>
  );
}
