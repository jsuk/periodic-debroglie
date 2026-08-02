// Periodic table data.
// Each entry: [Z, symbol, name, mass(u), block, row, col, radioactive?, gammaLines(keV)]
// `row`/`col` are 1-indexed positions in an 18-wide grid (rows 8/9 host the f-block).
// `gammaLines` lists a few characteristic γ energies (keV) of a common isotope,
// intended for qualitative spectrum comparison — not a complete decay library.

const ELEMENTS = [
  [1,"H","Hydrogen",1.008,"s",1,1],
  [2,"He","Helium",4.0026,"s",1,18],

  [3,"Li","Lithium",6.94,"s",2,1],
  [4,"Be","Beryllium",9.0122,"s",2,2],
  [5,"B","Boron",10.81,"p",2,13],
  [6,"C","Carbon",12.011,"p",2,14],
  [7,"N","Nitrogen",14.007,"p",2,15],
  [8,"O","Oxygen",15.999,"p",2,16],
  [9,"F","Fluorine",18.998,"p",2,17],
  [10,"Ne","Neon",20.180,"p",2,18],

  [11,"Na","Sodium",22.990,"s",3,1],
  [12,"Mg","Magnesium",24.305,"s",3,2],
  [13,"Al","Aluminium",26.982,"p",3,13],
  [14,"Si","Silicon",28.085,"p",3,14],
  [15,"P","Phosphorus",30.974,"p",3,15],
  [16,"S","Sulfur",32.06,"p",3,16],
  [17,"Cl","Chlorine",35.45,"p",3,17],
  [18,"Ar","Argon",39.948,"p",3,18],

  [19,"K","Potassium",39.098,"s",4,1],
  [20,"Ca","Calcium",40.078,"s",4,2],
  [21,"Sc","Scandium",44.956,"d",4,3],
  [22,"Ti","Titanium",47.867,"d",4,4],
  [23,"V","Vanadium",50.942,"d",4,5],
  [24,"Cr","Chromium",51.996,"d",4,6],
  [25,"Mn","Manganese",54.938,"d",4,7],
  [26,"Fe","Iron",55.845,"d",4,8],
  [27,"Co","Cobalt",58.933,"d",4,9, false, [1173.2, 1332.5]], // Co-60 ref
  [28,"Ni","Nickel",58.693,"d",4,10],
  [29,"Cu","Copper",63.546,"d",4,11],
  [30,"Zn","Zinc",65.38,"d",4,12],
  [31,"Ga","Gallium",69.723,"p",4,13],
  [32,"Ge","Germanium",72.63,"p",4,14],
  [33,"As","Arsenic",74.922,"p",4,15],
  [34,"Se","Selenium",78.971,"p",4,16],
  [35,"Br","Bromine",79.904,"p",4,17],
  [36,"Kr","Krypton",83.798,"p",4,18],

  [37,"Rb","Rubidium",85.468,"s",5,1],
  [38,"Sr","Strontium",87.62,"s",5,2],
  [39,"Y","Yttrium",88.906,"d",5,3],
  [40,"Zr","Zirconium",91.224,"d",5,4],
  [41,"Nb","Niobium",92.906,"d",5,5],
  [42,"Mo","Molybdenum",95.95,"d",5,6],
  [43,"Tc","Technetium",98,"d",5,7, true, [140.5]], // Tc-99m
  [44,"Ru","Ruthenium",101.07,"d",5,8],
  [45,"Rh","Rhodium",102.91,"d",5,9],
  [46,"Pd","Palladium",106.42,"d",5,10],
  [47,"Ag","Silver",107.87,"d",5,11],
  [48,"Cd","Cadmium",112.41,"d",5,12],
  [49,"In","Indium",114.82,"p",5,13],
  [50,"Sn","Tin",118.71,"p",5,14],
  [51,"Sb","Antimony",121.76,"p",5,15],
  [52,"Te","Tellurium",127.60,"p",5,16],
  [53,"I","Iodine",126.90,"p",5,17, false, [364.5]], // I-131
  [54,"Xe","Xenon",131.29,"p",5,18],

  [55,"Cs","Caesium",132.91,"s",6,1, false, [661.7]], // Cs-137
  [56,"Ba","Barium",137.33,"s",6,2],
  // placeholder for lanthanides in main table
  [72,"Hf","Hafnium",178.49,"d",6,4],
  [73,"Ta","Tantalum",180.95,"d",6,5],
  [74,"W","Tungsten",183.84,"d",6,6],
  [75,"Re","Rhenium",186.21,"d",6,7],
  [76,"Os","Osmium",190.23,"d",6,8],
  [77,"Ir","Iridium",192.22,"d",6,9],
  [78,"Pt","Platinum",195.08,"d",6,10],
  [79,"Au","Gold",196.97,"d",6,11],
  [80,"Hg","Mercury",200.59,"d",6,12],
  [81,"Tl","Thallium",204.38,"p",6,13],
  [82,"Pb","Lead",207.2,"p",6,14],
  [83,"Bi","Bismuth",208.98,"p",6,15],
  [84,"Po","Polonium",209,"p",6,16, true, [803.0]],            // Po-210
  [85,"At","Astatine",210,"p",6,17, true, [79.3, 687]],         // At-211
  [86,"Rn","Radon",222,"p",6,18, true, [510.0]],                // Rn-222 progeny

  [87,"Fr","Francium",223,"s",7,1, true, [218.0]],              // Fr-221
  [88,"Ra","Radium",226,"s",7,2, true, [186.2]],                // Ra-226
  [104,"Rf","Rutherfordium",267,"d",7,4, true],
  [105,"Db","Dubnium",268,"d",7,5, true],
  [106,"Sg","Seaborgium",269,"d",7,6, true],
  [107,"Bh","Bohrium",270,"d",7,7, true],
  [108,"Hs","Hassium",269,"d",7,8, true],
  [109,"Mt","Meitnerium",278,"d",7,9, true],
  [110,"Ds","Darmstadtium",281,"d",7,10, true],
  [111,"Rg","Roentgenium",282,"d",7,11, true],
  [112,"Cn","Copernicium",285,"d",7,12, true],
  [113,"Nh","Nihonium",286,"p",7,13, true],
  [114,"Fl","Flerovium",289,"p",7,14, true],
  [115,"Mc","Moscovium",290,"p",7,15, true],
  [116,"Lv","Livermorium",293,"p",7,16, true],
  [117,"Ts","Tennessine",294,"p",7,17, true],
  [118,"Og","Oganesson",294,"p",7,18, true],

  // Lanthanides (row 8, cols 3-17)
  [57,"La","Lanthanum",138.91,"f",8,3],
  [58,"Ce","Cerium",140.12,"f",8,4],
  [59,"Pr","Praseodymium",140.91,"f",8,5],
  [60,"Nd","Neodymium",144.24,"f",8,6],
  [61,"Pm","Promethium",145,"f",8,7, true, [121.2]],          // Pm-147
  [62,"Sm","Samarium",150.36,"f",8,8],
  [63,"Eu","Europium",151.96,"f",8,9],
  [64,"Gd","Gadolinium",157.25,"f",8,10],
  [65,"Tb","Terbium",158.93,"f",8,11],
  [66,"Dy","Dysprosium",162.50,"f",8,12],
  [67,"Ho","Holmium",164.93,"f",8,13],
  [68,"Er","Erbium",167.26,"f",8,14],
  [69,"Tm","Thulium",168.93,"f",8,15],
  [70,"Yb","Ytterbium",173.05,"f",8,16],
  [71,"Lu","Lutetium",174.97,"f",8,17],

  // Actinides (row 9, cols 3-17) — all radioactive
  [89,"Ac","Actinium",227,"f",9,3, true, [70.0, 84.0]],
  [90,"Th","Thorium",232.04,"f",9,4, true, [63.8, 129.0, 140.9]],
  [91,"Pa","Protactinium",231.04,"f",9,5, true, [27.4, 300.0]],
  [92,"U","Uranium",238.03,"f",9,6, true, [49.6, 143.8, 185.7, 205.3]], // U-235/238
  [93,"Np","Neptunium",237,"f",9,7, true, [29.4, 86.5]],
  [94,"Pu","Plutonium",244,"f",9,8, true, [129.3, 203.5, 375.0, 413.7]],
  [95,"Am","Americium",243,"f",9,9, true, [26.3, 59.5, 103.0]],         // Am-241
  [96,"Cm","Curium",247,"f",9,10, true, [42.8, 100.0]],
  [97,"Bk","Berkelium",247,"f",9,11, true, [327.0]],
  [98,"Cf","Californium",251,"f",9,12, true, [43.4, 100.0]],
  [99,"Es","Einsteinium",252,"f",9,13, true, [389.0]],
  [100,"Fm","Fermium",257,"f",9,14, true, [241.0]],
  [101,"Md","Mendelevium",258,"f",9,15, true],
  [102,"No","Nobelium",259,"f",9,16, true],
  [103,"Lr","Lawrencium",266,"f",9,17, true],
];

