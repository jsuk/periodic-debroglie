# Periodic Table · de Broglie Model · Radioactive Spectrum

Interactive periodic table that visualises each element using the **de Broglie
matter-wave model** of the atom and, for radioactive species, overlays a
characteristic **gamma emission frequency spectrum**.

## Physics

**de Broglie wavelength**

    λ = h / p = h / (m_e v)

**Standing-wave quantisation** (Bohr + de Broglie): an allowed orbit holds an
integer number of wavelengths on its circumference.

    2 π r_n  =  n λ_n        (n = 1, 2, 3, …)

Solving with Coulomb attraction for a hydrogenic electron of effective charge
Z_eff yields the Bohr radius scaling and the energy levels

    E_n = −13.6 eV · Z_eff² / n²

Photon frequencies from the transition n_i → n_f are then

    ν = (E_i − E_f) / h

which the app plots as the predicted emission spectrum for every element.

**Radioactive overlay.** For radioactive elements (Tc, Pm, Po→Og and a few
notable isotopes) a second spectrum of characteristic gamma-decay lines is
drawn on top, so you can compare the hydrogenic prediction against real
nuclear γ emissions.

## Nuclear synthesis and decay

Each element also carries a **nucleosynthesis** note — where its nuclei were
actually made: Big Bang nucleosynthesis (H, He), cosmic-ray spallation (Li, Be,
B), stellar fusion up to the ⁵⁶Fe binding-energy peak, s- and r-process neutron
capture beyond it, and — past uranium — reactor breeding and accelerator
fusion (e.g. ²⁴⁹Cf + ⁴⁸Ca → ²⁹⁴Og + 3n).

The **decay panel** takes one representative isotope per element (half-life,
branching ratios, Q-values, daughter) and animates the mechanism:

| mode | drawing | what it shows |
|------|---------|---------------|
| α    | Gamow tunnelling | V(r) well + Coulomb barrier, the Q line, and ψ decaying through the classically forbidden region |
| β⁻ / β⁺ / EC | Feynman diagram | the flavour-changing quark, the W propagator, and the outgoing lepton pair |
| IT (γ) | level diagram | nuclear de-excitation, no flavour change |
| SF | scission sequence | compound nucleus → saddle point → two fragments + prompt neutrons |

## Standard Model

The last panel is the full 17-particle Standard Model; the particles taking
part in the selected element's decay light up. The point it makes: every
nucleus here is built from just **u** and **d** quarks bound by **gluons**,
and only the **W**, **electron** and **electron-neutrino** join in when the
weak force turns one nucleon into the other.

    β⁻ :  d → u + W⁻,   W⁻ → e⁻ + ν̄ₑ
    β⁺ :  u → d + W⁺,   W⁺ → e⁺ + νₑ
    EC :  u + e⁻ → d + νₑ

## Special relativity — E = mc²

The app's own Bohr numbers force this panel to exist. For a 1s electron
v₁ = Zαc, so uranium's innermost electron runs at **0.671 c** and gold's at
0.577 c — the non-relativistic λ = h/mv in the first panel is then wrong by γ,
and the panel says so.

    γ = 1/√(1 − v²/c²)          E = γmc²          E² = (pc)² + (mc²)²

The canvas plots γ(β) with this element's 1s electron marked on it, and draws
the energy triangle **to scale** for that electron: a vertical leg mc² = 511 keV,
a horizontal leg pc = γβmc², and E as the hypotenuse. Click across the table and
the triangle changes shape.

It also does the mass–energy bookkeeping that the rest of the app relies on:
1 u = 931.494 MeV, the nuclear binding re-expressed as missing kilograms, and
each decay Q-value converted back into the Δm that paid for it. For β⁺ emitters
the 511 keV annihilation photons are m_ec² read straight off a detector.

Where it stops being a correction and starts being chemistry: gold is yellow,
mercury is liquid, and ~80 % of a lead-acid cell's voltage is relativistic. The
naive picture would put v₁ = c at Z = 137.

## General relativity — the force that became geometry

Special relativity's headline is E = mc²; general relativity's is the field
equation, and its founding idea is the equivalence principle (free fall is
indistinguishable from no gravity at all).

The Standard Model panel holds three of the four interactions. The fourth is
missing because Einstein stopped treating it as an exchanged particle: he
replaced the force with the shape of spacetime.

    G_μν + Λ g_μν = (8πG / c⁴) T_μν            geometry = mass-energy

    d²xᵘ/dτ² + Γᵘ_αβ (dxᵃ/dτ)(dxᵝ/dτ) = 0      and no force term anywhere

The last panel draws that literally — a warped sheet with the nucleus in its
dimple, a geodesic falling past it, and the same start and direction as a
dashed straight line on flat space. The sheet's depth is exaggerated by ~10⁴⁰;
a single atom dents spacetime by about 10⁻⁵² m.

Per element it computes rest energy Mc², the Schwarzschild radius 2GM/c²
(compared to both the nuclear radius 1.2 fm·A⅓ and the Planck length), and the
ratio of gravity to electrostatics between two bare nuclei — the ~10⁻³⁶
hierarchy that keeps gravity irrelevant inside an atom.

It also closes the loop with the decay panel via the Bethe–Weizsäcker
liquid-drop binding energy (the same surface-vs-Coulomb competition that drives
fission): a nucleus weighs less than its parts, and that missing mass is both
the decay Q-value and missing curvature. Mass and energy are one entry in
T_μν. The drop model is only rough below A ≈ 20, and the panel says so.

## Layout

Responsive: on a laptop the panels sit side by side; on a phone everything
stacks, the periodic table pans horizontally instead of shrinking to
illegibility, the canvases switch to taller aspect ratios with shortened
labels, and tapping an element scrolls to the panels.
`prefers-reduced-motion` freezes the animation.

## Keyboard

The arrow keys work **anywhere on the page** — you can sit reading the decay
panel and change element without scrolling back to the table. Navigation never
moves the viewport: focus is set with `preventScroll`, and only the table's own
horizontal scroller is adjusted.

| key | moves | where it works |
|-----|-------|----------------|
| `←` `→` | next element along the row — skipping the gaps, so Be → B | anywhere |
| `↑` `↓` | along the column, crossing into the f-block (Ac ↑ La ↑ Y) | anywhere |
| `[` `]` | by atomic number, which is not the same as by position | anywhere |
| `Home` `End` | ends of the current row | table focused |
| `Ctrl+Home` `Ctrl+End` | hydrogen / oganesson | table focused |
| `Enter` `Space` | select (arrows already select as they move) | table focused |

`PgUp`/`PgDn` are deliberately left alone so they still scroll while you read;
`[` and `]` do atomic-number stepping instead. Typing in the orbit slider keeps
its own arrow keys.

Once the table scrolls out of view a small stepper appears in the corner
showing the current element, with `‹ ›` buttons for mouse and touch. The table
is a single tab stop (roving `tabindex`, so you don't Tab through 118 cells),
marked up as a `listbox` of `option`s with `aria-selected`.

## Run

Just open `index.html` in a browser — no build step, no dependencies.

    xdg-open index.html    # or: python3 -m http.server

## Files

- `index.html` — layout + periodic table grid
- `style.css`  — styling, responsive breakpoints
- `data.js`    — element data, γ lines, decay table, Standard Model, nucleosynthesis
- `app.js`     — rendering: periodic table, de Broglie orbits, spectrum,
                 decay diagrams, Standard Model panel, relativity, spacetime sheet

Data is abridged from NNDC / LBNL (nuclear) and the PDG (particle masses):
one representative isotope per element, for qualitative comparison — not a
decay library.
