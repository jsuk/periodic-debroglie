// ---------- physical constants (SI) ----------
const H   = 6.62607015e-34;     // Planck
const HBAR = H / (2 * Math.PI);
const ME  = 9.1093837015e-31;   // electron mass
const EV  = 1.602176634e-19;    // 1 eV in J
const A0  = 5.29177210903e-11;  // Bohr radius (m)
const RY  = 13.605693122994;    // Rydberg in eV
const G    = 6.67430e-11;       // Newton constant
const CLIGHT = 2.99792458e8;    // c
const U_KG = 1.66053906660e-27; // atomic mass unit
const MEV_U = 931.49410242;     // MeV per u  (E = mc² in nuclear units)
const KE   = 8.9875517923e9;    // Coulomb constant
const QE   = 1.602176634e-19;   // elementary charge
const L_PLANCK = 1.616255e-35;  // Planck length
const ALPHA = 7.2973525693e-3;  // fine-structure constant
const ME_C2_KEV = 510.99895;    // electron rest energy, keV

// Honour the OS "reduce motion" setting: draw one still frame instead of
// running the orbit / decay animations.
const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- build periodic table ----------
const tableEl = document.getElementById("table");

tableEl.setAttribute("role", "listbox");
tableEl.setAttribute("aria-label", "Periodic table — arrow keys move between elements");

function cellNode(el) {
  const d = document.createElement("div");
  d.className = `cell ${el.block}${el.radio ? " radio" : ""}`;
  d.style.gridRow = el.row;
  d.style.gridColumn = el.col;
  d.dataset.z = el.z;
  // Roving tabindex: one Tab stop for the whole table (the selected cell), then
  // the arrow keys drive.  118 sequential tab stops would be unusable.
  d.setAttribute("role", "option");
  d.setAttribute("tabindex", "-1");
  d.setAttribute("aria-selected", "false");
  d.setAttribute("aria-label",
    `${el.nm}, atomic number ${el.z}${el.radio ? ", radioactive" : ""}`);
  d.innerHTML =
    `<div class="z">${el.z}</div>` +
    `<div class="sy">${el.sy}</div>` +
    `<div class="nm">${el.nm}</div>`;
  d.addEventListener("click", () => select(el.z, true));
  d.addEventListener("keydown", e => onCellKey(e, el));
  return d;
}

Object.values(BY_Z).forEach(el => tableEl.appendChild(cellNode(el)));

// ---------- keyboard navigation ----------
// The table is a sparse 18×9 grid, so "move right" means "next occupied cell
// along this row", not "column + 1" — otherwise Be→B would stop in the gap.
const GRID = {};
Object.values(BY_Z).forEach(el => { GRID[`${el.row},${el.col}`] = el.z; });
const Z_ORDER = Object.keys(BY_Z).map(Number).sort((a, b) => a - b);

function scan(row, col, dr, dc) {
  let r = row + dr, c = col + dc;
  while (r >= 1 && r <= 9 && c >= 1 && c <= 18) {
    if (GRID[`${r},${c}`]) return GRID[`${r},${c}`];
    r += dr; c += dc;
  }
  return null;
}

// first / last occupied cell of a row
function rowEnd(row, fromRight) {
  for (let i = 0; i < 18; i++) {
    const c = fromRight ? 18 - i : 1 + i;
    if (GRID[`${row},${c}`]) return GRID[`${row},${c}`];
  }
  return null;
}

// Keep the cell inside the table's own horizontal scroller without ever
// scrolling the page — the whole point is that you can drive the table while
// reading the panels far below it.
function keepInScroller(cell) {
  const sc = document.getElementById("table-scroll");
  if (!sc) return;
  const c = cell.getBoundingClientRect(), s = sc.getBoundingClientRect();
  if (c.left < s.left)        sc.scrollLeft -= (s.left - c.left) + 8;
  else if (c.right > s.right) sc.scrollLeft += (c.right - s.right) + 8;
}

function goTo(z) {
  if (z == null) return;
  select(z);
  const cell = document.querySelector(`.cell[data-z="${z}"]`);
  if (!cell) return;
  cell.focus({ preventScroll: true });   // never drag the viewport back up
  keepInScroller(cell);
}

function onCellKey(e, el) {
  const { row, col, z } = el;
  const step = Z_ORDER.indexOf(z);
  let target;

  switch (e.key) {
    case "ArrowRight": target = scan(row, col, 0,  1); break;
    case "ArrowLeft":  target = scan(row, col, 0, -1); break;
    case "ArrowDown":  target = scan(row, col, 1,  0); break;
    case "ArrowUp":    target = scan(row, col, -1, 0); break;
    // by atomic number, which is not the same as by position
    case "PageDown":   target = Z_ORDER[Math.min(Z_ORDER.length - 1, step + 1)]; break;
    case "PageUp":     target = Z_ORDER[Math.max(0, step - 1)]; break;
    case "Home":       target = e.ctrlKey ? Z_ORDER[0] : rowEnd(row, false); break;
    case "End":        target = e.ctrlKey ? Z_ORDER[Z_ORDER.length - 1] : rowEnd(row, true); break;
    case "Enter":
    case " ":          e.preventDefault(); select(z, true); return;
    default: return;
  }
  e.preventDefault();          // stop the page scrolling under the arrow keys
  goTo(target);
}

// Global navigation: the arrows steer the table from anywhere on the page, so
// you can sit on the decay panel and change element without scrolling back up.
// PageUp/PageDown/Home/End are deliberately NOT hijacked globally — they still
// scroll the page while you read; use [ and ] to step by atomic number instead.
document.addEventListener("keydown", e => {
  if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
  const t = e.target;
  if (t.closest && t.closest(".cell")) return;      // the cell handler owns those
  // the orbit slider needs its own arrow keys
  if (t.matches && t.matches("input, textarea, select, button, [contenteditable]")) return;

  const { row, col, z } = current;
  const step = Z_ORDER.indexOf(z);
  let target;
  switch (e.key) {
    case "ArrowRight": target = scan(row, col, 0,  1); break;
    case "ArrowLeft":  target = scan(row, col, 0, -1); break;
    case "ArrowDown":  target = scan(row, col, 1,  0); break;
    case "ArrowUp":    target = scan(row, col, -1, 0); break;
    case "]":          target = Z_ORDER[Math.min(Z_ORDER.length - 1, step + 1)]; break;
    case "[":          target = Z_ORDER[Math.max(0, step - 1)]; break;
    default: return;
  }
  e.preventDefault();
  goTo(target);
});

MARKERS.forEach(m => {
  const d = document.createElement("div");
  d.className = "label";
  d.style.gridRow = m.row;
  d.style.gridColumn = m.col;
  d.textContent = m.label;
  tableEl.appendChild(d);
});

// ---------- floating element stepper ----------
// Visible only while the table itself is off-screen.
const elNav = document.getElementById("el-nav");
const elNavLabel = document.getElementById("el-nav-label");

document.getElementById("el-prev").addEventListener("click", () => stepZ(-1));
document.getElementById("el-next").addEventListener("click", () => stepZ(+1));

function stepZ(d) {
  const i = Z_ORDER.indexOf(current.z) + d;
  if (i >= 0 && i < Z_ORDER.length) goTo(Z_ORDER[i]);
}

new IntersectionObserver(
  ([entry]) => { elNav.hidden = entry.isIntersecting; },
  { threshold: 0 }
).observe(document.getElementById("table-wrap"));

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

// On a phone the table fills the screen, so a tap must carry the reader down to
// the panels it just changed; on a laptop everything is already in view.
const isNarrow = () => window.matchMedia("(max-width: 760px)").matches;

