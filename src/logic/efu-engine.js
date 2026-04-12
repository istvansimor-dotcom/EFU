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

// ---------------------------------------------------------------------------
// EFU 600.00 — Metabolikus Ragadozó (Metabolic Predator) v2.1
// Tier 0 Root Operator — Domain: A-BIOFIZ / E-GAZDASÁGI / TEMPORÁLIS
// Reference: EFU 600.00 KALIBRÁLT FINAL OPERÁTOR (2026.03.30)
// ---------------------------------------------------------------------------

const MR_BETA = 2.1;   // synergy exponent (§II)
const MR_LAMBDA = 1.5; // P_syn decay coefficient (§III empirical fit)

/**
 * Sigmoid activation function σ(x) = 1 / (1 + e^(-x))
 * @param {number} x
 * @returns {number} value in (0,1)
 */
function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

/**
 * Calculate the normalised MR_score from mechanism activations.
 *
 * Formula (§II Master Operator):
 *   MR_score = σ( (ΣM_i) × DCC × Network × e^(β × Syn) )
 *   where Syn = Σ(M_i × M_j)  for all i < j
 *
 * @param {number[]} mechanisms - Array of M1–M12 activation values (each 0–1)
 * @param {number}   dcc        - Decision-Capture Coefficient 0–1 (default 1)
 * @param {number}   network    - Network spread factor 0–1 (default 1)
 * @returns {{ mr_score: number, sum_m: number, syn: number, inner: number }}
 */
export function calculateMRScore(mechanisms, dcc = 1, network = 1) {
  const n = mechanisms.length;

  // ΣM_i — linear sum
  const sum_m = mechanisms.reduce((acc, m) => acc + m, 0);

  // Syn = Σ(M_i × M_j) for i < j — pairwise synergy
  let syn = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      syn += mechanisms[i] * mechanisms[j];
    }
  }

  const inner = sum_m * dcc * network * Math.exp(MR_BETA * syn);
  const mr_score = sigmoid(inner);

  return {
    mr_score: Math.round(mr_score * 1000) / 1000,
    sum_m:    Math.round(sum_m * 1000) / 1000,
    syn:      Math.round(syn * 1000) / 1000,
    inner:    Math.round(inner * 1000) / 1000,
  };
}

/**
 * Calculate the synergy suppression multiplier P_syn.
 *
 * Formula (§III):
 *   P_syn = e^( -λ × MR_score )
 *
 * Empirical verification:
 *   MR_score low  (~0.2) → P_syn ≈ 0.74
 *   MR_score mid  (~0.5) → P_syn ≈ 0.47
 *   MR_score high (~0.9) → P_syn ≈ 0.26
 *
 * @param {number} mr_score - normalised MR score [0,1]
 * @param {number} lambda   - decay coefficient (default MR_LAMBDA = 1.5)
 * @returns {number} P_syn [0,1]
 */
export function calculatePSyn(mr_score, lambda = MR_LAMBDA) {
  const p_syn = Math.exp(-lambda * mr_score);
  return Math.round(p_syn * 1000) / 1000;
}

/**
 * Calculate effective metabolic efficiency η(W)_eff.
 *
 * Formula (§VII Interruptor):
 *   η(W)_eff = Base / (1 + MR_score × Σ600.x) × P_syn
 *
 * @param {number} base      - baseline efficiency (0–100 %)
 * @param {number} mr_score  - normalised MR score [0,1]
 * @param {number} p_syn     - synergy suppression multiplier [0,1]
 * @param {number} module_sum - Σ600.x active module load (default 1)
 * @returns {{ eta_eff: number, reduction_pct: number }}
 */
export function calculateEfficiency(base, mr_score, p_syn, module_sum = 1) {
  const eta_eff = (base / (1 + mr_score * module_sum)) * p_syn;
  const reduction_pct = base > 0 ? Math.round(((base - eta_eff) / base) * 1000) / 10 : 0;
  return {
    eta_eff:       Math.round(eta_eff * 100) / 100,
    reduction_pct: Math.round(reduction_pct * 10) / 10,
  };
}

/**
 * Calculate the Perception-Reality Divergence (PRD).
 *
 * Formula (§X):
 *   PRD = |η_real - η_perceived|
 *
 * @param {number} eta_real      - real efficiency (0–100 %)
 * @param {number} eta_perceived - perceived efficiency (0–100 %)
 * @returns {{ prd: number, level: string, color: string }}
 */
export function calculatePRD(eta_real, eta_perceived) {
  const prd = Math.abs(eta_real - eta_perceived) / 100;
  let level, color;
  if (prd < 0.1) { level = 'Stabil';           color = '#16a34a'; }
  else if (prd < 0.3) { level = 'Figyelmeztető'; color = '#ca8a04'; }
  else if (prd < 0.5) { level = 'Kritikus';      color = '#ea580c'; }
  else                { level = 'Percepciós vakság'; color = '#dc2626'; }
  return { prd: Math.round(prd * 1000) / 1000, level, color };
}

/**
 * Determine the Θ_collapse state (§VI).
 *
 * Collapse conditions:
 *   dη_W/dt < 0  (efficiency declining)
 *   dN_cogn/dt < 0 (cognitive capacity declining)
 *   P_syn < 0.5  (synergy suppression active)
 *
 * @param {number}  mr_score       - normalised MR score
 * @param {number}  p_syn          - synergy multiplier
 * @param {boolean} eta_declining  - is efficiency trend negative?
 * @param {boolean} cogn_declining - is cognitive capacity trend negative?
 * @returns {{ collapse_risk: boolean, tier: string, color: string, flags: string[] }}
 */
export function classifyMRState(mr_score, p_syn, eta_declining = false, cogn_declining = false) {
  const flags = [];
  if (p_syn < 0.5)         flags.push('P_syn < 0.5 — szinergia szuppresszió');
  if (eta_declining)       flags.push('dη_W/dt < 0 — hatékonyság csökken');
  if (cogn_declining)      flags.push('dN_cogn/dt < 0 — kognitív kapacitás csökken');
  if (mr_score > 0.85)     flags.push('MR_score > 0.85 — TIER 0 tartomány');

  const collapse_risk = p_syn < 0.5 && eta_declining && cogn_declining;

  let tier, color;
  if (mr_score >= 0.85 && p_syn < 0.5) {
    tier = 'TIER 0 — SZINERGIKUS MASTER PARAZITA';
    color = '#7c3aed';
  } else if (mr_score >= 0.6 || p_syn < 0.65) {
    tier = 'TIER 1 — AKTÍV PARAZITA';
    color = '#dc2626';
  } else if (mr_score >= 0.35) {
    tier = 'TIER 2 — FEJLŐDŐ PARAZITA';
    color = '#ea580c';
  } else {
    tier = 'EGÉSZSÉGES RENDSZER';
    color = '#16a34a';
  }

  return { collapse_risk, tier, color, flags };
}

// ---------------------------------------------------------------------------
// EFU 600.2 — Molekuláris Rendszerhatár-Események (MSBE)
// Molecular System Boundary Events
// Reference: EFU 600.2 (2026.04)
// ---------------------------------------------------------------------------

/**
 * Classify whether a substance meets MSBE criteria.
 *
 * Classification rules (§600.2.3):
 *   C1: halflife > eco_cycle (years)
 *   C2: baf > 1
 *   C3: metabolite_more_toxic === true
 *   C4: no_natural_analogue === true
 *
 * At least ONE criterion is sufficient for MSBE classification.
 *
 * @param {{ halflife: number, eco_cycle: number, baf: number, metabolite_more_toxic: boolean, no_natural_analogue: boolean }} params
 * @returns {{ criteria_met: string[], is_msbe: boolean, precautionary: boolean, criteria_details: object[] }}
 */
export function classifyMSBE({ halflife, eco_cycle = 25, baf, metabolite_more_toxic, no_natural_analogue }) {
  const criteria_details = [
    { id: 'C1', met: halflife > eco_cycle,      value: halflife,            threshold: `> ${eco_cycle} év` },
    { id: 'C2', met: baf > 1,                   value: baf,                 threshold: '> 1' },
    { id: 'C3', met: metabolite_more_toxic,      value: metabolite_more_toxic, threshold: 'igen' },
    { id: 'C4', met: no_natural_analogue,        value: no_natural_analogue, threshold: 'igen' },
  ];

  const criteria_met = criteria_details.filter((c) => c.met).map((c) => c.id);
  const is_msbe = criteria_met.length > 0;

  return { criteria_met, is_msbe, criteria_details };
}

/**
 * Calculate the MSBE risk score (0–100) and determine SBE trigger level.
 *
 * Score is based on number of criteria met, BAF magnitude, and half-life ratio.
 *
 * @param {{ halflife: number, eco_cycle: number, baf: number, metabolite_more_toxic: boolean, no_natural_analogue: boolean, evidence_level: string }} params
 * @returns {{ msbe_score: number, sbe_level: number, criteria_met: string[] }}
 */
export function calculateMSBEScore({
  halflife,
  eco_cycle = 25,
  baf,
  metabolite_more_toxic,
  no_natural_analogue,
  evidence_level = 'none',
}) {
  const { criteria_met } = classifyMSBE({ halflife, eco_cycle, baf, metabolite_more_toxic, no_natural_analogue });

  // Base score: each criterion contributes 20 points
  let score = criteria_met.length * 20;

  // BAF severity bonus: log scale (BAF 1 → 0, BAF 10 → +10, BAF 100 → +20)
  if (baf > 1) score += Math.min(Math.log10(baf) * 10, 20);

  // Half-life severity bonus: ratio to eco_cycle (capped at +15)
  if (halflife > eco_cycle) {
    const ratio = Math.min(halflife / eco_cycle, 100);
    score += Math.min(Math.log10(ratio) * 7.5, 15);
  }

  // Evidence level multiplier (no evidence → precautionary reduction)
  const evidenceMultiplier = { none: 0.6, model: 0.8, lab: 1.0, field: 1.1, confirmed: 1.2 }[evidence_level] ?? 1.0;
  score = Math.min(Math.round(score * evidenceMultiplier), 100);

  // Determine SBE trigger level
  let sbe_level;
  if (criteria_met.length === 0)      sbe_level = 0;
  else if (score < 35)                sbe_level = 1; // precautionary
  else if (score < 65)                sbe_level = 2; // confirmed
  else                                sbe_level = 3; // critical/irreversible

  return { msbe_score: score, sbe_level, criteria_met };
}

/**
 * Determine the SBE trigger level label/color for a given sbe_level integer (0–3).
 *
 * @param {number} sbe_level
 * @returns {{ id: string, label: string, labelEn: string, color: string, action: string, cews_trigger: string }}
 */
export function triggerSBELevel(sbe_level) {
  const levels = [
    { id: 'SBE_0', label: 'Nincs MSBE kritérium',            labelEn: 'No MSBE criteria met',          color: '#16a34a', action: 'Monitoring folytatása',                                                  cews_trigger: 'green'  },
    { id: 'SBE_1', label: 'MSBE — Elővigyázatossági',        labelEn: 'MSBE — Precautionary',           color: '#ca8a04', action: 'Megerősítő mérés szükséges',                                             cews_trigger: 'yellow' },
    { id: 'SBE_2', label: 'MSBE — Megerősített esemény',     labelEn: 'MSBE — Confirmed event',         color: '#ea580c', action: 'Track A CEWS aktiválás; 600.52-CFI-B réteg frissítés',                   cews_trigger: 'orange' },
    { id: 'SBE_3', label: 'MSBE — Kritikus / Irreverzibilis',labelEn: 'MSBE — Critical / Irreversible', color: '#dc2626', action: 'Fire Chief Protokoll; 600.7 SBE maximális szint; azonnali beavatkozás',  cews_trigger: 'red'    },
  ];
  return levels[Math.max(0, Math.min(sbe_level, 3))];
}

// ---------------------------------------------------------------------------
// EFU 600.52 — PFAS & „Örök Vegyületek" (CFI-B Motor)
// Bio-fragmentációs Kémiai Index — W_irrev = 0.95 · SEV MAX
// Reference: EFU 600.52 v1.0 FINAL
// ---------------------------------------------------------------------------

const CFIB_W_IRREV = 0.95;

/**
 * Calculate the CFI-B (Chemical Bio-fragmentation Index) score.
 *
 * Formula (§3.2):
 *   CFI-B = Σ (C_i × P_i × W_irrev) × (1 / F_detox)
 *
 * Where:
 *   C_i    = tissue concentration [ng/g]
 *   P_i    = BAF (bioaccumulation potential, dimensionless)
 *   W_irrev = reversibility weight (0.95 for PFAS)
 *   F_detox = actual detox flux [EFU/day] — when 0, CFI-B diverges (capped at 9999)
 *
 * @param {Array<{ concentration: number, baf: number }>} compounds - list of PFAS compounds
 * @param {number} f_detox - detox flux in EFU/day (> 0)
 * @param {number} w_irrev - reversibility weight (default 0.95)
 * @returns {{ cfib: number, cfib_capped: number, compounds_sum: number, level: object }}
 */
export function calculateCFIB(compounds, f_detox = 1, w_irrev = CFIB_W_IRREV) {
  const sum = compounds.reduce((acc, { concentration = 0, baf = 1 }) => acc + concentration * baf, 0);
  const raw = f_detox > 0 ? sum * w_irrev * (1 / f_detox) : Infinity;
  const cfib_capped = isFinite(raw) ? Math.round(Math.min(raw, 9999) * 100) / 100 : 9999;

  const levels = [
    { min: 0,   max: 100,  label: 'ZÖLD',    color: '#16a34a', action: 'Nincs beavatkozás' },
    { min: 100, max: 300,  label: 'SÁRGA',   color: '#ca8a04', action: 'Monitoring fokozás' },
    { min: 300, max: 600,  label: 'NARANCS', color: '#ea580c', action: 'Forrás-karantén' },
    { min: 600, max: 9999, label: 'PIROS',   color: '#dc2626', action: 'Azonnali beavatkozás' },
  ];
  const level = levels.find((l) => cfib_capped >= l.min && cfib_capped < l.max) ?? levels[levels.length - 1];

  return {
    cfib:          cfib_capped,
    cfib_capped,
    compounds_sum: Math.round(sum * 1000) / 1000,
    level,
  };
}

/**
 * Classify PFAS audit indicator values against thresholds.
 *
 * @param {{ p_lod_water: number, p_lod_blood: number, b_acc: number, i_block: number, afff_rad: number, c_chain: number }} readings
 * @returns {{ breaches: string[], trigger_protocol: boolean, alerts: string[] }}
 */
export function classifyPFASAudit(readings) {
  const {
    p_lod_water = 0,
    p_lod_blood = 0,
    b_acc       = 0,
    i_block     = 0,
    afff_rad    = 0,
    c_chain     = 0,
  } = readings;

  const checks = [
    { id: 'P-LOD',      breach: p_lod_water > 100, msg: `P-LOD (víz) ${p_lod_water} ng/L > 100 ng/L (WHO 2022)` },
    { id: 'P-LOD²',     breach: p_lod_blood > 20,  msg: `P-LOD² (vér) ${p_lod_blood} ng/mL > 20 ng/mL (EFSA)` },
    { id: 'B-ACC',      breach: b_acc > 10,         msg: `B-ACC ${b_acc}%/év > 10%/év` },
    { id: 'I-BLOCK',    breach: i_block > 15,       msg: `I-BLOCK ${i_block}% > 15%` },
    { id: 'AFFF-RAD',   breach: afff_rad > 500,     msg: `AFFF-RAD ${afff_rad}m > 500m zóna` },
    { id: 'C-CHAIN',    breach: c_chain > 11,       msg: `C-CHAIN (hal) ${c_chain} ng/g > 11 ng/g` },
  ];

  const breaches = checks.filter((c) => c.breach).map((c) => c.id);
  const alerts   = checks.filter((c) => c.breach).map((c) => c.msg);

  // Audit trigger: water + blood thresholds both breached, or i_block > 15
  const trigger_protocol = (p_lod_water > 100 && p_lod_blood > 20) || i_block > 15;

  return { breaches, trigger_protocol, alerts };
}

