import { useState, useMemo } from 'react';
import { RotateCcw, HelpCircle, AlertCircle, Zap } from 'lucide-react';
import { OhmsLawResult } from '../types';
import { formatEngineering, VOLTAGE_PRESETS, CURRENT_PRESETS } from '../data/electronics';

export function OhmsLawCalculator() {
  const [voltageInput, setVoltageInput] = useState<string>('5');
  const [voltageUnit, setVoltageUnit] = useState<number>(1); // 1 = V, 0.001 = mV, 1000 = kV

  const [currentInput, setCurrentInput] = useState<string>('20');
  const [currentUnit, setCurrentUnit] = useState<number>(0.001); // 0.001 = mA, 1 = A, 0.000001 = uA

  const [resistanceInput, setResistanceInput] = useState<string>('');
  const [resistanceUnit, setResistanceUnit] = useState<number>(1); // 1 = Ohm, 1000 = kOhm, 1000000 = MOhm

  const [error, setError] = useState<string | null>(null);

  // Compute values
  const result: OhmsLawResult | null = useMemo(() => {
    const rawV = voltageInput.trim();
    const rawI = currentInput.trim();
    const rawR = resistanceInput.trim();

    const hasV = rawV !== '' && !isNaN(Number(rawV));
    const hasI = rawI !== '' && !isNaN(Number(rawI));
    const hasR = rawR !== '' && !isNaN(Number(rawR));

    const count = [hasV, hasI, hasR].filter(Boolean).length;

    if (count < 2) {
      setError('Please enter any 2 values to calculate the missing 3rd value.');
      return null;
    }

    const V_val = hasV ? parseFloat(rawV) * voltageUnit : null;
    const I_val = hasI ? parseFloat(rawI) * currentUnit : null;
    const R_val = hasR ? parseFloat(rawR) * resistanceUnit : null;

    if (hasR && R_val !== null && R_val <= 0) {
      setError('Resistance must be strictly positive (> 0 Ω).');
      return null;
    }

    setError(null);

    let solvedV: number;
    let solvedI: number;
    let solvedR: number;
    let variable: 'V' | 'I' | 'R';
    let formulaStr: string;
    let steps: string[] = [];

    if (!hasV && hasI && hasR && I_val !== null && R_val !== null) {
      variable = 'V';
      solvedV = I_val * R_val;
      solvedI = I_val;
      solvedR = R_val;
      formulaStr = 'V = I × R';
      steps = [
        `Unknown variable: Voltage (V)`,
        `Standard Ohm's Law formula: V = I × R`,
        `Substitute known values: V = ${I_val} A × ${R_val} Ω = ${solvedV} V`,
        `Result: ${formatEngineering(solvedV, 'V')}`,
      ];
    } else if (!hasI && hasV && hasR && V_val !== null && R_val !== null) {
      variable = 'I';
      solvedV = V_val;
      solvedI = V_val / R_val;
      solvedR = R_val;
      formulaStr = 'I = V / R';
      steps = [
        `Unknown variable: Current (I)`,
        `Rearranged formula: I = V / R`,
        `Substitute known values: I = ${V_val} V / ${R_val} Ω = ${solvedI} A`,
        `Result: ${formatEngineering(solvedI, 'A')}`,
      ];
    } else if (!hasR && hasV && hasI && V_val !== null && I_val !== null) {
      if (I_val === 0) {
        setError('Current cannot be zero when solving for resistance (division by zero).');
        return null;
      }
      variable = 'R';
      solvedV = V_val;
      solvedI = I_val;
      solvedR = V_val / I_val;
      formulaStr = 'R = V / I';
      steps = [
        `Unknown variable: Resistance (R)`,
        `Rearranged formula: R = V / I`,
        `Substitute known values: R = ${V_val} V / ${I_val} A = ${solvedR} Ω`,
        `Result: ${formatEngineering(solvedR, 'Ω')}`,
      ];
    } else {
      // All 3 entered -> solve V from I & R
      variable = 'V';
      solvedV = (I_val ?? 0) * (R_val ?? 0);
      solvedI = I_val ?? 0;
      solvedR = R_val ?? 0;
      formulaStr = 'V = I × R';
      steps = [
        `All 3 parameters provided. Re-calculating Voltage from Current & Resistance:`,
        `V = ${I_val} A × ${R_val} Ω = ${solvedV} V (${formatEngineering(solvedV, 'V')})`,
      ];
    }

    const power = solvedV * solvedI;
    steps.push(
      `Associated Electrical Power Dissipation: P = V × I = ${solvedV.toFixed(2)} V × ${solvedI.toFixed(4)} A = ${formatEngineering(power, 'W')}`
    );

    return {
      voltage: solvedV,
      current: solvedI,
      resistance: solvedR,
      power,
      calculatedVariable: variable,
      formula: formulaStr,
      steps,
    };
  }, [voltageInput, voltageUnit, currentInput, currentUnit, resistanceInput, resistanceUnit]);

  const handleClear = () => {
    setVoltageInput('');
    setCurrentInput('');
    setResistanceInput('');
    setError(null);
  };

  const handleApplyPresetVoltage = (v: number) => {
    setVoltageInput(v.toString());
    setVoltageUnit(1);
  };

  const handleApplyPresetCurrent = (ma: number) => {
    setCurrentInput(ma.toString());
    setCurrentUnit(0.001);
  };

  const handleApplyPresetResistance = (ohms: number, unitMult: number) => {
    setResistanceInput(ohms.toString());
    setResistanceUnit(unitMult);
  };

  return (
    <section id="ohms" className="scroll-mt-20 mb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-50/70 dark:bg-slate-900/80">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Ohm&apos;s Law Calculator
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Enter any 2 values among Voltage, Current, and Resistance to solve for the missing parameter.
              </p>
            </div>

            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Inputs</span>
            </button>
          </div>

          <div className="p-5 sm:p-7">
            {error && (
              <div className="mb-6 p-3.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-2.5 text-xs sm:text-sm text-amber-800 dark:text-amber-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Form Inputs */}
              <div className="lg:col-span-7 space-y-5">
                {/* Voltage Input */}
                <div className="bg-slate-50/80 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="ohms-v" className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Voltage (V)
                    </label>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Electric Potential</span>
                  </div>
                  <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-blue-500">
                    <input
                      id="ohms-v"
                      type="number"
                      step="any"
                      placeholder="e.g. 5"
                      value={voltageInput}
                      onChange={(e) => setVoltageInput(e.target.value)}
                      className="flex-1 px-3.5 py-2 text-sm font-mono text-slate-900 dark:text-white bg-transparent outline-none"
                    />
                    <select
                      value={voltageUnit}
                      onChange={(e) => setVoltageUnit(parseFloat(e.target.value))}
                      className="px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 outline-none cursor-pointer"
                    >
                      <option value={0.001}>mV</option>
                      <option value={1}>V</option>
                      <option value={1000}>kV</option>
                    </select>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {VOLTAGE_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => handleApplyPresetVoltage(p.value)}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 transition-colors"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Current Input */}
                <div className="bg-slate-50/80 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="ohms-i" className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Current (I)
                    </label>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Rate of Charge Flow</span>
                  </div>
                  <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-blue-500">
                    <input
                      id="ohms-i"
                      type="number"
                      step="any"
                      placeholder="e.g. 20"
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      className="flex-1 px-3.5 py-2 text-sm font-mono text-slate-900 dark:text-white bg-transparent outline-none"
                    />
                    <select
                      value={currentUnit}
                      onChange={(e) => setCurrentUnit(parseFloat(e.target.value))}
                      className="px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 outline-none cursor-pointer"
                    >
                      <option value={0.000001}>µA</option>
                      <option value={0.001}>mA</option>
                      <option value={1}>A</option>
                    </select>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {CURRENT_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => handleApplyPresetCurrent(p.value)}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 transition-colors"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Resistance Input */}
                <div className="bg-slate-50/80 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="ohms-r" className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Resistance (R)
                    </label>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Opposition to Current</span>
                  </div>
                  <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-blue-500">
                    <input
                      id="ohms-r"
                      type="number"
                      step="any"
                      placeholder="e.g. 250"
                      value={resistanceInput}
                      onChange={(e) => setResistanceInput(e.target.value)}
                      className="flex-1 px-3.5 py-2 text-sm font-mono text-slate-900 dark:text-white bg-transparent outline-none"
                    />
                    <select
                      value={resistanceUnit}
                      onChange={(e) => setResistanceUnit(parseFloat(e.target.value))}
                      className="px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 outline-none cursor-pointer"
                    >
                      <option value={1}>Ω</option>
                      <option value={1000}>kΩ</option>
                      <option value={1000000}>MΩ</option>
                    </select>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    <button
                      type="button"
                      onClick={() => handleApplyPresetResistance(220, 1)}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:border-blue-300 transition-colors"
                    >
                      220 Ω
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPresetResistance(330, 1)}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:border-blue-300 transition-colors"
                    >
                      330 Ω
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPresetResistance(1, 1000)}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:border-blue-300 transition-colors"
                    >
                      1 kΩ
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPresetResistance(10, 1000)}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:border-blue-300 transition-colors"
                    >
                      10 kΩ
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Dynamic Results & Interactive Triangle */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
                {/* Result Display Box */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-5 border border-slate-800 shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                      Calculated Parameter
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-900/60 text-amber-300 border border-amber-700/50">
                      {result ? result.formula : 'V = I × R'}
                    </span>
                  </div>

                  <div className="font-mono text-3xl sm:text-4xl font-extrabold text-amber-400 my-2 tracking-tight">
                    {result
                      ? result.calculatedVariable === 'V'
                        ? formatEngineering(result.voltage, 'V')
                        : result.calculatedVariable === 'I'
                        ? formatEngineering(result.current, 'A')
                        : formatEngineering(result.resistance, 'Ω')
                      : '-'}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 mt-3 border-t border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-400 block mb-0.5">Voltage (V):</span>
                      <span className="font-mono font-bold text-slate-100">
                        {result ? formatEngineering(result.voltage, 'V') : '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Current (I):</span>
                      <span className="font-mono font-bold text-slate-100">
                        {result ? formatEngineering(result.current, 'A') : '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Resistance (R):</span>
                      <span className="font-mono font-bold text-slate-100">
                        {result ? formatEngineering(result.resistance, 'Ω') : '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Electrical Power (P):</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {result ? formatEngineering(result.power, 'W') : '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Interactive Ohm's Law Triangle Graphic */}
                <div className="bg-slate-50/80 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Ohm&apos;s Law Formula Triangle
                  </span>
                  <div className="w-44 h-36">
                    <svg viewBox="0 0 200 180" className="w-full h-full">
                      {/* Triangle Outer Frame */}
                      <polygon points="100,10 10,170 190,170" fill="none" stroke="#64748b" strokeWidth="2.5" />
                      {/* Horizontal divider */}
                      <line x1="55" y1="90" x2="145" y2="90" stroke="#64748b" strokeWidth="2.5" />
                      {/* Vertical divider */}
                      <line x1="100" y1="90" x2="100" y2="170" stroke="#64748b" strokeWidth="2.5" />

                      {/* Sector V */}
                      <polygon
                        points="100,10 55,90 145,90"
                        fill={result?.calculatedVariable === 'V' ? '#fef3c7' : '#ffffff'}
                        stroke={result?.calculatedVariable === 'V' ? '#d97706' : '#cbd5e1'}
                        strokeWidth={result?.calculatedVariable === 'V' ? '2.5' : '1'}
                      />
                      {/* Sector I */}
                      <polygon
                        points="55,90 10,170 100,170 100,90"
                        fill={result?.calculatedVariable === 'I' ? '#fef3c7' : '#ffffff'}
                        stroke={result?.calculatedVariable === 'I' ? '#d97706' : '#cbd5e1'}
                        strokeWidth={result?.calculatedVariable === 'I' ? '2.5' : '1'}
                      />
                      {/* Sector R */}
                      <polygon
                        points="145,90 100,90 100,170 190,170"
                        fill={result?.calculatedVariable === 'R' ? '#fef3c7' : '#ffffff'}
                        stroke={result?.calculatedVariable === 'R' ? '#d97706' : '#cbd5e1'}
                        strokeWidth={result?.calculatedVariable === 'R' ? '2.5' : '1'}
                      />

                      <text x="100" y="65" textAnchor="middle" className="font-mono font-bold text-2xl fill-slate-900">
                        V
                      </text>
                      <text x="58" y="142" textAnchor="middle" className="font-mono font-bold text-2xl fill-slate-900">
                        I
                      </text>
                      <text x="142" y="142" textAnchor="middle" className="font-mono font-bold text-2xl fill-slate-900">
                        R
                      </text>
                    </svg>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                    Cover the unknown value to see the formula: <strong>V = I × R</strong>, <strong>I = V / R</strong>, <strong>R = V / I</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Formula & Step-by-Step Derivation */}
            {result && (
              <div className="mt-8 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-3 text-slate-900 dark:text-white font-bold text-sm">
                  <HelpCircle className="w-4 h-4 text-amber-500" />
                  <span>Mathematical Derivation:</span>
                </div>
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  {result.steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Zap className="w-3.5 h-3.5 text-amber-500 mt-1 shrink-0" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
