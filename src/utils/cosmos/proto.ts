import Long from 'long';
import { MsgSend as KeplrMsgSend } from '@keplr-wallet/proto-types/cosmos/bank/v1beta1/tx';
import { PubKey as KeplrPubkey } from '@keplr-wallet/proto-types/cosmos/crypto/secp256k1/keys';
import {
  MsgWithdrawDelegatorReward as KeplrMsgWithdrawDelegatorReward,
  MsgWithdrawValidatorCommission as KeplrMsgWithdrawValidatorCommission,
} from '@keplr-wallet/proto-types/cosmos/distribution/v1beta1/Tx';
import {
  MsgCancelUnbondingDelegation as KeplrMsgCancelUnbondingDelegation,
  MsgDelegate as KeplrMsgDelegate,
  MsgUndelegate as KeplrMsgUndelegate,
} from '@keplr-wallet/proto-types/cosmos/staking/v1beta1/tx';
import { SignMode } from '@keplr-wallet/proto-types/cosmos/tx/signing/v1beta1/signing';
import { AuthInfo, Fee, SignerInfo, TxBody, TxRaw } from '@keplr-wallet/proto-types/cosmos/tx/v1beta1/tx';
import { MsgExecuteContract as KeplrMsgExecuteContract } from '@keplr-wallet/proto-types/cosmwasm/wasm/v1/tx';
import { Any } from '@keplr-wallet/proto-types/google/protobuf/any';
import { MsgTransfer as KeplrMsgTransfer } from '@keplr-wallet/proto-types/ibc/applications/transfer/v1/tx';

import { COSMOS_CHAINLIST_ID } from '@/constants/cosmos/chain';
import { COSMOS_EUREKA_CONTRCT_LIST } from '@/constants/cosmos/eureka';
import { COSMOS_DUMMY_SIGNATURE } from '@/constants/cosmos/sign';
// import { cosmos, google } from '@/proto/cosmos-sdk-v0.47.4.js';
import type { CosmosChain } from '@/types/chain';
import type {
  Msg,
  MsgCancelUnbondingDelegation,
  MsgCommission,
  MsgDelegation,
  MsgExecuteContract,
  MsgReward,
  MsgSend,
  // MsgSwapExactAmountIn,
  MsgTransfer,
  MsgUndelegation,
  SignAminoDoc,
} from '@/types/cosmos/amino';
import type { SendTransactionPayload } from '@/types/cosmos/common';
import type {
  EurekaContract,
  Msg as ProtoMsg,
  MsgCommission as ProtoMsgCommission,
  MsgExecuteContract as ProtoMsgExecuteContract,
  MsgSend as ProtoMsgSend,
  MsgTransfer as ProtoMsgTransfer,
  MsgTransfer2,
  ProtoTxBytesProps,
  PubKey,
} from '@/types/cosmos/direct';

import {
  isAminoCancelUnbondingDelegation,
  isAminoCommission,
  isAminoDelegation,
  isAminoExecuteContract,
  isAminoIBCSend,
  isAminoReward,
  isAminoSend,
  // isAminoSwapExactAmountIn,
  isAminoUndelegation,
} from './msg';
import { post } from '../axios';

export function convertAminoMessageToProto(msg: Msg) {
  if (isAminoSend(msg)) {
    return convertAminoSendMessageToProto(msg);
  }

  if (isAminoExecuteContract(msg)) {
    return convertAminoExecuteContractMessageToProto(msg);
  }

  if (isAminoIBCSend(msg)) {
    return convertIBCAminoSendMessageToProto(msg);
  }

  if (isAminoDelegation(msg)) {
    return convertAminoDelegationMessageToProto(msg);
  }

  if (isAminoUndelegation(msg)) {
    return convertAminoUndelegationMessageToProto(msg);
  }
  if (isAminoCancelUnbondingDelegation(msg)) {
    return convertAminoCancelUnbondingMessageToProto(msg);
  }

  if (isAminoReward(msg)) {
    return convertAminoRewardMessageToProto(msg);
  }

  if (isAminoCommission(msg)) {
    return convertAminoCommissionMessageToProto(msg);
  }

  return null;
}

