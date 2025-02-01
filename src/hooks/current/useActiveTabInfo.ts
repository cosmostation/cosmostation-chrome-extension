import { useEffect } from 'react';
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

    chrome.tabs.onActivated.addListener(handleTabChange);
    chrome.tabs.onUpdated.addListener(handleTabChange);

    return () => {
      chrome.tabs.onActivated.removeListener(handleTabChange);
      chrome.tabs.onUpdated.removeListener(handleTabChange);
    };
  }, [refetch]);

  return { data, isLoading, error };
}
