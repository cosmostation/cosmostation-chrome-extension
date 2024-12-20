import { useQuery } from '@tanstack/react-query';

import { getAssets } from '@/libs/asset';

export function useCoinList() {
  const fetcher = async () => {
    const coinAssets = await getAssets();

    const flatCoinList = coinAssets ? Object.values(coinAssets).flat() : [];

    return {
      ...coinAssets,
      flatCoinList,
    };
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['coinList'],
    queryFn: fetcher,
    staleTime: Infinity,
  });

  return { data, isLoading, error };
}
