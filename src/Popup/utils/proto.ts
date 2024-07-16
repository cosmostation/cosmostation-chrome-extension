import { post } from '~/Popup/utils/axios';
import { isAminoCommission, isAminoExecuteContract, isAminoIBCSend, isAminoReward, isAminoSend, isAminoSwapExactAmountIn } from '~/Popup/utils/cosmos';
import { cosmos, google } from '~/proto/cosmos-sdk-v0.47.4.js';
import { cosmwasm } from '~/proto/cosmwasm-v0.28.0.js';
import { ibc } from '~/proto/ibc-v7.1.0.js';
import { osmosis } from '~/proto/osmosis-v13.1.2.js';
import type { Msg, MsgCommission, MsgExecuteContract, MsgReward, MsgSend, MsgSwapExactAmountIn, MsgTransfer, SignAminoDoc } from '~/types/cosmos/amino';
import type { SendTransactionPayload } from '~/types/cosmos/common';
import type {
  Msg as ProtoMsg,
  MsgCommission as ProtoMsgCommission,
  MsgExecuteContract as ProtoMsgExecuteContract,
  MsgSend as ProtoMsgSend,
  MsgTransfer as ProtoMsgTransfer,
  ProtoTxBytesProps,
  PubKey,
} from '~/types/cosmos/proto';

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

  const typeURL = (() => {
    if (pubKey.type === 'ethermint/PubKeyEthSecp256k1') {
      return '/ethermint.crypto.v1.ethsecp256k1.PubKey';
    }

    if (pubKey.type === 'injective/PubKeyEthSecp256k1') {
      return '/injective.crypto.v1beta1.ethsecp256k1.PubKey';
    }

    if (pubKey.type === 'artela/PubKeyEthSecp256k1') {
      return '/artela.crypto.v1.ethsecp256k1.PubKey';
    }

    return '/cosmos.crypto.secp256k1.PubKey';
  })();

  return new cosmos.tx.v1beta1.SignerInfo({
    public_key: new google.protobuf.Any({
      type_url: typeURL,
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

export function isDirectCustom(msg: ProtoMsg): msg is ProtoMsg {
  return true;
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