/**
 * Calculate healing efficiency degradation due to PFAS load.
 *
 * Formula (§5.2):
 *   η_heal = η_max × (1 – 0.4 × (CFI-B_patient / CFI-B_ref))
 *
 * Clamped to [0, η_max].
 *
 * @param {number} cfib_patient - CFI-B value for the patient
 * @param {number} eta_max      - maximum healing efficiency (0–1, default 1.0)
 * @param {number} cfib_ref     - reference CFI-B (default 300 — NARANCS threshold)
 * @returns {{ eta_heal: number, reduction_pct: number }}
 */
export function calculateHealingEfficiency(cfib_patient, eta_max = 1.0, cfib_ref = 300) {
  const raw = eta_max * (1 - 0.4 * (cfib_patient / cfib_ref));
  const eta_heal = Math.round(Math.max(0, Math.min(raw, eta_max)) * 1000) / 1000;
  const reduction_pct = Math.round((1 - eta_heal / eta_max) * 1000) / 10;
  return { eta_heal, reduction_pct };
}

// ---------------------------------------------------------------------------
// EFU 600.85 — Boldogság-gazdaság Paradoxona (Happiness Economy Paradox)
// Eudaimónia vs. Hedónia | F-META Domain | FC-APPROVED | v2.1 FINAL
// Reference: EFU 600.85 v2.1 (2026.04.10)
// ---------------------------------------------------------------------------

const ETA_W_BASELINE = 0.70;
const CBS_THRESHOLD  = 0.6;

/**
 * Calculate the Boldogság-gazdaság Paradoxon (BH) indicator.
 *
 * Two forms (§II):
 *   Rolling-window:   BH_t = |ΔH_t / ΔGDP_t|
 *   Elasticity-based: BH   = |(dH/H) / (dGDP/GDP)|
 *
 * @param {{ delta_h: number, delta_gdp: number }} params  — absolute changes
 * @returns {{ bh: number, state: string, interpretation: string }}
 */
export function calculateBH({ delta_h, delta_gdp }) {
  if (delta_gdp === 0) return { bh: 0, state: 'PARADOX', interpretation: 'GDP stagnál — mérés nem lehetséges' };
  const bh = Math.abs(delta_h / delta_gdp);
  const bh_r = Math.round(bh * 1000) / 1000;
  const state = bh_r < 0.15 ? 'STRONG_PARADOX' : bh_r < 0.50 ? 'MODERATE_PARADOX' : 'NO_PARADOX';
  const interpretation = {
    STRONG_PARADOX:   'Erős Easterlin-paradoxon — GDP nő, boldogság nem követi',
    MODERATE_PARADOX: 'Mérsékelt paradoxon — részleges kapcsolat',
    NO_PARADOX:       'Nem paradox állapot — boldogság érzékenyen követi a GDP-t',
  }[state];
  return { bh: bh_r, state, interpretation };
}

/**
 * Calculate the CBS (Cognitive-Biosphere-Stress) hybrid indicator.
 *
 * Formula (§IV.3):  CBS = α × CBS_ratio + (1−α) × CBS_entropy
 *
 * CBS_ratio   = stress_events / total_events
 * CBS_entropy = −Σ p_i × log(p_i)  (normalised to [0,1] via /log(k))
 *
 * @param {{ stress_events: number, total_events: number, probabilities: number[], alpha: number }} params
 * @returns {{ cbs: number, cbs_ratio: number, cbs_entropy: number, is_high: boolean }}
 */
export function calculateCBS({ stress_events, total_events, probabilities = [], alpha = 0.5 }) {
  const cbs_ratio = total_events > 0 ? Math.min(stress_events / total_events, 1) : 0;

  // Shannon entropy normalised to [0,1] by dividing by log(k)
  let cbs_entropy = 0;
  const k = probabilities.length;
  if (k > 1) {
    const raw = -probabilities.reduce((s, p) => {
      if (p <= 0) return s;
      return s + p * Math.log(p);
    }, 0);
    cbs_entropy = Math.min(raw / Math.log(k), 1);
  }

  const cbs = Math.round((alpha * cbs_ratio + (1 - alpha) * cbs_entropy) * 1000) / 1000;
  return { cbs, cbs_ratio: Math.round(cbs_ratio * 1000) / 1000, cbs_entropy: Math.round(cbs_entropy * 1000) / 1000, is_high: cbs >= CBS_THRESHOLD };
}

/**
 * Calculate η(W) — happiness efficiency as lagged derivative of H over CBS.
 *
 * Composite form (§V.3):  η(W) = w_h × η_h + w_e × η_e
 *
 * Where η_h and η_e are estimated from hedonic/eudaimonic happiness changes
 * and the lagged CBS change.
 *
 * @param {{ delta_h_h: number, delta_h_e: number, delta_cbs_lag: number, w_h: number, w_e: number }} params
 * @returns {{ eta_w: number, eta_h: number, eta_e: number, state: string, description: string }}
 */
export function calculateEtaW({ delta_h_h, delta_h_e, delta_cbs_lag, w_h = 0.72, w_e = 0.28 }) {
  if (Math.abs(delta_cbs_lag) < 1e-10) {
    return { eta_w: 0, eta_h: 0, eta_e: 0, state: 'ADAPTATION', description: 'Adaptáció / deszenzitizáció — közömbös rendszerállapot' };
  }
  const eta_h = Math.round((delta_h_h / delta_cbs_lag) * 1000) / 1000;
  const eta_e = Math.round((delta_h_e / delta_cbs_lag) * 1000) / 1000;
  const eta_w = Math.round((w_h * eta_h + w_e * eta_e) * 1000) / 1000;

  let state, description;
  if (eta_w > 0.05) {
    state = 'EUDAIMONIC';
    description = 'Eudaimonikus válasz — stressz mellett boldogság nő';
  } else if (eta_w < -0.05) {
    state = 'HEDONIC_DROP';
    description = 'Hedónikus visszaesés — stressz-növekedés boldogságcsökkenést okoz';
  } else {
    state = 'ADAPTATION';
    description = 'Adaptáció / deszenzitizáció — közömbös rendszerállapot';
  }
  return { eta_w, eta_h, eta_e, state, description };
}

/**
 * Calculate the BGP_score (Boldogság-gazdaság Parazitizmus Index).
 *
 * Formula (§III):  BGP = (H_spend_per_capita × DT_index) / (η(W)_baseline + |η(W)|)
 *
 * @param {{ h_spend_per_capita: number, dt_index: number, eta_w: number, eta_w_baseline?: number }} params
 * @returns {{ bgp: number, zone: string, color: string, eta_effect: string }}
 */
export function calculateBGPScore({ h_spend_per_capita, dt_index, eta_w, eta_w_baseline = ETA_W_BASELINE }) {
  const denom = eta_w_baseline + Math.abs(eta_w);
  const bgp = denom > 0 ? Math.round((h_spend_per_capita * dt_index) / denom * 1000) / 1000 : Infinity;

  let zone, color, eta_effect;
  if (bgp <= 0.2)      { zone = 'EUDAIMÓNIA';  color = '#047857'; eta_effect = 'Növeli — FC Farm típus'; }
  else if (bgp <= 1.0) { zone = 'REGENERATÍV'; color = '#0891b2'; eta_effect = 'Növeli — fenntartható'; }
  else if (bgp <= 3.0) { zone = 'SEMLEGES';    color = '#ca8a04'; eta_effect = 'Semleges'; }
  else                 { zone = 'PARAZITA';    color = '#dc2626'; eta_effect = 'Csökkenti — antiflux'; }

  return { bgp, zone, color, eta_effect };
}

/**
 * Calculate Δη(W) — the EU-calibrated paradox formula (§VIII).
 *
 * Formula: Δη(W) = η(W)_eudaimon × W_e − η(W)_hedón × W_h
 *
 * @param {{ eta_w_eudaimon: number, eta_w_hedon: number, w_e: number, w_h: number }} params
 * @returns {{ delta_eta_w: number, zone: string, color: string, description: string }}
 */
export function calculateDeltaEtaW({ eta_w_eudaimon, eta_w_hedon, w_e = 0.28, w_h = 0.72 }) {
  const delta = Math.round((eta_w_eudaimon * w_e - eta_w_hedon * w_h) * 1000) / 1000;

  let zone, color, description;
  if (delta >= 0.5)        { zone = 'EUDAIMÓNIA';     color = '#047857'; description = 'FC Farm szintű inverz struktúra'; }
  else if (delta > 0)      { zone = 'REGENERATÍV';    color = '#16a34a'; description = 'Pozitív nettó jóllét-egyenleg'; }
  else if (delta > -0.2)   { zone = 'SEMLEGES';       color = '#ca8a04'; description = 'Közel egyensúlyi állapot'; }
  else                     { zone = 'PARAZITA ZÓNA';  color = '#dc2626'; description = 'Hedónikus túlsúly — rendszeres nettó jóllét-csökkenés'; }

  return { delta_eta_w: delta, zone, color, description };
}

/**
 * Classify the CEWS state based on CBS trend and BGP/η(W) values.
 *
 * CEWS Trigger (§X.1):
 *   CBS↑  ∧  BGP_score > 1  ⇒  CRITICAL
 *   CBS↑  ∧  BGP_score < 1  ⇒  ADAPTIVE STRESS
 *   CBS↓  ∧  BGP_score < 1  ⇒  OPTIMAL GROWTH
 *   CBS↓  but  η_e < |η_h|  ⇒  LATENT DECLINE
 *
 * Stability (§XI):  GREEN  ⇔  η_e > |η_h|  ∧  BGP < 1  ∧  CBS↓
 *
 * @param {{ cbs_high: boolean, bgp: number, eta_e: number, eta_h: number }} params
 * @returns {{ state: string, label: string, color: string, description: string, action: string }}
 */
export function classifyCEWSHappinessState({ cbs_high, bgp, eta_e, eta_h }) {
  const eudaimon_dominant = eta_e > Math.abs(eta_h);
  const regenerative = bgp < 1;

  let state;
  if (cbs_high && !regenerative)               state = 'CRITICAL';
  else if (cbs_high && regenerative)           state = 'ADAPTIVE_STRESS';
  else if (!cbs_high && regenerative && eudaimon_dominant)  state = 'OPTIMAL_GROWTH';
  else                                         state = 'LATENT_DECLINE';

  const STATES = {
    CRITICAL:       { label: 'CRITICAL',        color: '#dc2626', description: 'Klasszikus krízis: stressz nő, boldogság csökken', action: 'Azonnali policy beavatkozás szükséges' },
    ADAPTIVE_STRESS:{ label: 'ADAPTIVE STRESS', color: '#ca8a04', description: 'Eudaimonikus növekedés stressz közben',             action: 'Eudaimonikus megerősítés javasolt' },
    OPTIMAL_GROWTH: { label: 'OPTIMAL GROWTH',  color: '#16a34a', description: 'Ideális: alacsony stressz, növekvő boldogság',      action: 'Rendszerstabilitás fenntartása' },
    LATENT_DECLINE: { label: 'LATENT DECLINE',  color: '#7c3aed', description: 'Rejtett romlás: kedvezőtlen tendencia látens stressz alatt', action: 'Monitoring fokozása szükséges' },
  };
  return { state, ...STATES[state] };
}

// ---------------------------------------------------------------------------
// EFU 600.0 — 600-as Szinergia-Mátrix (Antiflux Szinergia Alapoperátor)
// Tier 0 Meta | P_syn Kalibrációs Modul | FC-APPROVED | v1.0 FINAL
// Reference: EFU 600.0 v1.0 (2026.04.10)
// ---------------------------------------------------------------------------

const P_SYN_BASE_TABLE = [1.00, 0.85, 0.65, 0.40];

/**
 * Calculate the base P_syn from the number of active parasites.
 *
 * Scale (§IV.1):
 *   0 active → 1.00  |  1 active → 0.85  |  2 active → 0.65  |  3+ active → 0.40
 *
 * @param {number} activeCount  Number of active antiflux modules (0–3)
 * @returns {{ p_syn_base: number, active: number, label: string }}
 */
export function calculatePSynBase(activeCount) {
  const n = Math.max(0, Math.min(activeCount, 3));
  const p_syn_base = P_SYN_BASE_TABLE[n];
  return {
    p_syn_base,
    active: n,
    label: `${n} aktív parazita → P_syn = ${p_syn_base}`,
    supralinear: n === 3,
  };
}

/**
 * Apply P_syn modifiers to the base value (§IV.2).
 *
 * Each modifier is an object: { id, effect, active (bool) }
 * The modifier effects are summed and applied multiplicatively:
 *   P_syn_final = clamp(P_syn_base + sum(active_effects), 0, 1)
 *
 * @param {number} p_syn_base
 * @param {Array<{ id: string, effect: number, active: boolean }>} modifiers
 * @returns {{ p_syn: number, total_mod: number, applied: string[] }}
 */
export function applyPSynModifiers(p_syn_base, modifiers = []) {
  const applied = [];
  let total_mod = 0;
  for (const m of modifiers) {
    if (m.active) {
      total_mod += m.effect;
      applied.push(m.id);
    }
  }
  const p_syn = Math.round(Math.max(0, Math.min(p_syn_base + total_mod, 1.0)) * 1000) / 1000;
  return { p_syn, total_mod: Math.round(total_mod * 1000) / 1000, applied };
}

/**
 * Calculate η(W)_eff — the effective wellbeing flux efficiency (§V / 050.3).
 *
 * Formula: η(W)_eff = (η(W)_inst × η(W)_epi) × P_syn
 *
 * @param {{ eta_w_inst: number, eta_w_epi: number, p_syn: number }} params
 * @returns {{ eta_w_eff: number, base_product: number, loss_pct: number }}
 */
export function calculateEtaWEff({ eta_w_inst, eta_w_epi, p_syn }) {
  const base_product = Math.round(eta_w_inst * eta_w_epi * 1000) / 1000;
  const eta_w_eff    = Math.round(base_product * p_syn * 1000) / 1000;
  const loss_pct     = Math.round((1 - eta_w_eff / Math.max(base_product, 0.001)) * 1000) / 10;
  return { eta_w_eff, base_product, loss_pct };
}

/**
 * Classify CEWS state for the synergy module based on P_syn, N_cogn, EFM.
 *
 * CEWS trigger rules (§VII):
 *   (1) P_syn < 0.50  AND  N_cogn < 0.50  →  CEWS RED
 *   (2) RED + EFM fixation                →  CEWS CRITICAL
 *   P_syn < 0.80  OR  N_cogn < 0.70       →  CEWS AMBER
 *   else                                  →  CEWS GREEN
 *
 * @param {{ p_syn: number, n_cogn: number, efm_fixed: boolean, eta_w_eff: number }} params
 * @returns {{ state: string, label: string, color: string, action: string, eta_critical: boolean }}
 */
export function classifyCEWSSynergyState({ p_syn, n_cogn, efm_fixed = false, eta_w_eff }) {
  const eta_critical = eta_w_eff < 0.35;

  let state;
  if (p_syn < 0.50 && n_cogn < 0.50 && efm_fixed) {
    state = 'CRITICAL';
  } else if (p_syn < 0.50 && n_cogn < 0.50) {
    state = 'RED';
  } else if (p_syn < 0.60 || n_cogn < 0.60 || eta_critical) {
    state = 'AMBER';
  } else {
    state = 'GREEN';
  }

  const STATES = {
    GREEN:    { label: 'GREEN',    color: '#16a34a', action: 'Monitorozás elegendő' },
    AMBER:    { label: 'AMBER',    color: '#ca8a04', action: 'Primer prevenció: N_cogn védős, étrendváltás' },
    RED:      { label: 'RED',      color: '#dc2626', action: '600.53 detox első; kognitív visszanyerés prioritás' },
    CRITICAL: { label: 'CRITICAL', color: '#7c3aed', action: 'Azonnali rendszerbeavatkozás; EFM-védelem prioritás' },
  };
  return { state, ...STATES[state], eta_critical };
}

// ---------------------------------------------------------------------------
// EFU 600.52 AM-DPI — Audit Mátrix ↔ 600.7 Detekciós Protokoll Integráció
// Reference: EFU 600.52 AM-DPI v1.0 (2026.04.10)
// ---------------------------------------------------------------------------

