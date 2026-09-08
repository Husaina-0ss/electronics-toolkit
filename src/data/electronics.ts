import { ColorName, ColorBandInfo, UnitCategory, UnitDefinition } from '../types';

export const COLOR_CODES: Record<ColorName, ColorBandInfo> = {
  black:  { name: 'Black',  digit: 0, multiplier: 1,          tolerance: null, hex: '#1e293b', textColor: '#ffffff' },
  brown:  { name: 'Brown',  digit: 1, multiplier: 10,         tolerance: 1,    hex: '#78350f', textColor: '#ffffff' },
  red:    { name: 'Red',    digit: 2, multiplier: 100,        tolerance: 2,    hex: '#dc2626', textColor: '#ffffff' },
  orange: { name: 'Orange', digit: 3, multiplier: 1000,       tolerance: 0.05, hex: '#ea580c', textColor: '#ffffff' },
  yellow: { name: 'Yellow', digit: 4, multiplier: 10000,      tolerance: 0.02, hex: '#eab308', textColor: '#0f172a' },
  green:  { name: 'Green',  digit: 5, multiplier: 100000,     tolerance: 0.5,  hex: '#16a34a', textColor: '#ffffff' },
  blue:   { name: 'Blue',   digit: 6, multiplier: 1000000,    tolerance: 0.25, hex: '#2563eb', textColor: '#ffffff' },
  violet: { name: 'Violet', digit: 7, multiplier: 10000000,   tolerance: 0.1,  hex: '#9333ea', textColor: '#ffffff' },
  gray:   { name: 'Gray',   digit: 8, multiplier: 100000000,  tolerance: 0.05, hex: '#64748b', textColor: '#ffffff' },
  white:  { name: 'White',  digit: 9, multiplier: 1000000000, tolerance: null, hex: '#f8fafc', textColor: '#0f172a' },
  gold:   { name: 'Gold',   digit: null, multiplier: 0.1,     tolerance: 5,    hex: '#d97706', textColor: '#ffffff' },
  silver: { name: 'Silver', digit: null, multiplier: 0.01,    tolerance: 10,   hex: '#94a3b8', textColor: '#0f172a' },
};

// Standard E12 Resistor Decade Multipliers (10% standard commercial series)
export const E12_VALUES = [1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2];

export function findNearestE12(exactValue: number): number {
  if (exactValue <= 0) return 0;
  const decade = Math.pow(10, Math.floor(Math.log10(exactValue)));
  const normalized = exactValue / decade;

  // Find nearest standard value greater than or equal to exactValue to prevent overdriving components
  let chosen = E12_VALUES.find((v) => v >= normalized - 0.001);
  if (!chosen) {
    return 10 * decade;
  }
  return Math.round(chosen * decade * 10) / 10;
}

export function formatEngineering(val: number | null | undefined, unit: string = 'Ω'): string {
  if (val === null || val === undefined || isNaN(val)) return '-';
  const abs = Math.abs(val);
  if (abs === 0) return `0 ${unit}`;
  if (abs >= 1e6) {
    return `${(val / 1e6).toLocaleString(undefined, { maximumFractionDigits: 3 })} M${unit}`;
  }
  if (abs >= 1e3) {
    return `${(val / 1e3).toLocaleString(undefined, { maximumFractionDigits: 3 })} k${unit}`;
  }
  if (abs < 1 && abs >= 1e-3) {
    return `${(val * 1e3).toLocaleString(undefined, { maximumFractionDigits: 3 })} m${unit}`;
  }
  if (abs < 1e-3 && abs >= 1e-6) {
    return `${(val * 1e6).toLocaleString(undefined, { maximumFractionDigits: 3 })} µ${unit}`;
  }
  return `${val.toLocaleString(undefined, { maximumFractionDigits: 3 })} ${unit}`;
}

export const LED_COLOR_PRESETS = [
  { name: 'Red', vf: 2.0, hex: '#ef4444', desc: 'Standard Red (1.8V - 2.2V)' },
  { name: 'Yellow', vf: 2.1, hex: '#eab308', desc: 'Amber / Yellow (2.0V - 2.2V)' },
  { name: 'Green', vf: 2.2, hex: '#22c55e', desc: 'Standard Green (2.0V - 2.4V)' },
  { name: 'Blue', vf: 3.2, hex: '#3b82f6', desc: 'Bright Blue (3.0V - 3.4V)' },
  { name: 'White', vf: 3.2, hex: '#cbd5e1', desc: 'Warm / Pure White (3.0V - 3.4V)' },
];

export const VOLTAGE_PRESETS = [
  { label: '3.3V (Logic)', value: 3.3 },
  { label: '5V (USB / TTL)', value: 5.0 },
  { label: '9V (Battery)', value: 9.0 },
  { label: '12V (Automotive)', value: 12.0 },
  { label: '24V (Industrial)', value: 24.0 },
];

export const CURRENT_PRESETS = [
  { label: '5 mA (Dim / Low Power)', value: 5 },
  { label: '10 mA (Standard)', value: 10 },
  { label: '15 mA (Bright)', value: 15 },
  { label: '20 mA (Max Continuous 5mm)', value: 20 },
];

export const UNIT_DEFINITIONS: Record<UnitCategory, UnitDefinition[]> = {
  resistance: [
    { id: 'mohm', label: 'Milliohms', symbol: 'mΩ', factor: 0.001, description: '10⁻³ Ω (Shunt & PCB traces)' },
    { id: 'ohm', label: 'Ohms', symbol: 'Ω', factor: 1, description: 'Base SI unit of electrical resistance' },
    { id: 'kohm', label: 'Kilohms', symbol: 'kΩ', factor: 1000, description: '10³ Ω (Standard pull-up / biasing)' },
    { id: 'mohm_large', label: 'Megohms', symbol: 'MΩ', factor: 1000000, description: '10⁶ Ω (High-impedance inputs)' },
  ],
  voltage: [
    { id: 'uv', label: 'Microvolts', symbol: 'µV', factor: 0.000001, description: '10⁻⁶ V (Sensors & audio signals)' },
    { id: 'mv', label: 'Millivolts', symbol: 'mV', factor: 0.001, description: '10⁻³ V (Thermocouples & small signals)' },
    { id: 'v', label: 'Volts', symbol: 'V', factor: 1, description: 'Base SI unit of electric potential' },
    { id: 'kv', label: 'Kilovolts', symbol: 'kV', factor: 1000, description: '10³ V (Power transmission & HV)' },
  ],
  current: [
    { id: 'ua', label: 'Microamps', symbol: 'µA', factor: 0.000001, description: '10⁻⁶ A (Sleep mode & sensor currents)' },
    { id: 'ma', label: 'Milliamps', symbol: 'mA', factor: 0.001, description: '10⁻³ A (LEDs & microcontrollers)' },
    { id: 'a', label: 'Amps', symbol: 'A', factor: 1, description: 'Base SI unit of electric current' },
  ],
  power: [
    { id: 'uw', label: 'Microwatts', symbol: 'µW', factor: 0.000001, description: '10⁻⁶ W (Wearables & ultra-low power)' },
    { id: 'mw', label: 'Milliwatts', symbol: 'mW', factor: 0.001, description: '10⁻³ W (Component dissipation)' },
    { id: 'w', label: 'Watts', symbol: 'W', factor: 1, description: 'Base SI unit of electrical power (J/s)' },
    { id: 'kw', label: 'Kilowatts', symbol: 'kW', factor: 1000, description: '10³ W (Appliances & motors)' },
  ],
};
