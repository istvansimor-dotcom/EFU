import { describe, it, expect } from 'vitest';
import {
  // 600.10 MVP
  classifyMVPZone,
  evaluateMVPTriggers,
  calculateMVP,
  // 600.20 DEP
  classifyDEPZone,
  evaluateDEPTriggers,
  calculateDEP,
  // 600.30 HAP
  classifyHAPZone,
  evaluateHAPTriggers,
  calculateHAP,
  // 600.40-42 NDI / Narrative
  calculateKNI,
  calculateENI,
  classifyNDIZone,
  evaluateM4Triggers,
  calculateNDI,
  // 600.69 GPS / Gresham–Parasite Spiral
  classifyGPSZone,
  evaluateGPSTriggers,
  calculateGPS,
} from './efu-engine.js';

// ============================================================================
// EFU 600.10 — Monitoring és Verifikáció (MVP)
// ============================================================================

describe('classifyMVPZone', () => {
  it('returns GREEN for mvp < 0.4', () => {
    const z = classifyMVPZone(0.0);
    expect(z.id).toBe('GREEN');
    expect(z.status).toBe('WATCH');
  });

  it('returns GREEN for mvp = 0.39 (boundary – below YELLOW)', () => {
    expect(classifyMVPZone(0.39).id).toBe('GREEN');
  });

  it('returns YELLOW for mvp = 0.4 (lower YELLOW boundary)', () => {
    const z = classifyMVPZone(0.4);
    expect(z.id).toBe('YELLOW');
    expect(z.status).toBe('REVIEW');
  });

  it('returns YELLOW for mvp = 0.69', () => {
    expect(classifyMVPZone(0.69).id).toBe('YELLOW');
  });

  it('returns ORANGE for mvp = 0.7 (lower ORANGE boundary)', () => {
    const z = classifyMVPZone(0.7);
    expect(z.id).toBe('ORANGE');
    expect(z.status).toBe('HIÁNYOS');
  });

  it('returns ORANGE for mvp = 0.99', () => {
    expect(classifyMVPZone(0.99).id).toBe('ORANGE');
  });

  it('returns RED for mvp = 1.0 (lower RED boundary)', () => {
    const z = classifyMVPZone(1.0);
    expect(z.id).toBe('RED');
    expect(z.status).toBe('SBE-WATCH');
  });

  it('returns RED for mvp = 1.49', () => {
    expect(classifyMVPZone(1.49).id).toBe('RED');
  });

  it('returns CRITICAL for mvp = 1.5 (lower CRITICAL boundary)', () => {
    const z = classifyMVPZone(1.5);
    expect(z.id).toBe('CRITICAL');
    expect(z.status).toBe('AUDITÁLT');
  });

  it('returns CRITICAL for very high mvp', () => {
    expect(classifyMVPZone(5.0).id).toBe('CRITICAL');
  });

  it('every zone has color and action strings', () => {
    [0.2, 0.5, 0.8, 1.2, 1.8].forEach((v) => {
      const z = classifyMVPZone(v);
      expect(typeof z.color).toBe('string');
      expect(typeof z.action).toBe('string');
    });
  });
});

describe('evaluateMVPTriggers', () => {
  const safeVars = { L1_mol: 0.6, L2_eco: 0.5, L3_gov: 0.5, V_ind: 0.6, V_pub: 0.5, Phi: 300 };

  it('no triggers fire when all variables are healthy', () => {
    const t = evaluateMVPTriggers(0.5, safeVars);
    expect(t.active_triggers).toHaveLength(0);
    expect(t.data_gap).toBe(false);
    expect(t.independence_fail).toBe(false);
    expect(t.cews_disconnect).toBe(false);
    expect(t.system_audit).toBe(false);
  });

  it('data_gap fires when L1_mol < 0.3', () => {
    const t = evaluateMVPTriggers(0.5, { ...safeVars, L1_mol: 0.2 });
    expect(t.data_gap).toBe(true);
    expect(t.active_triggers).toContain('data_gap');
  });

  it('data_gap fires when L2_eco < 0.3', () => {
    const t = evaluateMVPTriggers(0.5, { ...safeVars, L2_eco: 0.29 });
    expect(t.data_gap).toBe(true);
  });

  it('data_gap does NOT fire when L1_mol = 0.3 exactly (boundary exclusive)', () => {
    const t = evaluateMVPTriggers(0.5, { ...safeVars, L1_mol: 0.3 });
    expect(t.data_gap).toBe(false);
  });

  it('independence_fail fires when V_ind < 0.4', () => {
    const t = evaluateMVPTriggers(0.5, { ...safeVars, V_ind: 0.39 });
    expect(t.independence_fail).toBe(true);
    expect(t.active_triggers).toContain('independence_fail');
  });

  it('independence_fail does NOT fire when V_ind = 0.4 exactly', () => {
    const t = evaluateMVPTriggers(0.5, { ...safeVars, V_ind: 0.4 });
    expect(t.independence_fail).toBe(false);
  });

  it('cews_disconnect fires when Phi < 100 AND L1_mol < 0.5', () => {
    const t = evaluateMVPTriggers(0.5, { ...safeVars, Phi: 50, L1_mol: 0.4 });
    expect(t.cews_disconnect).toBe(true);
    expect(t.active_triggers).toContain('cews_disconnect');
  });

  it('cews_disconnect fires when Phi < 100 AND L3_gov < 0.4', () => {
    const t = evaluateMVPTriggers(0.5, { ...safeVars, Phi: 50, L3_gov: 0.3 });
    expect(t.cews_disconnect).toBe(true);
  });

  it('cews_disconnect does NOT fire when Phi >= 100', () => {
    const t = evaluateMVPTriggers(0.5, { ...safeVars, Phi: 100, L1_mol: 0.1 });
    expect(t.cews_disconnect).toBe(false);
  });

  it('system_audit fires when mvp >= 1.5', () => {
    const t = evaluateMVPTriggers(1.5, safeVars);
    expect(t.system_audit).toBe(true);
    expect(t.active_triggers).toContain('system_audit');
  });

  it('system_audit fires when V_ind < 0.3 AND V_pub < 0.3', () => {
    const t = evaluateMVPTriggers(0.5, { ...safeVars, V_ind: 0.2, V_pub: 0.2 });
    expect(t.system_audit).toBe(true);
  });

  it('system_audit does NOT fire when only one condition is met', () => {
    const t = evaluateMVPTriggers(0.5, { ...safeVars, V_ind: 0.2, V_pub: 0.3 });
    expect(t.system_audit).toBe(false);
  });

  it('returns active_triggers as an array', () => {
    const t = evaluateMVPTriggers(0.5, safeVars);
    expect(Array.isArray(t.active_triggers)).toBe(true);
  });
});

describe('calculateMVP', () => {
  it('returns expected structure', () => {
    const r = calculateMVP();
    expect(typeof r.mvp_index).toBe('number');
    expect(typeof r.zone).toBe('object');
    expect(typeof r.triggers).toBe('object');
    expect(typeof r.variable_contributions).toBe('object');
    expect(typeof r.diagnostics).toBe('object');
    expect(typeof r.variables).toBe('object');
  });

  it('uses defaults when no inputs provided', () => {
    // base = 0.6*0.30 + 0.5*0.30 + 0.45*0.25 + 0.6*0.05 + 0.65*0.05 + 0.5*0.05 = 0.53
    // phi_effect = 1 + 200/1000 = 1.2
    // mvp = 0.53 * 1.1 * 1.2 = 0.6996
    const r = calculateMVP();
    expect(r.mvp_index).toBeCloseTo(0.6996, 3);
    expect(r.zone.id).toBe('YELLOW');
  });

  it('calculates correct mvp with specific inputs', () => {
    // All monitoring at 1.0, verification at 1.0, S=1, Phi=0
    // base = 1*0.30 + 1*0.30 + 1*0.25 + 1*0.05 + 1*0.05 + 1*0.05 = 1.0
    // phi_effect = 1, mvp = 1.0 * 1 * 1 = 1.0
    const r = calculateMVP({ L1_mol: 1, L2_eco: 1, L3_gov: 1, V_ind: 1, V_rep: 1, V_pub: 1, S: 1, Phi: 0 });
    expect(r.mvp_index).toBeCloseTo(1.0, 4);
    expect(r.zone.id).toBe('RED');
  });

  it('mvp = 0 when all inputs are zero', () => {
    const r = calculateMVP({ L1_mol: 0, L2_eco: 0, L3_gov: 0, V_ind: 0, V_rep: 0, V_pub: 0, S: 1, Phi: 0 });
    expect(r.mvp_index).toBe(0);
    expect(r.zone.id).toBe('GREEN');
  });

  it('Phi amplifies the index', () => {
    const low  = calculateMVP({ L1_mol: 0.5, L2_eco: 0.5, L3_gov: 0.5, V_ind: 0.5, V_rep: 0.5, V_pub: 0.5, S: 1, Phi: 0 });
    const high = calculateMVP({ L1_mol: 0.5, L2_eco: 0.5, L3_gov: 0.5, V_ind: 0.5, V_rep: 0.5, V_pub: 0.5, S: 1, Phi: 500 });
    expect(high.mvp_index).toBeGreaterThan(low.mvp_index);
  });

  it('synergy S amplifies the index', () => {
    const low  = calculateMVP({ L1_mol: 0.5, L2_eco: 0.5, L3_gov: 0.5, V_ind: 0.5, V_rep: 0.5, V_pub: 0.5, S: 1.0, Phi: 0 });
    const high = calculateMVP({ L1_mol: 0.5, L2_eco: 0.5, L3_gov: 0.5, V_ind: 0.5, V_rep: 0.5, V_pub: 0.5, S: 1.5, Phi: 0 });
    expect(high.mvp_index / low.mvp_index).toBeCloseTo(1.5, 4);
  });

  it('variable_contributions sum equals diagnostics.base_index', () => {
    const r = calculateMVP({ L1_mol: 0.4, L2_eco: 0.6, L3_gov: 0.5, V_ind: 0.7, V_rep: 0.8, V_pub: 0.6, S: 1.0, Phi: 0 });
    const contribSum = Object.values(r.variable_contributions).reduce((a, b) => a + b, 0);
    expect(contribSum).toBeCloseTo(r.diagnostics.base_index, 3);
  });

  it('confidence is 1.0 when all inputs are provided', () => {
    const r = calculateMVP({ L1_mol: 0.5, L2_eco: 0.5, L3_gov: 0.5, V_ind: 0.5, V_rep: 0.5, V_pub: 0.5, S: 1.0, Phi: 0 });
    expect(r.diagnostics.confidence).toBe(1);
    expect(r.diagnostics.missing_inputs).toHaveLength(0);
  });

  it('confidence < 1.0 when inputs are missing (defaults used)', () => {
    const r = calculateMVP();
    expect(r.diagnostics.confidence).toBeLessThan(1);
    expect(r.diagnostics.missing_inputs.length).toBeGreaterThan(0);
  });

  it('triggers are included in result and data_gap fires for low L1_mol', () => {
    const r = calculateMVP({ L1_mol: 0.1, L2_eco: 0.5, L3_gov: 0.5, V_ind: 0.5, V_rep: 0.5, V_pub: 0.5, S: 1, Phi: 200 });
    expect(r.triggers.data_gap).toBe(true);
    expect(r.triggers.active_triggers).toContain('data_gap');
  });

  it('mvp_index is a rounded number (4 decimal places max)', () => {
    const r = calculateMVP();
    const decimals = (r.mvp_index.toString().split('.')[1] || '').length;
    expect(decimals).toBeLessThanOrEqual(4);
  });
});