/**
 * AM-DPI.6 — Automatikus eszkalációs logika.
 *
 * A legmagasabb aktivált detekciós szint és a küszöböt túllépő indikátorok
 * száma alapján dönt SBE-Watch / SBE-Probable / SBE-Confirmed között.
 *
 * @param {Array<{threshold_exceeded: boolean, detection_level_triggered: number}>} indicators
 * @returns {'SBE-Watch'|'SBE-Probable'|'SBE-Confirmed'}
 */
export function escalateAMDPIClassification(indicators) {
  if (!indicators || indicators.length === 0) return 'SBE-Watch';

  const maxLevel   = Math.max(...indicators.map((i) => i.detection_level_triggered));
  const exceeded   = indicators.filter((i) => i.threshold_exceeded);

  if (maxLevel >= 4) return 'SBE-Confirmed';
  if (maxLevel === 3 && exceeded.length >= 1) return 'SBE-Probable';
  if (maxLevel === 2) return 'SBE-Watch';
  return 'SBE-Watch';
}

/**
 * AM-DPI.6 — Végső SBE-klasszifikáció CFI-B alapján.
 *
 * @param {'SBE-Watch'|'SBE-Probable'|'SBE-Confirmed'} matrixClass
 * @param {number} cfibTotal
 * @returns {{ finalClass: string, tierStatus: string }}
 */
export function finalAMDPIClassification(matrixClass, cfibTotal) {
  if (cfibTotal > 300) return { finalClass: 'SBE-Confirmed', tierStatus: 'TIER_1_VISSZAVONVA' };
  if (cfibTotal > 100) return { finalClass: 'SBE-Confirmed', tierStatus: 'FORRAS_KARANTENBE' };
  return { finalClass: matrixClass, tierStatus: 'NO_TIER' };
}

/**
 * AM-DPI — Teljes integrált pipeline futtatása.
 *
 * Bemenet: AUDIT_INDICATORS-ből jövő readings objekt + mért értékek + cfibTotal.
 *
 * @param {{ p_lod_water?: number, p_lod_blood?: number, b_acc?: number,
 *            i_block?: number, afff_rad?: number, c_chain?: number }} readings
 * @param {number} cfibTotal - összesített CFI-B érték
 * @returns {{ indicators: Array, matrixSummary: object }}
 */
export function runAMDPIIntegration(readings = {}, cfibTotal = 0) {
  const {
    p_lod_water = 0,
    p_lod_blood = 0,
    b_acc       = 0,
    i_block     = 0,
    afff_rad    = 0,
    c_chain     = 0,
  } = readings;

  const raw = [
    { indicator_id: 'P-LOD',    value: p_lod_water, unit: 'ng/L',   threshold: 100, detection_level_triggered: 2 },
    { indicator_id: 'P-LOD²',   value: p_lod_blood, unit: 'ng/mL',  threshold: 20,  detection_level_triggered: 3 },
    { indicator_id: 'B-ACC',    value: b_acc,        unit: '%/év',   threshold: 10,  detection_level_triggered: 2 },
    { indicator_id: 'I-BLOCK',  value: i_block,      unit: '%',      threshold: 15,  detection_level_triggered: 3 },
    { indicator_id: 'AFFF-RAD', value: afff_rad,     unit: 'm',      threshold: 500, detection_level_triggered: 1 },
    { indicator_id: 'C-CHAIN',  value: c_chain,      unit: 'ng/g',   threshold: 11,  detection_level_triggered: 3 },
  ];

  const indicators = raw.map((ind) => {
    const exceeded = ind.value > ind.threshold;
    const baseClass = (() => {
      if (!exceeded) return 'SBE-Watch';
      if (ind.detection_level_triggered >= 3) return 'SBE-Probable';
      return 'SBE-Watch';
    })();
    return { ...ind, threshold_exceeded: exceeded, sbe_classification: baseClass };
  });

  const matrixClass = escalateAMDPIClassification(indicators);
  const { finalClass, tierStatus } = finalAMDPIClassification(matrixClass, cfibTotal);

  const exceededCount = indicators.filter((i) => i.threshold_exceeded).length;
  const maxLevel      = Math.max(...indicators.map((i) => i.detection_level_triggered));

  const matrixSummary = {
    indicators_total:        indicators.length,
    thresholds_exceeded:     exceededCount,
    max_detection_level:     maxLevel,
    dominant_classification: matrixClass,
    cfib_escalation:         cfibTotal > 100,
    final_classification:    finalClass,
    tier:                    tierStatus,
    cews_flag:               finalClass === 'SBE-Confirmed' || matrixClass === 'SBE-Probable',
    fire_chief_notify:       tierStatus === 'TIER_1_VISSZAVONVA',
  };

  return { indicators, matrixSummary };
}

// ---------------------------------------------------------------------------
// EFU 600.56 — Atrocitás Potenciál (A-érték) Modell v1.2
// Reference: EFU 600.56 CFI-A (Systemic Collapse Trigger) v1.2 (2026-03-28)
// ---------------------------------------------------------------------------

/**
 * Alapmodell (multiplikatív): A = B × P × S × E × I × (1/D) × T × Φ(EFU)
 *
 * @param {{ B: number, P: number, S: number, E: number, I: number, D: number, T: number, Phi: number }} components
 * @returns {number} A_value (normalizált)
 */
export function calculateAValue({ B, P, S, E, I, D, T, Phi }) {
  const safeD = Math.max(D, 0.01);
  return B * P * S * E * I * (1 / safeD) * T * Phi;
}

/**
 * Logaritmikus stabil forma (ajánlott CDS-ben):
 * A = exp( Σ (w_i × log(X_i)) ) × (1/D)
 *
 * @param {{ B: number, P: number, S: number, E: number, I: number, D: number, T: number, Phi: number }} components
 * @param {{ B?: number, P?: number, S?: number, E?: number, I?: number, T?: number, Phi?: number }} weights
 * @returns {number} A_log
 */
export function calculateAValueLog(components, weights = {}) {
  const { B, P, S, E, I, D, T, Phi } = components;
  const w = { B: 1, P: 1, S: 1, E: 1, I: 1, T: 1, Phi: 1, ...weights };
  const safeD = Math.max(D, 0.01);

  const vars = [
    [B,   w.B],
    [P,   w.P],
    [S,   w.S],
    [E,   w.E],
    [I,   w.I],
    [T,   w.T],
    [Phi, w.Phi],
  ];

  const logSum = vars.reduce((acc, [x, wi]) => {
    const safeX = Math.max(x, 0.0001);
    return acc + wi * Math.log(safeX);
  }, 0);

  return Math.exp(logSum) * (1 / safeD);
}

/**
 * Dinamikus kiterjesztés:
 * A_dynamic = A × (1 + α × dS/dt + β × dP/dt)
 *
 * @param {number} A_value
 * @param {{ alpha?: number, beta?: number, dS_dt?: number, dP_dt?: number }} params
 * @returns {number} A_dynamic
 */
export function calculateADynamic(A_value, { alpha = 0.3, beta = 0.3, dS_dt = 0, dP_dt = 0 } = {}) {
  return A_value * (1 + alpha * dS_dt + beta * dP_dt);
}

/**
 * Zóna klasszifikáció az A-érték alapján.
 *
 * @param {number} A
 * @returns {{ id: string, label: string, state: string, cdsReaction: string, color: string }}
 */
export function classifyAZone(A) {
  if (A < 1.0)  return { id: 'GREEN',  label: '🟢 Zöld',   state: 'Stabil',            cdsReaction: 'Monitorozás',               color: '#16a34a' };
  if (A < 1.5)  return { id: 'YELLOW', label: '🟡 Sárga',  state: 'Instabil',          cdsReaction: 'Figyelmeztetés',            color: '#ca8a04' };
  if (A <= 2.5) return { id: 'ORANGE', label: '🟠 Narancs', state: 'Pre-Atrocitás',    cdsReaction: 'Beavatkozás (900.2)',       color: '#ea580c' };
  return         { id: 'RED',    label: '🔴 Vörös',  state: 'Aktív összeomlás', cdsReaction: 'Kényszer allokáció (AAP)', color: '#dc2626' };
}

/**
 * Trigger logika kiértékelése.
 *
 * @param {number} A - jelenlegi A-érték
 * @param {number} dA_dt - A változásának éves rátája
 * @returns {{ level: number, cdp_activation: boolean, aap_required: boolean, escalation: boolean, active_triggers: string[] }}
 */
export function evaluateATriggers(A, dA_dt = 0) {
  const active = [];
  let level = 0;
  let cdp_activation = false;
  let aap_required   = false;
  let escalation     = false;

  if (A > 1.5) { active.push('T1'); level = Math.max(level, 1); cdp_activation = true; }
  if (A > 2.5) { active.push('T2'); level = Math.max(level, 2); aap_required   = true; }
  if (dA_dt > 0.3) { active.push('T3'); level = Math.max(level, 3); escalation = true; }

  return { level, cdp_activation, aap_required, escalation, active_triggers: active };
}

// ---------------------------------------------------------------------------
// EFU 600.40–42 — Narratíva Degradáció Modell v1.0
// Reference: EFU 600.40-42 M4 Narratíva Degrádáció v1.0 FINAL (2026-04-10)
// ---------------------------------------------------------------------------

/**
 * 600.41 – Kognitív Narratíva Index
 * KNI = C_norm × F_norm × (1 - R) × T
 *
 * @param {{ C: number, F: number, R: number, T: number }} vars – raw values
 * @returns {number} KNI
 */
export function calculateKNI({ C, F, R, T }) {
  const C_norm = C / 10;
  const F_norm = F / 20;
  return C_norm * F_norm * (1 - R) * T;
}

/**
 * 600.42 – Érzelmi Narratíva Index
 * ENI = E × P_norm × D_norm × S
 *
 * @param {{ E: number, P: number, D: number, S: number }} vars – raw values
 * @returns {number} ENI
 */
export function calculateENI({ E, P, D, S }) {
  const P_norm = P / 0.5;
  const D_norm = D / 30;
  return E * P_norm * D_norm * S;
}

/**
 * Zóna klasszifikáció az NDI érték alapján.
 * 5 zóna: ZÖLD/SÁRGA/NARANCS/PIROS/KRITIKUS
 *
 * @param {number} ndi
 * @returns {{ id: string, label: string, m4_status: string, multiplier: number, action: string, color: string }}
 */
export function classifyNDIZone(ndi) {
  if (ndi > 7.0) return { id: 'CRITICAL', label: '⚫ Kritikus', m4_status: 'M4.COLLAPSED',   multiplier: 3.0, action: 'Fire Chief',          color: '#111827' };
  if (ndi > 3.5) return { id: 'RED',      label: '🔴 Piros',   m4_status: 'M4.POLARIZED',    multiplier: 2.0, action: '700.4 protokoll',      color: '#dc2626' };
  if (ndi > 1.8) return { id: 'ORANGE',   label: '🟠 Narancs', m4_status: 'M4.FRAGMENTED',   multiplier: 1.5, action: 'M4.CEWS trigger',      color: '#ea580c' };
  if (ndi > 0.8) return { id: 'YELLOW',   label: '🟡 Sárga',   m4_status: 'M4.DEGRADED',     multiplier: 1.2, action: 'Narratíva audit',      color: '#ca8a04' };
  return           { id: 'GREEN',   label: '🟢 Zöld',   m4_status: 'M4.STABLE',        multiplier: 1.0, action: 'Monitor',              color: '#16a34a' };
}

/**
 * M4 Trigger logika kiértékelése.
 *
 * @param {number} ndi
 * @param {{ N: number, C: number, E: number, F: number, P: number, D: number, Phi: number }} vars
 * @returns {{ m4_amber: boolean, m4_red: boolean, narrative_emergency: boolean, rapid_polarization: boolean, active_triggers: string[] }}
 */
export function evaluateM4Triggers(ndi, vars) {
  const m4_amber           = ndi > 1.8 || vars.E > 0.7;
  const m4_red             = ndi > 3.5 && (vars.C > 5 || vars.F > 10);
  const narrative_emergency = vars.Phi > 500 || vars.N < 0.4;
  const rapid_polarization  = vars.P > 0.3 && vars.D > 15;

  const active_triggers = [];
  if (m4_amber)            active_triggers.push('M4_AMBER');
  if (m4_red)              active_triggers.push('M4_RED');
  if (narrative_emergency) active_triggers.push('M4_EMERGENCY');
  if (rapid_polarization)  active_triggers.push('M4_POLAR');

  return { m4_amber, m4_red, narrative_emergency, rapid_polarization, active_triggers };
}

/**
 * Főmodell: Narratíva Degradáció Index (NDI)
 *
 * NDI = (1-N) × (C×0.15 + E×0.18 + F×0.12 + D×0.08 + T×0.07 + P×0.05) × S × (1 + Φ/1000)
 * ahol minden változó normalizálva van a referencia küszöbéhez.
 *
 * @param {{ N?: number, C?: number, E?: number, F?: number, R?: number,
 *            D?: number, S?: number, T?: number, P?: number, Phi?: number }} narrData
 * @returns {{ ndi_index: number, zone: object, m4_status: string, triggers: object,
 *             submodules: { kni: number, eni: number }, variables: { raw: object, normalized: object } }}
 */
export function calculateNDI(narrData = {}) {
  const vars = {
    N:   narrData.N   ?? 0.8,
    C:   narrData.C   ?? 0,
    E:   narrData.E   ?? 0,
    F:   narrData.F   ?? 0,
    R:   narrData.R   ?? 0.7,
    D:   narrData.D   ?? 5,
    S:   narrData.S   ?? 1.0,
    T:   narrData.T   ?? 0,
    P:   narrData.P   ?? 0,
    Phi: narrData.Phi ?? 0,
  };

  const norm = {
    C: vars.C / 10,
    E: vars.E,
    F: vars.F / 20,
    D: vars.D / 30,
    T: vars.T,
    P: vars.P / 0.5,
  };

  const ndi = (1 - vars.N) * (
    norm.C * 0.15 +
    norm.E * 0.18 +
    norm.F * 0.12 +
    norm.D * 0.08 +
    norm.T * 0.07 +
    norm.P * 0.05
  ) * vars.S * (1 + vars.Phi / 1000);

  const zone = classifyNDIZone(ndi);

  return {
    ndi_index:  ndi,
    zone,
    m4_status:  zone.m4_status,
    triggers:   evaluateM4Triggers(ndi, vars),
    submodules: {
      kni: calculateKNI(vars),
      eni: calculateENI(vars),
    },
    variables: { raw: vars, normalized: norm },
  };
}

// ---------------------------------------------------------------------------
// EFU 600.52.3 — AM-DPI Index (PFAS Audit Integration) v1.1
// Reference: EFU 600.52.3 AM-DPI v1.1 (2026-04-10)
// Changes v1.1: non-linear normalization, Φ separate amplifier, diagnostics,
//               configurable weights from MODUL_META_52_3
// ---------------------------------------------------------------------------

/**
 * Non-linear normalization: log(1+x) / log(1+threshold)
 * Models PFAS accumulation more realistically than linear scaling.
 *
 * @param {number} x
 * @param {number} threshold
 * @returns {number}
 */
function normalizeLog(x, threshold) {
  return Math.log(1 + x) / Math.log(1 + threshold);
}

/**
 * Zóna klasszifikáció az AM-DPI érték alapján.
 * 4 zóna: GREEN/YELLOW/ORANGE/RED
 * Supports both Infinity and null as "no upper bound".
 *
 * @param {number} amdpi
 * @returns {{ id: string, zone: string, label: string, min: number, max: number|null,
 *             level: number, sbe: string, multiplier: number, color: string, action: string }}
 */
export function classifyAMDPIZone(amdpi) {
  if (amdpi >= 5.0) return { id: 'RED',    zone: 'RED',    label: '🔴 Piros',   min: 5.0, max: null, level: 4, sbe: 'SBE-Confirmed_P1', multiplier: 2.0, color: '#dc2626', action: 'Tier 1 visszavonás'  };
  if (amdpi >= 2.5) return { id: 'ORANGE', zone: 'ORANGE', label: '🟠 Narancs', min: 2.5, max: 5.0,  level: 3, sbe: 'SBE-Confirmed',    multiplier: 1.5, color: '#ea580c', action: 'Forrás karanténbe'   };
  if (amdpi >= 1.0) return { id: 'YELLOW', zone: 'YELLOW', label: '🟡 Sárga',   min: 1.0, max: 2.5,  level: 2, sbe: 'SBE-Probable',     multiplier: 1.2, color: '#ca8a04', action: 'PFAS audit indítás'  };
  return               { id: 'GREEN',  zone: 'GREEN',  label: '🟢 Zöld',    min: 0,   max: 1.0,  level: 1, sbe: 'SBE-Watch',         multiplier: 1.0, color: '#16a34a', action: 'Monitorozás'         };
}

