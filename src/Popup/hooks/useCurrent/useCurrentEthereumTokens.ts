import { v4 as uuidv4 } from 'uuid';

import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import type { EthereumToken } from '~/types/chain';

import { useCurrentEthereumNetwork } from './useCurrentEthereumNetwork';

type AddEthereumTokenParams = Omit<EthereumToken, 'id' | 'ethereumNetworkId'>;

export function useCurrentEthereumTokens() {
  const { chromeStorage, setChromeStorage } = useChromeStorage();
  const { currentNetwork } = useCurrentEthereumNetwork();

  const { ethereumTokens } = chromeStorage;

  const currentEthereumTokens = ethereumTokens.filter((item) => item.ethereumNetworkId === currentNetwork.id);

  const addEthereumToken = async (token: AddEthereumTokenParams) => {
    const newEthereumTokens = [
      ...ethereumTokens.filter((item) => !(item.address.toLowerCase() === token.address.toLowerCase() && item.ethereumNetworkId === currentNetwork.id)),
      { ...token, id: uuidv4(), ethereumNetworkId: currentNetwork.id },
    ];

    await setChromeStorage('ethereumTokens', newEthereumTokens);
  };

  const addEthereumTokens = async (tokens: AddEthereumTokenParams[]) => {
    const filteredTokens = tokens.filter((token, idx, self) => self.findIndex((item) => item.address.toLowerCase() === token.address.toLowerCase()) === idx);

    const tokensAddress = filteredTokens.map((token) => token.address.toLowerCase());

    const newTokens = filteredTokens.map((token) => ({ ...token, id: uuidv4(), ethereumNetworkId: currentNetwork.id }));

    const newEthereumTokens = [
      ...ethereumTokens.filter((item) => !(tokensAddress.includes(item.address.toLowerCase()) && item.ethereumNetworkId === currentNetwork.id)),
      ...newTokens,
    ];

    await setChromeStorage('ethereumTokens', newEthereumTokens);
  };

  const removeEthereumToken = async (token: EthereumToken) => {
    const newEthereumTokens = ethereumTokens.filter((item) => item.id !== token.id);

    await setChromeStorage('ethereumTokens', newEthereumTokens);
  };

  return { currentEthereumTokens, addEthereumToken, removeEthereumToken, addEthereumTokens };
}