// ============================================================================
// EFU 600.20 — Szórakoztatóipar Dopamin Extrakció (DEP)
// ============================================================================

describe('classifyDEPZone', () => {
  it('returns GREEN for dep < 0.3', () => {
    const z = classifyDEPZone(0.0);
    expect(z.id).toBe('GREEN');
    expect(z.status).toBe('STABLE');
  });

  it('returns GREEN for dep = 0.29', () => {
    expect(classifyDEPZone(0.29).id).toBe('GREEN');
  });

  it('returns YELLOW for dep = 0.3 (lower YELLOW boundary)', () => {
    const z = classifyDEPZone(0.3);
    expect(z.id).toBe('YELLOW');
    expect(z.status).toBe('MONITOR');
  });

  it('returns YELLOW for dep = 0.59', () => {
    expect(classifyDEPZone(0.59).id).toBe('YELLOW');
  });

  it('returns ORANGE for dep = 0.6 (lower ORANGE boundary)', () => {
    const z = classifyDEPZone(0.6);
    expect(z.id).toBe('ORANGE');
    expect(z.status).toBe('ADDIKCIÓ RIZIKÓ');
  });

  it('returns ORANGE for dep = 0.99', () => {
    expect(classifyDEPZone(0.99).id).toBe('ORANGE');
  });

  it('returns RED for dep = 1.0 (lower RED boundary)', () => {
    const z = classifyDEPZone(1.0);
    expect(z.id).toBe('RED');
    expect(z.status).toBe('KARANTÉN');
  });

  it('returns RED for dep = 1.49', () => {
    expect(classifyDEPZone(1.49).id).toBe('RED');
  });

  it('returns CRITICAL for dep = 1.5 (lower CRITICAL boundary)', () => {
    const z = classifyDEPZone(1.5);
    expect(z.id).toBe('CRITICAL');
    expect(z.status).toBe('SYSTEMIC');
  });

  it('every zone has color and action strings', () => {
    [0.1, 0.4, 0.8, 1.2, 2.0].forEach((v) => {
      const z = classifyDEPZone(v);
      expect(typeof z.color).toBe('string');
      expect(typeof z.action).toBe('string');
    });
  });
});

describe('evaluateDEPTriggers', () => {
  const safeVars = { G_gambling: 0.3, L_lootbox: 0.3, B_binge: 0.3, D_doom: 0.3, HMI_loss: 2.0, R_future: 0.7 };

  it('no triggers fire when all variables are safe', () => {
    const t = evaluateDEPTriggers(0.3, safeVars);
    expect(t.active_triggers).toHaveLength(0);
    expect(t.gambling_karantén).toBe(false);
    expect(t.lootbox_children).toBe(false);
    expect(t.addiction_cascade).toBe(false);
    expect(t.fire_chief).toBe(false);
  });

  it('gambling_karantén fires when G_gambling > 0.6 AND HMI_loss > 3.5', () => {
    const t = evaluateDEPTriggers(0.5, { ...safeVars, G_gambling: 0.7, HMI_loss: 4.0 });
    expect(t.gambling_karantén).toBe(true);
    expect(t.active_triggers).toContain('gambling_karantén');
  });

  it('gambling_karantén does NOT fire when G_gambling = 0.6 exactly (exclusive)', () => {
    const t = evaluateDEPTriggers(0.5, { ...safeVars, G_gambling: 0.6, HMI_loss: 4.0 });
    expect(t.gambling_karantén).toBe(false);
  });

  it('gambling_karantén does NOT fire when HMI_loss <= 3.5', () => {
    const t = evaluateDEPTriggers(0.5, { ...safeVars, G_gambling: 0.8, HMI_loss: 3.5 });
    expect(t.gambling_karantén).toBe(false);
  });

  it('lootbox_children fires when L_lootbox > 0.5', () => {
    const t = evaluateDEPTriggers(0.5, { ...safeVars, L_lootbox: 0.6 });
    expect(t.lootbox_children).toBe(true);
    expect(t.active_triggers).toContain('lootbox_children');
  });

  it('lootbox_children does NOT fire when L_lootbox = 0.5 exactly', () => {
    const t = evaluateDEPTriggers(0.5, { ...safeVars, L_lootbox: 0.5 });
    expect(t.lootbox_children).toBe(false);
  });

  it('addiction_cascade fires when (G_gambling + D_doom) > 1.0 AND R_future < 0.3', () => {
    const t = evaluateDEPTriggers(0.5, { ...safeVars, G_gambling: 0.7, D_doom: 0.4, R_future: 0.2 });
    expect(t.addiction_cascade).toBe(true);
    expect(t.active_triggers).toContain('addiction_cascade');
  });

  it('addiction_cascade does NOT fire when R_future = 0.3 exactly', () => {
    const t = evaluateDEPTriggers(0.5, { ...safeVars, G_gambling: 0.7, D_doom: 0.4, R_future: 0.3 });
    expect(t.addiction_cascade).toBe(false);
  });

  it('addiction_cascade does NOT fire when sum <= 1.0', () => {
    const t = evaluateDEPTriggers(0.5, { ...safeVars, G_gambling: 0.5, D_doom: 0.5, R_future: 0.1 });
    expect(t.addiction_cascade).toBe(false);
  });

  it('fire_chief fires when dep >= 1.5', () => {
    const t = evaluateDEPTriggers(1.5, safeVars);
    expect(t.fire_chief).toBe(true);
    expect(t.active_triggers).toContain('fire_chief');
  });

  it('fire_chief fires when HMI_loss >= 8.0 AND R_future < 0.2', () => {
    const t = evaluateDEPTriggers(0.5, { ...safeVars, HMI_loss: 8.0, R_future: 0.1 });
    expect(t.fire_chief).toBe(true);
  });

  it('fire_chief does NOT fire when dep = 1.49 and other conditions not met', () => {
    const t = evaluateDEPTriggers(1.49, safeVars);
    expect(t.fire_chief).toBe(false);
  });
});