export function convertAminoSendMessageToProto(msg: Msg<MsgSend>) {
  const message = KeplrMsgSend.fromPartial({
    amount: msg.value.amount,
    fromAddress: msg.value.from_address,
    toAddress: msg.value.to_address,
  });

  return Any.fromPartial({
    typeUrl: '/cosmos.bank.v1beta1.MsgSend',
    value: KeplrMsgSend.encode(message).finish(),
  });
}

export function convertIBCAminoSendMessageToProto(msg: Msg<MsgTransfer>) {
  return Any.fromPartial({
    typeUrl: '/ibc.applications.transfer.v1.MsgTransfer',
    value: KeplrMsgTransfer.encode(
      KeplrMsgTransfer.fromPartial({
        sourcePort: msg.value.source_port,
        sourceChannel: msg.value.source_channel,
        token: msg.value.token,
        sender: msg.value.sender,
        receiver: msg.value.receiver,
        timeoutHeight: {
          revisionHeight: String(msg.value.timeout_height.revision_height),
          revisionNumber: String(msg.value.timeout_height.revision_number),
        },
        timeoutTimestamp: String(msg.value.timeout_timestamp),
        memo: msg.value.memo,
      }),
    ).finish(),
  });
}

export function convertAminoDelegationMessageToProto(msg: Msg<MsgDelegation>) {
  const message = KeplrMsgDelegate.fromPartial({
    amount: msg.value.amount,
    delegatorAddress: msg.value.delegator_address,
    validatorAddress: msg.value.validator_address,
  });

  return Any.fromPartial({
    typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
    value: KeplrMsgDelegate.encode(message).finish(),
  });
}

export function convertAminoUndelegationMessageToProto(msg: Msg<MsgUndelegation>) {
  const message = KeplrMsgUndelegate.fromPartial({
    amount: msg.value.amount,
    delegatorAddress: msg.value.delegator_address,
    validatorAddress: msg.value.validator_address,
  });

  return Any.fromPartial({
    typeUrl: '/cosmos.staking.v1beta1.MsgUndelegate',
    value: KeplrMsgUndelegate.encode(message).finish(),
  });
}

export function convertAminoCancelUnbondingMessageToProto(msg: Msg<MsgCancelUnbondingDelegation>) {
  const message = KeplrMsgCancelUnbondingDelegation.fromPartial({
    amount: msg.value.amount,
    delegatorAddress: msg.value.delegator_address,
    validatorAddress: msg.value.validator_address,
    creationHeight: String(msg.value.creation_height),
  });

  return Any.fromPartial({
    typeUrl: '/cosmos.staking.v1beta1.MsgCancelUnbondingDelegation',
    value: KeplrMsgCancelUnbondingDelegation.encode(message).finish(),
  });
}

export function convertAminoExecuteContractMessageToProto(msg: Msg<MsgExecuteContract>) {
  const message = KeplrMsgExecuteContract.fromPartial({
    sender: msg.value.sender,
    contract: msg.value.contract,
    funds: msg.value.funds,
    msg: Buffer.from(JSON.stringify(msg.value.msg)),
  });

  return Any.fromPartial({
    typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
    value: KeplrMsgExecuteContract.encode(message).finish(),
  });
}

export function convertAminoRewardMessageToProto(msg: Msg<MsgReward>) {
  const message = KeplrMsgWithdrawDelegatorReward.fromPartial({
    delegatorAddress: msg.value.delegator_address,
    validatorAddress: msg.value.validator_address,
  });

  return Any.fromPartial({
    typeUrl: '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
    value: KeplrMsgWithdrawDelegatorReward.encode(message).finish(),
  });
}

export function convertAminoCommissionMessageToProto(msg: Msg<MsgCommission>) {
  const message = KeplrMsgWithdrawValidatorCommission.fromPartial({
    validatorAddress: msg.value.validator_address,
  });

  return Any.fromPartial({
    typeUrl: '/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission',
    value: KeplrMsgWithdrawValidatorCommission.encode(message).finish(),
  });
}

