import type Transport from '@ledgerhq/hw-transport';

import { CLA, ERROR_CODE, INS } from './constants';
import type { LedgerErrorType } from './error';
import { errorCodeToString, errorResponse, LedgerError } from './error';

export function serializePathv1(path: Uint8Array) {
  if (path == null || path.length < 3) {
    throw new Error('Invalid path.');
  }
  if (path.length > 10) {
    throw new Error('Invalid path. Length should be <= 10');
  }
  const buf = Buffer.alloc(1 + 4 * path.length);
  buf.writeUInt8(path.length, 0);
  for (let i = 0; i < path.length; i += 1) {
    let v = path[i];
    if (i < 3) {
      // eslint-disable-next-line no-bitwise
      v |= 0x80000000; // Harden
    }
    buf.writeInt32LE(v, 1 + i * 4);
  }
  return buf;
}

export function signSendChunkv1(transport: Transport, chunkIdx: number, chunkNum: number, chunk: Buffer) {
  return transport.send(CLA, INS.SIGN_SECP256K1, chunkIdx, chunkNum, chunk, [ERROR_CODE.NoError, 0x6984, 0x6a80]).then(
    (response) => {
      const errorCodeData = response.slice(-2);
      const returnCode = errorCodeData[0] * 256 + errorCodeData[1];
      let errorMessage = errorCodeToString(returnCode);

      if (returnCode === 0x6a80 || returnCode === 0x6984) {
        errorMessage = `${errorMessage} : ${response.slice(0, response.length - 2).toString('ascii')}`;
      }

      let signature = null;
      if (response.length > 2) {
        signature = response.slice(0, response.length - 2);
      }

      return {
        signature,
        return_code: returnCode,
        error_message: errorMessage,
      };
    },
    (e: LedgerErrorType) => {
      const error = errorResponse(e);
      throw new LedgerError(error.return_code, error.error_message);
    },
  );
}

function compressPublicKey(publicKey: Buffer) {
  if (publicKey.length !== 65) {
    throw new LedgerError(0xa0003, errorCodeToString(0xa0003));
  }
  const y = publicKey.slice(33, 65);
  // eslint-disable-next-line no-bitwise
  const z = Buffer.from([2 + (y[y.length - 1] & 1)]);
  return Buffer.concat([z, publicKey.slice(1, 33)]);
}

export function publicKeyv1(transport: Transport, data?: Buffer) {
  return transport.send(CLA, INS.INS_PUBLIC_KEY_SECP256K1, 0, 0, data, [ERROR_CODE.NoError]).then(
    (response) => {
      const errorCodeData = response.slice(-2);
      const returnCode = errorCodeData[0] * 256 + errorCodeData[1];
      const pk = Buffer.from(response.slice(0, 65));

      return {
        compressed_pk: compressPublicKey(pk),
        return_code: returnCode,
        error_message: errorCodeToString(returnCode),
      };
    },
    (e: LedgerErrorType) => {
      const error = errorResponse(e);
      throw new LedgerError(error.return_code, error.error_message);
    },
  );
}
