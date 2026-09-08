import { Cpu, BookOpen, Layers, ShieldCheck } from 'lucide-react';

export function Footer() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="mt-auto bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors">
      {/* Formula Cheat-Sheet / Reference Table */}
      <div id="reference-sheet" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            Fundamental Electronics Formulas Reference
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Ohm&apos;s Law</span>
            <p className="font-mono text-blue-600 dark:text-blue-400 text-sm mb-1.5">V = I × R</p>
            <p className="text-slate-500 dark:text-slate-400">
              Potential difference equals current multiplied by resistance. Rearranged: I = V / R and R = V / I.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Electrical Power (Joule)</span>
            <p className="font-mono text-amber-600 dark:text-amber-400 text-sm mb-1.5">P = V × I = I²R = V²/R</p>
            <p className="text-slate-500 dark:text-slate-400">
              Power dissipated in a resistive circuit element in Watts (Joules per second).
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white block mb-1">LED Series Resistor</span>
            <p className="font-mono text-emerald-600 dark:text-emerald-400 text-sm mb-1.5">R = (V_S - V_F) / I_F</p>
            <p className="text-slate-500 dark:text-slate-400">
              Absorbs excess supply voltage to enforce safe operating current and avoid diode thermal runaway.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white block mb-1">IEC 60062 Color Decoding</span>
            <p className="font-mono text-purple-600 dark:text-purple-400 text-sm mb-1.5">R = Digits × 10ⁿ ± Tol%</p>
            <p className="text-slate-500 dark:text-slate-400">
              International standard for marking through-hole axial resistors with significant figures and decade multiplier.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-sm text-slate-900 dark:text-white">Electronics Toolkit</span>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Educational suite for ECE &amp; electronics students, hobbyists &amp; makers.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <button type="button" onClick={() => scrollTo('resistor')} className="hover:text-blue-600 dark:hover:text-blue-400">
            Resistor Code
          </button>
          <button type="button" onClick={() => scrollTo('ohms')} className="hover:text-blue-600 dark:hover:text-blue-400">
            Ohm&apos;s Law
          </button>
          <button type="button" onClick={() => scrollTo('led')} className="hover:text-blue-600 dark:hover:text-blue-400">
            LED Resistor
          </button>
          <button type="button" onClick={() => scrollTo('converter')} className="hover:text-blue-600 dark:hover:text-blue-400">
            Unit Converter
          </button>
        </div>
      </div>
    </footer>
  );
}