/**
 * AM-DPI Trigger logika kiértékelése.
 *
 * @param {number} amdpi
 * @param {{ P2: number, I: number, Φ: number }} vars
 * @returns {{ ceWS_amber: boolean, ceWS_red: boolean, fire_chief: boolean, tier_withdrawal: boolean, active_triggers: string[] }}
 */
export function evaluateAMDPITriggers(amdpi, vars) {
  const ceWS_amber      = amdpi > 1.0 || vars.P2 > 20 || vars.I > 15;
  const ceWS_red        = amdpi > 2.5 && (vars.P2 > 20 || vars.I > 15);
  const fire_chief      = vars.Φ > 600 || amdpi > 5.0;
  const tier_withdrawal = vars.Φ > 600;

  const active_triggers = [];
  if (ceWS_amber)  active_triggers.push('CEWS_AMBER');
  if (ceWS_red)    active_triggers.push('CEWS_RED');
  if (fire_chief)  active_triggers.push('FIRE_CHIEF');

  return { ceWS_amber, ceWS_red, fire_chief, tier_withdrawal, active_triggers };
}

/**
 * Főmodell v1.1: AM-DPI súlyozott eszkalációs index.
 *
 * Formula:
 *   base  = Σ normalizeLog(xᵢ, thresholdᵢ) × wᵢ   (P1,P2,B,I,T,D)
 *   Φ_eff = 1 + normalizeLog(Φ, Φ_threshold) × phi_weight
 *   AM-DPI = base × S × Φ_eff
 *
 * Changes from v1.0:
 *   - Non-linear log normalization (PFAS bioaccumulation is not linear)
 *   - Φ as separate multiplicative amplifier (no double-counting)
 *   - Weights read from config (default: MODUL_META_52_3)
 *   - diagnostics block: base_index, phi_effect, confidence, missing_inputs
 *
 * @param {{ P1?: number, P2?: number, B?: number, I?: number,
 *            D?: number, T?: number, S?: number, Φ?: number }} readings
 * @param {{ weights: object, phi_weight: number, efu_penalty_base: number }} [config]
 * @returns {{ amdpi_index: number, zone: object, triggers: object,
 *             efu_penalty: number, diagnostics: object,
 *             variables: { raw: object, normalized: object } }}
 */
export function calculateAMDPI(readings = {}, config) {
  // Default config — matches MODUL_META_52_3; caller may pass custom config to override
  const cfg = config ?? {
    weights: { P1: 0.15, P2: 0.25, B: 0.10, I: 0.20, T: 0.15, D: 0.05 },
    phi_weight: 0.4,
    efu_penalty_base: 150,
  };

  const thresholds = { P1: 100, P2: 20, B: 10, I: 15, D: 0.5, T: 11, Φ: 300 };
  const dflt = { P1: 50, P2: 8, B: 3, I: 5, D: 0.2, T: 4, S: 1.0, Φ: 120 };

  const varKeys = ['P1', 'P2', 'B', 'I', 'D', 'T', 'S', 'Φ'];
  const missing = [];
  const vars = {};
  for (const k of varKeys) {
    if (readings[k] !== undefined) {
      vars[k] = readings[k];
    } else {
      vars[k] = dflt[k];
      missing.push(k);
    }
  }

  const w = cfg.weights;

  // Non-linear normalization
  const norm = {
    P1: normalizeLog(vars.P1, thresholds.P1),
    P2: normalizeLog(vars.P2, thresholds.P2),
    B:  normalizeLog(vars.B,  thresholds.B),
    I:  normalizeLog(vars.I,  thresholds.I),
    D:  normalizeLog(vars.D,  thresholds.D),
    T:  normalizeLog(vars.T,  thresholds.T),
  };

  // Weighted base (Φ excluded from sum to avoid double-counting)
  const base = norm.P1 * w.P1 + norm.P2 * w.P2 + norm.B * w.B +
               norm.I * w.I  + norm.T * w.T  + norm.D * w.D;

  // Φ as separate amplifier
  const phi_norm   = normalizeLog(vars.Φ, thresholds.Φ);
  const phi_effect = 1 + phi_norm * cfg.phi_weight;

  const amdpi  = base * vars.S * phi_effect;
  const zone   = classifyAMDPIZone(amdpi);
  const triggers = evaluateAMDPITriggers(amdpi, vars);

  return {
    amdpi_index: parseFloat(amdpi.toFixed(4)),
    zone,
    triggers,
    efu_penalty: Math.round(amdpi * cfg.efu_penalty_base * zone.multiplier),
    diagnostics: {
      base_index:     parseFloat(base.toFixed(4)),
      phi_effect:     parseFloat(phi_effect.toFixed(4)),
      synergy:        vars.S,
      missing_inputs: missing,
      confidence:     parseFloat((1 - missing.length / varKeys.length).toFixed(2)),
    },
    variables: { raw: vars, normalized: norm },
  };
}

// ---------------------------------------------------------------------------
// EFU 600.30 — Hobby Animal Keeping & Wildlife Extraction Parasitism v1.0
// Reference: EFU 600.30 HAP v1.0 (2026-04-10)
// Special flags: BLACK_LAYER_RESTRICTED | UNINTENTIONAL_PARASITISM
// ---------------------------------------------------------------------------

/**
 * Zóna klasszifikáció a HAP érték alapján.
 * 5 zóna: GREEN / YELLOW / ORANGE / RED / CRITICAL
 *
 * @param {number} hap
 * @returns {{ id: string, label: string, status: string, multiplier: number, color: string, action: string }}
 */
export function classifyHAPZone(hap) {
  if (hap >= 6.0) return { id: 'CRITICAL', label: '⚫ Kritikus', status: 'FIRE CHIEF',    multiplier: 3.0, color: '#111827', action: 'Fire Chief + 700.1 + 800.12 Gaian protocol' };
  if (hap >= 3.0) return { id: 'RED',      label: '🔴 Piros',   status: 'KARANTÉN',       multiplier: 2.0, color: '#dc2626', action: 'Karantén protokoll + 700.1 beavatkozás' };
  if (hap >= 1.5) return { id: 'ORANGE',   label: '🟠 Narancs', status: 'CONFIRMED',      multiplier: 1.5, color: '#ea580c', action: 'CEWS M9 trigger + fekete réteg vizsgálat' };
  if (hap >= 0.8) return { id: 'YELLOW',   label: '🟡 Sárga',   status: 'STRUKTURÁLIS',   multiplier: 1.2, color: '#ca8a04', action: 'TNR program + CITES audit' };
  return               { id: 'GREEN',    label: '🟢 Zöld',   status: 'WATCH',           multiplier: 1.0, color: '#16a34a', action: 'Monitorozás – oktatási kampány' };
}

/**
 * HAP trigger logika kiértékelése.
 *
 * @param {number} hap
 * @param {{ L1: number, L2: number, L3: number, L4: number, L5: number, L6: number, Phi: number }} vars
 * @returns {{ unintentional_harm: boolean, black_layer: boolean, invasion_alert: boolean,
 *             fire_chief: boolean, active_triggers: string[] }}
 */
export function evaluateHAPTriggers(hap, vars) {
  const unintentional_harm = vars.L1 > 0.5 || vars.L2 > 0.45;
  const black_layer        = vars.L4 > 0.5 || vars.Phi > 400;
  const invasion_alert     = vars.L6 > 0.4 && (vars.L3 > 0.3 || vars.L5 > 0.4);
  const fire_chief         = hap > 5.0 || vars.L4 > 0.7 || vars.Phi > 600;

  const active_triggers = [];
  if (unintentional_harm) active_triggers.push('UNINTENTIONAL_HARM');
  if (black_layer)        active_triggers.push('BLACK_LAYER');
  if (invasion_alert)     active_triggers.push('INVASION_ALERT');
  if (fire_chief)         active_triggers.push('FIRE_CHIEF');

  return { unintentional_harm, black_layer, invasion_alert, fire_chief, active_triggers };
}

/**
 * Főmodell: Hobby Animal Parasitism Index (HAP)
 *
 * Formula:
 *   HAP = (L1×0.25 + L2×0.15 + L3×0.20 + L4×0.20 + L5×0.12 + L6×0.08) × S × (1 + Φ/1000)
 *
 * 6 réteg súlyozva:
 *   L1 Macskák (0.25) – legnagyobb dokumentált ökológiai hatás
 *   L2 Legális szektór (0.15) – erőforrás-extrakció
 *   L3 Egzotikus (0.20) – CITES szürkezóna
 *   L4 Vadcsempészet (0.20) – M7 FEKETE réteg
 *   L5 Vadászat (0.12) – fenntartható vs. trófea
 *   L6 Inváziós fajok (0.08) – szabadon engedett kedvencek
 *
 * @param {{ L1?: number, L2?: number, L3?: number, L4?: number,
 *            L5?: number, L6?: number, S?: number, Phi?: number }} inputs
 * @returns {{ hap_index: number, zone: object, triggers: object,
 *             layer_contributions: object, diagnostics: object, variables: object }}
 */
export function calculateHAP(inputs = {}) {
  const defaults = { L1: 0.55, L2: 0.45, L3: 0.40, L4: 0.35, L5: 0.40, L6: 0.30, S: 1.1, Phi: 150 };
  const weights  = { L1: 0.25, L2: 0.15, L3: 0.20, L4: 0.20, L5: 0.12, L6: 0.08 };

  const missing = [];
  const vars = {};
  for (const k of Object.keys(defaults)) {
    if (inputs[k] !== undefined) {
      vars[k] = inputs[k];
    } else {
      vars[k] = defaults[k];
      missing.push(k);
    }
  }

  // Weighted base sum (layers L1–L6)
  const base =
    vars.L1 * weights.L1 +
    vars.L2 * weights.L2 +
    vars.L3 * weights.L3 +
    vars.L4 * weights.L4 +
    vars.L5 * weights.L5 +
    vars.L6 * weights.L6;

  // Φ amplifier
  const phi_effect = 1 + vars.Phi / 1000;

  // Final index
  const hap = base * vars.S * phi_effect;

  const zone     = classifyHAPZone(hap);
  const triggers = evaluateHAPTriggers(hap, vars);

  // Per-layer contributions for breakdown display
  const layer_contributions = {};
  for (const [k, w] of Object.entries(weights)) {
    layer_contributions[k] = parseFloat((vars[k] * w).toFixed(4));
  }

  return {
    hap_index: parseFloat(hap.toFixed(4)),
    zone,
    triggers,
    layer_contributions,
    diagnostics: {
      base_index:     parseFloat(base.toFixed(4)),
      phi_effect:     parseFloat(phi_effect.toFixed(4)),
      synergy:        vars.S,
      missing_inputs: missing,
      confidence:     parseFloat((1 - missing.length / Object.keys(defaults).length).toFixed(2)),
    },
    variables: { raw: vars, weights },
  };
}

// ---------------------------------------------------------------------------
// EFU 600.10 — Monitoring és Verifikáció (MVP) v1.0
// Reference: EFU 600.10 MVP v1.0 (2026-04-10)
// ---------------------------------------------------------------------------

/**
 * Zóna klasszifikáció az MVP érték alapján.
 * 5 zóna: GREEN / YELLOW / ORANGE / RED / CRITICAL
 *
 * @param {number} mvp
 * @returns {{ id: string, label: string, status: string, color: string, action: string }}
 */
export function classifyMVPZone(mvp) {
  if (mvp >= 1.5) return { id: 'CRITICAL', label: '⚫ Kritikus',   status: 'AUDITÁLT',   color: '#111827', action: '900.1 CDS rendszeraudit' };
  if (mvp >= 1.0) return { id: 'RED',      label: '🔴 Piros',     status: 'SBE-WATCH',  color: '#dc2626', action: 'Automatikus SBE-Watch besorolás' };
  if (mvp >= 0.7) return { id: 'ORANGE',   label: '🟠 Narancs',   status: 'HIÁNYOS',    color: '#ea580c', action: 'SBE-Watch kockázat' };
  if (mvp >= 0.4) return { id: 'YELLOW',   label: '🟡 Sárga',     status: 'REVIEW',     color: '#ca8a04', action: 'Felülvizsgálat szükséges' };
  return               { id: 'GREEN',    label: '🟢 Operatív',  status: 'WATCH',      color: '#16a34a', action: 'Folyamatos monitorozás' };
}

/**
 * MVP trigger logika kiértékelése.
 *
 * @param {number} mvp
 * @param {{ L1_mol: number, L2_eco: number, L3_gov: number, V_ind: number, V_pub: number, Phi: number }} vars
 * @returns {{ data_gap: boolean, independence_fail: boolean, cews_disconnect: boolean,
 *             system_audit: boolean, active_triggers: string[] }}
 */
export function evaluateMVPTriggers(mvp, vars) {
  const data_gap         = vars.L1_mol < 0.3 || vars.L2_eco < 0.3;
  const independence_fail = vars.V_ind < 0.4;
  const cews_disconnect  = vars.Phi < 100 && (vars.L1_mol < 0.5 || vars.L3_gov < 0.4);
  const system_audit     = mvp >= 1.5 || (vars.V_ind < 0.3 && vars.V_pub < 0.3);

  const active_triggers = [];
  if (data_gap)          active_triggers.push('data_gap');
  if (independence_fail) active_triggers.push('independence_fail');
  if (cews_disconnect)   active_triggers.push('cews_disconnect');
  if (system_audit)      active_triggers.push('system_audit');

  return { data_gap, independence_fail, cews_disconnect, system_audit, active_triggers };
}

/**
 * Főmodell: Monitoring and Verification Protocol Index (MVP)
 *
 * Formula:
 *   MVP = (L1_mol×0.30 + L2_eco×0.30 + L3_gov×0.25 + V_ind×0.05 + V_rep×0.05 + V_pub×0.05) × S × (1 + Phi/1000)
 *
 * @param {{ L1_mol?: number, L2_eco?: number, L3_gov?: number, V_ind?: number,
 *            V_rep?: number, V_pub?: number, S?: number, Phi?: number }} inputs
 * @returns {{ mvp_index: number, zone: object, triggers: object,
 *             variable_contributions: object, diagnostics: object, variables: object }}
 */
export function calculateMVP(inputs = {}) {
  const defaults = { L1_mol: 0.6, L2_eco: 0.5, L3_gov: 0.45, V_ind: 0.6, V_rep: 0.65, V_pub: 0.5, S: 1.1, Phi: 200 };
  const weights  = { L1_mol: 0.30, L2_eco: 0.30, L3_gov: 0.25, V_ind: 0.05, V_rep: 0.05, V_pub: 0.05 };

  const missing = [];
  const vars = {};
  for (const k of Object.keys(defaults)) {
    if (inputs[k] !== undefined) {
      vars[k] = inputs[k];
    } else {
      vars[k] = defaults[k];
      missing.push(k);
    }
  }

  const base =
    vars.L1_mol * weights.L1_mol +
    vars.L2_eco * weights.L2_eco +
    vars.L3_gov * weights.L3_gov +
    vars.V_ind  * weights.V_ind  +
    vars.V_rep  * weights.V_rep  +
    vars.V_pub  * weights.V_pub;

  const phi_effect = 1 + vars.Phi / 1000;
  const mvp = base * vars.S * phi_effect;

  const zone     = classifyMVPZone(mvp);
  const triggers = evaluateMVPTriggers(mvp, vars);

  const variable_contributions = {};
  for (const [k, w] of Object.entries(weights)) {
    variable_contributions[k] = parseFloat((vars[k] * w).toFixed(4));
  }

  return {
    mvp_index: parseFloat(mvp.toFixed(4)),
    zone,
    triggers,
    variable_contributions,
    diagnostics: {
      base_index:     parseFloat(base.toFixed(4)),
      phi_effect:     parseFloat(phi_effect.toFixed(4)),
      synergy:        vars.S,
      missing_inputs: missing,
      confidence:     parseFloat((1 - missing.length / Object.keys(defaults).length).toFixed(2)),
    },
    variables: { raw: vars, weights },
  };
}

