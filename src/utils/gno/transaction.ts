/* eslint-disable @typescript-eslint/no-explicit-any */
import { MsgAddPackage, MsgCall, MsgEndpoint, MsgRun, MsgSend } from '@gnolang/gno-js-client';
import { Any } from '@gnolang/tm2-js-client';

export function encodeMessageValue(message: { type: string; value: any }) {
  switch (message.type) {
    case MsgEndpoint.MSG_ADD_PKG: {
      return Any.create({
        type_url: MsgEndpoint.MSG_ADD_PKG,
        value: MsgAddPackage.encode(MsgAddPackage.fromJSON(message.value)).finish(),
      });
    }
    case MsgEndpoint.MSG_CALL: {
      return Any.create({
        type_url: MsgEndpoint.MSG_CALL,
        value: MsgCall.encode(MsgCall.fromJSON(message.value)).finish(),
      });
    }
    case MsgEndpoint.MSG_SEND: {
      return Any.create({
        type_url: MsgEndpoint.MSG_SEND,
        value: MsgSend.encode(MsgSend.fromJSON(message.value)).finish(),
      });
    }
    case MsgEndpoint.MSG_RUN: {
      return Any.create({
        type_url: MsgEndpoint.MSG_RUN,
        value: MsgRun.encode(MsgRun.fromJSON(message.value)).finish(),
      });
    }
    default: {
      return Any.create({
        type_url: MsgEndpoint.MSG_CALL,
        value: MsgCall.encode(MsgCall.fromJSON(message.value)).finish(),
      });
    }
  }
}
