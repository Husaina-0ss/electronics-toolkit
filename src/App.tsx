import { useState, useEffect } from 'react';
import { ThemeMode } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ToolCards } from './components/ToolCards';
import { ResistorCalculator } from './components/ResistorCalculator';
import { OhmsLawCalculator } from './components/OhmsLawCalculator';
import { LedCalculator } from './components/LedCalculator';
import { UnitConverter } from './components/UnitConverter';
import { Footer } from './components/Footer';

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('et_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const [activeSection, setActiveSection] = useState<string>('home');

  // Synchronize theme class on HTML element & localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('et_theme', theme);
    } catch {}
  }, [theme]);

  // Track active section for navbar highlighting
  useEffect(() => {
    const sections = ['home', 'resistor', 'ohms', 'led', 'converter'];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.25 }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Sticky Navigation */}
      <Navbar
        theme={theme}
        onToggleTheme={handleToggleTheme}
        activeSection={activeSection}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero />

        {/* Tools Overview Cards */}
        <ToolCards />

        {/* Individual Working Calculators */}
        <ResistorCalculator />
        <OhmsLawCalculator />
        <LedCalculator />
        <UnitConverter />
      </main>

      {/* Footer with Formula Cheatsheet */}
      <Footer />
    </div>
  );
}
