/**
 * Electronics Toolkit - Core Client-Side Logic
 * Comprehensive educational suite for electronics and ECE students.
 */

// ==========================================================================
// 1. DATA STRUCTURES & CONFIGURATION
// ==========================================================================

const COLOR_CODES = {
  black:  { name: 'Black',  digit: 0, mult: 1,          tol: null,  tempCo: 250,  hex: '#18181b', text: '#ffffff' },
  brown:  { name: 'Brown',  digit: 1, mult: 10,         tol: 1,     tempCo: 100,  hex: '#78350f', text: '#ffffff' },
  red:    { name: 'Red',    digit: 2, mult: 100,        tol: 2,     tempCo: 50,   hex: '#dc2626', text: '#ffffff' },
  orange: { name: 'Orange', digit: 3, mult: 1000,       tol: 0.05,  tempCo: 15,   hex: '#ea580c', text: '#ffffff' },
  yellow: { name: 'Yellow', digit: 4, mult: 10000,      tol: 0.02,  tempCo: 25,   hex: '#eab308', text: '#0f172a' },
  green:  { name: 'Green',  digit: 5, mult: 100000,     tol: 0.5,   tempCo: 20,   hex: '#16a34a', text: '#ffffff' },
  blue:   { name: 'Blue',   digit: 6, mult: 1000000,    tol: 0.25,  tempCo: 10,   hex: '#2563eb', text: '#ffffff' },
  violet: { name: 'Violet', digit: 7, mult: 10000000,   tol: 0.1,   tempCo: 5,    hex: '#9333ea', text: '#ffffff' },
  gray:   { name: 'Gray',   digit: 8, mult: 100000000,  tol: 0.05,  tempCo: 1,    hex: '#64748b', text: '#ffffff' },
  white:  { name: 'White',  digit: 9, mult: 1000000000, tol: null,  tempCo: null, hex: '#f8fafc', text: '#0f172a' },
  gold:   { name: 'Gold',   digit: null, mult: 0.1,     tol: 5,     tempCo: null, hex: '#d97706', text: '#ffffff' },
  silver: { name: 'Silver', digit: null, mult: 0.01,    tol: 10,    tempCo: null, hex: '#94a3b8', text: '#0f172a' }
};

// Standard E12 Decade Series multipliers
const E12_BASE = [1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2];

// ==========================================================================
// 2. HELPER UTILITIES
// ==========================================================================

function formatEngineering(val, unit = 'Ω') {
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

function formatScientific(val, unit = '') {
  if (val === null || val === undefined || isNaN(val)) return '-';
  return `${val.toExponential(3)} ${unit}`.trim();
}

// ==========================================================================
// 3. TAB NAVIGATION CONTROLLER
// ==========================================================================

function initNavigation() {
  const navTabs = document.querySelectorAll('.nav-tab');
  const toolPanes = document.querySelectorAll('.tool-pane');

  navTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-target');
      navTabs.forEach((t) => t.classList.remove('active'));
      toolPanes.forEach((p) => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });
}

// ==========================================================================
// 4. FEATURE 1: RESISTOR COLOR CODE CALCULATOR
// ==========================================================================

const resistorState = {
  bandCount: 4,
  band1: 'brown',
  band2: 'black',
  band3: 'black',
  multiplier: 'red',
  tolerance: 'gold',
  tempCo: 'brown'
};

function initResistorCalculator() {
  // Band count buttons
  const bandBtns = [
    document.getElementById('btnBand4'),
    document.getElementById('btnBand5'),
    document.getElementById('btnBand6')
  ];

  bandBtns.forEach((btn) => {
    if (!btn) return;
    btn.addEventListener('click', () => {
      bandBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      resistorState.bandCount = parseInt(btn.getAttribute('data-bands'), 10);
      updateBandVisibility();
      renderBandSwatches();
      calculateResistorValue();
    });
  });

  // Reset button
  const resetBtn = document.getElementById('btnResetResistor');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      resistorState.bandCount = 4;
      resistorState.band1 = 'brown';
      resistorState.band2 = 'black';
      resistorState.band3 = 'black';
      resistorState.multiplier = 'red';
      resistorState.tolerance = 'gold';
      resistorState.tempCo = 'brown';

      bandBtns.forEach((b) => {
        b.classList.toggle('active', b.getAttribute('data-bands') === '4');
      });

      updateBandVisibility();
      renderBandSwatches();
      calculateResistorValue();
    });
  }

  updateBandVisibility();
  renderBandSwatches();
  calculateResistorValue();
}

function updateBandVisibility() {
  const is5or6 = resistorState.bandCount >= 5;
  const is6 = resistorState.bandCount === 6;

  // Columns in UI
  const colBand3 = document.getElementById('colBand3');
  const colTempCo = document.getElementById('colTempCo');
  const tempCoBox = document.getElementById('resistorTempCoContainer');
  const badge = document.getElementById('resistorBandModeBadge');

  if (colBand3) colBand3.style.display = is5or6 ? 'block' : 'none';
  if (colTempCo) colTempCo.style.display = is6 ? 'block' : 'none';
  if (tempCoBox) tempCoBox.style.display = is6 ? 'flex' : 'none';
  if (badge) badge.textContent = `${resistorState.bandCount}-Band Mode`;

  // SVG Bands
  const svgBand1 = document.getElementById('svgBand1');
  const svgBand2 = document.getElementById('svgBand2');
  const svgBand3 = document.getElementById('svgBand3');
  const svgMult  = document.getElementById('svgBandMultiplier');
  const svgTol   = document.getElementById('svgBandTolerance');
  const svgTemp  = document.getElementById('svgBandTempCo');

  if (svgBand3) svgBand3.style.display = is5or6 ? 'block' : 'none';
  if (svgTemp)  svgTemp.style.display = is6 ? 'block' : 'none';

  // Adjust SVG horizontal positions based on band count
  if (resistorState.bandCount === 4) {
    if (svgBand1) svgBand1.setAttribute('x', '145');
    if (svgBand2) svgBand2.setAttribute('x', '195');
    if (svgMult)  svgMult.setAttribute('x', '265');
    if (svgTol)   svgTol.setAttribute('x', '365');
  } else if (resistorState.bandCount === 5) {
    if (svgBand1) svgBand1.setAttribute('x', '140');
    if (svgBand2) svgBand2.setAttribute('x', '180');
    if (svgBand3) svgBand3.setAttribute('x', '220');
    if (svgMult)  svgMult.setAttribute('x', '270');
    if (svgTol)   svgTol.setAttribute('x', '365');
  } else if (resistorState.bandCount === 6) {
    if (svgBand1) svgBand1.setAttribute('x', '140');
    if (svgBand2) svgBand2.setAttribute('x', '175');
    if (svgBand3) svgBand3.setAttribute('x', '210');
    if (svgMult)  svgMult.setAttribute('x', '255');
    if (svgTol)   svgTol.setAttribute('x', '340');
    if (svgTemp)  svgTemp.setAttribute('x', '385');
  }
}

