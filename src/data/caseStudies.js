/**
 * EFU Case Studies — Metabolic Return on Investment (MROI) Scenarios
 *
 * Data sources:
 *   - MROI WORKING PAPER v1.3 (Simor, 2026)
 *   - S1–S4 SUPPLEMENTARY MATERIALS (Simor, 2026)
 *   - EFU v5.1 Glossary
 *   - 118.2 The Human Flux Unit
 *
 * Core constant: 1 EFU = 20 kg/day human metabolic throughput
 * RACF (Hungary, 2024–25): 526 kg CO₂/person/year
 * grid_CO₂ (Hungary MAVIR 2024–25): 0.35 kg CO₂/kWh
 */

// MROI classification thresholds (MROI Working Paper §2.3)
export const MROI_THRESHOLDS = {
  SYMBIOTIC: 25,    // MROI > 25% → Priority investment
  STABLE: 10,       // MROI 10–25% → Approved with annual review
  LIMITED: 0,       // MROI 0–10% → Conditional
  PARASITIC: -Infinity, // MROI < 0% → Not recommended for public funding
};

export const MROI_LABELS = {
  SYMBIOTIC: 'Symbiotic',
  STABLE: 'Stable',
  LIMITED: 'Limited',
  PARASITIC: 'Parasitic',
};

// Infrastructure Debt Multiplier D = 0.3
// Calibrated from three sources (S2 §S2.3): lifecycle replacement data,
// supply chain entropy (Ecoinvent v3.9), ISO 14044 LCA comparison.
export const DEFAULT_D = 0.3;

// EFU carbon baseline: direct carbon equivalent of 20 kg/day biophysical flux
// (S4 §S4.1, EFU Fundamental Theorem)
export const EFU_CARBON_BASELINE = 183; // kg CO₂/capita/year

// RACF formula (S4 §S4.1):
// RACF = EFU_carbon_baseline + (per_capita_electricity × grid_CO₂ × 0.26)
// Hungary: 183 + (3837 kWh × 0.35 kg/kWh × 0.26) ≈ 526
export const RACF_DEFAULT = 526; // kg CO₂/person/year (Hungary)

/**
 * Case study definitions.
 * Each case study provides pre-filled parameters for the MROI calculator.
 *
 * Fields:
 *   id          — unique identifier
 *   label       — display name
 *   description — brief description
 *   source      — document reference
 *   params      — calculator input parameters
 *     delta_e_saved  — energy savings (kWh/year)
 *     grid_co2       — grid carbon intensity (kg CO₂/kWh)
 *     racf           — Reference Annual Carbon Flux (kg CO₂/person/year)
 *     jim30          — JIM-30 repairability score (0–100)
 *     d_multiplier   — infrastructure debt multiplier
 *     efu_input_direct — direct biophysical EFU input
 */
export const caseStudies = [
  {
    id: 'custom',
    label: '— Custom Input —',
    description: 'Enter your own parameters.',
    source: null,
    params: null,
  },
  {
    id: 'solar_street_lighting',
    label: 'Solar Street Lighting (Closed/Proprietary)',
    description:
      'Closed-system solar street lighting with proprietary control electronics and server dependency. ' +
      'Sealed monobloc units, manufacturer-only servicing, no offline diagnostics.',
    source: 'MROI Working Paper v1.3, §3.2 — Scenario A',
    params: {
      delta_e_saved: 10000,
      grid_co2: 0.35,
      racf: 526,
      jim30: 25,
      d_multiplier: 0.3,
      efu_input_direct: 6.65,
    },
  },
  {
    id: 'modular_wind_storage',
    label: 'Modular Wind-Storage (Open/Repairable)',
    description:
      'Open, modular wind-storage system with independent assemblies, standard metric tools, ' +
      'open-source firmware, and full offline diagnostics. High local repairability.',
    source: 'MROI Working Paper v1.3, §3.2 — Scenario B',
    params: {
      delta_e_saved: 45000,
      grid_co2: 0.35,
      racf: 526,
      jim30: 88,
      d_multiplier: 0.3,
      efu_input_direct: 29.94,
    },
  },
  {
    id: 'vertical_farm',
    label: 'Vertical Farm (Urban Agriculture)',
    description:
      'Closed-loop urban vertical farming system with high biophysical restitution, ' +
      'minimal water use, and local food sovereignty. Reference: EFU Glossary.',
    source: 'EFU v5.1 Glossary — MROI entry',
    params: {
      delta_e_saved: 120000,
      grid_co2: 0.35,
      racf: 526,
      jim30: 80,
      d_multiplier: 0.3,
      efu_input_direct: 14.5,
    },
  },
  {
    id: 'crypto_mining',
    label: 'Crypto Mining Operation',
    description:
      'Energy-intensive proof-of-work cryptocurrency mining. High energy cannibalization, ' +
      'no biophysical restitution, proprietary hardware. Reference: EFU Glossary.',
    source: 'EFU v5.1 Glossary — MROI entry; 104.12.5 Crypto Research Framework',
    params: {
      delta_e_saved: -5000,
      grid_co2: 0.35,
      racf: 526,
      jim30: 15,
      d_multiplier: 0.3,
      efu_input_direct: 45.0,
    },
  },
  {
    id: 'community_solar_cooperative',
    label: 'Community Solar Cooperative (Sovereign Cell)',
    description:
      'Village-scale community-owned solar cooperative with local maintenance capacity, ' +
      'open documentation, and democratic governance. EFU Sovereign Cell model.',
    source: 'EFU v5.1 §402 Sovereign Cell; 104.57 Village CAL v1.0',
    params: {
      delta_e_saved: 35000,
      grid_co2: 0.35,
      racf: 526,
      jim30: 75,
      d_multiplier: 0.3,
      efu_input_direct: 18.0,
    },
  },
  {
    id: 'hospital_hvac',
    label: 'Hospital HVAC Upgrade',
    description:
      'Hospital heating/ventilation/air-conditioning modernisation with partial proprietary ' +
      'components. Based on EFU Hospital Metabolism Audit methodology.',
    source: '104.13.3 EFU Hospital Metabolism Audit v1.0',
    params: {
      delta_e_saved: 80000,
      grid_co2: 0.35,
      racf: 526,
      jim30: 55,
      d_multiplier: 0.3,
      efu_input_direct: 22.0,
    },
  },
];

export default caseStudies;
