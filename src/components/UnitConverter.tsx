import { useState } from 'react';
import { RotateCcw, Scale, ArrowRightLeft } from 'lucide-react';
import { UnitCategory } from '../types';
import { UNIT_DEFINITIONS } from '../data/electronics';

export function UnitConverter() {
  const [activeCategory, setActiveCategory] = useState<UnitCategory>('resistance');

  // Stored base values for each category:
  // resistance -> Base: Ohms (Ω)
  // voltage -> Base: Volts (V)
  // current -> Base: Amperes (A)
  // power -> Base: Watts (W)
  const [baseValues, setBaseValues] = useState<Record<UnitCategory, number>>({
    resistance: 1000, // 1 kΩ
    voltage: 5,       // 5 V
    current: 0.02,    // 20 mA
    power: 0.5,       // 500 mW
  });

  const handleInputChange = (category: UnitCategory, factor: number, rawInput: string) => {
    if (rawInput.trim() === '') return;
    const num = parseFloat(rawInput);
    if (!isNaN(num)) {
      const newBase = num * factor;
      setBaseValues((prev) => ({
        ...prev,
        [category]: newBase,
      }));
    }
  };

  const handleReset = () => {
    setBaseValues({
      resistance: 1000,
      voltage: 5,
      current: 0.02,
      power: 0.5,
    });
  };

  const currentUnits = UNIT_DEFINITIONS[activeCategory];
  const currentBase = baseValues[activeCategory];

  // Helper to format values cleanly without floating point inaccuracies
  const formatUnitValue = (val: number): string => {
    if (val === 0) return '0';
    const abs = Math.abs(val);
    if (abs >= 1e6 || abs <= 1e-4) {
      return val.toExponential(4);
    }
    // Round to 6 decimal places and remove trailing zeroes
    return parseFloat(val.toFixed(6)).toString();
  };

  return (
    <section id="converter" className="scroll-mt-20 mb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-50/70 dark:bg-slate-900/80">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Electronics Unit Converter
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time bidirectional conversion for Resistance, Voltage, Current, and Power with SI prefixes.
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
            {/* Category Selector Tabs */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl mb-7 max-w-xl">
              <button
                type="button"
                onClick={() => setActiveCategory('resistance')}
                className={`flex-1 min-w-[120px] py-2 px-3 text-xs font-bold rounded-lg transition-all text-center ${
                  activeCategory === 'resistance'
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Resistance (Ω)
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory('voltage')}
                className={`flex-1 min-w-[120px] py-2 px-3 text-xs font-bold rounded-lg transition-all text-center ${
                  activeCategory === 'voltage'
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Voltage (V)
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory('current')}
                className={`flex-1 min-w-[120px] py-2 px-3 text-xs font-bold rounded-lg transition-all text-center ${
                  activeCategory === 'current'
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Current (A)
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory('power')}
                className={`flex-1 min-w-[120px] py-2 px-3 text-xs font-bold rounded-lg transition-all text-center ${
                  activeCategory === 'power'
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Power (W)
              </button>
            </div>

            {/* Live Synchronized Unit Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {currentUnits.map((unit) => {
                const displayVal = currentBase / unit.factor;
                return (
                  <div
                    key={unit.id}
                    className="bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 transition-colors focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {unit.label}
                      </span>
                      <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
                        {unit.symbol}
                      </span>
                    </div>

                    <div className="relative my-1">
                      <input
                        type="number"
                        step="any"
                        value={formatUnitValue(displayVal)}
                        onChange={(e) => handleInputChange(activeCategory, unit.factor, e.target.value)}
                        className="w-full px-3 py-2 text-sm font-mono font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                      />
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                      {unit.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Scientific & Engineering Notation Panel */}
            <div className="mt-8 bg-gradient-to-r from-purple-900/10 via-indigo-900/10 to-blue-900/10 dark:from-purple-950/40 dark:via-indigo-950/40 dark:to-blue-950/40 border border-purple-200 dark:border-purple-900/60 rounded-xl p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Scientific &amp; SI Base Representation
                  </span>
                </div>
                <div className="font-mono text-sm sm:text-base font-bold text-purple-700 dark:text-purple-300">
                  {currentBase.toExponential(4)}{' '}
                  {activeCategory === 'resistance' ? 'Ω' : activeCategory === 'voltage' ? 'V' : activeCategory === 'current' ? 'A' : 'W'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