function renderBandSwatches() {
  const createSwatch = (key, currentVal, onSelect, filterFn, labelFn) => {
    const listEl = document.getElementById(key);
    if (!listEl) return;
    listEl.innerHTML = '';

    Object.entries(COLOR_CODES).forEach(([colorKey, colorData]) => {
      if (filterFn && !filterFn(colorData)) return;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `color-swatch-btn ${colorKey === currentVal ? 'selected' : ''}`;
      btn.setAttribute('aria-label', `${colorData.name} (${labelFn ? labelFn(colorData) : ''})`);

      btn.innerHTML = `
        <span class="swatch-label-wrap">
          <span class="swatch-color-pill" style="background-color: ${colorData.hex};"></span>
          <span>${colorData.name}</span>
        </span>
        <span class="swatch-value-tag">${labelFn ? labelFn(colorData) : ''}</span>
      `;

      btn.addEventListener('click', () => {
        onSelect(colorKey);
        renderBandSwatches();
        calculateResistorValue();
      });

      listEl.appendChild(btn);
    });
  };

  // 1st Digit (non-black digits 1-9)
  createSwatch('listBand1', resistorState.band1, (c) => { resistorState.band1 = c; },
    (d) => d.digit !== null && d.digit >= 1,
    (d) => d.digit
  );

  // 2nd Digit (0-9)
  createSwatch('listBand2', resistorState.band2, (c) => { resistorState.band2 = c; },
    (d) => d.digit !== null,
    (d) => d.digit
  );

  // 3rd Digit (5 & 6-band only, 0-9)
  if (resistorState.bandCount >= 5) {
    createSwatch('listBand3', resistorState.band3, (c) => { resistorState.band3 = c; },
      (d) => d.digit !== null,
      (d) => d.digit
    );
  }

  // Multiplier (all valid multipliers)
  createSwatch('listMultiplier', resistorState.multiplier, (c) => { resistorState.multiplier = c; },
    (d) => d.mult !== null,
    (d) => {
      if (d.mult >= 1e6) return `×${d.mult / 1e6}M`;
      if (d.mult >= 1e3) return `×${d.mult / 1e3}k`;
      return `×${d.mult}`;
    }
  );

  // Tolerance (Brown to Silver)
  createSwatch('listTolerance', resistorState.tolerance, (c) => { resistorState.tolerance = c; },
    (d) => d.tol !== null,
    (d) => `±${d.tol}%`
  );

  // TempCo (6-band only)
  if (resistorState.bandCount === 6) {
    createSwatch('listTempCo', resistorState.tempCo, (c) => { resistorState.tempCo = c; },
      (d) => d.tempCo !== null,
      (d) => `${d.tempCo} ppm`
    );
  }
}

function calculateResistorValue() {
  const b1 = COLOR_CODES[resistorState.band1];
  const b2 = COLOR_CODES[resistorState.band2];
  const b3 = COLOR_CODES[resistorState.band3];
  const bm = COLOR_CODES[resistorState.multiplier];
  const bt = COLOR_CODES[resistorState.tolerance];
  const btc = COLOR_CODES[resistorState.tempCo];

  // Update SVG band fill colors
  const svgBand1 = document.getElementById('svgBand1');
  const svgBand2 = document.getElementById('svgBand2');
  const svgBand3 = document.getElementById('svgBand3');
  const svgMult  = document.getElementById('svgBandMultiplier');
  const svgTol   = document.getElementById('svgBandTolerance');
  const svgTemp  = document.getElementById('svgBandTempCo');

  if (svgBand1) svgBand1.setAttribute('fill', b1.hex);
  if (svgBand2) svgBand2.setAttribute('fill', b2.hex);
  if (svgBand3) svgBand3.setAttribute('fill', b3.hex);
  if (svgMult)  svgMult.setAttribute('fill', bm.hex);
  if (svgTol)   svgTol.setAttribute('fill', bt.hex);
  if (svgTemp)  svgTemp.setAttribute('fill', btc.hex);

  // Significant digits calculation
  let sigDigits = 0;
  let digitsBreakdown = '';

  if (resistorState.bandCount === 4) {
    sigDigits = (b1.digit * 10) + b2.digit;
    digitsBreakdown = `Band 1 (${b1.name} = ${b1.digit}) and Band 2 (${b2.name} = ${b2.digit}) combine to form significant digits: <strong>${sigDigits}</strong>`;
  } else {
    sigDigits = (b1.digit * 100) + (b2.digit * 10) + b3.digit;
    digitsBreakdown = `Band 1 (${b1.name} = ${b1.digit}), Band 2 (${b2.name} = ${b2.digit}), and Band 3 (${b3.name} = ${b3.digit}) combine to form significant digits: <strong>${sigDigits}</strong>`;
  }

  const exactValue = sigDigits * bm.mult;
  const tolPercent = bt.tol || 0;
  const minVal = exactValue * (1 - tolPercent / 100);
  const maxVal = exactValue * (1 + tolPercent / 100);

  // DOM Updates
  const mainValEl = document.getElementById('resistorFormattedVal');
  const exactValEl = document.getElementById('resistorExactOhms');
  const tolEl = document.getElementById('resistorToleranceDisplay');
  const rangeEl = document.getElementById('resistorRangeDisplay');
  const tempCoEl = document.getElementById('resistorTempCoDisplay');
  const breakdownList = document.getElementById('resistorBreakdownList');

  if (mainValEl) mainValEl.textContent = `${formatEngineering(exactValue, 'Ω')} ±${tolPercent}%`;
  if (exactValEl) exactValEl.textContent = `${exactValue.toLocaleString(undefined, { maximumFractionDigits: 3 })} Ω`;
  if (tolEl) tolEl.textContent = `±${tolPercent}%`;
  if (rangeEl) rangeEl.textContent = `${formatEngineering(minVal, 'Ω')} – ${formatEngineering(maxVal, 'Ω')}`;
  if (tempCoEl && resistorState.bandCount === 6) {
    tempCoEl.textContent = `${btc.tempCo} ppm/K`;
  }

  // Explanation Breakdown list
  if (breakdownList) {
    const multStr = bm.mult >= 1 ? `×${bm.mult.toLocaleString()}` : `×${bm.mult}`;
    const items = [
      digitsBreakdown,
      `Multiplier Band (${bm.name}): Multiplies the base digits by ${multStr} &rarr; <code>${sigDigits} × ${multStr} = ${exactValue.toLocaleString()} Ω (${formatEngineering(exactValue, 'Ω')})</code>`,
      `Tolerance Band (${bt.name} = ±${tolPercent}%): Guaranteed manufacturing accuracy interval lies between <strong>${formatEngineering(minVal, 'Ω')}</strong> and <strong>${formatEngineering(maxVal, 'Ω')}</strong>.`
    ];

    if (resistorState.bandCount === 6) {
      items.push(`Temperature Coefficient Band (${btc.name} = ${btc.tempCo} ppm/K): For each 1°C temperature change, the resistance shifts by at most ±${btc.tempCo / 10000}%.`);
    }

    breakdownList.innerHTML = items.map((t) => `<li>${t}</li>`).join('');
  }
}

