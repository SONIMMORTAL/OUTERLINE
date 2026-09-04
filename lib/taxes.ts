/**
 * OUTERLINE NYC — Sales Tax Calculation Engine
 * 
 * New York City Combined Sales Tax: 8.875%
 * (4.0% New York State + 4.5% NYC City Tax + 0.375% MCTD)
 * 
 * Nexus Rules:
 * - Physical Nexus: Outerline is founded & operates in New York City.
 * - Out-of-State Nexus: Under South Dakota v. Wayfair, remote states only require collection
 *   if an economic threshold is passed (typically $100,000 in sales or 200 transactions annually).
 */

export interface TaxInfo {
  state: string
  rate: number
  ratePercentage: string
  taxAmount: number
  label: string
}

export type TaxCalculationMode = 'ALL_STATES' | 'NYC_ONLY'

// Set default tax mode: 'ALL_STATES' calculates tax based on customer state;
// 'NYC_ONLY' only collects tax for NY shipments (0% for out-of-state non-nexus).
export const CURRENT_TAX_MODE: TaxCalculationMode = 'ALL_STATES'

export const US_STATE_TAX_RATES: Record<string, { name: string; rate: number }> = {
  AL: { name: 'Alabama', rate: 0.040 },
  AK: { name: 'Alaska', rate: 0.000 },
  AZ: { name: 'Arizona', rate: 0.056 },
  AR: { name: 'Arkansas', rate: 0.065 },
  CA: { name: 'California', rate: 0.0725 },
  CO: { name: 'Colorado', rate: 0.029 },
  CT: { name: 'Connecticut', rate: 0.0635 },
  DE: { name: 'Delaware', rate: 0.000 },
  FL: { name: 'Florida', rate: 0.060 },
  GA: { name: 'Georgia', rate: 0.040 },
  HI: { name: 'Hawaii', rate: 0.040 },
  ID: { name: 'Idaho', rate: 0.060 },
  IL: { name: 'Illinois', rate: 0.0625 },
  IN: { name: 'Indiana', rate: 0.070 },
  IA: { name: 'Iowa', rate: 0.060 },
  KS: { name: 'Kansas', rate: 0.065 },
  KY: { name: 'Kentucky', rate: 0.060 },
  LA: { name: 'Louisiana', rate: 0.0445 },
  ME: { name: 'Maine', rate: 0.055 },
  MD: { name: 'Maryland', rate: 0.060 },
  MA: { name: 'Massachusetts', rate: 0.0625 },
  MI: { name: 'Michigan', rate: 0.060 },
  MN: { name: 'Minnesota', rate: 0.06875 },
  MS: { name: 'Mississippi', rate: 0.070 },
  MO: { name: 'Missouri', rate: 0.04225 },
  MT: { name: 'Montana', rate: 0.000 },
  NE: { name: 'Nebraska', rate: 0.055 },
  NV: { name: 'Nevada', rate: 0.0685 },
  NH: { name: 'New Hampshire', rate: 0.000 },
  NJ: { name: 'New Jersey', rate: 0.06625 },
  NM: { name: 'New Mexico', rate: 0.050 },
  NY: { name: 'New York (NYC)', rate: 0.08875 },
  NC: { name: 'North Carolina', rate: 0.0475 },
  ND: { name: 'North Dakota', rate: 0.050 },
  OH: { name: 'Ohio', rate: 0.0575 },
  OK: { name: 'Oklahoma', rate: 0.045 },
  OR: { name: 'Oregon', rate: 0.000 },
  PA: { name: 'Pennsylvania', rate: 0.060 },
  RI: { name: 'Rhode Island', rate: 0.070 },
  SC: { name: 'South Carolina', rate: 0.060 },
  SD: { name: 'South Dakota', rate: 0.045 },
  TN: { name: 'Tennessee', rate: 0.070 },
  TX: { name: 'Texas', rate: 0.0625 },
  UT: { name: 'Utah', rate: 0.0610 },
  VT: { name: 'Vermont', rate: 0.060 },
  VA: { name: 'Virginia', rate: 0.053 },
  WA: { name: 'Washington', rate: 0.065 },
  WV: { name: 'West Virginia', rate: 0.060 },
  WI: { name: 'Wisconsin', rate: 0.050 },
  WY: { name: 'Wyoming', rate: 0.040 },
  DC: { name: 'Washington D.C.', rate: 0.060 }
}

/**
 * Calculates accurate sales tax given a subtotal and US state code.
 */
export function calculateTax(
  subtotal: number, 
  stateCode: string = 'NY',
  mode: TaxCalculationMode = CURRENT_TAX_MODE
): TaxInfo {
  const cleanCode = (stateCode || 'NY').trim().toUpperCase()
  const isNY = cleanCode === 'NY'

  // If in NYC_ONLY mode and not NY, 0% tax is collected
  if (mode === 'NYC_ONLY' && !isNY) {
    return {
      state: cleanCode,
      rate: 0,
      ratePercentage: '0.00%',
      taxAmount: 0,
      label: 'Out-of-State (No Tax)'
    }
  }

  const stateData = US_STATE_TAX_RATES[cleanCode] || US_STATE_TAX_RATES['NY']
  const rate = stateData.rate
  const taxAmount = Math.round(subtotal * rate * 100) / 100
  const ratePercentage = `${(rate * 100).toFixed(rate === 0.08875 ? 3 : 2)}%`
  
  let label: string
  if (isNY) {
    label = `NYC / NY Tax (${ratePercentage})`
  } else if (rate === 0) {
    label = `${cleanCode} (Tax-Free)`
  } else {
    label = `${cleanCode} State Tax (${ratePercentage})`
  }

  return {
    state: cleanCode,
    rate,
    ratePercentage,
    taxAmount,
    label
  }
}