export function getTxBodyBytes(signed: SignAminoDoc): Uint8Array | null {
  const messages = signed.msgs.map((msg) => convertAminoMessageToProto(msg)).filter((item): item is Any => item !== null);

  if (signed.msgs.length !== messages.length) {
    return null;
  }

  const txBody = TxBody.fromPartial({
    messages,
    memo: signed.memo,
  });

  return TxBody.encode(txBody).finish();
}

export function getAuthInfoBytes(signed: SignAminoDoc, pubKey: PubKey, mode = SignMode.SIGN_MODE_LEGACY_AMINO_JSON) {
  const signerInfo = getSignerInfo(signed, pubKey, mode);

  const fee = Fee.fromPartial({
    amount: signed.fee.amount,
    gasLimit: signed.fee.gas,
  });

  const authInfo = AuthInfo.fromPartial({ signerInfos: [signerInfo], fee });

  return AuthInfo.encode(authInfo).finish();
}

export function getSignerInfo(signed: SignAminoDoc, pubKey: PubKey, mode = SignMode.SIGN_MODE_LEGACY_AMINO_JSON) {
  const publicKey = getPubKey(pubKey);

  return SignerInfo.fromPartial({
    publicKey: {
      typeUrl: pubKey.type,
      value: KeplrPubkey.encode(publicKey).finish(),
    },
    modeInfo: {
      single: {
        mode,
      },
    },
    sequence: signed.sequence,
  });
}

export function getPubKey(pubKey: PubKey) {
  const bufferPubKey = Buffer.from(pubKey.value, 'base64');
  const publicKey = KeplrPubkey.fromPartial({ key: bufferPubKey });
  return publicKey;
}

export function protoTx(signed: SignAminoDoc, signatures: string[], pubKey: PubKey, mode = SignMode.SIGN_MODE_LEGACY_AMINO_JSON) {
  const txBodyBytes = getTxBodyBytes(signed);

  if (txBodyBytes === null) {
    return null;
  }

  const authInfoBytes = getAuthInfoBytes(signed, pubKey, mode);

  return { signatures, txBodyBytes, authInfoBytes };
}
enum BroadcastMode {
  BROADCAST_MODE_UNSPECIFIED = 0,
  BROADCAST_MODE_BLOCK = 1,
  BROADCAST_MODE_SYNC = 2,
  BROADCAST_MODE_ASYNC = 3,
}

export function protoTxBytes({ signatures, txBodyBytes, authInfoBytes }: ProtoTxBytesProps) {
  const resolvedSignatures = signatures.map((item) => (!item ? COSMOS_DUMMY_SIGNATURE : item));

  const txRaw = TxRaw.fromPartial({
    bodyBytes: new Uint8Array(txBodyBytes),
    authInfoBytes: new Uint8Array(authInfoBytes),
    signatures: resolvedSignatures.map((signature) => Buffer.from(signature, 'base64')),
  });
  const txRawBytes = TxRaw.encode(txRaw).finish();

  const tx = {
    tx_bytes: Buffer.from(txRawBytes).toString('base64'),
    mode: BroadcastMode.BROADCAST_MODE_SYNC,
  };

  return tx;
}

export function broadcast(url: string, body: unknown) {
  return post<SendTransactionPayload>(url, body);
}

