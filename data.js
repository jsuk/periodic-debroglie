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
