import { Palette, Zap, Lightbulb, Scale, ArrowRight } from 'lucide-react';

export function ToolCards() {
  const tools = [
    {
      id: 'resistor',
      title: 'Resistor Color Code',
      icon: Palette,
      color: 'blue',
      description: 'Decode 4-band and 5-band axial resistors with live SVG visual preview, tolerance range, and significant digits breakdown.',
      formula: 'R = (Digits) × 10ⁿ ± Tol%',
      tag: 'IEC 60062 Standard',
    },
    {
      id: 'ohms',
      title: "Ohm's Law Calculator",
      icon: Zap,
      color: 'amber',
      description: 'Enter any two values among Voltage (V), Current (I), and Resistance (R). Solves the missing variable with an interactive Ohm\'s triangle.',
      formula: 'V = I × R  •  P = V × I',
      tag: 'DC Circuits',
    },
    {
      id: 'led',
      title: 'LED Series Resistor',
      icon: Lightbulb,
      color: 'emerald',
      description: 'Determine the exact and standard E12 current-limiting resistor for LEDs, plus resistor power dissipation and safe wattage ratings.',
      formula: 'R = (V_S - V_F) / I_F',
      tag: 'Component Protection',
    },
    {
      id: 'converter',
      title: 'Electronics Unit Converter',
      icon: Scale,
      color: 'purple',
      description: 'Convert between Ohms, Kilohms, Megohms, Volts, Millivolts, Amps, Milliamps, Microamps, and Watts with scientific notation.',
      formula: '10⁻⁶ (µ) ↔ 10⁻³ (m) ↔ 1 ↔ 10³ (k) ↔ 10⁶ (M)',
      tag: 'SI Engineering Units',
    },
  ];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="mb-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Comprehensive Circuit Utilities
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Choose a calculator below or scroll through the toolkit workbench.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                onClick={() => scrollTo(tool.id)}
                className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-950 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {tool.tag}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {tool.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-3">
                    {tool.description}
                  </p>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[170px]">
                    {tool.formula}
                  </span>
                  <span className="text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Open</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
