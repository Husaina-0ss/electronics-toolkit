import { useState, useMemo } from 'react';
import { RotateCcw, HelpCircle, Check, Info } from 'lucide-react';
import { ColorName, ResistorBandCount, ResistorState, ResistorCalculationResult } from '../types';
import { COLOR_CODES, formatEngineering } from '../data/electronics';

const DEFAULT_4_BAND: ResistorState = {
  bands: 4,
  band1: 'brown',
  band2: 'black',
  band3: 'black',
  multiplier: 'red',
  tolerance: 'gold',
};

const DEFAULT_5_BAND: ResistorState = {
  bands: 5,
  band1: 'brown',
  band2: 'black',
  band3: 'black',
  multiplier: 'orange',
  tolerance: 'brown',
};

export function ResistorCalculator() {
  const [state, setState] = useState<ResistorState>(DEFAULT_4_BAND);

  // Switch between 4-band and 5-band
  const handleBandModeChange = (bands: ResistorBandCount) => {
    if (bands === 4) {
      setState((prev) => ({
        ...prev,
        bands: 4,
      }));
    } else {
      setState((prev) => ({
        ...prev,
        bands: 5,
      }));
    }
  };

  // Reset to defaults
  const handleReset = () => {
    setState(state.bands === 4 ? { ...DEFAULT_4_BAND } : { ...DEFAULT_5_BAND });
  };

  // Compute calculated values
  const result: ResistorCalculationResult = useMemo(() => {
    const b1 = COLOR_CODES[state.band1];
    const b2 = COLOR_CODES[state.band2];
    const b3 = COLOR_CODES[state.band3];
    const mult = COLOR_CODES[state.multiplier];
    const tol = COLOR_CODES[state.tolerance];

    let digits = 0;
    let breakdownSteps: string[] = [];

    if (state.bands === 4) {
      const d1 = b1.digit ?? 1;
      const d2 = b2.digit ?? 0;
      digits = d1 * 10 + d2;
      breakdownSteps.push(
        `Band 1 (${b1.name} = ${d1}) and Band 2 (${b2.name} = ${d2}) combine to form the 2 significant digits: ${digits}`
      );
    } else {
      const d1 = b1.digit ?? 1;
      const d2 = b2.digit ?? 0;
      const d3 = b3.digit ?? 0;
      digits = d1 * 100 + d2 * 10 + d3;
      breakdownSteps.push(
        `Band 1 (${b1.name} = ${d1}), Band 2 (${b2.name} = ${d2}), and Band 3 (${b3.name} = ${d3}) combine to form the 3 significant digits: ${digits}`
      );
    }

    const multiplierFactor = mult.multiplier ?? 1;
    const rawOhms = digits * multiplierFactor;
    const tolPercent = tol.tolerance ?? 5;

    const multSymbol =
      multiplierFactor >= 1e6
        ? `×${multiplierFactor / 1e6} M`
        : multiplierFactor >= 1e3
        ? `×${multiplierFactor / 1e3} k`
        : multiplierFactor < 1
        ? `×${multiplierFactor}`
        : `×${multiplierFactor}`;

    breakdownSteps.push(
      `Multiplier Band (${mult.name} = ${multSymbol}): ${digits} × ${multiplierFactor} = ${rawOhms.toLocaleString()} Ω (${formatEngineering(rawOhms, 'Ω')})`
    );

    const minR = rawOhms * (1 - tolPercent / 100);
    const maxR = rawOhms * (1 + tolPercent / 100);

    breakdownSteps.push(
      `Tolerance Band (${tol.name} = ±${tolPercent}%): Guaranteed manufacturing variation is between ${formatEngineering(minR, 'Ω')} and ${formatEngineering(maxR, 'Ω')}`
    );

    return {
      significantDigits: digits,
      resistanceValue: rawOhms,
      formattedValue: `${formatEngineering(rawOhms, 'Ω')}`,
      exactOhms: `${rawOhms.toLocaleString(undefined, { maximumFractionDigits: 3 })} Ω`,
      tolerancePercent: tolPercent,
      minResistance: minR,
      maxResistance: maxR,
      formattedRange: `${formatEngineering(minR, 'Ω')} – ${formatEngineering(maxR, 'Ω')}`,
      breakdown: breakdownSteps,
    };
  }, [state]);

  // Color selection lists
  const digit1Colors: ColorName[] = ['brown', 'red', 'orange', 'yellow', 'green', 'blue', 'violet', 'gray', 'white'];
  const digitColors: ColorName[] = ['black', 'brown', 'red', 'orange', 'yellow', 'green', 'blue', 'violet', 'gray', 'white'];
  const multiplierColors: ColorName[] = ['silver', 'gold', 'black', 'brown', 'red', 'orange', 'yellow', 'green', 'blue', 'violet', 'gray', 'white'];
  const toleranceColors: ColorName[] = ['brown', 'red', 'green', 'blue', 'violet', 'gray', 'gold', 'silver'];

  return (
    <section id="resistor" className="scroll-mt-20 mb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          {/* Card Header */}
          <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-50/70 dark:bg-slate-900/80">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Resistor Color Code Calculator
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Decode 4-band and 5-band axial resistors with realistic visual rendering &amp; mathematical steps.
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Band Count Toggle */}
              <div className="flex p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleBandModeChange(4)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    state.bands === 4
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  4 Bands
                </button>
                <button
                  type="button"
                  onClick={() => handleBandModeChange(5)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    state.bands === 5
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  5 Bands (Precision)
                </button>
              </div>

              {/* Reset Button */}
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
                title="Reset to standard defaults"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            {/* Visual Resistor Graphic (SVG) */}
            <div className="w-full bg-radial from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 mb-8 flex flex-col items-center justify-center">
              <div className="w-full max-w-xl">
                <svg
                  viewBox="0 0 540 120"
                  className="w-full h-auto drop-shadow-sm"
                  xmlns="http://www.w3.org/2000/svg"
                  role="img"
                  aria-label="Interactive Resistor schematic preview"
                >
                  {/* Left Lead */}
                  <rect x="0" y="55" width="105" height="10" rx="3" fill="#94a3b8" stroke="#64748b" strokeWidth="1.5" />
                  {/* Right Lead */}
                  <rect x="435" y="55" width="105" height="10" rx="3" fill="#94a3b8" stroke="#64748b" strokeWidth="1.5" />

                  {/* Resistor Ceramic Body */}
                  <path
                    d="M 105 25 C 125 25, 135 40, 155 40 L 385 40 C 405 40, 415 25, 435 25 C 445 25, 445 95, 435 95 C 415 95, 405 80, 385 80 L 155 80 C 135 80, 125 95, 105 95 C 95 95, 95 25, 105 25 Z"
                    fill={state.bands === 4 ? '#fef3c7' : '#e0f2fe'}
                    stroke={state.bands === 4 ? '#d97706' : '#38bdf8'}
                    strokeWidth="2"
                  />

                  {/* Top Gloss Highlight */}
                  <path
                    d="M 106 32 C 125 32, 138 45, 158 45 L 382 45 C 402 45, 415 32, 434 32"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    opacity="0.5"
                  />

                  {/* Bands */}
                  {state.bands === 4 ? (
                    <>
                      {/* Band 1 */}
                      <rect x="150" y="27" width="16" height="66" rx="2" fill={COLOR_CODES[state.band1].hex} stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
                      {/* Band 2 */}
                      <rect x="205" y="38" width="16" height="44" rx="2" fill={COLOR_CODES[state.band2].hex} stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
                      {/* Multiplier Band */}
                      <rect x="280" y="38" width="16" height="44" rx="2" fill={COLOR_CODES[state.multiplier].hex} stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
                      {/* Tolerance Band (spaced farther right) */}
                      <rect x="375" y="27" width="16" height="66" rx="2" fill={COLOR_CODES[state.tolerance].hex} stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
                    </>
                  ) : (
                    <>
                      {/* Band 1 */}
                      <rect x="140" y="27" width="15" height="66" rx="2" fill={COLOR_CODES[state.band1].hex} stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
                      {/* Band 2 */}
                      <rect x="185" y="38" width="15" height="44" rx="2" fill={COLOR_CODES[state.band2].hex} stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
                      {/* Band 3 */}
                      <rect x="230" y="38" width="15" height="44" rx="2" fill={COLOR_CODES[state.band3].hex} stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
                      {/* Multiplier Band */}
                      <rect x="285" y="38" width="15" height="44" rx="2" fill={COLOR_CODES[state.multiplier].hex} stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
                      {/* Tolerance Band */}
                      <rect x="375" y="27" width="15" height="66" rx="2" fill={COLOR_CODES[state.tolerance].hex} stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
                    </>
                  )}
                </svg>
              </div>

              {/* Band Label Indicators below graphic */}
              <div className="flex items-center justify-center gap-2 sm:gap-4 mt-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLOR_CODES[state.band1].hex }} />
                  1st Digit
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLOR_CODES[state.band2].hex }} />
                  2nd Digit
                </span>
                {state.bands === 5 && (
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLOR_CODES[state.band3].hex }} />
                    3rd Digit
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLOR_CODES[state.multiplier].hex }} />
                  Multiplier
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLOR_CODES[state.tolerance].hex }} />
                  Tolerance
                </span>
              </div>
            </div>

            {/* Main Result Display Box */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-5 sm:p-6 mb-8 border border-slate-800 shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                  Calculated Nominal Resistance
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  {state.bands}-Band {state.bands === 5 ? 'Metal Film' : 'Carbon Film'}
                </span>
              </div>

              <div className="flex flex-wrap items-baseline gap-3 my-2">
                <div className="font-mono text-3xl sm:text-5xl font-extrabold text-cyan-400 tracking-tight">
                  {result.formattedValue}
                </div>
                <div className="text-lg sm:text-2xl font-semibold text-amber-400">
                  ±{result.tolerancePercent}%
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 mt-4 border-t border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Exact Ohms Value:</span>
                  <span className="font-mono font-bold text-slate-100 text-sm">{result.exactOhms}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Tolerance Margin:</span>
                  <span className="font-mono font-bold text-slate-100 text-sm">±{result.tolerancePercent}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Guaranteed Range:</span>
                  <span className="font-mono font-bold text-slate-100 text-sm">{result.formattedRange}</span>
                </div>
              </div>
            </div>

            {/* Beginner-Friendly Step-by-Step Breakdown */}
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 mb-8">
              <div className="flex items-center gap-2 mb-3 text-slate-900 dark:text-white font-bold text-sm">
                <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>How this resistance is computed:</span>
              </div>
              <ol className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 list-decimal list-inside">
                {result.breakdown.map((step, idx) => (
                  <li key={idx} className="leading-relaxed pl-1">
                    <span className="font-normal">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Color Swatch Selectors */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Select Band Colors:
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> Click any color below to update
                </span>
              </div>

              <div className={`grid grid-cols-2 ${state.bands === 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-4`}>
                {/* Band 1 */}
                <div className="bg-slate-50/80 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <span className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
                    1st Band (Digit)
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">First figure (1–9)</p>
                  <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                    {digit1Colors.map((c) => {
                      const info = COLOR_CODES[c];
                      const isSelected = state.band1 === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setState((prev) => ({ ...prev, band1: c }))}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: info.hex }} />
                            <span>{info.name}</span>
                          </span>
                          <span className="font-mono text-[11px] opacity-80">{info.digit}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Band 2 */}
                <div className="bg-slate-50/80 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <span className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
                    2nd Band (Digit)
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">Second figure (0–9)</p>
                  <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                    {digitColors.map((c) => {
                      const info = COLOR_CODES[c];
                      const isSelected = state.band2 === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setState((prev) => ({ ...prev, band2: c }))}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: info.hex }} />
                            <span>{info.name}</span>
                          </span>
                          <span className="font-mono text-[11px] opacity-80">{info.digit}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Band 3 (5-Band only) */}
                {state.bands === 5 && (
                  <div className="bg-slate-50/80 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                    <span className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
                      3rd Band (Digit)
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">Third figure (0–9)</p>
                    <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                      {digitColors.map((c) => {
                        const info = COLOR_CODES[c];
                        const isSelected = state.band3 === c;
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setState((prev) => ({ ...prev, band3: c }))}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: info.hex }} />
                              <span>{info.name}</span>
                            </span>
                            <span className="font-mono text-[11px] opacity-80">{info.digit}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Multiplier Band */}
                <div className="bg-slate-50/80 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <span className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
                    Multiplier
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">Decade scale (×10ⁿ)</p>
                  <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                    {multiplierColors.map((c) => {
                      const info = COLOR_CODES[c];
                      const isSelected = state.multiplier === c;
                      const multDisplay =
                        info.multiplier !== null
                          ? info.multiplier >= 1e6
                            ? `×${info.multiplier / 1e6}M`
                            : info.multiplier >= 1e3
                            ? `×${info.multiplier / 1e3}k`
                            : `×${info.multiplier}`
                          : '';
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setState((prev) => ({ ...prev, multiplier: c }))}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: info.hex }} />
                            <span>{info.name}</span>
                          </span>
                          <span className="font-mono text-[11px] opacity-80">{multDisplay}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tolerance Band */}
                <div className="bg-slate-50/80 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <span className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
                    Tolerance
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">Precision rating (±%)</p>
                  <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                    {toleranceColors.map((c) => {
                      const info = COLOR_CODES[c];
                      const isSelected = state.tolerance === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setState((prev) => ({ ...prev, tolerance: c }))}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: info.hex }} />
                            <span>{info.name}</span>
                          </span>
                          <span className="font-mono text-[11px] opacity-80">±{info.tolerance}%</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
