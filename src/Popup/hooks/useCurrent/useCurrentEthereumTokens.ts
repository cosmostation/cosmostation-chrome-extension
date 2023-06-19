import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { EthereumToken } from '~/types/chain';

import { useCurrentEthereumNetwork } from './useCurrentEthereumNetwork';
import { useTokensSWR } from '../SWR/ethereum/useTokensSWR';

type AddEthereumTokenParams = Omit<EthereumToken, 'id' | 'ethereumNetworkId'>;

export function useCurrentEthereumTokens() {
  const { extensionStorage, setExtensionStorage } = useExtensionStorage();
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();
  const { data } = useTokensSWR();

  const { ethereumTokens } = extensionStorage;

  const currentEthereumTokens = ethereumTokens.filter((item) => item.ethereumNetworkId === currentEthereumNetwork.id);

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

  useEffect(() => {
    if (
      data.filter((token) => token.default).find((token) => !ethereumTokens.find((ethereumToken) => isEqualsIgnoringCase(ethereumToken.address, token.address)))
    ) {
      const newTokens = data
        .filter((token) => token.default && !ethereumTokens.find((ethereumToken) => isEqualsIgnoringCase(ethereumToken.address, token.address)))
        .map(
          (token) =>
            ({
              id: uuidv4(),
              ethereumNetworkId: currentEthereumNetwork.id,
              address: token.address,
              name: token.name,
              displayDenom: token.displayDenom,
              decimals: token.decimals,
              imageURL: token.imageURL,
              coinGeckoId: token.coinGeckoId,
              tokenType: 'ERC20',
            } as EthereumToken),
        );

      const newEthereumTokens = [
        ...ethereumTokens.filter((item) => !newTokens.find((token) => item.address === token.address && item.ethereumNetworkId === token.ethereumNetworkId)),
        ...newTokens,
      ];

      const sortedEthereumTokens = [
        ...newEthereumTokens
          .filter((item) => data.find((token) => token.default && isEqualsIgnoringCase(item.address, token.address)))
          .sort((a, b) => {
            if (
              data.findIndex((item) => isEqualsIgnoringCase(item.address, a.address)) > data.findIndex((item) => isEqualsIgnoringCase(item.address, b.address))
            )
              return 1;
            if (
              data.findIndex((item) => isEqualsIgnoringCase(item.address, a.address)) < data.findIndex((item) => isEqualsIgnoringCase(item.address, b.address))
            )
              return -1;

            return 0;
          }),
        ...newEthereumTokens.filter((item) => !data.find((token) => token.default && isEqualsIgnoringCase(item.address, token.address))),
      ];

      void setExtensionStorage('ethereumTokens', sortedEthereumTokens);
    }
  }, [currentEthereumNetwork.id, data, ethereumTokens, setExtensionStorage]);

  return { currentEthereumTokens, addEthereumToken, removeEthereumToken, addEthereumTokens };
}