// ---------------------------------------------------------------------------
// Nuclear decay data.
// DECAY[Z] describes one representative isotope of the element:
//   iso     display name of the nuclide
//   A       mass number (needed to write the decay equation)
//   hl      half-life, as display text
//   modes   [{ mode, br, daughter, q }]  br = branching ratio %, q = Q-value MeV
//   made    how the nuclide is obtained on Earth (reactor / accelerator / natural)
// Modes use the keys understood by the Feynman/decay renderer:
//   "a" α · "b-" β⁻ · "b+" β⁺ · "ec" electron capture · "it" isomeric γ · "sf" spontaneous fission
// ---------------------------------------------------------------------------

const DECAY = {
  1:  { iso:"³H (tritium)", A:3,  hl:"12.32 y",
        modes:[{mode:"b-", br:100, daughter:"³He", q:0.0186}],
        made:"⁶Li(n,α)³H in reactors; traces from cosmic-ray spallation of N₂" },
  6:  { iso:"¹⁴C", A:14, hl:"5 730 y",
        modes:[{mode:"b-", br:100, daughter:"¹⁴N", q:0.156}],
        made:"¹⁴N(n,p)¹⁴C, cosmic-ray neutrons in the upper atmosphere" },
  11: { iso:"²²Na", A:22, hl:"2.602 y",
        modes:[{mode:"b+", br:90.3, daughter:"²²Ne", q:2.842},
               {mode:"ec", br:9.7,  daughter:"²²Ne", q:2.842}],
        made:"cyclotron: ²⁴Mg(d,α) or proton spallation of Al" },
  19: { iso:"⁴⁰K", A:40, hl:"1.248 × 10⁹ y",
        modes:[{mode:"b-", br:89.3, daughter:"⁴⁰Ca", q:1.311},
               {mode:"ec", br:10.7, daughter:"⁴⁰Ar", q:1.505}],
        made:"primordial — 0.012 % of all natural potassium (r-process relic)" },
  27: { iso:"⁶⁰Co", A:60, hl:"5.271 y",
        modes:[{mode:"b-", br:100, daughter:"⁶⁰Ni", q:2.824}],
        made:"⁵⁹Co(n,γ)⁶⁰Co — neutron activation in a reactor" },
  38: { iso:"⁹⁰Sr", A:90, hl:"28.79 y",
        modes:[{mode:"b-", br:100, daughter:"⁹⁰Y", q:0.546}],
        made:"high-yield fission fragment of ²³⁵U (≈5.7 % of fissions)" },
  43: { iso:"⁹⁹ᵐTc", A:99, hl:"6.007 h",
        modes:[{mode:"it", br:100, daughter:"⁹⁹Tc", q:0.1426}],
        made:"⁹⁹Mo generator; ⁹⁹Mo itself is a ²³⁵U fission product" },
  53: { iso:"¹³¹I", A:131, hl:"8.025 d",
        modes:[{mode:"b-", br:100, daughter:"¹³¹Xe", q:0.971}],
        made:"fission product of ²³⁵U; also ¹³⁰Te(n,γ)¹³¹Te → β⁻" },
  55: { iso:"¹³⁷Cs", A:137, hl:"30.08 y",
        modes:[{mode:"b-", br:100, daughter:"¹³⁷ᵐBa", q:1.176}],
        made:"fission fragment of ²³⁵U (≈6 % yield)" },
  61: { iso:"¹⁴⁷Pm", A:147, hl:"2.623 y",
        modes:[{mode:"b-", br:100, daughter:"¹⁴⁷Sm", q:0.224}],
        made:"no stable isotope exists — extracted from spent reactor fuel" },
  84: { iso:"²¹⁰Po", A:210, hl:"138.4 d",
        modes:[{mode:"a", br:100, daughter:"²⁰⁶Pb", q:5.407}],
        made:"²⁰⁹Bi(n,γ)²¹⁰Bi → β⁻; also a natural ²³⁸U chain member" },
  85: { iso:"²¹¹At", A:211, hl:"7.214 h",
        modes:[{mode:"ec", br:58.2, daughter:"²¹¹Po", q:0.786},
               {mode:"a",  br:41.8, daughter:"²⁰⁷Bi", q:5.982}],
        made:"cyclotron: ²⁰⁹Bi(α,2n)²¹¹At — rarest natural element" },
  86: { iso:"²²²Rn", A:222, hl:"3.823 d",
        modes:[{mode:"a", br:100, daughter:"²¹⁸Po", q:5.590}],
        made:"continuously regenerated by ²²⁶Ra in the ²³⁸U chain" },
  87: { iso:"²²³Fr", A:223, hl:"22.00 min",
        modes:[{mode:"b-", br:99.99, daughter:"²²³Ra", q:1.149},
               {mode:"a",  br:0.006, daughter:"²¹⁹At", q:5.562}],
        made:"1.4 % α branch of ²²⁷Ac in the ²³⁵U chain" },
  88: { iso:"²²⁶Ra", A:226, hl:"1 600 y",
        modes:[{mode:"a", br:100, daughter:"²²²Rn", q:4.871}],
        made:"²³⁸U decay chain — Curie's pitchblende residue" },
  89: { iso:"²²⁷Ac", A:227, hl:"21.77 y",
        modes:[{mode:"b-", br:98.6, daughter:"²²⁷Th", q:0.045},
               {mode:"a",  br:1.4,  daughter:"²²³Fr", q:5.042}],
        made:"²³⁵U chain; bulk quantities via ²²⁶Ra(n,γ)²²⁷Ra → β⁻" },
  90: { iso:"²³²Th", A:232, hl:"1.405 × 10¹⁰ y",
        modes:[{mode:"a", br:100, daughter:"²²⁸Ra", q:4.083}],
        made:"primordial r-process nuclide — monazite sands" },
  91: { iso:"²³¹Pa", A:231, hl:"32 760 y",
        modes:[{mode:"a", br:100, daughter:"²²⁷Ac", q:5.150}],
        made:"²³⁵U decay chain" },
  92: { iso:"²³⁸U", A:238, hl:"4.468 × 10⁹ y",
        modes:[{mode:"a", br:100, daughter:"²³⁴Th", q:4.270},
               {mode:"sf", br:5.4e-5, daughter:"2 fragments + ~2n", q:205}],
        made:"primordial r-process nuclide — neutron-star-merger ejecta" },
  93: { iso:"²³⁷Np", A:237, hl:"2.144 × 10⁶ y",
        modes:[{mode:"a", br:100, daughter:"²³³Pa", q:4.959}],
        made:"²³⁸U(n,2n)²³⁷U → β⁻, in reactor fuel" },
  94: { iso:"²³⁹Pu", A:239, hl:"24 110 y",
        modes:[{mode:"a", br:100, daughter:"²³⁵U", q:5.245}],
        made:"²³⁸U(n,γ)²³⁹U → β⁻ → ²³⁹Np → β⁻ → ²³⁹Pu" },
  95: { iso:"²⁴¹Am", A:241, hl:"432.6 y",
        modes:[{mode:"a", br:100, daughter:"²³⁷Np", q:5.638}],
        made:"β⁻ daughter of ²⁴¹Pu bred by multiple n-captures on ²³⁹Pu" },
  96: { iso:"²⁴⁴Cm", A:244, hl:"18.11 y",
        modes:[{mode:"a", br:100, daughter:"²⁴⁰Pu", q:5.902}],
        made:"successive neutron capture on Pu in high-flux reactors" },
  97: { iso:"²⁴⁷Bk", A:247, hl:"1 380 y",
        modes:[{mode:"a", br:100, daughter:"²⁴³Am", q:5.889}],
        made:"²⁴¹Am(α,2n)²⁴³Bk originally; now HFIR neutron irradiation" },
  98: { iso:"²⁵²Cf", A:252, hl:"2.645 y",
        modes:[{mode:"a",  br:96.9, daughter:"²⁴⁸Cm", q:6.217},
               {mode:"sf", br:3.1,  daughter:"2 fragments + 3.7n", q:220}],
        made:"long neutron-capture chains at HFIR — a portable neutron source" },
  99: { iso:"²⁵²Es", A:252, hl:"471.7 d",
        modes:[{mode:"a",  br:76, daughter:"²⁴⁸Bk", q:6.790},
               {mode:"ec", br:24, daughter:"²⁵²Cf", q:1.260}],
        made:"first found in 1952 'Ivy Mike' thermonuclear debris" },
  100:{ iso:"²⁵⁷Fm", A:257, hl:"100.5 d",
        modes:[{mode:"a",  br:99.79, daughter:"²⁵³Cf", q:6.864},
               {mode:"sf", br:0.21,  daughter:"2 fragments", q:230}],
        made:"neutron irradiation — the 'fermium wall' ends this route" },
  101:{ iso:"²⁵⁸Md", A:258, hl:"51.5 d",
        modes:[{mode:"a", br:100, daughter:"²⁵⁴Es", q:7.271}],
        made:"²⁵³Es(α,n)²⁵⁶Md — first element made one atom at a time" },
  102:{ iso:"²⁵⁹No", A:259, hl:"58 min",
        modes:[{mode:"a",  br:75, daughter:"²⁵⁵Fm", q:7.910},
               {mode:"ec", br:25, daughter:"²⁵⁹Md", q:0.500}],
        made:"²⁴⁸Cm(¹⁸O,α3n)²⁵⁹No — hot-fusion accelerator route" },
  103:{ iso:"²⁶⁶Lr", A:266, hl:"11 h",
        modes:[{mode:"sf", br:100, daughter:"2 fragments", q:235}],
        made:"²⁴⁸Cm(²³Na,5n) / α-decay daughter of ²⁷⁰Db" },
  104:{ iso:"²⁶⁷Rf", A:267, hl:"1.3 h",
        modes:[{mode:"sf", br:100, daughter:"2 fragments", q:240}],
        made:"α-decay daughter of ²⁷¹Sg; direct ²⁰⁸Pb(⁵⁰Ti,n)²⁵⁷Rf" },
  105:{ iso:"²⁶⁸Db", A:268, hl:"29 h",
        modes:[{mode:"sf", br:100, daughter:"2 fragments", q:240}],
        made:"end of the ²⁸⁸Mc α-chain from ²⁴³Am(⁴⁸Ca,3n)" },
  106:{ iso:"²⁶⁹Sg", A:269, hl:"14 min",
        modes:[{mode:"a", br:100, daughter:"²⁶⁵Rf", q:8.500}],
        made:"cold fusion ²⁰⁸Pb(⁵⁴Cr,n)²⁶¹Sg; ²⁶⁹Sg from the ²⁸⁵Fl chain" },
  107:{ iso:"²⁷⁰Bh", A:270, hl:"60 s",
        modes:[{mode:"a", br:100, daughter:"²⁶⁶Db", q:8.930}],
        made:"²⁰⁹Bi(⁵⁴Cr,n)²⁶²Bh; ²⁷⁰Bh via the ²⁸⁶Nh chain" },
  108:{ iso:"²⁶⁹Hs", A:269, hl:"16 s",
        modes:[{mode:"a", br:100, daughter:"²⁶⁵Sg", q:9.300}],
        made:"²⁰⁸Pb(⁵⁸Fe,n)²⁶⁵Hs — GSI cold fusion, 1984" },
  109:{ iso:"²⁷⁸Mt", A:278, hl:"4.5 s",
        modes:[{mode:"a", br:100, daughter:"²⁷⁴Bh", q:9.600}],
        made:"²⁰⁹Bi(⁵⁸Fe,n)²⁶⁶Mt — GSI, 1982 (one atom)" },
  110:{ iso:"²⁸¹Ds", A:281, hl:"14 s",
        modes:[{mode:"sf", br:94, daughter:"2 fragments", q:250},
               {mode:"a",  br:6,  daughter:"²⁷⁷Hs", q:8.850}],
        made:"²⁰⁸Pb(⁶²Ni,n)²⁶⁹Ds — GSI, 1994" },
  111:{ iso:"²⁸²Rg", A:282, hl:"100 s",
        modes:[{mode:"a", br:100, daughter:"²⁷⁸Mt", q:9.000}],
        made:"²⁰⁹Bi(⁶⁴Ni,n)²⁷²Rg; ²⁸²Rg from the ²⁹⁰Mc chain" },
  112:{ iso:"²⁸⁵Cn", A:285, hl:"28 s",
        modes:[{mode:"a", br:100, daughter:"²⁸¹Ds", q:9.320}],
        made:"²⁰⁸Pb(⁷⁰Zn,n)²⁷⁷Cn; ²⁸⁵Cn from ²⁴⁴Pu(⁴⁸Ca,3n)²⁸⁹Fl" },
  113:{ iso:"²⁸⁶Nh", A:286, hl:"9.5 s",
        modes:[{mode:"a", br:100, daughter:"²⁸²Rg", q:9.630}],
        made:"²⁰⁹Bi(⁷⁰Zn,n)²⁷⁸Nh — RIKEN, 3 atoms in 9 years" },
  114:{ iso:"²⁸⁹Fl", A:289, hl:"1.9 s",
        modes:[{mode:"a", br:100, daughter:"²⁸⁵Cn", q:9.850}],
        made:"²⁴⁴Pu(⁴⁸Ca,3n)²⁸⁹Fl — hot fusion, Dubna 1999" },
  115:{ iso:"²⁹⁰Mc", A:290, hl:"0.65 s",
        modes:[{mode:"a", br:100, daughter:"²⁸⁶Nh", q:10.410}],
        made:"²⁴³Am(⁴⁸Ca,3n)²⁸⁸Mc — Dubna 2003" },
  116:{ iso:"²⁹³Lv", A:293, hl:"57 ms",
        modes:[{mode:"a", br:100, daughter:"²⁸⁹Fl", q:10.680}],
        made:"²⁴⁸Cm(⁴⁸Ca,3n)²⁹³Lv — Dubna 2000" },
  117:{ iso:"²⁹⁴Ts", A:294, hl:"51 ms",
        modes:[{mode:"a", br:100, daughter:"²⁹⁰Mc", q:11.180}],
        made:"²⁴⁹Bk(⁴⁸Ca,3n)²⁹⁴Ts — needed 22 mg of reactor-bred ²⁴⁹Bk" },
  118:{ iso:"²⁹⁴Og", A:294, hl:"0.7 ms",
        modes:[{mode:"a", br:100, daughter:"²⁹⁰Lv", q:11.820}],
        made:"²⁴⁹Cf(⁴⁸Ca,3n)²⁹⁴Og — five atoms ever observed" },
};

