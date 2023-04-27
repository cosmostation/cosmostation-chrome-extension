import useSWR from 'swr';

import { getCurrentTab } from '~/Popup/utils/extensionTabs';

export function useCurrentTab(suspense?: boolean) {
  const fetcher = () => getCurrentTab();

  const { data, mutate } = useSWR('currentTab', fetcher, {
    suspense,
    revalidateOnFocus: false,
    revalidateOnMount: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
  });

  return { data, mutate };
}
