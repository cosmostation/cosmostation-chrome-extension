import encHex from 'crypto-js/enc-hex';
import sha256 from 'crypto-js/sha256';
import { keccak256 } from 'ethers/crypto';
import sortKeys from 'sort-keys';
import ecc from '@bitcoinerlab/secp256k1';

import { PUBLIC_KEY_TYPE } from '@/constants/cosmos';
import { COSMOS_CHAINLIST_ID } from '@/constants/cosmos/chain';
import { COSMOS_EUREKA_CONTRCT_LIST } from '@/constants/cosmos/eureka';
import { cosmos } from '@/proto/cosmos-sdk-v0.47.4.js';
import type { CosmosChain } from '@/types/chain';
import type {
  Msg,
  MsgCancelUnbondingDelegation,
  MsgCommission,
  MsgDelegation,
  MsgExecuteContract,
  MsgReward,
  MsgSend,
  MsgSignData,
  MsgSwapExactAmountIn,
  MsgTransfer,
  MsgUndelegation,
  SignAminoDoc,
} from '@/types/cosmos/amino';
import type { EurekaContract, SignDirectDoc } from '@/types/cosmos/direct';

import { toUint8Array } from '../crypto';

export function signAmino(signDoc: SignAminoDoc, privateKey: Buffer, chain: CosmosChain) {
  const sha256SignDoc = (() => {
    const { accountTypes } = chain;
    const { pubkeyStyle } = accountTypes[0];
    if (pubkeyStyle === 'keccak256') {
      return keccak256(Buffer.from(JSON.stringify(sortKeys(signDoc, { deep: true })))).substring(2);
    }

    return sha256(JSON.stringify(sortKeys(signDoc, { deep: true }))).toString(encHex);
  })();

  const signatureBuffer = ecc.sign(Buffer.from(sha256SignDoc, 'hex'), privateKey);

  return signatureBuffer;
}

export function signDirect(signDoc: SignDirectDoc, privateKey: Buffer, chain: CosmosChain) {
  const txSignDoc = new cosmos.tx.v1beta1.SignDoc({
    ...signDoc,
    auth_info_bytes: toUint8Array(signDoc.auth_info_bytes),
    body_bytes: toUint8Array(signDoc.body_bytes),
    account_number: Number(signDoc.account_number),
  });

  const txSignDocHex = Buffer.from(cosmos.tx.v1beta1.SignDoc.encode(txSignDoc).finish()).toString('hex');

  const sha256SignDoc = (() => {
    const { accountTypes } = chain;
    const { pubkeyStyle } = accountTypes[0];

    if (pubkeyStyle === 'keccak256') {
      return keccak256(Buffer.from(txSignDocHex, 'hex')).substring(2);
    }
    return sha256(encHex.parse(txSignDocHex)).toString(encHex);
  })();

  const signatureBuffer = ecc.sign(Buffer.from(sha256SignDoc, 'hex'), privateKey);

  return signatureBuffer;
}

export const getPublicKeyType = (pubkeyType: string) => {
  if (pubkeyType === '/injective.crypto.v1beta1.ethsecp256k1.PubKey') {
    return PUBLIC_KEY_TYPE.INJ_SECP256K1;
  }

  if (pubkeyType === '/ethermint.crypto.v1.ethsecp256k1.PubKey') {
    return PUBLIC_KEY_TYPE.ETH_SECP256K1;
  }

  if (pubkeyType === '/initia.crypto.v1beta1.ethsecp256k1.PubKey') {
    return PUBLIC_KEY_TYPE.INIT_SECP256K1;
  }

  return PUBLIC_KEY_TYPE.SECP256K1;
};

export function isAminoSend(msg: Msg): msg is Msg<MsgSend> {
  return msg.type === 'cosmos-sdk/MsgSend' || msg.type === 'bank/MsgSend';
}

export function isAminoIBCSend(msg: Msg): msg is Msg<MsgTransfer> {
  return msg.type === 'cosmos-sdk/MsgTransfer';
}

export function isAminoDelegation(msg: Msg): msg is Msg<MsgDelegation> {
  return msg.type === 'cosmos-sdk/MsgDelegate';
}

export function isAminoUndelegation(msg: Msg): msg is Msg<MsgUndelegation> {
  return msg.type === 'cosmos-sdk/MsgUndelegate';
}

export function isAminoCancelUnbondingDelegation(msg: Msg): msg is Msg<MsgCancelUnbondingDelegation> {
  return msg.type === 'cosmos-sdk/MsgCancelUnbondingDelegation';
}

export function isAminoReward(msg: Msg): msg is Msg<MsgReward> {
  return msg.type === 'cosmos-sdk/MsgWithdrawDelegationReward';
}

export function isAminoCommission(msg: Msg): msg is Msg<MsgCommission> {
  return msg.type === 'cosmos-sdk/MsgWithdrawValidatorCommission';
}

export function isAminoSwapExactAmountIn(msg: Msg): msg is Msg<MsgSwapExactAmountIn> {
  return msg.type === 'osmosis/gamm/swap-exact-amount-in' || msg.type === 'osmosis/poolmanager/swap-exact-amount-in';
}

export function isAminoExecuteContract(msg: Msg): msg is Msg<MsgExecuteContract> {
  return msg.type === 'wasm/MsgExecuteContract';
}

export function isAminoExecuteEurekaContract(chain: CosmosChain, msg: Msg): msg is Msg<MsgExecuteContract<EurekaContract>> {
  const isContract = isAminoExecuteContract(msg);

  if (isContract) {
    const isCosmosChain = chain.chainId == COSMOS_CHAINLIST_ID;
    const isEurekaContract = COSMOS_EUREKA_CONTRCT_LIST.includes(msg.value.contract);
    return isCosmosChain && isEurekaContract;
  }

  return false;
}

export function isAminoMsgSignData(msg: Msg): msg is Msg<MsgSignData> {
  return msg.type === 'sign/MsgSignData';
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
