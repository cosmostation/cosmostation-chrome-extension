import { useEffect, useRef } from 'react';
import type Transport from '@ledgerhq/hw-transport';

import { useTranslation } from '~/Popup/hooks/useTranslation';
import CosmosApp from '~/Popup/utils/cosmos';
import { LedgerError } from '~/Popup/utils/cosmos/error';
import { createTransport } from '~/Popup/utils/ledger';
import type { TransportType } from '~/types/ledger';

export class CosmosError extends Error {
  public errorCode: number;

  constructor(errorCode: number, message?: string) {
    super(message);
    this.errorCode = errorCode;
  }
}

export function useLedgerCosmos() {
  const { t } = useTranslation();

  const transport = useRef<Transport | null>(null);

  useEffect(
    () => () => {
      void transport.current?.close();
    },
    [],
  );

  return {
    transport,
    cosmosApp: async function CosmosWithTranslation(transportType: TransportType, init = true) {
      if (!transport.current) {
        transport.current = await createTransport(transportType);
      }

      if (!transport.current) {
        throw new CosmosError(0xb0000, getMessageFromReturnCode(0xb0000));
      }

      const cosmosApp = new CosmosApp(transport.current);

      if (init) {
        try {
          await cosmosApp.init();
        } catch (e) {
          void (await transport.current?.close());
          transport.current = null;

          if (e instanceof LedgerError) {
            throw new CosmosError(e.errorCode, getMessageFromReturnCode(e.errorCode));
          }
          throw e;
        }
      }

      return {
        init: async () => {
          try {
            await cosmosApp.init();
          } catch (e) {
            void (await transport.current?.close());
            transport.current = null;

            if (e instanceof LedgerError) {
              throw new CosmosError(e.errorCode, getMessageFromReturnCode(e.errorCode));
            }
            throw e;
          }
        },
        getPublicKey: async (path: Uint8Array) => {
          try {
            const result = await cosmosApp.getPublicKey(path);
            return result;
          } catch (e) {
            void (await transport.current?.close());
            transport.current = null;

            if (e instanceof LedgerError) {
              throw new CosmosError(e.errorCode, getMessageFromReturnCode(e.errorCode));
            }
            throw e;
          }
        },
        getAppConfiguration: async () => {
          try {
            const result = await cosmosApp.getAppConfiguration();
            return result;
          } catch (e) {
            void (await transport.current?.close());
            transport.current = null;

            if (e instanceof LedgerError) {
              throw new CosmosError(e.errorCode, getMessageFromReturnCode(e.errorCode));
            }
            throw e;
          }
        },
        close: async () => {
          void (await transport.current?.close());
          transport.current = null;
        },
      };

      function getMessageFromReturnCode(code: number) {
        switch (code) {
          case 0x0001:
            return t('ledger.cosmos.error.0x0001');
          case 0x0002:
            return t('ledger.cosmos.error.0x0002');
          case 0x0003:
            return t('ledger.cosmos.error.0x0003');
          case 0x0004:
            return t('ledger.cosmos.error.0x0004');
          case 0x0005:
            return t('ledger.cosmos.error.0x0005');
          case 0x000e:
            return t('ledger.cosmos.error.0x000e');
          case 0x9000:
            return t('ledger.cosmos.error.0x9000');
          case 0x9001:
            return t('ledger.cosmos.error.0x9001');
          case 0x6802:
            return t('ledger.cosmos.error.0x6802');
          case 0x6400:
            return t('ledger.cosmos.error.0x6400');
          case 0x6700:
            return t('ledger.cosmos.error.0x6700');
          case 0x6982:
            return t('ledger.cosmos.error.0x6982');
          case 0x6983:
            return t('ledger.cosmos.error.0x6983');
          case 0x6984:
            return t('ledger.cosmos.error.0x6984');
          case 0x6985:
            return t('ledger.cosmos.error.0x6985');
          case 0x6986:
            return t('ledger.cosmos.error.0x6986');
          case 0x6a80:
            return t('ledger.cosmos.error.0x6a80');
          case 0x6b00:
            return t('ledger.cosmos.error.0x6b00');
          case 0x6d00:
            return t('ledger.cosmos.error.0x6d00');
          case 0x6e00:
            return t('ledger.cosmos.error.0x6e00');
          case 0x6f00:
            return t('ledger.cosmos.error.0x6f00');
          case 0x6f01:
            return t('ledger.cosmos.error.0x6f01');
          case 0xa0000:
            return t('ledger.cosmos.error.0xa0000');
          case 0xa0001:
            return t('ledger.cosmos.error.0xa0001');
          case 0xa0002:
            return t('ledger.cosmos.error.0xa0002');
          case 0xa0003:
            return t('ledger.cosmos.error.0xa0003');
          case 0xb0000:
            return t('ledger.cosmos.error.0xb0000');
          default:
            return t('ledger.cosmos.error.default');
        }
      }
    },
  };
}