describe('calculateDEP', () => {
  it('returns expected structure', () => {
    const r = calculateDEP();
    expect(typeof r.dep_index).toBe('number');
    expect(typeof r.zone).toBe('object');
    expect(typeof r.triggers).toBe('object');
    expect(typeof r.variable_contributions).toBe('object');
    expect(typeof r.diagnostics).toBe('object');
  });

  it('uses defaults and produces RED zone result', () => {
    // base = 0.65*0.30 + 0.55*0.25 + 0.50*0.15 + 0.60*0.20 + (4.5/10)*0.10
    //      = 0.195 + 0.1375 + 0.075 + 0.12 + 0.045 = 0.5725
    // r_future_factor = 1 + (1-0.35)*0.5 = 1.325
    // phi_effect = 1 + 300/1000 = 1.3
    // dep = 0.5725 * 1.325 * 1.15 * 1.3 ≈ 1.1336
    const r = calculateDEP();
    expect(r.dep_index).toBeGreaterThan(1.0);
    expect(r.dep_index).toBeLessThan(1.5);
    expect(r.zone.id).toBe('RED');
  });

  it('calculates correct dep with specific inputs (known values)', () => {
    // G=0.5, L=0.5, B=0.5, D=0.5, HMI=5, R_future=0.5, S=1, Phi=0
    // base = 0.5*0.30 + 0.5*0.25 + 0.5*0.15 + 0.5*0.20 + (5/10)*0.10
    //      = 0.15 + 0.125 + 0.075 + 0.10 + 0.05 = 0.50
    // r_future_factor = 1 + (1-0.5)*0.5 = 1.25
    // phi_effect = 1
    // dep = 0.50 * 1.25 * 1 * 1 = 0.625
    const r = calculateDEP({ G_gambling: 0.5, L_lootbox: 0.5, B_binge: 0.5, D_doom: 0.5, HMI_loss: 5, R_future: 0.5, S: 1, Phi: 0 });
    expect(r.dep_index).toBeCloseTo(0.625, 3);
    expect(r.zone.id).toBe('ORANGE');
  });

  it('dep = 0 when all harm variables are zero with R_future = 1', () => {
    // base = 0, r_future_factor = 1 + 0 = 1, dep = 0
    const r = calculateDEP({ G_gambling: 0, L_lootbox: 0, B_binge: 0, D_doom: 0, HMI_loss: 0, R_future: 1, S: 1, Phi: 0 });
    expect(r.dep_index).toBe(0);
    expect(r.zone.id).toBe('GREEN');
  });

  it('lower R_future increases dep (transcendental time-horizon distortion)', () => {
    const high = calculateDEP({ G_gambling: 0.5, L_lootbox: 0.5, B_binge: 0.5, D_doom: 0.5, HMI_loss: 5, R_future: 0.8, S: 1, Phi: 0 });
    const low  = calculateDEP({ G_gambling: 0.5, L_lootbox: 0.5, B_binge: 0.5, D_doom: 0.5, HMI_loss: 5, R_future: 0.1, S: 1, Phi: 0 });
    expect(low.dep_index).toBeGreaterThan(high.dep_index);
  });

  it('Phi amplifies the index', () => {
    const noPhi  = calculateDEP({ G_gambling: 0.5, L_lootbox: 0.5, B_binge: 0.5, D_doom: 0.5, HMI_loss: 3, R_future: 0.5, S: 1, Phi: 0 });
    const highPhi = calculateDEP({ G_gambling: 0.5, L_lootbox: 0.5, B_binge: 0.5, D_doom: 0.5, HMI_loss: 3, R_future: 0.5, S: 1, Phi: 500 });
    expect(highPhi.dep_index).toBeGreaterThan(noPhi.dep_index);
  });

  it('diagnostics.r_future_factor is correct', () => {
    const r = calculateDEP({ G_gambling: 0.5, L_lootbox: 0.5, B_binge: 0.5, D_doom: 0.5, HMI_loss: 5, R_future: 0.5, S: 1, Phi: 0 });
    // r_future_factor = 1 + (1 - 0.5) * 0.5 = 1.25
    expect(r.diagnostics.r_future_factor).toBeCloseTo(1.25, 4);
  });

  it('gambling_karantén and lootbox_children triggers fire with default values', () => {
    const r = calculateDEP();
    expect(r.triggers.gambling_karantén).toBe(true);
    expect(r.triggers.lootbox_children).toBe(true);
  });

  it('confidence is 1.0 when all inputs provided', () => {
    const r = calculateDEP({ G_gambling: 0.5, L_lootbox: 0.5, B_binge: 0.5, D_doom: 0.5, HMI_loss: 3, R_future: 0.5, S: 1, Phi: 0 });
    expect(r.diagnostics.confidence).toBe(1);
    expect(r.diagnostics.missing_inputs).toHaveLength(0);
  });

  it('dep_index is rounded to at most 4 decimal places', () => {
    const r = calculateDEP();
    const decimals = (r.dep_index.toString().split('.')[1] || '').length;
    expect(decimals).toBeLessThanOrEqual(4);
  });
});

// ============================================================================
// EFU 600.30 — Hobbi Állattartás és Vadászati Parazitizmus (HAP)
// ============================================================================

describe('classifyHAPZone', () => {
  it('returns GREEN for hap < 0.8', () => {
    const z = classifyHAPZone(0.0);
    expect(z.id).toBe('GREEN');
    expect(z.status).toBe('WATCH');
  });

  it('returns GREEN for hap = 0.79', () => {
    expect(classifyHAPZone(0.79).id).toBe('GREEN');
  });

  it('returns YELLOW for hap = 0.8 (lower YELLOW boundary)', () => {
    const z = classifyHAPZone(0.8);
    expect(z.id).toBe('YELLOW');
    expect(z.status).toBe('STRUKTURÁLIS');
  });

  it('returns YELLOW for hap = 1.49', () => {
    expect(classifyHAPZone(1.49).id).toBe('YELLOW');
  });

  it('returns ORANGE for hap = 1.5 (lower ORANGE boundary)', () => {
    const z = classifyHAPZone(1.5);
    expect(z.id).toBe('ORANGE');
    expect(z.status).toBe('CONFIRMED');
  });

  it('returns ORANGE for hap = 2.99', () => {
    expect(classifyHAPZone(2.99).id).toBe('ORANGE');
  });

  it('returns RED for hap = 3.0 (lower RED boundary)', () => {
    const z = classifyHAPZone(3.0);
    expect(z.id).toBe('RED');
    expect(z.status).toBe('KARANTÉN');
  });

  it('returns RED for hap = 5.99', () => {
    expect(classifyHAPZone(5.99).id).toBe('RED');
  });

  it('returns CRITICAL for hap = 6.0 (lower CRITICAL boundary)', () => {
    const z = classifyHAPZone(6.0);
    expect(z.id).toBe('CRITICAL');
    expect(z.status).toBe('FIRE CHIEF');
  });

  it('every zone has multiplier, color, and action', () => {
    [0.5, 1.0, 2.0, 4.0, 7.0].forEach((v) => {
      const z = classifyHAPZone(v);
      expect(typeof z.multiplier).toBe('number');
      expect(typeof z.color).toBe('string');
      expect(typeof z.action).toBe('string');
    });
  });
});

describe('evaluateHAPTriggers', () => {
  const safeVars = { L1: 0.3, L2: 0.3, L3: 0.2, L4: 0.2, L5: 0.3, L6: 0.2, Phi: 100 };

  it('no triggers fire when all variables are safe', () => {
    const t = evaluateHAPTriggers(0.5, safeVars);
    expect(t.active_triggers).toHaveLength(0);
    expect(t.unintentional_harm).toBe(false);
    expect(t.black_layer).toBe(false);
    expect(t.invasion_alert).toBe(false);
    expect(t.fire_chief).toBe(false);
  });

  it('unintentional_harm fires when L1 > 0.5 (cat impact)', () => {
    const t = evaluateHAPTriggers(0.5, { ...safeVars, L1: 0.6 });
    expect(t.unintentional_harm).toBe(true);
    expect(t.active_triggers).toContain('UNINTENTIONAL_HARM');
  });

  it('unintentional_harm fires when L2 > 0.45 (legal sector)', () => {
    const t = evaluateHAPTriggers(0.5, { ...safeVars, L2: 0.5 });
    expect(t.unintentional_harm).toBe(true);
  });

  it('unintentional_harm does NOT fire when L1 = 0.5 and L2 = 0.45 (boundaries exclusive)', () => {
    const t = evaluateHAPTriggers(0.5, { ...safeVars, L1: 0.5, L2: 0.45 });
    expect(t.unintentional_harm).toBe(false);
  });

  it('black_layer fires when L4 > 0.5 (wildlife trafficking)', () => {
    const t = evaluateHAPTriggers(0.5, { ...safeVars, L4: 0.6 });
    expect(t.black_layer).toBe(true);
    expect(t.active_triggers).toContain('BLACK_LAYER');
  });

  it('black_layer fires when Phi > 400', () => {
    const t = evaluateHAPTriggers(0.5, { ...safeVars, Phi: 401 });
    expect(t.black_layer).toBe(true);
  });

  it('black_layer does NOT fire when L4 = 0.5 and Phi = 400 (boundaries exclusive)', () => {
    const t = evaluateHAPTriggers(0.5, { ...safeVars, L4: 0.5, Phi: 400 });
    expect(t.black_layer).toBe(false);
  });

  it('invasion_alert fires when L6 > 0.4 AND L3 > 0.3', () => {
    const t = evaluateHAPTriggers(0.5, { ...safeVars, L6: 0.5, L3: 0.4 });
    expect(t.invasion_alert).toBe(true);
    expect(t.active_triggers).toContain('INVASION_ALERT');
  });

  it('invasion_alert fires when L6 > 0.4 AND L5 > 0.4', () => {
    const t = evaluateHAPTriggers(0.5, { ...safeVars, L6: 0.5, L5: 0.5 });
    expect(t.invasion_alert).toBe(true);
  });

  it('invasion_alert does NOT fire when L6 <= 0.4', () => {
    const t = evaluateHAPTriggers(0.5, { ...safeVars, L6: 0.4, L3: 0.5, L5: 0.5 });
    expect(t.invasion_alert).toBe(false);
  });

  it('fire_chief fires when hap > 5.0', () => {
    const t = evaluateHAPTriggers(5.1, safeVars);
    expect(t.fire_chief).toBe(true);
    expect(t.active_triggers).toContain('FIRE_CHIEF');
  });

  it('fire_chief fires when L4 > 0.7 (severe trafficking)', () => {
    const t = evaluateHAPTriggers(0.5, { ...safeVars, L4: 0.8 });
    expect(t.fire_chief).toBe(true);
  });

  it('fire_chief fires when Phi > 600', () => {
    const t = evaluateHAPTriggers(0.5, { ...safeVars, Phi: 601 });
    expect(t.fire_chief).toBe(true);
  });

  it('fire_chief does NOT fire when hap = 5.0 exactly', () => {
    const t = evaluateHAPTriggers(5.0, safeVars);
    expect(t.fire_chief).toBe(false);
  });
});

