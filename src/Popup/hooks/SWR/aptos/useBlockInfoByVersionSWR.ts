import { useState } from 'react';
import type { Types } from 'aptos';
import { AptosClient } from 'aptos';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { useCurrentAptosNetwork } from '~/Popup/hooks/useCurrent/useCurrentAptosNetwork';

type FetchParams = {
  versionId: string;
};

export function useBlockInfoByVersionSWR(versionId: string, config?: SWRConfiguration) {
  const [hasTimedOut, setHasTimedOut] = useState(false);

  const { currentAptosNetwork } = useCurrentAptosNetwork();

  const { restURL } = currentAptosNetwork;

  const aptosClient = new AptosClient(restURL);

  const fetcher = (params: FetchParams) => aptosClient.getBlockByVersion(Number(params.versionId));

  const { data, isValidating, error, mutate } = useSWR<Types.Block, AxiosError>({ versionId }, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    onErrorRetry: (_, __, ___, revalidate, { retryCount }) => {
      if (retryCount >= 11) return;

      if (retryCount === 10) {
        setHasTimedOut(true);
      }
      setTimeout(() => {
        void revalidate({ retryCount });
      }, 5000);
    },
    isPaused: () => !versionId,
    ...config,
  });

  return { data, isValidating, error, hasTimedOut, mutate };
}