const MODE_NAME = {
  "a":  "α decay",
  "b-": "β⁻ decay",
  "b+": "β⁺ decay",
  "ec": "electron capture",
  "it": "isomeric transition (γ)",
  "sf": "spontaneous fission",
};

// Quark-level description of each decay mode, and which Standard-Model
// particles take part.  Keys match the `id` field in PARTICLES.
const MODE_PHYSICS = {
  "a": {
    quark: "no flavour change — the strong force binds 2p + 2n into a ⁴He cluster that tunnels out",
    force: "strong (binding) + electromagnetic (Coulomb barrier)",
    parts: ["u", "d", "g", "gamma"],
  },
  "b-": {
    quark: "d → u + W⁻,  W⁻ → e⁻ + ν̄ₑ   (a neutron udd becomes a proton uud)",
    force: "weak charged current",
    parts: ["u", "d", "W", "e", "nue"],
  },
  "b+": {
    quark: "u → d + W⁺,  W⁺ → e⁺ + νₑ   (a proton uud becomes a neutron udd)",
    force: "weak charged current",
    parts: ["u", "d", "W", "e", "nue"],
  },
  "ec": {
    quark: "u + e⁻ → d + νₑ   (an inner-shell electron is swallowed by the nucleus)",
    force: "weak charged current",
    parts: ["u", "d", "W", "e", "nue"],
  },
  "it": {
    quark: "no flavour change — nucleons drop to a lower shell state and radiate a photon",
    force: "electromagnetic",
    parts: ["u", "d", "g", "gamma"],
  },
  "sf": {
    quark: "no flavour change — Coulomb repulsion beats the strong force and the nucleus splits",
    force: "strong vs. electromagnetic; the neutron-rich fragments then β⁻ decay",
    parts: ["u", "d", "g", "gamma", "W", "e", "nue"],
  },
};

