import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { JUNO } from '~/constants/chain/cosmos/juno';
import { get } from '~/Popup/utils/axios';
import type { CW20AssetPayload } from '~/types/cosmos/asset';

import { useCurrentChain } from '../../useCurrent/useCurrentChain';

const nameMap = {
  [JUNO.id]: 'juno',
};

export function useTokensSWR(config?: SWRConfiguration) {
  const { currentChain } = useCurrentChain();

  const mappingName = nameMap[currentChain.id] || currentChain.chainName.toLowerCase();

  const requestURL = `https://api.mintscan.io/v2/assets/${mappingName}/cw20`;

  const fetcher = async (fetchUrl: string) => {
    try {
      return await get<CW20AssetPayload>(fetchUrl);
    } catch (e: unknown) {
      return null;
    }
  };

  const { data, error, mutate } = useSWR<CW20AssetPayload | null, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    isPaused: () => !(currentChain.line === 'COSMOS' && currentChain.cosmWasm),
    ...config,
  });

  const returnData = data?.assets ? data?.assets : [];

  return { data: returnData, error, mutate };
}
