// De 21 PLL-fallen. Alla algoritmer är kontrollerade mot kubmodellen:
// de flyttar bara översta lagret och lämnar resten löst, utan avslutande toppvridning.
export const PLL = [
  { id: 'Aa', group: 'Hörn', alg: "x R' U R' D2 R U' R' D2 R2 x'" },
  { id: 'Ab', group: 'Hörn', alg: "x R2 D2 R U R' D2 R U' R x'" },
  { id: 'E', group: 'Hörn', alg: "x' R U' R' D R U R' D' R U R' D R U' R' D' x" },
  { id: 'H', group: 'Kanter', alg: 'M2 U M2 U2 M2 U M2' },
  { id: 'Ua', group: 'Kanter', alg: "R U' R U R U R U' R' U' R2" },
  { id: 'Ub', group: 'Kanter', alg: "R2 U R U R' U' R' U' R' U R'" },
  { id: 'Z', group: 'Kanter', alg: "M' U M2 U M2 U M' U2 M2 U'" },
  { id: 'F', group: 'Byte bredvid', alg: "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R" },
  { id: 'Ja', group: 'Byte bredvid', alg: "x R2 F R F' R U2 r' U r U2 x'" },
  { id: 'Jb', group: 'Byte bredvid', alg: "R U R' F' R U R' U' R' F R2 U' R' U'" },
  { id: 'Ra', group: 'Byte bredvid', alg: "R U' R' U' R U R D R' U' R D' R' U2 R' U'" },
  { id: 'Rb', group: 'Byte bredvid', alg: "R2 F R U R U' R' F' R U2 R' U2 R U" },
  { id: 'T', group: 'Byte bredvid', alg: "R U R' U' R' F R2 U' R' U' R U R' F'" },
  { id: 'Na', group: 'Byte diagonalt', alg: "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'" },
  { id: 'Nb', group: 'Byte diagonalt', alg: "R' U R U' R' F' U' F R U R' F R' F' R U' R" },
  { id: 'V', group: 'Byte diagonalt', alg: "R U' R U R' D R D' R U' D R2 U R2 D' R2" },
  { id: 'Y', group: 'Byte diagonalt', alg: "F R U' R' U' R U R' F' R U R' U' R' F R F'" },
  { id: 'Ga', group: 'G-perm', alg: "R2 U R' U R' U' R U' R2 U' D R' U R D'" },
  { id: 'Gb', group: 'G-perm', alg: "R' U' R U D' R2 U R' U R U' R U' R2 D" },
  { id: 'Gc', group: 'G-perm', alg: "R2 U' R U' R U R' U R2 U D' R U' R' D" },
  { id: 'Gd', group: 'G-perm', alg: "R U R' U' D R2 U' R U' R' U R' U R2 D'" },
];

// Ingår i 2-look PLL (nybörjarvarianten av CFOP:s sista steg)
export const TWO_LOOK = ['Aa', 'Ab', 'H', 'Ua', 'Ub', 'Z', 'T', 'Y'];