// ---------------------------------------------------------------------------
// EFU 600.20 — Szórakoztatóipar Dopamin Extrakció (DEP) v1.0
// Reference: EFU 600.20 DEP v1.0 (2026-04-10)
// ---------------------------------------------------------------------------

/**
 * Zóna klasszifikáció a DEP érték alapján.
 * 5 zóna: GREEN / YELLOW / ORANGE / RED / CRITICAL
 *
 * @param {number} dep
 * @returns {{ id: string, label: string, status: string, color: string, action: string }}
 */
export function classifyDEPZone(dep) {
  if (dep >= 1.5) return { id: 'CRITICAL', label: '⚫ Kritikus', status: 'SYSTEMIC',         color: '#111827', action: 'Rendszerszintű dopamin-extrakció' };
  if (dep >= 1.0) return { id: 'RED',      label: '🔴 Piros',   status: 'KARANTÉN',          color: '#dc2626', action: 'Fire Chief beavatkozás' };
  if (dep >= 0.6) return { id: 'ORANGE',   label: '🟠 Narancs', status: 'ADDIKCIÓ RIZIKÓ',   color: '#ea580c', action: '600.1 kognitív vírus risk' };
  if (dep >= 0.3) return { id: 'YELLOW',   label: '🟡 Sárga',   status: 'MONITOR',           color: '#ca8a04', action: 'Figyelés szükséges' };
  return               { id: 'GREEN',    label: '🟢 Zöld',   status: 'STABLE',            color: '#16a34a', action: 'Normál szórakoztatás' };
}

/**
 * DEP trigger logika kiértékelése.
 *
 * @param {number} dep
 * @param {{ G_gambling: number, L_lootbox: number, D_doom: number,
 *            HMI_loss: number, R_future: number }} vars
 * @returns {{ gambling_karantén: boolean, lootbox_children: boolean, addiction_cascade: boolean,
 *             fire_chief: boolean, active_triggers: string[] }}
 */
export function evaluateDEPTriggers(dep, vars) {
  const gambling_karantén  = vars.G_gambling > 0.6 && vars.HMI_loss > 3.5;
  const lootbox_children   = vars.L_lootbox > 0.5;
  const addiction_cascade  = (vars.G_gambling + vars.D_doom) > 1.0 && vars.R_future < 0.3;
  const fire_chief         = dep >= 1.5 || (vars.HMI_loss >= 8.0 && vars.R_future < 0.2);

  const active_triggers = [];
  if (gambling_karantén) active_triggers.push('gambling_karantén');
  if (lootbox_children)  active_triggers.push('lootbox_children');
  if (addiction_cascade) active_triggers.push('addiction_cascade');
  if (fire_chief)        active_triggers.push('fire_chief');

  return { gambling_karantén, lootbox_children, addiction_cascade, fire_chief, active_triggers };
}

/**
 * Főmodell: Dopamine Extraction Parasitism Index (DEP)
 *
 * Formula:
 *   DEP = (G×0.30 + L×0.25 + B×0.15 + D×0.20 + (HMI/10)×0.10) × (1 + (1−R_future)×0.5) × S × (1 + Phi/1000)
 *
 * @param {{ G_gambling?: number, L_lootbox?: number, B_binge?: number, D_doom?: number,
 *            HMI_loss?: number, R_future?: number, S?: number, Phi?: number }} inputs
 * @returns {{ dep_index: number, zone: object, triggers: object,
 *             variable_contributions: object, diagnostics: object, variables: object }}
 */
export function calculateDEP(inputs = {}) {
  const defaults = { G_gambling: 0.65, L_lootbox: 0.55, B_binge: 0.50, D_doom: 0.60, HMI_loss: 4.5, R_future: 0.35, S: 1.15, Phi: 300 };

  const missing = [];
  const vars = {};
  for (const k of Object.keys(defaults)) {
    if (inputs[k] !== undefined) {
      vars[k] = inputs[k];
    } else {
      vars[k] = defaults[k];
      missing.push(k);
    }
  }

  const base =
    vars.G_gambling * 0.30 +
    vars.L_lootbox  * 0.25 +
    vars.B_binge    * 0.15 +
    vars.D_doom     * 0.20 +
    (vars.HMI_loss / 10) * 0.10;

  const r_future_factor = 1 + (1 - vars.R_future) * 0.5;
  const phi_effect      = 1 + vars.Phi / 1000;
  const dep             = base * r_future_factor * vars.S * phi_effect;

  const zone     = classifyDEPZone(dep);
  const triggers = evaluateDEPTriggers(dep, vars);

  const variable_contributions = {
    G_gambling: parseFloat((vars.G_gambling * 0.30).toFixed(4)),
    L_lootbox:  parseFloat((vars.L_lootbox  * 0.25).toFixed(4)),
    B_binge:    parseFloat((vars.B_binge    * 0.15).toFixed(4)),
    D_doom:     parseFloat((vars.D_doom     * 0.20).toFixed(4)),
    HMI_loss:   parseFloat(((vars.HMI_loss / 10) * 0.10).toFixed(4)),
  };

  return {
    dep_index: parseFloat(dep.toFixed(4)),
    zone,
    triggers,
    variable_contributions,
    diagnostics: {
      base_index:      parseFloat(base.toFixed(4)),
      r_future_factor: parseFloat(r_future_factor.toFixed(4)),
      phi_effect:      parseFloat(phi_effect.toFixed(4)),
      synergy:         vars.S,
      missing_inputs:  missing,
      confidence:      parseFloat((1 - missing.length / Object.keys(defaults).length).toFixed(2)),
    },
    variables: { raw: vars },
  };
}

// ---------------------------------------------------------------------------
// EFU 600.82 — Vallási Identitás Antiflux (RIA) v1.0
// Reference: EFU 600.82 RIA v1.0 (2026-04-01)
// Note: EFU nem értékítéletet alkot – kizárólag biofizikai fluxus-hatásokat mér
// ---------------------------------------------------------------------------

/**
 * Zóna klasszifikáció az RIA érték alapján.
 * 5 zóna: GREEN / YELLOW / ORANGE / RED / CRITICAL
 *
 * @param {number} ria
 * @returns {{ id: string, label: string, status: string, color: string, action: string }}
 */
export function classifyRIAZone(ria) {
  if (ria >= 1.0) return { id: 'CRITICAL', label: '⚫ Rendszerszintű',    status: 'SYSTEMIC',  color: '#111827', action: 'CEWS M3/M11 teljes zárlat' };
  if (ria >= 0.6) return { id: 'RED',      label: '🔴 Kritikus antiflux', status: 'CRITICAL',  color: '#dc2626', action: 'Kognitív blokk + erőforrás-zárlat' };
  if (ria >= 0.3) return { id: 'ORANGE',   label: '🟠 Antiflux',          status: 'ANTIFLUX',  color: '#ea580c', action: 'M3↔M11↔M4 zárt hurok aktív' };
  if (ria >= 0.1) return { id: 'YELLOW',   label: '🟡 Semleges',          status: 'NEUTRAL',   color: '#ca8a04', action: 'Mérhető antiflux, nem kritikus' };
  return               { id: 'GREEN',    label: '🟢 Fluxus-erősítő',   status: 'AMPLIFIER', color: '#16a34a', action: 'Pozitív regeneratív hatás (→ 700.14)' };
}

/**
 * RIA trigger logika kiértékelése.
 *
 * @param {number} ria
 * @param {{ cogn_lock: number, time_distort: number, rcr: number, flux_amp: number }} vars
 * @returns {{ cognitive_loop: boolean, mroi_distortion: boolean, flux_amplifier: boolean,
 *             system_entropy: boolean, active_triggers: string[] }}
 */
export function evaluateRIATriggers(ria, vars) {
  const cognitive_loop   = vars.cogn_lock > 0.6 && vars.rcr > 0.5;
  const mroi_distortion  = vars.time_distort > 0.6;
  const flux_amplifier   = vars.flux_amp > 0.6;
  const system_entropy   = ria >= 1.0;

  const active_triggers = [];
  if (cognitive_loop)  active_triggers.push('cognitive_loop');
  if (mroi_distortion) active_triggers.push('mroi_distortion');
  if (flux_amplifier)  active_triggers.push('flux_amplifier');
  if (system_entropy)  active_triggers.push('system_entropy');

  return { cognitive_loop, mroi_distortion, flux_amplifier, system_entropy, active_triggers };
}

/**
 * Főmodell: Religious Identity Antiflux Index (RIA)
 *
 * Formula:
 *   RIA = (cogn_lock×0.35 + time_distort×0.25 + rcr×0.25 + sac_infra×0.15 − flux_amp×0.20) × S × (1 + Phi/1000)
 *
 * flux_amp is subtracted as it represents positive flux amplification.
 *
 * @param {{ cogn_lock?: number, time_distort?: number, rcr?: number,
 *            sac_infra?: number, flux_amp?: number, S?: number, Phi?: number }} inputs
 * @returns {{ ria_index: number, zone: object, triggers: object,
 *             variable_contributions: object, diagnostics: object, variables: object }}
 */
export function calculateRIA(inputs = {}) {
  const defaults = { cogn_lock: 0.5, time_distort: 0.45, rcr: 0.50, sac_infra: 0.40, flux_amp: 0.35, S: 1.0, Phi: 150 };

  const missing = [];
  const vars = {};
  for (const k of Object.keys(defaults)) {
    if (inputs[k] !== undefined) {
      vars[k] = inputs[k];
    } else {
      vars[k] = defaults[k];
      missing.push(k);
    }
  }

  const base =
    vars.cogn_lock   * 0.35 +
    vars.time_distort * 0.25 +
    vars.rcr          * 0.25 +
    vars.sac_infra    * 0.15 -
    vars.flux_amp     * 0.20;

  const phi_effect = 1 + vars.Phi / 1000;
  const ria = Math.max(0, base) * vars.S * phi_effect;

  const zone     = classifyRIAZone(ria);
  const triggers = evaluateRIATriggers(ria, vars);

  const variable_contributions = {
    cogn_lock:    parseFloat((vars.cogn_lock   * 0.35).toFixed(4)),
    time_distort: parseFloat((vars.time_distort * 0.25).toFixed(4)),
    rcr:          parseFloat((vars.rcr          * 0.25).toFixed(4)),
    sac_infra:    parseFloat((vars.sac_infra    * 0.15).toFixed(4)),
    flux_amp:     parseFloat((-vars.flux_amp    * 0.20).toFixed(4)),
  };

  return {
    ria_index: parseFloat(ria.toFixed(4)),
    zone,
    triggers,
    variable_contributions,
    diagnostics: {
      base_index:     parseFloat(base.toFixed(4)),
      phi_effect:     parseFloat(phi_effect.toFixed(4)),
      synergy:        vars.S,
      missing_inputs: missing,
      confidence:     parseFloat((1 - missing.length / Object.keys(defaults).length).toFixed(2)),
    },
    variables: { raw: vars },
  };
}

// =============================================================================
// EFU 600.69 — Gresham–Parazita Spirál (GPS) v1.0
// Metabolikus Extrakció és Rendszerszintű Kiszorítás
// =============================================================================

/**
 * GPS zóna osztályozása az index alapján.
 *
 * @param {number} gps
 * @returns {{ id: string, label: string, status: string, multiplier: number,
 *             color: string, action: string }}
 */
export function classifyGPSZone(gps) {
  if (gps >= 4.5) return { id: 'CRITICAL', label: '⚫ Kritikus', status: 'JEVONS ÖSSZEOMLÁS', multiplier: 3.0, color: '#111827', action: 'Fire Chief + teljes rendszercsere JIM-30 kompatibilis alternatívával' };
  if (gps >= 2.5) return { id: 'RED',      label: '🔴 Piros',   status: 'JEVONS FÁZIS',       multiplier: 2.0, color: '#dc2626', action: 'Vétó-felülvizsgálat + kötelező lokalizációs program' };
  if (gps >= 1.0) return { id: 'ORANGE',   label: '🟠 Narancs', status: 'GRESHAM FÁZIS',      multiplier: 1.5, color: '#ea580c', action: 'TÉKK IV. nyilvános bemutatás + AP-SINKHOLE aktiválás' };
  if (gps >= 0.5) return { id: 'YELLOW',   label: '🟡 Sárga',   status: 'TRÓJAI FÁZIS',       multiplier: 1.2, color: '#ca8a04', action: 'JIM-30 audit + lokális alternatív terv kidolgozása' };
  return               { id: 'GREEN',    label: '🟢 Zöld',    status: 'WATCH',              multiplier: 1.0, color: '#16a34a', action: 'TÉKK szűrő ellenőrzés – rendszeres audit' };
}

/**
 * GPS trigger logika kiértékelése.
 *
 * @param {number} gps
 * @param {{ digital_lock: number, monoblock: number, knowledge_loss: number,
 *           entropy_export: number, jim30_loss: number, local_quota_loss: number,
 *           Phi: number }} vars
 * @returns {{ digital_karanteen: boolean, monoblock_kor: boolean,
 *             entropy_sinkhole: boolean, gresham_fire_chief: boolean,
 *             active_triggers: string[] }}
 */
export function evaluateGPSTriggers(gps, vars) {
  const digital_karanteen  = vars.digital_lock > 0.20;
  const monoblock_kor       = vars.monoblock > 0.50 || vars.jim30_loss > 0.60;
  const entropy_sinkhole    = vars.entropy_export > 0.40 || vars.local_quota_loss > 0.50;
  const gresham_fire_chief  = gps > 4.0
    || (vars.jim30_loss > 0.7 && vars.local_quota_loss > 0.7)
    || vars.Phi > 700;

  const active_triggers = [];
  if (digital_karanteen)  active_triggers.push('DIGITAL_KARANTEEN');
  if (monoblock_kor)       active_triggers.push('MONOBLOCK_KOR');
  if (entropy_sinkhole)    active_triggers.push('ENTROPY_SINKHOLE');
  if (gresham_fire_chief)  active_triggers.push('GRESHAM_FIRE_CHIEF');

  return { digital_karanteen, monoblock_kor, entropy_sinkhole, gresham_fire_chief, active_triggers };
}

/**
 * Főmodell: Gresham–Parazita Spirál Index (GPS)
 *
 * Formula:
 *   GPS = (digital_lock×0.25 + monoblock×0.20 + knowledge_loss×0.15
 *          + entropy_export×0.20 + jim30_loss×0.12 + local_quota_loss×0.08)
 *         × S × (1 + Φ/1000)
 *
 * 6 változó súlyozva:
 *   digital_lock      (0.25) – digitális karantén aránya
 *   monoblock         (0.20) – roncsolásmentes szétbonthatatlansága
 *   knowledge_loss    (0.15) – offline szervizkönyv hiánya
 *   entropy_export    (0.20) – globális logisztikai lánc függőség
 *   jim30_loss        (0.12) – JIM-30 inkompatibilitás
 *   local_quota_loss  (0.08) – helyi alkatrész-kvóta vesztés
 *
 * @param {{ digital_lock?: number, monoblock?: number, knowledge_loss?: number,
 *           entropy_export?: number, jim30_loss?: number, local_quota_loss?: number,
 *           S?: number, Phi?: number }} inputs
 * @returns {{ gps_index: number, zone: object, triggers: object,
 *             variable_contributions: object, diagnostics: object, variables: object }}
 */