// ---------------------------------------------------------------------------
// The Standard Model of particle physics.
// [id, symbol, name, class, generation-or-column, charge, mass]
// class: q = quark · l = lepton · b = gauge boson · h = scalar boson
// ---------------------------------------------------------------------------
const PARTICLES = [
  ["u","u","up",        "q",1,"+⅔","2.2 MeV"],
  ["c","c","charm",     "q",2,"+⅔","1.27 GeV"],
  ["t","t","top",       "q",3,"+⅔","173 GeV"],
  ["d","d","down",      "q",1,"−⅓","4.7 MeV"],
  ["s","s","strange",   "q",2,"−⅓","93 MeV"],
  ["b","b","bottom",    "q",3,"−⅓","4.18 GeV"],
  ["e","e","electron",  "l",1,"−1","0.511 MeV"],
  ["mu","μ","muon",     "l",2,"−1","105.7 MeV"],
  ["tau","τ","tau",     "l",3,"−1","1.777 GeV"],
  ["nue","ν<sub>e</sub>","e-neutrino",   "l",1,"0","< 1 eV"],
  ["numu","ν<sub>μ</sub>","μ-neutrino",  "l",2,"0","< 1 eV"],
  ["nutau","ν<sub>τ</sub>","τ-neutrino", "l",3,"0","< 1 eV"],
  ["g","g","gluon",     "b",4,"0","0"],
  ["gamma","γ","photon","b",4,"0","0"],
  ["Z","Z","Z boson",   "b",4,"0","91.19 GeV"],
  ["W","W","W boson",   "b",4,"±1","80.38 GeV"],
  ["H","H","Higgs",     "h",5,"0","125.25 GeV"],
];

