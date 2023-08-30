import type { Types } from 'aptos';
import { AptosClient } from 'aptos';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { useCurrentAptosNetwork } from '~/Popup/hooks/useCurrent/useCurrentAptosNetwork';

type FetchParams = {
  versionId: string;
};

export function useBlockInfoByVersionSWR(versionId: string, config?: SWRConfiguration) {
  const { currentAptosNetwork } = useCurrentAptosNetwork();

  const { restURL } = currentAptosNetwork;

  const aptosClient = new AptosClient(restURL);

  const fetcher = (params: FetchParams) => aptosClient.getBlockByVersion(Number(params.versionId));

  // NOTE 최대 요청 수 10으로 5초 간격으로 제한

  const { data, isValidating, error, mutate } = useSWR<Types.Block, unknown>({ versionId }, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    isPaused: () => !versionId,
    ...config,
  });

  return { data, isValidating, error, mutate };
}
