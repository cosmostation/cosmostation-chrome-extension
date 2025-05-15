import { getAddress, getKeypair } from '@/libs/address';
import { getChains } from '@/libs/chain';

import { emitToWeb } from './message';
import { extensionLocalStorage, extensionSessionStorage } from './storage';

export async function emitChangedAddressEvent(newAccountId: string) {
  const { userAccounts, approvedOrigins } = await extensionLocalStorage();
  const { currentPassword } = await extensionSessionStorage();
  const chainList = await getChains();

  const evmChainForAddress = chainList?.evmChains?.[0];

  const ethereumKeyPair = getKeypair(evmChainForAddress!, userAccounts.find((item) => item.id === newAccountId)!, currentPassword);
  const ethereumAddress = getAddress(evmChainForAddress!, ethereumKeyPair?.publicKey);

  const approvedAllOrigins = Array.from(new Set(approvedOrigins.map((item) => item.origin)));

  const currentAccountOrigins = Array.from(new Set(approvedOrigins.filter((item) => item.accountId === newAccountId).map((item) => item.origin)));
  const currentAccountNotOrigins = Array.from(new Set(approvedOrigins.filter((item) => item.accountId !== newAccountId).map((item) => item.origin)));

  emitToWeb({ event: 'accountsChanged', chainType: 'evm', data: { result: [ethereumAddress] } }, currentAccountOrigins);
  emitToWeb(
    { event: 'accountsChanged', chainType: 'evm', data: { result: [] } },
    currentAccountNotOrigins.filter((item) => !currentAccountOrigins.includes(item)),
  );

  emitToWeb({ event: 'accountChanged', chainType: 'cosmos', data: undefined }, approvedAllOrigins);

  const aptosChainForAddress = chainList.aptosChains?.[0];

  const aptosKeyPair = getKeypair(aptosChainForAddress!, userAccounts.find((item) => item.id === newAccountId)!, currentPassword);
  const aptosAddress = getAddress(aptosChainForAddress!, aptosKeyPair?.publicKey);

  emitToWeb({ event: 'accountChange', chainType: 'aptos', data: { result: aptosAddress } }, currentAccountOrigins);
  emitToWeb(
    {
      event: 'accountChange',
      chainType: 'aptos',
      data: {
        result: {
          address: aptosAddress,
          publicKey: aptosKeyPair?.publicKey || '',
        },
      },
    },
    currentAccountNotOrigins.filter((item) => !currentAccountOrigins.includes(item)),
  );

  const suiChainForAddress = chainList.suiChains?.[0];

  const suiKeyPair = getKeypair(suiChainForAddress!, userAccounts.find((item) => item.id === newAccountId)!, currentPassword);
  const suiAddress = getAddress(suiChainForAddress!, suiKeyPair?.publicKey);

  emitToWeb({ event: 'accountChange', chainType: 'sui', data: { result: suiAddress } }, currentAccountOrigins);
  emitToWeb(
    { event: 'accountChange', chainType: 'sui', data: { result: '' } },
    currentAccountNotOrigins.filter((item) => !currentAccountOrigins.includes(item)),
  );

  const iotaChainForAddress = chainList.iotaChains?.[0];

  const iotaKeyPair = iotaChainForAddress
    ? getKeypair(iotaChainForAddress, userAccounts.find((item) => item.id === newAccountId)!, currentPassword)
    : undefined;
  const iotaAddress = iotaKeyPair && iotaChainForAddress ? getAddress(iotaChainForAddress, iotaKeyPair?.publicKey) : undefined;

  if (iotaAddress) {
    emitToWeb({ event: 'accountChange', chainType: 'iota', data: { result: iotaAddress } }, currentAccountOrigins);
    emitToWeb(
      { event: 'accountChange', chainType: 'iota', data: { result: '' } },
      currentAccountNotOrigins.filter((item) => !currentAccountOrigins.includes(item)),
    );
  }

  const { currentBitcoinNetwork } = await extensionLocalStorage();

  const bitcoinKeyPair = getKeypair(currentBitcoinNetwork, userAccounts.find((item) => item.id === newAccountId)!, currentPassword);
  const bitcoinAddress = getAddress(currentBitcoinNetwork, bitcoinKeyPair?.publicKey);

  emitToWeb({ event: 'accountChanged', chainType: 'bitcoin', data: { result: [bitcoinAddress] } }, currentAccountOrigins);
}
