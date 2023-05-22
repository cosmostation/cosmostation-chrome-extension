import { useRef } from 'react';
import type Transport from '@ledgerhq/hw-transport-6282';

import { createTransport62713 } from '~/Popup/utils/ledger';

import { useChromeStorage } from './useChromeStorage';

export function useLedgerTransport6282() {
  const transport = useRef<Transport | undefined>(undefined);

  const { chromeStorage } = useChromeStorage();

  const { ledgerTransportType } = chromeStorage;

  return {
    transport: transport.current,
    createTransport6282: async () => {
      if (transport.current) {
        return transport.current;
      }
      // eslint-disable-next-line no-return-assign
      return (transport.current = await createTransport62713(ledgerTransportType));
    },
    closeTransport6282: async () => {
      await transport.current?.close();
      transport.current = undefined;
    },
  };
}
