import { useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import type { CosmosToken } from '~/types/chain';

import { useCurrentChain } from './useCurrentChain';

type AddCosmosTokenParams = Omit<CosmosToken, 'id'>;

export function useCurrentCosmosTokens() {
  const { extensionStorage, setExtensionStorage } = useExtensionStorage();

  const { currentChain } = useCurrentChain();

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

  return { currentCosmosTokens, addCosmosToken, removeCosmosToken, addCosmosTokens };
}