// ==========================================================================
// 5. FEATURE 2: OHM'S LAW CALCULATOR
// ==========================================================================

function initOhmsCalculator() {
  const inputV = document.getElementById('ohmsVoltage');
  const unitV = document.getElementById('ohmsVoltageUnit');
  const inputI = document.getElementById('ohmsCurrent');
  const unitI = document.getElementById('ohmsCurrentUnit');
  const inputR = document.getElementById('ohmsResistance');
  const unitR = document.getElementById('ohmsResistanceUnit');
  const calcBtn = document.getElementById('btnCalcOhms');
  const resetBtn = document.getElementById('btnResetOhms');

  // Preset Chips
  document.querySelectorAll('[data-apply-voltage]').forEach((btn) => {
    btn.addEventListener('click', () => {
      inputV.value = btn.getAttribute('data-apply-voltage');
      unitV.value = '1';
      calculateOhmsLaw();
    });
  });

  document.querySelectorAll('[data-apply-current]').forEach((btn) => {
    btn.addEventListener('click', () => {
      inputI.value = btn.getAttribute('data-apply-current');
      unitI.value = btn.getAttribute('data-apply-current-unit') || '0.001';
      calculateOhmsLaw();
    });
  });

  document.querySelectorAll('[data-apply-res]').forEach((btn) => {
    btn.addEventListener('click', () => {
      inputR.value = btn.getAttribute('data-apply-res');
      unitR.value = btn.getAttribute('data-apply-res-unit') || '1';
      calculateOhmsLaw();
    });
  });

  // Calculate & Reset
  if (calcBtn) calcBtn.addEventListener('click', calculateOhmsLaw);
  [inputV, inputI, inputR, unitV, unitI, unitR].forEach((el) => {
    if (el) el.addEventListener('input', () => {
      // Auto compute when exactly two fields are populated
      const count = [inputV.value, inputI.value, inputR.value].filter((v) => v.trim() !== '').length;
      if (count >= 2) calculateOhmsLaw();
    });
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      inputV.value = '';
      inputI.value = '';
      inputR.value = '';
      unitV.value = '1';
      unitI.value = '0.001';
      unitR.value = '1';
      clearOhmsOutputs();
    });
  }
}

function clearOhmsOutputs() {
  document.getElementById('ohmsError').classList.remove('visible');
  document.getElementById('ohmsPrimaryResult').textContent = '-';
  document.getElementById('ohmsValV').textContent = '-';
  document.getElementById('ohmsValI').textContent = '-';
  document.getElementById('ohmsValR').textContent = '-';
  document.getElementById('ohmsValP').textContent = '-';
  document.getElementById('ohmsBreakdownCard').style.display = 'none';

  ['triSectorV', 'triSectorI', 'triSectorR'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('target');
  });
}

