import { useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import type { CosmosChain, CosmosToken } from '~/types/chain';

import { useCurrentChain } from './useCurrentChain';
import { useTokensSWR } from '../SWR/cosmos/useTokensSWR';

type AddCosmosTokenParams = Omit<CosmosToken, 'id'>;

export function useCurrentCosmosTokens(chain: CosmosChain) {
  const { extensionStorage, setExtensionStorage } = useExtensionStorage();

  const { currentChain } = useCurrentChain();
  const { data } = useTokensSWR(chain);

  const defaultTokens: CosmosToken[] = useMemo(
    () =>
      data
        .filter((item) => item.default)
        .map((item) => ({
          id: `${chain.chainId}${item.address}`,
          address: item.address,
          decimals: item.decimals,
          displayDenom: item.symbol,
          tokenType: 'CW20',
          chainId: currentChain.id,
          imageURL: item.image,
          coinGeckoId: item.coinGeckoId,
          default: item.default,
        })),
    [chain.chainId, currentChain.id, data],
  );

  const { cosmosTokens } = extensionStorage;

  const currentCosmosTokens = useMemo(
    () =>
      [...defaultTokens, ...cosmosTokens.filter((item) => item.chainId === currentChain.id)].filter(
        (token, idx, self) => self.findIndex((item) => item.address.toLowerCase() === token.address.toLowerCase()) === idx,
      ),
    [cosmosTokens, currentChain.id, defaultTokens],
  );

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

  return { currentCosmosTokens, addCosmosToken, removeCosmosToken, addCosmosTokens };
}
