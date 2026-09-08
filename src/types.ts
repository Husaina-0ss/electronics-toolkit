export type ThemeMode = 'light' | 'dark';

export type ResistorBandCount = 4 | 5;

export interface ColorBandInfo {
  name: string;
  digit: number | null;
  multiplier: number | null;
  tolerance: number | null;
  hex: string;
  textColor: string;
}

export type ColorName =
  | 'black'
  | 'brown'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'violet'
  | 'gray'
  | 'white'
  | 'gold'
  | 'silver';

export interface ResistorState {
  bands: ResistorBandCount;
  band1: ColorName;
  band2: ColorName;
  band3: ColorName;
  multiplier: ColorName;
  tolerance: ColorName;
}

export interface ResistorCalculationResult {
  significantDigits: number;
  resistanceValue: number;
  formattedValue: string;
  exactOhms: string;
  tolerancePercent: number;
  minResistance: number;
  maxResistance: number;
  formattedRange: string;
  breakdown: string[];
}

export interface OhmsLawResult {
  voltage: number;
  current: number;
  resistance: number;
  power: number;
  calculatedVariable: 'V' | 'I' | 'R' | null;
  formula: string;
  steps: string[];
}

export interface LedCalculatorResult {
  supplyVoltage: number;
  forwardVoltage: number;
  targetCurrent_mA: number;
  voltageAcrossResistor: number;
  exactResistance: number;
  standardResistance: number;
  actualCurrent_mA: number;
  powerDissipation_mW: number;
  powerDissipation_W: number;
  recommendedWattage: string;
  steps: string[];
}

export type UnitCategory = 'resistance' | 'voltage' | 'current' | 'power';

export interface UnitDefinition {
  id: string;
  label: string;
  symbol: string;
  factor: number; // Multiplier to base unit
  description: string;
}
