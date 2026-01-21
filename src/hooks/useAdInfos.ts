import { CHAINLIST_WALLET_RESOURCE_URL } from '@/constants/common';
import type { AdDataV1 } from '@/types/registry/ad';
import { get } from '@/utils/axios';
import { getExtensionLocalStorage, setExtensionLocalStorage } from '@/utils/storage';

import type { UseFetchConfig } from './common/useFetch';
import { useFetch } from './common/useFetch';

async function fetchAds() {
  const requestURL = `${CHAINLIST_WALLET_RESOURCE_URL}/ad_list.json`;
  const response = await get<AdDataV1>(requestURL);

  if (response.version === 1) {
    const timeNow = Date.now();

    const filteredAds = response.ads
      .filter((item) => {
        const isStarted = item.startAt ? timeNow >= new Date(item.startAt).getTime() : true;
        const isNotEnded = item.endAt ? timeNow <= new Date(item.endAt).getTime() : true;

        return item.images?.extension && isStarted && isNotEnded;
      })
      .sort((a, b) => a.priority - b.priority);

    return filteredAds;
  }

  return undefined;
}

async function getDismissedAdIds(): Promise<string[]> {
  const dismissedAdIds = await getExtensionLocalStorage('dismissedAdIds');
  return dismissedAdIds ?? [];
}

async function addDismissedAdId(adId: string): Promise<void> {
  const dismissedAdIds = await getDismissedAdIds();
  if (!dismissedAdIds.includes(adId)) {
    await setExtensionLocalStorage('dismissedAdIds', [...dismissedAdIds, adId]);
  }
}

export function useAdInfos(config?: UseFetchConfig) {
  const fetcher = async () => {
    const ads = await fetchAds();

    if (ads) {
      const dismissedAdIds = await getDismissedAdIds();
      const filteredAds = ads.filter((ad) => !dismissedAdIds.includes(ad.id));
      return filteredAds;
    }

    return undefined;
  };

  const { data, isLoading, error, refetch } = useFetch({
    queryKey: ['useAdInfos'],
    fetchFunction: fetcher,
    staleTime: Infinity,
    retry: 2,
    retryDelay: 1000 * 2,
    ...config,
  });

  const dismissAd = async (adId: string) => {
    await addDismissedAdId(adId);
    await refetch();
  };

  return { data, error, refetch, isLoading, dismissAd };
}
