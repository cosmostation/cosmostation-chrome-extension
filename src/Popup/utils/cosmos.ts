import { bech32 } from 'bech32';
import encHex from 'crypto-js/enc-hex';
import ripemd160 from 'crypto-js/ripemd160';
import sha256 from 'crypto-js/sha256';
import { Address, toChecksumAddress } from 'ethereumjs-util';
import sortKeys from 'sort-keys';
import TinySecp256k1 from 'tiny-secp256k1';
import { keccak256 } from '@ethersproject/keccak256';

import { COSMOS_CHAINS } from '~/constants/chain';
import { ASSET_MANTLE } from '~/constants/chain/cosmos/assetMantle';
import { CRYPTO_ORG } from '~/constants/chain/cosmos/cryptoOrg';
import { EMONEY } from '~/constants/chain/cosmos/emoney';
import { FETCH_AI } from '~/constants/chain/cosmos/fetchAi';
import { GRAVITY_BRIDGE } from '~/constants/chain/cosmos/gravityBridge';
import { INJECTIVE } from '~/constants/chain/cosmos/injective';
import { IXO } from '~/constants/chain/cosmos/ixo';
import { KAVA } from '~/constants/chain/cosmos/kava';
import { KI } from '~/constants/chain/cosmos/ki';
import { SIF } from '~/constants/chain/cosmos/sif';
import { STAFIHUB } from '~/constants/chain/cosmos/stafihub';
import { STARNAME } from '~/constants/chain/cosmos/starname';
import { PUBLIC_KEY_TYPE } from '~/constants/cosmos';
import { cosmos } from '~/proto/cosmos-v0.44.2.js';
import type { CosmosChain } from '~/types/chain';
import type { Msg, MsgCustom, MsgExecuteContract, MsgReward, MsgSend, MsgSignData, MsgTransfer, SignAminoDoc } from '~/types/cosmos/amino';
import type { SignDirectDoc } from '~/types/cosmos/proto';

import { toHex } from './string';

export function cosmosURL(chain: CosmosChain) {
  const { restURL, chainName } = chain;

  const isV1BetaClientState = [IXO.id, STARNAME.id, EMONEY.id].includes(chain.id);
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
    getCW20TokenInfo: (contractAddress: string) => `${restURL}/wasm/contract/${contractAddress}/smart/${toHex('{"token_info":{}}')}?encoding=utf-8`,
    getCW20Balance: (contractAddress: string, address: string) =>
      `${restURL}/wasm/contract/${contractAddress}/smart/${toHex(`{"balance":{"address":"${address}"}}`)}?encoding=utf-8`,
    getClientState: (channelId: string, port?: string) =>
      `${restURL}/ibc/core/channel/${isV1BetaClientState ? 'v1beta1' : 'v1'}/channels/${channelId}/ports/${port || 'transfer'}/client_state`,
    simulate: () => `${restURL}/cosmos/tx/v1beta1/simulate`,
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

export function isAminoIBCSend(msg: Msg): msg is Msg<MsgTransfer> {
  return msg.type === 'cosmos-sdk/MsgTransfer' || msg.type === 'bank/MsgTransfer';
}

export function isAminoReward(msg: Msg): msg is Msg<MsgReward> {
  return msg.type === 'cosmos-sdk/MsgWithdrawDelegationReward';
}

export function isAminoExecuteContract(msg: Msg): msg is Msg<MsgExecuteContract> {
  return msg.type === 'wasm/MsgExecuteContract';
}

export function isAminoMsgSignData(msg: Msg): msg is Msg<MsgSignData> {
  return msg.type === 'sign/MsgSignData';
}

export function isAminoCustom(msg: Msg): msg is Msg<MsgCustom> {
  return true;
}

export function convertCosmosToAssetName(cosmosChain: CosmosChain) {
  const nameMap = {
    [CRYPTO_ORG.id]: 'cryptoorg',
    [ASSET_MANTLE.id]: 'asset-mantle',
    [GRAVITY_BRIDGE.id]: 'gravity-bridge',
    [SIF.id]: 'sifchain',
    [KI.id]: 'kichain',
    [STAFIHUB.id]: 'stafi',
    [FETCH_AI.id]: 'fetchai',
  };
  return nameMap[cosmosChain.id] || cosmosChain.chainName.toLowerCase();
}

export function convertAssetNameToCosmos(assetName: string) {
  const nameMap = {
    cryptoorg: CRYPTO_ORG,
    'asset-mantle': ASSET_MANTLE,
    'gravity-bridge': GRAVITY_BRIDGE,
    sifchain: SIF,
    kichain: KI,
    stafi: STAFIHUB,
    fetchai: FETCH_AI,
  } as Record<string, CosmosChain | undefined>;

  return nameMap[assetName] || COSMOS_CHAINS.find((item) => item.chainName.toLowerCase() === assetName);
}

export function getMsgSignData(signer: string, message: string) {
  return {
    account_number: '0',
    chain_id: '',
    fee: {
      amount: [],
      gas: '0',
    },
    memo: '',
    msgs: [
      {
        type: 'sign/MsgSignData',
        value: {
          data: Buffer.from(message, 'utf8').toString('base64'),
          signer,
        },
      },
    ],
    sequence: '0',
  };
}
