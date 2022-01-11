import { bech32 } from 'bech32';
import encHex from 'crypto-js/enc-hex';
import ripemd160 from 'crypto-js/ripemd160';
import sha256 from 'crypto-js/sha256';

import type { CosmosChain } from '~/types/chain';

export function cosmosURL(chain: CosmosChain) {
  const { restURL } = chain;

  return {
    getBalance: (address: string) => `${restURL}/bank/balances/${address}`,
    getDelegations: (address: string) => `${restURL}/staking/delegators/${address}/delegations`,
    getRewards: (address: string) => `${restURL}/distribution/delegators/${address}/rewards`,
    getUnbondingDelegations: (address: string) => `${restURL}/staking/delegators/${address}/unbonding_delegations`,
    getAccount: (address: string) => `${restURL}/auth/accounts/${address}`,
    getWithdrawAddress: (address: string) => `${restURL}/distribution/delegators/${address}/withdraw_address`,
  };
}

export function getAddress(publicKey: Buffer, prefix: string) {
  const encodedBySha256 = sha256(encHex.parse(publicKey.toString('hex'))).toString(encHex);

  const encodedByRipemd160 = ripemd160(encHex.parse(encodedBySha256)).toString(encHex);

  const words = bech32.toWords(Buffer.from(encodedByRipemd160, 'hex'));
  const result = bech32.encode(prefix, words);

  return result;
}