function select(z, fromUser = false) {
  current = BY_Z[z];
  document.querySelectorAll(".cell.sel").forEach(c => {
    c.classList.remove("sel");
    c.setAttribute("aria-selected", "false");
    c.setAttribute("tabindex", "-1");
  });
  const cell = document.querySelector(`.cell[data-z="${z}"]`);
  if (cell) {
    cell.classList.add("sel");
    cell.setAttribute("aria-selected", "true");
    cell.setAttribute("tabindex", "0");   // the table's single tab stop
  }
  if (fromUser && isNarrow()) {
    document.getElementById("detail").scrollIntoView({
      behavior: REDUCED_MOTION ? "auto" : "smooth", block: "start",
    });
  }

  // auto-adjust orbit count to the element's outermost occupied shell
  const n = outerShell(current.z);
  nSlider.value = n;
  nVal.textContent = n;

  renderInfo();
  renderOrbits();
  renderSpectrum();
  renderDecay();          // needed when the animation loop is off
  renderDecayInfo();
  renderStandardModel();
  renderRelativity();     // static per element — not in the animation loop
  renderRelativityInfo();
  renderGeometry();
  renderGeometryInfo();
}

// dominant decay branch of the element's representative isotope
function mainMode() {
  const d = DECAY[current.z];
  if (!d) return null;
  return d.modes.reduce((a, b) => (b.br > a.br ? b : a));
}

function renderInfo() {
  document.getElementById("el-name").textContent =
    `${current.sy} — ${current.nm} (Z=${current.z})`;
  elNavLabel.innerHTML =
    `<b>${current.sy}</b> ${current.nm} <span class="muted">${current.z}</span>`;
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
    <p class="caveat">These are <em>non-relativistic</em> numbers: at v₁ = ${(v1/3e8).toFixed(3)} c
       the Lorentz factor is γ₁ = ${gamma1(Z).toFixed(3)}, so the real λ₁ = h/(γmv) is
       ${((1 - 1 / gamma1(Z)) * 100).toFixed(1)} % shorter than shown. See the
       relativity panel.</p>
    ${current.radio
      ? `<p><strong style="color:#ff8a8f">Radioactive.</strong>
         Red lines show characteristic nuclear γ emissions of a common isotope
         (${current.gamma.length ? current.gamma.join(", ") + " keV" : "no well-measured γ lines in our table"}).</p>`
      : ""}
    ${originBlock()}
  `;
}

// where this element's nuclei were forged
function originBlock() {
  const o = originOf(current.z);
  return `<div class="origin">
      <h4>Nucleosynthesis <span class="tag">${o.tag}</span></h4>
      <p>${o.text}</p>
    </div>`;
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

    // orbit label — skipped once neighbouring orbits are closer than the text
    const gap = (2 * n + 1) * scale;
    if (gap > 16 || n === nMax) {
      orbCtx.fillStyle = "rgba(200,210,230,0.55)";
      orbCtx.font = `${Math.max(10, Math.min(13, W / 40)).toFixed(1)}px ${FONT}`;
      orbCtx.textBaseline = "alphabetic";
      orbCtx.fillText(`n=${n}`, Math.min(cx + r + 6, W - 36), cy + 3);
    }
  }
}

// smooth animation while orbits are visible
function animate() {
  renderOrbits();
  renderDecay();     // decay diagrams animate too (wave phase, tunnelling, scission)
  renderGeometry();  // the test mass falls along its geodesic
  if (!REDUCED_MOTION) requestAnimationFrame(animate);
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
  // labels are ~50 px wide: on a narrow canvas only every other decade fits
  const px = Math.max(9, Math.min(12, W / 44));
  const skip = W / 7 < 56 ? 2 : 1;
  specCtx.font = `${px.toFixed(1)}px ${FONT}`;
  specCtx.textBaseline = "alphabetic";
  specCtx.lineWidth = 1;
  for (let e = -3; e <= 3; e++) {
    const xKeV = Math.pow(10, e);
    const x = xAxis(xKeV, W);
    specCtx.beginPath();
    specCtx.moveTo(x, 20);
    specCtx.lineTo(x, H2 - 20);
    specCtx.stroke();
    if ((e + 3) % skip) continue;
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
    let gi = 0;
    for (const g of current.gamma) {
      const x = xAxis(g, W);
      // stagger labels — γ lines of one nuclide often sit within a few pixels
      const lblY = topY + 10 + (gi++ % 3) * 13;
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
      specCtx.fillText(`${g} keV`, x + 4, lblY);
    }
  }
}

// ---------- nuclear decay panel ----------
const decCv = document.getElementById("decay");
let   decCtx = setupHiDPI(decCv);

const C_QUARK = "#ffcf55";
const C_WEAK  = "#c58bff";
const C_LEPT  = "#6ea0ff";
const C_NU    = "#5ddfb0";
const C_EM    = "#aac8ff";
const C_NUC   = "#ff5a5f";

// ---- primitive Feynman strokes (all coordinates in CSS pixels) ----

function fLine(ctx, x1, y1, x2, y2, col, arrow = 1) {
  ctx.strokeStyle = col;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  if (!arrow) return;
  // arrowhead at the midpoint, pointing along (or against) the line
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const a = Math.atan2(y2 - y1, x2 - x1) + (arrow < 0 ? Math.PI : 0);
  ctx.beginPath();
  ctx.moveTo(mx + 6 * Math.cos(a), my + 6 * Math.sin(a));
  ctx.lineTo(mx - 4 * Math.cos(a) + 3.5 * Math.cos(a + Math.PI / 2),
             my - 4 * Math.sin(a) + 3.5 * Math.sin(a + Math.PI / 2));
  ctx.lineTo(mx - 4 * Math.cos(a) - 3.5 * Math.cos(a + Math.PI / 2),
             my - 4 * Math.sin(a) - 3.5 * Math.sin(a + Math.PI / 2));
  ctx.closePath();
  ctx.fillStyle = col;
  ctx.fill();
}

// sine ripple between two points — boson propagator / radiated photon
function wave(ctx, x1, y1, x2, y2, col, amp = 5, waves = 6, phase = 0, lw = 1.8) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const ux = dx / len, uy = dy / len;
  const nx = -uy, ny = ux;
  ctx.strokeStyle = col;
  ctx.lineWidth = lw;
  ctx.beginPath();
  const steps = 90;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const s = Math.sin(t * waves * 2 * Math.PI + phase) * amp * Math.sin(Math.PI * t) * 1.15;
    const x = x1 + ux * len * t + nx * s;
    const y = y1 + uy * len * t + ny * s;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

const FONT = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Arial, sans-serif';

// Canvas text does not reflow, so size it from the canvas width — on a phone
// the same diagram is a third as wide as on a laptop.
function tag(ctx, x, y, text, col, align = "left") {
  const px = Math.max(9, Math.min(13, ctx.canvas._W / 46));
  ctx.fillStyle = col;
  ctx.font = `${px.toFixed(1)}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
  ctx.textAlign = "left";
}

// Long captions do not fit a narrow canvas — swap in the terse wording.
const fit = (W, long, short) => (W < 560 ? short : long);

function blob(ctx, x, y, rx, ry, col, label) {
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, 2 * Math.PI);
  ctx.strokeStyle = col;
  ctx.setLineDash([4, 4]);
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
  if (label) tag(ctx, x, y + ry + 13, label, col, "center");
}

