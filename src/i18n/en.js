export const en = {
  // Header
  title: 'EFU — MROI Calculator',
  subtitle: 'Metabolic Return on Investment · EFU Framework v5.1 · Based on MROI Working Paper v1.3 (Simor, 2026)',

  // Case study selector
  caseStudyLabel: '📋 Case Study Options',
  sourceLabel: 'Source:',

  // Input fields
  fields: {
    delta_e_saved: 'ΔE_saved (kWh/year)',
    delta_e_saved_hint: 'Energy savings vs. baseline counterfactual',
    grid_co2: 'grid_CO₂ (kg CO₂/kWh)',
    grid_co2_hint: 'Regional grid carbon intensity (HU default: 0.35)',
    racf: 'RACF (kg CO₂/person/year)',
    racf_hint: 'Reference Annual Carbon Flux (Hungary: 526)',
    jim30: 'JIM-30 score (%)',
    jim30_hint: 'Repairability index 0–100 (S1 Supplementary Materials)',
    d_multiplier: 'D — Debt Multiplier',
    d_multiplier_hint: 'Infrastructure debt multiplier (default: 0.3)',
    efu_input_direct: 'EFU_input direct (EFU units)',
    efu_input_direct_hint: 'Direct biophysical EFU input (before correction)',
  },

  // Results
  co2Reduction: 'CO₂ reduction',
  co2Unit: 'kg/year',
  racfUnits: 'RACF units',
  correctionX: 'Correction ×',
  efuInputCorrected: 'EFU_input corrected',
  mroisScale: 'MROI Position on Scale',

  // FLR
  flrTitle: '⚡ FLR — Frictional Loss Rate',
  flrLabel: 'FLR',
  threshold: 'Threshold',
  frictionOverhead: 'Friction overhead',
  efuUnits: 'EFU units',
  usefulInput: 'Useful input:',
  frictionLoss: 'Friction loss:',
  parasitismWarning: (flr, jim30, d) =>
    `⚠️ FLR > ${flr}% — Infrastructure debt friction exceeds the metabolic parasitism threshold. Low repairability (JIM-30 = ${jim30}) amplifies systemic entropy costs. Recommendation: increase JIM-30 score or reduce D multiplier (current: ${d}).`,

  // RACF Comparator
  racfComparatorTitle: '📊 RACF Comparator',
  racfBaseline: 'RACF Baseline',
  co2PersonYear: 'CO₂/person/yr',
  co2ReductionYear: 'CO₂ reduction/yr',
  racfNote: 'Comparing annual CO₂ reduction to the Reference Annual Carbon Flux (RACF) of 1 person.',
  racfOffsets: (n) => ` This system offsets ${n} RACF-equivalent persons/year.`,

  // Case Studies Table
  caseStudiesTableTitle: '📋 All Case Studies — MROI Comparison',
  colCaseStudy: 'Case Study',
  colMROI: 'MROI',
  colFLR: 'FLR',
  colStatus: 'Status',
  statusOK: '✔ OK',
  statusParasitic: '⚠️ Parasitic',

  // Classification table
  classificationTitle: 'MROI Classification Thresholds (MROI Working Paper v1.3, §2.3)',
  classRows: [
    { range: '> 25%', label: 'SYMBIOTIC', note: 'Priority investment', color: '#16a34a' },
    { range: '10–25%', label: 'STABLE', note: 'Approved with annual review', color: '#2563eb' },
    { range: '0–10%', label: 'LIMITED', note: 'Conditional, improvement plan required', color: '#d97706' },
    { range: '< 0%', label: 'PARASITIC', note: 'Not recommended for public funding', color: '#dc2626' },
  ],

  // Export
  exportJSON: '⬇ Export JSON',
  exportPrint: '🖨 Print',

  // Debt Clock
  debtClockTitle: '⏱ EFU Debt Clock',
  debtClockSubtitle: 'Real-time metabolic debt accumulation for this system',
  debtClockFrictionPerSec: 'Friction cost / sec',
  debtClockFrictionPerYear: 'Annual friction overhead',
  debtClockSinceOpen: 'Debt since page load',
  debtClockNote: 'Based on FLR friction overhead relative to direct EFU input.',

  // Parasitism labels
  parasitismDetected: 'Metabolic Parasitism Detected',
  withinBounds: 'Within Acceptable Bounds',

  // Footer
  footer:
    'EFU Framework v5.1 · 1 EFU = 20 kg/day human metabolic throughput · D = 0.3 (S2 calibration) · RACF Hungary = 526 kg CO₂/capita/year · grid_CO₂ = 0.35 kg/kWh (MAVIR 2024–25) · Author: István Simor · ORCID: 0009-0002-6599-3480',
};
