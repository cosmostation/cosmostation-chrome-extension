import CosmosApp from 'ledger-cosmos-js';
import type Transport from '@ledgerhq/hw-transport';

import { CosmosLedgerError } from './error';

export default class Cosmos {
  private cosmosApp: CosmosApp;

  constructor(transport?: Transport, scrambleKey?: string) {
    if (!transport) {
      throw new CosmosLedgerError(0xa0002, 'Transport has not been defined');
    }

    this.cosmosApp = new CosmosApp(transport, scrambleKey);
  }

  async getPublicKey(path: number[]) {
    try {
      const response = await this.cosmosApp.publicKey(path);

      if (!response.compressed_pk) {
        throw new CosmosLedgerError(response.return_code, response.error_message);
      }

      return response;
    } catch (e) {
      if (e instanceof CosmosLedgerError) {
        throw e;
      }

      if (isCosmosError(e)) {
        throw new CosmosLedgerError(e.return_code, e.error_message);
      }

      throw new CosmosLedgerError(0x6f00, 'Unknown error');
    }
  }

  async sign(path: number[], message: Uint8Array) {
    try {
      const response = await this.cosmosApp.sign(path, message);

      if (!response.signature) {
        throw new CosmosLedgerError(response.return_code, response.error_message);
      }

      return response;
    } catch (e) {
      if (e instanceof CosmosLedgerError) {
        throw e;
      }

      if (isCosmosError(e)) {
        throw new CosmosLedgerError(e.return_code, e.error_message);
      }

      throw new CosmosLedgerError(0x6f00, 'Unknown error');
    }
  }
}

type CosmosError = {
  return_code: number;
  error_message: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isCosmosError(e: any): e is CosmosError {
  return 'return_code' in e && 'error_message' in e;
}
