import { Palette, Zap, Lightbulb, Scale, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function Hero() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="pt-8 pb-12 sm:pt-12 sm:pb-16 relative overflow-hidden">
      {/* Subtle circuit-themed background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-72 bg-gradient-to-tr from-blue-500/10 via-indigo-500/10 to-teal-500/5 blur-3xl pointer-events-none -z-10 rounded-full" />

      <div className="max-w-5xl mx-auto text-center px-4 sm:px-6">
        {/* Engineering Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-6">
          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Engineered for ECE Students, Lab Experiments &amp; Circuit Hobbyists</span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          Precision Circuit Math, <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 dark:from-blue-400 dark:via-indigo-300 dark:to-cyan-400">
            Simplified for Everyone
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 sm:mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Accurately decode resistor color bands, calculate Ohm&apos;s law parameters with interactive triangles, size current-limiting LED resistors, and convert electronics units in real time.
        </p>

        {/* Quick Tool Navigation Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => scrollTo('resistor')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Palette className="w-4 h-4" />
            <span>Resistor Color Code</span>
          </button>

          <button
            type="button"
            onClick={() => scrollTo('ohms')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-sm border border-slate-200 dark:border-slate-700 shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Ohm&apos;s Law</span>
          </button>

          <button
            type="button"
            onClick={() => scrollTo('led')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-sm border border-slate-200 dark:border-slate-700 shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Lightbulb className="w-4 h-4 text-emerald-500" />
            <span>LED Resistor</span>
          </button>

          <button
            type="button"
            onClick={() => scrollTo('converter')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-sm border border-slate-200 dark:border-slate-700 shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Scale className="w-4 h-4 text-purple-500" />
            <span>Unit Converter</span>
          </button>
        </div>

        {/* Feature Highlights / Trust Factors */}
        <div className="mt-10 pt-8 border-t border-slate-200/80 dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">IEC 60062 Standard</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Accurate 4 &amp; 5-band color specs</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Interactive Triangle</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">V = I × R formula derivation</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">E12 Commercial Series</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Nearest real-world standard values</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Real-time Engineering Math</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Zero mock stubs or fake values</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
