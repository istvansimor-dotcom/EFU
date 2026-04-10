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
