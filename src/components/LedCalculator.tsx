import { useState, useMemo } from 'react';
import { RotateCcw, AlertTriangle, ShieldCheck, CheckCircle2, HelpCircle } from 'lucide-react';
import { LedCalculatorResult } from '../types';
import { LED_COLOR_PRESETS, VOLTAGE_PRESETS, CURRENT_PRESETS, findNearestE12, formatEngineering } from '../data/electronics';

export function LedCalculator() {
  const [supplyVoltageInput, setSupplyVoltageInput] = useState<string>('5');
  const [forwardVoltageInput, setForwardVoltageInput] = useState<string>('2.0');
  const [targetCurrentInput, setTargetCurrentInput] = useState<string>('20');
  const [selectedLedName, setSelectedLedName] = useState<string>('Red');

  const [error, setError] = useState<string | null>(null);

  const result: LedCalculatorResult | null = useMemo(() => {
    const rawVs = supplyVoltageInput.trim();
    const rawVf = forwardVoltageInput.trim();
    const rawIf = targetCurrentInput.trim();

    if (rawVs === '' || rawVf === '' || rawIf === '') {
      setError(null);
      return null;
    }

    const Vs = parseFloat(rawVs);
    const Vf = parseFloat(rawVf);
    const If_mA = parseFloat(rawIf);

    if (isNaN(Vs) || isNaN(Vf) || isNaN(If_mA)) {
      setError('Please enter valid numeric values for all parameters.');
      return null;
    }

    if (Vs <= Vf) {
      setError(
        `Supply Voltage (${Vs}V) must be strictly greater than LED Forward Voltage (${Vf}V) for the diode to conduct.`
      );
      return null;
    }

    if (If_mA <= 0) {
      setError('Target LED current must be strictly greater than 0 mA.');
      return null;
    }

    setError(null);

    const Vr = Vs - Vf;
    const If_A = If_mA / 1000;
    const exactR = Vr / If_A;
    const standardR = findNearestE12(exactR);

    // Actual current resulting from the standard commercial resistor
    const actualIf_A = Vr / standardR;
    const actualIf_mA = actualIf_A * 1000;

    // Resistor power dissipation P = V_R * I
    const powerW = Vr * actualIf_A;
    const powerMW = powerW * 1000;

    let wattageText = '';
    if (powerW <= 0.06) {
      wattageText = '1/8 W (125 mW) or higher';
    } else if (powerW <= 0.125) {
      wattageText = '1/4 W (250 mW) Standard';
    } else if (powerW <= 0.25) {
      wattageText = '1/2 W (500 mW)';
    } else if (powerW <= 0.5) {
      wattageText = '1 W Power Resistor';
    } else {
      wattageText = '2 W+ High-Power Resistor';
    }

    const steps = [
      `Voltage drop across resistor: V_R = V_S - V_F = ${Vs}V - ${Vf}V = ${Vr.toFixed(2)} V`,
      `Exact theoretical resistor: R_exact = V_R / I_F = ${Vr.toFixed(2)}V / ${(If_A).toFixed(4)}A = ${exactR.toFixed(1)} Ω`,
      `Nearest standard E12 commercial value: ${formatEngineering(standardR, 'Ω')} (rounded UP to safeguard against excess current)`,
      `Actual operating current: I_actual = V_R / R_standard = ${Vr.toFixed(2)}V / ${standardR}Ω = ${actualIf_mA.toFixed(2)} mA`,
      `Resistor power dissipation: P = V_R × I_actual = ${Vr.toFixed(2)}V × ${(actualIf_A).toFixed(4)}A = ${powerMW.toFixed(1)} mW (${powerW.toFixed(3)} W)`,
      `Recommended minimum resistor wattage: ${wattageText} (ensures safe 2× operating thermal headroom).`,
    ];

    return {
      supplyVoltage: Vs,
      forwardVoltage: Vf,
      targetCurrent_mA: If_mA,
      voltageAcrossResistor: Vr,
      exactResistance: exactR,
      standardResistance: standardR,
      actualCurrent_mA: actualIf_mA,
      powerDissipation_mW: powerMW,
      powerDissipation_W: powerW,
      recommendedWattage: wattageText,
      steps,
    };
  }, [supplyVoltageInput, forwardVoltageInput, targetCurrentInput]);

  const handleReset = () => {
    setSupplyVoltageInput('5');
    setForwardVoltageInput('2.0');
    setTargetCurrentInput('20');
    setSelectedLedName('Red');
    setError(null);
  };

  const handleSelectLedPreset = (preset: typeof LED_COLOR_PRESETS[0]) => {
    setForwardVoltageInput(preset.vf.toString());
    setSelectedLedName(preset.name);
  };

  return (
    <section id="led" className="scroll-mt-20 mb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-50/70 dark:bg-slate-900/80">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  LED Series Resistor Calculator
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Calculate the current-limiting resistor, standard E12 values, and power wattage for light emitting diodes.
              </p>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          <div className="p-5 sm:p-7">
            {error && (
              <div className="mb-6 p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2.5 text-xs sm:text-sm text-red-800 dark:text-red-200">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Inputs Column */}
              <div className="lg:col-span-6 space-y-5">
                {/* Supply Voltage */}
                <div className="bg-slate-50/80 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="led-vs" className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Supply Voltage (V<sub>S</sub>)
                    </label>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Power Source</span>
                  </div>
                  <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-blue-500">
                    <input
                      id="led-vs"
                      type="number"
                      step="any"
                      placeholder="e.g. 5"
                      value={supplyVoltageInput}
                      onChange={(e) => setSupplyVoltageInput(e.target.value)}
                      className="flex-1 px-3.5 py-2 text-sm font-mono text-slate-900 dark:text-white bg-transparent outline-none"
                    />
                    <span className="px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700">
                      Volts (V)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {VOLTAGE_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setSupplyVoltageInput(p.value.toString())}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 transition-colors"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* LED Forward Voltage (Vf) */}
                <div className="bg-slate-50/80 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="led-vf" className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      LED Forward Voltage (V<sub>F</sub>)
                    </label>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Diode Barrier Drop</span>
                  </div>
                  <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-blue-500">
                    <input
                      id="led-vf"
                      type="number"
                      step="any"
                      placeholder="e.g. 2.0"
                      value={forwardVoltageInput}
                      onChange={(e) => {
                        setForwardVoltageInput(e.target.value);
                        setSelectedLedName('Custom');
                      }}
                      className="flex-1 px-3.5 py-2 text-sm font-mono text-slate-900 dark:text-white bg-transparent outline-none"
                    />
                    <span className="px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700">
                      Volts (V)
                    </span>
                  </div>

                  {/* LED Color Presets */}
                  <div className="mt-2.5">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1.5">
                      Standard LED Color Presets:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {LED_COLOR_PRESETS.map((p) => (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => handleSelectLedPreset(p)}
                          className={`flex items-center gap-2 px-2 py-1 rounded-lg text-xs font-medium border transition-all ${
                            selectedLedName === p.name
                              ? 'bg-blue-50 dark:bg-blue-950 border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-300 font-semibold'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.hex }} />
                          <span>{p.name} ({p.vf}V)</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Desired Current (If) */}
                <div className="bg-slate-50/80 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="led-if" className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Desired LED Current (I<sub>F</sub>)
                    </label>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Target Luminance</span>
                  </div>
                  <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-blue-500">
                    <input
                      id="led-if"
                      type="number"
                      step="any"
                      placeholder="e.g. 20"
                      value={targetCurrentInput}
                      onChange={(e) => setTargetCurrentInput(e.target.value)}
                      className="flex-1 px-3.5 py-2 text-sm font-mono text-slate-900 dark:text-white bg-transparent outline-none"
                    />
                    <span className="px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700">
                      Milliamps (mA)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {CURRENT_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setTargetCurrentInput(p.value.toString())}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 transition-colors"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Safety Design Note */}
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Why LEDs Require Series Resistors</span>
                  </div>
                  <p className="leading-relaxed">
                    Unlike incandescent bulbs, LEDs exhibit exponential current increases once their forward threshold is exceeded. Without a current-limiting resistor, thermal runaway occurs, causing immediate burnout.
                  </p>
                </div>
              </div>

              {/* Results & Schematic Column */}
              <div className="lg:col-span-6 flex flex-col justify-between space-y-5">
                {/* Result Card */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-5 border border-slate-800 shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                      Recommended Resistor (E12 Standard)
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                      Safe Commercial Snapping
                    </span>
                  </div>

                  <div className="font-mono text-3xl sm:text-5xl font-extrabold text-emerald-400 my-2 tracking-tight">
                    {result ? formatEngineering(result.standardResistance, 'Ω') : '-'}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 mt-3 border-t border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-400 block mb-0.5">Exact Calculated R:</span>
                      <span className="font-mono font-bold text-slate-100">
                        {result ? `${result.exactResistance.toFixed(1)} Ω` : '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Actual LED Current:</span>
                      <span className="font-mono font-bold text-slate-100">
                        {result ? `${result.actualCurrent_mA.toFixed(1)} mA` : '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Resistor Power Dissipation:</span>
                      <span className="font-mono font-bold text-amber-400">
                        {result ? `${result.powerDissipation_mW.toFixed(1)} mW` : '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Recommended Power Rating:</span>
                      <span className="font-mono font-bold text-slate-100">
                        {result ? result.recommendedWattage : '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Circuit Schematic Diagram (SVG) */}
                <div className="bg-slate-50/80 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 flex flex-col items-center justify-center">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Circuit Schematic
                  </span>
                  <div className="w-full max-w-sm">
                    <svg viewBox="0 0 320 120" className="w-full h-auto">
                      {/* V+ Node */}
                      <circle cx="25" cy="40" r="4" fill="#2563eb" />
                      <text x="25" y="25" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#2563eb">
                        +{result ? result.supplyVoltage : 5}V
                      </text>

                      {/* Wire to Resistor */}
                      <line x1="29" y1="40" x2="65" y2="40" stroke="#64748b" strokeWidth="2.5" />

                      {/* Resistor Zig-Zag */}
                      <polyline
                        points="65,40 73,26 85,54 97,26 109,54 121,26 129,40 145,40"
                        fill="none"
                        stroke="#d97706"
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                      />
                      <text x="100" y="20" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#d97706">
                        {result ? formatEngineering(result.standardResistance, 'Ω') : 'R'}
                      </text>

                      {/* Wire to LED */}
                      <line x1="145" y1="40" x2="185" y2="40" stroke="#64748b" strokeWidth="2.5" />

                      {/* LED Anode Triangle */}
                      <polygon points="185,26 185,54 209,40" fill="#22c55e" stroke="#16a34a" strokeWidth="1.5" />
                      {/* LED Cathode Bar */}
                      <line x1="209" y1="26" x2="209" y2="54" stroke="#64748b" strokeWidth="2.5" />

                      {/* LED Light Rays */}
                      <line x1="195" y1="20" x2="205" y2="10" stroke="#16a34a" strokeWidth="1.5" />
                      <line x1="203" y1="23" x2="213" y2="13" stroke="#16a34a" strokeWidth="1.5" />

                      <text x="197" y="70" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#16a34a">
                        LED ({result ? `${result.forwardVoltage}V` : 'Vf'})
                      </text>

                      {/* Wire to Ground */}
                      <line x1="209" y1="40" x2="270" y2="40" stroke="#64748b" strokeWidth="2.5" />
                      <line x1="270" y1="40" x2="270" y2="75" stroke="#64748b" strokeWidth="2.5" />

                      {/* GND Symbol */}
                      <line x1="255" y1="75" x2="285" y2="75" stroke="#64748b" strokeWidth="2.5" />
                      <line x1="260" y1="81" x2="280" y2="81" stroke="#64748b" strokeWidth="2.5" />
                      <line x1="266" y1="87" x2="274" y2="87" stroke="#64748b" strokeWidth="2.5" />
                      <text x="270" y="105" fontSize="10" textAnchor="middle" fill="#64748b">
                        GND (0V)
                      </text>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Step-by-Step Derivation */}
            {result && (
              <div className="mt-8 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-3 text-slate-900 dark:text-white font-bold text-sm">
                  <HelpCircle className="w-4 h-4 text-emerald-500" />
                  <span>Calculation Steps &amp; Circuit Math:</span>
                </div>
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  {result.steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-1 shrink-0" />
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
