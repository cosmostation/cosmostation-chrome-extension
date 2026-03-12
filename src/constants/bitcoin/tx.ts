export const P2WPKH__V_BYTES = {
  OVERHEAD: 10.5,
  INPUT: 68,
  OUTPUT: 31,
};

export const P2PKH__V_BYTES = {
  OVERHEAD: 10,
  INPUT: 148,
  OUTPUT: 34,
};

export const P2SH__V_BYTES = {
  OVERHEAD: 10,
  INPUT: 297,
  OUTPUT: 32,
};

export const P2TR__V_BYTES = {
  OVERHEAD: 11,
  INPUT: 58,
  OUTPUT: 43,
};

export const DUST_LIMIT = {
  p2wpkh: 294,
  p2pkh: 546,
  p2wpkhSh: 540,
  p2tr: 330,
} as const;
