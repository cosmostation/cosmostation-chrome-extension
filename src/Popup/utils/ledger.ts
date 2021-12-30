import TransportWebBle from '@ledgerhq/hw-transport-web-ble';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';

export type TransportType = 'USB' | 'HID' | 'Bluetooth';

export async function createTransport(type: TransportType) {
  if ((await TransportWebUSB.isSupported()) && type === 'USB') {
    const transport = await TransportWebUSB.create();
    return transport;
  }

  if ((await TransportWebHID.isSupported()) && type === 'HID') {
    const transport = await TransportWebHID.create();
    return transport;
  }

  if ((await TransportWebBle.isSupported()) && type === 'Bluetooth') {
    const transport = await TransportWebBle.create();
    return transport;
  }

  return null;
}
