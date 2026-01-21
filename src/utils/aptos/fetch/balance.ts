import type { GetAccountCoinsDataResponse } from '@aptos-labs/ts-sdk';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

import { fetchWithFailover } from '@/utils/fetch/fetchWithFailover';

const defaultClient = new Aptos(new AptosConfig({ network: Network.MAINNET }));

export const fetchAptosBalances = async (address: string, indexerUrls?: string[]): Promise<GetAccountCoinsDataResponse> => {
  if (!indexerUrls?.length) {
    return await defaultClient.getAccountCoinsData({ accountAddress: address });
  }

  return await fetchWithFailover(indexerUrls, async (indexerUrl) => {
    const aptosClient = new Aptos(
      new AptosConfig({
        network: Network.MAINNET,
        indexer: indexerUrl,
      }),
    );

    const response = await aptosClient.getAccountCoinsData({
      accountAddress: address,
    });

    return response;
  });
};
