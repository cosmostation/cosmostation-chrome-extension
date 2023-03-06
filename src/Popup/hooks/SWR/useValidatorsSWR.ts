import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import type { ValidatorAddressPayload } from '~/types/validators';

export function useValidatorsSWR(config?: SWRConfiguration) {
  const requestURL = 'https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/validators.json';

  const fetcher = (fetchUrl: string) => get<ValidatorAddressPayload>(fetchUrl);

  const { data, error, mutate } = useSWR<ValidatorAddressPayload, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    errorRetryCount: 0,
    ...config,
  });

  return { data, error, mutate };
}
