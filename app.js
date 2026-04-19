// ---------- physical constants (SI) ----------
const H   = 6.62607015e-34;     // Planck
const HBAR = H / (2 * Math.PI);
const ME  = 9.1093837015e-31;   // electron mass
const EV  = 1.602176634e-19;    // 1 eV in J
const A0  = 5.29177210903e-11;  // Bohr radius (m)
const RY  = 13.605693122994;    // Rydberg in eV

// ---------- build periodic table ----------
const tableEl = document.getElementById("table");

function cellNode(el) {
  const d = document.createElement("div");
  d.className = `cell ${el.block}${el.radio ? " radio" : ""}`;
  d.style.gridRow = el.row;
  d.style.gridColumn = el.col;
  d.dataset.z = el.z;
  d.innerHTML =
    `<div class="z">${el.z}</div>` +
    `<div class="sy">${el.sy}</div>` +
    `<div class="nm">${el.nm}</div>`;
  d.addEventListener("click", () => select(el.z));
  return d;
}

Object.values(BY_Z).forEach(el => tableEl.appendChild(cellNode(el)));

MARKERS.forEach(m => {
  const d = document.createElement("div");
  d.className = "label";
  d.style.gridRow = m.row;
  d.style.gridColumn = m.col;
  d.textContent = m.label;
  tableEl.appendChild(d);
});

// ---------- selection / info ----------
let current = BY_Z[92];  // Uranium default — showcases both Bohr X-rays and γ lines

// highest principal quantum number occupied in the neutral ground-state atom
function outerShell(Z) {
  if (Z <= 2)  return 1;
  if (Z <= 10) return 2;
  if (Z <= 18) return 3;
  if (Z <= 36) return 4;
  if (Z <= 54) return 5;
  if (Z <= 86) return 6;
  return 7;
}

function select(z) {
  current = BY_Z[z];
  document.querySelectorAll(".cell.sel").forEach(c => c.classList.remove("sel"));
  const cell = document.querySelector(`.cell[data-z="${z}"]`);
  if (cell) cell.classList.add("sel");

  // auto-adjust orbit count to the element's outermost occupied shell
  const n = outerShell(current.z);
  nSlider.value = n;
  nVal.textContent = n;

  renderInfo();
  renderOrbits();
  renderSpectrum();
}

function renderInfo() {
  document.getElementById("el-name").textContent =
    `${current.sy} — ${current.nm} (Z=${current.z})`;
  document.getElementById("el-meta").textContent =
    `atomic mass ${current.mass} u · ${current.block}-block` +
    (current.radio ? " · radioactive" : "");

  // de Broglie numbers for ground-state-like orbit n=1, Zeff≈Z
  const Z = current.z;
  const v1 = (Z * EV * EV) / (4 * Math.PI * 8.8541878128e-12 * HBAR);  // hydrogenic v_1
  const lam1 = H / (ME * v1);
  const r1 = A0 / Z;
  const ev = RY * Z * Z;

  document.getElementById("el-physics").innerHTML = `
    <p>Taking a hydrogenic approximation with Z<sub>eff</sub> = ${Z}:</p>
    <p>innermost orbit radius&nbsp; <code>r₁ = a₀/Z ≈ ${(r1*1e12).toFixed(2)} pm</code><br>
       electron speed&nbsp; <code>v₁ ≈ ${(v1/3e8).toFixed(3)} c</code><br>
       de Broglie wavelength&nbsp; <code>λ₁ = h/(m·v₁) ≈ ${(lam1*1e12).toFixed(2)} pm</code><br>
       ground-state binding&nbsp; <code>|E₁| ≈ ${ev.toFixed(1)} eV</code>
    </p>
    <p>The standing-wave condition <code>2πr<sub>n</sub> = nλ<sub>n</sub></code>
       produces the orbits drawn at right. Photon transitions
       n<sub>i</sub>→n<sub>f</sub> generate the blue lines of the spectrum.</p>
    ${current.radio
      ? `<p><strong style="color:#ff8a8f">Radioactive.</strong>
         Red lines show characteristic nuclear γ emissions of a common isotope
         (${current.gamma.length ? current.gamma.join(", ") + " keV" : "no well-measured γ lines in our table"}).</p>`
      : ""}
  `;
}

