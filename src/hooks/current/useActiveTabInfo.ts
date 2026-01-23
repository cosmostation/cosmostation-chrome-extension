import { useEffect } from 'react';
import { browser } from 'wxt/browser';
import { useQuery } from '@tanstack/react-query';

import { getActiveTabInfo } from '@/utils/view/tab';

export function useActiveTabInfo() {
  const fetcher = async () => {
    return getActiveTabInfo();
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['activeTab'],
    queryFn: fetcher,
    staleTime: Infinity,
  });

  useEffect(() => {
    const handleTabChange = () => {
      refetch();
    };

    browser.tabs.onActivated.addListener(handleTabChange);
    browser.tabs.onUpdated.addListener(handleTabChange);

    return () => {
      browser.tabs.onActivated.removeListener(handleTabChange);
      browser.tabs.onUpdated.removeListener(handleTabChange);
    };
  }, [refetch]);

  return { data, isLoading, error };
}
