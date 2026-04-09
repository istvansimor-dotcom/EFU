/**
 * efu-engine.js — EFU Biophysical Calculation Engine
 *
 * Implements:
 *   - MROI (Metabolic Return on Investment)
 *   - FLR (Frictional Loss Rate) with parasitism detection
 *   - MROI classification thresholds
 *
 * All formulas are consistent with caseStudies.js parameter structure:
 *   { delta_e_saved, grid_co2, racf, jim30, d_multiplier, efu_input_direct }
 *
 * References:
 *   MROI Working Paper v1.3 (Simor, 2026)
 *   S1–S4 Supplementary Materials
 *   EFU v5.1 Framework
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** FLR threshold above which metabolic parasitism is flagged (§FLR definition) */
export const FLR_PARASITISM_THRESHOLD = 20; // percent

// ---------------------------------------------------------------------------
// MROI (Metabolic / Energy Return on Investment)
//
// Formula (MROI Working Paper v1.3, §2.1):
//   Output = CO₂ reduction expressed in RACF units
//           = (ΔE_saved × grid_CO₂) / RACF
//   Input  = EFU_input(corrected)
//           = EFU_input(direct) × (1 + (1 − JIM30/100) × D)
//   MROI   = (Output / Input − 1) × 100  [%]
//
// The JIM-30 correction penalises low-repairability systems by increasing the
// effective biophysical input cost (infrastructure debt, entropy, supply chain
// overhead). Source: S2 §S2.3.
// ---------------------------------------------------------------------------

/**
 * Apply the JIM-30 infrastructure-debt correction to the direct EFU input.
 *
 * @param {number} efu_input_direct - raw biophysical EFU input (EFU units)
 * @param {number} jim30            - JIM-30 repairability score (0–100)
 * @param {number} d_multiplier     - infrastructure debt multiplier (default 0.3)
 * @returns {number} corrected EFU input
 */
export function applyJIM30Correction(efu_input_direct, jim30, d_multiplier) {
  const jim30_fraction = Math.min(Math.max(jim30, 0), 100) / 100;
  return efu_input_direct * (1 + (1 - jim30_fraction) * d_multiplier);
}

/**
 * Calculate MROI and all intermediate values.
 *
 * @param {object} params
 * @param {number} params.delta_e_saved    - energy savings (kWh/year)
 * @param {number} params.grid_co2         - grid CO₂ intensity (kg CO₂/kWh)
 * @param {number} params.racf             - RACF baseline (kg CO₂/person/year)
 * @param {number} params.jim30            - JIM-30 score (0–100)
 * @param {number} params.d_multiplier     - infrastructure debt multiplier
 * @param {number} params.efu_input_direct - direct biophysical EFU input
 * @returns {object} calculation result
 */
export function calculateMROI(params) {
  const { delta_e_saved, grid_co2, racf, jim30, d_multiplier, efu_input_direct } = params;

  // Output: useful CO₂ reduction in RACF-normalised units
  const co2_reduction = delta_e_saved * grid_co2;              // kg CO₂/year
  const output_racf_units = racf > 0 ? co2_reduction / racf : 0; // dimensionless RACF units

  // Input: JIM-30 corrected biophysical cost
  const efu_input_corrected = applyJIM30Correction(efu_input_direct, jim30, d_multiplier);
  const correction_multiplier = efu_input_direct !== 0
    ? efu_input_corrected / efu_input_direct
    : 1;

  // MROI = (Output / Input − 1) × 100
  const mroi = efu_input_corrected !== 0
    ? (output_racf_units / efu_input_corrected - 1) * 100
    : 0;

  return {
    co2_reduction:        Math.round(co2_reduction),
    output_racf_units:    Math.round(output_racf_units * 100) / 100,
    correction_multiplier: Math.round(correction_multiplier * 1000) / 1000,
    efu_input_corrected:  Math.round(efu_input_corrected * 100) / 100,
    mroi:                 Math.round(mroi * 10) / 10,
  };
}

// ---------------------------------------------------------------------------
// FLR — Frictional Loss Rate
//
// FLR measures the fraction of total corrected input attributable to
// infrastructure-debt friction (JIM-30 / D overhead).
//
//   friction  = EFU_input(corrected) − EFU_input(direct)
//   FLR       = (friction / EFU_input(corrected)) × 100  [%]
//
// Interpretation: a high FLR indicates that a large share of the system's
// biophysical cost is driven by low repairability and supply-chain entropy
// rather than the core energy service itself — a signature of metabolic
// parasitism.
// ---------------------------------------------------------------------------

/**
 * Calculate the Frictional Loss Rate (FLR).
 *
 * @param {object} params - same structure as calculateMROI
 * @returns {{ flr: number, friction: number, efu_input_corrected: number }}
 */
export function calculateFLR(params) {
  const { jim30, d_multiplier, efu_input_direct } = params;
  const efu_input_corrected = applyJIM30Correction(efu_input_direct, jim30, d_multiplier);
  const friction = efu_input_corrected - efu_input_direct;
  const flr = efu_input_corrected > 0
    ? (friction / efu_input_corrected) * 100
    : 0;

  return {
    friction:            Math.round(friction * 100) / 100,
    efu_input_corrected: Math.round(efu_input_corrected * 100) / 100,
    flr:                 Math.round(flr * 10) / 10,
  };
}

// ---------------------------------------------------------------------------
// Parasitism detection
// ---------------------------------------------------------------------------

/**
 * Evaluate whether the FLR exceeds the metabolic parasitism threshold.
 *
 * @param {number} flr - Frictional Loss Rate (%)
 * @returns {{ parasitism: boolean, status: string }}
 */
export function detectParasitism(flr) {
  const parasitism = flr > FLR_PARASITISM_THRESHOLD;
  return {
    parasitism,
    status: parasitism ? 'Metabolic Parasitism Detected' : 'Within Acceptable Bounds',
  };
}

// ---------------------------------------------------------------------------
// MROI classification
// ---------------------------------------------------------------------------

/**
 * Classify an MROI value according to Working Paper v1.3, §2.3 thresholds.
 *
 * @param {number} mroi
 * @returns {{ label: string, color: string, emoji: string }}
 */
export function classifyMROI(mroi) {
  if (mroi > 25) return { label: 'SYMBIOTIC', color: '#16a34a', emoji: '✅' };
  if (mroi >= 10) return { label: 'STABLE',   color: '#2563eb', emoji: '🔵' };
  if (mroi >= 0)  return { label: 'LIMITED',  color: '#d97706', emoji: '🟡' };
  return            { label: 'PARASITIC', color: '#dc2626', emoji: '🔴' };
}