function calculateOhmsLaw() {
  const inputV = document.getElementById('ohmsVoltage');
  const unitV = parseFloat(document.getElementById('ohmsVoltageUnit').value);
  const inputI = document.getElementById('ohmsCurrent');
  const unitI = parseFloat(document.getElementById('ohmsCurrentUnit').value);
  const inputR = document.getElementById('ohmsResistance');
  const unitR = parseFloat(document.getElementById('ohmsResistanceUnit').value);
  const errorEl = document.getElementById('ohmsError');

  errorEl.classList.remove('visible');

  const valVRaw = inputV.value.trim();
  const valIRaw = inputI.value.trim();
  const valRRaw = inputR.value.trim();

  const hasV = valVRaw !== '' && !isNaN(Number(valVRaw));
  const hasI = valIRaw !== '' && !isNaN(Number(valIRaw));
  const hasR = valRRaw !== '' && !isNaN(Number(valRRaw));

  const filledCount = [hasV, hasI, hasR].filter(Boolean).length;

  if (filledCount < 2) {
    errorEl.textContent = 'Please enter any two values among Voltage, Current, and Resistance.';
    errorEl.classList.add('visible');
    return;
  }

  let V = hasV ? parseFloat(valVRaw) * unitV : null;
  let I = hasI ? parseFloat(valIRaw) * unitI : null;
  let R = hasR ? parseFloat(valRRaw) * unitR : null;

  if (hasR && R <= 0) {
    errorEl.textContent = 'Resistance must be strictly positive (> 0 Ω).';
    errorEl.classList.add('visible');
    return;
  }

  let target = '';
  let formulaStr = '';
  let breakdownSteps = [];

  if (!hasV && hasI && hasR) {
    // Solve for V = I * R
    target = 'V';
    V = I * R;
    formulaStr = 'V = I × R';
    breakdownSteps = [
      `Selected unknown: Voltage (V)`,
      `Formula: <code>V = I × R</code>`,
      `Substitution: <code>V = ${I} A × ${R} Ω = ${V} V</code>`,
      `Result: <strong>${formatEngineering(V, 'V')}</strong>`
    ];
  } else if (!hasI && hasV && hasR) {
    // Solve for I = V / R
    target = 'I';
    I = V / R;
    formulaStr = 'I = V / R';
    breakdownSteps = [
      `Selected unknown: Current (I)`,
      `Formula: <code>I = V / R</code>`,
      `Substitution: <code>I = ${V} V / ${R} Ω = ${I} A</code>`,
      `Result: <strong>${formatEngineering(I, 'A')}</strong>`
    ];
  } else if (!hasR && hasV && hasI) {
    // Solve for R = V / I
    if (I === 0) {
      errorEl.textContent = 'Current cannot be zero when solving for resistance (division by zero).';
      errorEl.classList.add('visible');
      return;
    }
    target = 'R';
    R = V / I;
    formulaStr = 'R = V / I';
    breakdownSteps = [
      `Selected unknown: Resistance (R)`,
      `Formula: <code>R = V / I</code>`,
      `Substitution: <code>R = ${V} V / ${I} A = ${R} Ω</code>`,
      `Result: <strong>${formatEngineering(R, 'Ω')}</strong>`
    ];
  } else {
    // All three provided -> verify or recalculate V
    target = 'V';
    V = I * R;
    formulaStr = 'V = I × R';
    breakdownSteps = [
      `All 3 values entered. Re-evaluating Voltage via <code>V = I × R</code>`,
      `Calculated Voltage: <code>${I} A × ${R} Ω = ${V} V</code>`
    ];
  }

  const P = V * I;

  // Highlight triangle sector
  ['triSectorV', 'triSectorI', 'triSectorR'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('target');
  });
  const targetSector = document.getElementById(`triSector${target}`);
  if (targetSector) targetSector.classList.add('target');

  // Display results
  const primaryDisplay = document.getElementById('ohmsPrimaryResult');
  const badge = document.getElementById('ohmsEquationBadge');
  const label = document.getElementById('ohmsCalculatedLabel');

  badge.textContent = formulaStr;
  label.textContent = `Solved Parameter (${target})`;

  if (target === 'V') primaryDisplay.textContent = formatEngineering(V, 'V');
  if (target === 'I') primaryDisplay.textContent = formatEngineering(I, 'A');
  if (target === 'R') primaryDisplay.textContent = formatEngineering(R, 'Ω');

  document.getElementById('ohmsValV').textContent = formatEngineering(V, 'V');
  document.getElementById('ohmsValI').textContent = formatEngineering(I, 'A');
  document.getElementById('ohmsValR').textContent = formatEngineering(R, 'Ω');
  document.getElementById('ohmsValP').textContent = formatEngineering(P, 'W');

  // Breakdown Card
  breakdownSteps.push(`Associated Electrical Power Dissipation: <code>P = V × I = ${V} V × ${I} A = ${formatEngineering(P, 'W')}</code>`);
  const breakdownCard = document.getElementById('ohmsBreakdownCard');
  const breakdownList = document.getElementById('ohmsBreakdownList');
  breakdownCard.style.display = 'block';
  breakdownList.innerHTML = breakdownSteps.map((s) => `<li>${s}</li>`).join('');
}

// ==========================================================================
// 6. FEATURE 3: POWER CALCULATOR
// ==========================================================================

function initPowerCalculator() {
  const pairSelect = document.getElementById('powerPairMode');
  const groupP = document.getElementById('groupPowerP');
  const groupV = document.getElementById('groupPowerV');
  const groupI = document.getElementById('groupPowerI');
  const groupR = document.getElementById('groupPowerR');
  const calcBtn = document.getElementById('btnCalcPower');
  const resetBtn = document.getElementById('btnResetPower');

  function updateVisibleInputs() {
    const mode = pairSelect.value;
    groupP.style.display = (mode === 'pv' || mode === 'pi' || mode === 'pr') ? 'block' : 'none';
    groupV.style.display = (mode === 'vi' || mode === 'vr' || mode === 'pv') ? 'block' : 'none';
    groupI.style.display = (mode === 'vi' || mode === 'ir' || mode === 'pi') ? 'block' : 'none';
    groupR.style.display = (mode === 'ir' || mode === 'vr' || mode === 'pr') ? 'block' : 'none';
  }

  pairSelect.addEventListener('change', () => {
    updateVisibleInputs();
    calculatePower();
  });

  if (calcBtn) calcBtn.addEventListener('click', calculatePower);

  // Live input changes
  ['powerP', 'powerV', 'powerI', 'powerR', 'powerPUnit', 'powerVUnit', 'powerIUnit', 'powerRUnit'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', calculatePower);
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      ['powerP', 'powerV', 'powerI', 'powerR'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      document.getElementById('powerError').classList.remove('visible');
      document.getElementById('powerDisplayMain').textContent = '-';
      document.getElementById('powerValW').textContent = '-';
      document.getElementById('powerValMW').textContent = '-';
      document.getElementById('powerValKW').textContent = '-';
      document.getElementById('powerValWattHour').textContent = '-';
      document.getElementById('powerSummaryV').textContent = '-';
      document.getElementById('powerSummaryI').textContent = '-';
      document.getElementById('powerSummaryR').textContent = '-';
      document.getElementById('powerSummaryP').textContent = '-';
      document.getElementById('powerBreakdownCard').style.display = 'none';
    });
  }

  updateVisibleInputs();
  // Default demo state
  document.getElementById('powerV').value = '12';
  document.getElementById('powerI').value = '500';
  document.getElementById('powerIUnit').value = '0.001';
  calculatePower();
}

