export const PUBLIC_KEY_TYPE = {
  SECP256K1: 'tendermint/PubKeySecp256k1',
  ETH_SECP256K1: 'ethermint/PubKeyEthSecp256k1',
  INJ_SECP256K1: 'injective/PubKeyEthSecp256k1',
  INIT_SECP256K1: 'initia/PubKeyEthSecp256k1',
} as const;

export const PUBKEY_STYLE = {
  secp256k1: 'secp256k1',
  ethsecp256k1: 'ethsecp256k1',
};

export const PUBKEY_TYPE_MAP = {
  [PUBKEY_STYLE.secp256k1]: '/cosmos.crypto.secp256k1.PubKey',
  [PUBKEY_STYLE.ethsecp256k1]: '/ethermint.crypto.v1.ethsecp256k1.PubKey',
};

export const COSMOS_TYPE = {
  BASIC: '',
  ETHERMINT: 'ETHERMINT',
} as const;
