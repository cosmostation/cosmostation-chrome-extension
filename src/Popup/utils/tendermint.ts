import { bech32 } from 'bech32';
import encHex from 'crypto-js/enc-hex';
import ripemd160 from 'crypto-js/ripemd160';
import sha256 from 'crypto-js/sha256';
import sortKeys from 'sort-keys';
import TinySecp256k1 from 'tiny-secp256k1';

import { cosmos } from '~/proto/cosmos.js';
import type { TendermintChain } from '~/types/chain';
import type { SignAminoDoc, SignDirectDoc } from '~/types/tendermint';

export function tendermintURL(chain: TendermintChain) {
  const { restURL } = chain;

  return {
    getNodeInfo: () => `${restURL}/node_info`,
    getBalance: (address: string) => `${restURL}/bank/balances/${address}`,
    getDelegations: (address: string) => `${restURL}/staking/delegators/${address}/delegations`,
    getRewards: (address: string) => `${restURL}/distribution/delegators/${address}/rewards`,
    getUndelegations: (address: string) => `${restURL}/staking/delegators/${address}/unbonding_delegations`,
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

export function signAmino(signDoc: SignAminoDoc, privateKey: Buffer) {
  const sha256SignDoc = sha256(JSON.stringify(sortKeys(signDoc, { deep: true }))).toString(encHex);

  const signatureBuffer = TinySecp256k1.sign(Buffer.from(sha256SignDoc, 'hex'), privateKey);

  return signatureBuffer;
}

export function signDirect(signDoc: SignDirectDoc, privateKey: Buffer) {
  const txSignDoc = new cosmos.tx.v1beta1.SignDoc({ ...signDoc, account_number: Number(signDoc.account_number) });

  const txSignDocHex = Buffer.from(cosmos.tx.v1beta1.SignDoc.encode(txSignDoc).finish()).toString('hex');

  const sha256SignDoc = sha256(encHex.parse(txSignDocHex)).toString(encHex);

  const signatureBuffer = TinySecp256k1.sign(Buffer.from(sha256SignDoc, 'hex'), privateKey);

  return signatureBuffer;
}