describe('calculateHAP', () => {
  it('returns expected structure', () => {
    const r = calculateHAP();
    expect(typeof r.hap_index).toBe('number');
    expect(typeof r.zone).toBe('object');
    expect(typeof r.triggers).toBe('object');
    expect(typeof r.layer_contributions).toBe('object');
    expect(typeof r.diagnostics).toBe('object');
    expect(typeof r.variables).toBe('object');
  });

  it('uses defaults and produces GREEN zone result', () => {
    // base = 0.55*0.25 + 0.45*0.15 + 0.40*0.20 + 0.35*0.20 + 0.40*0.12 + 0.30*0.08
    //      = 0.1375 + 0.0675 + 0.08 + 0.07 + 0.048 + 0.024 = 0.427
    // phi_effect = 1 + 150/1000 = 1.15
    // hap = 0.427 * 1.1 * 1.15 ≈ 0.54017
    const r = calculateHAP();
    expect(r.hap_index).toBeCloseTo(0.5402, 3);
    expect(r.zone.id).toBe('GREEN');
  });

  it('calculates correct hap with known inputs', () => {
    // All layers = 1.0, S=1, Phi=0
    // base = 1*0.25 + 1*0.15 + 1*0.20 + 1*0.20 + 1*0.12 + 1*0.08 = 1.0
    // phi_effect = 1, hap = 1.0 * 1 * 1 = 1.0
    const r = calculateHAP({ L1: 1, L2: 1, L3: 1, L4: 1, L5: 1, L6: 1, S: 1, Phi: 0 });
    expect(r.hap_index).toBeCloseTo(1.0, 4);
    expect(r.zone.id).toBe('YELLOW');
  });

  it('hap = 0 when all layers are zero', () => {
    const r = calculateHAP({ L1: 0, L2: 0, L3: 0, L4: 0, L5: 0, L6: 0, S: 1, Phi: 0 });
    expect(r.hap_index).toBe(0);
    expect(r.zone.id).toBe('GREEN');
  });

  it('high wildlife trafficking (L4) pushes well above GREEN zone', () => {
    // base = 0.8*0.25+0.7*0.15+0.8*0.20+0.9*0.20+0.7*0.12+0.6*0.08 = 0.777
    // phi_effect = 1.3, hap = 0.777 * 1.3 * 1.3 ≈ 1.3131 → YELLOW
    const r = calculateHAP({ L1: 0.8, L2: 0.7, L3: 0.8, L4: 0.9, L5: 0.7, L6: 0.6, S: 1.3, Phi: 300 });
    expect(r.hap_index).toBeCloseTo(1.3131, 3);
    expect(r.hap_index).toBeGreaterThan(0.8);
    expect(['YELLOW', 'ORANGE', 'RED', 'CRITICAL']).toContain(r.zone.id);
  });

  it('unintentional_harm trigger fires with default values (L1 = 0.55 > 0.5)', () => {
    const r = calculateHAP();
    expect(r.triggers.unintentional_harm).toBe(true);
  });

  it('layer_contributions keys match expected layers', () => {
    const r = calculateHAP();
    ['L1', 'L2', 'L3', 'L4', 'L5', 'L6'].forEach((k) => {
      expect(k in r.layer_contributions).toBe(true);
    });
  });

  it('layer_contributions sum equals diagnostics.base_index', () => {
    const r = calculateHAP({ L1: 0.6, L2: 0.4, L3: 0.5, L4: 0.3, L5: 0.4, L6: 0.2, S: 1, Phi: 0 });
    const contribSum = Object.values(r.layer_contributions).reduce((a, b) => a + b, 0);
    expect(contribSum).toBeCloseTo(r.diagnostics.base_index, 3);
  });

  it('Phi amplifies the index', () => {
    const low  = calculateHAP({ L1: 0.5, L2: 0.5, L3: 0.5, L4: 0.5, L5: 0.5, L6: 0.5, S: 1, Phi: 0 });
    const high = calculateHAP({ L1: 0.5, L2: 0.5, L3: 0.5, L4: 0.5, L5: 0.5, L6: 0.5, S: 1, Phi: 500 });
    expect(high.hap_index).toBeGreaterThan(low.hap_index);
    expect(high.hap_index / low.hap_index).toBeCloseTo(1.5, 4);
  });

  it('fire_chief trigger fires when Phi > 600', () => {
    const r = calculateHAP({ L1: 0.5, L2: 0.5, L3: 0.5, L4: 0.5, L5: 0.5, L6: 0.5, S: 1, Phi: 700 });
    expect(r.triggers.fire_chief).toBe(true);
    expect(r.triggers.active_triggers).toContain('FIRE_CHIEF');
  });

  it('confidence is 1.0 when all inputs provided', () => {
    const r = calculateHAP({ L1: 0.5, L2: 0.5, L3: 0.5, L4: 0.5, L5: 0.5, L6: 0.5, S: 1, Phi: 0 });
    expect(r.diagnostics.confidence).toBe(1);
    expect(r.diagnostics.missing_inputs).toHaveLength(0);
  });

  it('confidence < 1.0 when inputs missing (defaults used)', () => {
    const r = calculateHAP();
    expect(r.diagnostics.confidence).toBeLessThan(1);
  });

  it('hap_index is rounded to at most 4 decimal places', () => {
    const r = calculateHAP();
    const decimals = (r.hap_index.toString().split('.')[1] || '').length;
    expect(decimals).toBeLessThanOrEqual(4);
  });
});

// ============================================================================
// EFU 600.41 — Kognitív Narratíva Index (KNI)
// KNI = (C/10) × (F/20) × (1 - R) × T
// ============================================================================

describe('calculateKNI', () => {
  it('returns 0 when C = 0', () => {
    expect(calculateKNI({ C: 0, F: 10, R: 0, T: 1 })).toBe(0);
  });

  it('returns 0 when F = 0', () => {
    expect(calculateKNI({ C: 5, F: 0, R: 0, T: 1 })).toBe(0);
  });

  it('returns 0 when T = 0', () => {
    expect(calculateKNI({ C: 5, F: 10, R: 0, T: 0 })).toBe(0);
  });

  it('returns 0 when R = 1 (full resilience)', () => {
    expect(calculateKNI({ C: 5, F: 10, R: 1, T: 1 })).toBe(0);
  });

  it('calculates correct KNI with known values', () => {
    // C_norm = 5/10 = 0.5, F_norm = 10/20 = 0.5, (1-R) = 0.4, T = 0.8
    // KNI = 0.5 × 0.5 × 0.4 × 0.8 = 0.08
    expect(calculateKNI({ C: 5, F: 10, R: 0.6, T: 0.8 })).toBeCloseTo(0.08, 10);
  });

  it('higher R (resilience) reduces KNI', () => {
    const low  = calculateKNI({ C: 5, F: 10, R: 0.2, T: 0.8 });
    const high = calculateKNI({ C: 5, F: 10, R: 0.8, T: 0.8 });
    expect(low).toBeGreaterThan(high);
  });

  it('KNI scales linearly with C', () => {
    const a = calculateKNI({ C: 2, F: 10, R: 0.0, T: 1 });
    const b = calculateKNI({ C: 4, F: 10, R: 0.0, T: 1 });
    expect(b / a).toBeCloseTo(2, 5);
  });

  it('KNI scales linearly with T', () => {
    const a = calculateKNI({ C: 5, F: 10, R: 0.0, T: 0.5 });
    const b = calculateKNI({ C: 5, F: 10, R: 0.0, T: 1.0 });
    expect(b / a).toBeCloseTo(2, 5);
  });
});

// ============================================================================
// EFU 600.42 — Érzelmi Narratíva Index (ENI)
// ENI = E × (P/0.5) × (D/30) × S
// ============================================================================

describe('calculateENI', () => {
  it('returns 0 when E = 0', () => {
    expect(calculateENI({ E: 0, P: 0.3, D: 20, S: 1 })).toBe(0);
  });

  it('returns 0 when P = 0', () => {
    expect(calculateENI({ E: 0.5, P: 0, D: 20, S: 1 })).toBe(0);
  });

  it('returns 0 when D = 0', () => {
    expect(calculateENI({ E: 0.5, P: 0.3, D: 0, S: 1 })).toBe(0);
  });

  it('calculates correct ENI with known values', () => {
    // E=0.5, P_norm=0.4/0.5=0.8, D_norm=15/30=0.5, S=1.2
    // ENI = 0.5 × 0.8 × 0.5 × 1.2 = 0.24
    expect(calculateENI({ E: 0.5, P: 0.4, D: 15, S: 1.2 })).toBeCloseTo(0.24, 10);
  });

  it('synergy S amplifies ENI', () => {
    const base   = calculateENI({ E: 0.5, P: 0.3, D: 15, S: 1.0 });
    const higher = calculateENI({ E: 0.5, P: 0.3, D: 15, S: 1.5 });
    expect(higher / base).toBeCloseTo(1.5, 5);
  });

  it('ENI scales linearly with E', () => {
    const a = calculateENI({ E: 0.3, P: 0.3, D: 15, S: 1 });
    const b = calculateENI({ E: 0.6, P: 0.3, D: 15, S: 1 });
    expect(b / a).toBeCloseTo(2, 5);
  });
});

// ============================================================================
// EFU 600.40 — classifyNDIZone
// GREEN ≤0.8 < YELLOW ≤1.8 < ORANGE ≤3.5 < RED ≤7.0 < CRITICAL
// ============================================================================

describe('classifyNDIZone', () => {
  it('returns GREEN for ndi = 0 (zero degradation)', () => {
    const z = classifyNDIZone(0);
    expect(z.id).toBe('GREEN');
    expect(z.m4_status).toBe('M4.STABLE');
    expect(z.multiplier).toBe(1.0);
  });

  it('returns GREEN for ndi = 0.8 (upper GREEN boundary)', () => {
    expect(classifyNDIZone(0.8).id).toBe('GREEN');
  });

  it('returns YELLOW for ndi just above 0.8', () => {
    const z = classifyNDIZone(0.81);
    expect(z.id).toBe('YELLOW');
    expect(z.m4_status).toBe('M4.DEGRADED');
    expect(z.multiplier).toBe(1.2);
  });

  it('returns YELLOW for ndi = 1.8 (upper YELLOW boundary)', () => {
    expect(classifyNDIZone(1.8).id).toBe('YELLOW');
  });

  it('returns ORANGE for ndi just above 1.8', () => {
    const z = classifyNDIZone(1.81);
    expect(z.id).toBe('ORANGE');
    expect(z.m4_status).toBe('M4.FRAGMENTED');
    expect(z.multiplier).toBe(1.5);
  });

  it('returns ORANGE for ndi = 3.5 (upper ORANGE boundary)', () => {
    expect(classifyNDIZone(3.5).id).toBe('ORANGE');
  });

  it('returns RED for ndi just above 3.5', () => {
    const z = classifyNDIZone(3.51);
    expect(z.id).toBe('RED');
    expect(z.m4_status).toBe('M4.POLARIZED');
    expect(z.multiplier).toBe(2.0);
  });

  it('returns RED for ndi = 7.0 (upper RED boundary)', () => {
    expect(classifyNDIZone(7.0).id).toBe('RED');
  });

  it('returns CRITICAL for ndi just above 7.0', () => {
    const z = classifyNDIZone(7.01);
    expect(z.id).toBe('CRITICAL');
    expect(z.m4_status).toBe('M4.COLLAPSED');
    expect(z.multiplier).toBe(3.0);
  });

  it('returns CRITICAL for very high ndi', () => {
    expect(classifyNDIZone(100).id).toBe('CRITICAL');
  });

  it('each zone has color and action strings', () => {
    [0.4, 1.0, 2.5, 5.0, 10].forEach((v) => {
      const z = classifyNDIZone(v);
      expect(typeof z.color).toBe('string');
      expect(typeof z.action).toBe('string');
    });
  });
});

