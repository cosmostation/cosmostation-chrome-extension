import { COSMOS_CHAINLIST_ID } from '@/constants/cosmos/chain';
import { COSMOS_EUREKA_CONTRCT_LIST } from '@/constants/cosmos/eureka';
import { cosmos, google } from '@/proto/cosmos-sdk-v0.47.4.js';
import { cosmwasm } from '@/proto/cosmwasm-v0.28.0.js';
import { ibc } from '@/proto/ibc-v7.1.0.js';
import { osmosis } from '@/proto/osmosis-v13.1.2.js';
import type { CosmosChain } from '@/types/chain';
import type {
  Msg,
  MsgCancelUnbondingDelegation,
  MsgCommission,
  MsgDelegation,
  MsgExecuteContract,
  MsgReward,
  MsgSend,
  MsgSwapExactAmountIn,
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
  isAminoSwapExactAmountIn,
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

  if (isAminoSwapExactAmountIn(msg)) {
    return convertAminoSwapExactAmmountInMessageToProto(msg);
  }

  return null;
}

export function convertAminoSendMessageToProto(msg: Msg<MsgSend>) {
  const message = new cosmos.bank.v1beta1.MsgSend({
    amount: msg.value.amount,
    from_address: msg.value.from_address,
    to_address: msg.value.to_address,
  });

  return new google.protobuf.Any({
    type_url: '/cosmos.bank.v1beta1.MsgSend',
    value: cosmos.bank.v1beta1.MsgSend.encode(message).finish(),
  });
}

export function convertIBCAminoSendMessageToProto(msg: Msg<MsgTransfer>) {
  const message = new ibc.applications.transfer.v1.MsgTransfer({
    source_port: msg.value.source_port,
    source_channel: msg.value.source_channel,
    token: msg.value.token,
    sender: msg.value.sender,
    receiver: msg.value.receiver,
    timeout_height: {
      revision_height: msg.value.timeout_height.revision_height as unknown as Long,
      revision_number: msg.value.timeout_height.revision_number as unknown as Long,
    },
    timeout_timestamp: msg.value.timeout_timestamp as unknown as Long,
    memo: msg.value.memo,
  });

  return new google.protobuf.Any({
    type_url: '/ibc.applications.transfer.v1.MsgTransfer',
    value: ibc.applications.transfer.v1.MsgTransfer.encode(message).finish(),
  });
}

export function convertAminoDelegationMessageToProto(msg: Msg<MsgDelegation>) {
  const message = new cosmos.staking.v1beta1.MsgDelegate({
    amount: msg.value.amount,
    delegator_address: msg.value.delegator_address,
    validator_address: msg.value.validator_address,
  });

  return new google.protobuf.Any({
    type_url: '/cosmos.staking.v1beta1.MsgDelegate',
    value: cosmos.staking.v1beta1.MsgDelegate.encode(message).finish(),
  });
}

export function convertAminoUndelegationMessageToProto(msg: Msg<MsgUndelegation>) {
  const message = new cosmos.staking.v1beta1.MsgUndelegate({
    amount: msg.value.amount,
    delegator_address: msg.value.delegator_address,
    validator_address: msg.value.validator_address,
  });

  return new google.protobuf.Any({
    type_url: '/cosmos.staking.v1beta1.MsgUndelegate',
    value: cosmos.staking.v1beta1.MsgUndelegate.encode(message).finish(),
  });
}

export function convertAminoCancelUnbondingMessageToProto(msg: Msg<MsgCancelUnbondingDelegation>) {
  const message = new cosmos.staking.v1beta1.MsgCancelUnbondingDelegation({
    amount: msg.value.amount,
    delegator_address: msg.value.delegator_address,
    validator_address: msg.value.validator_address,
    creation_height: msg.value.creation_height,
  });

  return new google.protobuf.Any({
    type_url: '/cosmos.staking.v1beta1.MsgCancelUnbondingDelegation',
    value: cosmos.staking.v1beta1.MsgCancelUnbondingDelegation.encode(message).finish(),
  });
}

export function convertAminoExecuteContractMessageToProto(msg: Msg<MsgExecuteContract>) {
  const message = new cosmwasm.wasm.v1.MsgExecuteContract({
    sender: msg.value.sender,
    contract: msg.value.contract,
    funds: msg.value.funds,
    msg: Buffer.from(JSON.stringify(msg.value.msg)),
  });

  return new google.protobuf.Any({
    type_url: '/cosmwasm.wasm.v1.MsgExecuteContract',
    value: cosmwasm.wasm.v1.MsgExecuteContract.encode(message).finish(),
  });
}

export function convertAminoRewardMessageToProto(msg: Msg<MsgReward>) {
  const message = new cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward({
    delegator_address: msg.value.delegator_address,
    validator_address: msg.value.validator_address,
  });

  return new google.protobuf.Any({
    type_url: '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
    value: cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward.encode(message).finish(),
  });
}

export function convertAminoCommissionMessageToProto(msg: Msg<MsgCommission>) {
  const message = new cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission({
    validator_address: msg.value.validator_address,
  });

  return new google.protobuf.Any({
    type_url: '/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission',
    value: cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission.encode(message).finish(),
  });
}

