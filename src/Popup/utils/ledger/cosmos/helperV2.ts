import type Transport from '@ledgerhq/hw-transport';

import { CLA, ERROR_CODE, INS, PAYLOAD_TYPE } from './constants';
import type { CosmosLedgerErrorType } from './error';
import { CosmosLedgerError, errorCodeToString, errorResponse } from './error';
import { signSendChunkv1 } from './helperV1';

export function serializePathv2(path: Uint8Array) {
  if (!path || path.length !== 5) {
    throw new Error('Invalid path.');
  }

  const buf = Buffer.alloc(20);
  buf.writeUInt32LE(0x80000000 + path[0], 0);
  buf.writeUInt32LE(0x80000000 + path[1], 4);
  buf.writeUInt32LE(0x80000000 + path[2], 8);
  buf.writeUInt32LE(path[3], 12);
  buf.writeUInt32LE(path[4], 16);

  return buf;
}

export async function signSendChunkv2(transport: Transport, chunkIdx: number, chunkNum: number, chunk: Buffer) {
  let payloadType = PAYLOAD_TYPE.ADD;
  if (chunkIdx === 1) {
    payloadType = PAYLOAD_TYPE.INIT;
  }
  if (chunkIdx === chunkNum) {
    payloadType = PAYLOAD_TYPE.LAST;
  }

  return signSendChunkv1(transport, payloadType, 0, chunk);
}

export function publicKeyv2(transport: Transport, data: Buffer) {
  return transport.send(CLA, INS.GET_ADDR_SECP256K1, 0, 0, data, [ERROR_CODE.NoError]).then(
    (response) => {
      const errorCodeData = response.slice(-2);
      const returnCode = errorCodeData[0] * 256 + errorCodeData[1];
      const compressedPk = Buffer.from(response.slice(0, 33));

      return {
        compressed_pk: compressedPk,
        return_code: returnCode,
        error_message: errorCodeToString(returnCode),
      };
    },
    (e: CosmosLedgerErrorType) => {
      const error = errorResponse(e);
      throw new CosmosLedgerError(error.return_code, error.error_message);
    },
  );
}