function calculatePower() {
  const mode = document.getElementById('powerPairMode').value;
  const errorEl = document.getElementById('powerError');
  errorEl.classList.remove('visible');

  const getVal = (id, unitId) => {
    const input = document.getElementById(id);
    const unit = parseFloat(document.getElementById(unitId).value);
    const raw = input ? input.value.trim() : '';
    if (raw === '' || isNaN(Number(raw))) return null;
    return parseFloat(raw) * unit;
  };

  let P = null, V = null, I = null, R = null;
  let formulaUsed = '';
  let steps = [];

  if (mode === 'vi') {
    V = getVal('powerV', 'powerVUnit');
    I = getVal('powerI', 'powerIUnit');
    if (V === null || I === null) return;
    P = V * I;
    R = I !== 0 ? V / I : null;
    formulaUsed = 'P = V × I';
    steps = [
      `Inputs: Voltage <code>V = ${V} V</code>, Current <code>I = ${I} A</code>`,
      `Direct Power: <code>P = V × I = ${V} × ${I} = ${P} W</code>`,
      `Equivalent Resistance: <code>R = V / I = ${V} / ${I} = ${R !== null ? formatEngineering(R, 'Ω') : 'N/A'}</code>`
    ];
  } else if (mode === 'ir') {
    I = getVal('powerI', 'powerIUnit');
    R = getVal('powerR', 'powerRUnit');
    if (I === null || R === null) return;
    if (R <= 0) {
      errorEl.textContent = 'Resistance must be greater than 0.';
      errorEl.classList.add('visible');
      return;
    }
    P = (I * I) * R;
    V = I * R;
    formulaUsed = 'P = I² × R';
    steps = [
      `Inputs: Current <code>I = ${I} A</code>, Resistance <code>R = ${R} Ω</code>`,
      `Joule Power: <code>P = I² × R = (${I})² × ${R} = ${P} W</code>`,
      `Associated Voltage: <code>V = I × R = ${I} × ${R} = ${formatEngineering(V, 'V')}</code>`
    ];
  } else if (mode === 'vr') {
    V = getVal('powerV', 'powerVUnit');
    R = getVal('powerR', 'powerRUnit');
    if (V === null || R === null) return;
    if (R <= 0) {
      errorEl.textContent = 'Resistance must be greater than 0.';
      errorEl.classList.add('visible');
      return;
    }
    P = (V * V) / R;
    I = V / R;
    formulaUsed = 'P = V² / R';
    steps = [
      `Inputs: Voltage <code>V = ${V} V</code>, Resistance <code>R = ${R} Ω</code>`,
      `Power: <code>P = V² / R = (${V})² / ${R} = ${P} W</code>`,
      `Current Drawn: <code>I = V / R = ${V} / ${R} = ${formatEngineering(I, 'A')}</code>`
    ];
  } else if (mode === 'pv') {
    P = getVal('powerP', 'powerPUnit');
    V = getVal('powerV', 'powerVUnit');
    if (P === null || V === null) return;
    if (V === 0) {
      errorEl.textContent = 'Voltage cannot be zero.';
      errorEl.classList.add('visible');
      return;
    }
    I = P / V;
    R = (V * V) / P;
    formulaUsed = 'I = P / V, R = V² / P';
    steps = [
      `Inputs: Power <code>P = ${P} W</code>, Voltage <code>V = ${V} V</code>`,
      `Current Drawn: <code>I = P / V = ${P} / ${V} = ${formatEngineering(I, 'A')}</code>`,
      `Circuit Resistance: <code>R = V² / P = (${V})² / ${P} = ${formatEngineering(R, 'Ω')}</code>`
    ];
  } else if (mode === 'pi') {
    P = getVal('powerP', 'powerPUnit');
    I = getVal('powerI', 'powerIUnit');
    if (P === null || I === null) return;
    if (I === 0) {
      errorEl.textContent = 'Current cannot be zero.';
      errorEl.classList.add('visible');
      return;
    }
    V = P / I;
    R = P / (I * I);
    formulaUsed = 'V = P / I, R = P / I²';
    steps = [
      `Inputs: Power <code>P = ${P} W</code>, Current <code>I = ${I} A</code>`,
      `Required Voltage: <code>V = P / I = ${P} / ${I} = ${formatEngineering(V, 'V')}</code>`,
      `Circuit Resistance: <code>R = P / I² = ${P} / (${I})² = ${formatEngineering(R, 'Ω')}</code>`
    ];
  } else if (mode === 'pr') {
    P = getVal('powerP', 'powerPUnit');
    R = getVal('powerR', 'powerRUnit');
    if (P === null || R === null) return;
    if (P < 0 || R <= 0) {
      errorEl.textContent = 'Power and resistance must be positive.';
      errorEl.classList.add('visible');
      return;
    }
    V = Math.sqrt(P * R);
    I = Math.sqrt(P / R);
    formulaUsed = 'V = √(P×R), I = √(P/R)';
    steps = [
      `Inputs: Power <code>P = ${P} W</code>, Resistance <code>R = ${R} Ω</code>`,
      `Resulting Voltage: <code>V = √(P × R) = √(${P} × ${R}) = ${formatEngineering(V, 'V')}</code>`,
      `Resulting Current: <code>I = √(P / R) = √(${P} / ${R}) = ${formatEngineering(I, 'A')}</code>`
    ];
  }

  // Display Result
  document.getElementById('powerFormulaBadge').textContent = formulaUsed;
  document.getElementById('powerDisplayMain').textContent = formatEngineering(P, 'W');
  document.getElementById('powerValW').textContent = `${P.toLocaleString(undefined, { maximumFractionDigits: 4 })} W`;
  document.getElementById('powerValMW').textContent = `${(P * 1000).toLocaleString(undefined, { maximumFractionDigits: 3 })} mW`;
  document.getElementById('powerValKW').textContent = `${(P / 1000).toLocaleString(undefined, { maximumFractionDigits: 6 })} kW`;
  document.getElementById('powerValWattHour').textContent = `${P.toLocaleString(undefined, { maximumFractionDigits: 3 })} Wh`;

  document.getElementById('powerSummaryV').textContent = V !== null ? formatEngineering(V, 'V') : '-';
  document.getElementById('powerSummaryI').textContent = I !== null ? formatEngineering(I, 'A') : '-';
  document.getElementById('powerSummaryR').textContent = R !== null ? formatEngineering(R, 'Ω') : '-';
  document.getElementById('powerSummaryP').textContent = P !== null ? formatEngineering(P, 'W') : '-';

  const breakdownCard = document.getElementById('powerBreakdownCard');
  const breakdownList = document.getElementById('powerBreakdownList');
  breakdownCard.style.display = 'block';
  breakdownList.innerHTML = steps.map((s) => `<li>${s}</li>`).join('');
}