// ============================================================================
// EFU 600.40 — evaluateM4Triggers
// m4_amber: ndi > 1.8 || E > 0.7
// m4_red:   ndi > 3.5 && (C > 5 || F > 10)
// narrative_emergency: Phi > 500 || N < 0.4
// rapid_polarization: P > 0.3 && D > 15
// ============================================================================

describe('evaluateM4Triggers', () => {
  const safe = { N: 0.75, C: 3, E: 0.4, F: 4, P: 0.1, D: 5, Phi: 200 };

  it('no triggers fire when everything is healthy', () => {
    const t = evaluateM4Triggers(0.5, safe);
    expect(t.active_triggers).toHaveLength(0);
    expect(t.m4_amber).toBe(false);
    expect(t.m4_red).toBe(false);
    expect(t.narrative_emergency).toBe(false);
    expect(t.rapid_polarization).toBe(false);
  });

  it('m4_amber fires when ndi > 1.8', () => {
    const t = evaluateM4Triggers(1.81, safe);
    expect(t.m4_amber).toBe(true);
    expect(t.active_triggers).toContain('M4_AMBER');
  });

  it('m4_amber fires when E > 0.7 even with low ndi', () => {
    const t = evaluateM4Triggers(0.5, { ...safe, E: 0.71 });
    expect(t.m4_amber).toBe(true);
    expect(t.active_triggers).toContain('M4_AMBER');
  });

  it('m4_amber does NOT fire when ndi = 1.8 exactly and E <= 0.7', () => {
    const t = evaluateM4Triggers(1.8, { ...safe, E: 0.7 });
    expect(t.m4_amber).toBe(false);
  });

  it('m4_red fires when ndi > 3.5 AND C > 5', () => {
    const t = evaluateM4Triggers(3.51, { ...safe, C: 6 });
    expect(t.m4_red).toBe(true);
    expect(t.active_triggers).toContain('M4_RED');
  });

  it('m4_red fires when ndi > 3.5 AND F > 10', () => {
    const t = evaluateM4Triggers(3.51, { ...safe, F: 11 });
    expect(t.m4_red).toBe(true);
  });

  it('m4_red does NOT fire when ndi > 3.5 but C <= 5 and F <= 10', () => {
    const t = evaluateM4Triggers(3.51, { ...safe, C: 5, F: 10 });
    expect(t.m4_red).toBe(false);
  });

  it('m4_red does NOT fire when C > 5 but ndi <= 3.5', () => {
    const t = evaluateM4Triggers(3.5, { ...safe, C: 8 });
    expect(t.m4_red).toBe(false);
  });

  it('narrative_emergency fires when Phi > 500', () => {
    const t = evaluateM4Triggers(0.5, { ...safe, Phi: 501 });
    expect(t.narrative_emergency).toBe(true);
    expect(t.active_triggers).toContain('M4_EMERGENCY');
  });

  it('narrative_emergency fires when N < 0.4', () => {
    const t = evaluateM4Triggers(0.5, { ...safe, N: 0.39 });
    expect(t.narrative_emergency).toBe(true);
  });

  it('narrative_emergency does NOT fire when Phi = 500 and N = 0.4', () => {
    const t = evaluateM4Triggers(0.5, { ...safe, Phi: 500, N: 0.4 });
    expect(t.narrative_emergency).toBe(false);
  });

  it('rapid_polarization fires when P > 0.3 AND D > 15', () => {
    const t = evaluateM4Triggers(0.5, { ...safe, P: 0.31, D: 16 });
    expect(t.rapid_polarization).toBe(true);
    expect(t.active_triggers).toContain('M4_POLAR');
  });

  it('rapid_polarization does NOT fire when P = 0.3', () => {
    const t = evaluateM4Triggers(0.5, { ...safe, P: 0.3, D: 20 });
    expect(t.rapid_polarization).toBe(false);
  });

  it('rapid_polarization does NOT fire when D = 15', () => {
    const t = evaluateM4Triggers(0.5, { ...safe, P: 0.5, D: 15 });
    expect(t.rapid_polarization).toBe(false);
  });

  it('active_triggers is always an array', () => {
    expect(Array.isArray(evaluateM4Triggers(0.5, safe).active_triggers)).toBe(true);
  });
});

// ============================================================================
// EFU 600.40 — calculateNDI (main model)
// NDI = (1-N) × (C×0.15 + E×0.18 + F×0.12 + D×0.08 + T×0.07 + P×0.05) × S × (1+Φ/1000)
// ============================================================================

describe('calculateNDI', () => {
  it('returns expected structure', () => {
    const r = calculateNDI();
    expect(typeof r.ndi_index).toBe('number');
    expect(typeof r.zone).toBe('object');
    expect(typeof r.m4_status).toBe('string');
    expect(typeof r.triggers).toBe('object');
    expect(Array.isArray(r.triggers.active_triggers)).toBe(true);
    expect(typeof r.submodules).toBe('object');
    expect(typeof r.submodules.kni).toBe('number');
    expect(typeof r.submodules.eni).toBe('number');
    expect(typeof r.variables).toBe('object');
  });

  it('uses defaults and produces near-zero GREEN zone result', () => {
    // defaults: N=0.8, C=0, E=0, F=0, R=0.7, D=5, S=1.0, T=0, P=0, Phi=0
    // norm.D = 5/30 ≈ 0.1667; inner = 0.1667*0.08 ≈ 0.01333
    // NDI = (1-0.8) * 0.01333 * 1 * 1 = 0.002667
    const r = calculateNDI();
    expect(r.ndi_index).toBeCloseTo(0.002667, 4);
    expect(r.zone.id).toBe('GREEN');
    expect(r.m4_status).toBe('M4.STABLE');
  });

  it('ndi = 0 when N = 1 (perfect coherence)', () => {
    const r = calculateNDI({ N: 1, C: 5, E: 0.5, F: 8, D: 20, T: 0.8, P: 0.3, S: 1.2, Phi: 300 });
    expect(r.ndi_index).toBe(0);
    expect(r.zone.id).toBe('GREEN');
  });

  it('ndi = 0 when all degradation inputs are zero', () => {
    const r = calculateNDI({ N: 0.5, C: 0, E: 0, F: 0, D: 0, T: 0, P: 0, S: 1.0, Phi: 0 });
    expect(r.ndi_index).toBe(0);
  });

  it('calculates correct NDI with known inputs', () => {
    // N=0.5, C=5(→0.5), E=0.6, F=10(→0.5), D=15(→0.5), T=0.8, P=0.25(→0.5), S=1.2, Phi=0
    // inner = 0.5*0.15 + 0.6*0.18 + 0.5*0.12 + 0.5*0.08 + 0.8*0.07 + 0.5*0.05
    //       = 0.075 + 0.108 + 0.06 + 0.04 + 0.056 + 0.025 = 0.364
    // NDI = (1-0.5) * 0.364 * 1.2 * 1 = 0.5 * 0.364 * 1.2 = 0.2184
    const r = calculateNDI({ N: 0.5, C: 5, E: 0.6, F: 10, D: 15, T: 0.8, P: 0.25, S: 1.2, Phi: 0 });
    expect(r.ndi_index).toBeCloseTo(0.2184, 4);
    expect(r.zone.id).toBe('GREEN');
  });

  it('Phi amplifies the NDI', () => {
    const low  = calculateNDI({ N: 0.5, C: 5, E: 0.6, F: 8, D: 15, T: 0.7, P: 0.2, S: 1.0, Phi: 0 });
    const high = calculateNDI({ N: 0.5, C: 5, E: 0.6, F: 8, D: 15, T: 0.7, P: 0.2, S: 1.0, Phi: 500 });
    expect(high.ndi_index).toBeGreaterThan(low.ndi_index);
    expect(high.ndi_index / low.ndi_index).toBeCloseTo(1.5, 5);
  });

  it('synergy S amplifies the NDI proportionally', () => {
    const base  = calculateNDI({ N: 0.5, C: 4, E: 0.5, F: 8, D: 10, T: 0.6, P: 0.2, S: 1.0, Phi: 0 });
    const amped = calculateNDI({ N: 0.5, C: 4, E: 0.5, F: 8, D: 10, T: 0.6, P: 0.2, S: 2.0, Phi: 0 });
    expect(amped.ndi_index / base.ndi_index).toBeCloseTo(2, 5);
  });

  it('extreme inputs reach RED zone', () => {
    // N=0, all degradation maxed, S=3.0, Phi=2000 → NDI = 5.85 → RED
    const r = calculateNDI({ N: 0, C: 10, E: 1.0, F: 20, D: 30, T: 1.0, P: 0.5, S: 3.0, Phi: 2000 });
    expect(r.ndi_index).toBeGreaterThan(3.5);
    expect(['RED', 'CRITICAL']).toContain(r.zone.id);
  });

  it('extreme inputs trigger m4_red', () => {
    const r = calculateNDI({ N: 0, C: 10, E: 1.0, F: 20, D: 30, T: 1.0, P: 0.5, S: 3.0, Phi: 2000 });
    expect(r.triggers.m4_red).toBe(true);
    expect(r.triggers.active_triggers).toContain('M4_RED');
  });

  it('submodules kni and eni are numbers in result', () => {
    const r = calculateNDI({ N: 0.5, C: 5, E: 0.5, F: 10, R: 0.4, D: 15, T: 0.8, P: 0.3, S: 1.0, Phi: 0 });
    expect(typeof r.submodules.kni).toBe('number');
    expect(typeof r.submodules.eni).toBe('number');
    expect(r.submodules.kni).toBeGreaterThan(0);
    expect(r.submodules.eni).toBeGreaterThan(0);
  });

  it('m4_status matches zone.m4_status', () => {
    const r = calculateNDI({ N: 0.5, C: 5, E: 0.5, F: 10, D: 15, T: 0.8, P: 0.3, S: 1.0, Phi: 0 });
    expect(r.m4_status).toBe(r.zone.m4_status);
  });

  it('normalized variables are accessible in result', () => {
    const r = calculateNDI({ N: 0.6, C: 8, E: 0.5, F: 12, D: 18, T: 0.7, P: 0.2, S: 1.0, Phi: 0 });
    expect(r.variables.normalized.C).toBeCloseTo(8 / 10, 5);
    expect(r.variables.normalized.F).toBeCloseTo(12 / 20, 5);
    expect(r.variables.normalized.D).toBeCloseTo(18 / 30, 5);
    expect(r.variables.normalized.P).toBeCloseTo(0.2 / 0.5, 5);
  });

  it('narrative_emergency fires when Phi > 500', () => {
    const r = calculateNDI({ N: 0.7, C: 3, E: 0.3, F: 4, D: 5, T: 0.3, P: 0.1, S: 1.0, Phi: 501 });
    expect(r.triggers.narrative_emergency).toBe(true);
    expect(r.triggers.active_triggers).toContain('M4_EMERGENCY');
  });
});