export function calculateGPS(inputs = {}) {
  const defaults = {
    digital_lock:     0.30,
    monoblock:        0.55,
    knowledge_loss:   0.40,
    entropy_export:   0.45,
    jim30_loss:       0.50,
    local_quota_loss: 0.35,
    S:                1.15,
    Phi:              200,
  };
  const weights = {
    digital_lock:     0.25,
    monoblock:        0.20,
    knowledge_loss:   0.15,
    entropy_export:   0.20,
    jim30_loss:       0.12,
    local_quota_loss: 0.08,
  };

  const missing = [];
  const vars = {};
  for (const k of Object.keys(defaults)) {
    if (inputs[k] !== undefined) {
      vars[k] = inputs[k];
    } else {
      vars[k] = defaults[k];
      missing.push(k);
    }
  }

  // Weighted base sum
  const base =
    vars.digital_lock     * weights.digital_lock +
    vars.monoblock        * weights.monoblock +
    vars.knowledge_loss   * weights.knowledge_loss +
    vars.entropy_export   * weights.entropy_export +
    vars.jim30_loss       * weights.jim30_loss +
    vars.local_quota_loss * weights.local_quota_loss;

  // Φ amplifier
  const phi_effect = 1 + vars.Phi / 1000;

  // Final index
  const gps = base * vars.S * phi_effect;

  const zone     = classifyGPSZone(gps);
  const triggers = evaluateGPSTriggers(gps, vars);

  const variable_contributions = {};
  for (const [k, w] of Object.entries(weights)) {
    variable_contributions[k] = parseFloat((vars[k] * w).toFixed(4));
  }

  return {
    gps_index: parseFloat(gps.toFixed(4)),
    zone,
    triggers,
    variable_contributions,
    diagnostics: {
      base_index:     parseFloat(base.toFixed(4)),
      phi_effect:     parseFloat(phi_effect.toFixed(4)),
      synergy:        vars.S,
      missing_inputs: missing,
      confidence:     parseFloat((1 - missing.length / Object.keys(defaults).length).toFixed(2)),
    },
    variables: { raw: vars },
  };
}

// =============================================================================
// EFU 600.53 — Digitális Extrakció & AI Parazitizmus (CFI-D) v0.3
// =============================================================================

/**
 * Classify CFI-D value into a zone.
 * @param {number} cfid
 * @returns {{ id: string, status: string }}
 */
export function classifyCFIDZone(cfid) {
  if (cfid >= 2000) return { id: 'BLACK',  status: 'ALGORITMIKUS BEFOGÁS',   color: '#111827' };
  if (cfid >= 1000) return { id: 'RED',    status: 'KRITIKUS ANTIFLUX',      color: '#dc2626' };
  if (cfid >= 500)  return { id: 'ORANGE', status: 'KOGNITÍV ANTIFLUX',      color: '#ea580c' };
  if (cfid >= 200)  return { id: 'YELLOW', status: 'FIGYELEM',               color: '#ca8a04' };
  return               { id: 'GREEN',  status: 'NORMATÍV',                color: '#16a34a' };
}

/**
 * Evaluate CFI-D triggers.
 * @param {number} cfid
 * @param {object} vars
 * @returns {{ kognitiv_stressz: boolean, fire_chief: boolean, algoritmikus_befogás: boolean, kaszkad: boolean, active_triggers: string[] }}
 */
export function evaluateCFIDTriggers(cfid, vars) {
  const { screen_time = 0, AI_content_ratio = 0, personalization_depth = 0, user_agency_index = 1 } = vars;
  const kognitiv_stressz    = screen_time > 4 && cfid > 500;
  const fire_chief          = cfid > 1000;
  const algoritmikus_befogás = AI_content_ratio > 0.6 && personalization_depth > 0.7 && user_agency_index < 0.3;
  const kaszkad             = cfid > 500;

  const active_triggers = [];
  if (kognitiv_stressz)     active_triggers.push('KOGNITIV_STRESSZ');
  if (fire_chief)           active_triggers.push('FIRE_CHIEF');
  if (algoritmikus_befogás) active_triggers.push('ALGORITMIKUS_BEFOGÁS');
  if (kaszkad)              active_triggers.push('KASZKÁD_TRIGGER');

  return { kognitiv_stressz, fire_chief, algoritmikus_befogás, kaszkad, active_triggers };
}

/**
 * Main CFI-D model calculation.
 * @param {object} inputs
 * @returns {object}
 */
export function calculateCFID(inputs = {}) {
  const defaults = {
    screen_time:          6.5,
    notification_rate:    0.60,
    AI_content_ratio:     0.45,
    personalization_depth:0.65,
    offline_time:         3.0,
    deep_work_hours:      2.0,
    sleep_quality_index:  0.55,
    user_agency_index:    0.35,
    beta:                 0.18,
    alpha_AI:             0.35,
    CFI_D_regenerative:   50,
    Debt_rate_D:          0.12,
    t_years:              3,
  };

  const missing = [];
  const vars = {};
  for (const k of Object.keys(defaults)) {
    if (inputs[k] !== undefined) {
      vars[k] = inputs[k];
    } else {
      vars[k] = defaults[k];
      missing.push(k);
    }
  }

  const { screen_time, notification_rate, AI_content_ratio, personalization_depth,
          offline_time, deep_work_hours, sleep_quality_index, user_agency_index,
          beta, alpha_AI, CFI_D_regenerative, Debt_rate_D, t_years } = vars;

  const F_detox = 0.40 * Math.min(offline_time, 8) / 8
                + 0.35 * Math.min(deep_work_hours, 6) / 6
                + 0.25 * sleep_quality_index;

  const B_addikcio = 1 + beta * Math.log(1 + screen_time);

  const rawVal = 0.35 * (screen_time / 16)
               + 0.20 * notification_rate
               + 0.25 * AI_content_ratio
               + 0.20 * personalization_depth
               - 0.15 * user_agency_index;
  const raw = Math.min(1, Math.max(0, rawVal));

  const cfid_base  = raw * (1 / (1 + F_detox)) * B_addikcio * 1000;
  const cfid_ai    = cfid_base * (1 + alpha_AI);
  const cfid_net   = Math.max(0, cfid_ai - CFI_D_regenerative);
  const cfid_total = cfid_net * (1 + Debt_rate_D * t_years);

  const zone     = classifyCFIDZone(cfid_total);
  const triggers = evaluateCFIDTriggers(cfid_total, vars);

  return {
    cfid_base:  parseFloat(cfid_base.toFixed(4)),
    cfid_ai:    parseFloat(cfid_ai.toFixed(4)),
    cfid_net:   parseFloat(cfid_net.toFixed(4)),
    cfid_total: parseFloat(cfid_total.toFixed(4)),
    zone,
    triggers,
    components: {
      F_detox:    parseFloat(F_detox.toFixed(4)),
      B_addikcio: parseFloat(B_addikcio.toFixed(4)),
      raw:        parseFloat(raw.toFixed(4)),
    },
    diagnostics: {
      alpha_AI,
      CFI_D_regen:    CFI_D_regenerative,
      Debt_rate_D,
      t_years,
      missing_inputs: missing,
      confidence:     parseFloat((1 - missing.length / Object.keys(defaults).length).toFixed(2)),
    },
    variables: { raw: vars },
  };
}

// =============================================================================
// EFU 600.51 — Noosphere Antifluxus Metrikák (Noo-CSI) v1.0
// =============================================================================

/**
 * Classify Noo-CSI value into a zone.
 * @param {number} csi
 * @returns {{ id: string, status: string, color: string }}
 */
export function classifyNooCSIZone(csi) {
  if (csi >= 10) return { id: 'CRITICAL', status: 'RENDSZERSZINTŰ ANTIFLUX', color: '#111827' };
  if (csi >= 7)  return { id: 'RED',      status: 'KRITIKUS ANTIFLUX',       color: '#dc2626' };
  if (csi >= 4)  return { id: 'ORANGE',   status: 'ANTIFLUX',                color: '#ea580c' };
  if (csi >= 2)  return { id: 'YELLOW',   status: 'FIGYELEM',                color: '#ca8a04' };
  return              { id: 'GREEN',   status: 'NORMATÍV',                color: '#16a34a' };
}

/**
 * Evaluate Noo-CSI triggers.
 * @param {number} csi
 * @param {object} vars
 * @returns {{ dki_high: boolean, npr_polarised: boolean, aif_algo_dom: boolean, noo_csi_critical: boolean, active_triggers: string[] }}
 */
export function evaluateNooCSITriggers(csi, vars) {
  const { DKI = 0, NPR = 0, AIF = 0 } = vars;
  const dki_high       = DKI > 6;
  const npr_polarised  = NPR > 3.0;
  const aif_algo_dom   = AIF > 0.7;
  const noo_csi_critical = csi > 6.9;

  const active_triggers = [];
  if (dki_high)         active_triggers.push('DKI_HIGH');
  if (npr_polarised)    active_triggers.push('NPR_POLARISED');
  if (aif_algo_dom)     active_triggers.push('AIF_ALGO_DOM');
  if (noo_csi_critical) active_triggers.push('NOO_CSI_CRITICAL');

  return { dki_high, npr_polarised, aif_algo_dom, noo_csi_critical, active_triggers };
}

/**
 * Main Noo-CSI model calculation.
 * @param {object} inputs
 * @returns {object}
 */
export function calculateNooCSI(inputs = {}) {
  const defaults = {
    DKI: 7.2,
    NPR: 3.8,
    AIF: 0.82,
  };

  const missing = [];
  const vars = {};
  for (const k of Object.keys(defaults)) {
    if (inputs[k] !== undefined) {
      vars[k] = inputs[k];
    } else {
      vars[k] = defaults[k];
      missing.push(k);
    }
  }

  const { DKI, NPR, AIF } = vars;

  const dki_norm = Math.min(DKI / 16, 1) * 10;
  const npr_norm = Math.min(NPR, 10);
  const aif_norm = Math.min(AIF, 1) * 10;

  const csi_noo = 0.4 * dki_norm + 0.4 * npr_norm + 0.2 * aif_norm;

  const zone     = classifyNooCSIZone(csi_noo);
  const triggers = evaluateNooCSITriggers(csi_noo, vars);

  return {
    csi_noo:  parseFloat(csi_noo.toFixed(4)),
    zone,
    triggers,
    components: {
      dki_norm: parseFloat(dki_norm.toFixed(4)),
      npr_norm: parseFloat(npr_norm.toFixed(4)),
      aif_norm: parseFloat(aif_norm.toFixed(4)),
    },
    diagnostics: {
      missing_inputs: missing,
      confidence:     parseFloat((1 - missing.length / Object.keys(defaults).length).toFixed(2)),
    },
    variables: { raw: vars },
  };
}

// =============================================================================
// EFU 600.58 — UPF Anyagcsere Parazitizmus (CFI-N) v0.2
// =============================================================================

/**
 * Classify CFI-N value into a zone.
 * @param {number} cfin
 * @returns {{ id: string, status: string, color: string }}
 */
export function classifyCFINZone(cfin) {
  if (cfin >= 1200) return { id: 'CRITICAL', status: 'CIVILIZÁCIÓS ANTIFLUX SPIRÁL', color: '#111827' };
  if (cfin >= 700)  return { id: 'RED',      status: 'KRITIKUS – Fire Chief szint',  color: '#dc2626' };
  if (cfin >= 400)  return { id: 'ORANGE',   status: 'METABOLIKUS ANTIFLUX',         color: '#ea580c' };
  if (cfin >= 200)  return { id: 'YELLOW',   status: 'FIGYELEM',                     color: '#ca8a04' };
  return                { id: 'GREEN',   status: 'NORMATÍV',                      color: '#16a34a' };
}

/**
 * Evaluate CFI-N triggers.
 * @param {number} cfin
 * @param {object} vars
 * @returns {object}
 */
export function evaluateCFINTriggers(cfin, vars) {
  const { upf_ratio = 0, pfas_synergy = 0, F_regen_gut = 1, microbiom_loss = 0 } = vars;
  const kombinalt_biokockazat = upf_ratio > 0.40 && pfas_synergy > 0.20;
  const fire_chief            = cfin > 700;
  const civilizacios_spiral   = cfin > 500;
  const mikrobiom_kolaps      = F_regen_gut < 0.30 && microbiom_loss > 0.60;

  const active_triggers = [];
  if (kombinalt_biokockazat) active_triggers.push('KOMBINALT_BIOKOCKAZAT');
  if (fire_chief)            active_triggers.push('FIRE_CHIEF');
  if (civilizacios_spiral)   active_triggers.push('CIVILIZACIOS_SPIRAL');
  if (mikrobiom_kolaps)      active_triggers.push('MIKROBIOM_KOLAPS');

  return { kombinalt_biokockazat, fire_chief, civilizacios_spiral, mikrobiom_kolaps, active_triggers };
}

/**
 * Main CFI-N model calculation.
 * @param {object} inputs
 * @returns {object}
 */
export function calculateCFIN(inputs = {}) {
  const defaults = {
    upf_ratio:          0.45,
    insulin_resistance: 0.40,
    inflammation_index: 0.35,
    pfas_synergy:       0.30,
    F_regen_gut:        0.40,
    microbiom_loss:     0.45,
    Debt_rate_N:        0.10,
    t_years:            5,
    cfib_factor:        0.25,
  };

  const missing = [];
  const vars = {};
  for (const k of Object.keys(defaults)) {
    if (inputs[k] !== undefined) {
      vars[k] = inputs[k];
    } else {
      vars[k] = defaults[k];
      missing.push(k);
    }
  }

  const { upf_ratio, insulin_resistance, inflammation_index, pfas_synergy,
          F_regen_gut, Debt_rate_N, t_years, cfib_factor } = vars;

  const B_food = upf_ratio < 0.20 ? 1.0 : upf_ratio < 0.50 ? 1.3 : 1.7;

  const extractive_sum =
    upf_ratio * insulin_resistance * 0.30 +
    upf_ratio * inflammation_index * 0.25 +
    upf_ratio * (1 - F_regen_gut)  * 0.25 +
    pfas_synergy * 0.20;

  const W_irrev = 0.70;

  const cfin_base  = extractive_sum * W_irrev * (1 / Math.max(0.01, F_regen_gut)) * B_food * 1000;
  const cfin_pfas  = cfin_base * (1 + 0.4 * cfib_factor);
  const cfin_total = cfin_pfas * (1 + Debt_rate_N * t_years);

  const zone     = classifyCFINZone(cfin_total);
  const triggers = evaluateCFINTriggers(cfin_total, vars);

  return {
    cfin_base:  parseFloat(cfin_base.toFixed(4)),
    cfin_pfas:  parseFloat(cfin_pfas.toFixed(4)),
    cfin_total: parseFloat(cfin_total.toFixed(4)),
    zone,
    triggers,
    components: {
      B_food,
      extractive_sum: parseFloat(extractive_sum.toFixed(4)),
      W_irrev,
    },
    diagnostics: {
      Debt_rate_N,
      t_years,
      cfib_factor,
      missing_inputs: missing,
      confidence:     parseFloat((1 - missing.length / Object.keys(defaults).length).toFixed(2)),
    },
    variables: { raw: vars },
  };
}

// =============================================================================
// EFU 800.13 — MEII Metabolikus Érték-Intenzitás Index v1.1
// =============================================================================

/**
 * Classify MEII value into a zone.
 * @param {number} meii  - USD/EFU value
 * @returns {{ id: string, status: string, color: string, note: string }}
 */
export function classifyMEIIZone(meii) {
  if (meii >= 40) return { id: 'ELITE',    status: 'KIVÁLÓ',   color: '#15803d', note: 'Elithatékony – hi-tech, körforgásos struktúra' };
  if (meii >= 30) return { id: 'HIGH',     status: 'JÓ',       color: '#16a34a', note: 'Magas hatékonyság – fejlett gazdaság' };
  if (meii >= 15) return { id: 'MEDIUM',   status: 'ÁTLAGOS',  color: '#ca8a04', note: 'Közepes – fejlesztési potenciál' };
  if (meii >= 5)  return { id: 'LOW',      status: 'GYENGE',   color: '#ea580c', note: 'Alacsony – nehézipar vagy nyersanyag-dominancia' };
  return               { id: 'CRITICAL', status: 'KRITIKUS', color: '#dc2626', note: 'Kritikusan alacsony – azonnali szerkezeti váltás szükséges' };
}

/**
 * Evaluate MEII-based policy triggers.
 * @param {number} meii
 * @param {object} vars
 * @returns {object}
 */