function clearDecay(ctx, W, H) {
  ctx.clearRect(0, 0, W, H);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#0a0e16");
  g.addColorStop(1, "#05070c");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

// ---- one diagram per decay mode ----

// β∓ and electron capture share the charged-current vertex topology.
function drawBeta(ctx, W, H, kind, t) {
  // The flavour-changing quark is drawn on the TOP line so the W propagator
  // never has to cross a spectator.
  const ys = [0.56 * H, 0.70 * H, 0.83 * H];
  // leave more room for the outgoing labels when the canvas is phone-sized
  const x0 = 0.13 * W, x1 = (W < 560 ? 0.86 : 0.90) * W;
  const vx = 0.40 * W, vy = ys[0];          // quark–W vertex
  const bx = 0.64 * W, by = 0.24 * H;       // W → lepton pair vertex

  const minus = kind === "b-";
  const inQ  = minus ? ["d", "u", "d"] : ["u", "u", "d"];
  const outQ = minus ? ["u", "u", "d"] : ["d", "u", "d"];
  const inN  = minus ? "n  (udd)" : "p  (uud)";
  const outN = minus ? "p  (uud)" : "n  (udd)";

  blob(ctx, (x0 + vx) / 2 - 6, ys[1], (vx - x0) / 2, 0.20 * H, "rgba(255,90,95,0.55)", inN);
  blob(ctx, (vx + x1) / 2 + 6, ys[1], (x1 - vx) / 2, 0.20 * H, "rgba(93,223,176,0.5)", outN);

  for (let i = 1; i < 3; i++) {              // spectator quarks run straight through
    fLine(ctx, x0, ys[i], x1, ys[i], C_QUARK, 1);
    tag(ctx, x0 - 6, ys[i], inQ[i], C_QUARK, "right");
    tag(ctx, x1 + 6, ys[i], outQ[i], C_QUARK, "left");
  }
  // the flavour-changing leg: in, vertex, out
  fLine(ctx, x0, vy, vx, vy, C_QUARK, 1);
  fLine(ctx, vx, vy, x1, vy, C_QUARK, 1);
  tag(ctx, x0 - 6, vy, inQ[0], C_QUARK, "right");
  tag(ctx, x1 + 6, vy, outQ[0], C_QUARK, "left");
  for (const [px, py] of [[vx, vy], [bx, by]]) {
    ctx.beginPath();
    ctx.arc(px, py, 3.2, 0, 2 * Math.PI);
    ctx.fillStyle = C_WEAK;
    ctx.fill();
  }

  // W propagator
  wave(ctx, vx, vy, bx, by, C_WEAK, 5, 5, t * 4, 2.2);
  tag(ctx, (vx + bx) / 2 - 16, (vy + by) / 2, kind === "b-" ? "W⁻" : "W⁺", C_WEAK, "right");

  if (kind === "ec") {
    // captured K-shell electron flows *into* the vertex
    fLine(ctx, x1, 0.08 * H, bx, by, C_LEPT, -1);
    tag(ctx, x1 + 6, 0.08 * H, "e⁻", C_LEPT);
    tag(ctx, x1 + 6, 0.08 * H + 14, fit(W, "(K shell)", "(K)"), C_LEPT);
    fLine(ctx, bx, by, x1, 0.40 * H, C_NU, 1);
    tag(ctx, x1 + 6, 0.40 * H, "νₑ", C_NU);
  } else {
    fLine(ctx, bx, by, x1, 0.08 * H, C_LEPT, 1);
    tag(ctx, x1 + 6, 0.08 * H, minus ? "e⁻" : "e⁺", C_LEPT);
    fLine(ctx, bx, by, x1, 0.40 * H, C_NU, minus ? -1 : 1);
    tag(ctx, x1 + 6, 0.40 * H, minus ? "ν̄ₑ" : "νₑ", C_NU);
  }

  tag(ctx, 10, 0.08 * H, "time →", "rgba(180,190,210,0.45)");
}

// α decay as a Gamow tunnelling picture: V(r), the Q line, and |ψ|.
function drawAlpha(ctx, W, H, t) {
  const L = 0.10 * W, R = 0.95 * W;
  const y0 = 0.72 * H;                    // V = 0 axis
  const rN = L + 0.16 * (R - L);          // nuclear radius
  const Vtop = 0.16 * H;                  // barrier peak height (px above axis)
  const wellD = 0.20 * H;                 // well depth (px below axis)
  const Q = 0.55 * Vtop;                  // Q-value line, below the barrier top

  // axes
  ctx.strokeStyle = "rgba(200,210,230,0.20)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(L, y0); ctx.lineTo(R, y0);
  ctx.moveTo(L, 0.10 * H); ctx.lineTo(L, y0 + wellD + 8);
  ctx.stroke();
  tag(ctx, R, y0 + 16, "r →", "rgba(180,190,210,0.5)", "right");
  tag(ctx, L + 4, 0.12 * H, "V(r)", "rgba(180,190,210,0.5)");

  // potential: square well inside, Coulomb 1/r outside
  const V = r => (r <= rN ? y0 + wellD : y0 - Vtop * (rN / r));
  ctx.strokeStyle = C_NUC;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(L, y0 + wellD);
  ctx.lineTo(rN, y0 + wellD);
  ctx.lineTo(rN, y0 - Vtop);
  for (let x = rN; x <= R; x += 2) ctx.lineTo(x, V(x));
  ctx.stroke();

  // Q line and the classical turning point
  const yQ = y0 - Q;
  const rOut = rN * (Vtop / Q);
  ctx.strokeStyle = "rgba(255,207,85,0.8)";
  ctx.setLineDash([5, 4]);
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(L, yQ); ctx.lineTo(Math.min(R, rOut + 0.16 * W), yQ);
  ctx.stroke();
  ctx.setLineDash([]);
  tag(ctx, L + 6, yQ - 0.115 * H, fit(W, "Q (α kinetic energy)", "Q"), "#ffcf55");

  // Wavefunction: oscillate in the well, decay exponentially under the barrier,
  // oscillate again outside.  The true transmitted amplitude is ~e^(-2G) — for
  // ²³⁸U that is ~10⁻¹⁹ — so the outgoing lobe is drawn hugely exaggerated.
  const A = 0.085 * H;
  ctx.strokeStyle = "#6ea0ff";
  ctx.lineWidth = 1.7;
  ctx.beginPath();
  for (let x = L; x <= R; x += 1.5) {
    let y;
    if (x <= rN) {                              // bound, many nodes
      y = yQ + Math.sin(0.16 * (x - L) - t * 3) * A;
    } else if (x <= rOut) {                     // classically forbidden — no nodes
      y = yQ + A * Math.exp(-(x - rN) * 0.030);
    } else {                                    // free α, ramped in for continuity
      const ramp = Math.min(1, (x - rOut) / 45);
      y = yQ + Math.sin(0.055 * (x - rOut) - t * 3) * A * 0.42 * ramp;
    }
    if (x === L) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  tag(ctx, (rN + Math.min(R, rOut)) / 2, yQ - 0.09 * H, "ψ ~ e⁻ᴳ", "#6ea0ff", "center");
  tag(ctx, Math.min(R - 6, rOut + 0.18 * W), yQ - 0.07 * H,
      fit(W, "outgoing α — amplitude exaggerated", "outgoing α (exaggerated)"),
      "rgba(110,160,255,0.75)", "center");

  // barrier shading
  ctx.fillStyle = "rgba(255,90,95,0.07)";
  ctx.fillRect(rN, 0.10 * H, Math.max(0, Math.min(R, rOut) - rN), y0 - 0.10 * H);
  tag(ctx, (rN + Math.min(R, rOut)) / 2, 0.17 * H,
      fit(W, "Coulomb barrier — tunnelled, not climbed", "barrier: tunnelled"),
      "rgba(255,138,143,0.85)", "center");

  // the escaping α cluster
  const ax = Math.min(R - 26, rOut + 0.10 * W + 14 * Math.sin(t * 1.5));
  const cluster = [[-7,-6,C_NUC],[7,-6,"#6ea0ff"],[-7,6,"#6ea0ff"],[7,6,C_NUC]];
  for (const [dx, dy, c] of cluster) {
    ctx.beginPath();
    ctx.arc(ax + dx, yQ + 0.13 * H + dy, 5, 0, 2 * Math.PI);
    ctx.fillStyle = c;
    ctx.fill();
  }
  tag(ctx, ax, yQ + 0.13 * H + 24, "⁴He²⁺  (2p + 2n)", "#cdd4e0", "center");

  // the residual nucleus
  ctx.beginPath();
  ctx.arc(L + (rN - L) / 2, y0 + wellD - 0.02 * H, 12, 0, 2 * Math.PI);
  ctx.fillStyle = "rgba(255,90,95,0.85)";
  ctx.shadowBlur = 14; ctx.shadowColor = C_NUC;
  ctx.fill();
  ctx.shadowBlur = 0;
}

// isomeric transition: a nuclear level diagram, not an atomic one
function drawGamma(ctx, W, H, t) {
  const xL = 0.14 * W, xR = 0.56 * W;
  const yHi = 0.30 * H, yLo = 0.72 * H;

  ctx.strokeStyle = "#ffcf55";
  ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.moveTo(xL, yHi); ctx.lineTo(xR, yHi); ctx.stroke();
  ctx.strokeStyle = "#5ddfb0";
  ctx.beginPath(); ctx.moveTo(xL, yLo); ctx.lineTo(xR, yLo); ctx.stroke();

  tag(ctx, xL - 8, yHi, fit(W, "isomer (excited)", "isomer"), "#ffcf55", "right");
  tag(ctx, xL - 8, yLo, fit(W, "ground state", "ground"), "#5ddfb0", "right");

  // transition arrow
  const xa = (xL + xR) / 2;
  fLine(ctx, xa, yHi, xa, yLo, "rgba(200,210,230,0.55)", 1);

  // emitted photon
  wave(ctx, xR + 6, (yHi + yLo) / 2, 0.94 * W, 0.34 * H, C_EM, 6, 8, t * 5, 2);
  tag(ctx, 0.80 * W, 0.24 * H, "γ", C_EM, "center");
  tag(ctx, 0.72 * W, 0.62 * H,
      fit(W, "no nucleon changes flavour —", "no flavour change —"),
      "rgba(180,190,210,0.7)", "center");
  tag(ctx, 0.72 * W, 0.62 * H + 16,
      fit(W, "pure electromagnetic de-excitation", "pure EM de-excitation"),
      "rgba(180,190,210,0.7)", "center");
}

// spontaneous fission: strong force loses to Coulomb repulsion
function drawFission(ctx, W, H, t) {
  const y = 0.46 * H;
  const s = (Math.sin(t * 1.1) + 1) / 2;          // 0..1 deformation cycle
  const R0 = Math.min(40, 0.13 * H);
  const stages = [
    { x: 0.17 * W, sep: 0,          neck: 0,
      lbl: fit(W, "compound nucleus", "compound") },
    { x: 0.48 * W, sep: 0.55 * R0,  neck: 1,
      lbl: fit(W, "saddle point — necking in", "saddle point") },
    { x: 0.82 * W, sep: 1.7 * R0,   neck: 0,
      lbl: fit(W, "scission → 2 fragments", "scission") },
  ];

  for (const st of stages) {
    const sep = st.sep * (0.55 + 0.45 * s);
    const r = R0 * (1 - 0.30 * (sep / (1.7 * R0)));
    if (sep < 1) {                                 // still one sphere
      ctx.beginPath();
      ctx.arc(st.x, y, R0, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(255,90,95,0.9)";
      ctx.shadowBlur = 20; ctx.shadowColor = C_NUC;
      ctx.fill();
      ctx.shadowBlur = 0;
    } else {
      if (st.neck) {                               // fat neck joining the lobes
        ctx.beginPath();
        ctx.moveTo(st.x - sep, y - r * 0.75);
        ctx.quadraticCurveTo(st.x, y - r * 0.35, st.x + sep, y - r * 0.75);
        ctx.lineTo(st.x + sep, y + r * 0.75);
        ctx.quadraticCurveTo(st.x, y + r * 0.35, st.x - sep, y + r * 0.75);
        ctx.closePath();
        ctx.fillStyle = "rgba(255,110,90,0.9)";
        ctx.fill();
      }
      for (const sgn of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(st.x + sgn * sep, y, r, 0, 2 * Math.PI);
        ctx.fillStyle = sgn < 0 ? "rgba(255,90,95,0.9)" : "rgba(255,150,80,0.9)";
        ctx.shadowBlur = 18; ctx.shadowColor = sgn < 0 ? C_NUC : "#ff9650";
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
    tag(ctx, st.x, y + R0 + 26, st.lbl, "rgba(180,190,210,0.8)", "center");
  }

  // arrows between stages
  for (const [a, b] of [[0, 1], [1, 2]]) {
    const xa = stages[a].x + R0 + 34, xb = stages[b].x - R0 - 34;
    ctx.strokeStyle = "rgba(200,210,230,0.28)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(xa, y); ctx.lineTo(xb, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(xb, y); ctx.lineTo(xb - 7, y - 4); ctx.lineTo(xb - 7, y + 4);
    ctx.closePath();
    ctx.fillStyle = "rgba(200,210,230,0.28)";
    ctx.fill();
  }

  // prompt neutrons flying off the scission point
  const nx0 = stages[2].x;
  for (let i = 0; i < 5; i++) {
    const a = -1.9 + i * 0.75;
    const d = R0 * 1.6 + 46 * s;
    ctx.beginPath();
    ctx.arc(nx0 + Math.cos(a) * d, y + Math.sin(a) * d, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "#6ea0ff";
    ctx.shadowBlur = 10; ctx.shadowColor = "#6ea0ff";
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  tag(ctx, nx0, y - R0 - 62, fit(W, "prompt neutrons", "neutrons"), "#6ea0ff", "center");
  tag(ctx, 0.5 * W, H - 16,
      fit(W, "≈200 MeV released as fragment kinetic energy; the neutron-rich fragments then β⁻ decay",
             "≈200 MeV; fragments then β⁻ decay"),
      "rgba(180,190,210,0.65)", "center");
}

// stable elements get the synthesis picture instead of a decay picture
function drawStable(ctx, W, H, t) {
  const cx = W / 2, cy = 0.46 * H;
  const s = (Math.sin(t * 1.2) + 1) / 2;

  // two light nuclei fusing into one
  const sep = 62 * (1 - s) + 20;
  for (const sgn of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(cx + sgn * sep, cy, 16, 0, 2 * Math.PI);
    ctx.fillStyle = sgn < 0 ? "#ffcf55" : "#ff8a50";
    ctx.shadowBlur = 18; ctx.shadowColor = sgn < 0 ? "#ffcf55" : "#ff8a50";
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  if (s > 0.75) {
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * 2 * Math.PI;
      wave(ctx, cx, cy, cx + Math.cos(a) * 70 * (s - 0.75) * 4,
           cy + Math.sin(a) * 70 * (s - 0.75) * 4, C_EM, 3, 4, t * 6, 1.2);
    }
  }
  tag(ctx, cx, cy - 44, fit(W, "fusion / neutron capture", "fusion / n-capture"),
      "#cdd4e0", "center");
  tag(ctx, cx, 0.80 * H,
      fit(W, "This element has a stable isotope — it was built up, not broken down.",
             "Stable — built up, not broken down."),
      "rgba(180,190,210,0.7)", "center");
  tag(ctx, cx, 0.80 * H + 18, "Binding energy per nucleon peaks at ⁵⁶Fe.",
      "rgba(180,190,210,0.55)", "center");
}

function renderDecay() {
  const W = decCv._W, H = decCv._H;
  const t = performance.now() / 1000;
  clearDecay(decCtx, W, H);
  const m = mainMode();
  if (!m) { drawStable(decCtx, W, H, t); return; }
  switch (m.mode) {
    case "a":  drawAlpha(decCtx, W, H, t); break;
    case "b-":
    case "b+":
    case "ec": drawBeta(decCtx, W, H, m.mode, t); break;
    case "it": drawGamma(decCtx, W, H, t); break;
    case "sf": drawFission(decCtx, W, H, t); break;
  }
}

// ---- decay text ----

// A(Z) → A'(Z') + emitted particles, in words
function decayEquation(d, m) {
  const emit = {
    "a":  "⁴He²⁺ (α)",
    "b-": "e⁻ + ν̄ₑ",
    "b+": "e⁺ + νₑ",
    "ec": "νₑ (+ X-rays)",
    "it": "γ",
    "sf": "prompt neutrons + γ",
  }[m.mode];
  const lhs = m.mode === "ec" ? `${d.iso} + e⁻` : d.iso;
  return `${lhs} → ${m.daughter} + ${emit}`;
}

function renderDecayInfo() {
  const host = document.getElementById("decay-info");
  const tagEl = document.getElementById("decay-mode-tag");
  const d = DECAY[current.z];

  if (!d) {
    tagEl.textContent = "";
    tagEl.className = "";
    host.innerHTML = `<p class="muted">No radioactive isotope tabulated for ${current.nm}.
      Its nuclei sit at or near the valley of β-stability, where the strong force
      binds protons and neutrons tightly enough that no decay channel is open.</p>`;
    return;
  }

  const m = mainMode();
  tagEl.textContent = MODE_NAME[m.mode];
  tagEl.className = `mode-tag mode-${m.mode}`;

  const branches = d.modes.map(x =>
    `<li><span class="mode-chip mode-${x.mode}">${MODE_NAME[x.mode]}</span>
       ${x.br < 0.01 ? x.br.toExponential(1) : x.br}% →
       <strong>${x.daughter}</strong>
       <span class="muted">Q = ${x.q} MeV</span></li>`).join("");

  const ph = MODE_PHYSICS[m.mode];
  host.innerHTML = `
    <div class="decay-head">
      <span class="iso">${d.iso}</span>
      <span class="muted">t½ = ${d.hl}</span>
    </div>
    ${current.radio ? "" : `<p class="muted small">Natural ${current.nm} is dominated by
      stable isotopes — this is its best-known radioisotope.</p>`}
    <code class="eq">${decayEquation(d, m)}</code>
    <ul class="branches">${branches}</ul>
    <p class="quark"><span class="muted">quark level:</span> ${ph.quark}</p>
    <p class="muted small"><strong>Synthesis:</strong> ${d.made}</p>
  `;
}

// ---------- Standard Model panel ----------
const smGrid = document.getElementById("sm-grid");
const smNote = document.getElementById("sm-note");

const SM_ROW = {
  u:1, c:1, t:1, d:2, s:2, b:2,
  e:3, mu:3, tau:3, nue:4, numu:4, nutau:4,
  g:1, gamma:2, Z:3, W:4, H:1,
};

const CLASS_NAME = { q:"quark", l:"lepton", b:"gauge boson", h:"scalar boson" };

PARTICLES.forEach(([id, sym, name, cls, col, charge, mass]) => {
  const d = document.createElement("div");
  d.className = `particle p-${cls}`;
  d.dataset.pid = id;
  d.style.gridColumn = col;
  d.style.gridRow = id === "H" ? "1 / span 4" : SM_ROW[id];
  d.innerHTML =
    `<div class="p-mass">${mass}</div>` +
    `<div class="p-sym">${sym}</div>` +
    `<div class="p-name">${name}</div>` +
    `<div class="p-charge">q = ${charge}</div>`;
  d.title = `${name} — ${CLASS_NAME[cls]}, charge ${charge}, mass ${mass}`;
  smGrid.appendChild(d);
});

["I", "II", "III", "forces", ""].forEach((label, i) => {
  if (!label) return;
  const h = document.createElement("div");
  h.className = "sm-head";
  h.style.gridColumn = i + 1;
  h.style.gridRow = 5;
  h.textContent = label;
  smGrid.appendChild(h);
});

function renderStandardModel() {
  const m = mainMode();
  const ph = m ? MODE_PHYSICS[m.mode] : { parts: ["u", "d", "g", "gamma"],
    force: "strong (binding only)",
    quark: "nothing decays — the nucleus is bound below every open channel" };
  const active = new Set(ph.parts);

  smGrid.querySelectorAll(".particle").forEach(p => {
    p.classList.toggle("on", active.has(p.dataset.pid));
  });

  const label = m ? MODE_NAME[m.mode] : "stability";
  smNote.innerHTML = `
    <p><strong>${label}</strong> lights up the particles above.
       Mediating interaction: <em>${ph.force}</em>.</p>
    <p class="muted small">
      Every nucleus in this table is made of just two of the seventeen particles —
      up and down quarks, bound by gluons into protons (uud) and neutrons (udd),
      with electrons and electron-neutrinos joining in whenever the weak force
      converts one into the other. The other twelve particles are too heavy or
      too weakly coupled to appear at nuclear energies; they show up only in
      accelerators and cosmic rays.</p>
    <p class="muted small">Three of the four interactions are in this table.
      The fourth — gravity — has no card, because Einstein stopped treating it
      as an exchanged particle at all. See below.</p>
  `;
}

// ---------- special relativity ----------
// This app's own Bohr numbers force the issue: v₁ = Zαc, so uranium's innermost
// electron runs at 0.67 c and the non-relativistic λ = h/mv above is wrong by γ.
const relCv = document.getElementById("rel");
let   relCtx = setupHiDPI(relCv);

const beta1  = Z => Z * ALPHA;                       // v₁/c for a 1s electron
const gamma1 = Z => 1 / Math.sqrt(1 - Math.min(0.99, beta1(Z) ** 2));

// Where relativity stops being a rounding error and starts doing chemistry.
function relativisticNote(Z) {
  if (Z >= 104) return `At Z = ${Z} the 1s electron is past 0.75 c. Chemistry
    here is predicted relativistically or not at all — Fl and Og are expected to
    behave less like a metal and a noble gas than their columns suggest.`;
  if (Z === 79) return `Gold is yellow because of this. The contracted 6s level
    drops toward 5d, pulling the 5d→6s absorption out of the UV into the blue —
    non-relativistically, gold would look like silver.`;
  if (Z === 80) return `Mercury is liquid because of this. The 6s pair is
    contracted and held so tightly that Hg atoms barely bond to each other.`;
  if (Z === 82) return `About 80 % of a lead-acid cell's 2.1 V is relativistic:
    the inert-pair effect on Pb's contracted 6s electrons.`;
  if (Z >= 55) return `Heavy-element chemistry needs this correction: contracted
    s and p½ shells, expanded d and f shells, and the inert-pair effect.`;
  if (Z >= 20) return `Still a small correction here — but the innermost
    electron's kinetic energy is already a measurable fraction of mc².`;
  return `Light element: β₁ ≪ 1, so the non-relativistic Bohr and de Broglie
    numbers in the first panel are good to a part in 10⁴ or better.`;
}

function drawRelativity(ctx, W, H) {
  const Z = current.z;
  const b = beta1(Z), g = gamma1(Z);

  ctx.clearRect(0, 0, W, H);
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#0a0e16");
  bg.addColorStop(1, "#05070c");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // ---- left: the Lorentz factor, with this element's 1s electron on it ----
  const L = 0.08 * W, R = 0.46 * W, B = 0.80 * H, T = 0.16 * H;
  const GMAX = 5;
  const gx = bb => L + bb * (R - L);
  const gy = gg => B - (Math.min(gg, GMAX) - 1) / (GMAX - 1) * (B - T);

  ctx.strokeStyle = "rgba(200,210,230,0.22)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
  ctx.stroke();
  // c is a wall, not a speed limit you creep past
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = "rgba(255,90,95,0.55)";
  ctx.beginPath();
  ctx.moveTo(R, T); ctx.lineTo(R, B);
  ctx.stroke();
  ctx.setLineDash([]);
  tag(ctx, R - 3, T - 8, "v = c", "rgba(255,138,143,0.9)", "right");
  tag(ctx, L, B + 14, "0", "rgba(180,190,210,0.5)", "center");
  tag(ctx, (L + R) / 2, B + 14, fit(W, "β = v / c", "β"), "rgba(180,190,210,0.6)", "center");
  tag(ctx, L - 4, gy(1), "γ=1", "rgba(180,190,210,0.5)", "right");

  ctx.strokeStyle = "#6ea0ff";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  for (let i = 0; i <= 200; i++) {
    const bb = (i / 200) * 0.995;
    const gg = 1 / Math.sqrt(1 - bb * bb);
    const y = gy(gg);
    if (i === 0) ctx.moveTo(gx(bb), y); else ctx.lineTo(gx(bb), y);
    if (gg > GMAX) break;
  }
  ctx.stroke();
  tag(ctx, L + 8, T + 4, "γ = 1/√(1−β²)", "#6ea0ff");

  // this element's electron
  ctx.setLineDash([3, 3]);
  ctx.strokeStyle = "rgba(255,207,85,0.45)";
  ctx.beginPath();
  ctx.moveTo(gx(b), B); ctx.lineTo(gx(b), gy(g));
  ctx.lineTo(L, gy(g));
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(gx(b), gy(g), 5, 0, 2 * Math.PI);
  ctx.fillStyle = "#ffcf55";
  ctx.shadowBlur = 12; ctx.shadowColor = "#ffcf55";
  ctx.fill();
  ctx.shadowBlur = 0;
  tag(ctx, gx(b) + 8, gy(g) - 10, `β₁ = ${b.toFixed(3)}`, "#ffcf55");
  tag(ctx, gx(b) + 8, gy(g) + 6, `γ₁ = ${g.toFixed(3)}`, "#ffcf55");
  tag(ctx, (L + R) / 2, H - 8,
      fit(W, "1s electron of this element (v₁ = Zαc)", "1s electron, v₁ = Zαc"),
      "rgba(180,190,210,0.6)", "center");

  // ---- right: E² = (pc)² + (mc²)², drawn to scale for that electron ----
  const pc = g * b * ME_C2_KEV;             // momentum term, keV
  const E  = g * ME_C2_KEV;                 // total energy, keV
  const perKeV = (0.34 * H) / ME_C2_KEV;    // mc² fixes the vertical scale
  const ox = 0.58 * W, oy = 0.74 * H;
  const tx = ox + pc * perKeV, ty = oy - ME_C2_KEV * perKeV;

  ctx.strokeStyle = "#5ddfb0";              // mc² leg — the rest energy
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(ox, oy); ctx.lineTo(ox, ty);
  ctx.stroke();
  ctx.strokeStyle = "#c58bff";              // pc leg — the motion
  ctx.beginPath();
  ctx.moveTo(ox, oy); ctx.lineTo(tx, oy);
  ctx.stroke();
  ctx.strokeStyle = "#ffcf55";              // E — the hypotenuse
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(ox, ty); ctx.lineTo(tx, oy);
  ctx.stroke();

  // right-angle mark
  ctx.strokeStyle = "rgba(200,210,230,0.35)";
  ctx.lineWidth = 1;
  ctx.strokeRect(ox, oy - 9, 9, 9);

  tag(ctx, ox - 6, (oy + ty) / 2, `mc² = ${ME_C2_KEV.toFixed(0)}`, "#5ddfb0", "right");
  tag(ctx, (ox + tx) / 2, oy + 15, `pc = ${pc.toFixed(0)} keV`, "#c58bff", "center");
  tag(ctx, (ox + tx) / 2 + 14, (oy + ty) / 2 - 12, `E = ${E.toFixed(0)} keV`, "#ffcf55");
  tag(ctx, 0.77 * W, T - 8, "E² = (pc)² + (mc²)²", "rgba(180,190,210,0.75)", "center");
  tag(ctx, 0.77 * W, H - 8,
      fit(W, `kinetic energy (γ−1)mc² = ${((g - 1) * ME_C2_KEV).toFixed(0)} keV`,
             `KE = ${((g - 1) * ME_C2_KEV).toFixed(0)} keV`),
      "rgba(180,190,210,0.6)", "center");
}

function renderRelativity() {
  drawRelativity(relCtx, relCv._W, relCv._H);
}

function renderRelativityInfo() {
  const Z = current.z;
  const b = beta1(Z), g = gamma1(Z);
  const A = Math.round(current.mass);
  const B = bindingMeV(Z, A);
  const m = mainMode();

  // λ = h/p with the relativistic momentum p = γmv — the first panel drops γ
  const v1 = b * CLIGHT;
  const lamNR = H / (ME * v1);
  const lamR  = lamNR / g;

  document.getElementById("rel-tag").className = "mode-tag " + (
    b > 0.5 ? "mode-sf" : b > 0.2 ? "mode-a" : "mode-it");
  document.getElementById("rel-tag").textContent =
    b > 0.5 ? "strongly relativistic" : b > 0.2 ? "relativistic" : "nearly Newtonian";

  const decayRow = m ? (() => {
    const dm_u  = m.q / MEV_U;                       // Q → mass, in u
    const dm_kg = dm_u * U_KG;
    return `<li><span class="muted">${MODE_NAME[m.mode]} Q-value</span>
              <strong>${m.q} MeV</strong>
              <span class="muted">= Δm of ${dm_u.toFixed(6)} u
              = ${sci(dm_kg)} kg</span></li>`;
  })() : "";

  document.getElementById("rel-info").innerHTML = `
    <p>Mass is not a separate substance from energy — it is energy at rest, and
       the conversion factor is fixed by the one speed everything agrees on:</p>
    <code class="eq">E = mc² · γ,&nbsp; γ = 1/√(1 − v²/c²)</code>
    <code class="eq">E² = (pc)² + (mc²)²</code>

    <p class="muted small">At v = 0 the second reduces to the first, and the
       first is why a nucleus can pay for a decay out of its own weight.</p>

    <ul class="branches geo-nums">
      <li><span class="muted">1s electron speed v₁ = Zαc</span>
          <strong>${b.toFixed(4)} c</strong></li>
      <li><span class="muted">Lorentz factor γ₁</span>
          <strong>${g.toFixed(4)}</strong>
          <span class="muted">— its energy and momentum are ${((g - 1) * 100).toFixed(1)} %
          above the Newtonian values; its wavelength and orbit shrink by
          1/γ, i.e. ${((1 - 1 / g) * 100).toFixed(1)} %</span></li>
      <li><span class="muted">its kinetic energy (γ−1)mc²</span>
          <strong>${((g - 1) * ME_C2_KEV).toFixed(1)} keV</strong>
          <span class="muted">of a ${ME_C2_KEV.toFixed(0)} keV rest energy</span></li>
      <li><span class="muted">de Broglie λ₁, corrected</span>
          <strong>${(lamR * 1e12).toFixed(2)} pm</strong>
          <span class="muted">— h/(γmv), not h/(mv) = ${(lamNR * 1e12).toFixed(2)} pm;
          the 1s orbit contracts by the same 1/γ, and that contraction is what
          reshapes heavy-element chemistry</span></li>
      <li><span class="muted">conversion factor</span>
          <strong>1 u = ${MEV_U.toFixed(3)} MeV</strong></li>
      ${B > 0 ? `<li><span class="muted">nuclear binding as mass</span>
          <strong>${(B / MEV_U).toFixed(3)} u</strong>
          <span class="muted">= ${sci(B / MEV_U * U_KG)} kg missing from
          ${A} nucleons</span></li>` : ""}
      ${decayRow}
    </ul>

    <p>${relativisticNote(Z)}</p>

    ${m && (m.mode === "b+") ? `<p class="muted small">This one advertises the
       equation directly: the emitted positron annihilates on the first electron
       it meets, and the two 511 keV photons that come out are m<sub>e</sub>c²
       each — mass read off a detector in units of energy.</p>` : ""}

    <p class="muted small">Special relativity fixed the speed of light and made
       mass a form of energy. General relativity, below, takes the next step:
       that same energy is what bends spacetime.
       ${Z > 100 ? `Note the limit hiding in v₁ = Zαc — a Bohr 1s electron would
       reach c at Z = 137, which is where the naive picture, not the atom, breaks
       down.` : ""}</p>
  `;
}

// ---------- gravity: the fourth interaction, as geometry ----------
// The other three forces on this page are particle exchange.  Gravity is not:
// Einstein replaced the force with the shape of spacetime, so this panel draws
// a geometry instead of a Feynman diagram.
const geoCv = document.getElementById("geo");
let   geoCtx = setupHiDPI(geoCv);

// 10⁻⁵² m is not drawable; say so rather than implying the dimple is to scale.
const SHEET_EXAGGERATION = "≈10⁴⁰×";

// Semi-empirical (Bethe–Weizsäcker) binding energy, MeV — the liquid-drop model
// whose surface-vs-Coulomb competition also drives the fission diagram above.
function bindingMeV(Z, A) {
  if (A < 2) return 0;
  const N = A - Z;
  const pair = (Z % 2 === 0 && N % 2 === 0) ?  12 / Math.sqrt(A)
             : (Z % 2 === 1 && N % 2 === 1) ? -12 / Math.sqrt(A) : 0;
  return 15.75 * A
       - 17.8 * Math.pow(A, 2 / 3)
       - 0.711 * Z * (Z - 1) / Math.cbrt(A)
       - 23.7 * (A - 2 * Z) ** 2 / A
       + pair;
}

// 5.87e-52 → "5.87 × 10⁻⁵² m"
const SUP = { "-": "⁻", 0:"⁰",1:"¹",2:"²",3:"³",4:"⁴",5:"⁵",6:"⁶",7:"⁷",8:"⁸",9:"⁹" };
function sci(v, digits = 2) {
  const [m, e] = v.toExponential(digits).split("e");
  const exp = String(+e).split("").map(c => SUP[c]).join("");
  return `${m} × 10${exp}`;
}

// ---- the embedding diagram ----

// Depth of the rubber sheet at world radius r (world units, dimple at origin).
// A localised funnel: 1 at the mass, falling off to a nearly flat sheet.
const SOFT = 0.26;
const dip = (x, y) => 1 / (1 + Math.pow(Math.hypot(x, y) / SOFT, 1.6));

// A test mass falling past the nucleus.  Integrated once, not per frame: the
// curve is the geodesic, the dashed line is what "no force" would look like in
// flat space.  Same initial conditions for both.
const GEODESIC = (() => {
  const path = [], p = { x: -1.25, y: -0.62 }, v = { x: 0.95, y: 0.26 };
  const k = 0.16, dt = 0.02;
  for (let i = 0; i < 260; i++) {
    const r2 = p.x * p.x + p.y * p.y + 0.02;
    const r = Math.sqrt(r2);
    v.x -= k * p.x / (r2 * r) * dt;
    v.y -= k * p.y / (r2 * r) * dt;
    p.x += v.x * dt;
    p.y += v.y * dt;
    path.push([p.x, p.y]);
  }
  return path;
})();

// The path starts and ends off the drawn sheet; these bracket the part that is
// actually on it, so the marker does not wander into empty canvas.
const [GEO_A, GEO_B] = (() => {
  const on = i => Math.abs(GEODESIC[i][0]) <= 1.0 && Math.abs(GEODESIC[i][1]) <= 1.0;
  const idx = GEODESIC.map((_, i) => i).filter(on);
  return idx.length ? [idx[0], idx[idx.length - 1]] : [0, GEODESIC.length - 1];
})();

function drawSpacetime(ctx, W, H, t) {
  const cx = W / 2, cy = H * 0.34;
  const ex = W * 0.46, ey = H * 0.30;   // half-extents: the sheet seen edge-on-ish
  const dz = H * 0.34;                  // how far the dimple sags on screen

  // world (x, y) → screen
  const px = (x) => cx + x * ex;
  const py = (x, y) => cy + y * ey + dz * dip(x, y);

  ctx.clearRect(0, 0, W, H);
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#080b13");
  bg.addColorStop(1, "#04060b");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // The mesh.  N is even so a line passes exactly through the mass, and the
  // constant-y lines are drawn far→near so the funnel's near lip lands on top.
  const N = 20, S = 110;
  ctx.lineWidth = 1;
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i <= N; i++) {
      const u = -1 + (2 * i) / N;
      ctx.beginPath();
      let deepest = 0;
      for (let j = 0; j <= S; j++) {
        const w = -1 + (2 * j) / S;
        const x = pass ? u : w, y = pass ? w : u;
        const d = dip(x, y);
        if (d > deepest) deepest = d;
        const X = px(x), Y = py(x, y);
        if (j === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
      }
      // brighter and warmer where spacetime is most curved
      const a = 0.13 + 0.62 * deepest;
      ctx.strokeStyle = `rgba(${110 + 130 * deepest | 0},${160 - 40 * deepest | 0},255,${a.toFixed(3)})`;
      ctx.stroke();
    }
  }

  // The flat-space path, drawn on an *undented* plane — that is the whole
  // comparison: same start, same direction, no curvature to follow.
  const pyFlat = (y) => cy + y * ey;
  const g0 = GEODESIC[0], g1 = GEODESIC[1];
  const vx = g1[0] - g0[0], vy = g1[1] - g0[1];
  const steps = Math.min(GEODESIC.length, Math.floor((1.02 - g0[0]) / vx));
  const fEnd = [g0[0] + vx * steps, g0[1] + vy * steps];
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = "rgba(180,190,210,0.45)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(px(g0[0]), pyFlat(g0[1]));
  ctx.lineTo(px(fEnd[0]), pyFlat(fEnd[1]));
  ctx.stroke();
  ctx.setLineDash([]);

  // the geodesic itself
  ctx.strokeStyle = "#5ddfb0";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= GEO_B; i++) {
    const [x, y] = GEODESIC[i];
    const X = px(x), Y = py(x, y);
    if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
  }
  ctx.stroke();

  // the nucleus, sitting at the bottom of its own dimple
  const nx = px(0), ny = py(0, 0);
  ctx.beginPath();
  ctx.arc(nx, ny, 9 + Math.cbrt(current.z) * 1.5, 0, 2 * Math.PI);
  ctx.fillStyle = current.radio ? "#ff5a5f" : "#ffcf55";
  ctx.shadowBlur = 26;
  ctx.shadowColor = ctx.fillStyle;
  ctx.fill();
  ctx.shadowBlur = 0;

  // the falling test mass
  const [gx, gy] = GEODESIC[GEO_A + Math.floor((t * 42) % (GEO_B - GEO_A + 1))];
  ctx.beginPath();
  ctx.arc(px(gx), py(gx, gy), 5, 0, 2 * Math.PI);
  ctx.fillStyle = "#5ddfb0";
  ctx.shadowBlur = 12;
  ctx.shadowColor = "#5ddfb0";
  ctx.fill();
  ctx.shadowBlur = 0;

  // labels
  // anchor on the last point still inside the sheet — the path runs off it
  const gEnd = GEODESIC[GEO_B];
  tag(ctx, px(gEnd[0]) - 6, py(gEnd[0], gEnd[1]) + 16,
      fit(W, "geodesic — locally straight, no force acting", "geodesic — no force"),
      "#5ddfb0", "right");
  const fMid = [(g0[0] + fEnd[0]) / 2, (g0[1] + fEnd[1]) / 2];
  tag(ctx, px(fMid[0]), pyFlat(fMid[1]) - 12,
      fit(W, "same start, same direction, flat spacetime", "flat spacetime"),
      "rgba(180,190,210,0.6)", "center");
  tag(ctx, 10, 14, fit(W,
      `sheet depth exaggerated ${SHEET_EXAGGERATION} — one atom dents spacetime by ~10⁻⁵² m`,
      `depth exaggerated ${SHEET_EXAGGERATION}`),
      "rgba(180,190,210,0.45)");
}

function renderGeometry() {
  drawSpacetime(geoCtx, geoCv._W, geoCv._H, performance.now() / 1000);
}

function renderGeometryInfo() {
  const Z = current.z;
  // the common isotope, matching the tabulated atomic weight — not the
  // radioisotope the decay panel happens to be showing
  const A = Math.round(current.mass);
  const M = current.mass * U_KG;              // one atom, kg
  const rest = current.mass * MEV_U / 1000;   // GeV
  const rs = 2 * G * M / (CLIGHT * CLIGHT);   // Schwarzschild radius
  const rNuc = 1.2e-15 * Math.cbrt(A);        // R = 1.2 fm · A^⅓
  const fRatio = G * M * M / (KE * (Z * QE) ** 2);   // gravity ÷ electrostatics
  const B = bindingMeV(Z, A);
  const defect = B / (A * MEV_U);             // fraction of mass missing

  document.getElementById("geo-info").innerHTML = `
    <p>The three interactions above are particle exchange. Gravity is not —
       Einstein deleted it as a force and made it the <strong>shape of
       spacetime</strong>:</p>
    <code class="eq">G<sub>μν</sub> + Λ g<sub>μν</sub> = (8πG/c⁴) T<sub>μν</sub></code>
    <p class="muted small">Left: pure geometry. Right: T<sub>μν</sub>, the
       mass-energy of this atom. Matter tells spacetime how to curve; spacetime
       tells matter how to move —</p>
    <code class="eq">d²xᵘ/dτ² + Γᵘ<sub>αβ</sub> (dxᵃ/dτ)(dxᵝ/dτ) = 0</code>
    <p class="muted small">— and that second equation has no force term in it.
       Free fall is a straight line; the line just lives in a curved space.</p>

    <ul class="branches geo-nums">
      <li><span class="muted">rest energy Mc²</span> <strong>${rest.toFixed(1)} GeV</strong></li>
      <li><span class="muted">Schwarzschild radius 2GM/c²</span>
          <strong>${sci(rs)} m</strong></li>
      <li><span class="muted">nuclear radius 1.2 fm·A⅓</span>
          <strong>${sci(rNuc)} m</strong>
          <span class="muted">— r<sub>s</sub> is ${sci(rs / rNuc, 1)}× smaller,
          and ${sci(rs / L_PLANCK, 1)} of a Planck length</span></li>
      <li><span class="muted">gravity ÷ electrostatics, two bare nuclei</span>
          <strong>${sci(fRatio)}</strong></li>
      <li><span class="muted">nuclear binding (liquid drop)</span>
          <strong>${B > 0 ? `${B.toFixed(0)} MeV` : "—"}</strong>
          ${B > 0 ? `<span class="muted">= ${(B / A).toFixed(2)} MeV/nucleon${
                A < 20 ? ", rough below A ≈ 20" : ""}</span>` : ""}</li>
      <li><span class="muted">mass defect Δm/m</span>
          <strong>${(defect * 100).toFixed(2)} %</strong></li>
    </ul>

    ${B > 0 ? `
    <p>Mass and energy are the same entry in T<sub>μν</sub>, so this nucleus
       weighs <strong>${(defect * 100).toFixed(2)} %</strong> less than its
       ${Z} proton${Z > 1 ? "s" : ""} and ${A - Z} neutron${A - Z === 1 ? "" : "s"}
       weigh apart — and it curves spacetime correspondingly less. ${DECAY[Z]
         ? `The Q-value in the decay panel is exactly that bookkeeping: Δm·c²
            leaving as ${MODE_NAME[mainMode().mode]}.`
         : `Binding energy is mass that is simply gone.`}</p>`
    : `<p>A lone proton has nothing to bind to, so there is no mass defect —
       its rest energy is its whole contribution to T<sub>μν</sub>.</p>`}

    <p class="muted small">Gravity has no card in the Standard Model above.
       Its quantum — a spin-2 graviton — has never been observed, and no theory
       reconciles a smooth metric with the quantum fields on this page. At the
       ${sci(fRatio, 0)} level, it never matters inside an atom; over a galaxy,
       geometry is all that is left.</p>
  `;
}

// ---------- resize: ResizeObserver catches any layout change (window resize,
// font load, grid reflow, dev tools open, DPR change from moving between
// monitors, etc). Window 'resize' alone misses most of these.
function resizeAll() {
  orbCtx  = setupHiDPI(orbCv);
  specCtx = setupHiDPI(specCv);
  decCtx  = setupHiDPI(decCv);
  relCtx  = setupHiDPI(relCv);
  geoCtx  = setupHiDPI(geoCv);
  renderSpectrum();
  renderRelativity();     // static, so it must be repainted after every resize
  if (REDUCED_MOTION) { renderOrbits(); renderDecay(); renderGeometry(); }
}

const ro = new ResizeObserver(resizeAll);
ro.observe(orbCv);
ro.observe(specCv);
ro.observe(decCv);
ro.observe(relCv);
ro.observe(geoCv);

// DPR can change without a size change (zoom, monitor switch) — poll cheaply.
window.addEventListener("resize", resizeAll);
// Font loading can trigger canvas text reflow; redraw once fonts settle.
if (document.fonts && document.fonts.ready) document.fonts.ready.then(resizeAll);

// ---------- init ----------
select(current.z);
