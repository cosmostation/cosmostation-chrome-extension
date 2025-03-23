export enum Network {
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
  SIGNET = 'signet',
}

export const PUBKEY_STYLE_MAP = {
  p2tr: 'Taproot',
  p2pkh: 'Legacy',
  p2wpkh: 'Native SegWit',
  p2wpkhSh: 'SegWit',
};

export const ADDRESS_FORMAT_MAPPING = {
  '86': 'Taproot',
  "86'": 'Taproot',
  '84': 'Native SegWit',
  "84'": 'Native SegWit',
  '44': 'Legacy',
  "44'": 'Legacy',
  '49': 'SegWit',
  "49'": 'SegWit',
};
