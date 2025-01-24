export const P2WPKH__V_BYTES = {
  OVERHEAD: 10.5,
  INPUT: 68,
  OUTPUT: 31,
};

export const BITCOIN_ADDRESS_TYPES = {
  P2WPKH: `84'`,
  P2TR: `86'`,
  P2PKH: `44'`,
  P2SH: `49'`,
};

export enum Network {
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
  SIGNET = 'signet',
}