// ---------- HiDPI canvas setup ----------
// Backing store = CSS size × devicePixelRatio so lines stay sharp on retina / 4K
// displays.  Logical (CSS) dimensions are cached on the element as _W / _H so
// the render code keeps working in CSS pixels. Returns true if anything changed.
function setupHiDPI(cv) {
  const dpr = window.devicePixelRatio || 1;
  const rect = cv.getBoundingClientRect();
  const w = Math.max(1, rect.width);
  const h = Math.max(1, rect.height);
  const newW = Math.round(w * dpr);
  const newH = Math.round(h * dpr);
  const changed = cv.width !== newW || cv.height !== newH || cv._dpr !== dpr;
  if (changed) {
    cv.width  = newW;
    cv.height = newH;
  }
  const ctx = cv.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);  // draw in CSS pixels
  cv._W = w; cv._H = h; cv._dpr = dpr;
  return ctx;
}

// ---------- de Broglie orbits ----------
const orbCv = document.getElementById("orbits");
let   orbCtx = setupHiDPI(orbCv);
const nSlider = document.getElementById("n-slider");
const nVal = document.getElementById("n-val");

nSlider.addEventListener("input", () => {
  nVal.textContent = nSlider.value;
  renderOrbits();
});

function renderOrbits() {
  const W = orbCv._W, H2 = orbCv._H;
  const cx = W / 2, cy = H2 / 2;
  const nMax = +nSlider.value;
  orbCtx.clearRect(0, 0, W, H2);

  // background radial glow
  const g = orbCtx.createRadialGradient(cx, cy, 0, cx, cy, W/2);
  g.addColorStop(0, "#10161f");
  g.addColorStop(1, "#05070c");
  orbCtx.fillStyle = g;
  orbCtx.fillRect(0, 0, W, H2);

  // nucleus — sized very rough by Z^(1/3)
  const rN = 3 + Math.cbrt(current.z) * 1.1;
  orbCtx.beginPath();
  orbCtx.arc(cx, cy, rN, 0, 2*Math.PI);
  orbCtx.fillStyle = current.radio ? "#ff5a5f" : "#ffcf55";
  orbCtx.shadowBlur = 18;
  orbCtx.shadowColor = orbCtx.fillStyle;
  orbCtx.fill();
  orbCtx.shadowBlur = 0;

  // orbit spacing: r_n ∝ n² (Bohr)
  const rMax = Math.min(W, H2) * 0.46;
  const scale = rMax / (nMax * nMax);

  for (let n = 1; n <= nMax; n++) {
    const r = n * n * scale;

    // dashed reference orbit
    orbCtx.strokeStyle = "rgba(110,160,255,0.18)";
    orbCtx.setLineDash([3, 4]);
    orbCtx.lineWidth = 1;
    orbCtx.beginPath();
    orbCtx.arc(cx, cy, r, 0, 2*Math.PI);
    orbCtx.stroke();
    orbCtx.setLineDash([]);

    // standing wave: r(θ) = r + A·sin(n·θ + φ)
    // n wavelengths fit exactly around the loop.
    const A = Math.min(14, r * 0.18);
    const phi = performance.now() * 0.0006 * (n % 2 ? 1 : -1); // slow counter-rotation
    orbCtx.beginPath();
    const steps = 600;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 2 * Math.PI;
      const rr = r + A * Math.sin(n * t + phi);
      const x = cx + rr * Math.cos(t);
      const y = cy + rr * Math.sin(t);
      if (i === 0) orbCtx.moveTo(x, y); else orbCtx.lineTo(x, y);
    }
    const hue = 210 - n * 12;
    orbCtx.strokeStyle = `hsl(${hue}, 85%, 62%)`;
    orbCtx.lineWidth = 1.6;
    orbCtx.stroke();

    // orbit label
    orbCtx.fillStyle = "rgba(200,210,230,0.55)";
    orbCtx.font = '13px ui-sans-serif, system-ui, -apple-system, "Segoe UI", Arial, sans-serif';
    orbCtx.textBaseline = "alphabetic";
    orbCtx.fillText(`n=${n}`, cx + r + 6, cy + 3);
  }
}

