import { bech32 } from 'bech32';
import encHex from 'crypto-js/enc-hex';
import ripemd160 from 'crypto-js/ripemd160';
import sha256 from 'crypto-js/sha256';
import { Address, toChecksumAddress } from 'ethereumjs-util';
import sortKeys from 'sort-keys';
import TinySecp256k1 from 'tiny-secp256k1';
import { keccak256 } from '@ethersproject/keccak256';

import { INJECTIVE } from '~/constants/chain/cosmos/injective';
import { KAVA } from '~/constants/chain/cosmos/kava';
import { PUBLIC_KEY_TYPE } from '~/constants/cosmos';
import { cosmos } from '~/proto/cosmos.js';
import type { CosmosChain } from '~/types/chain';
import type { Msg, MsgCustom, MsgSend, SignAminoDoc } from '~/types/cosmos/amino';
import type { SignDirectDoc } from '~/types/cosmos/proto';

export function cosmosURL(chain: CosmosChain) {
  const { restURL, chainName } = chain;

  // reward 중첩 typing!
  return {
    getNodeInfo: () => `${restURL}/node_info`,
    getBalance: (address: string) => `${restURL}/cosmos/bank/v1beta1/balances/${address}?pagination.limit=10000`,
    getDelegations: (address: string) => `${restURL}/cosmos/staking/v1beta1/delegations/${address}`,
    getRewards: (address: string) => `${restURL}/cosmos/distribution/v1beta1/delegators/${address}/rewards`,
    getUndelegations: (address: string) => `${restURL}/cosmos/staking/v1beta1/delegators/${address}/unbonding_delegations`,
    getAccount: (address: string) => `${restURL}/cosmos/auth/v1beta1/accounts/${address}`,
    getIncentive: (address: string) => (chainName === KAVA.chainName ? `${restURL}/incentive/rewards?owner=${address}` : ''),
    postBroadcast: () => `${restURL}/cosmos/tx/v1beta1/txs`,
  };
}

export function getAddress(publicKey: Buffer, prefix: string) {
  const encodedBySha256 = sha256(encHex.parse(publicKey.toString('hex'))).toString(encHex);

  const encodedByRipemd160 = ripemd160(encHex.parse(encodedBySha256)).toString(encHex);

  const words = bech32.toWords(Buffer.from(encodedByRipemd160, 'hex'));
  const result = bech32.encode(prefix, words);

  return result;
}

export function getAddressForEthermint(publicKey: Buffer, prefix: string) {
  const uncompressedPublicKey = Buffer.from(TinySecp256k1.pointCompress(publicKey, false).slice(1));

  const address = toChecksumAddress(Address.fromPublicKey(uncompressedPublicKey).toString());

  const words = bech32.toWords(Buffer.from(address.substring(2), 'hex'));
  const result = bech32.encode(prefix, words);

  return result;
}

export function signAmino(signDoc: SignAminoDoc, privateKey: Buffer, chain: CosmosChain) {
  const sha256SignDoc = (() => {
    if (chain.type === 'ETHERMINT') {
      return keccak256(Buffer.from(JSON.stringify(sortKeys(signDoc, { deep: true })))).substring(2);
    }

    return sha256(JSON.stringify(sortKeys(signDoc, { deep: true }))).toString(encHex);
  })();

  const signatureBuffer = TinySecp256k1.sign(Buffer.from(sha256SignDoc, 'hex'), privateKey);

  return signatureBuffer;
}

export function signDirect(signDoc: SignDirectDoc, privateKey: Buffer, chain: CosmosChain) {
  const txSignDoc = new cosmos.tx.v1beta1.SignDoc({ ...signDoc, account_number: Number(signDoc.account_number) });

  const txSignDocHex = Buffer.from(cosmos.tx.v1beta1.SignDoc.encode(txSignDoc).finish()).toString('hex');

  const sha256SignDoc = (() => {
    if (chain.type === 'ETHERMINT') {
      return keccak256(Buffer.from(txSignDocHex, 'hex')).substring(2);
    }
    return sha256(encHex.parse(txSignDocHex)).toString(encHex);
  })();

  const signatureBuffer = TinySecp256k1.sign(Buffer.from(sha256SignDoc, 'hex'), privateKey);

  return signatureBuffer;
}

export const getPublicKeyType = (chain: CosmosChain) => {
  if (chain.chainName === INJECTIVE.chainName) {
    return PUBLIC_KEY_TYPE.INJ_SECP256K1;
  }

  if (chain.type === 'ETHERMINT') {
    return PUBLIC_KEY_TYPE.ETH_SECP256K1;
  }

  return PUBLIC_KEY_TYPE.SECP256K1;
};

export function isAminoSend(msg: Msg): msg is Msg<MsgSend> {
  return msg.type === 'cosmos-sdk/MsgSend' || msg.type === 'bank/MsgSend';
}

export function isAminoCustom(msg: Msg): msg is Msg<MsgCustom> {
  return true;
}
