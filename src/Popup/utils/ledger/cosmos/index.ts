import { bech32 } from 'bech32';
import encHex from 'crypto-js/enc-hex';
import ripemd160 from 'crypto-js/ripemd160';
import sha256 from 'crypto-js/sha256';
import type Transport from '@ledgerhq/hw-transport';

import { APP_KEY, CHUNK_SIZE, CLA, ERROR_CODE, INS } from './constants';
import type { CosmosLedgerErrorType } from './error';
import { CosmosLedgerError, errorCodeToString, errorResponse } from './error';
import { publicKeyv1, serializePathv1, signSendChunkv1 } from './helperV1';
import { publicKeyv2, serializePathv2, signSendChunkv2 } from './helperV2';

type Configuration = {
  testMode: boolean;
  major: number;
  minor: number;
  patch: number;
  deviceLocked: boolean;
};

export default class Cosmos {
  private transport: Transport;

  private appConfiguration?: Configuration;

  constructor(transport?: Transport, scrambleKey = APP_KEY) {
    if (!transport) {
      throw new CosmosLedgerError(0xa0002, errorCodeToString(0xa0002));
    }

    this.transport = transport;
    transport.decorateAppAPIMethods(this, ['getAppConfiguration', 'getPublicKey', 'sign', 'isLocked'], scrambleKey);
  }

  async init() {
    if (!this.appConfiguration) {
      this.appConfiguration = await this.getAppConfiguration();
    }
  }

  getAppConfiguration() {
    return this.transport.send(CLA, INS.GET_VERSION, 0, 0).then(
      (response) => ({
        testMode: response[0] !== 0,
        major: response[1],
        minor: response[2],
        patch: response[3],
        deviceLocked: response[4] === 1,
      }),
      (e: CosmosLedgerErrorType) => {
        const error = errorResponse(e);
        throw new CosmosLedgerError(error.return_code, error.error_message);
      },
    );
  }

  isLocked() {
    return this.transport.send(CLA, INS.GET_VERSION, 0, 0).then(
      (response) => response[4] === 1,
      (e: CosmosLedgerErrorType) => {
        const error = errorResponse(e);
        throw new CosmosLedgerError(error.return_code, error.error_message);
      },
    );
  }

  getPublicKey(path: Uint8Array) {
    const serializedPath = this.serializePath(path);

    switch (this.appConfiguration?.major) {
      case 1:
        return publicKeyv1(this.transport, serializedPath);
      case 2: {
        const data = Buffer.concat([Cosmos.serializeHRP('cosmos'), serializedPath]);
        return publicKeyv2(this.transport, data);
      }
      default:
        throw new CosmosLedgerError(0xa0000, errorCodeToString(0xa0000));
    }
  }

  sign(path: Uint8Array, message: Uint8Array) {
    const chunks = this.signGetChunks(path, message);
    return this.signSendChunk(1, chunks.length, chunks[0]).then(
      async (response) => {
        let result: { return_code: number; error_message: string; signature: Buffer | null } = {
          return_code: response.return_code,
          error_message: response.error_message,
          signature: null,
        };

        for (let i = 1; i < chunks.length; i += 1) {
          // eslint-disable-next-line no-await-in-loop
          result = await this.signSendChunk(1 + i, chunks.length, chunks[i]);
          if (result.return_code !== ERROR_CODE.NoError) {
            break;
          }
        }

        return {
          return_code: result.return_code,
          error_message: result.error_message,
          signature: result.signature,
        };
      },
      (e: CosmosLedgerErrorType) => {
        const error = errorResponse(e);
        throw new CosmosLedgerError(error.return_code, error.error_message);
      },
    );
  }

  static serializeHRP(hrp: string): Buffer {
    if (hrp == null || hrp.length < 3 || hrp.length > 83) {
      throw new CosmosLedgerError(0xa0001, errorCodeToString(0xa0001));
    }

    const buf = Buffer.alloc(1 + hrp.length);
    buf.writeUInt8(hrp.length, 0);
    buf.write(hrp, 1);
    return buf;
  }

  static getAddress(prefix: string, publicKey: Buffer) {
    const hexSha256 = sha256(encHex.parse(publicKey.toString('hex'))).toString(encHex);
    const hexRip = ripemd160(encHex.parse(hexSha256)).toString(encHex);
    return bech32.encode(prefix, bech32.toWords(Buffer.from(hexRip, 'hex')));
  }

  serializePath(path: Uint8Array) {
    switch (this.appConfiguration?.major) {
      case 1:
        return serializePathv1(path);
      case 2:
        return serializePathv2(path);
      default:
        throw new CosmosLedgerError(0xa0000, errorCodeToString(0xa0000));
    }
  }

  signGetChunks(path: Uint8Array, message: Uint8Array) {
    const serializedPath = this.serializePath(path);

    const chunks = [];
    chunks.push(serializedPath);
    const buffer = Buffer.from(message);

    for (let i = 0; i < buffer.length; i += CHUNK_SIZE) {
      let end = i + CHUNK_SIZE;
      if (i > buffer.length) {
        end = buffer.length;
      }
      chunks.push(buffer.slice(i, end));
    }

    return chunks;
  }

  signSendChunk(chunkIdx: number, chunkNum: number, chunk: Buffer) {
    switch (this.appConfiguration?.major) {
      case 1:
        return signSendChunkv1(this.transport, chunkIdx, chunkNum, chunk);
      case 2:
        return signSendChunkv2(this.transport, chunkIdx, chunkNum, chunk);
      default:
        throw new CosmosLedgerError(0xa0000, errorCodeToString(0xa0000));
    }
  }
}