// smooth animation while orbits are visible
function animate() {
  renderOrbits();
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// ---------- spectrum ----------
const specCv = document.getElementById("spectrum");
let   specCtx = setupHiDPI(specCv);

// log axis: 1 eV .. 2 MeV  -> 1e-3 keV .. 2e3 keV
const E_MIN_KEV = 1e-3;
const E_MAX_KEV = 2e3;

function xAxis(E_keV, W) {
  const lo = Math.log10(E_MIN_KEV), hi = Math.log10(E_MAX_KEV);
  const t = (Math.log10(E_keV) - lo) / (hi - lo);
  return Math.max(0, Math.min(1, t)) * W;
}

// Map photon energy to a perceptual colour.
// Visible band 380–780 nm uses Bruton's wavelength-to-RGB;
// IR fades to dark red, UV→violet, X-ray→blue-white, γ→pale cyan-white.
function energyColor(E_keV, alpha = 1) {
  const E_eV = E_keV * 1000;
  const lam  = 1240 / E_eV;           // nm
  let r, g, b;

  if (lam >= 380 && lam <= 780) {
    if      (lam < 440) { r = -(lam - 440) / 60; g = 0;                   b = 1; }
    else if (lam < 490) { r = 0;                  g = (lam - 440) / 50;   b = 1; }
    else if (lam < 510) { r = 0;                  g = 1;                  b = -(lam - 510) / 20; }
    else if (lam < 580) { r = (lam - 510) / 70;   g = 1;                  b = 0; }
    else if (lam < 645) { r = 1;                  g = -(lam - 645) / 65;  b = 0; }
    else                { r = 1;                  g = 0;                  b = 0; }
    // dim the extreme violet/red ends to match eye response
    let f = 1;
    if      (lam > 700) f = 0.3 + 0.7 * (780 - lam) / 80;
    else if (lam < 420) f = 0.3 + 0.7 * (lam - 380) / 40;
    r *= f; g *= f; b *= f;
  } else if (lam > 780) {            // IR → dark red
    const t = Math.min(1, 780 / lam);
    r = 0.55 * t; g = 0.05 * t; b = 0.05 * t;
  } else if (E_eV < 100) {           // near-UV: violet → indigo
    const t = (E_eV - 3.26) / (100 - 3.26);       // 0..1
    r = 0.55 - 0.25 * t; g = 0.0 + 0.35 * t; b = 1.0;
  } else {                           // X-ray → γ: indigo-white → pale cyan-white
    const t = Math.min(1, (Math.log10(E_eV) - 2) / 5); // 100 eV..10 MeV
    r = 0.55 + 0.35 * t;
    g = 0.75 + 0.20 * t;
    b = 1.0 - 0.1 * t;
  }
  const to255 = v => Math.round(255 * Math.max(0, Math.min(1, v)));
  return `rgba(${to255(r)},${to255(g)},${to255(b)},${alpha})`;
}

function renderSpectrum() {
  const W = specCv._W, H2 = specCv._H;
  specCtx.clearRect(0, 0, W, H2);
  specCtx.fillStyle = "#070a10";
  specCtx.fillRect(0, 0, W, H2);

  // axis decorations — decade ticks
  specCtx.strokeStyle = "rgba(200,210,230,0.12)";
  specCtx.fillStyle = "rgba(180,190,210,0.6)";
  specCtx.font = '12px ui-sans-serif, system-ui, -apple-system, "Segoe UI", Arial, sans-serif';
  specCtx.textBaseline = "alphabetic";
  specCtx.lineWidth = 1;
  for (let e = -3; e <= 3; e++) {
    const xKeV = Math.pow(10, e);
    const x = xAxis(xKeV, W);
    specCtx.beginPath();
    specCtx.moveTo(x, 20);
    specCtx.lineTo(x, H2 - 20);
    specCtx.stroke();
    let lbl = xKeV >= 1 ? `${xKeV} keV` : `${(xKeV*1000).toFixed(0)} eV`;
    if (xKeV === 1000) lbl = "1 MeV";
    specCtx.fillText(lbl, x + 3, H2 - 6);
  }

  // title
  specCtx.fillStyle = "rgba(180,190,210,0.65)";
  specCtx.fillText(`Z = ${current.z}  (Z_eff = Z)`, 8, 14);

  // ---- Bohr / de Broglie transitions ----
  const Z = current.z;
  const lines = [];
  const nMax = 7;
  for (let nf = 1; nf <= nMax - 1; nf++) {
    for (let ni = nf + 1; ni <= nMax; ni++) {
      const E_eV = RY * Z * Z * (1/(nf*nf) - 1/(ni*ni));
      const E_keV = E_eV / 1000;
      // intensity rough ~ 1/(ni - nf) for display
      const w = 1 / (ni - nf);
      lines.push({ E_keV, w, nf, ni });
    }
  }

  // draw Bohr lines, colour = photon energy
  const baseY = H2 - 20;
  const topY = 30;
  const maxW = Math.max(...lines.map(l => l.w));
  for (const l of lines) {
    const x = xAxis(l.E_keV, W);
    const h = (l.w / maxW) * (baseY - topY) * 0.9;
    const a = 0.55 + 0.45 * (l.w / maxW);
    specCtx.strokeStyle = energyColor(l.E_keV, a);
    specCtx.lineWidth = 1.6;
    specCtx.beginPath();
    specCtx.moveTo(x, baseY);
    specCtx.lineTo(x, baseY - h);
    specCtx.stroke();
    if (l.nf === 1 && l.ni <= 4) {
      specCtx.fillStyle = energyColor(l.E_keV, 0.9);
      specCtx.fillText(`${l.ni}→1`, x + 2, baseY - h - 2);
    }
  }

  // ---- gamma lines: coloured by energy, thicker, with marker dot ----
  if (current.gamma && current.gamma.length) {
    for (const g of current.gamma) {
      const x = xAxis(g, W);
      const col = energyColor(g, 1);
      specCtx.strokeStyle = col;
      specCtx.lineWidth = 2.6;
      specCtx.beginPath();
      specCtx.moveTo(x, baseY);
      specCtx.lineTo(x, topY);
      specCtx.stroke();
      // red-outlined marker dot at top to tag as nuclear γ
      specCtx.beginPath();
      specCtx.arc(x, topY - 4, 3.2, 0, 2 * Math.PI);
      specCtx.fillStyle = col;
      specCtx.fill();
      specCtx.strokeStyle = "#ff5a5f";
      specCtx.lineWidth = 1.2;
      specCtx.stroke();
      specCtx.fillStyle = "#ff8a8f";
      specCtx.fillText(`${g} keV`, x + 4, topY + 10);
    }
  }
}

// ---------- resize: ResizeObserver catches any layout change (window resize,
// font load, grid reflow, dev tools open, DPR change from moving between
// monitors, etc). Window 'resize' alone misses most of these.
const ro = new ResizeObserver(() => {
  orbCtx  = setupHiDPI(orbCv);
  specCtx = setupHiDPI(specCv);
  renderSpectrum();               // orbits redraw every frame anyway
});
ro.observe(orbCv);
ro.observe(specCv);

// DPR can change without a size change (zoom, monitor switch) — poll cheaply.
window.addEventListener("resize", () => {
  orbCtx  = setupHiDPI(orbCv);
  specCtx = setupHiDPI(specCv);
  renderSpectrum();
});
// Font loading can trigger canvas text reflow; redraw once fonts settle.
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => {
    orbCtx  = setupHiDPI(orbCv);
    specCtx = setupHiDPI(specCv);
    renderSpectrum();
  });
}

// ---------- init ----------
select(current.z);
