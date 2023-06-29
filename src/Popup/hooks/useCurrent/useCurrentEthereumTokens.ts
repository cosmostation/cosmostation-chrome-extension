import { useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import type { EthereumToken } from '~/types/chain';

import { useCurrentEthereumNetwork } from './useCurrentEthereumNetwork';
import { useTokensSWR } from '../SWR/ethereum/useTokensSWR';

type AddEthereumTokenParams = Omit<EthereumToken, 'id' | 'ethereumNetworkId'>;

export function useCurrentEthereumTokens() {
  const { extensionStorage, setExtensionStorage } = useExtensionStorage();
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();
  const { data } = useTokensSWR();

  const defaultTokens: EthereumToken[] = useMemo(
    () =>
      data
        .filter((item) => item.default)
        .map((item) => ({
          id: `${currentEthereumNetwork.id}${item.address}`,
          ethereumNetworkId: currentEthereumNetwork.id,
          address: item.address,
          name: item.name,
          displayDenom: item.displayDenom,
          decimals: item.decimals,
          imageURL: item.imageURL,
          coinGeckoId: item.coinGeckoId,
          tokenType: 'ERC20',
          default: item.default,
        })),
    [currentEthereumNetwork.id, data],
  );

  const { ethereumTokens } = extensionStorage;

  const currentEthereumTokens = useMemo(
    () =>
      [...defaultTokens, ...ethereumTokens.filter((item) => item.ethereumNetworkId === currentEthereumNetwork.id)].filter(
        (token, idx, self) => self.findIndex((item) => item.address.toLowerCase() === token.address.toLowerCase()) === idx,
      ),
    [currentEthereumNetwork.id, defaultTokens, ethereumTokens],
  );

  const addEthereumToken = async (token: AddEthereumTokenParams) => {
    const newEthereumTokens = [
      ...ethereumTokens.filter((item) => !(item.address.toLowerCase() === token.address.toLowerCase() && item.ethereumNetworkId === currentEthereumNetwork.id)),
      { ...token, id: uuidv4(), ethereumNetworkId: currentEthereumNetwork.id },
    ];

    await setExtensionStorage('ethereumTokens', newEthereumTokens);
  };

  const addEthereumTokens = async (tokens: AddEthereumTokenParams[]) => {
    const filteredTokens = tokens.filter((token, idx, self) => self.findIndex((item) => item.address.toLowerCase() === token.address.toLowerCase()) === idx);

    const tokensAddress = filteredTokens.map((token) => token.address.toLowerCase());

    const newTokens = filteredTokens.map((token) => ({ ...token, id: uuidv4(), ethereumNetworkId: currentEthereumNetwork.id }));

    const newEthereumTokens = [
      ...ethereumTokens.filter((item) => !(tokensAddress.includes(item.address.toLowerCase()) && item.ethereumNetworkId === currentEthereumNetwork.id)),
      ...newTokens,
    ];

    await setExtensionStorage('ethereumTokens', newEthereumTokens);
  };

  const removeEthereumToken = async (token: EthereumToken) => {
    const newEthereumTokens = ethereumTokens.filter((item) => item.id !== token.id);

    await setExtensionStorage('ethereumTokens', newEthereumTokens);
  };

  return { currentEthereumTokens, addEthereumToken, removeEthereumToken, addEthereumTokens };
}