// ============================================================================
// EFU 600.69 — Gresham–Parazita Spirál (GPS)
// ============================================================================

describe('classifyGPSZone', () => {
  it('returns GREEN for gps < 0.5', () => {
    const z = classifyGPSZone(0.0);
    expect(z.id).toBe('GREEN');
    expect(z.status).toBe('WATCH');
  });

  it('boundary GREEN/YELLOW at 0.5', () => {
    expect(classifyGPSZone(0.49).id).toBe('GREEN');
    const z = classifyGPSZone(0.5);
    expect(z.id).toBe('YELLOW');
    expect(z.status).toBe('TRÓJAI FÁZIS');
  });

  it('boundary YELLOW/ORANGE at 1.0', () => {
    expect(classifyGPSZone(0.99).id).toBe('YELLOW');
    const z = classifyGPSZone(1.0);
    expect(z.id).toBe('ORANGE');
    expect(z.status).toBe('GRESHAM FÁZIS');
  });

  it('boundary ORANGE/RED at 2.5', () => {
    expect(classifyGPSZone(2.49).id).toBe('ORANGE');
    const z = classifyGPSZone(2.5);
    expect(z.id).toBe('RED');
    expect(z.status).toBe('JEVONS FÁZIS');
  });

  it('boundary RED/CRITICAL at 4.5', () => {
    expect(classifyGPSZone(4.49).id).toBe('RED');
    const z = classifyGPSZone(4.5);
    expect(z.id).toBe('CRITICAL');
    expect(z.status).toBe('JEVONS ÖSSZEOMLÁS');
  });

  it('extreme values all return CRITICAL', () => {
    for (const v of [4.5, 5.0, 10.0, 100.0]) {
      expect(classifyGPSZone(v).id).toBe('CRITICAL');
    }
  });

  it('returns multiplier 1.0 for GREEN', () => {
    expect(classifyGPSZone(0.3).multiplier).toBe(1.0);
  });

  it('returns multiplier 3.0 for CRITICAL', () => {
    expect(classifyGPSZone(5.0).multiplier).toBe(3.0);
  });
});

describe('evaluateGPSTriggers', () => {
  const safeVars = {
    digital_lock: 0.10, monoblock: 0.30, knowledge_loss: 0.20,
    entropy_export: 0.20, jim30_loss: 0.30, local_quota_loss: 0.20, Phi: 100,
  };

  it('all triggers false for safe inputs', () => {
    const t = evaluateGPSTriggers(0.3, safeVars);
    expect(t.digital_karanteen).toBe(false);
    expect(t.monoblock_kor).toBe(false);
    expect(t.entropy_sinkhole).toBe(false);
    expect(t.gresham_fire_chief).toBe(false);
    expect(t.active_triggers).toHaveLength(0);
  });

  it('DIGITAL_KARANTEEN fires when digital_lock > 0.20', () => {
    const t = evaluateGPSTriggers(0.3, { ...safeVars, digital_lock: 0.21 });
    expect(t.digital_karanteen).toBe(true);
    expect(t.active_triggers).toContain('DIGITAL_KARANTEEN');
  });

  it('DIGITAL_KARANTEEN boundary: exactly 0.20 does not fire', () => {
    const t = evaluateGPSTriggers(0.3, { ...safeVars, digital_lock: 0.20 });
    expect(t.digital_karanteen).toBe(false);
  });

  it('MONOBLOCK_KOR fires when monoblock > 0.50', () => {
    const t = evaluateGPSTriggers(0.3, { ...safeVars, monoblock: 0.51 });
    expect(t.monoblock_kor).toBe(true);
    expect(t.active_triggers).toContain('MONOBLOCK_KOR');
  });

  it('MONOBLOCK_KOR fires when jim30_loss > 0.60', () => {
    const t = evaluateGPSTriggers(0.3, { ...safeVars, jim30_loss: 0.61 });
    expect(t.monoblock_kor).toBe(true);
    expect(t.active_triggers).toContain('MONOBLOCK_KOR');
  });

  it('MONOBLOCK_KOR boundary: exactly 0.50 monoblock does not fire', () => {
    const t = evaluateGPSTriggers(0.3, { ...safeVars, monoblock: 0.50, jim30_loss: 0.60 });
    expect(t.monoblock_kor).toBe(false);
  });

  it('ENTROPY_SINKHOLE fires when entropy_export > 0.40', () => {
    const t = evaluateGPSTriggers(0.3, { ...safeVars, entropy_export: 0.41 });
    expect(t.entropy_sinkhole).toBe(true);
    expect(t.active_triggers).toContain('ENTROPY_SINKHOLE');
  });

  it('ENTROPY_SINKHOLE fires when local_quota_loss > 0.50', () => {
    const t = evaluateGPSTriggers(0.3, { ...safeVars, local_quota_loss: 0.51 });
    expect(t.entropy_sinkhole).toBe(true);
    expect(t.active_triggers).toContain('ENTROPY_SINKHOLE');
  });

  it('GRESHAM_FIRE_CHIEF fires when gps > 4.0', () => {
    const t = evaluateGPSTriggers(4.1, safeVars);
    expect(t.gresham_fire_chief).toBe(true);
    expect(t.active_triggers).toContain('GRESHAM_FIRE_CHIEF');
  });

  it('GRESHAM_FIRE_CHIEF fires when jim30_loss > 0.7 AND local_quota_loss > 0.7', () => {
    const t = evaluateGPSTriggers(0.3, { ...safeVars, jim30_loss: 0.71, local_quota_loss: 0.71 });
    expect(t.gresham_fire_chief).toBe(true);
  });

  it('GRESHAM_FIRE_CHIEF fires when Phi > 700', () => {
    const t = evaluateGPSTriggers(0.3, { ...safeVars, Phi: 701 });
    expect(t.gresham_fire_chief).toBe(true);
    expect(t.active_triggers).toContain('GRESHAM_FIRE_CHIEF');
  });

  it('GRESHAM_FIRE_CHIEF boundary: jim30_loss 0.7 AND local_quota_loss 0.7 does not fire', () => {
    const t = evaluateGPSTriggers(0.3, { ...safeVars, jim30_loss: 0.70, local_quota_loss: 0.70 });
    expect(t.gresham_fire_chief).toBe(false);
  });

  it('active_triggers lists all active triggers', () => {
    const t = evaluateGPSTriggers(4.5, {
      digital_lock: 0.50, monoblock: 0.80, knowledge_loss: 0.70,
      entropy_export: 0.80, jim30_loss: 0.90, local_quota_loss: 0.90, Phi: 800,
    });
    expect(t.active_triggers).toContain('DIGITAL_KARANTEEN');
    expect(t.active_triggers).toContain('MONOBLOCK_KOR');
    expect(t.active_triggers).toContain('ENTROPY_SINKHOLE');
    expect(t.active_triggers).toContain('GRESHAM_FIRE_CHIEF');
    expect(t.active_triggers).toHaveLength(4);
  });
});