export function decodeProtobufMessage(msg: Any) {
  if (msg.typeUrl === '/cosmos.bank.v1beta1.MsgSend') {
    const originValue = KeplrMsgSend.decode(msg.value!);

    const mappedValue: ProtoMsgSend = {
      from_address: originValue.fromAddress,
      to_address: originValue.toAddress,
      amount: originValue.amount,
    };

    return { type_url: msg.typeUrl, value: mappedValue } as ProtoMsg<ProtoMsgSend>;
  }

  if (msg.typeUrl === '/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission') {
    const originValue = KeplrMsgWithdrawValidatorCommission.decode(msg.value!);

    const mappedValue: ProtoMsgCommission = {
      validator_address: originValue.validatorAddress,
    };

    return { type_url: msg.typeUrl, value: mappedValue } as ProtoMsg<ProtoMsgCommission>;
  }

  if (msg.typeUrl === '/ibc.applications.transfer.v1.MsgTransfer') {
    const originValue = KeplrMsgTransfer.decode(msg.value!);

    const mappedValue: MsgTransfer2 = {
      receiver: originValue.receiver,
      sender: originValue.sender,
      source_channel: originValue.sourceChannel,
      source_port: originValue.sourcePort,
      timeout_height: {
        revision_height: originValue.timeoutHeight?.revisionHeight ? new Long(Number(originValue.timeoutHeight?.revisionHeight)) : undefined,
        revision_number: originValue.timeoutHeight?.revisionNumber ? new Long(Number(originValue.timeoutHeight?.revisionNumber)) : undefined,
      },
      timeout_timestamp: new Long(Number(originValue.timeoutTimestamp)),
      token: originValue.token,

      memo: originValue.memo,
    };
    return { type_url: msg.typeUrl, value: mappedValue } as ProtoMsg<MsgTransfer2>;
  }

  if (msg.typeUrl === '/cosmwasm.wasm.v1.MsgExecuteContract') {
    const originValue = KeplrMsgExecuteContract.decode(msg.value!);

    const mappedValue: ProtoMsgExecuteContract = {
      sender: originValue.sender,
      contract: originValue.contract,
      msg: originValue.msg,
      funds: originValue.funds,
    };

    return { type_url: msg.typeUrl, value: mappedValue } as ProtoMsg<ProtoMsgExecuteContract>;
  }

  return { type_url: msg.typeUrl, value: msg.value ? Buffer.from(msg.value).toString('hex') : '' } as ProtoMsg<string>;
}

export function isDirectSend(msg: ProtoMsg): msg is ProtoMsg<ProtoMsgSend> {
  return msg.type_url === '/cosmos.bank.v1beta1.MsgSend';
}

export function isDirectCommission(msg: ProtoMsg): msg is ProtoMsg<ProtoMsgCommission> {
  return msg.type_url === '/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission';
}

export function isDirectIBCSend(msg: ProtoMsg): msg is ProtoMsg<ProtoMsgTransfer> {
  return msg.type_url === '/ibc.applications.transfer.v1.MsgTransfer';
}

export function isDirectExecuteContract(msg: ProtoMsg): msg is ProtoMsg<ProtoMsgExecuteContract> {
  return msg.type_url === '/cosmwasm.wasm.v1.MsgExecuteContract';
}

export function isDirectExecuteEurekaContract(chain: CosmosChain, msg: ProtoMsg): msg is ProtoMsg<ProtoMsgExecuteContract<EurekaContract>> {
  const isContract = isDirectExecuteContract(msg);

  if (isContract) {
    const isCosmosChain = chain.id == COSMOS_CHAINLIST_ID;
    const isEurekaContract = COSMOS_EUREKA_CONTRCT_LIST.includes(msg.value.contract);
    return isCosmosChain && isEurekaContract;
  }

  return false;
}

export function convertDirectMsgTypeToAminoMsgType(typeUrl: string) {
  if (typeUrl === '/cosmos.bank.v1beta1.MsgSend') {
    return 'cosmos-sdk/MsgSend';
  }
  if (typeUrl === '/ibc.applications.transfer.v1.MsgTransfer') {
    return 'cosmos-sdk/MsgTransfer';
  }
  if (typeUrl === '/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission') {
    return 'cosmos-sdk/MsgWithdrawValidatorCommission';
  }
  if (typeUrl === '/cosmwasm.wasm.v1.MsgExecuteContract') {
    return 'wasm/MsgExecuteContract';
  }

  return '';
}

export function convertAminoMsgTypeToDirectMsgType(typeUrl: string) {
  if (typeUrl === 'cosmos-sdk/MsgSend') {
    return '/cosmos.bank.v1beta1.MsgSend';
  }
  if (typeUrl === 'cosmos-sdk/MsgTransfer') {
    return '/ibc.applications.transfer.v1.MsgTransfer';
  }
  if (typeUrl === 'cosmos-sdk/MsgWithdrawValidatorCommission') {
    return '/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission';
  }
  if (typeUrl === 'wasm/MsgExecuteContract') {
    return '/cosmwasm.wasm.v1.MsgExecuteContract';
  }

  return '';
}