// ==========================================================================
// 7. FEATURE 4: LED SERIES RESISTOR CALCULATOR
// ==========================================================================

function initLedCalculator() {
  const inputVs = document.getElementById('ledSupplyV');
  const inputVf = document.getElementById('ledForwardV');
  const inputIf = document.getElementById('ledCurrent');
  const calcBtn = document.getElementById('btnCalcLed');
  const resetBtn = document.getElementById('btnResetLed');

  // Quick supply voltage presets
  document.querySelectorAll('[data-apply-supply]').forEach((btn) => {
    btn.addEventListener('click', () => {
      inputVs.value = btn.getAttribute('data-apply-supply');
      calculateLedResistor();
    });
  });

  // Quick LED Vf presets
  document.querySelectorAll('[data-apply-vf]').forEach((btn) => {
    btn.addEventListener('click', () => {
      inputVf.value = btn.getAttribute('data-apply-vf');
      calculateLedResistor();
    });
  });

  // Quick If presets
  document.querySelectorAll('[data-apply-if]').forEach((btn) => {
    btn.addEventListener('click', () => {
      inputIf.value = btn.getAttribute('data-apply-if');
      calculateLedResistor();
    });
  });

  [inputVs, inputVf, inputIf].forEach((el) => {
    if (el) el.addEventListener('input', calculateLedResistor);
  });

  if (calcBtn) calcBtn.addEventListener('click', calculateLedResistor);

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      inputVs.value = '5';
      inputVf.value = '2.0';
      inputIf.value = '20';
      calculateLedResistor();
    });
  }

  calculateLedResistor();
}

function findNearestE12(exactValue) {
  if (exactValue <= 0) return 0;
  const decade = Math.pow(10, Math.floor(Math.log10(exactValue)));
  const normalized = exactValue / decade;

  // Find smallest E12 value >= normalized (safest for LEDs to prevent overcurrent)
  let standardNormalized = E12_BASE.find((v) => v >= normalized);
  if (!standardNormalized) {
    // Wrap to 10 * decade
    return 10 * decade;
  }
  return Math.round(standardNormalized * decade * 100) / 100;
}

function calculateLedResistor() {
  const inputVs = document.getElementById('ledSupplyV');
  const inputVf = document.getElementById('ledForwardV');
  const inputIf = document.getElementById('ledCurrent');
  const errorEl = document.getElementById('ledError');

  errorEl.classList.remove('visible');

  const Vs = parseFloat(inputVs.value);
  const Vf = parseFloat(inputVf.value);
  const If_mA = parseFloat(inputIf.value);

  if (isNaN(Vs) || isNaN(Vf) || isNaN(If_mA)) return;

  if (Vs <= Vf) {
    errorEl.textContent = `Supply Voltage (Vs = ${Vs}V) must be strictly greater than LED Forward Voltage (Vf = ${Vf}V) for the LED to conduct forward bias.`;
    errorEl.classList.add('visible');
    return;
  }

  if (If_mA <= 0) {
    errorEl.textContent = 'Desired LED Current must be greater than 0 mA.';
    errorEl.classList.add('visible');
    return;
  }

  const Vr = Vs - Vf; // Voltage drop across the resistor
  const If_A = If_mA / 1000;
  const exactR = Vr / If_A;
  const standardR = findNearestE12(exactR);

  // Actual current with standard resistor
  const actualIf_A = Vr / standardR;
  const actualIf_mA = actualIf_A * 1000;

  // Power dissipated by resistor
  const Pr_W = Vr * actualIf_A;
  const Pr_mW = Pr_W * 1000;

  // Recommended wattage with 2x safety margin
  let wattageText = '';
  if (Pr_W < 0.06) {
    wattageText = '1/8 W (125 mW)';
  } else if (Pr_W < 0.125) {
    wattageText = '1/4 W (250 mW)';
  } else if (Pr_W < 0.25) {
    wattageText = '1/2 W (500 mW)';
  } else if (Pr_W < 0.5) {
    wattageText = '1 W';
  } else {
    wattageText = '2 W or higher';
  }

  // Display Values
  document.getElementById('ledStandardRDisplay').textContent = formatEngineering(standardR, 'Ω');
  document.getElementById('ledExactRDisplay').textContent = `${exactR.toFixed(1)} Ω`;
  document.getElementById('ledActualCurrentDisplay').textContent = `${actualIf_mA.toFixed(1)} mA`;
  document.getElementById('ledResistorPowerDisplay').textContent = `${Pr_mW.toFixed(1)} mW (${Pr_W.toFixed(3)} W)`;
  document.getElementById('ledWattageRatingDisplay').textContent = wattageText;

  // Update SVG schematic labels
  const svgVsLabel = document.getElementById('svgVsLabel');
  const svgResLabel = document.getElementById('svgResistorLabel');
  const svgVfLabel = document.getElementById('svgVfLabel');
  const svgLedAnode = document.getElementById('svgLedAnode');

  if (svgVsLabel) svgVsLabel.textContent = `+Vs (${Vs}V)`;
  if (svgResLabel) svgResLabel.textContent = `R = ${formatEngineering(standardR, 'Ω')}`;
  if (svgVfLabel) svgVfLabel.textContent = `LED (${Vf}V @ ${actualIf_mA.toFixed(1)}mA)`;

  // Color LED symbol based on Vf
  if (svgLedAnode) {
    if (Vf <= 2.05) svgLedAnode.setAttribute('fill', '#dc2626'); // Red
    else if (Vf <= 2.15) svgLedAnode.setAttribute('fill', '#d97706'); // Yellow
    else if (Vf <= 2.4) svgLedAnode.setAttribute('fill', '#16a34a'); // Green
    else if (Vf <= 3.3) svgLedAnode.setAttribute('fill', '#2563eb'); // Blue/White
  }

  // Mathematical Breakdown
  const breakdownList = document.getElementById('ledBreakdownList');
  if (breakdownList) {
    breakdownList.innerHTML = `
      <li>Resistor Voltage Drop: <code>V_R = V_S - V_F = ${Vs}V - ${Vf}V = ${Vr.toFixed(2)} V</code></li>
      <li>Exact Resistor Needed: <code>R_exact = V_R / I_F = ${Vr.toFixed(2)}V / ${If_mA}mA = ${exactR.toFixed(1)} Ω</code></li>
      <li>Nearest Standard (E12) Resistor: <strong>${formatEngineering(standardR, 'Ω')}</strong> (selected &ge; exact to avoid overdriving)</li>
      <li>Actual Forward Current: <code>I_actual = V_R / R_standard = ${Vr.toFixed(2)}V / ${standardR}Ω = ${actualIf_mA.toFixed(2)} mA</code></li>
      <li>Resistor Power Dissipation: <code>P_R = V_R × I_actual = ${Vr.toFixed(2)}V × ${actualIf_mA.toFixed(2)}mA = ${Pr_mW.toFixed(1)} mW</code></li>
      <li>Minimum Power Rating: <strong>${wattageText}</strong> (applies a 2× safety rule to prevent component heating).</li>
    `;
  }
}

