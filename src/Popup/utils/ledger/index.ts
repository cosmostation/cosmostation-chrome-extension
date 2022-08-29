// import TransportWebBle from '@ledgerhq/hw-transport-web-ble';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';

import { TRANSPORT_TYPE } from '~/constants/ledger';
import type { TransportType } from '~/types/ledger';

export class LedgerError extends Error {
  public errorCode: number;

  constructor(errorCode: number, message?: string) {
    super(message);
    this.errorCode = errorCode;
  }
}

export async function createTransport(type: TransportType) {
  if ((await TransportWebUSB.isSupported()) && type === TRANSPORT_TYPE.USB) {
    const transport = await TransportWebUSB.create();
    return transport;
  }

  if ((await TransportWebHID.isSupported()) && type === TRANSPORT_TYPE.HID) {
    const transport = await TransportWebHID.create();
    return transport;
  }

  // if ((await TransportWebBle.isSupported()) && type === TRANSPORT_TYPE.BLUETOOTH) {
  //   const transport = await TransportWebBle.create();
  //   return transport;
  // }

  throw new LedgerError(499, 'Not Supported');
}