export function evaluateMEIITriggers(meii, vars) {
  const { growth_rate = 0, efu_growth_rate = 0 } = vars;

  const decoupling      = efu_growth_rate < growth_rate;
  const absolute_decoup = efu_growth_rate <= 0 && growth_rate > 0;
  const elite_threshold = meii >= 40;
  const critical_low    = meii < 5;
  const cbam_needed     = meii < 15;

  const active_triggers = [];
  if (elite_threshold)  active_triggers.push('ELITE_MEII');
  if (absolute_decoup)  active_triggers.push('ABSOLUTE_DECOUPLING');
  if (decoupling)       active_triggers.push('RELATIVE_DECOUPLING');
  if (critical_low)     active_triggers.push('CRITICAL_LOW_MEII');
  if (cbam_needed)      active_triggers.push('CBAM_RECOMMENDED');

  return { decoupling, absolute_decoup, elite_threshold, critical_low, cbam_needed, active_triggers };
}

/**
 * Main MEII calculation.
 * @param {object} inputs
 * @returns {object}
 */
export function calculateMEII(inputs = {}) {
  const defaults = {
    gdp_bn:               28000,
    pop_efu_bn:           122.3,
    industry_efu_bn:      400,
    agri_efu_bn:          180,
    waste_efu_bn:         50,
    lw_destructive:       1.5,
    lw_luxury:            1.0,
    lw_essential:         0.65,
    lw_regenerative:      0.3,
    lw_digital:           0.45,
    growth_rate:          0.023,
    efu_growth_rate:      0.008,
    tax_rate_usd_per_efu: 0.10,
  };

  const missing = [];
  const vars = {};
  for (const k of Object.keys(defaults)) {
    if (inputs[k] !== undefined) {
      vars[k] = inputs[k];
    } else {
      vars[k] = defaults[k];
      missing.push(k);
    }
  }

  const {
    gdp_bn, pop_efu_bn, industry_efu_bn, agri_efu_bn, waste_efu_bn,
    lw_destructive, lw_luxury, lw_essential,
    growth_rate, efu_growth_rate, tax_rate_usd_per_efu,
  } = vars;

  const efu_total_bn = pop_efu_bn + industry_efu_bn + agri_efu_bn + waste_efu_bn;
  const meii         = efu_total_bn > 0 ? gdp_bn / efu_total_bn : 0;

  const weighted_efu_bn =
    pop_efu_bn      * lw_essential  +
    industry_efu_bn * lw_destructive +
    agri_efu_bn     * lw_luxury     +
    waste_efu_bn    * lw_destructive;
  const meii_w = weighted_efu_bn > 0 ? gdp_bn / weighted_efu_bn : 0;

  const efu_tax_revenue_bn = efu_total_bn * tax_rate_usd_per_efu;

  const meii_china = 4.0;
  const cbam_ref_factor = meii > meii_china ? (meii - meii_china) : 0;

  const zone     = classifyMEIIZone(meii);
  const triggers = evaluateMEIITriggers(meii, { ...vars, efu_total_bn });

  return {
    meii:               parseFloat(meii.toFixed(2)),
    meii_w:             parseFloat(meii_w.toFixed(2)),
    efu_total_bn:       parseFloat(efu_total_bn.toFixed(1)),
    efu_tax_revenue_bn: parseFloat(efu_tax_revenue_bn.toFixed(2)),
    cbam_ref_factor:    parseFloat(cbam_ref_factor.toFixed(2)),
    zone,
    triggers,
    components: {
      pop_efu_bn,
      industry_efu_bn,
      agri_efu_bn,
      waste_efu_bn,
      weighted_efu_bn: parseFloat(weighted_efu_bn.toFixed(1)),
    },
    diagnostics: {
      growth_rate,
      efu_growth_rate,
      decoupling_gap:       parseFloat((growth_rate - efu_growth_rate).toFixed(4)),
      tax_rate_usd_per_efu,
      missing_inputs: missing,
      confidence: parseFloat((1 - missing.length / Object.keys(defaults).length).toFixed(2)),
    },
    variables: { raw: vars },
  };
}

// ===========================================================================
// EFU 700.2 – Közösségi Energia Szövetkezet (CEKS)
// ===========================================================================

/**
 * CEKS zóna besorolás (0-10 index alapján).
 * @param {number} ceks_index
 */
export function classifyCEKSZone(ceks_index) {
  if (ceks_index >= 8) return { id: 'OPTIMAL',  label: '⭐ Optimális',        status: 'BENCHMARK',  color: '#0369a1', action: 'Benchmark protokoll – EU skálázható referenciamodell' };
  if (ceks_index >= 6) return { id: 'HIGH',     label: '🟢 Magas',            status: 'THRIVING',   color: '#16a34a', action: 'Virágzó szövetkezet – skálázás és replikáció' };
  if (ceks_index >= 4) return { id: 'MEDIUM',   label: '🟡 Közepes',          status: 'OPERATIVE',  color: '#ca8a04', action: 'Működőképes – governance és pénzügyi optimalizálás' };
  if (ceks_index >= 2) return { id: 'LOW',      label: '🟠 Alacsony',         status: 'DEVELOPING', color: '#ea580c', action: 'Fejlesztési fázis – kapacitásbővítés szükséges' };
  return                      { id: 'CRITICAL', label: '�� Kritikus',         status: 'FAILED',     color: '#dc2626', action: 'Alapvető rendszerhibák – komplex újratervezés szükséges' };
}

/**
 * CEKS trigger kiértékelés.
 * @param {object} ceks  – számított értékek (usable_gwh, flr_total, profit_k, ceks_index)
 * @param {object} vars  – nyers bemenetek
 */
export function evaluateCEKSTriggers(ceks, vars) {
  const energy_deficit     = ceks.usable_gwh < 4.0;
  const high_flr           = ceks.flr_total > 25;
  const profit_loss        = ceks.profit_k < 0;
  const benchmark_reached  = ceks.ceks_index >= 8;

  const active_triggers = [];
  if (energy_deficit)    active_triggers.push('ENERGY_DEFICIT');
  if (high_flr)          active_triggers.push('HIGH_FLR');
  if (profit_loss)       active_triggers.push('PROFIT_LOSS');
  if (benchmark_reached) active_triggers.push('BENCHMARK_REACHED');

  return { energy_deficit, high_flr, profit_loss, benchmark_reached, active_triggers };
}

/**
 * Főmodell: Közösségi Energia Szövetkezet Index (CEKS) – 0-10 skála
 *
 * @param {{ solar_mwp?: number, wind_mw?: number, storage_mwh?: number,
 *            members?: number, governance_q?: number, rte?: number,
 *            retail_price_mwh?: number, self_suff_target?: number }} inputs
 */
export function calculateCEKS(inputs = {}) {
  const defaults = {
    solar_mwp: 5, wind_mw: 1, storage_mwh: 4, members: 1000,
    governance_q: 0.8, rte: 0.77, retail_price_mwh: 250, self_suff_target: 0.70,
  };
  const capex_m = 5; // fixed default

  const missing = [];
  const vars = {};
  for (const k of Object.keys(defaults)) {
    if (inputs[k] !== undefined) {
      vars[k] = inputs[k];
    } else {
      vars[k] = defaults[k];
      missing.push(k);
    }
  }

  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

  // Energy
  const gross_gwh     = vars.solar_mwp * 1.2 + vars.wind_mw * 2.0;
  const usable_gwh    = gross_gwh * vars.rte;
  const per_capita_gwh = usable_gwh / vars.members;
  const energy_ratio  = clamp(per_capita_gwh / 0.006, 0, 1.5);

  // HMI
  const HMI_bill   = Math.min(energy_ratio, 1.0) * 1.2;
  const HMI_agency = vars.governance_q * 0.75;
  const HMI_total  = HMI_bill + HMI_agency;

  // R_future
  const R_future = 1.0 + clamp(energy_ratio * 0.35 + vars.governance_q * 0.15, 0, 0.8);

  // FLR
  const flr_inverter    = (1 - vars.rte) * 35;
  const flr_governance  = (1 - vars.governance_q) * 15 + 10;
  const flr_total       = flr_inverter + flr_governance;

  // Financial (€k)
  const self_consumed_gwh  = usable_gwh * vars.self_suff_target;
  const exported_gwh       = usable_gwh * (1 - vars.self_suff_target);
  const bill_savings_k     = self_consumed_gwh * 1000 * vars.retail_price_mwh / 1000;
  const export_revenue_k   = exported_gwh * 1000 * 80 / 1000;
  const service_k          = 100;
  const total_revenue_k    = bill_savings_k + export_revenue_k + service_k;
  const opex_k             = 200 + 100 + capex_m * 50;
  const profit_k           = total_revenue_k - opex_k;

  // CO2
  const co2_t = usable_gwh * 1000 * 0.40;

  // CEKS index (0-10)
  const energy_score       = clamp(energy_ratio, 0, 1);
  const governance_score   = vars.governance_q;
  const financial_score    = clamp(profit_k / 700, 0, 1);
  const sustainability_score = clamp(1 - flr_total / 30, 0, 1);
  const ceks_index         = (energy_score * 0.40 + governance_score * 0.30 + financial_score * 0.20 + sustainability_score * 0.10) * 10;

  const computed = { usable_gwh, flr_total, profit_k, ceks_index };
  const zone     = classifyCEKSZone(ceks_index);
  const triggers = evaluateCEKSTriggers(computed, vars);

  return {
    ceks_index:         parseFloat(ceks_index.toFixed(3)),
    zone,
    triggers,
    energy: {
      gross_gwh:        parseFloat(gross_gwh.toFixed(3)),
      usable_gwh:       parseFloat(usable_gwh.toFixed(3)),
      per_capita_gwh:   parseFloat(per_capita_gwh.toFixed(6)),
      energy_ratio:     parseFloat(energy_ratio.toFixed(3)),
    },
    hmi: {
      HMI_bill:         parseFloat(HMI_bill.toFixed(3)),
      HMI_agency:       parseFloat(HMI_agency.toFixed(3)),
      HMI_total:        parseFloat(HMI_total.toFixed(3)),
    },
    financial: {
      bill_savings_k:   parseFloat(bill_savings_k.toFixed(1)),
      export_revenue_k: parseFloat(export_revenue_k.toFixed(1)),
      total_revenue_k:  parseFloat(total_revenue_k.toFixed(1)),
      opex_k:           parseFloat(opex_k.toFixed(1)),
      profit_k:         parseFloat(profit_k.toFixed(1)),
    },
    sustainability: {
      flr_inverter:     parseFloat(flr_inverter.toFixed(2)),
      flr_governance:   parseFloat(flr_governance.toFixed(2)),
      flr_total:        parseFloat(flr_total.toFixed(2)),
      co2_t:            parseFloat(co2_t.toFixed(1)),
      R_future:         parseFloat(R_future.toFixed(3)),
    },
    scores: {
      energy_score:         parseFloat(energy_score.toFixed(3)),
      governance_score:     parseFloat(governance_score.toFixed(3)),
      financial_score:      parseFloat(financial_score.toFixed(3)),
      sustainability_score: parseFloat(sustainability_score.toFixed(3)),
    },
    diagnostics: {
      capex_m,
      missing_inputs: missing,
      confidence: parseFloat((1 - missing.length / Object.keys(defaults).length).toFixed(2)),
    },
    variables: { raw: vars },
  };
}

// ===========================================================================
// EFU 700.1.1 – Regeneratív Mérési Protokoll (RMP)
// ===========================================================================

/**
 * RMP zóna besorolás (0-10 index alapján).
 * @param {number} rmp_index
 */
export function classifyRMPZone(rmp_index) {
  if (rmp_index >= 8)   return { id: 'OPTIMAL',      label: '⭐ Optimális',  status: 'OPTIMAL',      color: '#0369a1', action: 'Optimális protokoll – replikáció és EU publikáció' };
  if (rmp_index >= 6.5) return { id: 'REGENERATIVE', label: '🟢 Regeneratív', status: 'REGENERATIVE', color: '#16a34a', action: 'Regeneratív kapacitás aktív – pilot finanszírozás aktiválható' };
  if (rmp_index >= 5)   return { id: 'BASELINE',     label: '🟡 Alap',       status: 'BASELINE',     color: '#ca8a04', action: 'Alapszintű funkció – mérési rendszer stabilizálása' };
  if (rmp_index >= 3)   return { id: 'WEAK',         label: '🟠 Gyenge',     status: 'WEAK',         color: '#ea580c', action: 'Gyenge regeneratív kapacitás – szisztematikus fejlesztés' };
  return                       { id: 'DEGRADED',     label: '🔴 Degradált',  status: 'DEGRADED',     color: '#dc2626', action: 'Talaj- és gazda-állapot kritikus – azonnali beavatkozás' };
}

/**
 * RMP trigger kiértékelés.
 */
export function evaluateRMPTriggers(rmp, vars) {
  const soil_critical   = rmp.soil_score < 0.4;
  const farmer_burnout  = vars.hrv_stress > 0.7 && vars.hrv_rmssd_pct < 0.4;
  const lora_gap        = vars.lora_coverage < 0.5;
  const pilot_ready     = rmp.rmp_index >= 6.5;

  const active_triggers = [];
  if (soil_critical)  active_triggers.push('SOIL_CRITICAL');
  if (farmer_burnout) active_triggers.push('FARMER_BURNOUT');
  if (lora_gap)       active_triggers.push('LORA_GAP');
  if (pilot_ready)    active_triggers.push('PILOT_READY');

  return { soil_critical, farmer_burnout, lora_gap, pilot_ready, active_triggers };
}

/**
 * Főmodell: Regeneratív Mérési Protokoll Index (RMP) – 0-10 skála
 *
 * @param {{ tdr_moisture?: number, ec_fertility?: number, redox_health?: number,
 *            som_delta?: number, hrv_rmssd_pct?: number, hrv_stress?: number,
 *            esm_wellbeing?: number, esm_engagement?: number,
 *            lora_coverage?: number, sensor_drift?: number }} inputs
 */
export function calculateRMP(inputs = {}) {
  const defaults = {
    tdr_moisture: 0.55, ec_fertility: 0.60, redox_health: 0.58, som_delta: 0.3,
    hrv_rmssd_pct: 0.55, hrv_stress: 0.40,
    esm_wellbeing: 0.62, esm_engagement: 0.58,
    lora_coverage: 0.75, sensor_drift: 0.08,
  };

  const missing = [];
  const vars = {};
  for (const k of Object.keys(defaults)) {
    if (inputs[k] !== undefined) {
      vars[k] = inputs[k];
    } else {
      vars[k] = defaults[k];
      missing.push(k);
    }
  }

  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

  // Soil score
  const som_norm  = clamp(vars.som_delta * 0.5 + 0.5, 0, 1);
  const soil_score = vars.tdr_moisture * 0.30 + vars.ec_fertility * 0.25 + vars.redox_health * 0.25 + som_norm * 0.20;

  // HRV score
  const hrv_score  = vars.hrv_rmssd_pct * (1 - vars.hrv_stress * 0.5);

  // ESM score
  const esm_score  = vars.esm_wellbeing * 0.55 + vars.esm_engagement * 0.45;

  // System quality
  const system_q   = vars.lora_coverage * (1 - vars.sensor_drift * 2);

  // NET_EFU
  const base_efu       = soil_score * 0.40 + hrv_score * 0.30 + esm_score * 0.20 + system_q * 0.10;
  const net_efu_half   = base_efu * 5.0;
  const net_efu_annual = net_efu_half * 2;

  // FLR
  const flr_sensor   = vars.sensor_drift * 100;
  const flr_human    = (1 - vars.hrv_rmssd_pct) * 10 + vars.hrv_stress * 5;
  const flr_coverage = (1 - vars.lora_coverage) * 15;
  const flr_total    = clamp(flr_sensor * 0.40 + flr_human * 0.40 + flr_coverage * 0.20, 5, 20);

  // R_future
  const R_future = 1.0 + clamp(soil_score * 0.20 + hrv_score * 0.15 + esm_score * 0.10, 0, 0.5);

  // RMP index
  const rmp_index = base_efu * 10;

  const computed = { soil_score, rmp_index };
  const zone     = classifyRMPZone(rmp_index);
  const triggers = evaluateRMPTriggers(computed, vars);

  return {
    rmp_index:       parseFloat(rmp_index.toFixed(3)),
    zone,
    triggers,
    layers: {
      soil_score:    parseFloat(soil_score.toFixed(3)),
      hrv_score:     parseFloat(hrv_score.toFixed(3)),
      esm_score:     parseFloat(esm_score.toFixed(3)),
      system_q:      parseFloat(system_q.toFixed(3)),
    },
    net_efu: {
      base_efu:       parseFloat(base_efu.toFixed(4)),
      net_efu_half:   parseFloat(net_efu_half.toFixed(3)),
      net_efu_annual: parseFloat(net_efu_annual.toFixed(3)),
    },
    sustainability: {
      flr_sensor:   parseFloat(flr_sensor.toFixed(2)),
      flr_human:    parseFloat(flr_human.toFixed(2)),
      flr_coverage: parseFloat(flr_coverage.toFixed(2)),
      flr_total:    parseFloat(flr_total.toFixed(2)),
      R_future:     parseFloat(R_future.toFixed(3)),
    },
    diagnostics: {
      som_norm:       parseFloat(som_norm.toFixed(3)),
      missing_inputs: missing,
      confidence: parseFloat((1 - missing.length / Object.keys(defaults).length).toFixed(2)),
    },
    variables: { raw: vars },
  };
}

