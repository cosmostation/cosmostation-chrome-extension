import { MOONPAY_API_KEY } from '@/constants/common';
import type { GetMoonpaySignatureResponse } from '@/types/moonpay';
import { post } from '@/utils/axios';

import type { UseFetchConfig } from './common/useFetch';
import { useFetch } from './common/useFetch';

export function useGetMoonpaySignature(config?: UseFetchConfig) {
  const requestURL = `https://front.api.mintscan.io/v10/app/keys/moonpay`;

  const fetcher = () => post<GetMoonpaySignatureResponse>(requestURL, { api_key: `?apiKey=${MOONPAY_API_KEY}` });

  const { data, isLoading, error, refetch } = useFetch({
    queryKey: ['useGetMoonpaySignature', MOONPAY_API_KEY],
    fetchFunction: () => fetcher(),
    config: {
      staleTime: Infinity,
      ...config,
    },
  });

  return { data, error, refetch, isLoading };
}
