import axios from 'axios';

import { isAminoSend } from '~/Popup/utils/tendermint';
import { cosmos, google } from '~/proto/cosmos.js';
import type { PubKey, TxPayload } from '~/types/proto';
import type { Msg, MsgSend, SignAminoDoc } from '~/types/tendermint/amino';
import type { Msg as ProtoMsg, MsgSend as ProtoMsgSend } from '~/types/tendermint/proto';

export function convertAminoMessageToProto(msg: Msg) {
  if (isAminoSend(msg)) {
    return convertAminoSendMessageToProto(msg);
  }

  return null;
}

export function convertAminoSendMessageToProto(sendMessage: Msg<MsgSend>) {
  const message = new cosmos.bank.v1beta1.MsgSend({
    amount: sendMessage.value.amount,
    from_address: sendMessage.value.from_address,
    to_address: sendMessage.value.to_address,
  });

  return new google.protobuf.Any({
    type_url: '/cosmos.bank.v1beta1.MsgSend',
    value: cosmos.bank.v1beta1.MsgSend.encode(message).finish(),
  });
}

export function getTxBodyBytes(signed: SignAminoDoc) {
  const messages = signed.msgs.map((msg) => convertAminoMessageToProto(msg)).filter((item) => item !== null) as google.protobuf.Any[];
  const txBody = new cosmos.tx.v1beta1.TxBody({
    messages,
    memo: signed.memo,
  });
  return cosmos.tx.v1beta1.TxBody.encode(txBody).finish();
}

export function getAuthInfoBytes(signed: SignAminoDoc, pubKey: PubKey) {
  const signerInfo = getSignerInfo(signed, pubKey);

  const fee = new cosmos.tx.v1beta1.Fee({
    amount: signed.fee.amount,
    gas_limit: Number(signed.fee.gas),
  });

  const authInfo = new cosmos.tx.v1beta1.AuthInfo({ signer_infos: [signerInfo], fee });

  return cosmos.tx.v1beta1.AuthInfo.encode(authInfo).finish();
}

export function getSignerInfo(signed: SignAminoDoc, pubKey: PubKey) {
  const publicKey = getPubKey(pubKey);

  return new cosmos.tx.v1beta1.SignerInfo({
    public_key: new google.protobuf.Any({
      type_url: '/cosmos.crypto.secp256k1.PubKey',
      value: cosmos.crypto.secp256k1.PubKey.encode(publicKey).finish(),
    }),
    mode_info: {
      single: {
        mode: cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_LEGACY_AMINO_JSON,
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

export function protoTx(signed: SignAminoDoc, signature: string, pubKey: PubKey) {
  const txBodyBytes = getTxBodyBytes(signed);

  const authInfoBytes = getAuthInfoBytes(signed, pubKey);

  const txRaw = new cosmos.tx.v1beta1.TxRaw({
    body_bytes: txBodyBytes,
    auth_info_bytes: authInfoBytes,
    signatures: [Buffer.from(signature, 'base64')],
  });
  const txRawBytes = cosmos.tx.v1beta1.TxRaw.encode(txRaw).finish();

  const tx = {
    tx_bytes: Buffer.from(txRawBytes).toString('base64'),
    mode: cosmos.tx.v1beta1.BroadcastMode.BROADCAST_MODE_SYNC,
  };

  return tx;
}

export function broadcast(url: string, body: unknown) {
  return axios.post<TxPayload>(url, body);
}

export function decodeProtobufMessage(msg: google.protobuf.IAny) {
  if (msg.type_url === '/cosmos.bank.v1beta1.MsgSend') {
    return { type_url: msg.type_url, value: cosmos.bank.v1beta1.MsgSend.decode(msg.value!) } as ProtoMsg<ProtoMsgSend>;
  }

  return { ...msg, value: msg.value ? Buffer.from(msg.value).toString('hex') : '' } as ProtoMsg<string>;
}

export function isDirectSend(msg: ProtoMsg): msg is ProtoMsg<ProtoMsgSend> {
  return msg.type_url === '/cosmos.bank.v1beta1.MsgSend';
}

export function isDirectCustom(msg: ProtoMsg): msg is ProtoMsg {
  return true;
}
