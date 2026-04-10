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
//   MROI   = (Output / Input) × 100  [%]
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

  // MROI = Output / Input × 100
  const mroi = efu_input_corrected !== 0
    ? (output_racf_units / efu_input_corrected) * 100
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

// ---------------------------------------------------------------------------
// CEWS — Civilization Early Warning System
// Dynamic Weighting Engine (EFU 217.2 / UCAIF v3.1)
// ---------------------------------------------------------------------------

/**
 * Calculate the dynamic composite weight for a single CEWS indicator
 * based on its metadata values.
 *
 * Formula (Hagyma Metódus, §2):
 *   weight = w_irrev × latency_factor × recovery_factor × cascade_boost × shadow_boost
 *
 * All factors are dimensionless multipliers that modulate the base w_irrev weight.
 *
 * @param {object} metadata
 * @param {number}  metadata.w_irrev       - reversibility weight 0–1
 * @param {string}  metadata.latency       - 'immediate' | 'medium' | 'long'
 * @param {string}  metadata.recovery_time - 'short' | 'medium' | 'long' | 'very_long'
 * @param {boolean} metadata.cascade_flag  - cascade risk flag
 * @param {boolean} metadata.shadow_delta  - hidden flux flag
 * @returns {number} composite weight (0–1 range, higher = more critical)
 */
export function calculateDynamicWeight(metadata) {
  const {
    w_irrev       = 0.5,
    latency       = 'medium',
    recovery_time = 'medium',
    cascade_flag  = false,
    shadow_delta  = false,
  } = metadata;

  // Latency factor: shorter latency in an early-warning context means
  // the system must react faster → slightly higher urgency weight.
  const latencyFactor = { immediate: 1.15, medium: 1.0, long: 0.9 }[latency] ?? 1.0;

  // Recovery factor: longer recovery → higher irreversibility → higher weight.
  const recoveryFactor = { short: 0.8, medium: 1.0, long: 1.15, very_long: 1.3 }[recovery_time] ?? 1.0;

  // Cascade boost: indicators that can trigger domino effects get +20% weight.
  const cascadeBoost = cascade_flag ? 1.2 : 1.0;

  // Shadow delta boost: hidden flux indicators carry additional uncertainty → +10%.
  const shadowBoost = shadow_delta ? 1.1 : 1.0;

  const raw = w_irrev * latencyFactor * recoveryFactor * cascadeBoost * shadowBoost;

  // Clamp to [0, 1]
  return Math.round(Math.min(Math.max(raw, 0), 1) * 1000) / 1000;
}

/**
 * Classify a Trajectory Vector score (0–100) into a civilisation direction.
 *
 * @param {number} score - Trajectory Vector score (0 = collapse, 100 = regenerative)
 * @returns {{ label: string, labelHu: string, color: string, emoji: string, track: string }}
 */
export function classifyTrajectoryVector(score) {
  if (score >= 70) return { label: 'Regenerative Path',   labelHu: 'Regeneratív Pálya',    color: '#16a34a', emoji: '🌱', track: 'A' };
  if (score >= 50) return { label: 'Stable Path',         labelHu: 'Stabil Pálya',          color: '#2563eb', emoji: '🔵', track: 'A' };
  if (score >= 30) return { label: 'Degradation Path',    labelHu: 'Degradációs Pálya',     color: '#d97706', emoji: '🟡', track: 'A' };
  if (score >= 15) return { label: 'Crisis Path',         labelHu: 'Krízis Pálya',          color: '#ea580c', emoji: '🟠', track: 'B' };
  return                   { label: 'Collapse Path',      labelHu: 'Összeomlási Pálya',     color: '#dc2626', emoji: '🔴', track: 'B' };
}

/**
 * Determine the CEWS trigger level (colour) from a composite index score (0–100).
 *
 * @param {number} score
 * @returns {{ id: string, label: string, labelHu: string, color: string, action: string }}
 */
export function classifyCewsTrigger(score) {
  if (score >= 70) return { id: 'green',  label: 'Green',  labelHu: 'Zöld',    color: '#16a34a', action: 'Monitoring' };
  if (score >= 50) return { id: 'yellow', label: 'Yellow', labelHu: 'Sárga',   color: '#ca8a04', action: 'Enhanced surveillance' };
  if (score >= 30) return { id: 'orange', label: 'Orange', labelHu: 'Narancs', color: '#ea580c', action: 'Track A activation' };
  return                   { id: 'red',   label: 'Red',    labelHu: 'Piros',   color: '#dc2626', action: 'Fire Chief Protocol' };
}