// ===========================================================================
// EFU 700.1.1.2 – Agro-Energia Szimbiózis (AES)
// ===========================================================================

/**
 * AES zóna besorolás (0-10 index alapján).
 * @param {number} aes_index
 */
export function classifyAESZone(aes_index) {
  if (aes_index >= 8) return { id: 'OPTIMAL',   label: '⭐ Foton-szimbiózis',    status: 'OPTIMAL',    color: '#0369a1', action: 'Optimális foton-szimbiózis – EU benchmark, publikáció kész' };
  if (aes_index >= 6) return { id: 'SYMBIOTIC', label: '🟢 Szimbiózis',          status: 'SYMBIOTIC',  color: '#16a34a', action: 'Foton-szimbiózis aktív – trilógia kész, skálázás lehetséges' };
  if (aes_index >= 4) return { id: 'OPERATIVE', label: '🟡 Működő APV',          status: 'OPERATIVE',  color: '#ca8a04', action: 'Működő agrovoltaika – kompakció és variancia csökkentés' };
  if (aes_index >= 2) return { id: 'WEAK',      label: '🟠 Gyenge integrálás',   status: 'WEAK',       color: '#ea580c', action: 'Gyenge szimbiotikus hatás – LER és RTE optimalizálás' };
  return                     { id: 'CRITICAL',  label: '🔴 Kritikus',            status: 'CRITICAL',   color: '#dc2626', action: 'Alapvető APV integráció nem működik – rendszer-újratervezés' };
}

/**
 * AES trigger kiértékelés.
 */
export function evaluateAESTriggers(aes, vars) {
  const compaction_critical = vars.soil_compaction * (1 - vars.ctf_mitigation) > 0.15;
  const ler_low             = aes.LER_effective < 1.15;
  const high_crop_variance  = vars.crop_variance > 0.45;
  const symbiosis_active    = aes.aes_index >= 6.0;

  const active_triggers = [];
  if (compaction_critical) active_triggers.push('COMPACTION_CRITICAL');
  if (ler_low)             active_triggers.push('LER_LOW');
  if (high_crop_variance)  active_triggers.push('HIGH_CROP_VARIANCE');
  if (symbiosis_active)    active_triggers.push('SYMBIOSIS_ACTIVE');

  return { compaction_critical, ler_low, high_crop_variance, symbiosis_active, active_triggers };
}

/**
 * Főmodell: Agro-Energia Szimbiózis Index (AES) – 0-10 skála
 *
 * @param {{ ler?: number, rte_chain?: number, evapot_reduction?: number,
 *            soil_compaction?: number, crop_variance?: number, shade_gain?: number,
 *            biomass_rte?: number, ctf_mitigation?: number }} inputs
 */
export function calculateAES(inputs = {}) {
  const defaults = {
    ler: 1.4, rte_chain: 0.77, evapot_reduction: 0.25, soil_compaction: 0.12,
    crop_variance: 0.30, shade_gain: 0.35, biomass_rte: 0.40, ctf_mitigation: 0.50,
  };

  const missing = [];
  const vars = {};
  for (const k of Object.keys(defaults)) {
    if (inputs[k] !== undefined) {
      vars[k] = inputs[k];
    } else {
      vars[k] = defaults[k];
      missing.push(k);
    }
  }

  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

  // Land
  const LER_effective    = vars.ler * (1 - vars.soil_compaction * (1 - vars.ctf_mitigation));
  const net_land_gain_pct = (LER_effective - 1) * 100;

  // Crop
  const crop_net_gain = vars.shade_gain * (1 - vars.crop_variance * 0.5);

  // Water
  const water_efficiency = vars.evapot_reduction;

  // Scores
  const land_score       = clamp((LER_effective - 1) / 0.7, 0, 1);
  const energy_score_aes = clamp((vars.rte_chain - 0.60) / 0.30, 0, 1);
  const water_score      = clamp(vars.evapot_reduction / 0.30, 0, 1);
  const crop_score       = clamp(crop_net_gain / 0.5, 0, 1);

  // EFU Multiplier
  const efu_multiplier = 1.0 + land_score * 0.35 + energy_score_aes * 0.15 + water_score * 0.10;

  // HMI_gazda
  const HMI_gazda = land_score * 1.2;

  // R_future
  const R_future_aes = 1.0 + land_score * 0.30 + energy_score_aes * 0.20;

  // FLR
  const flr_rte       = (1 - vars.rte_chain) * 30;
  const flr_compaction = vars.soil_compaction * (1 - vars.ctf_mitigation) * 100 / 2;
  const flr_crop_risk  = vars.crop_variance * 30;
  const flr_total_aes  = clamp(flr_rte + flr_compaction + flr_crop_risk, 5, 40);

  // AES index
  const financial_score = clamp(crop_net_gain / 0.35, 0, 1);
  const aes_index       = (land_score * 0.35 + energy_score_aes * 0.25 + water_score * 0.20 + crop_score * 0.20) * 10;

  const computed = { LER_effective, aes_index };
  const zone     = classifyAESZone(aes_index);
  const triggers = evaluateAESTriggers(computed, vars);

  return {
    aes_index:           parseFloat(aes_index.toFixed(3)),
    zone,
    triggers,
    land: {
      LER_effective:      parseFloat(LER_effective.toFixed(3)),
      net_land_gain_pct:  parseFloat(net_land_gain_pct.toFixed(2)),
    },
    crop: {
      crop_net_gain:      parseFloat(crop_net_gain.toFixed(3)),
      water_efficiency:   parseFloat(water_efficiency.toFixed(3)),
    },
    efu: {
      efu_multiplier:     parseFloat(efu_multiplier.toFixed(3)),
      HMI_gazda:          parseFloat(HMI_gazda.toFixed(3)),
      R_future_aes:       parseFloat(R_future_aes.toFixed(3)),
    },
    sustainability: {
      flr_rte:            parseFloat(flr_rte.toFixed(2)),
      flr_compaction:     parseFloat(flr_compaction.toFixed(2)),
      flr_crop_risk:      parseFloat(flr_crop_risk.toFixed(2)),
      flr_total_aes:      parseFloat(flr_total_aes.toFixed(2)),
    },
    scores: {
      land_score:         parseFloat(land_score.toFixed(3)),
      energy_score_aes:   parseFloat(energy_score_aes.toFixed(3)),
      water_score:        parseFloat(water_score.toFixed(3)),
      crop_score:         parseFloat(crop_score.toFixed(3)),
      financial_score:    parseFloat(financial_score.toFixed(3)),
    },
    diagnostics: {
      missing_inputs: missing,
      confidence: parseFloat((1 - missing.length / Object.keys(defaults).length).toFixed(2)),
    },
    variables: { raw: vars },
  };
}

// ===========================================================================
// EFU 700.5 – Participatív Költségvetés / dFOS (Distributed Fiscal OS)
// ===========================================================================

/**
 * dFOS zóna besorolás (0-10 index alapján).
 * @param {number} dfos_index
 */
export function classifyDFOSZone(dfos_index) {
  if (dfos_index >= 8) return { id: 'OPTIMAL',  label: '⭐ Optimális dFOS Kernel', status: 'OPTIMAL',  color: '#0369a1', action: 'dFOS kernel aktív – R_future 1.4+, 700 stack closed-loop, globális replikáció' };
  if (dfos_index >= 6) return { id: 'ACTIVE',   label: '🟢 Aktív dFOS',           status: 'ACTIVE',   color: '#16a34a', action: 'Porto Alegre szint – R_future 1.1–1.3, HMI +2.0 EFU/lakos, korrupció −70%' };
  if (dfos_index >= 4) return { id: 'EMERGING', label: '🟡 Induló dFOS',          status: 'EMERGING', color: '#ca8a04', action: 'Részvétel elindul – 700.4 pipeline aktiválás, info-aszimmetria csökkentés' };
  if (dfos_index >= 2) return { id: 'WEAK',     label: '🟠 Gyenge dFOS',          status: 'WEAK',     color: '#ea580c', action: 'Részleges részvétel – magas befogási kockázat, szortíció szükséges' };
  return                      { id: 'PARASITIC',label: '🔴 Intézményi Parazita',  status: 'PARASITIC',color: '#dc2626', action: '600.18 aktív – top-down döntéshozatal, korrupció strukturális' };
}

/**
 * dFOS trigger kiértékelés.
 */
export function evaluateDFOSTriggers(dfos, vars) {
  const capture_risk_high   = vars.capture_risk > 0.40 && vars.sortition_level < 0.30;
  const info_asymmetry_high = vars.info_asymmetry > 0.35 && vars.knowledge_pipeline < 0.30;
  const pilot_active        = dfos.dfos_index >= 6.0;
  const dfos_kernel_active  = dfos.dfos_index >= 8.0 && vars.knowledge_pipeline >= 0.70;

  const active_triggers = [];
  if (capture_risk_high)   active_triggers.push('CAPTURE_RISK_HIGH');
  if (info_asymmetry_high) active_triggers.push('INFO_ASYMMETRY_HIGH');
  if (pilot_active)        active_triggers.push('PILOT_ACTIVE');
  if (dfos_kernel_active)  active_triggers.push('DFOS_KERNEL_ACTIVE');

  return { capture_risk_high, info_asymmetry_high, pilot_active, dfos_kernel_active, active_triggers };
}

/**
 * Főmodell: Distributed Fiscal Operating System Index (dFOS) – 0-10 skála
 *
 * @param {{ participation_rate?: number, budget_share?: number, sortition_level?: number,
 *            alloc_capex_strat?: number, open_budget_pct?: number, public_monitoring?: number,
 *            capture_risk?: number, knowledge_pipeline?: number, digital_tools?: number,
 *            info_asymmetry?: number, deliberate_exhaustion?: number,
 *            population_k?: number }} inputs
 */
export function calculateDFOS(inputs = {}) {
  const defaults = {
    participation_rate:   0.033,
    budget_share:         0.175,
    sortition_level:      0.50,
    alloc_capex_strat:    0.40,
    open_budget_pct:      0.85,
    public_monitoring:    0.70,
    capture_risk:         0.25,
    knowledge_pipeline:   0.55,
    digital_tools:        0.50,
    info_asymmetry:       0.20,
    deliberate_exhaustion: 0.12,
    population_k:         1500,
  };

  const missing = [];
  const vars = {};
  for (const k of Object.keys(defaults)) {
    if (inputs[k] !== undefined) {
      vars[k] = inputs[k];
    } else {
      vars[k] = defaults[k];
      missing.push(k);
    }
  }

  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

  // Participation score
  const participation_norm   = clamp(vars.participation_rate / 0.10, 0, 1);
  const budget_share_norm    = clamp(vars.budget_share / 0.30, 0, 1);
  const sortition_mitigated  = clamp(vars.sortition_level * (1 - vars.capture_risk * 0.5), 0, 1);
  const participation_score  = participation_norm * 0.45 + budget_share_norm * 0.30 + sortition_mitigated * 0.25;

  // Transparency score
  const capture_mitigated    = clamp(1 - vars.capture_risk * (1 - vars.sortition_level * 0.5), 0, 1);
  const transparency_score   = vars.open_budget_pct * 0.50 + vars.public_monitoring * 0.30 + capture_mitigated * 0.20;

  // Info quality score
  const exhaustion_mitigated = clamp(vars.deliberate_exhaustion * (1 - vars.digital_tools * 0.45), 0, 0.30);
  const asymm_mitigated      = clamp(vars.info_asymmetry * (1 - vars.knowledge_pipeline * 0.50), 0, 0.50);
  const info_quality_score   = vars.knowledge_pipeline * 0.50 + vars.digital_tools * 0.30
                                - exhaustion_mitigated * 0.40 - asymm_mitigated * 0.30 + 0.5;
  const info_score           = clamp(info_quality_score, 0, 1);

  // Accountability score
  const accountability_score = vars.public_monitoring * 0.60 + vars.open_budget_pct * 0.40;

  // dFOS composite index (0-10)
  const base_dfos = participation_score * 0.30
                  + transparency_score  * 0.25
                  + info_score          * 0.25
                  + accountability_score * 0.20;
  const dfos_index = base_dfos * 10;

  // NET_EFU (Porto Alegre reference: 1.5M × +0.3 HMI-gain = 450k EFU/év)
  const hmi_per_capita = clamp(base_dfos * 2.0, 0, 2.5);
  const net_efu_annual = vars.population_k * 1000 * hmi_per_capita * 0.15;

  // R_future
  const R_opex_only  = 1.1;
  const R_capex      = 1.4;
  const R_future     = R_opex_only + (R_capex - R_opex_only) * vars.alloc_capex_strat * base_dfos;

  // Interstitium (társadalmi bizalom proxy)
  const interstitium_gain_pct = clamp(base_dfos * 60, 0, 80);

  // Corruption reduction (600.18 antiflux)
  const corruption_reduction_pct = clamp(base_dfos * 80, 0, 80);

  // FLR components
  const flr_exhaustion  = exhaustion_mitigated * 100;
  const flr_capture     = clamp(vars.capture_risk * 100 * (1 - vars.sortition_level * 0.7), 5, 40);
  const flr_info        = asymm_mitigated * 50;
  const flr_total_raw   = clamp(flr_exhaustion * 0.33 + flr_capture * 0.40 + flr_info * 0.27, 5, 45);
  const flr_mitigated   = clamp(flr_total_raw * (1 - vars.digital_tools * 0.30 - vars.knowledge_pipeline * 0.20), 5, 40);

  // Alloc breakdown
  const R_current = 1.0 + (vars.alloc_capex_strat) * 0.40 * base_dfos;

  const computed  = { dfos_index };
  const zone      = classifyDFOSZone(dfos_index);
  const triggers  = evaluateDFOSTriggers(computed, vars);

  return {
    dfos_index:     parseFloat(dfos_index.toFixed(3)),
    zone,
    triggers,
    participation: {
      participation_score:  parseFloat(participation_score.toFixed(3)),
      transparency_score:   parseFloat(transparency_score.toFixed(3)),
      info_score:           parseFloat(info_score.toFixed(3)),
      accountability_score: parseFloat(accountability_score.toFixed(3)),
    },
    efu: {
      hmi_per_capita:          parseFloat(hmi_per_capita.toFixed(3)),
      net_efu_annual:          parseFloat(net_efu_annual.toFixed(0)),
      R_future:                parseFloat(R_future.toFixed(3)),
      interstitium_gain_pct:   parseFloat(interstitium_gain_pct.toFixed(1)),
      corruption_reduction_pct: parseFloat(corruption_reduction_pct.toFixed(1)),
    },
    flr: {
      flr_exhaustion:  parseFloat(flr_exhaustion.toFixed(2)),
      flr_capture:     parseFloat(flr_capture.toFixed(2)),
      flr_info:        parseFloat(flr_info.toFixed(2)),
      flr_total_raw:   parseFloat(flr_total_raw.toFixed(2)),
      flr_mitigated:   parseFloat(flr_mitigated.toFixed(2)),
    },
    alloc: {
      alloc_capex_strat: vars.alloc_capex_strat,
      R_current:         parseFloat(R_current.toFixed(3)),
    },
    diagnostics: {
      missing_inputs: missing,
      confidence: parseFloat((1 - missing.length / Object.keys(defaults).length).toFixed(2)),
    },
    variables: { raw: vars },
  };
}
