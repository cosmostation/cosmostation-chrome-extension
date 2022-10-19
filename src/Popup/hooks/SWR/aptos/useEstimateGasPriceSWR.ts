import { AptosClient } from 'aptos';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { useCurrentAptosNetwork } from '~/Popup/hooks/useCurrent/useCurrentAptosNetwork';

export function useEstimateGasPriceSWR(config?: SWRConfiguration) {
  const { currentAptosNetwork } = useCurrentAptosNetwork();

  const { restURL } = currentAptosNetwork;

  const aptosClient = new AptosClient(restURL);

  const fetcher = async () => {
    try {
      return await aptosClient.estimateGasPrice();
    } catch {
      return null;
    }
  };

  const { data, error, mutate } = useSWR<Awaited<ReturnType<typeof fetcher>>, unknown>({}, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    ...config,
  });

  return { data, error, mutate };
}
