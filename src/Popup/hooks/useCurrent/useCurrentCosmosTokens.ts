import { useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { CosmosChain, CosmosToken } from '~/types/chain';

import { useCurrentChain } from './useCurrentChain';
import { useTokensSWR } from '../SWR/cosmos/useTokensSWR';

type AddCosmosTokenParams = Omit<CosmosToken, 'id'>;

export function useCurrentCosmosTokens(chain: CosmosChain) {
  const { extensionStorage, setExtensionStorage } = useExtensionStorage();

  const { currentChain } = useCurrentChain();
  const { data } = useTokensSWR(chain);

  const { cosmosTokens } = extensionStorage;

  const currentCosmosTokens = useMemo(() => cosmosTokens.filter((item) => item.chainId === currentChain.id), [cosmosTokens, currentChain.id]);

  const addCosmosToken = async (token: AddCosmosTokenParams) => {
    const newCosmosTokens = [
      ...cosmosTokens.filter((item) => !(item.address.toLowerCase() === token.address.toLowerCase() && item.chainId === token.chainId)),
      { ...token, id: uuidv4() },
    ];

    await setExtensionStorage('cosmosTokens', newCosmosTokens);
  };

  const addCosmosTokens = async (tokens: AddCosmosTokenParams[]) => {
    const filteredTokens = tokens.filter((token, idx, self) => self.findIndex((item) => item.address.toLowerCase() === token.address.toLowerCase()) === idx);

    const newTokens = filteredTokens.map((token) => ({ ...token, id: uuidv4() }));

    const newCosmosTokens = [
      ...cosmosTokens.filter((item) => !newTokens.find((token) => item.address === token.address && item.chainId === token.chainId)),
      ...newTokens,
    ];

    await setExtensionStorage('cosmosTokens', newCosmosTokens);
  };

  const removeCosmosToken = async (token: CosmosToken) => {
    const newCosmosTokens = cosmosTokens.filter((item) => item.id !== token.id);

    await setExtensionStorage('cosmosTokens', newCosmosTokens);
  };

  useEffect(() => {
    if (data.filter((item) => item.default && !cosmosTokens.find((cosmosToken) => isEqualsIgnoringCase(cosmosToken.address, item.address)))) {
      const newTokens = data
        .filter((token) => token.default && !cosmosTokens.find((cosmosToken) => isEqualsIgnoringCase(cosmosToken.address, token.address)))
        .map(
          (token) =>
            ({
              id: uuidv4(),
              address: token.address,
              decimals: token.decimals,
              displayDenom: token.symbol,
              tokenType: 'CW20',
              chainId: currentChain.id,
              imageURL: token.image,
              coinGeckoId: token.coinGeckoId,
            } as CosmosToken),
        );

      const newCosmosTokens = [
        ...cosmosTokens.filter((item) => !newTokens.find((token) => item.address === token.address && item.chainId === token.chainId)),
        ...newTokens,
      ];

      const sortedEthereumTokens = [
        ...newCosmosTokens
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
        ...newCosmosTokens.filter((item) => !data.find((token) => token.default && isEqualsIgnoringCase(item.address, token.address))),
      ];

      void setExtensionStorage('cosmosTokens', sortedEthereumTokens);
    }
  }, [cosmosTokens, currentChain.id, data, setExtensionStorage]);

  return { currentCosmosTokens, addCosmosToken, removeCosmosToken, addCosmosTokens };
}
