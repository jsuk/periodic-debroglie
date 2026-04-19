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

## Run

Just open `index.html` in a browser — no build step, no dependencies.

    xdg-open index.html    # or: python3 -m http.server

## Files

- `index.html` — layout + periodic table grid
- `style.css`  — styling
- `data.js`    — element data + radioactive gamma lines
- `app.js`     — rendering: periodic table, de Broglie orbits, spectrum