// ==========================================================================
// 8. FEATURE 5: RESISTOR SERIES & PARALLEL CALCULATOR
// ==========================================================================

let combinationResistors = [
  { value: 100, unit: 1 },
  { value: 220, unit: 1 }
];

function initCombinationCalculator() {
  const container = document.getElementById('resistorRowContainer');
  const addBtn = document.getElementById('btnAddResistorRow');
  const calcBtn = document.getElementById('btnCalcCombo');
  const resetBtn = document.getElementById('btnResetCombo');
  const bulkBtn = document.getElementById('btnApplyBulk');
  const bulkInput = document.getElementById('comboBulkInput');

  function renderRows() {
    if (!container) return;
    container.innerHTML = '';

    combinationResistors.forEach((r, idx) => {
      const row = document.createElement('div');
      row.className = 'resistor-row-item';

      row.innerHTML = `
        <span class="resistor-index-badge">R<sub>${idx + 1}</sub></span>
        <div class="input-with-unit" style="flex:1;">
          <input type="number" step="any" class="form-input combo-val-input" data-index="${idx}" value="${r.value}" placeholder="e.g. 100" />
          <select class="unit-select combo-unit-select" data-index="${idx}">
            <option value="1" ${r.unit === 1 ? 'selected' : ''}>Ω</option>
            <option value="1000" ${r.unit === 1000 ? 'selected' : ''}>kΩ</option>
            <option value="1000000" ${r.unit === 1000000 ? 'selected' : ''}>MΩ</option>
          </select>
        </div>
        <button type="button" class="resistor-delete-btn" data-delete-index="${idx}" title="Remove resistor" aria-label="Remove R${idx + 1}">
          &times;
        </button>
      `;

      container.appendChild(row);
    });

    // Bind row events
    container.querySelectorAll('.combo-val-input').forEach((input) => {
      input.addEventListener('input', (e) => {
        const i = parseInt(e.target.getAttribute('data-index'), 10);
        combinationResistors[i].value = parseFloat(e.target.value) || 0;
        calculateCombination();
      });
    });

    container.querySelectorAll('.combo-unit-select').forEach((sel) => {
      sel.addEventListener('change', (e) => {
        const i = parseInt(e.target.getAttribute('data-index'), 10);
        combinationResistors[i].unit = parseFloat(e.target.value);
        calculateCombination();
      });
    });

    container.querySelectorAll('.resistor-delete-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const i = parseInt(btn.getAttribute('data-delete-index'), 10);
        if (combinationResistors.length <= 2) {
          showComboError('Networks require at least 2 resistors.');
          return;
        }
        combinationResistors.splice(i, 1);
        renderRows();
        calculateCombination();
      });
    });
  }

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      if (combinationResistors.length >= 8) {
        showComboError('Maximum 8 resistors allowed in direct row list.');
        return;
      }
      combinationResistors.push({ value: 100, unit: 1 });
      renderRows();
      calculateCombination();
    });
  }

  if (calcBtn) calcBtn.addEventListener('click', calculateCombination);

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      combinationResistors = [
        { value: 100, unit: 1 },
        { value: 220, unit: 1 }
      ];
      renderRows();
      calculateCombination();
    });
  }

  // Bulk input parser (e.g. 100, 220, 1k, 4.7k)
  if (bulkBtn && bulkInput) {
    bulkBtn.addEventListener('click', () => {
      const text = bulkInput.value.trim();
      if (!text) return;
      const parts = text.split(/[\s,]+/);
      const parsed = [];

      parts.forEach((p) => {
        p = p.trim().toLowerCase();
        if (!p) return;
        let mult = 1;
        if (p.endsWith('k') || p.endsWith('kohm')) {
          mult = 1000;
          p = p.replace(/k.*$/, '');
        } else if (p.endsWith('m') || p.endsWith('mohm')) {
          mult = 1000000;
          p = p.replace(/m.*$/, '');
        }
        const num = parseFloat(p);
        if (!isNaN(num) && num > 0) {
          parsed.push({ value: num, unit: mult });
        }
      });

      if (parsed.length >= 2) {
        combinationResistors = parsed.slice(0, 8);
        renderRows();
        calculateCombination();
      } else {
        showComboError('Please enter at least 2 valid resistor values (e.g. 100, 220, 1k).');
      }
    });
  }

  renderRows();
  calculateCombination();
}

function showComboError(msg) {
  const errorEl = document.getElementById('comboError');
  if (errorEl) {
    errorEl.textContent = msg;
    errorEl.classList.add('visible');
  }
}

