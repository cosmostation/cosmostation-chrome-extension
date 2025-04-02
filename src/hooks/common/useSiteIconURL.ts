import { useQuery } from '@tanstack/react-query';

import { getSiteIconURL } from '@/utils/website';

export const useSiteIconURL = (siteOrigin?: string) => {
  const fetcher = async () => {
    if (!siteOrigin) return '';

    return getSiteIconURL(siteOrigin);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['siteIconURL', siteOrigin],
    queryFn: fetcher,
    staleTime: Infinity,
  });

  return { siteIconURL: data, isLoading, error };
};