describe('calculateGPS', () => {
  it('returns expected fields', () => {
    const r = calculateGPS({});
    expect(r).toHaveProperty('gps_index');
    expect(r).toHaveProperty('zone');
    expect(r).toHaveProperty('triggers');
    expect(r).toHaveProperty('variable_contributions');
    expect(r).toHaveProperty('diagnostics');
    expect(r).toHaveProperty('variables');
  });

  it('formula check with known values: all zeros → gps = 0', () => {
    const r = calculateGPS({
      digital_lock: 0, monoblock: 0, knowledge_loss: 0,
      entropy_export: 0, jim30_loss: 0, local_quota_loss: 0, S: 1.0, Phi: 0,
    });
    expect(r.gps_index).toBeCloseTo(0, 5);
    expect(r.zone.id).toBe('GREEN');
  });

  it('formula check: all max (1.0) with S=1.0, Phi=0 → base = 1.0 × sum_of_weights', () => {
    const r = calculateGPS({
      digital_lock: 1.0, monoblock: 1.0, knowledge_loss: 1.0,
      entropy_export: 1.0, jim30_loss: 1.0, local_quota_loss: 1.0, S: 1.0, Phi: 0,
    });
    // sum of weights = 0.25+0.20+0.15+0.20+0.12+0.08 = 1.0
    expect(r.gps_index).toBeCloseTo(1.0, 5);
  });

  it('Phi amplifies GPS proportionally', () => {
    const base = calculateGPS({ digital_lock: 0.5, monoblock: 0.5, knowledge_loss: 0.5, entropy_export: 0.5, jim30_loss: 0.5, local_quota_loss: 0.5, S: 1.0, Phi: 0 });
    const amped = calculateGPS({ digital_lock: 0.5, monoblock: 0.5, knowledge_loss: 0.5, entropy_export: 0.5, jim30_loss: 0.5, local_quota_loss: 0.5, S: 1.0, Phi: 1000 });
    expect(amped.gps_index / base.gps_index).toBeCloseTo(2.0, 5);
  });

  it('synergy S amplifies GPS proportionally', () => {
    const base = calculateGPS({ digital_lock: 0.5, monoblock: 0.5, knowledge_loss: 0.5, entropy_export: 0.5, jim30_loss: 0.5, local_quota_loss: 0.5, S: 1.0, Phi: 0 });
    const amped = calculateGPS({ digital_lock: 0.5, monoblock: 0.5, knowledge_loss: 0.5, entropy_export: 0.5, jim30_loss: 0.5, local_quota_loss: 0.5, S: 2.0, Phi: 0 });
    expect(amped.gps_index / base.gps_index).toBeCloseTo(2.0, 5);
  });

  it('uses defaults when no inputs provided', () => {
    const r = calculateGPS();
    expect(r.gps_index).toBeGreaterThan(0);
    expect(r.diagnostics.missing_inputs.length).toBe(8);
    expect(r.diagnostics.confidence).toBeCloseTo(0, 2);
  });

  it('partial inputs use remaining defaults and track missing', () => {
    const r = calculateGPS({ digital_lock: 0.0 });
    expect(r.diagnostics.missing_inputs).not.toContain('digital_lock');
    expect(r.diagnostics.missing_inputs).toContain('monoblock');
  });

  it('variable contributions sum approximately equals base_index', () => {
    const r = calculateGPS({ digital_lock: 0.4, monoblock: 0.6, knowledge_loss: 0.3, entropy_export: 0.5, jim30_loss: 0.4, local_quota_loss: 0.3, S: 1.0, Phi: 0 });
    const contribSum = Object.values(r.variable_contributions).reduce((a, b) => a + b, 0);
    expect(contribSum).toBeCloseTo(r.diagnostics.base_index, 3);
  });

  it('extreme high inputs reach CRITICAL zone', () => {
    // With all vars=1.0, S=1.8, Phi=2000: GPS = 1.0 × 1.8 × 3.0 = 5.4 → CRITICAL
    const r = calculateGPS({
      digital_lock: 1.0, monoblock: 1.0, knowledge_loss: 1.0,
      entropy_export: 1.0, jim30_loss: 1.0, local_quota_loss: 1.0, S: 1.8, Phi: 2000,
    });
    expect(r.gps_index).toBeGreaterThan(4.5);
    expect(r.zone.id).toBe('CRITICAL');
  });

  it('extreme high inputs trigger GRESHAM_FIRE_CHIEF', () => {
    const r = calculateGPS({
      digital_lock: 1.0, monoblock: 1.0, knowledge_loss: 1.0,
      entropy_export: 1.0, jim30_loss: 1.0, local_quota_loss: 1.0, S: 1.8, Phi: 2000,
    });
    expect(r.triggers.gresham_fire_chief).toBe(true);
    expect(r.triggers.active_triggers).toContain('GRESHAM_FIRE_CHIEF');
  });

  it('minimal inputs reach GREEN zone', () => {
    const r = calculateGPS({
      digital_lock: 0.05, monoblock: 0.10, knowledge_loss: 0.05,
      entropy_export: 0.10, jim30_loss: 0.10, local_quota_loss: 0.05, S: 1.0, Phi: 0,
    });
    expect(r.zone.id).toBe('GREEN');
    expect(r.triggers.active_triggers).toHaveLength(0);
  });

  it('gps_index is a finite number', () => {
    const r = calculateGPS({});
    expect(Number.isFinite(r.gps_index)).toBe(true);
  });

  it('confidence is 1.0 when all inputs provided', () => {
    const r = calculateGPS({
      digital_lock: 0.3, monoblock: 0.4, knowledge_loss: 0.3,
      entropy_export: 0.3, jim30_loss: 0.3, local_quota_loss: 0.3, S: 1.1, Phi: 100,
    });
    expect(r.diagnostics.confidence).toBeCloseTo(1.0, 2);
  });

  it('zone and triggers are consistent with direct classify/evaluate calls', () => {
    const inputs = { digital_lock: 0.4, monoblock: 0.6, knowledge_loss: 0.5, entropy_export: 0.6, jim30_loss: 0.5, local_quota_loss: 0.4, S: 1.2, Phi: 300 };
    const r = calculateGPS(inputs);
    const directZone = classifyGPSZone(r.gps_index);
    expect(r.zone.id).toBe(directZone.id);
    const directTriggers = evaluateGPSTriggers(r.gps_index, r.variables.raw);
    expect(r.triggers.active_triggers).toEqual(directTriggers.active_triggers);
  });
});

// ============================================================================
// EFU 600.53 — Digitális Extrakció & AI Parazitizmus (CFI-D)
// ============================================================================

import {
  calculateCFID,
  classifyCFIDZone,
  evaluateCFIDTriggers,
  calculateNooCSI,
  classifyNooCSIZone,
  evaluateNooCSITriggers,
  calculateCFIN,
  classifyCFINZone,
  evaluateCFINTriggers,
} from './efu-engine.js';

describe('classifyCFIDZone', () => {
  it('returns GREEN for cfid < 200', () => {
    expect(classifyCFIDZone(0).id).toBe('GREEN');
    expect(classifyCFIDZone(199).id).toBe('GREEN');
  });

  it('returns YELLOW for cfid 200–499', () => {
    expect(classifyCFIDZone(200).id).toBe('YELLOW');
    expect(classifyCFIDZone(499).id).toBe('YELLOW');
  });

  it('returns ORANGE for cfid 500–999', () => {
    expect(classifyCFIDZone(500).id).toBe('ORANGE');
    expect(classifyCFIDZone(999).id).toBe('ORANGE');
  });

  it('returns RED for cfid 1000–1999', () => {
    expect(classifyCFIDZone(1000).id).toBe('RED');
    expect(classifyCFIDZone(1500).id).toBe('RED');
  });

  it('returns BLACK for cfid >= 2000', () => {
    expect(classifyCFIDZone(2000).id).toBe('BLACK');
    expect(classifyCFIDZone(2500).id).toBe('BLACK');
  });
});

describe('calculateCFID', () => {
  it('default inputs return cfid_total as a finite number', () => {
    const r = calculateCFID({});
    expect(Number.isFinite(r.cfid_total)).toBe(true);
    expect(r.cfid_total).toBeGreaterThan(0);
  });

  it('zero extractive + max protective → GREEN zone', () => {
    const r = calculateCFID({
      screen_time: 0,
      notification_rate: 0,
      AI_content_ratio: 0,
      personalization_depth: 0,
      offline_time: 8,
      deep_work_hours: 6,
      sleep_quality_index: 1.0,
      user_agency_index: 1.0,
      CFI_D_regenerative: 500,
      t_years: 0,
    });
    expect(r.zone.id).toBe('GREEN');
  });

  it('max extractive + zero protective → RED or BLACK zone', () => {
    const r = calculateCFID({
      screen_time: 16,
      notification_rate: 1.0,
      AI_content_ratio: 1.0,
      personalization_depth: 1.0,
      offline_time: 0,
      deep_work_hours: 0,
      sleep_quality_index: 0,
      user_agency_index: 0,
      CFI_D_regenerative: 0,
      t_years: 5,
    });
    expect(['RED', 'BLACK']).toContain(r.zone.id);
  });

  it('screen_time>4 + cfid>500 → kognitiv_stressz trigger active', () => {
    const r = calculateCFID({
      screen_time: 14,
      notification_rate: 1.0,
      AI_content_ratio: 0.8,
      personalization_depth: 0.9,
      offline_time: 0,
      deep_work_hours: 0,
      sleep_quality_index: 0,
      user_agency_index: 0,
      CFI_D_regenerative: 0,
      t_years: 3,
    });
    expect(r.triggers.kognitiv_stressz).toBe(true);
    expect(r.triggers.active_triggers).toContain('KOGNITIV_STRESSZ');
  });

  it('AI_content_ratio>0.6 + personalization_depth>0.7 + user_agency_index<0.3 → algoritmikus_befogás trigger', () => {
    const r = calculateCFID({
      screen_time: 8,
      notification_rate: 0.8,
      AI_content_ratio: 0.8,
      personalization_depth: 0.9,
      offline_time: 0,
      deep_work_hours: 0,
      sleep_quality_index: 0.2,
      user_agency_index: 0.1,
      CFI_D_regenerative: 0,
      t_years: 3,
    });
    expect(r.triggers.algoritmikus_befogás).toBe(true);
    expect(r.triggers.active_triggers).toContain('ALGORITMIKUS_BEFOGÁS');
  });

  it('confidence is 1.0 when all inputs are provided', () => {
    const r = calculateCFID({
      screen_time: 5, notification_rate: 0.5, AI_content_ratio: 0.4,
      personalization_depth: 0.6, offline_time: 3, deep_work_hours: 2,
      sleep_quality_index: 0.6, user_agency_index: 0.4,
      beta: 0.18, alpha_AI: 0.35, CFI_D_regenerative: 50,
      Debt_rate_D: 0.12, t_years: 3,
    });
    expect(r.diagnostics.confidence).toBeCloseTo(1.0, 2);
  });

  it('zone and triggers are consistent with direct classify/evaluate calls', () => {
    const r = calculateCFID({
      screen_time: 8, notification_rate: 0.7, AI_content_ratio: 0.5,
      personalization_depth: 0.7, offline_time: 2, deep_work_hours: 1,
      sleep_quality_index: 0.4, user_agency_index: 0.3,
    });
    expect(r.zone.id).toBe(classifyCFIDZone(r.cfid_total).id);
    const dt = evaluateCFIDTriggers(r.cfid_total, r.variables.raw);
    expect(r.triggers.active_triggers).toEqual(dt.active_triggers);
  });
});