export function convertAminoSwapExactAmmountInMessageToProto(msg: Msg<MsgSwapExactAmountIn>) {
  const message = new osmosis.gamm.v1beta1.MsgSwapExactAmountIn({
    sender: msg.value.sender,
    routes: msg.value.routes,
    token_in: msg.value.token_in,
    token_out_min_amount: msg.value.token_out_min_amount,
  });

  return new google.protobuf.Any({
    type_url: '/osmosis.gamm.v1beta1.MsgSwapExactAmountIn',
    value: osmosis.gamm.v1beta1.MsgSwapExactAmountIn.encode(message).finish(),
  });
}

export function getTxBodyBytes(signed: SignAminoDoc) {
  const messages = signed.msgs.map((msg) => convertAminoMessageToProto(msg)).filter((item) => item !== null) as google.protobuf.Any[];

  const txBody = new cosmos.tx.v1beta1.TxBody({
    messages,
    memo: signed.memo,
  });

  if (signed.msgs.length !== messages.length) {
    return null;
  }

  return cosmos.tx.v1beta1.TxBody.encode(txBody).finish();
}

export function getAuthInfoBytes(signed: SignAminoDoc, pubKey: PubKey, mode = cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_LEGACY_AMINO_JSON) {
  const signerInfo = getSignerInfo(signed, pubKey, mode);

  const fee = new cosmos.tx.v1beta1.Fee({
    amount: signed.fee.amount,
    gas_limit: Number(signed.fee.gas),
  });

  const authInfo = new cosmos.tx.v1beta1.AuthInfo({ signer_infos: [signerInfo], fee });

  return cosmos.tx.v1beta1.AuthInfo.encode(authInfo).finish();
}

export function getSignerInfo(signed: SignAminoDoc, pubKey: PubKey, mode = cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_LEGACY_AMINO_JSON) {
  const publicKey = getPubKey(pubKey);

  return new cosmos.tx.v1beta1.SignerInfo({
    public_key: new google.protobuf.Any({
      type_url: pubKey.type,
      value: cosmos.crypto.secp256k1.PubKey.encode(publicKey).finish(),
    }),
    mode_info: {
      single: {
        mode,
      },
    },
    sequence: Number(signed.sequence),
  });
}

export function getPubKey(pubKey: PubKey) {
  const bufferPubKey = Buffer.from(pubKey.value, 'base64');
  const publicKey = new cosmos.crypto.secp256k1.PubKey({ key: bufferPubKey });
  return publicKey;
}

export function protoTx(signed: SignAminoDoc, signatures: string[], pubKey: PubKey, mode = cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_LEGACY_AMINO_JSON) {
  const txBodyBytes = getTxBodyBytes(signed);

  if (txBodyBytes === null) {
    return null;
  }

  const authInfoBytes = getAuthInfoBytes(signed, pubKey, mode);

  return { signatures, txBodyBytes, authInfoBytes };
}

export function protoTxBytes({ signatures, txBodyBytes, authInfoBytes }: ProtoTxBytesProps) {
  const txRaw = new cosmos.tx.v1beta1.TxRaw({
    body_bytes: new Uint8Array(txBodyBytes),
    auth_info_bytes: new Uint8Array(authInfoBytes),
    signatures: signatures.map((signature) => Buffer.from(signature, 'base64')),
  });
  const txRawBytes = cosmos.tx.v1beta1.TxRaw.encode(txRaw).finish();

  const tx = {
    tx_bytes: Buffer.from(txRawBytes).toString('base64'),
    mode: cosmos.tx.v1beta1.BroadcastMode.BROADCAST_MODE_SYNC,
  };

  return tx;
}

export function broadcast(url: string, body: unknown) {
  return post<SendTransactionPayload>(url, body);
}

export function decodeProtobufMessage(msg: google.protobuf.IAny) {
  if (msg.type_url === '/cosmos.bank.v1beta1.MsgSend') {
    return { type_url: msg.type_url, value: cosmos.bank.v1beta1.MsgSend.decode(msg.value!) } as ProtoMsg<ProtoMsgSend>;
  }

  if (msg.type_url === '/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission') {
    return { type_url: msg.type_url, value: cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission.decode(msg.value!) } as ProtoMsg<ProtoMsgCommission>;
  }

  if (msg.type_url === '/ibc.applications.transfer.v1.MsgTransfer') {
    return { type_url: msg.type_url, value: ibc.applications.transfer.v1.MsgTransfer.decode(msg.value!) } as ProtoMsg<ProtoMsgTransfer>;
  }

  if (msg.type_url === '/cosmwasm.wasm.v1.MsgExecuteContract') {
    return { type_url: msg.type_url, value: cosmwasm.wasm.v1.MsgExecuteContract.decode(msg.value!) } as ProtoMsg<ProtoMsgExecuteContract>;
  }

  return { ...msg, value: msg.value ? Buffer.from(msg.value).toString('hex') : '' } as ProtoMsg<string>;
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
