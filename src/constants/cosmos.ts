export const PUBLIC_KEY_TYPE = {
  SECP256K1: 'tendermint/PubKeySecp256k1',
  ETH_SECP256K1: 'ethermint/PubKeyEthSecp256k1',
  INJ_SECP256K1: 'injective/PubKeyEthSecp256k1',
  ART_SECP256K1: 'artela/PubKeyEthSecp256k1',
} as const;

export const COSMOS_TYPE = {
  BASIC: '',
  ETHERMINT: 'ETHERMINT',
} as const;

export const MINTSCAN_URL = 'https://www.mintscan.io';

export const TOKEN_TYPE = {
  CW20: 'CW20',
  CW721: 'CW721',
} as const;