// ============================================================================
// EFU 600.51 — Noosphere Antifluxus Metrikák (Noo-CSI)
// ============================================================================

describe('classifyNooCSIZone', () => {
  it('returns GREEN for csi < 2', () => {
    expect(classifyNooCSIZone(0).id).toBe('GREEN');
    expect(classifyNooCSIZone(1.99).id).toBe('GREEN');
  });

  it('returns YELLOW for csi 2–3.99', () => {
    expect(classifyNooCSIZone(2).id).toBe('YELLOW');
    expect(classifyNooCSIZone(3.99).id).toBe('YELLOW');
  });

  it('returns ORANGE for csi 4–6.99', () => {
    expect(classifyNooCSIZone(4).id).toBe('ORANGE');
    expect(classifyNooCSIZone(6.99).id).toBe('ORANGE');
  });

  it('returns RED for csi 7–9.99', () => {
    expect(classifyNooCSIZone(7).id).toBe('RED');
    expect(classifyNooCSIZone(8).id).toBe('RED');
  });

  it('returns CRITICAL for csi >= 10', () => {
    expect(classifyNooCSIZone(10).id).toBe('CRITICAL');
    expect(classifyNooCSIZone(12).id).toBe('CRITICAL');
  });
});

describe('calculateNooCSI', () => {
  it('default inputs (HU pilot: DKI=7.2, NPR=3.8, AIF=0.82) return csi_noo in ORANGE zone', () => {
    const r = calculateNooCSI({});
    expect(Number.isFinite(r.csi_noo)).toBe(true);
    expect(r.csi_noo).toBeGreaterThan(4);
    expect(r.csi_noo).toBeLessThan(7);
    expect(r.zone.id).toBe('ORANGE');
  });

  it('DKI=0, NPR=0, AIF=0 → GREEN zone', () => {
    const r = calculateNooCSI({ DKI: 0, NPR: 0, AIF: 0 });
    expect(r.zone.id).toBe('GREEN');
    expect(r.csi_noo).toBe(0);
  });

  it('DKI>6 → dki_high trigger active', () => {
    const r = calculateNooCSI({ DKI: 7, NPR: 0, AIF: 0 });
    expect(r.triggers.dki_high).toBe(true);
    expect(r.triggers.active_triggers).toContain('DKI_HIGH');
  });

  it('NPR>3.0 → npr_polarised trigger active', () => {
    const r = calculateNooCSI({ DKI: 0, NPR: 3.5, AIF: 0 });
    expect(r.triggers.npr_polarised).toBe(true);
    expect(r.triggers.active_triggers).toContain('NPR_POLARISED');
  });

  it('AIF>0.7 → aif_algo_dom trigger active', () => {
    const r = calculateNooCSI({ DKI: 0, NPR: 0, AIF: 0.8 });
    expect(r.triggers.aif_algo_dom).toBe(true);
    expect(r.triggers.active_triggers).toContain('AIF_ALGO_DOM');
  });

  it('confidence is 1.0 when all inputs are provided', () => {
    const r = calculateNooCSI({ DKI: 7.2, NPR: 3.8, AIF: 0.82 });
    expect(r.diagnostics.confidence).toBeCloseTo(1.0, 2);
  });

  it('zone and triggers consistent with direct classify/evaluate calls', () => {
    const r = calculateNooCSI({ DKI: 10, NPR: 5, AIF: 0.9 });
    expect(r.zone.id).toBe(classifyNooCSIZone(r.csi_noo).id);
    const dt = evaluateNooCSITriggers(r.csi_noo, r.variables.raw);
    expect(r.triggers.active_triggers).toEqual(dt.active_triggers);
  });
});

// ============================================================================
// EFU 600.58 — UPF Anyagcsere Parazitizmus (CFI-N)
// ============================================================================

describe('classifyCFINZone', () => {
  it('returns GREEN for cfin < 200', () => {
    expect(classifyCFINZone(0).id).toBe('GREEN');
    expect(classifyCFINZone(199).id).toBe('GREEN');
  });

  it('returns YELLOW for cfin 200–399', () => {
    expect(classifyCFINZone(200).id).toBe('YELLOW');
    expect(classifyCFINZone(399).id).toBe('YELLOW');
  });

  it('returns ORANGE for cfin 400–699', () => {
    expect(classifyCFINZone(400).id).toBe('ORANGE');
    expect(classifyCFINZone(699).id).toBe('ORANGE');
  });

  it('returns RED for cfin 700–1199', () => {
    expect(classifyCFINZone(700).id).toBe('RED');
    expect(classifyCFINZone(1199).id).toBe('RED');
  });

  it('returns CRITICAL for cfin >= 1200', () => {
    expect(classifyCFINZone(1200).id).toBe('CRITICAL');
    expect(classifyCFINZone(2000).id).toBe('CRITICAL');
  });
});

describe('calculateCFIN', () => {
  it('default inputs return cfin_total as a finite number', () => {
    const r = calculateCFIN({});
    expect(Number.isFinite(r.cfin_total)).toBe(true);
    expect(r.cfin_total).toBeGreaterThan(0);
  });

  it('upf_ratio=0, F_regen_gut=1 → GREEN zone', () => {
    const r = calculateCFIN({
      upf_ratio: 0,
      insulin_resistance: 0,
      inflammation_index: 0,
      pfas_synergy: 0,
      F_regen_gut: 1.0,
      microbiom_loss: 0,
      t_years: 0,
    });
    expect(r.zone.id).toBe('GREEN');
  });

  it('upf_ratio=0.8 + low F_regen_gut → RED or CRITICAL zone', () => {
    const r = calculateCFIN({
      upf_ratio: 0.8,
      insulin_resistance: 0.8,
      inflammation_index: 0.8,
      pfas_synergy: 0.8,
      F_regen_gut: 0.1,
      microbiom_loss: 0.8,
      Debt_rate_N: 0.15,
      t_years: 10,
      cfib_factor: 0.8,
    });
    expect(['RED', 'CRITICAL']).toContain(r.zone.id);
  });

  it('upf_ratio>0.40 + pfas_synergy>0.20 → kombinalt_biokockazat trigger', () => {
    const r = calculateCFIN({
      upf_ratio: 0.50,
      pfas_synergy: 0.30,
      F_regen_gut: 0.40,
    });
    expect(r.triggers.kombinalt_biokockazat).toBe(true);
    expect(r.triggers.active_triggers).toContain('KOMBINALT_BIOKOCKAZAT');
  });

  it('cfin>700 → fire_chief trigger', () => {
    const r = calculateCFIN({
      upf_ratio: 0.8,
      insulin_resistance: 0.8,
      inflammation_index: 0.8,
      pfas_synergy: 0.8,
      F_regen_gut: 0.1,
      microbiom_loss: 0.8,
      t_years: 10,
      cfib_factor: 0.8,
    });
    expect(r.triggers.fire_chief).toBe(true);
    expect(r.triggers.active_triggers).toContain('FIRE_CHIEF');
  });

  it('F_regen_gut<0.30 + microbiom_loss>0.60 → mikrobiom_kolaps trigger', () => {
    const r = calculateCFIN({
      F_regen_gut: 0.20,
      microbiom_loss: 0.70,
      upf_ratio: 0.4,
      pfas_synergy: 0.2,
    });
    expect(r.triggers.mikrobiom_kolaps).toBe(true);
    expect(r.triggers.active_triggers).toContain('MIKROBIOM_KOLAPS');
  });

  it('B_food increases with upf_ratio progression through thresholds', () => {
    const low  = calculateCFIN({ upf_ratio: 0.10, F_regen_gut: 0.5, t_years: 0 });
    const mid  = calculateCFIN({ upf_ratio: 0.30, F_regen_gut: 0.5, t_years: 0 });
    const high = calculateCFIN({ upf_ratio: 0.60, F_regen_gut: 0.5, t_years: 0 });
    expect(low.components.B_food).toBe(1.0);
    expect(mid.components.B_food).toBe(1.3);
    expect(high.components.B_food).toBe(1.7);
  });

  it('confidence is 1.0 when all inputs are provided', () => {
    const r = calculateCFIN({
      upf_ratio: 0.45, insulin_resistance: 0.40, inflammation_index: 0.35,
      pfas_synergy: 0.30, F_regen_gut: 0.40, microbiom_loss: 0.45,
      Debt_rate_N: 0.10, t_years: 5, cfib_factor: 0.25,
    });
    expect(r.diagnostics.confidence).toBeCloseTo(1.0, 2);
  });

  it('zone and triggers consistent with direct classify/evaluate calls', () => {
    const r = calculateCFIN({ upf_ratio: 0.5, pfas_synergy: 0.3, F_regen_gut: 0.35 });
    expect(r.zone.id).toBe(classifyCFINZone(r.cfin_total).id);
    const dt = evaluateCFINTriggers(r.cfin_total, r.variables.raw);
    expect(r.triggers.active_triggers).toEqual(dt.active_triggers);
  });
});