// ---------------------------------------------------------------------------
// Where the nuclei themselves come from (cosmic + laboratory synthesis).
// ---------------------------------------------------------------------------
function originOf(z) {
  if (z === 43) return { tag:"synthetic", text:
    "No stable isotope: any primordial Tc decayed away. Found in reactor fission products and in the spectra of some red giants — direct evidence of live s-process nucleosynthesis." };
  if (z === 61) return { tag:"synthetic", text:
    "No stable isotope. Made only in reactors (fission of ²³⁵U) — the r- and s-processes both route around the Pm gap." };
  if (z <= 2)  return { tag:"Big Bang", text:
    "Big Bang nucleosynthesis, minutes after t = 0: p + n → d → ³He → ⁴He. Helium is topped up by hydrogen burning in every star since." };
  if (z === 3) return { tag:"Big Bang + stars", text:
    "⁷Li partly primordial, partly from cosmic-ray spallation and novae — the only light element whose budget is still contested." };
  if (z <= 5)  return { tag:"spallation", text:
    "Be and B are skipped by stellar fusion entirely; they are chipped off heavier C/N/O nuclei by galactic cosmic rays." };
  if (z <= 8)  return { tag:"stellar fusion", text:
    "Triple-α (3 ⁴He → ¹²C) and the CNO cycle in stellar cores; released by AGB winds and core-collapse supernovae." };
  if (z <= 20) return { tag:"stellar fusion", text:
    "α-capture ladder during carbon, neon, oxygen and silicon burning in massive stars, plus explosive burning in the supernova shock." };
  if (z <= 28) return { tag:"supernova", text:
    "Silicon burning drives nuclear statistical equilibrium toward the ⁵⁶Fe peak — the last step that releases energy. Beyond it, fusion costs energy." };
  if (z <= 83) return { tag:"s- + r-process", text:
    "Built by neutron capture: the slow s-process in AGB-star helium shells, and the rapid r-process in neutron-star mergers, each followed by β⁻ decay back to stability." };
  if (z <= 92) return { tag:"r-process", text:
    "Only the r-process reaches here — a burst of ~10²² neutrons/cm³ in a neutron-star merger, then a long β⁻ cascade. Th and U survive today only because their half-lives rival the age of the Galaxy." };
  if (z <= 100) return { tag:"reactor", text:
    "Beyond uranium nothing primordial survives. These are bred by successive neutron captures on Pu/Am/Cm targets in high-flux reactors, each capture followed by β⁻ decay. The route dies at Z = 100 — the 'fermium wall', where spontaneous fission outruns capture." };
  return { tag:"accelerator", text:
    "Made one atom at a time by fusing two nuclei in a beamline: an actinide target plus a ⁴⁸Ca (hot fusion) or ⁵⁰Ti–⁷⁰Zn (cold fusion) projectile, evaporating a few neutrons to carry off the excitation energy." };
}

// Convenience marker cells (lanthanide / actinide pointers in main table).
const MARKERS = [
  { row: 6, col: 3, label: "57-71",  block: "f" },
  { row: 7, col: 3, label: "89-103", block: "f" },
];

// Build a map by Z.
const BY_Z = Object.fromEntries(
  ELEMENTS.map(e => [e[0], {
    z: e[0], sy: e[1], nm: e[2], mass: e[3],
    block: e[4], row: e[5], col: e[6],
    radio: !!e[7] || (e[0] === 43 || e[0] === 61 || (e[0] >= 84 && e[0] <= 118 && e[0] !== 82)),
    gamma: e[8] || [],
  }])
);