function calculateCombination() {
  const errorEl = document.getElementById('comboError');
  if (errorEl) errorEl.classList.remove('visible');

  const baseValues = combinationResistors
    .map((r) => r.value * r.unit)
    .filter((v) => !isNaN(v) && v > 0);

  if (baseValues.length < 2) {
    showComboError('Please enter at least two valid non-zero resistor values.');
    return;
  }

  // Series: R_eq = sum(R_i)
  const rSeries = baseValues.reduce((acc, curr) => acc + curr, 0);

  // Parallel: 1/R_eq = sum(1/R_i) -> G = sum(1/R_i)
  const totalConductance = baseValues.reduce((acc, curr) => acc + (1 / curr), 0);
  const rParallel = totalConductance > 0 ? (1 / totalConductance) : 0;

  // Display outputs
  document.getElementById('comboSeriesVal').textContent = formatEngineering(rSeries, 'Ω');
  document.getElementById('comboParallelVal').textContent = formatEngineering(rParallel, 'Ω');
  document.getElementById('comboConductanceVal').textContent = formatEngineering(totalConductance, 'S');

  // Mathematical breakdown
  const breakdownList = document.getElementById('comboBreakdownList');
  if (breakdownList) {
    const seriesSumExpr = baseValues.map((v) => formatEngineering(v, 'Ω')).join(' + ');
    const parallelRecipExpr = baseValues.map((v) => `1/${formatEngineering(v, 'Ω')}`).join(' + ');
    const minVal = Math.min(...baseValues);
    const maxVal = Math.max(...baseValues);

    breakdownList.innerHTML = `
      <li><strong>Series Combination:</strong> <code>R_eq = ${seriesSumExpr} = ${formatEngineering(rSeries, 'Ω')}</code></li>
      <li>Series Rule Verified: The equivalent series value (${formatEngineering(rSeries, 'Ω')}) is strictly greater than the maximum single resistor (${formatEngineering(maxVal, 'Ω')}).</li>
      <li><strong>Parallel Combination:</strong> <code>1/R_eq = ${parallelRecipExpr} = ${totalConductance.toExponential(4)} S</code></li>
      <li>Inverting Conductance: <code>R_parallel = 1 / G = ${formatEngineering(rParallel, 'Ω')}</code></li>
      <li>Parallel Rule Verified: The equivalent parallel value (${formatEngineering(rParallel, 'Ω')}) is strictly lower than the smallest single resistor (${formatEngineering(minVal, 'Ω')}).</li>
    `;
  }
}

// ==========================================================================
// 9. FEATURE 6: ELECTRONICS UNIT CONVERTER
// ==========================================================================

function initUnitConverter() {
  const tabBtns = document.querySelectorAll('.converter-tab-btn');
  const views = {
    resistance: document.getElementById('convPane-resistance'),
    voltage: document.getElementById('convPane-voltage'),
    current: document.getElementById('convPane-current'),
    frequency: document.getElementById('convPane-frequency')
  };

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.getAttribute('data-conv-tab');

      Object.entries(views).forEach(([k, el]) => {
        if (el) el.style.display = (k === target) ? 'block' : 'none';
      });
    });
  });

  // Wire bidirectional inputs per view
  function setupConverterGroup(inputs, baseUnit, sciDisplayId) {
    inputs.forEach((input) => {
      input.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (isNaN(val)) return;

        const currentMultiplier = parseFloat(e.target.getAttribute('data-multiplier'));
        const baseVal = val * currentMultiplier;

        // Update sibling inputs
        inputs.forEach((other) => {
          if (other === e.target) return;
          const otherMult = parseFloat(other.getAttribute('data-multiplier'));
          const converted = baseVal / otherMult;
          other.value = converted >= 1e9 || (converted > 0 && converted < 1e-4) 
            ? converted.toExponential(4) 
            : parseFloat(converted.toFixed(6));
        });

        // Scientific Display
        const sciEl = document.getElementById(sciDisplayId);
        if (sciEl) {
          sciEl.textContent = `${formatScientific(baseVal, baseUnit)} (${formatEngineering(baseVal, baseUnit)})`;
        }
      });
    });
  }

  // 1. Resistance
  const rInputs = [
    document.getElementById('unitR_ohm'),
    document.getElementById('unitR_kohm'),
    document.getElementById('unitR_mohm'),
    document.getElementById('unitR_milliohm')
  ];
  setupConverterGroup(rInputs, 'Ω', 'unitR_sci');

  // 2. Voltage
  const vInputs = [
    document.getElementById('unitV_micro'),
    document.getElementById('unitV_milli'),
    document.getElementById('unitV_volt'),
    document.getElementById('unitV_kilo')
  ];
  setupConverterGroup(vInputs, 'V', 'unitV_sci');

  // 3. Current
  const iInputs = [
    document.getElementById('unitI_micro'),
    document.getElementById('unitI_milli'),
    document.getElementById('unitI_amp')
  ];
  setupConverterGroup(iInputs, 'A', 'unitI_sci');

  // 4. Frequency
  const fInputs = [
    document.getElementById('unitF_hz'),
    document.getElementById('unitF_khz'),
    document.getElementById('unitF_mhz'),
    document.getElementById('unitF_ghz')
  ];
  setupConverterGroup(fInputs, 'Hz', 'unitF_sci');

  // Converter Reset Button
  const resetBtn = document.getElementById('btnResetConverter');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      // Restore default test values
      document.getElementById('unitR_ohm').value = '1000';
      document.getElementById('unitR_kohm').value = '1';
      document.getElementById('unitR_mohm').value = '0.001';
      document.getElementById('unitR_milliohm').value = '1000000';

      document.getElementById('unitV_volt').value = '5';
      document.getElementById('unitV_milli').value = '5000';
      document.getElementById('unitV_micro').value = '5000000';
      document.getElementById('unitV_kilo').value = '0.005';

      document.getElementById('unitI_milli').value = '20';
      document.getElementById('unitI_micro').value = '20000';
      document.getElementById('unitI_amp').value = '0.02';

      document.getElementById('unitF_mhz').value = '16';
      document.getElementById('unitF_hz').value = '16000000';
      document.getElementById('unitF_khz').value = '16000';
      document.getElementById('unitF_ghz').value = '0.016';
    });
  }
}

// ==========================================================================
// 10. DOMCONTENTLOADED INITIALIZER
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initResistorCalculator();
  initOhmsCalculator();
  initPowerCalculator();
  initLedCalculator();
  initCombinationCalculator();
  initUnitConverter();
});
