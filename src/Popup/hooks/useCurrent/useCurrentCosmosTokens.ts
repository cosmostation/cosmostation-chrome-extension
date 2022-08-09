import { v4 as uuidv4 } from 'uuid';

import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import type { CosmosToken } from '~/types/chain';

import { useCurrentChain } from './useCurrentChain';

type AddCosmosTokenParams = Omit<CosmosToken, 'id'>;

export function useCurrentCosmosTokens() {
  const { chromeStorage, setChromeStorage } = useChromeStorage();

  const { currentChain } = useCurrentChain();

  const { cosmosTokens } = chromeStorage;

  const currentCosmosTokens = cosmosTokens.filter((item) => item.chainId === currentChain.id);

  const addCosmosToken = async (token: AddCosmosTokenParams) => {
    const newCosmosTokens = [
      ...cosmosTokens.filter((item) => !(item.address.toLowerCase() === token.address.toLowerCase() && item.chainId === currentChain.id)),
      { ...token, id: uuidv4(), chainId: currentChain.id },
    ];

    await setChromeStorage('cosmosTokens', newCosmosTokens);
  };

  const addCosmosTokens = async (tokens: AddCosmosTokenParams[]) => {
    const filteredTokens = tokens.filter((token, idx, self) => self.findIndex((item) => item.address.toLowerCase() === token.address.toLowerCase()) === idx);

    const tokensAddress = filteredTokens.map((token) => token.address.toLowerCase());

    const newTokens = filteredTokens.map((token) => ({ ...token, id: uuidv4(), chainId: currentChain.id }));

    const newCosmosTokens = [
      ...cosmosTokens.filter((item) => !(tokensAddress.includes(item.address.toLowerCase()) && item.chainId === currentChain.id)),
      ...newTokens,
    ];

    await setChromeStorage('cosmosTokens', newCosmosTokens);
  };

  const removeCosmosToken = async (token: CosmosToken) => {
    const newCosmosTokens = cosmosTokens.filter((item) => item.id !== token.id);

    await setChromeStorage('cosmosTokens', newCosmosTokens);
  };

  return { currentCosmosTokens, addCosmosToken, removeCosmosToken, addCosmosTokens };
}
