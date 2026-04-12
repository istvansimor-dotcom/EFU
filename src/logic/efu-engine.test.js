import { describe, it, expect } from 'vitest';
import {
  applyJIM30Correction,
  calculateMROI,
  calculateFLR,
  detectParasitism,
  classifyMROI,
  FLR_PARASITISM_THRESHOLD,
} from './efu-engine.js';

// ---------------------------------------------------------------------------
// applyJIM30Correction
// ---------------------------------------------------------------------------
describe('applyJIM30Correction', () => {
  it('applies no friction when JIM-30 = 100 (perfectly repairable)', () => {
    const result = applyJIM30Correction(10, 100, 0.3);
    expect(result).toBe(10); // (1 + (1 - 1) * 0.3) = 1.0
  });

  it('applies maximum friction when JIM-30 = 0 (non-repairable)', () => {
    const result = applyJIM30Correction(10, 0, 0.3);
    expect(result).toBeCloseTo(13); // 10 * (1 + 1 * 0.3) = 13
  });

  it('applies partial friction for JIM-30 = 50', () => {
    const result = applyJIM30Correction(10, 50, 0.3);
    expect(result).toBeCloseTo(11.5); // 10 * (1 + 0.5 * 0.3) = 11.5
  });

  it('clamps JIM-30 values below 0 to 0', () => {
    const result = applyJIM30Correction(10, -10, 0.3);
    expect(result).toBeCloseTo(13); // clamped to 0
  });

  it('clamps JIM-30 values above 100 to 100', () => {
    const result = applyJIM30Correction(10, 150, 0.3);
    expect(result).toBeCloseTo(10); // clamped to 100
  });

  it('returns 0 for zero efu_input', () => {
    expect(applyJIM30Correction(0, 50, 0.3)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// calculateMROI
// ---------------------------------------------------------------------------
describe('calculateMROI', () => {
  const baseParams = {
    delta_e_saved: 10000,
    grid_co2: 0.35,
    racf: 526,
    jim30: 25,
    d_multiplier: 0.3,
    efu_input_direct: 6.65,
  };

  it('calculates MROI for Solar Street Lighting scenario', () => {
    const result = calculateMROI(baseParams);
    expect(result.mroi).toBeGreaterThan(0);
    expect(result.co2_reduction).toBe(3500); // 10000 * 0.35
    expect(result.output_racf_units).toBeCloseTo(3500 / 526, 1);
  });

  it('calculates MROI for Modular Wind-Storage scenario (should be SYMBIOTIC)', () => {
    const params = {
      delta_e_saved: 45000,
      grid_co2: 0.35,
      racf: 526,
      jim30: 88,
      d_multiplier: 0.3,
      efu_input_direct: 29.94,
    };
    const result = calculateMROI(params);
    expect(result.mroi).toBeGreaterThan(25); // SYMBIOTIC
  });

  it('returns negative MROI for negative energy savings (Crypto Mining)', () => {
    const params = { ...baseParams, delta_e_saved: -5000 };
    const result = calculateMROI(params);
    expect(result.mroi).toBeLessThan(0);
    expect(result.co2_reduction).toBe(-1750); // -5000 * 0.35
  });

  it('returns zero MROI when efu_input_corrected is zero', () => {
    const params = { ...baseParams, efu_input_direct: 0 };
    const result = calculateMROI(params);
    expect(result.mroi).toBe(0);
  });

  it('returns zero output_racf_units when RACF is zero', () => {
    const params = { ...baseParams, racf: 0 };
    const result = calculateMROI(params);
    expect(result.output_racf_units).toBe(0);
    expect(result.mroi).toBe(0);
  });

  it('returns correction_multiplier = 1.0 when JIM-30 = 100', () => {
    const params = { ...baseParams, jim30: 100 };
    const result = calculateMROI(params);
    expect(result.correction_multiplier).toBe(1);
  });

  it('correction_multiplier is clamped correctly (efu_input_direct = 0)', () => {
    const params = { ...baseParams, efu_input_direct: 0 };
    const result = calculateMROI(params);
    expect(result.correction_multiplier).toBe(1);
  });

  it('returns numbers with expected precision', () => {
    const result = calculateMROI(baseParams);
    expect(typeof result.mroi).toBe('number');
    expect(typeof result.co2_reduction).toBe('number');
    expect(typeof result.output_racf_units).toBe('number');
    expect(typeof result.correction_multiplier).toBe('number');
    expect(typeof result.efu_input_corrected).toBe('number');
  });
});

// ---------------------------------------------------------------------------
// calculateFLR
// ---------------------------------------------------------------------------
describe('calculateFLR', () => {
  it('returns FLR = 0 when JIM-30 = 100 (no friction)', () => {
    const params = {
      delta_e_saved: 10000,
      grid_co2: 0.35,
      racf: 526,
      jim30: 100,
      d_multiplier: 0.3,
      efu_input_direct: 10,
    };
    const result = calculateFLR(params);
    expect(result.flr).toBe(0);
    expect(result.friction).toBe(0);
  });

  it('returns maximum FLR when JIM-30 = 0', () => {
    const params = {
      delta_e_saved: 10000,
      grid_co2: 0.35,
      racf: 526,
      jim30: 0,
      d_multiplier: 0.3,
      efu_input_direct: 10,
    };
    const result = calculateFLR(params);
    // friction = 10*(1+0.3) - 10 = 3; corrected = 13; FLR = 3/13*100 ≈ 23.1%
    expect(result.flr).toBeCloseTo(23.1, 0);
    expect(result.friction).toBeCloseTo(3, 1);
  });

  it('returns FLR = 0 when efu_input_corrected is zero', () => {
    const params = {
      delta_e_saved: 0,
      grid_co2: 0,
      racf: 526,
      jim30: 50,
      d_multiplier: 0,
      efu_input_direct: 0,
    };
    const result = calculateFLR(params);
    expect(result.flr).toBe(0);
  });

  it('FLR is between 0 and 100 for all valid inputs', () => {
    const testCases = [
      { jim30: 0, d_multiplier: 0.3, efu_input_direct: 10 },
      { jim30: 50, d_multiplier: 0.3, efu_input_direct: 10 },
      { jim30: 100, d_multiplier: 0.3, efu_input_direct: 10 },
      { jim30: 25, d_multiplier: 0.5, efu_input_direct: 5 },
    ];
    testCases.forEach(({ jim30, d_multiplier, efu_input_direct }) => {
      const result = calculateFLR({
        delta_e_saved: 10000, grid_co2: 0.35, racf: 526,
        jim30, d_multiplier, efu_input_direct,
      });
      expect(result.flr).toBeGreaterThanOrEqual(0);
      expect(result.flr).toBeLessThanOrEqual(100);
    });
  });
});

// ---------------------------------------------------------------------------
// detectParasitism
// ---------------------------------------------------------------------------
describe('detectParasitism', () => {
  it('constant FLR_PARASITISM_THRESHOLD is 20', () => {
    expect(FLR_PARASITISM_THRESHOLD).toBe(20);
  });

  it('flags parasitism when FLR > 20%', () => {
    const result = detectParasitism(21);
    expect(result.parasitism).toBe(true);
    expect(result.status).toBe('Metabolic Parasitism Detected');
  });

  it('does NOT flag parasitism when FLR = 20% (exact threshold is exclusive)', () => {
    const result = detectParasitism(20);
    expect(result.parasitism).toBe(false);
    expect(result.status).toBe('Within Acceptable Bounds');
  });

  it('does NOT flag parasitism when FLR < 20%', () => {
    const result = detectParasitism(15);
    expect(result.parasitism).toBe(false);
  });

  it('flags parasitism for FLR = 100%', () => {
    const result = detectParasitism(100);
    expect(result.parasitism).toBe(true);
  });

  it('does NOT flag parasitism for FLR = 0%', () => {
    const result = detectParasitism(0);
    expect(result.parasitism).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// classifyMROI
// ---------------------------------------------------------------------------
describe('classifyMROI', () => {
  it('classifies MROI > 25 as SYMBIOTIC', () => {
    const result = classifyMROI(30);
    expect(result.label).toBe('SYMBIOTIC');
    expect(result.color).toBe('#16a34a');
    expect(result.emoji).toBe('✅');
  });

  it('classifies MROI = 26 as SYMBIOTIC (boundary)', () => {
    expect(classifyMROI(26).label).toBe('SYMBIOTIC');
  });

  it('classifies MROI = 25 as STABLE (25 is not > 25)', () => {
    expect(classifyMROI(25).label).toBe('STABLE');
  });

  it('classifies MROI = 10 as STABLE (lower boundary)', () => {
    expect(classifyMROI(10).label).toBe('STABLE');
  });

  it('classifies MROI between 10 and 25 as STABLE', () => {
    const result = classifyMROI(17);
    expect(result.label).toBe('STABLE');
    expect(result.color).toBe('#2563eb');
    expect(result.emoji).toBe('🔵');
  });

  it('classifies MROI = 0 as LIMITED', () => {
    expect(classifyMROI(0).label).toBe('LIMITED');
  });

  it('classifies MROI between 0 and 10 as LIMITED', () => {
    const result = classifyMROI(5);
    expect(result.label).toBe('LIMITED');
    expect(result.color).toBe('#d97706');
    expect(result.emoji).toBe('🟡');
  });

  it('classifies negative MROI as PARASITIC', () => {
    const result = classifyMROI(-5);
    expect(result.label).toBe('PARASITIC');
    expect(result.color).toBe('#dc2626');
    expect(result.emoji).toBe('🔴');
  });

  it('classifies MROI = -0.1 as PARASITIC', () => {
    expect(classifyMROI(-0.1).label).toBe('PARASITIC');
  });
});
